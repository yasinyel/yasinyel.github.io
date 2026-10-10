// Klavye haritası: tüm notalar / doğal notalar / tek nota / boş
import { Fretboard } from '../fretboard.js';
import { playPos, playMidi } from '../audio.js';
import { pcAt, isNatural, midiAt, octaveOf, freqOf, noteName, letterName, solfegeOf, STRING_LETTER, mod12 } from '../theory.js';
import { settings, onSettings, takeIntent } from '../state.js';
import { seg, bindSegs } from '../ui.js';

const SHOW = [['naturals', 'Doğal notalar'], ['all', 'Tüm notalar'], ['one', 'Tek nota'], ['none', 'Boş klavye']];
const LABEL = [['name', 'Nota adı'], ['octave', 'Oktavla'], ['dot', 'Sadece nokta']];

export default {
    title: 'Klavye haritası',
    mount(root) {
        const intent = takeIntent() || {};
        const st = { show: intent.show || 'naturals', label: 'name', note: intent.note ?? 9, tapped: null };

        root.innerHTML = `
        <header class="ph">
            <p class="kicker">Klavye haritası</p>
            <h1>Her nota, her yerde</h1>
            <p class="lede">Bir perdeye dokun: notayı duy, adını ve oktavını gör. Aynı sesin klavyedeki diğer yerleri de halkayla işaretlenir.</p>
        </header>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Göster</span>${seg('show', SHOW, st.show)}</div>
            <div class="tb-group"><span class="tb-label">Etiket</span>${seg('label', LABEL, st.label)}</div>
        </div>
        <div class="toolbar" id="notePick" ${st.show === 'one' ? '' : 'hidden'}>
            <div class="tb-group"><span class="tb-label">Nota</span><div class="seg seg-notes" data-seg="note" role="radiogroup"></div></div>
        </div>
        <section class="stage">
            <div class="stage-head">
                <p class="kicker" id="mapKicker"></p>
                <p class="readout" id="mapReadout" aria-live="polite">Bir perdeye dokun.</p>
            </div>
            <div id="mapBoard"></div>
        </section>
        <section class="facts">
            <div class="fact"><strong>Yarım ses kuralı</strong><p>E–F ve B–C arası 1 perde, diğer doğal notalar arası 2 perde.</p></div>
            <div class="fact"><strong>12. perde</strong><p>Boş telin bir oktav üstü. 12'den sonra her şey baştan tekrar eder.</p></div>
            <div class="fact"><strong>Aynı ses, farklı yer</strong><p>Bir teldeki 5. perde, bir üst teldeki boş tele eşittir. G telinden B teline geçerken 4. perde.</p></div>
        </section>`;

        const readout = root.querySelector('#mapReadout');
        const kicker = root.querySelector('#mapKicker');
        const notePick = root.querySelector('#notePick');
        const noteSeg = root.querySelector('[data-seg="note"]');

        const fb = new Fretboard(root.querySelector('#mapBoard'), { label: 'Klavye haritası', onTap: tap });

        function renderNotePicker() {
            noteSeg.innerHTML = Array.from({ length: 12 }, (_, pc) =>
                `<button type="button" role="radio" data-v="${pc}" aria-checked="${pc === st.note}" class="${isNatural(pc) ? '' : 'is-acc'}">${noteName(pc)}</button>`).join('');
        }

        function labelFor(s, f) {
            if (st.label === 'dot') return '';
            const pc = pcAt(s, f);
            return st.label === 'octave' ? noteName(pc) + octaveOf(midiAt(s, f)) : noteName(pc);
        }

        function paint() {
            const N = fb.fretCount;
            const ms = [];
            for (let s = 1; s <= 6; s++) for (let f = 0; f <= N; f++) {
                const pc = pcAt(s, f);
                let kind = null;
                if (st.show === 'all') kind = isNatural(pc) ? 'note' : 'ghost';
                else if (st.show === 'naturals') kind = isNatural(pc) ? (pc === 0 ? 'root' : 'note') : null;
                else if (st.show === 'one') kind = pc === st.note ? 'root' : null;
                if (kind) ms.push({ s, f, kind, text: labelFor(s, f) });
            }
            if (st.tapped) {
                const m = midiAt(st.tapped.s, st.tapped.f);
                for (let s = 1; s <= 6; s++) {
                    const f = m - midiAt(s, 0);
                    if (f >= 0 && f <= N) {
                        const i = ms.findIndex(x => x.s === s && x.f === f);
                        const mk = { s, f, kind: s === st.tapped.s ? 'hot' : 'same', text: labelFor(s, f) };
                        if (i >= 0) ms[i] = mk; else ms.push(mk);
                    }
                }
            }
            fb.setMarkers(ms);
            const nat = 'C D E F G A B';
            kicker.textContent = st.show === 'naturals' ? `Doğal notalar · ${settings.system === 'solfege' ? 'Do Re Mi Fa Sol La Si' : nat}`
                : st.show === 'all' ? 'Kromatik: 12 notanın hepsi'
                : st.show === 'one' ? `${letterName(st.note)} · ${solfegeOf(st.note)} notasının bütün yerleri`
                : 'Boş klavye: perdelere dokunarak keşfet';
        }

        function tap(s, f) {
            const m = midiAt(s, f);
            playPos(s, f);
            st.tapped = { s, f };
            const pc = mod12(m);
            const others = [];
            for (let x = 1; x <= 6; x++) {
                const ff = m - midiAt(x, 0);
                if (x !== s && ff >= 0 && ff <= fb.fretCount) others.push(`${x}. tel ${ff === 0 ? 'boş' : ff + '. perde'}`);
            }
            readout.innerHTML = `<b>${letterName(pc)}${octaveOf(m)} · ${solfegeOf(pc)}</b>
                <span>${s}. tel (${STRING_LETTER[s - 1]}) · ${f === 0 ? 'boş tel' : f + '. perde'} · ${freqOf(m).toFixed(1)} Hz</span>
                ${others.length ? `<span class="muted">Aynı ses: ${others.join(', ')}</span>` : ''}`;
            paint();
        }

        bindSegs(root, (name, v) => {
            if (name === 'show') { st.show = v; notePick.hidden = v !== 'one'; }
            if (name === 'label') st.label = v;
            if (name === 'note') { st.note = +v; playMidi(52 + mod12(+v - 4)); }
            paint();
        });

        renderNotePicker();
        paint();
        const off = onSettings(() => { renderNotePicker(); paint(); });
        return () => { off(); fb.destroy(); };
    }
};
