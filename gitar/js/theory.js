// Müzik teorisi çekirdeği: nota adları, akort, diziler, akor formülleri.
// Teller gitar geleneğine göre numaralanır: 1 = ince e, 6 = kalın E.

export const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const SOLFEGE = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const NATURALS = [0, 2, 4, 5, 7, 9, 11];
export const TUNING = [64, 59, 55, 50, 45, 40]; // MIDI: 1. tel → 6. tel
export const STRING_LETTER = ['e', 'B', 'G', 'D', 'A', 'E'];
export const STRINGS = [1, 2, 3, 4, 5, 6];

export const mod12 = n => ((n % 12) + 12) % 12;
export const midiAt = (s, f) => TUNING[s - 1] + f;
export const pcAt = (s, f) => mod12(midiAt(s, f));
export const isNatural = pc => NATURALS.includes(mod12(pc));
export const freqOf = m => 440 * Math.pow(2, (m - 69) / 12);
export const octaveOf = m => Math.floor(m / 12) - 1;
export const isBlackKey = pc => !isNatural(pc);

// Ayarlardan gelen adlandırma tercihi (state.js günceller)
const naming = { system: 'letter', accidental: 'sharp' };
export function setNaming(n) { Object.assign(naming, n); }
export function getNaming() { return { ...naming }; }

const toSolfege = name => SOLFEGE[name[0]] + name.slice(1);

/** Harf adı (C♯ / D♭) — akor sembolleri hep harfle yazılır */
export function letterName(pc, pref) {
    return ((pref || naming.accidental) === 'flat' ? FLAT : SHARP)[mod12(pc)];
}

/** Ayara göre nota adı: harf ya da solfej */
export function noteName(pc, pref) {
    const name = letterName(pc, pref);
    return naming.system === 'solfege' ? toSolfege(name) : name;
}

/** Her iki sistemi birlikte: "A · La" */
export function bothNames(pc, pref) {
    const name = letterName(pc, pref);
    return `${name} · ${toSolfege(name)}`;
}

export const solfegeOf = (pc, pref) => toSolfege(letterName(pc, pref));

/** Bilimsel perde adı: A2, E4 … */
export function pitchName(m, pref) {
    return noteName(mod12(m), pref) + octaveOf(m);
}

// ===== Tonlara göre diyez/bemol seçimi =====
const FLAT_MAJOR = new Set([5, 10, 3, 8, 1]); // F B♭ E♭ A♭ D♭
const FLAT_MINOR = new Set([2, 7, 0, 5, 10]); // D G C F B♭ minör
/** Bir tonda hangi işaretin kullanılacağı */
export function keyPref(rootPc, type = 'major') {
    rootPc = mod12(rootPc);
    // F♯/G♭ majör ve D♯/E♭ minör iki türlü de yazılır: kullanıcının tercihi
    if ((type === 'minor' ? 3 : 6) === rootPc) return naming.accidental;
    return (type === 'minor' ? FLAT_MINOR : FLAT_MAJOR).has(rootPc) ? 'flat' : 'sharp';
}

// ===== Diziler (gamlar) =====
export const SCALES = [
    { id: 'major', name: 'Majör', alt: 'İyonyen', steps: [0, 2, 4, 5, 7, 9, 11], type: 'major' },
    { id: 'minor', name: 'Doğal minör', alt: 'Eolyen', steps: [0, 2, 3, 5, 7, 8, 10], type: 'minor' },
    { id: 'minPent', name: 'Minör pentatonik', alt: 'Rock ve blues sololarının temeli', steps: [0, 3, 5, 7, 10], type: 'minor' },
    { id: 'majPent', name: 'Majör pentatonik', alt: 'Country, pop, sakin melodiler', steps: [0, 2, 4, 7, 9], type: 'major' },
    { id: 'blues', name: 'Blues', alt: 'Minör pentatonik + ♭5', steps: [0, 3, 5, 6, 7, 10], type: 'minor', base: 'minPent' },
    { id: 'dorian', name: 'Doryen', alt: 'Minör, 6. derece büyük', steps: [0, 2, 3, 5, 7, 9, 10], type: 'minor' },
    { id: 'mixo', name: 'Miksolidyen', alt: 'Majör, 7. derece küçük', steps: [0, 2, 4, 5, 7, 9, 10], type: 'major' },
    { id: 'harmMinor', name: 'Armonik minör', alt: 'Doğu renkli minör', steps: [0, 2, 3, 5, 7, 8, 11], type: 'minor' }
];
export const scaleById = id => SCALES.find(s => s.id === id) || SCALES[0];

const DEGREE = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
export const degreeName = semis => DEGREE[mod12(semis)];

/** Adım kalıbı: T (tam), Y (yarım), 1½ */
export function stepPattern(steps) {
    const out = [];
    for (let i = 0; i < steps.length; i++) {
        const d = (i + 1 < steps.length ? steps[i + 1] : 12) - steps[i];
        out.push(d === 1 ? 'Y' : d === 2 ? 'T' : d === 3 ? '1½' : String(d));
    }
    return out;
}

// ===== Akorlar =====
export const QUALITIES = {
    '':      { name: 'majör', iv: [0, 4, 7] },
    'm':     { name: 'minör', iv: [0, 3, 7] },
    '7':     { name: 'dominant 7', iv: [0, 4, 7, 10] },
    'maj7':  { name: 'majör 7', iv: [0, 4, 7, 11] },
    'm7':    { name: 'minör 7', iv: [0, 3, 7, 10] },
    '6':     { name: 'majör 6', iv: [0, 4, 7, 9] },
    'm6':    { name: 'minör 6', iv: [0, 3, 7, 9] },
    'sus2':  { name: 'sus2', iv: [0, 2, 7] },
    'sus4':  { name: 'sus4', iv: [0, 5, 7] },
    '7sus4': { name: '7sus4', iv: [0, 5, 7, 10] },
    '5':     { name: 'power chord', iv: [0, 7] },
    'add9':  { name: 'add9', iv: [0, 4, 7, 2] },
    '9':     { name: 'dominant 9', iv: [0, 4, 7, 10, 2] },
    'm9':    { name: 'minör 9', iv: [0, 3, 7, 10, 2] },
    'dim':   { name: 'eksik', iv: [0, 3, 6] },
    'dim7':  { name: 'eksik 7', iv: [0, 3, 6, 9] },
    'm7b5':  { name: 'yarım eksik', iv: [0, 3, 6, 10] },
    'aug':   { name: 'artık', iv: [0, 4, 8] }
};

const QUALITY_ALIAS = {
    'M': '', 'maj': '', 'major': '',
    'min': 'm', 'mi': 'm', '-': 'm', 'minor': 'm',
    'M7': 'maj7', 'Maj7': 'maj7', 'ma7': 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7',
    'min7': 'm7', 'mi7': 'm7', '-7': 'm7',
    'sus': 'sus4', '2': 'sus2', 'add2': 'add9', '7sus': '7sus4',
    '°': 'dim', 'o': 'dim', '°7': 'dim7', 'o7': 'dim7',
    'ø': 'm7b5', 'ø7': 'm7b5', 'm7♭5': 'm7b5', 'min7b5': 'm7b5',
    '+': 'aug', '(5)': '5', 'min6': 'm6', 'min9': 'm9'
};

const accVal = a => (a === '#' || a === '♯') ? 1 : (a === 'b' || a === '♭') ? -1 : 0;

/** "F#m7", "Bb", "C/G", "Asus4" → { root, qual, bass, raw, flat } */
export function parseChord(sym) {
    const m = /^([A-G])([#b♯♭]?)([^/\s]*)(?:\/([A-G])([#b♯♭]?))?$/.exec(String(sym).trim());
    if (!m) return null;
    let q = m[3];
    if (!(q in QUALITIES)) q = QUALITY_ALIAS[q] ?? null;
    return {
        root: mod12(LETTER_PC[m[1]] + accVal(m[2])),
        qual: q,
        qualText: m[3],
        bass: m[4] ? mod12(LETTER_PC[m[4]] + accVal(m[5])) : null,
        flat: m[2] === 'b' || m[2] === '♭' || m[5] === 'b' || m[5] === '♭',
        raw: sym
    };
}

/** Akor tonları (perde sınıfları), kök önce */
export function chordTones(parsed) {
    const iv = (QUALITIES[parsed.qual] || QUALITIES['']).iv;
    return iv.map(i => mod12(parsed.root + i));
}

/** Akor adını yarım ses kadar kaydır */
export function transposeChord(sym, semis, pref) {
    const c = parseChord(sym);
    if (!c) return sym;
    const p = pref || (c.flat ? 'flat' : 'sharp');
    const ascii = n => letterName(n, p).replace('♯', '#').replace('♭', 'b');
    let out = ascii(c.root + semis) + c.qualText;
    if (c.bass !== null) out += '/' + ascii(c.bass + semis);
    return out;
}

/** Akorun notalarını yazarken diyez mi bemol mü: Gm7 → B♭, E → G♯ */
export function chordPref(sym) {
    const c = parseChord(sym);
    if (!c) return naming.accidental;
    if (c.flat) return 'flat';
    const minor = /^m(?!aj)/.test(c.qual || '') || c.qual === 'dim' || c.qual === 'dim7';
    return keyPref(c.root, minor ? 'minor' : 'major');
}

/** Akor sembolünü ekranda göstermek için (# → ♯, b → ♭) */
export function prettyChord(sym) {
    return String(sym).replace(/^([A-G])#/, '$1♯').replace(/^([A-G])b/, '$1♭')
        .replace(/\/([A-G])#/, '/$1♯').replace(/\/([A-G])b/, '/$1♭');
}

/** "Am" → "La minör" */
export function chordLongName(sym) {
    const c = parseChord(sym);
    if (!c || c.qual === null) return '';
    const pref = c.flat ? 'flat' : 'sharp';
    let s = `${solfegeOf(c.root, pref)} ${QUALITIES[c.qual].name}`;
    if (c.bass !== null) s += `, basta ${solfegeOf(c.bass, pref)}`;
    return s;
}

/** Bir tonun adı, ör. kök 9 + minör → "A minör" */
export function keyName(rootPc, type) {
    const pref = keyPref(rootPc, type);
    return `${noteName(rootPc, pref)} ${type === 'minor' ? 'minör' : 'majör'}`;
}

/** Klavyedeki tüm (tel, perde) çiftleri */
export function eachPosition(maxFret, fn, minFret = 0) {
    for (const s of STRINGS) for (let f = minFret; f <= maxFret; f++) fn(s, f);
}
