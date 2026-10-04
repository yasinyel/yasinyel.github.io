// Kodlayalım — Bilgisayarın İçi motoru: parçalar, yuvalar, sınıflama, birim soruları ve arıza senaryoları
(function (root) {
    'use strict';

    const BOLUMLER = [
        { id: 'topla', ad: 'Bilgisayarı Topla', ikon: 'fa-screwdriver-wrench', renk: '#2563eb', sinif: [3, 12], ozet: 'Parçaları anakarttaki doğru yuvalara sürükle ve bilgisayarı çalıştır.' },
        { id: 'eslestir', ad: 'Ne İşe Yarar?', ikon: 'fa-link', renk: '#7c3aed', sinif: [3, 12], ozet: 'Her parçayı yaptığı işle eşleştir.' },
        { id: 'sinifla', ad: 'Girdi mi, Çıktı mı?', ikon: 'fa-arrows-left-right', renk: '#16a36a', sinif: [1, 8], ozet: 'Cihazları girdi, çıktı, depolama ve hem girdi hem çıktı olarak ayır.' },
        { id: 'birim', ad: 'Bit, Bayt, Gigabayt', ikon: 'fa-database', renk: '#ea580c', sinif: [5, 12], ozet: 'Veri birimlerini karşılaştır ve hesapla.' },
        { id: 'ariza', ad: 'Arıza Tespiti', ikon: 'fa-stethoscope', renk: '#e5484d', sinif: [4, 12], ozet: 'Bilgisayar doktoru ol: belirtilere bakıp sorunu bul.' }
    ];

    // ---------- Bilgisayarı topla ----------
    // yuva: anakartta takılacağı yer; once: önce takılması gereken parça; null yuva: kasaya girmez (çeldirici)
    const PARCALAR = [
        { id: 'cpu', ad: 'İşlemci (CPU)', yuva: 'cpu', aciklama: 'Bilgisayarın beyni: programların komutlarını çalıştırır. Saniyede milyarlarca işlem yapar.' },
        { id: 'sogutucu', ad: 'İşlemci soğutucusu', yuva: 'sogutucu', once: 'cpu', aciklama: 'Çalışırken ısınan işlemciyi soğutur. İşlemcinin tam üstüne takılır, bu yüzden önce işlemci takılmalı.' },
        { id: 'ram', ad: 'Bellek (RAM)', yuva: 'ram', aciklama: 'Açık programların ve verilerin geçici çalışma masası. Elektrik kesilince içindekiler silinir.' },
        { id: 'ssd', ad: 'SSD (depolama)', yuva: 'm2', aciklama: 'Dosyaların ve programların kalıcı olarak saklandığı yer. Elektrik kesilse de silinmez.' },
        { id: 'gpu', ad: 'Ekran kartı (GPU)', yuva: 'pcie', aciklama: 'Ekrandaki görüntüyü oluşturur. Oyunlarda, video düzenlemede ve yapay zekâda çok çalışır.' },
        { id: 'psu', ad: 'Güç kaynağı (PSU)', yuva: 'psu', aciklama: 'Prizdeki elektriği bilgisayar parçalarının kullanabileceği düşük gerilime çevirir.' },
        { id: 'yazici', ad: 'Yazıcı', yuva: null, aciklama: 'Yazıcı kasanın içine takılmaz; dışarıdan kabloyla ya da kablosuz bağlanan bir çıktı birimidir.' }
    ];
    const YUVALAR = [
        { id: 'cpu', ad: 'İşlemci soketi' }, { id: 'sogutucu', ad: 'Soğutucu yeri (işlemcinin üstü)' }, { id: 'ram', ad: 'Bellek yuvaları' },
        { id: 'm2', ad: 'M.2 depolama yuvası' }, { id: 'pcie', ad: 'PCIe kart yuvası' }, { id: 'psu', ad: 'Güç kaynağı bölmesi' }
    ];
    // Bir parçayı bir yuvaya takmayı dener: { tamam, mesaj }
    function tak(takili, parcaId, yuvaId) {
        const p = PARCALAR.find(x => x.id === parcaId);
        if (!p) return { tamam: false, mesaj: 'Böyle bir parça yok.' };
        if (!p.yuva) return { tamam: false, mesaj: p.aciklama };
        if (p.yuva !== yuvaId) {
            const y = YUVALAR.find(x => x.id === yuvaId);
            return { tamam: false, mesaj: `${p.ad} buraya (${y ? y.ad : 'bu yere'}) takılmaz. Şekline ve boyutuna bak.` };
        }
        if (p.once && !takili.includes(p.once)) return { tamam: false, mesaj: `Önce ${PARCALAR.find(x => x.id === p.once).ad} takılmalı.` };
        return { tamam: true, mesaj: p.aciklama };
    }
    const toplamaBitti = (takili) => PARCALAR.filter(p => p.yuva).every(p => takili.includes(p.id));

    // ---------- Eşleştirme ----------
    const ESLESMELER = [
        ['Anakart', 'Bütün parçaları birbirine bağlayan ana devre kartı'],
        ['İşlemci (CPU)', 'Programların komutlarını işleyen beyin'],
        ['Bellek (RAM)', 'Açık programlar için hızlı ama geçici hafıza'],
        ['SSD / Sabit disk', 'Dosyaları kalıcı olarak saklayan depolama'],
        ['Ekran kartı (GPU)', 'Görüntüleri ve 3B grafikleri oluşturan işlemci'],
        ['Güç kaynağı', 'Prizden gelen elektriği parçalara dağıtır'],
        ['Fan / soğutucu', 'Parçaların aşırı ısınmasını önler'],
        ['Ağ kartı', 'Bilgisayarı internete ve diğer cihazlara bağlar']
    ];

    // ---------- Sınıflama ----------
    const SINIFLAR = [['girdi', 'Girdi', 'Bilgisayara bilgi verir'], ['cikti', 'Çıktı', 'Bilgisayardan bilgi verir'], ['depo', 'Depolama', 'Bilgiyi saklar'], ['ikisi', 'Hem girdi hem çıktı', 'İkisini de yapar']];
    const CIHAZLAR = [
        ['Klavye', '⌨️', 'girdi'], ['Fare', '🖱️', 'girdi'], ['Mikrofon', '🎤', 'girdi'], ['Web kamerası', '📷', 'girdi'], ['Oyun kolu', '🎮', 'girdi'], ['Tarayıcı (scanner)', '🖨️', 'girdi'],
        ['Monitör', '🖥️', 'cikti'], ['Hoparlör', '🔊', 'cikti'], ['Yazıcı', '📠', 'cikti'], ['Projeksiyon', '📽️', 'cikti'], ['Kulaklık', '🎧', 'cikti'],
        ['USB bellek', '💾', 'depo'], ['Harici disk', '🗄️', 'depo'], ['Hafıza kartı', '🗂️', 'depo'],
        ['Dokunmatik ekran', '📱', 'ikisi'], ['Mikrofonlu kulaklık', '🎙️', 'ikisi'], ['Akıllı tahta', '🧑‍🏫', 'ikisi']
    ];
    const SINIF_ACIKLAMA = {
        'Tarayıcı (scanner)': 'Tarayıcı kâğıttaki görüntüyü bilgisayara aktarır, yani girdi birimidir. (İnternet tarayıcısıyla karıştırma!)',
        'Dokunmatik ekran': 'Hem görüntü gösterir (çıktı) hem de dokunuşları algılar (girdi).',
        'Mikrofonlu kulaklık': 'Kulaklık sesi verir (çıktı), mikrofonu sesi alır (girdi).',
        'Akıllı tahta': 'Görüntüyü gösterir ve kalemle yapılan dokunuşları algılar.',
        'Kulaklık': 'Sadece ses verir, yani çıktı birimidir.',
        'USB bellek': 'Dosyaları taşımak ve saklamak için kullanılır.'
    };

    // ---------- Birimler ----------
    const BIRIMLER = ['bit', 'bayt', 'KB', 'MB', 'GB', 'TB'];
    const bayt = (n, b) => b === 'bit' ? n / 8 : n * (b === 'bayt' ? 1 : 1024 ** (BIRIMLER.indexOf(b) - 1));
    function uretec(tohum) {
        let s = (tohum >>> 0) || 1;
        const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
        r.tam = (a, b) => a + Math.floor(r() * (b - a + 1));
        r.sec = (l) => l[Math.floor(r() * l.length)];
        return r;
    }
    const BIRIM_SORULARI = [
        (r) => ({ soru: '1 bayt kaç bittir?', secenekler: ['4', '8', '10', '1024'], cevap: '8', aciklama: '1 bayt = 8 bit. Bir harf genellikle 1 bayt yer kaplar.' }),
        (r) => ({ soru: 'Küçükten büyüğe doğru sıralama hangisi?', secenekler: ['bit < bayt < KB < MB < GB < TB', 'bayt < bit < KB < GB < MB < TB', 'KB < bit < bayt < MB < TB < GB', 'bit < KB < bayt < MB < GB < TB'], cevap: 'bit < bayt < KB < MB < GB < TB', aciklama: 'Her basamak (bayttan sonra) bir öncekinin 1024 katıdır.' }),
        (r) => { const gb = r.tam(2, 8); return { soru: `${gb} GB kaç MB eder?`, secenekler: [String(gb * 1024), String(gb * 1000 + 24), String(gb * 100), String(gb * 8)], cevap: String(gb * 1024), aciklama: `1 GB = 1024 MB, yani ${gb} × 1024 = ${gb * 1024} MB.` }; },
        (r) => { const a = r.tam(3, 9), b = a * 1024 - r.tam(1, 3) * 256; return { soru: `Hangisi daha büyük?`, secenekler: [`${a} GB`, `${b} MB`], cevap: `${a} GB`, aciklama: `${a} GB = ${a * 1024} MB, bu da ${b} MB'tan büyük.` }; },
        (r) => { const gb = r.sec([4, 8, 16, 32]), film = r.sec([700, 900, 1500]); const n = Math.floor(gb * 1024 / film); return { soru: `${gb} GB'lık bir USB belleğe ${film} MB'lık videolardan en fazla kaç tane sığar?`, secenekler: [...new Set([String(n), String(n + 1), String(Math.floor(gb * 1000 / film) + 2), String(Math.max(1, n - 2))])], cevap: String(n), aciklama: `${gb} GB = ${gb * 1024} MB. ${gb * 1024} ÷ ${film} = ${(gb * 1024 / film).toFixed(1)}, yani tam ${n} video sığar.` }; },
        (r) => { const kb = r.sec([2048, 3072, 5120]); return { soru: `${kb} KB kaç MB'tır?`, secenekler: [String(kb / 1024), String(kb / 1000), String(kb * 1024), String(kb / 100)], cevap: String(kb / 1024), aciklama: `1 MB = 1024 KB. ${kb} ÷ 1024 = ${kb / 1024} MB.` }; },
        (r) => { const mbps = r.sec([8, 16, 40, 80]), mb = r.sec([10, 20, 50]); const sn = mb * 8 / mbps; return { soru: `İnternet hızın ${mbps} Mbps (saniyede megabit). ${mb} MB'lık bir dosya yaklaşık kaç saniyede iner?`, secenekler: [...new Set([String(sn), String(mb / mbps), String(sn * 2), String(Math.round(mb * 8 * mbps) / 100)])], cevap: String(sn), aciklama: `Dikkat: hız bit cinsinden! ${mb} MB = ${mb * 8} megabit. ${mb * 8} ÷ ${mbps} = ${sn} saniye.` }; },
        (r) => ({ soru: 'Bir fotoğraf 3 MB, telefonunda 3 GB boş yer var. Yaklaşık kaç fotoğraf daha çekebilirsin?', secenekler: ['Yaklaşık 1.000', 'Yaklaşık 100', 'Yaklaşık 10.000', 'Yaklaşık 10'], cevap: 'Yaklaşık 1.000', aciklama: '3 GB = 3072 MB; 3072 ÷ 3 = 1024, yani yaklaşık 1.000 fotoğraf.' })
    ];

    // ---------- Arıza tespiti ----------
    const ARIZALAR = [
        { belirti: 'Güç düğmesine basıyorsun ama hiçbir ışık yanmıyor, fan da dönmüyor.', secenekler: ['Elektrik kablosu takılı değil ya da güç kaynağı arızalı', 'Ekran kartı bozuk', 'İnternet kesik'], dogru: 0, aciklama: 'Hiç ışık ve ses yoksa bilgisayara elektrik gelmiyordur. Önce kabloyu ve prizi kontrol et.' },
        { belirti: 'Bilgisayar çalışıyor, fanlar dönüyor ama ekranda görüntü yok.', secenekler: ['Monitörün kablosu çıkmış ya da monitör kapalı', 'Klavye bozuk', 'Bellek dolu'], dogru: 0, aciklama: 'Kasa çalışıyorsa sorun büyük ihtimalle monitörde ya da görüntü kablosundadır.' },
        { belirti: 'Çok sayıda sekme ve program açınca bilgisayar çok yavaşlıyor.', secenekler: ['Bellek (RAM) yetmiyor; gereksiz programları kapat', 'Yazıcı bozuk', 'Fare pili bitmiş'], dogru: 0, aciklama: 'Açık programlar RAM\'de durur. RAM dolunca bilgisayar diski kullanmaya başlar ve yavaşlar.' },
        { belirti: 'Bilgisayar çok ısınıyor, fan yüksek sesle çalışıyor ve bazen kendiliğinden kapanıyor.', secenekler: ['Fan ve havalandırma delikleri tozla dolmuş', 'Monitör parlaklığı yüksek', 'Klavye dili yanlış'], dogru: 0, aciklama: 'Toz hava akışını engeller; parçalar ısınınca bilgisayar kendini korumak için kapanır. Havalandırmayı temizle.' },
        { belirti: 'Video izlerken hiç ses gelmiyor.', secenekler: ['Ses kısılmış, sessizde ya da hoparlör kablosu takılı değil', 'İşlemci bozuk', 'SSD dolu'], dogru: 0, aciklama: 'En basit nedenlerden başla: ses düzeyi, sessiz modu ve kabloları kontrol et.' },
        { belirti: 'Disk "tık tık" diye ses çıkarıyor ve bazı dosyalar açılmıyor.', secenekler: ['Sabit disk arızalanıyor; hemen dosyaların yedeğini al', 'Fare arızalı', 'Ekran kartı ısınıyor'], dogru: 0, aciklama: 'Diskten gelen tıkırtı arıza belirtisidir. Önemli dosyaların yedeğini hemen başka bir yere al.' },
        { belirti: 'Ekranın köşesinde "Depolama alanı dolu" uyarısı çıkıyor ve yeni dosya kaydedemiyorsun.', secenekler: ['Gereksiz dosyaları sil ya da harici bir diske taşı', 'RAM ekle', 'Monitörü değiştir'], dogru: 0, aciklama: 'Dosyalar kalıcı depolamada (SSD/disk) durur. Yer açmak için gereksiz dosyaları sil ya da taşı.' },
        { belirti: 'Bilgisayar açılışta bip bip diye uzun sesler çıkarıyor ve açılmıyor.', secenekler: ['Bellek (RAM) yerinden oynamış olabilir; bir yetişkin kontrol etsin', 'İnternet modemi kapalı', 'Hoparlör sesi açık'], dogru: 0, aciklama: 'Açılıştaki bip sesleri genellikle donanım uyarısıdır; en sık neden yerinden oynamış bellektir.' }
    ];

    const yildiz = (hata) => hata === 0 ? 3 : hata <= 2 ? 2 : 1;
    const api = { BOLUMLER, PARCALAR, YUVALAR, tak, toplamaBitti, ESLESMELER, SINIFLAR, CIHAZLAR, SINIF_ACIKLAMA, BIRIMLER, bayt, uretec, BIRIM_SORULARI, ARIZALAR, yildiz };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Donanim = api;
})(typeof window !== 'undefined' ? window : globalThis);
