// Dizilerin klavyedeki yerleşimi: tüm klavye, pozisyon (her perdeye bir parmak)
// ve kalıplar (pentatonik kutular / tel başına üç nota).
import { TUNING, mod12, scaleById, degreeName, midiAt } from './theory.js';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
export const roman = n => ROMAN[n] || String(n);

/** Kalıp sayısı: pentatonik ve blues 5 kutu, yedi notalı diziler 7 kalıp */
export function patternCount(scaleId) {
    const sc = scaleById(scaleId);
    return sc.steps.length <= 6 ? 5 : 7;
}

function mark(s, f, root, steps, extra = {}) {
    const pc = mod12(TUNING[s - 1] + f);
    const semis = mod12(pc - root);
    return { s, f, pc, deg: degreeName(semis), isRoot: semis === 0, inScale: steps.includes(semis), ...extra };
}

/**
 * @param {{root:number, scale:string, view:'all'|'position'|'pattern', index?:number, frets?:number}} o
 * @returns {Array<{s,f,pc,deg,isRoot,finger?,kind?}>}
 */
export function scalePositions(o) {
    const sc = scaleById(o.scale);
    const steps = sc.steps;
    const root = mod12(o.root);
    const maxFret = o.frets ?? 24;
    const inScale = (s, f) => steps.includes(mod12(TUNING[s - 1] + f - root));

    if (o.view === 'position') return positionWindow(o.index || 1, root, steps, inScale);
    if (o.view === 'pattern') return pattern(o.index || 1, root, sc);

    const out = [];
    for (let s = 1; s <= 6; s++) for (let f = 0; f <= maxFret; f++) if (inScale(s, f)) out.push(mark(s, f, root, steps));
    return out;
}

/** N. pozisyon: işaret parmağı N. perdede; N..N+3 (I. pozisyonda boş teller de dahil) + gerekiyorsa esneme */
function positionWindow(N, root, steps, inScale) {
    const out = [];
    const lo = N, hi = N + 3;
    for (let s = 6; s >= 1; s--) {
        const frets = [];
        if (N === 1) frets.push(0);
        for (let f = lo; f <= hi; f++) frets.push(f);
        for (const f of frets) {
            if (!inScale(s, f)) continue;
            out.push(mark(s, f, root, steps, { finger: f === 0 ? 0 : f - N + 1 }));
        }
    }
    // Aynı perde yüksekliğini iki kez gösterme: kalın teldeki kalsın (I. pozisyonda boş tel tercih edilir)
    const seen = new Map();
    const unique = [];
    for (const m of out) {
        const p = midiAt(m.s, m.f);
        if (seen.has(p)) {
            const prev = seen.get(p);
            if (m.f === 0 && prev.f !== 0) { unique[unique.indexOf(prev)] = m; seen.set(p, m); }
            continue;
        }
        seen.set(p, m);
        unique.push(m);
    }
    // Aradaki eksik dizi notalarını esneme ile tamamla
    const pitches = unique.map(m => midiAt(m.s, m.f));
    const low = Math.min(...pitches), high = Math.max(...pitches);
    const have = new Set(pitches);
    for (let p = low; p <= high; p++) {
        if (have.has(p) || !steps.includes(mod12(p - root))) continue;
        let placed = null;
        for (let s = 6; s >= 1 && !placed; s--) if (p - TUNING[s - 1] === hi + 1) placed = { s, f: hi + 1, finger: 4 };
        for (let s = 1; s <= 6 && !placed; s++) if (p - TUNING[s - 1] === lo - 1 && lo - 1 >= 0) placed = { s, f: lo - 1, finger: 1 };
        if (placed) {
            unique.push(mark(placed.s, placed.f, root, steps, { finger: placed.finger, kind: 'stretch' }));
            have.add(p);
        }
    }
    return unique;
}

/** Kalıp: dizinin i. derecesinden başlayıp her tele n nota (pentatonik 2, yedili 3) */
function pattern(index, root, sc) {
    const base = sc.base ? scaleById(sc.base) : sc;
    const steps = base.steps;
    const n = steps.length;
    const perString = n <= 6 ? 2 : 3;
    const startDeg = (index - 1) % n;
    let midi = TUNING[5] + mod12(root + steps[startDeg] - TUNING[5]);
    let deg = startDeg;
    const seq = [];
    for (let i = 0; i < 6 * perString; i++) {
        const s = 6 - Math.floor(i / perString);
        seq.push({ midi, s });
        const next = (deg + 1) % n;
        midi += mod12(steps[next] - steps[deg]) || 12;
        deg = next;
    }
    let notes = seq.map(x => ({ s: x.s, f: x.midi - TUNING[x.s - 1] }));
    // Blues: 4. ile 5. derece arasına ♭5
    if (sc.id === 'blues') {
        const extra = [];
        for (const x of notes) {
            if (mod12(TUNING[x.s - 1] + x.f - root) === 5) extra.push({ s: x.s, f: x.f + 1, blue: true });
        }
        notes = notes.concat(extra);
    }
    const minF = Math.min(...notes.map(x => x.f));
    if (minF >= 12) notes = notes.map(x => ({ ...x, f: x.f - 12 }));
    if (Math.min(...notes.map(x => x.f)) < 0) notes = notes.map(x => ({ ...x, f: x.f + 12 }));
    return notes.map(x => mark(x.s, x.f, root, sc.steps, x.blue ? { kind: 'blue' } : {}));
}

/** Bir işaret listesini perde yüksekliğine göre sırala (çalmak için) */
export function ascendingOrder(markers) {
    const sorted = [...markers].sort((a, b) => midiAt(a.s, a.f) - midiAt(b.s, b.f) || b.s - a.s);
    return sorted.filter((m, i) => i === 0 || midiAt(m.s, m.f) !== midiAt(sorted[i - 1].s, sorted[i - 1].f));
}

/** Kalıbın perde aralığı */
export function fretSpan(markers) {
    const fs = markers.map(m => m.f);
    return [Math.min(...fs), Math.max(...fs)];
}
