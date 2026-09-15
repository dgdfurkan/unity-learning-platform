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
{ id: 'l1-hotspot', kind: 'observe', activity: 'hotspot', duration: 6, title: text('Unity Editor panel avı', 'Unity Editor panel hunt'), description: text('Hierarchy, Scene, Game, Inspector, Project ve Console panellerini etkileşimli bir editör haritasında keşfet.', 'Explore Hierarchy, Scene, Game, Inspector, Project, and Console on an interactive editor map.'), bullets: list(['Her panel farklı bir soruya cevap verir', 'Panel adını değil, sorumluluğunu öğren'], ['Each panel answers a different question', 'Learn responsibilities rather than labels']) },
      { id: 'l1-reveal', kind: 'learn', activity: 'reveal', duration: 3, title: text('Script, class ve Component', 'Script, class, and Component'), description: text('Birbirine benzeyen dört kavramın aynı şey olmadığını kartları açarak gör.', 'Reveal why four similar concepts are not the same thing.'), bullets: list(['Script kaynak dosyadır', 'Class şablondur', 'Component sahnedeki örnektir'], ['A script is a source file', 'A class is a blueprint', 'A Component is the scene instance']) },
      { id: 'l1-match', kind: 'practice', activity: 'match', duration: 3, title: text('Sembolü görevine bağla', 'Match syntax to responsibility'), description: text('`using`, `class`, `MonoBehaviour` ve scope işaretlerini görevleriyle eşleştir.', 'Match `using`, `class`, `MonoBehaviour`, and scope markers to their jobs.'), bullets: list(['Sembol ezberleme; kodda neyi değiştirdiğini söyle', 'Yanlış eşleşmede yeniden düşün'], ['Do not memorise symbols; state what they change', 'Reconsider after a wrong match']) },
      { id: 'l1-order', kind: 'practice', activity: 'order', duration: 4, title: text('İskeleti sıraya koy', 'Order the skeleton'), description: text('Bir C# dosyasının temel satırlarını doğru sıraya getir.', 'Place the basic lines of a C# file in the correct order.'), bullets: list(['`using` sınıfın dışında kalır', 'Süslü parantezler sınıf scope’unu çevreler'], ['`using` stays outside the class', 'Braces surround the class scope']) },
      { id: 'l1-fill', kind: 'practice', activity: 'fill', duration: 4, title: text('Sınıf bildirimini tamamla', 'Complete the class declaration'), description: text('Hazır seçenekleri doğru boşluklara yerleştirerek sözdizimini tanı.', 'Recognise the syntax by placing tokens into the correct blanks.'), bullets: list(['`public` erişimi belirler', '`:` kalıtımı ifade eder'], ['`public` defines access', '`:` expresses inheritance']) },
      { id: 'l1-inspector', kind: 'observe', activity: 'inspector', duration: 5, title: text('Koddan Inspector’a', 'From code to Inspector'), description: text('Serileştirilmiş bir değeri değiştir, Play’e bas ve Console çıktısını izle.', 'Change a serialised value, press Play, and observe the Console output.'), bullets: list(['Inspector koddan kopuk bir form değildir', 'Değer her Component örneğine aittir'], ['The Inspector is not detached from code', 'The value belongs to each Component instance']) },
      { id: 'l1-predict', kind: 'prepare', activity: 'predict', duration: 6, title: text('Önce tahmin et: Awake', 'Predict first: Awake'), description: text('`Awake` ile `awake` arasındaki farkı kodu çalıştırmadan önce tahmin et.', 'Predict the difference between `Awake` and `awake` before execution.'), bullets: list(['C# case-sensitive çalışır', 'Unity callback adını birebir arar'], ['C# is case-sensitive', 'Unity looks for the exact callback name']) },
      { id: 'l1-spot', kind: 'practice', activity: 'spot', duration: 5, title: text('Hatalı satırı bul', 'Find the faulty line'), description: text('Kod bloğuna yazılan düz Türkçe cümlenin neden komut olmadığını bul.', 'Find why a plain sentence inside a code block is not a statement.'), bullets: list(['Comment `//` ile başlar', 'Console mesajı `Debug.Log("...");` biçimindedir'], ['A comment begins with `//`', 'A Console message uses `Debug.Log("...");`']) },
      { id: 'l1-sort', kind: 'practice', activity: 'sort', duration: 7, title: text('Değerleri tür kutularına ayır', 'Sort values into type buckets'), description: text('İkinci derse hazırlık olarak `int`, `string` ve `bool` değerlerini sınıflandır.', 'Prepare for lesson two by classifying `int`, `string`, and `bool` values.'), bullets: list(['Tür, değerin nasıl yorumlandığını belirler', 'Metin çift tırnak içinde yazılır'], ['A type determines how a value is interpreted', 'Strings use double quotes']) },
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
      { id: 'l2-recall', kind: 'prepare', activity: 'brief', duration: 5, title: text('Ön bilgiyi geri çağır', 'Recall prior knowledge'), description: text('Script iskeletini bir oyun davranışına bağlayarak önceki dersten kalan zihinsel modeli etkinleştir.', 'Activate the previous lesson’s mental model by connecting a script skeleton to game behaviour.'), bullets: list(['Önce tahmin et, sonra açıklamayı aç', '`Start` ile `Debug.Log` arasındaki akışı kur'], ['Predict first, then reveal the explanation', 'Connect `Start` to `Debug.Log`']) },
      { id: 'l2-anatomy', kind: 'learn', activity: 'match', duration: 8, title: text('Değişkenin dört parçası', 'The four parts of a variable'), description: text('Tür, isim, atama operatörü ve değerin aynı satırdaki ayrı sorumluluklarını gör.', 'See the separate responsibilities of type, identifier, assignment operator, and value on one line.'), bullets: list(['`int packageCount = 3;` satırını parçala', 'Her parçayı yaptığı işle eşleştir'], ['Dissect `int packageCount = 3;`', 'Match every part to its job']) },
      { id: 'l2-types', kind: 'practice', activity: 'sort', duration: 8, title: text('Değeri doğru veri türüne gönder', 'Send the value to the correct type'), description: text('Oyun durumlarından gelen on iki gerçek değeri `int`, `string` ve `bool` kutularına ayır.', 'Sort twelve real game-state values into `int`, `string`, and `bool` buckets.'), bullets: list(['Kod biçimini ve tırnakları dikkatle oku', 'Yanlış seçimde değerin neden o türe ait olmadığını gör'], ['Read code formatting and quotation marks carefully', 'See why a wrong choice does not fit the type']) },
      { id: 'l2-state', kind: 'observe', activity: 'inspector', duration: 8, title: text('Canlı oyun durumu laboratuvarı', 'Live game-state laboratory'), description: text('Inspector benzeri kontrolleri değiştir; kod, bellek kartı ve oyun HUD’ının birlikte nasıl güncellendiğini izle.', 'Change Inspector-like controls and watch code, memory, and the game HUD update together.'), bullets: list(['Değişken bir etikete değil, değişebilen duruma işaret eder', 'Aynı değer farklı yüzeylerde farklı biçimde gösterilebilir'], ['A variable points to changing state, not merely a label', 'The same value can appear differently across surfaces']) },
      { id: 'l2-naming', kind: 'observe', activity: 'spot', duration: 8, title: text('İsim avcısı: case sensitivity', 'Identifier detective: case sensitivity'), description: text('`packageCount` ile `packagecount` arasındaki tek harflik farkın neden `CS0103` ürettiğini sembol tablosunda izle.', 'Trace why the one-letter difference between `packageCount` and `packagecount` causes `CS0103` in the symbol table.'), bullets: list(['Tanım ve kullanım birebir eşleşir', '`camelCase` okunabilirlik kuralıdır; eşleşme ise derleyici kuralıdır'], ['Declaration and use match exactly', '`camelCase` is a readability convention; exact matching is a compiler rule']) },
      { id: 'l2-fields', kind: 'learn', activity: 'match', duration: 8, title: text('Alan, yerel değişken ve Inspector', 'Fields, locals, and the Inspector'), description: text('Bir değerin nerede yaşadığına göre scope’unu ve Inspector’da görünüp görünmediğini belirle.', 'Determine a value’s scope and Inspector visibility from where it lives.'), bullets: list(['Yerel değişken yalnızca metodun içindedir', '`[SerializeField] private` kontrollü Inspector erişimi sağlar'], ['A local variable only exists inside its method', '`[SerializeField] private` provides controlled Inspector access']) },
      { id: 'l2-code', kind: 'practice', activity: 'code', duration: 10, title: text('Tür güvenli kod uygulaması', 'Type-safe coding practice'), description: text('Üç farklı türü sıfırdan tanımla; bilinçli bir büyük/küçük harf hatası üret, tanıyı oku ve düzelt.', 'Declare three types from scratch; create an intentional casing error, read the diagnostic, and fix it.'), bullets: list(['Tanım ile kullanım birebir aynı olmalı', 'Metin değeri çift tırnak içinde olmalı'], ['Declaration and usage must match exactly', 'String values must be inside double quotes']) },
      { id: 'l2-mastery', kind: 'reflect', activity: 'mastery', duration: 5, title: text('Tür ve isim ustalık kontrolü', 'Type and naming mastery check'), description: text('Yeni bir oyun senaryosunda tür, isim ve scope kararlarını birlikte ver.', 'Make type, identifier, and scope decisions together in a new game scenario.'), bullets: list(['Kuralı yeni bağlama aktar', 'Doğru seçeneğin nedenini teknik terimle açıkla'], ['Transfer the rule to a new context', 'Explain the correct answer with technical language']) },
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
      { id: 'l3-recall', kind: 'prepare', activity: 'brief', duration: 5, title: text('Bool bilgisini geri çağır', 'Recall boolean knowledge'), description: text('Bir karşılaştırmanın neden sayı değil `bool` ürettiğini önce tahmin et, sonra akış üzerinde gör.', 'Predict why a comparison produces a `bool` rather than a number, then inspect the flow.'), bullets: list(['Değer ile soruyu ayır', '`lives > 0` bir karar sorusudur'], ['Separate the value from the question', '`lives > 0` is a decision question']) },
      { id: 'l3-operators', kind: 'learn', activity: 'match', duration: 8, title: text('Operatörleri görevlerine bağla', 'Match operators to responsibilities'), description: text('Atama, karşılaştırma ve mantık operatörlerini görünüşlerine değil ürettikleri sonuca göre sınıflandır.', 'Classify assignment, comparison, and logical operators by their result rather than appearance.'), bullets: list(['`=` ile `==` aynı işlem değildir', '`&&`, `||` ve `!` bool değerlerle çalışır'], ['`=` and `==` are different operations', '`&&`, `||`, and `!` work with booleans']) },
      { id: 'l3-compare', kind: 'observe', activity: 'inspector', duration: 7, title: text('Karşılaştırma simülatörü', 'Comparison simulator'), description: text('Can değerini değiştirerek `>`, `==` ve `!=` sonuçlarının anlık değişimini izle.', 'Change the lives value and watch `>`, `==`, and `!=` results update immediately.'), bullets: list(['Önce sonucu tahmin et', 'Sınır değeri olan `0`ı özellikle test et'], ['Predict the result first', 'Test the boundary value `0` deliberately']) },
      { id: 'l3-logic', kind: 'practice', activity: 'sort', duration: 8, title: text('Koşulları birleştir', 'Combine conditions'), description: text('Enerji, anahtar ve oyun durumu kartlarını `&&`, `||` veya `!` ile doğru karar cümlesine bağla.', 'Connect energy, key, and game-state cards to the correct decision using `&&`, `||`, or `!`.'), bullets: list(['`&&`: iki koşul da gerekli', '`||`: koşullardan biri yeterli'], ['`&&`: both conditions are required', '`||`: either condition is enough']) },
      { id: 'l3-flow', kind: 'observe', activity: 'predict', duration: 8, title: text('if / else karar sahnesi', 'The if / else decision scene'), description: text('Aynı karakteri farklı `lives` değerleriyle kapılardan geçir; yalnızca seçilen kod dalının çalıştığını izle.', 'Move the same character through gates with different `lives` values and see that only the selected branch runs.'), bullets: list(['Koşul yukarıdan aşağı değerlendirilir', 'Bir `if/else` zincirinde ilk doğru dal seçilir'], ['Conditions are evaluated top to bottom', 'The first true branch in an `if/else` chain is chosen']) },
      { id: 'l3-order', kind: 'practice', activity: 'order', duration: 7, title: text('Karar kodunu sıraya koy', 'Order the decision code'), description: text('Dağılmış satırları scope’u bozmadan derlenebilir bir `if/else` yapısına dönüştür.', 'Turn shuffled lines into a compilable `if/else` structure without breaking scope.'), bullets: list(['Koşul parantez içindedir', '`else` kendi başına koşul almaz'], ['The condition is inside parentheses', '`else` does not take its own condition']) },
      { id: 'l3-code', kind: 'practice', activity: 'code', duration: 12, title: text('Koşullu karar uygulaması', 'Conditional decision practice'), description: text('Can değerine göre iki yolu sıfırdan yaz; farklı değerlerde beklediğin çıktıyı kodu kontrol etmeden önce söyle.', 'Write both paths from scratch and state the expected output for different values before checking code.'), bullets: list(['Süslü parantezlerle scope’u koru', 'Her dalda gözlemlenebilir çıktı üret'], ['Preserve scope with braces', 'Produce observable output in every branch']) },
      { id: 'l3-mastery', kind: 'reflect', activity: 'mastery', duration: 5, title: text('Karar ustalık kontrolü', 'Decision mastery check'), description: text('Enerji, reklam hakkı ve bölüm kilidi senaryolarında doğru operatörü ve akışı seç.', 'Choose the correct operator and flow in energy, ad-continue, and level-lock scenarios.'), bullets: list(['Sınır değerini kontrol et', 'Koşulu doğal dille de açıkla'], ['Check the boundary value', 'Explain the condition in natural language too']) },
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
      { id: 'l4-recall', kind: 'prepare', activity: 'brief', duration: 5, title: text('Metod anatomisini geri çağır', 'Recall method anatomy'), description: text('Dönüş türü, metod adı, parametre listesi ve gövdeyi gerçek kod üzerinde tek tek göster.', 'Point out the return type, method name, parameter list, and body on real code.'), bullets: list(['`void` metodun değer döndürmediğini söyler', '`()` çağrı arayüzüdür; her zaman boş olmak zorunda değildir'], ['`void` says the method returns no value', '`()` is the call interface and need not always be empty']) },
      { id: 'l4-methods', kind: 'learn', activity: 'match', duration: 8, title: text('Metodun parçalarını bağla', 'Connect the parts of a method'), description: text('`void Move(float speed)` satırındaki her parçayı sorumluluğuyla eşleştir.', 'Match each part of `void Move(float speed)` to its responsibility.'), bullets: list(['Parametre dışarıdan veri alır', 'Gövde metod çağrıldığında çalışır'], ['A parameter receives outside data', 'The body runs when the method is called']) },
      { id: 'l4-order', kind: 'learn', activity: 'order', duration: 8, title: text('Başlatma sırasını kur', 'Build the initialisation order'), description: text('`Awake`, `OnEnable` ve `Start` kartlarını doğru sıraya getir; devre dışı bırakıp açınca neyin tekrarlandığını izle.', 'Order `Awake`, `OnEnable`, and `Start`, then observe what repeats after disable and enable.'), bullets: list(['`Awake`: nesnenin kendi hazırlığı', '`OnEnable`: her etkinleşmede', '`Start`: ilk aktif başlangıçta'], ['`Awake`: internal setup', '`OnEnable`: every enable', '`Start`: first active start']) },
      { id: 'l4-callbacks', kind: 'practice', activity: 'match', duration: 8, title: text('İşi doğru callback’e ver', 'Assign work to the right callback'), description: text('Input, fizik kuvveti, kamera takibi, abonelik ve ilk kurulum işlerini doğru yaşam döngüsü metoduna bağla.', 'Assign input, physics force, camera follow, subscriptions, and initial setup to the correct lifecycle method.'), bullets: list(['Zamanlama davranışın bir parçasıdır', 'Doğru çalışan ama yanlış yerde çalışan kod da sorun çıkarabilir'], ['Timing is part of behaviour', 'Code can work yet still be placed incorrectly']) },
      { id: 'l4-frames', kind: 'observe', activity: 'inspector', duration: 7, title: text('Frame ve fizik ritmi simülatörü', 'Frame and physics rhythm simulator'), description: text('Render hızı değişirken `FixedUpdate` ritminin neden ayrı kaldığını hareketli zaman çizelgesinde izle.', 'Watch why the `FixedUpdate` rhythm remains separate as render speed changes.'), bullets: list(['`Update` frame başına çalışır', '`FixedUpdate` sabit fizik zamanına bağlıdır', '`LateUpdate` Update sonrasında gelir'], ['`Update` runs per frame', '`FixedUpdate` follows fixed physics time', '`LateUpdate` comes after Update']) },
      { id: 'l4-performance', kind: 'observe', activity: 'sort', duration: 7, title: text('Her şey Update’e yazılmaz', 'Not everything belongs in Update'), description: text('Sekiz işi “her frame gerekli” ve “olay olduğunda yeterli” kutularına ayır; gereksiz maliyeti gör.', 'Sort eight tasks into “needed every frame” and “only on an event” to expose unnecessary cost.'), bullets: list(['Boş `Update` bile niyeti belirsizleştirir', 'Tek seferlik işi `Start` veya olaya taşı'], ['Even an empty `Update` obscures intent', 'Move one-off work to `Start` or an event']) },
      { id: 'l4-code', kind: 'practice', activity: 'code', duration: 12, title: text('Yaşam döngüsü probu', 'Lifecycle probe'), description: text('Başlangıç callback’lerini sıfırdan yaz; Console sırasını ve büyük/küçük harf duyarlılığını doğrula.', 'Write startup callbacks from scratch and verify Console order and casing.'), bullets: list(['Metod adlarını birebir doğru yaz', 'Her metoda ayırt edilebilir mesaj koy'], ['Spell method names exactly', 'Give each method a distinguishable message']) },
      { id: 'l4-mastery', kind: 'reflect', activity: 'mastery', duration: 5, title: text('Yaşam döngüsü ustalık kontrolü', 'Lifecycle mastery check'), description: text('Yeni sorumlulukları doğru metoda yerleştir ve yanlış seçimin görünür sonucunu açıkla.', 'Place new responsibilities in the right method and explain the visible consequence of a wrong choice.'), bullets: list(['Sadece isim değil gerekçe seç', 'Performans etkisini de hesaba kat'], ['Choose the reason, not only the name', 'Include the performance impact']) },
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
      { id: 'l5-recall', kind: 'prepare', activity: 'mastery', duration: 7, title: text('Aralıklı tekrar turu', 'Spaced recall round'), description: text('İlk dört dersten gelen soruları karışık sırada çöz; unutulan kavram için kısa iyileştirme kartını aç.', 'Solve mixed questions from the first four lessons and open a short remediation card for forgotten concepts.'), bullets: list(['Tür, koşul, callback ve hata okuma birlikte gelir', 'Yanlış cevap sonraki açıklamayı kişiselleştirir'], ['Types, conditions, callbacks, and diagnostics appear together', 'A wrong answer personalises the next explanation']) },
      { id: 'l5-components', kind: 'learn', activity: 'inspector', duration: 8, title: text('GameObject’i Component’lerle kur', 'Build a GameObject with Components'), description: text('Boş bir GameObject’e ihtiyaçlarına göre Component ekle; Inspector yığınının davranışı nasıl oluşturduğunu gör.', 'Add Components to an empty GameObject according to its needs and see how the Inspector stack creates behaviour.'), bullets: list(['GameObject taşıyıcıdır', 'Component tek bir sorumluluk ekler', 'Her GameObject’te Transform vardır'], ['A GameObject is a container', 'A Component adds one responsibility', 'Every GameObject has a Transform']) },
      { id: 'l5-roles', kind: 'practice', activity: 'match', duration: 7, title: text('Component görevlerini eşleştir', 'Match Component responsibilities'), description: text('Konum, fizik hareketi, temas sınırı ve özel oyun davranışını doğru Component’e bağla.', 'Match position, physics movement, contact boundaries, and custom game behaviour to the right Component.'), bullets: list(['`Transform` konum/dönüş/ölçek', '`Rigidbody` fizik gövdesi', '`Collider` temas şekli'], ['`Transform` is position/rotation/scale', '`Rigidbody` is the physics body', '`Collider` is the contact shape']) },
      { id: 'l5-trigger', kind: 'observe', activity: 'predict', duration: 8, title: text('Collision ve trigger sahnesi', 'Collision and trigger scene'), description: text('Oyuncuyu iki farklı alandan geçir; katı çarpışma ile olay algılayan trigger’ın farkını animasyonla gör.', 'Move the player through two volumes and see the animated difference between solid collision and event-detecting trigger.'), bullets: list(['`Is Trigger` hareket tepkisini değiştirir', 'Trigger görünmez bir algılama alanı olabilir'], ['`Is Trigger` changes the movement response', 'A trigger can be an invisible detection volume']) },
      { id: 'l5-requirements', kind: 'practice', activity: 'sort', duration: 7, title: text('Fizik tarifini tamamla', 'Complete the physics recipe'), description: text('Trigger callback’inin çalışması için gereken Collider, Rigidbody ve ayar kartlarını doğru sisteme yerleştir.', 'Place the Collider, Rigidbody, and setting cards needed for a trigger callback into the correct system.'), bullets: list(['İki tarafta Collider gerekir', 'Fizik etkileşiminde taraflardan en az birinde Rigidbody beklenir'], ['Both sides need a Collider', 'At least one side is expected to have a Rigidbody in a physics interaction']) },
      { id: 'l5-inspector', kind: 'observe', activity: 'spot', duration: 7, title: text('SerializeField ve referans laboratuvarı', 'SerializeField and reference laboratory'), description: text('Inspector alanına Component sürükle; eksik referansın ürettiği hatayı kod satırıyla ilişkilendir.', 'Drag a Component into an Inspector field and connect a missing reference error to the code line.'), bullets: list(['`private` dış erişimi sınırlar', '`[SerializeField]` alanı Inspector’da düzenlenebilir yapar'], ['`private` limits outside access', '`[SerializeField]` makes a field editable in the Inspector']) },
      { id: 'l5-code', kind: 'practice', activity: 'code', duration: 11, title: text('Component referansı ve trigger callback’i', 'Component reference and trigger callback'), description: text('Rigidbody referansını ve `OnTriggerEnter` callback’ini sıfırdan yaz; dosya, satır ve parametre hatalarını Problems panelinden düzelt.', 'Write the Rigidbody reference and `OnTriggerEnter` callback from scratch; fix file, line, and parameter errors from Problems.'), bullets: list(['Gerektiğinde `[SerializeField] private` kullan', 'Parametre adı tanım ve kullanımda aynı olmalı'], ['Use `[SerializeField] private` when appropriate', 'The parameter name must match in declaration and usage']) },
      { id: 'l5-mastery', kind: 'reflect', activity: 'mastery', duration: 5, title: text('Modül 1 final senaryosu', 'Module 1 final scenario'), description: text('Bir pickup sistemini tür, koşul, callback ve Component kararlarıyla uçtan uca çöz.', 'Solve a pickup system end to end using type, condition, callback, and Component decisions.'), bullets: list(['Kodun ne zaman ve neden çalıştığını açıkla', 'Bir hatayı teknik adıyla teşhis et'], ['Explain when and why the code runs', 'Diagnose one fault by its technical name']) },
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
