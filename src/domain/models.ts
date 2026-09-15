export type Role = 'admin' | 'student';
export type Locale = 'tr' | 'en';

export interface SessionUser {
  id: string;
  displayName: string;
  email: string;
  role: Role;
}

export interface Student {
  id: string;
  displayName: string;
  email: string;
  path: string;
  pace: 'accelerated' | 'balanced';
  mastery: number;
  status: 'active' | 'paused';
  nextLesson: string;
}

export interface CreateStudentInput {
  displayName: string;
  email: string;
  temporaryPassword: string;
  path: string;
  pace: Student['pace'];
}

export interface DataGateway {
  signIn(email: string, password: string): Promise<SessionUser>;
  signOut(): Promise<void>;
  listStudents(): Promise<Student[]>;
  createStudent(input: CreateStudentInput): Promise<Student>;
}
