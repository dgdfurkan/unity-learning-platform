import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { CreateStudentInput, Locale, SessionUser, Student } from '../domain/models';
import { dataGateway } from '../services/demoGateway';
import { Icon } from '../shared/Icon';
import { type MessageKey, translate } from '../shared/i18n';

type T = (key: MessageKey) => string;
type StudentView = 'home' | 'path' | 'assignments' | 'profile' | 'lesson';
type AdminView = 'overview' | 'students' | 'content' | 'reviews';

const starterCode = `public class CargoStation : MonoBehaviour
{
    // Değişkenleri burada tanımla

    void Start()
    {
        // Değerleri Console'a yazdır
    }
}`;

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
            <div className="window-bar"><i /><i /><i /><span>CargoStation.cs</span></div>
            <pre><span className="code-violet">private bool</span> isRunning = <span className="code-coral">true</span>;{`\n`}<span className="code-violet">private int</span> packageCount = <span className="code-coral">4</span>;{`\n\n`}<span className="code-muted">// Sonucu gör, nedenini açıkla.</span>{`\n`}Debug.Log(packageCount);</pre>
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

function WorkspaceShell({ session, t, onLocale, online, onSignOut }: { session: SessionUser; t: T; onLocale: () => void; online: boolean; onSignOut: () => Promise<void> }) {
  const [studentView, setStudentView] = useState<StudentView>('home');
  const [adminView, setAdminView] = useState<AdminView>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = session.role === 'admin';

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

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'} aria-label="Ana navigasyon">
        <div className="sidebar-brand"><Brand /><button type="button" className="sidebar-close icon-button" onClick={() => setMenuOpen(false)} aria-label={t('close')}><Icon name="close" /></button></div>
        <nav>
          {nav.map((item) => (
            <button key={item.id} type="button" className={current === item.id ? 'nav-item active' : 'nav-item'} onClick={() => navigate(item.id)} aria-current={current === item.id ? 'page' : undefined}>
              <Icon name={item.icon} /><span>{t(item.label)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip"><span className="avatar">{session.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{session.displayName}</strong><small>{t(session.role)}</small></span></div>
          <button className="nav-item" type="button" onClick={onSignOut}><Icon name="logout" /><span>{t('logout')}</span></button>
        </div>
      </aside>
      {menuOpen && <button className="scrim" type="button" onClick={() => setMenuOpen(false)} aria-label={t('close')} />}

      <div className="workspace">
        <header className="workspace-header">
          <button type="button" className="menu-button icon-button" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç" aria-expanded={menuOpen}><Icon name="menu" /></button>
          <div className="header-context"><span className="mobile-wordmark">LevelUp<span>.</span></span><span className="desktop-context">{isAdmin ? t('admin') : t('quickStart')}</span></div>
          <div className="header-actions">
            <span className={online ? 'sync-state online' : 'sync-state offline'}><Icon name={online ? 'wifi' : 'wifi-off'} /><span>{online ? t('online') : t('offline')}</span></span>
            <span className="demo-pill">{t('demo')}</span>
            <button className="language-button" type="button" onClick={onLocale} aria-label={t('language') === 'EN' ? 'Switch to English' : 'Türkçeye geç'}>{t('language')}</button>
          </div>
        </header>
        <main id="main-content" className="workspace-main">
          {isAdmin ? <AdminDashboard t={t} view={adminView} setView={setAdminView} /> : <StudentDashboard t={t} view={studentView} setView={setStudentView} />}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Mobil navigasyon">
        {nav.map((item) => (
          <button key={item.id} type="button" className={current === item.id ? 'active' : ''} onClick={() => navigate(item.id)} aria-current={current === item.id ? 'page' : undefined}>
            <Icon name={item.icon} /><span>{t(item.label)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function StudentDashboard({ t, view, setView }: { t: T; view: StudentView; setView: (view: StudentView) => void }) {
  if (view === 'lesson') return <LessonWorkspace t={t} onBack={() => setView('home')} />;
  if (view === 'path') return <LearningPath t={t} expanded />;
  if (view === 'assignments') return <SimplePlaceholder icon="clipboard" title={t('assignments')} body="Cargo Idle checkpoint’i Cuma 18.00’e kadar hazır." />;
  if (view === 'profile') return <SimplePlaceholder icon="user" title={t('profile')} body="Mastery %38 · 740 XP · 4 günlük çalışma serisi" />;

  return (
    <div className="dashboard enter-view">
      <div className="page-intro">
        <div><p className="section-kicker">{t('greeting')}, Deniz</p><h1>Bugün bir sistemi gerçekten çalıştır.</h1><p>Kısa bir C# pratiğiyle başla; ardından aynı mantığı Cargo Idle projesindeki istasyona taşı.</p></div>
        <div className="streak-card"><Icon name="spark" /><span><strong>4</strong><small>günlük seri</small></span></div>
      </div>

      <section className="focus-card" aria-labelledby="today-title">
        <div className="focus-main">
          <div className="focus-meta"><span className="eyebrow"><Icon name="code" />{t('todayFocus')}</span><span>{t('session')}</span></div>
          <h2 id="today-title">{t('lessonTitle')}</h2>
          <TechnicalText text={t('lessonDescription')} />
          <div className="lesson-progress" aria-label="Ders ilerlemesi yüzde 35"><span style={{ width: '35%' }} /></div>
          <div className="focus-actions"><button className="button button-primary" type="button" onClick={() => setView('lesson')}>{t('continueLesson')}<Icon name="arrow-right" /></button><span>{t('minutes')}</span></div>
        </div>
        <div className="focus-visual" aria-hidden="true"><div className="mini-editor"><span>bool isRunning = true;</span><span>int packageCount = 4;</span><i /><strong>Console: 4 paket</strong></div><img src="./images/nova-mascot.webp" width="196" height="235" alt="" /></div>
      </section>

      <div className="metric-grid">
        <article className="metric-card"><span className="metric-icon violet"><Icon name="repeat" /></span><div><p>{t('reviewQueue')}</p><strong>3</strong><small>{t('reviewCount')}</small></div><button type="button" aria-label={t('reviewQueue')}><Icon name="chevron-right" /></button></article>
        <article className="metric-card"><span className="metric-icon coral"><Icon name="gauge" /></span><div><p>{t('mastery')}</p><strong>%38</strong><small>+%6 {t('weekly').toLocaleLowerCase('tr')}</small></div><div className="ring" aria-label="Yüzde 38"><span>38</span></div></article>
      </div>

      <div className="content-grid">
        <LearningPath t={t} />
        <section className="project-card" aria-labelledby="project-title">
          <div className="project-image"><img src="./images/cargo-idle-project.webp" alt="Unity Editor içinde Cargo Idle kargo deposu projesi" width="1280" height="862" loading="lazy" /><span>{t('project')}</span></div>
          <div className="project-copy"><p className="section-kicker">Checkpoint 02</p><h2 id="project-title">{t('projectTitle')}</h2><p>{t('projectDescription')}</p><button type="button" className="text-button">{t('openProject')}<Icon name="arrow-right" /></button></div>
        </section>
      </div>
    </div>
  );
}

const pathItems = [
  { title: 'Tanılama, Git ve proje düzeni', state: 'completed' as const, number: '01' },
  { title: 'Değişkenlerden oyun durumuna', state: 'inProgress' as const, number: '02' },
  { title: 'Koşullar ve üretim kararları', state: 'ready' as const, number: '03' },
  { title: 'Transform, zaman ve hareket', state: 'locked' as const, number: '04' },
  { title: 'İlk geri çağırma oturumu', state: 'review' as const, number: 'R1' },
];

function LearningPath({ t, expanded = false }: { t: T; expanded?: boolean }) {
  return (
    <section className={expanded ? 'path-panel path-page enter-view' : 'path-panel'} aria-labelledby="path-title">
      <div className="section-heading"><div><p className="section-kicker">{t('quickStart')}</p><h2 id="path-title">{t('learningPath')}</h2></div><span>4 / 28</span></div>
      <p className="section-description">{t('pathDescription')}</p>
      <ol className="path-list">
        {pathItems.map((item) => <li key={item.number} className={`path-item ${item.state}`}><span className="path-node">{item.state === 'completed' ? <Icon name="check" /> : item.state === 'locked' ? <Icon name="lock" /> : item.number}</span><div><strong>{item.title}</strong><small>{t(item.state)}</small></div>{item.state !== 'locked' && <button type="button" aria-label={`${item.title} dersini aç`}><Icon name="chevron-right" /></button>}</li>)}
      </ol>
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
        <Metric label={t('pendingReviews')} value="2" detail="En eskisi 18 saat" icon="clipboard" tone="coral" />
        <Metric label={t('reviewDebt')} value="7" detail="3 öğrenciye dağılıyor" icon="repeat" tone="green" />
      </div>
      <section className="student-panel" aria-labelledby="students-title">
        <div className="section-heading"><div><p className="section-kicker">{t('overview')}</p><h2 id="students-title">{t('studentsTitle')}</h2><p>{t('studentsBody')}</p></div><button className="text-button" type="button" onClick={() => setView('students')}>{t('students')}<Icon name="arrow-right" /></button></div>
        {loading ? <StudentSkeleton /> : <StudentList students={students} t={t} />}
      </section>
      <section className="admin-insight">
        <div><span className="metric-icon violet"><Icon name="spark" /></span><p className="section-kicker">Eğitmen odağı</p><h2>Bir sonraki canlı derste <code>if</code> koşulunu oyun durumuna bağla.</h2><p>Deniz değişken tanımlarını tamamlıyor; ancak kodun hangi durumda çalışacağını açıklarken yardıma ihtiyaç duyuyor.</p></div>
        <div className="mastery-bars" aria-label="Kavram mastery dağılımı"><MasteryBar label="Variables" value={72} /><MasteryBar label="Conditionals" value={41} /><MasteryBar label="Unity lifecycle" value={24} /></div>
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

function LessonWorkspace({ t, onBack }: { t: T; onBack: () => void }) {
  const [code, setCode] = useState(starterCode);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<{ label: string; passed: boolean; hint: string }[] | null>(null);

  const runChecks = async () => {
    setChecking(true);
    await new Promise((resolve) => window.setTimeout(resolve, 460));
    const normalized = code.replace(/\s+/g, ' ');
    setResults([
      { label: '`isRunning` bir `bool` değeridir', passed: /bool\s+isRunning\s*=\s*true\s*;/.test(code), hint: '`bool isRunning = true;` biçimini dene.' },
      { label: '`packageCount` bir `int` değeridir', passed: /int\s+packageCount\s*=\s*4\s*;/.test(code), hint: 'Paket sayısı için tam sayı türü olan `int` gerekir.' },
      { label: '`stationName` bir `string` değeridir', passed: /string\s+stationName\s*=\s*"[^"]+"\s*;/.test(code), hint: 'Metin değerini çift tırnak içinde tanımla.' },
      { label: 'Değerlerden biri `Debug.Log` ile yazdırılır', passed: /Debug\.Log\s*\([^)]+\)\s*;/.test(normalized), hint: '`Start` içinde `Debug.Log(packageCount);` kullanabilirsin.' },
    ]);
    setChecking(false);
  };
  const passed = results?.every((result) => result.passed);

  return (
    <div className="lesson-page enter-view">
      <button className="back-button" type="button" onClick={onBack}><Icon name="arrow-right" />{t('reset')}</button>
      <div className="lesson-heading"><div><p className="section-kicker">{t('session')} · {t('lessonWorkspace')}</p><h1>{t('lessonTitle')}</h1><p>{t('lessonLead')}</p></div><div className="lesson-score"><span>+40</span><small>XP</small></div></div>
      <div className="lesson-layout">
        <aside className="task-panel"><span className="metric-icon coral"><Icon name="code" /></span><p className="section-kicker">{t('task')}</p><h2>Bir üretim istasyonunun durumunu tanımla.</h2><TechnicalText text={t('taskBody')} /><div className="concept-tags"><span>bool</span><span>int</span><span>string</span><span>Debug.Log</span></div></aside>
        <section className="editor-panel" aria-label="C sharp kod editörü">
          <div className="editor-toolbar"><span>CargoStation.cs</span><small>Basit doğrulayıcı</small></div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} aria-label="C sharp kodu" />
          <div className="editor-actions"><button type="button" className="button button-primary" onClick={runChecks} disabled={checking}>{checking && <span className="spinner" />}{checking ? t('checking') : t('checkCode')}<Icon name="arrow-right" /></button></div>
        </section>
        <aside className="results-panel" aria-live="polite"><div className="section-heading"><div><p className="section-kicker">{t('tests')}</p><h2>{results ? `${results.filter((item) => item.passed).length} / ${results.length}` : '—'}</h2></div></div>
          {!results ? <div className="empty-result"><Icon name="clipboard" /><p>Kodunu çalıştırmadan önce ne beklediğini tahmin et.</p></div> : <><div className={passed ? 'result-summary passed' : 'result-summary'}><Icon name={passed ? 'check' : 'code'} /><p>{passed ? t('passed') : t('needsWork')}</p></div><ul className="test-list">{results.map((result) => <li key={result.label} className={result.passed ? 'passed' : 'failed'}><span><Icon name={result.passed ? 'check' : 'close'} /></span><div><strong><TechnicalText text={result.label} /></strong>{!result.passed && <small><TechnicalText text={result.hint} /></small>}</div></li>)}</ul></>}
        </aside>
      </div>
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
