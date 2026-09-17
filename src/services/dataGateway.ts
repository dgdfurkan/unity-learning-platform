import type { AppNotification, Assignment, CompleteStepInput, CompleteStepResult, CreateAssignmentInput, CreateStudentInput, DataGateway, SessionUser, Student, StudentDetail } from '../domain/models';
import type { LearningProgress } from '../learning/progress';
import { DemoDataGateway } from './demoGateway';
import { isCloudBackendConfigured } from './backendConfig';

class LazyCloudflareDataGateway implements DataGateway {
  readonly mode = 'cloudflare' as const;
  private gatewayPromise: Promise<DataGateway> | null = null;

  private load() {
    if (!this.gatewayPromise) this.gatewayPromise = import('./cloudflareGateway').then(({ CloudflareDataGateway }) => new CloudflareDataGateway());
    return this.gatewayPromise;
  }

  observeSession(listener: (user: SessionUser | null) => void) {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    this.load().then((gateway) => {
      if (!disposed) unsubscribe = gateway.observeSession(listener);
    }).catch(() => listener(null));
    return () => { disposed = true; unsubscribe?.(); };
  }

  async signIn(username: string, password: string): Promise<SessionUser> { return (await this.load()).signIn(username, password); }
  async signOut(): Promise<void> { return (await this.load()).signOut(); }
  async getProgress(): Promise<LearningProgress> { return (await this.load()).getProgress(); }
  async completeStep(input: CompleteStepInput): Promise<CompleteStepResult> { return (await this.load()).completeStep(input); }
  async listStudents(): Promise<Student[]> { return (await this.load()).listStudents(); }
  async getStudentDetail(studentId: string): Promise<StudentDetail> { return (await this.load()).getStudentDetail(studentId); }
  async createStudent(input: CreateStudentInput): Promise<Student> { return (await this.load()).createStudent(input); }
  async resetStudentPassword(studentId: string, password: string): Promise<void> { return (await this.load()).resetStudentPassword(studentId, password); }
  async setStudentStatus(studentId: string, status: Student['status']): Promise<void> { return (await this.load()).setStudentStatus(studentId, status); }
  async createAssignment(input: CreateAssignmentInput): Promise<Assignment> { return (await this.load()).createAssignment(input); }
  async listAssignments(): Promise<Assignment[]> { return (await this.load()).listAssignments(); }
  async listNotifications(): Promise<AppNotification[]> { return (await this.load()).listNotifications(); }
  async markNotificationRead(notificationId: string): Promise<void> { return (await this.load()).markNotificationRead(notificationId); }
}

export const dataGateway: DataGateway = isCloudBackendConfigured ? new LazyCloudflareDataGateway() : new DemoDataGateway();
