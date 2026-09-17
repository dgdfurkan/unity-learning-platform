import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { FoundationActivity } from '../components/FoundationActivity';
import { LessonFinale } from '../components/LessonFinale';
import type { CreateStudentInput, Locale, SessionUser, Student } from '../domain/models';
import { coursePlan, getLesson, lessonIdForOrder, lessons, localize } from '../learning/course';
import { awardStep, courseCompletion, loadProgress, type LearningProgress } from '../learning/progress';
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
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [activeStepId, setActiveStepId] = useState(lessons[0].steps[0].id);
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);
  const [awardPulse, setAwardPulse] = useState<{ xp: number; title: string; streak: boolean } | null>(null);
  const scrollGlowTimer = useRef<number | null>(null);
  const scrollFallbackTimer = useRef<number | null>(null);
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

  const scrollToLearningTop = () => {
    if (scrollGlowTimer.current !== null) window.clearTimeout(scrollGlowTimer.current);
    if (scrollFallbackTimer.current !== null) window.clearTimeout(scrollFallbackTimer.current);
    document.documentElement.classList.remove('learning-scroll');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('learning-scroll');

    const scroller = document.scrollingElement ?? document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';
    scroller.scrollTo({ top: 0, behavior });
    window.scrollTo({ top: 0, behavior });

    scrollFallbackTimer.current = window.setTimeout(() => {
      const scrollSurface = scroller as HTMLElement;
      const previousBehavior = scrollSurface.style.scrollBehavior;
      scrollSurface.style.scrollBehavior = 'auto';
      scroller.scrollTo({ top: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelector<HTMLElement>('[data-lesson-top]')?.focus({ preventScroll: true });
      requestAnimationFrame(() => { scrollSurface.style.scrollBehavior = previousBehavior; });
      scrollFallbackTimer.current = null;
    }, reduceMotion ? 0 : 640);
    scrollGlowTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove('learning-scroll');
      scrollGlowTimer.current = null;
    }, 700);
  };

  const selectStep = (stepId: string) => {
    if (stepId === activeStepId) return;
    setActiveStepId(stepId);
    setMenuOpen(false);
    scrollToLearningTop();
  };

  const openLesson = (lessonId: string) => {
    const lesson = getLesson(lessonId);
    const completed = new Set(progress.completedSteps[lesson.id] ?? []);
    const resumeStep = lesson.steps.find((step) => !completed.has(step.id)) ?? lesson.steps[lesson.steps.length - 1];
    setSelectedLessonId(lesson.id);
    setActiveStepId(resumeStep.id);
    setStudentView('lesson');
    setMenuOpen(false);
    scrollToLearningTop();
  };

  useEffect(() => {
    if (!inLesson) return;
    const afterCommit = window.setTimeout(scrollToLearningTop, 0);
    return () => window.clearTimeout(afterCommit);
  }, [activeStepId, selectedLessonId, inLesson]);

  useEffect(() => () => {
    if (scrollGlowTimer.current !== null) window.clearTimeout(scrollGlowTimer.current);
    if (scrollFallbackTimer.current !== null) window.clearTimeout(scrollFallbackTimer.current);
  }, []);

  const moveStep = (direction: -1 | 1) => {
    if (direction === 1 && !(progress.completedSteps[selectedLesson.id] ?? []).includes(selectedLesson.steps[activeStepIndex].id)) return;
    const next = selectedLesson.steps[activeStepIndex + direction];
    if (next) selectStep(next.id);
  };

  const completeStep = (lessonId: string, stepId: string) => {
    const lesson = getLesson(lessonId);
    const stepIndex = lesson.steps.findIndex((step) => step.id === stepId);
    const step = lesson.steps[stepIndex];
    if (!step) return;
    setProgress((current) => {
      const result = awardStep(current, lessonId, step, stepIndex === lesson.steps.length - 1);
      if (result.firstCompletion) {
        setAwardPulse({ xp: result.awarded, title: localize(step.title, locale), streak: result.streakAdvanced });
        window.setTimeout(() => setAwardPulse(null), 2400);
      }
      return result.progress;
    });
  };

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'} aria-label="Ana navigasyon">
        <div className="sidebar-brand"><Brand /><button type="button" className="sidebar-close icon-button" onClick={() => setMenuOpen(false)} aria-label={t('close')}><Icon name="close" /></button></div>
        {inLesson ? <>
          <button type="button" className="lesson-back-link" onClick={() => navigate('path')}><Icon name="arrow-right" />{locale === 'tr' ? 'Ders planına dön' : 'Back to course plan'}</button>
          <div className="lesson-side-heading"><span>{locale === 'tr' ? `Ders ${selectedLesson.order} / ${coursePlan.length}` : `Lesson ${selectedLesson.order} / ${coursePlan.length}`}</span><strong>{localize(selectedLesson.title, locale)}</strong><small>{selectedLesson.steps.length} {locale === 'tr' ? 'öğrenme durağı' : 'learning stops'}</small></div>
          <div className="side-progress"><i style={{ width: `${((activeStepIndex + 1) / selectedLesson.steps.length) * 100}%` }} /></div>
          <nav className="lesson-step-nav" aria-label={locale === 'tr' ? 'Ders adımları' : 'Lesson steps'}>
            {selectedLesson.steps.map((step, index) => { const done = (progress.completedSteps[selectedLesson.id] ?? []).includes(step.id); const previousDone = index === 0 || (progress.completedSteps[selectedLesson.id] ?? []).includes(selectedLesson.steps[index - 1].id); const accessible = previousDone || done || step.id === activeStepId; return <button key={step.id} type="button" disabled={!accessible} className={`${step.id === activeStepId ? 'lesson-step-link active' : 'lesson-step-link'}${done ? ' completed' : ''}${!accessible ? ' locked' : ''}`} onClick={() => selectStep(step.id)} aria-current={step.id === activeStepId ? 'step' : undefined}><span>{done ? <Icon name="check" /> : accessible ? String(index + 1).padStart(2, '0') : <Icon name="lock" />}</span><div><strong>{localize(step.title, locale)}</strong><small>{done ? (locale === 'tr' ? 'Tamamlandı' : 'Completed') : accessible ? `${step.xp} XP` : (locale === 'tr' ? 'Önceki durağı tamamla' : 'Complete previous stop')}</small></div></button>; })}
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
            {!isAdmin && <div className="progress-hud"><span><Icon name="spark" /><b>{progress.xp}</b><small>XP</small></span><span><Icon name="repeat" /><b>{progress.streak}</b><small>{locale === 'tr' ? 'seri' : 'streak'}</small></span></div>}
            <span className={online ? 'sync-state online' : 'sync-state offline'}><Icon name={online ? 'wifi' : 'wifi-off'} /><span>{online ? t('online') : t('offline')}</span></span>
            <span className="demo-pill">{t('demo')}</span>
            <button className="language-button" type="button" onClick={onLocale} aria-label={t('language') === 'EN' ? 'Switch to English' : 'Türkçeye geç'}>{t('language')}</button>
          </div>
        </header>
        <main id="main-content" className="workspace-main">
          {isAdmin ? <AdminDashboard t={t} view={adminView} setView={setAdminView} /> : <StudentDashboard t={t} locale={locale} view={studentView} setView={(nextView) => navigate(nextView)} lessonId={selectedLessonId} stepId={activeStepId} onStep={selectStep} onOpenLesson={openLesson} progress={progress} onCompleteStep={completeStep} />}
        </main>
      </div>

      {inLesson ? <nav className="lesson-bottom-nav" aria-label={locale === 'tr' ? 'Ders adımı navigasyonu' : 'Lesson step navigation'}><button type="button" onClick={() => moveStep(-1)} disabled={activeStepIndex === 0}><Icon name="arrow-right" /><span>{locale === 'tr' ? 'Önceki' : 'Previous'}</span></button><button type="button" className="lesson-mobile-menu" onClick={() => setMenuOpen(true)}><span>{activeStepIndex + 1} / {selectedLesson.steps.length}</span><strong>{localize(selectedLesson.steps[activeStepIndex].title, locale)}</strong></button><button type="button" onClick={() => moveStep(1)} disabled={activeStepIndex === selectedLesson.steps.length - 1 || !(progress.completedSteps[selectedLesson.id] ?? []).includes(selectedLesson.steps[activeStepIndex].id)}><span>{locale === 'tr' ? 'Sonraki' : 'Next'}</span><Icon name="arrow-right" /></button></nav> : <nav className="bottom-nav" aria-label="Mobil navigasyon">
        {nav.map((item) => <button key={item.id} type="button" className={current === item.id ? 'active' : ''} onClick={() => navigate(item.id)} aria-current={current === item.id ? 'page' : undefined}><Icon name={item.icon} /><span>{t(item.label)}</span></button>)}
      </nav>}
      {awardPulse && <div className="xp-burst" role="status"><div className="xp-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div><span><Icon name="spark" /></span><div><small>{awardPulse.streak ? (locale === 'tr' ? 'Seri başladı · adım tamamlandı' : 'Streak started · step complete') : (locale === 'tr' ? 'Adım tamamlandı' : 'Step complete')}</small><strong>+{awardPulse.xp} XP</strong><p>{awardPulse.title}</p></div></div>}
    </div>
  );
}

function StudentDashboard({ t, locale, view, setView, lessonId, stepId, onStep, onOpenLesson, progress, onCompleteStep }: { t: T; locale: Locale; view: StudentView; setView: (view: StudentView) => void; lessonId: string; stepId: string; onStep: (stepId: string) => void; onOpenLesson: (lessonId: string) => void; progress: LearningProgress; onCompleteStep: (lessonId: string, stepId: string) => void }) {
  const firstLesson = lessons[0];
  if (view === 'lesson') return <LessonWorkspace locale={locale} lessonId={lessonId} stepId={stepId} onStep={onStep} onBack={() => setView('path')} progress={progress} onCompleteStep={onCompleteStep} />;
  if (view === 'path') return <LearningPath t={t} locale={locale} expanded onOpenLesson={onOpenLesson} progress={progress} />;
  if (view === 'assignments') return <SimplePlaceholder icon="clipboard" title={t('assignments')} body={locale === 'tr' ? 'Henüz atanmış bir ödev yok. Eğitmenin tarafından verilen çalışmalar burada tarih, açıklama ve değerlendirme ölçütleriyle görünecek.' : 'There are no assignments yet. Work assigned by your instructor will appear here with its due date, description, and assessment criteria.'} />;
  if (view === 'profile') return <SimplePlaceholder icon="user" title={t('profile')} body={locale === 'tr' ? `%${courseCompletion(progress, coursePlan.length)} ilerleme · ${progress.xp} XP · ${progress.streak} günlük seri · ${progress.completedLessons.length} tamamlanan ders` : `${courseCompletion(progress, coursePlan.length)}% progress · ${progress.xp} XP · ${progress.streak}-day streak · ${progress.completedLessons.length} completed lessons`} />;

  return (
    <div className="dashboard enter-view">
      <div className="page-intro">
        <div><p className="section-kicker">{t('greeting')}, Deniz</p><h1>{locale === 'tr' ? 'Sıfırdan başlayıp oyunların nasıl çalıştığını gerçekten anla.' : 'Start from zero and truly understand how games work.'}</h1><p>{locale === 'tr' ? 'Kod yazmadan önce bilgisayarın, dosyaların, projelerin ve Unity’nin temel parçalarını kuruyoruz. Her yeni kavram; ayrıntılı anlatım, görsel keşif, kontrollü deneme, mini oyun ve açıklamalı tekrarlarla ilerliyor.' : 'Before writing code, we build a clear model of computers, files, projects, and Unity. Every new concept unfolds through detailed teaching, visual exploration, guided practice, mini-games, and explained review.'}</p></div>
        <div className="streak-card"><Icon name="spark" /><span><strong>{progress.streak}</strong><small>{locale === 'tr' ? 'günlük seri' : 'day streak'}</small></span></div>
      </div>

      <section className="focus-card" aria-labelledby="today-title">
        <div className="focus-main">
          <div className="focus-meta"><span className="eyebrow"><Icon name="spark" />{t('todayFocus')}</span><span>{locale === 'tr' ? `Ders 01 / ${coursePlan.length}` : `Lesson 01 / ${coursePlan.length}`}</span></div>
          <h2 id="today-title">{localize(firstLesson.title, locale)}</h2>
          <p>{localize(firstLesson.summary, locale)}</p>
          <div className="lesson-progress" aria-label={locale === 'tr' ? 'Ders ilerlemesi' : 'Lesson progress'}><span style={{ width: `${((progress.completedSteps[firstLesson.id]?.length ?? 0) / firstLesson.steps.length) * 100}%` }} /></div>
          <div className="focus-actions"><button className="button button-primary" type="button" onClick={() => onOpenLesson(firstLesson.id)}>{(progress.completedSteps[firstLesson.id]?.length ?? 0) ? (locale === 'tr' ? 'Derse devam et' : 'Continue lesson') : (locale === 'tr' ? 'İlk derse başla' : 'Start the first lesson')}<Icon name="arrow-right" /></button><span>{firstLesson.steps.length} {locale === 'tr' ? 'öğrenme durağı' : 'learning stops'}</span></div>
        </div>
        <div className="focus-visual" aria-hidden="true"><div className="mini-editor system-flow-preview"><span>INPUT</span><span>KURAL</span><span>DURUM</span><strong>OUTPUT</strong></div><img src="./images/nova-mascot.webp" width="196" height="235" alt="" /></div>
      </section>

      <div className="metric-grid">
        <article className="metric-card"><span className="metric-icon violet"><Icon name="repeat" /></span><div><p>{t('reviewQueue')}</p><strong>0</strong><small>{locale === 'tr' ? 'Öğrendiğin kavramlar biriktikçe açılır' : 'Unlocks as your learned concepts accumulate'}</small></div><button type="button" aria-label={t('reviewQueue')}><Icon name="chevron-right" /></button></article>
        <article className="metric-card"><span className="metric-icon coral"><Icon name="gauge" /></span><div><p>{t('mastery')}</p><strong>%{courseCompletion(progress, coursePlan.length)}</strong><small>{progress.xp} XP · {progress.completedLessons.length} / {coursePlan.length} {locale === 'tr' ? 'ders' : 'lessons'}</small></div><div className="ring" aria-label={`${courseCompletion(progress, coursePlan.length)}%`}><span>{courseCompletion(progress, coursePlan.length)}</span></div></article>
      </div>

      <div className="content-grid">
        <LearningPath t={t} locale={locale} onOpenLesson={onOpenLesson} onViewAll={() => setView('path')} progress={progress} />
        <section className="project-card" aria-labelledby="project-title">
          <div className="project-image project-blank"><div><Icon name="project" /><span>UNITY</span></div><b>{locale === 'tr' ? 'Proje alanı' : 'Project space'}</b></div>
          <div className="project-copy"><p className="section-kicker">{locale === 'tr' ? '17 modül · 102 ders' : '17 modules · 102 lessons'}</p><h2 id="project-title">{locale === 'tr' ? 'Sıfır bilgiden yayınlanabilir oyuna.' : 'From zero knowledge to a publishable game.'}</h2><p>{locale === 'tr' ? 'Her büyük kavram kendi dersinde; 2D ve 3D dikey dilimler, test, performans, Git ve final proje aynı yolun parçaları.' : 'Each major concept has its own lesson, followed by 2D and 3D vertical slices, testing, performance, Git, and a final project.'}</p><button type="button" className="text-button" onClick={() => setView('path')}>{locale === 'tr' ? '102 derslik müfredatı gör' : 'View the 102-lesson curriculum'}<Icon name="arrow-right" /></button></div>
        </section>
      </div>
    </div>
  );
}

function LearningPath({ t, locale, expanded = false, onOpenLesson, onViewAll, progress }: { t: T; locale: Locale; expanded?: boolean; onOpenLesson: (lessonId: string) => void; onViewAll?: () => void; progress: LearningProgress }) {
  const items = expanded ? coursePlan : coursePlan.slice(0, 5);
  return (
    <section className={expanded ? 'path-panel path-page enter-view' : 'path-panel'} aria-labelledby="path-title">
      <div className="section-heading"><div><p className="section-kicker">{t('quickStart')}</p><h2 id="path-title">{t('learningPath')}</h2></div><span>{progress.completedLessons.length} / {coursePlan.length}</span></div>
      <p className="section-description">{t('pathDescription')}</p>
      <ol className="path-list">
        {items.map((item) => { const lessonId = lessonIdForOrder(item.order); const priorId = lessonIdForOrder(item.order - 1); const published = Boolean(lessonId); const unlocked = item.order === 1 || (priorId ? progress.completedLessons.includes(priorId) : false); const available = published && unlocked; const done = lessonId ? progress.completedLessons.includes(lessonId) : false; return <li key={item.order} className={`path-item ${available ? 'ready' : 'locked'}${done ? ' completed' : ''}`}><span className="path-node">{done ? <Icon name="check" /> : available ? String(item.order).padStart(2, '0') : <Icon name="lock" />}</span><div><strong>{localize(item.title, locale)}</strong><small>{done ? (locale === 'tr' ? 'Tamamlandı · rozet kazanıldı' : 'Completed · badge earned') : published && !unlocked ? (locale === 'tr' ? `Modül ${item.module} · önceki dersi tamamla` : `Module ${item.module} · complete the previous lesson`) : (locale === 'tr' ? `Modül ${item.module} · ${available ? 'oynanabilir ders hazır' : 'içerik hazırlanıyor'}` : `Module ${item.module} · ${available ? 'playable lesson ready' : 'content in preparation'}`)}</small></div>{available && lessonId && <button type="button" onClick={() => onOpenLesson(lessonId)} aria-label={`${localize(item.title, locale)} dersini aç`}><Icon name="chevron-right" /></button>}</li>; })}
      </ol>
      {!expanded && onViewAll && <button type="button" className="text-button path-all-button" onClick={onViewAll}>{locale === 'tr' ? 'İlk 3 ders oynanabilir · toplam 102 ders' : 'First 3 lessons playable · 102 lessons total'}<Icon name="arrow-right" /></button>}
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

function LessonWorkspace({ locale, lessonId, stepId, onStep, onBack, progress, onCompleteStep }: { locale: Locale; lessonId: string; stepId: string; onStep: (stepId: string) => void; onBack: () => void; progress: LearningProgress; onCompleteStep: (lessonId: string, stepId: string) => void }) {
  const lesson = getLesson(lessonId);
  const activeStepIndex = Math.max(0, lesson.steps.findIndex((step) => step.id === stepId));
  const activeStep = lesson.steps[activeStepIndex];
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => new Set(progress.completedSteps[lesson.id] ?? []));

  useEffect(() => {
    setCompletedSteps(new Set(progress.completedSteps[lesson.id] ?? []));
  }, [lesson.id]);
  const stepComplete = completedSteps.has(activeStep.id);
  const isFinalStep = activeStepIndex === lesson.steps.length - 1;
  const stageProgress = ((activeStepIndex + 1) / lesson.steps.length) * 100;

  const markStepComplete = (targetStepId: string) => {
    setCompletedSteps((current) => {
      if (current.has(targetStepId)) return current;
      const next = new Set(current).add(targetStepId);
      onCompleteStep(lesson.id, targetStepId);
      return next;
    });
  };

  return (
    <div className="lesson-page enter-view" data-lesson-top tabIndex={-1}>
      <button className="back-button" type="button" onClick={onBack}><Icon name="arrow-right" />{locale === 'tr' ? 'Ders planına dön' : 'Back to course plan'}</button>
      <div className="lesson-heading"><div><p className="section-kicker">{locale === 'tr' ? `Ders ${lesson.order} / ${coursePlan.length} · Öğrenme laboratuvarı` : `Lesson ${lesson.order} / ${coursePlan.length} · Learning laboratory`}</p><h1>{localize(lesson.title, locale)}</h1><p>{localize(lesson.summary, locale)}</p></div><div className="lesson-reward-summary"><span><Icon name="spark" /><b>{progress.xp}</b><small>XP</small></span><span><Icon name="repeat" /><b>{progress.streak}</b><small>{locale === 'tr' ? 'seri' : 'streak'}</small></span></div></div>
      <div className="lesson-stage-progress"><span><strong>{String(activeStepIndex + 1).padStart(2, '0')}</strong> / {String(lesson.steps.length).padStart(2, '0')}</span><div><i style={{ width: `${stageProgress}%` }} /></div><small>{localize(activeStep.title, locale)}</small></div>
      <div key={activeStep.id} className="lesson-workbench activity-mode foundation-mode lesson-step-transition">
        <aside className="lesson-guidance">
          <section className="lesson-step-card"><div className={`step-kind ${activeStep.kind}`}><Icon name={activeStep.kind === 'game' ? 'spark' : activeStep.kind === 'debug' ? 'repeat' : activeStep.kind === 'lab' ? 'project' : 'book'} /><span>{activeStep.xp} XP</span></div><p className="section-kicker">{locale === 'tr' ? 'Şu anki öğrenme durağı' : 'Current learning stop'}</p><h2>{localize(activeStep.title, locale)}</h2><p>{localize(activeStep.description, locale)}</p><div className="step-objective"><span>Bu adımın kanıtı</span><strong>{localize(activeStep.objective, locale)}</strong></div><ul>{localize(activeStep.bullets, locale).map((bullet) => <li key={bullet}><Icon name="check" /><span>{bullet}</span></li>)}</ul><div className="concept-tags">{lesson.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></section>
        </aside>
        {isFinalStep ? <LessonFinale lesson={lesson} locale={locale} onComplete={() => markStepComplete(activeStep.id)} onReview={onStep} /> : <FoundationActivity step={activeStep} locale={locale} completed={stepComplete} onComplete={() => markStepComplete(activeStep.id)} />}
      </div>
      <div className="lesson-step-actions"><button className="button button-secondary" type="button" disabled={activeStepIndex === 0} onClick={() => onStep(lesson.steps[activeStepIndex - 1].id)}><Icon name="arrow-right" />{locale === 'tr' ? 'Önceki adım' : 'Previous step'}</button><span>{activeStepIndex + 1} / {lesson.steps.length}{!stepComplete && ` · ${locale === 'tr' ? 'Etkinliği tamamla' : 'Complete the activity'}`}</span>{activeStepIndex === lesson.steps.length - 1 ? <button className="button button-primary" type="button" disabled={!stepComplete} onClick={onBack}>{locale === 'tr' ? 'Rozeti al ve ders haritasına dön' : 'Claim badge and return to the path'}<Icon name="arrow-right" /></button> : <button className="button button-primary" type="button" disabled={!stepComplete} onClick={() => onStep(lesson.steps[activeStepIndex + 1].id)}>{locale === 'tr' ? 'Sonraki adım' : 'Next step'}<Icon name="arrow-right" /></button>}</div>
    </div>
  );
}

function MasteryBar({ label, value }: { label: string; value: number }) {
  return <div><span><strong>{label}</strong><small>%{value}</small></span><div><i style={{ width: `${value}%` }} /></div></div>;
}

function SimplePlaceholder({ icon, title, body }: { icon: Parameters<typeof Icon>[0]['name']; title: string; body: string }) {
  return <section className="placeholder-page enter-view"><span className="metric-icon violet"><Icon name={icon} /></span><h1>{title}</h1><p>{body}</p><small>Bu yüzey sonraki dikey dilimde gerçek veri akışıyla tamamlanacak.</small></section>;
}
