// Şarkılar: kütüphane, tab çalar, akorlu şarkı görünümü ve şarkı editörü
import { Fretboard } from '../fretboard.js';
import { playPos, strum, click, Clock, audioTime } from '../audio.js';
import { parseChord, prettyChord, transposeChord, keyPref, chordLongName } from '../theory.js';
import { store, save, onSettings, markPracticed, settings, updateSettings, setIntent, takeIntent } from '../state.js';
import { SONGS } from '../data/songs.js';
import { FAMOUS, songsterrUrl, ugUrl, lessonUrl } from '../data/famous.js';
import { convertPaste } from '../convert.js';
import { parseTab, renderTab } from '../tab.js';
import { parseChordPro, renderChordPro, chordsIn } from '../chordpro.js';
import { voicingsFor, voicingNotes } from '../chords.js';
import { chordBox } from '../chordbox.js';
import { seg, bindSegs, icon, esc, toast, copyText } from '../ui.js';

const titleLang = s => s.lang || (s.kind === 'ref' ? 'en' : 'tr');
const LEVEL = { 1: 'Başlangıç', 2: 'Orta', 3: 'İleri' };
const TIMES = ['4/4', '3/4', '2/4', '6/8', '3/8', '12/8'];

const REFS = FAMOUS.map(f => ({ ...f, kind: 'ref', source: 'Ünlü şarkı rehberi' }));
const allSongs = () => [...store.songs, ...SONGS, ...REFS];
const findSong = id => allSongs().find(s => s.id === id);

/** "6/8" → ölçü başına dörtlük vuruş ve tık aralığı */
function meter(time) {
    const [n, d] = String(time || '4/4').split('/').map(Number);
    const beats = (n || 4) * 4 / (d || 4);
    const clickEvery = d === 8 && n % 3 === 0 ? 1.5 : d === 8 ? 0.5 : 1;
    return { beats, clickEvery };
}

// ===== Kullanıcı şarkılarını temizle (içe aktarma güvenliği) =====
const clip = (v, n) => String(v ?? '').slice(0, n);
function sanitizeSong(x) {
    if (!x || typeof x !== 'object' || !x.title) return null;
    const kind = x.kind === 'tab' ? 'tab' : 'chords';
    const song = {
        id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        user: true,
        title: clip(x.title, 120),
        artist: clip(x.artist, 120),
        source: 'Senin eklediğin',
        kind,
        level: [1, 2, 3].includes(+x.level) ? +x.level : 1,
        key: clip(x.key, 8),
        tempo: Math.min(260, Math.max(30, parseInt(x.tempo, 10) || 90)),
        time: TIMES.includes(x.time) ? x.time : '4/4',
        capo: Math.min(12, Math.max(0, parseInt(x.capo, 10) || 0)),
        strum: clip(x.strum, 16).replace(/[^DU-]/gi, '').toUpperCase(),
        notes: clip(x.notes, 2000),
        focus: clip(x.focus, 200)
    };
    if (kind === 'tab') song.tab = clip(x.tab, 30000); else song.body = clip(x.body, 30000);
    return song;
}

export default {
    title: (param, name) => {
        if (name === 'sarkilar') return 'Şarkılar';
        if (param === 'yeni') return 'Yeni şarkı';
        const s = findSong(param.replace(/^duzenle-/, ''));
        return s ? s.title : 'Şarkılar';
    },
    mount(root, param, name) {
        if (name === 'sarkilar' || !param) return list(root);
        if (param === 'yeni') return editor(root, null);
        if (param.startsWith('duzenle-')) return editor(root, findSong(param.slice(8)));
        const song = findSong(param);
        if (!song) { root.innerHTML = `<header class="ph"><h1>Şarkı bulunamadı</h1><p class="lede">Bu şarkı silinmiş ya da başka bir tarayıcıda eklenmiş olabilir. <a href="#sarkilar">Şarkılara dön</a></p></header>`; return null; }
        return song.kind === 'tab' ? tabView(root, song) : song.kind === 'ref' ? refView(root, song) : chordView(root, song);
    }
};

// ===================================================================
// Liste
// ===================================================================
let listFilter = 'all';
function list(root) {
    const filters = [['all', 'Tümü'], ['ref', 'Ünlü şarkılar'], ['tab', 'Tab ve alıştırma'], ['chords', 'Akorlu'], ['mine', 'Benim eklediklerim']];
    root.innerHTML = `
    <header class="ph ph-row">
        <div>
            <p class="kicker">Şarkılar</p>
            <h1>Çalarak öğren</h1>
            <p class="lede">Tab'lı parçalarda notalar çalarken klavyede yanar; akorlu şarkılarda akora dokununca sesini ve şemasını görürsün. Kendi şarkılarını da ekleyebilirsin.</p>
        </div>
        <div class="row-actions">
            <a class="btn btn-primary" href="#sarki-yeni">${icon('plus')} Şarkı ekle</a>
            <button type="button" class="btn" id="importBtn">${icon('upload')} İçe aktar</button>
        </div>
    </header>
    <section class="import" id="importBox" hidden>
        <label class="tb-label" for="importText">Paylaşılan şarkı metnini yapıştır</label>
        <textarea id="importText" class="code" rows="4" spellcheck="false" placeholder='{"app":"perde-song", ...}'></textarea>
        <div class="row-actions"><button type="button" class="btn btn-primary" id="importGo">Şarkıyı ekle</button></div>
    </section>
    <div class="toolbar">${seg('filter', filters, listFilter)}</div>
    <div class="song-grid" id="songGrid"></div>
    <p class="hint">Hazır tab ve akorlu parçalar kamu malı ya da geleneksel eserler ve Perde için yazılmış alıştırmalardır. Ünlü şarkıların söz ve tabları telifli olduğu için rehber kartlarında ton, akorlar, teknikler ve lisanslı tab kaynaklarına bağlantı var. Senin eklediğin şarkılar yalnızca bu tarayıcıda saklanır.</p>`;

    const grid = root.querySelector('#songGrid');
    function paint() {
        const items = allSongs().filter(s => listFilter === 'all' || (listFilter === 'mine' ? s.user : s.kind === listFilter));
        grid.innerHTML = items.length ? items.map(s => {
            const chords = s.kind === 'chords' ? chordsIn(parseChordPro(s.body || '')).slice(0, 6) : s.kind === 'ref' ? s.chords.slice(0, 6) : [];
            const tag = s.kind === 'tab' ? ['tag-tab', s.source === 'Alıştırma' ? 'Alıştırma' : 'Tab'] : s.kind === 'ref' ? ['tag-ref', 'Rehber'] : ['tag-ch', 'Akorlu'];
            return `
            <a class="song-card${s.kind === 'ref' ? ' is-ref' : ''}" href="#sarki-${esc(s.id)}">
                <span class="sc-top"><span class="tag ${tag[0]}">${tag[1]}</span><span class="lvl lvl-${s.level}">${LEVEL[s.level] || ''}</span></span>
                <strong lang="${titleLang(s)}">${esc(s.title)}</strong>
                <span class="sc-artist">${esc(s.artist || s.source || '')}${s.year ? ' · ' + s.year : ''}</span>
                ${s.focus ? `<span class="sc-focus">${esc(s.focus)}</span>` : s.techniques ? `<span class="sc-focus">${esc(s.techniques.slice(0, 2).join(' · '))}</span>` : ''}
                <span class="sc-meta">${chords.length ? chords.map(c => `<b>${esc(prettyChord(c))}</b>`).join('') : ''}<span>${s.tempo ? s.tempo + ' BPM · ' : ''}${esc(s.time || '4/4')}${s.key ? ' · ' + esc(prettyChord(s.key)) : ''}</span></span>
            </a>`;
        }).join('') : `<p class="empty">Henüz şarkı eklemedin. <a href="#sarki-yeni">İlk şarkını ekle</a>: akorları köşeli parantezle yazman yeterli.</p>`;
    }
    paint();
    bindSegs(root, (n, v) => { listFilter = v; paint(); });

    root.querySelector('#importBtn').addEventListener('click', () => {
        const box = root.querySelector('#importBox');
        box.hidden = !box.hidden;
        if (!box.hidden) root.querySelector('#importText').focus();
    });
    root.querySelector('#importGo').addEventListener('click', () => {
        const text = root.querySelector('#importText').value.trim();
        try {
            const data = JSON.parse(text);
            const raw = data.app === 'perde-song' ? [data.song] : data.app === 'perde-songs' ? data.songs : Array.isArray(data) ? data : [data];
            const clean = raw.map(sanitizeSong).filter(Boolean);
            if (!clean.length) throw new Error('empty');
            store.songs.unshift(...clean);
            save();
            toast(`${clean.length} şarkı eklendi`);
            listFilter = 'mine';
            list(root);
        } catch (e) {
            toast('Metin okunamadı. Paylaşılan metnin tamamını yapıştırdığından emin ol.');
        }
    });
    return null;
}

// Başlık bölümü (tab ve akorlu görünüm ortak)
function songHeader(song) {
    return `
    <nav class="crumbs"><a href="#sarkilar">${icon('back')} Şarkılar</a>${song.user ? `<span class="crumb-actions"><a href="#sarki-duzenle-${esc(song.id)}">${icon('edit')} Düzenle</a><button type="button" class="linkbtn" id="shareBtn">${icon('copy')} Paylaş</button></span>` : ''}</nav>
    <header class="ph">
        <p class="kicker">${esc(song.source || '')}${song.level ? ' · ' + LEVEL[song.level] : ''}</p>
        <h1 lang="${titleLang(song)}">${esc(song.title)}</h1>
        <p class="song-artist">${esc(song.artist || '')}</p>
        <p class="pills">
            <span>${song.tempo} BPM</span><span>${esc(song.time || '4/4')}</span>
            ${song.key ? `<span>Ton ${esc(prettyChord(song.key))}</span>` : ''}
            ${song.capo ? `<span>Capo ${song.capo}. perde</span>` : ''}
            ${song.swing ? '<span>Shuffle</span>' : ''}
        </p>
        ${song.focus ? `<p class="lede-sm"><b>Çalıştırdığı:</b> ${esc(song.focus)}</p>` : ''}
        ${song.notes ? `<p class="lede-sm">${esc(song.notes)}</p>` : ''}
        ${song.tone === 'drive' && settings.tone !== 'drive' ? `<p><button type="button" class="btn btn-quiet" id="songDrive">Bu parça distorsiyonla güzel: kanalı değiştir</button></p>` : ''}
    </header>`;
}

function bindHeader(root, song) {
    root.querySelector('#songDrive')?.addEventListener('click', e => { updateSettings({ tone: 'drive' }); e.currentTarget.remove(); });
    root.querySelector('#shareBtn')?.addEventListener('click', () => {
        const { id, user, ...rest } = song;
        void id; void user;
        copyText(JSON.stringify({ app: 'perde-song', song: rest }));
    });
}

// ===================================================================
// Tab görünümü ve çalar
// ===================================================================
function tabView(root, song) {
    const tab = parseTab(song.tab || '');
    const { beats: barBeats, clickEvery } = meter(song.time);
    const maxFret = Math.max(4, ...tab.events.flatMap(e => e.notes.map(n => n.f)));
    const st = { pct: 100, metro: true, countIn: true, loop: false, names: false, follow: true, from: 0, to: Math.max(0, tab.measures.length - 1) };
    const clock = new Clock();
    const measureOpts = sel => tab.measures.map((m, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${i + 1}</option>`).join('');

    root.innerHTML = `
    ${songHeader(song)}
    <section class="player" id="player">
        <div class="player-row">
            <button type="button" class="btn btn-primary btn-play" id="playBtn">${icon('play')} Çal</button>
            <label class="tempo"><span>Hız</span><input type="range" id="pct" min="40" max="150" step="5" value="100"><b id="pctVal">%100 · ${song.tempo}</b></label>
            <span class="range-pick"><span class="tb-label">Ölçü</span><select id="mFrom" aria-label="Başlangıç ölçüsü">${measureOpts(st.from)}</select><span>–</span><select id="mTo" aria-label="Bitiş ölçüsü">${measureOpts(st.to)}</select></span>
        </div>
        <div class="player-row toggles">
            ${toggle('metro', 'Metronom', st.metro)}
            ${toggle('countIn', 'Saydır', st.countIn)}
            ${toggle('loop', 'Döngü', st.loop)}
            ${toggle('names', 'Nota adları', st.names)}
            ${toggle('follow', 'Takip et', st.follow)}
        </div>
        <div id="songBoard"></div>
    </section>
    ${tab.errors.length ? `<p class="note-err">Tabda anlaşılamayan kısımlar: ${esc(tab.errors.slice(0, 5).join(', '))}</p>` : ''}
    <section class="tab-wrap" id="tabWrap"></section>
    <p class="hint">Bir ölçüye dokununca çalma oradan başlar.</p>`;

    bindHeader(root, song);
    const $ = s => root.querySelector(s);
    const fb = new Fretboard($('#songBoard'), { frets: Math.min(24, maxFret + 1), orientation: 'horizontal', maxWidth: Math.round(Math.min(24, maxFret + 1) * 48 + 150), label: 'Çalınan notalar', onTap: (s, f) => playPos(s, f) });
    const view = renderTab($('#tabWrap'), tab, {
        names: st.names, follow: st.follow,
        onMeasure(i) {
            st.from = i; if (st.to < i) st.to = tab.measures.length - 1;
            $('#mFrom').value = st.from; $('#mTo').value = st.to;
            stop(); start();
        }
    });

    const playBtn = $('#playBtn');
    function stop() {
        clock.stop();
        view.highlight(-1);
        fb.setActive([]);
        playBtn.innerHTML = `${icon('play')} Çal`;
        playBtn.setAttribute('aria-pressed', 'false');
    }

    function start() {
        if (!tab.events.length) return;
        markPracticed();
        const evs = tab.measures.slice(st.from, st.to + 1).flatMap(m => m.events);
        const startBeat = tab.measures[st.from].start;
        const last = tab.measures[st.to];
        const endBeat = last.start + last.length;
        const span = endBeat - startBeat;
        const measureStarts = new Set(tab.measures.map(m => +(m.start - startBeat).toFixed(4)));
        const spb = 60 / (song.tempo * st.pct / 100);
        const lead = st.countIn ? barBeats : 0;
        const c0 = audioTime() + 0.12 + lead * spb;   // tıkların sabit başlangıcı
        let t0 = c0;                                   // notaların başlangıcı (döngüde ilerler)
        let idx = 0;
        let clickBeat = -lead;
        let ending = false;
        playBtn.innerHTML = `${icon('stop')} Durdur`;
        playBtn.setAttribute('aria-pressed', 'true');

        const swingShift = e => song.swing && Math.abs(e.dur - 0.5) < 1e-6 && Math.abs((e.start % 1) - 0.5) < 1e-6 ? 1 / 6 : 0;

        clock.start(until => {
            // Metronom ve saydırma
            while (true) {
                const tc = c0 + clickBeat * spb;
                if (tc >= until) break;
                const rel = +(((clickBeat % span) + span) % span).toFixed(4);
                if (clickBeat < 0 || st.metro) click(tc, clickBeat < 0 ? (clickBeat === -lead ? 2 : 1) : measureStarts.has(rel) ? 2 : 1);
                clickBeat += clickEvery;
                if (!st.loop && clickBeat >= span) { clickBeat = Infinity; break; }
            }
            // Notalar
            while (idx < evs.length) {
                const e = evs[idx];
                const te = t0 + (e.start - startBeat + swingShift(e)) * spb;
                if (te >= until) break;
                const dur = Math.max(0.12, e.dur * spb * 0.98);
                if (e.notes.length >= 2) strum(e.notes, { when: te, dur, spread: 0.012, vel: 0.85 });
                else e.notes.forEach(n => playPos(n.s, n.f, { when: te, dur }));
                clock.at(te, () => {
                    view.highlight(e.i);
                    fb.setActive(e.notes.map(n => ({ ...n, note: true })));
                });
                idx++;
            }
            if (idx >= evs.length) {
                if (st.loop) {
                    idx = 0;
                    t0 += span * spb;
                } else if (!ending) {
                    ending = true;
                    clock.at(t0 + span * spb, stop);
                }
            }
        });
    }

    playBtn.addEventListener('click', () => (clock.running ? stop() : start()));
    $('#pct').addEventListener('input', e => {
        st.pct = +e.target.value;
        $('#pctVal').textContent = `%${st.pct} · ${Math.round(song.tempo * st.pct / 100)}`;
        if (clock.running) { stop(); start(); }
    });
    $('#mFrom').addEventListener('change', e => { st.from = +e.target.value; if (st.to < st.from) { st.to = st.from; $('#mTo').value = st.to; } if (clock.running) { stop(); start(); } });
    $('#mTo').addEventListener('change', e => { st.to = +e.target.value; if (st.to < st.from) { st.from = st.to; $('#mFrom').value = st.from; } if (clock.running) { stop(); start(); } });
    root.querySelector('.toggles').addEventListener('click', e => {
        const b = e.target.closest('[data-t]');
        if (!b) return;
        const k = b.dataset.t;
        st[k] = !st[k];
        b.setAttribute('aria-pressed', String(st[k]));
        if (k === 'names' || k === 'follow') view.redraw({ names: st.names, follow: st.follow });
    });

    const off = onSettings(p => { if ('system' in p || 'accidental' in p) view.redraw({}); });
    return () => { off(); clock.stop(); view.destroy(); fb.destroy(); };
}

const toggle = (key, label, on) => `<button type="button" class="toggle" data-t="${key}" aria-pressed="${on}"><span class="tg-led"></span>${label}</button>`;

// ===================================================================
// Akorlu şarkı görünümü
// ===================================================================
function chordView(root, song) {
    const parsed = parseChordPro(song.body || '');
    const keyChord = song.key || chordsIn(parsed)[0] || 'C';
    const st = { semis: 0, size: 1, scroll: false, speed: 22, chord: null, rhythm: false };
    const clock = new Clock();
    let raf = 0;
    const pattern = (song.strum || '').toUpperCase();
    const { beats: barBeats } = meter(song.time);

    root.innerHTML = `
    ${songHeader(song)}
    <section class="player" id="player">
        <div class="player-row">
            <span class="stepper">
                <button type="button" class="iconbtn" id="trDown" aria-label="Yarım ses aşağı">${icon('minus')}</button>
                <span class="step-label" id="keyLabel"></span>
                <button type="button" class="iconbtn" id="trUp" aria-label="Yarım ses yukarı">${icon('plus')}</button>
            </span>
            <span class="stepper">
                <button type="button" class="iconbtn" id="fsDown" aria-label="Yazıyı küçült"><span class="aa">A</span></button>
                <span class="step-label"><b>Yazı</b></span>
                <button type="button" class="iconbtn" id="fsUp" aria-label="Yazıyı büyüt"><span class="aa aa-lg">A</span></button>
            </span>
            <button type="button" class="toggle" id="scrollBtn" aria-pressed="false"><span class="tg-led"></span>Otomatik kaydır</button>
            <label class="tempo" id="speedBox"><span>Hız</span><input type="range" id="speed" min="5" max="80" step="1" value="${st.speed}"></label>
        </div>
        ${pattern ? `<div class="player-row rhythm">
            <span class="tb-label">Ritim</span>
            <span class="strum" id="strumView">${[...pattern].map((c, i) => `<span class="sl"><b>${c === 'D' ? '↓' : c === 'U' ? '↑' : '·'}</b><small>${i % 2 === 0 ? i / 2 + 1 : '&'}</small></span>`).join('')}</span>
            <button type="button" class="btn" id="rhythmBtn">${icon('play')} Ritmi dinle</button>
            <span class="muted" id="rhythmChord"></span>
        </div>` : ''}
        <div class="chord-strip" id="songChords"></div>
    </section>
    <article class="cp" id="cpBody"></article>`;

    bindHeader(root, song);
    const $ = s => root.querySelector(s);
    const body = $('#cpBody');

    function pref() {
        const c = parseChord(keyChord);
        if (!c) return settings.accidental;
        return keyPref(c.root + st.semis, c.qual === 'm' || c.qual === 'm7' ? 'minor' : 'major');
    }
    const tr = c => (st.semis ? transposeChord(c, st.semis, pref()) : c);

    function paint() {
        body.innerHTML = renderChordPro(parsed, st.semis, pref());
        body.style.setProperty('--cp-scale', st.size);
        const chords = chordsIn(parsed).map(tr);
        if (!st.chord || !chords.includes(st.chord)) st.chord = chords[0] || null;
        $('#songChords').innerHTML = chords.map(c => {
            const v = voicingsFor(c)[0];
            const p = parseChord(c);
            return `<button type="button" class="chord-card chord-card-sm${c === st.chord ? ' is-on' : ''}" data-chord="${esc(c)}">${v ? chordBox(v, { root: p.root }) : ''}<strong>${esc(prettyChord(c))}</strong></button>`;
        }).join('');
        const k = tr(keyChord);
        $('#keyLabel').innerHTML = `<b>Ton ${esc(prettyChord(k))}</b><span>${st.semis ? (st.semis > 0 ? '+' : '') + st.semis + ' yarım ses' : 'orijinal'}</span>`;
        const rc = $('#rhythmChord');
        if (rc) rc.textContent = st.chord ? `Akor: ${prettyChord(st.chord)} · ${song.tempo} BPM` : '';
    }

    function playChord(name, o = {}) {
        const v = voicingsFor(name)[0];
        if (v) strum(voicingNotes(v), { dur: 1.8, ...o });
    }

    root.addEventListener('click', e => {
        const b = e.target.closest('[data-chord]');
        if (!b) return;
        st.chord = b.dataset.chord;
        playChord(st.chord);
        root.querySelectorAll('#songChords .chord-card').forEach(x => x.classList.toggle('is-on', x.dataset.chord === st.chord));
        const rc = $('#rhythmChord');
        if (rc) rc.textContent = `Akor: ${prettyChord(st.chord)} · ${song.tempo} BPM`;
        if (b.classList.contains('cp-chord')) {
            const v = voicingsFor(st.chord)[0];
            if (v) toast(`${prettyChord(st.chord)}: ${v.frets.map(f => f < 0 ? '×' : f).join(' ')} · ${chordLongName(st.chord)}`);
        }
    });

    $('#trDown').addEventListener('click', () => { st.semis = ((st.semis - 1 + 17) % 12) - 5; paint(); });
    $('#trUp').addEventListener('click', () => { st.semis = ((st.semis + 1 + 17) % 12) - 5; paint(); });
    $('#fsDown').addEventListener('click', () => { st.size = Math.max(0.8, +(st.size - 0.1).toFixed(2)); paint(); });
    $('#fsUp').addEventListener('click', () => { st.size = Math.min(1.8, +(st.size + 0.1).toFixed(2)); paint(); });

    // Otomatik kaydırma
    const scrollBtn = $('#scrollBtn');
    let lastT = 0, acc = 0;
    function scrollLoop(t) {
        if (!st.scroll) return;
        if (lastT) {
            acc += st.speed * (t - lastT) / 1000;
            const step = Math.floor(acc);
            if (step) { window.scrollBy(0, step); acc -= step; }
            if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) { setScroll(false); return; }
        }
        lastT = t;
        raf = requestAnimationFrame(scrollLoop);
    }
    function setScroll(on) {
        st.scroll = on;
        scrollBtn.setAttribute('aria-pressed', String(on));
        cancelAnimationFrame(raf);
        lastT = 0; acc = 0;
        if (on) raf = requestAnimationFrame(scrollLoop);
    }
    scrollBtn.addEventListener('click', () => setScroll(!st.scroll));
    $('#speed').addEventListener('input', e => { st.speed = +e.target.value; });

    // Ritim kalıbı: seçili akorla, şarkının temposunda
    const rhythmBtn = $('#rhythmBtn');
    rhythmBtn?.addEventListener('click', () => {
        if (clock.running) { clock.stop(); rhythmBtn.innerHTML = `${icon('play')} Ritmi dinle`; paintSlot(-1); return; }
        if (!st.chord) return;
        markPracticed();
        rhythmBtn.innerHTML = `${icon('stop')} Durdur`;
        const slots = [...pattern];
        const slotDur = barBeats / slots.length;
        let i = 0, t = audioTime() + 0.1;
        clock.start(until => {
            const spb = 60 / song.tempo;
            while (t < until) {
                const k = i % slots.length;
                const c = slots[k];
                if (k * slotDur % 1 === 0) click(t, k === 0 ? 2 : 1);
                if (c === 'D' || c === 'U') {
                    const v = voicingsFor(st.chord)[0];
                    if (v) strum(voicingNotes(v), { when: t, dir: c === 'D' ? 'down' : 'up', dur: slotDur * spb * 2, vel: c === 'D' ? 0.7 : 0.5, spread: 0.014 });
                }
                clock.at(t, () => paintSlot(k));
                t += slotDur * spb;
                i++;
            }
        });
    });
    function paintSlot(k) {
        root.querySelectorAll('#strumView .sl').forEach((n, j) => n.classList.toggle('on', j === k));
    }

    paint();
    const off = onSettings(p => { if ('system' in p || 'accidental' in p) paint(); });
    return () => { off(); clock.stop(); setScroll(false); };
}

// ===================================================================
// Ünlü şarkı rehberi
// ===================================================================
function refView(root, song) {
    let current = song.chords[0];
    root.innerHTML = `
    <nav class="crumbs"><a href="#sarkilar">${icon('back')} Şarkılar</a></nav>
    <header class="ph">
        <p class="kicker">Ünlü şarkı rehberi · ${LEVEL[song.level]}</p>
        <h1 lang="${titleLang(song)}">${esc(song.title)}</h1>
        <p class="song-artist">${esc(song.artist)} · ${song.year}</p>
        <p class="pills">
            <span>Ton ${esc(prettyChord(song.key))}</span><span>${esc(song.time)}</span>
            ${song.capo ? `<span>Capo ${song.capo}. perde</span>` : ''}
            <span>${esc(song.tuning || 'Standart akort')}</span>
        </p>
        <p class="lede-sm">${esc(song.notes)}</p>
    </header>
    <section class="stage">
        <div class="stage-head">
            <p class="kicker">Şarkıda geçen başlıca akorlar</p>
            <p class="readout" id="refReadout"></p>
        </div>
        <div class="chord-strip" id="refChords">
            ${song.chords.map(c => {
                const v = voicingsFor(c)[0];
                return `<button type="button" class="chord-card chord-card-sm" data-chord="${esc(c)}">${v ? chordBox(v, { root: parseChord(c).root }) : ''}<strong>${esc(prettyChord(c))}</strong></button>`;
            }).join('')}
        </div>
    </section>
    <div class="ref-grid">
        <section class="fact">
            <strong>Gereken teknikler</strong>
            <ul class="ticks">${song.techniques.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        </section>
        <section class="fact">
            <strong>Önce bunları çalış</strong>
            <div class="row-actions">${song.prep.map(([label, href], i) => `<a class="btn" href="${href}" data-prep="${i}">${esc(label)} ${icon('arrow')}</a>`).join('')}</div>
        </section>
        <section class="fact">
            <strong>Tab ve sözler</strong>
            <p>Bu şarkının tab ve sözleri telifli; lisanslı kaynaklarda bulabilirsin. Songsterr tabları çalarken dinletir, Perde'deki tab çalar gibi.</p>
            <div class="row-actions">
                <a class="btn btn-primary" href="${songsterrUrl(song)}" target="_blank" rel="noopener">Songsterr'de aç ${icon('arrow')}</a>
                <a class="btn" href="${ugUrl(song)}" target="_blank" rel="noopener">Ultimate Guitar</a>
                <a class="btn btn-quiet" href="${lessonUrl(song)}" target="_blank" rel="noopener">Video dersler</a>
            </div>
        </section>
        <section class="fact">
            <strong>Kendi çalışma sayfanı yap</strong>
            <p>Elindeki tabı ya da akorlu sözleri yapıştır; Perde biçimine çevrilsin. Sonra klavyede izleyerek ve yavaşlatarak çalışırsın. Bu sayfa yalnızca senin tarayıcında kalır.</p>
            <div class="row-actions"><button type="button" class="btn" id="makeOwn">${icon('plus')} Bu şarkı için sayfa oluştur</button></div>
        </section>
    </div>`;

    const readout = root.querySelector('#refReadout');
    function select(c, play) {
        current = c;
        const v = voicingsFor(c)[0];
        root.querySelectorAll('#refChords .chord-card').forEach(b => b.classList.toggle('is-on', b.dataset.chord === c));
        readout.innerHTML = v ? `<b>${esc(prettyChord(c))}</b> <span>${esc(chordLongName(c))} · ${v.frets.map(f => f < 0 ? '×' : f).join(' ')}</span>` : '';
        if (play && v) strum(voicingNotes(v), { dur: 2 });
    }
    select(current, false);
    root.querySelector('#refChords').addEventListener('click', e => {
        const b = e.target.closest('[data-chord]');
        if (b) select(b.dataset.chord, true);
    });
    root.querySelectorAll('[data-prep]').forEach(a => a.addEventListener('click', () => {
        const intent = song.prep[+a.dataset.prep][2];
        if (intent) setIntent(intent);
    }));
    root.querySelector('#makeOwn').addEventListener('click', () => {
        setIntent({ prefill: { title: song.title, artist: song.artist, key: song.key, time: song.time, capo: song.capo || 0, level: song.level } });
        location.hash = '#sarki-yeni';
    });
    return null;
}

// ===================================================================
// Editör
// ===================================================================
const SAMPLE_CHORDS = `{c: 1. kıta}
[Am]Buraya şarkının [G]sözlerini yaz
Akoru, değiştiği [F]hecenin hemen [E]önüne koy

{soc}
[C]Nakarat da [G]böyle [Am]yazılır
{eoc}`;
const SAMPLE_TAB = `[Am] 5.0:0.5 4.2 3.2 2.1 1.0 2.1 3.2 4.2 | [C] 5.3 4.2 3.0 2.1 1.0:2`;

function editor(root, song) {
    if (song && !song.user) { location.hash = `#sarki-${song.id}`; return null; }
    const isNew = !song;
    const prefill = (takeIntent() || {}).prefill;
    const d = song ? { ...song } : { title: '', artist: '', kind: 'chords', level: 1, key: '', tempo: 90, time: '4/4', capo: 0, strum: 'D-DU-UDU', notes: '', body: SAMPLE_CHORDS, tab: SAMPLE_TAB, ...(prefill || {}) };
    if (d.body === undefined) d.body = SAMPLE_CHORDS;
    if (d.tab === undefined) d.tab = SAMPLE_TAB;
    let previewTab = null;

    root.innerHTML = `
    <nav class="crumbs"><a href="#sarkilar">${icon('back')} Şarkılar</a></nav>
    <header class="ph">
        <p class="kicker">${isNew ? 'Yeni şarkı' : 'Şarkıyı düzenle'}</p>
        <h1>${isNew ? 'Şarkı ekle' : esc(d.title)}</h1>
        <p class="lede">Şarkı yalnızca bu tarayıcıda saklanır. Paylaşmak için kaydettikten sonra "Paylaş" ile metnini kopyalayıp gönderebilirsin.</p>
    </header>
    <form class="editor" id="songForm" novalidate>
        <div class="ed-grid">
            <label class="fld fld-wide"><span>Şarkı adı</span><input id="fTitle" required maxlength="120" value="${esc(d.title)}" placeholder="Ör. Bir şarkı"></label>
            <label class="fld fld-wide"><span>Sanatçı ya da kaynak</span><input id="fArtist" maxlength="120" value="${esc(d.artist)}" placeholder="Ör. Anonim"></label>
            <div class="fld"><span>Tür</span>${seg('kind', [['chords', 'Akorlu'], ['tab', 'Tab']], d.kind)}</div>
            <div class="fld"><span>Seviye</span>${seg('level', [['1', 'Başlangıç'], ['2', 'Orta'], ['3', 'İleri']], String(d.level))}</div>
            <label class="fld"><span>Ton</span><input id="fKey" maxlength="8" value="${esc(d.key)}" placeholder="Ör. Am"></label>
            <label class="fld"><span>Tempo (BPM)</span><input id="fTempo" type="number" min="30" max="260" value="${d.tempo}"></label>
            <label class="fld"><span>Ölçü</span><select id="fTime">${TIMES.map(t => `<option ${t === d.time ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
            <label class="fld"><span>Capo</span><input id="fCapo" type="number" min="0" max="12" value="${d.capo || 0}"></label>
            <label class="fld fld-chords"><span>Ritim kalıbı</span><input id="fStrum" maxlength="16" value="${esc(d.strum || '')}" placeholder="D-DU-UDU"></label>
            <label class="fld fld-wide"><span>Notlar</span><input id="fNotes" maxlength="2000" value="${esc(d.notes || '')}" placeholder="Çalarken dikkat edilecekler"></label>
        </div>
        <details class="paste" ${prefill ? 'open' : ''}>
            <summary>${icon('copy')} Yapıştır ve dönüştür</summary>
            <p class="hint">İnternetten ya da notlarından bir tab (<code>e|---0---|</code> satırları) veya akorların sözlerin üstünde durduğu bir metin yapıştır. Perde biçimine çevrilip aşağıya yerleşir.</p>
            <textarea id="pasteText" class="code" rows="7" spellcheck="false" placeholder="e|-------0-------|&#10;B|-----1---1-----|&#10;G|---2-------2---|&#10;…&#10;&#10;ya da&#10;&#10;Am          G&#10;Şarkı sözü burada"></textarea>
            <div class="row-actions"><button type="button" class="btn btn-primary" id="pasteGo">Dönüştür</button><span class="hint" id="pasteInfo"></span></div>
        </details>
        <div class="ed-cols">
            <div class="ed-src">
                <label class="fld"><span id="srcLabel"></span><textarea id="fBody" class="code" rows="14" spellcheck="false"></textarea></label>
                <details class="help" open>
                    <summary>Nasıl yazılır?</summary>
                    <div id="helpBody"></div>
                </details>
            </div>
            <div class="ed-prev">
                <span class="tb-label">Önizleme</span>
                <div id="preview" class="preview"></div>
            </div>
        </div>
        <p class="note-err" id="formErr" hidden></p>
        <div class="row-actions">
            <button type="submit" class="btn btn-primary">${icon('check')} Kaydet</button>
            <a class="btn" href="${isNew ? '#sarkilar' : `#sarki-${esc(d.id)}`}">Vazgeç</a>
            ${isNew ? '' : `<button type="button" class="btn btn-quiet" id="delBtn">${icon('trash')} Sil</button>`}
        </div>
        <div class="confirm" id="delConfirm" hidden>
            <p>"${esc(d.title)}" silinsin mi? Bu geri alınamaz.</p>
            <div class="row-actions"><button type="button" class="btn btn-danger" id="delYes">Evet, sil</button><button type="button" class="btn" id="delNo">Vazgeç</button></div>
        </div>
    </form>`;

    const $ = s => root.querySelector(s);
    const bodyEl = $('#fBody');
    const preview = $('#preview');

    function setKind(kind) {
        d.kind = kind;
        bodyEl.value = kind === 'tab' ? d.tab : d.body;
        $('#srcLabel').textContent = kind === 'tab' ? 'Tab' : 'Sözler ve akorlar';
        root.querySelector('.fld-chords').hidden = kind === 'tab';
        $('#helpBody').innerHTML = kind === 'tab' ? `
            <p>Ölçüleri <code>|</code> ile, notaları boşlukla ayır.</p>
            <ul>
                <li><code>3.2</code> → 3. tel, 2. perde</li>
                <li><code>5.3+4.2</code> → iki nota aynı anda</li>
                <li><code>:0.5</code> → süre (1 = dörtlük, 0.5 = sekizlik, 2 = ikilik). Yazmazsan bir önceki süre geçerli.</li>
                <li><code>-</code> → es · <code>[Am]</code> → notanın üstüne akor adı</li>
            </ul>` : `
            <ul>
                <li>Akoru, değiştiği hecenin hemen önüne köşeli parantezle yaz: <code>[Am]Söz</code></li>
                <li>Bölüm başlığı: <code>{c: Nakarat}</code></li>
                <li>Nakarat bloğu: <code>{soc}</code> … <code>{eoc}</code></li>
                <li>Sadece akor satırı: <code>[Am] [G] [F] [E]</code></li>
            </ul>
            <p>Ritim kalıbı sekizlik dilimlerle yazılır: <code>D</code> aşağı, <code>U</code> yukarı, <code>-</code> boş. 4/4 için 8 dilim, ör. <code>D-DU-UDU</code>.</p>
            <p class="muted">Telifli şarkıların sözlerini yalnızca kendi kişisel çalışman için ekle.</p>`;
        updatePreview();
    }

    function updatePreview() {
        if (d.kind === 'tab') d.tab = bodyEl.value; else d.body = bodyEl.value;
        previewTab?.destroy(); previewTab = null;
        if (d.kind === 'tab') {
            preview.innerHTML = '';
            const t = parseTab(d.tab);
            if (t.errors.length) preview.insertAdjacentHTML('beforeend', `<p class="note-err">${esc(t.errors.slice(0, 4).join(' · '))}</p>`);
            previewTab = renderTab(preview, t, {});
        } else {
            preview.innerHTML = `<div class="cp">${renderChordPro(parseChordPro(d.body))}</div>`;
        }
    }

    let tmr;
    bodyEl.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(updatePreview, 250); });
    bindSegs($('#songForm'), (name, v) => {
        if (name === 'kind') { if (d.kind === 'tab') d.tab = bodyEl.value; else d.body = bodyEl.value; setKind(v); }
        if (name === 'level') d.level = +v;
    });
    setKind(d.kind);

    $('#pasteGo').addEventListener('click', () => {
        const raw = $('#pasteText').value;
        if (!raw.trim()) { $('#pasteInfo').textContent = 'Önce bir metin yapıştır.'; return; }
        const r = convertPaste(raw);
        if (r.kind === 'tab') d.tab = r.text; else d.body = r.text;
        root.querySelectorAll('[data-seg="kind"] [data-v]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.v === r.kind)));
        setKind(r.kind);
        $('#pasteInfo').textContent = `${r.kind === 'tab' ? 'Tab' : 'Akorlu metin'} olarak çevrildi. ${r.info}`;
    });

    $('#songForm').addEventListener('submit', e => {
        e.preventDefault();
        const err = $('#formErr');
        const title = $('#fTitle').value.trim();
        if (!title) { err.hidden = false; err.textContent = 'Şarkıya bir ad ver.'; $('#fTitle').focus(); return; }
        if (d.kind === 'tab') d.tab = bodyEl.value; else d.body = bodyEl.value;
        const clean = sanitizeSong({
            ...d, title, artist: $('#fArtist').value.trim(), key: $('#fKey').value.trim(),
            tempo: $('#fTempo').value, time: $('#fTime').value, capo: $('#fCapo').value,
            strum: $('#fStrum').value, notes: $('#fNotes').value.trim()
        });
        if (d.kind === 'tab' && !parseTab(clean.tab).events.length) { err.hidden = false; err.textContent = 'Tabda çalınacak nota yok. Örneğe bak: 3.2 = 3. tel 2. perde.'; return; }
        if (isNew) store.songs.unshift(clean);
        else {
            clean.id = d.id;
            const i = store.songs.findIndex(s => s.id === d.id);
            if (i >= 0) store.songs[i] = clean; else store.songs.unshift(clean);
        }
        save();
        toast('Şarkı kaydedildi');
        location.hash = `#sarki-${clean.id}`;
    });

    $('#delBtn')?.addEventListener('click', () => { $('#delConfirm').hidden = false; });
    $('#delNo')?.addEventListener('click', () => { $('#delConfirm').hidden = true; });
    $('#delYes')?.addEventListener('click', () => {
        store.songs = store.songs.filter(s => s.id !== d.id);
        save();
        toast('Şarkı silindi');
        location.hash = '#sarkilar';
    });

    return () => { previewTab?.destroy(); clearTimeout(tmr); };
}

