// Kodlayalım — etkinlik kataloğu
// Ana sayfa, profil, öğretmen paneli ve görevler bu tek listeyi kullanır.
// Yeni etkinlik eklemek için ETKINLIKLER'e bir nesne eklemek yeterli.
// sinif: [en küçük, en büyük]; 0 = anasınıfı.
// parcalar: öğretmenin görev olarak verebileceği ve ilerlemesini izleyebileceği bölümler.
//   seviye: bölüm sayısı, yildiz(): her bölüm için 0–3 yıldız dizisi (bu cihazdaki kayıttan)
(function (root) {
    'use strict';
    const oku = (k, v) => root.KL ? root.KL.oku(k, v) : v;
    // Python görev kimlikleri (python-motor.js yüklenmeyen sayfalar için; test/katalog.test.js eşleştiğini denetler)
    const PYTHON_IDLER = ['merhaba', 'parcalar', 'gb', 'birlestir', 'islemler', 'selam', 'kb', 'sure', 'pilsure', 'sifreuzun', 'cifttek', 'pildurum', 'ipoktet', 'giris', 'gerisay', 'kuvvet', 'sensor', 'piksel', 'bipbop', 'tahminoyun', 'sesli', 'palindrom', 'ping', 'kelime', 'gizle', 'ikilik', 'onluk', 'sezar', 'guc', 'ara', 'sirala', 'asal'];
    const dizi = (n, f) => Array.from({ length: n }, (_, i) => f(i) || 0);

    const ETKINLIKLER = [
        {
            id: 'sensin', ad: 'Bilgisayar Sensin', url: 'sensin.html', ikon: 'fa-arrows-up-down-left-right', renk: '#0ea5e9', sinif: [0, 12],
            aciklama: 'Kodu oku, bilgisayarın yerine sen çalıştır: karakteri yön tuşlarıyla kodun söylediği gibi hareket ettir. Her kademeye ayrı kod dili.',
            etiket: ['Kod okuma', 'Algoritma', 'Döngü', 'Koşul', 'Fonksiyon'], kavram: 'Okla (okul öncesi), blokla (ilkokul), Türkçe kodla (ortaokul) ve Python ile (lise) kod izleme', sure: 'Bölüm başı 2–5 dk',
            parcalar: [
                { id: 'sensin.okuloncesi', ad: 'Okul Öncesi (oklar)', url: 'sensin.html?kademe=okuloncesi', sinif: [0, 1], seviye: 10, yildiz: () => { const k = oku('sensin', {}).okuloncesi || {}; return dizi(10, i => k[i]); } },
                { id: 'sensin.ilkokul', ad: 'İlkokul (bloklar)', url: 'sensin.html?kademe=ilkokul', sinif: [2, 4], seviye: 10, yildiz: () => { const k = oku('sensin', {}).ilkokul || {}; return dizi(10, i => k[i]); } },
                { id: 'sensin.ortaokul', ad: 'Ortaokul (Türkçe kod)', url: 'sensin.html?kademe=ortaokul', sinif: [5, 8], seviye: 11, yildiz: () => { const k = oku('sensin', {}).ortaokul || {}; return dizi(11, i => k[i]); } },
                { id: 'sensin.lise', ad: 'Lise (Python)', url: 'sensin.html?kademe=lise', sinif: [9, 12], seviye: 12, yildiz: () => { const k = oku('sensin', {}).lise || {}; return dizi(12, i => k[i]); } }
            ]
        },
        {
            id: 'oruntu', ad: 'Örüntü Bul', url: 'oruntu.html', ikon: 'fa-shapes', renk: '#f59e0b', sinif: [0, 2],
            aciklama: 'Sıradaki ne? Tekrar eden kalıbı bul, soru işaretinin yerine geleni seç. Okuma bilmeye gerek yok.',
            etiket: ['Örüntü', 'Dikkat', 'Okuma gerekmez'], kavram: 'Örüntü tanıma, tekrar eden kalıplar (algoritmik düşünmenin temeli)', sure: '10 dk',
            parcalar: [{ id: 'oruntu', ad: 'Örüntü Bul', url: 'oruntu.html', seviye: 8, yildiz: () => { const k = oku('oruntu', { yildiz: {} }).yildiz; return dizi(8, i => k[i]); } }]
        },
        {
            id: 'piksel', ad: 'Piksel Kodlama', url: 'piksel.html', ikon: 'fa-border-all', renk: '#f97316', sinif: [2, 8],
            aciklama: 'Satır kodlarını çöz, gizli resmi boya. Kendi resmini tasarla ve arkadaşlarına bulmaca olarak gönder.',
            etiket: ['Resim kodlama', 'Sıkıştırma', 'Tasarım'], kavram: 'Resimlerin sayısal temsili, piksel, sıkıştırma (RLE)', sure: '15–25 dk',
            parcalar: [{ id: 'piksel', ad: 'Piksel Kodlama', url: 'piksel.html', seviye: 8, yildiz: () => { const k = oku('piksel', { tamam: {} }).tamam; return dizi(8, i => (k[i] ? 3 : 0)); } }]
        },
        {
            id: 'robot', ad: 'Robot Kodla', url: 'robot.html', ikon: 'fa-robot', renk: '#1d5fd6', sinif: [3, 8],
            aciklama: 'Robotu Türkçe komutlarla programla, bütün yıldızları topla. Ne kadar kısa kod, o kadar çok yıldız!',
            etiket: ['Sıralama', 'Döngüler', 'Koşullar', 'Fonksiyonlar'], kavram: 'Kod yazma: sıralı komut, parametre, döngü, koşul, fonksiyon, labirent algoritması', sure: '15–30 dk',
            parcalar: [{ id: 'robot', ad: 'Robot Kodla', url: 'robot.html', seviye: 14, yildiz: () => { const k = oku('robot', { yildiz: {} }).yildiz; return dizi(14, i => k[i]); } }]
        },
        {
            id: 'hata', ad: 'Hata Avcısı', url: 'hata.html', ikon: 'fa-bug', renk: '#e5484d', sinif: [3, 12],
            aciklama: 'Robot yanlış yere gitti! Gitmesi gereken yolla gittiği yolu karşılaştır, koddaki hatayı bul ve düzelt. Hatalar her seferinde yeniden üretilir.',
            etiket: ['Hata ayıklama', 'Debugging', 'Sonsuz soru'], kavram: 'Hata ayıklama: beklenen ve gerçekleşen davranışı karşılaştırma, sınır değerleri, operatörler', sure: 'Tur başı 5–10 dk',
            parcalar: [{ id: 'hata', ad: 'Hata Avcısı', url: 'hata.html', seviye: 3, yildiz: () => { const k = oku('hata', {}); return ['ilkokul', 'ortaokul', 'lise'].map(x => k[x] || 0); } }]
        },
        {
            id: 'ikilik', ad: 'İkilik Kartlar', url: 'ikilik.html', ikon: 'fa-toggle-on', renk: '#16a36a', sinif: [4, 10],
            aciklama: 'Kartları çevirerek sayıları 0 ve 1\'lerle göster. Bilgisayarın dilini keşfet: bit, bayt ve ikilik sayı sistemi.',
            etiket: ['Veri temsili', 'İkilik sistem', 'Bit / Bayt'], kavram: 'İkilik sayı sistemi, bit, bayt, veri temsili', sure: '15–20 dk',
            parcalar: [{ id: 'ikilik', ad: 'İkilik Kartlar', url: 'ikilik.html', seviye: 5, yildiz: () => { const k = oku('ikilik', { yildiz: {} }).yildiz; return dizi(5, i => k[i]); } }]
        },
        {
            id: 'algoritma', ad: 'Algoritma Sensin', url: 'algoritma.html', ikon: 'fa-arrow-down-wide-short', renk: '#8b5cf6', sinif: [3, 12],
            aciklama: 'Arama ve sıralama algoritmalarını işlemci gibi adım adım kendin yürüt. Sonunda kaç adımda bitirdiğini karşılaştır.',
            etiket: ['Arama', 'Sıralama', 'Verimlilik'], kavram: 'En büyüğü bulma, doğrusal ve ikili arama, kabarcık, seçmeli ve eklemeli sıralama', sure: 'Algoritma başı 3–6 dk',
            parcalar: [{ id: 'algoritma', ad: 'Algoritma Sensin', url: 'algoritma.html', seviye: 6, yildiz: () => { const k = oku('algoritma', {}); return ['enbuyuk', 'dogrusal', 'ikili', 'kabarcik', 'secmeli', 'eklemeli'].map(x => k[x] || 0); } }]
        },
        {
            id: 'mantik', ad: 'Mantık Kapıları', url: 'mantik.html', ikon: 'fa-microchip', renk: '#0891b2', sinif: [5, 12],
            aciklama: 'VE, VEYA, DEĞİL kapılarıyla devre kur, doğruluk tablosunu doldur. Sonunda bilgisayarın toplama devresini kendin inşa et.',
            etiket: ['Mantık', 'Doğruluk tablosu', 'Donanım'], kavram: 'Mantık kapıları, doğruluk tablosu, XOR, yarım ve tam toplayıcı', sure: '20–30 dk',
            parcalar: [{ id: 'mantik', ad: 'Mantık Kapıları', url: 'mantik.html', seviye: 11, yildiz: () => { const k = oku('mantik', {}); return dizi(11, i => k[i]); } }]
        },
        {
            id: 'cizim', ad: 'Çizim Atölyesi', url: 'cizim.html', ikon: 'fa-pen-nib', renk: '#16a36a', sinif: [3, 12],
            aciklama: 'Blokları sürükle, kalemli robotumuza çizim yaptır: kare, yıldız, çiçek, kar tanesi… Lisede aynı görevleri gerçek Python koduyla yaz.',
            etiket: ['Blok kodlama', 'Döngü', 'Fonksiyon', 'Python'], kavram: 'Sürükle-bırak blok kodlama, açılar, döngüler, iç içe döngü, fonksiyon, sayaç; Python (turtle modülü)', sure: 'Bölüm başı 3–8 dk',
            parcalar: [{ id: 'cizim', ad: 'Çizim Atölyesi', url: 'cizim.html', seviye: 16, yildiz: () => { const k = oku('cizim', { yildiz: {} }).yildiz; return dizi(16, i => k[i]); } }]
        },
        {
            id: 'sifre', ad: 'Gizli Mesaj', url: 'sifre.html', ikon: 'fa-user-secret', renk: '#0f766e', sinif: [4, 12],
            aciklama: 'Sezar çarkıyla şifrele, kaba kuvvetle ve frekans analiziyle şifre kır, Vigenère\'i çöz, modern şifrelemenin neden kırılamadığını hesapla.',
            etiket: ['Şifreleme', 'Kriptoloji', 'Frekans analizi'], kavram: 'Sezar ve Vigenère şifreleri, kaba kuvvet, frekans analizi, anahtar uzunluğu ve AES', sure: 'Bölüm başı 5–10 dk',
            parcalar: [{ id: 'sifre', ad: 'Gizli Mesaj', url: 'sifre.html', seviye: 7, yildiz: () => { const k = oku('sifre', {}); return ['sezar1', 'sezar2', 'kaba', 'frekans', 'vig1', 'vig2', 'guc'].map(x => k[x] || 0); } }]
        },
        {
            id: 'guvenlik', ad: 'Şifre Kalesi', url: 'guvenlik.html', ikon: 'fa-shield-halved', renk: '#dc2626', sinif: [3, 12],
            aciklama: 'Şifrenin gücünü canlı ölç, oltalama e-postalarındaki ipuçlarını yakala, gerçek hayattaki güvenlik durumlarında doğru kararı ver.',
            etiket: ['Bilgi güvenliği', 'Oltalama', 'Dijital vatandaşlık'], kavram: 'Güçlü şifre, parola cümlesi, oltalama (phishing), iki adımlı doğrulama, kişisel veri, güvenli internet', sure: 'Bölüm başı 5–10 dk',
            parcalar: [{ id: 'guvenlik', ad: 'Şifre Kalesi', url: 'guvenlik.html', seviye: 4, yildiz: () => { const k = oku('guvenlik', {}); return ['lab', 'cift', 'olta', 'durum'].map(x => k[x] || 0); } }]
        },
        {
            id: 'yz', ad: 'Makineye Öğret', url: 'yz.html', ikon: 'fa-brain', renk: '#c026d3', sinif: [3, 12],
            aciklama: 'Gerçek bir yapay zekâ modelini örneklerle eğit. Önyargılı verinin modeli nasıl yanılttığını gör, lisede aşırı öğrenmeyi keşfet.',
            etiket: ['Yapay zekâ', 'Makine öğrenmesi', 'Veri önyargısı'], kavram: 'Eğitim verisi, sınıflandırma, k-en yakın komşu, veri önyargısı, aşırı öğrenme (overfitting)', sure: 'Bölüm başı 8–12 dk',
            parcalar: [{ id: 'yz', ad: 'Makineye Öğret', url: 'yz.html', seviye: 4, yildiz: () => { const k = oku('yz', {}); return ['radar', 'onyargi', 'kural', 'knn'].map(x => k[x] || 0); } }]
        },
        {
            id: 'ag', ad: 'Paket Yolculuğu', url: 'ag.html', ikon: 'fa-network-wired', renk: '#2563eb', sinif: [4, 12],
            aciklama: 'İnternet nasıl çalışır? Paketleri birleştir, yönlendirici ol ve en hızlı yolu bul, DNS ile bir adresi çöz, IP adreslerini incele.',
            etiket: ['İnternet', 'Ağlar', 'DNS', 'IP'], kavram: 'Paketler ve TCP, yönlendirme ve en kısa yol, TTL, DNS hiyerarşisi, IPv4 adresleri', sure: 'Bölüm başı 5–10 dk',
            parcalar: [{ id: 'ag', ad: 'Paket Yolculuğu', url: 'ag.html', seviye: 4, yildiz: () => { const k = oku('ag', {}); return ['paket', 'yonlendir', 'dns', 'ip'].map(x => k[x] || 0); } }]
        },
        {
            id: 'web', ad: 'Web Atölyesi', url: 'web.html', ikon: 'fa-code', renk: '#ea580c', sinif: [5, 12],
            aciklama: 'HTML ve CSS ile kendi web sayfanı yap. Yazdıkça önizleme anında değişir, görevler kendiliğinden işaretlenir.',
            etiket: ['HTML', 'CSS', 'Web tasarım'], kavram: 'HTML etiketleri, liste, bağlantı, resim ve alt metni, tablo; CSS renk, sınıf, kutu modeli, flexbox', sure: 'Bölüm başı 5–10 dk',
            parcalar: [{ id: 'web', ad: 'Web Atölyesi', url: 'web.html', seviye: 10, yildiz: () => { const k = oku('web', { yildiz: {} }).yildiz; return dizi(10, i => k[i]); } }]
        },
        {
            id: 'oyun', ad: 'Oyun Atölyesi', url: 'oyun.html', ikon: 'fa-gamepad', renk: '#db2777', sinif: [3, 12],
            aciklama: 'Bloklarla kendi oyununu yap: tuşla hareket, puan, can, çarpışma. Bitirince linkini arkadaşlarına gönder, onlar da oynasın.',
            etiket: ['Oyun tasarımı', 'Olaylar', 'Değişkenler'], kavram: 'Olay tabanlı programlama, koordinat sistemi, değişken (puan/can), koşul, çarpışma, paralel betikler', sure: 'Görev başı 10–15 dk',
            parcalar: [{ id: 'oyun', ad: 'Oyun Atölyesi', url: 'oyun.html', seviye: 5, yildiz: () => { const k = oku('oyun', { yildiz: {} }).yildiz; return ['balon', 'hareket', 'yildiz', 'dusman', 'kazan'].map(g => k[g] || 0); } }]
        },
        {
            id: 'donanim', ad: 'Bilgisayarın İçi', url: 'donanim.html', ikon: 'fa-screwdriver-wrench', renk: '#475569', sinif: [1, 12],
            aciklama: 'Parçaları anakarta takıp bilgisayarı çalıştır, parçaları görevleriyle eşleştir, girdi-çıktı birimlerini ayır, veri birimlerini hesapla, arızaları bul.',
            etiket: ['Donanım', 'Girdi-çıktı', 'Veri birimleri'], kavram: 'Anakart, işlemci, bellek (RAM), depolama (SSD), ekran kartı, güç kaynağı; girdi/çıktı/depolama birimleri; bit, bayt, KB, MB, GB, TB; temel sorun giderme', sure: 'Bölüm başı 5–10 dk',
            parcalar: [{ id: 'donanim', ad: 'Bilgisayarın İçi', url: 'donanim.html', seviye: 5, yildiz: () => { const k = oku('donanim', { yildiz: {} }).yildiz; return ['topla', 'eslestir', 'sinifla', 'birim', 'ariza'].map(b => k[b] || 0); } }]
        },
        {
            id: 'tablo', ad: 'Tablo Atölyesi', url: 'tablo.html', ikon: 'fa-table-cells', renk: '#15803d', sinif: [5, 12],
            aciklama: 'Gerçek bir hesap tablosunda formül yaz: TOPLA, ORTALAMA, EĞER, EĞERSAY, sabit başvurular ve doldurma. Görevler kendiliğinden denetlenir.',
            etiket: ['Hesap tablosu', 'Formül', 'Veri'], kavram: 'Hücre ve aralık başvurusu, formül, fonksiyon, göreli ve mutlak ($) başvuru, doldurma, koşullu fonksiyonlar, yüzde ve yuvarlama', sure: 'Görev başı 3–8 dk',
            parcalar: [{ id: 'tablo', ad: 'Tablo Atölyesi', url: 'tablo.html', seviye: 14, yildiz: () => { const k = oku('tablo', { yildiz: {} }).yildiz; return ['topla', 'ortalama', 'makmin', 'carp', 'genel', 'mutlak', 'eger', 'egersay', 'etopla', 'yuzde', 'birlestir', 'uzunluk', 'gb', 'karne'].map(g => k[g] || 0); } }]
        },
        {
            id: 'klavye', ad: 'Klavye Ustası', url: 'klavye.html', ikon: 'fa-keyboard', renk: '#0891b2', sinif: [1, 12],
            aciklama: 'On parmak klavye kullanmayı öğren: Türkçe Q klavyede 20 ders, renkli parmak rehberi, kelime yağmuru oyunu ve hız testi.',
            etiket: ['On parmak', 'Klavye', 'Hız'], kavram: 'Klavye düzeni, ana sıra, parmak konumu, doğruluk ve hız (kelime/dk), büyük harf, noktalama, rakamlar', sure: 'Ders başı 3–5 dk',
            parcalar: [{ id: 'klavye', ad: 'Klavye Ustası', url: 'klavye.html', seviye: 20, yildiz: () => { const k = oku('klavye', { yildiz: {} }).yildiz; return dizi(20, i => k[i]); } }]
        },
        {
            id: 'devre', ad: 'KodKart Simülatörü', url: 'devre.html', ikon: 'fa-microchip', renk: '#0f766e', sinif: [3, 12],
            aciklama: '5×5 LED ekranlı, düğmeli ve sensörlü sanal eğitim kartını bloklarla programla: atan kalp, zar, termometre, gece lambası, kapı zili.',
            etiket: ['Fiziksel programlama', 'Sensörler', 'Olaylar'], kavram: 'Girdi-işlem-çıktı, olaylar (düğme, sallama), sensör okuma, LED koordinatları, değişken, rastgele sayı, koşul, sonsuz döngü, ses', sure: 'Görev başı 10 dk',
            parcalar: [{ id: 'devre', ad: 'KodKart Simülatörü', url: 'devre.html', seviye: 8, yildiz: () => { const k = oku('devre', { yildiz: {} }).yildiz; return ['kalp', 'isim', 'sayac', 'zar', 'termo', 'gece', 'tkm', 'zil'].map(g => k[g] || 0); } }]
        },
        {
            id: 'veri', ad: 'Veri Bilimi Atölyesi', url: 'veri.html', ikon: 'fa-chart-column', renk: '#0369a1', sinif: [3, 12],
            aciklama: 'Veri tablosunu oku, doğru grafiği seç ve çiz, ortalama ile ortancayı yorumla, yanıltıcı grafikleri yakala, kendi anketini yap.',
            etiket: ['Veri okuryazarlığı', 'Grafik', 'İstatistik'], kavram: 'Tablo sıralama/süzme, grafik türleri, ortalama, ortanca, tepe değer, açıklık, uç değer, yanıltıcı grafikler, korelasyon ve nedensellik, anket', sure: 'Bölüm başı 10 dk',
            parcalar: [{ id: 'veri', ad: 'Veri Bilimi Atölyesi', url: 'veri.html', seviye: 6, yildiz: () => { const k = oku('veri', { yildiz: {} }).yildiz; return ['tablo', 'grafik', 'ortalama', 'yaniltici', 'iliski', 'anket'].map(b => k[b] || 0); } }]
        },
        {
            id: 'dijital', ad: 'Dijital Dedektif', url: 'dijital.html', ikon: 'fa-user-secret', renk: '#0f766e', sinif: [3, 12],
            aciklama: 'Sahte haberleri ve gizli reklamları yakala, kişisel bilgilerini koru, siber zorbalığa dur de, telif ve lisansları öğren.',
            etiket: ['Medya okuryazarlığı', 'Dijital vatandaşlık', 'Telif hakkı'], kavram: 'Kaynak doğrulama, tersine görsel arama, deepfake, tık tuzağı, reklam/sponsorluk, dijital ayak izi, siber zorbalık, Creative Commons lisansları', sure: 'Bölüm başı 10 dk',
            parcalar: [{ id: 'dijital', ad: 'Dijital Dedektif', url: 'dijital.html', seviye: 5, yildiz: () => { const k = oku('dijital', { yildiz: {} }).yildiz; return ['haber', 'reklam', 'ayakizi', 'zorbalik', 'telif'].map(b => k[b] || 0); } }]
        },
        {
            id: 'python', ad: 'Python Laboratuvarı', url: 'python.html', ikon: 'fa-laptop-code', renk: '#2563eb', sinif: [5, 12],
            aciklama: 'Tarayıcıda gerçek Python yaz ve çalıştır. 32 görev kendiliğinden değerlendirilir, hatalar Türkçe açıklanır. Kurulum gerekmez.',
            etiket: ['Python', 'Metin tabanlı kodlama', 'Algoritma'], kavram: 'print, değişken, input/int, if/elif/else, for/while, metin ve liste işlemleri, fonksiyon, arama ve sıralama algoritmaları', sure: 'Görev başı 5–15 dk',
            parcalar: [{ id: 'python', ad: 'Python Laboratuvarı', url: 'python.html', seviye: 32, yildiz: () => { const k = oku('python', { yildiz: {} }).yildiz; return (typeof PythonMotor !== 'undefined' ? PythonMotor.GOREVLER.map(g => g.id) : PYTHON_IDLER).map(id => k[id] || 0); } }]
        },
        {
            id: 'tahmin', ad: 'Ne Yazar?', url: 'tahmin.html', ikon: 'fa-terminal', renk: '#7c3aed', sinif: [8, 12],
            aciklama: 'Python kodunu bilgisayar gibi oku ve ekrana ne yazacağını tahmin et. Sorular her seferinde farklı sayılarla gelir.',
            etiket: ['Python', 'Değişkenler', 'Kod okuma'], kavram: 'Değişken, operatör, metin, if/else, for/while, liste, fonksiyon (Python)', sure: 'Seviye başı 5–10 dk',
            parcalar: [{ id: 'tahmin', ad: 'Ne Yazar?', url: 'tahmin.html', seviye: 5, yildiz: () => { const k = oku('tahmin', { yildiz: {} }).yildiz; return dizi(5, i => k[i]); } }]
        }
    ];

    const PARCALAR = ETKINLIKLER.flatMap(e => e.parcalar.map(p => ({ ...p, etkinlik: e, sinif: p.sinif || e.sinif })));
    const parca = (id) => PARCALAR.find(p => p.id === id);

    // ---------- Rozetler ----------
    const toplam = (id) => parca(id).yildiz().reduce((a, b) => a + b, 0);
    const tamam = (id) => parca(id).yildiz().every(x => x > 0);
    const ROZETLER = [
        { id: 'ilk', ad: 'İlk Adım', ikon: 'fa-shoe-prints', aciklama: 'Herhangi bir etkinlikte ilk yıldızını kazan', kosul: () => PARCALAR.some(p => p.yildiz().some(x => x > 0)) },
        { id: 'oklar', ad: 'Yön Ustası', ikon: 'fa-arrows-up-down-left-right', aciklama: 'Bilgisayar Sensin okul öncesi bölümlerini bitir', kosul: () => tamam('sensin.okuloncesi') },
        { id: 'blok', ad: 'Blok Ustası', ikon: 'fa-puzzle-piece', aciklama: 'Bilgisayar Sensin ilkokul bölümlerini bitir', kosul: () => tamam('sensin.ilkokul') },
        { id: 'kodokur', ad: 'Kod Okuru', ikon: 'fa-code', aciklama: 'Bilgisayar Sensin ortaokul bölümlerini bitir', kosul: () => tamam('sensin.ortaokul') },
        { id: 'python', ad: 'Pythoncu', ikon: 'fa-terminal', aciklama: 'Bilgisayar Sensin lise bölümlerini bitir', kosul: () => tamam('sensin.lise') },
        { id: 'oruntu', ad: 'Örüntü Dedektifi', ikon: 'fa-shapes', aciklama: 'Örüntü Bul\'un bütün seviyelerini bitir', kosul: () => tamam('oruntu') },
        { id: 'robot', ad: 'Robot Mühendisi', ikon: 'fa-robot', aciklama: 'Robot Kodla\'nın 14 bölümünü bitir', kosul: () => tamam('robot') },
        { id: 'labirent', ad: 'Labirent Kaşifi', ikon: 'fa-route', aciklama: 'Robot Kodla labirent bölümünü 3 yıldızla geç', kosul: () => parca('robot').yildiz()[13] === 3 },
        { id: 'hata', ad: 'Hata Avcısı', ikon: 'fa-bug', aciklama: 'Hata Avcısı\'nda bir turu kusursuz bitir', kosul: () => parca('hata').yildiz().some(x => x === 3) },
        { id: 'bit', ad: 'Bit Bilgini', ikon: 'fa-toggle-on', aciklama: 'İkilik Kartlar\'da 1 bayt seviyesini geç', kosul: () => parca('ikilik').yildiz()[3] > 0 },
        { id: 'piksel', ad: 'Piksel Sanatçısı', ikon: 'fa-palette', aciklama: '8 piksel resminin hepsini çöz', kosul: () => tamam('piksel') },
        { id: 'arama', ad: 'Arama Motoru', ikon: 'fa-magnifying-glass', aciklama: 'İkili aramayı 3 yıldızla tamamla', kosul: () => parca('algoritma').yildiz()[2] === 3 },
        { id: 'siralama', ad: 'Sıralama Makinesi', ikon: 'fa-arrow-down-wide-short', aciklama: 'Üç sıralama algoritmasının hepsini tamamla', kosul: () => parca('algoritma').yildiz().slice(3).every(x => x > 0) },
        { id: 'devre', ad: 'Devre Tasarımcısı', ikon: 'fa-microchip', aciklama: 'Tam toplayıcı devresini kur', kosul: () => parca('mantik').yildiz()[10] > 0 },
        { id: 'python2', ad: 'Python Yorumlayıcısı', ikon: 'fa-laptop-code', aciklama: 'Ne Yazar?\'ın bütün seviyelerini bitir', kosul: () => tamam('tahmin') },
        { id: 'sanatci', ad: 'Çizgi Ustası', ikon: 'fa-pen-nib', aciklama: 'Çizim Atölyesi\'nin 16 bölümünü bitir', kosul: () => tamam('cizim') },
        { id: 'kriptograf', ad: 'Kod Kırıcı', ikon: 'fa-user-secret', aciklama: 'Frekans analiziyle şifre kır', kosul: () => parca('sifre').yildiz()[3] > 0 },
        { id: 'kalkan', ad: 'Siber Kalkan', ikon: 'fa-shield-halved', aciklama: 'Şifre Kalesi\'nin dört bölümünü bitir', kosul: () => tamam('guvenlik') },
        { id: 'oltaci', ad: 'Oltalama Avcısı', ikon: 'fa-fish', aciklama: 'Oltalama Avı\'nı hatasız bitir', kosul: () => parca('guvenlik').yildiz()[2] === 3 },
        { id: 'yzegitmen', ad: 'Yapay Zekâ Eğitmeni', ikon: 'fa-brain', aciklama: 'Makineye Öğret\'in dört bölümünü bitir', kosul: () => tamam('yz') },
        { id: 'agmuh', ad: 'Ağ Mühendisi', ikon: 'fa-network-wired', aciklama: 'Paket Yolculuğu\'nun dört bölümünü bitir', kosul: () => tamam('ag') },
        { id: 'webci', ad: 'Web Tasarımcısı', ikon: 'fa-code', aciklama: 'Web Atölyesi\'nde tanıtım sayfanı yap', kosul: () => parca('web').yildiz()[9] > 0 },
        { id: 'yuz', ad: 'Yüz Yıldız', ikon: 'fa-star', aciklama: 'Toplam 100 yıldız topla', kosul: () => PARCALAR.reduce((t, p) => t + toplam(p.id), 0) >= 100 },
        { id: 'oyuncu', ad: 'Oyun Tasarımcısı', ikon: 'fa-gamepad', aciklama: 'Oyun Atölyesi\'nde Yıldız Avcısı oyununu bitir', kosul: () => parca('oyun').yildiz()[4] > 0 },
        { id: 'pythoncu', ad: 'Pythoncu', ikon: 'fa-laptop-code', aciklama: 'Python Laboratuvarı\'nda 16 görev çöz', kosul: () => parca('python').yildiz().filter(x => x > 0).length >= 16 },
        { id: 'algoritmaci', ad: 'Algoritma Mimarı', ikon: 'fa-cubes', aciklama: 'Python\'da Fonksiyonlar ve Algoritmalar ünitesini bitir', kosul: () => parca('python').yildiz().slice(25).every(x => x > 0) },
        { id: 'dedektif', ad: 'Dijital Dedektif', ikon: 'fa-user-secret', aciklama: 'Dijital Dedektif\'in bütün bölümlerini bitir', kosul: () => tamam('dijital') },
        { id: 'veribilimci', ad: 'Veri Bilimci', ikon: 'fa-chart-column', aciklama: 'Veri Bilimi Atölyesi\'nin bütün bölümlerini bitir', kosul: () => tamam('veri') },
        { id: 'donanim', ad: 'Donanım Ustası', ikon: 'fa-microchip', aciklama: 'KodKart\'ın bütün görevlerini bitir', kosul: () => tamam('devre') },
        { id: 'onparmak', ad: 'On Parmak', ikon: 'fa-keyboard', aciklama: 'Klavye Ustası\'nın 20 dersini bitir', kosul: () => tamam('klavye') },
        { id: 'tablocu', ad: 'Formül Ustası', ikon: 'fa-table-cells', aciklama: 'Tablo Atölyesi\'nin bütün görevlerini bitir', kosul: () => tamam('tablo') },
        { id: 'teknisyen', ad: 'Teknisyen', ikon: 'fa-screwdriver-wrench', aciklama: 'Bilgisayarın İçi\'nin bütün bölümlerini bitir', kosul: () => tamam('donanim') },
        { id: 'ucyuz', ad: 'Üç Yüz Yıldız', ikon: 'fa-crown', aciklama: 'Toplam 300 yıldız topla', kosul: () => PARCALAR.reduce((t, p) => t + toplam(p.id), 0) >= 300 }
    ];

    // Toplam yıldıza göre unvan
    const UNVANLAR = [[0, 'Yeni Başlayan'], [10, 'Kod Çırağı'], [30, 'Algoritma Kaşifi'], [60, 'Genç Programcı'], [100, 'Kod Ustası'], [160, 'Bilgisayar Bilimci'], [250, 'Teknoloji Lideri'], [350, 'Kodlayalım Efsanesi']];
    function unvan(yildiz) {
        let u = UNVANLAR[0];
        for (const x of UNVANLAR) if (yildiz >= x[0]) u = x;
        const i = UNVANLAR.indexOf(u), sonraki = UNVANLAR[i + 1];
        return { ad: u[1], sonraki: sonraki ? { ad: sonraki[1], kalan: sonraki[0] - yildiz, oran: (yildiz - u[0]) / (sonraki[0] - u[0]) } : null };
    }

    // ---------- Rapor kodu ----------
    // Öğrencinin ilerlemesi kısa bir metne (ve QR koda) çevrilir; öğretmen paneli bunu okur.
    // Sunucu ya da hesap gerekmez. Biçim: KL1.<base64url(JSON)>.<sağlama>
    const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64coz = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
    function saglama(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 1679616; return h.toString(36).padStart(4, '0'); }

    function raporOlustur(profil, gorevId) {
        const p = {};
        for (const x of PARCALAR) { const y = x.yildiz(); if (y.some(v => v > 0)) p[x.id] = y.join(''); }
        const veri = { v: 1, a: profil.ad || '', s: profil.sinif || '', n: profil.no || '', t: Math.floor(Date.now() / 1000), p };
        if (gorevId) veri.g = gorevId;
        const govde = b64(JSON.stringify(veri));
        return `KL1.${govde}.${saglama(govde)}`;
    }

    function raporOku(kod) {
        const m = String(kod).trim().match(/KL1\.([A-Za-z0-9_-]+)\.([0-9a-z]{4})/);
        if (!m) return null;
        if (saglama(m[1]) !== m[2]) return { hata: 'Kod eksik ya da hatalı kopyalanmış' };
        try {
            const v = JSON.parse(b64coz(m[1]));
            return { ad: v.a, sinif: v.s, no: v.n, zaman: v.t * 1000, gorev: v.g || null, ilerleme: v.p || {} };
        } catch (e) { return { hata: 'Kod okunamadı' }; }
    }

    // ---------- Görev ----------
    function gorevKodla(g) { return b64(JSON.stringify(g)); }
    function gorevCoz(s) { try { return JSON.parse(b64coz(s)); } catch (e) { return null; } }

    const api = { ETKINLIKLER, PARCALAR, parca, ROZETLER, unvan, raporOlustur, raporOku, gorevKodla, gorevCoz, b64, b64coz };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Katalog = api;
})(typeof window !== 'undefined' ? window : globalThis);
