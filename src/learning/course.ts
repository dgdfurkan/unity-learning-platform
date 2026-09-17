import type { Locale } from '../domain/models';
import { foundationLessons } from './foundationLessons';

export type LessonStepKind = 'prepare' | 'teach' | 'observe' | 'practice' | 'simulate' | 'debug' | 'lab' | 'game' | 'test' | 'finale';
export type LessonActivityKind = string;

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
  step(['l1-welcome','prepare','reveal',4,20,'Bir oyunun görünmeyen tarafıyla tanışalım','Ekranda yürüyen bir karakter görürüz; arka planda ise oyuncunun isteğini anlayan, kuralları kontrol eden ve sonucu hazırlayan küçük bir sistem çalışır. Koda geçtiğimizde yazacağımız satırların neyi temsil ettiğini anlayabilmek için önce bu sistemi tanıyacağız.','Bir oyun davranışını kod satırlarından önce günlük dille açıklayabilir.',['Önce sonucu görürüz, ardından onu oluşturan nedenleri ararız.','Bir tahmin yanlış çıktığında oyun bize yeni bir ipucu vermiş olur.','Bugün kuracağımız zihinsel model, ileride okuyacağımız C# kodunu anlamlandıracak.'],'İlk örnekte, sağ oka basılan tek bir anı yavaşlatarak inceleyeceğiz.']),
  step(['l1-observe','observe','classify',6,30,'Bir tuşa basınca gerçekte neler oluyor?','Sağ oka bastığımızda karakter hareket ediyor, enerjisi azalıyor ve ayak sesi duyuluyor. Bunlar ekranda peş peşe gerçekleştiği için tek bir olay gibi görünebilir. Oysa oyuncunun yaptığı şey, oyunun verdiği karar, hafızada değişen bilgi ve oyuncuya gösterilen sonuç birbirinden farklıdır.','Tek bir oyun anının içindeki input, kural, durum ve çıktı parçalarını ayırabilir.',['Sağ ok, oyuncunun oyuna gönderdiği istektir.','Hareket kuralı, bu isteğin o anda uygulanıp uygulanamayacağına karar verir.','Konum ve enerji oyunun hatırladığı bilgilerdir; görüntü ile ses ise oyuncuya ulaşan sonuçlardır.'],'Bu dört görevi şimdi tek bir akış üzerinde yan yana getireceğiz.']),
  step(['l1-four-link','teach','order',8,35,'Bir oyun anının dört halkası','Önce oyuncudan bir istek gelir. Oyun, mevcut bilgileri ve kurallarını kullanarak bu isteği değerlendirir. Gerekirse hafızasındaki değerleri değiştirir ve sonucu görüntü, ses ya da metinle oyuncuya anlatır.','Input → kural → durum → çıktı ilişkisini iki farklı oyun örneğinde kurabilir.',['Input, oyuncunun ne yapmak istediğini oyuna bildirir.','Kural, isteği mevcut durumla birlikte değerlendirir.','Durum, oyunun o ana ilişkin hafızasıdır.','Çıktı, verilen kararın oyuncu tarafından fark edilmesini sağlar.'],'Önce input ile sonucu neden birbirinden ayırdığımıza yakından bakalım.']),
  step(['l1-input','simulate','connect',6,35,'Aynı istek farklı cihazlardan gelebilir','Space tuşu, gamepad düğmesi veya ekrana dokunmak fiziksel olarak farklı hareketlerdir. Üçü de oyunda “Zıpla” isteğine bağlanabilir. Karakteri hareket ettiren tuşun kendisi değil, oyunun bu sinyale verdiği anlamdır.','Fiziksel kontrolü, oyuna iletilen niyetten ayırabilir.',['Klavye, dokunmatik ekran ve gamepad farklı biçimlerde sinyal üretir.','Farklı sinyaller oyunda aynı “Zıpla” niyetini temsil edebilir.','Karakterin konumu ancak bir kural bu isteği kabul ettiğinde değişir.'],'Oyuna bir istek ulaştı; şimdi bu isteğin neden her zaman kabul edilmediğini göreceğiz.']),
  step(['l1-rule','practice','decide',7,35,'Kural, koşullara bakarak karar verir','Oyuncu zıplamak isteyebilir; ancak karakter zaten havadaysa oyun yeni bir zıplamayı başlatmayabilir. Burada tuş çalışmaz hâle gelmez. Aynı input gelir, fakat mevcut durum farklı olduğu için kural farklı bir karar verir.','Bir kararın hem input’a hem de oyunun mevcut durumuna bağlı olduğunu açıklayabilir.',['Kural yalnızca yasak koymaz; hangi durumda ne olacağını tarif eder.','Bir input’un gelmesi, durumun mutlaka değişeceği anlamına gelmez.','Aynı input, farklı durumlarda farklı sonuçlar doğurabilir.'],'Kuralın karar verirken baktığı bilgileri oyunun hafızasında inceleyeceğiz.']),
  step(['l1-state','simulate','simulate',8,40,'Oyun şu anda ne biliyor?','Karakterin canı, elinde anahtar olup olmadığı, kapının açık mı kapalı mı olduğu ve bulunduğu oda oyunun hatırladığı bilgilerdir. Bu bilgilerin bazılarını ekranda görürüz; bazılarıysa yalnızca kurallar ihtiyaç duyduğunda kullanılır.','Bir olay gerçekleşmeden önce hangi durum bilgilerinin değişeceğini tahmin edebilir.',['Durum yalnızca sayılardan oluşmaz; açık/kapalı gibi iki seçenekli bilgiler de durumdur.','Ekrandaki görüntü ile görüntüyü oluşturan veri aynı şey değildir.','Her değişen değerin bir önceki hâli ve onu değiştiren bir olay vardır.'],'Sırada, oyunun içindeki bu değişiklikleri oyuncuya nasıl anlattığı var.']),
  step(['l1-output','observe','classify',6,30,'Oyunun cevabı: görüntü, ses ve geri bildirim','Bir kapı açıldığında hareketini görebilir, kısa bir ses duyabilir veya ekranda yeni bir simge görebiliriz. Bu işaretler süs olmanın ötesinde, oyunun verdiği kararı oyuncuya anlatır.','Bilgi taşıyan geri bildirimleri yalnızca dekor amacı taşıyan ayrıntılardan ayırabilir.',['Fazla efekt her zaman daha anlaşılır bir oyun anlamına gelmez.','Önemli bir bilginin yalnızca sese bağlanması, o sesi duyamayan oyuncuyu dışarıda bırakabilir.','İyi bir çıktı, oyuncunun “Ne oldu?” sorusuna açık bir cevap verir.'],'Sistemin ne yapacağını anladık; şimdi bilgisayarın neden açık talimatlara ihtiyaç duyduğunu göreceğiz.']),
  step(['l1-precision','practice','order',8,40,'Bilgisayar belirsizliği bizim yerimize tamamlamaz','“Biraz ilerle” cümlesi bir insan için yeterli görünebilir. Bilgisayar açısından ise yön, mesafe ve ne zaman durulacağı belirsizdir. Çalışabilir bir talimat, yapılacak işi küçük ve ölçülebilir adımlara ayırır.','Belirsiz bir isteği sıralı ve uygulanabilir adımlara çevirebilir.',['Adımların sırası, ortaya çıkan sonucu değiştirebilir.','Yön, hedef ve miktar ölçülebilir biçimde belirtilmelidir.','Gerekli bilgi eksikse sistemin güvenli biçimde durması beklenir.'],'Bu kesin talimatların kodla nasıl ilişkili olduğunu, kullandığımız araçlardan ayıracağız.']),
  step(['l1-roles','teach','match',8,40,'Kod, Unity Editor ve çalışan oyun aynı şey değildir','Unity Editor oyunu hazırladığımız çalışma ortamıdır. Oyun motoru görüntü, ses ve fizik gibi ortak altyapıyı sağlar. Kod kuralları tarif eder; proje bütün kaynakları bir arada tutar; build ise oyuncunun açıp çalıştırdığı sonuçtur.','Oyun geliştirmedeki beş temel kavramı görevlerine bakarak ayırabilir.',['Editor, oyunu hazırladığımız ortamdır; oyuncuya teslim edilen oyun değildir.','Oyun motoru güçlü araçlar sunar, fakat oyunun fikrini ve kurallarını bizim yerimize kurmaz.','Build, geliştirme projesinden üretilen çalıştırılabilir sonuçtur.'],'Bu parçaların oyunu canlı tutabilmesi için aynı akışın sürekli yenilenmesi gerekir.']),
  step(['l1-loop','simulate','simulate',6,35,'Oyun neden sürekli kendini yeniliyor?','Oyuncu her an yeni bir tuşa basabilir, karakter hareket edebilir veya bir sayaç değişebilir. Bu yüzden oyun girdiyi bir kez okuyup durmaz; kısa aralıklarla yeniden bakar, karar verir, durumunu günceller ve yeni görüntüyü hazırlar.','Ardışık üç oyun turunda durumun nasıl devam ettiğini izleyebilir.',['Bir turun sonunda kalan durum, sonraki turun başlangıcı olur.','Her turda aynı input gelmek zorunda değildir.','Yeni bir input gelmese bile oyun mevcut durumu göstermeye devam eder.'],'Bir sonuç yanlış göründüğünde, hatayı bulmak için bu akışın tamamını izleyeceğiz.']),
  step(['l1-debug','debug','debug',7,45,'Kapı neden açılmadı?','Oyuncu anahtarı aldığı hâlde kapı açılmıyorsa yalnızca kapı animasyonuna bakmak yetmez. Input’un ulaşıp ulaşmadığını, anahtar bilgisinin doğru saklanıp saklanmadığını ve kuralın hangi değeri kontrol ettiğini sırayla incelediğimizde ilk yanlış noktayı bulabiliriz.','Input–kural–durum–çıktı hattındaki ilk beklenmeyen değeri bulabilir.',['Önce oyuncunun isteğinin oyuna ulaşıp ulaşmadığına bakılır.','Ardından oyunun sakladığı anahtar bilgisi kontrol edilir.','Kuralın doğru değeri karşılaştırdığı doğrulanır.','Son olarak kararın görüntüye doğru yansıyıp yansımadığı incelenir.'],'Aynı düşünme biçimini şimdi yeni bir oyun sistemi tasarlarken kullanacağız.']),
  step(['l1-lab','lab','lab',8,55,'Yakıtı olan bir uzay gemisi tasarlayalım','Uzay gemisi yalnızca yakıtı varken hızlanacak. Yakıt bittiğinde hız değişmeyecek ve oyuncu nedenini anlayabileceği bir uyarı görecek. Input, kural, durum ve çıktı parçalarını yerleştirerek bu davranışın eksiksiz akışını kuracağız.','Yeni bir oyun fikrinde dört halkayı ve iki olası sonucu bağımsız biçimde tasarlayabilir.',['Hızlan düğmesi input’u temsil eder.','Yakıt ve hız, oyunun sakladığı durum bilgileridir.','Kural, yakıtın sıfırdan büyük olup olmadığını kontrol eder.','Başarılı hızlanma ile reddedilen isteğin çıktıları birbirinden farklı olmalıdır.'],'Kurulan sistem, kısa bir kontrol merkezi görevinde gerçek kararlar verecek.']),
  step(['l1-game','game','game',7,45,'Komut Merkezi','Üç kapsülün yakıtını, kapı durumunu ve gönderime hazır olup olmadığını kontrol edeceğiz. Amaç hızlı tıklamak değil; her kapsül için doğru kararı hangi bilginin desteklediğini görebilmek.','Dört halkayı yeni görevlerde birlikte kullanabilir.',['Kapsül gönderilmeden önce yakıt ve kapı durumu kontrol edilir.','Yanlış bir karar turu silmez; hangi halkanın eksik olduğu görünür.','Aynı görev klavye ve dokunmatik kontrollerle tamamlanabilir.'],'Son bölümde kavramlar farklı oyun örnekleri içinde yeniden karşımıza çıkacak.']),
  step(['l1-finale','finale','finale',9,135,'Ders sonu uygulaması','Sıralama, sınıflandırma, hata bulma ve yeni bir oyuna uyarlama görevlerinden oluşan on iki kısa tur, ders boyunca kurduğumuz sistemi birlikte kullanacak.','Dersin temel hedeflerinde en az yüzde 70 ilk deneme başarısı gösterebilir.',['Yanlış bir cevap kazanılmış XP’yi azaltmaz.','İlk cevap, hangi konuların yeniden görülmesi gerektiğini belirler.','Zorlanılan kavramlar için ilgili öğrenme adımına kısa bir dönüş açılır.'],'Bir oyunun görünmeyen sistemini okuyabiliyorsun; sırada bu bilgilerin bilgisayarda nasıl saklandığı var.']),
];

const lesson2Steps: LessonStep[] = [
  step(['l2-recall','prepare','reveal',5,20,'Sistem zincirinden dosya zincirine','Çalışan oyunun geçici durumu ile bilgisayar kapalıyken diskte kalan dosya aynı şey değildir. Kod ve proje bilgileri dosyalarda saklanır.','Ders 1’deki sistem modelini kalıcı saklamaya aktarır.',['Çalışan durum geçici olabilir','Dosya kalıcı saklama birimidir','Araç dosyayı açar; build çalışan sonucu sunar'],'Saklama dünyasının iki temel nesnesini ayıralım.']),
  step(['l2-file-folder','teach','classify',6,30,'Dosya mı klasör mü?','Dosyanın içeriği ve adı vardır; klasör dosyaları ve başka klasörleri düzenler. Simgeye değil göreve bakacağız.','Dosya, klasör ve alt klasörü birbirinden ayırır.',['Movement.cs bir dosyadır','Scripts bir klasördür','“Emin değilim” seçeneği ipucu açar; cezalandırmaz'],'Dosyanın adındaki son parça tür hakkında önemli bir ipucu verir.']),
  step(['l2-name-extension','simulate','classify',7,35,'Ad ve uzantı anatomisi','Son noktanın ardından gelen bölüm uzantıdır. `PlayerMove.cs.txt` gibi çift uzantılar, uzantılar gizliyken gözden kaçabilir.','Gövde adı, nokta ve uzantıyı ayırır; sahte çift uzantıyı bulur.',['.cs C# kaynak dosyasını işaret eder','.unity bir sahne dosyasını işaret eder','Adı değiştirmek dosya biçimini dönüştürmez'],'Dosyanın bilgisayardaki adresini okuyalım.']),
  step(['l2-path','practice','order',7,35,'Dosyanın adresi: yol','Yol, kökten başlayıp klasörler üzerinden dosyaya ulaşan adrestir. Aynı adlı iki dosya farklı yollarda bulunabilir.','Yol parçalarını soldan sağa okur ve doğru sıraya koyar.',['Her klasör bir sonraki parçanın ebeveynidir','Dosya adı tek başına benzersiz adres değildir','Ayıraç işletim sistemine göre değişebilir'],'Unity’nin açtığı adres tek dosyayı değil, bütün proje kökünü gösterir.']),
  step(['l2-root','observe','match',8,40,'Unity projesi tek dosya değildir','Bir Unity projesi Assets, Packages ve ProjectSettings gibi birlikte çalışan temel parçalar taşır. Library ise Unity’nin gerektiğinde yeniden oluşturabildiği yerel bir önbellektir; ne işe yaradığını bilmeden silmek doğru bir ilk adım değildir.','Proje ağacındaki temel klasörleri görevleriyle eşleştirir.',['Assets içerik ve script’leri taşır','Packages bağımlılıkları tanımlar','ProjectSettings proje davranışını saklar'],'Hub’a hangi klasörü göstermemiz gerektiğini kesinleştirelim.']),
  step(['l2-assets-boundary','practice','decide',6,35,'Proje kökü ve Assets sınırı','Hub’daki “Open project” seçeneği yalnızca Assets klasörünü değil, projenin tamamını bekler. Doğru klasörde Assets, Packages ve ProjectSettings yan yana görünür.','Üç klasörün yapısını inceleyerek hangisinin proje kökü olduğunu açıklayabilir.',['MyGame/ doğru kök olabilir','MyGame/Assets/ kök değildir','En güçlü ipucu, üç temel klasörün yan yana bulunmasıdır'],'Doğru klasör ZIP içindeyse önce güvenli bir çalışma alanına çıkarılması gerekir.']),
  step(['l2-zip','simulate','order',7,35,'ZIP arşivi ile çalışma klasörü','Arşiv teslim ve saklama paketidir; doğrudan çalışma alanı değildir. Tamamını güvenli hedefe çıkartıp kökü yeniden doğrularız.','Arşivi güvenli biçimde çıkartma adımlarını sıralar.',['ZIP’i seç','Hedef klasörü belirle','Tamamını çıkart','Proje kökünü doğrula','Orijinal arşivi yedek olarak koru'],'Çıkartılan projenin nereye konacağı da önemlidir.']),
  step(['l2-safe-location','practice','decide',7,40,'Güvenli proje konumu seçmek','Kısa, anlaşılır, yazma izni bulunan ve kontrolsüz senkronizasyon riski taşımayan bir çalışma yolu seçilir.','Proje konumlarını izin, senkronizasyon, açıklık ve uzunluk açısından değerlendirir.',['Downloads geçici ve dağınık olabilir','Sistem klasörleri izin sorunu çıkarabilir','Kısa ASCII adlar başlangıç taşınabilirliğini artırır'],'Konum kadar projenin adı da ileride hata ayıklamayı etkiler.']),
  step(['l2-naming','practice','classify',6,30,'Proje ve klasör isimlendirme','`FirstGame` niyeti açıklar; `final_son_son2` sürüm karmaşası üretir. Tarih yedek adında anlamlıdır, aktif proje adında sürekli eklenmez.','Belirsiz proje adlarını açık ve tutarlı adlara dönüştürür.',['Tam kelimeler kullan','Geçici adları kalıcılaştırma','Yedeğin tarihi ile projenin kimliğini ayır'],'İyi adlandırılmış proje de tek kopyaysa güvende değildir.']),
  step(['l2-backup','teach','decide',8,40,'Kopya, senkronizasyon ve yedek','Aynı diskteki iki klasör donanım arızasına karşı korumaz. Senkronizasyon silmeyi de yayabilir. Bağımsız yedek ayrı risk alanında yaşar.','Çalışma kopyası, senkronizasyon ve gerçek yedeği ayırır.',['3 kopya','2 farklı ortam','1 kopya ayrı konumda','Bu bir zihinsel modeldir; tek sihirli ürün değildir'],'Kayıp görünen projede önce kanıt toplayacağız.']),
  step(['l2-diagnose','debug','debug',7,45,'Projem kayboldu mu?','Hub projeyi açmıyorsa rastgele klasör taşımak yerine arşiv, çıkartma, kök ve erişim kanıtlarını sırayla kontrol ederiz.','Yanlış yol, ZIP, iç içe klasör ve eksik kök sorunlarını teşhis eder.',['Önce yolun arşiv içinde olup olmadığına bak','Assets’in kardeşlerini ara','İlk yanlış adımı kanıt cümlesiyle açıkla'],'Baştan güvenli bir çalışma alanı tasarlayacaksın.']),
  step(['l2-lab','lab','lab',7,55,'Güvenli çalışma alanı laboratuvarı','Sanal dosya ağacında bir Unity projesi, ders notları ve bağımsız yedek için ayrı yerler hazırlayacağız. Deney sırasında bilgisayarındaki gerçek dosyalara dokunulmaz.','Gereksinimlere uygun bir klasör ve yedek düzeni tasarlayabilir.',['Proje ZIP içinde kalmaz','Assets kök olarak seçilmez','Yedek, çalışma klasörünün ikinci adı değildir','Uzantılar görünür tutulur'],'Birazdan bu düzeni bozulmuş bir projeyi kurtarırken kullanacağız.']),
  step(['l2-game','game','game',7,45,'Dosya Kurtarma Operasyonu','Üç bozuk proje paketinde arşivi tanı, doğru kökü seç ve bağımsız yedek hedefini belirle. Hatalı seçim dosya silmez.','Dosya, yol, kök ve yedek kararlarını oynanabilir bir haritada uygular.',['Haritayı incele','İlk kırık bağı bul','En küçük güvenli düzeltmeyi seç','Düzeltme sonrası yeniden doğrula'],'Finalde proje yapısını ve güvenli çalışma kararlarını birlikte kullanacaksın.']),
  step(['l2-finale','finale','finale',11,155,'Dosya kurtarma finali','Bu bölümde küçük bir dosya vakasını baştan sona çözeceğiz. Dosyanın türü, proje kökü, ZIP arşivi, güvenli konum ve yedek kararı aynı senaryonun parçaları olacak.','Ders boyunca kurduğu dosya düzenini yeni bir proje vakasına aktarabilir.',['On iki kısa tur farklı bir ipucu sunar','Yanlış seçimde nedenini anlatan bir geri bildirim açılır','Zorlanılan kavram için ilgili bölüme dönüş yolu gösterilir'],'Çalışma alanın hazır; şimdi Unity Hub ve Editor ortamını kuracağız.']),
];

const lesson3Steps: LessonStep[] = [
  step(['l3-recall','prepare','reveal',5,20,'Proje kökü ve araç rolleri','Hub’da açılan şey MyGame proje köküdür; Assets tek başına proje değildir. Oyuncuya Editor değil, build gönderilir.','Önceki iki dersten proje kökü ve araç rolünü geri çağırır.',['Kökte Assets, Packages ve ProjectSettings birlikte bulunur','Hub projeleri ve Editor kurulumlarını yönetir','Build oyuncunun çalıştırdığı sonuçtur'],'Geliştirme zincirinin tüm görevlerini yerine oturtalım.']),
  step(['l3-toolchain','teach','match',8,35,'Geliştirme zincirini kur','Hub yönetir; Editor üretir ve önizler; IDE kodu düzenler; modül hedef platform desteği verir; lisans kullanım hakkını etkinleştirir; proje dosyaları taşır.','Altı aracı görevleriyle eşleştirir.',['Hub ile Editor aynı uygulama değildir','IDE Unity sahnesini yönetmez','Modül, belirli build hedefi için ek destektir'],'Kurucuyu indirmeden önce bilgisayarın hazır olduğunu kanıtlayalım.']),
  step(['l3-preflight','practice','checklist',8,40,'Kurulum öncesi sağlık kontrolü','Unity’nin kapladığı alan sürüme ve seçilen modüllere göre değişebilir. Bu nedenle tek bir sayı ezberlemek yerine işletim sistemi, işlemci mimarisi, güncel disk ihtiyacı, izinler ve bağlantı birlikte incelenir.','Kuruluma başlamadan önce bilgisayarın ihtiyaçlarını eksiksiz değerlendirebilir.',['İşletim sistemi ve CPU mimarisi','Güncel boş disk alanı','Yazma/yönetici izni','Kararlı bağlantı','Hedef platform ve yedekli proje konumu'],'Bilgisayar hazır olduğunda sıradaki konu, kurulum dosyasının güvenilir bir kaynaktan gelmesidir.']),
  step(['l3-source','practice','decide',6,35,'Resmî kaynağı ve doğru kurucuyu seç','Kurulum dosyasının güvenilir olduğunu yalnızca adına bakarak anlayamayız. İndirdiğimiz alan adının Unity’ye ait olması ve paketin kullandığımız işletim sistemiyle eşleşmesi gerekir.','Resmî Unity kaynağını ve doğru işletim sistemi dalını seçer.',['İndirme adresinin alan adı kontrol edilir.','Paketin Windows veya macOS için hazırlanmış doğru sürümü seçilir.','Bu güvenli simülasyon gerçek parola istemez ve bilgisayarda kurulum dosyası çalıştırmaz.'],'Doğru kurucuyla Hub’ın kendisini kuralım.']),
  step(['l3-hub','observe','order',8,40,'Unity Hub kurulumu ve ilk açılış','Resmî kurucuyu aç, hedefi ve koşulları doğrula, kurulumu tamamla, Hub’ı aç ve Projects ile Installations alanlarını gör.','Hub kurulum sırasını ve başarı kanıtlarını açıklar.',['İşletim sistemine uygun resmî akış izlenir','Projects ve Installations görünmelidir','Hub açıldı diye Editor kurulmuş sayılmaz'],'Hub hazır; hesap ve lisans durumunu ayrı ayrı görelim.']),
  step(['l3-account-license','simulate','decide',7,40,'Hesap ve lisans doğrulama','Oturum açmak kullanıcı kimliğini, lisans ise kullanım hakkını temsil eder. Ders parola veya doğrulama kodu toplamaz.','Oturum ve lisans durumunu ayırarak doğru sonraki adımı seçer.',['Oturum yok','Oturum var ve lisans etkin','Lisans görünmüyor','Çevrimdışı/kurumsal senaryo'],'Kullanım hakkı hazır; sınıfın aynı Editor sürümünde olmasını sağlayalım.']),
  step(['l3-version','practice','decide',8,45,'Editor sürümünü bilinçli seç','Eğitim tam bir Unity 6 patch sürümüne sabitlenir. Daha yeni sürüm görünmesi otomatik yükseltme nedeni değildir; proje, paket ve ekip uyumu değerlendirilir.','Verilen sürüm politikasına göre doğru Editor sürümünü seçer.',['Major aile tek başına yeterli değildir','Kursun sabitlediği patch esas alınır','Eski proje ayrı test kopyasında yükseltilir'],'Editor tek başına her hedef platform için build alamaz.']),
  step(['l3-modules','practice','simulate',9,45,'Gerekli modülleri seç','Bütün modülleri seçmek başarı değildir. Hedef platformun gerektirdiği en küçük set; disk, indirme ve bakım maliyetini kontrol eder.','Üç hedef için doğru modül sepetini bütçeyi aşmadan kurar.',['Masaüstü öğrenme hedefi','Android için Build Support ve ilgili araçlar','Web paylaşımı için Web Build Support','Gerçek boyut için Hub’daki güncel değer esas alınır'],'Seçim hazır; kurulum durumlarını doğru okuyalım.']),
  step(['l3-install','observe','decide',7,35,'İndirme, kurulum ve durum okuma','Downloading, installing, queued, failed ve complete aynı durum değildir. Her birinde doğru güvenli eylem farklıdır.','Kurulum durumunu okuyup bekleme, alan açma veya yeniden deneme kararı verir.',['Hata mesajını kaydet','Disk ve bağlantıyı doğrula','Yalnız başarısız modülü yeniden dene','Proje klasörlerini silmek çözüm değildir'],'Editor kurulurken kod aracını ve bağlantısını hazırlayalım.']),
  step(['l3-ide','practice','simulate',9,45,'Kod editörü/IDE ve Unity bağlantısı','IDE kod yazma, tamamlama, analiz ve debug sağlar; Unity Editor sahneyi ve oyun çalışmasını yönetir. Kurum tek desteklenen ana editörü seçebilir.','Kod editörünü Unity External Tools ayarına doğru bağlar.',['Visual Studio, Rider veya uygun C# eklentili VS Code','External Script Editor seçimi','Unity türleri tanınmıyorsa entegrasyon ve proje dosyalarını kontrol et'],'Kurulumun sağlıklı olduğunu beş kanıtla doğrulayalım.']),
  step(['l3-verify','test','checklist',7,45,'Beş maddelik kurulum doğrulaması','Kurulum “sanırım oldu” ile değil, beş ölçülebilir kanıtla tamamlanır. İlk proje ise bilinçli olarak Ders 4’e bırakılır.','Geliştirme ortamını ölçülebilir kanıtlarla doğrular.',['Hub açılıyor','Sabitlenen Editor Installed görünüyor','Gerekli modüller listeleniyor','Lisans etkin','External Tools’ta IDE seçilebiliyor'],'Eksik kanıtta rastgele yeniden kurmak yerine kurulum kliniğini kullanalım.']),
  step(['l3-debug','debug','debug',8,55,'Kurulum kliniği','Belirtiyi ilgili katmana indir: Hub, Editor, modül, lisans, IDE, işletim sistemi, disk veya ağ. Sonra en küçük güvenli düzeltmeyi uygula.','Sekiz kurulum vakasında kök katmanı ve doğrulama adımını seçer.',['Belirtiyi yaz','Kapsamı belirle','Görünen hata veya durumu kaydet','İlgili katmanı seç','Düzeltme sonrası aynı kanıtı yeniden ölç'],'Sınırlı depolamayla doğru atölyeyi kurmayı dene.']),
  step(['l3-game','game','game',7,45,'Kurulum Mimarı mini oyunu','Üç öğrenci profili için doğru Editor, modül, IDE ve lisans akışını disk bütçesini aşmadan kur. Fazladan seçim geri alınabilir.','Kurulum kararlarını hedef, bütçe ve platform kısıtlarıyla birlikte uygular.',['Sürümü sabitle','Hedef modülleri seç','IDE’yi bağla','Lisansı doğrula','Sağlık testini tamamla'],'Finalde araç görevleri, sürüm, modül ve teşhisi birlikte kullan.']),
  step(['l3-finale','finale','finale',11,165,'Kurulum atölyesi finali','Üç farklı öğrencinin bilgisayarı için uygun Unity sürümünü, gerekli modülleri ve kod editörünü belirleyeceğiz. Her senaryoda disk alanı, işletim sistemi veya hedef platform değişecek.','Kurulum kararlarını ezbere değil, görünen gereksinimlere dayanarak verebilir.',['On iki kısa vaka farklı bir kurulum sorusu taşır','İlk seçim yalnızca öğrenme durumunu gösterir; puanı geri götürmez','Eksik kalan konu için ilgili açıklamaya dönüş bağlantısı açılır'],'Atölyen hazır; Ders 4’te doğru şablon ve konumla ilk Unity projesini oluşturacaksın.']),
];

export const lessons: Lesson[] = [
  {
    id:'lesson-001-game-system-mental-model', order:1, module:1, duration:98, status:'published', fileName:'', starterCode:'',
    title:text('Oyun Bilgisayarda Nasıl Çalışır? Komut, Kural, Durum ve Görüntü'),
    summary:text('Bir oyunda input’tan görünür sonuca kadar gerçekleşen zinciri anlayıp kod yazmadan tasarlayacaksın.'),
    taskTitle:text('Bir tuştan ekrandaki sonuca uzanan yol'), taskBody:text('Bir oyuncu hareketinin input, kural, durum ve output halkalarından nasıl geçtiğini birlikte izleyeceğiz.'),
    successMessage:text('Bir oyun olayını input, kural, durum ve output halkalarıyla açıklayabiliyorsun.'), concepts:['input','kural','durum','output','Editor','build'], steps:lesson1Steps,
    badge:{tr:{name:'Sistem Kaşifi',description:'Input–kural–durum–çıktı zincirini kurdun.'},en:{name:'Sistem Kaşifi',description:'Input–kural–durum–çıktı zincirini kurdun.'}},
  },
  {
    id:'lesson-002-files-folders-projects', order:2, module:1, duration:99, status:'published', fileName:'', starterCode:'',
    title:text('Dosya, Klasör, Uzantı ve Proje: Geliştiricinin Çalışma Masası'),
    summary:text('Dosyaları, yolları, proje kökünü, ZIP arşivini ve güvenli yedeği sıfırdan anlayıp sanal bir çalışma alanı kuracaksın.'),
    taskTitle:text('Bir Unity projesi bilgisayarda nerede yaşar?'), taskBody:text('Proje kökü, çalışma klasörü ve bağımsız yedeğin neden ayrı kavramlar olduğunu sanal bir dosya sistemi üzerinde göreceğiz.'),
    successMessage:text('Projenin bilgisayarda nerede ve nasıl güvenle yaşadığını açıklayabiliyorsun.'), concepts:['dosya','klasör','uzantı','yol','proje kökü','ZIP','yedek'], steps:lesson2Steps,
    badge:{tr:{name:'Dijital Düzen Ustası',description:'Dosya ve proje düzenini güvenli kurdun.'},en:{name:'Dijital Düzen Ustası',description:'Dosya ve proje düzenini güvenli kurdun.'}},
  },
  {
    id:'lesson-003-unity-environment-setup', order:3, module:1, duration:108, status:'published', fileName:'', starterCode:'',
    title:text('Unity Hub, Editor ve Kod Editörü Kurulumu'),
    summary:text('Hub, Editor, IDE, lisans ve platform modüllerinin görevlerini ayırıp doğrulanmış bir geliştirme ortamı planlayacaksın.'),
    taskTitle:text('Unity atölyesinin parçaları'), taskBody:text('Hub, Editor, kod editörü, platform modülleri ve lisansın birbirinden farklı görevlerini çalışan bir kurulum modeli üzerinde keşfedeceğiz.'),
    successMessage:text('Atölyenin her parçasını görevi ve kanıtıyla doğrulayabiliyorsun.'), concepts:['Hub','Editor','IDE','modül','lisans','sürüm','kurulum'], steps:lesson3Steps,
    badge:{tr:{name:'Atölye Mimarı',description:'Unity geliştirme zincirini doğruladın.'},en:{name:'Atölye Mimarı',description:'Unity geliştirme zincirini doğruladın.'}},
  },
  ...foundationLessons,
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
  duration:index === 0 ? 98 : index === 1 ? 99 : index === 2 ? 108 : index === 3 ? 96 : index === 4 ? 104 : index === 5 ? 101 : 90,
  title:text(title),
  status:index < 6 ? 'published' : 'preparing',
}));

export const getLesson = (lessonId: string): Lesson => lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
export const lessonIdForOrder = (order: number) => lessons.find((lesson) => lesson.order === order)?.id;
