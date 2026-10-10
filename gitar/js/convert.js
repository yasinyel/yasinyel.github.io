// Yapıştırılan metni Perde biçimine çevirir:
//  • düz metin tab (e|---0---|) → tab.js biçimi
//  • akor satırı + söz satırı → ChordPro ([Am]söz)
import { parseChord } from './theory.js';

const TAB_LINE = /^\s*([eBGDAEbgdaE])?\s*[|:]?\s*[-–0-9|hpbr\/\\~x().*<> ]{4,}\s*$/;
const isTabLine = l => TAB_LINE.test(l) && /-{2,}/.test(l);

/** Metinde tab var mı? (art arda 6 tab satırı) */
export function looksLikeTab(text) {
    const lines = String(text).split(/\r?\n/);
    let run = 0;
    for (const l of lines) { run = isTabLine(l) ? run + 1 : 0; if (run >= 6) return true; }
    return false;
}

/** Düz metin tabı çevir. Süreler sütun aralığından tahmin edilir (en sık aralık = sekizlik). */
export function asciiTab(text) {
    const lines = String(text).split(/\r?\n/);
    const blocks = [];
    for (let i = 0; i + 5 < lines.length; i++) {
        const six = lines.slice(i, i + 6);
        if (six.every(isTabLine)) { blocks.push(six); i += 5; }
    }
    if (!blocks.length) return { tab: '', count: 0 };

    const measures = [];
    for (const block of blocks) {
        // Ön ekleri (e| gibi) at: ilk '|' ya da ilk '-' sütunundan başla
        const body = block.map(l => {
            const m = /^\s*[a-zA-Z]?\s*[|:]?/.exec(l);
            return l.slice(m ? m[0].length : 0);
        });
        const width = Math.max(...body.map(l => l.length));
        let cur = [];
        let lastCol = null;
        const flush = () => { if (cur.length) measures.push(cur); cur = []; lastCol = null; };
        for (let c = 0; c < width; c++) {
            if (body.every(l => l[c] === '|' || l[c] === undefined) && body.some(l => l[c] === '|')) { flush(); continue; }
            const notes = [];
            body.forEach((l, k) => {
                const ch = l[c];
                if (!/\d/.test(ch || '')) return;
                if (/\d/.test(l[c - 1] || '')) return;          // iki basamaklı sayının ikinci hanesi
                const two = /\d/.test(l[c + 1] || '') && +(ch + l[c + 1]) <= 24;
                notes.push({ s: k + 1, f: two ? +(ch + l[c + 1]) : +ch });
            });
            if (notes.length) {
                if (lastCol !== null) cur[cur.length - 1].gap = c - lastCol;
                cur.push({ notes, col: c, gap: null });
                lastCol = c;
            }
        }
        flush();
    }
    // En sık aralık sekizlik kabul edilir
    const gaps = measures.flat().map(e => e.gap).filter(Boolean);
    const freq = {};
    gaps.forEach(g => { freq[g] = (freq[g] || 0) + 1; });
    const unit = +Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 2;
    let prevDur = null;
    const txt = measures.map(m => m.map(e => {
        const raw = e.gap ? e.gap / unit * 0.5 : 0.5;
        const dur = Math.min(2, Math.max(0.25, Math.round(raw * 4) / 4));
        const notes = e.notes.map(n => `${n.s}.${n.f}`).join('+');
        const tok = dur !== prevDur ? `${notes}:${dur}` : notes;
        prevDur = dur;
        return tok;
    }).join(' ')).join(' |\n');
    return { tab: txt, count: measures.flat().length };
}

const isChordToken = t => !!parseChord(t.replace(/[()]/g, '')) && parseChord(t.replace(/[()]/g, '')).qual !== null;
const isChordLine = l => {
    const toks = l.trim().split(/\s+/).filter(Boolean).filter(t => t !== '|' && t !== '-' && !/^x\d+$/i.test(t));
    return toks.length > 0 && toks.every(isChordToken);
};

/** Akor-üstte, söz-altta metni ChordPro'ya çevir */
export function chordsOverLyrics(text) {
    const lines = String(text).replace(/\t/g, '    ').split(/\r?\n/);
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].replace(/\s+$/, '');
        const section = /^\s*\[([^\]]+)\]\s*$/.exec(l);
        if (section && !isChordToken(section[1])) { out.push(`{c: ${section[1]}}`); continue; }
        if (isChordLine(l)) {
            const next = lines[i + 1] ?? '';
            const chords = [];
            const re = /\S+/g;
            let m;
            while ((m = re.exec(l))) if (isChordToken(m[0])) chords.push({ col: m.index, name: m[0].replace(/[()]/g, '') });
            if (next.trim() && !isChordLine(next) && !isTabLine(next) && !/^\s*\[[^\]]+\]\s*$/.test(next)) {
                let lyric = next.replace(/\s+$/, '');
                for (const c of [...chords].reverse()) {
                    let col = c.col;
                    if (lyric.length < col) lyric = lyric.padEnd(col, ' ');
                    // Akor bir boşluğa denk gelirse sonraki hecenin başına kaydır
                    while (lyric[col] === ' ' && col < lyric.length - 1 && lyric[col + 1] !== '[') col++;
                    lyric = lyric.slice(0, col) + `[${c.name}]` + lyric.slice(col);
                }
                out.push(lyric.replace(/ {2,}(?=\[)/g, ' '));
                i++;
            } else {
                out.push(chords.map(c => `[${c.name}]`).join(' '));
            }
            continue;
        }
        out.push(l);
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Yapıştırılanı tanı ve çevir */
export function convertPaste(text) {
    if (looksLikeTab(text)) {
        const r = asciiTab(text);
        return { kind: 'tab', text: r.tab, info: `${r.count} nota olayı bulundu. Süreler tahmini; gerekirse düzelt.` };
    }
    const body = chordsOverLyrics(text);
    const n = (body.match(/\[[^\]]+\]/g) || []).length;
    return { kind: 'chords', text: body, info: n ? `${n} akor yerleştirildi.` : 'Akor satırı bulunamadı; metin olduğu gibi alındı.' };
}
