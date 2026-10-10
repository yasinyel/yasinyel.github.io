// Ses motoru: Karplus-Strong ile tel sesi, temiz / distorsiyonlu ton, metronom tıkı
// ve ses ile görüntüyü aynı saatte tutan basit bir zamanlayıcı.
import { freqOf, midiAt } from './theory.js';
import { settings, onSettings } from './state.js';

let ctx = null;
let master, comp, toneIn, cleanBus, driveBus;
const buffers = new Map();
const ringing = new Map(); // tel → çalan nota (aynı telde yeni nota eskisini susturur)

function buildChain() {
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master = ctx.createGain();
    master.gain.value = settings.volume;
    comp.connect(master).connect(ctx.destination);

    toneIn = ctx.createGain();

    // Temiz ton: hafif tiz kesme, manyetiğin sıcaklığı
    cleanBus = ctx.createBiquadFilter();
    cleanBus.type = 'lowpass';
    cleanBus.frequency.value = 5200;
    cleanBus.Q.value = 0.7;
    cleanBus.connect(comp);

    // Distorsiyon: ön kazanç → yumuşak kırpma → kabin filtresi
    const pre = ctx.createGain();
    pre.gain.value = 9;
    const shaper = ctx.createWaveShaper();
    const n = 2048, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        curve[i] = Math.tanh(2.6 * x) * 0.9;
    }
    shaper.curve = curve;
    shaper.oversample = '4x';
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 800; mid.gain.value = 4; mid.Q.value = 0.8;
    const cab = ctx.createBiquadFilter();
    cab.type = 'lowpass'; cab.frequency.value = 3400; cab.Q.value = 1.1;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 90;
    const post = ctx.createGain();
    post.gain.value = 0.28;
    pre.connect(hp).connect(shaper).connect(mid).connect(cab).connect(post).connect(comp);
    driveBus = pre;

    routeTone();
}

function routeTone() {
    if (!ctx) return;
    toneIn.disconnect();
    toneIn.connect(settings.tone === 'drive' ? driveBus : cleanBus);
}

onSettings(patch => {
    if (!ctx) return;
    if ('tone' in patch) routeTone();
    if ('volume' in patch) master.gain.setTargetAtTime(settings.volume, ctx.currentTime, 0.02);
});

/** Ses bağlamını hazırlar; tarayıcılar ancak bir dokunuştan sonra izin verir */
export function ensureAudio() {
    if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC({ latencyHint: 'interactive' });
        buildChain();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}
export const audioTime = () => (ctx ? ctx.currentTime : 0);
export const getContext = () => ctx;

// Karplus-Strong: gürültü ile başlayan, her turda biraz yumuşayan bir gecikme hattı
function pluck(midi) {
    if (buffers.has(midi)) return buffers.get(midi);
    const sr = ctx.sampleRate;
    const f = freqOf(midi);
    const N = Math.max(4, Math.floor(sr / f));
    const S = 0.5;                         // yumuşatma (tiz sönümü)
    const seconds = midi < 52 ? 3.6 : midi < 64 ? 3 : 2.4;
    const len = Math.floor(sr * seconds);
    const t60 = midi < 52 ? 3.4 : midi < 64 ? 2.6 : 1.8;
    const rho = Math.pow(0.001, 1 / (f * t60));

    const line = new Float32Array(N);
    let last = 0;
    for (let i = 0; i < N; i++) {          // biraz süzülmüş gürültü: pena darbesi
        const r = Math.random() * 2 - 1;
        last = last * 0.35 + r * 0.65;
        line[i] = last;
    }
    // pena konumu: köprüye yakın çalmanın tınısı
    const pickOffset = Math.max(1, Math.round(N * 0.13));
    const tmp = Float32Array.from(line);
    for (let i = 0; i < N; i++) line[i] = tmp[i] - 0.6 * tmp[(i + pickOffset) % N];

    const out = new Float32Array(len);
    let idx = 0, peak = 0;
    for (let i = 0; i < len; i++) {
        const a = line[idx];
        const b = line[(idx + 1) % N];
        line[idx] = rho * ((1 - S) * a + S * b);
        out[i] = a;
        const v = Math.abs(a);
        if (v > peak) peak = v;
        idx = (idx + 1) % N;
    }
    const gain = peak > 0 ? 0.55 / peak : 1;
    const fadeLen = Math.floor(sr * 0.05);
    for (let i = 0; i < len; i++) {
        out[i] *= gain;
        if (i > len - fadeLen) out[i] *= (len - i) / fadeLen;
    }
    const buffer = ctx.createBuffer(1, len, sr);
    buffer.copyToChannel(out, 0);
    // Gecikme hattı tamsayı olduğu için perdeyi çalma hızıyla tam ayarla
    const rate = f / (sr / (N + S));
    const entry = { buffer, rate };
    buffers.set(midi, entry);
    return entry;
}

/**
 * Bir nota çal.
 * @param {number} midi
 * @param {{when?:number, dur?:number, vel?:number, string?:number}} o
 */
export function playMidi(midi, o = {}) {
    if (!ensureAudio()) return;
    const when = Math.max(o.when ?? ctx.currentTime, ctx.currentTime);
    const { buffer, rate } = pluck(midi);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    const vel = o.vel ?? 0.9;
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel, when + 0.004);
    src.connect(g).connect(toneIn);
    src.start(when);
    if (o.dur) {
        const end = when + o.dur;
        g.gain.setValueAtTime(vel, end);
        g.gain.setTargetAtTime(0, end, 0.06);
        src.stop(end + 0.5);
    }

    if (o.string) {
        const prev = ringing.get(o.string);
        if (prev && prev.when < when) {
            prev.gain.gain.cancelScheduledValues(when);
            prev.gain.gain.setTargetAtTime(0, when, 0.015);
        }
        ringing.set(o.string, { gain: g, when });
    }
    return { src, gain: g };
}

export function playPos(s, f, o = {}) {
    return playMidi(midiAt(s, f), { ...o, string: s });
}

/**
 * Akor tıngırdat. notes: [{s, f}] (kalından inceye sıralanır)
 * dir: 'down' | 'up'
 */
export function strum(notes, o = {}) {
    if (!ensureAudio()) return;
    const when = o.when ?? ctx.currentTime;
    const spread = o.spread ?? 0.022;
    const sorted = [...notes].sort((a, b) => b.s - a.s);
    if (o.dir === 'up') sorted.reverse();
    sorted.forEach((n, i) => playPos(n.s, n.f, { when: when + i * spread, dur: o.dur, vel: (o.vel ?? 0.75) * (1 - i * 0.03), string: n.s }));
}

/** Akoru tek tek çal (arpej) */
export function arpeggio(notes, o = {}) {
    if (!ensureAudio()) return;
    const when = o.when ?? ctx.currentTime;
    const gap = o.gap ?? 0.18;
    [...notes].sort((a, b) => b.s - a.s).forEach((n, i) => playPos(n.s, n.f, { when: when + i * gap, vel: 0.8 }));
}

/** Metronom tıkı: vurgulu vuruş daha tiz */
export function click(when, level = 1) {
    if (!ensureAudio()) return;
    const t = Math.max(when, ctx.currentTime);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = level === 2 ? 1760 : level === 1 ? 1175 : 880;
    const peak = level === 2 ? 0.32 : level === 1 ? 0.2 : 0.09;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = osc.frequency.value; bp.Q.value = 2;
    osc.connect(bp).connect(g).connect(comp);
    osc.start(t);
    osc.stop(t + 0.06);
}

/** Uzun referans sesi (akort için) */
export function referenceTone(midi) {
    return playMidi(midi, { vel: 0.95 });
}

export function silence() {
    if (!ctx) return;
    for (const { gain } of ringing.values()) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
    }
    ringing.clear();
}

/**
 * İleriye bakan zamanlayıcı: ses olaylarını birkaç yüz milisaniye önceden planlar,
 * görsel olayları ise ses saatine göre requestAnimationFrame içinde tetikler.
 */
export class Clock {
    constructor() {
        this.timer = null;
        this.raf = 0;
        this.visual = [];
        this.running = false;
    }

    /** scheduler(until) ses olaylarını until zamanına kadar planlar */
    start(scheduler) {
        if (!ensureAudio()) return;
        this.stop();
        this.running = true;
        this.scheduler = scheduler;
        const tick = () => {
            if (!this.running) return;
            this.scheduler(ctx.currentTime + 0.15);
        };
        tick();
        this.timer = setInterval(tick, 25);
        const frame = () => {
            if (!this.running) return;
            const now = ctx.currentTime;
            while (this.visual.length && this.visual[0].time <= now) {
                const ev = this.visual.shift();
                try { ev.fn(); } catch (e) { console.error(e); }
            }
            this.raf = requestAnimationFrame(frame);
        };
        this.raf = requestAnimationFrame(frame);
    }

    /** Görsel geri çağrıyı ses saatinde 'time' anına planla */
    at(time, fn) {
        const q = this.visual;
        let i = q.length;
        while (i > 0 && q[i - 1].time > time) i--;
        q.splice(i, 0, { time, fn });
    }

    stop() {
        this.running = false;
        clearInterval(this.timer);
        cancelAnimationFrame(this.raf);
        this.visual = [];
    }
}

// Sayfa gizlenince çalan her şeyi kıs
document.addEventListener('visibilitychange', () => {
    if (document.hidden) silence();
});
