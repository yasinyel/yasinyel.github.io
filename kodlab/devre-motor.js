// KodLab — KodKart: 5×5 LED ekranlı eğitim kartı simülatörü (motor, bloklar, görevler, otomatik denetim)
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
        { id: 'serbest', ad: 'Serbest Atölye', sinif: [3, 12], serbest: true, anlatim: 'Bütün bloklar açık! Kendi icadını yap: adım sayar, reaksiyon oyunu, ışık alarmı, müzik kutusu… Kodun bu cihazda kaydedilir.', bloklar: null, denetimler: [] }
    ];

    function denetle(g, proje) {
        return g.denetimler.map(d => { try { return { ad: d.ad, gecti: !!d.f(proje) }; } catch (e) { return { ad: d.ad, gecti: false }; } });
    }

    const api = { F, glif, IKONLAR, IKON_ADLARI, ikonEkran, NOTALAR, KOSULLAR, tanim, HATLAR, Kart, TIK, GOREVLER, denetle, ekrandakiRakam, ESIT, kur, izle };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Devre = api;
})(typeof window !== 'undefined' ? window : globalThis);
