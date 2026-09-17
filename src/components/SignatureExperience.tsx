import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../shared/Icon';

type Props = {
  stepId: string;
  onReady: () => void;
};

const signatureSteps = new Set([
  'l1-observe',
  'l2-name-extension',
  'l3-toolchain',
  'l4-create',
  'l5-map',
  'l6-create',
]);

export function hasSignatureExperience(stepId: string) {
  return signatureSteps.has(stepId);
}

function SystemXRay({ onReady }: Pick<Props, 'onReady'>) {
  const [phase, setPhase] = useState(-1);
  const [slow, setSlow] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const play = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase(-1);
    const delay = slow ? 720 : 330;
    [0, 1, 2, 3].forEach((next, index) => {
      timers.current.push(window.setTimeout(() => {
        setPhase(next);
        if (next === 3) onReady();
      }, 120 + index * delay));
    });
  };

  return (
    <section className="signature-experience system-xray" aria-label="Oyun sistemi X-Ray simülasyonu">
      <header>
        <div><span>SYSTEM X-RAY</span><h3>Aynı anın içinde dört ayrı iş gerçekleşiyor.</h3></div>
        <button type="button" className={slow ? 'speed-switch active' : 'speed-switch'} onClick={() => setSlow((value) => !value)}><i />{slow ? 'Yavaş çekim açık' : 'Normal hız'}</button>
      </header>
      <div className="xray-game-window">
        <div className="xray-sky"><i /><i /><i /></div>
        <div className="xray-world">
          <span className={phase >= 1 ? 'xray-player moved' : 'xray-player'} aria-label={phase >= 1 ? 'Karakter sağa hareket etti' : 'Karakter başlangıç konumunda'}><b /></span>
          <span className="xray-ground" />
          <div className={phase >= 0 ? 'key-press pressed' : 'key-press'}><small>OYUNCU</small><kbd>→</kbd><span>{phase >= 0 ? 'basıldı' : 'hazır'}</span></div>
          <div className={phase >= 2 ? 'energy-meter changed' : 'energy-meter'}><small>ENERJİ</small><b>{phase >= 2 ? '3' : '4'}</b><i><span /></i></div>
          <div className={phase >= 3 ? 'sound-pulse audible' : 'sound-pulse'} aria-label={phase >= 3 ? 'Ayak sesi çaldı' : 'Ses bekliyor'}><i /><i /><i /><Icon name="spark" /></div>
        </div>
        <div className="xray-caption" role="status">{phase < 0 ? 'Oynat’a bastığında olayları önce normal sahnede, sonra sistem hattında göreceksin.' : [
          'Sağ ok oyuncudan gelen sinyaldir. Henüz karakter hareket etmedi.',
          'Hareket kuralı sinyali yorumladı ve karakterin konumunu değiştirdi.',
          'Enerji 4’ten 3’e indi. Oyun bu yeni değeri hafızasında tutuyor.',
          'Yeni durum görüntü ve ayak sesiyle oyuncuya anlatıldı.',
        ][phase]}</div>
      </div>
      <div className="xray-timeline" aria-label="Input, kural, durum ve çıktı zaman çizgisi">
        {[
          ['INPUT', 'Sağ ok'],
          ['KURAL', 'Hareket edebilir mi?'],
          ['DURUM', 'Konum ve enerji'],
          ['ÇIKTI', 'Görüntü ve ses'],
        ].map(([label, detail], index) => <div key={label} className={phase >= index ? 'active' : ''}><b>{index + 1}</b><span><small>{label}</small><strong>{detail}</strong></span><i /></div>)}
      </div>
      <footer><p>Tuş, hareket, enerji ve ses birbirine bağlıdır; fakat sistemde farklı sorumluluklar taşır.</p><button type="button" className="button button-primary" onClick={play}><Icon name="repeat" />{phase === 3 ? 'Yeniden oynat' : 'Olayı oynat'}</button></footer>
    </section>
  );
}

function VirtualFileExplorer({ onReady }: Pick<Props, 'onReady'>) {
  const [extensions, setExtensions] = useState(false);
  const [selected, setSelected] = useState('');
  const files = [
    { base: 'PlayerMove', extension: '.cs', kind: 'C# script' },
    { base: 'PlayerMove', extension: '.txt', kind: 'Metin belgesi' },
    { base: 'PlayerMove.cs', extension: '.txt', kind: 'Metin belgesi' },
  ];
  const choose = (name: string) => {
    setSelected(name);
    if (extensions && name === 'PlayerMove.cs.txt') onReady();
  };
  return (
    <section className="signature-experience file-explorer" aria-label="Sanal dosya yöneticisi">
      <header><div><span>VIRTUAL FILE EXPLORER</span><h3>Üç dosya aynı görünüyorsa yalnız adına güvenemezsin.</h3></div><button type="button" className={extensions ? 'extension-toggle on' : 'extension-toggle'} onClick={() => { setExtensions((value) => !value); setSelected(''); }}><i />Uzantıları {extensions ? 'gizle' : 'göster'}</button></header>
      <div className="file-window">
        <nav><button type="button">‹</button><button type="button">›</button><div><Icon name="project" /><span>GameDev</span><b>›</b><span>FirstGame</span><b>›</b><span>Assets</span><b>›</b><span>Scripts</span></div></nav>
        <aside><strong>Sık Kullanılanlar</strong>{['Projects', 'Assets', 'Scripts', 'Backups'].map((item, index) => <span key={item} className={index === 2 ? 'active' : ''}><i />{item}</span>)}</aside>
        <main>{files.map((file, index) => {
          const fullName = `${file.base}${file.extension}`;
          return <button type="button" key={`${fullName}-${index}`} className={selected === fullName ? (fullName === 'PlayerMove.cs.txt' ? 'danger selected' : 'selected') : fullName === 'PlayerMove.cs.txt' && extensions ? 'danger' : ''} onClick={() => choose(fullName)}><i className={index === 0 ? 'script-icon' : 'text-icon'}>{index === 0 ? 'C#' : 'TXT'}</i><strong>{file.base}{extensions && <em>{file.extension}</em>}</strong><small>{extensions ? file.kind : 'Türü görmek için uzantıları aç'}</small></button>;
        })}</main>
        <footer><span>{!extensions ? 'Dosyaların gerçek türü şu anda gizli.' : selected === 'PlayerMove.cs.txt' ? 'Buldun: Bu bir C# script’i değil, adı yanıltıcı olan bir metin dosyası.' : 'Şimdi C# script’i gibi görünen ama aslında metin belgesi olan dosyayı seç.'}</span></footer>
      </div>
    </section>
  );
}

function EnvironmentBuilder({ onReady }: Pick<Props, 'onReady'>) {
  const tools = [
    ['Hub', 'Sürümleri ve projeleri yönetir'],
    ['Editor', 'Sahneyi kurar ve oyunu çalıştırır'],
    ['IDE', 'C# kodunu yazdırır ve inceler'],
    ['Lisans', 'Editor kullanım hakkını doğrular'],
    ['Build Support', 'Hedef platformun araçlarını ekler'],
  ];
  const [connected, setConnected] = useState<Set<number>>(() => new Set());
  const connect = (index: number) => setConnected((current) => {
    const next = new Set(current).add(index);
    if (next.size === tools.length) onReady();
    return next;
  });
  return (
    <section className="signature-experience environment-builder" aria-label="Unity geliştirme ortamı kurucusu">
      <header><div><span>DEVELOPMENT ENVIRONMENT BUILDER</span><h3>Unity tek bir uygulama değil, birlikte çalışan bir araç zinciridir.</h3></div><p>{connected.size} / {tools.length} bağlantı hazır</p></header>
      <div className="environment-canvas">
        <div className="workstation"><span /><i /><strong>GELİŞTİRME<br />BİLGİSAYARI</strong><small>{connected.size === tools.length ? 'Sistem hazır' : 'Bağlantılar bekleniyor'}</small></div>
        <div className="environment-links" aria-hidden="true">{tools.map((_, index) => <i key={index} className={connected.has(index) ? 'active' : ''} />)}</div>
        <div className="tool-nodes">{tools.map(([name, detail], index) => <button type="button" key={name} className={connected.has(index) ? 'connected' : ''} onClick={() => connect(index)}><b>{String(index + 1).padStart(2, '0')}</b><span><strong>{name}</strong><small>{detail}</small></span><Icon name={connected.has(index) ? 'check' : 'plus'} /></button>)}</div>
      </div>
      <footer><p>{connected.size === tools.length ? 'Zincir tamamlandı. Her parçanın görevi farklı; biri eksildiğinde belirti de farklı yerde görünür.' : 'Her aracı bilgisayara bağla. Bağlantı kurulduğunda o parçanın görevi görünür kalacak.'}</p></footer>
    </section>
  );
}

function ProjectCreationTwin({ onReady }: Pick<Props, 'onReady'>) {
  const [version, setVersion] = useState('');
  const [template, setTemplate] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('D:/GameDev/Projects');
  const [created, setCreated] = useState(false);
  const validName = /^[A-Za-z][A-Za-z0-9_-]{2,30}$/.test(name);
  const ready = version === '6000.6.x' && template === 'Universal 3D' && validName && !location.includes('Assets');
  const create = () => { if (!ready) return; setCreated(true); onReady(); };
  return (
    <section className="signature-experience project-twin" aria-label="Sanal Unity Hub proje oluşturma ekranı">
      <header><div><span>PROJECT CREATION TWIN</span><h3>Proje daha oluşmadan önce bütün kararların sonucunu görebilirsin.</h3></div><span className={created ? 'creation-state ready' : 'creation-state'}>{created ? 'PROJECT READY' : 'CONFIGURING'}</span></header>
      <div className="project-creator">
        <aside><strong>Templates</strong>{['Universal 3D', '2D', 'High Definition 3D'].map((item) => <button type="button" key={item} className={template === item ? 'active' : ''} onClick={() => setTemplate(item)}><i /><span>{item}</span></button>)}</aside>
        <main><label>Editor version<select value={version} onChange={(event) => setVersion(event.target.value)}><option value="">Bir sürüm seç</option><option>6000.6.x</option><option>6000.7.x</option></select></label><label>Project name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="LevelUpPractice" /></label><label>Location<select value={location} onChange={(event) => setLocation(event.target.value)}><option>D:/GameDev/Projects</option><option>D:/AnotherGame/Assets</option><option>Downloads</option></select></label><button type="button" className="button button-primary" disabled={!ready || created} onClick={create}>{created ? 'Proje oluşturuldu' : 'Projeyi oluştur'}<Icon name={created ? 'check' : 'arrow-right'} /></button></main>
        <section><small>CANLI PROJE MANİFESTİ</small><dl><div><dt>Editor</dt><dd className={version === '6000.6.x' ? 'ok' : ''}>{version || 'Seçilmedi'}</dd></div><div><dt>Template</dt><dd className={template === 'Universal 3D' ? 'ok' : ''}>{template || 'Seçilmedi'}</dd></div><div><dt>Project root</dt><dd className={validName && !location.includes('Assets') ? 'ok' : location.includes('Assets') ? 'bad' : ''}>{location}/{name || '…'}</dd></div></dl><p>{location.includes('Assets') ? 'Bu konum başka bir projenin içine yeni proje yerleştirir.' : !validName ? 'Proje adı bir harfle başlamalı ve en az üç karakter olmalı.' : ready ? 'Bütün kararlar birbiriyle uyumlu.' : 'Eksik kararlar tamamlandıkça bu özet güncellenecek.'}</p></section>
      </div>
    </section>
  );
}

function LivingUnityEditor({ onReady }: Pick<Props, 'onReady'>) {
  const [selection, setSelection] = useState('Main Camera');
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [sceneAngle, setSceneAngle] = useState(0);
  const select = (item: string) => {
    setSelection(item);
    setSeen((current) => {
      const next = new Set(current).add(item);
      if (next.size >= 3) onReady();
      return next;
    });
  };
  const inspector = selection === 'Sun Light' ? ['Light', 'Directional', 'Intensity 1'] : selection === 'Ground Material' ? ['Material', 'URP/Lit', 'Base Map'] : ['Camera', 'Perspective', 'Field of View 60'];
  return (
    <section className="signature-experience living-editor" aria-label="Etkileşimli Unity Editor haritası">
      <header><div><span>LIVING UNITY EDITOR</span><h3>Bir yerde yaptığın seçim diğer panellerde iz bırakır.</h3></div><p>{seen.size} / 3 seçim incelendi</p></header>
      <div className="unity-workspace">
        <div className="unity-toolbar"><i /><span>FirstScene</span><button type="button">▶</button><button type="button">Ⅱ</button><button type="button">▷</button></div>
        <section className="uw-hierarchy"><header>Hierarchy</header>{['Main Camera', 'Sun Light', 'Ground'].map((item) => <button type="button" key={item} className={selection === item ? 'active' : ''} onClick={() => select(item)}><i />{item}</button>)}</section>
        <section className="uw-scene"><header>Scene</header><div style={{transform:`perspective(520px) rotateY(${sceneAngle}deg)`}}><i /><b className={selection === 'Ground' ? 'selected' : ''}>GROUND</b><span className={selection === 'Main Camera' ? 'selected' : ''}>▰</span><em className={selection === 'Sun Light' ? 'selected' : ''}>☀</em></div><label>Scene bakışı<input type="range" min="-18" max="18" value={sceneAngle} onChange={(event) => setSceneAngle(Number(event.target.value))} /></label></section>
        <section className="uw-game"><header>Game</header><div><i /><b>PLAYER VIEW</b><small>Scene bakışı değişse de bu kadraj sabit kalır.</small></div></section>
        <section className="uw-inspector"><header>Inspector</header><strong>{selection}</strong>{inspector.map((item, index) => <label key={item}><span>{item}</span><input readOnly value={index === 0 ? 'Enabled' : item} /></label>)}</section>
        <section className="uw-project"><header>Project</header>{['Ground Material', 'Player Script', 'FirstScene'].map((item) => <button type="button" key={item} className={selection === item ? 'active' : ''} onClick={() => select(item)}><i />{item}</button>)}</section>
        <section className="uw-console"><header>Console</header><span>✓ FirstScene loaded successfully</span><span>! Öğrenme yüzeyi hazır</span></section>
      </div>
      <footer><p>Hierarchy’den bir sahne nesnesi, Project’ten de Ground Material’i seç. Inspector’ın seçime göre nasıl değiştiğini izle.</p></footer>
    </section>
  );
}

type ForgeObject = { id: string; name: string; x: number; y: number; scale: number };

function SceneForge({ onReady }: Pick<Props, 'onReady'>) {
  const [objects, setObjects] = useState<ForgeObject[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const selected = objects.find((item) => item.id === selectedId);
  const [changedTransform, setChangedTransform] = useState(false);
  const add = (name: string) => {
    if (objects.some((item) => item.name === name)) return;
    const object = { id: `${name}-${Date.now()}`, name, x: name === 'Platform_A' ? 58 : name === 'PlayerMarker' ? 36 : 50, y: name === 'Ground' ? 78 : 48, scale: name === 'Ground' ? 1.8 : 1 };
    setObjects((current) => [...current, object]);
    setSelectedId(object.id);
  };
  const update = (key: 'x' | 'y' | 'scale', value: number) => {
    setObjects((current) => current.map((item) => item.id === selectedId ? { ...item, [key]: value } : item));
    setChangedTransform(true);
  };
  useEffect(() => {
    if (objects.length === 3 && changedTransform) onReady();
  }, [changedTransform, objects.length, onReady]);
  return (
    <section className="signature-experience scene-forge" aria-label="Mini Unity sahne kurma alanı">
      <header><div><span>SCENE FORGE</span><h3>Hierarchy, Scene ve Inspector aynı sahnenin üç ayrı görünümüdür.</h3></div><p>{objects.length} / 3 nesne</p></header>
      <div className="forge-workspace">
        <aside><header>Hierarchy <button type="button" aria-label="Yeni nesne ekle">+</button></header>{objects.length === 0 && <p>Sahne henüz boş.</p>}{objects.map((item) => <button type="button" key={item.id} className={selectedId === item.id ? 'active' : ''} onClick={() => setSelectedId(item.id)}><i />{item.name}</button>)}<footer>{['Ground', 'Platform_A', 'PlayerMarker'].map((name) => <button type="button" key={name} disabled={objects.some((item) => item.name === name)} onClick={() => add(name)}>+ {name}</button>)}</footer></aside>
        <main><div className="forge-grid" />{objects.map((item) => <button type="button" key={item.id} className={`forge-object ${item.name.toLowerCase().replace('_', '-')} ${selectedId === item.id ? 'selected' : ''}`} style={{left:`${item.x}%`,top:`${item.y}%`,transform:`translate(-50%,-50%) scale(${item.scale})`}} onClick={() => setSelectedId(item.id)} aria-label={`${item.name} nesnesini seç`}><i /><span>{item.name}</span></button>)}<div className="forge-ghost"><i /><span>Hedef sahne</span></div></main>
        <section><header>Inspector</header>{selected ? <><strong>{selected.name}</strong><small>Transform</small><label>Position X<input type="range" min="20" max="80" value={selected.x} onChange={(event) => update('x', Number(event.target.value))} /><b>{selected.x}</b></label><label>Position Y<input type="range" min="28" max="80" value={selected.y} onChange={(event) => update('y', Number(event.target.value))} /><b>{selected.y}</b></label><label>Scale<input type="range" min="0.6" max="2" step="0.1" value={selected.scale} onChange={(event) => update('scale', Number(event.target.value))} /><b>{selected.scale.toFixed(1)}</b></label></> : <p>Bir nesne eklediğinde Transform değerleri burada görünecek.</p>}</section>
      </div>
      <footer><p>{objects.length < 3 ? 'Üç temel nesneyi sahneye ekle.' : !changedTransform ? 'Şimdi bir nesnenin Transform değerini değiştir ve üç paneldeki ortak sonucu gözle.' : 'Sahne hazır. Yaptığın tek değişiklik, Scene görüntüsünü ve Inspector verisini birlikte güncelledi.'}</p></footer>
    </section>
  );
}

export function SignatureExperience({ stepId, onReady }: Props) {
  return useMemo(() => {
    if (stepId === 'l1-observe') return <SystemXRay onReady={onReady} />;
    if (stepId === 'l2-name-extension') return <VirtualFileExplorer onReady={onReady} />;
    if (stepId === 'l3-toolchain') return <EnvironmentBuilder onReady={onReady} />;
    if (stepId === 'l4-create') return <ProjectCreationTwin onReady={onReady} />;
    if (stepId === 'l5-map') return <LivingUnityEditor onReady={onReady} />;
    if (stepId === 'l6-create') return <SceneForge onReady={onReady} />;
    return null;
  }, [onReady, stepId]);
}
