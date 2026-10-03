// KodLab — Makineye Öğret motoru
// Gerçek bir makine öğrenmesi modeli (k-en yakın komşu) ve görsellerden çıkarılan özellik vektörleri.
(function (root) {
    'use strict';

    // Tekrarlanabilir rastgele sayı üretici (aynı tohum = aynı veri)
    function rastgele(tohum) {
        let s = tohum >>> 0 || 1;
        return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    }
    const kirp = (x) => Math.max(0, Math.min(1, x));

    // ---------- k-en yakın komşu ----------
    function mesafe(a, b, agirlik) {
        let t = 0;
        for (let i = 0; i < a.length; i++) { const d = (a[i] - b[i]) * (agirlik ? agirlik[i] : 1); t += d * d; }
        return Math.sqrt(t);
    }
    // ornekler: [{ x: [...], y: etiket }]
    function tahmin(ornekler, x, k = 3, agirlik) {
        if (!ornekler.length) return null;
        const komsular = ornekler.map(o => ({ o, d: mesafe(o.x, x, agirlik) })).sort((a, b) => a.d - b.d).slice(0, Math.min(k, ornekler.length));
        const oy = {};
        // Eşitlikte en yakın komşunun etiketi kazanır
        komsular.forEach((n, i) => { oy[n.o.y] = (oy[n.o.y] || 0) + 1 + (i === 0 ? 0.01 : 0); });
        const y = Object.entries(oy).sort((a, b) => b[1] - a[1])[0][0];
        return { y, komsular, guven: oy[y] / komsular.length };
    }
    function dogruluk(ornekler, test, k, agirlik) {
        if (!ornekler.length || !test.length) return 0;
        return test.filter(t => tahmin(ornekler, t.x, k, agirlik).y === t.y).length / test.length;
    }

    // ---------- 1. Uzay radarı: uydu mu göktaşı mı ----------
    // Özellikler: [renk tonu, en/boy oranı, güneş paneli, pencere, anten, boyut, desen]
    const RADAR_OZELLIK = ['renk', 'şekil', 'güneş paneli', 'pencere', 'anten', 'boyut', 'desen'];
    function uzayNesnesi(r) {
        const uydu = r() < 0.55;
        let n;
        if (uydu) {
            // 0 panelli uydu, 1 kapsül, 2 istasyon modülü
            const cesit = Math.floor(r() * 3);
            n = { tur: 'uydu', ton: Math.floor(r() * 360), oran: 0.45 + r() * 0.25, panel: 1, pencere: 1, anten: r() < 0.8 ? 1 : 0, boyut: 0.4 + r() * 0.6, desen: r() < 0.35 ? 1 : 0, cesit };
        } else {
            // 0 yuvarlak, 1 yumru, 2 uzun, 3 buz parçası
            const cesit = Math.floor(r() * 4);
            n = { tur: 'tas', ton: Math.floor(r() * 360), oran: [0.3, 0.55, 0.8, 1][cesit] + r() * 0.1, panel: 0, pencere: 0, anten: 0, boyut: 0.4 + r() * 0.6, desen: cesit === 1 ? 1 : (r() < 0.3 ? 1 : 0), cesit };
        }
        n.x = [n.ton / 360, n.oran, n.panel, n.pencere, n.anten, n.boyut, n.desen];
        n.y = n.tur;
        return n;
    }
    function uzayNesneleri(tohum, adet) { const r = rastgele(tohum); return Array.from({ length: adet }, () => uzayNesnesi(r)); }

    // ---------- 2. Önyargılı veri: kedi / köpek ----------
    // Özellikler: [kulak sivriliği, burun uzunluğu, bıyık, arka plan (dışarı=1), tüy rengi]
    // Arka plan resmin çoğunu kapladığı için ağırlığı yüksek: model "kolay" olan ipucuna kayar.
    const HAYVAN_AGIRLIK = [1, 1, 0.5, 2, 0.3];
    const HAYVAN_OZELLIK = ['kulak', 'burun', 'bıyık', 'arka plan', 'renk'];
    function hayvan(r, tur, disari) {
        const kedi = tur === 'kedi';
        const n = {
            tur, disari: disari ? 1 : 0,
            kulak: kirp((kedi ? 0.8 : 0.3) + (r() - 0.5) * 0.3),
            burun: kirp((kedi ? 0.3 : 0.7) + (r() - 0.5) * 0.3),
            biyik: kedi ? (r() < 0.9 ? 1 : 0) : (r() < 0.1 ? 1 : 0),
            renk: r()
        };
        n.x = [n.kulak, n.burun, n.biyik, n.disari, n.renk];
        n.y = tur;
        return n;
    }
    function onyargiliVeri(tohum) {
        const r = rastgele(tohum);
        // Eğitim: bütün köpekler dışarıda, bütün kediler içeride çekilmiş
        const egitim = [...Array.from({ length: 8 }, () => hayvan(r, 'kopek', true)), ...Array.from({ length: 8 }, () => hayvan(r, 'kedi', false))];
        // Eklenebilecek çeşitli örnekler (öğrenci veriyi düzeltirken kullanır)
        const havuz = [...Array.from({ length: 6 }, () => hayvan(r, 'kedi', true)), ...Array.from({ length: 6 }, () => hayvan(r, 'kopek', false)),
            ...Array.from({ length: 3 }, () => hayvan(r, 'kedi', false)), ...Array.from({ length: 3 }, () => hayvan(r, 'kopek', true))];
        // Test: her türden içeride ve dışarıda
        const test = [...Array.from({ length: 5 }, () => hayvan(r, 'kedi', true)), ...Array.from({ length: 5 }, () => hayvan(r, 'kedi', false)),
            ...Array.from({ length: 5 }, () => hayvan(r, 'kopek', true)), ...Array.from({ length: 5 }, () => hayvan(r, 'kopek', false))];
        return { egitim, havuz, test };
    }

    // ---------- 3. Kendi kuralını öğret: uzaylılar ----------
    // Özellikler: [renk, göz sayısı, boynuz, ağız (gülümseme), boyut, benekli]
    const UZAYLI_OZELLIK = ['renk', 'göz sayısı', 'boynuz', 'gülümseme', 'boyut', 'benek'];
    const UZAYLI_RENK = [140, 200, 280, 330, 30];
    function uzayli(r) {
        const n = { renk: Math.floor(r() * 5), goz: 1 + Math.floor(r() * 3), boynuz: r() < 0.5 ? 1 : 0, agiz: r() < 0.5 ? 1 : 0, boyut: r() < 0.5 ? 1 : 0, benek: r() < 0.4 ? 1 : 0 };
        n.x = [n.renk / 4, (n.goz - 1) / 2, n.boynuz, n.agiz, n.boyut, n.benek];
        return n;
    }
    function uzaylilar(tohum, adet) { const r = rastgele(tohum); return Array.from({ length: adet }, () => uzayli(r)); }
    // Hangi özellik tek başına etiketleri en iyi açıklıyor? (modelin "neye baktığı")
    function ozellikOnemi(ornekler, adlar) {
        if (ornekler.length < 2) return [];
        const etiketler = [...new Set(ornekler.map(o => o.y))];
        if (etiketler.length < 2) return [];
        return adlar.map((ad, i) => {
            // Bu özelliğe göre birini dışarıda bırakarak 1-en yakın komşu doğruluğu
            let dogru = 0;
            ornekler.forEach((o, j) => {
                const digerleri = ornekler.filter((_, m) => m !== j).map(x => ({ x: [x.x[i]], y: x.y }));
                if (tahmin(digerleri, [o.x[i]], 3).y === o.y) dogru++;
            });
            return { ad, deger: dogru / ornekler.length };
        }).sort((a, b) => b.deger - a.deger);
    }

    // ---------- 4. İki boyutlu sınıflandırma (lise) ----------
    // Gizli kural: daire içi "A", dışı "B"; etiketlerin bir kısmı gürültülü (ölçüm hatası)
    function noktaVeri(tohum, egitimAdet = 60, testAdet = 200, gurultu = 0.12) {
        const r = rastgele(tohum);
        const kural = (x, y) => ((x - 0.5) ** 2 + (y - 0.5) ** 2 < 0.09 ? 'A' : 'B');
        const uret = (n, g) => Array.from({ length: n }, () => {
            const x = r(), y = r();
            let e = kural(x, y);
            if (r() < g) e = e === 'A' ? 'B' : 'A';
            return { x: [x, y], y: e };
        });
        return { egitim: uret(egitimAdet, gurultu), test: uret(testAdet, 0), ek: uret(120, gurultu) };
    }

    const api = { rastgele, mesafe, tahmin, dogruluk, uzayNesneleri, RADAR_OZELLIK, onyargiliVeri, HAYVAN_AGIRLIK, HAYVAN_OZELLIK, uzaylilar, UZAYLI_OZELLIK, UZAYLI_RENK, ozellikOnemi, noktaVeri };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.YZ = api;
})(typeof window !== 'undefined' ? window : globalThis);
