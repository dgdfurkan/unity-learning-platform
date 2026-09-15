import type { Locale } from '../domain/models';

export type LessonStepKind = 'prepare' | 'learn' | 'observe' | 'practice' | 'reflect';
export type LessonActivityKind = 'brief' | 'hotspot' | 'reveal' | 'match' | 'order' | 'fill' | 'inspector' | 'predict' | 'spot' | 'sort' | 'console' | 'code' | 'mastery';

export interface LessonStep {
  id: string;
  kind: LessonStepKind;
  duration: number;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  bullets: Record<Locale, string[]>;
  editorTitle?: Record<Locale, string>;
  editorTask?: Record<Locale, string>;
  details?: Record<Locale, { title: string; body: string }[]>;
  activity?: LessonActivityKind;
}

export interface Lesson {
  id: string;
  order: number;
  duration: number;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  taskTitle: Record<Locale, string>;
  taskBody: Record<Locale, string>;
  successMessage: Record<Locale, string>;
  fileName: string;
  concepts: string[];
  starterCode: string;
  steps: LessonStep[];
}

export interface CoursePlanItem {
  order: number;
  module: number;
  duration: number;
  title: Record<Locale, string>;
}

const text = (tr: string, en: string): Record<Locale, string> => ({ tr, en });
const list = (tr: string[], en: string[]): Record<Locale, string[]> => ({ tr, en });

export const localize = <T>(value: Record<Locale, T>, locale: Locale): T => value[locale];

export const lessons: Lesson[] = [
  {
    id: 'lesson-1', order: 1, duration: 60, fileName: 'FirstScript.cs',
    title: text('C#, Unity ve ilk çalışan script', 'C#, Unity, and your first working script'),
    summary: text('Bir C# dosyasının Unity’de nasıl Component hâline geldiğini anlayıp Console’a bilinçli çıktı gönder.', 'Understand how a C# file becomes a Unity Component and deliberately write output to the Console.'),
    taskTitle: text('İlk scriptin derlenebilir iskeletini kur.', 'Build the compilable skeleton of your first script.'),
    taskBody: text('`FirstScript` sınıfını `MonoBehaviour` sınıfından türet, `Start` metodunu doğru yaz ve `Debug.Log("Unity hazır");` satırını metodun içine yerleştir.', 'Derive `FirstScript` from `MonoBehaviour`, declare `Start` correctly, and place `Debug.Log("Unity ready");` inside the method.'),
    successMessage: text('Script yapısı doğru. Artık Unity’nin bu kodu ne zaman çağırdığını açıklayabilirsin.', 'The script structure is correct. You can now explain when Unity calls this code.'),
    concepts: ['class', 'MonoBehaviour', 'Start', 'Debug.Log', 'Console'],
    starterCode: '',
    steps: [
      { id: 'l1-brief', kind: 'prepare', activity: 'brief', duration: 3, title: text('Nasıl öğreneceğiz?', 'How will we learn?'), description: text('Önce gör, sonra dene, kendi cümlenle açıkla ve en son kodu yaz.', 'First see, then try, explain it in your own words, and finally write the code.'), bullets: list(['Kod editörü dersin tamamı değil, son doğrulama alanıdır', 'Yanlış cevap cezalandırılmaz; açıklanır ve yeniden denenir'], ['The editor is not the whole lesson; it is the final verification space', 'Wrong answers are explained and tried again']) },
      { id: 'l1-hotspot', kind: 'observe', activity: 'hotspot', duration: 7, title: text('Unity Editor panel avı', 'Unity Editor panel hunt'), description: text('Hierarchy, Scene, Game, Inspector, Project ve Console panellerini etkileşimli bir editör haritasında keşfet.', 'Explore Hierarchy, Scene, Game, Inspector, Project, and Console on an interactive editor map.'), bullets: list(['Her panel farklı bir soruya cevap verir', 'Panel adını değil, sorumluluğunu öğren'], ['Each panel answers a different question', 'Learn responsibilities rather than labels']) },
      { id: 'l1-reveal', kind: 'learn', activity: 'reveal', duration: 4, title: text('Script, class ve Component', 'Script, class, and Component'), description: text('Birbirine benzeyen dört kavramın aynı şey olmadığını kartları açarak gör.', 'Reveal why four similar concepts are not the same thing.'), bullets: list(['Script kaynak dosyadır', 'Class şablondur', 'Component sahnedeki örnektir'], ['A script is a source file', 'A class is a blueprint', 'A Component is the scene instance']) },
      { id: 'l1-match', kind: 'practice', activity: 'match', duration: 4, title: text('Sembolü görevine bağla', 'Match syntax to responsibility'), description: text('`using`, `class`, `MonoBehaviour` ve scope işaretlerini görevleriyle eşleştir.', 'Match `using`, `class`, `MonoBehaviour`, and scope markers to their jobs.'), bullets: list(['Sembol ezberleme; kodda neyi değiştirdiğini söyle', 'Yanlış eşleşmede yeniden düşün'], ['Do not memorise symbols; state what they change', 'Reconsider after a wrong match']) },
      { id: 'l1-order', kind: 'practice', activity: 'order', duration: 5, title: text('İskeleti sıraya koy', 'Order the skeleton'), description: text('Bir C# dosyasının temel satırlarını doğru sıraya getir.', 'Place the basic lines of a C# file in the correct order.'), bullets: list(['`using` sınıfın dışında kalır', 'Süslü parantezler sınıf scope’unu çevreler'], ['`using` stays outside the class', 'Braces surround the class scope']) },
      { id: 'l1-fill', kind: 'practice', activity: 'fill', duration: 5, title: text('Sınıf bildirimini tamamla', 'Complete the class declaration'), description: text('Hazır seçenekleri doğru boşluklara yerleştirerek sözdizimini tanı.', 'Recognise the syntax by placing tokens into the correct blanks.'), bullets: list(['`public` erişimi belirler', '`:` kalıtımı ifade eder'], ['`public` defines access', '`:` expresses inheritance']) },
      { id: 'l1-inspector', kind: 'observe', activity: 'inspector', duration: 5, title: text('Koddan Inspector’a', 'From code to Inspector'), description: text('Serileştirilmiş bir değeri değiştir, Play’e bas ve Console çıktısını izle.', 'Change a serialised value, press Play, and observe the Console output.'), bullets: list(['Inspector koddan kopuk bir form değildir', 'Değer her Component örneğine aittir'], ['The Inspector is not detached from code', 'The value belongs to each Component instance']) },
      { id: 'l1-predict', kind: 'prepare', activity: 'predict', duration: 4, title: text('Önce tahmin et: Awake', 'Predict first: Awake'), description: text('`Awake` ile `awake` arasındaki farkı kodu çalıştırmadan önce tahmin et.', 'Predict the difference between `Awake` and `awake` before execution.'), bullets: list(['C# case-sensitive çalışır', 'Unity callback adını birebir arar'], ['C# is case-sensitive', 'Unity looks for the exact callback name']) },
      { id: 'l1-spot', kind: 'practice', activity: 'spot', duration: 5, title: text('Hatalı satırı bul', 'Find the faulty line'), description: text('Kod bloğuna yazılan düz Türkçe cümlenin neden komut olmadığını bul.', 'Find why a plain sentence inside a code block is not a statement.'), bullets: list(['Comment `//` ile başlar', 'Console mesajı `Debug.Log("...");` biçimindedir'], ['A comment begins with `//`', 'A Console message uses `Debug.Log("...");`']) },
      { id: 'l1-sort', kind: 'practice', activity: 'sort', duration: 4, title: text('Değerleri tür kutularına ayır', 'Sort values into type buckets'), description: text('İkinci derse hazırlık olarak `int`, `string` ve `bool` değerlerini sınıflandır.', 'Prepare for lesson two by classifying `int`, `string`, and `bool` values.'), bullets: list(['Tür, değerin nasıl yorumlandığını belirler', 'Metin çift tırnak içinde yazılır'], ['A type determines how a value is interpreted', 'Strings use double quotes']) },
      { id: 'l1-console', kind: 'observe', activity: 'console', duration: 5, title: text('Console dedektifi', 'Console detective'), description: text('Kırmızı hata kaydından doğru dosya ve satıra ilerle.', 'Trace a red error record to the correct file and line.'), bullets: list(['Önce severity, sonra hata kodu', 'Dosya ve satır numarası rastgele aramayı bitirir'], ['Read severity, then the code', 'File and line eliminate guessing']) },
      { id: 'l1-code', kind: 'practice', activity: 'code', duration: 7, title: text('Sıfırdan çalışan script yaz', 'Write a working script from scratch'), description: text('Artık hazır iskelet yok: öğrendiğin parçaları boş dosyada birleştir ve tüm scriptleri birlikte doğrula.', 'There is no prepared skeleton: combine what you learned in a blank file and validate all scripts together.'), bullets: list(['`using UnityEngine;` ile başla', '`FirstScript : MonoBehaviour` sınıfını kur', '`Start` içinde `Debug.Log("Unity hazır");` çalıştır', 'İkinci script aç, dosya–sınıf eşleşmesini dene ve sonra sil'], ['Start with `using UnityEngine;`', 'Build `FirstScript : MonoBehaviour`', 'Run `Debug.Log("Unity ready");` inside `Start`', 'Open a second script, test file–class matching, then delete it']), editorTitle: text('Bağımsız uygulama: FirstScript.cs', 'Independent practice: FirstScript.cs'), editorTask: text('Boş dosyada scripti tamamen kendin oluştur. “Kodu kontrol et” düğmesi tüm açık scriptleri tarar ve Problems panelinde sonuçları dosya dosya ayırır; bir hataya dokunduğunda ilgili script ve satır açılır.', 'Build the complete script yourself in the blank file. “Check code” scans every open script and groups the results by file in Problems; tapping a problem opens its script and line.') },
      { id: 'l1-mastery', kind: 'reflect', activity: 'mastery', duration: 2, title: text('Ustalık kontrolü', 'Mastery check'), description: text('Üç kısa soruyla kavramları ezberden değil, görevleri üzerinden geri çağır.', 'Recall concepts by responsibility rather than memorisation in three short questions.'), bullets: list(['Yanlış cevap puan düşürmez', 'Doğru cevabın nedenini sesli açıkla'], ['Wrong answers do not remove points', 'Explain why the correct answer is right']) },
    ],
  },
  {
    id: 'lesson-2', order: 2, duration: 60, fileName: 'PlayerState.cs',
    title: text('Değişkenler, türler ve isimlendirme', 'Variables, types, and naming'),
    summary: text('`int`, `bool` ve `string` değerlerini oyun durumuna bağla; C# isimlerinin neden birebir eşleşmesi gerektiğini gör.', 'Connect `int`, `bool`, and `string` values to game state and see why C# identifiers must match exactly.'),
    taskTitle: text('Oyuncu durumunu doğru türlerle modelle.', 'Model player state with the correct types.'),
    taskBody: text('`packageCount`, `isGameActive` ve `playerName` değişkenlerini istenen türlerde tanımla. Ardından `Debug.Log(packageCount);` ile aynı değişkeni yazdır. `packagecount` ile `packageCount` C# için aynı isim değildir.', 'Declare `packageCount`, `isGameActive`, and `playerName` with the requested types. Then print the exact same variable using `Debug.Log(packageCount);`. In C#, `packagecount` and `packageCount` are different identifiers.'),
    successMessage: text('Türler ve isimler birbiriyle tutarlı. Değerler artık güvenle okunabilir.', 'Types and identifiers are consistent. The values can now be read safely.'),
    concepts: ['int', 'bool', 'string', 'camelCase', 'identifier'],
    starterCode: '',
    steps: [
      { id: 'l2-recall', kind: 'prepare', duration: 5, title: text('Ön bilgiyi geri çağır', 'Recall prior knowledge'), description: text('Bir önceki dersten sınıf, metod ve Console akışını kısa bir sözlü tekrar ile kur.', 'Rebuild the class, method, and Console flow from the previous lesson in a short verbal recall.'), bullets: list(['`Start` ne zaman çalışır?', '`Debug.Log` hangi probleme cevap verir?'], ['When does `Start` run?', 'What problem does `Debug.Log` answer?']) },
      { id: 'l2-types', kind: 'learn', duration: 15, title: text('Değer ve tür ayrımı', 'Values and types'), description: text('Bir değerin bellekte neyi temsil ettiğini ve yanlış tür seçiminin oyundaki etkisini karşılaştır.', 'Compare what a value represents in memory and how a wrong type affects the game.'), bullets: list(['`int`: adet ve tam sayı', '`bool`: iki durumlu karar', '`string`: oyuncuya veya geliştiriciye gösterilen metin'], ['`int`: counts and whole numbers', '`bool`: two-state decisions', '`string`: text shown to players or developers']) },
      { id: 'l2-naming', kind: 'observe', duration: 10, title: text('İsimlendirme ve case sensitivity', 'Naming and case sensitivity'), description: text('C# sembol tablosunda `packageCount` ile `packagecount` farklı kayıtlardır. Hata mesajını ezberlemek yerine nedeni okunur.', 'In the C# symbol table, `packageCount` and `packagecount` are different entries. Read the cause instead of memorising the error.'), bullets: list(['Yerel ve alan değişkenlerinde `camelCase`', '`CS0103`: geçerli bağlamda bulunamayan isim'], ['Use `camelCase` for local variables and fields', '`CS0103`: a name that does not exist in the current context']) },
      { id: 'l2-code', kind: 'practice', duration: 20, title: text('Tür güvenli kod uygulaması', 'Type-safe coding practice'), description: text('Üç farklı türü tanımla ve doğru sembolü Console’a gönder. Bilerek harf hatası yapıp tanıyı oku, sonra düzelt.', 'Declare three different types and send the correct symbol to the Console. Intentionally change identifier casing, read the diagnostic, then fix it.'), bullets: list(['Tanım ile kullanım birebir aynı olmalı', 'Metin değeri çift tırnak içinde olmalı'], ['Declaration and usage must match exactly', 'String values must be inside double quotes']) },
      { id: 'l2-transfer', kind: 'reflect', duration: 10, title: text('Oyuna aktarım', 'Transfer to a game'), description: text('Aynı türleri farklı bir oyun fikrine taşı: skor, oyun durumu ve oyuncu adı.', 'Transfer the same types to another game idea: score, game state, and player name.'), bullets: list(['Her değişkenin neden o türde olduğunu açıkla', 'Yanlış isimlendirmeyi hata koduyla tarif et'], ['Explain why each variable uses its type', 'Describe incorrect naming with its diagnostic code']) },
    ],
  },
  {
    id: 'lesson-3', order: 3, duration: 60, fileName: 'GameDecision.cs',
    title: text('Operatörler ve koşullu kararlar', 'Operators and conditional decisions'),
    summary: text('Karşılaştırma sonucunu `if`, `else if` ve `else` bloklarıyla oyun davranışına dönüştür.', 'Turn comparison results into game behaviour with `if`, `else if`, and `else` blocks.'),
    taskTitle: text('Can değerine göre oyun kararını üret.', 'Make a game decision from the lives value.'),
    taskBody: text('`lives` değerini `int` olarak tanımla. `lives > 0` olduğunda “Devam”, aksi durumda “Oyun bitti” mesajını yazdıran `if/else` yapısını kur.', 'Declare `lives` as an `int`. Build an `if/else` statement that prints “Continue” when `lives > 0` and “Game over” otherwise.'),
    successMessage: text('Koşul iki olası yolu da kapsıyor ve oyun durumu doğru okunuyor.', 'The condition covers both possible paths and reads the game state correctly.'),
    concepts: ['if', 'else', '>', '==', '!', 'bool'],
    starterCode: '',
    steps: [
      { id: 'l3-recall', kind: 'prepare', duration: 5, title: text('Türleri geri çağır', 'Recall the types'), description: text('Bir koşulun neden `bool` sonuç ürettiğini değişken bilgisiyle ilişkilendir.', 'Relate variable knowledge to why a condition produces a `bool` result.'), bullets: list(['`lives > 0` ifadesinin sonucu nedir?', '`!` operatörü hangi değeri tersine çevirir?'], ['What is the result of `lives > 0`?', 'Which value does the `!` operator invert?']) },
      { id: 'l3-operators', kind: 'learn', duration: 15, title: text('Karşılaştırma ve mantık operatörleri', 'Comparison and logical operators'), description: text('`=`, `==`, `!=`, `>`, `<`, `&&`, `||` ifadelerini görevlerine göre ayır.', 'Separate `=`, `==`, `!=`, `>`, `<`, `&&`, and `||` by responsibility.'), bullets: list(['Atama ile karşılaştırmayı karıştırmamak', 'Birden fazla koşulu okunabilir biçimde birleştirmek'], ['Do not confuse assignment with comparison', 'Combine multiple conditions readably']) },
      { id: 'l3-flow', kind: 'observe', duration: 10, title: text('Karar akışını izle', 'Trace the decision flow'), description: text('Aynı kodu farklı `lives` değerleriyle zihinsel olarak çalıştır ve yalnızca bir dalın seçildiğini gözle.', 'Mentally execute the same code with different `lives` values and observe that only one branch is selected.'), bullets: list(['0, 1 ve -1 için sonucu tahmin et', 'Ulaşılamayan veya kapsanmayan durumu fark et'], ['Predict the result for 0, 1, and -1', 'Notice unreachable or uncovered states']) },
      { id: 'l3-code', kind: 'practice', duration: 20, title: text('Koşul uygulaması', 'Conditional practice'), description: text('İki yolu da yaz, değerleri değiştir ve her çalıştırmadan önce beklenen çıktıyı söyle.', 'Write both paths, change the value, and state the expected output before each run.'), bullets: list(['Süslü parantezlerin scope’unu koru', 'Her dalda gözlemlenebilir bir çıktı üret'], ['Preserve brace scope', 'Produce observable output in every branch']) },
      { id: 'l3-transfer', kind: 'reflect', duration: 10, title: text('Kararı başka sisteme taşı', 'Transfer the decision'), description: text('Can kontrolünü reklam hakkı, enerji veya bölüm kilidi gibi farklı bir sisteme sözlü olarak uyarla.', 'Verbally adapt the lives check to another system such as ad continues, energy, or level locks.'), bullets: list(['Koşul ile sonuç arasındaki bağı açıkla', 'Bir edge case belirle'], ['Explain the link between condition and outcome', 'Identify one edge case']) },
    ],
  },
  {
    id: 'lesson-4', order: 4, duration: 60, fileName: 'LifecycleProbe.cs',
    title: text('Metodlar ve Unity yaşam döngüsü', 'Methods and the Unity lifecycle'),
    summary: text('`Awake`, `OnEnable`, `Start`, `Update`, `FixedUpdate` ve `LateUpdate` metodlarını doğru sorumluluklarla ayır.', 'Separate `Awake`, `OnEnable`, `Start`, `Update`, `FixedUpdate`, and `LateUpdate` by responsibility.'),
    taskTitle: text('Yaşam döngüsü sırasını gözlemlenebilir yap.', 'Make the lifecycle order observable.'),
    taskBody: text('`Awake`, `OnEnable` ve `Start` metodlarını ekle; her birinin içine metodun adını yazdıran bir `Debug.Log` koy. Sürekli fizik kuvvetini `FixedUpdate`, kamera takibini `LateUpdate` ile ilişkilendir.', 'Add `Awake`, `OnEnable`, and `Start`, each with a `Debug.Log` containing its method name. Associate continuous physics forces with `FixedUpdate` and camera follow with `LateUpdate`.'),
    successMessage: text('Başlangıç sırası görünür ve metod sorumlulukları doğru ayrılmış.', 'The startup order is visible and method responsibilities are separated correctly.'),
    concepts: ['Awake', 'OnEnable', 'Start', 'Update', 'FixedUpdate', 'LateUpdate'],
    starterCode: '',
    steps: [
      { id: 'l4-recall', kind: 'prepare', duration: 5, title: text('Metod yapısını geri çağır', 'Recall method structure'), description: text('Bir metodun adı, parantezleri, dönüş türü ve gövdesini ayırt et.', 'Identify a method name, parentheses, return type, and body.'), bullets: list(['`void` neyi ifade eder?', 'Scope hangi süslü parantezlerde biter?'], ['What does `void` mean?', 'At which brace does the scope end?']) },
      { id: 'l4-order', kind: 'learn', duration: 15, title: text('Başlatma sırası', 'Initialisation order'), description: text('Referans kurma, etkinleşme ve ilk oyun karesi hazırlığını farklı metodlara dağıt.', 'Distribute reference setup, enable-time work, and first-frame preparation across different methods.'), bullets: list(['`Awake`: nesnenin kendi iç hazırlığı', '`OnEnable`: her etkinleşmede abonelik', '`Start`: ilk aktif kare öncesi başlangıç'], ['`Awake`: internal object setup', '`OnEnable`: subscriptions on every enable', '`Start`: initial setup before the first active frame']) },
      { id: 'l4-frames', kind: 'observe', duration: 10, title: text('Frame ve fizik ritmi', 'Frame and physics timing'), description: text('Render frame’i ile sabit fizik adımının aynı şey olmadığını örnek zaman çizelgesinde gör.', 'Use a sample timeline to see that render frames and fixed physics steps are not the same.'), bullets: list(['Input okuma: çoğunlukla `Update`', 'Rigidbody kuvveti: `FixedUpdate`', 'Kamera takibi: `LateUpdate`'], ['Read input: usually `Update`', 'Rigidbody forces: `FixedUpdate`', 'Camera follow: `LateUpdate`']) },
      { id: 'l4-code', kind: 'practice', duration: 20, title: text('Yaşam döngüsü probu', 'Lifecycle probe'), description: text('Başlangıç metotlarını yaz ve Console sırasını gözlemle. GameObject’i kapatıp açarak `OnEnable` farkını gör.', 'Write the initialisation methods and observe their Console order. Disable and enable the GameObject to see how `OnEnable` differs.'), bullets: list(['Metod adlarını birebir doğru yaz', 'Her metoda ayırt edilebilir mesaj koy'], ['Spell method names exactly', 'Give each method a distinguishable message']) },
      { id: 'l4-transfer', kind: 'reflect', duration: 10, title: text('Sorumluluk seçimi', 'Choose responsibilities'), description: text('Verilen altı işi doğru Unity metoduna yerleştir ve nedenini söyle.', 'Place six example responsibilities in the correct Unity method and explain why.'), bullets: list(['Her frame çalışan kodun maliyetini düşün', 'Gereksiz `Update` kullanımını ayıkla'], ['Consider the cost of per-frame code', 'Remove unnecessary `Update` usage']) },
    ],
  },
  {
    id: 'lesson-5', order: 5, duration: 60, fileName: 'PlayerContact.cs',
    title: text('GameObject, Component ve ilk fizik teması', 'GameObjects, Components, and first physics contact'),
    summary: text('Transform, Rigidbody ve Collider görevlerini ayır; trigger olayını kodla ve önceki dört dersten bilgileri geri çağır.', 'Separate Transform, Rigidbody, and Collider responsibilities, code a trigger event, and recall knowledge from the first four lessons.'),
    taskTitle: text('Trigger temasını güvenli biçimde yakala.', 'Handle a trigger contact safely.'),
    taskBody: text('`playerRigidbody` alanını `[SerializeField] private Rigidbody` olarak tanımla. `OnTriggerEnter(Collider other)` metodunda temas eden nesnenin adını `Debug.Log(other.name);` ile yazdır.', 'Declare `playerRigidbody` as a `[SerializeField] private Rigidbody` field. In `OnTriggerEnter(Collider other)`, print the contacting object name with `Debug.Log(other.name);`.'),
    successMessage: text('Component referansı ve trigger callback’i doğru kuruldu. İlk beş dersin kavramları tek davranışta birleşti.', 'The Component reference and trigger callback are correct. Concepts from the first five lessons now work together.'),
    concepts: ['GameObject', 'Component', 'Transform', 'Rigidbody', 'Collider', 'OnTriggerEnter', 'SerializeField'],
    starterCode: '',
    steps: [
      { id: 'l5-recall', kind: 'prepare', duration: 10, title: text('Aralıklı tekrar turu', 'Spaced recall round'), description: text('İlk dört dersten seçilen kısa soruları koda bakmadan cevapla.', 'Answer selected questions from the first four lessons without looking at code.'), bullets: list(['Tür ile değer farkı', '`if` sonucu ve scope', '`Start` ile `Update` farkı', 'Case-sensitive bir hata örneği'], ['Type versus value', '`if` result and scope', '`Start` versus `Update`', 'One case-sensitive error example']) },
      { id: 'l5-components', kind: 'learn', duration: 15, title: text('Unity nesne modeli', 'Unity object model'), description: text('GameObject’i bir taşıyıcı, Component’leri davranış ve veri parçaları olarak oku.', 'Read a GameObject as a container and Components as pieces of data and behaviour.'), bullets: list(['Her GameObject’te `Transform` bulunur', '`Rigidbody` fizik hareketini yönetir', '`Collider` fiziksel sınırı veya trigger alanını tanımlar'], ['Every GameObject has a `Transform`', '`Rigidbody` manages physics motion', '`Collider` defines a physical boundary or trigger volume']) },
      { id: 'l5-trigger', kind: 'observe', duration: 10, title: text('Collision ve trigger ayrımı', 'Collision versus trigger'), description: text('Katı temas ile içinden geçilebilen olay alanını sahnede karşılaştır.', 'Compare solid contact with a pass-through event volume in the scene.'), bullets: list(['`Is Trigger` açık ve kapalı davranış', 'Katman ve collider yapılandırmasının callback’e etkisi'], ['Behaviour with `Is Trigger` on and off', 'How layers and collider configuration affect callbacks']) },
      { id: 'l5-code', kind: 'practice', duration: 20, title: text('Component referansı ve callback', 'Component reference and callback'), description: text('Inspector’dan verilen Rigidbody referansını tanımla ve trigger callback’inde temas eden nesneyi gözlemle.', 'Declare the Rigidbody reference assigned through the Inspector and observe the contacting object in the trigger callback.'), bullets: list(['`public` yerine gerektiğinde `[SerializeField] private`', 'Parametre adı tanım ve kullanımda aynı olmalı'], ['Prefer `[SerializeField] private` over `public` when appropriate', 'The parameter name must match between declaration and usage']) },
      { id: 'l5-reflect', kind: 'reflect', duration: 5, title: text('İlk bölüm kontrolü', 'First module check'), description: text('Beş dersin sonunda kodu okuyup davranışı tahmin et; bilmediğin kısmı doğru teknik kelimeyle sor.', 'After five lessons, read code and predict behaviour; ask about unknown parts using the correct technical term.'), bullets: list(['Bir sonraki tekrar kuyruğuna iki zayıf kavram ekle', 'Küçük proje fikrinde bu callback’in görevini belirle'], ['Add two weak concepts to the next review queue', 'Choose a responsibility for this callback in a small project idea']) },
    ],
  },
];

const planTitles: [string, string][] = [
  ['C#, Unity ve ilk çalışan script', 'C#, Unity, and your first working script'],
  ['Değişkenler, türler ve isimlendirme', 'Variables, types, and naming'],
  ['Operatörler ve koşullu kararlar', 'Operators and conditional decisions'],
  ['Metodlar ve Unity yaşam döngüsü', 'Methods and the Unity lifecycle'],
  ['GameObject, Component ve ilk fizik teması', 'GameObjects, Components, and first physics contact'],
  ['Döngüler ve koleksiyonlara giriş', 'Loops and an introduction to collections'],
  ['Diziler, List ve veri dolaşımı', 'Arrays, Lists, and data iteration'],
  ['Class, object ve sorumluluk ayrımı', 'Classes, objects, and responsibility'],
  ['Encapsulation: private, public, SerializeField', 'Encapsulation: private, public, SerializeField'],
  ['Prefab ve yeniden kullanılabilir yapı', 'Prefabs and reusable structure'],
  ['Transform, yönler ve koordinat uzayları', 'Transform, directions, and coordinate spaces'],
  ['Input System ve oyuncu kontrolü', 'Input System and player control'],
  ['Rigidbody hareketi ve kuvvetler', 'Rigidbody movement and forces'],
  ['Collision, trigger ve layer matrisi', 'Collisions, triggers, and the layer matrix'],
  ['Kamera takibi ve LateUpdate', 'Camera follow and LateUpdate'],
  ['UI temelleri ve responsive Canvas', 'UI fundamentals and responsive Canvas'],
  ['Event, delegate ve gevşek bağlı iletişim', 'Events, delegates, and decoupled communication'],
  ['ScriptableObject ile veri tasarımı', 'Data design with ScriptableObjects'],
  ['State machine ile oyun akışı', 'Game flow with a state machine'],
  ['Object pooling ve mobil performans', 'Object pooling and mobile performance'],
  ['Async akışlar ve sahne yükleme', 'Async flows and scene loading'],
  ['DOTween ve üçüncü parti paket yönetimi', 'DOTween and third-party package management'],
  ['Git, SourceTree ve güvenli branch akışı', 'Git, SourceTree, and a safe branch workflow'],
  ['Idle ekonomi ve kayıt sistemi', 'Idle economy and save systems'],
  ['Endless runner dikey dilimi', 'Endless runner vertical slice'],
  ['Reklam, analitik ve etik monetizasyon', 'Ads, analytics, and ethical monetisation'],
  ['Profiling, build ve cihaz testleri', 'Profiling, builds, and device testing'],
  ['Polish, yayın kontrolü ve final sunumu', 'Polish, release checks, and final presentation'],
];

export const coursePlan: CoursePlanItem[] = planTitles.map(([tr, en], index) => ({
  order: index + 1,
  module: index < 5 ? 1 : index < 10 ? 2 : index < 15 ? 3 : index < 20 ? 4 : index < 24 ? 5 : 6,
  duration: 60,
  title: text(tr, en),
}));

export const getLesson = (lessonId: string): Lesson => lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
