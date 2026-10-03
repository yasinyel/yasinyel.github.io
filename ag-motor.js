// Kodlayalım — Paket Yolculuğu motoru: paketleme, yönlendirme (en kısa yol), DNS, IP adresleri
(function (root) {
    'use strict';
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const sec = (d) => d[Math.floor(Math.random() * d.length)];
    const karistir = (d) => { const a = d.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const ip = () => `${r(11, 223)}.${r(0, 255)}.${r(0, 255)}.${r(1, 254)}`;

    // ---------- 1. Paketler ----------
    const MESAJLAR = [
        'İNTERNET MESAJLARI KÜÇÜK PAKETLERE BÖLER',
        'HER PAKET FARKLI YOLDAN GİDEBİLİR',
        'PAKETLER HEDEFTE SIRAYA DİZİLİR',
        'KAYBOLAN PAKET TEKRAR İSTENİR',
        'YÖNLENDİRİCİLER PAKETLERE YOL GÖSTERİR',
        'BİR FOTOĞRAF YÜZLERCE PAKETE BÖLÜNÜR'
    ];
    function paketle(mesaj, boyut) {
        const kaynak = ip(), hedef = ip();
        const parcalar = [];
        for (let i = 0; i < mesaj.length; i += boyut) parcalar.push(mesaj.slice(i, i + boyut));
        return parcalar.map((veri, i) => ({ sira: i + 1, toplam: parcalar.length, kaynak, hedef, veri }));
    }
    // Karışık sırada gelen paketler; eksik=true ise biri yolda kaybolur
    function paketSorusu(eksik) {
        const mesaj = sec(MESAJLAR);
        const paketler = paketle(mesaj, r(5, 7));
        let kayip = null;
        let gelen = karistir(paketler);
        if (eksik) { kayip = r(2, paketler.length - 1); gelen = gelen.filter(p => p.sira !== kayip); }
        return { mesaj, paketler, gelen, kayip };
    }

    // ---------- 2. Yönlendirme ----------
    // Düğüm konumları 0–100 arası; kenarlar milisaniye cinsinden gecikme taşır.
    const AGLAR = [
        { ad: 'İlk Paket', anlatim: 'Paketin bilgisayardan (Kaynak) sunucuya (Hedef) gitmeli. Her durakta bir sonraki yönlendiriciyi sen seç. Tellerin üstündeki sayılar gecikmeyi (milisaniye) gösterir: toplam süreyi en aza indir!',
          dugumler: { K: [6, 50], A: [28, 25], B: [28, 75], C: [55, 50], H: [92, 50] },
          kenarlar: [['K', 'A', 10], ['K', 'B', 25], ['A', 'C', 15], ['B', 'C', 10], ['C', 'H', 10]] },
        { ad: 'Kısa Yol Hızlı Olmayabilir', anlatim: 'Daha az durak her zaman daha hızlı demek değildir. Gecikmeleri topla!',
          dugumler: { K: [6, 50], A: [26, 18], B: [26, 82], C: [50, 18], D: [50, 50], E: [74, 82], H: [94, 50] },
          kenarlar: [['K', 'A', 10], ['K', 'B', 15], ['A', 'D', 60], ['A', 'C', 10], ['C', 'H', 70], ['C', 'D', 10], ['D', 'H', 15], ['B', 'E', 20], ['E', 'H', 30], ['B', 'D', 45]] },
        { ad: 'Kopan Bağlantı', anlatim: 'İnternet, bir bağlantı koptuğunda bile çalışmaya devam edecek şekilde tasarlandı. Yolculuk sırasında bir kablo kopabilir; başka bir yol bul!', kopma: ['D', 'H'],
          dugumler: { K: [6, 50], A: [24, 20], B: [24, 80], C: [46, 20], D: [52, 50], E: [46, 80], F: [72, 22], G: [72, 78], H: [94, 50] },
          kenarlar: [['K', 'A', 10], ['K', 'B', 12], ['A', 'C', 10], ['A', 'D', 15], ['B', 'D', 12], ['B', 'E', 10], ['C', 'F', 25], ['D', 'H', 10], ['D', 'F', 30], ['D', 'G', 20], ['E', 'G', 15], ['F', 'H', 20], ['G', 'H', 15]] },
        { ad: 'Kıtalar Arası', anlatim: 'Okyanus altı kabloları uzundur ve gecikmeleri büyüktür. En hızlı rotayı bul. Paketin TTL (yaşam süresi) değeri 8: 8 duraktan fazla yönlendirilirse paket çöpe atılır!', ttl: 8,
          dugumler: { K: [5, 30], A: [18, 12], B: [18, 55], C: [34, 30], D: [34, 78], E: [52, 12], F: [52, 50], G: [68, 30], I: [68, 78], J: [82, 12], H: [95, 50] },
          kenarlar: [['K', 'A', 5], ['K', 'B', 8], ['A', 'C', 6], ['B', 'C', 5], ['B', 'D', 7], ['C', 'E', 80], ['C', 'F', 45], ['D', 'F', 30], ['D', 'I', 95], ['E', 'J', 10], ['F', 'G', 20], ['F', 'I', 25], ['G', 'J', 30], ['G', 'H', 40], ['I', 'H', 12], ['J', 'H', 25]] }
    ];
    function komsular(ag, dugum, kopuk) {
        return ag.kenarlar.filter(([a, b]) => (a === dugum || b === dugum) && !kopukMu([a, b], kopuk)).map(([a, b, w]) => ({ d: a === dugum ? b : a, w }));
    }
    const kopukMu = ([a, b], kopuk) => kopuk && ((kopuk[0] === a && kopuk[1] === b) || (kopuk[0] === b && kopuk[1] === a));
    // Dijkstra: baslangic'tan hedefe en kısa süre ve yol
    function enKisaYol(ag, baslangic = 'K', kopuk = null, hedef = 'H') {
        const uz = {}, onceki = {}, ziyaret = new Set();
        Object.keys(ag.dugumler).forEach(d => { uz[d] = Infinity; });
        uz[baslangic] = 0;
        while (true) {
            let u = null;
            for (const d in uz) if (!ziyaret.has(d) && (u === null || uz[d] < uz[u])) u = d;
            if (u === null || uz[u] === Infinity) break;
            ziyaret.add(u);
            for (const { d, w } of komsular(ag, u, kopuk)) if (uz[u] + w < uz[d]) { uz[d] = uz[u] + w; onceki[d] = u; }
        }
        const yol = [];
        for (let d = hedef; d; d = onceki[d]) yol.unshift(d);
        return { sure: uz[hedef], yol: yol[0] === baslangic ? yol : null };
    }

    // ---------- 3. DNS ----------
    const ALANLAR = [
        { ad: 'oyun.kodlab.tr', tld: 'tr', ikinci: 'kodlab.tr' },
        { ad: 'www.robotkulubu.org', tld: 'org', ikinci: 'robotkulubu.org' },
        { ad: 'okul.bilisimdersi.tr', tld: 'tr', ikinci: 'bilisimdersi.tr' },
        { ad: 'harita.uzayokulu.com', tld: 'com', ikinci: 'uzayokulu.com' },
        { ad: 'kutuphane.kodlab.tr', tld: 'tr', ikinci: 'kodlab.tr' }
    ];
    function dnsSorusu() {
        const a = sec(ALANLAR);
        return {
            alan: a.ad, ip: ip(),
            adimlar: [
                { sunucu: 'Kök sunucu', cevap: `"${a.ad}" adresini bilmiyorum ama ".${a.tld}" uzantılı adresleri bilen sunucuyu tanıyorum.` },
                { sunucu: `.${a.tld} sunucusu`, cevap: `Bu adresi bilmiyorum ama "${a.ikinci}" alan adının sunucusunu tanıyorum.` },
                { sunucu: `${a.ikinci} sunucusu`, cevap: null }
            ],
            // Yanlış sorulabilecek sunucular
            yanlis: ['.com sunucusu', '.org sunucusu', '.tr sunucusu', 'okulum.tr sunucusu', 'oyunlar.com sunucusu'].filter(s => s !== `.${a.tld} sunucusu`)
        };
    }

    // ---------- 4. IP adresleri ----------
    function ipGecerliMi(s) {
        const p = s.split('.');
        return p.length === 4 && p.every(x => /^\d{1,3}$/.test(x) && +x <= 255 && !(x.length > 1 && x[0] === '0'));
    }
    function ipSorusu() {
        const tur = sec(['gecerli', 'gecerli', 'buyuk', 'eksik', 'fazla', 'harf']);
        let a = [r(1, 223), r(0, 255), r(0, 255), r(1, 254)], neden;
        if (tur === 'buyuk') { const i = r(0, 3); a[i] = r(256, 999); neden = `${a[i]} sayısı 255'ten büyük. Her bölüm 1 bayttır (8 bit), en fazla 255 olabilir.`; }
        if (tur === 'eksik') { a = a.slice(0, 3); neden = 'IPv4 adresinde noktalarla ayrılmış tam 4 sayı olmalı.'; }
        if (tur === 'fazla') { a.push(r(0, 255)); neden = 'IPv4 adresinde 5 değil, 4 sayı olmalı.'; }
        if (tur === 'harf') { const i = r(1, 3); a[i] = String(a[i]).slice(0, 1) + sec(['a', 'O', 'x']); neden = 'IP adreslerinde harf olmaz, sadece 0–255 arası sayılar olur.'; }
        const s = a.join('.');
        return { ip: s, gecerli: ipGecerliMi(s), neden: neden || 'Dört bölüm var ve hepsi 0–255 arasında: geçerli bir IPv4 adresi.' };
    }

    const api = { MESAJLAR, paketle, paketSorusu, AGLAR, komsular, enKisaYol, kopukMu, dnsSorusu, ipGecerliMi, ipSorusu };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Ag = api;
})(typeof window !== 'undefined' ? window : globalThis);
