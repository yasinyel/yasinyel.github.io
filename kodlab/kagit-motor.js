// KodLab — Bilgisayarsız (unplugged) çalışma kağıdı üreticileri
// Her üretici aynı tohumla aynı kağıdı üretir; böylece öğretmen bir sürümü tekrar yazdırabilir.
(function (root) {
    'use strict';

    function uretec(tohum) {
        let s = (tohum >>> 0) || 1;
        const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
        r.tam = (a, b) => a + Math.floor(r() * (b - a + 1));
        r.sec = (l) => l[Math.floor(r() * l.length)];
        r.karistir = (l) => { const k = [...l]; for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; } return k; };
        return r;
    }

    // ---------- 1. Robot Yolu (kademe: 1 kolay … 3 zor) ----------
    const YONLER = [['↑', 0, -1], ['→', 1, 0], ['↓', 0, 1], ['←', -1, 0]];
    function enKisaYol(izgara, bas, hedef) {
        const G = izgara[0].length, Y = izgara.length, onceki = new Map([[bas.join(), null]]), kuyruk = [bas];
        while (kuyruk.length) {
            const [x, y] = kuyruk.shift();
            if (x === hedef[0] && y === hedef[1]) {
                const yol = []; let k = hedef.join();
                while (onceki.get(k)) { const [ok, ad] = onceki.get(k); yol.unshift(ad); k = ok; }
                return yol;
            }
            for (const [ad, dx, dy] of YONLER) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= G || ny >= Y || izgara[ny][nx] === '#' || onceki.has(`${nx},${ny}`)) continue;
                onceki.set(`${nx},${ny}`, [`${x},${y}`, ad]);
                kuyruk.push([nx, ny]);
            }
        }
        return null;
    }
    function robotYolu(tohum, kademe = 2) {
        const r = uretec(tohum), boyut = [5, 6, 7][kademe - 1], engel = [3, 7, 12][kademe - 1];
        for (;;) {
            const iz = Array.from({ length: boyut }, () => Array(boyut).fill('.'));
            const bas = [0, r.tam(0, boyut - 1)], hedef = [boyut - 1, r.tam(0, boyut - 1)];
            for (let i = 0; i < engel; i++) { const x = r.tam(1, boyut - 2), y = r.tam(0, boyut - 1); iz[y][x] = '#'; }
            const yol = enKisaYol(iz, bas, hedef);
            if (yol && yol.length >= boyut + kademe - 1) return { izgara: iz, bas, hedef, cevap: yol };
        }
    }
    // Bir ok programını uygular; engel ya da dışarı çıkış hatadır
    function yolUygula(izgara, bas, yol) {
        let [x, y] = bas;
        for (const ad of yol) {
            const d = YONLER.find(v => v[0] === ad); if (!d) return null;
            x += d[1]; y += d[2];
            if (x < 0 || y < 0 || y >= izgara.length || x >= izgara[0].length || izgara[y][x] === '#') return null;
        }
        return [x, y];
    }

    // ---------- 2. İkilik Sayılar ----------
    function ikilik(tohum, kademe = 2) {
        const r = uretec(tohum), bit = [4, 5, 8][kademe - 1], ust = 2 ** bit - 1;
        const say = new Set(); while (say.size < 8) say.add(r.tam(1, ust));
        const l = [...say];
        return {
            bit,
            onlukIkilik: l.slice(0, 4).map(n => ({ soru: n, cevap: n.toString(2).padStart(bit, '0') })),
            ikilikOnluk: l.slice(4).map(n => ({ soru: n.toString(2).padStart(bit, '0'), cevap: n }))
        };
    }

    // ---------- 3. Piksel Resim (sıkıştırılmış satırlardan resim boyama) ----------
    const RESIMLER = [
        { ad: 'Robot', satirlar: ['..####..', '.#.##.#.', '.######.', '..#..#..', '.######.', '#.####.#', '..#..#..', '.##..##.'] },
        { ad: 'Kalp', satirlar: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'] },
        { ad: 'Ev', satirlar: ['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.'] },
        { ad: 'Uzay gemisi', satirlar: ['...##...', '..####..', '..#..#..', '..####..', '.######.', '########', '##.##.##', '#..##..#'] },
        { ad: 'Kedi', satirlar: ['#......#', '##....##', '########', '#.####.#', '########', '###..###', '.######.', '..#..#..'] },
        { ad: 'Ağaç', satirlar: ['...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...'] }
    ];
    // Satırı "beyaz, siyah, beyaz…" sayılarına çevirir (her satır beyazla başlar)
    function satirKodla(satir) {
        const l = []; let renk = '.', n = 0;
        for (const c of satir) { if (c === renk) n++; else { l.push(n); renk = c; n = 1; } }
        l.push(n);
        while (l.length > 1 && l[l.length - 1] === 0) l.pop();
        return l;
    }
    function satirCoz(kod, gen) {
        let s = '', renk = '.';
        kod.forEach(n => { s += renk.repeat(n); renk = renk === '.' ? '#' : '.'; });
        return s.padEnd(gen, '.');
    }
    function piksel(tohum) {
        const r = uretec(tohum), resim = r.sec(RESIMLER);
        return { ad: resim.ad, gen: resim.satirlar[0].length, kodlar: resim.satirlar.map(satirKodla), cevap: resim.satirlar };
    }

    // ---------- 4. Sezar Şifresi ----------
    const ALFABE = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
    function sezar(metin, k) {
        return [...metin].map(c => { const i = ALFABE.indexOf(c); return i < 0 ? c : ALFABE[((i + k) % 29 + 29) % 29]; }).join('');
    }
    const MESAJLAR = ['BİLGİSAYAR', 'ALGORİTMA', 'ŞİFRENİ PAYLAŞMA', 'KOD YAZMAK EĞLENCELİ', 'İNTERNET', 'YAZILIM', 'ROBOT', 'VERİ', 'GÜVENLİ ŞİFRE', 'DÖNGÜ', 'DEĞİŞKEN', 'KODLAB'];
    function sifre(tohum) {
        const r = uretec(tohum), k = r.tam(2, 9), m = r.karistir(MESAJLAR);
        return {
            anahtar: k,
            sifrele: m.slice(0, 3).map(s => ({ soru: s, cevap: sezar(s, k) })),
            coz: m.slice(3, 6).map(s => ({ soru: sezar(s, k), cevap: s }))
        };
    }

    // ---------- 5. Parite Sihri (hata bulma) ----------
    function parite(tohum, kademe = 2) {
        const r = uretec(tohum), n = [4, 5, 6][kademe - 1];
        const iz = Array.from({ length: n }, () => Array.from({ length: n }, () => r.tam(0, 1)));
        // Eşlik satır ve sütunu: her satır/sütundaki 1 sayısı çift olsun
        iz.forEach(s => s.push(s.reduce((a, b) => a + b, 0) % 2));
        iz.push(Array.from({ length: n + 1 }, (_, x) => iz.reduce((a, s) => a + s[x], 0) % 2));
        const bozuk = iz.map(s => [...s]), hx = r.tam(0, n - 1), hy = r.tam(0, n - 1);
        bozuk[hy][hx] = 1 - bozuk[hy][hx];
        return { n, izgara: bozuk, dogru: iz, cevap: [hx, hy] };
    }
    function hataBul(iz) {
        const tekSatir = iz.findIndex(s => s.reduce((a, b) => a + b, 0) % 2);
        const tekSutun = iz[0].findIndex((_, x) => iz.reduce((a, s) => a + s[x], 0) % 2);
        return tekSatir < 0 ? null : [tekSutun, tekSatir];
    }

    // ---------- 6. Mantık Kapıları ----------
    const KAPILAR = { VE: (a, b) => a & b, VEYA: (a, b) => a | b, 'ÖZEL VEYA': (a, b) => a ^ b };
    function mantik(tohum, kademe = 2) {
        const r = uretec(tohum), adlar = Object.keys(KAPILAR);
        const g1 = r.sec(adlar), g2 = r.sec(adlar), degil = kademe >= 2 && r() < 0.5;
        // Devre: çıkış = g2( g1(A,B) , C ) ; kademe 1'de tek kapı
        const tablo = [];
        const giris = kademe === 1 ? ['A', 'B'] : ['A', 'B', 'C'];
        const n = giris.length;
        for (let i = 0; i < 2 ** n; i++) {
            const v = giris.map((_, k) => (i >> (n - 1 - k)) & 1);
            let ara = KAPILAR[g1](v[0], v[1]);
            if (degil) ara = 1 - ara;
            const cikis = kademe === 1 ? ara : KAPILAR[g2](ara, v[2]);
            tablo.push({ girisler: v, cikis });
        }
        return { giris, g1, g2: kademe === 1 ? null : g2, degil, tablo };
    }

    // ---------- 7. En Kısa Yol (ağ) ----------
    const DUGUMLER = [['A', 60, 150], ['B', 190, 60], ['C', 190, 240], ['D', 330, 60], ['E', 330, 240], ['F', 470, 150]];
    const KENARLAR = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E'], ['B', 'E'], ['D', 'F'], ['E', 'F']];
    function dijkstra(kenarlar, bas, son) {
        const uz = { [bas]: 0 }, onceki = {}, bitti = new Set();
        for (;;) {
            const u = Object.keys(uz).filter(k => !bitti.has(k)).sort((a, b) => uz[a] - uz[b])[0];
            if (u === undefined) return null;
            if (u === son) break;
            bitti.add(u);
            for (const [a, b, w] of kenarlar) {
                const v = a === u ? b : b === u ? a : null;
                if (v && !bitti.has(v) && (uz[v] === undefined || uz[u] + w < uz[v])) { uz[v] = uz[u] + w; onceki[v] = u; }
            }
        }
        const yol = [son]; while (yol[0] !== bas) yol.unshift(onceki[yol[0]]);
        return { uzunluk: uz[son], yol };
    }
    function ag(tohum) {
        const r = uretec(tohum);
        for (;;) {
            const kenarlar = KENARLAR.map(([a, b]) => [a, b, r.tam(1, 9)]);
            const c = dijkstra(kenarlar, 'A', 'F');
            // Tek bir en kısa yol olsun (cevap anahtarı belirsiz kalmasın)
            const alternatif = kenarlar.some((k, i) => { const k2 = kenarlar.map((x, j) => (j === i ? [x[0], x[1], x[2] + 100] : x)); const d = dijkstra(k2, 'A', 'F'); return c.yol.join('') !== d.yol.join('') && d.uzunluk === c.uzunluk; });
            if (!alternatif && c.yol.length >= 4) return { dugumler: DUGUMLER, kenarlar, cevap: c };
        }
    }

    // ---------- 8. Hata Avcısı ----------
    function hataAvi(tohum, kademe = 2) {
        const r = uretec(tohum);
        for (;;) {
            const { izgara, bas, hedef, cevap } = robotYolu(r.tam(1, 1e9), kademe);
            const i = r.tam(1, cevap.length - 1);
            const yanlis = r.sec(YONLER.map(y => y[0]).filter(y => y !== cevap[i]));
            const hatali = [...cevap]; hatali[i] = yanlis;
            const ulasir = (p) => { const son = yolUygula(izgara, bas, p); return !!son && son[0] === hedef[0] && son[1] === hedef[1]; };
            if (ulasir(hatali)) continue;
            // Tek bir adım değiştirilerek düzeltmenin tek yolu olsun
            let cozum = 0;
            hatali.forEach((_, j) => YONLER.forEach(([ad]) => { if (ad !== hatali[j]) { const p = [...hatali]; p[j] = ad; if (ulasir(p)) cozum++; } }));
            if (cozum === 1) return { izgara, bas, hedef, program: hatali, hataSirasi: i, dogru: cevap[i] };
        }
    }

    const KAGITLAR = [
        { id: 'robot', ad: 'Robot Yolu', ikon: 'fa-robot', sinif: [1, 6], kademeli: true, aciklama: 'Robotu engellere çarpmadan hedefe götüren ok programını yaz.', uret: robotYolu },
        { id: 'hata', ad: 'Hata Avcısı', ikon: 'fa-bug', sinif: [2, 8], kademeli: true, aciklama: 'Ok programındaki tek hatalı adımı bul ve düzelt.', uret: hataAvi },
        { id: 'ikilik', ad: 'İkilik Sayılar', ikon: 'fa-toggle-on', sinif: [3, 9], kademeli: true, aciklama: 'Onluk sayıları ikiliğe, ikilik sayıları onluğa çevir.', uret: ikilik },
        { id: 'piksel', ad: 'Piksel Resim', ikon: 'fa-border-all', sinif: [2, 8], kademeli: false, aciklama: 'Sıkıştırılmış satır kodlarını çözerek gizli resmi boya.', uret: piksel },
        { id: 'sifre', ad: 'Sezar Şifresi', ikon: 'fa-key', sinif: [4, 10], kademeli: false, aciklama: 'Kesip kullanılan şifre çarkıyla mesajları şifrele ve çöz.', uret: sifre },
        { id: 'parite', ad: 'Parite Sihri', ikon: 'fa-wand-magic-sparkles', sinif: [4, 12], kademeli: true, aciklama: 'Eşlik bitleriyle değişen tek kartı bul: bilgisayarlar hataları böyle yakalar.', uret: parite },
        { id: 'mantik', ad: 'Mantık Kapıları', ikon: 'fa-microchip', sinif: [6, 12], kademeli: true, aciklama: 'Devrenin doğruluk tablosunu doldur.', uret: mantik },
        { id: 'ag', ad: 'En Kısa Yol', ikon: 'fa-network-wired', sinif: [6, 12], kademeli: false, aciklama: 'Ağdaki paketi A\'dan F\'ye en kısa yoldan gönder.', uret: ag }
    ];

    const api = { uretec, YONLER, enKisaYol, robotYolu, yolUygula, ikilik, RESIMLER, satirKodla, satirCoz, piksel, ALFABE, sezar, sifre, parite, hataBul, KAPILAR, mantik, dijkstra, ag, hataAvi, KAGITLAR };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Kagit = api;
})(typeof window !== 'undefined' ? window : globalThis);
