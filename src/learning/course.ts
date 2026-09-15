import type { Locale } from '../domain/models';

export type LessonStepKind = 'prepare' | 'learn' | 'observe' | 'practice' | 'reflect';

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
      {
        id: 'l1-goal', kind: 'prepare', duration: 5, title: text('Ders hedefi ve zihinsel model', 'Lesson goal and mental model'),
        description: text('Önce kodun Unity içindeki yolculuğunu kur: dosya yazılır, C# derlenir, sınıf Component olur ve Unity uygun callback’i çağırır.', 'First build the journey of code inside Unity: a file is written, C# compiles it, the class becomes a Component, and Unity calls the relevant callback.'),
        bullets: list(['Script bir metin dosyasıdır; çalışan şey derlenmiş sınıfın örneğidir', 'GameObject taşıyıcıdır, Component ona veri veya davranış ekler', 'Derleme hatası varsa Unity yeni kodu çalıştıramaz'], ['A script is a text file; the compiled class instance is what runs', 'A GameObject is a container; Components add data or behaviour', 'Unity cannot run new code while compilation errors exist']),
        editorTitle: text('İlk bağımlılığı kendin yaz', 'Write the first dependency yourself'),
        editorTask: text('Boş `FirstScript.cs` dosyasına yalnızca `using UnityEngine;` yaz. `using` bir kodu çalıştırmaz; namespace içindeki türleri kısa adlarıyla kullanabilmeni sağlar. Kontrolü çalıştır ve bu satırın neyi mümkün kıldığını sözlü olarak açıkla.', 'Write only `using UnityEngine;` in the empty `FirstScript.cs` file. A `using` directive does not execute code; it lets you use types from a namespace by their short names. Run the check and explain what this line enables.'),
        details: {
          tr: [
            { title: 'Script nedir?', body: '`.cs` uzantılı kaynak kod dosyasıdır. Dosyanın kendisi sahnede yaşamaz; içindeki sınıf derlenir ve bir GameObject’e Component olarak eklenebilir.' },
            { title: 'Derleme ne yapar?', body: 'Yazdığın metni C# kurallarına göre inceler. Geçersiz bir cümle, eksik `;` veya kapanmayan `{` varsa çalıştırılabilir kod üretmez.' },
            { title: '`using` ne değildir?', body: 'Bir nesne oluşturmaz ve her frame çalışmaz. Yalnızca `UnityEngine.MonoBehaviour` yerine `MonoBehaviour` yazabilmek için isim çözümlemesini kolaylaştırır.' },
          ],
          en: [
            { title: 'What is a script?', body: 'It is a `.cs` source file. The file itself does not live in the scene; its class is compiled and can be attached to a GameObject as a Component.' },
            { title: 'What does compilation do?', body: 'It checks your text against C# rules. A plain sentence, missing `;`, or unclosed `{` prevents executable code from being produced.' },
            { title: 'What is `using` not?', body: 'It does not create an object or run every frame. It simplifies name resolution so you can write `MonoBehaviour` instead of `UnityEngine.MonoBehaviour`.' },
          ],
        },
      },
      {
        id: 'l1-anatomy', kind: 'learn', duration: 15, title: text('Bir scriptin anatomisi', 'Anatomy of a script'),
        description: text('`using`, erişim belirleyici, `class`, kalıtım, dosya adı ve scope kavramlarını tek tek kur; hazır iskelet kullanma.', 'Build `using`, access modifier, `class`, inheritance, file naming, and scope one by one without a prepared skeleton.'),
        bullets: list(['`public class FirstScript` yeni bir tür tanımlar', '`:` işareti “şundan türetilir” ilişkisini kurar', '`MonoBehaviour` Unity mesajlarını alabilmenin temelidir', 'Dosya adı `FirstScript.cs`, sınıf adı `FirstScript` olmalıdır'], ['`public class FirstScript` defines a new type', '`:` establishes an “inherits from” relationship', '`MonoBehaviour` enables Unity messages', 'File name `FirstScript.cs` must match class name `FirstScript`']),
        editorTitle: text('Sınıf gövdesini sıfırdan kur', 'Build the class body from scratch'),
        editorTask: text('Boş dosyaya önce `using UnityEngine;`, ardından `public class FirstScript : MonoBehaviour` bildirimi ve sınıfa ait `{ }` bloğunu kendin yaz. Henüz metod ekleme. Dosya-sınıf eşleşmesini ve her sembolün görevini öğretmenine açıkla.', 'Write `using UnityEngine;`, then `public class FirstScript : MonoBehaviour` and its `{ }` block in the empty file. Do not add a method yet. Explain the file-class match and each symbol to your instructor.'),
        details: {
          tr: [
            { title: '`public`', body: 'Sınıfın başka kodlar ve Unity tarafından görülebilmesini sağlayan erişim belirleyicisidir. Her şeyi `public` yapmak iyi tasarım değildir; burada ana türü tanımlıyoruz.' },
            { title: '`class` ve nesne', body: '`class` bir şablondur; sahnedeki Component ise bu şablondan oluşturulan örnektir. Aynı script birden fazla GameObject’e eklenirse ayrı örnekler oluşur.' },
            { title: '`MonoBehaviour`', body: 'Sınıfa Unity Component davranışı kazandırır. `Start`, `Awake` ve `Update` gibi callback’lerin Unity tarafından tanınacağı bağlamı sağlar.' },
            { title: 'Scope ve `{ }`', body: 'Süslü parantezler bir bloğun sınırlarını belirler. Metot sınıfın içinde, çalışacak komut ise metodun içinde bulunmalıdır.' },
          ],
          en: [
            { title: '`public`', body: 'An access modifier that makes the class visible to Unity and other code. Making everything public is not good design; here it exposes the main type.' },
            { title: '`class` and object', body: 'A `class` is a blueprint; the Component in a scene is an instance. Attaching the same script to multiple GameObjects creates separate instances.' },
            { title: '`MonoBehaviour`', body: 'It gives the class Unity Component behaviour and the context in which callbacks such as `Start`, `Awake`, and `Update` are recognised.' },
            { title: 'Scope and `{ }`', body: 'Braces define block boundaries. A method belongs inside the class, and executable statements belong inside the method.' },
          ],
        },
      },
      {
        id: 'l1-console', kind: 'observe', duration: 10, title: text('Metot, callback ve Console', 'Method, callback, and Console'),
        description: text('Metot sözdizimini kur, `Start` adının neden sıradan bir ad olmadığını gör ve gözlemlenebilir bir çıktı üret.', 'Build method syntax, see why `Start` is not an arbitrary name, and produce observable output.'),
        bullets: list(['`void`: geri dönüş değeri yok', '`Start()`: Unity’nin doğru yazımda bir kez çağırdığı callback', '`Debug.Log`: geliştiriciye Console çıktısı gönderir', 'Metin değeri çift tırnak içinde, komut `;` ile biter'], ['`void`: no return value', '`Start()`: a callback Unity calls once when spelled correctly', '`Debug.Log`: sends developer output to the Console', 'Text goes in double quotes and the statement ends with `;`']),
        editorTitle: text('Çalışma anını görünür yap', 'Make execution visible'),
        editorTask: text('Boş dosyada `using UnityEngine;` ile başla. `FirstScript : MonoBehaviour` sınıfını ve içine `void Start()` metodunu kur. Metodun içinde `Debug.Log("Unity hazır");` yaz. Sonra mesajı değiştirip kaynak kod ile çıktı arasındaki bağı doğrula.', 'Start with `using UnityEngine;` in the empty file. Build the `FirstScript : MonoBehaviour` class and a `void Start()` method. Write `Debug.Log("Unity ready");` inside it, then change the message to verify the connection between source and output.'),
        details: {
          tr: [
            { title: 'Metot nedir?', body: 'Adlandırılmış bir davranış bloğudur. `void` dönüş türünü, `Start` adı, `()` parametre alanını ve `{ }` gövdeyi ifade eder.' },
            { title: 'Callback nedir?', body: 'Senin doğrudan çağırmadığın, belirli bir olayda Unity’nin çağırdığı metottur. `awake` derlenebilir ama Unity onu `Awake` callback’i olarak çağırmaz.' },
            { title: 'Console neden önemlidir?', body: 'Oyuncuya gösterilen UI değildir. Kodun hangi sırada ve hangi değerle çalıştığını geliştiricinin gözlemlemesini sağlar.' },
          ],
          en: [
            { title: 'What is a method?', body: 'A named behaviour block. `void` is the return type, `Start` the name, `()` the parameter list, and `{ }` the body.' },
            { title: 'What is a callback?', body: 'A method Unity calls for you when a particular event occurs. `awake` can compile, but Unity will not invoke it as the `Awake` callback.' },
            { title: 'Why does the Console matter?', body: 'It is not player UI. It lets a developer observe when code runs and which values it produces.' },
          ],
        },
      },
      {
        id: 'l1-code', kind: 'practice', duration: 20, title: text('Sıfırdan yaz, boz ve onar', 'Write, break, and repair from scratch'),
        description: text('Tam scripti boş dosyada kur; ardından kontrollü hatalar üretip Problems panelindeki neden-sonuç ilişkisini kullanarak düzelt.', 'Build the full script in an empty file, then create controlled errors and repair them using the cause-and-effect information in the Problems panel.'),
        bullets: list(['Önce düz Türkçe bir cümleyi kod bloğuna yaz ve tanıyı oku', '`Start` adını `start` veya `awake` yaparak callback uyarısını karşılaştır', 'Bir `;` ve bir `}` sil; hata satırına tıklayıp sarı vurguyu izle', 'Son durumda kodu tamamen derlenebilir hâle getir'], ['Write a plain sentence in the code block and read the diagnostic', 'Change `Start` to `start` or `awake` and compare callback warnings', 'Remove one `;` and one `}`; click the problem and observe the yellow line', 'Finish with fully compilable code']),
        editorTitle: text('Bağımsız uygulama: FirstScript.cs', 'Independent practice: FirstScript.cs'),
        editorTask: text('Hiçbir hazır satır kullanmadan `using`, `class`, `MonoBehaviour`, `Start` ve `Debug.Log` yapısını oluştur. Her kontrollü hatada önce sonucu tahmin et, sonra kontrolü çalıştır, hata kodunu ve satırını oku, son olarak düzelt.', 'Without prepared lines, build the `using`, `class`, `MonoBehaviour`, `Start`, and `Debug.Log` structure. For each controlled error, predict the result, run the check, read the error code and line, then fix it.'),
        details: {
          tr: [
            { title: 'Hata laboratuvarı', body: '`İlk mesajını buraya yaz.` ifadesi comment veya string olmadığı için C# komutu değildir. `//` ile açıklama ya da `Debug.Log("...");` ile çıktı olmalıdır.' },
            { title: 'Büyük/küçük harf', body: 'C# ve Unity callback adları case-sensitive çalışır. `Awake` ile `awake`, `packageCount` ile `packagecount` aynı sembol değildir.' },
            { title: 'Okuma sırası', body: 'Önce dosya ve `satır:sütun`, sonra hata kodu, ardından açıklama ve düzeltme önerisi okunur. Mesaja göre kod değiştirilir; rastgele deneme yapılmaz.' },
          ],
          en: [
            { title: 'Error laboratory', body: '`Write your first message here.` is not a C# statement unless it is a comment or string. Use `//` for an explanation or `Debug.Log("...");` for output.' },
            { title: 'Letter casing', body: 'C# identifiers and Unity callbacks are case-sensitive. `Awake` and `awake`, or `packageCount` and `packagecount`, are not the same symbol.' },
            { title: 'Reading order', body: 'Read file and `line:column`, then the code, explanation, and suggested repair. Change code based on evidence instead of guessing.' },
          ],
        },
      },
      {
        id: 'l1-recap', kind: 'reflect', duration: 10, title: text('Geri çağır, açıkla ve ikinci dosyayı dene', 'Recall, explain, and try a second file'),
        description: text('Koda bakmadan yapıyı yeniden üret; ardından yeni script sekmesi açarak bir dosyanın kendi sınıfına sahip olduğunu gör.', 'Recreate the structure without looking, then open a new script tab to see that each file owns its class.'),
        bullets: list(['Her satırı “neden var?” sorusuyla açıkla', 'Yeni script düğmesiyle boş `NewScript.cs` aç', 'Dosya-sınıf adı eşleşmezse Unity uyarısını incele', 'Yanlışını düzeltip ilk script sekmesine geri dön'], ['Explain every line by answering “why is it here?”', 'Open a blank `NewScript.cs` with the new script button', 'Inspect the Unity warning when file and class names differ', 'Fix it and return to the first script tab']),
        editorTitle: text('Koda bakmadan yeniden kur', 'Rebuild without looking'),
        editorTask: text('Boş `FirstScript.cs` dosyasında çalışan yapıyı hafızadan yeniden yaz. Sonra “Yeni script” ile ikinci dosyayı aç; içine `public class NewScript : MonoBehaviour` yapısını kur. İki sekme arasında geçiş yap ve dosyaların içeriğinin bağımsız kaldığını doğrula.', 'Rebuild the working structure from memory in the blank `FirstScript.cs`. Then open a second file with “New script” and build `public class NewScript : MonoBehaviour`. Switch between tabs and verify that their contents remain independent.'),
        details: {
          tr: [
            { title: 'Başarı ölçütü', body: 'Kodun yalnızca yeşil sonuç vermesi yetmez. `using`, sınıf, kalıtım, callback ve komut scope’unu doğru teknik kelimelerle açıklayabilmelisin.' },
            { title: 'İkinci script neden var?', body: 'İleride scriptler arası iletişim kurarken her sorumluluk ayrı sınıfta yaşayacak. Sekmeler bu zihinsel modeli şimdiden görünür kılar.' },
          ],
          en: [
            { title: 'Success criterion', body: 'A green result is not enough. You must explain `using`, class, inheritance, callback, statement, and scope with accurate technical terms.' },
            { title: 'Why a second script?', body: 'Later, communication between scripts will keep responsibilities in separate classes. Tabs make that model visible now.' },
          ],
        },
      },
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
