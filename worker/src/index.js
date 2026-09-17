import { curriculum, totalPublishedSteps } from './curriculum.generated.js';

const encoder = new TextEncoder();
const PASSWORD_ITERATIONS = 100_000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const normalizeUsername = (value) => String(value ?? '').trim().normalize('NFKC').toLocaleLowerCase('tr-TR');
const validUsername = (value) => /^[\p{L}\p{N}._-]{3,24}$/u.test(value) && !value.includes('/');
const validPassword = (value) => typeof value === 'string' && value.length >= 10 && value.length <= 128;
const safeText = (value, max) => String(value ?? '').trim().slice(0, max);
const nowIso = () => new Date().toISOString();

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return '';
  const configured = String(env.SITE_ORIGIN ?? '').split(',').map((item) => item.trim()).filter(Boolean);
  const allowed = new Set([...configured, 'http://localhost:5173', 'http://127.0.0.1:5173']);
  return allowed.has(origin) ? origin : '';
}

function responseHeaders(request, env) {
  const origin = allowedOrigin(request, env);
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  };
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(request, env) });
}

async function readJson(request) {
  const length = Number(request.headers.get('Content-Length') ?? 0);
  if (length > 16_384) throw new ApiError(413, 'İstek çok büyük.');
  try { return await request.json(); }
  catch { throw new ApiError(400, 'Gönderilen veri okunamadı.'); }
}

const toBase64Url = (bytes) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
};

const fromBase64Url = (value) => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

function randomValue(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function sha256(value) {
  return toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}

async function derivePassword(password, salt, pepper, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(`${password}\u0000${pepper}`), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const result = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64Url(salt), iterations }, key, 256,
  );
  return toBase64Url(new Uint8Array(result));
}

async function passwordRecord(password, env) {
  const salt = randomValue(18);
  return {
    salt,
    hash: await derivePassword(password, salt, env.AUTH_PEPPER),
    iterations: PASSWORD_ITERATIONS,
  };
}

async function passwordMatches(password, user, env) {
  const candidate = await derivePassword(password, user.password_salt, env.AUTH_PEPPER, user.password_iterations);
  if (candidate.length !== user.password_hash.length) return false;
  let difference = 0;
  for (let index = 0; index < candidate.length; index += 1) {
    difference |= candidate.charCodeAt(index) ^ user.password_hash.charCodeAt(index);
  }
  return difference === 0;
}

function dayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

const previousDayKey = () => dayKey(new Date(Date.now() - 86_400_000));

function sessionUser(row) {
  return { id: row.id, displayName: row.display_name, username: row.username, role: row.role };
}

function studentFromRow(row) {
  return {
    id: row.id,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    displayName: row.display_name,
    username: row.username,
    path: row.path ?? 'LevelUp Unity Akademisi',
    pace: row.pace === 'balanced' ? 'balanced' : 'accelerated',
    mastery: Number(row.mastery ?? 0),
    status: row.status === 'paused' ? 'paused' : 'active',
    nextLesson: row.next_lesson ?? 'Ders 1 · Oyun Bilgisayarda Nasıl Çalışır?',
    xp: Number(row.xp ?? 0),
    streak: Number(row.streak ?? 0),
    completedLessons: Number(row.completed_lessons ?? 0),
    lastLoginAt: row.last_login_at ?? null,
    lastActivityAt: row.last_activity_at ?? null,
  };
}

function assignmentFromRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    title: row.title,
    description: row.description,
    dueAt: row.due_at ?? null,
    lessonId: row.lesson_id ?? null,
    status: row.status === 'completed' ? 'completed' : 'assigned',
    createdAt: row.created_at,
    readAt: row.read_at ?? null,
  };
}

async function progressFor(env, userId) {
  const [progress, steps] = await Promise.all([
    env.DB.prepare('SELECT * FROM progress WHERE user_id = ?').bind(userId).first(),
    env.DB.prepare('SELECT lesson_id, step_id FROM completed_steps WHERE user_id = ? ORDER BY completed_at').bind(userId).all(),
  ]);
  const completedSteps = {};
  for (const row of steps.results ?? []) {
    (completedSteps[row.lesson_id] ??= []).push(row.step_id);
  }
  return {
    xp: Number(progress?.xp ?? 0),
    streak: Number(progress?.streak ?? 0),
    lastStudyDay: progress?.last_study_day ?? null,
    completedSteps,
    completedLessons: progress?.completed_lessons_json ? JSON.parse(progress.completed_lessons_json) : [],
  };
}

async function requireSession(request, env, role) {
  const authorization = request.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) throw new ApiError(401, 'Oturum gerekli.');
  const tokenHash = await sha256(authorization.slice(7));
  const row = await env.DB.prepare(`
    SELECT u.*, s.expires_at, s.session_version AS token_session_version
    FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?
  `).bind(tokenHash).first();
  if (!row || row.expires_at <= nowIso() || row.status !== 'active' || Number(row.session_version) !== Number(row.token_session_version)) {
    if (row) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    throw new ApiError(401, 'Oturumun süresi doldu. Lütfen yeniden giriş yap.');
  }
  if (role && row.role !== role) throw new ApiError(403, 'Bu işlem için yetkin bulunmuyor.');
  return { user: row, tokenHash };
}

async function login(request, env) {
  const body = await readJson(request);
  const username = normalizeUsername(body.username);
  const password = body.password;
  if (!validUsername(username) || !validPassword(password)) throw new ApiError(401, 'Kullanıcı adı veya şifre hatalı.');
  const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (!user || user.status !== 'active') throw new ApiError(401, 'Kullanıcı adı veya şifre hatalı.');
  const now = Date.now();
  if (user.lock_until && Date.parse(user.lock_until) > now) throw new ApiError(429, 'Çok fazla başarısız deneme yapıldı. 15 dakika sonra yeniden dene.');
  if (!(await passwordMatches(password, user, env))) {
    const attempts = user.lock_until && Date.parse(user.lock_until) <= now ? 1 : Number(user.failed_attempts ?? 0) + 1;
    const lockUntil = attempts >= 5 ? new Date(now + 15 * 60_000).toISOString() : null;
    await env.DB.prepare('UPDATE users SET failed_attempts = ?, lock_until = ?, updated_at = ? WHERE id = ?')
      .bind(attempts, lockUntil, nowIso(), user.id).run();
    throw new ApiError(401, 'Kullanıcı adı veya şifre hatalı.');
  }
  const token = randomValue(32);
  const tokenHash = await sha256(token);
  const createdAt = nowIso();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  const eventId = crypto.randomUUID();
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET failed_attempts = 0, lock_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?').bind(createdAt, createdAt, user.id),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, session_version, expires_at, created_at) VALUES (?, ?, ?, ?, ?)').bind(tokenHash, user.id, user.session_version, expiresAt, createdAt),
    env.DB.prepare('INSERT INTO activity_events (id, user_id, type, created_at) VALUES (?, ?, ?, ?)').bind(eventId, user.id, 'login', createdAt),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(createdAt),
  ]);
  return { user: sessionUser(user), token };
}

async function bootstrapAdmin(request, env) {
  const supplied = request.headers.get('X-Setup-Token') ?? '';
  if (!env.BOOTSTRAP_TOKEN || supplied.length < 24 || supplied !== env.BOOTSTRAP_TOKEN) throw new ApiError(404, 'Bulunamadı.');
  const body = await readJson(request);
  const username = normalizeUsername(body.username || env.ADMIN_USERNAME || 'admin');
  const password = body.password;
  if (!validUsername(username) || !validPassword(password)) throw new ApiError(400, 'Admin kullanıcı adı veya şifresi geçersiz. Şifre en az 10 karakter olmalı.');
  const existing = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  if (existing?.role === 'student') throw new ApiError(409, 'Bu kullanıcı adı bir öğrenciye ait.');
  if (existing && await passwordMatches(password, existing, env)) return { ok: true, changed: false };
  const record = await passwordRecord(password, env);
  const timestamp = nowIso();
  if (existing) {
    await env.DB.batch([
      env.DB.prepare(`UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, session_version = session_version + 1,
        failed_attempts = 0, lock_until = NULL, updated_at = ? WHERE id = ?`).bind(record.hash, record.salt, record.iterations, timestamp, existing.id),
      env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(existing.id),
    ]);
    return { ok: true, changed: true };
  }
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO users
    (id, role, display_name, username, password_hash, password_salt, password_iterations, status, path, pace, next_lesson, created_at, updated_at)
    VALUES (?, 'admin', ?, ?, ?, ?, ?, 'active', 'Yönetim', 'accelerated', 'Öğrenci paneli', ?, ?)`)
    .bind(id, 'Furkan Eğitmen', username, record.hash, record.salt, record.iterations, timestamp, timestamp).run();
  return { ok: true, changed: true };
}

async function createStudent(request, env) {
  await requireSession(request, env, 'admin');
  const body = await readJson(request);
  const username = normalizeUsername(body.username);
  const firstName = safeText(body.firstName, 60);
  const lastName = safeText(body.lastName, 60);
  if (!validUsername(username) || !validPassword(body.temporaryPassword) || firstName.length < 2 || lastName.length < 2) {
    throw new ApiError(400, 'Ad, soyad, geçerli kullanıcı adı ve en az 10 karakterlik şifre gerekli.');
  }
  const record = await passwordRecord(body.temporaryPassword, env);
  const id = crypto.randomUUID();
  const timestamp = nowIso();
  const displayName = `${firstName} ${lastName}`;
  const path = safeText(body.path, 100) || 'LevelUp Unity Akademisi';
  const pace = body.pace === 'balanced' ? 'balanced' : 'accelerated';
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO users
        (id, role, first_name, last_name, display_name, username, password_hash, password_salt, password_iterations, status, path, pace, next_lesson, created_at, updated_at)
        VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, 'Ders 1 · Oyun Bilgisayarda Nasıl Çalışır?', ?, ?)`)
        .bind(id, firstName, lastName, displayName, username, record.hash, record.salt, record.iterations, path, pace, timestamp, timestamp),
      env.DB.prepare(`INSERT INTO progress (user_id, xp, streak, completed_lessons_json, updated_at) VALUES (?, 0, 0, '[]', ?)`)
        .bind(id, timestamp),
    ]);
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) throw new ApiError(409, 'Bu kullanıcı adı kullanılıyor.');
    throw error;
  }
  return studentFromRow({ id, first_name: firstName, last_name: lastName, display_name: displayName, username, path, pace, status: 'active' });
}

async function listStudents(request, env) {
  await requireSession(request, env, 'admin');
  const rows = await env.DB.prepare("SELECT * FROM users WHERE role = 'student' ORDER BY display_name COLLATE NOCASE").all();
  return (rows.results ?? []).map(studentFromRow);
}

async function studentDetail(request, env, studentId) {
  await requireSession(request, env, 'admin');
  const [student, events, assignments, progress] = await Promise.all([
    env.DB.prepare("SELECT * FROM users WHERE id = ? AND role = 'student'").bind(studentId).first(),
    env.DB.prepare('SELECT id, type, lesson_id, step_id, xp, created_at FROM activity_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 40').bind(studentId).all(),
    env.DB.prepare('SELECT * FROM assignments WHERE student_id = ? ORDER BY created_at DESC LIMIT 40').bind(studentId).all(),
    progressFor(env, studentId),
  ]);
  if (!student) throw new ApiError(404, 'Öğrenci bulunamadı.');
  return {
    student: studentFromRow(student),
    progress,
    events: (events.results ?? []).map((row) => ({
      id: row.id, type: row.type, lessonId: row.lesson_id ?? undefined, stepId: row.step_id ?? undefined,
      xp: row.xp == null ? undefined : Number(row.xp), createdAt: row.created_at,
    })),
    assignments: (assignments.results ?? []).map(assignmentFromRow),
  };
}

async function resetPassword(request, env, studentId) {
  await requireSession(request, env, 'admin');
  const body = await readJson(request);
  if (!validPassword(body.password)) throw new ApiError(400, 'Yeni şifre en az 10 karakter olmalı.');
  const student = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'student'").bind(studentId).first();
  if (!student) throw new ApiError(404, 'Öğrenci bulunamadı.');
  const record = await passwordRecord(body.password, env);
  await env.DB.batch([
    env.DB.prepare(`UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, session_version = session_version + 1,
      failed_attempts = 0, lock_until = NULL, updated_at = ? WHERE id = ?`)
      .bind(record.hash, record.salt, record.iterations, nowIso(), studentId),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(studentId),
  ]);
  return { ok: true };
}

async function setStatus(request, env, studentId) {
  await requireSession(request, env, 'admin');
  const body = await readJson(request);
  const status = body.status === 'paused' ? 'paused' : body.status === 'active' ? 'active' : null;
  if (!status) throw new ApiError(400, 'Geçersiz öğrenci durumu.');
  const result = await env.DB.prepare(`UPDATE users SET status = ?, session_version = session_version + 1, updated_at = ?
    WHERE id = ? AND role = 'student'`).bind(status, nowIso(), studentId).run();
  if (!result.meta.changes) throw new ApiError(404, 'Öğrenci bulunamadı.');
  await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(studentId).run();
  return { ok: true };
}

async function completeStep(request, env) {
  const { user } = await requireSession(request, env, 'student');
  const body = await readJson(request);
  const lessonId = safeText(body.lessonId, 100);
  const stepId = safeText(body.stepId, 100);
  const item = curriculum[`${lessonId}/${stepId}`];
  if (!item) throw new ApiError(400, 'Bu adım yayınlanmış müfredatta bulunamadı.');
  const existing = await env.DB.prepare('SELECT 1 FROM completed_steps WHERE user_id = ? AND lesson_id = ? AND step_id = ?')
    .bind(user.id, lessonId, stepId).first();
  if (existing) return { progress: await progressFor(env, user.id), awarded: 0, firstCompletion: false, streakAdvanced: false };
  const progress = await progressFor(env, user.id);
  const today = dayKey();
  const streakAdvanced = progress.lastStudyDay !== today;
  const streak = !streakAdvanced ? progress.streak : progress.lastStudyDay === previousDayKey() ? progress.streak + 1 : 1;
  const completedLessons = item.finale && !progress.completedLessons.includes(lessonId)
    ? [...progress.completedLessons, lessonId] : progress.completedLessons;
  const nextXp = progress.xp + item.xp;
  const completedCount = Object.values(progress.completedSteps).reduce((sum, values) => sum + values.length, 0) + 1;
  const timestamp = nowIso();
  try {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO completed_steps (user_id, lesson_id, step_id, completed_at) VALUES (?, ?, ?, ?)').bind(user.id, lessonId, stepId, timestamp),
      env.DB.prepare(`UPDATE progress SET xp = ?, streak = ?, last_study_day = ?, completed_lessons_json = ?, updated_at = ? WHERE user_id = ?`)
        .bind(nextXp, streak, today, JSON.stringify(completedLessons), timestamp, user.id),
      env.DB.prepare(`UPDATE users SET xp = ?, streak = ?, completed_lessons = ?, mastery = ?, last_activity_at = ?,
        next_lesson = ?, updated_at = ? WHERE id = ?`)
        .bind(nextXp, streak, completedLessons.length, Math.round((completedCount / totalPublishedSteps) * 100), timestamp,
          item.finale ? 'Sonraki dersin kilidi açıldı' : 'Açık dersteki sonraki adım', timestamp, user.id),
      env.DB.prepare(`INSERT INTO activity_events (id, user_id, type, lesson_id, step_id, xp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), user.id, item.finale ? 'lesson_completed' : 'step_completed', lessonId, stepId, item.xp, timestamp),
    ]);
  } catch (error) {
    const raced = await env.DB.prepare('SELECT 1 FROM completed_steps WHERE user_id = ? AND lesson_id = ? AND step_id = ?')
      .bind(user.id, lessonId, stepId).first();
    if (raced) return { progress: await progressFor(env, user.id), awarded: 0, firstCompletion: false, streakAdvanced: false };
    throw error;
  }
  const completedSteps = { ...progress.completedSteps, [lessonId]: [...(progress.completedSteps[lessonId] ?? []), stepId] };
  return {
    progress: { xp: nextXp, streak, lastStudyDay: today, completedSteps, completedLessons },
    awarded: item.xp, firstCompletion: true, streakAdvanced,
  };
}

async function createAssignment(request, env) {
  const { user: admin } = await requireSession(request, env, 'admin');
  const body = await readJson(request);
  const studentId = safeText(body.studentId, 80);
  const title = safeText(body.title, 100);
  const description = safeText(body.description, 1200);
  const lessonId = safeText(body.lessonId, 100) || null;
  const dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (!studentId || title.length < 3 || description.length < 3 || (dueAt && Number.isNaN(dueAt.getTime()))) {
    throw new ApiError(400, 'Ödev başlığı, açıklaması veya tarihi geçersiz.');
  }
  const student = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'student'").bind(studentId).first();
  if (!student) throw new ApiError(404, 'Öğrenci bulunamadı.');
  const assignmentId = crypto.randomUUID();
  const timestamp = nowIso();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO assignments
      (id, student_id, title, description, due_at, lesson_id, status, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 'assigned', ?, ?)`)
      .bind(assignmentId, studentId, title, description, dueAt?.toISOString() ?? null, lessonId, timestamp, admin.id),
    env.DB.prepare(`INSERT INTO notifications (id, user_id, title, body, assignment_id, created_at)
      VALUES (?, ?, 'Yeni ödev gönderildi', ?, ?, ?)`)
      .bind(crypto.randomUUID(), studentId, title, assignmentId, timestamp),
    env.DB.prepare(`INSERT INTO activity_events (id, user_id, type, assignment_id, created_at)
      VALUES (?, ?, 'assignment_created', ?, ?)`)
      .bind(crypto.randomUUID(), studentId, assignmentId, timestamp),
  ]);
  return assignmentFromRow({ id: assignmentId, student_id: studentId, title, description, due_at: dueAt?.toISOString() ?? null, lesson_id: lessonId, status: 'assigned', created_at: timestamp, read_at: null });
}

async function listAssignments(request, env) {
  const { user } = await requireSession(request, env);
  const query = user.role === 'admin'
    ? env.DB.prepare('SELECT * FROM assignments ORDER BY created_at DESC LIMIT 100')
    : env.DB.prepare('SELECT * FROM assignments WHERE student_id = ? ORDER BY created_at DESC LIMIT 50').bind(user.id);
  const rows = await query.all();
  return (rows.results ?? []).map(assignmentFromRow);
}

async function listNotifications(request, env) {
  const { user } = await requireSession(request, env, 'student');
  const rows = await env.DB.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').bind(user.id).all();
  return (rows.results ?? []).map((row) => ({
    id: row.id, title: row.title, body: row.body, assignmentId: row.assignment_id ?? null,
    createdAt: row.created_at, readAt: row.read_at ?? null,
  }));
}

async function markNotificationRead(request, env, notificationId) {
  const { user } = await requireSession(request, env, 'student');
  const result = await env.DB.prepare('UPDATE notifications SET read_at = COALESCE(read_at, ?) WHERE id = ? AND user_id = ?')
    .bind(nowIso(), notificationId, user.id).run();
  if (!result.meta.changes) throw new ApiError(404, 'Bildirim bulunamadı.');
  return { ok: true };
}

async function route(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  if (request.method === 'GET' && pathname === '/api/health') return { ok: true, service: 'levelup-academy-api' };
  if (request.method === 'PUT' && pathname === '/api/setup/admin') return bootstrapAdmin(request, env);
  if (request.method === 'POST' && pathname === '/api/auth/login') return login(request, env);
  if (request.method === 'GET' && pathname === '/api/auth/session') {
    const { user } = await requireSession(request, env); return { user: sessionUser(user) };
  }
  if (request.method === 'POST' && pathname === '/api/auth/logout') {
    const { tokenHash } = await requireSession(request, env); await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run(); return { ok: true };
  }
  if (request.method === 'GET' && pathname === '/api/progress') {
    const { user } = await requireSession(request, env, 'student'); return progressFor(env, user.id);
  }
  if (request.method === 'POST' && pathname === '/api/progress/complete-step') return completeStep(request, env);
  if (request.method === 'GET' && pathname === '/api/admin/students') return listStudents(request, env);
  if (request.method === 'POST' && pathname === '/api/admin/students') return createStudent(request, env);
  if (request.method === 'POST' && pathname === '/api/admin/assignments') return createAssignment(request, env);
  if (request.method === 'GET' && pathname === '/api/assignments') return listAssignments(request, env);
  if (request.method === 'GET' && pathname === '/api/notifications') return listNotifications(request, env);
  const detail = pathname.match(/^\/api\/admin\/students\/([^/]+)$/u);
  if (request.method === 'GET' && detail) return studentDetail(request, env, decodeURIComponent(detail[1]));
  const reset = pathname.match(/^\/api\/admin\/students\/([^/]+)\/reset-password$/u);
  if (request.method === 'POST' && reset) return resetPassword(request, env, decodeURIComponent(reset[1]));
  const status = pathname.match(/^\/api\/admin\/students\/([^/]+)\/status$/u);
  if (request.method === 'PATCH' && status) return setStatus(request, env, decodeURIComponent(status[1]));
  const notification = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/u);
  if (request.method === 'POST' && notification) return markNotificationRead(request, env, decodeURIComponent(notification[1]));
  throw new ApiError(404, 'Bulunamadı.');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      const origin = allowedOrigin(request, env);
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: {
        ...responseHeaders(request, env),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Setup-Token',
        'Access-Control-Max-Age': '86400',
      } });
    }
    try { return json(request, env, await route(request, env)); }
    catch (error) {
      if (error instanceof ApiError) return json(request, env, { error: error.message }, error.status);
      console.error(error);
      return json(request, env, { error: 'Beklenmeyen bir sunucu hatası oluştu.' }, 500);
    }
  },
};
