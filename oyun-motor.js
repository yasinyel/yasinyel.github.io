// Kodlayalım — Oyun Atölyesi motoru: blok tanımları, oyun çalıştırıcı, görevler ve otomatik denetim
// Sahne koordinatları: x −240…240 (sağ +), y −180…180 (yukarı +), merkez (0,0)
(function (root) {
    'use strict';

    const GEN = 240, YUK = 180;
    const TUSLAR = [['sag', '→ sağ ok'], ['sol', '← sol ok'], ['yukari', '↑ yukarı ok'], ['asagi', '↓ aşağı ok'], ['bosluk', 'boşluk']];
    const EMOJILER = ['🤖', '⭐', '👾', '🎈', '🚀', '🐱', '🐶', '🦖', '🍎', '💎', '🪙', '☄️', '🛸', '🐝', '🌸', '⚽', '🏀', '🧱', '❤️', '🔥', '👻', '🐸', '🦋', '🍕'];
    const ARKALAR = [['uzay', 'Uzay'], ['cim', 'Çimen'], ['deniz', 'Deniz'], ['gece', 'Gece'], ['beyaz', 'Beyaz']];

    // Blok tanımları; karakterler(): [[id, etiket]] (seçili karakter hariç diğerleri)
    function tanim(karakterler) {
        const kosullar = () => [
            ['kenar', 'kenara değiyorsa'],
            ...karakterler().map(([id, et]) => ['dokun:' + id, `${et} değiyorsa`]),
            ...TUSLAR.map(([k, et]) => ['tus:' + k, `${et} basılıysa`]),
            ['puan>', 'puan > sayı'], ['puan=', 'puan = sayı'], ['can<', 'can < sayı'], ['can=', 'can = sayı'], ['sans', '% sayı şansla']
        ];
        const O = '#f59e0b', H = '#1d5fd6', G = '#8b5cf6', D = '#ea580c', K = '#0891b2', S = '#ec4899', Y = '#16a36a';
        return {
            baslayinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '▶ oyun başlayınca']] },
            tus_basili: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['s', 'tus', 'sag', TUSLAR], ['m', 'tuşu basılıyken']] },
            tus_basilinca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['s', 'tus', 'bosluk', TUSLAR], ['m', 'tuşuna basılınca']] },
            tiklaninca: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '🖱 bu karaktere tıklanınca']] },
            surekli: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['m', '🔁 her an']] },
            degince: { renk: O, kategori: 'Olaylar', sapka: true, parca: [['s', 'hedef', undefined, karakterler], ['m', 'karakterine değince']] },
            x_degistir: { renk: H, kategori: 'Hareket', parca: [['m', 'x\'i'], ['n', 'n', 10], ['m', 'değiştir']] },
            y_degistir: { renk: H, kategori: 'Hareket', parca: [['m', 'y\'yi'], ['n', 'n', 10], ['m', 'değiştir']] },
            git: { renk: H, kategori: 'Hareket', parca: [['m', 'git x:'], ['n', 'x', 0], ['m', 'y:'], ['n', 'y', 0]] },
            rastgele_git: { renk: H, kategori: 'Hareket', parca: [['m', 'rastgele bir yere git']] },
            soyle: { renk: G, kategori: 'Görünüm', parca: [['m', 'söyle'], ['t', 'metin', 'Merhaba!'], ['n', 'sure', 2], ['m', 'sn']] },
            kostum: { renk: G, kategori: 'Görünüm', parca: [['m', 'görünüm'], ['s', 'emoji', '🤖', EMOJILER.map(e => [e, e])]] },
            boyut: { renk: G, kategori: 'Görünüm', parca: [['m', 'boyut'], ['n', 'n', 100], ['m', '%']] },
            gizle: { renk: G, kategori: 'Görünüm', parca: [['m', 'gizlen']] },
            goster: { renk: G, kategori: 'Görünüm', parca: [['m', 'görün']] },
            ses: { renk: S, kategori: 'Ses', parca: [['m', '🔊 ses çal'], ['s', 'tur', 'dogru', [['dogru', 'ding'], ['yanlis', 'bzzt'], ['kazan', 'zafer'], ['tik', 'tık']]]] },
            puan_degistir: { renk: D, kategori: 'Değişkenler', parca: [['m', 'puanı'], ['n', 'n', 1], ['m', 'değiştir']] },
            puan_yap: { renk: D, kategori: 'Değişkenler', parca: [['m', 'puanı'], ['n', 'n', 0], ['m', 'yap']] },
            can_degistir: { renk: D, kategori: 'Değişkenler', parca: [['m', 'canı'], ['n', 'n', -1], ['m', 'değiştir']] },
            can_yap: { renk: D, kategori: 'Değişkenler', parca: [['m', 'canı'], ['n', 'n', 3], ['m', 'yap']] },
            tekrar: { renk: K, kategori: 'Kontrol', c: 1, parca: [['m', 'tekrarla'], ['n', 'n', 3], ['m', 'kez']] },
            eger: { renk: K, kategori: 'Kontrol', c: 1, parca: [['m', 'eğer'], ['s', 'k', 'kenar', kosullar], ['m', 'sayı:'], ['n', 'n', 0]] },
            eger_degilse: { renk: K, kategori: 'Kontrol', c: 2, parca: [['m', 'eğer'], ['s', 'k', 'kenar', kosullar], ['m', 'sayı:'], ['n', 'n', 0]] },
            kazan: { renk: Y, kategori: 'Oyun', parca: [['m', '🏆 oyunu kazan:'], ['t', 'metin', 'Kazandın!']] },
            kaybet: { renk: Y, kategori: 'Oyun', parca: [['m', '💀 oyunu kaybet:'], ['t', 'metin', 'Oyun bitti!']] }
        };
    }

    // Tekrarlanabilir rastgele
    function rastgeleUretec(tohum) {
        let s = (tohum >>> 0) || 7;
        return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    }

    // Sayıya çevir; geçersiz değer 0 olur (öğrenci kutuya harf yazsa bile oyun bozulmaz)
    const S = (v) => { const n = +String(v).replace(',', '.'); return isFinite(n) ? n : 0; };

    // ---------- Oyun ----------
    class Oyun {
        constructor(proje, tohum = Date.now()) {
            this.rastgele = rastgeleUretec(tohum);
            this.arka = proje.arka || 'uzay';
            this.karakterler = proje.karakterler.map(k => ({ id: k.id, ad: k.ad, emoji: k.emoji, x: k.x, y: k.y, boyut: k.boyut || 100, gorunur: true, soz: null, betikler: k.betikler || [] }));
            this.puan = 0; this.can = 3;
            this.durum = 'hazir'; this.mesaj = '';
            this.tikNo = 0;
            this.onceki = new Set();
            this.temas = new Set();
            this.sesler = [];
            this.calisanlar = new Set();
        }
        kar(id) { return this.karakterler.find(k => k.id === id); }
        yaricap(k) { return 22 * k.boyut / 100; }
        degiyor(a, b) { return a && b && a.gorunur && b.gorunur && Math.hypot(a.x - b.x, a.y - b.y) < this.yaricap(a) + this.yaricap(b) - 4; }
        kenarda(k) { const r = this.yaricap(k); return Math.abs(k.x) >= GEN - r - 1 || Math.abs(k.y) >= YUK - r - 1; }
        sinirla(k) { const r = this.yaricap(k) * 0.6; k.x = Math.max(-GEN + r, Math.min(GEN - r, k.x)); k.y = Math.max(-YUK + r, Math.min(YUK - r, k.y)); }

        baslat() {
            this.durum = 'oynuyor';
            for (const k of this.karakterler) this.olay(k, h => h.t === 'baslayinca');
        }
        olay(k, filtre) {
            k.betikler.forEach((h, i) => { if (filtre(h)) { this.calisanlar.add(k.id + ':' + i); this.calistir(k, h.govde); } });
        }
        tik(tuslar = new Set()) {
            if (this.durum !== 'oynuyor') return;
            this.calisanlar = new Set();
            this.adim = 0;
            this.tuslar = tuslar;
            for (const k of this.karakterler) {
                if (this.durum !== 'oynuyor') break;
                this.olay(k, h => (h.t === 'tus_basili' && tuslar.has(h.tus)) || (h.t === 'tus_basilinca' && tuslar.has(h.tus) && !this.onceki.has(h.tus)) || h.t === 'surekli');
            }
            // Çarpışma olayları yalnızca temas başladığında bir kez çalışır
            const simdiki = new Set();
            for (const k of this.karakterler) for (const h of k.betikler) {
                if (h.t !== 'degince') continue;
                const anahtar = k.id + '>' + h.hedef;
                if (this.degiyor(k, this.kar(h.hedef))) { simdiki.add(anahtar); if (!this.temas.has(anahtar) && this.durum === 'oynuyor') this.olay(k, x => x === h); }
            }
            this.temas = simdiki;
            for (const k of this.karakterler) if (k.soz && k.soz.bitis <= this.tikNo) k.soz = null;
            this.onceki = new Set(tuslar);
            this.tikNo++;
        }
        tikla(x, y) {
            if (this.durum !== 'oynuyor') return;
            for (const k of [...this.karakterler].reverse()) {
                if (k.gorunur && Math.hypot(k.x - x, k.y - y) <= this.yaricap(k) + 4) { this.olay(k, h => h.t === 'tiklaninca'); return k.id; }
            }
        }
        kosul(k, d) {
            const [tur, deger] = String(d.k).split(':');
            const n = S(d.n);
            switch (tur) {
                case 'kenar': return this.kenarda(k);
                case 'dokun': return this.degiyor(k, this.kar(deger));
                case 'tus': return !!(this.tuslar && this.tuslar.has(deger));
                case 'puan>': return this.puan > n;
                case 'puan=': return this.puan === n;
                case 'can<': return this.can < n;
                case 'can=': return this.can === n;
                case 'sans': return this.rastgele() * 100 < n;
            }
            return false;
        }
        calistir(k, liste) {
            for (const d of liste || []) {
                if (this.durum !== 'oynuyor') return;
                if (++this.adim > 5000) return;
                switch (d.t) {
                    case 'x_degistir': k.x += S(d.n); this.sinirla(k); break;
                    case 'y_degistir': k.y += S(d.n); this.sinirla(k); break;
                    case 'git': k.x = S(d.x); k.y = S(d.y); this.sinirla(k); break;
                    case 'rastgele_git': k.x = Math.round((this.rastgele() * 2 - 1) * (GEN - 30)); k.y = Math.round((this.rastgele() * 2 - 1) * (YUK - 30)); break;
                    case 'soyle': k.soz = { metin: String(d.metin), bitis: this.tikNo + Math.max(1, S(d.sure) * 30) }; break;
                    case 'kostum': k.emoji = d.emoji; break;
                    case 'boyut': k.boyut = Math.max(10, Math.min(400, S(d.n))); break;
                    case 'gizle': k.gorunur = false; break;
                    case 'goster': k.gorunur = true; break;
                    case 'ses': this.sesler.push(d.tur); break;
                    case 'puan_degistir': this.puan += S(d.n); break;
                    case 'puan_yap': this.puan = S(d.n); break;
                    case 'can_degistir': this.can += S(d.n); break;
                    case 'can_yap': this.can = S(d.n); break;
                    case 'tekrar': for (let i = 0; i < Math.min(S(d.n), 500); i++) this.calistir(k, d.govde); break;
                    case 'eger': if (this.kosul(k, d)) this.calistir(k, d.govde); break;
                    case 'eger_degilse': this.calistir(k, this.kosul(k, d) ? d.govde : d.govde2); break;
                    case 'kazan': this.durum = 'kazandi'; this.mesaj = String(d.metin || 'Kazandın!'); return;
                    case 'kaybet': this.durum = 'kaybetti'; this.mesaj = String(d.metin || 'Oyun bitti!'); return;
                }
            }
        }
    }

    // ---------- Görevler ----------
    const KAR = {
        balon: { id: 'balon', ad: 'Balon', emoji: '🎈', x: 0, y: 0 },
        robot: { id: 'robot', ad: 'Robot', emoji: '🤖', x: -150, y: -100 },
        yildiz: { id: 'yildiz', ad: 'Yıldız', emoji: '⭐', x: 120, y: 80 },
        dusman: { id: 'dusman', ad: 'Uzaylı', emoji: '👾', x: -200, y: 120 },
        kedi: { id: 'kedi', ad: 'Kedi', emoji: '🐱', x: 0, y: -140 },
        elma: { id: 'elma', ad: 'Elma', emoji: '🍎', x: 0, y: 150 },
        kurbaga: { id: 'kurbaga', ad: 'Kurbağa', emoji: '🐸', x: -100, y: 0 },
        bomba: { id: 'bomba', ad: 'Ateş topu', emoji: '🔥', x: 100, y: 0 },
        roket: { id: 'roket', ad: 'Roket', emoji: '🚀', x: -180, y: 0 },
        meteor: { id: 'meteor', ad: 'Meteor', emoji: '☄️', x: 210, y: 0 },
        hayalet: { id: 'hayalet', ad: 'Hayalet', emoji: '👻', x: 150, y: 100 },
        duvar: { id: 'duvar', ad: 'Duvar', emoji: '🧱', x: 0, y: 0, boyut: 220 },
        top: { id: 'top', ad: 'Top', emoji: '⚽', x: -150, y: 0 },
        kale: { id: 'kale', ad: 'Kale', emoji: '🥅', x: 200, y: 0 },
        kalp: { id: 'kalp', ad: 'Kalp', emoji: '❤️', x: 100, y: -100 }
    };
    const yeniKar = (k) => ({ ...k, boyut: k.boyut || 100, betikler: [] });
    const sayiliKopya = (p) => JSON.parse(JSON.stringify(p));

    // Denetim yardımcıları: öğrencinin projesini arka planda oynatır
    function oyunKur(proje, tohum = 42) { const o = new Oyun(sayiliKopya(proje), tohum); o.baslat(); return o; }
    function tikla(o, id) { const k = o.kar(id); return k ? o.tikla(k.x, k.y) : null; }
    function bekle(o, n, tuslar) { for (let i = 0; i < n; i++) o.tik(tuslar || new Set()); }
    function ustune(o, a, b) { const x = o.kar(a), y = o.kar(b); if (x && y) { x.x = y.x; x.y = y.y; } }
    function uzaklastir(o, a, b) { const x = o.kar(a), y = o.kar(b); if (x && y) { x.x = y.x > 0 ? y.x - 150 : y.x + 150; x.y = y.y > 0 ? y.y - 120 : y.y + 120; } }
    const uzaklik = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const GOREVLER = [
        {
            id: 'balon', ad: 'Balon Patlat', sinif: [3, 12],
            anlatim: 'İlk oyununu yap! Balona tıklayınca puan kazanılsın ve balon başka bir yere kaçsın. Olay bloğunu (sarı) çalışma alanına sürükle, altına yapılacakları ekle.',
            karakterler: ['balon'], bloklar: ['tiklaninca', 'baslayinca', 'puan_degistir', 'rastgele_git', 'ses', 'eger', 'kazan', 'soyle'],
            denetimler: [
                { ad: 'Balona tıklanınca puan 1 artsın', f: (p) => { const o = oyunKur(p); tikla(o, 'balon'); return o.puan === 1; } },
                { ad: 'Tıklanınca balon rastgele bir yere gitsin', f: (p) => { const o = oyunKur(p); const b = o.kar('balon'), x = b.x, y = b.y; tikla(o, 'balon'); return Math.hypot(b.x - x, b.y - y) > 5; } },
                { ad: 'Puan 10 olunca oyunu kazan', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 10 && o.durum === 'oynuyor'; i++) { tikla(o, 'balon'); bekle(o, 2); } return o.durum === 'kazandi' && o.puan >= 10; } },
                { ad: '9. tıklamada henüz kazanılmasın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 9; i++) { tikla(o, 'balon'); bekle(o, 2); } return o.durum === 'oynuyor'; } }
            ]
        },
        {
            id: 'hareket', seri: 'avci', ad: 'Yıldız Avcısı 1: Hareket', sinif: [3, 12],
            anlatim: 'Yıldız Avcısı oyununu adım adım yapacağız. Önce robotu ok tuşlarıyla hareket ettir. <b>x</b> sağa-sola, <b>y</b> yukarı-aşağı konumdur: sağa gitmek için x\'i artır, sola için azalt.',
            karakterler: ['robot'], bloklar: ['tus_basili', 'baslayinca', 'x_degistir', 'y_degistir', 'git'],
            denetimler: [
                ...[['sag', 'Sağ ok', (a, b) => b.x > a.x + 20], ['sol', 'Sol ok', (a, b) => b.x < a.x - 20], ['yukari', 'Yukarı ok', (a, b) => b.y > a.y + 20], ['asagi', 'Aşağı ok', (a, b) => b.y < a.y - 20]].map(([t, ad, f]) => ({
                    ad: `${ad} tuşuyla robot o yöne gitsin`, f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = 0; const once = { x: r.x, y: r.y }; bekle(o, 15, new Set([t])); return f(once, r); }
                }))
            ]
        },
        {
            id: 'yildiz', seri: 'avci', ad: 'Yıldız Avcısı 2: Yıldız Topla', sinif: [3, 12],
            anlatim: 'Oyuna bir yıldız ekledik. Karakter listesinden <b>yıldızı</b> seçip ona kod yaz: robota değince puan artsın ve yıldız başka yere gitsin. (İpucu: "karakterine değince" olayı.)',
            karakterler: ['robot', 'yildiz'], bloklar: ['tus_basili', 'baslayinca', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'ses', 'soyle'],
            denetimler: [
                { ad: 'Robot hâlâ ok tuşlarıyla hareket ediyor', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = 0; bekle(o, 15, new Set(['sag'])); return r.x > 20; } },
                { ad: 'Yıldız robota değince puan 1 artsın', f: (p) => { const o = oyunKur(p); ustune(o, 'yildiz', 'robot'); bekle(o, 2); return o.puan === 1; } },
                { ad: 'Toplanan yıldız başka bir yere gitsin', f: (p) => { const o = oyunKur(p); ustune(o, 'yildiz', 'robot'); bekle(o, 2); return uzaklik(o.kar('yildiz'), o.kar('robot')) > 40; } }
            ]
        },
        {
            id: 'dusman', seri: 'avci', ad: 'Yıldız Avcısı 3: Uzaylı', sinif: [4, 12],
            anlatim: 'Bir uzaylı geldi! Uzaylı kendi kendine hareket etsin ("her an" olayı), robota değince robotun canı azalsın. Can 0 olunca oyun kaybedilsin. (İpucu: "eğer can = sayı" koşulu.)',
            karakterler: ['robot', 'yildiz', 'dusman'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'can_degistir', 'can_yap', 'eger', 'eger_degilse', 'kaybet', 'ses', 'soyle'],
            denetimler: [
                { ad: 'Uzaylı kendi kendine hareket etsin', f: (p) => { const o = oyunKur(p); const u = o.kar('dusman'), x = u.x, y = u.y; bekle(o, 30); return Math.hypot(u.x - x, u.y - y) > 20; } },
                { ad: 'Uzaylı robota değince can 1 azalsın', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'dusman', 'robot'); bekle(o, 1); return o.can === c - 1; } },
                { ad: 'Can 0 olunca oyun kaybedilsin', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 5 && o.durum === 'oynuyor'; i++) { ustune(o, 'dusman', 'robot'); bekle(o, 1); uzaklastir(o, 'dusman', 'robot'); bekle(o, 1); } return o.durum === 'kaybetti'; } },
                { ad: 'Yıldız toplama hâlâ çalışıyor', f: (p) => { const o = oyunKur(p); uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); return o.puan >= 1; } }
            ]
        },
        {
            id: 'kazan', seri: 'avci', ad: 'Yıldız Avcısı 4: Zafer', sinif: [4, 12],
            anlatim: 'Son adım: 10 yıldız toplayan oyunu kazansın! Oyunun başında puanı 0, canı 3 yap. Oyunun bitti, şimdi arkadaşlarına oynat!',
            karakterler: ['robot', 'yildiz', 'dusman'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'puan_yap', 'can_degistir', 'can_yap', 'eger', 'eger_degilse', 'kazan', 'kaybet', 'ses', 'soyle', 'boyut'],
            denetimler: [
                { ad: '10 yıldız toplayınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 12 && o.durum === 'oynuyor'; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); const y = o.kar('yildiz'); if (y) { y.x = o.kar('robot').x + 200 > 220 ? -200 : 200; } bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: '9 yıldızda henüz kazanılmasın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 9; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); const y = o.kar('yildiz'); if (y) y.x = 200; bekle(o, 1); } return o.durum === 'oynuyor'; } },
                { ad: 'Uzaylı hâlâ can azaltıyor', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'dusman', 'robot'); bekle(o, 1); return o.can < c || o.durum === 'kaybetti'; } }
            ]
        },
        // ---- Elma Yağmuru ----
        {
            id: 'elma1', seri: 'elma', ad: 'Elma Yağmuru 1: Kedi', sinif: [3, 12],
            anlatim: 'Yeni oyun: gökten elmalar yağacak, kedi onları yakalayacak! Önce kediyi ok tuşlarıyla <b>yalnızca sağa ve sola</b> hareket ettir. Kedi zıplamasın: yukarı-aşağı gitmesin.',
            karakterler: ['kedi'], bloklar: ['tus_basili', 'baslayinca', 'x_degistir', 'git'],
            denetimler: [
                { ad: 'Sağ ok ile kedi sağa gitsin', f: (p) => { const o = oyunKur(p); const k = o.kar('kedi'), x = k.x; bekle(o, 10, new Set(['sag'])); return k.x > x + 20; } },
                { ad: 'Sol ok ile kedi sola gitsin', f: (p) => { const o = oyunKur(p); const k = o.kar('kedi'), x = k.x; bekle(o, 10, new Set(['sol'])); return k.x < x - 20; } },
                { ad: 'Kedi yukarı ya da aşağı gitmesin', f: (p) => { const o = oyunKur(p); const k = o.kar('kedi'), y = k.y; bekle(o, 10, new Set(['sag', 'yukari', 'asagi'])); bekle(o, 10, new Set(['sol'])); return k.y === y; } }
            ]
        },
        {
            id: 'elma2', seri: 'elma', ad: 'Elma Yağmuru 2: Düşen Elma', sinif: [3, 12],
            anlatim: 'Elmayı seç. "Her an" olayıyla elma sürekli aşağı düşsün (y\'yi eksi bir sayıyla değiştir). Yere (kenara) değince yukarıya geri gitsin: <b>git x: 0 y: 150</b>.',
            karakterler: ['kedi', 'elma'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger'],
            denetimler: [
                { ad: 'Elma kendi kendine aşağı düşsün', f: (p) => { const o = oyunKur(p); const e = o.kar('elma'), y = e.y; bekle(o, 10); return e.y < y - 15; } },
                { ad: 'Elma yere değince yukarıdan tekrar düşsün', f: (p) => { const o = oyunKur(p); const e = o.kar('elma'); e.y = -170; bekle(o, 3); return e.y > 100; } },
                { ad: 'Kedi hâlâ sağa-sola gidiyor', f: (p) => { const o = oyunKur(p); const k = o.kar('kedi'), x = k.x; bekle(o, 10, new Set(['sag'])); return k.x > x + 20; } }
            ]
        },
        {
            id: 'elma3', seri: 'elma', ad: 'Elma Yağmuru 3: Yakala!', sinif: [3, 12],
            anlatim: 'Elma kediye değince puan 1 artsın ve elma yukarıya dönsün. 5 elma yakalayan oyunu kazansın.',
            karakterler: ['kedi', 'elma'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'puan_degistir', 'kazan', 'ses'],
            denetimler: [
                { ad: 'Elma kediye değince puan 1 artsın', f: (p) => { const o = oyunKur(p); ustune(o, 'elma', 'kedi'); bekle(o, 1); return o.puan === 1; } },
                { ad: 'Yakalanan elma yukarı dönsün', f: (p) => { const o = oyunKur(p); ustune(o, 'elma', 'kedi'); bekle(o, 1); return o.kar('elma').y > 100; } },
                { ad: '5 elma yakalayınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 6 && o.durum === 'oynuyor'; i++) { ustune(o, 'elma', 'kedi'); bekle(o, 1); o.kar('elma').y = 150; bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: '4 elmada henüz kazanılmasın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 4; i++) { ustune(o, 'elma', 'kedi'); bekle(o, 1); o.kar('elma').y = 150; bekle(o, 1); } return o.durum === 'oynuyor'; } }
            ]
        },
        // ---- Kurbağa Avı ----
        {
            id: 'kurbaga1', seri: 'kurbaga', ad: 'Kurbağa Avı 1: Saklambaç', sinif: [3, 12],
            anlatim: 'Kurbağaya tıklayınca puan 1 artsın ve kurbağa <b>gizlensin</b>. "Her an" olayında "%2 şansla" koşulunu kullan: şans gelince kurbağa rastgele bir yere gitsin ve <b>görünsün</b>.',
            karakterler: ['kurbaga'], bloklar: ['tiklaninca', 'baslayinca', 'surekli', 'puan_degistir', 'gizle', 'goster', 'rastgele_git', 'eger', 'ses'],
            denetimler: [
                { ad: 'Tıklanınca puan 1 artsın', f: (p) => { const o = oyunKur(p); tikla(o, 'kurbaga'); return o.puan === 1; } },
                { ad: 'Tıklanınca kurbağa gizlensin', f: (p) => { const o = oyunKur(p); tikla(o, 'kurbaga'); return o.kar('kurbaga').gorunur === false; } },
                { ad: 'Gizlenen kurbağa bir süre sonra başka yerde görünsün', f: (p) => { const o = oyunKur(p); const k = o.kar('kurbaga'), x = k.x, y = k.y; tikla(o, 'kurbaga'); bekle(o, 400); return k.gorunur && Math.hypot(k.x - x, k.y - y) > 5; } },
                { ad: 'Kurbağa her an ışınlanmasın (şans kullan)', f: (p) => { const o = oyunKur(p); const k = o.kar('kurbaga'); let n = 0, x = k.x; for (let i = 0; i < 100; i++) { bekle(o, 1); if (k.x !== x) { n++; x = k.x; } } return n < 30; } }
            ]
        },
        {
            id: 'kurbaga2', seri: 'kurbaga', ad: 'Kurbağa Avı 2: Bombaya Dikkat', sinif: [4, 12],
            anlatim: 'Oyuna bir ateş topu ekledik: ona tıklayan bir can kaybetsin ve ateş topu başka yere gitsin. Can 0 olunca oyun kaybedilsin, 10 kurbağa yakalayan kazansın.',
            karakterler: ['kurbaga', 'bomba'], bloklar: ['tiklaninca', 'baslayinca', 'surekli', 'puan_degistir', 'can_degistir', 'gizle', 'goster', 'rastgele_git', 'eger', 'kazan', 'kaybet', 'ses'],
            denetimler: [
                { ad: 'Ateş topuna tıklanınca can 1 azalsın', f: (p) => { const o = oyunKur(p); const c = o.can; tikla(o, 'bomba'); return o.can === c - 1; } },
                { ad: 'Can 0 olunca oyun kaybedilsin', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 5 && o.durum === 'oynuyor'; i++) { o.kar('bomba').gorunur = true; tikla(o, 'bomba'); bekle(o, 1); } return o.durum === 'kaybetti'; } },
                { ad: '10 kurbağa yakalayınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 11 && o.durum === 'oynuyor'; i++) { o.kar('kurbaga').gorunur = true; tikla(o, 'kurbaga'); bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: 'Kurbağaya tıklamak hâlâ puan veriyor', f: (p) => { const o = oyunKur(p); tikla(o, 'kurbaga'); return o.puan === 1; } }
            ]
        },
        // ---- Meteor Yağmuru ----
        {
            id: 'meteor1', seri: 'meteor', ad: 'Meteor Yağmuru 1: Uçuş', sinif: [4, 12],
            anlatim: 'Roketin uzayda ilerliyor gibi görünmesi için meteorlar sağdan sola akacak. Roket yukarı ve aşağı oklarla hareket etsin. Meteor her an sola gitsin ve sol kenara değince sağ tarafa dönsün: <b>git x: 210</b>.',
            karakterler: ['roket', 'meteor'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger'],
            denetimler: [
                { ad: 'Yukarı ve aşağı ok roketi hareket ettirsin', f: (p) => { const o = oyunKur(p); const r = o.kar('roket'); r.y = 0; bekle(o, 10, new Set(['yukari'])); const a = r.y; bekle(o, 20, new Set(['asagi'])); return a > 20 && r.y < a - 40; } },
                { ad: 'Meteor kendi kendine sola gitsin', f: (p) => { const o = oyunKur(p); const m = o.kar('meteor'), x = m.x; bekle(o, 10); return m.x < x - 20; } },
                { ad: 'Meteor sol kenara gelince sağdan tekrar gelsin', f: (p) => { const o = oyunKur(p); const m = o.kar('meteor'); m.x = -225; bekle(o, 3); return m.x > 150; } }
            ]
        },
        {
            id: 'meteor2', seri: 'meteor', ad: 'Meteor Yağmuru 2: Çarpışma', sinif: [4, 12],
            anlatim: 'Meteor rokete değince can 1 azalsın ve meteor sağ tarafa dönsün. Can 0 olunca oyun kaybedilsin.',
            karakterler: ['roket', 'meteor'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'can_degistir', 'can_yap', 'kaybet', 'ses'],
            denetimler: [
                { ad: 'Meteor rokete değince can 1 azalsın', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'meteor', 'roket'); bekle(o, 1); return o.can === c - 1; } },
                { ad: 'Çarpan meteor sağ tarafa dönsün', f: (p) => { const o = oyunKur(p); ustune(o, 'meteor', 'roket'); bekle(o, 1); return o.kar('meteor').x > 150; } },
                { ad: 'Can 0 olunca oyun kaybedilsin', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 5 && o.durum === 'oynuyor'; i++) { ustune(o, 'meteor', 'roket'); bekle(o, 1); o.kar('meteor').x = 200; bekle(o, 1); } return o.durum === 'kaybetti'; } },
                { ad: 'Meteor hâlâ sola akıyor', f: (p) => { const o = oyunKur(p); const m = o.kar('meteor'), x = m.x; bekle(o, 10); return m.x < x - 20; } }
            ]
        },
        {
            id: 'meteor3', seri: 'meteor', ad: 'Meteor Yağmuru 3: Dayanıklılık', sinif: [4, 12],
            anlatim: 'Bu oyunda puan zamanla artar: roket her an puanı 1 artırsın. Puan 600\'ü geçince (yaklaşık 20 saniye) oyun kazanılsın.',
            karakterler: ['roket', 'meteor'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'can_degistir', 'can_yap', 'puan_degistir', 'puan_yap', 'kaybet', 'kazan', 'ses'],
            denetimler: [
                { ad: 'Puan zamanla artsın', f: (p) => { const o = oyunKur(p); o.kar('meteor').gorunur = false; bekle(o, 60); return o.puan >= 50; } },
                { ad: 'Puan 600\'ü geçince kazanılsın', f: (p) => { const o = oyunKur(p); o.kar('meteor').gorunur = false; bekle(o, 800); return o.durum === 'kazandi'; } },
                { ad: 'Kısa sürede kazanılmasın', f: (p) => { const o = oyunKur(p); o.kar('meteor').gorunur = false; bekle(o, 300); return o.durum === 'oynuyor'; } },
                { ad: 'Çarpışma hâlâ can azaltıyor', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'meteor', 'roket'); bekle(o, 1); return o.can < c || o.durum === 'kaybetti'; } }
            ]
        },
        // ---- Hayaletten Kaç ----
        {
            id: 'hayalet1', seri: 'hayalet', ad: 'Hayaletten Kaç 1: Işınlanan Hayalet', sinif: [4, 12],
            anlatim: 'Hayalet arada bir ışınlansın: "her an" içinde "%3 şansla" koşulu ve "rastgele bir yere git". Hayalet robota değince can 1 azalsın ve hayalet başka yere ışınlansın. Robotu ok tuşlarıyla hareket ettir.',
            karakterler: ['robot', 'hayalet'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'can_degistir', 'ses'],
            denetimler: [
                { ad: 'Hayalet arada bir ışınlansın (her an değil)', f: (p) => { const o = oyunKur(p); const h = o.kar('hayalet'); let n = 0, x = h.x; for (let i = 0; i < 300; i++) { bekle(o, 1); if (h.x !== x) { n++; x = h.x; } } return n >= 2 && n <= 60; } },
                { ad: 'Hayalet robota değince can 1 azalsın', f: (p) => { const o = oyunKur(p); const c = o.can; for (let i = 0; i < 5 && o.can === c; i++) { ustune(o, 'hayalet', 'robot'); bekle(o, 1); } return o.can === c - 1; } },
                { ad: 'Robota değen hayalet uzaklaşsın', f: (p) => { const o = oyunKur(p); ustune(o, 'hayalet', 'robot'); bekle(o, 1); return uzaklik(o.kar('hayalet'), o.kar('robot')) > 40; } },
                { ad: 'Robot ok tuşlarıyla hareket etsin', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = 0; bekle(o, 10, new Set(['sag', 'yukari'])); return r.x > 20 && r.y > 20; } }
            ]
        },
        {
            id: 'hayalet2', seri: 'hayalet', ad: 'Hayaletten Kaç 2: Kurallar', sinif: [4, 12],
            anlatim: 'Oyunun kurallarını tamamla: başlayınca can 3 ve puan 0 olsun, robot her an 1 puan kazansın, can 0 olunca oyun kaybedilsin, puan 900\'ü geçince kazanılsın.',
            karakterler: ['robot', 'hayalet'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'can_degistir', 'can_yap', 'puan_degistir', 'puan_yap', 'kazan', 'kaybet', 'ses', 'soyle'],
            denetimler: [
                { ad: 'Başlayınca can 3, puan 0 olsun', f: (p) => { const o = new Oyun(sayiliKopya(p), 42); o.can = 9; o.puan = 7; o.baslat(); return o.can === 3 && o.puan === 0; } },
                { ad: 'Can 0 olunca oyun kaybedilsin', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 5 && o.durum === 'oynuyor'; i++) { ustune(o, 'hayalet', 'robot'); bekle(o, 1); uzaklastir(o, 'hayalet', 'robot'); bekle(o, 1); } return o.durum === 'kaybetti'; } },
                { ad: 'Puan 900\'ü geçince kazanılsın', f: (p) => { const o = oyunKur(p); o.kar('hayalet').gorunur = false; bekle(o, 1000); return o.durum === 'kazandi'; } },
                { ad: 'Kısa sürede kazanılmasın', f: (p) => { const o = oyunKur(p); o.kar('hayalet').gorunur = false; bekle(o, 400); return o.durum === 'oynuyor'; } }
            ]
        },
        // ---- Tek bölümlük oyunlar ----
        {
            id: 'sohbet', ad: 'Konuşan Robot', sinif: [3, 12],
            anlatim: 'Robot oyun başlayınca kendini tanıtsın ("söyle" bloğu). Boşluk tuşuna basılınca bir şaka söylesin. Robota tıklanınca görünümü değişsin (ör. 🐱).',
            karakterler: ['robot'], bloklar: ['baslayinca', 'tus_basilinca', 'tiklaninca', 'soyle', 'kostum', 'ses'],
            denetimler: [
                { ad: 'Oyun başlayınca robot bir şey söylesin', f: (p) => { const o = oyunKur(p); const s = o.kar('robot').soz; return !!(s && s.metin.trim()); } },
                { ad: 'Boşluk tuşuna basılınca robot bir şey söylesin', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.soz = null; bekle(o, 1, new Set(['bosluk'])); return !!(r.soz && r.soz.metin.trim()); } },
                { ad: 'Tıklanınca robotun görünümü değişsin', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'), e = r.emoji; tikla(o, 'robot'); return r.emoji !== e; } }
            ]
        },
        {
            id: 'duvar', ad: 'Duvara Dokunma', sinif: [3, 12],
            anlatim: 'Robotu ok tuşlarıyla yıldıza götür ama ortadaki duvara dokunursa başlangıç noktasına (<b>x: -180, y: -120</b>) geri dönsün! Yıldıza ulaşınca oyun kazanılsın.',
            karakterler: ['robot', 'duvar', 'yildiz'], bloklar: ['tus_basili', 'baslayinca', 'degince', 'x_degistir', 'y_degistir', 'git', 'kazan', 'ses', 'soyle'],
            denetimler: [
                { ad: 'Robot dört yöne hareket etsin', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = -100; bekle(o, 8, new Set(['sag', 'yukari'])); const a = { x: r.x, y: r.y }; bekle(o, 16, new Set(['sol', 'asagi'])); return a.x > 20 && a.y > -80 && r.x < a.x - 20 && r.y < a.y - 20; } },
                { ad: 'Duvara değen robot başlangıca dönsün', f: (p) => { const o = oyunKur(p); ustune(o, 'robot', 'duvar'); bekle(o, 1); const r = o.kar('robot'); return Math.abs(r.x + 180) < 15 && Math.abs(r.y + 120) < 15; } },
                { ad: 'Yıldıza ulaşınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); ustune(o, 'robot', 'yildiz'); bekle(o, 1); return o.durum === 'kazandi'; } }
            ]
        },
        {
            id: 'penalti', ad: 'Penaltı', sinif: [4, 12],
            anlatim: 'Boşluk tuşuna basınca top kaleye doğru fırlasın: "tekrarla 10 kez: x\'i 20 değiştir". Top kaleye değince gol olsun (puan +1) ve top başlangıca dönsün (<b>git x: -150 y: 0</b>). 3 gol atan kazansın. Topu yukarı-aşağı oklarla nişan al.',
            karakterler: ['top', 'kale'], bloklar: ['tus_basili', 'tus_basilinca', 'baslayinca', 'degince', 'tekrar', 'x_degistir', 'y_degistir', 'git', 'eger', 'puan_degistir', 'kazan', 'ses'],
            denetimler: [
                { ad: 'Boşluğa basınca top hızla sağa gitsin', f: (p) => { const o = oyunKur(p); const t = o.kar('top'), x = t.x; bekle(o, 1, new Set(['bosluk'])); return t.x > x + 150; } },
                { ad: 'Top kaleye değince puan 1 artsın ve top başa dönsün', f: (p) => { const o = oyunKur(p); ustune(o, 'top', 'kale'); bekle(o, 1); return o.puan === 1 && o.kar('top').x < -100; } },
                { ad: '3 gol atınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 4 && o.durum === 'oynuyor'; i++) { ustune(o, 'top', 'kale'); bekle(o, 1); o.kar('top').x = -150; bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: 'Yukarı-aşağı oklarla nişan alınsın', f: (p) => { const o = oyunKur(p); const t = o.kar('top'), y = t.y; bekle(o, 10, new Set(['yukari'])); return t.y > y + 20; } }
            ]
        },
        {
            id: 'kalp', ad: 'Can Topla', sinif: [4, 12],
            anlatim: 'Uzaylıdan kaçarken kalpleri topla! Kalp robota değince can 1 artsın ve kalp başka yere gitsin. Ama can en fazla 5 olabilir: "eğer can &lt; 5" koşulunu kullan.',
            karakterler: ['robot', 'kalp', 'dusman'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'eger', 'can_degistir', 'can_yap', 'kaybet', 'ses'],
            denetimler: [
                { ad: 'Kalp robota değince can 1 artsın', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'kalp', 'robot'); bekle(o, 1); return o.can === c + 1; } },
                { ad: 'Toplanan kalp başka yere gitsin', f: (p) => { const o = oyunKur(p); ustune(o, 'kalp', 'robot'); bekle(o, 1); return uzaklik(o.kar('kalp'), o.kar('robot')) > 40; } },
                { ad: 'Can 5\'i geçmesin', f: (p) => { const o = oyunKur(p); o.can = 5; ustune(o, 'kalp', 'robot'); bekle(o, 1); return o.can === 5; } },
                { ad: 'Uzaylı değince can 1 azalsın', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'dusman', 'robot'); bekle(o, 1); return o.can === c - 1; } }
            ]
        },
        {
            id: 'final', ad: 'Final: Zorlaşan Oyun', sinif: [5, 12],
            anlatim: 'İyi oyunlar ilerledikçe zorlaşır! Yıldız Avcısı\'nı yeniden kur ve bir kural ekle: puan 5\'i geçince uzaylı büyüsün (boyut 150). Puan 10 olunca oyun kazanılsın.',
            karakterler: ['robot', 'yildiz', 'dusman'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'puan_yap', 'can_degistir', 'can_yap', 'eger', 'eger_degilse', 'kazan', 'kaybet', 'ses', 'soyle', 'boyut'],
            denetimler: [
                { ad: 'Yıldız robota değince puan 1 artsın', f: (p) => { const o = oyunKur(p); uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); return o.puan === 1; } },
                { ad: 'Puan 5\'i geçince uzaylı büyüsün', f: (p) => { const o = oyunKur(p); const u = o.kar('dusman'); const b0 = u.boyut; for (let i = 0; i < 6; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); o.kar('yildiz').x = 200; bekle(o, 1); } return u.boyut >= 140 && b0 < 140; } },
                { ad: 'Puan 5 ya da altındayken uzaylı büyümesin', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 4; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); o.kar('yildiz').x = 200; bekle(o, 1); } return o.kar('dusman').boyut < 140; } },
                { ad: 'Puan 10 olunca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 12 && o.durum === 'oynuyor'; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); o.kar('yildiz').x = 200; o.kar('dusman').x = -200; bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: 'Uzaylı can azaltıyor', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'dusman', 'robot'); bekle(o, 1); return o.can < c || o.durum === 'kaybetti'; } }
            ]
        },
        {
            id: 'serbest', ad: 'Kendi Oyunun', sinif: [3, 12], serbest: true,
            anlatim: 'Artık kendi oyununu tasarla! Karakter ekle, arka planı değiştir, kurallarını yaz. Bitince "Paylaş" ile linkini arkadaşlarına gönder.',
            karakterler: ['robot'], bloklar: null, denetimler: []
        }
    ];

    // ---------- Örnek çözümler (İpucu Asistanı'nın son basamağı; testlerde de kullanılır) ----------
    const b = (t, o = {}) => ({ t, ...o });
    const sapka = (t, govde, o = {}) => ({ t, ...o, govde });
    const hareket = [sapka('tus_basili', [b('x_degistir', { n: 5 })], { tus: 'sag' }), sapka('tus_basili', [b('x_degistir', { n: -5 })], { tus: 'sol' }), sapka('tus_basili', [b('y_degistir', { n: 5 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -5 })], { tus: 'asagi' })];
    const yildiz = [sapka('degince', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('ses', { tur: 'dogru' })], { hedef: 'robot' })];
    const dusman = [sapka('surekli', [b('x_degistir', { n: 4 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: -220, y: 0 })] })]), sapka('degince', [b('can_degistir', { n: -1 }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet', { metin: 'Bitti' })] })], { hedef: 'robot' })];
    const yatay = [sapka('tus_basili', [b('x_degistir', { n: 6 })], { tus: 'sag' }), sapka('tus_basili', [b('x_degistir', { n: -6 })], { tus: 'sol' })];
    const dikey = [sapka('tus_basili', [b('y_degistir', { n: 5 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -5 })], { tus: 'asagi' })];
    const elmaDus = [sapka('surekli', [b('y_degistir', { n: -4 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: 0, y: 150 })] })])];
    const kurbaga = [sapka('tiklaninca', [b('puan_degistir', { n: 1 }), b('gizle')]), sapka('surekli', [b('eger', { k: 'sans', n: 2, govde: [b('rastgele_git'), b('goster')] })])];
    const meteorAk = [sapka('surekli', [b('x_degistir', { n: -6 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: 210, y: 0 })] })])];
    const meteorCarp = sapka('degince', [b('can_degistir', { n: -1 }), b('git', { x: 210, y: 0 }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })], { hedef: 'roket' });
    const hayaletK = [sapka('surekli', [b('eger', { k: 'sans', n: 3, govde: [b('rastgele_git')] })]), sapka('degince', [b('can_degistir', { n: -1 }), b('rastgele_git')], { hedef: 'robot' })];
    const COZUMLER = {
        balon: { balon: [sapka('tiklaninca', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('eger', { k: 'puan=', n: 10, govde: [b('kazan', { metin: 'Süper!' })] })])] },
        hareket: { robot: hareket },
        yildiz: { robot: hareket, yildiz },
        dusman: { robot: hareket, yildiz, dusman },
        kazan: { robot: [sapka('baslayinca', [b('puan_yap', { n: 0 }), b('can_yap', { n: 3 })]), ...hareket, sapka('surekli', [b('eger', { k: 'puan=', n: 10, govde: [b('kazan', { metin: 'Kazandın' })] })])], yildiz, dusman },
        elma1: { kedi: yatay },
        elma2: { kedi: yatay, elma: elmaDus },
        elma3: { kedi: yatay, elma: [...elmaDus, sapka('degince', [b('puan_degistir', { n: 1 }), b('git', { x: 0, y: 150 }), b('eger', { k: 'puan=', n: 5, govde: [b('kazan')] })], { hedef: 'kedi' })] },
        kurbaga1: { kurbaga: kurbaga },
        kurbaga2: { kurbaga: [...kurbaga, sapka('tiklaninca', [b('eger', { k: 'puan=', n: 10, govde: [b('kazan')] })])], bomba: [sapka('tiklaninca', [b('can_degistir', { n: -1 }), b('rastgele_git'), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })])] },
        meteor1: { roket: dikey, meteor: meteorAk },
        meteor2: { roket: dikey, meteor: [...meteorAk, meteorCarp] },
        meteor3: { roket: [...dikey, sapka('surekli', [b('puan_degistir', { n: 1 }), b('eger', { k: 'puan>', n: 600, govde: [b('kazan')] })])], meteor: [...meteorAk, meteorCarp] },
        hayalet1: { robot: hareket, hayalet: hayaletK },
        hayalet2: { robot: [...hareket, sapka('baslayinca', [b('can_yap', { n: 3 }), b('puan_yap', { n: 0 })]), sapka('surekli', [b('puan_degistir', { n: 1 }), b('eger', { k: 'puan>', n: 900, govde: [b('kazan')] }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })])], hayalet: hayaletK },
        sohbet: { robot: [sapka('baslayinca', [b('soyle', { metin: 'Merhaba, ben Kodi!', sure: 2 })]), sapka('tus_basilinca', [b('soyle', { metin: 'Bilgisayar neden üşür? Pencereleri açık!', sure: 3 })], { tus: 'bosluk' }), sapka('tiklaninca', [b('kostum', { emoji: '🐱' })])] },
        duvar: { robot: [...hareket, sapka('degince', [b('git', { x: -180, y: -120 })], { hedef: 'duvar' }), sapka('degince', [b('kazan')], { hedef: 'yildiz' })] },
        penalti: { top: [sapka('tus_basilinca', [b('tekrar', { n: 10, govde: [b('x_degistir', { n: 20 })] })], { tus: 'bosluk' }), sapka('tus_basili', [b('y_degistir', { n: 4 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -4 })], { tus: 'asagi' }), sapka('degince', [b('puan_degistir', { n: 1 }), b('git', { x: -150, y: 0 }), b('eger', { k: 'puan=', n: 3, govde: [b('kazan')] })], { hedef: 'kale' })] },
        kalp: { robot: hareket, kalp: [sapka('degince', [b('eger', { k: 'can<', n: 5, govde: [b('can_degistir', { n: 1 })] }), b('rastgele_git')], { hedef: 'robot' })], dusman },
        final: { robot: hareket, yildiz: [sapka('degince', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('eger', { k: 'puan=', n: 10, govde: [b('kazan')] })], { hedef: 'robot' })], dusman: [...dusman, sapka('surekli', [b('eger', { k: 'puan>', n: 5, govde: [b('boyut', { n: 150 })] })])] }
    };

    function baslangicProjesi(g, onceki) {
        const p = onceki ? sayiliKopya(onceki) : { arka: 'uzay', karakterler: [] };
        for (const id of g.karakterler) if (!p.karakterler.some(k => k.id === id)) p.karakterler.push(yeniKar(KAR[id]));
        return p;
    }

    // Denetimleri çalıştır (hata veren denetim "geçmedi" sayılır)
    function denetle(g, proje) {
        return g.denetimler.map(d => { try { return { ad: d.ad, gecti: !!d.f(proje) }; } catch (e) { return { ad: d.ad, gecti: false }; } });
    }

    const api = { GEN, YUK, TUSLAR, EMOJILER, ARKALAR, tanim, Oyun, GOREVLER, KAR, COZUMLER, baslangicProjesi, denetle, yeniKar };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.OyunMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
