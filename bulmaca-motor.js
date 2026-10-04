// Kodlayalım — Bilişim Bulmacaları motoru: piksel resim (nonogram), ikili bulmaca, ağı kur, ışıkları söndür
// Bütün bulmacalar tohumdan üretilir: aynı numara her cihazda aynı bulmacayı verir. Hepsi mantıkla (tahminsiz) çözülebilir.
(function (root) {
    'use strict';

    function uretec(tohum) {
        let s = (tohum >>> 0) || 1;
        const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
        r.tam = (n) => Math.floor(r() * n);
        r.karistir = (l) => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = r.tam(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
        for (let i = 0; i < 4; i++) r();
        return r;
    }

    const ZORLUKLAR = [
        { id: 'kolay', ad: 'Kolay', sinif: '1–4. sınıf' },
        { id: 'orta', ad: 'Orta', sinif: '5–8. sınıf' },
        { id: 'zor', ad: 'Zor', sinif: '9–12. sınıf' }
    ];

    // ---------- 1. Piksel resim (nonogram) ----------
    const ipuclari = (satir) => { const l = []; let n = 0; for (const v of satir) { if (v) n++; else if (n) { l.push(n); n = 0; } } if (n) l.push(n); return l.length ? l : [0]; };
    // Bir satırın, ipucu ve bilinen hücrelerle uyumlu bütün yerleşimlerinden ortak olanları bulur
    function satirCoz(ipucu, hucreler) {
        const n = hucreler.length, blok = ipucu[0] === 0 ? [] : ipucu;
        const bir = new Array(n).fill(false), sifir = new Array(n).fill(false);
        let bulundu = false;
        const yer = new Array(n).fill(0);
        (function dene(b, bas) {
            if (b === blok.length) {
                for (let i = bas; i < n; i++) if (hucreler[i] === 1) return;
                for (let i = 0; i < n; i++) { const v = i < bas ? yer[i] : 0; if (v) bir[i] = true; else sifir[i] = true; }
                bulundu = true; return;
            }
            const kalan = blok.slice(b + 1).reduce((t, x) => t + x + 1, 0);
            for (let s = bas; s + blok[b] + kalan <= n; s++) {
                let ok = true;
                for (let i = bas; i < s; i++) if (hucreler[i] === 1) { ok = false; break; }
                if (!ok) break;
                for (let i = s; i < s + blok[b]; i++) if (hucreler[i] === 0) { ok = false; break; }
                if (!ok) continue;
                if (s + blok[b] < n && hucreler[s + blok[b]] === 1) continue;
                for (let i = bas; i < s; i++) yer[i] = 0;
                for (let i = s; i < s + blok[b]; i++) yer[i] = 1;
                if (s + blok[b] < n) yer[s + blok[b]] = 0;
                dene(b + 1, Math.min(n, s + blok[b] + 1));
            }
        })(0, 0);
        if (!bulundu) return null;
        return hucreler.map((v, i) => v !== -1 ? v : bir[i] && !sifir[i] ? 1 : sifir[i] && !bir[i] ? 0 : -1);
    }
    function nonogramCoz(satirIp, sutunIp) {
        const h = satirIp.length, w = sutunIp.length;
        const g = Array.from({ length: h }, () => new Array(w).fill(-1));
        let degisti = true;
        while (degisti) {
            degisti = false;
            for (let r = 0; r < h; r++) {
                const y = satirCoz(satirIp[r], g[r]); if (!y) return null;
                y.forEach((v, c) => { if (v !== g[r][c]) { g[r][c] = v; degisti = true; } });
            }
            for (let c = 0; c < w; c++) {
                const y = satirCoz(sutunIp[c], g.map(s => s[c])); if (!y) return null;
                y.forEach((v, r) => { if (v !== g[r][c]) { g[r][c] = v; degisti = true; } });
            }
        }
        return g;
    }
    // Elle çizilmiş bilişim resimleri: her boyutta ilk bulmacalar bunlardır, sonra rastgele simetrik desenler gelir
    const RESIMLER = {
        5: [['Kalp', '.#.#.|#####|#####|.###.|..#..'], ['Monitör', '#####|#...#|#####|..#..|.###.'], ['Mektup', '#####|##.##|#.#.#|#...#|#####'], ['Kilit', '.###.|.#.#.|#####|##.##|#####'],
            ['Gülen yüz', '.###.|#.#.#|#####|#...#|.###.'], ['Ok', '..#..|.###.|#.#.#|..#..|..#..'], ['Artı', '..#..|..#..|#####|..#..|..#..'], ['Ev', '..#..|.###.|#####|.#.#.|.###.']],
        8: [['Robot', '...##...|.######.|.#.##.#.|.######.|..####..|########|#.####.#|..#..#..'], ['Bilgisayar', '########|#......#|#.#..#.#|#......#|########|...##...|..####..|........'],
            ['Kablosuz ağ', '.######.|##....##|..####..|.##..##.|...##...|........|...##...|...##...'], ['Kalp', '.##..##.|########|########|########|.######.|..####..|...##...|........'],
            ['Fare', '..####..|.#.##.#.|.#.##.#.|.######.|.#....#.|.#....#.|.#....#.|..####..'], ['Kilit', '..####..|.#....#.|.#....#.|########|###..###|###..###|########|########']],
        10: [['Robot', '....##....|..######..|.#......#.|.#.#..#.#.|.#......#.|.#.####.#.|..######..|#.######.#|##.####.##|...#..#...'],
            ['Roket', '....##....|...####...|...#..#...|...#..#...|...####...|..######..|.########.|.##.##.##.|....##....|...####...'],
            ['Dizüstü bilgisayar', '.########.|.#......#.|.#.####.#.|.#......#.|.#.###..#.|.#......#.|.########.|##########|#........#|##########'],
            ['Hesap makinesi', '...####...|..#....#..|..#.##.#..|..#....#..|..#.##.#..|..#....#..|..#.##.#..|..#....#..|..#.##.#..|...####...']]
    };
    function piksel(boyut, tohum) {
        const hazir = (RESIMLER[boyut] || [])[tohum - 1];
        if (hazir) {
            const g = hazir[1].split('|').map(sat => [...sat].map(c => c === '#' ? 1 : 0));
            const satirIp = g.map(ipuclari), sutunIp = g[0].map((_, c) => ipuclari(g.map(x => x[c])));
            const c = nonogramCoz(satirIp, sutunIp);
            if (c && c.every((x, y) => x.every((v, k) => v === g[y][k]))) return { tur: 'piksel', boyut, cozum: g, satirIp, sutunIp, ad: hazir[0] };
        }
        const r = uretec(tohum * 7 + boyut);
        for (let deneme = 0; deneme < 400; deneme++) {
            const yogun = 0.5 + r() * 0.15 + deneme * 0.0005;
            const simetrik = r() < 0.6;
            const g = Array.from({ length: boyut }, () => new Array(boyut).fill(0));
            for (let y = 0; y < boyut; y++) for (let x = 0; x < boyut; x++) {
                if (simetrik && x >= Math.ceil(boyut / 2)) g[y][x] = g[y][boyut - 1 - x];
                else g[y][x] = r() < yogun ? 1 : 0;
            }
            const satirIp = g.map(ipuclari), sutunIp = g[0].map((_, c) => ipuclari(g.map(s => s[c])));
            if (satirIp.some(i => i[0] === 0) && deneme < 300) continue;
            const c = nonogramCoz(satirIp, sutunIp);
            if (c && c.every((s, y) => s.every((v, x) => v === g[y][x]))) return { tur: 'piksel', boyut, cozum: g, satirIp, sutunIp };
        }
        throw new Error('piksel üretilemedi');
    }
    const pikselTamam = (b, durum) => durum.every((s, y) => s.map(v => v === 1 ? 1 : 0).join('') === b.cozum[y].join(''));

    // ---------- 2. İkili bulmaca (her satır/sütunda eşit 0 ve 1, yan yana üç aynı yok, satırlar/sütunlar birbirinden farklı) ----------
    function ikiliSatirlar(n) {
        const l = [];
        for (let m = 0; m < 1 << n; m++) {
            const s = Array.from({ length: n }, (_, i) => (m >> i) & 1);
            if (s.reduce((a, b) => a + b, 0) !== n / 2) continue;
            if (s.some((v, i) => i >= 2 && v === s[i - 1] && v === s[i - 2])) continue;
            l.push(s);
        }
        return l;
    }
    const SATIR_ONBELLEK = {};
    const gecerliSatirlar = (n) => SATIR_ONBELLEK[n] || (SATIR_ONBELLEK[n] = ikiliSatirlar(n));
    // Satır satır mantık: bilinenlerle uyumlu bütün geçerli satırlarda aynı olan hücreler kesinleşir
    function ikiliCoz(g) {
        const n = g.length; g = g.map(s => [...s]);
        const cizgi = (i, sutun) => sutun ? g.map(s => s[i]) : g[i];
        let degisti = true;
        while (degisti) {
            degisti = false;
            for (const sutun of [false, true]) for (let i = 0; i < n; i++) {
                const c = cizgi(i, sutun);
                if (!c.includes(-1)) continue;
                const dolu = []; for (let j = 0; j < n; j++) { const d = cizgi(j, sutun); if (j !== i && !d.includes(-1)) dolu.push(d.join('')); }
                const aday = gecerliSatirlar(n).filter(s => s.every((v, k) => c[k] === -1 || c[k] === v) && !dolu.includes(s.join('')));
                if (!aday.length) return null;
                for (let k = 0; k < n; k++) if (c[k] === -1 && aday.every(s => s[k] === aday[0][k])) {
                    if (sutun) g[k][i] = aday[0][k]; else g[i][k] = aday[0][k];
                    degisti = true;
                }
            }
        }
        return g;
    }
    function ikiliTamUret(n, r) {
        const satirlar = gecerliSatirlar(n);
        const g = [];
        const sutunOk = () => {
            for (let c = 0; c < n; c++) {
                const s = g.map(x => x[c]), bir = s.reduce((a, b) => a + b, 0), sifir = s.length - bir;
                if (bir > n / 2 || sifir > n / 2) return false;
                const k = s.length; if (k >= 3 && s[k - 1] === s[k - 2] && s[k - 2] === s[k - 3]) return false;
            }
            if (g.length === n) { const sut = Array.from({ length: n }, (_, c) => g.map(x => x[c]).join('')); if (new Set(sut).size !== n) return false; }
            return true;
        };
        (function dene() {
            if (g.length === n) return true;
            for (const s of r.karistir(satirlar)) {
                if (g.some(x => x.join('') === s.join(''))) continue;
                g.push(s);
                if (sutunOk() && dene()) return true;
                g.pop();
            }
            return false;
        })();
        return g;
    }
    function ikili(boyut, tohum) {
        const r = uretec(tohum * 13 + boyut);
        const cozum = ikiliTamUret(boyut, r);
        const bulmaca = cozum.map(s => [...s]);
        for (const k of r.karistir([...Array(boyut * boyut).keys()])) {
            const y = Math.floor(k / boyut), x = k % boyut, eski = bulmaca[y][x];
            bulmaca[y][x] = -1;
            const c = ikiliCoz(bulmaca);
            if (!c || c.some(s => s.includes(-1))) bulmaca[y][x] = eski;
        }
        return { tur: 'ikili', boyut, cozum, bulmaca };
    }
    const ikiliTamam = (b, durum) => durum.every((s, y) => s.join('') === b.cozum[y].join(''));
    // Kuralları çiğneyen hücreler (anında geri bildirim için)
    function ikiliHatalar(durum) {
        const n = durum.length, h = new Set();
        const isle = (al, ad) => {
            for (let i = 0; i < n; i++) {
                const c = Array.from({ length: n }, (_, k) => al(i, k));
                for (let k = 2; k < n; k++) if (c[k] !== -1 && c[k] === c[k - 1] && c[k] === c[k - 2]) [k - 2, k - 1, k].forEach(j => h.add(ad(i, j)));
                for (const v of [0, 1]) if (c.filter(x => x === v).length > n / 2) c.forEach((x, j) => { if (x === v) h.add(ad(i, j)); });
            }
        };
        isle((i, k) => durum[i][k], (i, k) => `${i},${k}`);
        isle((i, k) => durum[k][i], (i, k) => `${k},${i}`);
        return h;
    }

    // ---------- 3. Ağı kur (boru bulmacası): her kare döndürülerek bütün bilgisayarlar sunucuya bağlanır ----------
    // Bağlantı bitleri: 1 kuzey, 2 doğu, 4 güney, 8 batı
    const YON = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    const dondur = (m, k = 1) => { for (let i = 0; i < ((k % 4) + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15; return m; };
    function ag(boyut, tohum) {
        const r = uretec(tohum * 17 + boyut);
        const n = boyut, kare = Array.from({ length: n }, () => new Array(n).fill(0));
        const merkez = [Math.floor(n / 2), Math.floor(n / 2)];
        const icinde = new Set([merkez.join()]);
        const sinir = [];
        const ekle = (x, y) => YON.forEach(([dx, dy, a, b]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < n && ny < n && !icinde.has(`${nx},${ny}`)) sinir.push([x, y, nx, ny, a, b]); });
        ekle(...merkez);
        while (sinir.length) {
            const [x, y, nx, ny, a, b] = sinir.splice(r.tam(sinir.length), 1)[0];
            if (icinde.has(`${nx},${ny}`)) continue;
            // Dört bağlantılı kavşakları seyrek tut
            if ([1, 2, 4, 8].filter(t => kare[y][x] & t).length >= 3 && r() < 0.8 && sinir.some(s => !icinde.has(`${s[2]},${s[3]}`) && (s[0] !== x || s[1] !== y))) { sinir.push([x, y, nx, ny, a, b]); continue; }
            kare[y][x] |= a; kare[ny][nx] |= b; icinde.add(`${nx},${ny}`); ekle(nx, ny);
        }
        let donus;
        do { donus = kare.map(s => s.map(m => [0, 5, 10, 15].includes(m) && m !== 0 ? r.tam(2) : r.tam(4))); } while (agTamam({ boyut: n, kare, sunucu: merkez }, donus));
        return { tur: 'ag', boyut: n, kare, sunucu: merkez, donus };
    }
    const agMaske = (b, donus, x, y) => dondur(b.kare[y][x], donus[y][x]);
    // Sunucudan erişilen kareler; döngü yok, bütün kablolar karşılıklı bağlıysa çözülmüştür
    function agErisim(b, donus) {
        const n = b.boyut, gor = new Set([b.sunucu.join()]), yigin = [b.sunucu];
        while (yigin.length) {
            const [x, y] = yigin.pop(), m = agMaske(b, donus, x, y);
            for (const [dx, dy, a, k] of YON) {
                if (!(m & a)) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= n || ny >= n || !(agMaske(b, donus, nx, ny) & k) || gor.has(`${nx},${ny}`)) continue;
                gor.add(`${nx},${ny}`); yigin.push([nx, ny]);
            }
        }
        return gor;
    }
    function agTamam(b, donus) {
        const n = b.boyut;
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            const m = agMaske(b, donus, x, y);
            for (const [dx, dy, a, k] of YON) {
                if (!(m & a)) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= n || ny >= n || !(agMaske(b, donus, nx, ny) & k)) return false;
            }
        }
        return agErisim(b, donus).size === n * n;
    }

    // ---------- 4. Işıkları söndür: bir kareye basınca kendisi ve dört komşusu tersine döner ----------
    function isikBas(d, n, i) {
        const x = i % n, y = Math.floor(i / n);
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < n && ny < n) d[ny * n + nx] ^= 1; }
        return d;
    }
    // GF(2) üzerinde Gauss eliminasyonu; en az basışlı çözümü bulur
    function isikCoz(d, n) {
        const N = n * n;
        const A = Array.from({ length: N }, (_, i) => { const satir = new Array(N + 1).fill(0); isikBas(satir, n, i); return satir; });
        // A simetriktir: satır i, i'ye basmanın etkilediği kareler. Sütun = basış, satır = kare
        const M = Array.from({ length: N }, (_, k) => [...Array.from({ length: N }, (_, j) => A[j][k]), d[k]]);
        const pivot = []; let r = 0;
        for (let c = 0; c < N && r < N; c++) {
            let p = r; while (p < N && !M[p][c]) p++;
            if (p === N) continue;
            [M[r], M[p]] = [M[p], M[r]];
            for (let i = 0; i < N; i++) if (i !== r && M[i][c]) for (let j = c; j <= N; j++) M[i][j] ^= M[r][j];
            pivot.push(c); r++;
        }
        for (let i = r; i < N; i++) if (M[i][N]) return null;
        const serbest = [...Array(N).keys()].filter(c => !pivot.includes(c));
        let en = null;
        for (let m = 0; m < 1 << serbest.length; m++) {
            const x = new Array(N).fill(0);
            serbest.forEach((c, i) => { x[c] = (m >> i) & 1; });
            pivot.forEach((c, i) => { let v = M[i][N]; for (const s of serbest) if (M[i][s]) v ^= x[s]; x[c] = v; });
            if (!en || x.reduce((a, b) => a + b, 0) < en.reduce((a, b) => a + b, 0)) en = x;
        }
        return en;
    }
    function isik(boyut, tohum) {
        const r = uretec(tohum * 19 + boyut);
        const n = boyut, N = n * n;
        const k = { 3: 3, 4: 5, 5: 7 }[n] || n + 2;
        let d;
        do { d = new Array(N).fill(0); for (const i of r.karistir([...Array(N).keys()]).slice(0, k)) isikBas(d, n, i); } while (!d.some(Boolean));
        const cozum = isikCoz(d, n);
        return { tur: 'isik', boyut: n, baslangic: d, enAz: cozum.reduce((a, b) => a + b, 0) };
    }
    const isikTamam = (d) => d.every(v => !v);

    const TURLER = [
        { id: 'piksel', ad: 'Piksel Resim', ikon: 'fa-image', renk: '#7c3aed', boyut: [5, 8, 10], uret: piksel,
            ozet: 'Satır ve sütun sayılarına bakarak hangi piksellerin boyanacağını bul; gizli resim ortaya çıksın.',
            bilisim: 'Bilgisayarlar resimleri sayılarla saklar. Buradaki ipuçları "art arda kaç dolu piksel var" bilgisidir; bu yönteme <b>RLE (art arda tekrar kodlama)</b> denir ve dosyaları sıkıştırmak için kullanılır.' },
        { id: 'ikili', ad: 'İkili Bulmaca', ikon: 'fa-table-cells-large', renk: '#0891b2', boyut: [4, 6, 8], uret: ikili,
            ozet: 'Her kareye 0 ya da 1 yaz: yan yana üç aynı rakam yok, her satır ve sütunda eşit sayıda 0 ve 1, aynı iki satır yok.',
            bilisim: 'Bilgisayarın dili <b>ikilik sistemdir</b>: her bilgi 0 ve 1\'lerle gösterilir. Bu bulmacada kurallara uyan bir ikilik tablo kuruyorsun; tıpkı bir programın veriyi denetlemesi gibi.' },
        { id: 'ag', ad: 'Ağı Kur', ikon: 'fa-network-wired', renk: '#16a34a', boyut: [4, 5, 7], uret: ag,
            ozet: 'Kablo parçalarını döndür; bütün bilgisayarlar sunucuya bağlansın, açıkta kablo kalmasın.',
            bilisim: 'Okul ve ev ağlarında her cihaz kablo ya da kablosuz bağlantıyla sunucuya ulaşır. Döngüsü olmayan, her cihaza tek yoldan ulaşılan bu yapıya <b>ağaç topolojisi</b> denir.' },
        { id: 'isik', ad: 'Işıkları Söndür', ikon: 'fa-lightbulb', renk: '#d97706', boyut: [3, 4, 5], uret: isik,
            ozet: 'Bir lambaya basınca kendisi ve dört komşusu açılır ya da kapanır. Bütün lambaları en az basışla söndür.',
            bilisim: 'Her basış lambaları <b>XOR (dışlamalı veya)</b> ile değiştirir: açıksa kapanır, kapalıysa açılır. Aynı lambaya iki kez basmak hiçbir şey yapmaz; bilgisayarlar bu mantık işlemini şifrelemede ve hata bulmada kullanır.' }
    ];
    const uret = (tur, zorluk, tohum) => { const t = TURLER.find(x => x.id === tur); return t.uret(t.boyut[zorluk], tohum); };
    // İpucu kullanılmadıysa 3, bir-iki ipucuyla 2, daha fazlasıyla 1 yıldız. Işıklarda en az basış da gerekir.
    const yildiz = (ipucu, fazlaHamle = 0) => { const y = ipucu === 0 ? 3 : ipucu <= 2 ? 2 : 1; return fazlaHamle > 0 && y === 3 ? 2 : y; };
    // Günün bulmacası: tarih her gün yeni bir numara verir
    const gununTohumu = (tarih) => { const d = new Date(tarih); return (d.getFullYear() * 400 + (d.getMonth() + 1) * 32 + d.getDate()) % 100000 + 1; };

    const api = { RESIMLER, uretec, ZORLUKLAR, TURLER, uret, ipuclari, satirCoz, nonogramCoz, piksel, pikselTamam, gecerliSatirlar, ikiliCoz, ikili, ikiliTamam, ikiliHatalar, YON, dondur, ag, agMaske, agErisim, agTamam, isikBas, isikCoz, isik, isikTamam, yildiz, gununTohumu };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Bulmaca = api;
})(typeof window !== 'undefined' ? window : globalThis);
