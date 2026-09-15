import type { CreateStudentInput, DataGateway, SessionUser, Student } from '../domain/models';

// Versioning the key intentionally resets stale demo progress from earlier prototypes.
const STORAGE_KEY = 'levelup-demo-students-v2';

const seedStudents: Student[] = [
  {
    id: 'student-deniz',
    displayName: 'Deniz Kaya',
    email: 'deniz@levelup.demo',
    path: 'Hızlı Başlangıç: Unity & C#',
    pace: 'accelerated',
    mastery: 0,
    status: 'active',
    nextLesson: 'C#, Unity ve ilk çalışan script',
  },
  {
    id: 'student-elif',
    displayName: 'Elif Arslan',
    email: 'elif@levelup.demo',
    path: 'Temelden Mobil Oyun Geliştirme',
    pace: 'balanced',
    mastery: 0,
    status: 'active',
    nextLesson: 'C#, Unity ve ilk çalışan script',
  },
];

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function readStudents(): Student[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedStudents;

  try {
    return JSON.parse(saved) as Student[];
  } catch {
    return seedStudents;
  }
}

export class DemoDataGateway implements DataGateway {
  async signIn(email: string, password: string): Promise<SessionUser> {
    await wait(520);
    if (!password.trim()) throw new Error('PASSWORD_REQUIRED');

    if (email.toLowerCase() === 'admin@levelup.demo') {
      return { id: 'admin-furkan', displayName: 'Furkan Eğitmen', email, role: 'admin' };
    }

    const student = readStudents().find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!student) throw new Error('USER_NOT_FOUND');

    return { id: student.id, displayName: student.displayName, email: student.email, role: 'student' };
  }

  async signOut(): Promise<void> {
    await wait(180);
  }

  async listStudents(): Promise<Student[]> {
    await wait(360);
    return readStudents();
  }

  async createStudent(input: CreateStudentInput): Promise<Student> {
    await wait(680);
    const students = readStudents();
    if (students.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('EMAIL_EXISTS');
    }

    const student: Student = {
      id: crypto.randomUUID(),
      displayName: input.displayName.trim(),
      email: input.email.trim().toLowerCase(),
      path: input.path,
      pace: input.pace,
      mastery: 0,
      status: 'active',
      nextLesson: 'Tanılama ve proje düzeni',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([student, ...students]));
    return student;
  }
}

export const dataGateway: DataGateway = new DemoDataGateway();
