// Kodlayalım — Oyun Atölyesi arayüzü
(function () {
    'use strict';
    const M = window.OyunMotor;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('oyun', { yildiz: {}, proje: {}, deneme: {} });
    const kacis = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64coz = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));

    let gorevNo = 0, gorev = null, proje = null, secili = null, oyun = null, dongu = null, oynatModu = false;
    const tuslar = new Set();

    // ---------- Blok editörü ----------
    const tanim = M.tanim(() => proje ? proje.karakterler.filter(k => k.id !== secili).map(k => [k.id, `${k.emoji} ${kacis(k.ad)}`]) : []);
    const ed = BlokEditor({
        kutu: $('kutu'), alan: $('alan'), tanim,
        kategoriler: ['Olaylar', 'Hareket', 'Görünüm', 'Ses', 'Değişkenler', 'Kontrol', 'Oyun'],
        bosMetin: 'Sarı bir olay bloğunu buraya sürükle, altına yapılacakları ekle',
        kilitli: () => !!oyun,
        uyari: (m) => KL.bildir(m),
        degisti: (m) => { const k = kar(secili); if (k) { k.betikler = m; kaydet(); } }
    });
    const kar = (id) => proje.karakterler.find(k => k.id === id);

    // ---------- Görevler ----------
    const acikMi = (i) => ogretmen || i === 0 || M.GOREVLER[i].serbest || (kayit.yildiz[M.GOREVLER[i - 1].id] || 0) > 0;
    function gorevBarCiz() {
        $('gorevBar').innerHTML = M.GOREVLER.map((g, i) => {
            const y = kayit.yildiz[g.id] || 0;
            return `<button class="${i === gorevNo ? 'sel' : ''} ${y ? 'done' : ''} ${acikMi(i) ? '' : 'kilit'}" data-i="${i}">${g.serbest ? '<i class="fas fa-wand-magic-sparkles"></i>' : i + 1}. ${g.ad}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('');
    }
    $('gorevBar').onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (!acikMi(+b.dataset.i)) { KL.bildir('Önce önceki görevi bitir!'); return; }
        gorevAc(+b.dataset.i);
    };

    function gorevAc(i) {
        durdur();
        gorevNo = i; gorev = M.GOREVLER[i];
        // Yıldız Avcısı görevleri bir öncekinin projesinden devam eder
        const onceki = i > 0 && gorev.seri && M.GOREVLER[i - 1].seri === gorev.seri ? kayit.proje[M.GOREVLER[i - 1].id] : null;
        proje = kayit.proje[gorev.id] ? JSON.parse(JSON.stringify(kayit.proje[gorev.id])) : M.baslangicProjesi(gorev, gorev.serbest ? kayit.proje.kazan : onceki);
        // Görevin gerektirdiği karakterler her zaman olsun
        for (const id of gorev.karakterler) if (!proje.karakterler.some(k => k.id === id)) proje.karakterler.push(M.yeniKar(M.KAR[id]));
        secili = proje.karakterler[proje.karakterler.length - 1].id;
        if (gorev.id === 'dusman') secili = 'dusman';
        if (gorev.id === 'hareket' || gorev.id === 'kazan') secili = 'robot';
        ed.izinliAyarla(gorev.bloklar || Object.keys(tanim));
        gorevKartCiz();
        karakterCiz();
        editorAc();
        gorevBarCiz();
        ciz();
    }

    function gorevKartCiz(sonuc) {
        const g = gorev;
        $('gorevKart').innerHTML = `<h2>${g.serbest ? '' : (gorevNo + 1) + '. '}${g.ad}</h2><p>${g.anlatim}</p>` +
            (g.serbest
                ? `<div class="kontrol" style="margin-top:12px"><button class="btn btn-primary btn-sm" id="paylas"><i class="fas fa-share-nodes"></i> Oyunumu paylaş</button></div><div id="paylasAlan"></div>`
                : `<ul class="denetim">${g.denetimler.map((d, i) => `<li class="${sonuc ? (sonuc[i].gecti ? 'ok' : 'no') : ''}"><i class="fas ${sonuc ? (sonuc[i].gecti ? 'fa-circle-check' : 'fa-circle-xmark') : 'fa-circle'}"></i>${d.ad}</li>`).join('')}</ul>
                   <button class="btn btn-primary btn-sm" id="denetle"><i class="fas fa-clipboard-check"></i> Oyunumu kontrol et</button>
                   <small style="color:var(--muted);display:block;margin-top:6px">Kontrol, oyununu arka planda senin yerine oynayarak yapılır.</small>`);
        if (g.serbest) $('paylas').onclick = paylas;
        else $('denetle').onclick = denetle;
    }

    function denetle() {
        const s = M.denetle(gorev, proje);
        gorevKartCiz(s);
        if (s.every(x => x.gecti)) {
            const deneme = kayit.deneme[gorev.id] || 0;
            const y = deneme <= 1 ? 3 : deneme <= 3 ? 2 : 1;
            kayit.yildiz[gorev.id] = Math.max(kayit.yildiz[gorev.id] || 0, y);
            kaydet(); gorevBarCiz();
            $('kBaslik').textContent = y === 3 ? 'Süper oyun!' : 'Görev tamam!';
            $('kYildiz').innerHTML = KL.yildizHTML(y);
            $('kMetin').textContent = y === 3 ? 'Oyunun bütün kontrolleri geçti!' : `Oyunun ${deneme + 1}. kontrolde geçti. Daha az denemeyle 3 yıldız alabilirsin.`;
            $('kSonraki').hidden = gorevNo === M.GOREVLER.length - 1;
            if (y === 3) KL.konfeti(); else KL.ses('kazan');
            $('kazandi').showModal();
        } else {
            kayit.deneme[gorev.id] = (kayit.deneme[gorev.id] || 0) + 1; kaydet();
            KL.ses('yanlis');
            KL.bildir(`${s.filter(x => !x.gecti).length} kontrol geçmedi. Kırmızı olanlara bak.`);
        }
    }
    $('kKal').onclick = () => $('kazandi').close();
    $('kSonraki').onclick = () => { $('kazandi').close(); gorevAc(gorevNo + 1); };

    // ---------- Karakterler ----------
    function karakterCiz() {
        const serbest = gorev && gorev.serbest;
        const k = kar(secili);
        $('karakterKart').innerHTML = `<h3>Karakterler ${serbest ? '<button class="btn btn-sm" id="karEkle"><i class="fas fa-plus"></i> Ekle</button>' : ''}</h3>
            <div class="kar-liste">${proje.karakterler.map(x => `<button class="kar ${x.id === secili ? 'sel' : ''}" data-id="${x.id}"><span class="e">${x.emoji}</span>${kacis(x.ad)} <small>${x.betikler.length} betik</small></button>`).join('')}</div>
            ${serbest ? `<div class="kar-ayar">
                <input id="karAd" value="${kacis(k.ad)}" maxlength="14" aria-label="Karakter adı" style="width:120px">
                <button class="btn btn-sm" id="karEmoji">${k.emoji} Görünüm</button>
                <button class="btn btn-sm" id="karSil" ${proje.karakterler.length < 2 ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
                <select id="arka" aria-label="Arka plan">${M.ARKALAR.map(([v, a]) => `<option value="${v}" ${proje.arka === v ? 'selected' : ''}>Arka plan: ${a}</option>`).join('')}</select>
            </div><div id="emojiAlan"></div>` : ''}`;
        $('karakterKart').querySelector('.kar-liste').onclick = (e) => {
            const b = e.target.closest('.kar'); if (!b) return;
            secili = b.dataset.id; karakterCiz(); editorAc();
        };
        if (!serbest) return;
        $('karEkle').onclick = () => emojiSec((em) => {
            const id = 'k' + Date.now().toString(36);
            proje.karakterler.push({ id, ad: 'Karakter' + proje.karakterler.length, emoji: em, x: Math.round(Math.random() * 300 - 150), y: Math.round(Math.random() * 200 - 100), boyut: 100, betikler: [] });
            secili = id; kaydet(); karakterCiz(); editorAc(); ciz();
        });
        $('karEmoji').onclick = () => emojiSec((em) => { kar(secili).emoji = em; kaydet(); karakterCiz(); editorAc(); ciz(); });
        $('karSil').onclick = () => {
            if (!confirm('Bu karakter ve kodu silinsin mi?')) return;
            proje.karakterler = proje.karakterler.filter(x => x.id !== secili);
            secili = proje.karakterler[0].id; kaydet(); karakterCiz(); editorAc(); ciz();
        };
        $('karAd').oninput = () => { kar(secili).ad = $('karAd').value || 'Karakter'; kaydet(); editorAc(false); };
        $('arka').onchange = () => { proje.arka = $('arka').value; kaydet(); ciz(); };
    }
    function emojiSec(geri) {
        $('emojiAlan').innerHTML = `<div class="emoji-sec">${M.EMOJILER.map(e => `<button data-e="${e}">${e}</button>`).join('')}</div>`;
        $('emojiAlan').onclick = (e) => { const b = e.target.closest('button'); if (b) { $('emojiAlan').innerHTML = ''; geri(b.dataset.e); } };
    }
    function editorAc(yukle = true) {
        const k = kar(secili);
        $('editorBas').innerHTML = `<span class="e">${k.emoji}</span> ${kacis(k.ad)} karakterinin kodu`;
        if (yukle) ed.yukle(k.betikler);
    }
    function kaydet() { if (!oynatModu) { kayit.proje[gorev.id] = proje; KL.yaz('oyun', kayit); } }

    // ---------- Sahne ----------
    const ctx = $('tuval').getContext('2d');
    const OL = 2; // tuval 960x720, mantıksal 480x360
    const ekranX = (x) => (x + M.GEN) * OL, ekranY = (y) => (M.YUK - y) * OL;
    function arkaCiz(tur) {
        const g = ctx.createLinearGradient(0, 0, 0, 720);
        const R = { uzay: ['#0b1026', '#312e81'], cim: ['#7dd3fc', '#bae6fd'], deniz: ['#38bdf8', '#0c4a6e'], gece: ['#020617', '#1e293b'], beyaz: ['#ffffff', '#f1f5f9'] }[tur] || ['#0b1026', '#312e81'];
        g.addColorStop(0, R[0]); g.addColorStop(1, R[1]);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 720);
        if (tur === 'uzay' || tur === 'gece') { ctx.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { const x = (i * 137) % 960, y = (i * 251) % 720; ctx.globalAlpha = .35 + (i % 5) / 10; ctx.fillRect(x, y, 2, 2); } ctx.globalAlpha = 1; }
        if (tur === 'cim') { ctx.fillStyle = '#4ade80'; ctx.fillRect(0, 560, 960, 160); ctx.fillStyle = '#22c55e'; ctx.fillRect(0, 560, 960, 12); }
    }
    function ciz() {
        const veri = oyun ? oyun : { karakterler: proje.karakterler.map(k => ({ ...k, gorunur: true })), arka: proje.arka, puan: 0, can: 3, durum: 'hazir' };
        arkaCiz(veri.arka || proje.arka);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const k of veri.karakterler) {
            if (!k.gorunur) continue;
            const x = ekranX(k.x), y = ekranY(k.y), boy = 44 * k.boyut / 100 * OL;
            ctx.font = `${boy}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
            ctx.fillText(k.emoji, x, y);
            if (!oyun && k.id === secili) { ctx.strokeStyle = 'rgba(255,209,102,.9)'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.arc(x, y, boy * 0.62, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
            if (k.soz) {
                ctx.font = 'bold 26px Inter, sans-serif';
                const w = Math.min(ctx.measureText(k.soz.metin).width + 28, 420), bx = Math.min(Math.max(x + 30, 10), 950 - w), by = Math.max(y - boy / 2 - 70, 8);
                ctx.fillStyle = '#fff'; ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w, 48, 14) : ctx.rect(bx, by, w, 48); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#111827'; ctx.textAlign = 'left'; ctx.fillText(k.soz.metin, bx + 14, by + 25, w - 28); ctx.textAlign = 'center';
            }
        }
        // Puan ve can
        ctx.font = 'bold 28px Inter, sans-serif'; ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(12, 12, 300, 50, 12) : ctx.rect(12, 12, 300, 50); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillText(`⭐ ${veri.puan}    ❤️ ${veri.can}`, 28, 38);
        if (veri.durum === 'kazandi' || veri.durum === 'kaybetti') {
            ctx.fillStyle = 'rgba(15,23,42,.72)'; ctx.fillRect(0, 0, 960, 720);
            ctx.textAlign = 'center'; ctx.fillStyle = veri.durum === 'kazandi' ? '#fde047' : '#fca5a5';
            ctx.font = 'bold 72px "Bricolage Grotesque", Inter, sans-serif';
            ctx.fillText(veri.durum === 'kazandi' ? '🏆' : '💀', 480, 300);
            ctx.font = 'bold 48px Inter, sans-serif'; ctx.fillText(veri.mesaj, 480, 390, 900);
        }
    }

    // ---------- Oynatma ----------
    function baslat() {
        durdur();
        const { hatalar } = ed.derle();
        if (hatalar.length) { KL.bildir(hatalar[0].mesaj); return; }
        oyun = new M.Oyun(JSON.parse(JSON.stringify(proje)));
        oyun.baslat();
        $('baslat').disabled = true; $('durdur').disabled = false;
        $('bilgi').textContent = 'Ok tuşları ve boşlukla oyna. Durdurmak için ■';
        $('tuval').focus();
        let son = performance.now(), kare = 0;
        const adim = (t) => {
            if (!oyun) return;
            if (t - son >= 1000 / 30 - 2) {
                son = t;
                oyun.tik(new Set(tuslar));
                for (const s of oyun.sesler.splice(0)) KL.ses(s);
                if (++kare % 6 === 0 && !oynatModu) {
                    const cal = [...oyun.calisanlar].filter(x => x.startsWith(secili + ':')).map(x => x.split(':')[1]);
                    ed.vurgula(cal);
                }
                ciz();
                if (oyun.durum !== 'oynuyor') { KL.ses(oyun.durum === 'kazandi' ? 'kazan' : 'yanlis'); if (oyun.durum === 'kazandi') KL.konfeti(40); return bitti(); }
            }
            dongu = requestAnimationFrame(adim);
        };
        dongu = requestAnimationFrame(adim);
    }
    function bitti() { $('baslat').disabled = false; $('durdur').disabled = true; ed.vurgula([]); $('bilgi').textContent = 'Tekrar oynamak için Başlat.'; }
    function durdur() {
        if (dongu) cancelAnimationFrame(dongu);
        dongu = null; oyun = null; tuslar.clear();
        $('baslat').disabled = false; $('durdur').disabled = true;
        ed.vurgula([]);
        if (proje) ciz();
    }
    $('baslat').onclick = baslat;
    $('durdur').onclick = () => { durdur(); $('bilgi').textContent = 'Karakterleri sahnede sürükleyerek yerleştirebilirsin.'; };
    $('tamEkran').onclick = () => { const s = document.querySelector('.sahne'); (s.requestFullscreen || s.webkitRequestFullscreen || (() => {})).call(s); };

    const TUS = { ArrowRight: 'sag', ArrowLeft: 'sol', ArrowUp: 'yukari', ArrowDown: 'asagi', ' ': 'bosluk' };
    document.addEventListener('keydown', (e) => {
        if (!oyun || !TUS[e.key] || e.target.closest('input, textarea, select')) return;
        e.preventDefault(); tuslar.add(TUS[e.key]);
    });
    document.addEventListener('keyup', (e) => { if (TUS[e.key]) tuslar.delete(TUS[e.key]); });
    window.addEventListener('blur', () => tuslar.clear());
    $('pad').addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) { e.preventDefault(); tuslar.add(b.dataset.t); } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(o => $('pad').addEventListener(o, (e) => { const b = e.target.closest('button'); if (b) tuslar.delete(b.dataset.t); else tuslar.clear(); }));

    // Sahnede tıklama (oyun sırasında) ve sürükleyerek yerleştirme (düzenlerken)
    function sahneKoord(e) {
        const r = $('tuval').getBoundingClientRect();
        return { x: (e.clientX - r.left) / r.width * 480 - M.GEN, y: M.YUK - (e.clientY - r.top) / r.height * 360 };
    }
    let tasinan = null;
    $('tuval').addEventListener('pointerdown', (e) => {
        const p = sahneKoord(e);
        if (oyun) { oyun.tikla(p.x, p.y); return; }
        if (oynatModu) return;
        const k = [...proje.karakterler].reverse().find(k => Math.hypot(k.x - p.x, k.y - p.y) < 26 * k.boyut / 100);
        if (k) { tasinan = { k, dx: k.x - p.x, dy: k.y - p.y }; $('tuval').setPointerCapture(e.pointerId); if (secili !== k.id) { secili = k.id; karakterCiz(); editorAc(); } }
    });
    $('tuval').addEventListener('pointermove', (e) => {
        if (!tasinan) return;
        const p = sahneKoord(e);
        tasinan.k.x = Math.round(Math.max(-M.GEN, Math.min(M.GEN, p.x + tasinan.dx)));
        tasinan.k.y = Math.round(Math.max(-M.YUK, Math.min(M.YUK, p.y + tasinan.dy)));
        $('bilgi').textContent = `${tasinan.k.ad}: x = ${tasinan.k.x}, y = ${tasinan.k.y}`;
        ciz();
    });
    $('tuval').addEventListener('pointerup', () => { if (tasinan) { tasinan = null; kaydet(); } });

    // ---------- Paylaşım ----------
    function paylas() {
        const url = location.origin + location.pathname + '#o=' + b64(JSON.stringify(proje));
        $('paylasAlan').innerHTML = `<div class="paylas-kutu"><input readonly value="${kacis(url)}" aria-label="Oyun linki"><button class="btn btn-sm" id="kopya"><i class="fas fa-copy"></i></button></div><small style="color:var(--muted)">Linki açan kişi oyununu oynayabilir ve istersen kodunu inceleyip kendi sürümünü yapabilir.</small>`;
        $('kopya').onclick = async () => { try { await navigator.clipboard.writeText(url); KL.bildir('Oyun linki kopyalandı!'); } catch (e) { KL.bildir('Linki seçip kopyala.'); } };
    }
    function paylasilanAc(veri) {
        let p;
        try { p = JSON.parse(b64coz(veri)); } catch (e) { KL.bildir('Oyun linki bozuk.'); return false; }
        if (!p || !Array.isArray(p.karakterler) || !p.karakterler.length) return false;
        oynatModu = true;
        document.body.classList.add('oynat-mod');
        gorev = M.GOREVLER.find(g => g.serbest); proje = p; secili = p.karakterler[0].id;
        const sol = document.querySelector('.sol');
        sol.insertAdjacentHTML('afterbegin', `<div class="card" style="padding:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">🎮 Bir arkadaşının oyunu</b><button class="btn btn-sm" id="remix"><i class="fas fa-code"></i> Kodunu incele ve kendi sürümünü yap</button></div>`);
        $('remix').onclick = () => {
            if (!confirm('Bu oyun "Kendi Oyunun" bölümüne kopyalanacak. Oradaki eski oyunun silinir. Devam?')) return;
            kayit.proje.serbest = p; KL.yaz('oyun', kayit);
            location.href = location.pathname;
        };
        ciz();
        return true;
    }

    const h = location.hash.match(/^#o=([A-Za-z0-9_-]+)/);
    if (!(h && paylasilanAc(h[1]))) {
        const ilk = Math.max(0, M.GOREVLER.findIndex(g => !kayit.yildiz[g.id]));
        gorevAc(ogretmen ? 0 : ilk);
    }
    window.__oyun = { proje: () => proje, durum: () => oyun && { puan: oyun.puan, can: oyun.can, durum: oyun.durum } };
})();
