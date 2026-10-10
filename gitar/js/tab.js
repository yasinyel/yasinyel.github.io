// Tab (tablatur): metin biçimi, çizim ve çalma için olay listesi.
//
// Biçim: ölçüler "|" ile ayrılır, olaylar boşlukla.
//   3.2        → 3. tel 2. perde
//   5.3+4.2    → aynı anda iki nota
//   -          → es (sus)
//   :0.5       → süre (vuruş cinsinden; 1 = dörtlük). Süre yazılmazsa bir öncekiyle aynı kalır.
//   [Am]       → sonraki olayın üstüne akor adı
// Örnek: "1.0:1 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3"
import { noteName, pcAt } from './theory.js';
import { esc } from './ui.js';

export function parseTab(src) {
    const measures = [];
    const errors = [];
    let dur = 1, beat = 0, n = 0;
    const bars = String(src).split('|').map(b => b.trim()).filter(Boolean);
    for (const bar of bars) {
        const m = { index: measures.length, start: beat, events: [] };
        let chord = null;
        for (const tok of bar.split(/\s+/).filter(Boolean)) {
            const cm = /^\[([^\]]+)\]$/.exec(tok);
            if (cm) { chord = cm[1]; continue; }
            const [notePart, durPart] = tok.split(':');
            if (durPart !== undefined) {
                const d = durPart.includes('/') ? durPart.split('/').reduce((a, b) => a / b) : parseFloat(durPart);
                if (d > 0 && d <= 16) dur = d;
                else errors.push(`Geçersiz süre: ${tok}`);
            }
            const notes = [];
            if (notePart !== '-' && notePart !== 'r' && notePart !== '') {
                for (const p of notePart.split('+')) {
                    const mm = /^([1-6])\.(\d{1,2})$/.exec(p);
                    if (!mm || +mm[2] > 24) { errors.push(`Anlaşılamadı: ${p}`); continue; }
                    notes.push({ s: +mm[1], f: +mm[2] });
                }
            }
            m.events.push({ i: n++, notes, dur, start: beat, chord, measure: m.index });
            chord = null;
            beat += dur;
        }
        m.length = beat - m.start;
        if (m.events.length) measures.push(m);
    }
    const events = measures.flatMap(m => m.events);
    return { measures, events, totalBeats: beat, errors };
}

const evW = dur => 16 + 24 * Math.pow(Math.min(dur, 2), 0.6);

/**
 * Tabı satırlara bölerek çizer. Dönen nesne çalarken olay vurgulamak içindir.
 * @returns {{highlight:(i:number)=>void, destroy:()=>void}}
 */
export function renderTab(host, tab, opts = {}) {
    const box = document.createElement('div');
    box.className = 'tab';
    host.appendChild(box);
    let current = -1;
    let lastWidth = 0;

    function draw() {
        const avail = Math.max(280, box.clientWidth || host.clientWidth || 600);
        lastWidth = avail;
        const lead = 22;
        const lineGap = 11;
        const top = 24;
        const staffH = lineGap * 5;
        const rhythmY = top + staffH + 8;
        const namesY = rhythmY + 26;
        const H = opts.names ? namesY + 8 : rhythmY + 22;

        // Ölçüleri satırlara yerleştir
        const widths = tab.measures.map(m => 14 + m.events.reduce((a, e) => a + evW(e.dur), 0) + 4);
        const rows = [];
        let row = [], w = lead;
        tab.measures.forEach((m, i) => {
            if (row.length && w + widths[i] > avail) { rows.push({ items: row, w }); row = []; w = lead; }
            row.push(i); w += widths[i];
        });
        if (row.length) rows.push({ items: row, w, last: true });

        let html = '';
        for (const r of rows) {
            const k = r.last && r.w < avail * 0.75 ? 1 : (avail - lead) / (r.w - lead);
            let x = lead;
            let s = `<svg class="tab-row" viewBox="0 0 ${avail} ${H}" width="${avail}" height="${H}" aria-hidden="true">`;
            // Tel çizgileri ve tel adları
            const rowEnd = lead + (r.w - lead) * k;
            for (let i = 0; i < 6; i++) {
                const y = top + i * lineGap;
                s += `<line class="tab-line" x1="${lead - 4}" y1="${y}" x2="${rowEnd}" y2="${y}"/>`;
                s += `<text class="tab-str" x="${lead - 12}" y="${y}">${'eBGDAE'[i]}</text>`;
            }
            s += `<line class="tab-bar" x1="${lead - 4}" y1="${top}" x2="${lead - 4}" y2="${top + staffH}"/>`;
            for (const mi of r.items) {
                const m = tab.measures[mi];
                const mw = widths[mi] * k;
                s += `<g class="tab-measure" data-m="${mi}"><rect class="tab-mhit" x="${x}" y="0" width="${mw}" height="${H}"/>`;
                s += `<text class="tab-mnum" x="${x + 3}" y="9">${mi + 1}</text>`;
                let ex = x + 14 * k;
                const beams = [];
                for (const e of m.events) {
                    const ew = evW(e.dur) * k;
                    const cx = ex + 8;
                    s += `<g class="tab-ev" data-e="${e.i}"><rect class="tab-evbg" x="${cx - 9}" y="${top - 8}" width="18" height="${staffH + 16}" rx="4"/>`;
                    if (e.chord) s += `<text class="tab-chord" x="${cx}" y="${top - 13}">${esc(e.chord)}</text>`;
                    for (const nt of e.notes) {
                        const y = top + (nt.s - 1) * lineGap;
                        const wd = nt.f > 9 ? 15 : 9;
                        s += `<rect class="tab-nbg" x="${cx - wd / 2}" y="${y - 5.5}" width="${wd}" height="11"/>`;
                        s += `<text class="tab-fret" x="${cx}" y="${y}">${nt.f}</text>`;
                    }
                    // Ritim
                    const y0 = rhythmY, y1 = rhythmY + 13;
                    if (!e.notes.length) {
                        s += e.dur >= 1
                            ? `<rect class="tab-rest" x="${cx - 4}" y="${y0 + 4}" width="8" height="3"/>`
                            : `<path class="tab-rest-s" d="M${cx - 2} ${y0 + 2} L${cx + 2} ${y0 + 6} L${cx - 2} ${y0 + 9} L${cx + 2} ${y0 + 12}"/>`;
                    } else if (e.dur >= 4) {
                        s += `<ellipse class="tab-head" cx="${cx}" cy="${y1 - 2}" rx="3.6" ry="2.6"/>`;
                        beams.push(null);
                    } else {
                        const half = e.dur >= 2;
                        s += `<line class="tab-stem" x1="${cx}" y1="${y0}" x2="${cx}" y2="${half ? y0 + 7 : y1}"/>`;
                        if (half) s += `<ellipse class="tab-head" cx="${cx}" cy="${y1 - 2}" rx="3.4" ry="2.4"/>`;
                        if ([1.5, 0.75, 3].includes(e.dur)) s += `<circle class="tab-dot" cx="${cx + 5}" cy="${y1 - 2}" r="1.3"/>`;
                        if (e.dur < 1) beams.push({ x: cx, dur: e.dur, beat: Math.floor(e.start + 1e-6) });
                        else beams.push(null);
                    }
                    if (!e.notes.length) beams.push(null);
                    if (opts.names && e.notes.length) {
                        const names = e.notes.map(nt => noteName(pcAt(nt.s, nt.f))).join(' ');
                        s += `<text class="tab-name" x="${cx}" y="${namesY}">${names}</text>`;
                    }
                    s += '</g>';
                    ex += ew;
                }
                // Kiriş ya da bayrak: aynı vuruştaki kısa notalar birleşir
                const yb = rhythmY + 13;
                for (let i = 0; i < beams.length; i++) {
                    const b = beams[i];
                    if (!b) continue;
                    let j = i;
                    while (j + 1 < beams.length && beams[j + 1] && beams[j + 1].beat === b.beat) j++;
                    if (j > i) {
                        s += `<line class="tab-beam" x1="${b.x}" y1="${yb}" x2="${beams[j].x}" y2="${yb}"/>`;
                        for (let q = i; q <= j; q++) {
                            if (beams[q].dur > 0.25) continue;
                            const nextShort = q < j && beams[q + 1].dur <= 0.25;
                            const prevShort = q > i && beams[q - 1].dur <= 0.25;
                            if (nextShort) s += `<line class="tab-beam" x1="${beams[q].x}" y1="${yb - 4}" x2="${beams[q + 1].x}" y2="${yb - 4}"/>`;
                            else if (!prevShort) {
                                const dir = q < j ? 6 : -6;
                                s += `<line class="tab-beam" x1="${beams[q].x}" y1="${yb - 4}" x2="${beams[q].x + dir}" y2="${yb - 4}"/>`;
                            }
                        }
                    } else {
                        s += `<path class="tab-flag" d="M${b.x} ${yb} q5 -2 6 -7"/>`;
                        if (b.dur <= 0.25) s += `<path class="tab-flag" d="M${b.x} ${yb - 4} q5 -2 6 -7"/>`;
                    }
                    i = j;
                }
                x += mw;
                s += `<line class="tab-bar" x1="${x}" y1="${top}" x2="${x}" y2="${top + staffH}"/></g>`;
            }
            s += '</svg>';
            html += s;
        }
        box.innerHTML = html;
        if (current >= 0) highlight(current);
    }

    function highlight(i) {
        box.querySelectorAll('.tab-ev.on').forEach(n => n.classList.remove('on'));
        current = i;
        if (i < 0) return;
        const node = box.querySelector(`.tab-ev[data-e="${i}"]`);
        if (node) {
            node.classList.add('on');
            if (opts.follow) {
                const row = node.closest('svg').getBoundingClientRect();
                if (row.top < 70 || row.bottom > window.innerHeight - 20) {
                    window.scrollBy({ top: row.top - window.innerHeight * 0.3, behavior: 'smooth' });
                }
            }
        }
    }

    box.addEventListener('click', e => {
        const m = e.target.closest('[data-m]');
        if (m && opts.onMeasure) opts.onMeasure(+m.dataset.m);
    });

    let t;
    const ro = new ResizeObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => { if (Math.abs((box.clientWidth || 0) - lastWidth) > 8) draw(); }, 120);
    });
    ro.observe(box);
    draw();

    return {
        highlight,
        redraw(o = {}) { Object.assign(opts, o); draw(); },
        destroy() { ro.disconnect(); box.remove(); }
    };
}
