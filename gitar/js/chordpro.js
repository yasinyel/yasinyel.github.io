// Akorlu şarkı metni (ChordPro'nun sade bir alt kümesi)
//
//   {title: Şarkı adı}   {artist: Sanatçı}   {key: G}   {tempo: 90}   {capo: 2}
//   {c: Nakarat}         → bölüm başlığı
//   {soc} … {eoc}        → nakarat bloğu
//   A[G]mazing [G7]grace → akor, hecenin hemen üstünde
import { transposeChord, prettyChord, parseChord } from './theory.js';
import { esc } from './ui.js';

export function parseChordPro(text) {
    const meta = {};
    const lines = [];
    let chorus = false;
    for (const raw of String(text).split(/\r?\n/)) {
        const line = raw.replace(/\s+$/, '');
        const d = /^\{\s*([\w_]+)\s*(?::\s*(.*?))?\s*\}$/.exec(line.trim());
        if (d) {
            const k = d[1].toLowerCase(), v = d[2] ?? '';
            if (k === 'title' || k === 't') meta.title = v;
            else if (k === 'artist' || k === 'subtitle' || k === 'st') meta.artist = v;
            else if (k === 'key' || k === 'k') meta.key = v;
            else if (k === 'tempo') meta.tempo = parseInt(v, 10) || undefined;
            else if (k === 'time') meta.time = v;
            else if (k === 'capo') meta.capo = parseInt(v, 10) || 0;
            else if (k === 'c' || k === 'comment' || k === 'ci') lines.push({ type: 'section', text: v });
            else if (k === 'soc' || k === 'start_of_chorus') { chorus = true; lines.push({ type: 'section', text: v || 'Nakarat', chorus: true }); }
            else if (k === 'eoc' || k === 'end_of_chorus') chorus = false;
            continue;
        }
        if (!line.trim()) { lines.push({ type: 'empty' }); continue; }
        const parts = [];
        const re = /\[([^\]]*)\]/g;
        let last = 0, m, chord = null;
        while ((m = re.exec(line))) {
            if (m.index > last || chord !== null) parts.push({ chord, text: line.slice(last, m.index) });
            chord = m[1].trim();
            last = re.lastIndex;
        }
        parts.push({ chord, text: line.slice(last) });
        const cleaned = parts.filter(p => p.chord !== null || p.text !== '');
        const chordOnly = cleaned.every(p => !p.text.trim());
        lines.push({ type: 'lyric', parts: cleaned, chordOnly, chorus });
    }
    return { meta, lines };
}

/** Şarkıda geçen akorlar, ilk görünme sırasıyla */
export function chordsIn(parsed) {
    const seen = [];
    for (const l of parsed.lines) {
        if (l.type !== 'lyric') continue;
        for (const p of l.parts) if (p.chord && parseChord(p.chord) && !seen.includes(p.chord)) seen.push(p.chord);
    }
    return seen;
}

/** HTML üret. semis: transpoze, pref: 'sharp' | 'flat' */
export function renderChordPro(parsed, semis = 0, pref) {
    const tr = c => (semis && parseChord(c) ? transposeChord(c, semis, pref) : c);
    const chordTag = c => {
        const t = tr(c);
        return parseChord(c)
            ? `<button type="button" class="cp-chord" data-chord="${esc(t)}">${esc(prettyChord(t))}</button>`
            : `<span class="cp-chord is-plain">${esc(c)}</span>`;
    };
    let html = '';
    let inChorus = false;
    for (const l of parsed.lines) {
        const wantChorus = l.type === 'lyric' && l.chorus;
        if (wantChorus !== inChorus && l.type !== 'empty') {
            html += wantChorus ? '<div class="cp-chorus">' : '</div>';
            inChorus = wantChorus;
        }
        if (l.type === 'empty') { html += '<div class="cp-gap"></div>'; continue; }
        if (l.type === 'section') {
            if (l.chorus && !inChorus) { html += '<div class="cp-chorus">'; inChorus = true; }
            html += `<div class="cp-section">${esc(l.text)}</div>`;
            continue;
        }
        if (l.chordOnly) {
            html += `<div class="cp-line cp-only">${l.parts.map(p => p.chord ? chordTag(p.chord) : '').join('')}</div>`;
            continue;
        }
        // Heceleri kelimelere grupla: kelime ortasında satır kırılmasın
        const tokens = [];
        for (const p of l.parts) {
            const pieces = p.text.split(/(?<=\s)/);
            pieces.forEach((txt, i) => tokens.push({ chord: i === 0 ? p.chord : null, text: txt }));
            if (!pieces.length) tokens.push({ chord: p.chord, text: '' });
        }
        let line = '<div class="cp-line">';
        let word = '';
        tokens.forEach((t, i) => {
            word += `<span class="cp-seg${t.chord ? ' has-chord' : ''}">${t.chord ? chordTag(t.chord) : ''}<span class="cp-lyr">${esc(t.text) || '&nbsp;'}</span></span>`;
            if (/\s$/.test(t.text) || i === tokens.length - 1) { line += `<span class="cp-word">${word}</span>`; word = ''; }
        });
        html += line + '</div>';
    }
    if (inChorus) html += '</div>';
    return html;
}
