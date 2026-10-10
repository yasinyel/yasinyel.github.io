// Akorlar: açık akorlar, bare (E ve A formu), power chord, akor bulucu, geçiş antrenmanı
import { Fretboard } from '../fretboard.js';
import { strum, arpeggio, playPos, click, Clock, audioTime } from '../audio.js';
import { parseChord, chordLongName, prettyChord, noteName, pcAt, isNatural, letterName, mod12, chordPref } from '../theory.js';
import { store, save, onSettings, takeIntent, markPracticed, settings, updateSettings } from '../state.js';
import { OPEN_CHORDS, OPEN_GROUPS, SHAPE_QUALITIES, shapeVoicing, voicingsFor, voicingNotes } from '../chords.js';
import { chordBox } from '../chordbox.js';
import { seg, bindSegs, icon, esc, toast } from '../ui.js';

const TABS = [['open', 'Açık akorlar'], ['barre', 'Bare akorlar'], ['power', 'Power chord'], ['find', 'Akor bulucu'], ['trainer', 'Geçiş antrenmanı']];
const TRAINER_CHORDS = [...OPEN_CHORDS.filter(c => c.group !== 'pow').map(c => c.name), 'Bb', 'B', 'F#m', 'C#m', 'Gm', 'Cm', 'Fm'];
const asciiName = (pc, pref) => letterName(pc, pref).replace('♯', '#').replace('♭', 'b');

export default {
    title: 'Akorlar',
    mount(root) {
        const intent = takeIntent() || {};
        const st = {
            tab: intent.tab || 'open',
            current: OPEN_CHORDS[0],
            form: intent.form || 'E', qual: '', root: 5,
            pForm: 'E', pSize: '3', pRoot: 7,
            find: 'D/F#',
            tr: { a: 'Am', b: 'C', c: '', d: '', mode: 'metro', bpm: 70, beats: 4, strum: true }
        };
        const cleanups = [];
        const clock = new Clock();
        cleanups.push(() => clock.stop());

        root.innerHTML = `
        <header class="ph">
            <p class="kicker">Akorlar</p>
            <h1>Açık akordan bare akora</h1>
            <p class="lede">Bir akora dokun: şeması, klavyedeki yeri, parmak numaraları ve sesi. Bare ve power chord şekillerini her köke taşıyabilirsin.</p>
        </header>
        <div class="toolbar">${seg('tab', TABS, st.tab, 'id="tabSeg"')}</div>
        <section class="stage chord-stage" id="chordStage">
            <div class="cs-box" id="csBox"></div>
            <div class="cs-main">
                <div class="cs-head">
                    <div><h2 class="cs-name" id="csName"></h2><p class="cs-sub" id="csSub"></p></div>
                    <div class="row-actions">
                        <button type="button" class="btn btn-primary" id="strumBtn">${icon('play')} Tıngırdat</button>
                        <button type="button" class="btn" id="arpBtn">Tek tek</button>
                    </div>
                </div>
                <div id="csBoard"></div>
            </div>
        </section>
        <div id="tabBody"></div>`;

        const $ = s => root.querySelector(s);
        const stage = $('#chordStage');
        const fb = new Fretboard($('#csBoard'), { frets: 5, label: 'Akorun klavyedeki yeri', onTap: (s, f) => playPos(s, f) });
        cleanups.push(() => fb.destroy());

        // ===== Seçili akor =====
        function show(v, play = false) {
            if (!v) return;
            st.current = v;
            const c = parseChord(v.name);
            const rootPc = c ? c.root : null;
            const pref = chordPref(v.name);
            const notes = voicingNotes(v);
            const maxF = Math.max(0, ...v.frets);
            fb.setFrets(Math.min(15, Math.max(5, maxF + 2)));
            fb.setMarkers([
                ...notes.map(n => ({ ...n, text: noteName(pcAt(n.s, n.f), pref), kind: pcAt(n.s, n.f) === rootPc ? 'root' : 'note', sub: v.fingers[6 - n.s] ? String(v.fingers[6 - n.s]) : undefined })),
                ...v.frets.map((f, i) => f < 0 ? { s: 6 - i, f: 0, kind: 'muted' } : null).filter(Boolean)
            ]);
            fb.setBarres(v.barre ? [{ f: v.barre.fret, from: 6 - v.barre.from, to: 6 - v.barre.to }] : []);
            $('#csBox').innerHTML = chordBox(v, { root: rootPc, notes: true, pref });
            $('#csName').textContent = prettyChord(v.name);
            const where = v.rootFret ? ` · kök ${v.form === 'E' ? '6' : '5'}. telde ${v.rootFret}. perde` : '';
            const tones = [...new Set(notes.map(n => noteName(pcAt(n.s, n.f), pref)))].join(' ');
            $('#csSub').innerHTML = `${esc(chordLongName(v.name))}${where}<br><span class="muted">Notalar: ${tones} · ${v.frets.map(f => f < 0 ? '×' : f).join(' ')}</span>`;
            root.querySelectorAll('[data-chord-i]').forEach(b => b.classList.toggle('is-on', b.dataset.key === v.frets.join(',') + v.name));
            if (play) strum(notes, { dur: 2.2 });
        }
        $('#strumBtn').addEventListener('click', () => { strum(voicingNotes(st.current), { dur: 2.2 }); markPracticed(); });
        $('#arpBtn').addEventListener('click', () => arpeggio(voicingNotes(st.current)));

        // Kartlar
        let cardList = [];
        const card = (v, sub) => {
            const i = cardList.push(v) - 1;
            const c = parseChord(v.name);
            return `<button type="button" class="chord-card" data-chord-i="${i}" data-key="${esc(v.frets.join(',') + v.name)}">
                ${chordBox(v, { root: c ? c.root : undefined })}
                <strong>${esc(prettyChord(v.name))}</strong>
                ${sub ? `<span>${sub}</span>` : ''}
            </button>`;
        };

        // ===== Sekmeler =====
        function renderTab() {
            st.stopTrainer?.();
            st.stopTrainer = null;
            clock.stop();
            cardList = [];
            const body = $('#tabBody');
            stage.hidden = st.tab === 'trainer';

            if (st.tab === 'open') {
                body.innerHTML = OPEN_GROUPS.map(([g, label]) => `
                <section class="block">
                    <h2 class="h3">${label}</h2>
                    <div class="chord-grid">${OPEN_CHORDS.filter(c => c.group === g).map(v => card(v, chordLongName(v.name))).join('')}</div>
                </section>`).join('');
                show(st.current && st.current.kind === 'open' ? st.current : OPEN_CHORDS[0]);
            }

            if (st.tab === 'barre') {
                const pref = settings.accidental;
                const v = shapeVoicing(st.form, st.root, st.qual, asciiName(st.root, pref) + st.qual);
                body.innerHTML = `
                <div class="toolbar">
                    <div class="tb-group"><span class="tb-label">Form</span>${seg('form', [['E', 'E formu · kök 6. telde'], ['A', 'A formu · kök 5. telde']], st.form)}</div>
                    <div class="tb-group"><span class="tb-label">Tür</span>${seg('qual', SHAPE_QUALITIES, st.qual)}</div>
                </div>
                <div class="toolbar"><div class="tb-group"><span class="tb-label">Kök</span>
                    <div class="seg seg-notes" data-seg="root" role="radiogroup">${Array.from({ length: 12 }, (_, pc) => `<button type="button" role="radio" data-v="${pc}" aria-checked="${pc === st.root}" class="${isNatural(pc) ? '' : 'is-acc'}">${noteName(pc)}</button>`).join('')}</div>
                </div></div>
                <section class="block">
                    <h2 class="h3">${st.form} formu: kökün yerine göre bütün akorlar</h2>
                    <p class="lede-sm">Şekil hiç değişmez; sadece işaret parmağının bare yaptığı perde değişir. ${st.form === 'E' ? '6.' : '5.'} teldeki notaları bildiğin an her akoru bulursun.</p>
                    <div class="chord-grid chord-grid-sm">${Array.from({ length: 12 }, (_, k) => {
                        const pc = mod12((st.form === 'E' ? 4 : 9) + k + 1);
                        const vv = shapeVoicing(st.form, pc, st.qual, asciiName(pc, pref) + st.qual);
                        return card(vv, `${vv.rootFret}. perde`);
                    }).join('')}</div>
                </section>
                <aside class="tip"><strong>Bare tutmanın püf noktaları</strong>
                    <p>İşaret parmağının kemikli yanını kullan · başparmak sapın arkasında, orta parmak hizasında · perde teline yakın bas · sıkmak yerine kolun ağırlığını kullan · telleri tek tek çalıp boğuk olanı bul.</p>
                </aside>`;
                show(v);
            }

            if (st.tab === 'power') {
                const v = powerVoicing();
                body.innerHTML = `
                <div class="toolbar">
                    <div class="tb-group"><span class="tb-label">Kök</span>${seg('pForm', [['E', '6. telde'], ['A', '5. telde']], st.pForm)}</div>
                    <div class="tb-group"><span class="tb-label">Şekil</span>${seg('pSize', [['2', '2 nota'], ['3', '3 nota (oktavlı)']], st.pSize)}</div>
                    ${settings.tone !== 'drive' ? `<button type="button" class="btn btn-quiet" id="driveBtn">Distorsiyonu aç</button>` : ''}
                </div>
                <div class="toolbar"><div class="tb-group"><span class="tb-label">Nota</span>
                    <div class="seg seg-notes" data-seg="pRoot" role="radiogroup">${Array.from({ length: 12 }, (_, pc) => `<button type="button" role="radio" data-v="${pc}" aria-checked="${pc === st.pRoot}" class="${isNatural(pc) ? '' : 'is-acc'}">${noteName(pc)}</button>`).join('')}</div>
                </div></div>
                <section class="block">
                    <h2 class="h3">${st.pForm === 'E' ? '6.' : '5.'} telde doğal notalar üzerinde power chord</h2>
                    <div class="chord-grid chord-grid-sm">${[0, 2, 4, 5, 7, 9, 11].map(pc => {
                        const vv = powerVoicing(pc);
                        return card(vv, `${vv.rootFret}. perde`);
                    }).join('')}</div>
                </section>
                <aside class="tip"><strong>Temiz power chord</strong><p>Çalmadığın telleri sustur: işaret parmağının ucu bir üst teli, parmakların alt yüzü alttaki ince telleri hafifçe tutar. Sağ el avucunu köprüye yaslayarak (palm mute) daha sıkı bir ses elde edersin.</p></aside>`;
                $('#driveBtn')?.addEventListener('click', () => { updateSettings({ tone: 'drive' }); renderTab(); });
                show(v);
            }

            if (st.tab === 'find') {
                body.innerHTML = `
                <form class="finder" id="finder">
                    <label for="findInput" class="tb-label">Akor adı</label>
                    <input id="findInput" type="text" autocomplete="off" spellcheck="false" value="${esc(st.find)}" placeholder="Ör. F#m7, Bb, D/F#, Cadd9">
                    <button type="submit" class="btn btn-primary">Bul</button>
                </form>
                <p class="chips" id="findExamples">${['F#m', 'Bb', 'D/F#', 'Cadd9', 'E7sus4', 'Bm7b5', 'Gmaj7', 'C/G', 'Ddim7', 'A9'].map(x => `<button type="button" class="chip" data-ex="${x}">${prettyChord(x)}</button>`).join('')}</p>
                <div id="findOut"></div>`;
                const run = () => {
                    const q = $('#findInput').value.trim();
                    st.find = q;
                    const out = $('#findOut');
                    const c = parseChord(q);
                    if (!q) { out.innerHTML = ''; return; }
                    if (!c || c.qual === null) {
                        out.innerHTML = `<p class="note-err">"${esc(q)}" bir akor adı olarak anlaşılamadı. Kök harfi büyük yaz (A–G), ardından tür ekle: Am, F#m7, Bb, Dsus4, C/G.</p>`;
                        return;
                    }
                    cardList = [];
                    const vs = voicingsFor(q);
                    if (!vs.length) { out.innerHTML = `<p class="note-err">Bu akor için basılabilir bir şekil bulamadım.</p>`; return; }
                    out.innerHTML = `<p class="lede-sm"><b>${esc(prettyChord(q))}</b>: ${esc(chordLongName(q))}. ${vs.length} şekil bulundu; kolaydan zora.</p>
                        <div class="chord-grid">${vs.map(v => card(v, v.kind === 'open' ? 'açık akor' : v.kind === 'barE' ? `E formu · ${v.rootFret}. perde` : v.kind === 'barA' ? `A formu · ${v.rootFret}. perde` : 'bulunan şekil')).join('')}</div>`;
                    show(vs[0]);
                };
                $('#finder').addEventListener('submit', e => { e.preventDefault(); run(); });
                $('#findExamples').addEventListener('click', e => {
                    const b = e.target.closest('[data-ex]');
                    if (b) { $('#findInput').value = b.dataset.ex; run(); }
                });
                run();
            }

            if (st.tab === 'trainer') renderTrainer(body);
        }

        function powerVoicing(pc = st.pRoot) {
            const v = shapeVoicing(st.pForm, pc, '5', asciiName(pc, settings.accidental) + '5');
            if (st.pSize === '2') {
                const frets = v.frets.slice(), fingers = v.fingers.slice();
                const lastIdx = frets.reduce((a, f, i) => f >= 0 ? i : a, -1);
                frets[lastIdx] = -1; fingers[lastIdx] = 0;
                return { ...v, frets, fingers };
            }
            return v;
        }

        // ===== Geçiş antrenmanı =====
        function renderTrainer(body) {
            const t = st.tr;
            const opt = (sel, allowEmpty) => `${allowEmpty ? `<option value="" ${!sel ? 'selected' : ''}>–</option>` : ''}${TRAINER_CHORDS.map(n => `<option value="${n}" ${n === sel ? 'selected' : ''}>${prettyChord(n)}</option>`).join('')}`;
            const pairs = Object.entries(store.changes).sort((a, b) => b[1] - a[1]).slice(0, 8);
            body.innerHTML = `
            <section class="trainer">
                <div class="toolbar">
                    <div class="tb-group"><span class="tb-label">Yöntem</span>${seg('trMode', [['metro', 'Metronomla'], ['minute', 'Bir dakika']], t.mode)}</div>
                </div>
                <div class="toolbar tr-pick">
                    <label>1. akor <select id="trA">${opt(t.a)}</select></label>
                    <label>2. akor <select id="trB">${opt(t.b)}</select></label>
                    ${t.mode === 'metro' ? `<label>3. akor <select id="trC">${opt(t.c, true)}</select></label>
                    <label>4. akor <select id="trD">${opt(t.d, true)}</select></label>` : ''}
                </div>
                ${t.mode === 'metro' ? `
                <div class="toolbar">
                    <label class="tempo"><span>Tempo</span><input type="range" id="trBpm" min="40" max="160" step="2" value="${t.bpm}"><b id="trBpmVal">${t.bpm}</b></label>
                    <div class="tb-group"><span class="tb-label">Akor başına</span>${seg('trBeats', [['2', '2 vuruş'], ['4', '4 vuruş'], ['8', '8 vuruş']], String(t.beats))}</div>
                    <div class="tb-group"><span class="tb-label">Ses</span>${seg('trStrum', [['true', 'Tık + akor'], ['false', 'Sadece tık']], String(t.strum))}</div>
                </div>` : ''}
                <div class="tr-display">
                    <div class="tr-now"><span class="tb-label" id="trNowLabel">Şimdi</span><b id="trNow">${prettyChord(t.a)}</b><div class="tr-box" id="trNowBox"></div></div>
                    <div class="tr-next"><span class="tb-label" id="trNextLabel">Sonra</span><b id="trNext">${prettyChord(t.b)}</b><div class="tr-box" id="trNextBox"></div></div>
                </div>
                <div class="beats" id="trBeatsView"></div>
                <div class="row-actions tr-actions">
                    <button type="button" class="btn btn-primary btn-lg" id="trGo">${icon('play')} Başlat</button>
                    ${t.mode === 'minute' ? `<button type="button" class="btn btn-lg tr-plus" id="trPlus" disabled>+1 geçiş</button>` : ''}
                </div>
                ${t.mode === 'minute' ? `<p class="hint">Başlat'a bas, bir dakika boyunca iki akor arasında geçiş yap. Her temiz geçişte +1'e ya da boşluk tuşuna bas.</p>` : ''}
                ${pairs.length ? `<div class="records"><span class="tb-label">Bir dakika rekorların</span><div class="chips">${pairs.map(([k, v]) => `<span class="chip">${k.split('|').map(prettyChord).join(' ↔ ')} <b>${v}</b></span>`).join('')}</div></div>` : ''}
            </section>`;

            const list = () => (t.mode === 'minute' ? [t.a, t.b] : [t.a, t.b, t.c, t.d]).filter(Boolean);
            const boxOf = n => { const v = voicingsFor(n)[0]; return v ? chordBox(v, { root: parseChord(n).root }) : ''; };
            const setView = (now, nxt) => {
                $('#trNow').textContent = prettyChord(now); $('#trNowBox').innerHTML = boxOf(now);
                $('#trNext').textContent = prettyChord(nxt); $('#trNextBox').innerHTML = boxOf(nxt);
            };
            setView(list()[0], list()[1] || list()[0]);

            ['A', 'B', 'C', 'D'].forEach(k => {
                const s = $('#tr' + k);
                s?.addEventListener('change', () => { stopTrainer(); t[k.toLowerCase()] = s.value; setView(list()[0], list()[1] || list()[0]); });
            });
            $('#trBpm')?.addEventListener('input', e => { t.bpm = +e.target.value; $('#trBpmVal').textContent = t.bpm; });

            const go = $('#trGo');
            let minuteTimer = null, count = 0;
            function stopTrainer() {
                clock.stop();
                clearInterval(minuteTimer); minuteTimer = null;
                go.innerHTML = `${icon('play')} Başlat`;
                $('#trBeatsView').innerHTML = '';
                const plus = $('#trPlus'); if (plus) plus.disabled = true;
            }
            st.stopTrainer = stopTrainer;
            cleanups.push(() => clearInterval(minuteTimer));

            go.addEventListener('click', () => {
                if (clock.running || minuteTimer) { stopTrainer(); return; }
                markPracticed();
                const chords = list();
                if (t.mode === 'metro') {
                    const beats = t.beats;
                    const beatsView = $('#trBeatsView');
                    beatsView.innerHTML = Array.from({ length: beats }, () => '<i></i>').join('');
                    let beat = 0;
                    let tt = audioTime() + 0.15;
                    go.innerHTML = `${icon('stop')} Durdur`;
                    clock.start(until => {
                        const spb = 60 / t.bpm;
                        while (tt < until) {
                            const bi = beat % beats;
                            const ci = Math.floor(beat / beats) % chords.length;
                            const name = chords[ci];
                            click(tt, bi === 0 ? 2 : 1);
                            if (t.strum && bi === 0) {
                                const v = voicingsFor(name)[0];
                                if (v) strum(voicingNotes(v), { when: tt, dur: spb * beats * 0.95, vel: 0.6 });
                            }
                            const b2 = beat;
                            clock.at(tt, () => {
                                const k = b2 % beats;
                                const c2 = Math.floor(b2 / beats) % chords.length;
                                if (k === 0) setView(chords[c2], chords[(c2 + 1) % chords.length]);
                                beatsView.querySelectorAll('i').forEach((n, j) => { n.className = j === k ? 'on' : j < k ? 'past' : ''; });
                                root.querySelector('.tr-display')?.classList.toggle('is-soon', k === beats - 1);
                            });
                            beat++;
                            tt += spb;
                        }
                    });
                } else {
                    count = 0;
                    const end = performance.now() + 60000;
                    const plus = $('#trPlus');
                    plus.disabled = false;
                    plus.textContent = '+1 geçiş · 0';
                    let side = 0;
                    setView(chords[0], chords[1]);
                    go.innerHTML = `${icon('stop')} Durdur`;
                    const tick = () => {
                        const left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
                        $('#trBeatsView').innerHTML = `<span class="tr-clock">${left} sn</span>`;
                        if (left <= 0) {
                            const key = [t.a, t.b].sort().join('|');
                            const prev = store.changes[key] || 0;
                            if (count > prev) { store.changes[key] = count; save(); toast(`Yeni rekor: ${count} geçiş`); }
                            else toast(`${count} geçiş · rekorun ${prev}`);
                            stopTrainer();
                            renderTrainer(body);
                        }
                    };
                    tick();
                    minuteTimer = setInterval(tick, 250);
                    plus.onclick = () => {
                        count++;
                        side = 1 - side;
                        plus.textContent = `+1 geçiş · ${count}`;
                        setView(chords[side], chords[1 - side]);
                    };
                }
            });

            const onSpace = e => {
                if (e.code === 'Space' && minuteTimer && !e.target.closest('input, select, textarea')) { e.preventDefault(); $('#trPlus')?.click(); }
            };
            document.addEventListener('keydown', onSpace);
            cleanups.push(() => document.removeEventListener('keydown', onSpace));
        }

        // ===== Olaylar =====
        root.addEventListener('click', e => {
            const b = e.target.closest('[data-chord-i]');
            if (b) show(cardList[+b.dataset.chordI], true);
        });

        bindSegs(root, (name, v) => {
            if (name === 'tab') { st.tab = v; renderTab(); return; }
            if (name === 'form') st.form = v;
            if (name === 'qual') st.qual = v;
            if (name === 'root') st.root = +v;
            if (name === 'pForm') st.pForm = v;
            if (name === 'pSize') st.pSize = v;
            if (name === 'pRoot') st.pRoot = +v;
            if (name === 'trMode') { st.tr.mode = v; }
            if (name === 'trBeats') { st.tr.beats = +v; return; }
            if (name === 'trStrum') { st.tr.strum = v === 'true'; return; }
            renderTab();
            if (['form', 'qual', 'root', 'pForm', 'pSize', 'pRoot'].includes(name)) strum(voicingNotes(st.current), { dur: 2 });
        });

        renderTab();
        cleanups.push(onSettings(p => {
            const relevant = !Object.keys(p).length || 'system' in p || 'accidental' in p || 'tone' in p;
            if (relevant && st.tab !== 'trainer') renderTab();
        }));
        return () => cleanups.forEach(fn => fn());
    }
};
