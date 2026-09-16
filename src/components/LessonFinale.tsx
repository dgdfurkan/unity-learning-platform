import { useMemo, useState } from 'react';
import type { Locale } from '../domain/models';
import type { Lesson } from '../learning/course';
import { Icon } from '../shared/Icon';

type FinaleQuestion = {
  type: 'concept' | 'code' | 'debug' | 'scenario' | 'transfer' | 'boss';
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
};

type FinalePack = { title: string; subtitle: string; questions: FinaleQuestion[] };

const packs: Record<number, FinalePack> = {
  1: { title: 'İlk Script Laboratuvarı', subtitle: 'Dosyadan Component’e uzanan bütün zinciri kur.', questions: [
    { type: 'concept', prompt: 'Bir `.cs` dosyası sahnede davranış gösterebilmek için neye dönüşmelidir?', options: ['Texture', 'GameObject’e eklenen Component', 'Prefab klasörü'], answer: 1, explanation: 'Script dosyası sınıfı taşır; MonoBehaviour sınıfının örneği GameObject’e Component olarak eklenir.' },
    { type: 'code', prompt: 'Aşağıdaki satırın asıl görevi nedir?', code: 'using UnityEngine;', options: ['Oyunu başlatmak', 'UnityEngine türlerine kısa adla erişmek', 'Yeni GameObject üretmek'], answer: 1, explanation: '`using`, namespace içindeki türleri tam adres yazmadan kullanmanı sağlar.' },
    { type: 'debug', prompt: '`void awake()` neden derlenmesine rağmen kendiliğinden çalışmayabilir?', options: ['`void` yasak olduğu için', 'Unity tam olarak `Awake` adını aradığı için', 'Metodun parametresi olmadığı için'], answer: 1, explanation: 'C# ve Unity callback adları büyük/küçük harfe duyarlıdır.' },
    { type: 'scenario', prompt: 'Açıklama satırı kod gövdesine nasıl yazılmalıdır?', options: ['İlk mesajını buraya yaz.', '// İlk mesajını buraya yaz.', '"İlk mesajını buraya yaz."'], answer: 1, explanation: '`//` ile başlayan satır comment olur; düz Türkçe cümle C# komutu değildir.' },
    { type: 'transfer', prompt: 'Dosyanın adı `PlayerMover.cs` ise MonoBehaviour sınıfının en güvenli adı hangisidir?', options: ['playerMover', 'PlayerMover', 'FirstScript'], answer: 1, explanation: 'Unity’de dosya adı ile ana MonoBehaviour sınıf adının birebir eşleşmesi güvenli kuraldır.' },
    { type: 'boss', prompt: 'Doğru çalışma zinciri hangisidir?', options: ['Console → class → using', 'Script → class → Component → callback → Console', 'GameObject → namespace → Texture'], answer: 1, explanation: 'Kaynak dosya sınıfı taşır; Component örneği callback alır ve kod Console’a çıktı gönderebilir.' },
  ] },
  2: { title: 'Oyun Durumu Kasası', subtitle: 'Tür, isim, scope ve Inspector kararlarını birlikte ver.', questions: [
    { type: 'concept', prompt: 'Bir değişkenin türü neyi belirler?', options: ['Değerin nasıl saklanıp yorumlanacağını', 'Satırın rengini', 'Dosyanın klasörünü'], answer: 0, explanation: 'Tür; değerin sayı, metin veya doğru/yanlış gibi nasıl yorumlanacağını belirler.' },
    { type: 'code', prompt: 'Hangisi metin değeridir?', code: '42   "42"   true', options: ['42', '"42"', 'true'], answer: 1, explanation: 'Çift tırnak içindeki içerik string’dir; rakam görünmesi bunu sayıya dönüştürmez.' },
    { type: 'debug', prompt: '`int packagecount = 4;` tanımından sonra hangisi hata üretir?', options: ['Debug.Log(packagecount);', 'Debug.Log(packageCount);', 'packagecount = 5;'], answer: 1, explanation: '`packagecount` ve `packageCount` iki farklı semboldür.' },
    { type: 'scenario', prompt: 'Oyunun açık mı kapalı mı olduğunu hangi tür en iyi taşır?', options: ['bool', 'string', 'int[]'], answer: 0, explanation: 'İki durumlu bir bilgi `bool` ile açık ve güvenli biçimde modellenir.' },
    { type: 'transfer', prompt: 'Inspector’dan ayarlanacak ama başka scriptlere kapalı alan hangisidir?', options: ['public int speed;', '[SerializeField] private int speed;', 'void speed()'], answer: 1, explanation: 'SerializeField editör görünürlüğü, private ise kod erişim sınırı sağlar.' },
    { type: 'boss', prompt: 'Bir metodun içinde tanımlanan değişken nerede kullanılabilir?', options: ['Bütün projede', 'Yalnızca ait olduğu scope içinde', 'Her prefabda'], answer: 1, explanation: 'Yerel değişkenin görünürlüğü tanımlandığı metodun scope’u ile sınırlıdır.' },
  ] },
  3: { title: 'Karar Kapıları', subtitle: 'Operatörü seç, sınırı test et, doğru dalı çalıştır.', questions: [
    { type: 'concept', prompt: '`lives > 0` ifadesinin ürettiği tür nedir?', options: ['int', 'bool', 'string'], answer: 1, explanation: 'Karşılaştırmalar true veya false üretir.' },
    { type: 'code', prompt: 'Atama ile eşitlik karşılaştırmasını doğru eşleştir.', code: 'lives = 3;   lives == 3', options: ['İkisi de atama', '`=` atama, `==` karşılaştırma', '`==` atama, `=` karşılaştırma'], answer: 1, explanation: 'Tek eşittir değer yazar; çift eşittir iki değeri karşılaştırır.' },
    { type: 'debug', prompt: '`if (lives = 0)` satırındaki temel hata nedir?', options: ['Karşılaştırma yerine atama kullanılması', 'Parantezin bulunması', 'lives adının İngilizce olması'], answer: 0, explanation: 'Koşul bool üretmelidir; eşitlik sorusu için `==` gerekir.' },
    { type: 'scenario', prompt: 'Kapı yalnızca anahtar varsa VE enerji 10’dan büyükse açılacak. Hangi bağlaç gerekir?', options: ['||', '&&', '!'], answer: 1, explanation: 'İki koşulun da doğru olması gerekiyorsa `&&` kullanılır.' },
    { type: 'transfer', prompt: '`lives` değeri 0 iken `if (lives > 0) ... else ...` hangi dala gider?', options: ['if', 'else', 'İkisine birden'], answer: 1, explanation: '0 > 0 false olduğu için else dalı seçilir.' },
    { type: 'boss', prompt: 'Bir if/else if/else zincirinde kaç dal çalışır?', options: ['İlk doğru bulunan tek dal', 'Bütün doğru görünen dallar', 'Daima else'], answer: 0, explanation: 'Zincir yukarıdan aşağı okunur ve ilk doğru dal seçilince kalanlar atlanır.' },
  ] },
  4: { title: 'Yaşam Döngüsü Kontrol Odası', subtitle: 'Davranışı doğru zamana yerleştir.', questions: [
    { type: 'concept', prompt: '`void Move(float speed)` içinde `float speed` nedir?', options: ['Dönüş türü', 'Parametre', 'Class adı'], answer: 1, explanation: 'Parametre, metod çağrılırken dışarıdan gelen veriyi kabul eder.' },
    { type: 'code', prompt: 'İlk aktif başlangıçta bir kez çalışması beklenen callback hangisidir?', options: ['Start', 'Update', 'LateUpdate'], answer: 0, explanation: 'Start ilk aktif başlangıçtan önce bir kez çağrılır.' },
    { type: 'debug', prompt: 'Rigidbody kuvvetini Update içinde vermek neden tutarsızlık oluşturabilir?', options: ['Update cihazın frame hızına bağlı olduğu için', 'Rigidbody yalnızca editörde olduğu için', 'Update hiç çalışmadığı için'], answer: 0, explanation: 'Fizik işlemleri sabit zaman adımlı FixedUpdate ritmine yerleştirilir.' },
    { type: 'scenario', prompt: 'Kamera oyuncu hareketinden sonra hedefi izlemeli. En uygun callback?', options: ['Awake', 'LateUpdate', 'OnDisable'], answer: 1, explanation: 'LateUpdate, o frame’deki Update işlemlerinden sonra çalışır.' },
    { type: 'transfer', prompt: 'Event aboneliği hangi çiftte açılıp kapatılmalıdır?', options: ['OnEnable / OnDisable', 'Start / Update', 'Awake / FixedUpdate'], answer: 0, explanation: 'Nesne etkinleştiğinde abone olmak ve devre dışı kalınca ayrılmak güvenli bir dengedir.' },
    { type: 'boss', prompt: 'Doğru başlangıç sırası hangisidir?', options: ['Start → Awake → OnEnable', 'Awake → OnEnable → Start', 'Update → Start → Awake'], answer: 1, explanation: 'Unity’nin temel başlangıç akışında Awake, OnEnable ve ardından Start gelir.' },
  ] },
  5: { title: 'Component Montaj Hattı', subtitle: 'GameObject’i küçük sorumluluklarla çalışan sisteme dönüştür.', questions: [
    { type: 'concept', prompt: 'GameObject’in davranışı nereden gelir?', options: ['Adından', 'Üzerindeki Component’lerden', 'Hierarchy renginden'], answer: 1, explanation: 'GameObject taşıyıcıdır; görünüm, fizik ve özel davranış Component’lerle eklenir.' },
    { type: 'code', prompt: 'Temas hacmini fiziksel engel olmadan olay üretmek için hangi ayar gerekir?', options: ['Is Trigger', 'Static', 'Tag = MainCamera'], answer: 0, explanation: 'Trigger, katı çarpışma yerine giriş/çıkış olayı üretir.' },
    { type: 'debug', prompt: 'OnTriggerEnter hiç çalışmıyor. İlk hangi yapısal eksik kontrol edilir?', options: ['Gerekli Collider/Rigidbody düzeni', 'Dosya ikonunun rengi', 'Scene adının uzunluğu'], answer: 0, explanation: 'Fizik callback’leri gerekli Component ve ayarların doğru kurulmasına bağlıdır.' },
    { type: 'scenario', prompt: 'Bir pickup’ın görünmesi için en ilgili Component hangisidir?', options: ['Renderer', 'Rigidbody', 'AudioListener'], answer: 0, explanation: 'Renderer görseli çizer; Collider teması, script davranışı yönetir.' },
    { type: 'transfer', prompt: 'Aynı GameObject’te hareket ve can sistemini ayırmanın faydası nedir?', options: ['Sorumlulukları bağımsız geliştirmek', 'Daha çok dosya adı görmek', 'Update’i kapatmak'], answer: 0, explanation: 'Küçük Component’ler değişimi, testi ve yeniden kullanımı kolaylaştırır.' },
    { type: 'boss', prompt: 'Pickup zinciri hangisidir?', options: ['Renderer → isim → klasör', 'Collider/Trigger → callback → koşul → durum güncelleme', 'Prefab → comment → namespace'], answer: 1, explanation: 'Temas algılanır, callback çalışır, koşul doğrulanır ve oyun durumu güncellenir.' },
  ] },
  6: { title: 'Döngü Motoru', subtitle: 'Tekrarı güvenli sınırlar içinde yönet.', questions: [
    { type: 'concept', prompt: '`for` döngüsünün üç kontrol parçası nedir?', options: ['Başlangıç, koşul, ilerleme', 'Class, object, prefab', 'Input, kamera, ses'], answer: 0, explanation: 'Sayaç başlatılır, koşul sınanır ve her tur ilerletilir.' },
    { type: 'code', prompt: '0, 1 ve 2 değerlerini üretmek için doğru koşul hangisidir?', code: 'for (int i = 0; ___; i++)', options: ['i <= 3', 'i < 3', 'i > 3'], answer: 1, explanation: '`i < 3` son geçerli değeri 2’de bırakır.' },
    { type: 'debug', prompt: '`while` döngüsünde en tehlikeli unutma nedir?', options: ['Koşulu false’a yaklaştırmamak', 'Comment yazmak', 'Değişken adını İngilizce seçmek'], answer: 0, explanation: 'Koşul hiç değişmezse sonsuz döngü oluşabilir.' },
    { type: 'scenario', prompt: 'Bir koleksiyondaki her öğeyi index gerektirmeden okumak için?', options: ['foreach', 'if', 'Awake'], answer: 0, explanation: 'foreach öğeleri sırayla verir ve index sınırı yönetimini azaltır.' },
    { type: 'transfer', prompt: 'Döngü gövdesi hiç çalışmıyorsa ilk ne incelenir?', options: ['Başlangıçta koşulun true olup olmadığı', 'Inspector teması', 'Prefab rengi'], answer: 0, explanation: 'Koşul ilk kontrolde false ise gövdeye hiç girilmez.' },
    { type: 'boss', prompt: 'Bilinen sayıda spawn noktası ve index ihtiyacı için en uygun yapı?', options: ['for', 'while(true)', 'else'], answer: 0, explanation: 'for, sayaç ve sınırı tek satırda görünür tutar.' },
  ] },
  7: { title: 'Koleksiyon Deposu', subtitle: 'Array, List ve index sınırlarını doğru yönet.', questions: [
    { type: 'concept', prompt: 'Üç öğeli array’in son geçerli index’i nedir?', options: ['3', '2', '1'], answer: 1, explanation: 'Index sıfırdan başladığı için son konum adet eksi birdir.' },
    { type: 'code', prompt: 'Array uzunluğu hangi özellikten okunur?', options: ['Length', 'Count', 'Size()'], answer: 0, explanation: 'Array `Length`, List ise `Count` kullanır.' },
    { type: 'debug', prompt: '`items[items.Length]` neden hatalıdır?', options: ['Bir sonraki, var olmayan yuvayı istediği için', 'Length string olduğu için', 'Köşeli parantez yasak olduğu için'], answer: 0, explanation: 'Son geçerli index `Length - 1` değeridir.' },
    { type: 'scenario', prompt: 'Çalışma anında büyüyüp küçülen envanter için?', options: ['List', 'Sabit array', 'bool'], answer: 0, explanation: 'List ekleme ve çıkarma için dinamik yapı sunar.' },
    { type: 'transfer', prompt: 'Konuma ihtiyacın yoksa en okunabilir dolaşım?', options: ['foreach', 'i <= Count', 'while(false)'], answer: 0, explanation: 'foreach, öğenin kendisine odaklanır ve index hatasını azaltır.' },
    { type: 'boss', prompt: 'List içindeki son öğeye güvenli erişim?', options: ['list[list.Count - 1]', 'list[list.Count]', 'list[-1]'], answer: 0, explanation: 'Son index, eleman sayısının bir eksiğidir.' },
  ] },
  8: { title: 'Sınıf Tasarım Atölyesi', subtitle: 'Sorumlulukları ayır, nesneleri bilinçli üret.', questions: [
    { type: 'concept', prompt: 'Class ile object arasındaki temel fark nedir?', options: ['Class şablon, object örnektir', 'İkisi tamamen aynıdır', 'Object yalnızca dosya adıdır'], answer: 0, explanation: 'Class yapıyı tarif eder; object o tariften üretilen somut örnektir.' },
    { type: 'code', prompt: '`new ScoreCounter()` ne üretir?', options: ['Yeni instance', 'Yeni namespace', 'Yeni sahne'], answer: 0, explanation: '`new`, sınıftan bellekte yeni bir object oluşturur.' },
    { type: 'debug', prompt: 'Tek sınıf hem canı, hem UI’ı, hem kayıt sistemini yönetiyorsa ana sorun?', options: ['Birden fazla değişim nedeni taşıması', 'Sınıf adının uzunluğu', 'private kullanması'], answer: 0, explanation: 'Tek sorumluluk ilkesi, farklı değişim nedenlerini ayırmayı önerir.' },
    { type: 'scenario', prompt: 'İki EnemyHealth instance’ının normal field değerleri nasıldır?', options: ['Her instance kendi değerini taşır', 'Daima ortaktır', 'Yalnızca Console’da yaşar'], answer: 0, explanation: 'Static olmayan instance field’ları her object için ayrıdır.' },
    { type: 'transfer', prompt: 'Quest verisi, ödül verme ve UI gösterimi için en iyi yaklaşım?', options: ['Ayrı sorumluluk sınıfları', 'Tek dev class', 'Her şeyi Update’e yazmak'], answer: 0, explanation: 'Ayrı sorumluluklar daha kolay test edilir ve değiştirilir.' },
    { type: 'boss', prompt: 'İyi sınıf sınırı hangi soruyla bulunur?', options: ['Bu kodun değişmek için kaç farklı nedeni var?', 'Dosya kaç satır?', 'Kaç renk kullanılıyor?'], answer: 0, explanation: 'Sorumluluk, satır sayısından çok değişim nedenine göre ayrılır.' },
  ] },
  9: { title: 'Kapsülleme Kalesi', subtitle: 'Veriyi koru, kontrollü erişim kapıları kur.', questions: [
    { type: 'concept', prompt: '`private` neyi belirler?', options: ['Erişim yetkisini', 'Veri türünü', 'Frame hızını'], answer: 0, explanation: 'private, üyeye class dışından doğrudan erişimi kapatır.' },
    { type: 'code', prompt: 'Dışarıya yalnızca okuma sunan yapı hangisidir?', options: ['Read-only property', 'Public field', 'Local variable'], answer: 0, explanation: 'Setter içermeyen property değeri gösterir fakat doğrudan yazma yetkisi vermez.' },
    { type: 'debug', prompt: '`player.currentHealth -= damage` neden risklidir?', options: ['Koruma ve sınır kurallarını atladığı için', 'Nokta kullanıldığı için', 'int çıkarılamadığı için'], answer: 0, explanation: 'Durum değişimi TakeDamage gibi kurallı bir metoda yönlendirilmelidir.' },
    { type: 'scenario', prompt: 'Can değeri 0 ile maxHealth arasında kalmalı. Hangi araç uygundur?', options: ['Mathf.Clamp', 'Debug.Log', 'CompareTag'], answer: 0, explanation: 'Clamp sayıyı belirlenen alt ve üst sınır içinde tutar.' },
    { type: 'transfer', prompt: 'Inspector ayarı ve dış kod erişimi aynı şey midir?', options: ['Hayır, SerializeField ve access modifier farklıdır', 'Evet, tamamen aynıdır', 'Yalnızca prefabda aynıdır'], answer: 0, explanation: 'Editör görünürlüğü ile kod erişim yetkisi ayrı kararlardır.' },
    { type: 'boss', prompt: 'En az yetki ilkesi ne söyler?', options: ['Yalnızca ihtiyaç kadar görünürlük ver', 'Her field public olsun', 'Bütün metotları static yap'], answer: 0, explanation: 'Her üye yalnızca gereken tüketicilere gereken erişimi sunmalıdır.' },
  ] },
  10: { title: 'Prefab Üretim Merkezi', subtitle: 'Asset, instance, override ve Variant bağını yönet.', questions: [
    { type: 'concept', prompt: 'Prefab Asset nedir?', options: ['Project içindeki kalıcı kaynak şablon', 'Sahnedeki geçici kamera', 'Console kaydı'], answer: 0, explanation: 'Prefab Asset, instance’ların kaynak aldığı tekrar kullanılabilir şablondur.' },
    { type: 'code', prompt: 'Bir instance değişikliğini kaynak Prefab’a taşımak için?', options: ['Apply', 'Revert', 'Delete'], answer: 0, explanation: 'Apply seçili override’ı kaynak asset’e aktarır.' },
    { type: 'debug', prompt: 'Project’teki Prefab Asset silinirse sahne örneklerinde ne risk oluşur?', options: ['Kaynak bağlantısının kaybolması', 'FPS’in artması', 'Stringlerin int olması'], answer: 0, explanation: 'Instance’lar kalıcı kaynaklarına ait bağlantıyı kaybedebilir.' },
    { type: 'scenario', prompt: 'Bütün hızlı düşmanlarda kullanılacak kalıcı alt tür için?', options: ['Prefab Variant', 'Tek instance override', 'Comment'], answer: 0, explanation: 'Variant, ortak tabandan türeyen tekrar kullanılabilir alt şablondur.' },
    { type: 'transfer', prompt: 'Yalnızca tutorial sahnesindeki tek sandık açık başlayacak. En uygun çözüm?', options: ['Yerel override', 'Bütün Prefab’a Apply', 'Yeni proje açmak'], answer: 0, explanation: 'Tek örneğe özgü fark asset’in bütün örneklerine taşınmamalıdır.' },
    { type: 'boss', prompt: 'Nested Prefab ne zaman anlamlıdır?', options: ['Alt parça bağımsız ve tekrar kullanılabilirse', 'Her küçük vida için', 'Yalnızca isim uzun olduğunda'], answer: 0, explanation: 'Bağımsız anlamı ve yeniden kullanım değeri olan parçalar nested prefab olabilir.' },
  ] },
};

const fallbackPack = (lesson: Lesson): FinalePack => ({
  title: 'Ders Sonu Etkinlik Bombası',
  subtitle: 'Kavramları yeni bir oyun senaryosuna aktar.',
  questions: lesson.concepts.slice(0, 6).map((concept, index) => ({
    type: index === 5 ? 'boss' : 'transfer',
    prompt: `“${concept}” kavramını kullanmadan önce hangi soruyu cevaplamalısın?`,
    options: ['Bu kavramın sorumluluğu ne?', 'Hangi renk daha güzel?', 'Dosya kaç piksel?'],
    answer: 0,
    explanation: 'Kod kararları görünüşten değil, kavramın sorumluluğundan çıkar.',
  })),
});

export function LessonFinale({ lesson, locale, onComplete }: { lesson: Lesson; locale: Locale; onComplete: () => void }) {
  const pack = packs[lesson.order] ?? fallbackPack(lesson);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = pack.questions[index];
  const correct = selected === question?.answer;
  const score = useMemo(() => Math.max(50, Math.round(((pack.questions.length - mistakes) / pack.questions.length) * 100)), [mistakes, pack.questions.length]);

  const choose = (optionIndex: number) => {
    if (selected === question.answer) return;
    setSelected(optionIndex);
    if (optionIndex === question.answer) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo(Math.max(bestCombo, nextCombo));
    } else {
      setMistakes((value) => value + 1);
      setCombo(0);
    }
  };

  const next = () => {
    if (index === pack.questions.length - 1) {
      setFinished(true);
      onComplete();
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  if (!started) return <section className="finale-launch"><div className="finale-orbit" aria-hidden="true"><i/><i/><i/><span><Icon name="spark" /></span></div><div><p className="section-kicker">{locale === 'tr' ? 'Ders sonu · yüksek XP' : 'Lesson finale · high XP'}</p><h2>{pack.title}</h2><p>{pack.subtitle} {locale === 'tr' ? 'Altı tur boyunca ezber değil; açıklama, kod okuma, hata ayıklama ve transfer gücü ölçülecek.' : 'Across six rounds, you will be measured on explanation, code reading, debugging, and transfer—not memorisation.'}</p><ul><li><b>6</b><span>{locale === 'tr' ? 'karışık tur' : 'mixed rounds'}</span></li><li><b>160</b><span>XP</span></li><li><b>1</b><span>{locale === 'tr' ? 'final skor' : 'final score'}</span></li></ul><button className="button button-primary finale-start" type="button" onClick={() => setStarted(true)}>{locale === 'tr' ? 'Etkinlik bombasını başlat' : 'Start the activity blast'}<Icon name="arrow-right" /></button></div></section>;

  if (finished) return <section className="finale-result"><div className="finale-score-ring"><span>{score}</span><small>/ 100</small></div><p className="section-kicker">{locale === 'tr' ? 'Ders tamamlandı' : 'Lesson complete'}</p><h2>{score >= 85 ? (locale === 'tr' ? 'Bilgiyi yeni duruma aktarabiliyorsun.' : 'You can transfer the knowledge.') : (locale === 'tr' ? 'Temel oluştu; tekrar turu onu sağlamlaştıracak.' : 'The foundation is in place; review will strengthen it.')}</h2><p>{locale === 'tr' ? `${pack.questions.length} tur tamamlandı · En iyi seri ${bestCombo} · ${mistakes} yeniden deneme` : `${pack.questions.length} rounds · Best combo ${bestCombo} · ${mistakes} retries`}</p><div className="finale-rewards"><span><Icon name="spark" /><b>+160 XP</b></span><span><Icon name="check" /><b>{locale === 'tr' ? 'Ders rozeti açıldı' : 'Lesson badge unlocked'}</b></span></div></section>;

  const labels = { concept: 'KAVRAM', code: 'KOD OKUMA', debug: 'HATA AVI', scenario: 'OYUN SENARYOSU', transfer: 'TRANSFER', boss: 'FİNAL KARARI' };
  return <section className={`finale-arena ${question.type}`}><header><div><span>{labels[question.type]}</span><strong>{index + 1} / {pack.questions.length}</strong></div><div className="finale-progress"><i style={{ width: `${((index + 1) / pack.questions.length) * 100}%` }}/></div><p><Icon name="spark" /> {locale === 'tr' ? `Kombo: ${combo}` : `Combo: ${combo}`}</p></header><main><p className="section-kicker">{pack.title}</p><h3>{question.prompt}</h3>{question.code && <pre><code>{question.code}</code></pre>}<div className="finale-options">{question.options.map((option, optionIndex) => <button type="button" key={option} className={selected === optionIndex ? optionIndex === question.answer ? 'correct' : 'incorrect' : correct && optionIndex === question.answer ? 'correct' : ''} onClick={() => choose(optionIndex)} disabled={correct}><b>{String.fromCharCode(65 + optionIndex)}</b><span>{option}</span></button>)}</div>{selected !== null && <div className={correct ? 'finale-feedback correct' : 'finale-feedback incorrect'}><Icon name={correct ? 'check' : 'close'} /><p>{correct ? question.explanation : 'Henüz değil. Seçeneğin ne yaptığına değil, sorunun hangi sorumluluğu ölçtüğüne yeniden bak.'}</p></div>}{correct && <button className="button button-primary finale-next" type="button" onClick={next}>{index === pack.questions.length - 1 ? (locale === 'tr' ? 'Final skorumu göster' : 'Show my final score') : (locale === 'tr' ? 'Sonraki tura geç' : 'Next round')}<Icon name="arrow-right" /></button>}</main></section>;
}
