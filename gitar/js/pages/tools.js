// Araçlar: mikrofonla akort ve metronom
import { ensureAudio, click, Clock, audioTime, referenceTone, getContext } from '../audio.js';
import { TUNING, STRING_LETTER, mod12, letterName, solfegeOf, octaveOf, freqOf } from '../theory.js';
import { markPracticed } from '../state.js';
import { seg, bindSegs, icon } from '../ui.js';

/** YIN perde algılama: frekans (Hz) ya da -1 */
function detectPitch(buf, sr) {
    const W = Math.floor(buf.length / 2);
    const minTau = Math.floor(sr / 1100);
    const maxTau = Math.min(W - 1, Math.floor(sr / 65));
    const d = new Float32Array(maxTau + 1);
    for (let tau = 1; tau <= maxTau; tau++) {
        let sum = 0;
        for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; sum += x * x; }
        d[tau] = sum;
    }
    let running = 0;
    d[0] = 1;
    for (let tau = 1; tau <= maxTau; tau++) {
        running += d[tau];
        d[tau] = running ? d[tau] * tau / running : 1;
    }
    let tau = -1;
    for (let t = minTau; t <= maxTau; t++) {
        if (d[t] < 0.12) {
            while (t + 1 <= maxTau && d[t + 1] < d[t]) t++;
            tau = t;
            break;
        }
    }
    if (tau < 0) return -1;
    const a = d[tau - 1] ?? d[tau], b = d[tau], c = d[tau + 1] ?? d[tau];
    const shift = (a + c - 2 * b) ? (a - c) / (2 * (a + c - 2 * b)) : 0;
    return sr / (tau + shift);
}

const BEATS = { '2/4': [2, 1], '3/4': [3, 1], '4/4': [4, 1], '6/8': [6, 3] };
const SUBS = [['1', 'Yok'], ['2', 'Sekizlik'], ['3', 'Üçleme'], ['4', 'On altılık']];

export default {
    title: 'Akort ve metronom',
    mount(root) {
        const cleanups = [];
        const met = { bpm: 80, time: '4/4', sub: 1, accent: true, trainer: false, every: 4, add: 5, max: 160 };

        root.innerHTML = `
        <header class="ph">
            <p class="kicker">Araçlar</p>
            <h1>Akort et, tempoyu tut</h1>
            <p class="lede">Akort aleti telefonunun ya da bilgisayarının mikrofonunu kullanır; ses hiçbir yere gönderilmez. Metronomla her alıştırmayı yavaş başlat, temiz çalınca hızlandır.</p>
        </header>

        <div class="tools">
            <section class="tool tuner" aria-labelledby="tunerTitle">
                <h2 class="h3" id="tunerTitle">Akort</h2>
                <div class="gauge-wrap">
                    <svg class="gauge" viewBox="0 0 240 134" aria-hidden="true">
                        <path class="g-arc" d="M45.6 60.95 A95 95 0 0 1 194.4 60.95"/>
                        <path class="g-zone" d="M${120 - 95 * Math.sin(5 / 50 * 0.9)} ${120 - 95 * Math.cos(5 / 50 * 0.9)} A95 95 0 0 1 ${120 + 95 * Math.sin(5 / 50 * 0.9)} ${120 - 95 * Math.cos(5 / 50 * 0.9)}"/>
                        ${Array.from({ length: 11 }, (_, i) => {
                            const a = ((i - 5) / 5) * 0.9;
                            const r1 = 95, r2 = i === 5 ? 78 : i % 5 === 0 ? 82 : 86;
                            return `<line class="g-tick" x1="${120 + r1 * Math.sin(a)}" y1="${120 - r1 * Math.cos(a)}" x2="${120 + r2 * Math.sin(a)}" y2="${120 - r2 * Math.cos(a)}"/>`;
                        }).join('')}
                        <text class="g-lbl" x="34" y="50">♭ −50</text><text class="g-lbl" x="206" y="50">+50 ♯</text><text class="g-lbl g-zero" x="120" y="14">0</text>
                        <g id="needle"><line class="g-needle" x1="120" y1="120" x2="120" y2="30"/></g>
                        <circle class="g-hub" cx="120" cy="120" r="6"/>
                    </svg>
                    <div class="tn-read">
                        <b id="tnNote">–</b>
                        <span id="tnSub">Mikrofonu aç ve bir teli çal</span>
                    </div>
                </div>
                <div class="row-actions">
                    <button type="button" class="btn btn-primary" id="micBtn">${icon('mic')} Mikrofonu aç</button>
                </div>
                <p class="note-err" id="micErr" hidden></p>
                <div class="strings-ref">
                    <span class="tb-label">Referans sesler (standart akort)</span>
                    <div class="ref-row" id="refRow">
                        ${[6, 5, 4, 3, 2, 1].map(s => `<button type="button" class="ref" data-s="${s}"><b>${STRING_LETTER[s - 1]}</b><small>${s}. tel · ${freqOf(TUNING[s - 1]).toFixed(1)} Hz</small></button>`).join('')}
                    </div>
                </div>
                <details class="help">
                    <summary>Nasıl akort edilir?</summary>
                    <ol>
                        <li>Mikrofonu aç ve bir teli tek başına çal; diğer telleri elinle sustur.</li>
                        <li>İbre solda ise ses pes: burguyu teli gerecek yöne çevir. Sağda ise tiz: gevşet.</li>
                        <li>Hep pesten tize doğru akort et: biraz gevşetip hedefe yukarı doğru gel, tel daha iyi oturur.</li>
                        <li>Ortadaki yeşil bölgede (±5 sent) tel akortludur. Bütün telleri bitirince bir tur daha kontrol et.</li>
                    </ol>
                </details>
            </section>

            <section class="tool metronome" aria-labelledby="metTitle">
                <h2 class="h3" id="metTitle">Metronom</h2>
                <div class="bpm-row">
                    <button type="button" class="iconbtn iconbtn-lg" id="bpmDown" aria-label="Yavaşlat">${icon('minus')}</button>
                    <div class="bpm-big"><b id="bpmBig">${met.bpm}</b><span>BPM</span></div>
                    <button type="button" class="iconbtn iconbtn-lg" id="bpmUp" aria-label="Hızlandır">${icon('plus')}</button>
                </div>
                <input type="range" id="bpmRange" min="30" max="240" value="${met.bpm}" aria-label="Tempo">
                <div class="beats beats-lg" id="metBeats"></div>
                <div class="row-actions">
                    <button type="button" class="btn btn-primary btn-lg" id="metGo">${icon('play')} Başlat</button>
                    <button type="button" class="btn" id="tapBtn">Tap tempo</button>
                </div>
                <div class="set-grid">
                    <div class="set-row"><span class="set-label">Ölçü</span>${seg('mTime', Object.keys(BEATS).map(k => [k, k]), met.time)}</div>
                    <div class="set-row"><span class="set-label">Alt bölüm</span>${seg('mSub', SUBS, String(met.sub))}</div>
                    <div class="set-row"><span class="set-label">Vurgu</span>${seg('mAccent', [['true', 'İlk vuruş'], ['false', 'Yok']], 'true')}</div>
                    <div class="set-row"><span class="set-label">Hız antrenörü</span>${seg('mTrainer', [['false', 'Kapalı'], ['true', 'Açık']], 'false')}</div>
                    <div class="set-row" id="trainerRow" hidden>
                        <span class="set-label">Her</span>
                        <span class="range-pick">
                            <select id="tEvery" aria-label="Kaç ölçüde bir">${[2, 4, 8, 16].map(n => `<option ${n === met.every ? 'selected' : ''}>${n}</option>`).join('')}</select><span>ölçüde</span>
                            <select id="tAdd" aria-label="Kaç BPM artsın">${[2, 4, 5, 10].map(n => `<option ${n === met.add ? 'selected' : ''}>${n}</option>`).join('')}</select><span>BPM artır, en fazla</span>
                            <select id="tMax" aria-label="En yüksek tempo">${[100, 120, 140, 160, 180, 200, 240].map(n => `<option ${n === met.max ? 'selected' : ''}>${n}</option>`).join('')}</select>
                        </span>
                    </div>
                </div>
                <p class="hint">Boşluk tuşu metronomu başlatır ve durdurur.</p>
            </section>
        </div>`;

        const $ = s => root.querySelector(s);

        // ===================== Akort =====================
        let stream = null, raf = 0, analyser = null, srcNode = null;
        const history = [];
        const needle = $('#needle');
        $('#refRow').addEventListener('click', e => {
            const b = e.target.closest('[data-s]');
            if (b) referenceTone(TUNING[+b.dataset.s - 1]);
        });

        function stopMic() {
            cancelAnimationFrame(raf);
            stream?.getTracks().forEach(t => t.stop());
            srcNode?.disconnect();
            stream = null; analyser = null; srcNode = null;
            $('#micBtn').innerHTML = `${icon('mic')} Mikrofonu aç`;
            $('#tnNote').textContent = '–';
            $('#tnSub').textContent = 'Mikrofonu aç ve bir teli çal';
            needle.style.transform = 'rotate(0deg)';
            root.querySelector('.tuner').classList.remove('is-in', 'is-live');
        }
        cleanups.push(stopMic);

        $('#micBtn').addEventListener('click', async () => {
            if (stream) { stopMic(); return; }
            const err = $('#micErr');
            err.hidden = true;
            if (!navigator.mediaDevices?.getUserMedia) {
                err.hidden = false;
                err.textContent = 'Bu tarayıcı mikrofona erişemiyor. Sayfayı https ile ve güncel bir tarayıcıda aç. Bu sırada referans sesleriyle kulaktan akort edebilirsin.';
                return;
            }
            try {
                const ctx = ensureAudio();
                stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
                srcNode = ctx.createMediaStreamSource(stream);
                analyser = ctx.createAnalyser();
                analyser.fftSize = 4096;
                srcNode.connect(analyser);
                $('#micBtn').innerHTML = `${icon('stop')} Mikrofonu kapat`;
                root.querySelector('.tuner').classList.add('is-live');
                loop();
            } catch (e) {
                stream = null;
                err.hidden = false;
                err.textContent = e && e.name === 'NotAllowedError'
                    ? 'Mikrofon izni verilmedi. Tarayıcının adres çubuğundaki kilit simgesinden mikrofona izin verip tekrar dene.'
                    : 'Mikrofon açılamadı. Başka bir uygulama kullanıyor olabilir ya da bu ortam mikrofona izin vermiyor.';
            }
        });

        const buf = new Float32Array(4096);
        let lastRun = 0;
        function loop(t = 0) {
            raf = requestAnimationFrame(loop);
            if (!analyser || t - lastRun < 55) return;
            lastRun = t;
            analyser.getFloatTimeDomainData(buf);
            let rms = 0;
            for (let i = 0; i < buf.length; i += 4) rms += buf[i] * buf[i];
            rms = Math.sqrt(rms / (buf.length / 4));
            if (rms < 0.008) { history.length = 0; root.querySelector('.tuner').classList.remove('is-in'); return; }
            const f = detectPitch(buf, getContext().sampleRate);
            if (f < 0) return;
            history.push(f);
            if (history.length > 5) history.shift();
            const sorted = [...history].sort((a, b) => a - b);
            const med = sorted[Math.floor(sorted.length / 2)];
            if (Math.abs(f - med) / med > 0.04) { history.length = 0; history.push(f); }
            const midiF = 69 + 12 * Math.log2(med / 440);
            const midi = Math.round(midiF);
            const cents = Math.round((midiF - midi) * 100);
            const pc = mod12(midi);
            // En yakın tel
            let best = 1, bd = Infinity;
            for (let s = 1; s <= 6; s++) { const dd = Math.abs(TUNING[s - 1] - midiF); if (dd < bd) { bd = dd; best = s; } }
            $('#tnNote').innerHTML = `${letterName(pc)}<sub>${octaveOf(midi)}</sub>`;
            const toString = TUNING[best - 1] === midi ? ` · ${best}. tel (${STRING_LETTER[best - 1]})` : '';
            $('#tnSub').textContent = `${solfegeOf(pc)} · ${med.toFixed(1)} Hz · ${cents > 0 ? '+' : ''}${cents} sent${toString}`;
            const ang = Math.max(-50, Math.min(50, cents)) / 50 * 51.6;
            needle.style.transform = `rotate(${ang.toFixed(1)}deg)`;
            root.querySelector('.tuner').classList.toggle('is-in', Math.abs(cents) <= 5);
        }

        // ===================== Metronom =====================
        const clock = new Clock();
        cleanups.push(() => clock.stop());
        const go = $('#metGo');
        const beatsEl = $('#metBeats');
        const setBpm = v => {
            met.bpm = Math.max(30, Math.min(240, Math.round(v)));
            $('#bpmBig').textContent = met.bpm;
            $('#bpmRange').value = met.bpm;
        };
        const paintBeats = () => {
            const [n] = BEATS[met.time];
            beatsEl.innerHTML = Array.from({ length: n }, () => '<i></i>').join('');
        };
        paintBeats();

        function startMet() {
            markPracticed();
            go.innerHTML = `${icon('stop')} Durdur`;
            let tick = 0, bar = 0;
            let t = audioTime() + 0.1;
            clock.start(until => {
                const [n, group] = BEATS[met.time];
                while (t < until) {
                    const sub = met.sub;
                    const beat = Math.floor(tick / sub) % n;
                    const isBeat = tick % sub === 0;
                    let level = 0;
                    if (isBeat) level = beat === 0 && met.accent ? 2 : (group > 1 && beat % group === 0 && met.accent ? 1.5 : 1);
                    click(t, level >= 2 ? 2 : level >= 1 ? 1 : 0);
                    if (isBeat) {
                        const b = beat;
                        clock.at(t, () => beatsEl.querySelectorAll('i').forEach((x, j) => { x.className = j === b ? 'on' : ''; }));
                    }
                    t += 60 / met.bpm / sub;
                    tick++;
                    if (tick % (n * sub) === 0) {
                        bar++;
                        if (met.trainer && bar % met.every === 0 && met.bpm < met.max) {
                            const nb = Math.min(met.max, met.bpm + met.add);
                            clock.at(t, () => setBpm(nb));
                            met.bpm = nb;
                        }
                    }
                }
            });
        }
        function stopMet() {
            clock.stop();
            go.innerHTML = `${icon('play')} Başlat`;
            beatsEl.querySelectorAll('i').forEach(x => { x.className = ''; });
        }
        go.addEventListener('click', () => (clock.running ? stopMet() : startMet()));
        $('#bpmDown').addEventListener('click', () => setBpm(met.bpm - 1));
        $('#bpmUp').addEventListener('click', () => setBpm(met.bpm + 1));
        $('#bpmRange').addEventListener('input', e => setBpm(+e.target.value));

        const taps = [];
        $('#tapBtn').addEventListener('click', () => {
            const now = performance.now();
            if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
            taps.push(now);
            if (taps.length > 6) taps.shift();
            if (taps.length >= 2) {
                const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
                setBpm(60000 / avg);
            }
            click(audioTime(), 1);
        });

        bindSegs(root, (name, v) => {
            if (name === 'mTime') { met.time = v; paintBeats(); }
            if (name === 'mSub') met.sub = +v;
            if (name === 'mAccent') met.accent = v === 'true';
            if (name === 'mTrainer') { met.trainer = v === 'true'; $('#trainerRow').hidden = !met.trainer; }
        });
        $('#tEvery').addEventListener('change', e => { met.every = +e.target.value; });
        $('#tAdd').addEventListener('change', e => { met.add = +e.target.value; });
        $('#tMax').addEventListener('change', e => { met.max = +e.target.value; });

        const onKey = e => {
            if (e.code !== 'Space' || e.target.closest('input, select, textarea, button')) return;
            e.preventDefault();
            clock.running ? stopMet() : startMet();
        };
        document.addEventListener('keydown', onKey);
        cleanups.push(() => document.removeEventListener('keydown', onKey));

        return () => cleanups.forEach(fn => fn());
    }
};
