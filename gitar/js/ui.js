// Küçük arayüz yardımcıları

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tek seçimli düğme grubu. options: [[value, label], …] */
export function seg(name, options, value, extra = '') {
    return `<div class="seg" role="radiogroup" data-seg="${name}" ${extra}>${options.map(([v, label]) =>
        `<button type="button" role="radio" data-v="${esc(v)}" aria-checked="${String(v) === String(value)}">${label}</button>`
    ).join('')}</div>`;
}

/** seg() grubundaki seçimi güncelle */
export function setSeg(root, name, value) {
    $$(`[data-seg="${name}"] [data-v]`, root).forEach(b => b.setAttribute('aria-checked', String(b.dataset.v === String(value))));
}

/** root içindeki tüm seg gruplarına tek dinleyici: fn(name, value) */
export function bindSegs(root, fn) {
    root.addEventListener('click', e => {
        const b = e.target.closest('[data-seg] [data-v]');
        if (!b || !root.contains(b)) return;
        const group = b.closest('[data-seg]');
        if (group.hasAttribute('data-multi')) {
            b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true'));
            const vals = $$('[data-v]', group).filter(x => x.getAttribute('aria-checked') === 'true').map(x => x.dataset.v);
            fn(group.dataset.seg, vals);
            return;
        }
        $$('[data-v]', group).forEach(x => x.setAttribute('aria-checked', String(x === b)));
        fn(group.dataset.seg, b.dataset.v);
    });
}

/** Çoklu seçim grubu */
export function multi(name, options, values, extra = '') {
    const set = new Set(values.map(String));
    return `<div class="seg" role="group" data-seg="${name}" data-multi ${extra}>${options.map(([v, label]) =>
        `<button type="button" role="checkbox" data-v="${esc(v)}" aria-checked="${set.has(String(v))}">${label}</button>`
    ).join('')}</div>`;
}

// Çizgi ikonlar (24×24, currentColor)
const P = {
    play: '<path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    sound: '<path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    loop: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    download: '<path d="M12 3v12M6 11l6 6 6-6M4 21h16"/>',
    upload: '<path d="M12 21V9M6 13l6-6 6 6M4 3h16"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
};
export const icon = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

/** Kısa bilgi balonu */
let toastTimer;
export function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.className = 'toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/** Panoya kopyala; olmazsa metni seç */
export async function copyText(text, fallbackEl) {
    try {
        await navigator.clipboard.writeText(text);
        toast('Panoya kopyalandı');
    } catch (e) {
        if (fallbackEl) { fallbackEl.focus(); fallbackEl.select(); }
        toast('Kopyalanamadı; metin seçildi, elle kopyalayabilirsin');
    }
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
