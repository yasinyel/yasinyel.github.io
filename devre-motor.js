// Kodlayalım — KodKart: 5×5 LED ekranlı eğitim kartı simülatörü (motor, bloklar, görevler, otomatik denetim)
// Ekran koordinatları: x 0…4 (soldan sağa), y 0…4 (yukarıdan aşağı)
(function (root) {
    'use strict';

    // ---------- 5×5 yazı tipi ----------
    const F = {
        A: ['.##.', '#..#', '####', '#..#', '#..#'], B: ['###.', '#..#', '###.', '#..#', '###.'], C: ['.###', '#...', '#...', '#...', '.###'],
        Ç: ['.###', '#...', '#...', '.###', '..#.'], D: ['###.', '#..#', '#..#', '#..#', '###.'], E: ['####', '#...', '###.', '#...', '####'],
        F: ['####', '#...', '###.', '#...', '#...'], G: ['.###', '#...', '#.##', '#..#', '.###'], Ğ: ['.##.', '....', '.###', '#.##', '.###'],
        H: ['#..#', '#..#', '####', '#..#', '#..#'], I: ['###', '.#.', '.#.', '.#.', '###'], İ: ['.#.', '...', '.#.', '.#.', '.#.'],
        J: ['..##', '...#', '...#', '#..#', '.##.'], K: ['#..#', '#.#.', '##..', '#.#.', '#..#'], L: ['#...', '#...', '#...', '#...', '####'],
        M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'], O: ['.##.', '#..#', '#..#', '#..#', '.##.'],
        Ö: ['#..#', '.##.', '#..#', '#..#', '.##.'], P: ['###.', '#..#', '###.', '#...', '#...'], Q: ['.##.', '#..#', '#..#', '#.#.', '.#.#'],
        R: ['###.', '#..#', '###.', '#.#.', '#..#'], S: ['.###', '#...', '.##.', '...#', '###.'], Ş: ['.###', '#...', '.##.', '###.', '..#.'],
        T: ['#####', '..#..', '..#..', '..#..', '..#..'], U: ['#..#', '#..#', '#..#', '#..#', '.##.'], Ü: ['#..#', '....', '#..#', '#..#', '.##.'],
        V: ['#...#', '#...#', '.#.#.', '.#.#.', '..#..'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
        Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'], Z: ['####', '...#', '.##.', '#...', '####'],
        0: ['.#.', '#.#', '#.#', '#.#', '.#.'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['##.', '..#', '.#.', '#..', '###'],
        3: ['##.', '..#', '.#.', '..#', '##.'], 4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
        6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'], 8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
        ' ': ['..', '..', '..', '..', '..'], '!': ['#', '#', '#', '.', '#'], '?': ['##.', '..#', '.#.', '...', '.#.'], '.': ['.', '.', '.', '.', '#'],
        ',': ['.', '.', '.', '#', '#'], '-': ['...', '...', '###', '...', '...'], ':': ['.', '#', '.', '#', '.'], '+': ['...', '.#.', '###', '.#.', '...'], '=': ['...', '###', '...', '###', '...']
    };
    const glif = (c) => F[c] || F[String(c).toLocaleUpperCase('tr-TR')] || F['?'];

    // ---------- İkonlar ----------
    const IKONLAR = {
        kalp: ['.#.#.', '#####', '#####', '.###.', '..#..'], kucuk_kalp: ['.....', '.#.#.', '.###.', '..#..', '.....'],
        gulen: ['.....', '.#.#.', '.....', '#...#', '.###.'], uzgun: ['.....', '.#.#.', '.....', '.###.', '#...#'],
        evet: ['.....', '....#', '...#.', '#.#..', '.#...'], hayir: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
        yukari: ['..#..', '.###.', '#.#.#', '..#..', '..#..'], asagi: ['..#..', '..#..', '#.#.#', '.###.', '..#..'],
        sag: ['..#..', '...#.', '#####', '...#.', '..#..'], sol: ['..#..', '.#...', '#####', '.#...', '..#..'],
        kare: ['#####', '#...#', '#...#', '#...#', '#####'], dolu: ['#####', '#####', '#####', '#####', '#####'],
        ev: ['..#..', '.###.', '#####', '.#.#.', '.###.'], yildiz: ['..#..', '#####', '.###.', '.#.#.', '#...#'],
        tas: ['.....', '.###.', '#####', '#####', '.###.'], kagit: ['####.', '#..#.', '#..##', '#...#', '#####'], makas: ['##..#', '##.#.', '..#..', '##.#.', '##..#'],
        nota: ['..##.', '..#.#', '..#..', '###..', '###..'], robot: ['#####', '#.#.#', '#####', '.#.#.', '##.##']
    };
    const IKON_ADLARI = { kalp: '❤ kalp', kucuk_kalp: '♡ küçük kalp', gulen: '🙂 gülen yüz', uzgun: '🙁 üzgün yüz', evet: '✔ evet', hayir: '✖ hayır', yukari: '↑ yukarı ok', asagi: '↓ aşağı ok', sag: '→ sağ ok', sol: '← sol ok', kare: '□ kare', dolu: '■ dolu', ev: '⌂ ev', yildiz: '★ yıldız', tas: '✊ taş', kagit: '✋ kâğıt', makas: '✌ makas', nota: '♪ nota', robot: '🤖 robot' };
    const ikonEkran = (ad) => (IKONLAR[ad] || IKONLAR.kare).join('').split('').map(c => (c === '#' ? 1 : 0));
    const NOTALAR = [['do', 262, 'Do'], ['re', 294, 'Re'], ['mi', 330, 'Mi'], ['fa', 349, 'Fa'], ['sol', 392, 'Sol'], ['la', 440, 'La'], ['si', 494, 'Si'], ['do2', 523, 'İnce Do']];

    // ---------- Bloklar ----------
    const KOSULLAR = [['A', 'A düğmesi basılıysa'], ['B', 'B düğmesi basılıysa'], ['isik<', 'ışık < sayı'], ['isik>', 'ışık > sayı'], ['sicaklik<', 'sıcaklık < sayı'], ['sicaklik>', 'sıcaklık > sayı'],
        ['a=', 'a = sayı'], ['a>', 'a > sayı'], ['a<', 'a < sayı'], ['b=', 'b = sayı'], ['b>', 'b > sayı'], ['sans', '% sayı şansla']];
    const DEGISKENLER = [['a', 'a'], ['b', 'b']];
    function tanim() {
        const O = '#f59e0b', E = '#1d5fd6', D = '#ea580c', K = '#0891b2', S = '#ec4899', L = '#7c3aed';
        return {
            baslayinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '▶ başlayınca']] },
            a_basilinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', 'Ⓐ düğmesine basılınca']] },
            b_basilinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', 'Ⓑ düğmesine basılınca']] },
            ab_basilinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', 'Ⓐ+Ⓑ birlikte basılınca']] },
            sallaninca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '〰 kart sallanınca']] },
            surekli: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '🔁 sürekli']] },
            ikon_goster: { renk: E, kategori: 'Ekran', parca: [['m', 'ikon göster'], ['s', 'ikon', 'kalp', Object.keys(IKONLAR).map(k => [k, IKON_ADLARI[k]])]] },
            sayi_goster: { renk: E, kategori: 'Ekran', parca: [['m', 'sayı göster'], ['n', 'n', 5]] },
            yazi_goster: { renk: E, kategori: 'Ekran', parca: [['m', 'yazı kaydır'], ['t', 'metin', 'MERHABA']] },
            deg_goster: { renk: E, kategori: 'Ekran', parca: [['m', 'değişkeni göster'], ['s', 'd', 'a', DEGISKENLER]] },
            sensor_goster: { renk: E, kategori: 'Ekran', parca: [['m', 'göster'], ['s', 'sensor', 'sicaklik', [['sicaklik', '🌡 sıcaklık'], ['isik', '☀ ışık düzeyi']]]] },
            led: { renk: E, kategori: 'Ekran', parca: [['m', 'LED'], ['s', 'islem', 'yak', [['yak', 'yak'], ['sondur', 'söndür'], ['degistir', 'tersine çevir']]], ['m', 'x:'], ['n', 'x', 2], ['m', 'y:'], ['n', 'y', 2]] },
            temizle: { renk: E, kategori: 'Ekran', parca: [['m', 'ekranı temizle']] },
            deg_yap: { renk: D, kategori: 'Değişkenler', parca: [['s', 'd', 'a', DEGISKENLER], ['m', '='], ['n', 'n', 0]] },
            deg_degistir: { renk: D, kategori: 'Değişkenler', parca: [['s', 'd', 'a', DEGISKENLER], ['m', 'değerini'], ['n', 'n', 1], ['m', 'artır']] },
            deg_rastgele: { renk: D, kategori: 'Değişkenler', parca: [['s', 'd', 'a', DEGISKENLER], ['m', '= rastgele'], ['n', 'min', 1], ['m', 'ile'], ['n', 'max', 6], ['m', 'arası']] },
            bekle: { renk: K, kategori: 'Kontrol', parca: [['m', 'bekle'], ['n', 'ms', 500], ['m', 'ms']] },
            tekrar: { renk: K, kategori: 'Kontrol', c: 1, parca: [['m', 'tekrarla'], ['n', 'n', 3], ['m', 'kez']] },
            eger: { renk: K, kategori: 'Kontrol', c: 1, parca: [['m', 'eğer'], ['s', 'k', 'A', KOSULLAR], ['m', 'sayı:'], ['n', 'n', 0]] },
            eger_degilse: { renk: K, kategori: 'Kontrol', c: 2, parca: [['m', 'eğer'], ['s', 'k', 'A', KOSULLAR], ['m', 'sayı:'], ['n', 'n', 0]] },
            nota: { renk: S, kategori: 'Ses', parca: [['m', '♪ nota çal'], ['s', 'nota', 'do', NOTALAR.map(n => [n[0], n[2]])], ['n', 'ms', 300], ['m', 'ms']] }
        };
    }
    const HATLAR = { baslayinca: 'basla', a_basilinca: 'A', b_basilinca: 'B', ab_basilinca: 'AB', sallaninca: 'salla', surekli: 'surekli' };

    const S = (v) => { const n = +String(v).replace(',', '.'); return isFinite(n) ? n : 0; };
    function rastgeleUretec(tohum) { let s = (tohum >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

    // ---------- Kart ----------
    const TIK = 20;
    class Kart {
        constructor(proje, tohum = Date.now()) {
            this.betikler = (proje && proje.betikler) || [];
            this.rastgele = rastgeleUretec(tohum);
            this.ekran = new Array(25).fill(0);
            this.sicaklik = 22; this.isik = 120;
            this.basili = new Set();
            this.d = { a: 0, b: 0 };
            this.zaman = 0;
            this.isler = [];
            this.sesler = [];
            this.calisanlar = new Set();
        }
        baslat() { this.olay('basla'); this.olay('surekli'); }
        olay(tur) {
            this.betikler.forEach((h, i) => {
                if (HATLAR[h.t] !== tur) return;
                const anahtar = String(i);
                if (this.isler.some(j => j.anahtar === anahtar)) return; // aynı betik zaten çalışıyor
                const gen = tur === 'surekli' ? this.dongu(h.govde || []) : this.calistir(h.govde || []);
                this.isler.push({ anahtar, gen, uyandir: this.zaman });
            });
        }
        dugme(d) { this.olay(d); }
        salla() { this.olay('salla'); }
        *dongu(govde) { for (;;) { yield* this.calistir(govde); yield TIK; } }
        // Simülasyonu ms kadar ilerletir
        adim(ms) {
            const son = this.zaman + ms;
            while (this.zaman < son) {
                for (const is of [...this.isler]) {
                    if (is.uyandir > this.zaman) continue;
                    this.islem = 0;
                    const r = is.gen.next();
                    if (r.done) this.isler.splice(this.isler.indexOf(is), 1);
                    else is.uyandir = this.zaman + Math.max(TIK, r.value || 0);
                }
                this.calisanlar = new Set(this.isler.map(j => j.anahtar));
                this.zaman += TIK;
            }
        }
        kosul(d) {
            const n = S(d.n);
            switch (d.k) {
                case 'A': return this.basili.has('A');
                case 'B': return this.basili.has('B');
                case 'isik<': return this.isik < n;
                case 'isik>': return this.isik > n;
                case 'sicaklik<': return this.sicaklik < n;
                case 'sicaklik>': return this.sicaklik > n;
                case 'a=': return this.d.a === n; case 'a>': return this.d.a > n; case 'a<': return this.d.a < n;
                case 'b=': return this.d.b === n; case 'b>': return this.d.b > n;
                case 'sans': return this.rastgele() * 100 < n;
            }
            return false;
        }
        *goster(metin) {
            metin = String(metin);
            const tek = [...metin];
            if (tek.length === 1 && glif(tek[0])[0].length <= 5) {
                const g = glif(tek[0]), w = g[0].length, ofs = Math.floor((5 - w) / 2);
                this.ekran.fill(0);
                for (let y = 0; y < 5; y++) for (let x = 0; x < w; x++) if (g[y][x] === '#') this.ekran[y * 5 + x + ofs] = 1;
                return;
            }
            // Kayan yazı: sütunlar sağdan girip sola akar
            const sutunlar = [];
            tek.forEach(c => { const g = glif(c); for (let x = 0; x < g[0].length; x++) sutunlar.push(g.map(r => (r[x] === '#' ? 1 : 0))); sutunlar.push([0, 0, 0, 0, 0]); });
            for (let k = -5; k <= sutunlar.length; k++) {
                for (let x = 0; x < 5; x++) { const s = sutunlar[k + x]; for (let y = 0; y < 5; y++) this.ekran[y * 5 + x] = s ? s[y] : 0; }
                yield 90;
            }
            this.ekran.fill(0);
        }
        *calistir(govde) {
            for (const d of govde) {
                if (++this.islem > 2000) { this.islem = 0; yield TIK; }
                switch (d.t) {
                    case 'ikon_goster': this.ekran = ikonEkran(d.ikon); break;
                    case 'sayi_goster': yield* this.goster(S(d.n)); break;
                    case 'yazi_goster': yield* this.goster(d.metin ?? ''); break;
                    case 'deg_goster': yield* this.goster(this.d[d.d] ?? 0); break;
                    case 'sensor_goster': yield* this.goster(d.sensor === 'isik' ? this.isik : this.sicaklik); break;
                    case 'led': {
                        const x = Math.max(0, Math.min(4, Math.round(S(d.x)))), y = Math.max(0, Math.min(4, Math.round(S(d.y)))), i = y * 5 + x;
                        this.ekran[i] = d.islem === 'yak' ? 1 : d.islem === 'sondur' ? 0 : 1 - this.ekran[i];
                        break;
                    }
                    case 'temizle': this.ekran.fill(0); break;
                    case 'deg_yap': this.d[d.d] = S(d.n); break;
                    case 'deg_degistir': this.d[d.d] = (this.d[d.d] || 0) + S(d.n); break;
                    case 'deg_rastgele': { const a = Math.round(S(d.min)), b = Math.round(S(d.max)); const lo = Math.min(a, b), hi = Math.max(a, b); this.d[d.d] = lo + Math.floor(this.rastgele() * (hi - lo + 1)); break; }
                    case 'bekle': yield Math.max(0, S(d.ms)); break;
                    case 'tekrar': for (let i = 0; i < Math.min(1000, S(d.n)); i++) yield* this.calistir(d.govde || []); break;
                    case 'eger': if (this.kosul(d)) yield* this.calistir(d.govde || []); break;
                    case 'eger_degilse': yield* this.calistir((this.kosul(d) ? d.govde : d.govde2) || []); break;
                    case 'nota': { const n = NOTALAR.find(x => x[0] === d.nota) || NOTALAR[0]; const ms = Math.max(50, S(d.ms)); this.sesler.push({ f: n[1], ms, zaman: this.zaman }); yield ms; break; }
                }
            }
        }
    }

    // ---------- Denetim yardımcıları ----------
    const ESIT = (e, ad) => e.join('') === ikonEkran(ad).join('');
    const rakamEkrani = (c) => { const k = new Kart({}); k.goster(String(c)).next(); return k.ekran.join(''); };
    const RAKAMLAR = Object.fromEntries([...'0123456789'].map(c => [rakamEkrani(c), +c]));
    const ekrandakiRakam = (e) => RAKAMLAR[e.join('')];
    function kur(p, tohum = 7) { const k = new Kart(JSON.parse(JSON.stringify(p)), tohum); k.baslat(); return k; }
    // ms boyunca her tikte ekranı kaydeder
    function izle(k, ms) { const l = []; for (let t = 0; t < ms; t += TIK) { k.adim(TIK); l.push([...k.ekran]); } return l; }
    const ikonGorundu = (kareler, ad) => kareler.some(e => ESIT(e, ad));
    const HARF = (c) => rakamEkrani(c);
    // Kayıttaki ayrı ayrı görünen rakamlar (arada boş ekran olan)
    const zarlar = (l) => { const r = []; let onceki; for (const e of l) { const x = ekrandakiRakam(e); if (x !== undefined && onceki === undefined) r.push(x); onceki = x; } return r; };
    function kilitDene(k, dizi) { for (const c of dizi) { k.dugme(c); k.adim(200); } }

    const GOREVLER = [
        {
            id: 'kalp', ad: 'Atan Kalp', sinif: [3, 12],
            anlatim: 'İlk programın! Kart açılınca ekranda kalp sürekli atsın: <b>kalp</b> ve <b>küçük kalp</b> ikonları sırayla, arada beklemeyle görünsün.',
            bloklar: ['baslayinca', 'surekli', 'ikon_goster', 'bekle', 'temizle'],
            denetimler: [
                { ad: 'Kart açılınca kalp görünsün', f: (p) => ikonGorundu(izle(kur(p), 1500), 'kalp') },
                { ad: 'Kalp ve küçük kalp sırayla değişsin', f: (p) => { const l = izle(kur(p), 4000).map(e => (ESIT(e, 'kalp') ? 'K' : ESIT(e, 'kucuk_kalp') ? 'k' : '')).filter(Boolean); let g = 0; for (let i = 1; i < l.length; i++) if (l[i] !== l[i - 1]) g++; return g >= 4; } },
                { ad: 'Her ikon en az 0,2 saniye ekranda kalsın (bekle)', f: (p) => { const l = izle(kur(p), 3000); let en = 0, s = 0; for (let i = 0; i < l.length; i++) { s = i && l[i].join('') === l[i - 1].join('') ? s + 1 : 1; if (ESIT(l[i], 'kalp')) en = Math.max(en, s); } return en * TIK >= 200; } }
            ]
        },
        {
            id: 'isim', ad: 'İsim Kartı', sinif: [3, 12],
            anlatim: 'Kartın bir isim kartı olsun. <b>A</b> düğmesine basınca adın ekranda kaysın, <b>B</b> düğmesine basınca gülen yüz görünsün.',
            bloklar: ['a_basilinca', 'b_basilinca', 'yazi_goster', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'A\'ya basınca yazı kaysın', f: (p) => { const k = kur(p); k.adim(100); k.dugme('A'); const l = izle(k, 3000); return new Set(l.map(e => e.join(''))).size >= 6; } },
                { ad: 'B\'ye basınca gülen yüz görünsün', f: (p) => { const k = kur(p); k.adim(100); k.dugme('B'); return ikonGorundu(izle(k, 600), 'gulen'); } },
                { ad: 'Düğmeye basılmadan ekran boş kalsın', f: (p) => izle(kur(p), 1000).every(e => !e.includes(1)) }
            ]
        },
        {
            id: 'sayac', ad: 'Adım Sayar', sinif: [4, 12],
            anlatim: '<b>a</b> değişkeniyle bir sayaç yap. Başlangıçta <b>0</b> göster. <b>A</b>\'ya her basışta sayaç 1 artsın ve ekranda görünsün. <b>B</b> sayacı sıfırlasın.',
            bloklar: ['baslayinca', 'a_basilinca', 'b_basilinca', 'deg_yap', 'deg_degistir', 'deg_goster', 'sayi_goster'],
            denetimler: [
                { ad: 'Başlangıçta 0 görünsün', f: (p) => { const k = kur(p); k.adim(300); return ekrandakiRakam(k.ekran) === 0; } },
                { ad: 'A\'ya 3 kez basınca 3 görünsün', f: (p) => { const k = kur(p); k.adim(200); for (let i = 0; i < 3; i++) { k.dugme('A'); k.adim(300); } return ekrandakiRakam(k.ekran) === 3; } },
                { ad: 'B\'ye basınca tekrar 0 olsun', f: (p) => { const k = kur(p); k.adim(200); for (let i = 0; i < 4; i++) { k.dugme('A'); k.adim(300); } k.dugme('B'); k.adim(300); const sifir = ekrandakiRakam(k.ekran) === 0; k.dugme('A'); k.adim(300); return sifir && ekrandakiRakam(k.ekran) === 1; } }
            ]
        },
        {
            id: 'zar', ad: 'Elektronik Zar', sinif: [4, 12],
            anlatim: 'Kartı sallayınca 1 ile 6 arasında rastgele bir sayı göstersin. (İpucu: <b>a = rastgele</b> bloğu, sonra <b>değişkeni göster</b>.)',
            bloklar: ['sallaninca', 'deg_rastgele', 'deg_goster', 'sayi_goster', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Sallayınca bir sayı görünsün', f: (p) => { const k = kur(p); k.adim(100); k.salla(); k.adim(200); return ekrandakiRakam(k.ekran) !== undefined; } },
                { ad: 'Sayılar hep 1 ile 6 arasında olsun ve değişsin', f: (p) => { const k = kur(p, 99); const g = new Set(); for (let i = 0; i < 40; i++) { k.salla(); k.adim(300); const r = ekrandakiRakam(k.ekran); if (r === undefined || r < 1 || r > 6) return false; g.add(r); } return g.size >= 5; } }
            ]
        },
        {
            id: 'termo', ad: 'Termometre', sinif: [5, 12],
            anlatim: 'Kart sürekli sıcaklığı kontrol etsin: sıcaklık <b>30</b>\'dan büyükse <b>üzgün yüz</b> (çok sıcak!), değilse <b>gülen yüz</b> göstersin. Kaydırıcıyla sıcaklığı değiştirip dene.',
            bloklar: ['baslayinca', 'surekli', 'eger', 'eger_degilse', 'ikon_goster', 'sensor_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Sıcaklık 35 iken üzgün yüz görünsün', f: (p) => { const k = kur(p); k.sicaklik = 35; k.adim(1000); return ESIT(k.ekran, 'uzgun'); } },
                { ad: 'Sıcaklık 20 iken gülen yüz görünsün', f: (p) => { const k = kur(p); k.sicaklik = 20; k.adim(1000); return ESIT(k.ekran, 'gulen'); } },
                { ad: 'Sıcaklık değişince ekran da değişsin', f: (p) => { const k = kur(p); k.sicaklik = 20; k.adim(800); const a = ESIT(k.ekran, 'gulen'); k.sicaklik = 31; k.adim(800); const b = ESIT(k.ekran, 'uzgun'); k.sicaklik = 30; k.adim(800); return a && b && ESIT(k.ekran, 'gulen'); } }
            ]
        },
        {
            id: 'gece', ad: 'Gece Lambası', sinif: [5, 12],
            anlatim: 'Işık sensörüyle bir gece lambası yap: ortam karanlıksa (ışık <b>50</b>\'den az) bütün LED\'ler yansın, aydınlıksa ekran sönsün.',
            bloklar: ['surekli', 'eger', 'eger_degilse', 'ikon_goster', 'temizle', 'led', 'bekle'],
            denetimler: [
                { ad: 'Karanlıkta (ışık 20) LED\'ler yansın', f: (p) => { const k = kur(p); k.isik = 20; k.adim(800); return k.ekran.filter(Boolean).length >= 20; } },
                { ad: 'Aydınlıkta (ışık 200) ekran sönsün', f: (p) => { const k = kur(p); k.isik = 200; k.adim(800); return k.ekran.every(x => !x); } },
                { ad: 'Işık değişince lamba da değişsin', f: (p) => { const k = kur(p); k.isik = 200; k.adim(600); const a = k.ekran.every(x => !x); k.isik = 49; k.adim(600); const b = k.ekran.filter(Boolean).length >= 20; k.isik = 50; k.adim(600); return a && b && k.ekran.every(x => !x); } }
            ]
        },
        {
            id: 'tkm', ad: 'Taş Kâğıt Makas', sinif: [5, 12],
            anlatim: 'Kartı sallayınca rastgele <b>taş</b>, <b>kâğıt</b> ya da <b>makas</b> ikonu çıksın. (İpucu: a = rastgele 1 ile 3; sonra eğer a = 1 ise taş…)',
            bloklar: ['sallaninca', 'deg_rastgele', 'eger', 'eger_degilse', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Sallayınca bu üç ikondan biri çıksın', f: (p) => { const k = kur(p, 5); for (let i = 0; i < 20; i++) { k.salla(); k.adim(200); if (!['tas', 'kagit', 'makas'].some(a => ESIT(k.ekran, a))) return false; } return true; } },
                { ad: 'Üçü de çıkabilsin', f: (p) => { const k = kur(p, 11); const g = new Set(); for (let i = 0; i < 40; i++) { k.salla(); k.adim(200); ['tas', 'kagit', 'makas'].forEach(a => { if (ESIT(k.ekran, a)) g.add(a); }); } return g.size === 3; } }
            ]
        },
        {
            id: 'zil', ad: 'Kapı Zili', sinif: [4, 12],
            anlatim: '<b>A</b> düğmesi bir kapı zili olsun: basınca ekranda nota ikonu görünsün ve en az <b>3 nota</b>dan oluşan bir melodi çalsın. Melodi bitince ekran temizlensin.',
            bloklar: ['a_basilinca', 'nota', 'ikon_goster', 'temizle', 'tekrar', 'bekle'],
            denetimler: [
                { ad: 'A\'ya basınca en az 3 nota çalsın', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(5000); return k.sesler.length >= 3; } },
                { ad: 'Çalarken nota ikonu görünsün', f: (p) => { const k = kur(p); k.dugme('A'); return ikonGorundu(izle(k, 1000), 'nota'); } },
                { ad: 'Melodi bitince ekran temizlensin', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(8000); return k.sesler.length >= 3 && k.ekran.every(x => !x); } }
            ]
        },
        // ---------- İkinci set ----------
        {
            id: 'duygu', ad: 'Duygu Kartı', sinif: [3, 12],
            anlatim: 'Bugün nasıl hissediyorsun? <b>A</b> gülen yüz, <b>B</b> üzgün yüz, <b>A ile B birlikte</b> kalp göstersin.',
            bloklar: ['a_basilinca', 'b_basilinca', 'ab_basilinca', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'A\'ya basınca gülen yüz', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(200); return ESIT(k.ekran, 'gulen'); } },
                { ad: 'B\'ye basınca üzgün yüz', f: (p) => { const k = kur(p); k.dugme('B'); k.adim(200); return ESIT(k.ekran, 'uzgun'); } },
                { ad: 'A+B birlikte basınca kalp', f: (p) => { const k = kur(p); k.dugme('AB'); k.adim(200); return ESIT(k.ekran, 'kalp'); } }
            ]
        },
        {
            id: 'yon', ad: 'Yön Gösterici', sinif: [3, 12],
            anlatim: 'Bisiklet sürerken dönüş sinyali! <b>A</b> sol ok, <b>B</b> sağ ok göstersin. Kart sallanınca yukarı ok (düz git) görünsün.',
            bloklar: ['a_basilinca', 'b_basilinca', 'sallaninca', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'A\'ya basınca sol ok', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(200); return ESIT(k.ekran, 'sol'); } },
                { ad: 'B\'ye basınca sağ ok', f: (p) => { const k = kur(p); k.dugme('B'); k.adim(200); return ESIT(k.ekran, 'sag'); } },
                { ad: 'Sallayınca yukarı ok', f: (p) => { const k = kur(p); k.salla(); k.adim(200); return ESIT(k.ekran, 'yukari'); } }
            ]
        },
        {
            id: 'gerisayim', ad: 'Roket Fırlatma', sinif: [4, 12],
            anlatim: 'Kart açılınca 5\'ten 1\'e geri saysın; her sayı yaklaşık 1 saniye görünsün. Sonunda yıldız çıksın: fırlatma! (İpucu: a = 5, tekrarla 5 kez: göster, bekle, a\'yı -1 artır.)',
            bloklar: ['baslayinca', 'sayi_goster', 'deg_yap', 'deg_degistir', 'deg_goster', 'tekrar', 'bekle', 'ikon_goster', 'temizle'],
            denetimler: [
                { ad: '5, 4, 3, 2, 1 sırayla görünsün', f: (p) => { const l = izle(kur(p), 7000).map(ekrandakiRakam).filter(x => x !== undefined).filter((x, i, a) => i === 0 || a[i - 1] !== x); return l.join('').includes('54321'); } },
                { ad: 'Her sayı en az yarım saniye kalsın', f: (p) => { const l = izle(kur(p), 7000).map(ekrandakiRakam); const say = {}; l.forEach(x => { if (x !== undefined) say[x] = (say[x] || 0) + 1; }); return [5, 4, 3, 2, 1].every(r => (say[r] || 0) * TIK >= 500); } },
                { ad: 'Sonunda yıldız görünsün', f: (p) => { const l = izle(kur(p), 8000); const i = l.findIndex(e => ESIT(e, 'yildiz')), j = l.map(ekrandakiRakam).lastIndexOf(1); return i >= 0 && i > j; } }
            ]
        },
        {
            id: 'yanson', ad: 'Yanıp Sönen LED', sinif: [3, 12],
            anlatim: 'Ortadaki LED (<b>x: 2, y: 2</b>) sürekli yanıp sönsün. Her durum en az 0,2 saniye sürsün; diğer LED\'ler hep sönük kalsın.',
            bloklar: ['surekli', 'led', 'bekle', 'temizle'],
            denetimler: [
                { ad: 'Ortadaki LED yanıp sönsün', f: (p) => { const l = izle(kur(p), 3000).map(e => e[12]); let g = 0; for (let i = 1; i < l.length; i++) if (l[i] !== l[i - 1]) g++; return g >= 4; } },
                { ad: 'Her durum en az 0,2 saniye sürsün', f: (p) => { const l = izle(kur(p), 3000).map(e => e[12]); let s = 1, en = 99; for (let i = 1; i < l.length; i++) { if (l[i] === l[i - 1]) s++; else { en = Math.min(en, s); s = 1; } } return en < 99 && en * TIK >= 200; } },
                { ad: 'Diğer LED\'ler sönük kalsın', f: (p) => izle(kur(p), 2000).every(e => e.every((v, i) => i === 12 || !v)) && izle(kur(p), 2000).some(e => e[12]) }
            ]
        },
        {
            id: 'kose', ad: 'Dört Köşe', sinif: [3, 12],
            anlatim: '<b>LED yak</b> bloğuyla ekranın yalnızca dört köşesini yak. Sol üst köşe <b>x: 0, y: 0</b>, sağ alt köşe <b>x: 4, y: 4</b>.',
            bloklar: ['baslayinca', 'led', 'temizle'],
            denetimler: [
                { ad: 'Dört köşe yansın', f: (p) => { const k = kur(p); k.adim(200); return [0, 4, 20, 24].every(i => k.ekran[i]); } },
                { ad: 'Başka LED yanmasın', f: (p) => { const k = kur(p); k.adim(200); return k.ekran.filter(Boolean).length === 4 && [0, 4, 20, 24].every(i => k.ekran[i]); } }
            ]
        },
        {
            id: 'skor', ad: 'Skor Tabelası', sinif: [4, 12],
            anlatim: 'İki takımlı bir maç! <b>a</b> 1. takımın, <b>b</b> 2. takımın golü. A\'ya basınca a artıp gösterilsin, B\'ye basınca b artıp gösterilsin. A+B birlikte basınca ikisi de 0 olsun.',
            bloklar: ['baslayinca', 'a_basilinca', 'b_basilinca', 'ab_basilinca', 'deg_yap', 'deg_degistir', 'deg_goster', 'sayi_goster'],
            denetimler: [
                { ad: 'A\'ya 3 kez basınca 3 görünsün', f: (p) => { const k = kur(p); for (let i = 0; i < 3; i++) { k.dugme('A'); k.adim(300); } return ekrandakiRakam(k.ekran) === 3; } },
                { ad: 'B\'ye 2 kez basınca 2 görünsün (A\'dan bağımsız)', f: (p) => { const k = kur(p); for (let i = 0; i < 4; i++) { k.dugme('A'); k.adim(300); } for (let i = 0; i < 2; i++) { k.dugme('B'); k.adim(300); } return ekrandakiRakam(k.ekran) === 2; } },
                { ad: 'A+B ile iki skor da sıfırlansın', f: (p) => { const k = kur(p); for (let i = 0; i < 3; i++) { k.dugme('A'); k.adim(300); k.dugme('B'); k.adim(300); } k.dugme('AB'); k.adim(300); k.dugme('A'); k.adim(300); const a = ekrandakiRakam(k.ekran); k.dugme('B'); k.adim(300); return a === 1 && ekrandakiRakam(k.ekran) === 1; } }
            ]
        },
        {
            id: 'sensoroku', ad: 'Sensör Okuyucu', sinif: [4, 12],
            anlatim: 'Kartın sensörlerini oku: <b>A</b>\'ya basınca sıcaklık, <b>B</b>\'ye basınca ışık düzeyi ekranda kaysın. Kaydırıcılarla değerleri değiştirip dene.',
            bloklar: ['a_basilinca', 'b_basilinca', 'sensor_goster', 'sayi_goster', 'ikon_goster', 'temizle'],
            denetimler: [
                { ad: 'A\'ya basınca sıcaklık gösterilsin', f: (p) => { const k = kur(p); k.sicaklik = 7; k.dugme('A'); k.adim(60); return ekrandakiRakam(k.ekran) === 7; } },
                { ad: 'B\'ye basınca ışık gösterilsin', f: (p) => { const k = kur(p); k.isik = 4; k.dugme('B'); k.adim(60); return ekrandakiRakam(k.ekran) === 4; } },
                { ad: 'Değer değişince yeni değer gösterilsin', f: (p) => { const k = kur(p); k.sicaklik = 3; k.dugme('A'); k.adim(300); k.sicaklik = 8; k.dugme('A'); k.adim(60); return ekrandakiRakam(k.ekran) === 8; } }
            ]
        },
        {
            id: 'alarm', ad: 'Hırsız Alarmı', sinif: [5, 12],
            anlatim: 'Kartı bir kutunun içine koyduk. Kutu açılırsa içeri ışık girer! Işık <b>100</b>\'den fazlaysa çarpı ikonu görünsün ve nota çalsın; değilse ekran boş kalsın.',
            bloklar: ['surekli', 'eger', 'eger_degilse', 'ikon_goster', 'nota', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Işık 150 iken çarpı ikonu görünsün', f: (p) => { const k = kur(p); k.isik = 150; return ikonGorundu(izle(k, 1500), 'hayir'); } },
                { ad: 'Işık 150 iken alarm çalsın', f: (p) => { const k = kur(p); k.isik = 150; k.adim(1500); return k.sesler.length > 0; } },
                { ad: 'Kutu kapanınca (ışık 20) alarm sussun, ekran boşalsın', f: (p) => { const k = kur(p); k.isik = 20; const l = izle(k, 1500); if (!l.every(e => !e.includes(1)) || k.sesler.length) return false; k.isik = 150; k.adim(1500); k.isik = 20; k.adim(800); const n = k.sesler.length; k.adim(1500); return k.ekran.every(x => !x) && k.sesler.length === n; } }
            ]
        },
        {
            id: 'sihirli', ad: 'Sihirli Küre', sinif: [4, 12],
            anlatim: 'Bir soru sor ve kartı salla! <b>%50 şansla</b> evet (✔), değilse hayır (✖) ikonu çıksın. Koşul listesinde "% sayı şansla" var.',
            bloklar: ['sallaninca', 'eger', 'eger_degilse', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Sallayınca evet ya da hayır çıksın', f: (p) => { const k = kur(p, 3); for (let i = 0; i < 20; i++) { k.salla(); k.adim(200); if (!ESIT(k.ekran, 'evet') && !ESIT(k.ekran, 'hayir')) return false; } return true; } },
                { ad: 'İkisi de çıkabilsin', f: (p) => { const k = kur(p, 9); const g = new Set(); for (let i = 0; i < 30; i++) { k.salla(); k.adim(200); if (ESIT(k.ekran, 'evet')) g.add('e'); if (ESIT(k.ekran, 'hayir')) g.add('h'); } return g.size === 2; } }
            ]
        },
        {
            id: 'yazitura', ad: 'Yazı Tura', sinif: [4, 12],
            anlatim: 'Kartı sallayınca para atılsın: <b>a = rastgele 1 ile 2</b>; a = 1 ise ekranda <b>Y</b>, değilse <b>T</b> harfi görünsün ("yazı kaydır" bloğuna tek harf yazınca harf sabit durur).',
            bloklar: ['sallaninca', 'deg_rastgele', 'eger', 'eger_degilse', 'yazi_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Sallayınca Y ya da T görünsün', f: (p) => { const k = kur(p, 4); for (let i = 0; i < 20; i++) { k.salla(); k.adim(200); const e = k.ekran.join(''); if (e !== HARF('Y') && e !== HARF('T')) return false; } return true; } },
                { ad: 'İkisi de gelebilsin', f: (p) => { const k = kur(p, 21); const g = new Set(); for (let i = 0; i < 30; i++) { k.salla(); k.adim(200); g.add(k.ekran.join('')); } return g.has(HARF('Y')) && g.has(HARF('T')); } }
            ]
        },
        {
            id: 'doremi', ad: 'Do Re Mi', sinif: [3, 12],
            anlatim: '<b>A</b>\'ya basınca gamın ilk beş notası sırayla çalsın: <b>do, re, mi, fa, sol</b>.',
            bloklar: ['a_basilinca', 'nota', 'ikon_goster', 'temizle'],
            denetimler: [
                { ad: 'Beş nota çalsın', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(5000); return k.sesler.length === 5; } },
                { ad: 'Notalar do, re, mi, fa, sol sırasında olsun', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(5000); return k.sesler.map(s => s.f).join() === '262,294,330,349,392'; } }
            ]
        },
        {
            id: 'muzikkutusu', ad: 'Müzik Kutusu', sinif: [4, 12],
            anlatim: 'İki şarkılı bir müzik kutusu: <b>A</b> ve <b>B</b> farklı birer melodi çalsın (her biri en az 4 nota). Çalarken nota ikonu görünsün.',
            bloklar: ['a_basilinca', 'b_basilinca', 'nota', 'tekrar', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'A en az 4 notalık bir melodi çalsın', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(8000); return k.sesler.length >= 4; } },
                { ad: 'B en az 4 notalık bir melodi çalsın', f: (p) => { const k = kur(p); k.dugme('B'); k.adim(8000); return k.sesler.length >= 4; } },
                { ad: 'İki melodi birbirinden farklı olsun', f: (p) => { const a = kur(p); a.dugme('A'); a.adim(8000); const b = kur(p); b.dugme('B'); b.adim(8000); return a.sesler.length > 0 && b.sesler.length > 0 && a.sesler.map(s => s.f).join() !== b.sesler.map(s => s.f).join(); } },
                { ad: 'Çalarken nota ikonu görünsün', f: (p) => { const k = kur(p); k.dugme('A'); return ikonGorundu(izle(k, 1000), 'nota'); } }
            ]
        },
        {
            id: 'adimhedef', ad: 'Adım Hedefi', sinif: [4, 12],
            anlatim: 'Her sallanış bir adım! Sallanınca <b>a</b> 1 artsın ve gösterilsin. a <b>10</b> olunca yıldız ikonu çıksın: günlük hedefe ulaştın!',
            bloklar: ['baslayinca', 'sallaninca', 'deg_yap', 'deg_degistir', 'deg_goster', 'eger', 'ikon_goster', 'temizle'],
            denetimler: [
                { ad: 'Her sallanışta adım sayısı gösterilsin', f: (p) => { const k = kur(p); for (let i = 0; i < 3; i++) { k.salla(); k.adim(300); } return ekrandakiRakam(k.ekran) === 3; } },
                { ad: '9 adımda yıldız çıkmasın', f: (p) => { const k = kur(p); let y = false; for (let i = 0; i < 9; i++) { k.salla(); if (ikonGorundu(izle(k, 300), 'yildiz')) y = true; } return !y; } },
                { ad: '10. adımda yıldız çıksın', f: (p) => { const k = kur(p); for (let i = 0; i < 9; i++) { k.salla(); k.adim(300); } k.salla(); return ikonGorundu(izle(k, 3000), 'yildiz'); } }
            ]
        },
        {
            id: 'gerisayac', ad: 'Kalan Hak', sinif: [4, 12],
            anlatim: 'Bir oyunda 9 hakkın var. Başlangıçta 9 görünsün; <b>A</b>\'ya her basışta hak 1 azalsın (<b>a\'yı -1 artır</b>). Hak 0 olunca üzgün yüz çıksın.',
            bloklar: ['baslayinca', 'a_basilinca', 'deg_yap', 'deg_degistir', 'deg_goster', 'eger', 'eger_degilse', 'ikon_goster'],
            denetimler: [
                { ad: 'Başlangıçta 9 görünsün', f: (p) => { const k = kur(p); k.adim(200); return ekrandakiRakam(k.ekran) === 9; } },
                { ad: 'A\'ya 3 kez basınca 6 görünsün', f: (p) => { const k = kur(p); k.adim(100); for (let i = 0; i < 3; i++) { k.dugme('A'); k.adim(300); } return ekrandakiRakam(k.ekran) === 6; } },
                { ad: 'Hak bitince üzgün yüz çıksın', f: (p) => { const k = kur(p); k.adim(100); for (let i = 0; i < 9; i++) { k.dugme('A'); k.adim(300); } return ESIT(k.ekran, 'uzgun'); } }
            ]
        },
        {
            id: 'ciftzar', ad: 'Çift Zar', sinif: [5, 12],
            anlatim: 'Tavla için iki zar! Sallanınca <b>a</b> ve <b>b</b> 1–6 arası rastgele olsun. Önce a gösterilsin, kısa bir süre ekran temizlensin, sonra b gösterilsin.',
            bloklar: ['sallaninca', 'deg_rastgele', 'deg_goster', 'bekle', 'temizle', 'ikon_goster'],
            denetimler: [
                { ad: 'Sallayınca iki ayrı zar gösterilsin', f: (p) => { const k = kur(p, 8); k.salla(); return zarlar(izle(k, 2500)).length === 2; } },
                { ad: 'Zarlar hep 1–6 arasında olsun', f: (p) => { const k = kur(p, 12); for (let i = 0; i < 15; i++) { k.salla(); const z = zarlar(izle(k, 2500)); if (z.length !== 2 || z.some(x => x < 1 || x > 6)) return false; } return true; } },
                { ad: 'İki zar birbirinden bağımsız olsun', f: (p) => { const k = kur(p, 5); let farkli = 0; for (let i = 0; i < 15; i++) { k.salla(); const z = zarlar(izle(k, 2500)); if (z[0] !== z[1]) farkli++; } return farkli >= 5; } }
            ]
        },
        {
            id: 'isikolcer', ad: 'Işık Ölçer', sinif: [5, 12],
            anlatim: 'Işık düzeyini üç basamakta göster: ışık 50\'den azsa <b>1</b>, 150\'den azsa <b>2</b>, daha fazlaysa <b>3</b>. İç içe "eğer … değilse" kullan.',
            bloklar: ['surekli', 'eger', 'eger_degilse', 'sayi_goster', 'bekle'],
            denetimler: [
                { ad: 'Karanlıkta (20) 1 görünsün', f: (p) => { const k = kur(p); k.isik = 20; k.adim(600); return ekrandakiRakam(k.ekran) === 1; } },
                { ad: 'Loşta (100) 2 görünsün', f: (p) => { const k = kur(p); k.isik = 100; k.adim(600); return ekrandakiRakam(k.ekran) === 2; } },
                { ad: 'Aydınlıkta (200) 3 görünsün', f: (p) => { const k = kur(p); k.isik = 200; k.adim(600); return ekrandakiRakam(k.ekran) === 3; } },
                { ad: 'Sınırlar doğru olsun (50 → 2, 150 → 3)', f: (p) => { const k = kur(p); k.isik = 50; k.adim(600); const a = ekrandakiRakam(k.ekran); k.isik = 150; k.adim(600); return a === 2 && ekrandakiRakam(k.ekran) === 3; } }
            ]
        },
        {
            id: 'sicaklikalarm', ad: 'Sera Bekçisi', sinif: [5, 12],
            anlatim: 'Seradaki bitkiler için: sıcaklık 35\'ten fazlaysa üzgün yüz ve uyarı notası, 10\'dan azsa çarpı ikonu, ikisi de değilse gülen yüz.',
            bloklar: ['surekli', 'eger', 'eger_degilse', 'ikon_goster', 'nota', 'bekle'],
            denetimler: [
                { ad: '40 derecede üzgün yüz ve uyarı', f: (p) => { const k = kur(p); k.sicaklik = 40; const l = izle(k, 1500); return ikonGorundu(l, 'uzgun') && k.sesler.length > 0; } },
                { ad: '5 derecede çarpı ikonu', f: (p) => { const k = kur(p); k.sicaklik = 5; k.adim(800); return ESIT(k.ekran, 'hayir'); } },
                { ad: '22 derecede gülen yüz, ses yok', f: (p) => { const k = kur(p); k.sicaklik = 22; k.adim(800); return ESIT(k.ekran, 'gulen') && k.sesler.length === 0; } }
            ]
        },
        {
            id: 'kilit', ad: 'Şifreli Kilit', sinif: [6, 12],
            anlatim: 'Şifre: <b>A\'ya iki kez bas, sonra B\'ye bas.</b> A her basışta a\'yı artırsın. B\'ye basınca a = 2 ise ✔, değilse ✖ göstersin ve a sıfırlansın.',
            bloklar: ['baslayinca', 'a_basilinca', 'b_basilinca', 'deg_yap', 'deg_degistir', 'eger', 'eger_degilse', 'ikon_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'A, A, B → kilit açılsın (✔)', f: (p) => { const k = kur(p); kilitDene(k, 'AAB'); return ESIT(k.ekran, 'evet'); } },
                { ad: 'A, B → yanlış şifre (✖)', f: (p) => { const k = kur(p); kilitDene(k, 'AB'); return ESIT(k.ekran, 'hayir'); } },
                { ad: 'A, A, A, B → yanlış şifre (✖)', f: (p) => { const k = kur(p); kilitDene(k, 'AAAB'); return ESIT(k.ekran, 'hayir'); } },
                { ad: 'Yanlış denemeden sonra doğru şifre çalışsın', f: (p) => { const k = kur(p); kilitDene(k, 'AAAB'); kilitDene(k, 'AAB'); return ESIT(k.ekran, 'evet'); } }
            ]
        },
        {
            id: 'kronometre', ad: 'Kronometre', sinif: [5, 12],
            anlatim: '<b>A</b>\'ya basınca kronometre 0\'dan 9\'a kadar saysın; her saniye 1 artsın. (tekrarla 9 kez: bekle 1000 ms, a\'yı artır, göster.)',
            bloklar: ['a_basilinca', 'deg_yap', 'deg_degistir', 'deg_goster', 'tekrar', 'bekle'],
            denetimler: [
                { ad: 'Başlayınca 0 görünsün', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(200); return ekrandakiRakam(k.ekran) === 0; } },
                { ad: 'Yaklaşık 1 saniye sonra 1, 3 saniye sonra 3', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(1300); const a = ekrandakiRakam(k.ekran); k.adim(2000); return a === 1 && ekrandakiRakam(k.ekran) === 3; } },
                { ad: '9\'da dursun', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(9500); const a = ekrandakiRakam(k.ekran); k.adim(3000); return a === 9 && ekrandakiRakam(k.ekran) === 9; } }
            ]
        },
        {
            id: 'zamanlayici', ad: 'Yumurta Zamanlayıcı', sinif: [5, 12],
            anlatim: '<b>A</b>\'ya basınca 3\'ten geri saysın (her sayı 1 saniye), sonra 3 kez nota çalsın ve gülen yüz görünsün: yumurta hazır!',
            bloklar: ['a_basilinca', 'deg_yap', 'deg_degistir', 'deg_goster', 'tekrar', 'bekle', 'nota', 'ikon_goster', 'temizle'],
            denetimler: [
                { ad: '3, 2, 1 sırayla görünsün', f: (p) => { const k = kur(p); k.dugme('A'); const l = izle(k, 5000).map(ekrandakiRakam).filter(x => x !== undefined).filter((x, i, a) => i === 0 || a[i - 1] !== x); return l.join('').startsWith('321'); } },
                { ad: 'Sonra en az 3 nota çalsın', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(9000); return k.sesler.length >= 3 && k.sesler[0].zaman >= 2500; } },
                { ad: 'En sonda gülen yüz görünsün', f: (p) => { const k = kur(p); k.dugme('A'); k.adim(10000); return ESIT(k.ekran, 'gulen'); } }
            ]
        },
        {
            id: 'gecegunduz', ad: 'Gece mi Gündüz mü?', sinif: [4, 12],
            anlatim: 'Kart sürekli ışığa baksın: ışık <b>60</b>\'tan azsa (gece) yıldız, değilse (gündüz) ev ikonu göstersin.',
            bloklar: ['surekli', 'eger', 'eger_degilse', 'ikon_goster', 'bekle'],
            denetimler: [
                { ad: 'Gece (ışık 10) yıldız görünsün', f: (p) => { const k = kur(p); k.isik = 10; k.adim(600); return ESIT(k.ekran, 'yildiz'); } },
                { ad: 'Gündüz (ışık 180) ev görünsün', f: (p) => { const k = kur(p); k.isik = 180; k.adim(600); return ESIT(k.ekran, 'ev'); } },
                { ad: 'Işık değişince ikon da değişsin', f: (p) => { const k = kur(p); k.isik = 180; k.adim(600); const a = ESIT(k.ekran, 'ev'); k.isik = 59; k.adim(600); const b = ESIT(k.ekran, 'yildiz'); k.isik = 60; k.adim(600); return a && b && ESIT(k.ekran, 'ev'); } }
            ]
        },
        {
            id: 'robotselam', ad: 'Robot Selamlıyor', sinif: [3, 12],
            anlatim: 'Kart açılınca robot yüzü görünsün. <b>A</b>\'ya basınca robot <b>MERHABA</b> yazsın, yazı bitince yine robot yüzü görünsün.',
            bloklar: ['baslayinca', 'a_basilinca', 'ikon_goster', 'yazi_goster', 'temizle', 'bekle'],
            denetimler: [
                { ad: 'Açılışta robot yüzü', f: (p) => { const k = kur(p); k.adim(300); return ESIT(k.ekran, 'robot'); } },
                { ad: 'A\'ya basınca yazı kaysın', f: (p) => { const k = kur(p); k.adim(300); k.dugme('A'); return new Set(izle(k, 3000).map(e => e.join(''))).size >= 8; } },
                { ad: 'Yazıdan sonra robot yüzü geri gelsin', f: (p) => { const k = kur(p); k.adim(300); k.dugme('A'); k.adim(9000); return ESIT(k.ekran, 'robot'); } }
            ]
        },
        { id: 'serbest', ad: 'Serbest Atölye', sinif: [3, 12], serbest: true, anlatim: 'Bütün bloklar açık! Kendi icadını yap: adım sayar, reaksiyon oyunu, ışık alarmı, müzik kutusu… Kodun bu cihazda kaydedilir.', bloklar: null, denetimler: [] }
    ];

    function denetle(g, proje) {
        return g.denetimler.map(d => { try { return { ad: d.ad, gecti: !!d.f(proje) }; } catch (e) { return { ad: d.ad, gecti: false }; } });
    }

    const api = { F, glif, IKONLAR, IKON_ADLARI, ikonEkran, NOTALAR, KOSULLAR, tanim, HATLAR, Kart, TIK, GOREVLER, denetle, ekrandakiRakam, ESIT, kur, izle };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Devre = api;
})(typeof window !== 'undefined' ? window : globalThis);
