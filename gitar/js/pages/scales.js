// Diziler ve pozisyonlar: tüm klavye, I–XII. pozisyon, pentatonik kutular / tel başına 3 nota
import { Fretboard } from '../fretboard.js';
import { playPos, Clock, audioTime } from '../audio.js';
import { SCALES, scaleById, noteName, keyPref, stepPattern, isNatural, mod12, degreeName } from '../theory.js';
import { onSettings, takeIntent, markPracticed, settings } from '../state.js';
import { scalePositions, patternCount, roman, ascendingOrder, fretSpan } from '../positions.js';
import { seg, bindSegs, icon } from '../ui.js';

const VIEWS = [['position', 'Pozisyon'], ['pattern', 'Kalıp'], ['all', 'Tüm klavye']];

export default {
    title: 'Pozisyonlar',
    mount(root) {
        const intent = takeIntent() || {};
        const st = {
            root: intent.root ?? 0, scale: intent.scale || 'major', view: intent.view || 'position',
            index: intent.index || 1, label: 'name', bpm: 92
        };
        const clock = new Clock();

        root.innerHTML = `
        <header class="ph">
            <p class="kicker">Diziler ve pozisyonlar</p>
            <h1>Doğal notalar, pozisyon pozisyon</h1>
            <p class="lede"><strong>C majör</strong> dizisi doğal notaların ta kendisidir. Bir pozisyon seç, elini oraya koy ve her perdeye bir parmak ver. Sonra kaydır: notalar aynı, şekil değişir.</p>
        </header>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Kök</span><div class="seg seg-notes" data-seg="root" role="radiogroup" id="rootSeg"></div></div>
        </div>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Dizi</span>${seg('scale', SCALES.map(s => [s.id, s.name]), st.scale, 'id="scaleSeg"')}</div>
        </div>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Görünüm</span>${seg('view', VIEWS, st.view)}</div>
            <div class="tb-group stepper" id="stepper">
                <button type="button" class="iconbtn" id="prevPos" aria-label="Önceki">${icon('back')}</button>
                <span class="step-label" id="posLabel" aria-live="polite"></span>
                <button type="button" class="iconbtn" id="nextPos" aria-label="Sonraki">${icon('arrow')}</button>
            </div>
            <div class="tb-group"><span class="tb-label">Etiket</span><span id="labelSegBox"></span></div>
        </div>
        <section class="stage">
            <div class="stage-head">
                <div class="row-actions">
                    <button type="button" class="btn btn-primary" id="playBtn">${icon('play')} Yukarı ve aşağı çal</button>
                    <label class="tempo"><span>Tempo</span><input type="range" id="bpm" min="40" max="200" step="2" value="${st.bpm}"><b id="bpmVal">${st.bpm}</b></label>
                </div>
                <p class="readout" id="scaleReadout" aria-live="polite"></p>
            </div>
            <div id="scaleBoard"></div>
        </section>
        <section class="scale-info" id="scaleInfo"></section>`;

        const $ = s => root.querySelector(s);
        const fb = new Fretboard($('#scaleBoard'), {
            label: 'Dizi klavyesi',
            onTap(s, f) {
                playPos(s, f);
                fb.flash({ s, f, kind: 'hot', note: true, pref: pref() }, 600);
            }
        });

        const sc = () => scaleById(st.scale);
        const pref = () => keyPref(st.root, sc().type);
        const maxIndex = () => st.view === 'pattern' ? patternCount(st.scale) : 12;

        function markers() {
            return scalePositions({ root: st.root, scale: st.scale, view: st.view, index: st.index, frets: Math.max(fb.fretCount, 12) });
        }

        function labelFor(m) {
            if (st.label === 'degree') return m.deg;
            if (st.label === 'finger') return m.finger ? String(m.finger) : m.f === 0 ? '0' : '';
            return noteName(m.pc, pref());
        }

        function paint() {
            const ms = markers();
            const [lo, hi] = ms.length ? fretSpan(ms) : [0, 12];
            const need = Math.max(settings.frets, hi);
            if (fb.fretCount !== need) fb.setFrets(Math.min(24, need));
            fb.setMarkers(ms.map(m => ({
                s: m.s, f: m.f, text: labelFor(m),
                kind: m.kind === 'stretch' ? 'stretch' : m.kind === 'blue' ? 'blue' : m.isRoot ? 'root' : 'note'
            })));
            fb.setShade(st.view === 'all' ? null : st.view === 'position' ? [st.index === 1 ? 0 : st.index, st.index + 3] : [lo, hi]);

            // Kök seçici
            $('#rootSeg').innerHTML = Array.from({ length: 12 }, (_, pc) =>
                `<button type="button" role="radio" data-v="${pc}" aria-checked="${pc === st.root}" class="${isNatural(pc) ? '' : 'is-acc'}">${noteName(pc, keyPref(pc, sc().type))}</button>`).join('');

            // Adım göstergesi
            const stepper = $('#stepper');
            stepper.hidden = st.view === 'all';
            if (st.view === 'position') {
                $('#posLabel').innerHTML = `<b>${roman(st.index)}. pozisyon</b> <span>${st.index === 1 ? 'boş teller + 1–4' : `${st.index}–${st.index + 3}`}. perde</span>`;
            } else if (st.view === 'pattern') {
                const n = patternCount(st.scale);
                $('#posLabel').innerHTML = `<b>${st.index}. ${n === 5 ? 'kutu' : 'kalıp'}</b> <span>${lo}–${hi}. perde · ${n === 5 ? 'telde 2 nota' : 'telde 3 nota'}</span>`;
            }
            const labels = [['name', 'Nota'], ['degree', 'Derece']];
            if (st.view === 'position') labels.push(['finger', 'Parmak']);
            if (st.label === 'finger' && st.view !== 'position') st.label = 'name';
            $('#labelSegBox').innerHTML = seg('label', labels, st.label);

            // Bilgi
            const s = sc();
            const names = s.steps.map(x => noteName(st.root + x, pref()));
            $('#scaleReadout').innerHTML = `<b>${noteName(st.root, pref())} ${s.name.toLowerCase()}</b> <span>${names.join(' · ')}</span>`;
            $('#scaleInfo').innerHTML = `
                <div class="fact"><strong>Formül</strong><p class="mono">${stepPattern(s.steps).join(' – ')}</p><p class="muted">T tam ses (2 perde), Y yarım ses (1 perde)</p></div>
                <div class="fact"><strong>Dereceler</strong><p class="degrees">${s.steps.map((x, i) => `<span><b>${names[i]}</b><small>${degreeName(x)}</small></span>`).join('')}</p></div>
                <div class="fact"><strong>${s.name}</strong><p>${s.alt}${st.scale === 'major' && st.root === 0 ? '. Sadece doğal notalardan oluşur; A doğal minör ile aynı notaları paylaşır.' : ''}${st.scale === 'minor' && st.root === 9 ? '. C majörle aynı notalar: doğal notalar, A\'dan başlayarak.' : ''}</p></div>
                <div class="fact"><strong>Nasıl çalışılır</strong><p>${st.view === 'position' ? 'İşaret parmağın pozisyonun ilk perdesinde dursun. Kesik çizgili notalar esneme: serçe parmağı bir perde ileri uzat.' : st.view === 'pattern' ? 'Kalıbı ezberle, sonra bir sonrakiyle birleştir. Her kalıbın üst kenarı bir sonrakinin alt kenarıdır.' : 'Kök notaları (turuncu) bul ve aralarındaki şekilleri gör. Sonra pozisyon görünümüne geç.'}</p></div>`;
        }

        bindSegs(root, (name, v) => {
            stop();
            if (name === 'root') st.root = +v;
            if (name === 'scale') { st.scale = v; if (st.view === 'pattern') st.index = Math.min(st.index, patternCount(v)); }
            if (name === 'view') { st.view = v; st.index = 1; }
            if (name === 'label') st.label = v;
            paint();
            if (name === 'root') playPos(6, mod12(st.root - 4) || 12);
        });

        $('#prevPos').addEventListener('click', () => { stop(); st.index = st.index <= 1 ? maxIndex() : st.index - 1; paint(); });
        $('#nextPos').addEventListener('click', () => { stop(); st.index = st.index >= maxIndex() ? 1 : st.index + 1; paint(); });

        const bpm = $('#bpm');
        bpm.addEventListener('input', () => { st.bpm = +bpm.value; $('#bpmVal').textContent = st.bpm; });

        // ===== Çal =====
        const playBtn = $('#playBtn');
        function stop() {
            clock.stop();
            fb.setActive([]);
            playBtn.innerHTML = `${icon('play')} Yukarı ve aşağı çal`;
        }
        playBtn.addEventListener('click', () => {
            if (clock.running) { stop(); return; }
            let ms = markers();
            if (st.view === 'all') ms = scalePositions({ root: st.root, scale: st.scale, view: 'pattern', index: 1 });
            const up = ascendingOrder(ms);
            const seq = up.concat(up.slice(0, -1).reverse());
            let i = 0;
            let t = audioTime() + 0.08;
            markPracticed();
            playBtn.innerHTML = `${icon('stop')} Durdur`;
            clock.start(until => {
                const gap = 60 / st.bpm / 2;
                while (i < seq.length && t < until) {
                    const m = seq[i];
                    playPos(m.s, m.f, { when: t, dur: gap * 1.8 });
                    clock.at(t, () => fb.setActive([{ s: m.s, f: m.f, text: labelFor(m) }]));
                    t += gap;
                    i++;
                }
                if (i === seq.length) { clock.at(t, stop); i++; }
            });
        });

        paint();
        const off = onSettings(paint);
        return () => { off(); clock.stop(); fb.destroy(); };
    }
};
