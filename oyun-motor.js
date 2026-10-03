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
        dusman: { id: 'dusman', ad: 'Uzaylı', emoji: '👾', x: -200, y: 120 }
    };
    const yeniKar = (k) => ({ ...k, boyut: 100, betikler: [] });
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
            id: 'hareket', ad: 'Yıldız Avcısı 1: Hareket', sinif: [3, 12],
            anlatim: 'Yıldız Avcısı oyununu adım adım yapacağız. Önce robotu ok tuşlarıyla hareket ettir. <b>x</b> sağa-sola, <b>y</b> yukarı-aşağı konumdur: sağa gitmek için x\'i artır, sola için azalt.',
            karakterler: ['robot'], bloklar: ['tus_basili', 'baslayinca', 'x_degistir', 'y_degistir', 'git'],
            denetimler: [
                ...[['sag', 'Sağ ok', (a, b) => b.x > a.x + 20], ['sol', 'Sol ok', (a, b) => b.x < a.x - 20], ['yukari', 'Yukarı ok', (a, b) => b.y > a.y + 20], ['asagi', 'Aşağı ok', (a, b) => b.y < a.y - 20]].map(([t, ad, f]) => ({
                    ad: `${ad} tuşuyla robot o yöne gitsin`, f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = 0; const once = { x: r.x, y: r.y }; bekle(o, 15, new Set([t])); return f(once, r); }
                }))
            ]
        },
        {
            id: 'yildiz', ad: 'Yıldız Avcısı 2: Yıldız Topla', sinif: [3, 12],
            anlatim: 'Oyuna bir yıldız ekledik. Karakter listesinden <b>yıldızı</b> seçip ona kod yaz: robota değince puan artsın ve yıldız başka yere gitsin. (İpucu: "karakterine değince" olayı.)',
            karakterler: ['robot', 'yildiz'], bloklar: ['tus_basili', 'baslayinca', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'ses', 'soyle'],
            denetimler: [
                { ad: 'Robot hâlâ ok tuşlarıyla hareket ediyor', f: (p) => { const o = oyunKur(p); const r = o.kar('robot'); r.x = 0; r.y = 0; bekle(o, 15, new Set(['sag'])); return r.x > 20; } },
                { ad: 'Yıldız robota değince puan 1 artsın', f: (p) => { const o = oyunKur(p); ustune(o, 'yildiz', 'robot'); bekle(o, 2); return o.puan === 1; } },
                { ad: 'Toplanan yıldız başka bir yere gitsin', f: (p) => { const o = oyunKur(p); ustune(o, 'yildiz', 'robot'); bekle(o, 2); return uzaklik(o.kar('yildiz'), o.kar('robot')) > 40; } }
            ]
        },
        {
            id: 'dusman', ad: 'Yıldız Avcısı 3: Uzaylı', sinif: [4, 12],
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
            id: 'kazan', ad: 'Yıldız Avcısı 4: Zafer', sinif: [4, 12],
            anlatim: 'Son adım: 10 yıldız toplayan oyunu kazansın! Oyunun başında puanı 0, canı 3 yap. Oyunun bitti, şimdi arkadaşlarına oynat!',
            karakterler: ['robot', 'yildiz', 'dusman'], bloklar: ['tus_basili', 'baslayinca', 'surekli', 'degince', 'x_degistir', 'y_degistir', 'git', 'rastgele_git', 'puan_degistir', 'puan_yap', 'can_degistir', 'can_yap', 'eger', 'eger_degilse', 'kazan', 'kaybet', 'ses', 'soyle', 'boyut'],
            denetimler: [
                { ad: '10 yıldız toplayınca oyun kazanılsın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 12 && o.durum === 'oynuyor'; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); const y = o.kar('yildiz'); if (y) { y.x = o.kar('robot').x + 200 > 220 ? -200 : 200; } bekle(o, 1); } return o.durum === 'kazandi'; } },
                { ad: '9 yıldızda henüz kazanılmasın', f: (p) => { const o = oyunKur(p); for (let i = 0; i < 9; i++) { uzaklastir(o, 'dusman', 'robot'); ustune(o, 'yildiz', 'robot'); bekle(o, 1); const y = o.kar('yildiz'); if (y) y.x = 200; bekle(o, 1); } return o.durum === 'oynuyor'; } },
                { ad: 'Uzaylı hâlâ can azaltıyor', f: (p) => { const o = oyunKur(p); const c = o.can; ustune(o, 'dusman', 'robot'); bekle(o, 1); return o.can < c || o.durum === 'kaybetti'; } }
            ]
        },
        {
            id: 'serbest', ad: 'Kendi Oyunun', sinif: [3, 12], serbest: true,
            anlatim: 'Artık kendi oyununu tasarla! Karakter ekle, arka planı değiştir, kurallarını yaz. Bitince "Paylaş" ile linkini arkadaşlarına gönder.',
            karakterler: ['robot'], bloklar: null, denetimler: []
        }
    ];

    function baslangicProjesi(g, onceki) {
        const p = onceki ? sayiliKopya(onceki) : { arka: 'uzay', karakterler: [] };
        for (const id of g.karakterler) if (!p.karakterler.some(k => k.id === id)) p.karakterler.push(yeniKar(KAR[id]));
        return p;
    }

    // Denetimleri çalıştır (hata veren denetim "geçmedi" sayılır)
    function denetle(g, proje) {
        return g.denetimler.map(d => { try { return { ad: d.ad, gecti: !!d.f(proje) }; } catch (e) { return { ad: d.ad, gecti: false }; } });
    }

    const api = { GEN, YUK, TUSLAR, EMOJILER, ARKALAR, tanim, Oyun, GOREVLER, KAR, baslangicProjesi, denetle, yeniKar };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.OyunMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
