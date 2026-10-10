// Akor kütüphanesi: açık akorlar, taşınabilir bare / power chord şekilleri
// ve listede olmayan akorlar için basılabilir şekil arayan bir bulucu.
// Şekiller kalından inceye yazılır: [6. tel, 5., 4., 3., 2., 1. tel], -1 = çalınmaz.
import { parseChord, chordTones, mod12, midiAt, TUNING, QUALITIES } from './theory.js';

const parse = str => [...str].map(c => c === 'x' ? -1 : parseInt(c, 10));

// [ad, perdeler, parmaklar, grup]
const OPEN = [
    ['C', 'x32010', '032010', 'maj'],
    ['D', 'xx0232', '000132', 'maj'],
    ['E', '022100', '023100', 'maj'],
    ['G', '320003', '210003', 'maj'],
    ['A', 'x02220', '001230', 'maj'],
    ['F', 'xx3211', '003211', 'maj'],
    ['Am', 'x02210', '002310', 'min'],
    ['Dm', 'xx0231', '000231', 'min'],
    ['Em', '022000', '023000', 'min'],
    ['Bm', 'x24432', '013421', 'min'],
    ['C7', 'x32310', '032410', 'sev'],
    ['D7', 'xx0212', '000213', 'sev'],
    ['E7', '020100', '020100', 'sev'],
    ['G7', '320001', '320001', 'sev'],
    ['A7', 'x02020', '002030', 'sev'],
    ['B7', 'x21202', '021304', 'sev'],
    ['Am7', 'x02010', '002010', 'sev'],
    ['Em7', '022030', '012030', 'sev'],
    ['Dm7', 'xx0211', '000211', 'sev'],
    ['Cmaj7', 'x32000', '032000', 'sev'],
    ['Fmaj7', 'xx3210', '003210', 'sev'],
    ['Amaj7', 'x02120', '002130', 'sev'],
    ['Dmaj7', 'xx0222', '000123', 'sev'],
    ['Asus2', 'x02200', '001200', 'sus'],
    ['Asus4', 'x02230', '001230', 'sus'],
    ['Dsus2', 'xx0230', '000130', 'sus'],
    ['Dsus4', 'xx0233', '000134', 'sus'],
    ['Esus4', '022200', '023400', 'sus'],
    ['Cadd9', 'x32030', '021030', 'sus'],
    ['E5', '022xxx', '012000', 'pow'],
    ['A5', 'x022xx', '001200', 'pow'],
    ['D5', 'xx023x', '000130', 'pow']
];

export const OPEN_GROUPS = [
    ['maj', 'Majör'], ['min', 'Minör'], ['sev', '7\'li akorlar'], ['sus', 'Sus ve add'], ['pow', 'Açık power chord']
];

/** Parmak dizisinden bare tespiti: 1. parmak aynı perdede birden çok telde */
function detectBarre(frets, fingers) {
    const idx = [];
    fingers.forEach((fi, i) => { if (fi === 1 && frets[i] > 0) idx.push(i); });
    if (idx.length < 2) return null;
    const fret = frets[idx[0]];
    if (!idx.every(i => frets[i] === fret)) return null;
    return { fret, from: idx[0], to: idx[idx.length - 1] };
}

export function makeVoicing(name, frets, fingers, extra = {}) {
    const v = { name, frets, fingers, ...extra };
    if (v.barre === undefined) v.barre = detectBarre(frets, fingers);
    return v;
}

export const OPEN_CHORDS = OPEN.map(([name, f, fi, group]) =>
    makeVoicing(name, parse(f), parse(fi), { group, kind: 'open' }));

// ===== Taşınabilir şekiller (kök perdesi r'ye eklenir) =====
// rel: kök perdesine göre, null = çalınmaz
export const E_SHAPES = {
    '':     { rel: [0, 2, 2, 1, 0, 0], fing: [1, 3, 4, 2, 1, 1] },
    'm':    { rel: [0, 2, 2, 0, 0, 0], fing: [1, 3, 4, 1, 1, 1] },
    '7':    { rel: [0, 2, 0, 1, 0, 0], fing: [1, 3, 1, 2, 1, 1] },
    'm7':   { rel: [0, 2, 0, 0, 0, 0], fing: [1, 3, 1, 1, 1, 1] },
    'maj7': { rel: [0, 2, 1, 1, 0, 0], fing: [1, 4, 2, 3, 1, 1] },
    'sus4': { rel: [0, 2, 2, 2, 0, 0], fing: [1, 2, 3, 4, 1, 1] },
    '5':    { rel: [0, 2, 2, null, null, null], fing: [1, 3, 4, 0, 0, 0], noBarre: true }
};
export const A_SHAPES = {
    '':     { rel: [null, 0, 2, 2, 2, 0], fing: [0, 1, 2, 3, 4, 1] },
    'm':    { rel: [null, 0, 2, 2, 1, 0], fing: [0, 1, 3, 4, 2, 1] },
    '7':    { rel: [null, 0, 2, 0, 2, 0], fing: [0, 1, 3, 1, 4, 1] },
    'm7':   { rel: [null, 0, 2, 0, 1, 0], fing: [0, 1, 3, 1, 2, 1] },
    'maj7': { rel: [null, 0, 2, 1, 2, 0], fing: [0, 1, 3, 2, 4, 1] },
    'sus4': { rel: [null, 0, 2, 2, 3, 0], fing: [0, 1, 2, 3, 4, 1] },
    'sus2': { rel: [null, 0, 2, 2, 0, 0], fing: [0, 1, 3, 4, 1, 1] },
    '5':    { rel: [null, 0, 2, 2, null, null], fing: [0, 1, 3, 4, 0, 0], noBarre: true }
};

export const SHAPE_QUALITIES = [
    ['', 'Majör'], ['m', 'Minör'], ['7', '7'], ['m7', 'm7'], ['maj7', 'maj7'], ['sus4', 'sus4']
];

/** Kök notasına göre E formu (kök 6. telde) ya da A formu (kök 5. telde) */
export function shapeVoicing(form, rootPc, qual, name) {
    const shapes = form === 'E' ? E_SHAPES : A_SHAPES;
    const sh = shapes[qual];
    if (!sh) return null;
    const open = form === 'E' ? 4 : 9;
    let r = mod12(rootPc - open);
    if (r === 0) r = 12;
    const frets = sh.rel.map(x => x === null ? -1 : x + r);
    const fingers = sh.fing.slice();
    let barre = null;
    if (!sh.noBarre) {
        const from = form === 'E' ? 0 : 1;
        barre = { fret: r, from, to: 5 };
    }
    return makeVoicing(name, frets, fingers, { barre, kind: form === 'E' ? 'barE' : 'barA', rootFret: r, form });
}

// ===== Genel akor bulucu =====
/** Basılabilir şekilleri arar: kök (ya da bas) en kalın sesli telde, aralıksız teller, en fazla 4 parmak */
export function findVoicings(parsed, max = 4) {
    const tones = chordTones(parsed);
    const toneSet = new Set(tones);
    const required = new Set(tones);
    if (tones.length >= 4) required.delete(mod12(parsed.root + 7)); // beşli atlanabilir
    const bass = parsed.bass ?? parsed.root;
    const found = [];
    const seen = new Set();

    for (let w = 0; w <= 11; w++) {
        const lo = Math.max(1, w), hi = w + 3;
        const opts = [];
        for (let i = 0; i < 6; i++) {
            const s = 6 - i;
            const o = [-1];
            if (toneSet.has(mod12(TUNING[s - 1]))) o.push(0);
            for (let f = lo; f <= hi; f++) if (toneSet.has(mod12(TUNING[s - 1] + f))) o.push(f);
            opts.push(o);
        }
        const cur = new Array(6);
        const walk = i => {
            if (i === 6) { consider(cur.slice(), w); return; }
            for (const f of opts[i]) { cur[i] = f; walk(i + 1); }
        };
        walk(0);
    }

    function consider(frets, w) {
        const sounding = frets.map((f, i) => f >= 0 ? i : -1).filter(i => i >= 0);
        if (sounding.length < Math.min(4, tones.length + 1)) return;
        const first = sounding[0], last = sounding[sounding.length - 1];
        if (last - first + 1 !== sounding.length) return;          // arada susturulmuş tel yok
        if (last !== 5) return;                                      // ince e tel çalsın
        if (mod12(midiAt(6 - first, frets[first])) !== bass) return;
        const pcs = new Set(sounding.map(i => mod12(midiAt(6 - i, frets[i]))));
        for (const t of required) if (!pcs.has(t)) return;
        const fretted = sounding.filter(i => frets[i] > 0);
        if (fretted.length) {
            const fs = fretted.map(i => frets[i]);
            if (Math.max(...fs) - Math.min(...fs) > 3) return;
        }
        const fingers = assignFingers(frets);
        if (!fingers) return;
        const key = frets.join(',');
        if (seen.has(key)) return;
        seen.add(key);
        const minF = fretted.length ? Math.min(...fretted.map(i => frets[i])) : 0;
        const score = sounding.length * 3 - minF * 0.8 - (fretted.length > 3 ? 1 : 0) + (minF <= 3 && frets.includes(0) ? 2 : 0);
        found.push({ frets, fingers: fingers.fingers, barre: fingers.barre, score });
    }

    found.sort((a, b) => b.score - a.score);
    return found.slice(0, max).map(v => makeVoicing(parsed.raw, v.frets, v.fingers, { barre: v.barre, kind: 'found' }));
}

/** Basit parmak ataması; 4 parmağı aşarsa null */
function assignFingers(frets) {
    const fretted = frets.map((f, i) => ({ f, i })).filter(x => x.f > 0);
    const fingers = new Array(6).fill(0);
    if (!fretted.length) return { fingers, barre: null };
    const min = Math.min(...fretted.map(x => x.f));
    const atMin = fretted.filter(x => x.f === min);
    let barre = null;
    let next = 1;
    let rest = fretted;
    if (atMin.length >= 2) {
        const a = atMin[0].i, b = atMin[atMin.length - 1].i;
        const ok = frets.slice(a, b + 1).every(f => f >= min);
        if (ok) {
            barre = { fret: min, from: a, to: b };
            atMin.forEach(x => { fingers[x.i] = 1; });
            rest = fretted.filter(x => x.f !== min);
            next = 2;
        }
    }
    rest.sort((x, y) => x.f - y.f || x.i - y.i);
    for (const x of rest) {
        const fi = Math.max(next, x.f - min + 1);
        if (fi > 4) return null;
        fingers[x.i] = fi;
        next = fi + 1;
    }
    return { fingers, barre };
}

/** Bir akor adı için şekiller: önce açık akor, sonra bare formları, sonra bulucu */
export function voicingsFor(sym) {
    const c = parseChord(sym);
    if (!c || c.qual === null) return [];
    const out = [];
    const keys = new Set();
    const push = v => {
        if (!v) return;
        const k = v.frets.join(',');
        if (keys.has(k)) return;
        keys.add(k);
        out.push({ ...v, name: sym });
    };
    for (const v of OPEN_CHORDS) {
        const o = parseChord(v.name);
        if (o.root === c.root && o.qual === c.qual && (c.bass === null || c.bass === c.root)) push(v);
    }
    if (c.bass === null || c.bass === c.root) {
        const e = shapeVoicing('E', c.root, c.qual, sym);
        const a = shapeVoicing('A', c.root, c.qual, sym);
        [e, a].filter(Boolean).sort((x, y) => x.rootFret - y.rootFret).forEach(push);
    }
    if (out.length < 2) findVoicings(c).forEach(push);
    return out;
}

/** Şeklin sesli notaları: [{s, f}] */
export function voicingNotes(v) {
    return v.frets.map((f, i) => ({ s: 6 - i, f })).filter(n => n.f >= 0);
}

export function chordQualityName(sym) {
    const c = parseChord(sym);
    return c && c.qual !== null ? QUALITIES[c.qual].name : '';
}
