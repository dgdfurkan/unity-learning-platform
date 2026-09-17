export type Role = 'admin' | 'student';
export type Locale = 'tr' | 'en';

export interface SessionUser {
  id: string;
  displayName: string;
  username: string;
  role: Role;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  path: string;
  pace: 'accelerated' | 'balanced';
  mastery: number;
  status: 'active' | 'paused';
  nextLesson: string;
  xp: number;
  streak: number;
  completedLessons: number;
  lastLoginAt: string | null;
  lastActivityAt: string | null;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  username: string;
  temporaryPassword: string;
  path: string;
  pace: Student['pace'];
}

export interface ActivityEvent {
  id: string;
  type: 'login' | 'step_completed' | 'lesson_completed' | 'assignment_created';
  lessonId?: string;
  stepId?: string;
  xp?: number;
  createdAt: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  title: string;
  description: string;
  dueAt: string | null;
  lessonId: string | null;
  status: 'assigned' | 'completed';
  createdAt: string;
  readAt: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  assignmentId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface StudentDetail {
  student: Student;
  progress: import('../learning/progress').LearningProgress;
  events: ActivityEvent[];
  assignments: Assignment[];
}

export interface CompleteStepInput {
  lessonId: string;
  stepId: string;
}

export interface CreateAssignmentInput {
  studentId: string;
  title: string;
  description: string;
  dueAt: string | null;
  lessonId: string | null;
}

export interface CompleteStepResult {
  progress: import('../learning/progress').LearningProgress;
  awarded: number;
  firstCompletion: boolean;
  streakAdvanced: boolean;
}

export interface DataGateway {
  readonly mode: 'cloudflare' | 'demo';
  observeSession(listener: (user: SessionUser | null) => void): () => void;
  signIn(username: string, password: string): Promise<SessionUser>;
  signOut(): Promise<void>;
  getProgress(): Promise<import('../learning/progress').LearningProgress>;
  completeStep(input: CompleteStepInput): Promise<CompleteStepResult>;
  listStudents(): Promise<Student[]>;
  getStudentDetail(studentId: string): Promise<StudentDetail>;
  createStudent(input: CreateStudentInput): Promise<Student>;
  resetStudentPassword(studentId: string, password: string): Promise<void>;
  setStudentStatus(studentId: string, status: Student['status']): Promise<void>;
  createAssignment(input: CreateAssignmentInput): Promise<Assignment>;
  listAssignments(): Promise<Assignment[]>;
  listNotifications(): Promise<AppNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}
