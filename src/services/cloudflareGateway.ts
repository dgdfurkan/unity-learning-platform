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
import type { LearningProgress } from '../learning/progress';
import { apiBaseUrl } from './backendConfig';

const TOKEN_KEY = 'levelup-session-v1';

type LoginResponse = { user: SessionUser; token: string };

const readToken = () => localStorage.getItem(TOKEN_KEY);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) {
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY);
    throw new Error(payload.error || `REQUEST_FAILED_${response.status}`);
  }
  return payload as T;
}

export class CloudflareDataGateway implements DataGateway {
  readonly mode = 'cloudflare' as const;

  observeSession(listener: (user: SessionUser | null) => void) {
    let active = true;
    if (!readToken()) {
      queueMicrotask(() => active && listener(null));
    } else {
      request<{ user: SessionUser }>('/api/auth/session')
        .then(({ user }) => active && listener(user))
        .catch(() => active && listener(null));
    }
    return () => { active = false; };
  }

  async signIn(username: string, password: string): Promise<SessionUser> {
    const result = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.token);
    return result.user;
  }

  async signOut() {
    try { await request('/api/auth/logout', { method: 'POST' }); }
    finally { localStorage.removeItem(TOKEN_KEY); }
  }

  async getProgress(): Promise<LearningProgress> { return request('/api/progress'); }

  async completeStep(input: CompleteStepInput): Promise<CompleteStepResult> {
    return request('/api/progress/complete-step', { method: 'POST', body: JSON.stringify(input) });
  }

  async listStudents(): Promise<Student[]> { return request('/api/admin/students'); }
  async getStudentDetail(studentId: string): Promise<StudentDetail> { return request(`/api/admin/students/${encodeURIComponent(studentId)}`); }

  async createStudent(input: CreateStudentInput): Promise<Student> {
    return request('/api/admin/students', { method: 'POST', body: JSON.stringify(input) });
  }

  async resetStudentPassword(studentId: string, password: string) {
    await request(`/api/admin/students/${encodeURIComponent(studentId)}/reset-password`, {
      method: 'POST', body: JSON.stringify({ password }),
    });
  }

  async setStudentStatus(studentId: string, status: Student['status']) {
    await request(`/api/admin/students/${encodeURIComponent(studentId)}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
  }

  async createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
    return request('/api/admin/assignments', { method: 'POST', body: JSON.stringify(input) });
  }

  async listAssignments(): Promise<Assignment[]> { return request('/api/assignments'); }
  async listNotifications(): Promise<AppNotification[]> { return request('/api/notifications'); }
  async markNotificationRead(notificationId: string) {
    await request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'POST' });
  }
}
