// Uygulama kabuğu: sayfa yönlendirme, kanal düğmesi, tema ve ayarlar penceresi
import { settings, updateSettings, exportData, importData, store, save, onSettings } from './state.js';
import { unlockAudio, strum, playPos, audioState } from './audio.js';
import { icon, seg, bindSegs, toast, copyText, $ } from './ui.js';

import home from './pages/home.js';
import fretMap from './pages/map.js';
import lessons from './pages/lessons.js';
import quiz from './pages/quiz.js';
import scales from './pages/scales.js';
import chords from './pages/chords.js';
import songs from './pages/songs.js';
import tools from './pages/tools.js';

const ROUTES = {
    ana: home,
    klavye: fretMap,
    dersler: lessons,
    ders: lessons,
    alistirma: quiz,
    pozisyonlar: scales,
    akorlar: chords,
    sarkilar: songs,
    sarki: songs,
    araclar: tools
};

const main = document.getElementById('main');
const nav = document.getElementById('nav');
let cleanup = null;

function route() {
    const raw = decodeURIComponent(location.hash.slice(1)) || 'ana';
    const dash = raw.indexOf('-');
    const name = dash > 0 ? raw.slice(0, dash) : raw;
    const param = dash > 0 ? raw.slice(dash + 1) : '';
    const page = ROUTES[name] || home;
    try { cleanup?.(); } catch (e) { console.error(e); }
    cleanup = null;
    // Her sayfa kendi kabında: dinleyiciler sayfayla birlikte atılır
    const view = document.createElement('div');
    view.className = 'view';
    main.replaceChildren(view);
    window.scrollTo(0, 0);
    nav.querySelectorAll('a').forEach(a => {
        const on = a.dataset.r.split(' ').includes(name);
        a.classList.toggle('is-on', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const active = nav.querySelector('.is-on');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
    try {
        cleanup = page.mount(view, param, name) || null;
    } catch (e) {
        console.error(e);
        view.innerHTML = `<section class="ph"><h1>Bir şeyler ters gitti</h1><p class="lede">Bu sayfa açılamadı. Sayfayı yenilemeyi dene.</p></section>`;
    }
    const t = typeof page.title === 'function' ? page.title(param, name) : page.title;
    document.title = t ? `${t} · Perde` : 'Perde Gitar Atölyesi';
}
window.addEventListener('hashchange', route);

// Tarayıcılar sesi ancak bir dokunuştan sonra açar (iOS parmak kalkınca: touchend)
for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) {
    document.addEventListener(ev, unlockAudio, { passive: true, capture: true });
}

// ===== Kanal (temiz / distorsiyon) =====
const toneBtn = document.getElementById('toneBtn');
function paintTone() {
    const drive = settings.tone === 'drive';
    toneBtn.setAttribute('aria-pressed', String(drive));
    toneBtn.querySelector('.ch-label').textContent = drive ? 'Distorsiyon' : 'Temiz';
    document.documentElement.dataset.channel = drive ? 'drive' : 'clean';
}
toneBtn.addEventListener('click', () => {
    updateSettings({ tone: settings.tone === 'drive' ? 'clean' : 'drive' });
    // Kanalı duyur: E5 power chord ya da açık E
    strum(settings.tone === 'drive' ? [{ s: 6, f: 0 }, { s: 5, f: 2 }, { s: 4, f: 2 }] : [{ s: 6, f: 0 }, { s: 5, f: 2 }, { s: 4, f: 2 }, { s: 3, f: 1 }, { s: 2, f: 0 }, { s: 1, f: 0 }], { dur: 1.2 });
});
onSettings(paintTone);
paintTone();

// ===== Tema =====
const themeBtn = document.getElementById('themeBtn');
themeBtn.innerHTML = icon('moon');
themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* yok say */ }
});

// ===== Ayarlar =====
const dlg = document.getElementById('settings');
const body = document.getElementById('settingsBody');
document.getElementById('setBtn').innerHTML = icon('gear');

function renderSettings() {
    body.innerHTML = `
        <div class="sheet-head">
            <h2 id="settingsTitle">Ayarlar</h2>
            <button type="button" class="iconbtn" data-close aria-label="Kapat">${icon('x')}</button>
        </div>
        <div class="set-grid">
            <div class="set-row"><span class="set-label">Nota adları</span>${seg('system', [['letter', 'C D E'], ['solfege', 'Do Re Mi']], settings.system)}</div>
            <div class="set-row"><span class="set-label">Değiştirici</span>${seg('accidental', [['sharp', '♯ diyez'], ['flat', '♭ bemol']], settings.accidental)}</div>
            <div class="set-row"><span class="set-label">Klavye yönü</span>${seg('orientation', [['auto', 'Otomatik'], ['horizontal', 'Yatay'], ['vertical', 'Dikey']], settings.orientation)}</div>
            <div class="set-row"><span class="set-label">Çalan el</span>${seg('lefty', [['false', 'Sağlak'], ['true', 'Solak']], String(settings.lefty))}</div>
            <div class="set-row"><span class="set-label">Perde sayısı</span>${seg('frets', [['12', '12'], ['15', '15'], ['22', '22'], ['24', '24']], String(settings.frets))}</div>
            <div class="set-row"><span class="set-label">Amfi kanalı</span>${seg('tone', [['clean', 'Temiz'], ['drive', 'Distorsiyon']], settings.tone)}</div>
            <div class="set-row"><label class="set-label" for="volRange">Ses düzeyi</label><input type="range" id="volRange" min="0" max="1" step="0.05" value="${settings.volume}"></div>
        </div>
        <div class="set-row"><span class="set-label">Ses testi</span><button type="button" class="btn" data-act="soundtest">${icon('sound')} A notasını çal</button></div>
        <p class="hint" id="soundHint">Ses gelmiyorsa: telefonun ses düzeyini aç, iPhone'da yan tuştaki sessiz modu kapat, Bluetooth kulaklık bağlı mı bak. Sonra sayfayı yenileyip bir notaya dokun.</p>
        <h3 class="sheet-sub">Yedekleme</h3>
        <p class="hint">İlerlemen, rekorların ve eklediğin şarkılar bu tarayıcıda duruyor. Başka bir cihaza taşımak için yedeği kopyala, orada yapıştırıp yükle.</p>
        <textarea id="backupText" class="code" rows="4" spellcheck="false" placeholder="Yedek metnini buraya yapıştır"></textarea>
        <div class="row-actions">
            <button type="button" class="btn" data-act="export">${icon('copy')} Yedeği kopyala</button>
            <button type="button" class="btn" data-act="import">${icon('upload')} Yapıştırılanı yükle</button>
            <button type="button" class="btn btn-quiet" data-act="reset">İlerlemeyi sıfırla</button>
        </div>
        <div class="confirm" id="resetConfirm" hidden>
            <p>Dersler, rekorlar ve çalışma günlerin silinecek. Eklediğin şarkılar ve ayarlar kalır.</p>
            <div class="row-actions">
                <button type="button" class="btn btn-danger" data-act="reset-yes">Evet, sıfırla</button>
                <button type="button" class="btn" data-act="reset-no">Vazgeç</button>
            </div>
        </div>`;
}

bindSegs(body, (name, v) => {
    const val = name === 'lefty' ? v === 'true' : name === 'frets' ? +v : v;
    updateSettings({ [name]: val });
});
body.addEventListener('input', e => {
    if (e.target.id === 'volRange') updateSettings({ volume: +e.target.value });
});
body.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-close')) { dlg.close(); return; }
    const ta = $('#backupText', body);
    switch (b.dataset.act) {
        case 'soundtest':
            playPos(5, 0, { dur: 1.5 });
            setTimeout(() => {
                const st = audioState();
                $('#soundHint', body).textContent = st === 'running'
                    ? 'Ses motoru çalışıyor. Hâlâ duymuyorsan sorun cihazın ses ayarında: ses düzeyi, sessiz mod ya da bağlı bir kulaklık.'
                    : `Ses motoru açılamadı (durum: ${st}). Sayfayı yenileyip tekrar dene; olmazsa başka bir tarayıcıyla aç.`;
            }, 400);
            break;
        case 'export':
            ta.value = exportData();
            copyText(ta.value, ta);
            break;
        case 'import':
            try {
                importData(ta.value);
                toast('Yedek yüklendi');
                renderSettings();
                route();
            } catch (err) {
                toast(err.message.startsWith('Bu metin') ? err.message : 'Yedek okunamadı: metnin tamamını yapıştırdığından emin ol');
            }
            break;
        case 'reset': $('#resetConfirm', body).hidden = false; break;
        case 'reset-no': $('#resetConfirm', body).hidden = true; break;
        case 'reset-yes':
            store.lessons = {};
            store.quiz = { best: {}, pos: {}, notes: {} };
            store.changes = {};
            store.days = [];
            save();
            $('#resetConfirm', body).hidden = true;
            toast('İlerleme sıfırlandı');
            route();
            break;
    }
});
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

function openSettings() {
    renderSettings();
    dlg.showModal();
}
document.getElementById('setBtn').addEventListener('click', openSettings);
document.addEventListener('click', e => {
    const a = e.target.closest('[data-open-settings]');
    if (a) { e.preventDefault(); openSettings(); }
});
route();
