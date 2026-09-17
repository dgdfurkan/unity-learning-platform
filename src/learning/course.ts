import type { Locale } from '../domain/models';

export type LessonStepKind = 'prepare' | 'teach' | 'observe' | 'practice' | 'simulate' | 'debug' | 'lab' | 'game' | 'test' | 'finale';
export type LessonActivityKind = 'reveal' | 'classify' | 'order' | 'connect' | 'decide' | 'simulate' | 'match' | 'checklist' | 'debug' | 'lab' | 'game' | 'finale' | 'brief' | 'hotspot' | 'sequence' | 'fill' | 'inspector' | 'predict' | 'spot' | 'sort' | 'console' | 'code' | 'mastery';

export interface LessonStep {
  id: string;
  kind: LessonStepKind;
  duration: number;
  xp: number;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  objective: Record<Locale, string>;
  bullets: Record<Locale, string[]>;
  transition: Record<Locale, string>;
  activity: LessonActivityKind;
}

export interface Lesson {
  id: string;
  order: number;
  module: number;
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
  badge: Record<Locale, { name: string; description: string }>;
  status: 'published' | 'preparing';
}

export interface CoursePlanItem {
  order: number;
  module: number;
  duration: number;
  title: Record<Locale, string>;
  outcome?: Record<Locale, string>;
  artifact?: Record<Locale, string>;
  status: 'published' | 'preparing';
}

const text = (tr: string, en = tr): Record<Locale, string> => ({ tr, en });
const list = (tr: string[], en = tr): Record<Locale, string[]> => ({ tr, en });

export const localize = <T>(value: Record<Locale, T>, locale: Locale): T => value[locale];

type StepInput = [string, LessonStepKind, LessonActivityKind, number, number, string, string, string, string[], string];
const step = ([id, kind, activity, duration, xp, title, description, objective, bullets, transition]: StepInput): LessonStep => ({
  id, kind, activity, duration, xp, title: text(title), description: text(description), objective: text(objective), bullets: list(bullets), transition: text(transition),
});

const lesson1Steps: LessonStep[] = [
  step(['l1-welcome','prepare','reveal',4,20,'Bugün kod yazmadan kodu anlayacağız','Kod, oyunu düşünmenin başlangıcı değil; açıkça düşündüğümüz davranışı bilgisayara aktarma aracıdır. Önce görünmeyen sistemi kuracağız.','Dersin ritmini ve hata yapmanın öğrenmedeki yerini açıklar.',['Gör → tahmin et → dene → açıkla','Hata, başarısızlık değil yeni kanıttır','Bu derste C# sözdizimi ezberlenmez'],'Önce ekrandaki sonucu izleyecek, sonra görünmeyen nedeni arayacağız.']),
  step(['l1-observe','observe','classify',6,30,'Ekrandaki sonucun izini sür','Sağ oka basılması, karakterin hareketi, enerjinin azalması ve sesin çalması aynı anda görünse de aynı görev değildir.','Görünür sonuç ile onu oluşturan nedenleri ayırır.',['Tuş oyuncudan gelen girdidir','Enerji oyunun sakladığı durumdur','Hareket, görüntü ve ses oyuncuya ulaşan sonuçlardır'],'Bu olayları her oyunda kullanabileceğimiz dört halkaya dönüştürelim.']),
  step(['l1-four-link','teach','order',8,35,'Dört halkalı oyun zinciri','Oyuncu bir şey yapar; oyun kuralı mevcut bilgiyi kontrol eder; durum değişir veya korunur; sonuç oyuncuya gösterilir.','Input → kural → durum → output sırasını iki farklı senaryoda kurar.',['Input niyeti taşır','Kural karar verir','Durum hafızadır','Output kararı görünür kılar'],'İlk halka olan input’u, sonuçtan özellikle ayıracağız.']),
  step(['l1-input','simulate','connect',6,35,'Input niyettir, sonuç değildir','Aynı Space tuşu bir oyunda zıplama, başka bir oyunda konuşmayı ilerletme olabilir. Tuşun anlamını oyun kuralı verir.','Fiziksel kontrol ile oyundaki niyeti ayırır.',['Klavye, dokunma ve gamepad farklı sinyaller üretir','Farklı cihazlar aynı “Zıpla” niyetine bağlanabilir','Cihazı doğrudan konuma bağlamak kuralı atlar'],'Niyet geldi; fakat oyun bu isteği her zaman kabul etmek zorunda değil.']),
  step(['l1-rule','practice','decide',7,35,'Kural hangi durumda ne olacağını seçer','Zıpla girdisi tek başına yeterli değildir. Karakter yerdeyse zıplar; havadaysa kural isteği reddedebilir.','Girdi ile mevcut durumu birlikte değerlendirerek sonuç seçer.',['Kural yalnızca ceza koymaz','Bir input her zaman durum değişikliği üretmez','Kararın nedenini mevcut durum açıklar'],'Kuralın baktığı bilgileri oyunun hafızası olarak inceleyelim.']),
  step(['l1-state','simulate','simulate',8,40,'Oyunun hafızası: durum','Can, anahtar, kapı ve konum bilgileri oyunun o anda bildiği değişebilir gerçeklerdir. Görünmeyen sayaçlar da durum olabilir.','Bir olaydan önce hangi durumların değişeceğini tahmin eder.',['Durum yalnızca sayı değildir','Görsel ile veri aynı şey değildir','Her değişimin bir olayı ve önceki değeri vardır'],'Oyun içeride ne olduğunu biliyor; şimdi bunu oyuncuya nasıl anlattığına bakalım.']),
  step(['l1-output','observe','classify',6,30,'Çıktı ve geri bildirim','Oyuncu verilen kararın sonucunu algılamalıdır. Hareket, ışık, ses, titreşim veya metin bilgi taşıyan output kanallarıdır.','Bilgi taşıyan geri bildirim ile yalnızca dekoru ayırır.',['Daha çok efekt her zaman daha iyi değildir','Tek kanala bağımlı bilgi erişilebilir olmayabilir','Output, oyuncuya “ne oldu?” sorusunun cevabını verir'],'Bilgisayarın neden kesin komut istediğini deneyelim.']),
  step(['l1-precision','practice','order',8,40,'Bilgisayar tahmin etmez','“Biraz ilerle” ya da “sandviç yap” gibi talimatlar hedef, sıra ve ölçü belirtmez. Bilgisayar niyeti tamamlamaz.','Belirsiz bir talimatı sonlu ve uygulanabilir adımlara dönüştürür.',['Sıra sonucu değiştirebilir','Hedef ve miktar açık olmalıdır','Eksik bilgi varsa sistem güvenle durmalıdır'],'Kesin komutlar kodda saklanır; fakat kod ile kullandığımız araçlar aynı şey değildir.']),
  step(['l1-roles','teach','match',8,40,'Oyun, motor, Editor, kod ve build','Editor üretim masasıdır; motor ortak sistemleri sağlar; kod kuralları tarif eder; proje kaynakları tutar; build oyuncunun çalıştırdığı pakettir.','Beş kavramı isimleriyle değil sorumluluklarıyla ayırır.',['Editor ile çalışan oyun aynı şey değildir','Motor tek başına oyun değildir','Build, geliştirme masasının oyuncuya teslim edilen sonucudur'],'Bu parçalar çalışırken oyun bir kez karar verip durmaz.']),
  step(['l1-loop','simulate','simulate',6,35,'Oyun neden sürekli güncellenir?','Oyun yeni girdileri tekrar tekrar okur, kuralı uygular, durumu günceller ve sonucu yeniden gösterir. Bu derste frame ya da Update ayrıntısına girmiyoruz.','Üç kavramsal oyun turunda değişen durumu izler.',['Önceki durum sonraki turun başlangıcıdır','Her tur aynı input gelmeyebilir','Boş input da durumun korunmasıyla sonuçlanabilir'],'Yanlış sonuçta yalnız son görüntüye değil, bütün hatta bakalım.']),
  step(['l1-debug','debug','debug',7,45,'Yanlış sonuç nerede doğdu?','Anahtar alınmış olmasına rağmen kapı açılmıyorsa ilk görünen belirtiyi değil, hattaki ilk beklenmeyen kanıtı ararız.','Input–kural–durum–output hattında kök nedeni bulur.',['Girdi gelmiş mi?','Durum beklenen değerde mi?','Kural doğru değeri mi kontrol ediyor?','Output doğru kararı mı gösteriyor?'],'Şimdi sana ait bir sistem tasarlayıp bütün halkaları kendin kuracaksın.']),
  step(['l1-lab','lab','lab',8,55,'Kodsuz sistem laboratuvarı','Yakıtı varken hızlanan, yakıt bittiğinde güvenli uyarı veren uzay gemisi sistemini sözde kod parçalarıyla kur.','Yeni bir senaryoda dört halkayı ve iki karar dalını bağımsız tasarlar.',['Bu bir C# editörü değildir','Kural mevcut yakıt durumunu kullanmalıdır','Output hem başarıyı hem reddedilen isteği anlatmalıdır'],'Tasarladığın sistemi kısa bir oynanabilir görevde yöneteceksin.']),
  step(['l1-game','game','game',7,45,'Komut Merkezi mini oyunu','Üç kapsülün yakıt, kapı ve gönderim durumlarını okuyup güvenli komut zincirleri kur. Hız değil, kanıta dayalı doğruluk ölçülür.','Dört halkayı yeni görevlerde baskı altında uygular.',['Yakıt kontrol edilmeden kapsül gönderilmez','Yanlışta tur sıfırlanmaz; kırık halka gösterilir','Klavye ve dokunma aynı görevleri yapabilir'],'Finalde kavramları karışık hâlde bağımsız olarak tanıyacaksın.']),
  step(['l1-finale','finale','finale',9,135,'Etkinlik Bombası','On iki karma turda sıralama, sınıflandırma, hata ayıklama ve yeni oyuna transfer görevlerini tamamla.','Dersin yedi hedefinde en az yüzde 70 ilk deneme başarısı gösterir.',['Yanlış cevap XP silmez','İlk seçim ustalık skoruna girer','Eksik kalan kavramlar için hedefli tekrar açılır'],'Bir sistemi zihninde kurabiliyorsun; sırada dosyaların bilgisayarda nasıl yaşadığı var.']),
];

const lesson2Steps: LessonStep[] = [
  step(['l2-recall','prepare','reveal',5,20,'Sistem zincirinden dosya zincirine','Çalışan oyunun geçici durumu ile bilgisayar kapalıyken diskte kalan dosya aynı şey değildir. Kod ve proje bilgileri dosyalarda saklanır.','Ders 1’deki sistem modelini kalıcı saklamaya aktarır.',['Çalışan durum geçici olabilir','Dosya kalıcı saklama birimidir','Araç dosyayı açar; build çalışan sonucu sunar'],'Saklama dünyasının iki temel nesnesini ayıralım.']),
  step(['l2-file-folder','teach','classify',6,30,'Dosya mı klasör mü?','Dosyanın içeriği ve adı vardır; klasör dosyaları ve başka klasörleri düzenler. Simgeye değil göreve bakacağız.','Dosya, klasör ve alt klasörü birbirinden ayırır.',['Movement.cs bir dosyadır','Scripts bir klasördür','“Emin değilim” seçeneği ipucu açar; cezalandırmaz'],'Dosyanın adındaki son parça tür hakkında önemli bir ipucu verir.']),
  step(['l2-name-extension','simulate','classify',7,35,'Ad ve uzantı anatomisi','Son noktanın ardından gelen bölüm uzantıdır. `PlayerMove.cs.txt` gibi çift uzantılar, uzantılar gizliyken gözden kaçabilir.','Gövde adı, nokta ve uzantıyı ayırır; sahte çift uzantıyı bulur.',['.cs C# kaynak dosyasını işaret eder','.unity bir sahne dosyasını işaret eder','Adı değiştirmek dosya biçimini dönüştürmez'],'Dosyanın bilgisayardaki adresini okuyalım.']),
  step(['l2-path','practice','order',7,35,'Dosyanın adresi: yol','Yol, kökten başlayıp klasörler üzerinden dosyaya ulaşan adrestir. Aynı adlı iki dosya farklı yollarda bulunabilir.','Yol parçalarını soldan sağa okur ve doğru sıraya koyar.',['Her klasör bir sonraki parçanın ebeveynidir','Dosya adı tek başına benzersiz adres değildir','Ayıraç işletim sistemine göre değişebilir'],'Unity’nin açtığı adres tek dosyayı değil, bütün proje kökünü gösterir.']),
  step(['l2-root','observe','match',8,40,'Unity projesi tek dosya değildir','Bir Unity projesi Assets, Packages ve ProjectSettings gibi birlikte çalışan temel parçalar taşır. Library yeniden üretilebilir bir cache’tir; bu derste silinmez.','Proje ağacındaki temel klasörleri görevleriyle eşleştirir.',['Assets içerik ve script’leri taşır','Packages bağımlılıkları tanımlar','ProjectSettings proje davranışını saklar'],'Hub’a hangi klasörü göstermemiz gerektiğini kesinleştirelim.']),
  step(['l2-assets-boundary','practice','decide',6,35,'Proje kökü ve Assets sınırı','Hub’da Open project seçimi, Assets klasörünü değil; Assets, Packages ve ProjectSettings öğelerinin birlikte bulunduğu üst klasörü ister.','Üç aday arasından proje kökünü kanıtla seçer.',['MyGame/ doğru kök olabilir','MyGame/Assets/ kök değildir','Kanıt, kardeş temel klasörlerin bulunmasıdır'],'Doğru klasör ZIP içindeyse önce çalışma alanına hazırlanmalıdır.']),
  step(['l2-zip','simulate','order',7,35,'ZIP arşivi ile çalışma klasörü','Arşiv teslim ve saklama paketidir; doğrudan çalışma alanı değildir. Tamamını güvenli hedefe çıkartıp kökü yeniden doğrularız.','Arşivi güvenli biçimde çıkartma adımlarını sıralar.',['ZIP’i seç','Hedef klasörü belirle','Tamamını çıkart','Proje kökünü doğrula','Orijinal arşivi yedek olarak koru'],'Çıkartılan projenin nereye konacağı da önemlidir.']),
  step(['l2-safe-location','practice','decide',7,40,'Güvenli proje konumu seçmek','Kısa, anlaşılır, yazma izni bulunan ve kontrolsüz senkronizasyon riski taşımayan bir çalışma yolu seçilir.','Proje konumlarını izin, senkronizasyon, açıklık ve uzunluk açısından değerlendirir.',['Downloads geçici ve dağınık olabilir','Sistem klasörleri izin sorunu çıkarabilir','Kısa ASCII adlar başlangıç taşınabilirliğini artırır'],'Konum kadar projenin adı da ileride hata ayıklamayı etkiler.']),
  step(['l2-naming','practice','classify',6,30,'Proje ve klasör isimlendirme','`FirstGame` niyeti açıklar; `final_son_son2` sürüm karmaşası üretir. Tarih yedek adında anlamlıdır, aktif proje adında sürekli eklenmez.','Belirsiz proje adlarını açık ve tutarlı adlara dönüştürür.',['Tam kelimeler kullan','Geçici adları kalıcılaştırma','Yedeğin tarihi ile projenin kimliğini ayır'],'İyi adlandırılmış proje de tek kopyaysa güvende değildir.']),
  step(['l2-backup','teach','decide',8,40,'Kopya, senkronizasyon ve yedek','Aynı diskteki iki klasör donanım arızasına karşı korumaz. Senkronizasyon silmeyi de yayabilir. Bağımsız yedek ayrı risk alanında yaşar.','Çalışma kopyası, senkronizasyon ve gerçek yedeği ayırır.',['3 kopya','2 farklı ortam','1 kopya ayrı konumda','Bu bir zihinsel modeldir; tek sihirli ürün değildir'],'Kayıp görünen projede önce kanıt toplayacağız.']),
  step(['l2-diagnose','debug','debug',7,45,'Projem kayboldu mu?','Hub projeyi açmıyorsa rastgele klasör taşımak yerine arşiv, çıkartma, kök ve erişim kanıtlarını sırayla kontrol ederiz.','Yanlış yol, ZIP, iç içe klasör ve eksik kök sorunlarını teşhis eder.',['Önce yolun arşiv içinde olup olmadığına bak','Assets’in kardeşlerini ara','İlk yanlış adımı kanıt cümlesiyle açıkla'],'Baştan güvenli bir çalışma alanı tasarlayacaksın.']),
  step(['l2-lab','lab','lab',7,55,'Güvenli çalışma alanı laboratuvarı','Sanal dosya ağacında proje kökü, bağımsız yedek ve proje dışı notlar için güvenli mimari kur. Platform gerçek dosyalarını değiştirmez.','Gereksinimlere uygun klasör ve yedek mimarisi tasarlar.',['Proje ZIP içinde kalmaz','Assets kök olarak seçilmez','Yedek çalışma klasörünün aynısı değildir','Uzantılar görünür tutulur'],'Hazırladığın yapıyı kurtarma görevinde kullan.']),
  step(['l2-game','game','game',7,45,'Dosya Kurtarma Operasyonu','Üç bozuk proje paketinde arşivi tanı, doğru kökü seç ve bağımsız yedek hedefini belirle. Hatalı seçim dosya silmez.','Dosya, yol, kök ve yedek kararlarını oynanabilir bir haritada uygular.',['Haritayı incele','İlk kırık bağı bul','En küçük güvenli düzeltmeyi seç','Düzeltme sonrası yeniden doğrula'],'Finalde proje yapısını ve güvenli çalışma kararlarını birlikte kullanacaksın.']),
  step(['l2-finale','finale','finale',11,155,'Etkinlik Bombası','On iki karma turda dosya/klasör, uzantı, yol, proje kökü, ZIP, konum, adlandırma ve yedek kararlarını kanıtla.','Sekiz öğrenme hedefinde en az yüzde 70 ilk deneme başarısı gösterir.',['Tüm turlar tamamlanır','Yanlışlar hedefli açıklama açar','Başarılı final Ders 3’ün kilidini açar'],'Çalışma alanın hazır; şimdi Unity Hub ve Editor ortamını kuracağız.']),
];

const lesson3Steps: LessonStep[] = [
  step(['l3-recall','prepare','reveal',5,20,'Proje kökü ve araç rolleri','Hub’da açılan şey MyGame proje köküdür; Assets tek başına proje değildir. Oyuncuya Editor değil, build gönderilir.','Önceki iki dersten proje kökü ve araç rolünü geri çağırır.',['Kökte Assets, Packages ve ProjectSettings birlikte bulunur','Hub projeleri ve Editor kurulumlarını yönetir','Build oyuncunun çalıştırdığı sonuçtur'],'Geliştirme zincirinin tüm görevlerini yerine oturtalım.']),
  step(['l3-toolchain','teach','match',8,35,'Geliştirme zincirini kur','Hub yönetir; Editor üretir ve önizler; IDE kodu düzenler; modül hedef platform desteği verir; lisans kullanım hakkını etkinleştirir; proje dosyaları taşır.','Altı aracı görevleriyle eşleştirir.',['Hub ile Editor aynı uygulama değildir','IDE Unity sahnesini yönetmez','Modül, belirli build hedefi için ek destektir'],'Kurucuyu indirmeden önce bilgisayarın hazır olduğunu kanıtlayalım.']),
  step(['l3-preflight','practice','checklist',8,40,'Kurulum öncesi sağlık kontrolü','Sabit bir GB sayısı ezberlemek yerine sistem gereksinimini, mimariyi, güncel kurulum boyutunu, izni ve bağlantıyı kanıtla kontrol ederiz.','Kurulum ön koşullarını eksiksiz değerlendirir.',['İşletim sistemi ve CPU mimarisi','Güncel boş disk alanı','Yazma/yönetici izni','Kararlı bağlantı','Hedef platform ve yedekli proje konumu'],'Hazır bilgisayarda sıradaki risk yanlış kaynaktan yanlış kurucu indirmektir.']),
  step(['l3-source','practice','decide',6,35,'Resmî kaynağı ve doğru kurucuyu seç','Kurulum dosyası yalnız adına bakılarak değil, kaynak alan adı ve işletim sistemiyle doğrulanır. Üçüncü taraf indirme siteleri ana yol değildir.','Resmî Unity kaynağını ve doğru işletim sistemi dalını seçer.',['Alan adını kontrol et','Paketin işletim sistemini kontrol et','Ders parola veya dosya çalıştırma istemez'],'Doğru kurucuyla Hub’ın kendisini kuralım.']),
  step(['l3-hub','observe','order',8,40,'Unity Hub kurulumu ve ilk açılış','Resmî kurucuyu aç, hedefi ve koşulları doğrula, kurulumu tamamla, Hub’ı aç ve Projects ile Installations alanlarını gör.','Hub kurulum sırasını ve başarı kanıtlarını açıklar.',['İşletim sistemine uygun resmî akış izlenir','Projects ve Installations görünmelidir','Hub açıldı diye Editor kurulmuş sayılmaz'],'Hub hazır; hesap ve lisans durumunu ayrı ayrı görelim.']),
  step(['l3-account-license','simulate','decide',7,40,'Hesap ve lisans doğrulama','Oturum açmak kullanıcı kimliğini, lisans ise kullanım hakkını temsil eder. Ders parola veya doğrulama kodu toplamaz.','Oturum ve lisans durumunu ayırarak doğru sonraki adımı seçer.',['Oturum yok','Oturum var ve lisans etkin','Lisans görünmüyor','Çevrimdışı/kurumsal senaryo'],'Kullanım hakkı hazır; sınıfın aynı Editor sürümünde olmasını sağlayalım.']),
  step(['l3-version','practice','decide',8,45,'Editor sürümünü bilinçli seç','Eğitim tam bir Unity 6 patch sürümüne sabitlenir. Daha yeni sürüm görünmesi otomatik yükseltme nedeni değildir; proje, paket ve ekip uyumu değerlendirilir.','Verilen sürüm politikasına göre doğru Editor sürümünü seçer.',['Major aile tek başına yeterli değildir','Kursun sabitlediği patch esas alınır','Eski proje ayrı test kopyasında yükseltilir'],'Editor tek başına her hedef platform için build alamaz.']),
  step(['l3-modules','practice','simulate',9,45,'Gerekli modülleri seç','Bütün modülleri seçmek başarı değildir. Hedef platformun gerektirdiği en küçük set; disk, indirme ve bakım maliyetini kontrol eder.','Üç hedef için doğru modül sepetini bütçeyi aşmadan kurar.',['Masaüstü öğrenme hedefi','Android için Build Support ve ilgili araçlar','Web paylaşımı için Web Build Support','Gerçek boyut için Hub’daki güncel değer esas alınır'],'Seçim hazır; kurulum durumlarını doğru okuyalım.']),
  step(['l3-install','observe','decide',7,35,'İndirme, kurulum ve durum okuma','Downloading, installing, queued, failed ve complete aynı durum değildir. Her birinde doğru güvenli eylem farklıdır.','Kurulum durumunu okuyup bekleme, alan açma veya yeniden deneme kararı verir.',['Hata mesajını kaydet','Disk ve bağlantıyı doğrula','Yalnız başarısız modülü yeniden dene','Proje klasörlerini silmek çözüm değildir'],'Editor kurulurken kod aracını ve bağlantısını hazırlayalım.']),
  step(['l3-ide','practice','simulate',9,45,'Kod editörü/IDE ve Unity bağlantısı','IDE kod yazma, tamamlama, analiz ve debug sağlar; Unity Editor sahneyi ve oyun çalışmasını yönetir. Kurum tek desteklenen ana editörü seçebilir.','Kod editörünü Unity External Tools ayarına doğru bağlar.',['Visual Studio, Rider veya uygun C# eklentili VS Code','External Script Editor seçimi','Unity türleri tanınmıyorsa entegrasyon ve proje dosyalarını kontrol et'],'Kurulumun sağlıklı olduğunu beş kanıtla doğrulayalım.']),
  step(['l3-verify','test','checklist',7,45,'Beş maddelik kurulum doğrulaması','Kurulum “sanırım oldu” ile değil, beş ölçülebilir kanıtla tamamlanır. İlk proje ise bilinçli olarak Ders 4’e bırakılır.','Geliştirme ortamını ölçülebilir kanıtlarla doğrular.',['Hub açılıyor','Sabitlenen Editor Installed görünüyor','Gerekli modüller listeleniyor','Lisans etkin','External Tools’ta IDE seçilebiliyor'],'Eksik kanıtta rastgele yeniden kurmak yerine kurulum kliniğini kullanalım.']),
  step(['l3-debug','debug','debug',8,55,'Kurulum kliniği','Belirtiyi ilgili katmana indir: Hub, Editor, modül, lisans, IDE, işletim sistemi, disk veya ağ. Sonra en küçük güvenli düzeltmeyi uygula.','Sekiz kurulum vakasında kök katmanı ve doğrulama adımını seçer.',['Belirtiyi yaz','Kapsamı belirle','Görünen hata veya durumu kaydet','İlgili katmanı seç','Düzeltme sonrası aynı kanıtı yeniden ölç'],'Sınırlı depolamayla doğru atölyeyi kurmayı dene.']),
  step(['l3-game','game','game',7,45,'Kurulum Mimarı mini oyunu','Üç öğrenci profili için doğru Editor, modül, IDE ve lisans akışını disk bütçesini aşmadan kur. Fazladan seçim geri alınabilir.','Kurulum kararlarını hedef, bütçe ve platform kısıtlarıyla birlikte uygular.',['Sürümü sabitle','Hedef modülleri seç','IDE’yi bağla','Lisansı doğrula','Sağlık testini tamamla'],'Finalde araç görevleri, sürüm, modül ve teşhisi birlikte kullan.']),
  step(['l3-finale','finale','finale',11,165,'Etkinlik Bombası','On iki karma turda araç rolleri, ön kontrol, güvenli kaynak, sürüm, modül, lisans, IDE ve hata teşhisini bağımsız uygula.','Dokuz hedefte en az yüzde 70 ilk deneme başarısı ve sağlık kontrolü öz değerlendirmesi gösterir.',['Tüm turlar tamamlanır','İlk deneme ustalık skorunu belirler','Eksik hedefler doğrudan ilgili adıma bağlanır'],'Atölyen hazır; Ders 4’te doğru şablon ve konumla ilk Unity projesini oluşturacaksın.']),
];

export const lessons: Lesson[] = [
  {
    id:'lesson-001-game-system-mental-model', order:1, module:1, duration:98, status:'published', fileName:'', starterCode:'',
    title:text('Oyun Bilgisayarda Nasıl Çalışır? Komut, Kural, Durum ve Görüntü'),
    summary:text('Bir oyunda input’tan görünür sonuca kadar gerçekleşen zinciri anlayıp kod yazmadan tasarlayacaksın.'),
    taskTitle:text('Kodsuz bir oyun sistemi tasarla.'), taskBody:text('Input, kural, durum ve output halkalarını yeni bir oyun senaryosunda kur.'),
    successMessage:text('Sistemin dört halkasını kanıtla kurabiliyorsun.'), concepts:['input','kural','durum','output','Editor','build'], steps:lesson1Steps,
    badge:{tr:{name:'Sistem Kaşifi',description:'Input–kural–durum–çıktı zincirini kurdun.'},en:{name:'Sistem Kaşifi',description:'Input–kural–durum–çıktı zincirini kurdun.'}},
  },
  {
    id:'lesson-002-files-folders-projects', order:2, module:1, duration:99, status:'published', fileName:'', starterCode:'',
    title:text('Dosya, Klasör, Uzantı ve Proje: Geliştiricinin Çalışma Masası'),
    summary:text('Dosyaları, yolları, proje kökünü, ZIP arşivini ve güvenli yedeği sıfırdan anlayıp sanal bir çalışma alanı kuracaksın.'),
    taskTitle:text('Güvenli Unity çalışma alanı kur.'), taskBody:text('Doğru proje kökü, çalışma klasörü ve bağımsız yedek yapısını tasarla.'),
    successMessage:text('Projenin bilgisayarda nerede ve nasıl güvenle yaşadığını açıklayabiliyorsun.'), concepts:['dosya','klasör','uzantı','yol','proje kökü','ZIP','yedek'], steps:lesson2Steps,
    badge:{tr:{name:'Dijital Düzen Ustası',description:'Dosya ve proje düzenini güvenli kurdun.'},en:{name:'Dijital Düzen Ustası',description:'Dosya ve proje düzenini güvenli kurdun.'}},
  },
  {
    id:'lesson-003-unity-environment-setup', order:3, module:1, duration:108, status:'published', fileName:'', starterCode:'',
    title:text('Unity Hub, Editor ve Kod Editörü Kurulumu'),
    summary:text('Hub, Editor, IDE, lisans ve platform modüllerinin görevlerini ayırıp doğrulanmış bir geliştirme ortamı planlayacaksın.'),
    taskTitle:text('Doğrulanmış geliştirme ortamını kur.'), taskBody:text('Sürümü sabitle, yalnız gerekli modülleri seç, IDE bağlantısını ve beş sağlık kanıtını tamamla.'),
    successMessage:text('Atölyenin her parçasını görevi ve kanıtıyla doğrulayabiliyorsun.'), concepts:['Hub','Editor','IDE','modül','lisans','sürüm','kurulum'], steps:lesson3Steps,
    badge:{tr:{name:'Atölye Mimarı',description:'Unity geliştirme zincirini doğruladın.'},en:{name:'Atölye Mimarı',description:'Unity geliştirme zincirini doğruladın.'}},
  },
];

const catalogTitles = `
Oyun Bilgisayarda Nasıl Çalışır? Komut, Kural, Durum ve Görüntü
Dosya, Klasör, Uzantı ve Proje: Geliştiricinin Çalışma Masası
Unity Hub, Editor ve Kod Editörü Kurulumu
İlk Projeyi Doğru Şablonla Oluşturmak
Unity Editor Haritası: Scene, Game, Hierarchy, Inspector, Project ve Console
GameObject, Component ve Transform ile Kodsuz İlk Sahne
İlk Script Dosyası: Oluştur, Adlandır, Aç ve Component Olarak Bağla
C# Kodunun Anatomisi: using, class, :, { }, ; ve Yorumlar
Start ve İlk Debug.Log: Unity Kodu Ne Zaman Çalıştırır?
Console'u Okumak: Log, Warning, Error ve Stack Trace
İlk Hatalar: Büyük–Küçük Harf, Parantez, Noktalı Virgül ve Dosya Adı
İlk Davranış Laboratuvarı: Açılışta Kendini Tanıtan Nesne
Değişken Nedir? Ad, Tür, Değer ve Bellek Kutusu
Temel Veri Türleri: int, float, bool ve string
Bildirim, İlk Değer, Atama ve const
İsimlendirme ve Okunabilirlik: camelCase, Anahtar Kelimeler ve Case Sensitivity
Aritmetik Operatörler ve İşlem Önceliği
Karşılaştırma ve Mantık Operatörleriyle Canlı Oyuncu Durumu
if, else if, else: Oyuna Karar Verdirme
Birleşik Koşullar, Guard Clause ve switch
Metot Nedir? Adlandırılmış Bir İş Oluşturmak
Parametre, Argüman ve Dönüş Değeri
Field, Yerel Değişken, Scope ve SerializeField
Unity Yaşam Döngüsü: Awake'tan OnDestroy'a Doğru Zamanı Seçmek
for Döngüsü: Başlangıç, Koşul, Değişim ve Tur
while, do while, break ve continue
Diziler: Sabit Uzunluk, Index ve Sınırlar
List<T>: Büyüyen ve Küçülen Veri Grubu
foreach, Arama, Filtreleme ve Toplama
Dictionary<TKey,TValue> ve Veri Laboratuvarı
class, Object ve Instance: Şablondan Ayrı Nesnelere
Constructor ve Unity Nesne Yaşamı: new Nerede Kullanılır?
Encapsulation: private, public ve Property ile Kural Korumak
Value Type, Reference Type ve null
Composition ve Inheritance: Unity'de Davranışı Nasıl Bölmeliyiz?
Interface ve Polymorphism ile Hasar Alabilen Dünya
enum: Sınırlı Durumları Güvenli Adlarla Modellemek
struct ve Unity'nin Değer Türleri: Vector2, Vector3, Color
static: Ortak Üyeler, Yardımcı Sınıflar ve Global Durum Riski
Namespace, Assembly ve using: Kod Nereden Geliyor?
Generic Türler: T Ne Demektir?
Lambda ve LINQ'a Kontrollü Giriş
Koordinat Sistemi ve Vektör: X, Y, Z ile Yönü Okumak
Transform: Position, Rotation, Scale; Local ve World Space
Vektör İşlemleri: Yön, Mesafe, Magnitude ve Normalize
Frame, Zaman ve deltaTime: Bilgisayardan Bağımsız Hareket
Input System Temeli: Action, Action Map, Binding ve PlayerInput
Klavye, Gamepad ve Dokunmatik Kontrol Parkuru
Rigidbody: Kütle, Yerçekimi, Kuvvet ve Hız
Collider, Physics Material, Layer ve Çarpışma Matrisi
Collision ve Trigger Callback'leri
Raycast, SphereCast ve LayerMask ile Dünyayı Sorgulamak
CharacterController mı Rigidbody mi? Zemin ve Hareket Kararı
Fizik Hata Ayıklama ve Hedefe Ulaş Mini Oyunu
Asset Pipeline: Import Ayarları, .meta, GUID, Package Manager ve Lisans
Prefab: Asset, Instance, Override, Variant ve Nested Prefab
Instantiate, Destroy, Spawn Noktası ve Nesne Ömrü
Scene Management: Geçiş, Additive Yükleme ve Kalıcı Nesneler
Kamera Dili ve Cinemachine: Takip, Kadraj, Sınır ve Blend
Çok Sahneli Arena: Prefab, Spawn ve Kamera Boss Görevi
Unity UI Haritası: uGUI, UI Toolkit, Canvas ve Render Mode
Responsive HUD: Anchor, Pivot, Layout Group ve Text
Menü, Buton, Klavye/Gamepad Odağı ve Erişilebilirlik
Oyun Sesi: AudioClip, AudioSource, Listener ve Audio Mixer
Animation: Clip, Animator Controller, Parametre ve Transition
Game Feel: Particle, Trail, Tween, Kamera Sarsıntısı ve Ölçülü Geri Bildirim
Sprite Import, Pixels Per Unit, Sorting Layer ve Sprite Atlas
Grid ve Tilemap ile 2D Seviye Kurmak
Rigidbody2D ile Hareket, Zıplama ve Zemin Kontrolü
2D Animasyon, Yön Çevirme, Coyote Time ve Input Buffer
2D Düşman, Hasar, Pickup ve Checkpoint Sistemi
2D Platformer Dikey Dilimi: Başlangıçtan Sonuç Ekranına
URP'de Material, Texture, Shader Kavramı ve Aydınlatma
3D Greybox ve Seviye Okunabilirliği
3D Karakter Kontrolü: Yürüme, Dönüş, Eğim ve Zıplama
3D Kamera ve Raycast Etkileşimi
NavMesh Düşman Yapay Zekâsı, Blend Tree ve Root Motion Kararı
3D Macera Dikey Dilimi: Işık, Yapay Zekâ ve Amaç Döngüsü
Delegate, Action, Event ve UnityEvent: Sistemleri Gevşek Bağlamak
ScriptableObject ile Veri Tasarımı ve Runtime Tuzakları
State Machine ile Oyun ve Karakter Durumları
GameManager, Service ve Singleton: Yaşam Süresi ile Bağımlılık Kararı
Kayıt Temeli: PlayerPrefs, JSON ve Kalıcı Dosya Yolu
Dayanıklı Kayıt: Sürümleme, Migration, Doğrulama ve Bozuk Veri Kurtarma
Coroutine: Frame'lere Yayılan İş ve Bekleme Akışı
async/await: Task, Ana Thread ve İptal Sorumluluğu
Asenkron Sahne Yükleme ve Gerçek İlerleme Ekranı
Addressables Temeli: Adres, Grup, Handle ve Yaşam Süresi
Profiler: CPU, GPU, Memory, Frame Debugger ve Ölçüm Disiplini
GC Allocation, Object Pooling, Bütçe ve Optimizasyon Boss Görevi
Git Temeli: Repository, Commit, .gitignore ve Unity .meta Dosyaları
Branch, Merge, Conflict, SourceTree ve Uzak Depo Akışı
Test Runner, PlayMode/EditMode Testleri, Debugger ve Refactoring
Build Ayarları, Development Build, Log ve Gerçek Cihaz Testi
Erişilebilirlik, Lokalizasyon, Ayarlar ve Veri Gizliliği
Analytics, Reklam, IAP, Etik Monetizasyon ve Yayın Kontrolü
Fikirden Yapılabilir Oyuna: Hedef Oyuncu, Temel Fantezi ve Kapsam
Game Design Document, Teknik Tasarım, Risk Listesi ve Üretim Panosu
Final Proje I: Oynanabilir Çekirdek Döngü
Final Proje II: İçerik, UI, Ses, Geri Bildirim ve Kayıt
Final Proje III: QA, Kullanılabilirlik, Erişilebilirlik ve Profiling
Release Candidate, Portföy Vaka Çalışması ve Postmortem
`.trim().split('\n');

export const coursePlan: CoursePlanItem[] = catalogTitles.map((title, index) => ({
  order:index + 1,
  module:Math.floor(index / 6) + 1,
  duration:index === 0 ? 98 : index === 1 ? 99 : index === 2 ? 108 : 90,
  title:text(title),
  status:index < 3 ? 'published' : 'preparing',
}));

export const getLesson = (lessonId: string): Lesson => lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
export const lessonIdForOrder = (order: number) => lessons.find((lesson) => lesson.order === order)?.id;
