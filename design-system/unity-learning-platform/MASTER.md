# Unity Öğrenme Platformu — Tasarım Sistemi

Bu dosya ürünün görsel kaynak noktasıdır. Sayfaya özel bir override varsa önce o uygulanır.

## Görsel tez

**Aydınlık oyun geliştirme laboratuvarı:** Unity Editor'ın teknik netliğini, modern bir eğitim ürününün sıcaklığı ve oyun arayüzlerinin güçlü geri bildirimiyle birleştir.

Referanslardaki mor/turuncu enerji korunur; çocuk fotoğrafları, rastgele uzay karalamaları, oyuncak görünüm, yoğun glassmorphism ve sürekli hareket kullanılmaz.

## Renkler

| Rol | Değer | Kullanım |
|---|---|---|
| `--color-primary` | `#6B55D9` | Ana eylem, aktif yol, focus |
| `--color-primary-strong` | `#523BB8` | Hover/pressed |
| `--color-accent` | `#F27649` | Önemli vurgu ve başarı anı |
| `--color-success` | `#238B6B` | Tamamlandı/doğru |
| `--color-warning` | `#B76A16` | Tekrar zamanı/uyarı |
| `--color-danger` | `#C83F54` | Hata ve yıkıcı işlem |
| `--color-background` | `#F8F7FC` | Ana zemin |
| `--color-surface` | `#FFFFFF` | Çalışma yüzeyi |
| `--color-surface-soft` | `#F0EDFA` | Seçili/ikincil yüzey |
| `--color-ink` | `#251D3A` | Başlık ve ana metin |
| `--color-muted` | `#655F72` | İkincil metin |
| `--color-border` | `#DDD8EA` | Sınır |

Tam sayfa koyu lacivert/mavi tema kullanılmaz. Renk tek başına durum anlatmaz; ikon, metin veya şekil eşlik eder.

## Tipografi

- UI ve metin: `Manrope`, sistem sans-serif fallback
- Kod: `JetBrains Mono`, monospace fallback
- Gövde: en az 16 px / 1.55 line-height
- Sürekli kullanılan label: en az 14 px
- Büyük başlıklar mobilde çalışma yüzeyini aşağı itmez
- Türkçe karakterler ve uzun İngilizce teknik terimler taşma testinden geçer

## Biçim

- Grid: 4 px temel birim
- Ana container: maksimum 1440 px
- Kart radius: 16 px; iç kontrol radius: 10–12 px
- Tam pill yalnızca chip, filtre ve küçük durumlarda
- Sınır: 1 px; gölge seyrek ve düşük kontrastlı
- Bir ekranı aynı görünümlü kartlarla doldurma; hiyerarşi için yüzey, boşluk ve tip ölçeğini birlikte kullan

## Navigasyon

- Desktop: dar sol rail veya bağlama göre üst bar; çalışma alanını ezmez
- Tablet: daraltılmış rail + içerik
- Mobil: en fazla beş hedefli bottom navigation; safe-area dahil
- Geri davranışı tarayıcı geçmişini korur
- Aktif öğe yalnızca renkle belirtilmez

## Motion

- Varsayılan easing: `cubic-bezier(.2,.8,.2,1)`
- Micro feedback: 140–180 ms
- Panel/route: 180–260 ms
- Progress/achievement: 350–700 ms
- Yalnızca transform ve opacity ile başlanır
- `prefers-reduced-motion` durumunda anlam kaybolmadan son kare gösterilir
- Görünmeyen döngüler Intersection Observer veya visibility state ile durur
- Aynı anda birden fazla sürekli dekoratif hareket yok

## Ders çalışma yüzeyi

- Desktop: kavram, uygulama, sonuç arasında net üçlü ilişki
- Mobil: aynı içerik “Öğren / Dene / Sonuç” adımlarına dönüşür
- Kod editörü koyu olabilir; tüm site koyu olmaz
- Doğru cevap kutlaması kısa ve odaklıdır
- Yanlış cevap öğrenciyi cezalandıran kırmızı ekran yerine hatanın nedenini görünür kılar

## İkon ve görseller

- Tutarlı SVG ikon ailesi; emoji ikon yok
- Unity/game görselleri kavramı veya öğrenci projesini açıklamalıdır
- Temsili görsel yerine gerçek ekran görüntüsü varsa onu kullan
- Maskot yalnızca öğretimsel veya duygusal bir görevi olduğunda görünür
- Görsellerde sabit en-boy oranı ile CLS önlenir

## Erişilebilirlik ve cihaz kapısı

- Metin kontrastı minimum 4.5:1
- Görünür 2 px focus ring
- Mobil dokunma alanı minimum 44 × 44 CSS px
- Hover hiçbir eylemin tek keşif yolu değildir
- Drag işlemlerine düğme/menü alternatifi bulunur
- 375, 768, 1024 ve 1440 px; %200 text zoom; iPhone safe-area test edilir

## Yasaklar

- Kırık Türkçe veya çevrilmiş API isimleri
- Koyu lacivert ana tema
- Rastgele gradient ve neon glow
- Her kartta scale/zıplama
- Anlamsız parallax
- Büyük pazarlama hero'sunun çalışma alanını aşağı itmesi
- Placeholder metin, sahte istatistik ve uydurma öğrenci verisi
- “Milyar dolarlık”, “devrim niteliğinde” gibi arayüz içi dolgu söylemleri
