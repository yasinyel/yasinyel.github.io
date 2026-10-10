// Akor şeması (dikey diyagram) — SVG metni döndürür
import { midiAt, mod12, noteName } from './theory.js';
import { esc } from './ui.js';

/**
 * @param {{frets:number[], fingers:number[], barre?:{fret,from,to}}} v
 * @param {{root?:number, notes?:boolean, title?:string}} o
 */
export function chordBox(v, o = {}) {
    const frets = v.frets;
    const pressed = frets.filter(f => f > 0);
    const maxF = pressed.length ? Math.max(...pressed) : 0;
    const minF = pressed.length ? Math.min(...pressed) : 0;
    const base = maxF <= 4 ? 1 : minF;
    const rows = Math.max(4, maxF - base + 1);
    const x0 = 22, dx = 13.2, y0 = 24, dy = rows > 4 ? 16 : 18;
    const W = x0 * 2 + dx * 5 - 4;
    const gridH = dy * rows;
    const H = y0 + gridH + (o.notes ? 24 : 10);
    const X = i => x0 + i * dx;
    const Y = f => y0 + (f - base + 0.5) * dy;
    let s = `<svg class="cbox" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title || v.name || 'Akor şeması')}">`;

    // Izgara
    for (let i = 0; i < 6; i++) s += `<line class="cb-str" x1="${X(i)}" y1="${y0}" x2="${X(i)}" y2="${y0 + gridH}" stroke-width="${(1.5 - i * 0.12).toFixed(2)}"/>`;
    for (let r = 0; r <= rows; r++) {
        const y = y0 + r * dy;
        s += `<line class="${r === 0 && base === 1 ? 'cb-nut' : 'cb-fret'}" x1="${X(0)}" y1="${y}" x2="${X(5)}" y2="${y}"/>`;
    }
    if (base > 1) s += `<text class="cb-base" x="${X(0) - 8}" y="${Y(base)}">${base}</text>`;

    // Üstte: boş (o) / çalınmaz (×)
    frets.forEach((f, i) => {
        const x = X(i), y = y0 - 9;
        if (f === 0) s += `<circle class="cb-open" cx="${x}" cy="${y}" r="3.6"/>`;
        else if (f < 0) s += `<path class="cb-mute" d="M${x - 3.4} ${y - 3.4}L${x + 3.4} ${y + 3.4}M${x + 3.4} ${y - 3.4}L${x - 3.4} ${y + 3.4}"/>`;
    });

    // Bare
    if (v.barre) {
        const b = v.barre;
        const y = Y(b.fret);
        s += `<rect class="cb-barre" x="${X(b.from) - 5.6}" y="${y - 5.6}" width="${X(b.to) - X(b.from) + 11.2}" height="11.2" rx="5.6"/>`;
    }

    // Parmak noktaları
    frets.forEach((f, i) => {
        if (f <= 0) return;
        const fi = v.fingers?.[i] || 0;
        if (v.barre && fi === 1 && f === v.barre.fret && i > v.barre.from && i < v.barre.to) return;
        const isRoot = o.root !== undefined && mod12(midiAt(6 - i, f)) === o.root;
        s += `<g class="cb-dot${isRoot ? ' is-root' : ''}"><circle cx="${X(i)}" cy="${Y(f)}" r="5.6"/>`;
        if (fi) s += `<text x="${X(i)}" y="${Y(f)}">${fi}</text>`;
        s += '</g>';
    });

    // Alt satır: tellerin çıkardığı notalar
    if (o.notes) {
        frets.forEach((f, i) => {
            if (f < 0) return;
            const pc = mod12(midiAt(6 - i, f));
            const isRoot = o.root !== undefined && pc === o.root;
            s += `<text class="cb-note${isRoot ? ' is-root' : ''}" x="${X(i)}" y="${y0 + gridH + 13}">${noteName(pc, o.pref)}</text>`;
        });
    }
    return s + '</svg>';
}
