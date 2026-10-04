// Kodlayalım — Tablo Atölyesi motoru: Türkçe hesap tablosu formülleri, hesaplama, görevler ve denetim
// Formül dili Türkçe Excel'e benzer: =TOPLA(A1:A5), =EĞER(B2>=50;"Geçti";"Kaldı"). Bağımsız değişkenler ";" ile ayrılır, ondalık ayırıcı ",".
(function (root) {
    'use strict';

    const HATA = (k) => ({ hata: k });
    const hataMi = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'hata' in v;
    const SUTUN = (n) => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
    const sutunNo = (s) => [...s].reduce((t, c) => t * 26 + c.charCodeAt(0) - 64, 0) - 1;
    const hucreAyir = (ad) => { const m = /^\$?([A-Z]+)\$?(\d+)$/.exec(ad); return m ? { c: sutunNo(m[1]), r: +m[2] - 1 } : null; };
    const hucreAd = (c, r) => SUTUN(c) + (r + 1);
    const buyuk = (s) => s.toLocaleUpperCase('tr-TR');

    // ---------- Sözcük çözümleyici ----------
    function parcala(f) {
        const l = []; let i = 0;
        while (i < f.length) {
            const c = f[i];
            if (/\s/.test(c)) { i++; continue; }
            let m;
            if ((m = /^\d+(?:[.,]\d+)?/.exec(f.slice(i)))) { l.push({ t: 'sayi', v: parseFloat(m[0].replace(',', '.')) }); i += m[0].length; continue; }
            if (c === '"') {
                let j = i + 1, s = '';
                while (j < f.length) { if (f[j] === '"') { if (f[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += f[j++]; }
                if (j >= f.length) throw HATA('#AD?');
                l.push({ t: 'metin', v: s }); i = j + 1; continue;
            }
            if ((m = /^\$?[A-Za-z]{1,2}\$?\d+(?::\$?[A-Za-z]{1,2}\$?\d+)?(?![\wçğıöşüÇĞİÖŞÜ(])/.exec(f.slice(i)))) { l.push({ t: 'ref', v: m[0].toUpperCase() }); i += m[0].length; continue; }
            if ((m = /^[A-Za-zçğıöşüÇĞİÖŞÜ_][A-Za-zçğıöşüÇĞİÖŞÜ_.0-9]*/.exec(f.slice(i)))) { l.push({ t: 'ad', v: buyuk(m[0]) }); i += m[0].length; continue; }
            if ((m = /^(<=|>=|<>|[-+*/^&=<>();,:%])/.exec(f.slice(i)))) { l.push({ t: 'op', v: m[0] }); i += m[0].length; continue; }
            throw HATA('#AD?');
        }
        return l;
    }

    // ---------- Ayrıştırıcı (özyinelemeli iniş) ----------
    function ayristir(f) {
        const l = parcala(f); let i = 0;
        const bak = () => l[i], al = () => l[i++];
        const op = (v) => bak() && bak().t === 'op' && bak().v === v;
        const ifade = () => karsilastir();
        function karsilastir() { let a = birlestir(); while (bak() && bak().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(bak().v)) { const o = al().v; a = { k: 'ikili', o, a, b: birlestir() }; } return a; }
        function birlestir() { let a = toplam(); while (op('&')) { al(); a = { k: 'ikili', o: '&', a, b: toplam() }; } return a; }
        function toplam() { let a = carpim(); while (op('+') || op('-')) { const o = al().v; a = { k: 'ikili', o, a, b: carpim() }; } return a; }
        function carpim() { let a = us(); while (op('*') || op('/')) { const o = al().v; a = { k: 'ikili', o, a, b: us() }; } return a; }
        function us() { let a = tekli(); while (op('^')) { al(); a = { k: 'ikili', o: '^', a, b: tekli() }; } return a; }
        function tekli() { if (op('-')) { al(); return { k: 'eksi', a: tekli() }; } if (op('+')) { al(); return tekli(); } let a = birincil(); while (op('%')) { al(); a = { k: 'ikili', o: '/', a, b: { k: 'sabit', v: 100 } }; } return a; }
        function birincil() {
            const t = al();
            if (!t) throw HATA('#AD?');
            if (t.t === 'sayi' || t.t === 'metin') return { k: 'sabit', v: t.v };
            if (t.t === 'ref') return t.v.includes(':') ? { k: 'aralik', v: t.v } : { k: 'ref', v: t.v };
            if (t.t === 'ad') {
                if (op('(')) {
                    al(); const args = [];
                    if (!op(')')) { do { args.push(ifade()); } while ((op(';') || op(',')) && al()); }
                    if (!op(')')) throw HATA('#AD?');
                    al(); return { k: 'fonk', ad: t.v, args };
                }
                if (t.v === 'DOĞRU') return { k: 'sabit', v: true };
                if (t.v === 'YANLIŞ') return { k: 'sabit', v: false };
                throw HATA('#AD?');
            }
            if (t.t === 'op' && t.v === '(') { const e = ifade(); if (!op(')')) throw HATA('#AD?'); al(); return e; }
            throw HATA('#AD?');
        }
        const e = ifade();
        if (i < l.length) throw HATA('#AD?');
        return e;
    }

    // ---------- Hesaplama ----------
    const sayiyaCevir = (v) => {
        if (hataMi(v)) return v;
        if (typeof v === 'number') return v;
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (v === '' || v === null || v === undefined) return 0;
        const n = Number(String(v).replace(',', '.'));
        return isFinite(n) && String(v).trim() !== '' ? n : HATA('#DEĞER!');
    };
    const metne = (v) => v === true ? 'DOĞRU' : v === false ? 'YANLIŞ' : v === null || v === undefined ? '' : typeof v === 'number' ? bicimle(v) : String(v);
    function bicimle(n) { if (!isFinite(n)) return '#SAYI!'; const r = Math.round(n * 1e10) / 1e10; return String(r).replace('.', ','); }
    // Ölçüt: ">=50", "Geçti", 3
    function olcutUyar(deger, olcut) {
        if (typeof olcut === 'number') return deger === olcut;
        const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(String(olcut));
        const o = m[1] || '=', h = m[2];
        const hn = Number(h.replace(',', '.'));
        const sayisal = h.trim() !== '' && isFinite(hn);
        const d = sayisal ? (typeof deger === 'number' ? deger : NaN) : buyuk(metne(deger));
        const k = sayisal ? hn : buyuk(h);
        switch (o) { case '=': return d === k; case '<>': return d !== k; case '<': return d < k; case '>': return d > k; case '<=': return d <= k; case '>=': return d >= k; }
        return false;
    }

    class Tablo {
        constructor(hucreler) { this.ham = { ...hucreler }; this.onbellek = {}; this.hesaplaniyor = new Set(); }
        hamDeger(ad) { return this.ham[ad] ?? ''; }
        deger(ad) {
            ad = ad.replace(/\$/g, '');
            if (ad in this.onbellek) return this.onbellek[ad];
            const h = this.ham[ad];
            let v;
            if (h === undefined || h === '') v = '';
            else if (typeof h === 'string' && h.startsWith('=')) {
                if (this.hesaplaniyor.has(ad)) return HATA('#DÖNGÜ!');
                this.hesaplaniyor.add(ad);
                try { v = this.hesapla(ayristir(h.slice(1))); } catch (e) { v = hataMi(e) ? e : HATA('#DEĞER!'); }
                this.hesaplaniyor.delete(ad);
                if (Array.isArray(v)) v = v.length === 1 ? v[0] : HATA('#DEĞER!');
            } else {
                const n = Number(String(h).replace(',', '.'));
                v = String(h).trim() !== '' && isFinite(n) && /^-?[\d.,]+$/.test(String(h).trim()) ? n : String(h);
            }
            this.onbellek[ad] = v;
            return v;
        }
        aralik(r) {
            const [a, b] = r.split(':').map(hucreAyir);
            const l = [];
            for (let rr = Math.min(a.r, b.r); rr <= Math.max(a.r, b.r); rr++) for (let cc = Math.min(a.c, b.c); cc <= Math.max(a.c, b.c); cc++) l.push(this.deger(hucreAd(cc, rr)));
            return l;
        }
        hesapla(d) {
            switch (d.k) {
                case 'sabit': return d.v;
                case 'ref': return this.deger(d.v);
                case 'aralik': return this.aralik(d.v);
                case 'eksi': { const a = sayiyaCevir(this.tek(d.a)); return hataMi(a) ? a : -a; }
                case 'ikili': {
                    const a = this.tek(d.a), b = this.tek(d.b);
                    if (hataMi(a)) return a; if (hataMi(b)) return b;
                    if (d.o === '&') return metne(a) + metne(b);
                    if (['=', '<>', '<', '>', '<=', '>='].includes(d.o)) {
                        const x = typeof a === 'string' ? buyuk(a) : a === '' ? 0 : a, y = typeof b === 'string' ? buyuk(b) : b === '' ? 0 : b;
                        return { '=': x === y, '<>': x !== y, '<': x < y, '>': x > y, '<=': x <= y, '>=': x >= y }[d.o];
                    }
                    const x = sayiyaCevir(a), y = sayiyaCevir(b);
                    if (hataMi(x)) return x; if (hataMi(y)) return y;
                    if (d.o === '/' && y === 0) return HATA('#BÖL/0!');
                    return { '+': x + y, '-': x - y, '*': x * y, '/': x / y, '^': x ** y }[d.o];
                }
                case 'fonk': return this.fonk(d.ad, d.args);
            }
            return HATA('#DEĞER!');
        }
        tek(d) { const v = this.hesapla(d); return Array.isArray(v) ? (v.length === 1 ? v[0] : HATA('#DEĞER!')) : v; }
        // Bağımsız değişkenlerdeki bütün değerler (aralıklar açılır); aralıktaki metin ve boşluklar sayısal fonksiyonlarca atlanır
        sayilar(args) {
            const l = [];
            for (const a of args) {
                const v = this.hesapla(a);
                if (Array.isArray(v)) { for (const x of v) { if (hataMi(x)) throw x; if (typeof x === 'number') l.push(x); } }
                else { if (hataMi(v)) throw v; const n = sayiyaCevir(v); if (hataMi(n)) throw n; l.push(n); }
            }
            return l;
        }
        fonk(ad, args) {
            const say = (n) => { if (args.length !== n) throw HATA('#DEĞER!'); };
            switch (ad) {
                case 'TOPLA': return this.sayilar(args).reduce((a, b) => a + b, 0);
                case 'ORTALAMA': { const l = this.sayilar(args); return l.length ? l.reduce((a, b) => a + b, 0) / l.length : HATA('#BÖL/0!'); }
                case 'MAK': { const l = this.sayilar(args); return l.length ? Math.max(...l) : 0; }
                case 'MİN': { const l = this.sayilar(args); return l.length ? Math.min(...l) : 0; }
                case 'SAY': case 'BAĞ_DEĞ_SAY': return this.sayilar(args).length;
                case 'BAĞ_DEĞ_DOLU_SAY': return args.flatMap(a => { const v = this.hesapla(a); return Array.isArray(v) ? v : [v]; }).filter(v => v !== '').length;
                case 'EĞER': {
                    if (args.length < 2 || args.length > 3) throw HATA('#DEĞER!');
                    const k = this.tek(args[0]); if (hataMi(k)) return k;
                    const dogru = typeof k === 'boolean' ? k : sayiyaCevir(k) !== 0;
                    return dogru ? this.tek(args[1]) : args[2] ? this.tek(args[2]) : false;
                }
                case 'EĞERSAY': { say(2); const r = this.hesapla(args[0]), o = this.tek(args[1]); return (Array.isArray(r) ? r : [r]).filter(v => olcutUyar(v, o)).length; }
                case 'ETOPLA': {
                    if (args.length < 2 || args.length > 3) throw HATA('#DEĞER!');
                    const r = this.hesapla(args[0]), o = this.tek(args[1]), t = args[2] ? this.hesapla(args[2]) : r;
                    const ra = Array.isArray(r) ? r : [r], ta = Array.isArray(t) ? t : [t];
                    return ra.reduce((s, v, i) => s + (olcutUyar(v, o) && typeof ta[i] === 'number' ? ta[i] : 0), 0);
                }
                case 'YUVARLA': { say(2); const x = sayiyaCevir(this.tek(args[0])), n = sayiyaCevir(this.tek(args[1])); if (hataMi(x)) return x; const k = 10 ** n; return Math.round(x * k + Math.sign(x) * 1e-9) / k; }
                case 'UZUNLUK': { say(1); const v = this.tek(args[0]); return hataMi(v) ? v : [...metne(v)].length; }
                case 'BİRLEŞTİR': return args.map(a => metne(this.tek(a))).join('');
                case 'VE': return args.every(a => { const v = this.tek(a); return v === true || (typeof v === 'number' && v !== 0); });
                case 'YADA': return args.some(a => { const v = this.tek(a); return v === true || (typeof v === 'number' && v !== 0); });
                case 'MUTLAK': { say(1); const x = sayiyaCevir(this.tek(args[0])); return hataMi(x) ? x : Math.abs(x); }
                case 'KAREKÖK': { say(1); const x = sayiyaCevir(this.tek(args[0])); return hataMi(x) ? x : x < 0 ? HATA('#SAYI!') : Math.sqrt(x); }
                case 'BÜYÜKHARF': { say(1); return buyuk(metne(this.tek(args[0]))); }
            }
            throw HATA('#AD?');
        }
        goster(ad) { const v = this.deger(ad); return hataMi(v) ? v.hata : metne(v); }
    }
    const FONKSIYONLAR = ['TOPLA', 'ORTALAMA', 'MAK', 'MİN', 'BAĞ_DEĞ_SAY', 'BAĞ_DEĞ_DOLU_SAY', 'EĞER', 'EĞERSAY', 'ETOPLA', 'YUVARLA', 'UZUNLUK', 'BİRLEŞTİR', 'VE', 'YADA', 'MUTLAK', 'KAREKÖK', 'BÜYÜKHARF'];

    // Formülü (doldurma tutamacı gibi) satır/sütun kaydırır; $ ile sabitlenen kısımlar kaymaz. Metinlerin içine dokunmaz.
    function kaydir(formul, dr, dc) {
        if (!String(formul).startsWith('=')) return formul;
        return formul.replace(/("(?:[^"]|"")*")|(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![\wçğıöşüÇĞİÖŞÜ(])/g, (m, metin, d1, s, d2, r) => {
            if (metin) return metin;
            const c = d1 ? sutunNo(s.toUpperCase()) : sutunNo(s.toUpperCase()) + dc;
            const rr = d2 ? +r : +r + dr;
            if (c < 0 || rr < 1) return '#BAŞV!';
            return `${d1}${SUTUN(c)}${d2}${rr}`;
        });
    }

    // ---------- Görevler ----------
    // tablo: { hucre: değer } başlangıç; hedef: öğrencinin formül yazacağı hücreler; ref: doğru formüller (denetimde kullanılır)
    // degisken: denetimde rastgele değiştirilecek girdi hücreleri (formül yerine elle sayı yazanı yakalar)
    const satirlar = (bas, l) => Object.fromEntries(l.flatMap((satir, i) => satir.map((v, j) => [hucreAd(j, bas + i - 1), v]).filter(x => x[1] !== null)));
    const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const GOREVLER = [
        {
            id: 'topla', ad: 'İlk Formül: TOPLA', sinif: [5, 12],
            anlatim: 'Ece bir hafta boyunca günlük ekran süresini dakika olarak yazdı. <b>B9</b> hücresine haftalık toplamı bulan formülü yaz: <code>=TOPLA(B2:B8)</code>. Formüller her zaman <b>=</b> ile başlar.',
            tablo: { A1: 'Gün', B1: 'Dakika', ...satirlar(2, GUNLER.map((g, i) => [g, [45, 60, 30, 80, 55, 120, 95][i]])), A9: 'Toplam' },
            hedef: ['B9'], ref: { B9: '=TOPLA(B2:B8)' }, degisken: ['B2:B8']
        },
        {
            id: 'ortalama', ad: 'Ortalama', sinif: [5, 12],
            anlatim: 'Aynı tabloda <b>B10</b> hücresine günlük ortalama ekran süresini bul: <code>ORTALAMA</code> fonksiyonu.',
            tablo: { A1: 'Gün', B1: 'Dakika', ...satirlar(2, GUNLER.map((g, i) => [g, [45, 60, 30, 80, 55, 120, 95][i]])), A9: 'Toplam', B9: '=TOPLA(B2:B8)', A10: 'Ortalama' },
            hedef: ['B10'], ref: { B10: '=ORTALAMA(B2:B8)' }, degisken: ['B2:B8']
        },
        {
            id: 'makmin', ad: 'En Büyük, En Küçük', sinif: [5, 12],
            anlatim: 'Sınıfın kodlama yarışması puanları tabloda. <b>B9</b>\'a en yüksek puanı (<code>MAK</code>), <b>B10</b>\'a en düşük puanı (<code>MİN</code>) bulan formülleri yaz.',
            tablo: { A1: 'Öğrenci', B1: 'Puan', ...satirlar(2, [['Ada', 78], ['Berk', 92], ['Ceren', 65], ['Deniz', 88], ['Ela', 99], ['Furkan', 71], ['Gizem', 84]]), A9: 'En yüksek', A10: 'En düşük' },
            hedef: ['B9', 'B10'], ref: { B9: '=MAK(B2:B8)', B10: '=MİN(B2:B8)' }, degisken: ['B2:B8']
        },
        {
            id: 'carp', ad: 'Hücreleri Çarp', sinif: [5, 12],
            anlatim: 'Okul kırtasiyesinin siparişi: <b>D2</b>\'ye tutarı hesaplayan formülü yaz: <code>=B2*C2</code>. Sonra D2\'yi seçip <b>Aşağı doldur</b> düğmesiyle formülü D5\'e kadar kopyala. Hücre başvuruları kendiliğinden kayar!',
            tablo: { A1: 'Ürün', B1: 'Adet', C1: 'Birim fiyat', D1: 'Tutar', ...satirlar(2, [['Kalem', 20, 7.5], ['Defter', 12, 18], ['Silgi', 30, 4], ['USB bellek', 3, 150]]) },
            hedef: ['D2', 'D3', 'D4', 'D5'], ref: { D2: '=B2*C2', D3: '=B3*C3', D4: '=B4*C4', D5: '=B5*C5' }, degisken: ['B2:C5']
        },
        {
            id: 'genel', ad: 'Genel Toplam', sinif: [5, 12],
            anlatim: 'Siparişin genel toplamını <b>D6</b>\'ya yaz. Tutar sütununu topla.',
            tablo: { A1: 'Ürün', B1: 'Adet', C1: 'Birim fiyat', D1: 'Tutar', ...satirlar(2, [['Kalem', 20, 7.5, '=B2*C2'], ['Defter', 12, 18, '=B3*C3'], ['Silgi', 30, 4, '=B4*C4'], ['USB bellek', 3, 150, '=B5*C5']]), C6: 'Genel toplam' },
            hedef: ['D6'], ref: { D6: '=TOPLA(D2:D5)' }, degisken: ['B2:C5']
        },
        {
            id: 'mutlak', ad: 'Sabit Hücre: $', sinif: [6, 12],
            anlatim: 'İndirim oranı <b>B1</b>\'de yazıyor. <b>C4</b>\'e indirimli fiyatı bul: <code>=B4*(1-$B$1)</code> ve C8\'e kadar aşağı doldur. <b>$</b> işareti B1\'i sabitler; doldururken kaymaz. İndirim oranını değiştirince bütün fiyatlar güncellenmeli.',
            tablo: { A1: 'İndirim', B1: 0.2, A3: 'Ürün', B3: 'Fiyat', C3: 'İndirimli', ...satirlar(4, [['Kulaklık', 400], ['Fare', 250], ['Klavye', 600], ['Tablet kalemi', 900], ['Hoparlör', 750]]) },
            hedef: ['C4', 'C5', 'C6', 'C7', 'C8'], ref: { C4: '=B4*(1-$B$1)', C5: '=B5*(1-$B$1)', C6: '=B6*(1-$B$1)', C7: '=B7*(1-$B$1)', C8: '=B8*(1-$B$1)' }, degisken: ['B1', 'B4:B8'],
            ipucu: 'Önce C4\'e formülü yaz, sonra Aşağı doldur. Fiyat kayarken indirim oranı ($B$1) sabit kalmalı.'
        },
        {
            id: 'eger', ad: 'Karar Ver: EĞER', sinif: [6, 12],
            anlatim: 'Proje puanı 50 ve üstüyse <b>"Geçti"</b>, değilse <b>"Kaldı"</b> yazsın. <b>C2</b>\'ye <code>=EĞER(B2>=50;"Geçti";"Kaldı")</code> yaz ve C7\'ye kadar doldur. Türkçe tablolarda bağımsız değişkenler <b>;</b> ile ayrılır.',
            tablo: { A1: 'Öğrenci', B1: 'Puan', C1: 'Durum', ...satirlar(2, [['Ada', 78], ['Berk', 42], ['Ceren', 50], ['Deniz', 88], ['Ela', 35], ['Furkan', 61]]) },
            hedef: ['C2', 'C3', 'C4', 'C5', 'C6', 'C7'], ref: Object.fromEntries([2, 3, 4, 5, 6, 7].map(r => [`C${r}`, `=EĞER(B${r}>=50;"Geçti";"Kaldı")`])), degisken: ['B2:B7']
        },
        {
            id: 'egersay', ad: 'Koşullu Sayma', sinif: [6, 12],
            anlatim: 'Kaç öğrencinin geçtiğini <b>B9</b>\'a, kaçının kaldığını <b>B10</b>\'a bul: <code>=EĞERSAY(C2:C7;"Geçti")</code>.',
            tablo: { A1: 'Öğrenci', B1: 'Puan', C1: 'Durum', ...satirlar(2, [['Ada', 78], ['Berk', 42], ['Ceren', 50], ['Deniz', 88], ['Ela', 35], ['Furkan', 61]].map(([a, p], i) => [a, p, `=EĞER(B${i + 2}>=50;"Geçti";"Kaldı")`])), A9: 'Geçen', A10: 'Kalan' },
            hedef: ['B9', 'B10'], ref: { B9: '=EĞERSAY(C2:C7;"Geçti")', B10: '=EĞERSAY(C2:C7;"Kaldı")' }, degisken: ['B2:B7']
        },
        {
            id: 'etopla', ad: 'Koşullu Toplam', sinif: [7, 12],
            anlatim: 'Bir haftalık uygulama kullanım kaydı. Türlere göre toplam dakikayı bul: <b>E2</b>\'ye <code>=ETOPLA(B2:B9;D2;C2:C9)</code> yaz. D sütunundaki türü kullanarak E4\'e kadar doldur (aralıkları $ ile sabitlemeyi unutma!).',
            tablo: { A1: 'Gün', B1: 'Tür', C1: 'Dakika', D1: 'Tür', E1: 'Toplam', D2: 'Oyun', D3: 'Eğitim', D4: 'Video', ...satirlar(2, [['Pzt', 'Oyun', 40], ['Pzt', 'Eğitim', 30], ['Sal', 'Video', 25], ['Çar', 'Oyun', 60], ['Çar', 'Eğitim', 45], ['Per', 'Video', 50], ['Cum', 'Oyun', 35], ['Cum', 'Eğitim', 20]]) },
            hedef: ['E2', 'E3', 'E4'], ref: { E2: '=ETOPLA($B$2:$B$9;D2;$C$2:$C$9)', E3: '=ETOPLA($B$2:$B$9;D3;$C$2:$C$9)', E4: '=ETOPLA($B$2:$B$9;D4;$C$2:$C$9)' }, degisken: ['C2:C9']
        },
        {
            id: 'yuzde', ad: 'Yüzde Hesabı', sinif: [6, 12],
            anlatim: 'Bir anket sonucunda her cihaz için yüzdeyi bul. <b>C2</b>\'ye <code>=B2/$B$6</code> yaz ve C5\'e kadar doldur. (Toplam B6\'da.) Sonuç 0 ile 1 arasında bir oran olacak.',
            tablo: { A1: 'Cihaz', B1: 'Kişi', C1: 'Oran', ...satirlar(2, [['Telefon', 14], ['Tablet', 6], ['Bilgisayar', 8], ['Konsol', 2]]), A6: 'Toplam', B6: '=TOPLA(B2:B5)' },
            hedef: ['C2', 'C3', 'C4', 'C5'], ref: { C2: '=B2/$B$6', C3: '=B3/$B$6', C4: '=B4/$B$6', C5: '=B5/$B$6' }, degisken: ['B2:B5']
        },
        {
            id: 'birlestir', ad: 'Metinleri Birleştir', sinif: [6, 12],
            anlatim: 'Okul hesaplarının kullanıcı adlarını oluştur: ad, nokta ve soyad. <b>C2</b>\'ye <code>=A2&"."&B2</code> yaz ve C5\'e kadar doldur. <b>&</b> işareti metinleri birleştirir.',
            tablo: { A1: 'Ad', B1: 'Soyad', C1: 'Kullanıcı adı', ...satirlar(2, [['ada', 'kaya'], ['berk', 'demir'], ['ceren', 'yilmaz'], ['deniz', 'arslan']]) },
            hedef: ['C2', 'C3', 'C4', 'C5'], ref: { C2: '=A2&"."&B2', C3: '=A3&"."&B3', C4: '=A4&"."&B4', C5: '=A5&"."&B5' }, degisken: []
        },
        {
            id: 'uzunluk', ad: 'Şifre Kontrolü', sinif: [7, 12],
            anlatim: 'Şifre en az 8 karakterse <b>"Yeterli"</b>, değilse <b>"Kısa"</b> yazsın. <b>C2</b>\'ye <code>=EĞER(UZUNLUK(B2)>=8;"Yeterli";"Kısa")</code> yaz ve doldur. (Bunlar örnek şifrelerdir; gerçek şifreni hiçbir tabloya yazma!)',
            tablo: { A1: 'Hesap', B1: 'Örnek şifre', C1: 'Uzunluk kontrolü', ...satirlar(2, [['Oyun', 'kedi12'], ['Okul', 'Mavi-Deniz42'], ['E-posta', '12345678'], ['Bulut', 'abc']]) },
            hedef: ['C2', 'C3', 'C4', 'C5'], ref: Object.fromEntries([2, 3, 4, 5].map(r => [`C${r}`, `=EĞER(UZUNLUK(B${r})>=8;"Yeterli";"Kısa")`])), degisken: []
        },
        {
            id: 'gb', ad: 'MB → GB Dönüştür', sinif: [6, 12],
            anlatim: 'Dosya boyutlarını GB\'a çevir ve virgülden sonra 2 basamağa yuvarla. <b>C2</b>\'ye <code>=YUVARLA(B2/1024;2)</code> yaz ve doldur.',
            tablo: { A1: 'Dosya', B1: 'MB', C1: 'GB', ...satirlar(2, [['Oyun', 4300], ['Film', 1800], ['Fotoğraflar', 2560], ['Müzik', 720]]) },
            hedef: ['C2', 'C3', 'C4', 'C5'], ref: Object.fromEntries([2, 3, 4, 5].map(r => [`C${r}`, `=YUVARLA(B${r}/1024;2)`])), degisken: ['B2:B5']
        },
        {
            id: 'karne', ad: 'Proje: Not Çizelgesi', sinif: [7, 12],
            anlatim: 'Üç sınavın ortalamasını <b>E</b> sütununa (YUVARLA ile 1 basamak), ortalama 70 ve üstüyse <b>"Teşekkür"</b>, değilse boş metin ("") yazan formülü <b>F</b> sütununa yaz. Son olarak <b>E7</b>\'ye sınıf ortalamasını bul.',
            tablo: { A1: 'Öğrenci', B1: 'Sınav 1', C1: 'Sınav 2', D1: 'Sınav 3', E1: 'Ortalama', F1: 'Belge', ...satirlar(2, [['Ada', 80, 75, 90], ['Berk', 60, 55, 72], ['Ceren', 95, 88, 91], ['Deniz', 70, 68, 74], ['Ela', 45, 62, 58]]), D7: 'Sınıf' },
            hedef: ['E2', 'E3', 'E4', 'E5', 'E6', 'F2', 'F3', 'F4', 'F5', 'F6', 'E7'],
            ref: { ...Object.fromEntries([2, 3, 4, 5, 6].flatMap(r => [[`E${r}`, `=YUVARLA(ORTALAMA(B${r}:D${r});1)`], [`F${r}`, `=EĞER(E${r}>=70;"Teşekkür";"")`]])), E7: '=ORTALAMA(E2:E6)' },
            degisken: ['B2:D6'], tolerans: 0.051
        },
        { id: 'serbest', ad: 'Serbest Tablo', sinif: [5, 12], serbest: true, anlatim: 'Kendi tablonu oluştur: bütçe, anket, not çizelgesi… Bütün formüller açık.', tablo: {}, hedef: [], ref: {}, degisken: [] }
    ];

    // Aralık listesini hücre adlarına açar
    function hucreler(araliklar) {
        return araliklar.flatMap(r => {
            if (!r.includes(':')) return [r];
            const [a, b] = r.split(':').map(hucreAyir), l = [];
            for (let rr = a.r; rr <= b.r; rr++) for (let cc = a.c; cc <= b.c; cc++) l.push(hucreAd(cc, rr));
            return l;
        });
    }
    function uretec(tohum) { let s = (tohum >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

    // Öğrencinin tablosunu doğru formüllerle karşılaştırır; girdi hücreleri rastgele değiştirilerek de denenir
    function denetle(g, ogrenci) {
        const sonuc = g.hedef.map(h => ({ hucre: h, gecti: true, neden: '' }));
        const girdiler = hucreler(g.degisken);
        const r = uretec(7);
        const denemeler = [{}];
        for (let k = 0; k < 3 && girdiler.length; k++) {
            const d = {};
            for (const h of girdiler) { const v = g.tablo[h]; if (typeof v === 'number') d[h] = v < 1 ? Math.round(r() * 90 + 5) / 100 : Math.round(v * (0.3 + r() * 1.6) + 1); }
            denemeler.push(d);
        }
        for (const s of sonuc) {
            const ham = ogrenci[s.hucre];
            if (ham === undefined || ham === '') { s.gecti = false; s.neden = 'boş'; continue; }
            if (!String(ham).startsWith('=')) { s.gecti = false; s.neden = 'formül değil'; continue; }
        }
        for (const d of denemeler) {
            // Girdi hücreleri her zaman görevin verisinden gelir; öğrencinin yazdığı diğer hücreler korunur
            const ot = new Tablo({ ...ogrenci, ...g.tablo, ...d, ...Object.fromEntries(g.hedef.map(h => [h, ogrenci[h] ?? ''])) });
            const rt = new Tablo({ ...g.tablo, ...g.ref, ...d });
            for (const s of sonuc) {
                if (!s.gecti) continue;
                const a = ot.deger(s.hucre), b = rt.deger(s.hucre);
                const esit = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= (g.tolerans || 1e-9) : metne(a) === metne(b) && !hataMi(a);
                if (!esit) { s.gecti = false; s.neden = hataMi(a) ? a.hata : Object.keys(d).length ? 'veriler değişince yanlış' : 'yanlış sonuç'; s.beklenen = metne(b); s.bulunan = hataMi(a) ? a.hata : metne(a); }
            }
        }
        return sonuc;
    }
    const yildiz = (hata) => hata === 0 ? 3 : hata <= 2 ? 2 : 1;

    const api = { Tablo, ayristir, kaydir, SUTUN, sutunNo, hucreAyir, hucreAd, metne, bicimle, hataMi, olcutUyar, FONKSIYONLAR, GOREVLER, hucreler, denetle, yildiz };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.TabloMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
