# LevelUp ücretsiz backend kurulumu

Bu sürüm Firebase Blaze veya kredi kartı istemez. GitHub Pages arayüzü, Cloudflare Workers Free üzerindeki API'ye; API de Cloudflare D1 Free veritabanına bağlanır.

## Güvenlik modeli

- Parolalar düz metin tutulmaz. Benzersiz salt, sunucu tarafında gizli pepper ve PBKDF2-SHA-256 ile türetilmiş özet saklanır.
- Öğrenci kendi şifresini değiştiremez; bu işleme açık bir API rotası yoktur.
- Admin öğrenci oluşturabilir, şifre sıfırlayabilir ve hesabı duraklatabilir.
- Şifre sıfırlama veya hesap durumu değişikliği açık oturumları geçersiz kılar.
- Beş hatalı girişten sonra hesap 15 dakika kilitlenir.
- XP yalnızca yayınlanmış müfredat manifestine göre sunucuda verilir; aynı adım ikinci kez puan kazandırmaz.
- Oturum belirteçlerinin yalnızca SHA-256 özeti veritabanında saklanır.
- CORS yalnızca canlı GitHub Pages adresi ve yerel geliştirme adreslerine izin verir.

## 1. Ücretsiz Cloudflare hesabında D1 oluştur

Cloudflare Dashboard içinde **Workers & Pages → D1 SQL Database → Create database** yolunu aç.

Veritabanı adı:

```text
levelup-academy
```

Oluşan veritabanının `database_id` değerini kopyala.

## 2. Cloudflare API token oluştur

**My Profile → API Tokens → Create Token → Edit Cloudflare Workers** şablonunu kullan. Token'ın şu yetkileri olmalı:

- Account / Workers Scripts / Edit
- Account / D1 / Edit

Hesap kimliğini de Workers ana sayfasındaki **Account ID** alanından kopyala.

## 3. GitHub Actions değişkenlerini ekle

Repo içinde **Settings → Secrets and variables → Actions → Variables** bölümüne şunları ekle:

| Değişken | Değer |
|---|---|
| `CLOUDFLARE_D1_DATABASE_ID` | Birinci adımda kopyalanan D1 kimliği |
| `LEVELUP_ADMIN_USERNAME` | Örneğin `admin` |

Canlı API adresi workflow içinde `https://levelup-academy-api.frkngndz60.workers.dev` olarak tanımlıdır. Bu nedenle ayrıca `VITE_API_BASE_URL` değişkeni oluşturman gerekmez. GitHub'da daha önce yanlış bir `VITE_API_BASE_URL` eklediysen silebilirsin; iş akışı artık onu kullanmaz.

## 4. GitHub Actions gizli değerlerini ekle

Aynı sayfadaki **Secrets** bölümüne şunları ekle:

| Secret | Açıklama |
|---|---|
| `CLOUDFLARE_API_TOKEN` | İkinci adımda oluşturulan token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare hesap kimliği |
| `LEVELUP_ADMIN_PASSWORD` | Senin belirlediğin, en az 10 karakterlik admin şifresi |

Parola pepper'ı ve geçici admin kurulum anahtarı GitHub Actions tarafından otomatik ve rastgele oluşturulur. Bunları terminalde üretmen veya GitHub'a elle eklemen gerekmez. Mevcut pepper sonraki dağıtımlarda korunur; kurulum anahtarıysa her dağıtımda otomatik yenilenir.

## 5. Tek dağıtımla etkinleştir

GitHub'da **Actions → Deploy to GitHub Pages → Run workflow** seçeneğini çalıştır. İş akışı otomatik olarak:

1. D1 tablolarını oluşturur veya günceller.
2. Worker API'yi dağıtır.
3. Pepper ve kurulum anahtarını güvenli biçimde kendisi üretip Worker secret olarak aktarır.
4. Admin hesabını oluşturur ya da GitHub'daki yeni parola ile günceller.
5. Siteyi API adresi gömülmüş biçimde GitHub Pages'e yayınlar.

Admin şifresini daha sonra değiştirmek için yalnızca `LEVELUP_ADMIN_PASSWORD` secret değerini değiştirip workflow'u yeniden çalıştır. Öğrenci şifreleri admin panelinden sıfırlanır.

## Ücretsiz kota notu

Workers Free ve D1 Free küçük sınıf/özel ders kullanımı için geniş kota sunar. Kota aşılırsa ücret çıkarmak yerine ücretsiz planın sınırı uygulanır. Trafik büyüdüğünde Cloudflare Dashboard kullanım ekranını kontrol et.
