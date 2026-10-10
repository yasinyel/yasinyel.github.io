// Etkileşimli gitar klavyesi (SVG).
// Geniş ekranda yatay, dar ekranda dikey çizilir; solak modunda aynalanır.
// Konumlar "sap boyunca" (along) ve "teller arası" (across) eksenlerinde hesaplanıp
// yönelime göre x/y'ye çevrilir; böylece yazılar hiçbir yönelimde ters dönmez.
import { pcAt, noteName, STRING_LETTER } from './theory.js';
import { settings, onSettings } from './state.js';

const NS = 'http://www.w3.org/2000/svg';
const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE = [12, 24];
const STRING_W = [1.1, 1.35, 1.75, 2.2, 2.75, 3.3]; // 1. tel → 6. tel
let uid = 0;

function el(tag, attrs = {}, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
}

export class Fretboard {
    /**
     * @param {HTMLElement} host
     * @param {{frets?:number, orientation?:string, onTap?:Function, label?:string, compact?:boolean}} opts
     */
    constructor(host, opts = {}) {
        this.opts = { label: 'Gitar klavyesi', ...opts };
        this.id = ++uid;
        this.markers = [];
        this.barres = [];
        this.active = [];
        this.shade = null;
        this.wrap = document.createElement('div');
        this.wrap.className = 'fb-wrap';
        host.appendChild(this.wrap);
        this.vertical = this.computeVertical();
        this.ro = new ResizeObserver(() => {
            if (this.computeVertical() !== this.vertical) this.render();
        });
        this.ro.observe(this.wrap);
        this.off = onSettings(p => {
            const keys = Object.keys(p);
            if (!keys.length || keys.some(k => ['orientation', 'lefty', 'frets', 'system', 'accidental'].includes(k))) {
                this.render();
            }
        });
        this.wrap.addEventListener('click', e => {
            const hit = e.target.closest('[data-s]');
            if (hit && this.opts.onTap) this.opts.onTap(+hit.dataset.s, +hit.dataset.f, e);
        });
        this.render();
    }

    get fretCount() { return this.opts.frets ?? settings.frets; }

    computeVertical() {
        const o = this.opts.orientation || settings.orientation;
        if (o === 'vertical') return true;
        if (o === 'horizontal') return false;
        const w = this.wrap.clientWidth || this.wrap.parentElement?.clientWidth || window.innerWidth;
        return w < 640;
    }

    setFrets(n) { this.opts.frets = n; this.render(); }

    geometry() {
        const V = this.vertical;
        const N = this.fretCount;
        const lead = V ? 26 : 30;            // tel adları
        const openZone = V ? 42 : 46;        // boş tel bölgesi
        const avg = V ? 48 : 58;
        const nut = lead + openZone;
        const real = k => 1 - Math.pow(2, -k / 12);
        const fretPos = [nut];
        for (let k = 1; k <= N; k++) fretPos[k] = nut + avg * N * (0.6 * real(k) / real(N) + 0.4 * k / N);
        const end = fretPos[N] + 12;
        const sp = V ? 40 : 27;
        const edge = V ? 17 : 15;
        const a0 = V ? 30 : 6;               // dikeyde solda perde numaraları
        const first = a0 + edge;
        const a1 = first + 5 * sp + edge;
        const totalAlong = end + 6;
        const totalAcross = a1 + (V ? 6 : 24);
        const lefty = settings.lefty;
        const W = V ? totalAcross : totalAlong;
        const H = V ? totalAlong : totalAcross;

        const strIdx = s => V ? (lefty ? s - 1 : 6 - s) : s - 1;
        const across = s => first + strIdx(s) * sp;
        const slot = f => f === 0 ? [lead, nut] : [fretPos[f - 1], fretPos[f]];
        const center = f => { const [a, b] = slot(f); return f === 0 ? a + (b - a) * 0.52 : (a + b) / 2; };
        const pt = (al, ac) => V ? { x: ac, y: al } : { x: lefty ? W - al : al, y: ac };
        const rect = (al0, al1, ac0, ac1) => {
            const p = pt(al0, ac0), q = pt(al1, ac1);
            return { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), width: Math.abs(q.x - p.x), height: Math.abs(q.y - p.y) };
        };
        return { V, N, lead, nut, fretPos, end, sp, a0, a1, first, W, H, across, slot, center, pt, rect, r: V ? 14.5 : 12.2 };
    }

    render() {
        this.vertical = this.computeVertical();
        const g = this.g = this.geometry();
        const id = `fb${this.id}`;
        this.wrap.classList.toggle('is-vertical', g.V);
        const svg = el('svg', {
            viewBox: `0 0 ${g.W.toFixed(1)} ${g.H.toFixed(1)}`,
            class: 'fb',
            role: 'img',
            'aria-label': this.opts.label
        });
        if (!g.V) {
            svg.style.minWidth = `${Math.round(g.N * 38 + 90)}px`;
            svg.style.maxWidth = `${this.opts.maxWidth || Math.round(g.N * 72 + 160)}px`;
        }

        const defs = el('defs', {}, svg);
        const grad = el('linearGradient', { id: `${id}w`, x1: 0, y1: 0, x2: g.V ? 1 : 0, y2: g.V ? 0 : 1 }, defs);
        el('stop', { offset: '0', 'stop-color': 'var(--wood-1)' }, grad);
        el('stop', { offset: '.5', 'stop-color': 'var(--wood-2)' }, grad);
        el('stop', { offset: '1', 'stop-color': 'var(--wood-1)' }, grad);

        // Klavye tahtası
        el('rect', { ...g.rect(g.nut, g.end, g.a0, g.a1), fill: `url(#${id}w)`, class: 'fb-board' }, svg);

        // Ağaç damarı: hafif, sabit tohumlu çizgiler
        const grain = el('g', { class: 'fb-grain' }, svg);
        let seed = 7;
        const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        for (let i = 0; i < 16; i++) {
            const ac = g.a0 + 3 + rnd() * (g.a1 - g.a0 - 6);
            const pts = [];
            for (let al = g.nut; al <= g.end; al += 40) {
                const p = g.pt(al, ac + Math.sin(al / 70 + i) * 1.6);
                pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
            }
            el('polyline', { points: pts.join(' '), 'stroke-width': (0.5 + rnd() * 1.1).toFixed(2), opacity: (0.08 + rnd() * 0.12).toFixed(2) }, grain);
        }

        // Sedef işaretler
        const midAc = (g.a0 + g.a1) / 2;
        for (let f = 1; f <= g.N; f++) {
            const al = g.center(f);
            if (INLAYS.includes(f)) {
                const p = g.pt(al, midAc);
                el('circle', { cx: p.x, cy: p.y, r: g.V ? 7 : 6, class: 'fb-inlay' }, svg);
            } else if (DOUBLE.includes(f)) {
                const accs = [g.first + g.sp * 1.5, g.first + g.sp * 3.5];
                accs.forEach(ac => {
                    const p = g.pt(al, ac);
                    el('circle', { cx: p.x, cy: p.y, r: g.V ? 6.5 : 5.6, class: 'fb-inlay' }, svg);
                });
            }
        }

        // Perde telleri ve eşik
        for (let f = 1; f <= g.N; f++) {
            const p = g.pt(g.fretPos[f], g.a0), q = g.pt(g.fretPos[f], g.a1);
            el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: 'fb-fret' }, svg);
        }
        {
            const p = g.pt(g.nut, g.a0 - 1), q = g.pt(g.nut, g.a1 + 1);
            el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: 'fb-nut' }, svg);
        }

        // Teller
        for (let s = 1; s <= 6; s++) {
            const ac = g.across(s);
            const p = g.pt(g.lead + 4, ac), q = g.pt(g.end, ac);
            el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: 'fb-string', 'stroke-width': STRING_W[s - 1], 'data-str': s }, svg);
            if (s >= 4) {
                el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: 'fb-wound', 'stroke-width': STRING_W[s - 1], 'data-str': s }, svg);
            }
            const lp = g.pt(g.lead / 2 + 1, ac);
            const t = el('text', { x: lp.x, y: lp.y, class: 'fb-strlabel', 'data-str': s }, svg);
            t.textContent = STRING_LETTER[s - 1];
        }

        // Perde numaraları
        for (let f = 0; f <= g.N; f++) {
            const p = g.V ? g.pt(g.center(f), g.a0 / 2) : g.pt(g.center(f), g.a1 + 14);
            const t = el('text', { x: p.x, y: p.y, class: 'fb-num' + (INLAYS.includes(f) || DOUBLE.includes(f) ? ' is-dot' : '') }, svg);
            t.textContent = f === 0 ? (g.V ? '0' : 'boş') : f;
        }

        // Pozisyon gölgesi (teller dahil soluklaşır, işaretler üstte kalır)
        this.shadeG = el('g', { class: 'fb-shade' }, svg);

        // Dokunma alanları
        const hits = el('g', { class: 'fb-hits' }, svg);
        for (let s = 1; s <= 6; s++) {
            const ac = g.across(s);
            for (let f = 0; f <= g.N; f++) {
                const [a, b] = g.slot(f);
                el('rect', { ...g.rect(a, b, ac - g.sp / 2, ac + g.sp / 2), 'data-s': s, 'data-f': f }, hits);
            }
        }

        this.barresG = el('g', { class: 'fb-barres' }, svg);
        this.markersG = el('g', { class: 'fb-markers' }, svg);
        this.activeG = el('g', { class: 'fb-active' }, svg);

        this.wrap.replaceChildren(svg);
        this.svg = svg;
        this.drawShade();
        this.drawBarres();
        this.drawMarkers();
        this.drawActive();
    }

    // ===== İşaretler =====
    /**
     * marker: { s, f, kind?: 'note'|'root'|'ghost'|'target'|'ok'|'bad'|'stretch'|'muted'|'dim'|'heat',
     *           text?: string, note?: boolean (nota adını otomatik yaz), pref?, sub?: string, color?: string }
     */
    setMarkers(list) { this.markers = list || []; this.drawMarkers(); }
    setBarres(list) { this.barres = list || []; this.drawBarres(); }
    setActive(list) { this.active = list || []; this.drawActive(); }
    setShade(range) { this.shade = range; this.drawShade(); }
    /** Bir teli öne çıkar (diğerleri soluklaşır); null ile kaldır */
    setFocusString(s) { if (s) this.wrap.dataset.focus = s; else delete this.wrap.dataset.focus; }
    clear() { this.markers = []; this.barres = []; this.active = []; this.shade = null; this.render(); }

    labelOf(m) {
        if (m.text !== undefined) return m.text;
        if (m.note) return noteName(pcAt(m.s, m.f), m.pref);
        return '';
    }

    drawMarker(m, parent, extraClass = '', atOrigin = false) {
        const g = this.g;
        if (m.f > g.N || m.f < 0) return;
        const p = atOrigin ? { x: 0, y: 0 } : g.pt(g.center(m.f), g.across(m.s));
        const kind = m.kind || 'note';
        const grp = el('g', { class: `mk mk-${kind} ${extraClass}`, transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, parent);
        if (kind === 'muted') {
            const r = g.r * 0.5;
            el('path', { d: `M${-r} ${-r}L${r} ${r}M${r} ${-r}L${-r} ${r}`, class: 'mk-x' }, grp);
            return grp;
        }
        const c = el('circle', { r: g.r }, grp);
        if (m.color) c.style.fill = m.color;
        const label = this.labelOf(m);
        if (label !== '') {
            const t = el('text', { class: label.length > 3 ? 'is-long' : label.length > 2 ? 'is-mid' : '' }, grp);
            t.textContent = label;
        }
        if (m.sub) {
            const off = g.r + 1;
            const b = el('g', { class: 'mk-sub', transform: `translate(${off * 0.72} ${-off * 0.72})` }, grp);
            el('circle', { r: 6.4 }, b);
            const t = el('text', {}, b);
            t.textContent = m.sub;
        }
        return grp;
    }

    drawMarkers() {
        if (!this.markersG) return;
        this.markersG.replaceChildren();
        for (const m of this.markers) this.drawMarker(m, this.markersG);
    }

    drawActive() {
        if (!this.activeG) return;
        this.activeG.replaceChildren();
        const g = this.g;
        for (const a of this.active) {
            if (a.f > g.N) continue;
            const p = g.pt(g.center(a.f), g.across(a.s));
            const grp = el('g', { class: 'mk-ring', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, this.activeG);
            el('circle', { r: g.r + 4.5 }, grp);
            if (a.text !== undefined || a.note) this.drawMarker({ ...a, kind: a.kind || 'hot' }, grp, '', true);
        }
    }

    drawBarres() {
        if (!this.barresG) return;
        this.barresG.replaceChildren();
        const g = this.g;
        for (const b of this.barres) {
            if (b.f > g.N) continue;
            const al = g.center(b.f);
            const c0 = g.across(b.from), c1 = g.across(b.to);
            const lo = Math.min(c0, c1) - g.r * 0.95, hi = Math.max(c0, c1) + g.r * 0.95;
            const w = g.r * 1.55;
            const r = g.rect(al - w / 2, al + w / 2, lo, hi);
            el('rect', { ...r, rx: w / 2, class: 'fb-barre' }, this.barresG);
        }
    }

    drawShade() {
        if (!this.shadeG) return;
        this.shadeG.replaceChildren();
        if (!this.shade) return;
        const g = this.g;
        const [from, to] = this.shade;
        const lo = from <= 0 ? g.lead : g.fretPos[from - 1];
        const hi = g.fretPos[Math.min(to, g.N)];
        if (lo > g.nut - 1) el('rect', { ...g.rect(g.nut, lo, g.a0, g.a1), class: 'fb-dim' }, this.shadeG);
        if (hi < g.end) el('rect', { ...g.rect(hi, g.end, g.a0, g.a1), class: 'fb-dim' }, this.shadeG);
    }

    /** Kısa süreli vurgu (doğru/yanlış geri bildirimi) */
    flash(m, ms = 900) {
        if (!this.activeG) return;
        const node = this.drawMarker(m, this.activeG, 'is-flash');
        if (node) setTimeout(() => node.remove(), ms);
    }

    destroy() {
        this.ro.disconnect();
        this.off();
        this.wrap.remove();
    }
}
