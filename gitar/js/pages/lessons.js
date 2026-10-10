// Ders listesi ve tek ders sayfası
import { Fretboard } from '../fretboard.js';
import { playPos, strum, Clock, audioTime } from '../audio.js';
import { pcAt, noteName, isNatural, parseChord, chordLongName, prettyChord, mod12, chordPref } from '../theory.js';
import { store, save, markPracticed, onSettings, setIntent } from '../state.js';
import { LESSONS } from '../data/lessons.js';
import { OPEN_CHORDS, shapeVoicing, voicingNotes } from '../chords.js';
import { chordBox } from '../chordbox.js';
import { ascendingOrder } from '../positions.js';
import { icon, esc, toast } from '../ui.js';

/** 'E:5@G' → E formu, 5, kök G · 'open:Am' → açık Am */
function chordFromSpec(spec) {
    const [form, rest] = spec.split(':');
    if (form === 'open') return OPEN_CHORDS.find(c => c.name === rest) || null;
    const [qual, root] = rest.split('@');
    const r = parseChord(root).root;
    const name = root + qual;
    return shapeVoicing(form, r, qual, name);
}

function list(root) {
    const done = LESSONS.filter(l => store.lessons[l.id]).length;
    root.innerHTML = `
    <header class="ph">
        <p class="kicker">Dersler · ${done} / ${LESSONS.length} tamamlandı</p>
        <h1>Tellerden bare akora</h1>
        <p class="lede">Her ders birkaç dakikalık bir anlatım, dokunup dinleyebileceğin bir klavye ve bir alıştırmadan oluşur. Sırayla git; bildiğin dersleri atlayabilirsin.</p>
        <span class="meter meter-lg"><i style="width:${Math.round(done / LESSONS.length * 100)}%"></i></span>
    </header>
    <ol class="lesson-list">
        ${LESSONS.map(l => `
        <li class="${store.lessons[l.id] ? 'is-done' : ''}">
            <a href="#ders-${l.id}">
                <span class="l-num">${l.id.padStart(2, '0')}</span>
                <span class="l-main">
                    <strong>${l.title}</strong>
                    <span>${l.summary}</span>
                </span>
                <span class="l-meta"><span class="tag">${l.tag}</span><span>${l.minutes} dk</span></span>
                <span class="l-check" aria-label="${store.lessons[l.id] ? 'Tamamlandı' : 'Tamamlanmadı'}">${store.lessons[l.id] ? icon('check') : ''}</span>
            </a>
        </li>`).join('')}
    </ol>`;
    return null;
}

function detail(root, id) {
    const idx = LESSONS.findIndex(l => l.id === id);
    if (idx < 0) { location.hash = '#dersler'; return null; }
    const L = LESSONS[idx];
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    const cleanups = [];
    const clock = new Clock();
    cleanups.push(() => clock.stop());

    const chords = (L.chords || []).map(chordFromSpec).filter(Boolean);

    root.innerHTML = `
    <nav class="crumbs"><a href="#dersler">${icon('back')} Dersler</a><span>Ders ${L.id} / ${LESSONS.length}</span></nav>
    <header class="ph">
        <p class="kicker">${L.tag} · ${L.minutes} dakika</p>
        <h1>${L.title}</h1>
    </header>
    <div class="lesson">
        <article class="prose">${L.body}</article>
        ${L.figure ? `
        <section class="stage">
            <div class="stage-head">
                <div class="row-actions">
                    ${L.figure.play ? `<button type="button" class="btn btn-primary" id="lessonPlay">${icon('play')} Dinle</button>` : ''}
                    ${L.figure.control === 'note' ? '<div class="seg seg-notes" data-seg="note" role="radiogroup" id="lessonNotes"></div>' : ''}
                </div>
                <p class="readout" id="lessonReadout" aria-live="polite">${L.legend || 'Notalara dokunarak dinle.'}</p>
            </div>
            <div id="lessonBoard"></div>
        </section>` : ''}
        ${chords.length ? `
        <section class="stage">
            <div class="chord-strip" id="lessonChords">
                ${chords.map((c, i) => `
                <button type="button" class="chord-card${i === 0 ? ' is-on' : ''}" data-i="${i}">
                    ${chordBox(c, { root: parseChord(c.name).root })}
                    <strong>${esc(prettyChord(c.name))}</strong>
                    <span>${c.rootFret ? `${c.form === 'E' ? '6' : '5'}. tel ${c.rootFret}. perde` : chordLongName(c.name)}</span>
                </button>`).join('')}
            </div>
            <p class="readout" id="chordReadout"></p>
            <div id="lessonChordBoard"></div>
        </section>` : ''}
        <aside class="tip"><strong>İpucu</strong><p>${L.tip}</p></aside>
        <section class="practice">
            <h2 class="h3">Alıştırma</h2>
            <div class="row-actions">
                ${L.practice.map((p, i) => `<a class="btn" href="${p.href}" data-p="${i}">${p.label} ${icon('arrow')}</a>`).join('')}
            </div>
        </section>
        <div class="lesson-foot">
            <button type="button" class="btn ${store.lessons[L.id] ? '' : 'btn-primary'}" id="doneBtn" aria-pressed="${!!store.lessons[L.id]}">
                ${store.lessons[L.id] ? `${icon('check')} Tamamlandı` : 'Dersi tamamladım'}
            </button>
            <div class="pager">
                ${prev ? `<a class="btn btn-quiet" href="#ders-${prev.id}">${icon('back')} ${prev.title}</a>` : ''}
                ${next ? `<a class="btn btn-quiet" href="#ders-${next.id}">${next.title} ${icon('arrow')}</a>` : ''}
            </div>
        </div>
    </div>`;

    // Alıştırma bağlantıları: hazır ayarla aç
    root.querySelectorAll('[data-p]').forEach(a => a.addEventListener('click', () => {
        const p = L.practice[+a.dataset.p];
        if (p.intent) setIntent(p.intent);
    }));

    // Tamamlandı
    root.querySelector('#doneBtn').addEventListener('click', e => {
        const b = e.currentTarget;
        if (store.lessons[L.id]) delete store.lessons[L.id];
        else { store.lessons[L.id] = Date.now(); markPracticed(); toast(next ? `Sıradaki ders: ${next.title}` : 'Bütün dersleri bitirdin!'); }
        save();
        const on = !!store.lessons[L.id];
        b.setAttribute('aria-pressed', String(on));
        b.classList.toggle('btn-primary', !on);
        b.innerHTML = on ? `${icon('check')} Tamamlandı` : 'Dersi tamamladım';
    });

    // Şekil
    if (L.figure) {
        const fig = L.figure;
        const readout = root.querySelector('#lessonReadout');
        let note = fig.defaultNote ?? 0;
        const fb = new Fretboard(root.querySelector('#lessonBoard'), {
            frets: fig.frets,
            label: L.title,
            onTap(s, f) {
                playPos(s, f);
                const pc = pcAt(s, f);
                fb.flash({ s, f, note: true, kind: 'hot' }, 600);
                readout.innerHTML = `<b>${noteName(pc)}</b> <span>${s}. tel · ${f === 0 ? 'boş' : f + '. perde'}</span>`;
            }
        });
        cleanups.push(() => fb.destroy());
        const paint = () => {
            fb.setMarkers(fig.build(note));
            if (fig.shade) fb.setShade(fig.shade);
            const ns = root.querySelector('#lessonNotes');
            if (ns) ns.innerHTML = Array.from({ length: 12 }, (_, pc) => `<button type="button" role="radio" data-v="${pc}" aria-checked="${pc === note}" class="${isNatural(pc) ? '' : 'is-acc'}">${noteName(pc)}</button>`).join('');
        };
        paint();
        cleanups.push(onSettings(paint));

        root.querySelector('#lessonNotes')?.addEventListener('click', e => {
            const b = e.target.closest('[data-v]');
            if (!b) return;
            note = +b.dataset.v;
            paint();
            playPos(6, mod12(note - 4) || 12);
        });

        const playBtn = root.querySelector('#lessonPlay');
        playBtn?.addEventListener('click', () => {
            if (clock.running) { clock.stop(); fb.setActive([]); playBtn.innerHTML = `${icon('play')} Dinle`; return; }
            const seq = fig.play === 'ascending'
                ? (() => { const up = ascendingOrder(fig.build(note)); return up.concat(up.slice(0, -1).reverse()).map(m => [m.s, m.f]); })()
                : fig.play;
            const gap = seq.length > 14 ? 0.32 : 0.45;
            let i = 0;
            let t = audioTime() + 0.1;
            playBtn.innerHTML = `${icon('stop')} Durdur`;
            clock.start(until => {
                while (i < seq.length && t < until) {
                    const [s, f] = seq[i];
                    playPos(s, f, { when: t, dur: gap * 1.6 });
                    clock.at(t, () => fb.setActive([{ s, f, note: true }]));
                    t += gap;
                    i++;
                }
                if (i >= seq.length) {
                    clock.at(t, () => { clock.stop(); fb.setActive([]); playBtn.innerHTML = `${icon('play')} Dinle`; });
                    i++;
                }
            });
        });
    }

    // Akorlar
    if (chords.length) {
        const readout = root.querySelector('#chordReadout');
        const fb = new Fretboard(root.querySelector('#lessonChordBoard'), { frets: 12, label: 'Akorun klavyedeki yeri', onTap: (s, f) => playPos(s, f) });
        cleanups.push(() => fb.destroy());
        let cur = 0;
        const show = i => {
            cur = i;
            const c = chords[i];
            const rootPc = parseChord(c.name).root;
            const notes = voicingNotes(c);
            fb.setMarkers([
                ...notes.map(n => ({ ...n, note: true, pref: chordPref(c.name), kind: pcAt(n.s, n.f) === rootPc ? 'root' : 'note', sub: c.fingers[6 - n.s] ? String(c.fingers[6 - n.s]) : undefined })),
                ...c.frets.map((f, i2) => f < 0 ? { s: 6 - i2, f: 0, kind: 'muted' } : null).filter(Boolean)
            ]);
            fb.setBarres(c.barre ? [{ f: c.barre.fret, from: 6 - c.barre.from, to: 6 - c.barre.to }] : []);
            readout.innerHTML = `<b>${esc(prettyChord(c.name))}</b> <span>${chordLongName(c.name)} · ${notes.map(n => noteName(pcAt(n.s, n.f), chordPref(c.name))).join(' ')}</span>`;
            root.querySelectorAll('.chord-card').forEach((b, k) => b.classList.toggle('is-on', k === i));
        };
        show(0);
        cleanups.push(onSettings(() => show(cur)));
        root.querySelector('#lessonChords').addEventListener('click', e => {
            const b = e.target.closest('.chord-card');
            if (!b) return;
            show(+b.dataset.i);
            strum(voicingNotes(chords[+b.dataset.i]), { dur: 2 });
        });
    }

    return () => cleanups.forEach(fn => fn());
}

export default {
    title: (param, name) => name === 'ders' ? (LESSONS.find(l => l.id === param)?.title || 'Ders') : 'Dersler',
    mount(root, param, name) {
        return name === 'ders' ? detail(root, param) : list(root);
    }
};
