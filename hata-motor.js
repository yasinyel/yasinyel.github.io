// Kodlayalım — Hata Avcısı motoru
// Bilgisayar Sensin programlarından birini alır ve içine tek bir hata yerleştirir.
// Hata gerçekten robotun yolunu değiştirmeli; değiştirmeyen hatalar elenir.
(function (root) {
    'use strict';
    const S = root.Sensin || (typeof require !== 'undefined' ? require('./sensin-motor.js') : null);

    const kopya = (x) => JSON.parse(JSON.stringify(x));
    const karistir = (d) => { const a = d.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

    const OP_DEGIS = { '<': ['<=', '>'], '<=': ['<', '>='], '>': ['>=', '<'], '>=': ['>', '<='], '==': ['!='], '!=': ['=='], '+': ['-'], '-': ['+'], 'and': ['or'], 'or': ['and'], '%': [], '//': [], '*': ['+'] };

    // Bir ifadenin tek noktadan değiştirilmiş halleri
    function ifadeTurevleri(e) {
        if (!e) return [];
        if (e.e === 'n') return [e.v + 1, e.v - 1].filter(v => v >= 0).map(v => ({ ...e, v }));
        if (e.e === 'op') {
            const out = (OP_DEGIS[e.o] || []).map(o => ({ ...e, o }));
            for (const t of ifadeTurevleri(e.b)) out.push({ ...e, b: t });
            for (const t of ifadeTurevleri(e.a)) out.push({ ...e, a: t });
            return out;
        }
        return [];
    }

    // Bir ifadenin (gövdesi aynı kalan) hatalı halleri
    function adaylar(s) {
        switch (s.t) {
            case 'mv': return ['R', 'L', 'U', 'D'].filter(d => d !== s.d).map(d => ({ ...s, d }));
            case 'rep': return ifadeTurevleri(s.n).filter(n => n.e !== 'n' || n.v >= 1).map(n => ({ ...s, n }));
            case 'for': return [...ifadeTurevleri(s.a).map(a => ({ ...s, a })), ...ifadeTurevleri(s.b).map(b => ({ ...s, b }))];
            case 'if': case 'while': return ifadeTurevleri(s.k).map(k => ({ ...s, k }));
            case 'set': return ifadeTurevleri(s.x).map(x => ({ ...s, x }));
            case 'call': return s.arg.flatMap((a, i) => ifadeTurevleri(a).map(t => ({ ...s, arg: s.arg.map((x, j) => j === i ? t : x) })));
            default: return [];
        }
    }

    function ifadeler(liste, out = []) {
        for (const s of liste) {
            out.push(s);
            for (const alt of [s.govde, s.evet, s.hayir]) if (alt) ifadeler(alt, out);
        }
        return out;
    }

    function degistir(liste, id, yeni) {
        return liste.map(s => {
            if (s.id === id) return yeni;
            const c = { ...s };
            for (const k of ['govde', 'evet', 'hayir']) if (c[k]) c[k] = degistir(c[k], id, yeni);
            return c;
        });
    }

    const ayniYol = (a, b) => a.length === b.length && a.every((h, i) => h.d === b[i].d);
    function dene(prog) {
        try { const h = S.calistir(prog); return h.length >= 1 && h.length <= 40 ? h : null; } catch (e) { return null; }
    }

    // Bir hata sorusu üret
    function hataUret(kademe, ilkBolum = 1) {
        for (let deneme = 0; deneme < 60; deneme++) {
            const no = ilkBolum + Math.floor(Math.random() * (kademe.bolumler.length - ilkBolum));
            const dogruProg = S.numarala(kademe.bolumler[no].p());
            const dogru = S.calistir(dogruProg);
            for (const s of karistir(ifadeler(dogruProg))) {
                const turevler = karistir(adaylar(s));
                const iyiler = [];
                for (const v of turevler) {
                    const h = dene(degistir(dogruProg, s.id, v));
                    if (h && !ayniYol(h, dogru) && !iyiler.some(x => ayniYol(x.h, h))) iyiler.push({ v, h });
                    if (iyiler.length === 2) break;
                }
                if (!iyiler.length) continue;
                const hatali = iyiler[0];
                const secenekler = [{ ifade: s, dogru: true }, { ifade: hatali.v, mevcut: true }];
                if (iyiler[1]) secenekler.push({ ifade: iyiler[1].v });
                return {
                    bolum: kademe.bolumler[no].ad,
                    program: degistir(dogruProg, s.id, hatali.v),
                    hedefId: s.id,
                    dogruHamle: dogru,
                    hataliHamle: hatali.h,
                    secenekler: karistir(secenekler)
                };
            }
        }
        throw new Error('Hata üretilemedi');
    }

    const api = { hataUret, adaylar, ifadeler, degistir };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.HataMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
