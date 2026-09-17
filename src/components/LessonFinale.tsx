import { useMemo, useState } from 'react';
import type { Locale } from '../domain/models';
import type { Lesson } from '../learning/course';
import { Icon } from '../shared/Icon';

type Question = { type:'kavram'|'sıralama'|'hata'|'senaryo'|'transfer'|'boss'; prompt:string; options:string[]; answer:number; explanation:string; reviewStep:string };
const q = (type:Question['type'], prompt:string, options:string[], answer:number, explanation:string, reviewStep:string):Question => ({type,prompt,options,answer,explanation,reviewStep});

const packs: Record<number,{title:string;subtitle:string;questions:Question[]}> = {
  1:{title:'Sistem Çekirdekleri',subtitle:'Input’tan output’a uzanan zinciri yeni oyun durumlarında onar.',questions:[
    q('kavram','Oyuncunun ekrana dokunması hangi halkadır?',['Input','Durum','Output'],0,'Dokunma, oyuncunun sisteme gönderdiği niyettir.','l1-input'),
    q('sıralama','Doğru temel akış hangisidir?',['Input → kural → durum → output','Durum → output → input → kural','Output → input → durum → kural'],0,'Karar ve durum değişimi, gösterilen sonuçtan önce gelir.','l1-four-link'),
    q('senaryo','Karakter havadayken Zıpla input’u geldi. Yer tabanlı kural ne yapar?',['Durumu kontrol edip isteği reddeder','Her durumda ikinci kez zıplatır','Input’u output yapar'],0,'Input tek başına sonuç garantilemez; kural mevcut durumu okur.','l1-rule'),
    q('kavram','`anahtarVar` bilgisi hangi halkaya aittir?',['Output','Durum','Input'],1,'Bu, oyunun o anda sakladığı değişebilir bilgidir.','l1-state'),
    q('senaryo','Kilitli kapının yalnız ses vermesi hangi riski taşır?',['Sesi duyamayan oyuncu bilgiyi kaçırabilir','Kapı otomatik build olur','Input iki kez çalışır'],0,'Önemli bilgi mümkünse birden fazla kanalla verilmelidir.','l1-output'),
    q('hata','“Karakteri biraz ilerlet” komutunun ana sorunu nedir?',['Yön ve miktarın belirsiz olması','Türkçe olması','Kısa olması'],0,'Bilgisayar hedefi, yönü ve ölçüyü tahmin etmez.','l1-precision'),
    q('kavram','Sahneyi düzenlediğin üretim yüzeyi hangisidir?',['Build','Editor','Oyuncu cihazı'],1,'Editor üretim masasıdır; build oyuncuya teslim edilen sonuçtur.','l1-roles'),
    q('transfer','Aynı gamepad tuşu iki oyunda farklı eylem üretiyorsa anlamı ne belirler?',['Tuşun rengi','Oyunun kuralı ve action eşlemesi','Monitör boyutu'],1,'Fiziksel sinyalin oyun içindeki niyetini kurallar belirler.','l1-input'),
    q('hata','Input doğru, durum doğru, kural ters değeri kontrol ediyor. İlk kırık halka?',['Input','Kural','Output resmi'],1,'İlk beklenmeyen kanıt kural düğümündedir.','l1-debug'),
    q('senaryo','Yakıt sıfırken hızlanma istendi. En güvenli cevap?',['Hızı artır','Durumu koru ve uyarı ver','Hiç geri bildirim verme'],1,'Kural reddeder, durum korunur ve output nedeni açıklar.','l1-lab'),
    q('transfer','Oyun turunda input gelmezse ne olabilir?',['Durum korunur ve ekran yine güncellenir','Oyun mutlaka kapanır','Bütün dosyalar silinir'],0,'Boş input da bir tur durumudur; önceki bilgi korunabilir.','l1-loop'),
    q('boss','Kapı sistemi için eksiksiz kanıt zinciri hangisidir?',['Etkileşim input’u → anahtar kuralı → kapı durumu → açılma geri bildirimi','Ses → Editor → klasör → build','Kapı resmi → tuş rengi → rastgele durum'],0,'Dört halka aynı oyun niyeti etrafında tutarlı bağlanır.','l1-four-link'),
  ]},
  2:{title:'Proje Kurtarma Merkezi',subtitle:'Dosya ağacını, proje kökünü ve yedek kararlarını kanıtla.',questions:[
    q('kavram','`Scripts/` nedir?',['Dosya','Klasör','Build'],1,'Scripts, başka öğeleri düzenleyen klasördür.','l2-file-folder'),
    q('hata','`Player.cs.txt` dosyasının son uzantısı?',['.cs','.txt','.player'],1,'Son noktanın sağındaki bölüm son uzantıdır.','l2-name-extension'),
    q('kavram','Aynı adlı iki dosyayı kesin ayıran bilgi?',['Tam yol','Simge rengi','Son değiştirme sesi'],0,'Dosyanın konumu tam yoluyla belirlenir.','l2-path'),
    q('kavram','Unity paket bağımlılıklarını hangi temel parça taşır?',['Packages','Screenshots','Builds'],0,'Packages proje paket bağımlılıklarını tanımlar.','l2-root'),
    q('senaryo','Hub’da açılacak doğru hedef?',['MyGame/Assets/Scripts','MyGame/Assets','MyGame'],2,'Proje kökü temel klasörlerin ortak ebeveynidir.','l2-assets-boundary'),
    q('sıralama','ZIP proje için ilk güvenli sıra?',['Çıkart → kökü doğrula → aç','Assets’i sürükle → ZIP’i yeniden adlandır','ZIP içinde düzenle → sonra düşün'],0,'Arşiv tamamen çıkartılır ve gerçek proje kökü doğrulanır.','l2-zip'),
    q('senaryo','En güvenli başlangıç yolu?',['Sistem klasörü','D:/GameDev/Projects/FirstGame','Downloads/Yeni Klasör (27)'],1,'Kısa, anlamlı ve kontrol edilen yol daha az risk taşır.','l2-safe-location'),
    q('kavram','En açık aktif proje adı?',['final_son2','Yeni Klasör','LevelUpPractice'],2,'Ad projenin kimliğini anlatmalıdır.','l2-naming'),
    q('hata','Aynı diskte iki kopyanın açık bıraktığı risk?',['Disk arızası','Dosya uzantısı','Klasör simgesi'],0,'Tek fiziksel arıza iki kopyayı da etkileyebilir.','l2-backup'),
    q('hata','`Game.zip/Game/Assets` yolu Hub’da seçilmiş. İlk sorun?',['Arşiv çıkartılmamış ve kök yerine Assets seçilmiş','Ad çok kısa','Assets bulunuyor'],0,'İki ayrı sınır hatası birlikte görülür.','l2-diagnose'),
    q('transfer','Bağımsız yedek nerede olmalı?',['Assets/Backup içinde','Ayrı risk alanında tarihli arşiv','Aynı klasörde Copy adıyla'],1,'Yedek çalışma kopyasından ve mümkünse aynı fiziksel riskten ayrılır.','l2-backup'),
    q('boss','Kurtarma operasyonunda ilk ilke?',['Önce kanıtı incele, sonra en küçük güvenli değişikliği yap','Önce sil, sonra dene','Bütün adları aynı anda değiştir'],0,'Teşhis değişiklikten önce mevcut durumu ölçer.','l2-game'),
  ]},
  3:{title:'Atölye Sağlık Kontrolü',subtitle:'Hub, Editor, IDE, sürüm ve modül kararlarını tek zincirde doğrula.',questions:[
    q('kavram','Unity kurulumlarını yöneten araç?',['Hub','Build','ProjectSettings'],0,'Hub proje ve Editor kurulumlarını yönetir.','l3-toolchain'),
    q('kavram','Kodu düzenleme, analiz ve debug aracı?',['IDE','Lisans','Platform modülü'],0,'IDE kod çalışma ortamıdır.','l3-ide'),
    q('senaryo','Kurulum boyutu için hangi kanıt esas alınır?',['Geçen yılki tahmin','Hub’ın seçili sürüm/modüller için gösterdiği güncel boyut','Sabit 5 GB varsayımı'],1,'Boyut sürüm ve modüllere göre değişir.','l3-preflight'),
    q('senaryo','Kurucuda birlikte doğrulanması gerekenler?',['Resmî alan adı ve işletim sistemi','Logo ve reklam sayısı','Dosya adının uzunluğu'],0,'Güvenli kaynak ve doğru hedef paket iki ayrı kanıttır.','l3-source'),
    q('hata','Hub açık, Installations boş. En olası açıklama?',['Editor kurulmamış','Build tamamlanmış','IDE lisans vermiş'],0,'Hub’ın kurulması Editor’ün kurulması anlamına gelmez.','l3-hub'),
    q('kavram','Oturum ile lisans neden ayrı kontrol edilir?',['Kimlik ile kullanım hakkı farklıdır','Dosya uzantıları farklıdır','Editor yalnız çevrimdışı çalışır'],0,'Hesap kimliği ve lisans yetkisi ayrı durumlardır.','l3-account-license'),
    q('senaryo','Kurs belirli patch sürümüne sabit. Yeni patch göründü. Ne yaparsın?',['Hemen yükseltirim','Kurs sürümünü korur, uyumu ayrı kopyada test ederim','Projeyi silerim'],1,'Ekip ve paket uyumu doğrulanmadan taban değiştirilmez.','l3-version'),
    q('senaryo','Yalnız PC öğrenen öğrenci modülleri nasıl seçer?',['Hepsini','Hedefe gereken en küçük seti','Hiç Editor kurmadan'],1,'Fazla modül disk ve bakım maliyeti üretir.','l3-modules'),
    q('hata','Bir modül failed oldu. İlk güvenli eylem?',['Proje klasörünü sil','Hata bilgisini kaydet, disk/ağı doğrula','Rastgele başka sürüm kur'],1,'En küçük güvenli düzeltme için önce belirti korunur.','l3-install'),
    q('hata','IDE Unity türlerini tanımıyor. İlgili katman?',['IDE entegrasyonu ve proje dosyaları','Audio Mixer','Yedek tarihi'],0,'Belirti kod editörü bağlantısı katmanındadır.','l3-debug'),
    q('transfer','Kurulum tamamlandı demek için en güçlü kanıt?',['Masaüstünde simge görmek','Beş maddelik sağlık kontrolünün geçmesi','İndirme çubuğunu bir kez görmek'],1,'Hub, sürüm, modül, lisans ve IDE kanıtları birlikte gerekir.','l3-verify'),
    q('boss','Doğru kurulum zinciri hangisidir?',['Ön kontrol → resmî kaynak → Hub → lisans → sabit sürüm/modül → IDE → sağlık testi','IDE → rastgele modül → proje silme','Build → Hub → dosya adı'],0,'Kurulum, ön koşuldan doğrulamaya kadar kanıtlı bir zincirdir.','l3-game'),
  ]},
  4:{title:'Proje Fırlatma Merkezi',subtitle:'Şablondan açılış kanıtına kadar bozulmadan çalışan bir proje manifesti kur.',questions:[
    q('kavram','Template ile sample arasındaki temel fark?',['Template başlangıç yapısıdır; sample özellik örneğidir','İkisi her zaman bitmiş oyundur','Sample Editor sürümüdür'],0,'Template proje kabuğunu; sample belirli bir özelliğin örnek içeriğini sağlar.','l4-template'),
    q('senaryo','Kursun 3D başlangıç pipeline’ı?',['URP','HDRP zorunlu','Rastgele seçim'],0,'Kursun sabit başlangıç yolu Universal Render Pipeline’dır.','l4-pipeline'),
    q('senaryo','Yeni patch görünürken kurs sürümü sabitse?',['Kurs sürümünü seç','Her zaman latest','Projeyi sil'],0,'Uyumluluk kanıtlanmadan eğitim tabanı değiştirilmez.','l4-version'),
    q('kavram','En açık proje adı?',['finalson4','LevelUpPractice','Yeni Klasör'],1,'Anlamlı tam kelimeler projenin kimliğini taşır.','l4-name'),
    q('transfer','Location `D:/Projects`, name `Arena` ise kök?',['D:/Projects/Arena','D:/Projects/Assets','Arena.zip'],0,'Location üst klasör, name yeni kök klasör adıdır.','l4-location'),
    q('hata','Başka projenin Assets’i location seçilmiş. Risk?',['İç içe proje','Daha hızlı import','Otomatik yedek'],0,'İki proje kökü birbirine karışır.','l4-location'),
    q('kavram','Cloud kapalıysa yerel proje oluşturulabilir mi?',['Evet','Hayır','Yalnız HDRP’de'],0,'Cloud hizmeti yerel projenin zorunlu temeli değildir.','l4-cloud'),
    q('hata','Manifestte ilk kontrol?',['Sürüm, template, ad ve konumun birlikte tutarlılığı','Müzik seviyesi','Karakter canı'],0,'Create öncesinde proje kararları birlikte doğrulanır.','l4-summary'),
    q('sıralama','Doğru oluşturma sırası?',['Sürüm → template → ad/location → Create','Create → sürüm → sil','Build → ZIP → template'],0,'Alanlar doğrulandıktan sonra sanal proje oluşturulur.','l4-create'),
    q('kavram','İlk import ne hazırlar?',['Asset ve yerel cache','Oyuncu skorunu','Cloud hesabını zorunlu olarak'],0,'Asset’ler Unity’nin kullanacağı yerel biçime hazırlanır.','l4-first-open'),
    q('hata','Project’te Assets yok; yol `MyGame/Assets`. Olası sorun?',['Kök yerine alt klasör açılmış','Game kamerası yakın','Ses kapalı'],0,'Proje kökü temel klasörlerin ortak ebeveynidir.','l4-debug'),
    q('boss','Fırlatmaya hazır manifest?',['Course version + URP + LevelUpPractice + D:/GameDev/Projects + yerel temel','Latest + başka projenin Assets’i','ZIP içi + belirsiz ad'],0,'Sürüm, şablon ve konum birbiriyle uyumludur.','l4-game'),
  ]},
  5:{title:'Editor Kontrol Odası',subtitle:'Her görev için doğru paneli, görünümü ve kanıt rotasını seç.',questions:[
    q('kavram','Sahneyi serbestçe düzenlediğin yüzey?',['Scene','Game','Console'],0,'Scene geliştiricinin düzenleme görünümüdür.','l5-map'),
    q('kavram','Etkin kameranın oyuncuya sunduğu çıktı?',['Game','Hierarchy','Project'],0,'Game görünümü runtime kamera çıktısını gösterir.','l5-scene-game'),
    q('kavram','Açık sahnedeki GameObject listesi?',['Hierarchy','Project','Inspector'],0,'Hierarchy sahne nesnelerini taşır.','l5-hierarchy'),
    q('kavram','Asset dosyalarının bulunduğu panel?',['Project','Game','Console'],0,'Project Assets ve paket içeriğini tarar.','l5-project'),
    q('kavram','Seçili öğenin özellik yüzeyi?',['Inspector','Scene','Toolbar'],0,'Inspector seçime göre değişir.','l5-inspector'),
    q('kavram','Log, warning ve error merkezi?',['Console','Hierarchy','Game'],0,'Console çalışma mesajlarını ve tanıları listeler.','l5-console'),
    q('senaryo','Scene’de orbit yaptın. Game kamerası?',['Kendiliğinden değişmez','Aynı oranda döner','Silinir'],0,'Scene gözlem kamerası oyun kamerasından ayrıdır.','l5-scene-game'),
    q('transfer','Bir Rock asset’inden üç sahne taşı oluşturulabilir mi?',['Evet','Hayır, asset tükenir','Yalnız Play Mode’da'],0,'Bir kaynak asset birden fazla sahne instance’ı üretebilir.','l5-project'),
    q('kavram','Seçili nesneyi merkeze getiren hareket?',['Focus','Scale','Clear'],0,'Focus Scene bakışını seçili hedefe taşır.','l5-navigation'),
    q('hata','Play Mode değişikliği neden riskli?',['Durdurunca geri dönebilir','Mutlaka kalıcıdır','Project’i siler'],0,'Runtime denemesi kalıcı düzenleme değildir.','l5-toolbar-play'),
    q('hata','Console Clear sonrası hata yeniden geliyor. Neden?',['Kök neden düzeltilmedi','Scene zoom oldu','Hierarchy filtrelendi'],0,'Clear mesaj görünümünü temizler, kaynağı değil.','l5-console'),
    q('boss','Panel kapandı, asset ve sahne sağlam. Güvenli çözüm?',['Window/Layout ile geri getir','Projeyi yeniden kur','Assets’i sil'],0,'Layout arayüz yerleşimidir ve geri yüklenebilir.','l5-layout'),
  ]},
  6:{title:'Sahne Montaj Atölyesi',subtitle:'GameObject, Component ve Transform kanıtlarıyla ilk sahne taslağını kur.',questions:[
    q('kavram','GameObject’in en doğru tanımı?',['Component taşıyan sahne varlığı','Yalnız görünür model','C# dosyası'],0,'GameObject kimlik, aktiflik, Transform ve Component koleksiyonu taşır.','l6-gameobject'),
    q('kavram','Nesneyi görünür çizen Component?',['Mesh Renderer','Collider','Transform'],0,'Renderer geometriyi material ve render ayarlarıyla çizer.','l6-component'),
    q('kavram','Geometri referansını hangi parça sağlar?',['Mesh Filter','Box Collider','Active state'],0,'Mesh Filter hangi mesh’in kullanılacağını taşır.','l6-cube-anatomy'),
    q('kavram','Yer, yön ve boyut üçlüsü?',['Position, Rotation, Scale','Log, Warning, Error','Scene, Game, Build'],0,'Transform üç ana uzamsal veri grubunu taşır.','l6-transform'),
    q('sıralama','Primitive oluşturma kanıtı?',['Menü → Hierarchy satırı → Scene seçimi → Inspector Transform','Game → Clear → ZIP','Build → sil → aç'],0,'Yeni nesne üç bağlı Editor yüzeyinde iz bırakır.','l6-create'),
    q('senaryo','Platform hedefi X=2, Y=0.5, Z=0. Hangi grup?',['Position','Rotation','Scale'],0,'Koordinatlar nesnenin sahnedeki konumunu belirler.','l6-position'),
    q('senaryo','Rampayı 45° eğmek?',['Rotation','Position','Active'],0,'Eğim yönelim değişimidir.','l6-rotation'),
    q('hata','Scene’de zoom yapınca Scale?',['Değişmez','İki kat olur','Sıfırlanır'],0,'Zoom gözlem kamerasını değiştirir.','l6-scale'),
    q('sıralama','İki platform üretme akışı?',['Rename → duplicate → yeni kopyayı rename → active kontrolü','Delete → build → import','Zoom → Console → ZIP'],0,'Kimlik ve seçim takibi günlük nesne işlemlerinin temelidir.','l6-object-ops'),
    q('transfer','Parent taşındığında iki child?',['Birlikte hareket eder','Silinir','Project’e döner'],0,'Child Transform parent dönüşümünü izler.','l6-parent-child'),
    q('hata','Nesne yok görünüyor; Hierarchy ve active doğru. Sıradaki kanıt?',['Focus + Position/Scale','Projeyi sil','Hub lisansını kapat'],0,'Konum ve ölçek gözden kaybolmanın güçlü nedenleridir.','l6-save-debug'),
    q('boss','Başarılı FirstBlockout kanıtı?',['Doğru nesneler + Transform + parent + Assets/Scenes kaydı','Yalnız güzel ekran görüntüsü','Tek Cube'],0,'Sahne yapısı, veri ve kayıt kanıtları birlikte gerekir.','l6-game'),
  ]},
};

export function LessonFinale({lesson,locale,onComplete,onReview}:{lesson:Lesson;locale:Locale;onComplete:()=>void;onReview?:(stepId:string)=>void}) {
  void locale;
  const pack=packs[lesson.order];
  const [started,setStarted]=useState(false);
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [firstAttempts,setFirstAttempts]=useState<boolean[]>([]);
  const [lockedFirst,setLockedFirst]=useState(false);
  const [finished,setFinished]=useState(false);
  const [awarded,setAwarded]=useState(false);
  const question=pack.questions[index];
  const correct=selected===question?.answer;
  const score=useMemo(()=>Math.round((firstAttempts.filter(Boolean).length/pack.questions.length)*100),[firstAttempts,pack.questions.length]);
  const projectedScore=index===pack.questions.length-1?score:Math.round((firstAttempts.filter(Boolean).length/pack.questions.length)*100);

  const choose=(option:number)=>{if(correct)return;if(!lockedFirst){setFirstAttempts((values)=>[...values,option===question.answer]);setLockedFirst(true);}setSelected(option);};
  const next=()=>{if(index===pack.questions.length-1){const passed=projectedScore>=70;setFinished(true);if(passed&&!awarded){setAwarded(true);onComplete();}return;}setIndex((value)=>value+1);setSelected(null);setLockedFirst(false);};
  const retry=()=>{setIndex(0);setSelected(null);setLockedFirst(false);setFirstAttempts([]);setFinished(false);};

  if(!started)return <section className="finale-launch"><div className="finale-orbit" aria-hidden="true"><i/><i/><i/><span><Icon name="spark" /></span></div><div><p className="section-kicker">DERS SONU · EN YÜKSEK XP</p><h2>{pack.title}</h2><p>{pack.subtitle} İlk seçimin ustalık puanına girer; yanlış seçimde açıklamayı okuyup doğru cevabı bulana kadar devam edersin.</p><ul><li><b>12</b><span>karma tur</span></li><li><b>%70</b><span>geçme eşiği</span></li><li><b>{lesson.steps.at(-1)?.xp}</b><span>XP</span></li></ul><button className="button button-primary finale-start" type="button" onClick={()=>setStarted(true)}>Etkinlik Bombası’nı başlat<Icon name="arrow-right" /></button></div></section>;

  if(finished){const passed=score>=70;const weak=pack.questions.filter((_,i)=>!firstAttempts[i]);return <section className={`finale-result ${passed?'passed':'needs-review'}`}><div className="finale-score-ring"><span>{score}</span><small>/ 100</small></div><p className="section-kicker">{passed?'DERS TAMAMLANDI':'HEDEFLİ TEKRAR GEREKLİ'}</p><h2>{passed?`${lesson.badge.tr.name} rozeti açıldı.`:'Temel var; eksik halkaları güçlendirip yeniden dene.'}</h2><p>{pack.questions.length} tur · {firstAttempts.filter(Boolean).length} ilk denemede doğru · {pack.questions.length-firstAttempts.filter(Boolean).length} tekrar</p>{passed?<div className="finale-rewards"><span><Icon name="spark" /><b>+{lesson.steps.at(-1)?.xp} XP</b></span><span><Icon name="check" /><b>{lesson.badge.tr.description}</b></span></div>:<div className="targeted-review"><strong>Tekrar edilmesi gereken duraklar</strong>{[...new Map(weak.map((item)=>[item.reviewStep,item])).values()].map((item)=><button key={item.reviewStep} type="button" onClick={()=>onReview?.(item.reviewStep)}><Icon name="repeat" /><span>{lesson.steps.find((step)=>step.id===item.reviewStep)?.title.tr}</span><Icon name="chevron-right" /></button>)}</div>}<button className="button button-primary" type="button" onClick={retry}>{passed?'Skorumu geliştirmek için yeniden oyna':'12 turu yeniden başlat'}<Icon name="repeat" /></button></section>;}

  const labels:Record<Question['type'],string>={kavram:'KAVRAM',sıralama:'SIRALAMA',hata:'HATA AVI',senaryo:'OYUN SENARYOSU',transfer:'TRANSFER',boss:'FİNAL KARARI'};
  return <section className={`finale-arena ${question.type}`}><header><div><span>{labels[question.type]}</span><strong>{index+1} / {pack.questions.length}</strong></div><div className="finale-progress"><i style={{width:`${((index+1)/pack.questions.length)*100}%`}} /></div><p><Icon name="spark" /> İlk deneme: {firstAttempts.filter(Boolean).length} doğru</p></header><main><p className="section-kicker">{pack.title}</p><h3>{question.prompt}</h3><div className="finale-options">{question.options.map((option,optionIndex)=><button type="button" key={option} className={selected===optionIndex?(optionIndex===question.answer?'correct':'incorrect'):correct&&optionIndex===question.answer?'correct':''} onClick={()=>choose(optionIndex)} disabled={correct}><b>{String.fromCharCode(65+optionIndex)}</b><span>{option}</span></button>)}</div>{selected!==null&&<div className={correct?'finale-feedback correct':'finale-feedback incorrect'}><Icon name={correct?'check':'close'} /><p>{correct?question.explanation:'Bu seçim kanıtla uyuşmuyor. İlgili öğenin görevini ve sistemde hangi soruya cevap verdiğini yeniden düşün.'}</p></div>}{correct&&<button className="button button-primary finale-next" type="button" onClick={next}>{index===pack.questions.length-1?'Final skorumu göster':'Sonraki tura geç'}<Icon name="arrow-right" /></button>}</main></section>;
}
