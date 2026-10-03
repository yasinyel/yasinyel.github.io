// Kodlayalım — Veri Bilimi Atölyesi motoru: veri setleri, istatistik, soru üreticileri
// Bütün kişi ve veriler hayalidir.
(function (root) {
    'use strict';

    const BOLUMLER = [
        { id: 'tablo', ad: 'Tablo Dedektifi', ikon: 'fa-table', renk: '#2a78d6', sinif: [3, 12], ozet: 'Bir veri tablosunu sırala, süz ve sorulara cevap bul.' },
        { id: 'grafik', ad: 'Doğru Grafik', ikon: 'fa-chart-column', renk: '#eb6834', sinif: [4, 12], ozet: 'Hangi soru için hangi grafik? Sonra kendi sütun grafiğini çiz.' },
        { id: 'ortalama', ad: 'Ortalama mı, Ortanca mı?', ikon: 'fa-scale-balanced', renk: '#1baf7a', sinif: [6, 12], ozet: 'Ortalama, ortanca, tepe değer ve açıklığı hesapla. Uç değerin etkisini gör.' },
        { id: 'yaniltici', ad: 'Yanıltıcı Grafikler', ikon: 'fa-mask', renk: '#e34948', sinif: [7, 12], ozet: 'Grafiklerle nasıl kandırılırız? Hileyi bul, grafiği düzelt.' },
        { id: 'iliski', ad: 'Dağılım ve İlişki', ikon: 'fa-braille', renk: '#4a3aa7', sinif: [8, 12], ozet: 'İki değişken arasında ilişki var mı? Korelasyon nedensellik demek mi?' },
        { id: 'anket', ad: 'Kendi Anketin', ikon: 'fa-square-poll-vertical', renk: '#eda100', sinif: [3, 12], ozet: 'Sınıfında anket yap, verini topla, grafiğini çiz ve yorumla.' }
    ];

    // ---------- Tekrarlanabilir rastgelelik ----------
    function uretec(tohum) {
        let s = (tohum >>> 0) || 1;
        return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    }

    // ---------- İstatistik ----------
    const toplam = (l) => l.reduce((a, b) => a + b, 0);
    const ortalama = (l) => toplam(l) / l.length;
    function ortanca(l) {
        const s = [...l].sort((a, b) => a - b), n = s.length;
        return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    }
    function tepe(l) {
        const say = new Map();
        l.forEach(x => say.set(x, (say.get(x) || 0) + 1));
        const en = Math.max(...say.values());
        return en === 1 ? null : [...say.keys()].filter(k => say.get(k) === en).sort((a, b) => a - b);
    }
    const aciklik = (l) => Math.max(...l) - Math.min(...l);
    function korelasyon(x, y) {
        const mx = ortalama(x), my = ortalama(y);
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
        return sxy / Math.sqrt(sxx * syy);
    }
    const yuvarla = (x, b = 1) => Math.round(x * 10 ** b) / 10 ** b;

    // ---------- Tablo Dedektifi ----------
    // ekran: günlük ekran süresi (saat), uyku (saat), kodlama: haftalık kodlama (saat)
    const OGRENCILER = [
        { ad: 'Ada', sinif: 6, ekran: 2.5, uyku: 9.0, kodlama: 3, cihaz: 'Tablet' },
        { ad: 'Berk', sinif: 7, ekran: 4.5, uyku: 7.5, kodlama: 1, cihaz: 'Telefon' },
        { ad: 'Ceren', sinif: 5, ekran: 1.5, uyku: 9.5, kodlama: 4, cihaz: 'Bilgisayar' },
        { ad: 'Doruk', sinif: 8, ekran: 5.5, uyku: 7.0, kodlama: 2, cihaz: 'Telefon' },
        { ad: 'Ela', sinif: 6, ekran: 3.0, uyku: 8.5, kodlama: 6, cihaz: 'Bilgisayar' },
        { ad: 'Furkan', sinif: 7, ekran: 3.5, uyku: 8.0, kodlama: 0, cihaz: 'Tablet' },
        { ad: 'Gizem', sinif: 8, ekran: 2.0, uyku: 8.5, kodlama: 5, cihaz: 'Bilgisayar' },
        { ad: 'Hakan', sinif: 5, ekran: 1.0, uyku: 10.0, kodlama: 2, cihaz: 'Tablet' },
        { ad: 'Irmak', sinif: 6, ekran: 4.0, uyku: 7.5, kodlama: 3, cihaz: 'Telefon' },
        { ad: 'Kerem', sinif: 7, ekran: 6.0, uyku: 6.5, kodlama: 1, cihaz: 'Telefon' },
        { ad: 'Lale', sinif: 8, ekran: 3.0, uyku: 8.0, kodlama: 7, cihaz: 'Bilgisayar' },
        { ad: 'Mert', sinif: 5, ekran: 2.0, uyku: 9.0, kodlama: 2, cihaz: 'Tablet' },
        { ad: 'Nil', sinif: 6, ekran: 5.0, uyku: 7.0, kodlama: 4, cihaz: 'Telefon' },
        { ad: 'Onur', sinif: 7, ekran: 2.5, uyku: 8.5, kodlama: 8, cihaz: 'Bilgisayar' },
        { ad: 'Pelin', sinif: 8, ekran: 4.0, uyku: 7.0, kodlama: 3, cihaz: 'Tablet' },
        { ad: 'Rüzgar', sinif: 5, ekran: 0.5, uyku: 10.5, kodlama: 1, cihaz: 'Bilgisayar' }
    ];
    const SUTUNLAR = [
        { id: 'ad', ad: 'Ad', tur: 'metin' },
        { id: 'sinif', ad: 'Sınıf', tur: 'sayi' },
        { id: 'ekran', ad: 'Ekran (sa/gün)', tur: 'sayi' },
        { id: 'uyku', ad: 'Uyku (sa)', tur: 'sayi' },
        { id: 'kodlama', ad: 'Kodlama (sa/hafta)', tur: 'sayi' },
        { id: 'cihaz', ad: 'Cihaz', tur: 'metin' }
    ];
    const ADLAR = OGRENCILER.map(o => o.ad);
    const enBuyuk = (alan, liste = OGRENCILER) => liste.reduce((a, b) => (b[alan] > a[alan] ? b : a));
    const enKucuk = (alan, liste = OGRENCILER) => liste.reduce((a, b) => (b[alan] < a[alan] ? b : a));
    const sayisi = (f) => OGRENCILER.filter(f).length;

    // Her üretici { soru, tur: 'sayi'|'secim', secenekler?, cevap, aciklama } döndürür
    const TABLO_SORULARI = [
        (r) => { const o = enBuyuk('ekran'); return { soru: 'Ekran süresi en fazla olan öğrenci kim?', tur: 'secim', secenekler: ADLAR, cevap: o.ad, aciklama: `"Ekran" sütununu büyükten küçüğe sırala: en üstte ${o.ad} (${o.ekran} saat) var.` }; },
        (r) => { const o = enBuyuk('kodlama'); return { soru: 'Haftada en çok kodlama yapan öğrenci kim?', tur: 'secim', secenekler: ADLAR, cevap: o.ad, aciklama: `"Kodlama" sütununu sıraladığında en büyük değer ${o.kodlama} saat ile ${o.ad}.` }; },
        (r) => { const o = enKucuk('uyku'); return { soru: 'En az uyuyan öğrenci kim?', tur: 'secim', secenekler: ADLAR, cevap: o.ad, aciklama: `"Uyku" sütununu küçükten büyüğe sırala: ${o.ad} ${o.uyku} saat uyuyor.` }; },
        (r) => { const c = ['Tablet', 'Telefon', 'Bilgisayar'][Math.floor(r() * 3)]; const n = sayisi(o => o.cihaz === c); return { soru: `Kaç öğrenci en çok "${c}" kullanıyor?`, tur: 'sayi', cevap: n, aciklama: `Cihaz süzgecinden "${c}" seçince ${n} satır kalıyor.` }; },
        (r) => { const s = 5 + Math.floor(r() * 4); const n = sayisi(o => o.sinif === s); return { soru: `${s}. sınıfta kaç öğrenci var?`, tur: 'sayi', cevap: n, aciklama: `"Sınıf" sütununda ${s} yazan ${n} satır var.` }; },
        (r) => { const e = [7.5, 8, 8.5][Math.floor(r() * 3)]; const n = sayisi(o => o.uyku < e); return { soru: `Uykusu ${String(e).replace('.', ',')} saatten AZ olan kaç öğrenci var?`, tur: 'sayi', cevap: n, aciklama: `Uyku sütununu sıralayıp ${String(e).replace('.', ',')}'ten küçük olanları say: ${n} öğrenci. (Tam ${String(e).replace('.', ',')} olanlar dahil değil!)` }; },
        (r) => { const e = [3, 4][Math.floor(r() * 2)]; const l = OGRENCILER.filter(o => o.ekran > e); const o = enKucuk('uyku', l); return { soru: `Ekran süresi ${e} saatten FAZLA olanlar arasında en az uyuyan kim?`, tur: 'secim', secenekler: ADLAR, cevap: o.ad, aciklama: `Önce ekranı ${e}'ten fazla olanları seç (${l.map(x => x.ad).join(', ')}), sonra aralarında uykusu en az olanı bul: ${o.ad}.` }; },
        (r) => { const n = sayisi(o => o.cihaz === 'Bilgisayar' && o.kodlama >= 4); return { soru: 'Bilgisayar kullanan ve haftada en az 4 saat kodlama yapan kaç öğrenci var?', tur: 'sayi', cevap: n, aciklama: `İki koşul birlikte: cihaz Bilgisayar VE kodlama ≥ 4 → ${n} öğrenci.` }; },
        (r) => { const t = toplam(OGRENCILER.map(o => o.kodlama)); return { soru: 'Bütün öğrencilerin haftalık kodlama sürelerinin toplamı kaç saat?', tur: 'sayi', cevap: t, aciklama: `Kodlama sütunundaki bütün sayıları topla: ${t}.` }; }
    ];

    // ---------- Doğru Grafik ----------
    const GRAFIK_TURLERI = [
        ['sutun', 'Sütun grafiği', 'fa-chart-column'],
        ['cizgi', 'Çizgi grafiği', 'fa-chart-line'],
        ['pasta', 'Pasta grafiği', 'fa-chart-pie'],
        ['dagilim', 'Dağılım grafiği', 'fa-braille'],
        ['sayi', 'Tek bir sayı yeter', 'fa-hashtag']
    ];
    const GRAFIK_SORULARI = [
        { soru: 'Sınıftaki öğrencilerin en çok kullandığı 5 uygulama türünü <b>karşılaştırmak</b> istiyorsun.', cevap: 'sutun', aciklama: 'Kategorileri karşılaştırmak için sütun grafiği en iyisidir: uzunlukları göz kolayca karşılaştırır.' },
        { soru: 'Okulun internet hızının bir hafta boyunca <b>gün gün nasıl değiştiğini</b> göstermek istiyorsun.', cevap: 'cizgi', aciklama: 'Zaman içindeki değişim için çizgi grafiği kullanılır; artış ve azalışlar çizginin eğiminden okunur.' },
        { soru: 'Bir bilgisayarın depolama alanının <b>yüzde kaçını</b> fotoğrafların, oyunların ve uygulamaların kapladığını göstermek istiyorsun (toplam %100).', cevap: 'pasta', aciklama: 'Bir bütünün parçalarını (toplamı %100) göstermek için pasta grafiği uygundur. Az sayıda dilim olmalı.' },
        { soru: 'Öğrencilerin <b>ekran süresi ile uyku süresi arasında bir ilişki</b> olup olmadığını merak ediyorsun.', cevap: 'dagilim', aciklama: 'İki sayısal değişken arasındaki ilişkiye dağılım grafiğiyle bakılır: her öğrenci bir nokta.' },
        { soru: 'Okul sitesinin <b>bugün kaç kez ziyaret edildiğini</b> göstermek istiyorsun.', cevap: 'sayi', aciklama: 'Tek bir değer için grafik gerekmez. Büyük yazılmış tek bir sayı en açık anlatımdır.' },
        { soru: 'Bir oyunun <b>son 12 aydaki</b> indirilme sayısının artıp artmadığını görmek istiyorsun.', cevap: 'cizgi', aciklama: 'Aylara göre değişim: zaman ekseni olan çizgi grafiği.' },
        { soru: 'Dört farklı tarayıcının bir sayfayı <b>kaç saniyede açtığını karşılaştırmak</b> istiyorsun.', cevap: 'sutun', aciklama: 'Birkaç seçeneğin değerlerini yan yana karşılaştırmak: sütun grafiği.' },
        { soru: 'Dosya boyutu büyüdükçe <b>indirme süresinin de uzayıp uzamadığını</b> incelemek istiyorsun.', cevap: 'dagilim', aciklama: 'İki sayısal değişkenin birlikte değişimi: dağılım grafiği.' },
        { soru: 'Sınıf anketinde öğrencilerin <b>%60\'ı evet, %40\'ı hayır</b> dedi. Bunu göstermek istiyorsun.', cevap: 'pasta', aciklama: 'İki parçalı bir bütün. Pasta grafiği (ya da yalnızca iki sayı) yeterli.' }
    ];
    // Grafik çizme görevi
    const UYGULAMALAR = [['Oyun', 9], ['Video', 7], ['Mesaj', 5], ['Eğitim', 4], ['Müzik', 3]];

    // ---------- Ortalama mı, Ortanca mı? ----------
    const LISTE_TEMALARI = [
        { ad: 'ping süreleri', birim: 'ms', min: 12, max: 60 },
        { ad: 'dosya boyutları', birim: 'MB', min: 1, max: 30 },
        { ad: 'günlük adım sayısı (bin)', birim: 'bin', min: 2, max: 15 },
        { ad: 'oyun skorları', birim: 'puan', min: 10, max: 99 },
        { ad: 'pil ömürleri', birim: 'saat', min: 8, max: 24 }
    ];
    function liste(r, n, t) {
        const l = Array.from({ length: n }, () => t.min + Math.floor(r() * (t.max - t.min + 1)));
        return l;
    }
    const ORTALAMA_SORULARI = [
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; let l; do { l = liste(r, 5, t); } while (toplam(l) % 5); const c = ortalama(l); return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Ortalama kaç?`, tur: 'sayi', cevap: c, liste: l, aciklama: `Ortalama = toplam ÷ adet = ${toplam(l)} ÷ ${l.length} = ${c}` }; },
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; const l = liste(r, 7, t); const c = ortanca(l); return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Ortanca (medyan) kaç?`, tur: 'sayi', cevap: c, liste: l, aciklama: `Önce sırala: ${[...l].sort((a, b) => a - b).join(', ')}. Tam ortadaki (4.) sayı: ${c}` }; },
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; const l = liste(r, 6, t); const c = ortanca(l); const s = [...l].sort((a, b) => a - b); return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Ortanca kaç? (Sayı adedi çift!)`, tur: 'sayi', cevap: c, liste: l, aciklama: `Sırala: ${s.join(', ')}. Adet çift olduğu için ortadaki iki sayının ortalaması: (${s[2]} + ${s[3]}) ÷ 2 = ${String(c).replace('.', ',')}` }; },
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; let l; do { l = liste(r, 6, t); const x = l[Math.floor(r() * 6)]; l[Math.floor(r() * 6)] = x; } while (!tepe(l) || tepe(l).length !== 1); const c = tepe(l)[0]; return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Tepe değer (mod) kaç?`, tur: 'sayi', cevap: c, liste: l, aciklama: `En çok tekrar eden sayı: ${c}` }; },
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; const l = liste(r, 6, t); const c = aciklik(l); return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Açıklık (en büyük − en küçük) kaç?`, tur: 'sayi', cevap: c, liste: l, aciklama: `${Math.max(...l)} − ${Math.min(...l)} = ${c}` }; },
        (r) => {
            const l = [20, 22, 25, 23, 21].map(x => x + Math.floor(r() * 4)); const uc = 900;
            const once = { o: yuvarla(ortalama(l)), m: ortanca(l) }, sonra = { o: yuvarla(ortalama([...l, uc])), m: ortanca([...l, uc]) };
            return { soru: `Ping süreleri: <b>${l.join(', ')}</b> ms. Bir ölçümde bağlantı koptu ve <b>${uc} ms</b> çıktı. Bu uç değer eklenince hangisi <b>çok daha fazla</b> değişir?`, tur: 'secim', secenekler: ['Ortalama', 'Ortanca'], cevap: 'Ortalama', aciklama: `Ortalama ${String(once.o).replace('.', ',')} → ${String(sonra.o).replace('.', ',')} oldu; ortanca ${String(once.m).replace('.', ',')} → ${String(sonra.m).replace('.', ',')}. Uç değerler ortalamayı çok etkiler, ortancayı az.` };
        },
        (r) => ({ soru: 'Bir sınıfta 9 öğrencinin harçlığı 50 TL civarında, bir öğrencininki 2.000 TL. "Tipik" öğrencinin harçlığını anlatmak için hangisi daha uygun?', tur: 'secim', secenekler: ['Ortalama', 'Ortanca'], cevap: 'Ortanca', aciklama: 'Uç değer varsa ortanca "tipik" değeri daha iyi gösterir. Ortalama, tek bir zengin öğrenci yüzünden yanıltıcı derecede yüksek çıkar.' }),
        (r) => { const t = LISTE_TEMALARI[Math.floor(r() * 5)]; let l; do { l = liste(r, 4, t); } while (toplam(l) % 4); const ek = Math.round(ortalama(l)); return { soru: `${t.ad[0].toUpperCase() + t.ad.slice(1)}: <b>${l.join(', ')}</b> ${t.birim}. Listeye <b>${ek}</b> eklenirse ortalama ne olur?`, tur: 'sayi', cevap: ortalama([...l, ek]), liste: [...l, ek], aciklama: `Ortalamaya eşit bir sayı eklemek ortalamayı değiştirmez: ${toplam(l) + ek} ÷ 5 = ${ortalama([...l, ek])}` }; }
    ];

    // ---------- Yanıltıcı Grafikler ----------
    // tur: çizim türü; hileli ve durust: çizim ayarları
    const YANILTICI = [
        {
            id: 'eksen', baslik: 'Pil ömrü karşılaştırması', tur: 'sutun',
            veri: [['TelefonA', 20], ['TelefonB', 21]], birim: 'saat',
            hileli: { ymin: 19.6, ymax: 21.2 }, durust: { ymin: 0, ymax: 24 },
            soru: 'Grafikte B\'nin pili A\'nınkinin neredeyse 3 katı gibi görünüyor. Hile ne?',
            secenekler: ['Dikey eksen 0\'dan değil 19,6\'dan başlıyor', 'Renkler farklı seçilmiş', 'Sütunlar çok kalın'], cevap: 0,
            aciklama: 'Eksen 0\'dan başlamayınca küçük bir fark (20 ve 21 saat, sadece %5) devasa görünür. Sütun grafiklerinde eksen 0\'dan başlamalıdır.'
        },
        {
            id: 'resim', baslik: 'Uygulama indirme sayısı', tur: 'resim',
            veri: [['Geçen yıl', 1], ['Bu yıl', 2]], birim: 'milyon',
            soru: 'İndirme sayısı 2 katına çıktı ama "Bu yıl" simgesi 4 kat büyük görünüyor. Hile ne?',
            secenekler: ['Simge hem eni hem boyu 2 katına çıkarılarak büyütülmüş, alanı 4 kat olmuş', 'Yıl adları yanlış yazılmış', 'Sayılar uydurulmuş'], cevap: 0,
            aciklama: 'Resmin eni ve boyu 2 katına çıkınca alanı 4 katına çıkar. Göz alanı algılar; fark gerçekte olduğundan büyük görünür. Dürüst hali: aynı boy simgeyi tekrar etmek.'
        },
        {
            id: 'aralik', baslik: 'Oyunun haftalık oyuncu sayısı', tur: 'cizgi',
            veri: [['Oca', 90], ['Şub', 85], ['Mar', 78], ['Nis', 70], ['May', 64], ['Haz', 55], ['Tem', 50], ['Ağu', 44], ['Eyl', 40], ['Eki', 42], ['Kas', 44], ['Ara', 45]], birim: 'bin',
            hileli: { bas: 8, ymin: 38, ymax: 46 }, durust: { bas: 0, ymin: 0, ymax: 100 },
            soru: 'Şirket "Oyuncularımız hızla artıyor!" diyor. Hile ne?',
            secenekler: ['Sadece yükselen son birkaç ay gösterilmiş; bütün yıl düşüş var', 'Çizgi çok ince çizilmiş', 'Aylar kısaltılmış yazılmış'], cevap: 0,
            aciklama: 'Verinin işe gelen parçasını seçmek (kiraz toplama) yanıltır. Bütün yıla bakınca oyuncu sayısı yarıdan fazla azalmış.'
        },
        {
            id: 'yillar', baslik: 'Okuldaki bilgisayar sayısı', tur: 'cizgi',
            veri: [['2010', 10], ['2020', 20], ['2022', 30], ['2023', 40]], birim: 'adet',
            hileli: { esit: true, ymin: 0, ymax: 45 }, durust: { esit: false, ymin: 0, ymax: 45 },
            soru: 'Grafik, bilgisayar sayısı hep aynı hızla artmış gibi gösteriyor. Hile ne?',
            secenekler: ['Yıllar arasındaki boşluklar eşit değil ama eşit aralıkla çizilmiş', 'Bilgisayar sayısı yanlış', 'Başlık eksik'], cevap: 0,
            aciklama: '2010→2020 arası 10 yıl, 2022→2023 arası 1 yıl, ama grafikte aynı mesafede. Zaman ekseninde aralıklar gerçek süreye göre olmalı.'
        },
        {
            id: 'pasta', baslik: 'Öğrenciler hangi cihazları kullanıyor?', tur: 'pasta',
            veri: [['Telefon', 70], ['Tablet', 45], ['Bilgisayar', 40]], birim: '%',
            soru: 'Pasta grafiğinde bir sorun var. Ne?',
            secenekler: ['Yüzdelerin toplamı %155: birden fazla seçilebilen cevaplar pastayla gösterilemez', 'Dilimler farklı renkte', 'Başlık soru şeklinde'], cevap: 0,
            aciklama: 'Pasta grafiği bir bütünün parçalarıdır; toplam %100 olmalı. Öğrenciler birden fazla cihaz seçebildiği için burada sütun grafiği kullanılmalı.'
        }
    ];

    // ---------- Dağılım ve İlişki ----------
    function dagilimVeri(tohum, n, f, xmin, xmax, gurultu) {
        const r = uretec(tohum);
        return Array.from({ length: n }, () => { const x = xmin + r() * (xmax - xmin); return [yuvarla(x), yuvarla(f(x) + (r() - 0.5) * 2 * gurultu)]; });
    }
    const ILISKILER = [
        { id: 'uyku', baslik: 'Ekran süresi ve uyku', x: 'Günlük ekran süresi (saat)', y: 'Uyku süresi (saat)', veri: OGRENCILER.map(o => [o.ekran, o.uyku]), yon: 'negatif',
          aciklama: 'Ekran süresi arttıkça uyku azalıyor: negatif (ters yönlü) ilişki. Noktalar sağa doğru aşağı iniyor.' },
        { id: 'indirme', baslik: 'Dosya boyutu ve indirme süresi', x: 'Dosya boyutu (MB)', y: 'İndirme süresi (sn)', veri: dagilimVeri(7, 20, x => x * 0.8 + 2, 5, 100, 6), yon: 'pozitif',
          aciklama: 'Dosya büyüdükçe indirme uzuyor: pozitif (aynı yönlü) ilişki. Noktalar sağa doğru yükseliyor.' },
        { id: 'ayakkabi', baslik: 'Ayakkabı numarası ve klavye hızı', x: 'Ayakkabı numarası', y: 'Dakikadaki kelime', veri: dagilimVeri(2, 22, () => 30, 33, 44, 14), yon: 'yok',
          aciklama: 'Noktalar rastgele dağılmış: belirgin bir ilişki yok. Ayak büyüklüğü klavye hızını etkilemez.' },
        { id: 'kalem', baslik: 'Okullardaki tablet sayısı ve kalem satışı', x: 'Okuldaki tablet sayısı', y: 'Kantinde yıllık kalem satışı', veri: dagilimVeri(23, 18, x => x * 4 + 100, 20, 200, 60), yon: 'pozitif',
          nedensellik: { soru: 'Peki tabletler kalem satışını artırıyor mu?', secenekler: ['Evet, tablet arttıkça kalem satışı artıyor', 'Hayır; büyük okullarda hem tablet hem kalem çok. İkisini de öğrenci sayısı artırıyor'], cevap: 1 },
          aciklama: 'İlişki pozitif ama bu, tabletlerin kalem sattırdığı anlamına gelmez. İkisini de üçüncü bir değişken (öğrenci sayısı) etkiliyor. Korelasyon nedensellik değildir!' }
    ];
    const iliskiYonu = (veri) => { const r = korelasyon(veri.map(p => p[0]), veri.map(p => p[1])); return Math.abs(r) < 0.3 ? 'yok' : r > 0 ? 'pozitif' : 'negatif'; };

    // ---------- Anket ----------
    function anketOzet(secenekler) {
        const t = toplam(secenekler.map(s => s.sayi));
        const en = secenekler.length ? Math.max(...secenekler.map(s => s.sayi)) : 0;
        return {
            toplam: t,
            enCok: en > 0 ? secenekler.filter(s => s.sayi === en).map(s => s.ad) : [],
            yuzdeler: secenekler.map(s => t ? Math.round(s.sayi / t * 1000) / 10 : 0),
            tamam: secenekler.filter(s => s.ad.trim()).length >= 3 && t >= 10
        };
    }
    function csv(baslik, secenekler) {
        const k = (s) => /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        return '﻿' + [`${k(baslik || 'Soru')};Kişi sayısı`, ...secenekler.map(s => `${k(s.ad)};${s.sayi}`)].join('\r\n');
    }

    // Sayı cevabı karşılaştırma: virgül/nokta kabul, 0,05 tolerans
    function sayiDogru(girilen, cevap) {
        const n = parseFloat(String(girilen).trim().replace(',', '.'));
        return isFinite(n) && Math.abs(n - cevap) < 0.051;
    }
    const yildiz = (hata) => hata === 0 ? 3 : hata <= 2 ? 2 : 1;

    const api = { BOLUMLER, uretec, toplam, ortalama, ortanca, tepe, aciklik, korelasyon, yuvarla, OGRENCILER, SUTUNLAR, TABLO_SORULARI, GRAFIK_TURLERI, GRAFIK_SORULARI, UYGULAMALAR, ORTALAMA_SORULARI, YANILTICI, ILISKILER, iliskiYonu, anketOzet, csv, sayiDogru, yildiz };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Veri = api;
})(typeof window !== 'undefined' ? window : globalThis);
