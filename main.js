const PLATFORM_LABEL = { web: 'Web', desktop: 'Masaüstü', mobile: 'Mobil' };
const PLATFORM_ICON = { web: 'fa-globe', desktop: 'fa-desktop', mobile: 'fa-mobile-screen' };
const byId = Object.fromEntries(APPS.map(a => [a.id, a]));

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Card preview: the app's screenshot in a browser-like frame, or a stylised "window" in its colour
function preview(app) {
    if (app.image) {
        return `
        <div class="preview preview-shot" style="--c:${app.color}">
            <div class="shot-frame">
                <div class="preview-bar"><i></i><i></i><i></i></div>
                <img src="${app.image}" alt="${esc(app.name)} ekran görüntüsü" loading="lazy">
            </div>
        </div>`;
    }
    return `
        <div class="preview" style="--c:${app.color}">
            <div class="preview-bar"><i></i><i></i><i></i></div>
            <div class="preview-body">
                <div class="preview-icon"><i class="fas ${app.icon}"></i></div>
                <div class="preview-lines"><b></b><b></b><b></b></div>
            </div>
        </div>`;
}

function statusPill(app) {
    return app.status === 'active'
        ? '<span class="pill pill-live"><i></i>Aktif</span>'
        : '<span class="pill pill-soon">Yakında</span>';
}

// ===== APP GRID =====
const grid = document.getElementById('appGrid');
grid.innerHTML = APPS.map(app => `
    <button class="app-card" data-id="${app.id}" data-platform="${app.platform}">
        ${preview(app)}
        <div class="app-card-body">
            <div class="app-card-meta">
                <span class="platform"><i class="fas ${PLATFORM_ICON[app.platform]}"></i> ${PLATFORM_LABEL[app.platform]}</span>
                ${statusPill(app)}
            </div>
            <h3>${esc(app.name)}</h3>
            <p>${esc(app.tagline)}</p>
            <span class="more">Ayrıntılar <i class="fas fa-arrow-right"></i></span>
        </div>
    </button>`).join('');

// ===== FILTERS =====
document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    grid.querySelectorAll('.app-card').forEach(card => {
        card.hidden = f !== 'all' && card.dataset.platform !== f;
    });
});

// ===== DIALOG =====
const dialog = document.getElementById('appDialog');
const dialogBody = document.getElementById('dialogBody');

function openApp(id) {
    const app = byId[id];
    if (!app) return;
    const action = app.link
        ? `<a class="btn btn-primary" href="${app.link}" target="_blank" rel="noopener">Uygulamayı aç <i class="fas fa-arrow-up-right-from-square"></i></a>`
        : `<span class="btn btn-ghost btn-static"><i class="fas ${PLATFORM_ICON[app.platform]}"></i> ${esc(app.linkLabel || '')}</span>`;
    dialogBody.innerHTML = `
        ${preview(app)}
        <div class="dialog-content">
            <div class="app-card-meta">
                <span class="platform"><i class="fas ${PLATFORM_ICON[app.platform]}"></i> ${PLATFORM_LABEL[app.platform]}</span>
                ${statusPill(app)}
            </div>
            <h3>${esc(app.name)}</h3>
            <p class="dialog-tagline">${esc(app.tagline)}</p>
            <p>${esc(app.description)}</p>
            <h4>Özellikler</h4>
            <ul class="feature-list">${app.features.map(f => `<li><i class="fas fa-check"></i>${esc(f)}</li>`).join('')}</ul>
            <h4>Teknolojiler</h4>
            <div class="tech-row">${app.tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>
            <div class="dialog-actions">${action}</div>
        </div>`;
    dialog.showModal();
}

grid.addEventListener('click', e => {
    const card = e.target.closest('.app-card');
    if (card) openApp(card.dataset.id);
});
document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

// ===== TIMELINE =====
document.getElementById('timeline').innerHTML = DAY.map(step => {
    const app = byId[step.app];
    return `
        <li style="--c:${app.color}">
            <time>${step.time}</time>
            <button class="tl-card" data-id="${app.id}">
                <span class="tl-icon"><i class="fas ${app.icon}"></i></span>
                <strong>${esc(app.name)}</strong>
                <span>${esc(step.text)}</span>
            </button>
        </li>`;
}).join('');
document.getElementById('timeline').addEventListener('click', e => {
    const card = e.target.closest('.tl-card');
    if (card) openApp(card.dataset.id);
});

// ===== THEME =====
document.getElementById('themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
});

// ===== MOBILE MENU =====
const nav = document.getElementById('nav');
document.getElementById('menuBtn').addEventListener('click', () => nav.classList.toggle('open'));
nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });

// ===== REVEAL ON SCROLL =====
const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.section-head, .app-card, .timeline li, .featured > *, .about > *, .stats > div').forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
});

document.getElementById('year').textContent = new Date().getFullYear();
