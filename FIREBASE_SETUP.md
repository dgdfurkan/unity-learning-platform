# LevelUp Firebase kurulumu

Bu kurulumda öğrenci arayüzü yalnızca **kullanıcı adı + şifre** ister. Öğrenciler için e-posta oluşturulmaz; güvenli giriş Cloud Function tarafından doğrulanır ve kısa ömürlü Firebase özel oturumu üretilir. Admin ise Firebase Authentication içindeki tek e-posta/parola hesabıdır. Arayüzde yine yalnızca `admin` kullanıcı adını yazar.

## 1. Firebase projesi

1. Firebase Console'da bir proje oluştur.
2. Projeyi **Blaze** planına geçir. Cloud Functions dağıtımı için gereklidir.
3. Firestore Database'i Native mode ile aç. Avrupa bölgesi kullanacaksan `eur3` uygundur. Bölge seçimi sonradan değiştirilemez.
4. Authentication → Sign-in method bölümünde yalnızca **Email/Password** sağlayıcısını aç. Bu sağlayıcı öğrencilere değil, yalnızca admine hizmet eder.
5. Authentication → Settings → Authorized domains bölümüne `dgdfurkan.github.io` alan adını ekle.
6. Project settings → Your apps bölümünden Web App oluştur ve çıkan web yapılandırma değerlerini kaydet.

## 2. Admin hesabı

Authentication → Users → Add user üzerinden hesabı kendin oluştur:

- E-posta: `admin@levelup.local`
- Parola: yalnızca senin bildiğin güçlü parola
- Display name: istediğin eğitmen adı

Oluşan kullanıcının **UID** değerini kopyala. Arayüzde e-posta girilmeyecek; `admin` yazıldığında uygulama bu sentetik adresi kendi tamamlar.

Admin kullanıcı adını veya alan adını değiştirmek istersen Firebase'deki e-posta ile GitHub'daki `VITE_ADMIN_USERNAME` ve `VITE_ADMIN_EMAIL_DOMAIN` değerlerini birlikte değiştir. UID değişirse `FIREBASE_ADMIN_UID` değerini de güncelle.

## 3. App Check

1. Firebase Console → App Check → web uygulaması.
2. reCAPTCHA v3 sağlayıcısını kaydet.
3. GitHub Pages alan adını (`dgdfurkan.github.io`) izinli alanlara ekle.
4. Site key değerini `VITE_FIREBASE_APPCHECK_SITE_KEY` olarak kullan.

Cloud Functions App Check olmadan çağrı kabul etmez. Bu koruma, giriş ve admin işlemlerinin başka bir siteden otomatik olarak kötüye kullanılmasını zorlaştırır.

## 4. Dağıtım hizmet hesabı

Google Cloud Console → IAM & Admin → Service Accounts üzerinden yalnızca bu projede kullanılacak bir dağıtım hesabı oluştur. Gereken roller:

- Cloud Functions Admin
- Service Account User
- Firebase Rules Admin
- Cloud Datastore Index Admin
- Secret Manager Admin
- Artifact Registry Administrator
- Cloud Build Editor

JSON anahtarını bir kez oluştur. Dosyayı repoya veya bilgisayardaki `.env` dosyasına koyma. JSON içeriğinin tamamı GitHub Secret olarak saklanacak.

## 5. GitHub → Settings → Secrets and variables → Actions

### Variables

| Ad | Değer |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_ADMIN_UID` | Authentication'daki admin UID |
| `VITE_FIREBASE_API_KEY` | Web app config `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Web app config `authDomain` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Web app config `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Web app config `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Web app config `appId` |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | reCAPTCHA v3 site key |
| `VITE_FIREBASE_FUNCTIONS_REGION` | `europe-west1` |
| `VITE_ADMIN_USERNAME` | `admin` |
| `VITE_ADMIN_EMAIL_DOMAIN` | `levelup.local` |

### Secrets

| Ad | Değer |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Hizmet hesabı JSON dosyasının eksiksiz içeriği |
| `FIREBASE_AUTH_PEPPER` | En az 64 rastgele karakter; bir parola yöneticisiyle üret |

`FIREBASE_AUTH_PEPPER` kaybolursa mevcut öğrenci şifreleri doğrulanamaz; güvenli bir parola yöneticisinde ayrıca sakla. Değiştirirsen öğrenci şifrelerini admin panelinden yeniden belirle.

## 6. Yayına alma

Değerleri ekledikten sonra Actions → **Deploy to GitHub Pages** → Run workflow. İş akışı şunları otomatik yapar:

1. siteyi Firebase web ayarlarıyla derler ve GitHub Pages'e gönderir;
2. `AUTH_PEPPER` sırrını Secret Manager'a aktarır;
3. Cloud Functions, Firestore rules ve indexleri dağıtır;
4. seçtiğin UID'ye admin claim'i uygular.

İlk dağıtımdan sonra admin hesabından çıkış yapıp yeniden giriş yap. Ardından admin panelinden öğrenci hesabı ve ödev oluşturabilirsin.

## Güvenlik davranışı

- Kullanıcı adları büyük/küçük harfe duyarsız normalize edilir.
- Beş hatalı öğrenci girişi hesabı 15 dakika kilitler.
- Öğrenci parolası scrypt + benzersiz salt + Secret Manager pepper ile saklanır; düz metin parola hiçbir koleksiyona yazılmaz.
- Öğrencilerin Firebase e-posta/parola hesabı yoktur ve şifre değiştirme uç noktası bulunmaz.
- Admin şifre yenilediğinde öğrencinin eski oturumları iptal edilir.
- İstemci Firestore'a doğrudan veri yazamaz; XP, ilerleme, öğrenci, ödev ve bildirim değişiklikleri yalnızca doğrulanan Cloud Functions üzerinden yapılır.
- Firestore kuralları admin/öğrenci rolünü, giriş sağlayıcısını, hesap durumunu ve öğrenci oturum sürümünü birlikte denetler.
- Sistem yalnızca GitHub değişkenindeki UID'yi aktif admin kabul eder; UID değiştirildiğinde eski admin tokenı beklemeden yetkisini kaybeder.
