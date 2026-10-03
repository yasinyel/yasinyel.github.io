// Kodlayalım — "Bilgisayar Sensin" motoru
// Ekranda bir program durur; öğrenci onu kafasında çalıştırır ve karakteri yön tuşlarıyla
// programın yapacağı şekilde hareket ettirir. Programlar tek bir ağaç yapısıyla tanımlanır ve
// kademeye göre dört farklı biçimde gösterilir: oklar (okul öncesi), bloklar (ilkokul),
// Türkçe kod (ortaokul), Python (lise).
(function (root) {
    'use strict';

    const YON = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };

    // ---------- Program kurucular ----------
    const deger = (x) => typeof x === 'number' ? { e: 'n', v: x }
        : typeof x === 'boolean' ? { e: 'b', v: x }
        : typeof x === 'string' ? { e: 'v', v: x } : x;
    const Str = (s) => ({ e: 's', v: s });
    const Lst = (dizi) => ({ e: 'l', v: dizi.map(deger) });
    const op = (o, a, b) => ({ e: 'op', o, a: deger(a), b: deger(b) });
    const Len = (x) => ({ e: 'len', x: deger(x) });
    const Cagir = (ad, ...arg) => ({ e: 'call', ad, arg: arg.map(deger) });

    const P = {
        mv: (d) => ({ t: 'mv', d }),
        R: () => P.mv('R'), L: () => P.mv('L'), U: () => P.mv('U'), D: () => P.mv('D'),
        rep: (n, ...govde) => ({ t: 'rep', n: deger(n), govde }),
        forR: (v, a, b, ...govde) => ({ t: 'for', v, a: deger(a), b: deger(b), govde }),
        forIn: (v, x, ...govde) => ({ t: 'forin', v, x: deger(x), govde }),
        iff: (k, evet, hayir) => ({ t: 'if', k: deger(k), evet, hayir: hayir || null }),
        whl: (k, ...govde) => ({ t: 'while', k: deger(k), govde }),
        set: (v, x) => ({ t: 'set', v, x: deger(x) }),
        brk: () => ({ t: 'brk' }),
        def: (ad, param, ...govde) => ({ t: 'def', ad, param, govde }),
        call: (ad, ...arg) => ({ t: 'call', ad, arg: arg.map(deger) }),
        ret: (x) => ({ t: 'ret', x: x === undefined ? null : deger(x) })
    };

    // Her ifadeye bir numara ver (ipucunda hangi satırın vurgulanacağını bulmak için)
    function numarala(program) {
        let id = 0;
        (function gez(liste) {
            for (const s of liste) {
                s.id = ++id;
                for (const alt of [s.govde, s.evet, s.hayir]) if (alt) gez(alt);
            }
        })(program);
        return program;
    }

    // ---------- Çalıştırıcı ----------
    // Programı çalıştırır, beklenen hamleleri döndürür: [{ d: 'R', id }]
    function calistir(program) {
        const hamleler = [];
        const fonk = {};
        let adim = 0;
        const KIR = { kir: true };
        class Donus { constructor(v) { this.v = v; } }

        function ifade(x, ortam) {
            switch (x.e) {
                case 'n': case 'b': case 's': return x.v;
                case 'v':
                    if (!(x.v in ortam)) throw new Error('Tanımsız değişken: ' + x.v);
                    return ortam[x.v];
                case 'l': return x.v.map(y => ifade(y, ortam));
                case 'len': return [...ifade(x.x, ortam)].length;
                case 'call': return cagir(x.ad, x.arg.map(a => ifade(a, ortam)));
                case 'op': {
                    if (x.o === 'and') return ifade(x.a, ortam) && ifade(x.b, ortam);
                    if (x.o === 'or') return ifade(x.a, ortam) || ifade(x.b, ortam);
                    const a = ifade(x.a, ortam), b = ifade(x.b, ortam);
                    switch (x.o) {
                        case '+': return a + b; case '-': return a - b; case '*': return a * b;
                        case '//': return Math.floor(a / b);
                        case '%': return ((a % b) + b) % b;
                        case '==': return a === b; case '!=': return a !== b;
                        case '<': return a < b; case '>': return a > b;
                        case '<=': return a <= b; case '>=': return a >= b;
                    }
                }
            }
            throw new Error('Bilinmeyen ifade');
        }

        function cagir(ad, argumanlar) {
            const f = fonk[ad];
            if (!f) throw new Error('Tanımsız fonksiyon: ' + ad);
            const yerel = Object.create(genel);
            f.param.forEach((p, i) => { yerel[p] = argumanlar[i]; });
            try { yurut(f.govde, yerel); }
            catch (e) { if (e instanceof Donus) return e.v; throw e; }
            return null;
        }

        function dongu(govde, ortam) {
            try { yurut(govde, ortam); } catch (e) { if (e === KIR) return false; throw e; }
            return true;
        }

        function yurut(liste, ortam) {
            for (const s of liste) {
                if (++adim > 5000) throw new Error('Program çok uzun sürdü');
                switch (s.t) {
                    case 'mv': hamleler.push({ d: s.d, id: s.id }); break;
                    case 'rep': { const n = ifade(s.n, ortam); for (let i = 0; i < n; i++) if (!dongu(s.govde, ortam)) break; break; }
                    case 'for': {
                        const a = ifade(s.a, ortam), b = ifade(s.b, ortam);
                        for (let i = a; i < b; i++) { ortam[s.v] = i; if (!dongu(s.govde, ortam)) break; }
                        break;
                    }
                    case 'forin': {
                        for (const x of [...ifade(s.x, ortam)]) { ortam[s.v] = x; if (!dongu(s.govde, ortam)) break; }
                        break;
                    }
                    case 'if':
                        if (ifade(s.k, ortam)) yurut(s.evet, ortam);
                        else if (s.hayir) yurut(s.hayir, ortam);
                        break;
                    case 'while':
                        while (ifade(s.k, ortam)) {
                            if (++adim > 5000) throw new Error('Program çok uzun sürdü');
                            if (!dongu(s.govde, ortam)) break;
                        }
                        break;
                    case 'set': ortam[s.v] = ifade(s.x, ortam); break;
                    case 'brk': throw KIR;
                    case 'def': fonk[s.ad] = s; break;
                    case 'call': cagir(s.ad, s.arg.map(a => ifade(a, ortam))); break;
                    case 'ret': throw new Donus(s.x ? ifade(s.x, ortam) : null);
                }
            }
        }

        const genel = {};
        yurut(program, genel);
        return hamleler;
    }

    // Hamlelerin izlediği yol ve kaplanan alan
    function yol(hamleler) {
        let x = 0, y = 0;
        const noktalar = [[0, 0]];
        for (const h of hamleler) { x += YON[h.d][0]; y += YON[h.d][1]; noktalar.push([x, y]); }
        const xs = noktalar.map(p => p[0]), ys = noktalar.map(p => p[1]);
        return { noktalar, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    // ---------- Gösterim: metin kod ----------
    const k = (s) => `<span class="k">${s}</span>`;
    const f = (s) => `<span class="f">${s}</span>`;
    const n = (s) => `<span class="n">${s}</span>`;
    const st = (s) => `<span class="s">${s}</span>`;
    const ONCELIK = { or: 1, and: 2, '==': 4, '!=': 4, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '//': 6, '%': 6 };

    const DILLER = {
        python: {
            mv: { R: 'sag', L: 'sol', U: 'yukari', D: 'asagi' },
            ve: 'and', veya: 'or', dogru: 'True', yanlis: 'False', len: 'len', blokSonu: false
        },
        turkce: {
            mv: { R: 'sağ', L: 'sol', U: 'yukarı', D: 'aşağı' },
            ve: 've', veya: 'veya', dogru: 'doğru', yanlis: 'yanlış', len: 'uzunluk', blokSonu: true
        }
    };

    function ifadeYaz(x, dil, ust = 0) {
        switch (x.e) {
            case 'n': return n(x.v);
            case 'b': return k(x.v ? dil.dogru : dil.yanlis);
            case 's': return st(`"${x.v}"`);
            case 'v': return x.v;
            case 'l': return '[' + x.v.map(y => ifadeYaz(y, dil)).join(', ') + ']';
            case 'len': return f(dil.len) + '(' + ifadeYaz(x.x, dil) + ')';
            case 'call': return f(x.ad) + '(' + x.arg.map(a => ifadeYaz(a, dil)).join(', ') + ')';
            case 'op': {
                const p = ONCELIK[x.o];
                const o = x.o === 'and' ? k(dil.ve) : x.o === 'or' ? k(dil.veya) : x.o.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const s = ifadeYaz(x.a, dil, p) + ' ' + o + ' ' + ifadeYaz(x.b, dil, p + 0.5);
                return p < ust ? '(' + s + ')' : s;
            }
        }
    }

    // Satır listesi döndürür: [{ girinti, html, id }]
    function metinYaz(program, dilAdi) {
        const dil = DILLER[dilAdi];
        const py = dilAdi === 'python';
        const satirlar = [];
        const satir = (g, html, id) => satirlar.push({ girinti: g, html, id });
        const ac = py ? ':' : ' {';
        const kapa = (g) => { if (!py) satir(g, '}', null); };

        function blok(liste, g) { liste.forEach(s => ifadeSatiri(s, g)); }

        function kosulZinciri(s, g, ilk) {
            satir(g, (ilk ? '' : (py ? '' : '} ')) + k(ilk ? (py ? 'if' : 'eğer') : (py ? 'elif' : 'değilse eğer')) + ' ' + ifadeYaz(s.k, dil) + ac, s.id);
            if (!ilk && !py) satirlar[satirlar.length - 1].kapanis = true;
            blok(s.evet, g + 1);
            if (s.hayir && s.hayir.length === 1 && s.hayir[0].t === 'if') kosulZinciri(s.hayir[0], g, false);
            else if (s.hayir) {
                satir(g, (py ? '' : '} ') + k(py ? 'else' : 'değilse') + ac, null);
                blok(s.hayir, g + 1);
                kapa(g);
            } else kapa(g);
        }

        function ifadeSatiri(s, g) {
            switch (s.t) {
                case 'mv': satir(g, f(dil.mv[s.d]) + '()', s.id); break;
                case 'rep':
                    satir(g, py ? `${k('for')} _ ${k('in')} ${f('range')}(${ifadeYaz(s.n, dil)}):` : `${k('tekrarla')} ${ifadeYaz(s.n, dil)} {`, s.id);
                    blok(s.govde, g + 1); kapa(g); break;
                case 'for': {
                    const sifir = s.a.e === 'n' && s.a.v === 0;
                    const aralik = sifir ? ifadeYaz(s.b, dil) : ifadeYaz(s.a, dil) + ', ' + ifadeYaz(s.b, dil);
                    satir(g, py ? `${k('for')} ${s.v} ${k('in')} ${f('range')}(${aralik}):` : `${k('her')} ${s.v} ${k('için')} ${f('aralık')}(${aralik}) {`, s.id);
                    blok(s.govde, g + 1); kapa(g); break;
                }
                case 'forin':
                    satir(g, py ? `${k('for')} ${s.v} ${k('in')} ${ifadeYaz(s.x, dil)}:` : `${k('her')} ${s.v} ${k('için')} ${ifadeYaz(s.x, dil)} {`, s.id);
                    blok(s.govde, g + 1); kapa(g); break;
                case 'if': kosulZinciri(s, g, true); break;
                case 'while':
                    satir(g, `${k(py ? 'while' : 'iken')} ${ifadeYaz(s.k, dil)}${ac}`, s.id);
                    blok(s.govde, g + 1); kapa(g); break;
                case 'set': {
                    const x = s.x;
                    if (py && x.e === 'op' && ['+', '-', '//', '*'].includes(x.o) && x.a.e === 'v' && x.a.v === s.v)
                        satir(g, `${s.v} ${x.o}= ${ifadeYaz(x.b, dil)}`, s.id);
                    else satir(g, `${s.v} = ${ifadeYaz(x, dil)}`, s.id);
                    break;
                }
                case 'brk': satir(g, k(py ? 'break' : 'kır'), s.id); break;
                case 'def':
                    satir(g, `${k(py ? 'def' : 'fonksiyon')} ${f(s.ad)}(${s.param.join(', ')})${ac}`, s.id);
                    blok(s.govde, g + 1); kapa(g);
                    satir(g, '', null);
                    break;
                case 'call': satir(g, `${f(s.ad)}(${s.arg.map(a => ifadeYaz(a, dil)).join(', ')})`, s.id); break;
                case 'ret': satir(g, k(py ? 'return' : 'döndür') + (s.x ? ' ' + ifadeYaz(s.x, dil) : ''), s.id); break;
            }
        }
        blok(program, 0);
        return satirlar;
    }

    // Python'da çalıştırılabilir düz metin (testler için)
    function pythonMetni(program) {
        return metinYaz(program, 'python')
            .map(s => '    '.repeat(s.girinti) + s.html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')).join('\n');
    }

    // ---------- Gösterim: bloklar (ilkokul) ve oklar (okul öncesi) ----------
    const OK = { R: '→', L: '←', U: '↑', D: '↓' };
    const BLOK_YAZI = { R: 'sağa git', L: 'sola git', U: 'yukarı git', D: 'aşağı git' };

    function blokYaz(program) {
        return program.map(s => {
            if (s.t === 'mv') return `<div class="blk mv d${s.d}" data-id="${s.id}"><b>${OK[s.d]}</b> ${BLOK_YAZI[s.d]}</div>`;
            if (s.t === 'rep') return `<div class="blk rep" data-id="${s.id}"><div class="rep-head"><i class="fas fa-repeat"></i> ${s.n.v} kez tekrarla</div><div class="rep-body">${blokYaz(s.govde)}</div><div class="rep-foot"></div></div>`;
            throw new Error('Blok gösteriminde desteklenmeyen ifade: ' + s.t);
        }).join('');
    }

    function okYaz(program) {
        return program.map(s => {
            if (s.t === 'mv') return `<span class="ok d${s.d}" data-id="${s.id}" aria-label="${BLOK_YAZI[s.d]}">${OK[s.d]}</span>`;
            if (s.t === 'rep') return `<span class="okrep" data-id="${s.id}"><span class="okrep-in">${okYaz(s.govde)}</span><span class="okrep-n">×${s.n.v}</span></span>`;
            throw new Error('Ok gösteriminde desteklenmeyen ifade: ' + s.t);
        }).join('');
    }

    // ---------- Bölümler ----------
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const sec = (d) => d[Math.floor(Math.random() * d.length)];
    const TERS = { R: 'L', L: 'R', U: 'D', D: 'U' };
    // Geri dönmeyen rastgele yön dizisi
    function rastgeleYonler(adet, izin = 'RLUD') {
        const d = [];
        while (d.length < adet) {
            const y = sec([...izin]);
            if (d.length && TERS[d[d.length - 1]] === y) continue;
            d.push(y);
        }
        return d;
    }
    const { R: sa, L: so, U: yu, D: as, rep, forR, forIn, iff, whl, set, brk, def, call, ret } = P;

    const KADEMELER = [
        {
            id: 'okuloncesi', ad: 'Okul Öncesi', sinif: 'Anasınıfı – 1. sınıf', gosterim: 'ok', renk: '#f59e0b', ikon: 'fa-shapes',
            aciklama: 'Okları sırayla takip et. Okuma bilmeye gerek yok!',
            bolumler: [
                { ad: 'Hep aynı yöne', yeni: 'Oklar karakterin gideceği yönü gösterir.', p: () => { const d = sec(['R', 'D']); return Array.from({ length: r(3, 4) }, () => P.mv(d)); } },
                { ad: 'İki yön', p: () => [...Array(r(2, 3))].map(sa).concat([...Array(r(2, 3))].map(as)) },
                { ad: 'Tepeye tırman', p: () => [yu(), yu(), sa(), sa(), as(), as()] },
                { ad: 'Dört yön', p: () => rastgeleYonler(5).map(P.mv) },
                { ad: 'Uzun yol', p: () => rastgeleYonler(8).map(P.mv) },
                { ad: 'Tekrar kutusu', yeni: 'Kutunun içindekileri kutunun üstündeki sayı kadar yap.', p: () => [rep(r(3, 4), sec([sa, as])())] },
                { ad: 'İkili tekrar', p: () => [rep(r(2, 3), sa(), yu())] },
                { ad: 'Merdiven', p: () => [rep(3, sa(), as())] },
                { ad: 'Kutudan önce, kutudan sonra', p: () => [yu(), rep(3, sa()), as()] },
                { ad: 'İki kutu', p: () => [rep(r(2, 3), sa()), rep(r(2, 3), as()), so()] }
            ]
        },
        {
            id: 'ilkokul', ad: 'İlkokul', sinif: '2. – 4. sınıf', gosterim: 'blok', renk: '#16a36a', ikon: 'fa-puzzle-piece',
            aciklama: 'Kod bloklarını yukarıdan aşağıya oku. Tekrar bloklarına dikkat!',
            bolumler: [
                { ad: 'Sırayla oku', yeni: 'Bloklar yukarıdan aşağıya doğru sırayla çalışır.', p: () => rastgeleYonler(6).map(P.mv) },
                { ad: 'Tekrarla', yeni: '"Tekrarla" bloğu içindeki blokları belirtilen sayı kadar çalıştırır.', p: () => [rep(r(3, 5), sa()), yu()] },
                { ad: 'İçinde iki blok', p: () => [rep(3, sa(), sa(), yu())] },
                { ad: 'Önce ve sonra', p: () => [as(), rep(r(2, 3), sa(), yu()), sa()] },
                { ad: 'İç içe tekrar', yeni: 'Bir tekrar bloğunun içinde başka bir tekrar bloğu olabilir. İçteki her seferinde baştan çalışır.', p: () => [rep(2, rep(3, sa()), as())] },
                { ad: 'Gidiş dönüş', p: () => [rep(r(3, 4), sa(), as()), rep(r(2, 3), so())] },
                { ad: 'Basamaklar', p: () => [rep(2, rep(2, sa()), rep(2, as()))] },
                { ad: 'Köprü', p: () => [rep(r(2, 3), yu(), rep(2, sa()), as())] },
                { ad: 'Zikzak', p: () => [rep(2, sa(), rep(2, yu(), sa()))] },
                { ad: 'Dağlar', p: () => [rep(2, rep(2, sa(), yu()), rep(2, sa(), as()))] }
            ]
        },
        {
            id: 'ortaokul', ad: 'Ortaokul', sinif: '5. – 8. sınıf', gosterim: 'turkce', renk: '#1d5fd6', ikon: 'fa-code',
            aciklama: 'Türkçe kodu oku: değişkenler, koşullar, döngüler ve fonksiyonlar.',
            bolumler: [
                { ad: 'Değişken', yeni: 'Değişken bir değeri saklayan kutudur: adim = 3 dersek adim kutusunda 3 vardır.', p: () => { const v = r(2, 4); return [set('adim', v), rep('adim', sa()), yu()]; } },
                { ad: 'Değişken değişir', p: () => { const v = r(1, 3); return [set('x', v), rep('x', sa()), set('x', op('+', 'x', 2)), rep('x', as())]; } },
                { ad: 'Eğer', yeni: '"eğer" koşul doğruysa ilk bloğu, değilse "değilse" bloğunu çalıştırır.', p: () => { const v = r(1, 9); return [set('sayi', v), iff(op('>', 'sayi', 5), [sa(), sa()], [yu(), yu()]), as()]; } },
                { ad: 'Not hesabı', p: () => { const v = sec([r(20, 49), r(50, 84), r(85, 100)]); return [set('puan', v), iff(op('>=', 'puan', 85), [sa(), sa(), sa()], [iff(op('>=', 'puan', 50), [yu(), yu()], [so(), so()])]), as()]; } },
                { ad: 'Sayaçlı döngü', yeni: '"iken" koşul doğru olduğu sürece bloğu tekrarlar. Sayacın her turda nasıl değiştiğini takip et.', p: () => [set('i', 0), whl(op('<', 'i', r(3, 5)), sa(), set('i', op('+', 'i', 1))), yu()] },
                { ad: 'Tek mi çift mi?', p: () => [set('i', 0), whl(op('<', 'i', r(4, 6)), iff(op('==', op('%', 'i', 2), 0), [sa()], [yu()]), set('i', op('+', 'i', 1)))] },
                { ad: 'Geri sayım', p: () => { const v = r(7, 11); return [set('x', v), whl(op('>', 'x', 2), as(), set('x', op('-', 'x', 2))), sa()]; } },
                { ad: 'Büyüyen merdiven', p: () => [set('a', 1), rep(3, rep('a', sa()), yu(), set('a', op('+', 'a', 1)))] },
                { ad: 'Fonksiyon', yeni: 'Fonksiyon, bir isim verilmiş kod parçasıdır. Tanımlandığında çalışmaz, çağrıldığında çalışır.', p: () => [def('zikzak', [], sa(), yu(), sa(), as()), call('zikzak'), yu(), call('zikzak')] },
                { ad: 'Parametre', p: () => { const a = [r(1, 3), r(1, 3), r(1, 3)]; return [def('git', ['n'], rep('n', sa()), as()), ...a.map(x => call('git', x))]; } },
                { ad: 've / veya', p: () => { const lo = r(1, 2), hi = lo + r(2, 3); return [set('i', 1), whl(op('<=', 'i', 6), iff(op('and', op('>', 'i', lo), op('<', 'i', hi)), [yu()], [sa()]), set('i', op('+', 'i', 1)))]; } }
            ]
        },
        {
            id: 'lise', ad: 'Lise', sinif: '9. – 12. sınıf', gosterim: 'python', renk: '#8b5cf6', ikon: 'fa-terminal',
            aciklama: 'Gerçek Python kodu: range, iç içe döngüler, listeler, metinler, fonksiyonlar, özyineleme.',
            bolumler: [
                { ad: 'for ve range', yeni: 'range(n) 0\'dan n-1\'e kadar sayar; yani döngü n kez döner.', p: () => [forR('i', 0, r(3, 5), sa()), yu()] },
                { ad: 'range(a, b) ve %', p: () => { const a = r(1, 2), b = a + r(5, 6); return [forR('i', a, b, iff(op('==', op('%', 'i', 3), 0), [yu()], [sa()]))]; } },
                { ad: 'İç içe for', p: () => [forR('i', 1, r(3, 4), forR('j', 0, 'i', sa()), as())] },
                { ad: 'while ve //', p: () => { const v = r(20, 70); return [set('n', v), whl(op('>', 'n', 1), sa(), set('n', op('//', 'n', 2))), yu()]; } },
                { ad: 'Liste', p: () => { const l = [r(1, 3), r(1, 3), r(1, 3)]; return [forIn('k', Lst(l), forR('_', 0, 'k', yu()), sa())]; } },
                { ad: 'Metin', yeni: 'for bir metnin harflerini tek tek gezebilir.', p: () => {
                    const yolStr = rastgeleYonler(6, 'RUD').map(d => ({ R: 'S', U: 'Y', D: 'A' })[d]).join('');
                    return [set('yol', Str(yolStr)), forIn('c', 'yol', iff(op('==', 'c', Str('S')), [sa()], [iff(op('==', 'c', Str('Y')), [yu()], [as()])]))];
                } },
                { ad: 'break', p: () => { const m = r(3, 5); return [set('i', 0), whl(true, set('i', op('+', 'i', 1)), iff(op('==', op('%', 'i', m), 0), [brk()]), sa()), as()]; } },
                { ad: 'Fonksiyon', p: () => { const kk = r(1, 2); return [def('kare', ['k'], forR('_', 0, 'k', sa()), forR('_', 0, 'k', as()), forR('_', 0, 'k', so()), forR('_', 0, 'k', yu())), call('kare', kk), call('kare', kk + 1)]; } },
                { ad: 'Dönüş değeri', p: () => [def('uzunluk', ['x'], ret(op('-', op('*', 'x', 2), 1))), forR('i', 1, 4, forR('_', 0, Cagir('uzunluk', 'i'), sa()), yu())] },
                { ad: 'İkilik sayı', p: () => { const v = r(9, 30); return [set('n', v), whl(op('>', 'n', 0), iff(op('==', op('%', 'n', 2), 1), [yu()], [sa()]), set('n', op('//', 'n', 2)))]; } },
                { ad: 'Collatz', p: () => { const v = sec([3, 5, 6, 12]); return [set('n', v), whl(op('!=', 'n', 1), iff(op('==', op('%', 'n', 2), 0), [set('n', op('//', 'n', 2)), sa()], [set('n', op('+', op('*', 3, 'n'), 1)), yu()]))]; } },
                { ad: 'Özyineleme', yeni: 'Fonksiyon kendini çağırabilir. Her çağrı bitince kaldığı yerden devam eder!', p: () => [def('f', ['n'], iff(op('==', 'n', 0), [ret()]), sa(), call('f', op('-', 'n', 1)), yu()), call('f', r(2, 4))] }
            ]
        }
    ];

    // Bölümü oluştur: program + beklenen hamleler
    function bolumUret(kademe, no) {
        const prog = numarala(kademe.bolumler[no].p());
        return { program: prog, hamleler: calistir(prog) };
    }

    const api = { P, Str, Lst, op, Len, Cagir, numarala, calistir, yol, metinYaz, pythonMetni, blokYaz, okYaz, KADEMELER, bolumUret, YON };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Sensin = api;
})(typeof window !== 'undefined' ? window : globalThis);
