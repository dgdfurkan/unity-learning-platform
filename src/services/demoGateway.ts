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
import { getLesson } from '../learning/course';
import { awardStep, emptyProgress, loadProgress } from '../learning/progress';

const STORAGE_KEY = 'levelup-demo-students-v3';
const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const seedStudents: Student[] = [{
  id: 'student-deniz', firstName: 'Deniz', lastName: 'Kaya', displayName: 'Deniz Kaya', username: 'deniz',
  path: 'Hızlı Başlangıç: Unity & C#', pace: 'accelerated', mastery: 0, status: 'active',
  nextLesson: 'Oyun Bilgisayarda Nasıl Çalışır?', xp: 0, streak: 0, completedLessons: 0,
  lastLoginAt: null, lastActivityAt: null,
}];

function readStudents(): Student[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') as Student[]; }
  catch { return seedStudents; }
}

function writeStudents(students: Student[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(students)); }

export class DemoDataGateway implements DataGateway {
  readonly mode = 'demo' as const;
  private current: SessionUser | null = null;

  observeSession(listener: (user: SessionUser | null) => void) {
    window.setTimeout(() => listener(this.current), 0);
    return () => undefined;
  }

  async signIn(username: string, password: string): Promise<SessionUser> {
    await wait(250);
    if (!password.trim()) throw new Error('INVALID_CREDENTIALS');
    const normalized = username.trim().toLocaleLowerCase('tr-TR');
    if (normalized === 'admin') this.current = { id: 'admin-furkan', displayName: 'Furkan Eğitmen', username: 'admin', role: 'admin' };
    else {
      const student = readStudents().find((item) => item.username.toLocaleLowerCase('tr-TR') === normalized);
      if (!student) throw new Error('INVALID_CREDENTIALS');
      this.current = { id: student.id, displayName: student.displayName, username: student.username, role: 'student' };
    }
    return this.current;
  }

  async signOut() { this.current = null; }
  async getProgress() { return loadProgress(); }

  async completeStep(input: CompleteStepInput): Promise<CompleteStepResult> {
    const lesson = getLesson(input.lessonId);
    const index = lesson.steps.findIndex((item) => item.id === input.stepId);
    const step = lesson.steps[index];
    if (!step) throw new Error('STEP_NOT_FOUND');
    return awardStep(loadProgress(), lesson.id, step, index === lesson.steps.length - 1);
  }

  async listStudents() { await wait(180); return readStudents(); }

  async getStudentDetail(studentId: string): Promise<StudentDetail> {
    const student = readStudents().find((item) => item.id === studentId);
    if (!student) throw new Error('USER_NOT_FOUND');
    return { student, progress: emptyProgress, events: [], assignments: [] };
  }

  async createStudent(input: CreateStudentInput): Promise<Student> {
    const students = readStudents();
    const username = input.username.trim().toLocaleLowerCase('tr-TR');
    if (students.some((item) => item.username.toLocaleLowerCase('tr-TR') === username)) throw new Error('USERNAME_EXISTS');
    const student: Student = {
      id: crypto.randomUUID(), firstName: input.firstName.trim(), lastName: input.lastName.trim(),
      displayName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(), username,
      path: input.path, pace: input.pace, mastery: 0, status: 'active', nextLesson: 'Oyun Bilgisayarda Nasıl Çalışır?',
      xp: 0, streak: 0, completedLessons: 0, lastLoginAt: null, lastActivityAt: null,
    };
    writeStudents([student, ...students]);
    return student;
  }

  async resetStudentPassword() { await wait(120); }
  async setStudentStatus(studentId: string, status: Student['status']) { writeStudents(readStudents().map((item) => item.id === studentId ? { ...item, status } : item)); }

  async createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
    return { id: crypto.randomUUID(), ...input, status: 'assigned', createdAt: new Date().toISOString(), readAt: null };
  }

  async listAssignments(): Promise<Assignment[]> { return []; }
  async listNotifications(): Promise<AppNotification[]> { return []; }
  async markNotificationRead() { return; }
}
