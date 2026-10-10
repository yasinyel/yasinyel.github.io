// Nota avı: üç oyun, isteğe bağlı 60 saniyelik sprint ve ısı haritası
import { Fretboard } from '../fretboard.js';
import { playPos } from '../audio.js';
import { pcAt, isNatural, noteName, NATURALS, STRING_LETTER, mod12 } from '../theory.js';
import { store, save, markPracticed, onSettings, takeIntent } from '../state.js';
import { seg, multi, bindSegs, icon, esc } from '../ui.js';

const MODES = [['name', 'Notayı adlandır'], ['find', 'Perdeyi bul'], ['all', 'Hepsini bul']];
const KEY_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export default {
    title: 'Nota avı',
    mount(root) {
        const saved = store.quiz.cfg || {};
        const intent = takeIntent();
        const cfg = {
            mode: 'name', strings: [1, 2, 3, 4, 5, 6], from: 0, to: 12, naturals: true, timed: false,
            ...saved, ...(intent ? { timed: false, ...intent } : {})
        };
        const score = { ok: 0, bad: 0, streak: 0, times: [] };
        let q = null;          // geçerli soru
        let lock = false;      // geri bildirim sırasında dokunma kapalı
        let lastKey = '';
        let timer = null, endAt = 0;
        let heat = false;
        const timeouts = new Set();
        const later = (fn, ms) => { const t = setTimeout(() => { timeouts.delete(t); fn(); }, ms); timeouts.add(t); };

        const fretOpts = Array.from({ length: 25 }, (_, i) => i);
        root.innerHTML = `
        <header class="ph">
            <p class="kicker">Nota avı</p>
            <h1>Klavyeyi ezberle, sonra unut</h1>
            <p class="lede">Notaları bulmak düşünmeden yapılabilir hâle gelene kadar oyna. Her cevabın kaydedilir; ısı haritası hangi perdelerde zorlandığını gösterir.</p>
        </header>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Oyun</span>${seg('mode', MODES, cfg.mode)}</div>
            <div class="tb-group"><span class="tb-label">Notalar</span>${seg('naturals', [['true', 'Doğal'], ['false', 'Tümü (♯/♭)']], String(cfg.naturals))}</div>
            <div class="tb-group"><span class="tb-label">Süre</span>${seg('timed', [['false', 'Serbest'], ['true', '60 sn sprint']], String(cfg.timed))}</div>
        </div>
        <div class="toolbar">
            <div class="tb-group"><span class="tb-label">Teller</span>${multi('strings', [6, 5, 4, 3, 2, 1].map(s => [s, `${s}<small>${STRING_LETTER[s - 1]}</small>`]), cfg.strings)}</div>
            <div class="tb-group">
                <label class="tb-label" for="qFrom">Perdeler</label>
                <span class="range-pick">
                    <select id="qFrom">${fretOpts.slice(0, 24).map(f => `<option value="${f}" ${f === cfg.from ? 'selected' : ''}>${f}</option>`).join('')}</select>
                    <span>–</span>
                    <select id="qTo" aria-label="Son perde">${fretOpts.slice(1).map(f => `<option value="${f}" ${f === cfg.to ? 'selected' : ''}>${f}</option>`).join('')}</select>
                </span>
            </div>
            <button type="button" class="btn btn-quiet" id="heatBtn" aria-pressed="false">${icon('flame')} Isı haritası</button>
        </div>

        <section class="quiz">
            <div class="scoreboard" aria-live="polite">
                <div><span>Doğru</span><b id="sOk">0</b></div>
                <div><span>Yanlış</span><b id="sBad">0</b></div>
                <div><span>Seri</span><b id="sStreak">0</b></div>
                <div><span>En iyi seri</span><b id="sBest">0</b></div>
                <div><span>Ort. süre</span><b id="sTime">–</b></div>
                <div class="sb-timer" id="sTimerBox" hidden><span>Kalan</span><b id="sTimer">60</b></div>
            </div>
            <div class="prompt" id="prompt"></div>
            <div class="answers" id="answers"></div>
            <div id="quizBoard"></div>
            <div class="heat-legend" id="heatLegend" hidden></div>
        </section>`;

        const $ = s => root.querySelector(s);
        const promptEl = $('#prompt');
        const answersEl = $('#answers');

        const fb = new Fretboard($('#quizBoard'), { label: 'Nota avı klavyesi', onTap: tap });

        // ===== Yardımcılar =====
        const posKey = (s, f) => `${s}.${f}`;
        const stat = (bucket, k) => (store.quiz[bucket][k] ||= [0, 0]);
        function record(s, f, ok) {
            const p = stat('pos', posKey(s, f)); p[1]++; if (ok) p[0]++;
            const n = stat('notes', pcAt(s, f)); n[1]++; if (ok) n[0]++;
        }
        const best = () => (store.quiz.best[cfg.mode] ||= { streak: 0, sprint: 0 });

        function pool() {
            const out = [];
            for (const s of cfg.strings) for (let f = cfg.from; f <= cfg.to; f++) {
                if (!cfg.naturals || isNatural(pcAt(s, f))) out.push({ s, f });
            }
            return out;
        }

        function weighted(items) {
            const w = items.map(({ s, f }) => {
                const p = store.quiz.pos[posKey(s, f)];
                const err = p && p[1] ? (p[1] - p[0]) / p[1] : 0.5;
                return 1 + 3 * err;
            });
            let r = Math.random() * w.reduce((a, b) => a + b, 0);
            for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
            return items[items.length - 1];
        }

        function updateScore() {
            $('#sOk').textContent = score.ok;
            $('#sBad').textContent = score.bad;
            $('#sStreak').textContent = score.streak;
            $('#sBest').textContent = best().streak;
            const t = score.times;
            $('#sTime').textContent = t.length ? (t.reduce((a, b) => a + b, 0) / t.length / 1000).toFixed(1) + ' sn' : '–';
        }

        function answered(ok) {
            if (ok) {
                score.ok++; score.streak++;
                if (score.streak > best().streak) best().streak = score.streak;
            } else {
                score.bad++; score.streak = 0;
            }
            if (q && q.t0) score.times.push(Math.min(15000, performance.now() - q.t0));
            if (score.times.length > 30) score.times.shift();
            markPracticed();
            save();
            updateScore();
        }

        // ===== Soru üret =====
        function next() {
            lock = false;
            fb.setActive([]);
            fb.setFocusString(null);
            const items = pool();
            if (!items.length) {
                q = null;
                promptEl.innerHTML = '<span class="p-sub">Seçili tellerde ve perde aralığında nota yok. En az bir tel seç.</span>';
                answersEl.innerHTML = '';
                fb.setMarkers([]);
                return;
            }
            let pick, tries = 0;
            do { pick = weighted(items); tries++; } while (posKey(pick.s, pick.f) === lastKey && items.length > 1 && tries < 10);
            lastKey = posKey(pick.s, pick.f);
            const pc = pcAt(pick.s, pick.f);

            if (cfg.mode === 'name') {
                q = { ...pick, pc, t0: performance.now() };
                promptEl.innerHTML = `<span class="p-main">Bu nota hangisi?</span><span class="p-sub">${pick.s}. tel · ${pick.f === 0 ? 'boş' : pick.f + '. perde'}</span>`;
                fb.setMarkers([{ ...pick, kind: 'target', text: '?' }]);
                renderAnswers();
            } else if (cfg.mode === 'find') {
                q = { s: pick.s, pc, t0: performance.now() };
                promptEl.innerHTML = `<span class="p-main">${pick.s}. telde <em>${noteName(pc)}</em> notasını bul</span><span class="p-sub">${STRING_LETTER[pick.s - 1]} teli · ${cfg.from}–${cfg.to}. perdeler arasında</span>`;
                fb.setMarkers([]);
                fb.setFocusString(pick.s);
                answersEl.innerHTML = '';
            } else {
                const targets = items.filter(x => pcAt(x.s, x.f) === pc);
                q = { pc, targets, found: new Set(), t0: performance.now() };
                promptEl.innerHTML = `<span class="p-main">Bütün <em>${noteName(pc)}</em> notalarını bul</span><span class="p-sub" id="allCount">${targets.length} yer · seçili teller, ${cfg.from}–${cfg.to}. perdeler</span>`;
                fb.setMarkers([]);
                answersEl.innerHTML = '';
            }
            fb.setShade(cfg.from > 0 || cfg.to < fb.fretCount ? [cfg.from, cfg.to] : null);
        }

        function renderAnswers() {
            const pcs = cfg.naturals ? NATURALS : Array.from({ length: 12 }, (_, i) => i);
            answersEl.innerHTML = pcs.map(pc => `<button type="button" class="ans${isNatural(pc) ? '' : ' is-acc'}" data-pc="${pc}">${noteName(pc)}</button>`).join('');
        }

        // ===== Cevaplar =====
        function answerName(pc, btn) {
            if (!q || lock || cfg.mode !== 'name') return;
            lock = true;
            const ok = pc === q.pc;
            record(q.s, q.f, ok);
            answered(ok);
            playPos(q.s, q.f);
            fb.setMarkers([{ s: q.s, f: q.f, kind: ok ? 'ok' : 'bad', note: true }]);
            if (btn) btn.classList.add(ok ? 'is-ok' : 'is-wrong');
            if (!ok) {
                answersEl.querySelector(`[data-pc="${q.pc}"]`)?.classList.add('is-ok');
                promptEl.innerHTML = `<span class="p-main">Bu <em>${noteName(q.pc)}</em> idi</span><span class="p-sub">${q.s}. tel · ${q.f === 0 ? 'boş' : q.f + '. perde'} · sen ${noteName(pc)} dedin</span>`;
            }
            later(next, ok ? 600 : 1500);
        }

        function tap(s, f) {
            if (heat) { playPos(s, f); return; }
            if (!q || lock) { playPos(s, f); return; }
            if (cfg.mode === 'name') { playPos(s, f); return; }
            const pc = pcAt(s, f);

            if (cfg.mode === 'find') {
                if (s !== q.s) {
                    playPos(s, f);
                    fb.flash({ s, f, kind: 'ghost', note: true }, 600);
                    promptEl.querySelector('.p-sub').textContent = `Bu soru ${q.s}. tel için`;
                    return;
                }
                lock = true;
                const ok = pc === q.pc;
                record(s, f, ok);
                answered(ok);
                playPos(s, f);
                const correct = [];
                for (let x = 0; x <= fb.fretCount; x++) if (pcAt(s, x) === q.pc && (ok ? x === f : true)) correct.push({ s, f: x, kind: 'ok', note: true });
                fb.setMarkers(ok ? correct : [{ s, f, kind: 'bad', note: true }, ...correct]);
                if (!ok) promptEl.innerHTML = `<span class="p-main">Bu <em>${noteName(pc)}</em>; ${noteName(q.pc)} yeşil olan</span><span class="p-sub">${q.s}. tel</span>`;
                later(next, ok ? 600 : 1700);
                return;
            }

            // Hepsini bul
            const key = posKey(s, f);
            const isTarget = q.targets.some(x => x.s === s && x.f === f);
            playPos(s, f);
            if (isTarget && !q.found.has(key)) {
                q.found.add(key);
                record(s, f, true);
                answered(true);
                q.t0 = performance.now();
                fb.setMarkers(q.targets.filter(x => q.found.has(posKey(x.s, x.f))).map(x => ({ ...x, kind: 'ok', note: true })));
                const left = q.targets.length - q.found.size;
                const c = root.querySelector('#allCount');
                if (c) c.textContent = left ? `${left} yer kaldı` : 'Hepsini buldun!';
                if (!left) { lock = true; later(next, 900); }
            } else if (!isTarget) {
                record(s, f, false);
                answered(false);
                fb.flash({ s, f, kind: 'bad', note: true }, 900);
            }
        }

        answersEl.addEventListener('click', e => {
            const b = e.target.closest('[data-pc]');
            if (b) answerName(+b.dataset.pc, b);
        });

        function onKey(e) {
            if (cfg.mode !== 'name' || e.target.closest('input, select, textarea')) return;
            const k = e.key.toLowerCase();
            if (!(k in KEY_PC)) return;
            let pc = KEY_PC[k];
            if (e.shiftKey && !cfg.naturals) pc = mod12(pc + 1);
            const btn = answersEl.querySelector(`[data-pc="${pc}"]`);
            answerName(pc, btn);
        }
        document.addEventListener('keydown', onKey);

        // ===== Sprint =====
        function startSprint() {
            stopSprint();
            Object.assign(score, { ok: 0, bad: 0, streak: 0, times: [] });
            updateScore();
            $('#sTimerBox').hidden = false;
            endAt = performance.now() + 60000;
            timer = setInterval(() => {
                const left = Math.max(0, Math.ceil((endAt - performance.now()) / 1000));
                $('#sTimer').textContent = left;
                if (left <= 0) finishSprint();
            }, 200);
            next();
        }
        function stopSprint() { clearInterval(timer); timer = null; }
        function finishSprint() {
            stopSprint();
            lock = true;
            q = null;
            timeouts.forEach(clearTimeout); timeouts.clear();
            const b = best();
            const isRecord = score.ok > (b.sprint || 0);
            if (isRecord) b.sprint = score.ok;
            save();
            fb.setMarkers([]);
            fb.setFocusString(null);
            answersEl.innerHTML = '';
            promptEl.innerHTML = `
                <span class="p-main">${isRecord ? 'Yeni rekor!' : 'Süre doldu'} <em>${score.ok}</em> doğru</span>
                <span class="p-sub">${score.bad} yanlış · bu oyunda en iyi sprint: ${b.sprint}</span>
                <button type="button" class="btn btn-primary" id="againBtn">${icon('loop')} Tekrar</button>`;
            $('#againBtn').addEventListener('click', startSprint);
        }

        function showStartCard() {
            stopSprint();
            q = null;
            fb.setMarkers([]);
            fb.setFocusString(null);
            answersEl.innerHTML = '';
            $('#sTimerBox').hidden = false;
            $('#sTimer').textContent = '60';
            promptEl.innerHTML = `
                <span class="p-main">60 saniye: kaç doğru?</span>
                <span class="p-sub">En iyi sprint: ${best().sprint || 0}</span>
                <button type="button" class="btn btn-primary" id="goBtn">${icon('play')} Başlat</button>`;
            $('#goBtn').addEventListener('click', startSprint);
        }

        function restart() {
            store.quiz.cfg = { ...cfg };
            save();
            timeouts.forEach(clearTimeout); timeouts.clear();
            Object.assign(score, { ok: 0, bad: 0, streak: 0, times: [] });
            updateScore();
            if (heat) { paintHeat(); return; }
            if (cfg.timed) showStartCard();
            else { stopSprint(); $('#sTimerBox').hidden = true; next(); }
        }

        // ===== Isı haritası =====
        function paintHeat() {
            const ms = [];
            for (let s = 1; s <= 6; s++) for (let f = 0; f <= fb.fretCount; f++) {
                if (cfg.naturals && !isNatural(pcAt(s, f))) continue;
                const p = store.quiz.pos[posKey(s, f)];
                if (!p || !p[1]) { ms.push({ s, f, kind: 'ghost', note: true }); continue; }
                const acc = p[0] / p[1];
                ms.push({ s, f, kind: 'heat', note: true, color: `hsl(${Math.round(4 + acc * 128)} 68% ${acc > 0.8 ? 38 : 46}%)` });
            }
            fb.setMarkers(ms);
            fb.setShade(null);
            fb.setFocusString(null);
            const notes = Array.from({ length: 12 }, (_, pc) => ({ pc, v: store.quiz.notes[pc] }))
                .filter(x => x.v && x.v[1]).sort((a, b) => a.v[0] / a.v[1] - b.v[0] / b.v[1]);
            promptEl.innerHTML = `<span class="p-main">Isı haritası</span><span class="p-sub">Kırmızı perdelerde sık yanılıyorsun, yeşillerde sağlamsın. Gri olanları henüz hiç sormadım.</span>`;
            answersEl.innerHTML = '';
            const legend = $('#heatLegend');
            legend.hidden = false;
            legend.innerHTML = notes.length
                ? `<span class="tb-label">Notaya göre isabet</span><div class="chips">${notes.map(x => `<span class="chip" style="--h:${Math.round(4 + (x.v[0] / x.v[1]) * 128)}">${esc(noteName(x.pc))} <b>%${Math.round(x.v[0] / x.v[1] * 100)}</b></span>`).join('')}</div>`
                : '<span class="tb-label">Henüz veri yok: birkaç tur oyna, sonra tekrar bak.</span>';
        }

        $('#heatBtn').addEventListener('click', e => {
            heat = !heat;
            e.currentTarget.setAttribute('aria-pressed', String(heat));
            if (heat) { stopSprint(); timeouts.forEach(clearTimeout); timeouts.clear(); paintHeat(); }
            else { $('#heatLegend').hidden = true; restart(); }
        });

        // ===== Ayar değişiklikleri =====
        bindSegs(root, (name, v) => {
            if (name === 'mode') cfg.mode = v;
            else if (name === 'naturals') cfg.naturals = v === 'true';
            else if (name === 'timed') cfg.timed = v === 'true';
            else if (name === 'strings') cfg.strings = v.map(Number);
            restart();
        });
        const fromSel = $('#qFrom'), toSel = $('#qTo');
        const onRange = () => {
            let a = +fromSel.value, b = +toSel.value;
            if (b <= a) { b = Math.min(24, a + 1); toSel.value = b; }
            cfg.from = a; cfg.to = b;
            if (b > fb.fretCount) fb.setFrets(Math.min(24, Math.max(b, 12)));
            restart();
        };
        fromSel.addEventListener('change', onRange);
        toSel.addEventListener('change', onRange);
        if (cfg.to > fb.fretCount) fb.setFrets(Math.min(24, cfg.to));

        const off = onSettings(() => { if (heat) paintHeat(); else if (q && cfg.mode === 'name') renderAnswers(); });
        restart();

        return () => {
            off();
            stopSprint();
            timeouts.forEach(clearTimeout);
            document.removeEventListener('keydown', onKey);
            fb.destroy();
        };
    }
};
