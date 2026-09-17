import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { Miniflare } from 'miniflare';

const origin = 'http://localhost:5173';
const bootstrapToken = 'test-bootstrap-token-that-is-long-enough';

async function request(mf, path, { method = 'GET', token, setupToken, body, originHeader = origin } = {}) {
  const headers = { Accept: 'application/json' };
  if (originHeader) headers.Origin = originHeader;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (setupToken) headers['X-Setup-Token'] = setupToken;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await mf.dispatchFetch(`http://levelup.test${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test('free backend protects roles, progress, passwords and assignments', async (context) => {
  const mf = new Miniflare({
    modules: true,
    scriptPath: new URL('../src/index.js', import.meta.url).pathname,
    modulesRoot: new URL('../src/', import.meta.url).pathname,
    modulesRules: [{ type: 'ESModule', include: ['**/*.js'] }],
    compatibilityDate: '2026-08-06',
    d1Databases: { DB: 'levelup-test' },
    bindings: {
      SITE_ORIGIN: origin,
      ADMIN_USERNAME: 'admin',
      AUTH_PEPPER: 'test-auth-pepper-that-never-leaves-the-worker',
      BOOTSTRAP_TOKEN: bootstrapToken,
    },
  });
  context.after(() => mf.dispose());
  const db = await mf.getD1Database('DB');
  const migration = await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8');
  for (const statement of migration.split(';').map((item) => item.trim()).filter(Boolean)) {
    await db.prepare(statement).run();
  }

  let result = await request(mf, '/api/setup/admin', {
    method: 'PUT', setupToken: 'wrong-token-that-is-long-enough', body: { username: 'admin', password: 'AdminPass!123' },
  });
  assert.equal(result.status, 404);

  result = await request(mf, '/api/setup/admin', {
    method: 'PUT', setupToken: bootstrapToken, body: { username: 'ADMIN', password: 'AdminPass!123' },
  });
  assert.equal(result.status, 200);

  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'admin', password: 'wrong-pass' } });
  assert.equal(result.status, 401);

  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'ADMIN', password: 'AdminPass!123' } });
  assert.equal(result.status, 200);
  const adminToken = result.body.token;
  assert.equal(result.body.user.role, 'admin');

  const studentInput = {
    firstName: 'Eren', lastName: 'Yılmaz', username: 'Eren', temporaryPassword: 'StudentPass!123',
    path: 'LevelUp Unity Akademisi', pace: 'balanced',
  };
  result = await request(mf, '/api/admin/students', { method: 'POST', token: adminToken, body: studentInput });
  assert.equal(result.status, 200);
  const studentId = result.body.id;
  assert.equal(result.body.username, 'eren');

  result = await request(mf, '/api/admin/students', { method: 'POST', token: adminToken, body: studentInput });
  assert.equal(result.status, 409);

  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'eReN', password: 'StudentPass!123' } });
  assert.equal(result.status, 200);
  let studentToken = result.body.token;

  result = await request(mf, '/api/admin/students', { token: studentToken });
  assert.equal(result.status, 403);

  result = await request(mf, '/api/progress', { token: studentToken });
  assert.deepEqual(result.body, { xp: 0, streak: 0, lastStudyDay: null, completedSteps: {}, completedLessons: [] });

  const firstStep = { lessonId: 'lesson-001-game-system-mental-model', stepId: 'l1-welcome' };
  result = await request(mf, '/api/progress/complete-step', { method: 'POST', token: studentToken, body: firstStep });
  assert.equal(result.status, 200);
  assert.equal(result.body.awarded, 20);
  assert.equal(result.body.progress.xp, 20);

  result = await request(mf, '/api/progress/complete-step', { method: 'POST', token: studentToken, body: firstStep });
  assert.equal(result.body.awarded, 0);
  assert.equal(result.body.progress.xp, 20);

  result = await request(mf, '/api/progress/complete-step', {
    method: 'POST', token: studentToken, body: { lessonId: 'fake', stepId: 'give-me-points' },
  });
  assert.equal(result.status, 400);

  result = await request(mf, '/api/admin/assignments', {
    method: 'POST', token: adminToken,
    body: { studentId, title: 'Transform tekrarını tamamla', description: 'Ders 6 etkinliklerini yeniden çöz.', dueAt: null, lessonId: 'lesson-006-gameobject-component-transform' },
  });
  assert.equal(result.status, 200);

  result = await request(mf, '/api/notifications', { token: studentToken });
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 1);
  const notificationId = result.body[0].id;

  result = await request(mf, `/api/notifications/${notificationId}/read`, { method: 'POST', token: studentToken });
  assert.equal(result.status, 200);

  result = await request(mf, `/api/admin/students/${studentId}/reset-password`, {
    method: 'POST', token: adminToken, body: { password: 'NewStudentPass!456' },
  });
  assert.equal(result.status, 200);

  result = await request(mf, '/api/auth/session', { token: studentToken });
  assert.equal(result.status, 401);
  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'eren', password: 'StudentPass!123' } });
  assert.equal(result.status, 401);
  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'eren', password: 'NewStudentPass!456' } });
  assert.equal(result.status, 200);
  studentToken = result.body.token;

  result = await request(mf, `/api/admin/students/${studentId}/status`, {
    method: 'PATCH', token: adminToken, body: { status: 'paused' },
  });
  assert.equal(result.status, 200);
  result = await request(mf, '/api/auth/session', { token: studentToken });
  assert.equal(result.status, 401);
  result = await request(mf, '/api/auth/login', { method: 'POST', body: { username: 'eren', password: 'NewStudentPass!456' } });
  assert.equal(result.status, 401);

  result = await request(mf, '/api/health', { originHeader: 'https://attacker.example' });
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('access-control-allow-origin'), null);
});
