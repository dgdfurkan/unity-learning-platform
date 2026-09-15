import { useMemo, useState } from 'react';
import type { Locale } from '../domain/models';
import { Icon } from '../shared/Icon';

type LocalText = { tr: string; en: string };
type Concept = { tag: string; title: LocalText; body: LocalText; example?: string };
type QuizQuestion = { prompt: LocalText; options: LocalText[]; answer: number; why: LocalText };
type MatchItem = { left: string; right: LocalText; why: LocalText };
type SortItem = { value: string; category: string; why: LocalText };
type Practice =
  | { type: 'quiz'; questions: QuizQuestion[] }
  | { type: 'match'; labels: { key: string; label: LocalText }[]; items: MatchItem[] }
  | { type: 'sort'; categories: { key: string; label: LocalText }[]; items: SortItem[] }
  | { type: 'sequence'; items: { id: string; label: string; detail: LocalText }[] }
  | { type: 'debug'; lines: string[]; answer: number; why: LocalText }
  | { type: 'simulator'; variant: 'state' | 'compare' | 'frames' | 'components' | 'trigger' };

type ActivityConfig = {
  eyebrow: LocalText;
  title: LocalText;
  thesis: LocalText;
  goal: LocalText;
  concepts: Concept[];
  code?: string;
  analogy: LocalText;
  practiceTitle: LocalText;
  practice: Practice;
};

const tx = (tr: string, en: string): LocalText => ({ tr, en });
const t = (locale: Locale, value: LocalText) => value[locale];

const quiz = (questions: QuizQuestion[]): Practice => ({ type: 'quiz', questions });
const match = (labels: { key: string; label: LocalText }[], items: MatchItem[]): Practice => ({ type: 'match', labels, items });
const sort = (categories: { key: string; label: LocalText }[], items: SortItem[]): Practice => ({ type: 'sort', categories, items });
const sequence = (items: { id: string; label: string; detail: LocalText }[]): Practice => ({ type: 'sequence', items });
const debug = (lines: string[], answer: number, why: LocalText): Practice => ({ type: 'debug', lines, answer, why });

const typeLabels = [
  { key: 'int', label: tx('Tam sayı · int', 'Whole number · int') },
  { key: 'string', label: tx('Metin · string', 'Text · string') },
  { key: 'bool', label: tx('Doğru / yanlış · bool', 'True / false · bool') },
];

const configs: Record<string, ActivityConfig> = {
  'l2-recall': {
    eyebrow: tx('KÖPRÜ KUR', 'BUILD A BRIDGE'),
    title: tx('Kod, çalıştığı an anlam kazanır.', 'Code gains meaning when it runs.'),
    thesis: tx('Önceki derste bir scriptin yapısını kurdun. Şimdi o yapının içinde saklayacağımız oyun durumuna hazırlanıyoruz.', 'You built a script structure in the previous lesson. Now prepare for the game state that will live inside it.'),
    goal: tx('Amaç: `Start` çağrısından Console çıktısına giden akışı açıklayabilmek.', 'Goal: explain the flow from the `Start` callback to Console output.'),
    concepts: [
      { tag: '1', title: tx('Unity çağırır', 'Unity calls'), body: tx('Component etkinse Unity, ilk kareden önce `Start` metodunu arar.', 'If the Component is enabled, Unity looks for `Start` before the first frame.'), example: 'void Start()' },
      { tag: '2', title: tx('Gövde çalışır', 'The body runs'), body: tx('Süslü parantez içindeki komutlar yukarıdan aşağı yürütülür.', 'Statements inside the braces run from top to bottom.'), example: '{ Debug.Log(...); }' },
      { tag: '3', title: tx('Sonuç görünür', 'The result is visible'), body: tx('`Debug.Log`, değeri Console’a göndererek davranışı gözlemlenebilir yapar.', '`Debug.Log` makes behaviour observable by sending a value to the Console.'), example: 'Console: Hazır' },
    ],
    code: 'void Start()\n{\n    Debug.Log("Hazır");\n}',
    analogy: tx('Bir tiyatro gibi düşün: Unity sahne yöneticisi, `Start` çağrı işareti, metod gövdesi oyuncunun yapacağı eylemdir.', 'Think of theatre: Unity is the stage manager, `Start` is the cue, and the method body is the action.'),
    practiceTitle: tx('Akışı gerçekten anladın mı?', 'Do you truly understand the flow?'),
    practice: quiz([
      { prompt: tx('`Debug.Log` satırı neden kendiliğinden değil, `Start` çağrıldığında çalışır?', 'Why does `Debug.Log` run when `Start` is called rather than by itself?'), options: [tx('Çünkü metod gövdesinin içindedir.', 'Because it is inside the method body.'), tx('Çünkü her metin otomatik çalışır.', 'Because every string runs automatically.'), tx('Çünkü Console kodu çağırır.', 'Because the Console calls the code.')], answer: 0, why: tx('Bir komut, içinde bulunduğu metod çağrıldığında yürütülür.', 'A statement executes when its containing method is called.') },
      { prompt: tx('Unity’nin otomatik aradığı doğru callback hangisidir?', 'Which callback does Unity look for automatically?'), options: [tx('`start`', '`start`'), tx('`Start`', '`Start`'), tx('`Begin`', '`Begin`')], answer: 1, why: tx('Callback adı büyük/küçük harf dâhil birebir `Start` olmalıdır.', 'The callback name must match `Start` exactly, including case.') },
    ]),
  },
  'l2-anatomy': {
    eyebrow: tx('SATIRI PARÇALA', 'DISSECT THE LINE'), title: tx('Bir değişken, dört karardan oluşur.', 'A variable contains four decisions.'),
    thesis: tx('`int packageCount = 3;` tek parça gibi görünür; aslında tür, isim, atama ve değer birlikte bir durum kaydı oluşturur.', '`int packageCount = 3;` looks like one piece, but type, identifier, assignment, and value form a state record.'),
    goal: tx('Amaç: Bir değişken satırındaki her parçanın görevini ayrı ayrı söyleyebilmek.', 'Goal: state the responsibility of every part of a variable declaration.'),
    concepts: [
      { tag: 'TÜR', title: tx('int', 'int'), body: tx('Bu kutuya hangi biçimde veri girebileceğini belirler.', 'Defines what shape of data the box can hold.'), example: 'tam sayı' },
      { tag: 'İSİM', title: tx('packageCount', 'packageCount'), body: tx('Bellekteki değere tekrar ulaşmak için kullanılan benzersiz etikettir.', 'The identifier used to reach the value in memory again.'), example: 'camelCase' },
      { tag: 'DEĞER', title: tx('= 3;', '= 3;'), body: tx('`=` sağdaki değeri soldaki değişkene atar; `;` komutu bitirir.', '`=` assigns the right-hand value to the variable; `;` ends the statement.'), example: 'başlangıç değeri' },
    ],
    code: 'int packageCount = 3;',
    analogy: tx('Etiketli bir saklama kutusu düşün: kutu türü “tam sayı”, etiketi `packageCount`, içine koyduğun ilk nesne ise `3`.', 'Imagine a labelled storage box: its type is “whole number”, its label is `packageCount`, and its first content is `3`.'),
    practiceTitle: tx('Parçayı sorumluluğuna bağla', 'Match each part to its responsibility'),
    practice: match([
      { key: 'type', label: tx('Kabul edilen veri biçimi', 'Accepted data shape') }, { key: 'name', label: tx('Değere erişme adı', 'Name used to access the value') }, { key: 'assign', label: tx('Sağdaki değeri sola aktarır', 'Moves the right value to the left') }, { key: 'value', label: tx('Saklanan başlangıç verisi', 'Stored initial data') },
    ], [
      { left: 'int', right: tx('Kabul edilen veri biçimi', 'Accepted data shape'), why: tx('`int` yalnızca tam sayıları temsil eder.', '`int` represents whole numbers.') },
      { left: 'packageCount', right: tx('Değere erişme adı', 'Name used to access the value'), why: tx('Kodun devamında değere bu identifier ile ulaşılır.', 'The identifier is used to access the value later.') },
      { left: '=', right: tx('Sağdaki değeri sola aktarır', 'Moves the right value to the left'), why: tx('Tek `=` karşılaştırma değil, atamadır.', 'A single `=` is assignment, not comparison.') },
      { left: '3', right: tx('Saklanan başlangıç verisi', 'Stored initial data'), why: tx('`3`, değişkenin ilk değeridir.', '`3` is the variable’s initial value.') },
    ]),
  },
  'l2-types': {
    eyebrow: tx('TÜR RADARI', 'TYPE RADAR'), title: tx('Değerin görünüşünü değil, anlamını oku.', 'Read the meaning, not just the appearance.'),
    thesis: tx('Tür seçimi, oyunun o veriyle hangi işlemleri yapabileceğini belirler. Tırnak, sayı ve iki durumlu karar işaretlerini kod gibi okuyacağız.', 'Type choice determines which operations the game can perform. Read quotes, numbers, and two-state decisions as code.'),
    goal: tx('Amaç: On iki değeri bağlamıyla birlikte doğru türe yerleştirmek.', 'Goal: place twelve values into the correct type with context.'),
    concepts: [
      { tag: '42', title: tx('int · tam sayı', 'int · whole number'), body: tx('Adet, skor, can ve seviye gibi kesir gerektirmeyen nicelikler.', 'Counts, scores, lives, and levels that need no fraction.'), example: 'int lives = 3;' },
      { tag: '"A"', title: tx('string · metin', 'string · text'), body: tx('Oyuncu adı, mesaj veya etiket. Çift tırnak değerin parçasıdır.', 'Player names, messages, or labels. Double quotes are part of the literal.'), example: 'string name = "Ada";' },
      { tag: 'T/F', title: tx('bool · iki durum', 'bool · two states'), body: tx('Evet/hayır sorularını `true` veya `false` ile tutar.', 'Stores yes/no questions as `true` or `false`.'), example: 'bool isAlive = true;' },
    ],
    code: 'int score = 1250;\nstring playerName = "Ada";\nbool isGameActive = true;',
    analogy: tx('Telefon rehberinde isim, pil yüzdesi ve uçak modu aynı görünmez; çünkü her biri farklı türde durumu temsil eder.', 'A contact name, battery percentage, and airplane mode do not look alike because each represents a different kind of state.'),
    practiceTitle: tx('Değeri doğru veri türüne gönder', 'Send each value to the correct type'),
    practice: sort(typeLabels, [
      { value: '42', category: 'int', why: tx('Tırnaksız tam sayı.', 'An unquoted whole number.') }, { value: '"Ada"', category: 'string', why: tx('Çift tırnak içindeki metin.', 'Text inside double quotes.') }, { value: 'true', category: 'bool', why: tx('İki durumlu mantıksal değer.', 'A two-state logical value.') },
      { value: '0', category: 'int', why: tx('Sıfır da bir tam sayıdır.', 'Zero is also a whole number.') }, { value: '"42"', category: 'string', why: tx('Rakam görünse de tırnaklar onu metin yapar.', 'Quotes make it text even though it contains digits.') }, { value: 'false', category: 'bool', why: tx('Olumsuz mantıksal durum.', 'A negative logical state.') },
      { value: '-3', category: 'int', why: tx('Negatif ama yine tam sayı.', 'Negative, but still a whole number.') }, { value: '"Oyun bitti"', category: 'string', why: tx('Kullanıcıya gösterilen metin.', 'Text shown to the player.') }, { value: 'true', category: 'bool', why: tx('Bir koşulun doğru olduğunu taşır.', 'Carries a true condition.') },
      { value: '99', category: 'int', why: tx('Adet veya skor olarak kullanılabilir.', 'Can represent a count or score.') }, { value: '"false"', category: 'string', why: tx('Tırnak içindeki `false` bool değil metindir.', 'Quoted `false` is text, not a bool.') }, { value: '1', category: 'int', why: tx('C# içinde `1`, otomatik olarak `true` değildir.', 'In C#, `1` is not automatically `true`.') },
    ]),
  },
  'l2-state': {
    eyebrow: tx('CANLI DURUM', 'LIVE STATE'), title: tx('Tek değer, üç farklı yüzey.', 'One value, three different surfaces.'),
    thesis: tx('Inspector’dan değiştirdiğin değer, Component alanına yazılır; oyun HUD’ı ve Console aynı durumu farklı biçimde okuyabilir.', 'A value changed in the Inspector is written to the Component field; the HUD and Console can present that state differently.'),
    goal: tx('Amaç: Değişken, değer ve ekrandaki temsil arasındaki farkı görmek.', 'Goal: see the difference between a variable, its value, and its visual representation.'),
    concepts: [
      { tag: 'A', title: tx('Kod', 'Code'), body: tx('Değişkenin türünü, adını ve başlangıç değerini tanımlar.', 'Defines the variable’s type, name, and initial value.'), example: 'int packageCount = 3;' },
      { tag: 'B', title: tx('Inspector', 'Inspector'), body: tx('Serileştirilmiş alanı kod yazmadan örnek bazında değiştirir.', 'Changes a serialised field per instance without editing code.'), example: 'Package Count  [3]' },
      { tag: 'C', title: tx('Oyun yüzeyi', 'Game surface'), body: tx('Aynı veriyi oyuncunun anlayacağı görsel dile çevirir.', 'Translates the same data into a player-facing visual language.'), example: '📦 × 3' },
    ],
    code: '[SerializeField] private int packageCount = 3;',
    analogy: tx('Termostatı 22 dereceye getirince ayar, cihazın belleği ve ekrandaki “22°” aynı gerçeğin farklı yüzleridir.', 'Setting a thermostat to 22° changes the control, device memory, and display—three views of the same state.'),
    practiceTitle: tx('Durumu değiştir, üç yüzeyi izle', 'Change state and watch all three surfaces'),
    practice: { type: 'simulator', variant: 'state' },
  },
  'l2-naming': {
    eyebrow: tx('HATA OTUPSİSİ', 'ERROR AUTOPSY'), title: tx('Bir harf, başka bir isimdir.', 'One letter can create another identifier.'),
    thesis: tx('C# `packageCount` ve `packagecount` için iki ayrı sembol arar. Sorun stil değil: kullanılan ismin tanımlı olmamasıdır.', 'C# looks up `packageCount` and `packagecount` as separate symbols. This is not merely style: the used identifier was never declared.'),
    goal: tx('Amaç: `CS0103` mesajını dosya, satır, sembol ve çözüm olarak okuyabilmek.', 'Goal: read `CS0103` as file, line, symbol, and fix.'),
    concepts: [
      { tag: '01', title: tx('Tanım', 'Declaration'), body: tx('Derleyici `packageCount` adını sembol tablosuna ekler.', 'The compiler adds `packageCount` to its symbol table.'), example: 'int packageCount = 3;' },
      { tag: '02', title: tx('Arama', 'Lookup'), body: tx('Kullanılan identifier, tanımlı isimlerle birebir karşılaştırılır.', 'The used identifier is matched exactly against declared names.'), example: 'Debug.Log(packagecount);' },
      { tag: '03', title: tx('Tanı', 'Diagnostic'), body: tx('Eşleşme yoksa `CS0103` ve ilgili satır numarası üretilir.', 'If there is no match, `CS0103` and a line number are produced.'), example: "The name 'packagecount' does not exist" },
    ],
    code: 'int packageCount = 3;\nDebug.Log(packagecount); // CS0103',
    analogy: tx('Kapı kartında “Deniz Y.” yazarken sistemde “Deniz y.” aramak iki ayrı kayıt aramak gibidir.', 'It is like looking up “Deniz y.” when the access card is registered as “Deniz Y.”—two separate records.'),
    practiceTitle: tx('Derleyicinin bulamadığı satırı seç', 'Select the line the compiler cannot resolve'),
    practice: debug(['public class PlayerState : MonoBehaviour', '{', '    int packageCount = 3;', '    void Start()', '    {', '        Debug.Log(packagecount);', '    }', '}'], 5, tx('6. satırdaki `packagecount`, 3. satırda tanımlanan `packageCount` ile aynı identifier değildir. Kullanımı tanımla birebir eşleştir.', '`packagecount` on line 6 is not the same identifier as `packageCount` declared on line 3. Match the use exactly to the declaration.')),
  },
  'l2-fields': {
    eyebrow: tx('SCOPE HARİTASI', 'SCOPE MAP'), title: tx('Bir değerin yeri, ömrünü belirler.', 'Where a value lives determines its lifetime.'),
    thesis: tx('Class gövdesindeki field, Component örneğinin durumudur. Metod içindeki local variable yalnızca o çağrı boyunca ve o scope içinde yaşar.', 'A field in the class body is Component state. A local variable inside a method lives only during that call and scope.'),
    goal: tx('Amaç: field, local variable ve Inspector görünürlüğünü birbirine karıştırmamak.', 'Goal: distinguish fields, local variables, and Inspector visibility.'),
    concepts: [
      { tag: 'FIELD', title: tx('Component alanı', 'Component field'), body: tx('Metodların dışında tanımlanır; aynı Component’in farklı metodları erişebilir.', 'Declared outside methods; multiple methods on the same Component can access it.'), example: 'private int score;' },
      { tag: 'LOCAL', title: tx('Yerel değişken', 'Local variable'), body: tx('Metodun içinde tanımlanır; scope bittiğinde erişim sona erer.', 'Declared inside a method; access ends with the scope.'), example: 'int bonus = 5;' },
      { tag: 'INSPECT', title: tx('SerializeField', 'SerializeField'), body: tx('`private` alanı Inspector’da düzenlenebilir tutarken dış scriptlere açmaz.', 'Keeps a `private` field editable in the Inspector without exposing it to other scripts.'), example: '[SerializeField] private int lives;' },
    ],
    code: '[SerializeField] private int lives = 3;\n\nvoid Start()\n{\n    int bonus = 5;\n}',
    analogy: tx('Field evdeki ortak buzdolabı; local variable ise yalnızca yemek hazırlarken kullandığın tezgâhtaki kâsedir.', 'A field is the household fridge; a local variable is a bowl used only while preparing one meal.'),
    practiceTitle: tx('Tanımı doğru yaşam alanına bağla', 'Match each declaration to its lifetime'),
    practice: match([
      { key: 'field', label: tx('Component durumu · field', 'Component state · field') }, { key: 'local', label: tx('Metod içi · local', 'Inside a method · local') }, { key: 'serialized', label: tx('Inspector’da görünen private field', 'Private field visible in Inspector') },
    ], [
      { left: 'private int score;', right: tx('Component durumu · field', 'Component state · field'), why: tx('Class içinde, metodların dışında tanımlıdır.', 'It is inside the class and outside methods.') },
      { left: 'int bonus = 5;', right: tx('Metod içi · local', 'Inside a method · local'), why: tx('Metod scope’u içinde geçici olarak yaşar.', 'It lives temporarily inside method scope.') },
      { left: '[SerializeField] private int lives;', right: tx('Inspector’da görünen private field', 'Private field visible in Inspector'), why: tx('Attribute, private alanı Inspector’a serileştirir.', 'The attribute serialises the private field for the Inspector.') },
    ]),
  },
  'l2-mastery': {
    eyebrow: tx('TRANSFER', 'TRANSFER'), title: tx('Türü ezberleme; oyunun sorusundan çıkar.', 'Do not memorise the type; derive it from the game question.'),
    thesis: tx('Yeni bir oyun fikrinde “kaç tane?”, “adı ne?” ve “açık mı?” soruları doğru türü; erişim ihtiyacı ise doğru scope’u gösterir.', 'In a new game idea, “how many?”, “what name?”, and “is it active?” reveal the type, while access needs reveal the scope.'),
    goal: tx('Amaç: Tür, identifier ve scope kararlarını yeni bağlama aktarabilmek.', 'Goal: transfer type, identifier, and scope decisions to a new context.'),
    concepts: [
      { tag: '?', title: tx('Soruyu belirle', 'Identify the question'), body: tx('Adet mi, metin mi, iki durum mu?', 'Is it a count, text, or a two-state fact?') },
      { tag: '{}', title: tx('Yaşam alanını seç', 'Choose the lifetime'), body: tx('Sadece metod mu kullanacak, Component boyunca mı kalacak?', 'Is it only needed inside a method, or throughout the Component?') },
      { tag: 'Aa', title: tx('İsmi açık yaz', 'Name it clearly'), body: tx('`camelCase` ve niyeti anlatan tam kelimeler kullan.', 'Use `camelCase` and complete words that reveal intent.') },
    ],
    analogy: tx('Bir oyunun veri modelini, ürün etiketleri düzenler gibi kurarsın: içerik türü, raf yeri ve okunabilir ad birlikte karar verir.', 'Design a game data model like product labels: content type, storage location, and readable name work together.'),
    practiceTitle: tx('Yeni senaryoda doğru kararı ver', 'Make the right decision in a new scenario'),
    practice: quiz([
      { prompt: tx('Endless runner’da oyuncunun topladığı altın adedi için en uygun tanım hangisidir?', 'Which declaration best represents collected coins in an endless runner?'), options: [tx('`int collectedCoins = 0;`', '`int collectedCoins = 0;`'), tx('`string collectedCoins = false;`', '`string collectedCoins = false;`'), tx('`bool coin = "0";`', '`bool coin = "0";`')], answer: 0, why: tx('Adet tam sayıdır; çoğul ve açıklayıcı `camelCase` isim niyeti taşır.', 'A count is a whole number; the descriptive plural `camelCase` name conveys intent.') },
      { prompt: tx('Inspector’dan ayarlanacak ama diğer scriptlere açık olmayacak hız için hangisi uygundur?', 'Which declaration suits a speed editable in Inspector but hidden from other scripts?'), options: [tx('`public string speed;`', '`public string speed;`'), tx('`[SerializeField] private int speed;`', '`[SerializeField] private int speed;`'), tx('`bool Speed;`', '`bool Speed;`')], answer: 1, why: tx('`[SerializeField] private` Inspector düzenlemesini ve kapsüllemeyi birlikte sağlar.', '`[SerializeField] private` combines Inspector editing with encapsulation.') },
      { prompt: tx('`playerName` tanımlıyken `PlayerName` kullanılırsa ne olur?', 'What happens if `PlayerName` is used when `playerName` was declared?'), options: [tx('Aynı değer okunur.', 'The same value is read.'), tx('C# en yakın ismi seçer.', 'C# chooses the closest name.'), tx('Tanımlı olmayan farklı bir identifier aranır.', 'A different, undeclared identifier is looked up.')], answer: 2, why: tx('C# büyük/küçük harfe duyarlıdır; iki yazım ayrı semboldür.', 'C# is case-sensitive; the two spellings are separate symbols.') },
    ]),
  },
};

const lesson3: Record<string, ActivityConfig> = {
  'l3-recall': makeCompact('BOOL KÖPRÜSÜ', 'BOOL BRIDGE', 'Karşılaştırma bir sayı değil, cevap üretir.', 'A comparison produces an answer, not a number.', '`lives > 0` ifadesi “can kaç?” diye değil, “can sıfırdan büyük mü?” diye sorar. Sonuç yalnızca `true` veya `false` olur.', '`lives > 0` asks “are lives greater than zero?”, not “how many lives?”. The result is only `true` or `false`.', 'int lives = 3;\nbool canContinue = lives > 0;', quiz([
    { prompt: tx('`3 > 0` ifadesinin türü nedir?', 'What is the type of `3 > 0`?'), options: [tx('`int`', '`int`'), tx('`bool`', '`bool`'), tx('`string`', '`string`')], answer: 1, why: tx('Karşılaştırmalar doğru/yanlış sonucu üretir.', 'Comparisons produce true/false results.') },
    { prompt: tx('`!true` sonucu nedir?', 'What is the result of `!true`?'), options: [tx('`true`', '`true`'), tx('`1`', '`1`'), tx('`false`', '`false`')], answer: 2, why: tx('`!` mantıksal değeri tersine çevirir.', '`!` negates a logical value.') },
  ])),
  'l3-operators': makeCompact('OPERATÖR AİLELERİ', 'OPERATOR FAMILIES', 'Benzer semboller, farklı sorumluluklar.', 'Similar symbols, different responsibilities.', 'Atama değeri değiştirir; karşılaştırma soru sorar; mantık operatörleri birden fazla bool cevabı birleştirir.', 'Assignment changes a value, comparison asks a question, and logical operators combine boolean answers.', 'score = 10;\nbool exact = score == 10;\nbool playable = exact && isGameActive;', match([
    { key: 'assign', label: tx('Atama', 'Assignment') }, { key: 'compare', label: tx('Karşılaştırma', 'Comparison') }, { key: 'logic', label: tx('Mantık birleştirme', 'Logical combination') },
  ], [
    { left: '=', right: tx('Atama', 'Assignment'), why: tx('Sağdaki değeri soldaki hedefe yazar.', 'Writes the right value into the left target.') }, { left: '==', right: tx('Karşılaştırma', 'Comparison'), why: tx('İki değerin eşit olup olmadığını sorar.', 'Asks whether two values are equal.') }, { left: '!=', right: tx('Karşılaştırma', 'Comparison'), why: tx('İki değerin farklı olup olmadığını sorar.', 'Asks whether two values differ.') }, { left: '>', right: tx('Karşılaştırma', 'Comparison'), why: tx('Soldaki değer daha büyük mü diye sorar.', 'Asks whether the left value is greater.') }, { left: '&&', right: tx('Mantık birleştirme', 'Logical combination'), why: tx('İki koşulun da doğru olmasını ister.', 'Requires both conditions to be true.') }, { left: '||', right: tx('Mantık birleştirme', 'Logical combination'), why: tx('Koşullardan birinin doğru olmasını yeterli bulur.', 'Accepts either condition being true.') },
  ])),
  'l3-compare': makeCompact('SINIR DEĞERİ', 'BOUNDARY VALUE', 'Koşulu ezberleme; değer üzerinde çalıştır.', 'Do not memorise a condition; execute it on values.', '`0`, devam etmek ile oyunun bitmesi arasındaki sınırdır. Simülatör, aynı kodu farklı verilerle zihninde çalıştırmayı öğretir.', '`0` is the boundary between continuing and game over. The simulator teaches you to execute the same code mentally with different data.', 'bool positive = lives > 0;\nbool empty = lives == 0;\nbool changed = lives != 3;', { type: 'simulator', variant: 'compare' }),
  'l3-logic': makeCompact('BİLEŞİK KARAR', 'COMPOUND DECISION', 'Bazen tek soru yetmez.', 'Sometimes one question is not enough.', 'Kapıyı açmak için hem anahtar hem enerji gerekiyorsa `&&`; reklam hakkı veya ekstra can seçeneklerinden biri yetiyorsa `||` kullanılır.', 'Use `&&` when both a key and energy are required; use `||` when either an ad continue or extra life is enough.', 'bool canOpen = hasKey && energy > 0;\nbool canContinue = hasLife || hasAdContinue;', sort([
    { key: 'and', label: tx('İkisi de gerekli · &&', 'Both required · &&') }, { key: 'or', label: tx('Biri yeterli · ||', 'Either is enough · ||') }, { key: 'not', label: tx('Tersini sor · !', 'Ask the opposite · !') },
  ], [
    { value: 'Anahtar + enerji', category: 'and', why: tx('Kapı için iki şart da gerekli.', 'Both conditions are needed for the gate.') }, { value: 'Can veya reklam hakkı', category: 'or', why: tx('Devam için seçeneklerden biri yeterli.', 'Either option is enough to continue.') }, { value: 'Oyun aktif değil mi?', category: 'not', why: tx('Bir bool değerin tersini sorar.', 'Negates a boolean value.') }, { value: 'İnternet + oturum', category: 'and', why: tx('Senkronizasyon için ikisi de gerekir.', 'Both are needed for sync.') }, { value: 'Klavye veya dokunma', category: 'or', why: tx('Giriş yöntemlerinden biri yeterlidir.', 'Either input method is enough.') }, { value: 'Kilitli değil', category: 'not', why: tx('Kilit durumunu tersine çevirir.', 'Negates the locked state.') },
  ])),
  'l3-flow': makeCompact('AKIŞ SAHNESİ', 'FLOW SCENE', 'Bir koşul zincirinde tek yol seçilir.', 'Only one path is selected in a conditional chain.', 'Kod yukarıdan aşağı gider. İlk doğru koşulun gövdesi çalışır; aynı zincirdeki diğer dallar atlanır.', 'Code flows top to bottom. The first true condition runs and remaining branches in the chain are skipped.', 'if (lives > 1)\n    Debug.Log("Güvendesin");\nelse if (lives == 1)\n    Debug.Log("Son şans");\nelse\n    Debug.Log("Oyun bitti");', quiz([
    { prompt: tx('`lives = 1` olduğunda hangi mesaj çıkar?', 'Which message appears when `lives = 1`?'), options: [tx('Güvendesin', 'Safe'), tx('Son şans', 'Last chance'), tx('Oyun bitti', 'Game over')], answer: 1, why: tx('İlk koşul yanlış, `lives == 1` doğru olduğu için ikinci dal seçilir.', 'The first condition is false and `lives == 1` is true, so the second branch runs.') },
    { prompt: tx('`lives = -1` olduğunda hangi dal çalışır?', 'Which branch runs when `lives = -1`?'), options: [tx('`if`', '`if`'), tx('`else if`', '`else if`'), tx('`else`', '`else`')], answer: 2, why: tx('Önceki koşullar yanlışsa son güvenlik ağı `else` çalışır.', '`else` is the final fallback when earlier conditions are false.') },
  ])),
  'l3-order': makeCompact('SCOPE MİMARİSİ', 'SCOPE ARCHITECTURE', 'Karar kadar parantezlerin yeri de önemlidir.', 'Brace placement matters as much as the decision.', 'Koşul parantez içinde, çalışacak komutlar süslü parantez içindedir. `else`, bağlı olduğu `if` bloğundan sonra gelir.', 'The condition is inside parentheses and executed statements are inside braces. `else` follows its related `if` block.', 'if (lives > 0)\n{\n    Debug.Log("Devam");\n}\nelse\n{\n    Debug.Log("Oyun bitti");\n}', sequence([
    { id: 'a', label: 'if (lives > 0)', detail: tx('Önce koşul sorulur.', 'Ask the condition first.') }, { id: 'b', label: '{ Debug.Log("Devam"); }', detail: tx('Doğru dalın gövdesi.', 'The true branch body.') }, { id: 'c', label: 'else', detail: tx('Önceki koşul yanlışsa alternatif dal.', 'The alternative when the condition is false.') }, { id: 'd', label: '{ Debug.Log("Oyun bitti"); }', detail: tx('Yanlış dalın gövdesi.', 'The false branch body.') },
  ])),
  'l3-mastery': makeCompact('KARAR TRANSFERİ', 'DECISION TRANSFER', 'Aynı mantık, farklı oyun sistemleri.', 'The same logic, different game systems.', 'Operatörü sembolün görünüşünden değil, tasarım cümlesindeki “ve”, “veya”, “değil” ilişkilerinden seç.', 'Choose an operator from the design sentence’s “and”, “or”, and “not” relationships—not from symbol appearance.', 'bool reward = levelComplete && !rewardClaimed;', quiz([
    { prompt: tx('Ödül yalnızca bölüm bittiyse ve daha önce alınmadıysa verilecek. Hangisi doğru?', 'Reward is granted only if the level is complete and it was not claimed. Which is correct?'), options: [tx('`levelComplete || rewardClaimed`', '`levelComplete || rewardClaimed`'), tx('`levelComplete && !rewardClaimed`', '`levelComplete && !rewardClaimed`'), tx('`!levelComplete && rewardClaimed`', '`!levelComplete && rewardClaimed`')], answer: 1, why: tx('İki şart birlikte gerekli ve ikinci durumun tersi isteniyor.', 'Both conditions are required, with the second negated.') },
    { prompt: tx('Enerji `0` iken `energy > 0` sonucu nedir?', 'What is `energy > 0` when energy is `0`?'), options: [tx('`true`', '`true`'), tx('`false`', '`false`'), tx('`0`', '`0`')], answer: 1, why: tx('Sıfır, sıfırdan büyük değildir; sonuç bool `false` olur.', 'Zero is not greater than zero; the boolean result is `false`.') },
  ])),
};

const lesson4: Record<string, ActivityConfig> = {
  'l4-recall': makeCompact('METOD ANATOMİSİ', 'METHOD ANATOMY', 'Metod, adı olan tekrar kullanılabilir bir davranıştır.', 'A method is named reusable behaviour.', '`void Move(float speed)` satırı dönüş türü, ad ve parametre arayüzünü; süslü parantezler ise çalışacak gövdeyi tanımlar.', '`void Move(float speed)` defines the return type, name, and parameter interface; braces define the executable body.', 'void Move(float speed)\n{\n    transform.Translate(Vector3.forward * speed);\n}', quiz([
    { prompt: tx('`void` neyi söyler?', 'What does `void` tell us?'), options: [tx('Metod değer döndürmez.', 'The method returns no value.'), tx('Metod hiç çalışmaz.', 'The method never runs.'), tx('Metod yalnızca Unity’ye aittir.', 'The method only belongs to Unity.')], answer: 0, why: tx('`void` bir dönüş türüdür ve sonuç değeri olmadığını belirtir.', '`void` is a return type indicating there is no returned value.') },
    { prompt: tx('`float speed` nedir?', 'What is `float speed`?'), options: [tx('Class adı', 'Class name'), tx('Parametre', 'Parameter'), tx('Comment', 'Comment')], answer: 1, why: tx('Metod çağrılırken dışarıdan alınacak veriyi tanımlar.', 'It defines data received when the method is called.') },
  ])),
  'l4-methods': makeCompact('ÇAĞRI ARAYÜZÜ', 'CALL INTERFACE', 'Parantezler, metodun dış dünyayla anlaşmasıdır.', 'Parentheses are the method’s contract with the outside world.', 'Parametre türü hangi verinin gelebileceğini, parametre adı ise gövde içinde o veriye nasıl ulaşılacağını söyler.', 'A parameter type defines what data can arrive; its name defines how the body accesses that data.', 'void Move(float speed)\n{\n    Debug.Log(speed);\n}', match([
    { key: 'return', label: tx('Dönüş türü', 'Return type') }, { key: 'name', label: tx('Metod adı', 'Method name') }, { key: 'parameter', label: tx('Parametre', 'Parameter') }, { key: 'body', label: tx('Çalışan gövde', 'Executable body') },
  ], [
    { left: 'void', right: tx('Dönüş türü', 'Return type'), why: tx('Metodun bir değer döndürmediğini belirtir.', 'It indicates that the method returns no value.') }, { left: 'Move', right: tx('Metod adı', 'Method name'), why: tx('Davranışı çağırmak için kullanılan addır.', 'The name used to call the behaviour.') }, { left: 'float speed', right: tx('Parametre', 'Parameter'), why: tx('Çağrıdan gelen ondalıklı hızı alır.', 'Receives a decimal speed from the call.') }, { left: '{ ... }', right: tx('Çalışan gövde', 'Executable body'), why: tx('Metod çağrıldığında yürütülen komutları kapsar.', 'Contains statements executed when called.') },
  ])),
  'l4-order': makeCompact('BAŞLANGIÇ ZAMAN ÇİZGİSİ', 'STARTUP TIMELINE', 'Aynı nesnede başlangıç tek bir an değildir.', 'Startup is not a single moment.', '`Awake` iç hazırlık, `OnEnable` etkinleşme, `Start` ise ilk aktif başlangıç için kullanılır. Nesne yeniden etkinleştiğinde `OnEnable` tekrar gelir.', '`Awake` handles internal setup, `OnEnable` handles enabling, and `Start` handles the first active start. `OnEnable` repeats when re-enabled.', 'Awake → OnEnable → Start\nDisable → OnEnable', sequence([
    { id: 'a', label: 'Awake', detail: tx('Nesnenin kendi referanslarını hazırlar.', 'Prepares the object’s own references.') }, { id: 'b', label: 'OnEnable', detail: tx('Etkinleşmeyle birlikte abonelikleri açar.', 'Opens subscriptions on enable.') }, { id: 'c', label: 'Start', detail: tx('İlk aktif başlangıç hazırlığını yapar.', 'Performs first active-start setup.') },
  ])),
  'l4-callbacks': makeCompact('SORUMLULUK HARİTASI', 'RESPONSIBILITY MAP', 'Doğru iş, doğru zamanda çalışmalıdır.', 'The right work must run at the right time.', 'Callback seçimi yalnızca “çalışıyor mu?” sorusu değildir; giriş, fizik ve kamera farklı zamanlama ihtiyaçlarına sahiptir.', 'Choosing a callback is not only about whether code works; input, physics, and camera have different timing needs.', 'Update → input\nFixedUpdate → physics\nLateUpdate → camera', match([
    { key: 'awake', label: tx('Awake', 'Awake') }, { key: 'enable', label: tx('OnEnable', 'OnEnable') }, { key: 'update', label: tx('Update', 'Update') }, { key: 'fixed', label: tx('FixedUpdate', 'FixedUpdate') }, { key: 'late', label: tx('LateUpdate', 'LateUpdate') },
  ], [
    { left: 'Kendi Component referansını bul', right: tx('Awake', 'Awake'), why: tx('Nesnenin iç hazırlığıdır.', 'It is internal object setup.') }, { left: 'Event aboneliği aç', right: tx('OnEnable', 'OnEnable'), why: tx('Her etkinleşmede abonelik yenilenmelidir.', 'Subscriptions should refresh on each enable.') }, { left: 'Klavye/dokunma oku', right: tx('Update', 'Update'), why: tx('Giriş frame ritminde okunur.', 'Input is read on the frame rhythm.') }, { left: 'Rigidbody kuvveti uygula', right: tx('FixedUpdate', 'FixedUpdate'), why: tx('Fizik sabit zaman adımında hesaplanır.', 'Physics is calculated on fixed time steps.') }, { left: 'Oyuncuyu kamera ile takip et', right: tx('LateUpdate', 'LateUpdate'), why: tx('Kamera oyuncu hareketinden sonra güncellenir.', 'The camera updates after player movement.') },
  ])),
  'l4-frames': makeCompact('İKİ AYRI SAAT', 'TWO CLOCKS', 'Görüntü ve fizik aynı ritimde ilerlemek zorunda değildir.', 'Rendering and physics need not advance at the same rhythm.', 'FPS cihaz yüküne göre değişebilir. Fizik adımı sabit tutulur; böylece kuvvetler farklı cihazlarda daha tutarlı sonuç verir.', 'FPS can vary with device load. Physics time remains fixed so forces behave more consistently across devices.', 'Update();       // her render frame\nFixedUpdate();  // sabit fizik adımı\nLateUpdate();   // Update sonrasında', { type: 'simulator', variant: 'frames' }),
  'l4-performance': makeCompact('FRAME BÜTÇESİ', 'FRAME BUDGET', 'Her frame yapılan küçük işler birikir.', 'Small per-frame work accumulates.', '60 FPS’de `Update` içindeki bir işlem dakikada yaklaşık 3.600 kez çalışır. Tek seferlik işler olaylara veya başlangıç callback’lerine taşınır.', 'At 60 FPS, work inside `Update` runs about 3,600 times per minute. One-off work belongs in events or startup callbacks.', '// Yalnızca gerçekten her frame gereken işi Update içine koy.', sort([
    { key: 'frame', label: tx('Her frame gerekli', 'Needed every frame') }, { key: 'event', label: tx('Olayda / bir kez yeterli', 'Only on an event / once') },
  ], [
    { value: 'Input oku', category: 'frame', why: tx('Kullanıcı girişi frame’ler arasında değişebilir.', 'User input can change between frames.') }, { value: 'Kamera takip et', category: 'frame', why: tx('Hedef hareket ettikçe kamera güncellenir.', 'The camera updates as the target moves.') }, { value: 'Başlangıç mesajı yaz', category: 'event', why: tx('Bir kez `Start` içinde yeterlidir.', 'Once in `Start` is enough.') }, { value: 'UI butonuna tepki ver', category: 'event', why: tx('Buton olayına bağlanmalıdır.', 'It should subscribe to the button event.') }, { value: 'Sayaç animasyonu güncelle', category: 'frame', why: tx('Aktif animasyon boyunca sürekli değişir.', 'It changes continuously while animating.') }, { value: 'Referansı bul', category: 'event', why: tx('Genellikle başlangıçta önbelleğe alınır.', 'Usually cached during initialisation.') }, { value: 'Kayıt dosyasını yükle', category: 'event', why: tx('Her frame disk okuması yapılmaz.', 'Disk is not read every frame.') }, { value: 'Nişangâhı fareye taşı', category: 'frame', why: tx('İşaretçi konumu her frame değişebilir.', 'Pointer position can change every frame.') },
  ])),
  'l4-mastery': makeCompact('ZAMANLAMA KARARI', 'TIMING DECISION', 'Callback adı, davranışın ne zamanını tanımlar.', 'A callback name defines when behaviour runs.', 'İşi doğru metoda yerleştirmek okunabilirlik, fizik tutarlılığı ve performans için gereklidir.', 'Placing work in the right method supports readability, physics consistency, and performance.', 'Awake → OnEnable → Start → Update → LateUpdate', quiz([
    { prompt: tx('Kamera takibi neden çoğunlukla `LateUpdate` içindedir?', 'Why is camera follow commonly placed in `LateUpdate`?'), options: [tx('Daha güzel göründüğü için.', 'Because it looks nicer.'), tx('Oyuncu hareketi tamamlandıktan sonra güncellenmek için.', 'To update after player movement finishes.'), tx('Fizik yalnızca orada çalıştığı için.', 'Because physics only works there.')], answer: 1, why: tx('Kamera hedefin o frame’deki son konumunu izler.', 'The camera follows the target’s final position for the frame.') },
    { prompt: tx('GameObject kapatılıp yeniden açıldığında hangisi tekrar çalışır?', 'Which method runs again when a GameObject is disabled and re-enabled?'), options: [tx('Yalnızca `Start`', 'Only `Start`'), tx('`OnEnable`', '`OnEnable`'), tx('Class bildirimi', 'The class declaration')], answer: 1, why: tx('`OnEnable` her etkinleşmede çağrılır; `Start` ilk aktif başlangıçta bir kez çalışır.', '`OnEnable` runs on every enable; `Start` runs once on the first active start.') },
  ])),
};

const lesson5: Record<string, ActivityConfig> = {
  'l5-recall': makeCompact('ARALIKLI TEKRAR', 'SPACED REVIEW', 'Bilgi, geri çağrıldıkça kalıcı olur.', 'Knowledge becomes durable when recalled.', 'Bu tur yeni bilgi vermeden önce tür, koşul, callback ve hata okuma yollarını belleğinden çıkarmanı ister.', 'Before new content, this round asks you to retrieve types, conditions, callbacks, and diagnostic reading from memory.', 'int lives = 1;\nif (lives > 0) Debug.Log("Devam");', quiz([
    { prompt: tx('Tırnak içindeki `"3"` hangi türdür?', 'What type is quoted `"3"`?'), options: [tx('`int`', '`int`'), tx('`string`', '`string`'), tx('`bool`', '`bool`')], answer: 1, why: tx('Tırnaklar değeri metin literaline dönüştürür.', 'Quotes make the value a string literal.') },
    { prompt: tx('Rigidbody kuvveti hangi callback ile eşleşir?', 'Which callback matches Rigidbody force?'), options: [tx('`FixedUpdate`', '`FixedUpdate`'), tx('`LateUpdate`', '`LateUpdate`'), tx('`awake`', '`awake`')], answer: 0, why: tx('Fizik kuvvetleri sabit fizik adımında uygulanır.', 'Physics forces are applied on the fixed physics step.') },
    { prompt: tx('`packageCount` tanımlıyken `packagecount` kullanmak ne üretir?', 'What does using `packagecount` when `packageCount` is declared produce?'), options: [tx('Aynı değeri', 'The same value'), tx('Tanımsız isim hatasını', 'An undefined-name diagnostic'), tx('Otomatik düzeltmeyi', 'An automatic correction')], answer: 1, why: tx('C# identifier eşleşmesi büyük/küçük harfe duyarlıdır.', 'C# identifier matching is case-sensitive.') },
  ])),
  'l5-components': makeCompact('NESNE MİMARİSİ', 'OBJECT ARCHITECTURE', 'GameObject bir taşıyıcı, Component’ler yeteneklerdir.', 'A GameObject is a container; Components are capabilities.', 'Boş bir GameObject yalnızca Transform taşır. Görsel, fizik ve özel davranış ihtiyaç oldukça ayrı Component’ler halinde eklenir.', 'An empty GameObject only has a Transform. Visuals, physics, and custom behaviour are added as separate Components when needed.', 'Player\n├─ Transform\n├─ SpriteRenderer\n├─ Rigidbody\n├─ CapsuleCollider\n└─ PlayerController', { type: 'simulator', variant: 'components' }),
  'l5-roles': makeCompact('TEK SORUMLULUK', 'SINGLE RESPONSIBILITY', 'Her Component farklı bir soruya cevap verir.', 'Each Component answers a different question.', 'Konum bilgisi, fizik hareketi, temas şekli ve özel oyun mantığı aynı şey değildir. Unity bunları ayrı Component’lere böler.', 'Position, physics motion, contact shape, and custom game logic are different concerns. Unity splits them into Components.', 'Transform · Rigidbody · Collider · MonoBehaviour', match([
    { key: 'transform', label: tx('Konum, dönüş ve ölçek', 'Position, rotation, and scale') }, { key: 'rigidbody', label: tx('Fizik gövdesi ve hız', 'Physics body and velocity') }, { key: 'collider', label: tx('Temas sınırı / algılama hacmi', 'Contact boundary / detection volume') }, { key: 'script', label: tx('Oyuna özel davranış', 'Game-specific behaviour') },
  ], [
    { left: 'Transform', right: tx('Konum, dönüş ve ölçek', 'Position, rotation, and scale'), why: tx('Her GameObject’in uzaydaki varlığını tanımlar.', 'Defines every GameObject’s presence in space.') }, { left: 'Rigidbody', right: tx('Fizik gövdesi ve hız', 'Physics body and velocity'), why: tx('Kütle, yer çekimi ve fizik hareketini yönetir.', 'Manages mass, gravity, and physics movement.') }, { left: 'Collider', right: tx('Temas sınırı / algılama hacmi', 'Contact boundary / detection volume'), why: tx('Fizik motorunun temas şeklini tanımlar.', 'Defines the contact shape for the physics engine.') }, { left: 'PlayerController', right: tx('Oyuna özel davranış', 'Game-specific behaviour'), why: tx('Senin yazdığın kuralları Component olarak ekler.', 'Adds your custom rules as a Component.') },
  ])),
  'l5-trigger': makeCompact('TEMAS SAHNESİ', 'CONTACT SCENE', 'Collider her zaman duvar olmak zorunda değildir.', 'A Collider does not always need to be a wall.', '`Is Trigger` kapalıyken fiziksel temas hareketi engelleyebilir. Açıkken nesne geçer fakat giriş/çıkış callback’leriyle olay üretilir.', 'With `Is Trigger` off, physical contact can block movement. With it on, objects pass through but entry/exit callbacks produce events.', 'OnCollisionEnter(...)  // katı temas\nOnTriggerEnter(...)    // olay alanı', { type: 'simulator', variant: 'trigger' }),
  'l5-requirements': makeCompact('FİZİK TARİFİ', 'PHYSICS RECIPE', 'Callback, sahne kurulumu olmadan tek başına yetmez.', 'A callback alone is not enough without scene setup.', 'Trigger algılamasında iki nesnenin temas şekilleri Collider ile tanımlanır; en az bir fizik gövdesi ve trigger ayarı etkileşimi görünür kılar.', 'In trigger detection, Colliders define both contact shapes; at least one physics body and the trigger setting make the interaction observable.', 'Player: Rigidbody + Collider\nPickup: Collider (Is Trigger ✓)', sort([
    { key: 'player', label: tx('Oyuncu', 'Player') }, { key: 'pickup', label: tx('Pickup alanı', 'Pickup volume') }, { key: 'code', label: tx('Script davranışı', 'Script behaviour') },
  ], [
    { value: 'Rigidbody', category: 'player', why: tx('Hareket eden fizik tarafını tanımlar.', 'Defines the moving physics participant.') }, { value: 'Collider', category: 'player', why: tx('Oyuncunun temas şeklini tanımlar.', 'Defines the player’s contact shape.') }, { value: 'Collider', category: 'pickup', why: tx('Algılama hacmini tanımlar.', 'Defines the detection volume.') }, { value: 'Is Trigger ✓', category: 'pickup', why: tx('Katı engel yerine olay alanı yapar.', 'Turns a solid boundary into an event volume.') }, { value: 'OnTriggerEnter', category: 'code', why: tx('Temas başladığında Unity’nin çağıracağı callback’tir.', 'The callback Unity invokes when overlap begins.') }, { value: 'other.name', category: 'code', why: tx('Temas eden diğer Collider’ın GameObject adını okur.', 'Reads the contacting Collider GameObject’s name.') },
  ])),
  'l5-inspector': makeCompact('REFERANS ZİNCİRİ', 'REFERENCE CHAIN', 'Alan tanımlamak, referansın dolu olduğu anlamına gelmez.', 'Declaring a field does not mean its reference is assigned.', '`[SerializeField] private Rigidbody playerRigidbody;` Inspector’da bir yuva açar. Component sürüklenmezse değer `null` kalır.', '`[SerializeField] private Rigidbody playerRigidbody;` opens a slot in the Inspector. Without dragging a Component into it, the value remains `null`.', '[SerializeField] private Rigidbody playerRigidbody;\n\nvoid Start()\n{\n    playerRigidbody.AddForce(Vector3.up);\n}', debug(['[SerializeField]', 'private Rigidbody playerRigidbody;', '', 'void Start()', '{', '    playerRigidbody.AddForce(Vector3.up);', '}'], 5, tx('Hata 6. satırda görünür; kök neden Inspector’daki `playerRigidbody` referansının atanmamış (`null`) olmasıdır. Satırı değil, veri zincirini düzelt.', 'The error appears on line 6, but the root cause is the unassigned (`null`) `playerRigidbody` reference in the Inspector. Fix the data chain, not merely the line.'))),
  'l5-mastery': makeCompact('MODÜL 1 FİNALİ', 'MODULE 1 FINALE', 'Bir pickup, ilk beş dersin ortak ürünüdür.', 'A pickup combines all five lessons.', 'Adet için değişken, toplama hakkı için koşul, temas için callback ve algılama için Component gerekir. Sistemler tek satırla değil, sorumlulukların işbirliğiyle oluşur.', 'A pickup needs a count variable, a condition for eligibility, a callback for contact, and Components for detection. Systems emerge from cooperating responsibilities.', 'void OnTriggerEnter(Collider other)\n{\n    if (other.CompareTag("Pickup"))\n        collectedCount = collectedCount + 1;\n}', quiz([
    { prompt: tx('Pickup’ı geçilebilir ama algılanabilir yapan ayar hangisidir?', 'Which setting makes a pickup passable yet detectable?'), options: [tx('Collider → Is Trigger', 'Collider → Is Trigger'), tx('Transform → Scale 0', 'Transform → Scale 0'), tx('Script adını küçültmek', 'Lowercasing the script name')], answer: 0, why: tx('Trigger Collider fiziksel engel yerine olay hacmi gibi davranır.', 'A trigger Collider behaves as an event volume rather than a solid obstacle.') },
    { prompt: tx('Toplanan nesne adedini hangi türle tutarsın?', 'Which type stores the number of collected objects?'), options: [tx('`string`', '`string`'), tx('`bool`', '`bool`'), tx('`int`', '`int`')], answer: 2, why: tx('Adet kesirsiz bir tam sayıdır.', 'A count is a whole number.') },
    { prompt: tx('Temas eden nesne bilgisini hangi parça taşır?', 'Which part carries information about the contacting object?'), options: [tx('`Collider other` parametresi', 'The `Collider other` parameter'), tx('`void` dönüş türü', 'The `void` return type'), tx('Class süslü parantezi', 'The class brace')], answer: 0, why: tx('Unity, diğer Collider bilgisini callback parametresiyle verir.', 'Unity supplies the other Collider through the callback parameter.') },
  ])),
};

Object.assign(configs, lesson3, lesson4, lesson5);

function makeCompact(eyebrowTr: string, eyebrowEn: string, titleTr: string, titleEn: string, thesisTr: string, thesisEn: string, code: string, practice: Practice): ActivityConfig {
  return {
    eyebrow: tx(eyebrowTr, eyebrowEn), title: tx(titleTr, titleEn), thesis: tx(thesisTr, thesisEn),
    goal: tx('Amaç: Kavramı önce anlamlandırmak, sonra yeni bir örnekte doğru kullanmak.', 'Goal: make sense of the concept first, then use it correctly in a new example.'),
    concepts: conceptCardsFor(code), code,
    analogy: tx('Kodu bir talimat listesi gibi değil, veri ile zamanlamanın birlikte oluşturduğu davranış olarak oku.', 'Read code not as a list of instructions, but as behaviour created by data and timing together.'),
    practiceTitle: tx('Şimdi sen uygula', 'Now apply it yourself'), practice,
  };
}

function conceptCardsFor(code: string): Concept[] {
  const hasMethod = /\b(?:void|Awake|Update|OnTrigger)/.test(code);
  const hasCondition = /\b(?:if|bool|>|==|&&|\|\|)/.test(code);
  return [
    { tag: 'OKU', title: tx('Sözdizimini oku', 'Read the syntax'), body: tx('Renkler ve işaretler, kodun hangi parçasının ne görev yaptığını gösterir.', 'Colours and symbols reveal the responsibility of each code fragment.'), example: hasMethod ? 'ad + () + { gövde }' : 'tür + isim + değer' },
    { tag: 'ÇALIŞTIR', title: tx('Akışı zihninde yürüt', 'Execute mentally'), body: tx('Kodun hangi anda ve hangi sırayla değerlendirildiğini adım adım izle.', 'Trace when and in what order the code is evaluated.'), example: hasCondition ? 'soru → bool → dal' : 'veri → işlem → sonuç' },
    { tag: 'AÇIKLA', title: tx('Davranışı cümleye çevir', 'Translate into behaviour'), body: tx('Sembolü ezberlemek yerine oyunda görünür olan sonucu kendi cümlenle söyle.', 'Rather than memorising symbols, state the visible game result in your own words.'), example: '“Bu kod ... olduğunda ... yapar.”' },
  ];
}

export function ModuleActivity({ stepId, locale, onComplete }: { stepId: string; locale: Locale; onComplete: () => void }) {
  const config = configs[stepId];
  const [practiceOpen, setPracticeOpen] = useState(false);
  if (!config) return null;
  return (
    <section className="module-activity" aria-labelledby={`${stepId}-title`}>
      <header className="module-hero">
        <div><span>{t(locale, config.eyebrow)}</span><h2 id={`${stepId}-title`}>{t(locale, config.title)}</h2><p>{t(locale, config.thesis)}</p></div>
        <div className="module-goal"><Icon name="gauge" /><p>{t(locale, config.goal)}</p></div>
      </header>
      <div className="module-concept-grid">
        {config.concepts.map((concept, index) => <article key={`${concept.tag}-${index}`} style={{ '--delay': `${index * 90}ms` } as React.CSSProperties}><span>{concept.tag}</span><h3>{t(locale, concept.title)}</h3><p>{t(locale, concept.body)}</p>{concept.example && <code>{concept.example}</code>}</article>)}
      </div>
      {config.code && <RichCode code={config.code} />}
      <div className="module-analogy"><span aria-hidden="true">↗</span><div><strong>{locale === 'tr' ? 'Zihinsel model' : 'Mental model'}</strong><p>{t(locale, config.analogy)}</p></div></div>
      {!practiceOpen ? <button className="module-unlock" type="button" onClick={() => setPracticeOpen(true)}><span><small>{locale === 'tr' ? 'Önce kavram, sonra uygulama' : 'Concept first, practice second'}</small><strong>{locale === 'tr' ? 'Anladım, uygulamayı aç' : 'I understand, open practice'}</strong></span><Icon name="arrow-right" /></button> : <div className="module-practice enter-view"><div className="module-practice-heading"><span>{locale === 'tr' ? 'UYGULAMA' : 'PRACTICE'}</span><h3>{t(locale, config.practiceTitle)}</h3></div><PracticeRenderer key={stepId} practice={config.practice} stepId={stepId} locale={locale} onComplete={onComplete} /></div>}
    </section>
  );
}

function RichCode({ code }: { code: string }) {
  return <div className="module-code"><div><i /><i /><i /><span>ConceptLab.cs</span></div><pre>{code.split('\n').map((line, index) => <code key={`${line}-${index}`}><b>{index + 1}</b>{highlight(line)}</code>)}</pre></div>;
}

function highlight(line: string) {
  const tokens = line.split(/("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:public|private|void|int|bool|string|if|else|true|false|return|class)\b|\b(?:Debug|Log|MonoBehaviour|Awake|OnEnable|Start|Update|FixedUpdate|LateUpdate|Rigidbody|Collider|Transform|SerializeField|Vector3|CompareTag)\b|\b\d+\b)/g);
  return tokens.map((token, index) => {
    const className = token.startsWith('//') ? 'tok-comment' : token.startsWith('"') ? 'tok-string' : /^(public|private|void|int|bool|string|if|else|true|false|return|class)$/.test(token) ? 'tok-keyword' : /^(Debug|Log|MonoBehaviour|Awake|OnEnable|Start|Update|FixedUpdate|LateUpdate|Rigidbody|Collider|Transform|SerializeField|Vector3|CompareTag)$/.test(token) ? 'tok-api' : /^\d+$/.test(token) ? 'tok-number' : '';
    return className ? <span className={className} key={`${token}-${index}`}>{token}</span> : token;
  });
}

function PracticeRenderer({ practice, stepId, locale, onComplete }: { practice: Practice; stepId: string; locale: Locale; onComplete: () => void }) {
  if (practice.type === 'quiz') return <QuizPractice practice={practice} locale={locale} onComplete={onComplete} />;
  if (practice.type === 'match') return <MatchPractice practice={practice} locale={locale} onComplete={onComplete} />;
  if (practice.type === 'sort') return <SortPractice practice={practice} locale={locale} onComplete={onComplete} />;
  if (practice.type === 'sequence') return <SequencePractice practice={practice} locale={locale} onComplete={onComplete} />;
  if (practice.type === 'debug') return <DebugPractice practice={practice} locale={locale} onComplete={onComplete} />;
  return <SimulatorPractice variant={practice.variant} stepId={stepId} locale={locale} onComplete={onComplete} />;
}

function QuizPractice({ practice, locale, onComplete }: { practice: Extract<Practice, { type: 'quiz' }>; locale: Locale; onComplete: () => void }) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const q = practice.questions[index]; const correct = selected === q.answer;
  const next = () => { if (index === practice.questions.length - 1) onComplete(); else { setIndex(index + 1); setSelected(null); } };
  return <div className="module-quiz"><div className="module-counter">{index + 1} / {practice.questions.length}</div><h4>{t(locale, q.prompt)}</h4><div className="module-option-list">{q.options.map((option, optionIndex) => <button type="button" key={optionIndex} disabled={selected !== null} className={selected === optionIndex ? optionIndex === q.answer ? 'correct' : 'incorrect' : selected !== null && optionIndex === q.answer ? 'correct reveal' : ''} onClick={() => setSelected(optionIndex)}><b>{String.fromCharCode(65 + optionIndex)}</b><span>{t(locale, option)}</span></button>)}</div>{selected !== null && <Feedback correct={correct} text={t(locale, q.why)} />}{correct && <button className="button button-primary module-next" type="button" onClick={next}>{index === practice.questions.length - 1 ? (locale === 'tr' ? 'Etkinliği tamamla' : 'Complete activity') : (locale === 'tr' ? 'Sonraki soru' : 'Next question')}<Icon name="arrow-right" /></button>}</div>;
}

function MatchPractice({ practice, locale, onComplete }: { practice: Extract<Practice, { type: 'match' }>; locale: Locale; onComplete: () => void }) {
  const [index, setIndex] = useState(0); const [wrong, setWrong] = useState(''); const item = practice.items[index];
  const choose = (label: LocalText) => { if (t(locale, label) === t(locale, item.right)) { setWrong(''); if (index === practice.items.length - 1) onComplete(); else setIndex(index + 1); } else setWrong(locale === 'tr' ? 'Bu görev o parçaya ait değil. Sembolün kodda neyi değiştirdiğini yeniden düşün.' : 'That responsibility belongs elsewhere. Reconsider what the symbol changes in code.'); };
  return <div className="module-match"><div className="match-focus"><small>{locale === 'tr' ? 'EŞLEŞTİRİLECEK PARÇA' : 'ITEM TO MATCH'}</small><code>{item.left}</code><span>{index + 1} / {practice.items.length}</span></div><div className="match-targets">{practice.labels.map((label) => <button key={label.key} type="button" onClick={() => choose(label.label)}>{t(locale, label.label)}</button>)}</div>{wrong && <Feedback correct={false} text={wrong} />}{!wrong && index > 0 && <Feedback correct text={t(locale, practice.items[index - 1].why)} />}</div>;
}

function SortPractice({ practice, locale, onComplete }: { practice: Extract<Practice, { type: 'sort' }>; locale: Locale; onComplete: () => void }) {
  const [index, setIndex] = useState(0); const [message, setMessage] = useState<LocalText | null>(null); const [wrong, setWrong] = useState(false); const item = practice.items[index];
  const choose = (key: string) => { if (key !== item.category) { setWrong(true); setMessage(tx('Bu kutu değerin anlamıyla uyuşmuyor. Tırnak, sayı ve bağlam ipuçlarını yeniden oku.', 'This bucket does not match the value’s meaning. Re-read quotes, numbers, and context.')); return; } setWrong(false); setMessage(item.why); window.setTimeout(() => { if (index === practice.items.length - 1) onComplete(); else { setIndex(index + 1); setMessage(null); } }, 520); };
  return <div className="module-sort"><div className="sort-progress"><span style={{ width: `${(index / practice.items.length) * 100}%` }} /></div><div className="sort-value"><small>{locale === 'tr' ? 'DEĞERİ OKU' : 'READ THE VALUE'}</small><code>{item.value}</code><span>{index + 1} / {practice.items.length}</span></div><div className="sort-buckets">{practice.categories.map((category) => <button key={category.key} type="button" onClick={() => choose(category.key)}><span>{t(locale, category.label)}</span><small>{locale === 'tr' ? 'Buraya gönder' : 'Send here'}</small></button>)}</div>{message && <Feedback correct={!wrong} text={t(locale, message)} />}</div>;
}

function SequencePractice({ practice, locale, onComplete }: { practice: Extract<Practice, { type: 'sequence' }>; locale: Locale; onComplete: () => void }) {
  const initial = useMemo(() => [...practice.items].reverse(), [practice.items]); const [items, setItems] = useState(initial); const [checked, setChecked] = useState(false);
  const move = (index: number, direction: -1 | 1) => { const next = [...items]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setItems(next); setChecked(false); };
  const correct = items.every((item, index) => item.id === practice.items[index].id);
  return <div className="module-sequence"><ol>{items.map((item, index) => <li key={item.id}><span>{index + 1}</span><div><code>{item.label}</code><small>{t(locale, item.detail)}</small></div><p><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Yukarı taşı">↑</button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Aşağı taşı">↓</button></p></li>)}</ol><button className="button button-primary" type="button" onClick={() => { setChecked(true); if (correct) onComplete(); }}>{locale === 'tr' ? 'Sırayı kontrol et' : 'Check order'}</button>{checked && <Feedback correct={correct} text={correct ? (locale === 'tr' ? 'Akış doğru: kod okunabilir ve scope sınırları korunuyor.' : 'The flow is correct and scope boundaries are preserved.') : (locale === 'tr' ? 'Henüz değil. Önce çağrıyı veya koşulu, sonra ona ait gövdeyi düşün.' : 'Not yet. Think of the call or condition first, followed by its body.')} />}</div>;
}

function DebugPractice({ practice, locale, onComplete }: { practice: Extract<Practice, { type: 'debug' }>; locale: Locale; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null); const correct = selected === practice.answer;
  return <div className="module-debug"><div className="debug-console"><strong>Console</strong><p><b>✕</b><span>{locale === 'tr' ? 'Hata kaydı bir dosya ve satıra işaret ediyor. Kök nedeni taşıyan satırı seç.' : 'The diagnostic points to a file and line. Select the line carrying the root cause.'}</span></p></div><ol>{practice.lines.map((line, index) => <li key={`${line}-${index}`}><button type="button" className={selected === index ? correct ? 'correct' : 'incorrect' : ''} onClick={() => { setSelected(index); if (index === practice.answer) onComplete(); }}><b>{index + 1}</b><code>{line || ' '}</code></button></li>)}</ol>{selected !== null && <Feedback correct={correct} text={correct ? t(locale, practice.why) : (locale === 'tr' ? 'Bu satır belirtinin göründüğü yer olabilir; fakat seçtiğimiz vakada kök neden başka satırda. Tanım ile kullanımı birlikte izle.' : 'This may be where a symptom appears, but the root cause is elsewhere. Trace declaration and use together.')} />}</div>;
}

function SimulatorPractice({ variant, locale, onComplete }: { variant: Extract<Practice, { type: 'simulator' }>['variant']; stepId: string; locale: Locale; onComplete: () => void }) {
  const [value, setValue] = useState(3); const [active, setActive] = useState(true); const [name, setName] = useState('Ada'); const [fps, setFps] = useState(60); const [parts, setParts] = useState(['Transform']); const [trigger, setTrigger] = useState(false); const [ran, setRan] = useState(false);
  if (variant === 'state') return <div className="module-simulator state-sim"><div className="sim-controls"><label>{locale === 'tr' ? 'Kargo adedi' : 'Package count'} <input type="range" min="0" max="12" value={value} onChange={(e) => { setValue(Number(e.target.value)); setRan(true); }} /><b>{value}</b></label><label>{locale === 'tr' ? 'Oyuncu adı' : 'Player name'} <input value={name} maxLength={12} onChange={(e) => { setName(e.target.value); setRan(true); }} /></label><button type="button" className={active ? 'toggle on' : 'toggle'} onClick={() => { setActive(!active); setRan(true); }}><span />{active ? 'true' : 'false'}</button></div><div className="state-surfaces"><article><small>CODE</small><code>int packageCount = {value};</code><code>string playerName = "{name}";</code><code>bool isGameActive = {String(active)};</code></article><article className="sim-hud"><small>GAME HUD</small><strong>📦 × {value}</strong><span>{name || '—'} · {active ? 'PLAY' : 'PAUSE'}</span></article><article><small>CONSOLE</small><code>{name || 'Player'} | {value} | {String(active)}</code></article></div>{ran && <button className="button button-primary" type="button" onClick={onComplete}>{locale === 'tr' ? 'Üç yüzeyi ilişkilendirdim' : 'I connected all three surfaces'}<Icon name="check" /></button>}</div>;
  if (variant === 'compare') return <div className="module-simulator compare-sim"><label>{locale === 'tr' ? 'lives değerini değiştir' : 'Change the lives value'}<input type="range" min="-2" max="5" value={value} onChange={(e) => { setValue(Number(e.target.value)); setRan(true); }} /><strong>{value}</strong></label><div className="comparison-cards"><article><code>lives &gt; 0</code><b className={value > 0 ? 'true' : 'false'}>{String(value > 0)}</b></article><article><code>lives == 0</code><b className={value === 0 ? 'true' : 'false'}>{String(value === 0)}</b></article><article><code>lives != 3</code><b className={value !== 3 ? 'true' : 'false'}>{String(value !== 3)}</b></article></div><p>{value > 0 ? (locale === 'tr' ? '→ if dalı: Oyun devam eder.' : '→ if branch: the game continues.') : (locale === 'tr' ? '→ else dalı: Oyun biter.' : '→ else branch: game over.')}</p>{ran && <button className="button button-primary" type="button" onClick={onComplete}>{locale === 'tr' ? 'Sınır değerlerini test ettim' : 'I tested the boundary values'}<Icon name="check" /></button>}</div>;
  if (variant === 'frames') return <div className="module-simulator frame-sim"><label>FPS <input type="range" min="20" max="120" value={fps} onChange={(e) => { setFps(Number(e.target.value)); setRan(true); }} /><strong>{fps}</strong></label><div className="clock-row"><span>Update</span><div className="ticks render" style={{ '--tick-count': Math.max(3, Math.round(fps / 15)) } as React.CSSProperties}>{Array.from({ length: Math.max(3, Math.round(fps / 15)) }, (_, i) => <i key={i} />)}</div><b>{fps}/s</b></div><div className="clock-row"><span>FixedUpdate</span><div className="ticks physics">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div><b>50/s</b></div><div className="clock-row"><span>LateUpdate</span><div className="ticks render late" style={{ '--tick-count': Math.max(3, Math.round(fps / 15)) } as React.CSSProperties}>{Array.from({ length: Math.max(3, Math.round(fps / 15)) }, (_, i) => <i key={i} />)}</div><b>{fps}/s</b></div><p>{locale === 'tr' ? 'FPS değişti; fizik adımı 50/s olarak sabit kaldı.' : 'FPS changed; physics remained fixed at 50/s.'}</p>{ran && <button className="button button-primary" type="button" onClick={onComplete}>{locale === 'tr' ? 'İki saati ayırdım' : 'I separated the two clocks'}<Icon name="check" /></button>}</div>;
  if (variant === 'components') { const choices = ['SpriteRenderer', 'Rigidbody', 'CapsuleCollider', 'PlayerController']; const togglePart = (part: string) => { setParts((current) => current.includes(part) ? current.filter((p) => p !== part) : [...current, part]); setRan(true); }; return <div className="module-simulator component-sim"><div className="object-preview"><span>PLAYER</span><div className={parts.includes('Rigidbody') ? 'player-cube physics' : 'player-cube'}>P</div><small>{parts.includes('CapsuleCollider') ? '◯ Collider' : 'Collider yok'}</small></div><div className="component-stack"><article className="locked"><b>Transform</b><small>{locale === 'tr' ? 'Her zaman var' : 'Always present'}</small></article>{choices.map((part) => <button type="button" key={part} className={parts.includes(part) ? 'added' : ''} onClick={() => togglePart(part)}><b>{parts.includes(part) ? '✓' : '+'}</b><span>{part}</span></button>)}</div>{ran && parts.length >= 3 && <button className="button button-primary" type="button" onClick={onComplete}>{locale === 'tr' ? 'Component yığınını kurdum' : 'I built the Component stack'}<Icon name="check" /></button>}</div>; }
  return <div className="module-simulator trigger-sim"><div className="trigger-controls"><button type="button" className={trigger ? 'toggle on' : 'toggle'} onClick={() => { setTrigger(!trigger); setRan(false); }}><span /> Is Trigger: {trigger ? '✓' : '—'}</button><button className="button button-secondary" type="button" onClick={() => setRan(true)}>{locale === 'tr' ? 'Oyuncuyu ilerlet' : 'Move player'}<Icon name="arrow-right" /></button></div><div className={ran ? trigger ? 'contact-stage ran pass' : 'contact-stage ran block' : 'contact-stage'}><div className="sim-player">P</div><div className="sim-volume">{trigger ? 'TRIGGER' : 'COLLIDER'}</div><div className="sim-pickup">◆</div></div>{ran && <div className="contact-result"><strong>{trigger ? (locale === 'tr' ? 'İçinden geçti · olay üretildi' : 'Passed through · event fired') : (locale === 'tr' ? 'Hareket engellendi · katı temas' : 'Movement blocked · solid contact')}</strong><code>{trigger ? 'OnTriggerEnter(other)' : 'OnCollisionEnter(collision)'}</code><button className="button button-primary" type="button" onClick={onComplete}>{locale === 'tr' ? 'Farkı gözlemledim' : 'I observed the difference'}<Icon name="check" /></button></div>}</div>;
}

function Feedback({ correct, text }: { correct: boolean; text: string }) {
  return <div className={correct ? 'module-feedback correct' : 'module-feedback incorrect'} role="status"><b>{correct ? '✓' : '!'}</b><p>{text}</p></div>;
}
