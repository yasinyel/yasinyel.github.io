// Kodlayalım — Çizim Atölyesi motoru
// Kalemli robotla çizim (Logo geleneğindeki "yönlü kalem" grafikleri): program ağacı, çalıştırıcı,
// çizim karşılaştırma, Python turtle modülü alt kümesi ayrıştırıcısı ve bloklardan Python kodu üretici.
(function (root) {
    'use strict';

    // ---------- Renkler ----------
    const RENKLER = {
        siyah: { hex: '#1f2937', py: 'black' }, kirmizi: { hex: '#e5484d', py: 'red' }, mavi: { hex: '#1d5fd6', py: 'blue' },
        yesil: { hex: '#16a36a', py: 'green' }, turuncu: { hex: '#f97316', py: 'orange' }, mor: { hex: '#8b5cf6', py: 'purple' },
        sari: { hex: '#eab308', py: 'yellow' }, pembe: { hex: '#ec4899', py: 'pink' }, kahverengi: { hex: '#92400e', py: 'brown' },
        gri: { hex: '#6b7280', py: 'gray' }
    };
    const RENK_ADI = { siyah: 'siyah', kirmizi: 'kırmızı', mavi: 'mavi', yesil: 'yeşil', turuncu: 'turuncu', mor: 'mor', sari: 'sarı', pembe: 'pembe', kahverengi: 'kahverengi', gri: 'gri' };
    const PY_RENK = Object.fromEntries(Object.entries(RENKLER).map(([k, v]) => [v.py, k]));
    PY_RENK.grey = 'gri'; PY_RENK.violet = 'mor';

    class CizimHatasi extends Error { constructor(m, satir) { super(m); this.satir = satir; } }

    // ---------- Program kurucular ----------
    // İfade: sayı, değişken adı (metin) ya da { op, a, b }
    const I = {
        ileri: (n) => ({ t: 'ileri', n }), geri: (n) => ({ t: 'geri', n }),
        saga: (n) => ({ t: 'saga', n }), sola: (n) => ({ t: 'sola', n }),
        kaldir: () => ({ t: 'kaldir' }), indir: () => ({ t: 'indir' }),
        renk: (c) => ({ t: 'renk', c }), kalinlik: (n) => ({ t: 'kalinlik', n }),
        tekrar: (n, ...govde) => ({ t: 'tekrar', n, govde }),
        // say: v değişkeni a'dan b'ye s'er artar. dahil=true ise b dahil (bloklar), false ise Python range gibi
        say: (v, a, b, s, govde, dahil = true) => ({ t: 'say', v, a, b, s, govde, dahil }),
        tanim: (ad, param, ...govde) => ({ t: 'tanim', ad, param, govde }),
        cagir: (ad, ...arg) => ({ t: 'cagir', ad, arg }),
        ata: (v, x) => ({ t: 'ata', v, x })
    };

    // ---------- Çalıştırıcı ----------
    const ADIM_SINIRI = 20000;
    function calistir(program, bas) {
        const k = { x: bas.x, y: bas.y, h: bas.h || 0, kalem: true, renk: 'siyah', kalinlik: 3 };
        const cizgiler = [], hareketler = [];
        const fonk = {};
        let adim = 0;

        function deger(e, ortam, satir) {
            if (typeof e === 'number') return e;
            if (typeof e === 'string') {
                if (!(e in ortam)) throw new CizimHatasi(`"${e}" diye bir değişken yok.`, satir);
                return ortam[e];
            }
            if (e && e.op) {
                const a = deger(e.a, ortam, satir), b = deger(e.b, ortam, satir);
                switch (e.op) {
                    case '+': return a + b; case '-': return a - b; case '*': return a * b;
                    case '/': if (b === 0) throw new CizimHatasi('Sıfıra bölme!', satir); return a / b;
                    case '//': if (b === 0) throw new CizimHatasi('Sıfıra bölme!', satir); return Math.floor(a / b);
                    case '%': return ((a % b) + b) % b;
                }
            }
            throw new CizimHatasi('Anlaşılmayan değer.', satir);
        }

        function git(mesafe) {
            const r = k.h * Math.PI / 180;
            const nx = k.x + Math.sin(r) * mesafe, ny = k.y - Math.cos(r) * mesafe;
            if (k.kalem && mesafe !== 0) cizgiler.push({ x1: k.x, y1: k.y, x2: nx, y2: ny, renk: k.renk, kalinlik: k.kalinlik });
            if (hareketler.length < 5000) hareketler.push({ x1: k.x, y1: k.y, x2: nx, y2: ny, kalem: k.kalem, renk: k.renk, kalinlik: k.kalinlik, h: k.h });
            k.x = nx; k.y = ny;
        }

        // Dönüşleri de animasyon için kaydet (yerinde hareket)
        function donus() { if (hareketler.length < 5000) hareketler.push({ x1: k.x, y1: k.y, x2: k.x, y2: k.y, kalem: false, h: k.h, donus: true }); }

        function yurut(liste, ortam, derinlik) {
            for (const s of liste) {
                if (++adim > ADIM_SINIRI) throw new CizimHatasi('Program çok uzun sürdü. Sonsuz bir döngü olabilir mi?', s.satir);
                switch (s.t) {
                    case 'ileri': git(deger(s.n, ortam, s.satir)); break;
                    case 'geri': git(-deger(s.n, ortam, s.satir)); break;
                    case 'saga': k.h = (k.h + deger(s.n, ortam, s.satir)) % 360; donus(); break;
                    case 'sola': k.h = ((k.h - deger(s.n, ortam, s.satir)) % 360 + 360) % 360; donus(); break;
                    case 'kaldir': k.kalem = false; break;
                    case 'indir': k.kalem = true; break;
                    case 'renk':
                        if (!RENKLER[s.c]) throw new CizimHatasi(`"${s.c}" rengini tanımıyorum.`, s.satir);
                        k.renk = s.c; break;
                    case 'kalinlik': k.kalinlik = Math.max(1, Math.min(20, deger(s.n, ortam, s.satir))); break;
                    case 'tekrar': {
                        const n = deger(s.n, ortam, s.satir);
                        if (n > 1000) throw new CizimHatasi('Tekrar sayısı en fazla 1000 olabilir.', s.satir);
                        for (let i = 0; i < n; i++) yurut(s.govde, ortam, derinlik);
                        break;
                    }
                    case 'say': {
                        const a = deger(s.a, ortam, s.satir), b = deger(s.b, ortam, s.satir), st = deger(s.s ?? 1, ortam, s.satir);
                        if (st === 0) throw new CizimHatasi('Artış miktarı 0 olamaz.', s.satir);
                        const devam = (i) => st > 0 ? (s.dahil ? i <= b : i < b) : (s.dahil ? i >= b : i > b);
                        for (let i = a; devam(i); i += st) { ortam[s.v] = i; yurut(s.govde, ortam, derinlik); }
                        break;
                    }
                    case 'tanim': fonk[s.ad] = s; break;
                    case 'cagir': {
                        const f = fonk[s.ad];
                        if (!f) throw new CizimHatasi(`"${s.ad}" diye bir fonksiyon tanımlanmamış.`, s.satir);
                        if (derinlik > 60) throw new CizimHatasi('Fonksiyonlar birbirini çok fazla çağırdı.', s.satir);
                        const argumanlar = (s.arg || []).map(a => deger(a, ortam, s.satir));
                        if (argumanlar.length !== (f.param || []).length) throw new CizimHatasi(`${s.ad}() ${(f.param || []).length} değer bekliyor.`, s.satir);
                        const yerel = Object.create(ortam);
                        (f.param || []).forEach((p, i) => { yerel[p] = argumanlar[i]; });
                        yurut(f.govde, yerel, derinlik + 1);
                        break;
                    }
                    case 'ata': ortam[s.v] = deger(s.x, ortam, s.satir); break;
                }
            }
        }
        // Fonksiyonlar programın neresinde tanımlanırsa tanımlansın kullanılabilsin (bloklarda sıra önemsiz)
        for (const s of program) if (s.t === 'tanim') fonk[s.ad] = s;
        yurut(program, {}, 0);
        return { cizgiler, hareketler, son: { x: k.x, y: k.y, h: k.h } };
    }

    // ---------- Karşılaştırma ----------
    function noktaDogru(px, py, c) {
        const dx = c.x2 - c.x1, dy = c.y2 - c.y1, L = dx * dx + dy * dy;
        let t = L ? ((px - c.x1) * dx + (py - c.y1) * dy) / L : 0;
        t = Math.max(0, Math.min(1, t));
        const x = c.x1 + t * dx, y = c.y1 + t * dy;
        return Math.hypot(px - x, py - y);
    }
    function ornekle(cizgiler, aralik = 3) {
        const n = [];
        for (const c of cizgiler) {
            const L = Math.hypot(c.x2 - c.x1, c.y2 - c.y1), adet = Math.max(1, Math.ceil(L / aralik));
            for (let i = 0; i <= adet; i++) n.push({ x: c.x1 + (c.x2 - c.x1) * i / adet, y: c.y1 + (c.y2 - c.y1) * i / adet, renk: c.renk });
        }
        return n;
    }
    // Her iki çizimin her noktası diğerine yakın mı? renkOnemli ise yakın çizginin rengi de aynı olmalı.
    function karsilastir(hedef, cizim, renkOnemli = false, tolerans = 4) {
        if (!cizim.length) return { tamam: false, eksik: 1, fazla: 0 };
        const yakin = (p, liste) => liste.some(c => noktaDogru(p.x, p.y, c) <= tolerans && (!renkOnemli || c.renk === p.renk));
        const h = ornekle(hedef), c = ornekle(cizim);
        const eksik = h.filter(p => !yakin(p, cizim)).length / h.length;
        const fazla = c.filter(p => !yakin(p, hedef)).length / c.length;
        return { tamam: eksik < 0.01 && fazla < 0.01, eksik, fazla };
    }

    // ---------- Blok sayısı ----------
    function blokSayisi(liste) {
        let n = 0;
        for (const s of liste) { n++; if (s.govde) n += blokSayisi(s.govde); }
        return n;
    }

    // ---------- Python turtle ayrıştırıcısı ----------
    const PY_KOMUT = {
        forward: 'ileri', fd: 'ileri', backward: 'geri', back: 'geri', bk: 'geri', right: 'saga', rt: 'saga', left: 'sola', lt: 'sola',
        penup: 'kaldir', pu: 'kaldir', up: 'kaldir', pendown: 'indir', pd: 'indir', down: 'indir',
        color: 'renk', pencolor: 'renk', pensize: 'kalinlik', width: 'kalinlik'
    };
    const PY_YOKSAY = new Set(['speed', 'hideturtle', 'ht', 'showturtle', 'st', 'shape', 'done', 'mainloop', 'exitonclick', 'bgcolor', 'title', 'setup', 'tracer', 'update']);

    function pythonAyristir(kaynak) {
        const satirlar = kaynak.replace(/\t/g, '    ').split('\n');
        // Sözcükleyici: bir satırı belirteçlere ayır
        function sozcukle(s, no) {
            const t = [];
            let i = 0;
            while (i < s.length) {
                const c = s[i];
                if (c === '#') break;
                if (/\s/.test(c)) { i++; continue; }
                if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; t.push({ t: 'sayi', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
                if (/[A-Za-z_]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++; t.push({ t: 'ad', v: s.slice(i, j) }); i = j; continue; }
                if (c === '"' || c === "'") { const j = s.indexOf(c, i + 1); if (j < 0) throw new CizimHatasi('Tırnak kapatılmamış.', no); t.push({ t: 'metin', v: s.slice(i + 1, j) }); i = j + 1; continue; }
                if (s.startsWith('//', i)) { t.push({ t: 'op', v: '//' }); i += 2; continue; }
                if (s.startsWith('+=', i) || s.startsWith('-=', i) || s.startsWith('*=', i)) { t.push({ t: 'opata', v: s[i] }); i += 2; continue; }
                if ('+-*/%'.includes(c)) { t.push({ t: 'op', v: c }); i++; continue; }
                if ('(),:=.'.includes(c)) { t.push({ t: c }); i++; continue; }
                throw new CizimHatasi(`Bu karakteri anlayamadım: "${c}"`, no);
            }
            return t;
        }
        const ogeler = [];
        satirlar.forEach((s, i) => {
            if (!s.trim() || s.trim().startsWith('#')) return;
            const girinti = s.match(/^ */)[0].length;
            ogeler.push({ girinti, t: sozcukle(s, i + 1), satir: i + 1 });
        });

        let p = 0;
        function blok(girinti) {
            const liste = [];
            while (p < ogeler.length && ogeler[p].girinti >= girinti) {
                if (ogeler[p].girinti > girinti) throw new CizimHatasi('Beklenmeyen girinti. Satır başındaki boşlukları kontrol et.', ogeler[p].satir);
                const s = ifade();
                if (s) liste.push(s);
            }
            return liste;
        }
        function govdeAl(satir) {
            if (p >= ogeler.length || ogeler[p].girinti <= ogeler[p - 1].girinti) throw new CizimHatasi('":" ile biten satırdan sonra girintili bir blok gelmeli.', satir);
            return blok(ogeler[p].girinti);
        }

        function ifadeAyristir(t, i, satir) {
            // Öncelik: + - < * / // % < tekli eksi, parantez
            function birincil() {
                const x = t[i];
                if (!x) throw new CizimHatasi('Eksik ifade.', satir);
                if (x.t === 'sayi') { i++; return x.v; }
                if (x.t === 'ad') { i++; return x.v; }
                if (x.t === 'op' && x.v === '-') { i++; const v = birincil(); return typeof v === 'number' ? -v : { op: '-', a: 0, b: v }; }
                if (x.t === '(') { i++; const v = toplam(); if (!t[i] || t[i].t !== ')') throw new CizimHatasi('Parantez kapatılmamış.', satir); i++; return v; }
                throw new CizimHatasi('Anlaşılmayan ifade.', satir);
            }
            function carpim() {
                let a = birincil();
                while (t[i] && t[i].t === 'op' && ['*', '/', '//', '%'].includes(t[i].v)) { const op = t[i++].v; a = { op, a, b: birincil() }; }
                return a;
            }
            function toplam() {
                let a = carpim();
                while (t[i] && t[i].t === 'op' && ['+', '-'].includes(t[i].v)) { const op = t[i++].v; a = { op, a, b: carpim() }; }
                return a;
            }
            const v = toplam();
            return { v, i };
        }

        // Virgülle ayrılmış argümanlar: (a, b, ...)
        function argumanlar(t, i, satir) {
            if (!t[i] || t[i].t !== '(') throw new CizimHatasi('Parantez bekleniyordu.', satir);
            i++;
            const out = [];
            while (t[i] && t[i].t !== ')') {
                if (t[i].t === 'metin') { out.push({ metin: t[i].v }); i++; }
                else { const r = ifadeAyristir(t, i, satir); out.push(r.v); i = r.i; }
                if (t[i] && t[i].t === ',') i++;
                else if (!t[i] || t[i].t !== ')') throw new CizimHatasi('Virgül ya da ")" bekleniyordu.', satir);
            }
            if (!t[i]) throw new CizimHatasi('Parantez kapatılmamış.', satir);
            return { out, i: i + 1 };
        }

        function ifade() {
            const o = ogeler[p++], t = o.t, satir = o.satir;
            const ilk = t[0];
            if (!ilk) return null;
            if (ilk.t === 'ad' && (ilk.v === 'import' || ilk.v === 'from')) return null;
            // t = turtle.Turtle() / ekran = turtle.Screen() gibi kurulumlar
            if (ilk.t === 'ad' && t[1] && t[1].t === '=' && t[2] && t[2].v === 'turtle') return null;
            if (ilk.t === 'ad' && ilk.v === 'for') {
                const v = t[1] && t[1].t === 'ad' ? t[1].v : null;
                if (!v || !t[2] || t[2].v !== 'in' || !t[3] || t[3].v !== 'range') throw new CizimHatasi('for döngüsü şöyle yazılır: for i in range(4):', satir);
                const r = argumanlar(t, 4, satir);
                if (!t[r.i] || t[r.i].t !== ':') throw new CizimHatasi('for satırının sonuna ":" koymalısın.', satir);
                const a = r.out;
                if (a.length < 1 || a.length > 3) throw new CizimHatasi('range() 1, 2 ya da 3 değer alır.', satir);
                const govde = govdeAl(satir);
                if (a.length === 1 && v === '_') return { t: 'tekrar', n: a[0], govde, satir };
                return { t: 'say', v, a: a.length === 1 ? 0 : a[0], b: a.length === 1 ? a[0] : a[1], s: a[2] ?? 1, govde, dahil: false, satir };
            }
            if (ilk.t === 'ad' && ilk.v === 'def') {
                const ad = t[1] && t[1].t === 'ad' ? t[1].v : null;
                if (!ad) throw new CizimHatasi('def sonrası fonksiyon adı gelmeli.', satir);
                const r = argumanlar(t, 2, satir);
                if (!t[r.i] || t[r.i].t !== ':') throw new CizimHatasi('def satırının sonuna ":" koymalısın.', satir);
                const param = r.out.map(x => { if (typeof x !== 'string') throw new CizimHatasi('Parametreler isim olmalı.', satir); return x; });
                return { t: 'tanim', ad, param, govde: govdeAl(satir), satir };
            }
            // Atama: x = ifade, x += ifade
            if (ilk.t === 'ad' && t[1] && (t[1].t === '=' || t[1].t === 'opata')) {
                const r = ifadeAyristir(t, 2, satir);
                const x = t[1].t === '=' ? r.v : { op: t[1].v, a: ilk.v, b: r.v };
                return { t: 'ata', v: ilk.v, x, satir };
            }
            // Çağrı: komut(...), t.komut(...), turtle.komut(...), fonksiyon(...)
            let i = 0;
            if (t[0].t === 'ad' && t[1] && t[1].t === '.') i = 2;
            const ad = t[i] && t[i].t === 'ad' ? t[i].v : null;
            if (!ad) throw new CizimHatasi('Bu satırı anlayamadım.', satir);
            const r = argumanlar(t, i + 1, satir);
            if (r.i < t.length) throw new CizimHatasi('Satırın sonunda fazladan bir şey var.', satir);
            if (PY_YOKSAY.has(ad)) return null;
            const kom = PY_KOMUT[ad];
            if (kom) {
                if (kom === 'kaldir' || kom === 'indir') return { t: kom, satir };
                if (kom === 'renk') {
                    const m = r.out[0];
                    const c = m && m.metin && PY_RENK[m.metin.toLowerCase()];
                    if (!c) throw new CizimHatasi(`Bu rengi tanımıyorum. Kullanabileceklerin: ${Object.keys(PY_RENK).join(', ')}`, satir);
                    return { t: 'renk', c, satir };
                }
                if (r.out.length !== 1 || (r.out[0] && r.out[0].metin)) throw new CizimHatasi(`${ad}() bir sayı bekliyor.`, satir);
                return { t: kom, n: r.out[0], satir };
            }
            if (r.out.some(x => x && x.metin)) throw new CizimHatasi('Fonksiyonlara metin gönderemezsin.', satir);
            return { t: 'cagir', ad, arg: r.out, satir };
        }

        const program = blok(0);
        if (p < ogeler.length) throw new CizimHatasi('Girinti hatası.', ogeler[p].satir);
        return program;
    }

    // ---------- Bloklardan Python kodu ----------
    function pythonYaz(program) {
        const ex = (e) => typeof e === 'number' || typeof e === 'string' ? String(e) : `(${ex(e.a)} ${e.op} ${ex(e.b)})`;
        const out = ['from turtle import *', ''];
        const yaz = (liste, g) => {
            const bos = '    '.repeat(g);
            if (!liste.length) out.push(bos + 'pass');
            for (const s of liste) {
                switch (s.t) {
                    case 'ileri': out.push(`${bos}forward(${ex(s.n)})`); break;
                    case 'geri': out.push(`${bos}backward(${ex(s.n)})`); break;
                    case 'saga': out.push(`${bos}right(${ex(s.n)})`); break;
                    case 'sola': out.push(`${bos}left(${ex(s.n)})`); break;
                    case 'kaldir': out.push(`${bos}penup()`); break;
                    case 'indir': out.push(`${bos}pendown()`); break;
                    case 'renk': out.push(`${bos}color("${RENKLER[s.c].py}")`); break;
                    case 'kalinlik': out.push(`${bos}pensize(${ex(s.n)})`); break;
                    case 'tekrar': out.push(`${bos}for _ in range(${ex(s.n)}):`); yaz(s.govde, g + 1); break;
                    case 'say': {
                        const son = s.dahil ? (typeof s.b === 'number' && typeof s.s === 'number' ? s.b + Math.sign(s.s) : `${ex(s.b)} + 1`) : ex(s.b);
                        out.push(`${bos}for ${s.v} in range(${ex(s.a)}, ${son}${s.s !== 1 ? ', ' + ex(s.s) : ''}):`); yaz(s.govde, g + 1); break;
                    }
                    case 'tanim': out.push(`${bos}def ${s.ad}(${(s.param || []).join(', ')}):`); yaz(s.govde, g + 1); out.push(''); break;
                    case 'cagir': out.push(`${bos}${s.ad}(${(s.arg || []).map(ex).join(', ')})`); break;
                    case 'ata': out.push(`${bos}${s.v} = ${ex(s.x)}`); break;
                }
            }
        };
        // Python'da fonksiyon çağrılmadan önce tanımlanmalı
        const tanimlar = program.filter(s => s.t === 'tanim'), digerleri = program.filter(s => s.t !== 'tanim');
        if (tanimlar.length) yaz(tanimlar, 0);
        if (digerleri.length || !tanimlar.length) yaz(digerleri, 0);
        return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
    }

    // ---------- Bölümler ----------
    // bloklar: araç kutusunda görünecek bloklar. enFazla: 3 yıldız için en fazla blok sayısı (yoksa çözümün blok sayısı)
    // bas: robotun başlangıcı (tuval 400x400, h=0 yukarı)
    const { ileri, geri, saga, sola, kaldir, indir, renk, kalinlik, tekrar, say, tanim, cagir } = I;
    const TEMEL = ['ileri', 'saga', 'sola'];
    const BOLUMLER = [
        { ad: 'İlk Çizgi', anlatim: '"ileri" bloğunu sürükleyip <b>çalıştırınca</b> bloğunun altına bırak. Robot baktığı yöne doğru ilerler ve kalemiyle arkasında iz bırakır.', bloklar: ['ileri'], bas: { x: 200, y: 300, h: 0 }, cozum: [ileri(200)] },
        { ad: 'Köşe', anlatim: 'Dönme blokları robotu olduğu yerde çevirir. Anteni hangi yöne bakıyorsa robot o yöne gider. 90 derece, dik bir köşe demektir.', bloklar: TEMEL, bas: { x: 120, y: 300, h: 0 }, cozum: [ileri(150), saga(90), ileri(150)] },
        { ad: 'Kare', anlatim: 'Bir kare çiz. Her kenar 100 adım, her köşede 90 derece dön.', bloklar: TEMEL, bas: { x: 150, y: 250, h: 0 }, cozum: [ileri(100), saga(90), ileri(100), saga(90), ileri(100), saga(90), ileri(100)], enFazla: 8 },
        { ad: 'Döngüyle Kare', anlatim: 'Aynı kareyi <b>tekrarla</b> bloğuyla çiz. Sadece 3 blok yeterli!', bloklar: [...TEMEL, 'tekrar'], bas: { x: 150, y: 250, h: 0 }, cozum: [tekrar(4, ileri(100), saga(90))] },
        { ad: 'Merdiven', anlatim: 'Merdivenin bir basamağını bul, sonra onu tekrarla.', bloklar: [...TEMEL, 'tekrar'], bas: { x: 90, y: 330, h: 0 }, cozum: [tekrar(5, ileri(45), saga(90), ileri(45), sola(90))] },
        { ad: 'Üçgen', anlatim: 'Eşkenar üçgen çiz. Dikkat: robot iç açı kadar değil, <b>dış açı</b> kadar döner. 3 köşede toplam 360 derece döner, yani her köşede 360 ÷ 3 = ?', bloklar: [...TEMEL, 'tekrar'], bas: { x: 120, y: 290, h: 0 }, cozum: [tekrar(3, ileri(160), saga(120))] },
        { ad: 'Altıgen', anlatim: 'Arı peteği gibi bir altıgen çiz. Her köşede kaç derece dönmeli?', bloklar: [...TEMEL, 'tekrar'], bas: { x: 150, y: 310, h: 0 }, cozum: [tekrar(6, ileri(80), saga(60))] },
        { ad: 'Daire', anlatim: 'Bilgisayarlar daireyi de çok küçük adımlarla çizer: 36 kez 10 adım git, 10 derece dön.', bloklar: [...TEMEL, 'tekrar'], bas: { x: 140, y: 260, h: 0 }, cozum: [tekrar(36, ileri(10), saga(10))] },
        { ad: 'Kesikli Çizgi', anlatim: '<b>Kalemi kaldır</b> bloğundan sonra robot iz bırakmadan ilerler. <b>Kalemi indir</b> ile yeniden çizmeye başlar.', bloklar: [...TEMEL, 'tekrar', 'kaldir', 'indir'], bas: { x: 200, y: 360, h: 0 }, cozum: [tekrar(8, ileri(20), kaldir(), ileri(20), indir())] },
        { ad: 'Renkli Üçgen', anlatim: '<b>Renk</b> bloğuyla kalemin rengini değiştir. Bu bölümde renkler de doğru olmalı!', bloklar: [...TEMEL, 'tekrar', 'renk'], bas: { x: 120, y: 290, h: 0 }, renkOnemli: true, cozum: [renk('kirmizi'), ileri(160), saga(120), renk('mavi'), ileri(160), saga(120), renk('yesil'), ileri(160)] },
        { ad: 'Yıldız', anlatim: '5 köşeli yıldız. Robot her uçta çok keskin döner: 144 derece.', bloklar: [...TEMEL, 'tekrar'], bas: { x: 110, y: 250, h: 90 }, cozum: [tekrar(5, ileri(180), saga(144))] },
        { ad: 'Dönen Kareler', anlatim: 'Bir kareyi çiz, biraz dön, tekrar çiz… <b>İç içe döngü</b> ile güzel bir desen oluştur.', bloklar: [...TEMEL, 'tekrar'], bas: { x: 200, y: 200, h: 0 }, cozum: [tekrar(6, tekrar(4, ileri(90), saga(90)), saga(60))] },
        { ad: 'Kare Fonksiyonu', anlatim: '<b>Fonksiyon</b> ile kendi bloğunu yap: "kare" fonksiyonunu tanımla, sonra 3 kez çağırarak yan yana kareler çiz.', bloklar: [...TEMEL, 'tekrar', 'kaldir', 'indir', 'tanim', 'cagir'], bas: { x: 60, y: 240, h: 0 }, cozum: [tanim('kare', [], tekrar(4, ileri(70), saga(90))), tekrar(3, cagir('kare'), kaldir(), saga(90), ileri(100), sola(90), indir())] },
        { ad: 'Kare Sarmal', anlatim: '<b>Say</b> bloğu bir sayacı adım adım artırır. Her turda sayaç kadar ileri git: kenarlar büyüdükçe sarmal oluşur!', bloklar: [...TEMEL, 'tekrar', 'say'], bas: { x: 200, y: 200, h: 0 }, cozum: [say('i', 10, 300, 10, [ileri('i'), saga(90)])] },
        { ad: 'Çiçek', anlatim: 'Bir daireyi 10 kez, her seferinde biraz dönerek çiz. Hangi açıyla dönersen tam bir tur tamamlanır?', bloklar: [...TEMEL, 'tekrar', 'renk'], bas: { x: 200, y: 200, h: 0 }, cozum: [renk('pembe'), tekrar(10, tekrar(36, ileri(6), saga(10)), saga(36))] },
        { ad: 'Kar Tanesi', anlatim: 'Altı kollu kar tanesi: her kol bir çizgi ve ucunda küçük bir "V". Fonksiyonla kolu tanımla, döngüyle 6 kez çiz.', bloklar: [...TEMEL, 'geri', 'tekrar', 'tanim', 'cagir', 'renk'], bas: { x: 200, y: 200, h: 0 }, renkOnemli: true, cozum: [renk('mavi'), tanim('kol', [], ileri(80), sola(40), ileri(30), geri(30), saga(80), ileri(30), geri(30), sola(40), geri(80)), tekrar(6, cagir('kol'), saga(60))] }
    ];

    const api = { RENKLER, RENK_ADI, I, calistir, karsilastir, blokSayisi, pythonAyristir, pythonYaz, BOLUMLER, CizimHatasi };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Cizim = api;
})(typeof window !== 'undefined' ? window : globalThis);
