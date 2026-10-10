// Ayarlar ve ilerleme: hepsi bu tarayıcıda (localStorage) saklanır.
import { setNaming } from './theory.js';

const KEY = 'perde.v1';

const DEFAULTS = {
    settings: {
        system: 'letter',       // 'letter' (C D E) | 'solfege' (Do Re Mi)
        accidental: 'sharp',    // 'sharp' | 'flat'
        orientation: 'auto',    // 'auto' | 'horizontal' | 'vertical'
        lefty: false,
        frets: 15,
        tone: 'clean',          // 'clean' | 'drive'
        volume: 0.8
    },
    lessons: {},                // { lessonId: tamamlanma zamanı }
    quiz: { best: {}, pos: {}, notes: {} },
    changes: {},                // { "Am>C": en iyi geçiş sayısı }
    songs: [],                  // kullanıcının eklediği şarkılar
    days: []                    // çalışılan günler (YYYY-AA-GG)
};

function merge(base, extra) {
    if (!extra || typeof extra !== 'object' || Array.isArray(base)) return extra ?? base;
    const out = { ...base };
    for (const k of Object.keys(extra)) {
        out[k] = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])
            ? merge(base[k], extra[k]) : extra[k];
    }
    return out;
}

function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) return merge(structuredClone(DEFAULTS), JSON.parse(raw));
    } catch (e) { /* gizli pencere vb. */ }
    return structuredClone(DEFAULTS);
}

export const store = load();
export const settings = store.settings;
setNaming(settings);

let saveTimer = null;
export function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* yok say */ }
    }, 150);
}

const listeners = new Set();
export function onSettings(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function updateSettings(patch) {
    Object.assign(settings, patch);
    setNaming(settings);
    save();
    listeners.forEach(fn => fn(patch));
}

// ===== Çalışma günleri =====
const dayKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function markPracticed() {
    const k = dayKey();
    if (!store.days.includes(k)) {
        store.days.push(k);
        if (store.days.length > 500) store.days.splice(0, store.days.length - 500);
        save();
    }
}

/** Bugünden (ya da dünden) geriye kesintisiz çalışılan gün sayısı */
export function streak() {
    const set = new Set(store.days);
    const d = new Date();
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
}

export function practicedThisWeek() {
    const set = new Set(store.days);
    const d = new Date();
    const out = [];
    for (let i = 6; i >= 0; i--) {
        const x = new Date(d); x.setDate(d.getDate() - i);
        out.push({ key: dayKey(x), day: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][x.getDay()], name: x.toLocaleDateString('tr-TR', { weekday: 'long' }), done: set.has(dayKey(x)) });
    }
    return out;
}

// ===== Yedekleme =====
export function exportData() {
    return JSON.stringify({ app: 'perde', version: 1, data: store }, null, 1);
}

export function importData(text) {
    const parsed = JSON.parse(text);
    const data = parsed && parsed.app === 'perde' ? parsed.data : null;
    if (!data || typeof data !== 'object') throw new Error('Bu metin bir Perde yedeği değil.');
    const merged = merge(structuredClone(DEFAULTS), data);
    for (const k of Object.keys(store)) delete store[k];
    Object.assign(store, merged);
    Object.assign(settings, store.settings);
    store.settings = settings;
    setNaming(settings);
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* yok say */ }
    listeners.forEach(fn => fn({}));
}

// ===== Sayfalar arası niyet (ör. dersten alıştırmaya hazır ayarla geçiş) =====
let intent = null;
export function setIntent(x) { intent = x; }
export function takeIntent() { const x = intent; intent = null; return x; }
