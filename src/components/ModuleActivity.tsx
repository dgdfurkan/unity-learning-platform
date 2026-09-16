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

const lesson6: Record<string, ActivityConfig> = {
  'l6-recall': makeCompact('KOŞULDAN TEKRARA', 'FROM CONDITION TO REPETITION', 'Döngü, aynı kararı kontrollü biçimde yeniden sorar.', 'A loop repeats the same decision under control.', 'Bir `if` koşulu bir kez değerlendirir. Döngü ise gövde bittikten sonra koşula geri döner; koşul `false` olduğunda akış döngünün altından devam eder.', 'An `if` evaluates once. A loop returns to its condition after the body and continues below the loop once the condition becomes `false`.', 'int index = 0;\nwhile (index < 3)\n{\n    Debug.Log(index);\n    index++;\n}', quiz([
    { prompt: tx('Döngü gövdesi bittikten sonra sıradaki kontrol nedir?', 'What is checked after the loop body finishes?'), options: [tx('Class adı', 'The class name'), tx('Döngü koşulu', 'The loop condition'), tx('Dosya adı', 'The file name')], answer: 1, why: tx('Her turun ardından koşul yeniden değerlendirilir.', 'The condition is evaluated again after every iteration.') },
    { prompt: tx('Koşul ne zaman döngüyü bitirir?', 'When does the condition stop the loop?'), options: [tx('`true` olduğunda', 'When it is `true`'), tx('`false` olduğunda', 'When it is `false`'), tx('Console açıldığında', 'When Console opens')], answer: 1, why: tx('Koşul `false` olduğunda gövdeye girilmez.', 'The body is skipped once the condition is `false`.') },
  ])),
  'l6-model': makeCompact('TUR MOTORU', 'ITERATION ENGINE', 'Her turun dört görünür adımı vardır.', 'Every iteration has four visible phases.', 'Başlangıç bir kez çalışır. Koşul izin verirse gövde çalışır; ilerleme sayacı değiştirir ve akış tekrar koşula döner.', 'Initialisation runs once. If the condition allows it, the body runs; the iterator changes the counter and flow returns to the condition.', 'for (int index = 0; index < 3; index++)\n{\n    Debug.Log(index);\n}', sequence([
    { id: 'a', label: 'int index = 0', detail: tx('Sayaç bir kez hazırlanır.', 'The counter is prepared once.') },
    { id: 'b', label: 'index < 3', detail: tx('Turdan önce devam kararı verilir.', 'Continuation is decided before the iteration.') },
    { id: 'c', label: 'Debug.Log(index)', detail: tx('İzin verilen turun gövdesi çalışır.', 'The permitted iteration body runs.') },
    { id: 'd', label: 'index++', detail: tx('Sayaç ilerler ve koşula dönülür.', 'The counter advances and flow returns to the condition.') },
  ])),
  'l6-for': makeCompact('FOR ANATOMİSİ', 'FOR ANATOMY', 'Üç kontrol, tek satırda bir tekrar sözleşmesi kurar.', 'Three controls form one repetition contract.', '`for` başlığındaki parçalar soldan sağa yalnızca ilk girişte okunmaz: başlangıç bir kez, koşul ve ilerleme ise her tur çevriminde farklı zamanlarda çalışır.', 'The `for` header is not simply read left to right on every pass: initialisation runs once while condition and iterator run at different points in each cycle.', 'for (int index = 0; index < 3; index++)', match([
    { key: 'start', label: tx('Başlangıç · bir kez', 'Initialise · once') }, { key: 'condition', label: tx('Koşul · turdan önce', 'Condition · before each iteration') }, { key: 'step', label: tx('İlerleme · turdan sonra', 'Iterator · after each iteration') },
  ], [
    { left: 'int index = 0', right: tx('Başlangıç · bir kez', 'Initialise · once'), why: tx('Sayaç döngüye girerken oluşturulur.', 'The counter is created when entering the loop.') },
    { left: 'index < 3', right: tx('Koşul · turdan önce', 'Condition · before each iteration'), why: tx('Gövdeye girilip girilmeyeceğini belirler.', 'It decides whether the body may run.') },
    { left: 'index++', right: tx('İlerleme · turdan sonra', 'Iterator · after each iteration'), why: tx('Sayacı bir sonraki değere taşır.', 'It advances the counter to its next value.') },
  ])),
  'l6-foreach': makeCompact('DÖNGÜ SEÇİMİ', 'LOOP CHOICE', 'İndeks gerekiyorsa for; yalnızca öğe gerekiyorsa foreach.', 'Use for when you need the index; foreach when you only need the item.', '`foreach`, koleksiyonun geçerli öğelerini doğrudan verir. `for`, index üzerinde daha fazla kontrol sağlar ancak sınırı doğru kurma sorumluluğunu sana bırakır.', '`foreach` gives valid items directly. `for` offers more index control but leaves safe boundary management to you.', 'foreach (string item in inventory)\n{\n    Debug.Log(item);\n}', sort([
    { key: 'for', label: tx('Index kontrollü · for', 'Index-controlled · for') }, { key: 'foreach', label: tx('Öğeyi doğrudan al · foreach', 'Read each item · foreach') },
  ], [
    { value: 'Her ikinci spawn noktasını seç', category: 'for', why: tx('Sıra numarası üzerinden seçim yapılır.', 'Selection depends on the position number.') },
    { value: 'Bütün envanter adlarını yazdır', category: 'foreach', why: tx('Yalnızca her öğenin değeri gerekir.', 'Only each item value is needed.') },
    { value: 'Son öğeden ilk öğeye git', category: 'for', why: tx('Index yönünü kendin kontrol etmelisin.', 'You must control index direction.') },
    { value: 'Bütün düşmanlara rengi uygula', category: 'foreach', why: tx('Her düşman aynı işlemi alır.', 'Every enemy receives the same operation.') },
    { value: 'Index ile UI sıra numarası göster', category: 'for', why: tx('Ekranda sıra numarasına ihtiyaç vardır.', 'The UI needs the position number.') },
    { value: 'Her checkpoint adını kontrol et', category: 'foreach', why: tx('Geçerli öğeleri sırayla okumak yeterlidir.', 'Reading each valid item is sufficient.') },
  ])),
  'l6-while': makeCompact('SONSUZ DÖNGÜ VAKASI', 'INFINITE LOOP CASE', 'while koşulu değişmiyorsa Editor nefes alamaz.', 'If a while condition never changes, the Editor cannot breathe.', 'Aşağıdaki gövde `index` değerini hiç değiştirmez. `index < 3` sürekli `true` kalır ve ana thread aynı gövdeden çıkamaz.', 'The body never changes `index`. `index < 3` remains `true`, trapping the main thread in the same body.', 'int index = 0;\nwhile (index < 3)\n{\n    Debug.Log(index);\n}', debug(['int index = 0;', 'while (index < 3)', '{', '    Debug.Log(index);', '}'], 3, tx('4. satırdan sonra `index++;` gibi ilerleme olmadığı için koşul hiç değişmez. Sorun `while` sözcüğü değil, gövdenin koşulu false’a yaklaştırmamasıdır.', 'There is no progress such as `index++;` after line 4, so the condition never changes. The issue is not `while` itself; the body never moves the condition toward false.'))),
  'l6-budget': makeCompact('PERFORMANS BÜTÇESİ', 'PERFORMANCE BUDGET', 'Tur sayısı ile çalışma sıklığı birlikte maliyeti belirler.', 'Iteration count and execution frequency combine into cost.', '100 öğelik bir döngü `Start` içinde bir kez 100 işlem yapar. Aynı döngü 60 FPS çalışan `Update` içinde saniyede yaklaşık 6.000 işlem üretir.', 'A 100-item loop in `Start` performs 100 operations once. The same loop in `Update` at 60 FPS produces roughly 6,000 operations per second.', 'void Update()\n{\n    for (int i = 0; i < enemies.Count; i++)\n        Scan(enemies[i]);\n}', sort([
    { key: 'safe', label: tx('Sınırlı / olay tabanlı', 'Bounded / event-based') }, { key: 'risk', label: tx('Frame bütçesi riski', 'Frame-budget risk') },
  ], [
    { value: 'Start içinde 10 spawn noktası hazırla', category: 'safe', why: tx('Bir kez ve küçük bir sınırla çalışır.', 'It runs once with a small bound.') },
    { value: 'Update içinde 5.000 nesneyi ara', category: 'risk', why: tx('Büyük tarama her frame tekrar eder.', 'A large scan repeats every frame.') },
    { value: 'Butona basılınca 20 ödülü sırala', category: 'safe', why: tx('Kullanıcı olayıyla ve sınırlı veriyle çalışır.', 'It runs on a user event with bounded data.') },
    { value: 'while(true) ile sahneyi sürekli tara', category: 'risk', why: tx('Çıkış koşulu yoktur ve ana thread’i kilitler.', 'It has no exit and blocks the main thread.') },
  ])),
  'l6-mastery': makeCompact('DÖNGÜ TRANSFERİ', 'LOOP TRANSFER', 'Doğru döngü, görevin ihtiyaç duyduğu kontrol düzeyinden çıkar.', 'The right loop follows from the control the task needs.', 'Seçmeden önce üç soru sor: Kaç tur? Index gerekli mi? Koşulun false olacağı garanti mi?', 'Ask three questions before choosing: how many iterations, is an index needed, and is false guaranteed?', 'for (int i = 0; i < spawnPoints.Length; i++)\n    Spawn(spawnPoints[i]);', quiz([
    { prompt: tx('Dört öğeli bir array için son geçerli index nedir?', 'What is the last valid index of a four-item array?'), options: [tx('4', '4'), tx('3', '3'), tx('5', '5')], answer: 1, why: tx('Index sıfırdan başladığı için son index adet eksi birdir.', 'Because indexing starts at zero, the final index is count minus one.') },
    { prompt: tx('Yalnızca tüm öğeleri okumak için en sade seçim hangisidir?', 'What is the simplest choice for only reading every item?'), options: [tx('`foreach`', '`foreach`'), tx('`while(true)`', '`while(true)`'), tx('Üç ayrı değişken', 'Three separate variables')], answer: 0, why: tx('`foreach` sınır yönetmeden her geçerli öğeyi verir.', '`foreach` supplies each valid item without manual boundaries.') },
  ])),
};

const lesson7: Record<string, ActivityConfig> = {
  'l7-recall': makeCompact('VERİ GRUBU', 'DATA GROUP', 'Koleksiyon, aynı türdeki değerleri tek düzen altında tutar.', 'A collection keeps values of one type under one structure.', 'Üç ayrı item değişkeni büyüdükçe kodun dolaşılması zorlaşır. Koleksiyon aynı işlemi bütün öğelere uygulamayı mümkün kılar.', 'As separate item variables grow, code becomes difficult to traverse. A collection makes it possible to apply the same work to every item.', 'string[] loot = { "Coin", "Gem", "Key" };', quiz([
    { prompt: tx('Koleksiyonun temel avantajı nedir?', 'What is the main benefit of a collection?'), options: [tx('Farklı sorumlulukları tek class’a yığar.', 'It piles unrelated responsibilities into one class.'), tx('Aynı türden değerleri düzenli biçimde gruplar.', 'It organises values of one type.'), tx('Her öğeyi public yapar.', 'It makes every item public.')], answer: 1, why: tx('Koleksiyon, grubu tek isimle saklayıp dolaşmayı sağlar.', 'A collection stores and iterates a group under one name.') },
    { prompt: tx('`loot[0]` hangi öğedir?', 'Which item is `loot[0]`?'), options: [tx('Coin', 'Coin'), tx('Gem', 'Gem'), tx('Key', 'Key')], answer: 0, why: tx('İlk index `0`dır.', 'The first index is `0`.') },
  ])),
  'l7-array': makeCompact('ARRAY HARİTASI', 'ARRAY MAP', 'Boyut sabittir; her yuvaya index ile erişilir.', 'Its size is fixed and each slot is addressed by index.', '`string[]` öğe türünü, süslü parantez içi başlangıç öğelerini, `Length` toplam yuva sayısını belirtir.', '`string[]` defines the item type, braces contain initial items, and `Length` gives total slots.', 'string[] loot = { "Coin", "Gem", "Key" };\nDebug.Log(loot[1]);\nDebug.Log(loot.Length);', match([
    { key: 'type', label: tx('Öğe türü', 'Item type') }, { key: 'name', label: tx('Koleksiyon adı', 'Collection name') }, { key: 'index', label: tx('Tek öğeye erişim', 'Single-item access') }, { key: 'length', label: tx('Toplam adet', 'Total count') },
  ], [
    { left: 'string[]', right: tx('Öğe türü', 'Item type'), why: tx('Dizide yalnızca string değerler tutulur.', 'Only string values are stored.') },
    { left: 'loot', right: tx('Koleksiyon adı', 'Collection name'), why: tx('Dizinin tamamına bu identifier ile ulaşılır.', 'This identifier refers to the array.') },
    { left: 'loot[1]', right: tx('Tek öğeye erişim', 'Single-item access'), why: tx('Index 1 ikinci öğe olan Gem’i verir.', 'Index 1 returns the second item, Gem.') },
    { left: 'loot.Length', right: tx('Toplam adet', 'Total count'), why: tx('Dizide üç yuva olduğunu verir.', 'It reports three slots.') },
  ])),
  'l7-index': makeCompact('SINIR VAKASI', 'BOUNDARY CASE', 'Length bir adet; index ise sıfır tabanlı konumdur.', 'Length is a count; index is a zero-based position.', 'Üç öğeli dizinin `Length` değeri 3’tür fakat geçerli indexleri 0, 1 ve 2’dir. `items[3]` dördüncü yuvayı ister.', 'A three-item array has Length 3 but valid indices 0, 1, and 2. `items[3]` requests a fourth slot.', 'string[] items = { "Coin", "Gem", "Key" };\nDebug.Log(items[3]);', debug(['string[] items = { "Coin", "Gem", "Key" };', 'Debug.Log(items.Length);', 'Debug.Log(items[0]);', 'Debug.Log(items[3]);'], 3, tx('4. satır geçerli aralığın dışındaki index 3’ü ister. Son öğe `items[items.Length - 1]` veya `items[2]` ile okunur.', 'Line 4 asks for index 3 outside the valid range. Read the final item with `items[items.Length - 1]` or `items[2]`.'))),
  'l7-list': makeCompact('DİNAMİK KOLEKSİYON', 'DYNAMIC COLLECTION', 'List çalışma anında büyür ve küçülür.', 'A List grows and shrinks at runtime.', 'Önce List instance’ı oluşturulur; sonra `Add` ile öğe eklenir, `Count` okunur ve gerektiğinde `Remove` ile öğe çıkarılır.', 'First instantiate the List; then add items with `Add`, read `Count`, and remove items when needed.', 'List<string> inventory = new List<string>();\ninventory.Add("Key");\nDebug.Log(inventory.Count);\ninventory.Remove("Key");', sequence([
    { id: 'a', label: 'new List<string>()', detail: tx('Boş liste instance’ını oluştur.', 'Create the empty List instance.') },
    { id: 'b', label: 'inventory.Add("Key")', detail: tx('Listeye ilk öğeyi ekle.', 'Add the first item.') },
    { id: 'c', label: 'inventory.Count', detail: tx('Güncel öğe sayısını oku.', 'Read the current item count.') },
    { id: 'd', label: 'inventory.Remove("Key")', detail: tx('Belirli öğeyi güvenli API ile çıkar.', 'Remove a specific item through the API.') },
  ])),
  'l7-choose': makeCompact('YAPI SEÇİMİ', 'STRUCTURE CHOICE', 'Sabit düzen array; değişen içerik List ister.', 'Fixed structure favours arrays; changing content favours Lists.', 'Seçim hız sloganıyla değil, verinin çalışma anında büyüyüp küçülmeyeceğiyle yapılır.', 'The choice is not made from speed slogans but from whether data must grow or shrink at runtime.', 'Transform[] spawnPoints;\nList<string> inventory = new List<string>();', sort([
    { key: 'array', label: tx('Sabit boyut · array', 'Fixed size · array') }, { key: 'list', label: tx('Değişen boyut · List', 'Changing size · List') },
  ], [
    { value: 'Level içindeki 4 köşe noktası', category: 'array', why: tx('Tasarım sırasında sabit sayıda nokta vardır.', 'The design has a fixed number of points.') },
    { value: 'Oyuncunun topladığı eşyalar', category: 'list', why: tx('Oyun sırasında eklenir ve çıkarılır.', 'Items are added and removed during play.') },
    { value: 'Üç başlangıç karakteri', category: 'array', why: tx('Seçenek sayısı bu tasarımda sabittir.', 'The option count is fixed in this design.') },
    { value: 'Aktif görevler', category: 'list', why: tx('Görevler zamanla açılır ve tamamlanır.', 'Quests appear and complete over time.') },
    { value: 'UI sekmeleri', category: 'array', why: tx('Panel yapısı sabit hazırlanmıştır.', 'The panel structure is predefined.') },
    { value: 'Yakındaki düşmanlar', category: 'list', why: tx('Algılanan düşman sayısı sürekli değişir.', 'The detected enemy count changes continuously.') },
  ])),
  'l7-traverse': makeCompact('DOLAŞIM SÖZLÜĞÜ', 'ITERATION VOCABULARY', 'Yapı ve ihtiyaç, doğru dolaşım aracını belirler.', 'Structure and need determine the traversal tool.', 'Array ile List benzer biçimde indexlenebilir; fakat adet özellikleri farklıdır. Öğenin indexine ihtiyacın yoksa her ikisi de `foreach` ile okunabilir.', 'Arrays and Lists can both be indexed, but use different count properties. Both can be read with `foreach` when the index is unnecessary.', 'for (int i = 0; i < items.Length; i++) { }\nfor (int i = 0; i < inventory.Count; i++) { }', match([
    { key: 'arrayCount', label: tx('Array adedi', 'Array count') }, { key: 'listCount', label: tx('List adedi', 'List count') }, { key: 'item', label: tx('Öğeyi doğrudan dolaş', 'Iterate items directly') }, { key: 'position', label: tx('Index kontrolü', 'Index control') },
  ], [
    { left: 'Length', right: tx('Array adedi', 'Array count'), why: tx('Array boyutu `Length` ile okunur.', 'Array size is read with `Length`.') },
    { left: 'Count', right: tx('List adedi', 'List count'), why: tx('List’in güncel öğe sayısıdır.', 'It is the current List item count.') },
    { left: 'foreach', right: tx('Öğeyi doğrudan dolaş', 'Iterate items directly'), why: tx('Her geçerli öğeyi sırayla verir.', 'It yields every valid item in order.') },
    { left: 'for', right: tx('Index kontrolü', 'Index control'), why: tx('Konumu ve yönü açıkça yönetir.', 'It explicitly manages position and direction.') },
  ])),
  'l7-mastery': makeCompact('KOLEKSİYON TRANSFERİ', 'COLLECTION TRANSFER', 'Sınır, yapı ve dolaşım tek karar zinciridir.', 'Boundary, structure, and traversal form one decision chain.', 'Önce verinin değişip değişmediğini, sonra index gerekip gerekmediğini, en son doğru adet özelliğini seç.', 'First decide whether size changes, then whether an index is needed, and finally select the correct count property.', 'foreach (string item in inventory)\n    Debug.Log(item);', quiz([
    { prompt: tx('Bir List’in güncel öğe adedi nasıl okunur?', 'How do you read the current number of List items?'), options: [tx('`Length`', '`Length`'), tx('`Count`', '`Count`'), tx('`Size()`', '`Size()`')], answer: 1, why: tx('List koleksiyonları `Count` özelliğini kullanır.', 'List collections use the `Count` property.') },
    { prompt: tx('Üç öğeli array’de güvenli for koşulu hangisidir?', 'Which for condition is safe for a three-item array?'), options: [tx('`i <= items.Length`', '`i <= items.Length`'), tx('`i < items.Length`', '`i < items.Length`'), tx('`i > items.Length`', '`i > items.Length`')], answer: 1, why: tx('Son geçerli index Length - 1 olduğu için `<` kullanılır.', 'Because the final valid index is Length - 1, use `<`.') },
  ])),
};

const lesson8: Record<string, ActivityConfig> = {
  'l8-recall': makeCompact('KAVRAM KÖPRÜSÜ', 'CONCEPT BRIDGE', 'Dosya, class ve object aynı şey değildir.', 'A file, class, and object are not the same thing.', '`.cs` dosyası kaynak kodu taşır; class bir davranış ve veri şablonu tanımlar; Unity’nin sahneye eklediği Component ise bu class’ın yaşayan instance’ıdır.', 'A `.cs` file carries source code; a class defines a state and behaviour blueprint; the Component in a scene is a living instance of that class.', 'public class EnemyHealth : MonoBehaviour\n{\n    private int health = 100;\n}', quiz([
    { prompt: tx('Hierarchy’de iki düşmana aynı script eklenirse kaç Component instance’ı oluşur?', 'If the same script is added to two enemies, how many Component instances exist?'), options: [tx('Bir', 'One'), tx('İki', 'Two'), tx('Hiç', 'None')], answer: 1, why: tx('Her GameObject kendi Component instance’ını taşır.', 'Each GameObject owns its Component instance.') },
    { prompt: tx('Class neyi tanımlar?', 'What does a class define?'), options: [tx('Yalnızca dosya adını', 'Only a file name'), tx('Object’lerin şablonunu', 'The blueprint for objects'), tx('Sahnenin FPS değerini', 'The scene FPS')], answer: 1, why: tx('Class, instance’ların veri ve davranış yapısını belirler.', 'A class defines the state and behaviour structure of instances.') },
  ])),
  'l8-blueprint': makeCompact('ŞABLON VE INSTANCE', 'BLUEPRINT AND INSTANCE', 'Aynı class, bağımsız durum taşıyan birçok object üretir.', 'One class creates many objects with independent state.', 'İki düşman aynı `EnemyHealth` metodlarını paylaşır; fakat birinin health değeri 80 iken diğerininki 25 olabilir.', 'Two enemies share the same `EnemyHealth` methods, yet one can have health 80 while the other has 25.', 'EnemyHealth enemyA → health: 80\nEnemyHealth enemyB → health: 25', match([
    { key: 'class', label: tx('Şablon tanımı', 'Blueprint definition') }, { key: 'instance', label: tx('Sahnedeki örnek', 'Scene instance') }, { key: 'state', label: tx('Örneğe ait durum', 'Per-instance state') },
  ], [
    { left: 'EnemyHealth class', right: tx('Şablon tanımı', 'Blueprint definition'), why: tx('Bütün örneklerin yapısını tanımlar.', 'It defines the structure for all instances.') },
    { left: 'Enemy_A Component', right: tx('Sahnedeki örnek', 'Scene instance'), why: tx('Class’ın bir GameObject üzerindeki yaşayan örneğidir.', 'It is a living class instance on a GameObject.') },
    { left: 'Enemy_A.health = 80', right: tx('Örneğe ait durum', 'Per-instance state'), why: tx('Bu değer yalnızca Enemy_A instance’ına aittir.', 'This value belongs only to Enemy_A.') },
    { left: 'Enemy_B.health = 25', right: tx('Örneğe ait durum', 'Per-instance state'), why: tx('Aynı class’tan olsa da bağımsız saklanır.', 'It is independent despite using the same class.') },
  ])),
  'l8-memory': makeCompact('SAHİPLİK HARİTASI', 'OWNERSHIP MAP', 'Tanım class’ta, değer instance’ta yaşar.', 'Definitions live on the class; values live on instances.', 'Metod kodu bütün instance’lar için aynı davranış tanımıdır. Field’ın çalışma zamanı değeri ise her object için ayrıdır.', 'Method code is one behaviour definition for all instances. Runtime field values are separate for each object.', 'class Enemy\n{\n    int health;\n    void TakeDamage(int amount) { health -= amount; }\n}', sort([
    { key: 'blueprint', label: tx('Class şablonu', 'Class blueprint') }, { key: 'instance', label: tx('Object instance’ı', 'Object instance') },
  ], [
    { value: 'TakeDamage metodunun kodu', category: 'blueprint', why: tx('Davranış class tarafından tanımlanır.', 'The class defines the behaviour.') },
    { value: 'Enemy_A health = 80', category: 'instance', why: tx('Değer belirli object’e aittir.', 'The value belongs to a specific object.') },
    { value: 'health field’ının türü int', category: 'blueprint', why: tx('Bütün örnekler aynı veri biçimini kullanır.', 'All instances use the same data shape.') },
    { value: 'Enemy_B Transform konumu', category: 'instance', why: tx('Konum o sahne object’ine özeldir.', 'The position is specific to that scene object.') },
  ])),
  'l8-srp': makeCompact('SORUMLULUK SINIRI', 'RESPONSIBILITY BOUNDARY', 'Bir Component tek, anlaşılır bir değişim nedenine sahip olmalıdır.', 'A Component should have one clear reason to change.', 'Oyuncu hareketi değiştiğinde skor koduna; ses ayarı değiştiğinde sağlık koduna dokunmak zorunda kalıyorsan sorumluluklar birbirine karışmıştır.', 'If changing player movement forces edits to score code, or audio settings force edits to health code, responsibilities are mixed.', 'PlayerMovement · ScoreCounter · Health · AudioFeedback', sort([
    { key: 'move', label: tx('PlayerMovement', 'PlayerMovement') }, { key: 'score', label: tx('ScoreCounter', 'ScoreCounter') }, { key: 'health', label: tx('Health', 'Health') }, { key: 'audio', label: tx('AudioFeedback', 'AudioFeedback') },
  ], [
    { value: 'Input yönünü hıza çevir', category: 'move', why: tx('Oyuncu hareketi sorumluluğudur.', 'It is a movement responsibility.') },
    { value: 'Puanı artır ve sakla', category: 'score', why: tx('Skor durumunu ScoreCounter yönetir.', 'ScoreCounter owns score state.') },
    { value: 'Hasarı health değerinden düş', category: 'health', why: tx('Sağlık kuralı Health sınıfına aittir.', 'The health rule belongs to Health.') },
    { value: 'Hasar sesini çal', category: 'audio', why: tx('Ses oynatma ayrı bir geri bildirim sorumluluğudur.', 'Playback is a separate feedback responsibility.') },
  ])),
  'l8-collab': makeCompact('İŞBİRLİĞİ AKIŞI', 'COLLABORATION FLOW', 'Küçük Component’ler mesaj ve metod çağrılarıyla işbirliği yapar.', 'Small Components collaborate through messages and method calls.', 'Pickup algılama, skor kuralı ve UI sunumu aynı sınıfa yığılmaz; olay bir sorumluluktan diğerine açık bir akışla geçer.', 'Pickup detection, score rules, and UI presentation are not piled into one class; the event flows clearly across responsibilities.', 'Pickup → ScoreCounter.AddPoints(10) → ScoreView.Refresh()', sequence([
    { id: 'a', label: 'Pickup teması algılanır', detail: tx('Temas sistemi olayın kaynağıdır.', 'The contact system is the event source.') },
    { id: 'b', label: 'ScoreCounter.AddPoints(10)', detail: tx('Skor durumu yalnızca sahibi tarafından değiştirilir.', 'Only the owner changes score state.') },
    { id: 'c', label: 'ScoreView.Refresh()', detail: tx('UI yeni değeri yalnızca gösterir.', 'The UI only presents the new value.') },
  ])),
  'l8-smell': makeCompact('GOD CLASS DEDEKTİFİ', 'GOD-CLASS DETECTIVE', 'Alakasız değişim nedenleri aynı sınıfta toplanmamalıdır.', 'Unrelated reasons to change should not live in one class.', 'Aşağıdaki sınıf hareket, skor ve ses kararlarını birlikte taşıyor. Skor davranışı ayrı bir `ScoreCounter` Component’ine çıkarılmalıdır.', 'The class below mixes movement, score, and audio decisions. Score behaviour should move to a separate `ScoreCounter` Component.', 'void Update() { Move(); }\nvoid AddScore(int amount) { score += amount; }\nvoid PlayHitSound() { audioSource.Play(); }', debug(['void Update() { Move(); }', 'void AddScore(int amount) { score += amount; }', 'void PlayHitSound() { audioSource.Play(); }'], 1, tx('2. satır skor durumunu ve kuralını taşır; hareket sınıfından ayrılıp `ScoreCounter` sorumluluğuna gitmelidir. Ses de ayrı bir geri bildirim Component’i olabilir.', 'Line 2 owns score state and rules; move it from the movement class into `ScoreCounter`. Audio can also be a separate feedback Component.'))),
  'l8-mastery': makeCompact('TASARIM TRANSFERİ', 'DESIGN TRANSFER', 'Sınıf sınırı, kod satırı sayısından değil değişim nedeninden çıkar.', 'A class boundary follows reasons to change, not line count.', 'Yeni bir görev sisteminde ilerleme verisi, ödül verme ve UI gösterimi farklı sorumluluklardır; aynı oyun özelliğine ait olmaları tek sınıf olmalarını gerektirmez.', 'In a quest system, progress data, reward granting, and UI display are separate responsibilities; belonging to one feature does not require one class.', 'QuestProgress · RewardGranter · QuestView', quiz([
    { prompt: tx('Skor yazısını güncellemek hangi sınıfın temel sorumluluğudur?', 'Which class should primarily update score text?'), options: [tx('ScoreView', 'ScoreView'), tx('PlayerMovement', 'PlayerMovement'), tx('EnemyHealth', 'EnemyHealth')], answer: 0, why: tx('Sunum/UI sorumluluğu View katmanına aittir.', 'Presentation belongs to the View layer.') },
    { prompt: tx('İki düşman aynı class’tan üretildiğinde health değerleri nasıldır?', 'How are health values handled for two enemies from the same class?'), options: [tx('Her zaman ortak tek değerdir.', 'They always share one value.'), tx('Her instance kendi değerini taşır.', 'Each instance owns its value.'), tx('Değer yalnızca dosya adında tutulur.', 'The value lives only in the file name.')], answer: 1, why: tx('Normal instance field’ları her object için ayrıdır.', 'Regular instance fields are separate per object.') },
  ])),
};

const lesson9: Record<string, ActivityConfig> = {
  'l9-recall': makeCompact('İKİ AYRI SINIR', 'TWO DIFFERENT BOUNDARIES', 'Scope nerede; access modifier kim sorularını yanıtlar.', 'Scope answers where; an access modifier answers who.', 'Bir field class scope’unda yaşayabilir fakat `private` olduğu için yalnızca o class tarafından erişilebilir. Yaşam alanı ile erişim yetkisi aynı kavram değildir.', 'A field can live in class scope yet remain accessible only to that class because it is private. Lifetime and access permission are different concepts.', 'private int currentHealth = 100;', quiz([
    { prompt: tx('`private` öncelikle neyi belirler?', 'What does `private` primarily define?'), options: [tx('Değerin türünü', 'The value type'), tx('Erişim yetkisini', 'Access permission'), tx('Frame hızını', 'Frame rate')], answer: 1, why: tx('`private`, sembole class dışından erişimi sınırlar.', '`private` limits access from outside the class.') },
    { prompt: tx('Field’ın class içinde yaşaması hangi kavramla ilgilidir?', 'Which concept concerns a field living in a class?'), options: [tx('Scope', 'Scope'), tx('Prefab Variant', 'Prefab Variant'), tx('Collider', 'Collider')], answer: 0, why: tx('Scope, sembolün görünür olduğu ve yaşadığı bağlamdır.', 'Scope is the context where a symbol lives and is visible.') },
  ])),
  'l9-access': makeCompact('ERİŞİM SÖZLEŞMESİ', 'ACCESS CONTRACT', 'private iç ayrıntıyı korur; public bilinçli API sunar.', 'private protects internals; public offers a deliberate API.', 'Bir field’ı kolay olsun diye `public` yapmak, her dış sınıfa onu kuralsız değiştirme yetkisi verir. Varsayılan kapalı, ihtiyaç kadar açık tasarla.', 'Making a field public for convenience lets every outside class change it without rules. Keep it closed by default and expose only what is needed.', 'private int currentHealth;\npublic void TakeDamage(int amount)\n{\n    currentHealth -= amount;\n}', match([
    { key: 'private', label: tx('Yalnızca sahibi erişir', 'Owner-only access') }, { key: 'public', label: tx('Dışarıya sunulan sözleşme', 'Public contract') }, { key: 'method', label: tx('Kurallı değişim kapısı', 'Rule-enforcing mutation gate') },
  ], [
    { left: 'private int currentHealth', right: tx('Yalnızca sahibi erişir', 'Owner-only access'), why: tx('Durumu doğrudan dış yazmaya kapatır.', 'It blocks direct external writes.') },
    { left: 'public int CurrentHealth', right: tx('Dışarıya sunulan sözleşme', 'Public contract'), why: tx('Dış kodun hangi bilgiyi okuyabileceğini açıklar.', 'It declares what outside code may read.') },
    { left: 'public void TakeDamage(...)', right: tx('Kurallı değişim kapısı', 'Rule-enforcing mutation gate'), why: tx('Değişikliği doğrulama ve sınır kurallarından geçirir.', 'It routes changes through validation and bounds.') },
  ])),
  'l9-serialize': makeCompact('INSPECTOR ≠ PUBLIC', 'INSPECTOR ≠ PUBLIC', 'SerializeField, editör görünürlüğünü kod erişiminden ayırır.', 'SerializeField separates editor visibility from code access.', '`[SerializeField] private` tasarımcının Inspector’dan ayar yapmasına izin verir; başka scriptlerin doğrudan yazmasına izin vermez.', '`[SerializeField] private` lets a designer configure a field in Inspector without allowing other scripts to write it directly.', '[SerializeField] private int maxHealth = 100;\nprivate int currentHealth;', sort([
    { key: 'serialized', label: tx('Inspector ayarı, dışarıya kapalı', 'Inspector setting, externally closed') }, { key: 'private', label: tx('Yalnızca runtime iç durum', 'Internal runtime state only') }, { key: 'public', label: tx('Bilinçli dış API', 'Deliberate external API') },
  ], [
    { value: 'maxHealth tasarım ayarı', category: 'serialized', why: tx('Inspector’dan ayarlanır ama koddan korunur.', 'Configurable in Inspector yet protected in code.') },
    { value: 'currentHealth runtime değeri', category: 'private', why: tx('Oyun sırasında sınıf tarafından yönetilir.', 'Managed by the class during play.') },
    { value: 'TakeDamage metodu', category: 'public', why: tx('Dış sistemlere kontrollü davranış sunar.', 'Offers controlled behaviour to outside systems.') },
    { value: 'geçici hasDamageFeedback flag’i', category: 'private', why: tx('Sınıfın iç uygulama ayrıntısıdır.', 'It is an internal implementation detail.') },
  ])),
  'l9-property': makeCompact('OKUMA KAPISI', 'READ GATE', 'Read-only property veriyi gösterir, yazma yetkisini saklar.', 'A read-only property reveals data while retaining write control.', '`CurrentHealth => currentHealth` dış sistemlerin değeri okumasını sağlar; atama operatörü sunmadığı için dışarıdan değiştirmez.', '`CurrentHealth => currentHealth` lets outside systems read the value but not assign to it because no setter is exposed.', 'private int currentHealth;\npublic int CurrentHealth => currentHealth;', match([
    { key: 'field', label: tx('Gerçek saklanan durum', 'Stored state') }, { key: 'property', label: tx('Yalnızca okuma görünümü', 'Read-only view') }, { key: 'method', label: tx('Kurallı değişiklik', 'Rule-based mutation') }, { key: 'inspector', label: tx('Tasarım zamanı ayarı', 'Design-time configuration') },
  ], [
    { left: 'currentHealth', right: tx('Gerçek saklanan durum', 'Stored state'), why: tx('Değer class içinde saklanır.', 'The value is stored inside the class.') },
    { left: 'CurrentHealth => currentHealth', right: tx('Yalnızca okuma görünümü', 'Read-only view'), why: tx('Dışarıya setter olmadan okuma verir.', 'It exposes reading without a setter.') },
    { left: 'TakeDamage(int amount)', right: tx('Kurallı değişiklik', 'Rule-based mutation'), why: tx('Değişiklik tek doğrulama noktasından geçer.', 'Changes pass through one validation point.') },
    { left: '[SerializeField] maxHealth', right: tx('Tasarım zamanı ayarı', 'Design-time configuration'), why: tx('Başlangıç ayarı Inspector’dan düzenlenebilir.', 'Initial configuration is editable in Inspector.') },
  ])),
  'l9-invariant': makeCompact('KURALI KORU', 'PROTECT THE RULE', 'Sağlık değeri 0 ile maxHealth arasında kalmalıdır.', 'Health must remain between 0 and maxHealth.', 'Kapsülleme, bütün hasar değişikliklerini tek metoda yönlendirir. Metod girdiyi uygular, sınırı korur ve sonrasında gözlemcilere haber verir.', 'Encapsulation routes all damage changes through one method. The method applies input, preserves bounds, then notifies observers.', 'currentHealth -= amount;\ncurrentHealth = Mathf.Clamp(currentHealth, 0, maxHealth);\nHealthChanged?.Invoke(currentHealth);', sequence([
    { id: 'a', label: 'amount değerini doğrula', detail: tx('Geçersiz negatif hasarı reddet.', 'Reject invalid negative damage.') },
    { id: 'b', label: 'currentHealth -= amount', detail: tx('Durumu sahibi değiştirir.', 'The owner changes state.') },
    { id: 'c', label: 'Mathf.Clamp(..., 0, maxHealth)', detail: tx('Geçerli aralığı koru.', 'Preserve the valid range.') },
    { id: 'd', label: 'HealthChanged bildirimi', detail: tx('UI gibi dinleyicilere yeni değeri duyur.', 'Notify listeners such as UI.') },
  ])),
  'l9-debug': makeCompact('YETKİ İHLALİ', 'ACCESS BREACH', 'Dış class iç durumu doğrudan değiştirmemelidir.', 'An outside class should not mutate internal state directly.', 'EnemyAttack, PlayerConfig’in `currentHealth` field’ına yazmak yerine `TakeDamage` sözleşmesini çağırmalıdır.', 'EnemyAttack should call the `TakeDamage` contract rather than writing PlayerConfig.currentHealth.', 'player.currentHealth -= damage; // yanlış\nplayer.TakeDamage(damage);       // güvenli', debug(['void Hit(PlayerConfig player)', '{', '    player.currentHealth -= damage;', '    player.TakeDamage(damage);', '}'], 2, tx('3. satır kapsüllemeyi delerek kuralları atlıyor. Field private kalmalı ve yalnızca 4. satırdaki gibi güvenli metod çağrılmalıdır.', 'Line 3 breaches encapsulation and bypasses rules. Keep the field private and use the safe method as on line 4.'))),
  'l9-mastery': makeCompact('EN AZ YETKİ', 'LEAST PRIVILEGE', 'Her veri yalnızca ihtiyaç duyduğu kadar görünür olmalıdır.', 'Every piece of data should be only as visible as needed.', 'Inspector ayarı, dışarıdan okuma ve dışarıdan değiştirme üç farklı ihtiyaçtır; tek bir `public field` ile çözülmemelidir.', 'Inspector configuration, external reading, and external mutation are separate needs and should not be solved with one public field.', '[SerializeField] private float moveSpeed;\npublic float MoveSpeed => moveSpeed;', quiz([
    { prompt: tx('Inspector’dan ayarlanacak fakat başka scriptler yazamayacak alan hangisidir?', 'Which field is Inspector-editable but not writable by other scripts?'), options: [tx('`public float speed;`', '`public float speed;`'), tx('`[SerializeField] private float speed;`', '`[SerializeField] private float speed;`'), tx('`private void speed;`', '`private void speed;`')], answer: 1, why: tx('SerializeField editör görünürlüğü, private ise kod koruması sağlar.', 'SerializeField provides editor visibility while private protects code access.') },
    { prompt: tx('Dış UI yalnızca health okumalıysa en güvenli seçenek nedir?', 'What is safest if external UI only needs to read health?'), options: [tx('Public field', 'Public field'), tx('Read-only property', 'Read-only property'), tx('Bütün class’ı static yapmak', 'Make the whole class static')], answer: 1, why: tx('Read-only property okuma verir, doğrudan yazmayı engeller.', 'A read-only property allows reads while preventing direct writes.') },
  ])),
};

const lesson10: Record<string, ActivityConfig> = {
  'l10-recall': makeCompact('ARALIKLI TEKRAR', 'SPACED REVIEW', 'Prefab, önceki beş dersin tasarım kararlarını bir araya getirir.', 'Prefabs combine the design decisions from the previous five lessons.', 'Tekrarlanabilir bir prefab; koleksiyonlarla yönetilebilir, instance durumu taşır, kapsüllenmiş ayarlar sunar ve küçük Component’lerden oluşur.', 'A reusable prefab can be managed in collections, owns instance state, exposes encapsulated settings, and is composed from small Components.', 'List<EnemyHealth> enemies = new List<EnemyHealth>();', quiz([
    { prompt: tx('Aynı prefab’dan üretilen iki düşmanın currentHealth değerleri nasıldır?', 'How are currentHealth values handled for two enemies from one prefab?'), options: [tx('Tek ortak değeri paylaşır.', 'They share one value.'), tx('Her instance kendi değerini taşır.', 'Each instance owns its value.'), tx('Project penceresinde saklanmaz.', 'It is not stored in Project.')], answer: 1, why: tx('Prefab şablon sağlar; runtime field her instance’ta ayrıdır.', 'The prefab supplies a template; runtime fields are per instance.') },
    { prompt: tx('Değişen aktif düşman grubuna en uygun yapı hangisidir?', 'Which structure best fits a changing group of active enemies?'), options: [tx('List', 'List'), tx('Tek int', 'One int'), tx('Comment', 'Comment')], answer: 0, why: tx('Çalışma anında büyüyüp küçülen grup List ile yönetilir.', 'A group that grows and shrinks at runtime fits a List.') },
    { prompt: tx('Prefab ayarı Inspector’dan değişecek ama dışarıya kapalı kalacaksa?', 'What if a prefab setting is Inspector-editable but closed externally?'), options: [tx('`[SerializeField] private`', '`[SerializeField] private`'), tx('`public` field', '`public` field'), tx('Yerel değişken', 'Local variable')], answer: 0, why: tx('Bu ikili editör ayarı ile kapsüllemeyi birlikte sağlar.', 'This pair combines editor configuration with encapsulation.') },
  ])),
  'l10-model': makeCompact('PREFAB BAĞI', 'PREFAB LINK', 'Asset kaynaktır; instance sahnedeki bağlı örnektir.', 'The asset is the source; the instance is the linked scene object.', 'Project penceresindeki Prefab Asset kalıcı şablondur. Hierarchy’deki instance bu kaynaktan doğar ve override’lar dışında kaynağın yapısını izler.', 'The Prefab Asset in Project is the persistent template. A Hierarchy instance originates from it and follows its structure except for overrides.', 'Project: Enemy.prefab\nHierarchy: Enemy (1) · Prefab Instance\nInspector: Overrides', match([
    { key: 'asset', label: tx('Kaynak şablon', 'Source template') }, { key: 'instance', label: tx('Sahnedeki örnek', 'Scene instance') }, { key: 'link', label: tx('Değişiklik bağı', 'Change connection') },
  ], [
    { left: 'Enemy.prefab', right: tx('Kaynak şablon', 'Source template'), why: tx('Project içinde kalıcı asset olarak saklanır.', 'Stored as a persistent Project asset.') },
    { left: 'Enemy (1)', right: tx('Sahnedeki örnek', 'Scene instance'), why: tx('Hierarchy’de çalışan somut GameObject’tir.', 'The concrete GameObject in the Hierarchy.') },
    { left: 'mavi Prefab göstergesi', right: tx('Değişiklik bağı', 'Change connection'), why: tx('Instance’ın kaynağa bağlı olduğunu gösterir.', 'Shows that the instance remains linked to its source.') },
  ])),
  'l10-override': makeCompact('DEĞİŞİKLİK AKIŞI', 'CHANGE FLOW', 'Override yereldir; Apply kaynağa, Revert kaynaktan akar.', 'An override is local; Apply flows to the source, Revert from it.', 'Bir instance’ın maxHealth değerini değiştirmek override oluşturur. `Apply` bu farkı Prefab Asset’e taşır; `Revert` instance’ı asset değerine döndürür.', 'Changing maxHealth on one instance creates an override. `Apply` moves the difference to the Prefab Asset; `Revert` restores the asset value on the instance.', 'Asset maxHealth: 100\nInstance override: 150\nApply → Asset 150\nRevert → Instance 100', sequence([
    { id: 'a', label: 'Instance değerini değiştir', detail: tx('Yerel bir override oluşur.', 'A local override is created.') },
    { id: 'b', label: 'Overrides listesini incele', detail: tx('Farkın hangi property’de olduğunu doğrula.', 'Verify which property differs.') },
    { id: 'c', label: 'Apply veya Revert kararını ver', detail: tx('Değişikliğin herkes için mi yalnızca bu örnek için mi olduğunu sor.', 'Decide whether the change belongs to all instances or only this one.') },
    { id: 'd', label: 'Sonucu diğer instance’larda kontrol et', detail: tx('Apply etkisini ve yerel farkı doğrula.', 'Verify Apply impact and local differences.') },
  ])),
  'l10-variants': makeCompact('VARIANT KARARI', 'VARIANT DECISION', 'Kalıcı bir alt tür için Variant; tek örnek farkı için override.', 'Use a Variant for a persistent subtype; an override for one local difference.', 'Base Enemy ortak Component yapısını taşır. FastEnemy ve TankEnemy gibi tekrar eden tasarım türleri Variant olur; tek sahnedeki hasarlı düşman yalnızca override taşıyabilir.', 'Base Enemy owns common Components. Repeated design types such as FastEnemy and TankEnemy become Variants; one damaged scene enemy can use a local override.', 'Enemy_Base.prefab\n├─ Enemy_Fast.variant\n└─ Enemy_Tank.variant', sort([
    { key: 'variant', label: tx('Kalıcı alt şablon · Variant', 'Persistent subtype · Variant') }, { key: 'override', label: tx('Tek instance farkı · override', 'One-instance difference · override') },
  ], [
    { value: 'Bütün hızlı düşmanlar speed 8', category: 'variant', why: tx('Tekrar kullanılacak kalıcı düşman türüdür.', 'It is a reusable persistent enemy type.') },
    { value: 'Bu sahnedeki boss health 500', category: 'override', why: tx('Yalnızca bu sahne örneğine ait farktır.', 'The difference belongs to one scene instance.') },
    { value: 'Bütün buz kuleleri mavi materyal', category: 'variant', why: tx('Ortak temelden türeyen kalıcı görsel türdür.', 'It is a persistent visual subtype.') },
    { value: 'Tutorial sandığı açık başlasın', category: 'override', why: tx('Tek sahne örneğine özgü başlangıç ayarıdır.', 'A one-instance scene setup.') },
  ])),
  'l10-nested': makeCompact('YENİDEN KULLANIM SINIRI', 'REUSE BOUNDARY', 'Nested Prefab bağımsız anlamı olan parçaları yeniden kullanır.', 'A Nested Prefab reuses parts meaningful on their own.', 'Tekerlek veya sağlık barı farklı üst prefab’larda tekrar kullanılabiliyorsa alt prefab olabilir. Yalnızca tek gövdeye ait küçük dekoru gereksiz yere ayrı asset yapmak karmaşıklık ekler.', 'A wheel or health bar can be nested if reused across parent prefabs. Turning a tiny decoration unique to one body into another asset adds complexity.', 'Car.prefab\n├─ Wheel.prefab × 4\n└─ WorldHealthBar.prefab', sort([
    { key: 'nested', label: tx('Bağımsız tekrar kullanılabilir prefab', 'Reusable nested prefab') }, { key: 'local', label: tx('Üst prefab içinde kalmalı', 'Keep inside parent prefab') },
  ], [
    { value: 'Birçok araçta kullanılan Wheel', category: 'nested', why: tx('Bağımsız ve tekrar kullanılan bir parçadır.', 'It is an independent reusable part.') },
    { value: 'Birçok düşmanda kullanılan HealthBar', category: 'nested', why: tx('Farklı üst nesnelerde aynı işlevi taşır.', 'It serves the same function across parents.') },
    { value: 'Yalnızca bu sandığa ait küçük vida', category: 'local', why: tx('Ayrı yaşam döngüsü veya yeniden kullanım değeri yoktur.', 'It has no independent lifecycle or reuse value.') },
    { value: 'Aracın gövdesine özel tek çizgi', category: 'local', why: tx('Üst prefab tasarımının ayrıntısıdır.', 'It is a detail of the parent design.') },
  ])),
  'l10-workflow': makeCompact('BAĞLANTI DEDEKTİFİ', 'CONNECTION DETECTIVE', 'Sahne kopyası ile Prefab instance aynı görünse de aynı workflow değildir.', 'A scene copy and a Prefab instance may look alike but follow different workflows.', 'Project’teki asset silinirse sahne instance’ları kaynak bağlantısını kaybedebilir. Yeni tür oluşturmak için sahne kopyasını çoğaltmak yerine Variant veya yeni Prefab Asset üret.', 'Deleting the Project asset can break source links. Create a Variant or new Prefab Asset rather than multiplying scene copies for a new reusable type.', 'Hierarchy: Enemy_Copy\nProject: Enemy.prefab (deleted)\nInspector: Missing Prefab Asset', debug(['Enemy prefab instance sahneye eklendi.', 'Hierarchy içinde Duplicate yapıldı.', 'Project penceresindeki Enemy.prefab silindi.', 'Instance üzerinde Missing Prefab Asset görüldü.'], 2, tx('3. adım kalıcı kaynağı siliyor. Duplicate yeni bir Prefab Asset üretmez; yalnızca bağlı veya sahne içi bir kopya oluşturur.', 'Step 3 deletes the persistent source. Duplicate does not create a new Prefab Asset; it only creates another linked or scene copy.'))),
  'l10-mastery': makeCompact('MODÜL 2 TRANSFERİ', 'MODULE 2 TRANSFER', 'Base, Variant ve override farklı değişim ölçeklerini yönetir.', 'Base, Variant, and override manage different scopes of change.', 'Ortak yapı base prefab’da, tekrar eden tür farkı Variant’ta, tek sahneye özel ayar override’da yaşar. Runtime field’ları ise her instance’ta bağımsız kalır.', 'Shared structure lives in the base prefab, recurring subtype differences in Variants, and one-scene settings in overrides. Runtime fields remain independent per instance.', 'Enemy_Base → Fast Variant / Tank Variant → scene overrides', quiz([
    { prompt: tx('Bütün Tank düşmanlarının health değerini kalıcı değiştirmek için en uygun yer?', 'Where should you permanently change health for all Tank enemies?'), options: [tx('Tank Variant', 'Tank Variant'), tx('Tek scene instance override’ı', 'One scene-instance override'), tx('Console mesajı', 'A Console message')], answer: 0, why: tx('Tekrar eden alt tür ayarı Variant’ta tutulur.', 'A recurring subtype setting belongs in the Variant.') },
    { prompt: tx('Revert ne yapar?', 'What does Revert do?'), options: [tx('Instance override’ını kaynak değerine döndürür.', 'Restores the instance override to the source value.'), tx('Bütün prefabları siler.', 'Deletes every prefab.'), tx('Yeni class oluşturur.', 'Creates a new class.')], answer: 0, why: tx('Revert, yerel farkı bırakıp Prefab Asset değerini yeniden uygular.', 'Revert discards the local difference and restores the Prefab Asset value.') },
  ])),
};

Object.assign(configs, lesson3, lesson4, lesson5, lesson6, lesson7, lesson8, lesson9, lesson10);

function makeCompact(eyebrowTr: string, eyebrowEn: string, titleTr: string, titleEn: string, thesisTr: string, thesisEn: string, code: string, practice: Practice): ActivityConfig {
  return {
    eyebrow: tx(eyebrowTr, eyebrowEn), title: tx(titleTr, titleEn), thesis: tx(thesisTr, thesisEn),
    goal: tx('Amaç: Kavramı önce anlamlandırmak, sonra yeni bir örnekte doğru kullanmak.', 'Goal: make sense of the concept first, then use it correctly in a new example.'),
    concepts: conceptCardsFor(code), code,
    analogy: analogyFor(code),
    practiceTitle: tx('Şimdi sen uygula', 'Now apply it yourself'), practice,
  };
}

function conceptCardsFor(code: string): Concept[] {
  if (/\b(?:for|foreach|while)\b/.test(code)) return [
    { tag: 'BAŞLA', title: tx('Başlangıç durumunu kur', 'Set the initial state'), body: tx('Sayaç veya ilk öğe, tekrarın nereden başlayacağını açıkça belirler.', 'A counter or first item explicitly defines where repetition begins.'), example: /foreach/.test(code) ? 'item in collection' : 'int index = 0' },
    { tag: 'SINIR', title: tx('Devam koşulunu oku', 'Read the continuation rule'), body: tx('Koşul her turun çalışıp çalışmayacağına karar verir ve mutlaka bitebilir olmalıdır.', 'The condition decides whether each iteration runs and must be able to end.'), example: 'index < Count' },
    { tag: 'İLERLE', title: tx('Bir sonraki duruma geç', 'Advance to the next state'), body: tx('Sayaç artar veya koleksiyon sıradaki öğeyi verir; aynı durumda takılı kalınmaz.', 'The counter advances or the collection yields the next item, preventing a stuck state.'), example: 'index++ → next item' },
  ];
  if (/\b(?:List<|\[\]|Length|Count)\b/.test(code)) return [
    { tag: 'TÜR', title: tx('Öğe sözleşmesini belirle', 'Define the item contract'), body: tx('Koleksiyon hangi türden değerleri kabul edeceğini baştan söyler.', 'A collection declares the value type it accepts.'), example: 'List<string>' },
    { tag: 'SINIR', title: tx('Geçerli aralığı koru', 'Protect the valid range'), body: tx('Index sıfırdan başlar; son geçerli konum her zaman adet eksi birdir.', 'Indexing starts at zero; the last valid position is count minus one.'), example: '0 … Count - 1' },
    { tag: 'DOLAŞ', title: tx('İhtiyaca göre dolaş', 'Iterate by need'), body: tx('Index gerekiyorsa for, yalnızca öğe gerekiyorsa foreach kullan.', 'Use for when the index matters and foreach when only the item matters.'), example: 'for / foreach' },
  ];
  if (/\b(?:private|public|SerializeField|CurrentHealth|TakeDamage)\b/.test(code)) return [
    { tag: 'KORU', title: tx('İç durumu kapalı tut', 'Keep internal state closed'), body: tx('Field doğrudan dış yazmaya açılmadığında sınıf kendi kurallarını korur.', 'When a field is not externally writable, the class preserves its rules.'), example: 'private int currentHealth' },
    { tag: 'AYARLA', title: tx('Inspector ihtiyacını ayır', 'Separate Inspector needs'), body: tx('SerializeField editör ayarını açar; kod erişimini public yapmak zorunda bırakmaz.', 'SerializeField enables editor configuration without requiring public code access.'), example: '[SerializeField] private' },
    { tag: 'SUN', title: tx('Küçük bir API sun', 'Offer a small API'), body: tx('Property okuma, metod ise kurallı değişiklik kapısı olabilir.', 'A property can expose reading while a method gates rule-based changes.'), example: 'CurrentHealth / TakeDamage()' },
  ];
  if (/\b(?:prefab|Prefab|Variant|Override|Apply|Revert)\b/.test(code)) return [
    { tag: 'ASSET', title: tx('Kaynak şablonu tanı', 'Know the source template'), body: tx('Project içindeki Prefab Asset kalıcı ve yeniden kullanılabilir kaynaktır.', 'The Prefab Asset in Project is the persistent reusable source.'), example: 'Enemy.prefab' },
    { tag: 'ÖRNEK', title: tx('Instance farkını izle', 'Track instance differences'), body: tx('Hierarchy örneği kaynağa bağlıdır; yerel değişiklikler override olarak işaretlenir.', 'The Hierarchy instance stays linked to the source; local differences become overrides.'), example: 'Prefab Instance + Override' },
    { tag: 'AKIŞ', title: tx('Değişiklik yönünü seç', 'Choose change direction'), body: tx('Apply farkı kaynağa taşır; Revert kaynaktaki değeri örneğe geri getirir.', 'Apply moves a difference to the source; Revert restores the source value on the instance.'), example: 'Apply ↔ Revert' },
  ];
  if (/\b(?:class|instance|ScoreCounter|EnemyHealth|PlayerMovement)\b/.test(code)) return [
    { tag: 'ŞABLON', title: tx('Class yapıyı tanımlar', 'The class defines structure'), body: tx('Field türleri ve metod davranışları bütün object örnekleri için ortak şablondur.', 'Field types and method behaviours form the shared blueprint for objects.'), example: 'class ScoreCounter' },
    { tag: 'ÖRNEK', title: tx('Object kendi durumunu taşır', 'An object owns its state'), body: tx('Aynı class’tan gelen iki instance farklı çalışma zamanı değerlerine sahip olabilir.', 'Two instances from the same class can hold different runtime values.'), example: 'A.score ≠ B.score' },
    { tag: 'SINIR', title: tx('Sorumluluğu tek tut', 'Keep one responsibility'), body: tx('Bir Component yalnızca kendi değişim nedenini ve verisini yönetir.', 'A Component manages only its own reason to change and its own data.'), example: 'Score · Health · Movement' },
  ];
  const hasMethod = /\b(?:void|Awake|Update|OnTrigger)/.test(code);
  const hasCondition = /\b(?:if|bool|>|==|&&|\|\|)/.test(code);
  return [
    { tag: 'OKU', title: tx('Sözdizimini oku', 'Read the syntax'), body: tx('Renkler ve işaretler, kodun hangi parçasının ne görev yaptığını gösterir.', 'Colours and symbols reveal the responsibility of each code fragment.'), example: hasMethod ? 'ad + () + { gövde }' : 'tür + isim + değer' },
    { tag: 'ÇALIŞTIR', title: tx('Akışı zihninde yürüt', 'Execute mentally'), body: tx('Kodun hangi anda ve hangi sırayla değerlendirildiğini adım adım izle.', 'Trace when and in what order the code is evaluated.'), example: hasCondition ? 'soru → bool → dal' : 'veri → işlem → sonuç' },
    { tag: 'AÇIKLA', title: tx('Davranışı cümleye çevir', 'Translate into behaviour'), body: tx('Sembolü ezberlemek yerine oyunda görünür olan sonucu kendi cümlenle söyle.', 'Rather than memorising symbols, state the visible game result in your own words.'), example: '“Bu kod ... olduğunda ... yapar.”' },
  ];
}

function analogyFor(code: string): LocalText {
  if (/\b(?:for|foreach|while)\b/.test(code)) return tx('Bir turnike gibi düşün: sayaç bilet numarasıdır, koşul kapının açık olup olmadığını kontrol eder, ilerleme ise sıradaki kişiyi getirir. İlerleme yoksa sıra aynı kişide kilitlenir.', 'Think of a turnstile: the counter is the ticket number, the condition checks whether the gate is open, and progress brings the next person. Without progress, the line freezes on one person.');
  if (/\b(?:List<|\[\]|Length|Count)\b/.test(code)) return tx('Bir dolap gibi düşün: array sabit sayıda göze sahip raf, List gerektiğinde yeni göz eklenen düzenleyicidir. Index, göz numarasıdır ve numaralandırma sıfırdan başlar.', 'Think of storage: an array is a shelf with fixed slots, while a List can add slots as needed. The index is the slot number and numbering starts at zero.');
  if (/\b(?:private|public|SerializeField|CurrentHealth|TakeDamage)\b/.test(code)) return tx('Bir otel odası gibi düşün: private alan odanın içidir, SerializeField yetkili personelin ayar panelidir, public metod ise herkesin kullanabildiği ama kuralları olan resepsiyondur.', 'Think of a hotel room: private state is inside the room, SerializeField is the staff control panel, and a public method is the reception desk—available through clear rules.');
  if (/\b(?:prefab|Prefab|Variant|Override|Apply|Revert)\b/.test(code)) return tx('Bir üretim kalıbı gibi düşün: Prefab Asset ana kalıp, instance üretilen parça, Variant kalıbın kalıcı alt modeli, override ise tek parçaya uygulanan yerel ayardır.', 'Think of a production mould: the Prefab Asset is the master mould, an instance is a produced part, a Variant is a persistent sub-model, and an override is a local adjustment to one part.');
  if (/\b(?:class|instance|ScoreCounter|EnemyHealth|PlayerMovement)\b/.test(code)) return tx('Bir bina planı gibi düşün: class plan, object o plandan yapılmış bina, field değerleri ise her binanın kendi oda düzenidir. Elektrik, su ve güvenlik tek ustanın işi değildir; sorumluluklar ayrılır.', 'Think of a building plan: the class is the blueprint, the object is a building made from it, and field values are each building’s room settings. Electricity, plumbing, and security are separate responsibilities.');
  return tx('Kodu bir talimat listesi gibi değil, veri ile zamanlamanın birlikte oluşturduğu davranış olarak oku.', 'Read code not as a list of instructions, but as behaviour created by data and timing together.');
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
      <section className="beginner-primer" aria-label={locale === 'tr' ? 'Sıfırdan kavram anlatımı' : 'Concept foundation from zero'}>
        <header><span>{locale === 'tr' ? 'SIFIR BİLGİYLE BAŞLIYORUZ' : 'STARTING WITH ZERO ASSUMED KNOWLEDGE'}</span><h3>{locale === 'tr' ? 'Önce anlamını kur, sonra ekrandaki görevi çöz.' : 'Build meaning first, then solve the task.'}</h3><p>{locale === 'tr' ? 'Aşağıdaki dört basamak etkinliğin cevabını ezberletmez. Kavramın hangi ihtiyacı çözdüğünü ve kodun sonucunu nasıl değiştirdiğini gösterir.' : 'The four stages below do not give away the activity. They show which need the concept solves and how it changes the result.'}</p></header>
        <div>
          <article><b>01</b><span>{locale === 'tr' ? 'Bu nedir?' : 'What is it?'}</span><p>{t(locale, config.thesis)}</p></article>
          <article><b>02</b><span>{locale === 'tr' ? 'Neden var?' : 'Why does it exist?'}</span><p>{t(locale, config.goal)}</p></article>
          <article><b>03</b><span>{locale === 'tr' ? 'Oyunda nerede görürüm?' : 'Where does it appear in a game?'}</span><p>{t(locale, config.analogy)}</p></article>
          <article><b>04</b><span>{locale === 'tr' ? 'Nasıl kanıtlarım?' : 'How do I prove it?'}</span><p>{locale === 'tr' ? 'Bir değeri değiştir, sonucu çalıştırmadan önce tahmin et ve gözlemlediğin farkı kendi cümlenle açıkla.' : 'Change one value, predict the result before running it, and explain the observed difference in your own words.'}</p></article>
        </div>
      </section>
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
  const tokens = line.split(/("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:public|private|protected|void|int|float|bool|string|if|else|for|foreach|while|in|new|true|false|return|class)\b|\b(?:Debug|Log|MonoBehaviour|Awake|OnEnable|Start|Update|FixedUpdate|LateUpdate|Rigidbody|Collider|Transform|SerializeField|Vector3|CompareTag|List|Length|Count|Add|Remove|Mathf|Clamp|Apply|Revert|Prefab|Variant)\b|\b\d+\b)/g);
  return tokens.map((token, index) => {
    const className = token.startsWith('//') ? 'tok-comment' : token.startsWith('"') ? 'tok-string' : /^(public|private|protected|void|int|float|bool|string|if|else|for|foreach|while|in|new|true|false|return|class)$/.test(token) ? 'tok-keyword' : /^(Debug|Log|MonoBehaviour|Awake|OnEnable|Start|Update|FixedUpdate|LateUpdate|Rigidbody|Collider|Transform|SerializeField|Vector3|CompareTag|List|Length|Count|Add|Remove|Mathf|Clamp|Apply|Revert|Prefab|Variant)$/.test(token) ? 'tok-api' : /^\d+$/.test(token) ? 'tok-number' : '';
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
  return <div className="module-quiz"><div className="module-counter">{index + 1} / {practice.questions.length}</div><h4>{t(locale, q.prompt)}</h4><div className="module-option-list">{q.options.map((option, optionIndex) => <button type="button" key={optionIndex} disabled={correct} className={selected === optionIndex ? optionIndex === q.answer ? 'correct' : 'incorrect' : correct && optionIndex === q.answer ? 'correct reveal' : ''} onClick={() => setSelected(optionIndex)}><b>{String.fromCharCode(65 + optionIndex)}</b><span>{t(locale, option)}</span></button>)}</div>{selected !== null && <Feedback correct={correct} text={correct ? t(locale, q.why) : (locale === 'tr' ? 'Bu cevap akışın sorumluluğuyla uyuşmuyor. Açıklamayı yeniden oku ve başka bir seçenek dene.' : 'This answer does not match the flow responsibility. Re-read the explanation and try another option.')} />}{correct && <button className="button button-primary module-next" type="button" onClick={next}>{index === practice.questions.length - 1 ? (locale === 'tr' ? 'Etkinliği tamamla' : 'Complete activity') : (locale === 'tr' ? 'Sonraki soru' : 'Next question')}<Icon name="arrow-right" /></button>}</div>;
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
