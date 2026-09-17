# Claude Çalışma Rehberi

Bu dosya, Unity Öğrenme Platformu üzerinde çalışan tüm AI geliştiriciler için bağlayıcı proje kurallarını tanımlar.

## Önce oku

Her ürün veya arayüz değişikliğinden önce:

1. `PROJECT_BLUEPRINT.md`
2. `design-system/unity-learning-platform/MASTER.md`
3. Görevle ilgili `.claude/skills/<skill>/SKILL.md`

Kullanılacak temel proje skill'leri:

- `ui-ux-pro-max`: tasarım sistemi, responsive davranış, erişilebilirlik ve motion kararları
- `senior-frontend`: React, TypeScript, bileşen mimarisi ve bundle performansı
- `senior-architect`: sistem sınırları ve teknik karar kayıtları
- `performance-profiler`: ölçülebilir performans bütçeleri
- `playwright-pro`, `playwright-init`, `playwright-review`, `playwright-fix`: uçtan uca kalite

## Ürünün değişmezleri

- Bu platform tek bir öğrenciye özel değildir. Admin birden fazla öğrenci oluşturur ve yönetir.
- Öğrenci kendi hesabını açamaz. Hesap oluşturma yalnızca admin panelindeki güvenli sunucu işlemiyle yapılır.
- Varsayılan dil Türkçedir; İngilizce seçeneği bulunur.
- Unity/C# API ve dil adları çevrilmez: `Update`, `FixedUpdate`, `LateUpdate`, `Awake`, `OnEnable`, `Start`, `Transform`, `Rigidbody`, `Collider`, `SerializeField`, `private`, `public` olduğu gibi kalır.
- Görünen Türkçe doğal, düzgün ve C1 seviyesinde olmalıdır. Kırık, mekanik veya kelime kelime çevrilmiş metin kullanma.
- Çocuk uygulaması görünümü üretme. Referansların neşesini yetişkin bir geliştirici öğrenme ürününe uyarlarken oyuncak estetiğinden kaçın.
- “AI tasarımı” klişelerinden kaçın: rastgele parlayan bloblar, anlamsız glassmorphism, her kartta gradient, aşırı büyük başlık, aynı tip yuvarlatılmış kartların sonsuz tekrarı ve dekoratif hareket kalabalığı yok.
- Koyu lacivert ana tema kullanma. Ürün aydınlık ve ferah kalmalıdır.
- Gerçek ürün ekranında pazarlama hero alanını ana çalışma yüzeyinin önüne koyma.

## Mimari kurallar

- React + TypeScript kodunu feature tabanlı ve katmanlı düzenle.
- UI bileşenleri doğrudan Cloudflare D1 veya Worker iç ayrıntılarına erişemez.
- Uzak veri erişimini `DataGateway` ve servis adapter'larında tut; domain katmanı sağlayıcı türlerine bağımlı olmasın.
- Yetkilendirmeyi yalnızca arayüzde gizleme ile çözme. Rol denetimi bütün korumalı Worker rotalarında sunucu tarafında zorunludur.
- D1 kimliği dışındaki secret, parola pepper'ı veya dağıtım anahtarı hiçbir zaman istemci bundle'ına ya da repoya girmez.
- Yeni global state kütüphanesi eklemeden önce yerel state, URL state veya server state ile çözülemeyeceğini göster.
- SOLID ilkelerini pragmatik uygula. Tek kullanımlık soyutlama, gereksiz interface veya “pattern olsun diye pattern” üretme.
- Büyük özellikleri dikey dilimlerle geliştir: domain tipi + veri erişimi + ekran + durumlar + test.
- API çağrılarını ekran bileşenlerine yayma; sorgu sözleşmelerini gateway katmanında tut.

## Performans kuralları

- Tüm rota ve ağır deneyimler lazy-load edilir.
- Monaco, Three.js/R3F, grafikler ve simülasyon motorları ilk giriş paketine eklenmez.
- Etkileşim dışı animasyonlarda yalnızca `transform` ve `opacity` tercih edilir.
- Görünmeyen sekme, canvas ve sonsuz animasyonlar duraklatılır.
- Three.js kaynakları unmount sırasında `dispose()` edilir; cihaz piksel oranı sınırlandırılır.
- `prefers-reduced-motion` desteklenir.
- Ağ çağrılarında loading, empty, error, retry ve success durumları tasarlanır.
- Hedefler: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS < 0.1. Ölçmeden optimizasyon iddiası yazma.

## Responsive ve PWA kuralları

- En az 375, 768, 1024 ve 1440 px genişliklerinde doğrula.
- iPhone çentiği ve alt gesture alanı için `viewport-fit=cover` ile `env(safe-area-inset-*)` kullan.
- Dokunma hedefleri mobilde en az 44 × 44 CSS px olmalıdır.
- Mobilde hover zorunlu etkileşim oluşturma; drag işlemlerine buton alternatifi ekle.
- Yatay taşma, sabit navigasyon altında kalan içerik ve klavye açıldığında kaybolan form alanı kabul edilmez.
- PWA çevrimdışı modu uygulama kabuğunu ve daha önce indirilen okuma içeriklerini açabilir; kod çalıştırma ve senkronizasyon çevrimiçi durum ister.

## Eğitim deneyimi kuralları

- Platform hızlı öğrenme ihtiyacını destekler fakat tüm öğrencileri aynı 25–30 ders şablonuna kilitlemez.
- İlk öğrenci için “Hızlı Başlangıç” yolu 20–25 saat / yaklaşık 25–30 oturum olarak yapılandırılabilir.
- Her kavram anlatım → etkileşim → kodlama → Unity uygulaması → kısa geri çağırma döngüsüyle ilerler.
- Beşinci ders ve sonrasında önceki kavramlardan kısa tekrarlar otomatik karıştırılır.
- XP ile gerçek yeterlilik puanını ayır. Çok tıklamak, konuyu öğrenmiş sayılmamalıdır.
- AI tarafından üretilen kod doğrudan doğru kabul edilmez; öğrenci kodu açıklamalı, test etmeli ve değiştirebilmelidir.
- Asset Store paketi kullanımı lisans, bağımlılık, performans, mimari ve anlamlı değişiklik denetiminden geçmelidir.

## Arayüz ve motion

- Birincil ekranlar çalışma yüzeyidir: öğrenci için devam edilecek ders; admin için öğrenciler ve bekleyen işler.
- Desktop ders çalışma alanı gerektiğinde üç bölmeli olabilir; mobilde tek görev odaklı adımlara dönüşür.
- Animasyon bir neden taşır: durum değişikliği, doğru/yanlış geri bildirimi, ilerleme, mekânsal geçiş veya simülasyon sonucu.
- Dekoratif sürekli hareket sayfa başına en fazla bir odakta bulunur ve görünmezken durur.
- Aynı ekranda her kartı zıplatma, sürekli parallax veya dikkat çalan imleç efektleri kullanma.
- Tutarlı SVG ikon seti kullan; emoji ikon kullanma.

## Test ve teslim kapısı

- Kritik akışlar: giriş, rol yönlendirme, admin öğrenci oluşturma, ödev atama, öğrenci gönderimi, puan güncelleme, tekrar kuyruğu.
- Worker + yerel D1 ile kimlik, rol, oturum iptali ve veri sahipliği senaryolarını test et.
- Playwright ile desktop, tablet ve mobil görünüm; klavye navigasyonu; güvenli alan; çevrimdışı PWA kabuğu kontrol edilir.
- Test için kullanılan demo yetki hiçbir üretim bundle'ında kalamaz.
- Bir özelliği “tamamlandı” saymadan önce boş, yükleniyor, hata, yetkisiz ve başarılı durumlarını doğrula.

## İçerik sınırı

Kursun ayrıntılı ders metinlerini, ödevlerini ve bütün soru bankasını kullanıcı istemeden üretme. Şimdilik ürün sistemi ve içerik motoru hazırlanır; müfredat ayrıntıları ayrı aşamada ele alınır.
