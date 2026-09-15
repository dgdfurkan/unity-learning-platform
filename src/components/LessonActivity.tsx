import { useMemo, useState } from 'react';
import type { Locale } from '../domain/models';
import type { LessonActivityKind } from '../learning/course';
import { Icon } from '../shared/Icon';

interface LessonActivityProps {
  kind: Exclude<LessonActivityKind, 'code'>;
  locale: Locale;
  onComplete: () => void;
}

const copy = (locale: Locale, tr: string, en: string) => locale === 'tr' ? tr : en;

export function LessonActivity({ kind, locale, onComplete }: LessonActivityProps) {
  const components: Record<Exclude<LessonActivityKind, 'code'>, React.ReactNode> = {
    brief: <Brief locale={locale} onComplete={onComplete} />,
    hotspot: <Hotspot locale={locale} onComplete={onComplete} />,
    reveal: <Reveal locale={locale} onComplete={onComplete} />,
    match: <Match locale={locale} onComplete={onComplete} />,
    order: <Order locale={locale} onComplete={onComplete} />,
    fill: <Fill locale={locale} onComplete={onComplete} />,
    inspector: <Inspector locale={locale} onComplete={onComplete} />,
    predict: <Predict locale={locale} onComplete={onComplete} />,
    spot: <Spot locale={locale} onComplete={onComplete} />,
    sort: <Sort locale={locale} onComplete={onComplete} />,
    console: <ConsoleDetective locale={locale} onComplete={onComplete} />,
    mastery: <Mastery locale={locale} onComplete={onComplete} />,
  };
  return <section className="activity-studio">{components[kind]}</section>;
}

function ActivityHeader({ eyebrow, title, body, progress }: { eyebrow: string; title: string; body: string; progress?: string }) {
  return <header className="activity-header"><div><p className="section-kicker">{eyebrow}</p><h2>{title}</h2><p>{body}</p></div>{progress && <span>{progress}</span>}</header>;
}

function Done({ children }: { children: React.ReactNode }) {
  return <p className="activity-feedback success"><Icon name="check" />{children}</p>;
}

function Brief({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const [done, setDone] = useState(false);
  return <><ActivityHeader eyebrow={copy(locale, 'Zihinsel model', 'Mental model')} title={copy(locale, 'Koddan önce resmi kur.', 'Build the picture before code.')} body={copy(locale, 'Bu derste her kavramı önce görecek, sonra dokunacak, en son yazacaksın. Kod editörü hedef değil; öğrendiğini sınadığın araç.', 'In this lesson you will first see, then interact, and only then write. The code editor is not the goal; it is where you test understanding.')} /><div className="concept-flow"><article><b>1</b><strong>{copy(locale, 'Gör', 'See')}</strong><span>{copy(locale, 'Unity’deki karşılığını tanı.', 'Recognise it in Unity.')}</span></article><article><b>2</b><strong>{copy(locale, 'Dene', 'Try')}</strong><span>{copy(locale, 'Değiştir ve sonucu izle.', 'Change it and observe.')}</span></article><article><b>3</b><strong>{copy(locale, 'Açıkla', 'Explain')}</strong><span>{copy(locale, 'Nedenini kendi cümlenle kur.', 'State the reason in your words.')}</span></article><article><b>4</b><strong>{copy(locale, 'Yaz', 'Write')}</strong><span>{copy(locale, 'Kodu sıfırdan üret.', 'Produce the code from scratch.')}</span></article></div>{done ? <Done>{copy(locale, 'Ders yöntemini biliyorsun. Sonraki adımda Unity Editor’ü keşfedeceksin.', 'You know the method. Next you will explore the Unity Editor.')}</Done> : <button className="button button-primary activity-primary" type="button" onClick={() => { setDone(true); onComplete(); }}>{copy(locale, 'Hazırım, keşfe başla', 'I’m ready—start exploring')}<Icon name="arrow-right" /></button>}</>;
}

function Hotspot({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const points = [
    ['Hierarchy', copy(locale, 'Sahnedeki GameObject listesidir. Nesneyi burada seçer, ebeveyn–çocuk ilişkisini burada görürsün.', 'The list of GameObjects in the scene. Select objects and inspect parent-child relationships here.')],
    ['Scene', copy(locale, 'Sahneyi kurduğun çalışma alanıdır. Bu görünüm oyunun kamera çıktısı değildir.', 'The workspace where you build the scene. It is not the camera output.')],
    ['Game', copy(locale, 'Aktif Camera’nın oyuncuya göstereceği sonucu önizler.', 'Previews what the active Camera will show the player.')],
    ['Inspector', copy(locale, 'Seçili nesnenin Component ve ayarlarını gösterir.', 'Shows the selected object’s Components and settings.')],
    ['Project', copy(locale, 'Diskteki Assets klasörünün proje içindeki görünümüdür.', 'The project view of the Assets folder on disk.')],
    ['Console', copy(locale, 'Log, warning ve error mesajlarını dosya ve satır bilgisiyle gösterir.', 'Shows logs, warnings, and errors with file and line information.')],
  ] as const;
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [active, setActive] = useState(0);
  const pick = (name: string, index: number) => { const next = new Set(seen).add(name); setSeen(next); setActive(index); if (next.size === points.length) onComplete(); };
  return <><ActivityHeader eyebrow={copy(locale, 'Panel avı', 'Panel hunt')} title={copy(locale, 'Unity Editor’ü haritadan öğren.', 'Learn the Unity Editor as a map.')} body={copy(locale, 'Altı panelin her birine dokun. İsim ezberlemek yerine panelin hangi soruya cevap verdiğini bul.', 'Tap all six panels. Learn the question each panel answers instead of memorising names.')} progress={`${seen.size} / ${points.length}`} /><div className="unity-map"><div className="unity-map-bar"><i /><i /><i /><span>SampleScene — Unity</span></div><button className="panel hierarchy" onClick={() => pick('Hierarchy',0)}><strong>Hierarchy</strong><span>Player<br/>Main Camera<br/>Ground</span></button><button className="panel scene" onClick={() => pick('Scene',1)}><strong>Scene</strong><span className="scene-cube" /></button><button className="panel game" onClick={() => pick('Game',2)}><strong>Game</strong><span className="scene-cube solid" /></button><button className="panel inspector" onClick={() => pick('Inspector',3)}><strong>Inspector</strong><span>Transform<br/>Script<br/>Collider</span></button><button className="panel project" onClick={() => pick('Project',4)}><strong>Project</strong><span>Assets / Scripts</span></button><button className="panel console" onClick={() => pick('Console',5)}><strong>Console</strong><span>Log · Warning · Error</span></button></div><div className="activity-explanation"><strong>{points[active][0]}</strong><p>{points[active][1]}</p></div>{seen.size === points.length && <Done>{copy(locale, 'Altı paneli keşfettin. Artık “nerede aramalıyım?” sorusunu daha doğru cevaplayabilirsin.', 'You explored all six panels and can better answer “where should I look?”')}</Done>}</>;
}

function Reveal({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const cards = [
    ['Script', copy(locale, '`.cs` uzantılı kaynak dosyasıdır. Tek başına sahnede çalışmaz.', 'A `.cs` source file. It does not run in the scene by itself.')],
    ['Class', copy(locale, 'Veri ve davranışın şablonudur. Component bu şablondan oluşan örnektir.', 'A blueprint for data and behaviour. A Component is an instance of it.')],
    ['GameObject', copy(locale, 'Sahnedeki taşıyıcı nesnedir. Davranışı Component’lerden gelir.', 'A container object in the scene. Its behaviour comes from Components.')],
    ['Component', copy(locale, 'GameObject’e eklenen tek bir sorumluluk parçasıdır.', 'A single responsibility attached to a GameObject.')],
  ];
  const [open,setOpen]=useState<Set<number>>(new Set());
  const toggle=(i:number)=>{const next=new Set(open); next.add(i); setOpen(next); if(next.size===cards.length)onComplete();};
  return <><ActivityHeader eyebrow={copy(locale,'Dokun ve aç','Tap to reveal')} title={copy(locale,'Dosya, şablon ve sahne nesnesini ayır.','Separate file, blueprint, and scene object.')} body={copy(locale,'Dört kartı aç. Sonra “script ile Component aynı şey midir?” sorusuna cevap ver.','Open all four cards, then answer whether a script and Component are the same thing.')} progress={`${open.size} / 4`} /><div className="reveal-grid">{cards.map((card,i)=><button key={card[0]} type="button" className={open.has(i)?'reveal-card open':'reveal-card'} onClick={()=>toggle(i)} aria-expanded={open.has(i)}><span>{open.has(i)?'−':'+'}</span><strong>{card[0]}</strong>{open.has(i)&&<p>{card[1]}</p>}</button>)}</div>{open.size===cards.length&&<Done>{copy(locale,'Doğru ayrım: Script dosyadır; sınıf şablondur; Component sahnedeki örnektir.','Correct: a script is a file, a class is a blueprint, and a Component is the scene instance.')}</Done>}</>;
}

function Match({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const pairs=[['using',copy(locale,'Namespace içindeki türlere kısa adla erişir','Accesses namespace types by short name')],['class',copy(locale,'Yeni bir türün şablonunu tanımlar','Defines a new type blueprint')],['MonoBehaviour',copy(locale,'Sınıfı Unity Component yaşamına bağlar','Connects the class to Unity Component life')],['{ }',copy(locale,'Bir scope’un başlangıç ve bitişini belirler','Defines the boundaries of a scope')]];
  const order=[2,0,3,1]; const [left,setLeft]=useState<number|null>(null); const [matched,setMatched]=useState<Set<number>>(new Set()); const [wrong,setWrong]=useState<number|null>(null);
  const choose=(right:number)=>{if(left===null)return;if(left===right){const next=new Set(matched).add(left);setMatched(next);setLeft(null);if(next.size===pairs.length)onComplete();}else{setWrong(right);setTimeout(()=>setWrong(null),500);}};
  return <><ActivityHeader eyebrow={copy(locale,'Eşleştirme','Matching')} title={copy(locale,'Terimi görevine bağla.','Connect each term to its job.')} body={copy(locale,'Önce soldan bir terim, sonra sağdan görevi seç. Yanlış eşleşme neden doğru olmadığını düşünmen için geri döner.','Pick a term on the left, then its job on the right.')} progress={`${matched.size} / 4`} /><div className="match-board"><div>{pairs.map((p,i)=><button key={p[0]} disabled={matched.has(i)} className={left===i?'selected':matched.has(i)?'matched':''} onClick={()=>setLeft(i)}>{matched.has(i)&&<Icon name="check"/>}<code>{p[0]}</code></button>)}</div><div>{order.map(i=><button key={i} disabled={matched.has(i)||left===null} className={wrong===i?'wrong':matched.has(i)?'matched':''} onClick={()=>choose(i)}>{pairs[i][1]}</button>)}</div></div>{matched.size===4&&<Done>{copy(locale,'Her sembolün görevini eşleştirdin. Sıradaki adımda bunları doğru sıraya koyacaksın.','You matched every symbol to its job. Next you will place them in order.')}</Done>}</>;
}

function Order({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const items=['using UnityEngine;','public class FirstScript : MonoBehaviour','{','}']; const [order,setOrder]=useState([1,2,0,3]); const [checked,setChecked]=useState(false); const correct=order.every((x,i)=>x===i);
  const move=(i:number,d:number)=>{const j=i+d;if(j<0||j>=order.length)return;const next=[...order];[next[i],next[j]]=[next[j],next[i]];setOrder(next);setChecked(false);};
  return <><ActivityHeader eyebrow={copy(locale,'Sıraya koy','Put in order')} title={copy(locale,'Derlenebilir sınıf iskeletini kur.','Build a compilable class skeleton.')} body={copy(locale,'Satırları sürüklemek yerine oklarla taşı. Böylece dokunmatik ekranda sayfa kaydırma davranışı bozulmaz.','Move lines with arrows rather than dragging, preserving touch scrolling.')} /><ol className="order-list">{order.map((item,pos)=><li className={checked?(item===pos?'right':'wrong'):''} key={item}><span>{pos+1}</span><code>{items[item]}</code><div><button onClick={()=>move(pos,-1)} disabled={pos===0}>↑</button><button onClick={()=>move(pos,1)} disabled={pos===3}>↓</button></div></li>)}</ol>{checked&&correct?<Done>{copy(locale,'Doğru sıra. `using` sınıfın dışında; açılış ve kapanış parantezleri sınıfın scope’unu çevreliyor.','Correct. `using` is outside the class and the braces surround its scope.')}</Done>:<button className="button button-primary activity-primary" onClick={()=>{setChecked(true);if(correct)onComplete();}}>{checked?copy(locale,'Tekrar kontrol et','Check again'):copy(locale,'Sırayı kontrol et','Check order')}</button>}</>;
}

function Fill({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const answers=['public','FirstScript','MonoBehaviour']; const pool=['MonoBehaviour','private','FirstScript','GameObject','public']; const [slots,setSlots]=useState<(string|null)[]>([null,null,null]); const [checked,setChecked]=useState(false); const solved=checked&&slots.every((x,i)=>x===answers[i]);
  const place=(token:string)=>{const i=slots.indexOf(null);if(i<0)return;const next=[...slots];next[i]=token;setSlots(next);setChecked(false);};
  return <><ActivityHeader eyebrow={copy(locale,'Boşluk doldurma','Fill the blanks')} title={copy(locale,'Sınıf bildirimini tamamla.','Complete the class declaration.')} body={copy(locale,'Token havuzundan seç. Buradaki hedef yazma hızı değil, sözdiziminin parçalarını tanımak.','Choose from the token pool. The goal is recognising syntax, not typing speed.')} /><div className="fill-code"><code><button onClick={()=>{const n=[...slots];n[0]=null;setSlots(n)}}>{slots[0]??'___'}</button> class <button onClick={()=>{const n=[...slots];n[1]=null;setSlots(n)}}>{slots[1]??'___'}</button> : <button onClick={()=>{const n=[...slots];n[2]=null;setSlots(n)}}>{slots[2]??'___'}</button></code></div><div className="token-pool">{pool.map((x,i)=><button key={`${x}-${i}`} onClick={()=>place(x)} disabled={!slots.includes(null)}><code>{x}</code></button>)}<button onClick={()=>{setSlots([null,null,null]);setChecked(false)}}>{copy(locale,'Temizle','Clear')}</button></div>{solved?<Done>{copy(locale,'Bildirim doğru. `public` erişimi, `class` türü, `:` ise kalıtımı tanımlıyor.','Correct. `public` defines access, `class` the type, and `:` inheritance.')}</Done>:<button className="button button-primary activity-primary" disabled={slots.includes(null)} onClick={()=>{setChecked(true);if(slots.every((x,i)=>x===answers[i]))onComplete();}}>{checked?copy(locale,'Bir parça yanlış, yeniden dene','One token is wrong—try again'):copy(locale,'Yapıyı kontrol et','Check structure')}</button>}</>;
}

function Inspector({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const [speed,setSpeed]=useState(3);const [output,setOutput]=useState('');
  const run=()=>{setOutput(`Console · speed = ${speed}`);if(speed===6)onComplete();};
  return <><ActivityHeader eyebrow={copy(locale,'Canlı Inspector','Live Inspector')} title={copy(locale,'Kod ile Inspector arasındaki bağı gör.','See the link between code and Inspector.')} body={copy(locale,'Speed değerini 6 yapıp Play’e bas. Alanın kodda private kalırken Inspector’da neden göründüğünü incele.','Set Speed to 6 and press Play. Observe why the field appears in the Inspector while remaining private in code.')} /><div className="inspector-lab"><pre><code><span>[SerializeField]</span>{'\n'}private float speed = 3f;{'\n\n'}void Start(){'\n'}{'{'}{'\n'}    Debug.Log(speed);{'\n'}{'}'}</code></pre><div className="mock-inspector"><strong>First Script (Script)</strong><label>Speed <input type="range" min="1" max="10" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><code>{speed}</code></label><button className="button button-primary" onClick={run}>▶ Play</button>{output&&<output>{output}</output>}</div></div>{speed===6&&output&&<Done>{copy(locale,'Inspector’daki değer, serileştirilmiş field’ın o Component örneğindeki değeridir.','The Inspector value belongs to the serialised field on that Component instance.')}</Done>}</>;
}

function Predict({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const [pick,setPick]=useState<number|null>(null);const choices=[copy(locale,'Unity her ikisini de çağırır.','Unity invokes both.'),copy(locale,'Yalnızca `Awake` otomatik çağrılır.','Only `Awake` is invoked automatically.'),copy(locale,'Yalnızca `awake` otomatik çağrılır.','Only `awake` is invoked automatically.')];
  return <><ActivityHeader eyebrow={copy(locale,'Tahmin et','Predict')} title={copy(locale,'`Awake` ile `awake` aynı mı?','Are `Awake` and `awake` the same?')} body={copy(locale,'Cevabı seçmeden önce C# ve Unity’nin büyük/küçük harfe nasıl baktığını düşün.','Before choosing, consider how C# and Unity treat letter casing.')} /><pre className="activity-code"><code>void Awake()  {'{ Debug.Log("A"); }'}{'\n'}void awake()  {'{ Debug.Log("B"); }'}</code></pre><div className="choice-list">{choices.map((x,i)=><button className={pick===i?(i===1?'correct':'incorrect'):''} key={x} onClick={()=>{setPick(i);if(i===1)onComplete();}}><b>{String.fromCharCode(65+i)}</b>{x}</button>)}</div>{pick!==null&&(pick===1?<Done>{copy(locale,'Doğru. İki metot da C# açısından geçerlidir; ancak Unity yalnızca tam adı `Awake` olan callback’i tanır.','Correct. Both compile, but Unity only recognises the exact callback name `Awake`.')}</Done>:<p className="activity-feedback error">{copy(locale,'C# case-sensitive çalışır. Callback adı Unity’nin beklediği yazımla birebir eşleşmelidir.','C# is case-sensitive. The callback name must exactly match Unity’s expected spelling.')}</p>)}</>;
}

function Spot({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const lines=['using UnityEngine;','','public class FirstScript : MonoBehaviour','{','    void Start()','    {','        İlk mesajını buraya yaz.','    }','}'];const [selected,setSelected]=useState<number|null>(null);const right=6;
  return <><ActivityHeader eyebrow={copy(locale,'Hata avı','Spot the error')} title={copy(locale,'Derlemeyi durduran satırı bul.','Find the line that stops compilation.')} body={copy(locale,'Console’un “geçersiz ifade” dediğini varsay. Hatalı satıra dokun; boş satırlar da gerçek satır numarasına dahildir.','Assume the Console reports an invalid expression. Tap the faulty line; blank lines count in line numbers.')} /><ol className="spot-code">{lines.map((x,i)=><li key={i}><button className={selected===i?(i===right?'correct':'incorrect'):''} onClick={()=>{setSelected(i);if(i===right)onComplete();}}><span>{i+1}</span><code>{x||' '}</code></button></li>)}</ol>{selected!==null&&(selected===right?<Done>{copy(locale,'7. satır düz metin. Açıklama olacaksa `//`, çıktı olacaksa `Debug.Log("...");` gerekir.','Line 7 is plain text. Use `//` for a comment or `Debug.Log("...");` for output.')}</Done>:<p className="activity-feedback error">{copy(locale,'Bu satır geçerli. Console’daki satır numarasını ve komut olmayan ifadeyi birlikte ara.','This line is valid. Use the Console line number and look for a non-statement.')}</p>)}</>;
}

function Sort({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const items=[['42','int'],['"Deniz"','string'],['true','bool'],['-3','int'],['"Unity hazır"','string'],['false','bool']] as const;const [index,setIndex]=useState(0);const [answers,setAnswers]=useState<string[]>([]);const item=items[index];
  const choose=(bucket:string)=>{if(!item)return;if(bucket===item[1]){const next=[...answers,bucket];setAnswers(next);if(index===items.length-1)onComplete();else setIndex(index+1);}else setAnswers([...answers,'wrong']);};
  return <><ActivityHeader eyebrow={copy(locale,'Tür kutuları','Type buckets')} title={copy(locale,'Değeri doğru veri türüne gönder.','Send each value to its data type.')} body={copy(locale,'Bu kısa ön izleme ikinci derse hazırlık yapar: tür, değerin bellekte nasıl yorumlanacağını belirler.','This preview prepares lesson two: a type determines how a value is interpreted in memory.')} progress={`${Math.min(index,items.length-1)+1} / 6`} />{item&&index<items.length?<div className="sort-stage"><code>{item[0]}</code><div>{['int','string','bool'].map(x=><button key={x} onClick={()=>choose(x)}><code>{x}</code></button>)}</div></div>:null}{index===items.length-1&&answers.at(-1)===items.at(-1)?.[1]&&<Done>{copy(locale,'Altı değeri doğru sınıflandırdın. `int`, `string` ve `bool` artık havada kalan kelimeler değil.','You classified all six values. `int`, `string`, and `bool` now have concrete meaning.')}</Done>}</>;
}

function ConsoleDetective({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const [log,setLog]=useState<number|null>(null);const [line,setLine]=useState<number|null>(null);const logs=[['ℹ','Unity hazır','FirstScript.cs:7'],['△','`awake` callback olarak çağrılmaz','FirstScript.cs:5'],['×','CS1525 · Geçersiz ifade','FirstScript.cs:7']];
  const chooseLine=(i:number)=>{setLine(i);if(log===2&&i===6)onComplete();};
  return <><ActivityHeader eyebrow={copy(locale,'Console dedektifi','Console detective')} title={copy(locale,'Mesajdan dosyaya, dosyadan satıra git.','Move from message to file, then line.')} body={copy(locale,'Önce çalışmayı durduran kırmızı kaydı seç. Ardından verdiği dosya ve satır bilgisine göre kod satırını işaretle.','First select the red blocking record, then mark the code line using its file and line information.')} /><div className="console-lab"><div className="console-records">{logs.map((x,i)=><button key={x[1]} className={log===i?'selected':''} onClick={()=>{setLog(i);setLine(null)}}><b>{x[0]}</b><span><strong>{x[1]}</strong><small>{x[2]}</small></span></button>)}</div><ol className="mini-code-lines">{['using UnityEngine;','','public class FirstScript : MonoBehaviour','{','    void Start()','    {','        İlk mesajını buraya yaz.','    }','}'].map((x,i)=><li key={i}><button disabled={log===null} className={line===i?(log===2&&i===6?'correct':'incorrect'):''} onClick={()=>chooseLine(i)}><span>{i+1}</span><code>{x||' '}</code></button></li>)}</ol></div>{line!==null&&(log===2&&line===6?<Done>{copy(locale,'Doğru kayıt ve doğru satır. Hata mesajını rastgele değil, dosya ve konum bilgisiyle izledin.','Correct record and line. You traced the error using its file and location rather than guessing.')}</Done>:<p className="activity-feedback error">{copy(locale,'Seçtiğin kayıt veya satır eşleşmiyor. Kırmızı kaydın dosya ve satır bilgisini yeniden oku.','The record and line do not match. Read the red record’s file and line again.')}</p>)}</>;
}

function Mastery({ locale, onComplete }: Omit<LessonActivityProps, 'kind'>) {
  const questions=useMemo(()=>[
    {q:copy(locale,'`using UnityEngine;` ne yapar?','What does `using UnityEngine;` do?'),a:[copy(locale,'Unity türlerine kısa adla erişim sağlar','Allows short-name access to Unity types'),copy(locale,'Oyunu çalıştırır','Runs the game'),copy(locale,'GameObject oluşturur','Creates a GameObject')],right:0},
    {q:copy(locale,'`void awake()` neden sessiz kalabilir?','Why can `void awake()` remain silent?'),a:[copy(locale,'`void` yasaktır','`void` is forbidden'),copy(locale,'Unity tam olarak `Awake` adını bekler','Unity expects the exact name `Awake`'),copy(locale,'Comment eksiktir','A comment is missing')],right:1},
    {q:copy(locale,'Script ile Component ilişkisi hangisidir?','What is the script–Component relationship?'),a:[copy(locale,'Tamamen aynı dosyadır','They are exactly the same file'),copy(locale,'Script kaynaktır; Component derlenmiş sınıfın sahnedeki örneğidir','The script is source; the Component is a scene instance of the compiled class'),copy(locale,'Component yalnızca görseldir','A Component is only visual')],right:1},
  ],[locale]);const [q,setQ]=useState(0);const [wrong,setWrong]=useState(false);const [done,setDone]=useState(false);const current=questions[q];
  return <><ActivityHeader eyebrow={copy(locale,'Ustalık kontrolü','Mastery check')} title={done?copy(locale,'Temel model yerli yerine oturdu.','The foundation is in place.'):current.q} body={copy(locale,'Üç kısa soru. Yanlış cevap puan düşürmez; açıklamayı okuyup yeniden denersin.','Three short questions. A wrong answer does not remove points; read the feedback and try again.')} progress={`${done?3:q+1} / 3`} />{!done&&<div className="choice-list">{current.a.map((x,i)=><button key={x} onClick={()=>{if(i===current.right){setWrong(false);if(q===questions.length-1){setDone(true);onComplete();}else setQ(q+1);}else setWrong(true)}}><b>{String.fromCharCode(65+i)}</b>{x}</button>)}</div>}{wrong&&!done&&<p className="activity-feedback error">{copy(locale,'Bu cevap kavramın görevini karşılamıyor. Terimin kod içinde neyi değiştirdiğini düşün.','This answer does not match the concept’s job. Think about what the term changes in code.')}</p>}{done?<Done>{copy(locale,'Üç soruyu tamamladın. Artık script, sınıf, Component ve Unity callback ayrımını açıklayabilirsin.','You completed all three questions and can explain scripts, classes, Components, and Unity callbacks.')}</Done>:q===questions.length-1&&!wrong&&<p className="activity-note">{copy(locale,'Son soruyu doğru yanıtladığında ders tamamlanacak.','The lesson completes when you answer the final question correctly.')}</p>}</>;
}
