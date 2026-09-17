import { onAuthStateChanged, setPersistence, browserLocalPersistence, signInWithCustomToken, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, type DocumentData, type Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type {
  AppNotification,
  Assignment,
  CompleteStepInput,
  CompleteStepResult,
  CreateAssignmentInput,
  CreateStudentInput,
  DataGateway,
  SessionUser,
  Student,
  StudentDetail,
} from '../domain/models';
import { emptyProgress, type LearningProgress } from '../learning/progress';
import { cloudFunctions, firebaseAuth, firestore } from './firebaseClient';
import { adminEmailDomain, adminUsername } from './firebaseConfig';

const required = <T>(value: T | null, name: string): T => {
  if (!value) throw new Error(`FIREBASE_${name}_NOT_CONFIGURED`);
  return value;
};

const dateValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  const stamp = value as Timestamp;
  return typeof stamp.toDate === 'function' ? stamp.toDate().toISOString() : null;
};

const normalizeProgress = (data?: DocumentData): LearningProgress => ({
  xp: Number(data?.xp ?? 0),
  streak: Number(data?.streak ?? 0),
  lastStudyDay: typeof data?.lastStudyDay === 'string' ? data.lastStudyDay : null,
  completedSteps: data?.completedSteps && typeof data.completedSteps === 'object' ? data.completedSteps : {},
  completedLessons: Array.isArray(data?.completedLessons) ? data.completedLessons : [],
});

const mapStudent = (id: string, data: DocumentData): Student => ({
  id,
  firstName: String(data.firstName ?? ''),
  lastName: String(data.lastName ?? ''),
  displayName: String(data.displayName ?? data.username ?? 'Öğrenci'),
  username: String(data.username ?? ''),
  path: String(data.path ?? 'Hızlı Başlangıç: Unity & C#'),
  pace: data.pace === 'balanced' ? 'balanced' : 'accelerated',
  mastery: Number(data.mastery ?? 0),
  status: data.status === 'paused' ? 'paused' : 'active',
  nextLesson: String(data.nextLesson ?? 'Oyun Bilgisayarda Nasıl Çalışır?'),
  xp: Number(data.xp ?? 0),
  streak: Number(data.streak ?? 0),
  completedLessons: Number(data.completedLessons ?? 0),
  lastLoginAt: dateValue(data.lastLoginAt),
  lastActivityAt: dateValue(data.lastActivityAt),
});

const mapAssignment = (id: string, data: DocumentData): Assignment => ({
  id,
  studentId: String(data.studentId ?? ''),
  title: String(data.title ?? ''),
  description: String(data.description ?? ''),
  dueAt: dateValue(data.dueAt),
  lessonId: typeof data.lessonId === 'string' ? data.lessonId : null,
  status: data.status === 'completed' ? 'completed' : 'assigned',
  createdAt: dateValue(data.createdAt) ?? new Date(0).toISOString(),
  readAt: dateValue(data.readAt),
});

async function sessionFromUser(user: User): Promise<SessionUser | null> {
  const auth = required(firebaseAuth, 'AUTH');
  const db = required(firestore, 'FIRESTORE');
  const token = await user.getIdTokenResult();
  const role = token.claims.role;
  const provider = token.claims.firebase && typeof token.claims.firebase === 'object'
    ? (token.claims.firebase as { sign_in_provider?: string }).sign_in_provider
    : undefined;
  if (role !== 'admin' && role !== 'student') { await firebaseSignOut(auth); return null; }
  if (role === 'student' && provider !== 'custom') { await firebaseSignOut(auth); return null; }
  const profile = await getDoc(doc(db, 'users', user.uid));
  if (!profile.exists()) { await firebaseSignOut(auth); return null; }
  const data = profile.data();
  if (data.status === 'paused') { await firebaseSignOut(auth); return null; }
  return { id: user.uid, displayName: String(data.displayName ?? user.displayName ?? data.username), username: String(data.username ?? ''), role };
}

export class FirebaseDataGateway implements DataGateway {
  readonly mode = 'firebase' as const;

  observeSession(listener: (user: SessionUser | null) => void) {
    const auth = required(firebaseAuth, 'AUTH');
    return onAuthStateChanged(auth, (user) => {
      if (!user) { listener(null); return; }
      sessionFromUser(user).then(listener).catch(() => listener(null));
    });
  }

  async signIn(username: string, password: string): Promise<SessionUser> {
    const auth = required(firebaseAuth, 'AUTH');
    const functions = required(cloudFunctions, 'FUNCTIONS');
    await setPersistence(auth, browserLocalPersistence);
    const normalized = username.trim().normalize('NFKC').toLocaleLowerCase('tr-TR');
    if (!normalized || !password) throw new Error('INVALID_CREDENTIALS');

    let user: User;
    if (normalized === adminUsername) {
      const credential = await signInWithEmailAndPassword(auth, `${normalized}@${adminEmailDomain}`, password);
      await credential.user.getIdToken(true);
      user = credential.user;
    } else {
      const login = httpsCallable<{ username: string; password: string }, { customToken: string }>(functions, 'loginWithUsername');
      const result = await login({ username: normalized, password });
      user = (await signInWithCustomToken(auth, result.data.customToken)).user;
    }
    const session = await sessionFromUser(user);
    if (!session) throw new Error('INVALID_CREDENTIALS');
    return session;
  }

  async signOut() { await firebaseSignOut(required(firebaseAuth, 'AUTH')); }

  async getProgress() {
    const auth = required(firebaseAuth, 'AUTH');
    const db = required(firestore, 'FIRESTORE');
    if (!auth.currentUser) return emptyProgress;
    const snapshot = await getDoc(doc(db, 'userProgress', auth.currentUser.uid));
    return snapshot.exists() ? normalizeProgress(snapshot.data()) : emptyProgress;
  }

  async completeStep(input: CompleteStepInput): Promise<CompleteStepResult> {
    const call = httpsCallable<CompleteStepInput, CompleteStepResult>(required(cloudFunctions, 'FUNCTIONS'), 'completeStep');
    return (await call(input)).data;
  }

  async listStudents() {
    const snapshots = await getDocs(collection(required(firestore, 'FIRESTORE'), 'users'));
    return snapshots.docs.filter((item) => item.data().role === 'student').map((item) => mapStudent(item.id, item.data())).sort((a, b) => a.displayName.localeCompare(b.displayName, 'tr'));
  }

  async getStudentDetail(studentId: string): Promise<StudentDetail> {
    const db = required(firestore, 'FIRESTORE');
    const [studentDoc, progressDoc, eventDocs, assignmentDocs] = await Promise.all([
      getDoc(doc(db, 'users', studentId)),
      getDoc(doc(db, 'userProgress', studentId)),
      getDocs(query(collection(db, 'users', studentId, 'activityEvents'), orderBy('createdAt', 'desc'), limit(40))),
      getDocs(query(collection(db, 'users', studentId, 'assignments'), orderBy('createdAt', 'desc'), limit(40))),
    ]);
    if (!studentDoc.exists()) throw new Error('USER_NOT_FOUND');
    return {
      student: mapStudent(studentId, studentDoc.data()),
      progress: progressDoc.exists() ? normalizeProgress(progressDoc.data()) : emptyProgress,
      events: eventDocs.docs.map((item) => ({
        id: item.id,
        type: item.data().type,
        lessonId: item.data().lessonId,
        stepId: item.data().stepId,
        xp: Number(item.data().xp ?? 0),
        createdAt: dateValue(item.data().createdAt) ?? new Date(0).toISOString(),
      })),
      assignments: assignmentDocs.docs.map((item) => mapAssignment(item.id, item.data())),
    };
  }

  async createStudent(input: CreateStudentInput) {
    const call = httpsCallable<CreateStudentInput, Student>(required(cloudFunctions, 'FUNCTIONS'), 'createStudent');
    return (await call(input)).data;
  }

  async resetStudentPassword(studentId: string, password: string) {
    const call = httpsCallable(required(cloudFunctions, 'FUNCTIONS'), 'resetStudentPassword');
    await call({ studentId, password });
  }

  async setStudentStatus(studentId: string, status: Student['status']) {
    const call = httpsCallable(required(cloudFunctions, 'FUNCTIONS'), 'setStudentStatus');
    await call({ studentId, status });
  }

  async createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
    const call = httpsCallable<CreateAssignmentInput, Assignment>(required(cloudFunctions, 'FUNCTIONS'), 'createAssignment');
    return (await call(input)).data;
  }

  async listAssignments() {
    const auth = required(firebaseAuth, 'AUTH');
    if (!auth.currentUser) return [];
    const snapshots = await getDocs(query(collection(required(firestore, 'FIRESTORE'), 'users', auth.currentUser.uid, 'assignments'), orderBy('createdAt', 'desc'), limit(50)));
    return snapshots.docs.map((item) => mapAssignment(item.id, item.data()));
  }

  async listNotifications(): Promise<AppNotification[]> {
    const auth = required(firebaseAuth, 'AUTH');
    if (!auth.currentUser) return [];
    const snapshots = await getDocs(query(collection(required(firestore, 'FIRESTORE'), 'users', auth.currentUser.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(30)));
    return snapshots.docs.map((item) => ({
      id: item.id,
      title: String(item.data().title ?? ''),
      body: String(item.data().body ?? ''),
      assignmentId: typeof item.data().assignmentId === 'string' ? item.data().assignmentId : null,
      createdAt: dateValue(item.data().createdAt) ?? new Date(0).toISOString(),
      readAt: dateValue(item.data().readAt),
    }));
  }

  async markNotificationRead(notificationId: string) {
    const call = httpsCallable(required(cloudFunctions, 'FUNCTIONS'), 'markNotificationRead');
    await call({ notificationId });
  }
}
