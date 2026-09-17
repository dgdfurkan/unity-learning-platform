import { randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { curriculum, totalPublishedSteps } from './curriculum.generated.js';

if (!getApps().length) initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const auth = getAuth();
const scrypt = promisify(nodeScrypt);
const AUTH_PEPPER = defineSecret('AUTH_PEPPER');
const callable = { region: 'europe-west1', enforceAppCheck: true } as const;
const passwordCallable = { ...callable, secrets: [AUTH_PEPPER] };

const normalizeUsername = (value: unknown) => String(value ?? '').trim().normalize('NFKC').toLocaleLowerCase('tr-TR');
const validUsername = (value: string) => /^[\p{L}\p{N}._-]{3,24}$/u.test(value) && !value.includes('/');
const validPassword = (value: unknown) => typeof value === 'string' && value.length >= 10 && value.length <= 128;
const safeText = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const provider = (token: Record<string, unknown>) => (token.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;

async function requireAdmin(request: { auth?: { uid: string; token: Record<string, unknown> } }) {
  if (request.auth?.token.role !== 'admin' || provider(request.auth.token) !== 'password') throw new HttpsError('permission-denied', 'Bu işlem yalnızca admin hesabıyla yapılabilir.');
  const config = await db.doc('system/config').get();
  if (!config.exists || config.data()?.adminUid !== request.auth.uid) throw new HttpsError('permission-denied', 'Bu admin oturumu artık yetkili değil.');
}

async function requireStudent(request: { auth?: { uid: string; token: Record<string, unknown> } }) {
  if (!request.auth || request.auth.token.role !== 'student' || provider(request.auth.token) !== 'custom') throw new HttpsError('permission-denied', 'Geçerli öğrenci oturumu gerekli.');
  const profile = await db.doc(`users/${request.auth.uid}`).get();
  const data = profile.data();
  if (!data || data.status !== 'active' || Number(data.sessionVersion) !== Number(request.auth.token.sessionVersion)) throw new HttpsError('permission-denied', 'Oturum artık geçerli değil.');
  return request.auth.uid;
}

async function hashPassword(password: string) {
  const salt = randomBytes(24).toString('base64url');
  const result = await scrypt(`${password}${AUTH_PEPPER.value()}`, salt, 64) as Buffer;
  return { salt, hash: result.toString('base64url') };
}

async function passwordMatches(password: string, salt: string, expected: string) {
  const result = await scrypt(`${password}${AUTH_PEPPER.value()}`, salt, 64) as Buffer;
  const stored = Buffer.from(expected, 'base64url');
  return stored.length === result.length && timingSafeEqual(stored, result);
}

const dayKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const previousDayKey = () => dayKey(new Date(Date.now() - 86_400_000));

export const loginWithUsername = onCall(passwordCallable, async (request) => {
  const username = normalizeUsername(request.data?.username);
  const password = request.data?.password;
  if (!validUsername(username) || !validPassword(password)) throw new HttpsError('unauthenticated', 'Kullanıcı adı veya şifre hatalı.');
  const usernameDoc = await db.doc(`usernames/${username}`).get();
  if (!usernameDoc.exists) throw new HttpsError('unauthenticated', 'Kullanıcı adı veya şifre hatalı.');
  const uid = String(usernameDoc.data()?.uid ?? '');
  const [credentialDoc, profileDoc] = await Promise.all([db.doc(`privateCredentials/${uid}`).get(), db.doc(`users/${uid}`).get()]);
  const credential = credentialDoc.data();
  const profile = profileDoc.data();
  if (!credential || !profile || profile.role !== 'student' || profile.status !== 'active') throw new HttpsError('unauthenticated', 'Kullanıcı adı veya şifre hatalı.');
  const now = Date.now();
  if (credential.lockUntil?.toMillis?.() > now) throw new HttpsError('resource-exhausted', 'Çok fazla başarısız deneme. Bir süre sonra yeniden dene.');
  const matches = await passwordMatches(password, credential.salt, credential.hash);
  if (!matches) {
    const failedAttempts = Number(credential.failedAttempts ?? 0) + 1;
    await credentialDoc.ref.update({ failedAttempts, lockUntil: failedAttempts >= 5 ? Timestamp.fromMillis(now + 15 * 60_000) : null, updatedAt: FieldValue.serverTimestamp() });
    throw new HttpsError('unauthenticated', 'Kullanıcı adı veya şifre hatalı.');
  }
  const sessionVersion = Number(profile.sessionVersion ?? 1);
  const event = profileDoc.ref.collection('activityEvents').doc();
  await db.runTransaction(async (transaction) => {
    transaction.update(credentialDoc.ref, { failedAttempts: 0, lockUntil: null, updatedAt: FieldValue.serverTimestamp() });
    transaction.update(profileDoc.ref, { lastLoginAt: FieldValue.serverTimestamp() });
    transaction.set(event, { type: 'login', createdAt: FieldValue.serverTimestamp() });
  });
  return { customToken: await auth.createCustomToken(uid, { role: 'student', sessionVersion }) };
});

export const createStudent = onCall(passwordCallable, async (request) => {
  await requireAdmin(request);
  const username = normalizeUsername(request.data?.username);
  const password = request.data?.temporaryPassword;
  const firstName = safeText(request.data?.firstName, 60);
  const lastName = safeText(request.data?.lastName, 60);
  if (!validUsername(username) || !validPassword(password) || firstName.length < 2 || lastName.length < 2) throw new HttpsError('invalid-argument', 'Öğrenci bilgileri geçersiz.');
  if ((await db.doc(`usernames/${username}`).get()).exists) throw new HttpsError('already-exists', 'Bu kullanıcı adı kullanılıyor.');
  const uid = `student_${randomUUID().replaceAll('-', '')}`;
  const displayName = `${firstName} ${lastName}`;
  const credential = await hashPassword(password);
  await auth.createUser({ uid, displayName, disabled: false });
  try {
    await auth.setCustomUserClaims(uid, { role: 'student', sessionVersion: 1 });
    await db.runTransaction(async (transaction) => {
      const usernameRef = db.doc(`usernames/${username}`);
      if ((await transaction.get(usernameRef)).exists) throw new HttpsError('already-exists', 'Bu kullanıcı adı kullanılıyor.');
      transaction.set(usernameRef, { uid, createdAt: FieldValue.serverTimestamp() });
      transaction.set(db.doc(`privateCredentials/${uid}`), { ...credential, failedAttempts: 0, lockUntil: null, updatedAt: FieldValue.serverTimestamp() });
      transaction.set(db.doc(`users/${uid}`), {
        role: 'student', firstName, lastName, displayName, username,
        path: safeText(request.data?.path, 100) || 'Hızlı Başlangıç: Unity & C#',
        pace: request.data?.pace === 'balanced' ? 'balanced' : 'accelerated',
        mastery: 0, status: 'active', nextLesson: 'Ders 1 · Oyun Bilgisayarda Nasıl Çalışır?',
        xp: 0, streak: 0, completedLessons: 0, sessionVersion: 1,
        lastLoginAt: null, lastActivityAt: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.set(db.doc(`userProgress/${uid}`), { xp: 0, streak: 0, lastStudyDay: null, completedSteps: {}, completedLessons: [], updatedAt: FieldValue.serverTimestamp() });
    });
  } catch (error) {
    await auth.deleteUser(uid).catch(() => undefined);
    throw error;
  }
  return { id: uid, firstName, lastName, displayName, username, path: safeText(request.data?.path, 100) || 'LevelUp Unity Akademisi', pace: request.data?.pace === 'balanced' ? 'balanced' : 'accelerated', mastery: 0, status: 'active', nextLesson: 'Ders 1 · Oyun Bilgisayarda Nasıl Çalışır?', xp: 0, streak: 0, completedLessons: 0, lastLoginAt: null, lastActivityAt: null };
});

export const resetStudentPassword = onCall(passwordCallable, async (request) => {
  await requireAdmin(request);
  const uid = safeText(request.data?.studentId, 90);
  const password = request.data?.password;
  if (!uid || !validPassword(password)) throw new HttpsError('invalid-argument', 'Yeni şifre en az 10 karakter olmalıdır.');
  const userRef = db.doc(`users/${uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists || snapshot.data()?.role !== 'student') throw new HttpsError('not-found', 'Öğrenci bulunamadı.');
  const sessionVersion = Number(snapshot.data()?.sessionVersion ?? 1) + 1;
  const credential = await hashPassword(password);
  await Promise.all([
    db.doc(`privateCredentials/${uid}`).set({ ...credential, failedAttempts: 0, lockUntil: null, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
    userRef.update({ sessionVersion, updatedAt: FieldValue.serverTimestamp() }),
    auth.setCustomUserClaims(uid, { role: 'student', sessionVersion }),
    auth.revokeRefreshTokens(uid),
  ]);
  return { ok: true };
});

export const setStudentStatus = onCall(callable, async (request) => {
  await requireAdmin(request);
  const uid = safeText(request.data?.studentId, 90);
  const status = request.data?.status === 'paused' ? 'paused' : 'active';
  const snapshot = await db.doc(`users/${uid}`).get();
  if (!snapshot.exists || snapshot.data()?.role !== 'student') throw new HttpsError('not-found', 'Öğrenci bulunamadı.');
  await Promise.all([db.doc(`users/${uid}`).update({ status, updatedAt: FieldValue.serverTimestamp() }), auth.updateUser(uid, { disabled: status === 'paused' })]);
  return { ok: true };
});

export const completeStep = onCall(callable, async (request) => {
  const uid = await requireStudent(request);
  const lessonId = safeText(request.data?.lessonId, 100);
  const stepId = safeText(request.data?.stepId, 100);
  const item = curriculum[`${lessonId}/${stepId}` as keyof typeof curriculum];
  if (!item) throw new HttpsError('invalid-argument', 'Bu adım yayınlanmış müfredatta bulunamadı.');
  const progressRef = db.doc(`userProgress/${uid}`);
  const userRef = db.doc(`users/${uid}`);
  const eventRef = userRef.collection('activityEvents').doc();
  return db.runTransaction(async (transaction) => {
    const [progressDoc, userDoc] = await Promise.all([transaction.get(progressRef), transaction.get(userRef)]);
    const progress = progressDoc.data() ?? { xp: 0, streak: 0, lastStudyDay: null, completedSteps: {}, completedLessons: [] };
    if (!userDoc.exists || userDoc.data()?.status !== 'active') throw new HttpsError('permission-denied', 'Öğrenci hesabı aktif değil.');
    const completedForLesson: string[] = Array.isArray(progress.completedSteps?.[lessonId]) ? progress.completedSteps[lessonId] : [];
    if (completedForLesson.includes(stepId)) return { progress, awarded: 0, firstCompletion: false, streakAdvanced: false };
    const today = dayKey();
    const streakAdvanced = progress.lastStudyDay !== today;
    const streak = !streakAdvanced ? Number(progress.streak ?? 0) : progress.lastStudyDay === previousDayKey() ? Number(progress.streak ?? 0) + 1 : 1;
    const completedLessons: string[] = item.finale && !progress.completedLessons?.includes(lessonId) ? [...(progress.completedLessons ?? []), lessonId] : (progress.completedLessons ?? []);
    const completedSteps = { ...(progress.completedSteps ?? {}), [lessonId]: [...completedForLesson, stepId] };
    const nextProgress = { xp: Number(progress.xp ?? 0) + item.xp, streak, lastStudyDay: today, completedSteps, completedLessons };
    const completedCount = Object.values(completedSteps).reduce((sum: number, values) => sum + (Array.isArray(values) ? values.length : 0), 0);
    transaction.set(progressRef, { ...nextProgress, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    transaction.update(userRef, { xp: nextProgress.xp, streak, completedLessons: completedLessons.length, mastery: Math.round((completedCount / totalPublishedSteps) * 100), lastActivityAt: FieldValue.serverTimestamp(), nextLesson: item.finale ? 'Sonraki dersin kilidi açıldı' : 'Açık dersteki sonraki adım', updatedAt: FieldValue.serverTimestamp() });
    transaction.set(eventRef, { type: item.finale ? 'lesson_completed' : 'step_completed', lessonId, stepId, xp: item.xp, createdAt: FieldValue.serverTimestamp() });
    return { progress: nextProgress, awarded: item.xp, firstCompletion: true, streakAdvanced };
  });
});

export const createAssignment = onCall(callable, async (request) => {
  await requireAdmin(request);
  const studentId = safeText(request.data?.studentId, 90);
  const title = safeText(request.data?.title, 100);
  const description = safeText(request.data?.description, 1200);
  if (!studentId || title.length < 3 || description.length < 3) throw new HttpsError('invalid-argument', 'Ödev başlığı ve açıklaması gerekli.');
  const student = await db.doc(`users/${studentId}`).get();
  if (!student.exists || student.data()?.role !== 'student') throw new HttpsError('not-found', 'Öğrenci bulunamadı.');
  const assignmentRef = student.ref.collection('assignments').doc();
  const notificationRef = student.ref.collection('notifications').doc();
  const dueDate = request.data?.dueAt ? new Date(request.data.dueAt) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) throw new HttpsError('invalid-argument', 'Ödev tarihi geçersiz.');
  const dueAt = dueDate ? Timestamp.fromDate(dueDate) : null;
  const lessonId = safeText(request.data?.lessonId, 100) || null;
  const batch = db.batch();
  batch.set(assignmentRef, { studentId, title, description, dueAt, lessonId, status: 'assigned', readAt: null, createdAt: FieldValue.serverTimestamp(), createdBy: request.auth?.uid });
  batch.set(notificationRef, { title: 'Yeni ödev gönderildi', body: title, assignmentId: assignmentRef.id, readAt: null, createdAt: FieldValue.serverTimestamp() });
  batch.set(student.ref.collection('activityEvents').doc(), { type: 'assignment_created', assignmentId: assignmentRef.id, createdAt: FieldValue.serverTimestamp() });
  await batch.commit();
  return { id: assignmentRef.id, studentId, title, description, dueAt: request.data?.dueAt ?? null, lessonId, status: 'assigned', createdAt: new Date().toISOString(), readAt: null };
});

export const markNotificationRead = onCall(callable, async (request) => {
  const uid = await requireStudent(request);
  const notificationId = safeText(request.data?.notificationId, 100);
  if (!notificationId) throw new HttpsError('invalid-argument', 'Bildirim kimliği gerekli.');
  await db.doc(`users/${uid}/notifications/${notificationId}`).update({ readAt: FieldValue.serverTimestamp() });
  return { ok: true };
});
