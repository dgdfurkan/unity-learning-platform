import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CodeEditor, type CodeFile } from '../components/CodeEditor';
import type { CreateStudentInput, Locale, SessionUser, Student } from '../domain/models';
import { coursePlan, getLesson, lessons, localize } from '../learning/course';
import { type CodeDiagnostic, validateCSharpSyntax, validateLessonCode } from '../learning/codeValidation';
import { dataGateway } from '../services/demoGateway';
import { Icon } from '../shared/Icon';
import { type MessageKey, translate } from '../shared/i18n';

type T = (key: MessageKey) => string;
type StudentView = 'home' | 'path' | 'assignments' | 'profile' | 'lesson';
type AdminView = 'overview' | 'students' | 'content' | 'reviews';

export function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('levelup-locale') as Locale) || 'tr');
  const [session, setSession] = useState<SessionUser | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const t = useMemo<T>(() => (key) => translate(locale, key), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem('levelup-locale', locale);
  }, [locale]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const toggleLocale = () => setLocale((current) => (current === 'tr' ? 'en' : 'tr'));

  if (!session) {
    return <LoginPage t={t} locale={locale} onLocale={toggleLocale} onSignedIn={setSession} />;
  }

  return (
    <WorkspaceShell
      session={session}
      t={t}
      locale={locale}
      onLocale={toggleLocale}
      online={online}
      onSignOut={async () => {
        await dataGateway.signOut();
        setSession(null);
      }}
    />
  );
}

function Brand() {
  return (
    <div className="brand" aria-label="LevelUp Studio">
      <span className="brand-mark" aria-hidden="true"><span>{'{'}</span><i /><span>{'}'}</span></span>
      <span>LevelUp<span className="brand-accent">.</span></span>
    </div>
  );
}

function LoginPage({ t, locale, onLocale, onSignedIn }: { t: T; locale: Locale; onLocale: () => void; onSignedIn: (user: SessionUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      onSignedIn(await dataGateway.signIn(email, password));
    } catch (reason) {
      setError(reason instanceof Error && reason.message === 'USER_NOT_FOUND'
        ? (locale === 'tr' ? 'Bu e-posta ile bir hesap bulunamadı.' : 'No account was found for this email.')
        : (locale === 'tr' ? 'E-posta ve şifre alanlarını kontrol et.' : 'Check the email and password fields.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role: 'admin' | 'student') => {
    setEmail(role === 'admin' ? 'admin@levelup.demo' : 'deniz@levelup.demo');
    setPassword(crypto.randomUUID());
    setError('');
  };

  return (
    <main id="main-content" className="login-page">
      <section className="login-story" aria-labelledby="login-heading">
        <header className="login-topbar">
          <Brand />
          <button className="language-button" type="button" onClick={onLocale} aria-label={locale === 'tr' ? 'Switch to English' : 'Türkçeye geç'}>{t('language')}</button>
        </header>
        <div className="story-copy">
          <div className="eyebrow"><Icon name="spark" /> Unity + C#</div>
          <h1 id="login-heading">{t('signInTitle')}</h1>
          <p>{t('signInBody')}</p>
          <div className="code-window" aria-label="Örnek C sharp kodu">
            <div className="window-bar"><i /><i /><i /><span>PlayerState.cs</span></div>
            <pre><span className="code-violet">private int</span> score = <span className="code-coral">0</span>;{`\n`}<span className="code-violet">private bool</span> isGameActive = <span className="code-coral">true</span>;{`\n\n`}<span className="code-muted">// Değeri gör, davranışı açıkla.</span>{`\n`}Debug.Log(score);</pre>
          </div>
        </div>
        <div className="mascot-stage" aria-hidden="true"><img src="./images/nova-mascot.webp" width="313" height="375" alt="" /></div>
      </section>

      <section className="login-panel" aria-label={t('signIn')}>
        <div className="login-card">
          <div className="mobile-brand"><Brand /></div>
          <p className="section-kicker">{t('brandDescriptor')}</p>
          <h2>{t('signIn')}</h2>
          <form onSubmit={signIn} noValidate>
            <label htmlFor="email">{t('email')}</label>
            <input id="email" name="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="password">{t('password')}</label>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" className="icon-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'} aria-pressed={showPassword}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} />
              </button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary button-wide" type="submit" disabled={submitting}>
              {submitting ? <span className="spinner" aria-hidden="true" /> : null}
              {submitting ? t('signingIn') : t('signIn')}
              {!submitting && <Icon name="arrow-right" />}
            </button>
          </form>
          <div className="account-policy"><Icon name="lock" /><span>{t('noRegistration')}</span></div>
          <div className="demo-box">
            <div><strong>{t('demoAccounts')}</strong><span>{t('demoDetail')}</span></div>
            <div className="demo-actions">
              <button type="button" onClick={() => fillDemo('student')}>{t('student')}</button>
              <button type="button" onClick={() => fillDemo('admin')}>{t('admin')}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WorkspaceShell({ session, t, locale, onLocale, online, onSignOut }: { session: SessionUser; t: T; locale: Locale; onLocale: () => void; online: boolean; onSignOut: () => Promise<void> }) {
  const [studentView, setStudentView] = useState<StudentView>('home');
  const [adminView, setAdminView] = useState<AdminView>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState('lesson-1');
  const [activeStepId, setActiveStepId] = useState('l1-goal');
  const isAdmin = session.role === 'admin';
  const inLesson = !isAdmin && studentView === 'lesson';
  const selectedLesson = getLesson(selectedLessonId);
  const activeStepIndex = Math.max(0, selectedLesson.steps.findIndex((step) => step.id === activeStepId));

  const studentNav: { id: StudentView; label: MessageKey; icon: Parameters<typeof Icon>[0]['name'] }[] = [
    { id: 'home', label: 'home', icon: 'home' },
    { id: 'path', label: 'path', icon: 'layers' },
    { id: 'assignments', label: 'assignments', icon: 'clipboard' },
    { id: 'profile', label: 'profile', icon: 'user' },
  ];
  const adminNav: { id: AdminView; label: MessageKey; icon: Parameters<typeof Icon>[0]['name'] }[] = [
    { id: 'overview', label: 'overview', icon: 'gauge' },
    { id: 'students', label: 'students', icon: 'users' },
    { id: 'content', label: 'content', icon: 'book' },
    { id: 'reviews', label: 'reviews', icon: 'clipboard' },
  ];
  const nav = isAdmin ? adminNav : studentNav;
  const current = isAdmin ? adminView : studentView;

  const navigate = (id: StudentView | AdminView) => {
    if (isAdmin) setAdminView(id as AdminView);
    else setStudentView(id as StudentView);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLesson = (lessonId: string) => {
    const lesson = getLesson(lessonId);
    setSelectedLessonId(lesson.id);
    setActiveStepId(lesson.steps[0].id);
    setStudentView('lesson');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moveStep = (direction: -1 | 1) => {
    const next = selectedLesson.steps[activeStepIndex + direction];
    if (next) setActiveStepId(next.id);
  };

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'} aria-label="Ana navigasyon">
        <div className="sidebar-brand"><Brand /><button type="button" className="sidebar-close icon-button" onClick={() => setMenuOpen(false)} aria-label={t('close')}><Icon name="close" /></button></div>
        {inLesson ? <>
          <button type="button" className="lesson-back-link" onClick={() => navigate('path')}><Icon name="arrow-right" />{locale === 'tr' ? 'Ders planına dön' : 'Back to course plan'}</button>
          <div className="lesson-side-heading"><span>{locale === 'tr' ? `Ders ${selectedLesson.order} / 28` : `Lesson ${selectedLesson.order} / 28`}</span><strong>{localize(selectedLesson.title, locale)}</strong><small>{selectedLesson.duration} {locale === 'tr' ? 'dakika' : 'minutes'}</small></div>
          <div className="side-progress"><i style={{ width: `${((activeStepIndex + 1) / selectedLesson.steps.length) * 100}%` }} /></div>
          <nav className="lesson-step-nav" aria-label={locale === 'tr' ? 'Ders adımları' : 'Lesson steps'}>
            {selectedLesson.steps.map((step, index) => <button key={step.id} type="button" className={step.id === activeStepId ? 'lesson-step-link active' : 'lesson-step-link'} onClick={() => { setActiveStepId(step.id); setMenuOpen(false); }} aria-current={step.id === activeStepId ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{localize(step.title, locale)}</strong><small>{step.duration} {locale === 'tr' ? 'dk.' : 'min.'}</small></div></button>)}
          </nav>
        </> : <nav>
          {nav.map((item) => <button key={item.id} type="button" className={current === item.id ? 'nav-item active' : 'nav-item'} onClick={() => navigate(item.id)} aria-current={current === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{t(item.label)}</span></button>)}
        </nav>}
        <div className="sidebar-footer">
          <div className="user-chip"><span className="avatar">{session.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{session.displayName}</strong><small>{t(session.role)}</small></span></div>
          <button className="nav-item" type="button" onClick={onSignOut}><Icon name="logout" /><span>{t('logout')}</span></button>
        </div>
      </aside>
      {menuOpen && <button className="scrim" type="button" onClick={() => setMenuOpen(false)} aria-label={t('close')} />}

      <div className="workspace">
        <header className="workspace-header">
          <button type="button" className="menu-button icon-button" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç" aria-expanded={menuOpen}><Icon name="menu" /></button>
          <div className="header-context"><span className="mobile-wordmark">LevelUp<span>.</span></span><span className="desktop-context">{inLesson ? localize(selectedLesson.title, locale) : isAdmin ? t('admin') : t('quickStart')}</span></div>
          <div className="header-actions">
            <span className={online ? 'sync-state online' : 'sync-state offline'}><Icon name={online ? 'wifi' : 'wifi-off'} /><span>{online ? t('online') : t('offline')}</span></span>
            <span className="demo-pill">{t('demo')}</span>
            <button className="language-button" type="button" onClick={onLocale} aria-label={t('language') === 'EN' ? 'Switch to English' : 'Türkçeye geç'}>{t('language')}</button>
          </div>
        </header>
        <main id="main-content" className="workspace-main">
          {isAdmin ? <AdminDashboard t={t} view={adminView} setView={setAdminView} /> : <StudentDashboard t={t} locale={locale} view={studentView} setView={setStudentView} lessonId={selectedLessonId} stepId={activeStepId} onStep={setActiveStepId} onOpenLesson={openLesson} />}
        </main>
      </div>

      {inLesson ? <nav className="lesson-bottom-nav" aria-label={locale === 'tr' ? 'Ders adımı navigasyonu' : 'Lesson step navigation'}><button type="button" onClick={() => moveStep(-1)} disabled={activeStepIndex === 0}><Icon name="arrow-right" /><span>{locale === 'tr' ? 'Önceki' : 'Previous'}</span></button><button type="button" className="lesson-mobile-menu" onClick={() => setMenuOpen(true)}><span>{activeStepIndex + 1} / {selectedLesson.steps.length}</span><strong>{localize(selectedLesson.steps[activeStepIndex].title, locale)}</strong></button><button type="button" onClick={() => moveStep(1)} disabled={activeStepIndex === selectedLesson.steps.length - 1}><span>{locale === 'tr' ? 'Sonraki' : 'Next'}</span><Icon name="arrow-right" /></button></nav> : <nav className="bottom-nav" aria-label="Mobil navigasyon">
        {nav.map((item) => <button key={item.id} type="button" className={current === item.id ? 'active' : ''} onClick={() => navigate(item.id)} aria-current={current === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{t(item.label)}</span></button>)}
      </nav>}
    </div>
  );
}

function StudentDashboard({ t, locale, view, setView, lessonId, stepId, onStep, onOpenLesson }: { t: T; locale: Locale; view: StudentView; setView: (view: StudentView) => void; lessonId: string; stepId: string; onStep: (stepId: string) => void; onOpenLesson: (lessonId: string) => void }) {
  const firstLesson = lessons[0];
  if (view === 'lesson') return <LessonWorkspace locale={locale} lessonId={lessonId} stepId={stepId} onStep={onStep} onBack={() => setView('path')} />;
  if (view === 'path') return <LearningPath t={t} locale={locale} expanded onOpenLesson={onOpenLesson} />;
  if (view === 'assignments') return <SimplePlaceholder icon="clipboard" title={t('assignments')} body={locale === 'tr' ? 'Henüz atanmış bir ödev yok. Eğitmenin tarafından verilen çalışmalar burada tarih, açıklama ve değerlendirme ölçütleriyle görünecek.' : 'There are no assignments yet. Work assigned by your instructor will appear here with its due date, description, and assessment criteria.'} />;
  if (view === 'profile') return <SimplePlaceholder icon="user" title={t('profile')} body={locale === 'tr' ? 'Yeni başlangıç · %0 mastery · 0 XP · çalışma serisi henüz başlamadı' : 'Fresh start · 0% mastery · 0 XP · no study streak yet'} />;

  return (
    <div className="dashboard enter-view">
      <div className="page-intro">
        <div><p className="section-kicker">{t('greeting')}, Deniz</p><h1>{locale === 'tr' ? 'Temeli anlayarak ilk kodunu çalıştır.' : 'Run your first code by understanding the foundation.'}</h1><p>{locale === 'tr' ? 'Sıfırdan başlıyoruz. Her kavram kısa anlatım, canlı uygulama, kontrollü kodlama ve geri çağırma adımlarıyla ilerleyecek.' : 'We are starting from zero. Every concept progresses through a short explanation, live practice, checked coding, and recall.'}</p></div>
        <div className="streak-card"><Icon name="spark" /><span><strong>0</strong><small>{locale === 'tr' ? 'günlük seri' : 'day streak'}</small></span></div>
      </div>

      <section className="focus-card" aria-labelledby="today-title">
        <div className="focus-main">
          <div className="focus-meta"><span className="eyebrow"><Icon name="code" />{t('todayFocus')}</span><span>{locale === 'tr' ? 'Ders 01 / 28' : 'Lesson 01 / 28'}</span></div>
          <h2 id="today-title">{localize(firstLesson.title, locale)}</h2>
          <p>{localize(firstLesson.summary, locale)}</p>
          <div className="lesson-progress" aria-label={locale === 'tr' ? 'Ders ilerlemesi yüzde 0' : 'Lesson progress zero percent'}><span style={{ width: '0%' }} /></div>
          <div className="focus-actions"><button className="button button-primary" type="button" onClick={() => onOpenLesson(firstLesson.id)}>{locale === 'tr' ? 'İlk derse başla' : 'Start the first lesson'}<Icon name="arrow-right" /></button><span>60 {locale === 'tr' ? 'dakika' : 'minutes'}</span></div>
        </div>
        <div className="focus-visual" aria-hidden="true"><div className="mini-editor"><span>void Start()</span><span>Debug.Log("Unity hazır");</span><i /><strong>Console: Unity hazır</strong></div><img src="./images/nova-mascot.webp" width="196" height="235" alt="" /></div>
      </section>

      <div className="metric-grid">
        <article className="metric-card"><span className="metric-icon violet"><Icon name="repeat" /></span><div><p>{t('reviewQueue')}</p><strong>0</strong><small>{locale === 'tr' ? 'İlk tekrar 5. derste açılır' : 'First review unlocks in lesson 5'}</small></div><button type="button" aria-label={t('reviewQueue')}><Icon name="chevron-right" /></button></article>
        <article className="metric-card"><span className="metric-icon coral"><Icon name="gauge" /></span><div><p>{t('mastery')}</p><strong>%0</strong><small>{locale === 'tr' ? 'Henüz ölçüm yok' : 'No measurement yet'}</small></div><div className="ring ring-zero" aria-label="Yüzde 0"><span>0</span></div></article>
      </div>

      <div className="content-grid">
        <LearningPath t={t} locale={locale} onOpenLesson={onOpenLesson} onViewAll={() => setView('path')} />
        <section className="project-card" aria-labelledby="project-title">
          <div className="project-image project-blank"><div><Icon name="project" /><span>UNITY</span></div><b>{locale === 'tr' ? 'Proje alanı' : 'Project space'}</b></div>
          <div className="project-copy"><p className="section-kicker">{locale === 'tr' ? 'Derslerle birlikte' : 'Alongside lessons'}</p><h2 id="project-title">{locale === 'tr' ? 'Kendi oyun projen adım adım oluşacak.' : 'Your own game project will take shape step by step.'}</h2><p>{locale === 'tr' ? 'Proje türü öğrenci hedefi ve ilk tanılama sonucuna göre seçilecek; platform tek bir örnek oyuna bağlı değildir.' : 'The project type will be selected from the learner’s goals and initial assessment; the platform is not tied to one sample game.'}</p><button type="button" className="text-button" onClick={() => setView('path')}>{locale === 'tr' ? '28 derslik planı gör' : 'View the 28-lesson plan'}<Icon name="arrow-right" /></button></div>
        </section>
      </div>
    </div>
  );
}

function LearningPath({ t, locale, expanded = false, onOpenLesson, onViewAll }: { t: T; locale: Locale; expanded?: boolean; onOpenLesson: (lessonId: string) => void; onViewAll?: () => void }) {
  const items = expanded ? coursePlan : coursePlan.slice(0, 5);
  return (
    <section className={expanded ? 'path-panel path-page enter-view' : 'path-panel'} aria-labelledby="path-title">
      <div className="section-heading"><div><p className="section-kicker">{t('quickStart')}</p><h2 id="path-title">{t('learningPath')}</h2></div><span>0 / 28</span></div>
      <p className="section-description">{t('pathDescription')}</p>
      <ol className="path-list">
        {items.map((item) => { const available = item.order <= 5; return <li key={item.order} className={`path-item ${available ? 'ready' : 'locked'}`}><span className="path-node">{available ? String(item.order).padStart(2, '0') : <Icon name="lock" />}</span><div><strong>{localize(item.title, locale)}</strong><small>{locale === 'tr' ? `Modül ${item.module} · ${item.duration} dakika` : `Module ${item.module} · ${item.duration} minutes`}</small></div>{available && <button type="button" onClick={() => onOpenLesson(`lesson-${item.order}`)} aria-label={`${localize(item.title, locale)} dersini aç`}><Icon name="chevron-right" /></button>}</li>; })}
      </ol>
      {!expanded && onViewAll && <button type="button" className="text-button path-all-button" onClick={onViewAll}>{locale === 'tr' ? 'İlk 5 ders hazır · toplam 28 ders' : 'First 5 lessons ready · 28 lessons total'}<Icon name="arrow-right" /></button>}
    </section>
  );
}

function AdminDashboard({ t, view, setView }: { t: T; view: AdminView; setView: (view: AdminView) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let active = true;
    dataGateway.listStudents().then((items) => { if (active) setStudents(items); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const created = (student: Student) => {
    setStudents((items) => [student, ...items]);
    setModalOpen(false);
    setToast(t('created'));
    window.setTimeout(() => setToast(''), 3600);
  };

  if (view === 'content') return <SimplePlaceholder icon="book" title={t('content')} body="Yol şablonları, ders sürümleri ve yayın durumları bu alanda yönetilecek." />;
  if (view === 'reviews') return <SimplePlaceholder icon="clipboard" title={t('reviews')} body="İki proje checkpoint’i eğitmen geri bildirimi bekliyor." />;

  return (
    <div className="dashboard enter-view">
      <div className="page-intro admin-intro"><div><p className="section-kicker">{t('admin')}</p><h1>{t('adminTitle')}</h1><p>{t('adminBody')}</p></div><button className="button button-primary" type="button" onClick={() => setModalOpen(true)}><Icon name="plus" />{t('createStudent')}</button></div>
      <div className="admin-metrics">
        <Metric label={t('activeStudents')} value={String(students.length)} detail="2 yol şablonunda" icon="users" />
        <Metric label={t('pendingReviews')} value="0" detail="Bekleyen çalışma yok" icon="clipboard" tone="coral" />
        <Metric label={t('reviewDebt')} value="0" detail="Tekrar kuyruğu temiz" icon="repeat" tone="green" />
      </div>
      <section className="student-panel" aria-labelledby="students-title">
        <div className="section-heading"><div><p className="section-kicker">{t('overview')}</p><h2 id="students-title">{t('studentsTitle')}</h2><p>{t('studentsBody')}</p></div><button className="text-button" type="button" onClick={() => setView('students')}>{t('students')}<Icon name="arrow-right" /></button></div>
        {loading ? <StudentSkeleton /> : <StudentList students={students} t={t} />}
      </section>
      <section className="admin-insight">
        <div><span className="metric-icon violet"><Icon name="spark" /></span><p className="section-kicker">Eğitmen odağı</p><h2>İlk tanılamadan sonra öğrencinin gerçek ihtiyacını belirle.</h2><p>Henüz değerlendirme verisi yok. İlk ders tamamlandığında kavram bazlı gözlemler ve müdahale önerileri burada oluşacak.</p></div>
        <div className="mastery-bars" aria-label="Kavram mastery dağılımı"><MasteryBar label="Variables" value={0} /><MasteryBar label="Conditionals" value={0} /><MasteryBar label="Unity lifecycle" value={0} /></div>
      </section>
      {modalOpen && <CreateStudentModal t={t} onClose={() => setModalOpen(false)} onCreated={created} />}
      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  );
}

function Metric({ label, value, detail, icon, tone = 'violet' }: { label: string; value: string; detail: string; icon: Parameters<typeof Icon>[0]['name']; tone?: string }) {
  return <article className="admin-metric"><span className={`metric-icon ${tone}`}><Icon name={icon} /></span><div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
}

function StudentList({ students, t }: { students: Student[]; t: T }) {
  return (
    <div className="student-list">
      <div className="student-row student-row-head" aria-hidden="true"><span>{t('name')}</span><span>{t('pathLabel')}</span><span>{t('mastery')}</span><span>{t('next')}</span><span /></div>
      {students.map((student) => (
        <article className="student-row" key={student.id}>
          <div className="student-identity"><span className="avatar">{student.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{student.displayName}</strong><small>{student.email}</small></span></div>
          <div><span className="mobile-label">{t('pathLabel')}</span><strong>{student.path}</strong><small>{t(student.pace)}</small></div>
          <div><span className="mobile-label">{t('mastery')}</span><div className="table-progress"><span style={{ width: `${student.mastery}%` }} /></div><small>%{student.mastery}</small></div>
          <div><span className="mobile-label">{t('next')}</span><strong>{student.nextLesson}</strong><small className="status-dot">{t(student.status)}</small></div>
          <button type="button" className="icon-button" aria-label={`${student.displayName} detaylarını aç`}><Icon name="chevron-right" /></button>
        </article>
      ))}
    </div>
  );
}

function StudentSkeleton() {
  return <div className="student-skeleton" aria-label="Öğrenciler yükleniyor"><i /><i /><i /></div>;
}

function CreateStudentModal({ t, onClose, onCreated }: { t: T; onClose: () => void; onCreated: (student: Student) => void }) {
  const [input, setInput] = useState<CreateStudentInput>({ displayName: '', email: '', temporaryPassword: '', path: 'Hızlı Başlangıç: Unity & C#', pace: 'accelerated' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (input.displayName.trim().length < 3 || !input.email.includes('@') || input.temporaryPassword.length < 8) {
      setError(t('formRequired'));
      return;
    }
    setSubmitting(true);
    setError('');
    try { onCreated(await dataGateway.createStudent(input)); }
    catch (reason) { setError(reason instanceof Error && reason.message === 'EMAIL_EXISTS' ? t('emailExists') : t('formRequired')); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-scrim" type="button" onClick={onClose} aria-label={t('close')} />
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header><div><p className="section-kicker">{t('admin')}</p><h2 id="create-title">{t('createStudentTitle')}</h2><p>{t('createStudentBody')}</p></div><button className="icon-button" type="button" onClick={onClose} aria-label={t('close')}><Icon name="close" /></button></header>
        {error && <div ref={errorRef} className="error-summary" role="alert" tabIndex={-1}>{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div><label htmlFor="student-name">{t('name')} *</label><input ref={nameInputRef} id="student-name" autoComplete="name" value={input.displayName} onChange={(event) => setInput({ ...input, displayName: event.target.value })} required /></div>
            <div><label htmlFor="student-email">{t('email')} *</label><input id="student-email" type="email" autoComplete="off" value={input.email} onChange={(event) => setInput({ ...input, email: event.target.value })} required /></div>
            <div><label htmlFor="student-password">{t('temporaryPassword')} *</label><input id="student-password" type="password" autoComplete="new-password" minLength={8} value={input.temporaryPassword} onChange={(event) => setInput({ ...input, temporaryPassword: event.target.value })} required /><small>En az 8 karakter</small></div>
            <div><label htmlFor="student-pace">{t('pace')}</label><select id="student-pace" value={input.pace} onChange={(event) => setInput({ ...input, pace: event.target.value as Student['pace'] })}><option value="accelerated">{t('accelerated')}</option><option value="balanced">{t('balanced')}</option></select></div>
          </div>
          <label htmlFor="student-path">{t('pathLabel')}</label><select id="student-path" value={input.path} onChange={(event) => setInput({ ...input, path: event.target.value })}><option>Hızlı Başlangıç: Unity & C#</option><option>Temelden Mobil Oyun Geliştirme</option></select>
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>{t('close')}</button><button type="submit" className="button button-primary" disabled={submitting}>{submitting && <span className="spinner" />}{submitting ? t('creating') : t('create')}</button></div>
        </form>
      </section>
    </div>
  );
}

function LessonWorkspace({ locale, lessonId, stepId, onStep, onBack }: { locale: Locale; lessonId: string; stepId: string; onStep: (stepId: string) => void; onBack: () => void }) {
  const lesson = getLesson(lessonId);
  const activeStepIndex = Math.max(0, lesson.steps.findIndex((step) => step.id === stepId));
  const activeStep = lesson.steps[activeStepIndex];
  const [checking, setChecking] = useState(false);
  type StepWorkspace = { files: CodeFile[]; activeFileId: string; results: CodeDiagnostic[] | null };
  const makeWorkspace = (targetStepId: string): StepWorkspace => {
    const id = `${lesson.id}-${targetStepId}-primary`;
    return { files: [{ id, name: lesson.fileName, content: '' }], activeFileId: id, results: null };
  };
  const makeLessonWorkspaces = () => Object.fromEntries(lesson.steps.map((step) => [step.id, makeWorkspace(step.id)]));
  const [workspaces, setWorkspaces] = useState<Record<string, StepWorkspace>>(makeLessonWorkspaces);
  const workspace = workspaces[activeStep.id] ?? makeWorkspace(activeStep.id);

  useEffect(() => {
    setWorkspaces(makeLessonWorkspaces());
    setChecking(false);
  }, [lesson.id]);

  const updateWorkspace = (update: (current: StepWorkspace) => StepWorkspace) => {
    setWorkspaces((current) => ({ ...current, [activeStep.id]: update(current[activeStep.id] ?? makeWorkspace(activeStep.id)) }));
  };

  const runChecks = async () => {
    setChecking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 460));
    const current = workspaces[activeStep.id] ?? makeWorkspace(activeStep.id);
    const primary = current.files[0];
    const results = [
      ...validateLessonCode(lesson.id, primary.content, activeStep.id, primary.name),
      ...current.files.slice(1).flatMap((file) => validateCSharpSyntax(file.content, file.name)),
    ];
    updateWorkspace((value) => ({ ...value, results }));
    setChecking(false);
  };
  const passed = Boolean(workspace.results?.some((result) => result.severity === 'success')) && !workspace.results?.some((result) => result.severity === 'error');
  const progress = ((activeStepIndex + 1) / lesson.steps.length) * 100;

  return (
    <div className="lesson-page enter-view">
      <button className="back-button" type="button" onClick={onBack}><Icon name="arrow-right" />{locale === 'tr' ? 'Ders planına dön' : 'Back to course plan'}</button>
      <div className="lesson-heading"><div><p className="section-kicker">{locale === 'tr' ? `Ders ${lesson.order} / 28 · Uygulama alanı` : `Lesson ${lesson.order} / 28 · Practice workspace`}</p><h1>{localize(lesson.title, locale)}</h1><p>{localize(lesson.summary, locale)}</p></div><div className="lesson-duration"><strong>{lesson.duration}</strong><small>{locale === 'tr' ? 'dakika' : 'minutes'}</small></div></div>
      <div className="lesson-stage-progress"><span><strong>{String(activeStepIndex + 1).padStart(2, '0')}</strong> / {String(lesson.steps.length).padStart(2, '0')}</span><div><i style={{ width: `${progress}%` }} /></div><small>{localize(activeStep.title, locale)}</small></div>
      <div className="lesson-workbench">
        <aside className="lesson-guidance">
          <section className="lesson-step-card"><div className={`step-kind ${activeStep.kind}`}><Icon name={activeStep.kind === 'practice' ? 'code' : activeStep.kind === 'reflect' ? 'repeat' : 'book'} /><span>{activeStep.duration} {locale === 'tr' ? 'dakika' : 'minutes'}</span></div><p className="section-kicker">{locale === 'tr' ? 'Şu anki adım' : 'Current step'}</p><h2>{localize(activeStep.title, locale)}</h2><p>{localize(activeStep.description, locale)}</p><ul>{localize(activeStep.bullets, locale).map((bullet) => <li key={bullet}><Icon name="check" /><span>{bullet}</span></li>)}</ul>{activeStep.details && <div className="lesson-detail-list">{localize(activeStep.details, locale).map((detail) => <article key={detail.title}><strong>{detail.title}</strong><TechnicalText text={detail.body} /></article>)}</div>}</section>
          <section className="lesson-task-card"><p className="section-kicker">{locale === 'tr' ? 'Bu adımdaki kod görevi' : 'Coding task for this step'}</p><h3>{localize(activeStep.editorTitle ?? activeStep.title, locale)}</h3><TechnicalText text={localize(activeStep.editorTask ?? activeStep.description, locale)} /><div className="from-scratch-note"><Icon name="code" /><span>{locale === 'tr' ? 'Dosya bilinçli olarak boş açılır. Hazır iskeleti kopyalamadan, yapıyı adım adım sen kurarsın.' : 'The file deliberately opens blank. You build it step by step without copying a prepared skeleton.'}</span></div><div className="concept-tags">{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></section>
          {passed && <div className="lesson-success"><Icon name="check" /><p>{localize(lesson.successMessage, locale)}</p></div>}
        </aside>
        <CodeEditor locale={locale} files={workspace.files} activeFileId={workspace.activeFileId} diagnostics={workspace.results} checking={checking} onSelectFile={(fileId) => updateWorkspace((value) => ({ ...value, activeFileId: fileId }))} onAddFile={() => updateWorkspace((value) => { const used = new Set(value.files.map((file) => file.name)); let number = 1; let name = 'NewScript.cs'; while (used.has(name)) { number += 1; name = `NewScript${number}.cs`; } const file = { id: `${activeStep.id}-${crypto.randomUUID()}`, name, content: '' }; return { ...value, files: [...value.files, file], activeFileId: file.id, results: null }; })} onChange={(fileId, content) => updateWorkspace((value) => ({ ...value, files: value.files.map((file) => file.id === fileId ? { ...file, content } : file), results: null }))} onRun={runChecks} onReset={() => setWorkspaces((current) => ({ ...current, [activeStep.id]: makeWorkspace(activeStep.id) }))} />
      </div>
      <div className="lesson-step-actions"><button className="button button-secondary" type="button" disabled={activeStepIndex === 0} onClick={() => onStep(lesson.steps[activeStepIndex - 1].id)}><Icon name="arrow-right" />{locale === 'tr' ? 'Önceki adım' : 'Previous step'}</button><span>{activeStepIndex + 1} / {lesson.steps.length}</span><button className="button button-primary" type="button" disabled={activeStepIndex === lesson.steps.length - 1} onClick={() => onStep(lesson.steps[activeStepIndex + 1].id)}>{locale === 'tr' ? 'Sonraki adım' : 'Next step'}<Icon name="arrow-right" /></button></div>
    </div>
  );
}

function MasteryBar({ label, value }: { label: string; value: number }) {
  return <div><span><strong>{label}</strong><small>%{value}</small></span><div><i style={{ width: `${value}%` }} /></div></div>;
}

function SimplePlaceholder({ icon, title, body }: { icon: Parameters<typeof Icon>[0]['name']; title: string; body: string }) {
  return <section className="placeholder-page enter-view"><span className="metric-icon violet"><Icon name={icon} /></span><h1>{title}</h1><p>{body}</p><small>Bu yüzey sonraki dikey dilimde gerçek veri akışıyla tamamlanacak.</small></section>;
}

function TechnicalText({ text }: { text: string }) {
  return <span className="technical-text">{text.split('`').map((part, index) => index % 2 ? <code key={`${part}-${index}`}>{part}</code> : part)}</span>;
}
