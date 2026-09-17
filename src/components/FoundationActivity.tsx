import { useMemo, useState } from 'react';
import type { Locale } from '../domain/models';
import type { LessonStep } from '../learning/course';
import { localize } from '../learning/course';
import { Icon } from '../shared/Icon';

type Challenge = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
};

const challenges: Record<string, Challenge> = {
  'l1-welcome': { prompt:'Bu derste neden doğrudan C# koduyla başlamıyoruz?', options:['Önce davranışın zihinsel modelini kurmak için','Kod öğrenmek gereksiz olduğu için','Unity kod kullanmadığı için'], answer:0, explanation:'Kod, açıkça tasarlanan davranışın bilgisayara aktarım aracıdır. Zihinsel model olmadan sözdizimi ezbere dönüşür.', hint:'Araçtan önce hangi davranışı istediğimizi düşün.' },
  'l1-observe': { prompt:'Karakterin kalan enerjisi hangi görevdedir?', options:['Input','Durum','Output'], answer:1, explanation:'Enerji, oyunun o anda sakladığı ve kuralların okuyabildiği bir durum bilgisidir.', hint:'Oyunun hatırladığı bilgiyi ara.' },
  'l1-four-link': { prompt:'Doğru sistem sırası hangisidir?', options:['Output → durum → kural → input','Input → kural → durum → output','Kural → input → output → durum'], answer:1, explanation:'Oyuncu niyet gönderir, kural mevcut durumu değerlendirir, durum güncellenir ve sonuç gösterilir.', hint:'Sonuç, karar verilmeden önce oluşamaz.' },
  'l1-input': { prompt:'Gamepad A ve ekrana dokunma aynı “Zıpla” eylemine bağlanırsa ortak olan nedir?', options:['Fiziksel cihaz','Oyundaki niyet','Karakterin konumu'], answer:1, explanation:'Cihazlar farklı sinyal üretse de oyunda aynı niyeti temsil edebilir.', hint:'Tuşun şekline değil, oyunda ne istendiğine bak.' },
  'l1-rule': { prompt:'Zıpla girdisi geldi; karakter havada. Yer tabanlı kural ne yapmalı?', options:['Her durumda yeniden zıplatmalı','Mevcut durumu kontrol edip isteği reddetmeli','Input’u durum olarak saklamalı'], answer:1, explanation:'Kural hem isteği hem mevcut durumu değerlendirir. Input her zaman değişim üretmez.', hint:'Karar için yalnız isteğin gelmesi yeterli mi?' },
  'l1-state': { prompt:'Karakter anahtarı aldığında hangi bilgi doğrudan değişir?', options:['anahtarVar','kapıAçık','oyunun build türü'], answer:0, explanation:'Anahtarı alma olayı `anahtarVar` bilgisini değiştirir; kapı ancak ayrı bir kural çalışınca açılır.', hint:'Olayın doğrudan etkilediği değeri seç.' },
  'l1-output': { prompt:'Kilitli kapıda yalnız kısa bir ses kullanmanın riski nedir?', options:['Ses her zaman çok yavaştır','Sesi duyamayan oyuncu bilgiyi kaçırabilir','Output yalnız metin olabilir'], answer:1, explanation:'Önemli bilgi mümkünse görsel/metinsel ikinci bir kanalla da iletilmelidir.', hint:'Bilginin tek kanala bağlı kalmasını düşün.' },
  'l1-precision': { prompt:'“Karakteri biraz ilerlet” komutunda hangi bilgi eksiktir?', options:['Yön ve miktar','Dosya uzantısı','Editor lisansı'], answer:0, explanation:'Uygulanabilir komut hedefi, yönü, miktarı ve gerekirse durma koşulunu açıklar.', hint:'Bilgisayar “biraz” kelimesini nasıl ölçecek?' },
  'l1-roles': { prompt:'Oyuncuya çalıştırması için hangi sonuç teslim edilir?', options:['Editor yerleşimi','Build','Kod editörünün ayar ekranı'], answer:1, explanation:'Build, proje kaynaklarından üretilen ve oyuncunun çalıştırdığı pakettir.', hint:'Üretim masası ile teslim edilen ürünü ayır.' },
  'l1-loop': { prompt:'Bir sonraki oyun turu hangi bilgiyle başlar?', options:['Her zaman sıfır durumla','Önceki turun bıraktığı güncel durumla','Yalnız son ses efektiyle'], answer:1, explanation:'Durum süreklilik taşır; yeni input önceki turun bıraktığı bilgi üzerinde değerlendirilir.', hint:'Karakterin konumu her tur başında sıfırlanır mı?' },
  'l1-debug': { prompt:'Input geldi, anahtarVar=true; kapı kuralı false bekliyor. İlk yanlış nokta neresi?', options:['Input','Kural','Kapı görseli'], answer:1, explanation:'İlk iki kanıt doğru; ters değeri kontrol eden kural ilk beklenmeyen noktadır.', hint:'Kanıtları soldan sağa izle.' },
  'l1-lab': { prompt:'Yakıt sıfırken hızlanma girdisine doğru sistem cevabı hangisidir?', options:['Hızı artır ve yakıtı eksiye düşür','Durumu koru ve anlaşılır uyarı ver','Input’u yok sayıp hiçbir geri bildirim verme'], answer:1, explanation:'Kural isteği reddeder, durumu güvenli tutar ve output oyuncuya nedenini anlatır.', hint:'Hem güvenli durum hem anlaşılır output gerekli.' },
  'l1-game': { prompt:'Bir kapsülü göndermeden önce hangi kanıt çifti gerekir?', options:['Yakıt yeterli ve kapı açık','Müzik açık ve Editor kurulu','Klasör adı kısa ve ses yüksek'], answer:0, explanation:'Gönderim kuralı ilgili mevcut durumları doğrulamalıdır.', hint:'Gönderimin güvenliğini doğrudan etkileyen durumları seç.' },
  'l2-recall': { prompt:'Bilgisayar kapandığında proje bilgisinin kalmasını sağlayan temel yapı nedir?', options:['Geçici oyun durumu','Diskteki dosya','Ekrandaki animasyon'], answer:1, explanation:'Dosya, bilgiyi kalıcı saklama ortamında tutar.', hint:'Elektrik kesilse de hangi şey kalır?' },
  'l2-file-folder': { prompt:'`Scripts/` öğesinin temel görevi nedir?', options:['Tek bir C# komutu çalıştırmak','Dosya ve alt klasörleri düzenlemek','Build olmak'], answer:1, explanation:'Scripts bir klasördür; içindeki dosyaları düzenler.', hint:'İçeriği mi taşır, öğeleri mi düzenler?' },
  'l2-name-extension': { prompt:'`PlayerMove.cs.txt` dosyasında gerçek son uzantı nedir?', options:['.cs','.txt','.cs.txt her zaman tek uzantıdır'], answer:1, explanation:'Son noktanın ardından gelen bölüm gerçek son uzantıdır; gizli uzantılar yanıltabilir.', hint:'En sağdaki son noktadan sonrasını oku.' },
  'l2-path': { prompt:'Aynı adlı iki dosya nasıl birbirinden ayrılır?', options:['Yalnız simge rengiyle','Tam yollarıyla','Dosya adı her zaman benzersizdir'], answer:1, explanation:'Dosyanın konumu, kökten dosyaya kadar tam yoluyla belirlenir.', hint:'Adres benzetmesini kullan.' },
  'l2-root': { prompt:'Paket bağımlılıkları hangi temel proje parçasıyla ilişkilidir?', options:['Packages','Assets/Scripts','Ekran görüntüsü klasörü'], answer:0, explanation:'Packages, projenin paket bağımlılıklarını tanımlar.', hint:'İçerik değil bağımlılık kaydını ara.' },
  'l2-assets-boundary': { prompt:'Hub’da Open project için hangi klasör seçilir?', options:['MyGame/','MyGame/Assets/','MyGame/Assets/Scripts/'], answer:0, explanation:'Proje kökü Assets, Packages ve ProjectSettings öğelerini birlikte taşır.', hint:'Üç temel öğenin ortak ebeveynini seç.' },
  'l2-zip': { prompt:'ZIP içindeki projede çalışmadan önce doğru adım nedir?', options:['Yalnız Assets’i masaüstüne sürüklemek','Arşivin tamamını güvenli klasöre çıkartmak','ZIP adını .unity yapmak'], answer:1, explanation:'Proje bütünlüğü için arşiv tamamen çıkartılır ve kök yeniden doğrulanır.', hint:'Tek bir parça eksiksiz proje değildir.' },
  'l2-safe-location': { prompt:'Başlangıç projesi için en güçlü aday hangisidir?', options:['Sistem klasörü/Windows/','Downloads/Yeni Klasör (27)/','D:/GameDev/Projects/FirstGame/'], answer:2, explanation:'Kısa, anlamlı ve kontrol edilen bir çalışma yolu izin ve düzen riskini azaltır.', hint:'İzin, açıklık ve yol uzunluğunu birlikte düşün.' },
  'l2-naming': { prompt:'Hangi ad proje kimliğini en açık taşır?', options:['final_son_son2','Yeni Klasör','LevelUpPractice'], answer:2, explanation:'Anlamlı tam kelimeler sürüm karmaşasını ve belirsizliği azaltır.', hint:'Altı ay sonra hangi adı anlayabilirsin?' },
  'l2-backup': { prompt:'Aynı diskteki iki proje kopyası hangi riske karşı yetersizdir?', options:['Disk arızası','Dosya adını unutmak','Editor temasının değişmesi'], answer:0, explanation:'Tek disk bozulursa iki klasör de birlikte kaybedilebilir.', hint:'İki kopya aynı fiziksel riski paylaşıyor mu?' },
  'l2-diagnose': { prompt:'Hub yolu `Game.zip/Game/Assets` ise ilk kök sorun nedir?', options:['Projenin arşiv içinde ve Assets seviyesinde seçilmesi','Proje adının İngilizce olması','Assets klasörünün bulunması'], answer:0, explanation:'Önce arşiv çıkartılmalı, sonra Assets’in üstündeki proje kökü seçilmelidir.', hint:'İki ayrı sınır hatası var: arşiv ve kök.' },
  'l2-lab': { prompt:'Bağımsız yedek için doğru aday hangisidir?', options:['GameDev/Projects/LevelUpPractice/','Başka ortam/Backups/LevelUpPractice_2026-09-16.zip','LevelUpPractice/Assets/Backup/'], answer:1, explanation:'Yedek çalışma projesinden ve mümkünse aynı risk alanından ayrılır.', hint:'Çalışma kopyasının içinde olan şey bağımsız mı?' },
  'l2-game': { prompt:'Kurtarma görevinde ilk hareket ne olmalıdır?', options:['Rastgele klasör silmek','Haritayı ve mevcut kanıtları incelemek','Bütün dosyaların adını değiştirmek'], answer:1, explanation:'Güvenli teşhis, değişiklikten önce mevcut durumu kanıtla okur.', hint:'Önce ölç, sonra değiştir.' },
  'l3-recall': { prompt:'Oyuncuya hangisi gönderilir?', options:['Unity Hub','Build','Assets klasörü tek başına'], answer:1, explanation:'Build, oyuncunun çalıştırdığı dağıtılabilir sonuçtur.', hint:'Yönetim aracı ile ürün sonucunu ayır.' },
  'l3-toolchain': { prompt:'Platforma özel build desteğini hangi parça sağlar?', options:['Modül','Proje adı','Lisans avatarı'], answer:0, explanation:'Modüller Android, Web veya belirli masaüstü hedefleri için ek araç zinciri sağlar.', hint:'Hedef platform için eklenen parçayı ara.' },
  'l3-preflight': { prompt:'Kurulum boyutu için en güvenilir bilgi hangisidir?', options:['Ezberlenmiş sabit bir sayı','Seçilen Editor ve modüller için Hub’ın gösterdiği güncel boyut','Başka öğrencinin geçen yılki tahmini'], answer:1, explanation:'Sürüm ve modül seçimi boyutu değiştirir; güncel kurulum ekranı esas alınır.', hint:'Hangi bilgi seçiminle birlikte güncellenir?' },
  'l3-source': { prompt:'Kurucuyu seçerken hangi ikili birlikte doğrulanır?', options:['Logo rengi ve dosya boyutu','Resmî alan adı ve işletim sistemi','Reklam sayısı ve indirme hızı'], answer:1, explanation:'Kaynağın resmî oluşu ve paketin işletim sistemine uygunluğu iki ayrı kanıttır.', hint:'Kaynak ve hedef cihaz.' },
  'l3-hub': { prompt:'Hub açıldı; Installations boş. Bu neyi gösterir?', options:['Editor henüz kurulmamış olabilir','Editor kesin kuruldu','İlk oyun otomatik oluştu'], answer:0, explanation:'Hub yöneticidir; Editor kurulumu ayrıca Installations alanında görünmelidir.', hint:'Hub ile Editor aynı şey değil.' },
  'l3-account-license': { prompt:'Oturum açmış olmak ile etkin lisans aynı kanıt mıdır?', options:['Evet, her durumda aynıdır','Hayır, kimlik ve kullanım hakkı ayrı durumlardır','Yalnız dosya uzantısı farklıdır'], answer:1, explanation:'Hesap kimliği ile lisans durumu ayrı kontrol edilir.', hint:'Giriş kartı ve kullanım yetkisi benzetmesini düşün.' },
  'l3-version': { prompt:'Kurs belirli patch sürümüne sabitliyse daha yeni sürüm görünce ne yapılır?', options:['Otomatik yükseltilir','Kurs sürümü korunur; uyumluluk ayrı test edilir','Bütün projeler silinir'], answer:1, explanation:'Yeni sürüm, paket ve proje uyumu doğrulanmadan eğitim tabanı değiştirilmez.', hint:'En yeni olmak ile uyumlu olmak aynı şey mi?' },
  'l3-modules': { prompt:'Yalnız Windows masaüstünde öğrenen öğrenci ne yapmalı?', options:['Bütün platform modüllerini seçmeli','Hedef için gereken en küçük seti seçmeli','Editor kurmamalı'], answer:1, explanation:'Gereksiz modül disk, indirme ve bakım maliyeti üretir; sonradan eklenebilir.', hint:'Hedef ve maliyeti birlikte düşün.' },
  'l3-install': { prompt:'Bir modül “failed” durumundaysa en güvenli ilk yaklaşım nedir?', options:['Proje klasörünü silmek','Hata bilgisini kaydedip disk/ağı doğrulamak','Bilgisayarı zorla kapatmak'], answer:1, explanation:'Belirti kaydedilir, ilgili kaynaklar kontrol edilir ve yalnız başarısız parça yeniden denenir.', hint:'En küçük güvenli düzeltme.' },
  'l3-ide': { prompt:'IDE’nin temel görevi hangisidir?', options:['Sahne ışıklarını çizmek','Kodu düzenlemek, analiz etmek ve debug etmek','Unity lisansı vermek'], answer:1, explanation:'IDE kod çalışma ortamıdır; Unity Editor sahne ve oyun çalışmasını yönetir.', hint:'Yazı masası ile atölyeyi ayır.' },
  'l3-verify': { prompt:'Hangisi kurulumun ölçülebilir kanıtıdır?', options:['“Sanırım tamamlandı” demek','Seçilen Editor sürümünün Installed görünmesi','Masaüstünde rastgele bir kısayol görmek'], answer:1, explanation:'Sürümün Installations alanında açıkça görünmesi doğrulanabilir kanıttır.', hint:'Başka biri aynı sonucu gözleyebilir mi?' },
  'l3-debug': { prompt:'Script dosyası açılıyor ama Unity türleri tanınmıyor. İlk ilgili katman hangisidir?', options:['IDE entegrasyonu/proje dosyaları','Ses mikseri','Proje yedeğinin tarihi'], answer:0, explanation:'Belirti kod editörü bağlantısı ve Unity proje entegrasyonuyla ilgilidir.', hint:'Sorunun görüldüğü en yakın aracı seç.' },
  'l3-game': { prompt:'25 GB bütçede kullanılmayacak üç platform modülünü seçmek ne üretir?', options:['Daha iyi kod bilgisi','Gereksiz indirme ve disk maliyeti','Otomatik mağaza yayını'], answer:1, explanation:'Modül seçimi hedefe dayanır; fazlalık kurulum maliyeti üretir.', hint:'Her ek parça ücretsiz kaynak mı kullanır?' },
};

const kindLabel: Record<LessonStep['kind'], string> = {
  prepare:'GERİ ÇAĞIR', teach:'KAVRAMI KUR', observe:'GÖZLEMLE', practice:'KONTROLLÜ UYGULAMA', simulate:'CANLI SİMÜLASYON', debug:'KANITLA TEŞHİS', lab:'BAĞIMSIZ LABORATUVAR', game:'MİNİ OYUN', test:'SAĞLIK TESTİ', finale:'ETKİNLİK BOMBASI',
};

export function FoundationActivity({ step, locale, completed, onComplete }: { step: LessonStep; locale: Locale; completed: boolean; onComplete: () => void }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [attempts, setAttempts] = useState(0);
  const challenge = challenges[step.id];
  const bullets = localize(step.bullets, locale);
  const allRevealed = revealed.length === bullets.length;
  const correct = selected === challenge?.answer;
  const needsReflection = step.kind === 'lab' || step.kind === 'debug' || step.kind === 'test' || step.kind === 'game';
  const canComplete = allRevealed && correct && (!needsReflection || reflection.trim().length >= 20);
  const progress = useMemo(() => {
    const cardPart = bullets.length ? revealed.length / bullets.length : 1;
    const answerPart = correct ? 1 : 0;
    const reflectionPart = !needsReflection ? 1 : Math.min(1, reflection.trim().length / 20);
    return Math.round(((cardPart + answerPart + reflectionPart) / 3) * 100);
  }, [bullets.length, correct, needsReflection, reflection, revealed.length]);

  if (!challenge) return null;

  const choose = (index: number) => {
    setSelected(index);
    setAttempts((value) => value + 1);
  };

  return (
    <section className={`foundation-activity foundation-${step.kind}`} aria-labelledby={`${step.id}-activity-title`}>
      <header className="foundation-hero">
        <div>
          <p className="section-kicker">{kindLabel[step.kind]} · {step.xp} XP</p>
          <h2 id={`${step.id}-activity-title`}>{localize(step.objective, locale)}</h2>
          <p>{localize(step.description, locale)}</p>
        </div>
        <div className="foundation-progress" aria-label={`Etkinlik ilerlemesi yüzde ${progress}`}><span>{progress}%</span><i><b style={{ width:`${progress}%` }} /></i></div>
      </header>

      <div className="learning-rhythm" aria-label="Öğrenme sırası">
        <span className="active"><b>1</b> Anla</span><i />
        <span className={allRevealed ? 'active' : ''}><b>2</b> Keşfet</span><i />
        <span className={correct ? 'active' : ''}><b>3</b> Uygula</span><i />
        <span className={canComplete ? 'active' : ''}><b>4</b> Kanıtla</span>
      </div>

      <section className="concept-stage">
        <div className="concept-stage-copy">
          <span className="stage-number">01</span>
          <div><p className="section-kicker">ÖNCE KAVRAMI AÇ</p><h3>Üç kısa kart, tek sağlam zihinsel model.</h3><p>Kartları sırayla aç. Her kart, bu adımın başka bir yönünü açıklar; yalnız başlığı görüp soruya atlamak yok.</p></div>
        </div>
        <div className="foundation-concepts">
          {bullets.map((bullet, index) => {
            const open = revealed.includes(index);
            return <button key={bullet} type="button" className={open ? 'concept-reveal open' : 'concept-reveal'} onClick={() => setRevealed((value) => value.includes(index) ? value : [...value, index])} aria-expanded={open}><span>{String(index + 1).padStart(2,'0')}</span><strong>{open ? bullet : 'Kavram kartını aç'}</strong><Icon name={open ? 'check' : 'plus'} /></button>;
          })}
        </div>
      </section>

      <section className={allRevealed ? 'challenge-stage ready' : 'challenge-stage locked'} aria-disabled={!allRevealed}>
        <div className="challenge-heading"><span className="stage-number">02</span><div><p className="section-kicker">ŞİMDİ UYGULA</p><h3>{challenge.prompt}</h3><p>{allRevealed ? 'Seçimini yap; yanlış cevapta nedenini okuyup yeniden deneyebilirsin.' : 'Önce yukarıdaki bütün kavram kartlarını aç.'}</p></div></div>
        <div className="challenge-options">
          {challenge.options.map((option, index) => <button key={option} type="button" disabled={!allRevealed || correct} className={selected === index ? (index === challenge.answer ? 'correct' : 'incorrect') : correct && index === challenge.answer ? 'correct' : ''} onClick={() => choose(index)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span>{selected === index && <Icon name={index === challenge.answer ? 'check' : 'close'} />}</button>)}
        </div>
        {selected !== null && <div className={correct ? 'foundation-feedback correct' : 'foundation-feedback incorrect'} role="status"><Icon name={correct ? 'check' : 'spark'} /><div><strong>{correct ? 'Kanıt doğru.' : 'Henüz değil; seçim hakkın devam ediyor.'}</strong><p>{correct ? challenge.explanation : challenge.hint}</p></div></div>}
      </section>

      {needsReflection && correct && <section className="reflection-stage"><span className="stage-number">03</span><div><p className="section-kicker">KENDİ CÜMLENLE KANITLA</p><h3>Bu kararı neden verdiğini kısa ve açık biçimde yaz.</h3><p>En az 20 karakter. Teknik kelime kullanabilirsin; önemli olan ezber cümlesi değil, neden–sonuç bağı.</p><textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Örneğin: Bu seçimi yaptım çünkü…" maxLength={320} /><small>{reflection.trim().length} / 20 gerekli</small></div></section>}

      <footer className="foundation-complete">
        <div><Icon name={completed ? 'check' : canComplete ? 'spark' : 'lock'} /><span><strong>{completed ? 'Bu adımı tamamladın.' : canComplete ? 'Öğrenme kanıtın hazır.' : 'Tamamlama için keşif ve uygulama gerekli.'}</strong><small>{attempts > 1 ? `${attempts} deneme · yanlışlar XP silmedi` : localize(step.transition, locale)}</small></span></div>
        <button type="button" className="button button-primary" disabled={!canComplete || completed} onClick={onComplete}>{completed ? 'Tamamlandı' : `Adımı tamamla · +${step.xp} XP`}<Icon name={completed ? 'check' : 'arrow-right'} /></button>
      </footer>
    </section>
  );
}
