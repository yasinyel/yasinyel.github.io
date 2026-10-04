# Kodlayalım

Anasınıfından liseye bilişim ve kodlama etkinlikleri — [kodlayalim.com](https://kodlayalim.com)

Tasarım ve geliştirme: **Yasin Yel**

## Yapı

- Derleme gerektirmeyen statik site (HTML, CSS, düz JavaScript). Vercel üzerinde yayınlanır; `main` dalına her gönderimde site kendiliğinden güncellenir.
- `*-motor.js` dosyaları etkinliklerin mantığıdır; tarayıcıda ve Node'da çalışır.
- `katalog.js` etkinlik listesinin ve rozetlerin tek kaynağıdır.
- `sw.js` çevrimdışı çalışma (PWA) içindir; dosya eklenip çıkarıldığında yeniden üretilmelidir.

## Komutlar

```bash
node test/hepsi.js        # bütün testler
node test/sw-guncelle.js  # sw.js dosya listesini ve sürümünü güncelle
```
