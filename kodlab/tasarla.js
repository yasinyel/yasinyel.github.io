// Kodlayalım — Robot Kodla bölüm tasarlayıcı arayüzü
(function () {
    'use strict';
    const T = window.RobotTasarim;
    const $ = (id) => document.getElementById(id);
    const YONLER = ['^', '>', 'v', '<'];
    const ROBOT = (d) => `<svg viewBox="0 0 40 40" style="transform:rotate(${YONLER.indexOf(d) * 90}deg)"><path d="M20 2 L25 8 L15 8 Z" fill="#ffd166"/><rect x="7" y="8" width="26" height="26" rx="8" fill="#1d5fd6"/><rect x="11" y="12" width="18" height="11" rx="4" fill="#e8f0ff"/><circle cx="16" cy="17.5" r="2.4" fill="#0f172a"/><circle cx="24" cy="17.5" r="2.4" fill="#0f172a"/></svg>`;
    const ORNEK = { baslik: 'Yıldız Bahçesi', yazar: '', not: 'Döngü kullanırsan kodun kısalır.', harita: ['>..*..*', '#####.#', '*..*...', '.######', '...*...'], hedef: 9 };
    const kayit = KL.oku('tasarim', null);
    let gen = 8, yuk = 6, izgara = [], arac = '.', yon = '>', boyama = null;

    function izgaraKur(harita) {
        yuk = Math.min(T.EN_FAZLA.h, Math.max(3, harita.length));
        gen = Math.min(T.EN_FAZLA.w, Math.max(3, ...harita.map(s => s.length)));
        izgara = Array.from({ length: yuk }, (_, y) => Array.from({ length: gen }, (_, x) => (harita[y] || '')[x] || ' '));
    }
    const harita = () => izgara.map(s => s.join(''));
    const tasarim = () => ({ baslik: $('baslik').value.trim(), yazar: $('yazar').value.trim(), not: $('not').value.trim(), harita: T.kirp(harita()), hedef: +$('hedef').value });

    function boyutCiz() {
        $('gen').innerHTML = Array.from({ length: T.EN_FAZLA.w - 2 }, (_, i) => `<option ${i + 3 === gen ? 'selected' : ''}>${i + 3}</option>`).join('');
        $('yuk').innerHTML = Array.from({ length: T.EN_FAZLA.h - 2 }, (_, i) => `<option ${i + 3 === yuk ? 'selected' : ''}>${i + 3}</option>`).join('');
    }
    function ciz() {
        const c = Math.max(26, Math.min(52, Math.floor(($('tahta').parentElement.clientWidth - 30) / gen)));
        const t = $('tahta');
        t.style.cssText = `--c:${c}px;grid-template-columns:repeat(${gen}, ${c}px)`;
        t.innerHTML = izgara.map((s, y) => s.map((v, x) => `<div class="h ${v === '#' ? 'w' : v === ' ' ? '' : 'z'} ${YONLER.includes(v) ? 'r' : ''}" data-x="${x}" data-y="${y}" aria-label="${x + 1}. sütun ${y + 1}. satır">${v === '*' ? '<i class="fas fa-star"></i>' : YONLER.includes(v) ? ROBOT(v) : ''}</div>`).join('')).join('');
        denetle();
    }
    function denetle() {
        const s = T.dogrula(tasarim());
        $('sorunlar').innerHTML = s.length ? s.map(x => `<div><i class="fas fa-circle-xmark"></i><span>${x}</span></div>`).join('') : '<div><i class="fas fa-circle-check"></i><span>Bölüm hazır! Önce kendin dene, sonra paylaş.</span></div>';
        $('dene').disabled = $('paylasBtn').disabled = s.length > 0;
        KL.yaz('tasarim', { ...tasarim(), harita: harita() });
        return s;
    }
    function boya(x, y) {
        const deger = arac === 'r' ? yon : arac;
        if (arac === 'r') izgara.forEach(s => s.forEach((v, i) => { if (YONLER.includes(v)) s[i] = '.'; }));
        if (izgara[y][x] === deger) return;
        izgara[y][x] = deger;
        ciz();
        $('paylas').hidden = true;
    }

    $('araclar').addEventListener('click', (e) => {
        const b = e.target.closest('.arac'); if (!b) return;
        arac = b.dataset.a;
        document.querySelectorAll('.arac').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); });
    });
    $('dondur').onclick = () => {
        yon = YONLER[(YONLER.indexOf(yon) + 1) % 4];
        izgara.forEach(s => s.forEach((v, i) => { if (YONLER.includes(v)) s[i] = yon; }));
        ciz();
    };
    $('tahta').addEventListener('pointerdown', (e) => {
        const h = e.target.closest('.h'); if (!h) return;
        e.preventDefault();
        boyama = true;
        boya(+h.dataset.x, +h.dataset.y);
    });
    document.addEventListener('pointermove', (e) => {
        if (!boyama || arac === 'r') return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const h = el && el.closest && el.closest('#tahta .h');
        if (h) boya(+h.dataset.x, +h.dataset.y);
    });
    document.addEventListener('pointerup', () => { boyama = null; });
    $('gen').onchange = $('yuk').onchange = () => {
        const g = +$('gen').value, y = +$('yuk').value;
        izgara = Array.from({ length: y }, (_, yy) => Array.from({ length: g }, (_, xx) => (izgara[yy] || [])[xx] || ' '));
        gen = g; yuk = y; ciz();
    };
    ['baslik', 'yazar', 'not', 'hedef'].forEach(id => $(id).addEventListener('input', () => { denetle(); $('paylas').hidden = true; }));

    const link = () => new URL('robot.html#ozel=' + T.kodla(tasarim()), location.href).href;
    $('dene').onclick = () => { if (!denetle().length) window.open(link(), '_blank'); };
    $('paylasBtn').onclick = () => {
        if (denetle().length) return;
        const url = link();
        $('paylas').innerHTML = `<div class="qr">${QR.svg(url, 200)}</div><div class="kutu"><input readonly value="${url.replace(/"/g, '&quot;')}" aria-label="Bölüm linki"><button class="btn btn-sm" id="kopya"><i class="fas fa-copy"></i> Kopyala</button></div><small style="color:var(--muted)">Linki açan herkes bölümünü Robot Kodla'da oynayabilir. Hesap ya da sunucu gerekmez: bölüm linkin içinde saklanır.</small>`;
        $('paylas').hidden = false;
        $('kopya').onclick = async () => { try { await navigator.clipboard.writeText(url); KL.bildir('Link kopyalandı!'); } catch (e) { $('paylas').querySelector('input').select(); } };
    };
    $('ornek').onclick = () => yukle(ORNEK);
    $('temizle').onclick = () => { if (confirm('Tasarım silinsin mi?')) yukle({ baslik: '', yazar: $('yazar').value, not: '', harita: ['>    ', '     ', '     ', '     '].map(s => s.padEnd(8)), hedef: 8 }); };

    function yukle(t) {
        izgaraKur(t.harita);
        $('baslik').value = t.baslik || ''; $('yazar').value = t.yazar || ''; $('not').value = t.not || ''; $('hedef').value = t.hedef || 8;
        const r = harita().join('').match(/[\^>v<]/); if (r) yon = r[0];
        $('paylas').hidden = true;
        boyutCiz(); ciz();
    }
    window.addEventListener('resize', ciz);
    // Linkle gelen bir bölümü düzenlemek için: tasarla.html#ozel=...
    const gelen = (location.hash.match(/^#ozel=([A-Za-z0-9_-]+)/) || [])[1];
    yukle((gelen && T.coz(gelen)) || (kayit && kayit.harita ? kayit : ORNEK));
    window.__tasarla = { tasarim, link };
})();
