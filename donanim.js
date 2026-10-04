// Kodlayalım — Bilgisayarın İçi arayüzü
(function () {
    'use strict';
    const D = window.Donanim;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('donanim', { yildiz: {} });
    let bolum = null, hata = 0;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = D.BOLUMLER.map(b => `<button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif[0]}. – ${b.sinif[1]}. sınıf</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit.yildiz[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    $('geri').onclick = listeCiz; $('sListe').onclick = listeCiz; $('sTekrar').onclick = () => basla(bolum.id);
    function basla(id) {
        bolum = D.BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad; $('dots').innerHTML = '';
        goster('oyun');
        ({ topla, eslestir, sinifla, birim, ariza })[id]();
        history.replaceState(null, '', '#' + id);
    }
    function noktalar(n, i) { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); }
    function bitir(metin) {
        const y = D.yildiz(hata);
        if (y > (kayit.yildiz[bolum.id] || 0)) { kayit.yildiz[bolum.id] = y; KL.yaz('donanim', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Usta teknisyen!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    // ---------- Parça çizimleri (SVG) ----------
    const CIZ = {
        cpu: '<rect x="4" y="4" width="40" height="40" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/><rect x="12" y="12" width="24" height="24" rx="2" fill="#94a3b8"/><text x="24" y="28" text-anchor="middle" font-size="9" font-weight="800" fill="#1e293b">CPU</text>',
        sogutucu: '<circle cx="24" cy="24" r="21" fill="#334155" stroke="#94a3b8" stroke-width="2"/><g fill="#64748b"><path d="M24 24 L24 6 A18 18 0 0 1 38 14 Z"/><path d="M24 24 L40 30 A18 18 0 0 1 28 42 Z"/><path d="M24 24 L10 36 A18 18 0 0 1 8 18 Z"/></g><circle cx="24" cy="24" r="5" fill="#e2e8f0"/>',
        ram: '<rect x="2" y="16" width="68" height="18" rx="2" fill="#15803d" stroke="#14532d" stroke-width="1.5"/><g fill="#111827"><rect x="6" y="19" width="9" height="10"/><rect x="19" y="19" width="9" height="10"/><rect x="32" y="19" width="9" height="10"/><rect x="45" y="19" width="9" height="10"/><rect x="58" y="19" width="9" height="10"/></g><rect x="4" y="31" width="64" height="3" fill="#facc15"/>',
        ssd: '<rect x="2" y="18" width="66" height="14" rx="2" fill="#111827" stroke="#475569" stroke-width="1.5"/><rect x="8" y="21" width="16" height="8" fill="#334155"/><rect x="30" y="21" width="22" height="8" fill="#334155"/><rect x="62" y="22" width="3" height="6" fill="#facc15"/>',
        gpu: '<rect x="2" y="10" width="68" height="30" rx="4" fill="#1f2937" stroke="#64748b" stroke-width="1.5"/><circle cx="20" cy="25" r="10" fill="#374151" stroke="#9ca3af"/><circle cx="48" cy="25" r="10" fill="#374151" stroke="#9ca3af"/><rect x="6" y="40" width="40" height="4" fill="#facc15"/>',
        psu: '<rect x="4" y="6" width="64" height="38" rx="4" fill="#374151" stroke="#9ca3af" stroke-width="1.5"/><circle cx="36" cy="25" r="13" fill="#1f2937" stroke="#9ca3af"/><path d="M27 25h18M36 16v18" stroke="#6b7280" stroke-width="2"/><text x="10" y="16" font-size="7" font-weight="800" fill="#facc15">⚡</text>',
        yazici: '<rect x="10" y="4" width="52" height="14" fill="#e5e7eb" stroke="#6b7280"/><rect x="4" y="16" width="64" height="20" rx="4" fill="#9ca3af" stroke="#4b5563"/><rect x="14" y="32" width="44" height="14" fill="#fff" stroke="#6b7280"/>'
    };
    const ikon = (id) => `<svg viewBox="0 0 72 48">${CIZ[id]}</svg>`;

    // ---------- 1. Bilgisayarı topla ----------
    function topla() {
        const takili = [];
        const parcalar = KL.karistir(D.PARCALAR);
        let secili = null;
        const yuvaYer = { cpu: [170, 70, 90, 90], sogutucu: [170, 70, 90, 90], ram: [300, 60, 46, 150], m2: [150, 186, 130, 26], pcie: [70, 248, 310, 26], psu: [40, 352, 250, 62] };
        const takiliCiz = () => {
            const g = (id, x, y, w, h) => `<g transform="translate(${x} ${y}) scale(${w / 72} ${h / 48})" pointer-events="none">${CIZ[id]}</g>`;
            let s = '';
            if (takili.includes('cpu')) s += g('cpu', 182, 82, 66, 66);
            if (takili.includes('sogutucu')) s += `<g transform="translate(173 73) scale(1.75)" pointer-events="none">${CIZ.sogutucu}</g>`;
            if (takili.includes('ram')) s += `<g transform="translate(330 64) rotate(90)" pointer-events="none"><g transform="scale(2 1.1)">${CIZ.ram}</g></g><g transform="translate(350 64) rotate(90)" pointer-events="none"><g transform="scale(2 1.1)">${CIZ.ram}</g></g>`;
            if (takili.includes('ssd')) s += g('ssd', 150, 172, 130, 52);
            if (takili.includes('gpu')) s += g('gpu', 64, 222, 330, 70);
            if (takili.includes('psu')) s += g('psu', 40, 348, 250, 70);
            return s;
        };
        const kasaCiz = () => `<svg viewBox="0 0 600 440" id="kasaSvg" role="img" aria-label="Bilgisayar kasası ve anakart">
            <rect x="10" y="10" width="580" height="420" rx="18" fill="#1f2937"/>
            <rect x="30" y="26" width="400" height="300" rx="8" fill="#065f46" stroke="#047857" stroke-width="3"/>
            <g stroke="#10b981" stroke-width="1.5" opacity=".5" fill="none"><path d="M60 50 H150 V120"/><path d="M270 110 H300"/><path d="M215 165 V186"/><path d="M215 212 V248"/><path d="M400 60 V300 H380"/><path d="M60 300 H140"/></g>
            <text x="44" y="46" fill="#a7f3d0" font-size="13" font-weight="700">ANAKART</text>
            <rect data-yuva="cpu" x="170" y="70" width="90" height="90" rx="6" fill="#d1fae5" fill-opacity=".25" stroke="#a7f3d0" stroke-width="2"/>
            ${takili.includes('cpu') ? '' : '<text x="215" y="120" fill="#ecfdf5" font-size="11" text-anchor="middle" pointer-events="none">soket</text>'}
            <rect data-yuva="ram" x="300" y="60" width="46" height="150" rx="4" fill="#1e293b" stroke="#a7f3d0" stroke-width="2"/>
            <line x1="315" y1="64" x2="315" y2="206" stroke="#475569" stroke-width="6" pointer-events="none"/><line x1="332" y1="64" x2="332" y2="206" stroke="#475569" stroke-width="6" pointer-events="none"/>
            <rect data-yuva="m2" x="150" y="186" width="130" height="26" rx="4" fill="#1e293b" stroke="#a7f3d0" stroke-width="2"/>
            <text x="215" y="204" fill="#94a3b8" font-size="11" text-anchor="middle" pointer-events="none">M.2</text>
            <rect data-yuva="pcie" x="70" y="248" width="310" height="26" rx="4" fill="#1e293b" stroke="#a7f3d0" stroke-width="2"/>
            <text x="225" y="266" fill="#94a3b8" font-size="11" text-anchor="middle" pointer-events="none">PCIe</text>
            <rect data-yuva="psu" x="40" y="352" width="250" height="62" rx="6" fill="#111827" stroke="#64748b" stroke-width="2" stroke-dasharray="8 6"/>
            <text x="165" y="388" fill="#94a3b8" font-size="12" text-anchor="middle" pointer-events="none">güç kaynağı bölmesi</text>
            <g fill="#374151"><circle cx="520" cy="80" r="40"/><circle cx="520" cy="190" r="40"/></g>
            <g stroke="#4b5563" stroke-width="3" fill="none"><circle cx="520" cy="80" r="28"/><circle cx="520" cy="190" r="28"/></g>
            <rect x="460" y="270" width="110" height="140" rx="8" fill="#111827"/><text x="515" y="345" fill="#64748b" font-size="11" text-anchor="middle">kasa fanları</text>
            ${takiliCiz()}</svg>`;
        $('icerik').innerHTML = `<div class="topla"><div class="card panel kasa" id="kasa">${kasaCiz()}</div>
            <div class="card panel"><p style="font-weight:700">Parçaları anakarttaki doğru yerlere sürükle (ya da önce parçaya, sonra yerine dokun).</p>
            <div class="tepsi" id="tepsi" style="margin-top:12px">${parcalar.map(p => `<div class="parca" data-id="${p.id}">${ikon(p.id)}<span>${kacis(p.ad)}</span></div>`).join('')}</div>
            <p class="fb" id="fb"></p><div id="devam"></div></div></div>`;
        const yuvaBul = (x, y, pid) => {
            const el = document.elementFromPoint(x, y);
            const r = el && el.closest('[data-yuva]');
            if (!r) return null;
            const id = r.dataset.yuva;
            return id === 'cpu' && (takili.includes('cpu') || pid === 'sogutucu') ? 'sogutucu' : id;
        };
        const dene = (pid, yuva) => {
            if (!yuva) return;
            const r = D.tak(takili, pid, yuva);
            $('fb').className = r.tamam ? 'fb ok' : 'fb bad';
            $('fb').textContent = r.mesaj;
            const kart = document.querySelector(`.parca[data-id="${pid}"]`);
            if (!r.tamam) { hata++; KL.ses('yanlis'); kart.classList.remove('titre'); void kart.offsetWidth; kart.classList.add('titre'); return; }
            takili.push(pid); KL.ses('dogru');
            kart.classList.add('takildi'); kart.classList.remove('sec');
            $('kasa').innerHTML = kasaCiz();
            if (D.toplamaBitti(takili)) {
                $('devam').innerHTML = '<button class="btn btn-primary" style="margin-top:12px;width:100%"><i class="fas fa-power-off"></i> Bilgisayarı çalıştır</button>';
                $('devam').firstElementChild.onclick = acilis;
            }
        };
        const acilis = () => {
            const satirlar = ['Kodlayalım BIOS v1.0', 'İşlemci ........ TAMAM', 'Bellek 16 GB .... TAMAM', 'Depolama SSD .... TAMAM', 'Ekran kartı ..... TAMAM', '', 'İşletim sistemi yükleniyor...', '', 'Hoş geldin! 🎉'];
            const o = document.createElement('div'); o.className = 'acilis'; $('kasa').appendChild(o);
            let i = 0;
            const t = setInterval(() => { o.textContent += satirlar[i++] + '\n'; if (i >= satirlar.length) { clearInterval(t); setTimeout(() => bitir('Bilgisayarı başarıyla topladın ve çalıştırdın!'), 900); } }, 280);
            $('devam').innerHTML = '';
        };
        // Sürükle-bırak ve dokun-seç
        let tasinan = null;
        $('tepsi').addEventListener('pointerdown', (e) => {
            const k = e.target.closest('.parca'); if (!k || k.classList.contains('takildi')) return;
            e.preventDefault();
            tasinan = { id: k.dataset.id, x: e.clientX, y: e.clientY, hayalet: null, kart: k };
            k.setPointerCapture(e.pointerId);
        });
        $('tepsi').addEventListener('pointermove', (e) => {
            if (!tasinan) return;
            if (!tasinan.hayalet && Math.hypot(e.clientX - tasinan.x, e.clientY - tasinan.y) > 8) {
                tasinan.hayalet = document.createElement('div'); tasinan.hayalet.className = 'hayalet';
                tasinan.hayalet.innerHTML = ikon(tasinan.id).replace('<svg', '<svg width="110" height="74"'); document.body.appendChild(tasinan.hayalet);
            }
            if (tasinan.hayalet) {
                tasinan.hayalet.style.left = e.clientX + 'px'; tasinan.hayalet.style.top = e.clientY + 'px';
                tasinan.hayalet.style.display = 'none';
                document.querySelectorAll('[data-yuva].uzerinde').forEach(x => x.classList.remove('uzerinde'));
                const el = document.elementFromPoint(e.clientX, e.clientY);
                const r = el && el.closest('[data-yuva]'); if (r) r.classList.add('uzerinde');
                tasinan.hayalet.style.display = '';
            }
        });
        $('tepsi').addEventListener('pointerup', (e) => {
            if (!tasinan) return;
            const t = tasinan; tasinan = null;
            document.querySelectorAll('[data-yuva].uzerinde').forEach(x => x.classList.remove('uzerinde'));
            if (t.hayalet) { t.hayalet.remove(); dene(t.id, yuvaBul(e.clientX, e.clientY, t.id)); return; }
            // Dokunma: parçayı seç
            document.querySelectorAll('.parca.sec').forEach(x => x.classList.remove('sec'));
            secili = t.id; t.kart.classList.add('sec');
            document.querySelectorAll('[data-yuva]').forEach(x => x.classList.add('secilebilir'));
            $('fb').className = 'fb'; $('fb').textContent = 'Şimdi bu parçanın takılacağı yere dokun.';
        });
        $('kasa').addEventListener('click', (e) => {
            if (!secili) return;
            const r = e.target.closest('[data-yuva]'); if (!r) return;
            const p = secili; secili = null;
            const y = r.dataset.yuva === 'cpu' && (takili.includes('cpu') || p === 'sogutucu') ? 'sogutucu' : r.dataset.yuva;
            document.querySelectorAll('.secilebilir').forEach(x => x.classList.remove('secilebilir'));
            dene(p, y);
        });
    }

    // ---------- 2. Eşleştir ----------
    function eslestir() {
        const sol = KL.karistir(D.ESLESMELER.map((e, i) => [i, e[0]])), sag = KL.karistir(D.ESLESMELER.map((e, i) => [i, e[1]]));
        let secSol = null, biten = 0;
        $('icerik').innerHTML = `<div class="card panel"><p style="font-weight:700;margin-bottom:12px">Soldan bir parça, sağdan onun yaptığı işi seç.</p>
            <div class="esle"><div class="sut" id="sol">${sol.map(([i, t]) => `<button data-i="${i}">${kacis(t)}</button>`).join('')}</div>
            <div class="sut" id="sag">${sag.map(([i, t]) => `<button data-i="${i}">${kacis(t)}</button>`).join('')}</div></div><p class="fb" id="fb"></p></div>`;
        $('sol').onclick = (e) => { const b = e.target.closest('button'); if (!b || b.classList.contains('bitti')) return; document.querySelectorAll('#sol .sec').forEach(x => x.classList.remove('sec')); b.classList.add('sec'); secSol = b; };
        $('sag').onclick = (e) => {
            const b = e.target.closest('button'); if (!b || b.classList.contains('bitti') || !secSol) return;
            if (b.dataset.i === secSol.dataset.i) {
                b.classList.add('bitti'); secSol.classList.remove('sec'); secSol.classList.add('bitti'); secSol = null; biten++; KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru eşleşme!';
                noktalar(D.ESLESMELER.length, biten);
                if (biten === D.ESLESMELER.length) setTimeout(() => bitir(), 500);
            } else {
                hata++; KL.ses('yanlis');
                [b, secSol].forEach(x => { x.classList.remove('titre'); void x.offsetWidth; x.classList.add('titre'); });
                $('fb').className = 'fb bad'; $('fb').textContent = 'Bu parça bu işi yapmaz, tekrar dene.';
            }
        };
        noktalar(D.ESLESMELER.length, 0);
    }

    // ---------- 3. Sınıfla ----------
    function sinifla() {
        const liste = KL.karistir(D.CIHAZLAR).slice(0, 12);
        let i = 0;
        const yeni = () => {
            noktalar(liste.length, i);
            const [ad, em, dogru] = liste[i];
            $('icerik').innerHTML = `<div class="card panel cihaz" style="max-width:760px;margin:0 auto"><div class="em">${em}</div><h3>${kacis(ad)}</h3>
                <div class="kovalar" id="kovalar">${D.SINIFLAR.map(([id, a, ac]) => `<button data-k="${id}">${a}<small>${ac}</small></button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="devam"></div></div>`;
            let ilk = true;
            $('kovalar').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || $('devam').innerHTML) return;
                if (b.dataset.k !== dogru) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Bir daha düşün: bu cihaz bilgisayara bilgi mi veriyor, bilgisayardan bilgi mi alıyor?'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = D.SINIF_ACIKLAMA[ad] || 'Doğru!';
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px">${i + 1 < liste.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < liste.length ? yeni() : bitir(); };
            };
        };
        yeni();
    }

    // ---------- 4 ve 5. Çoktan seçmeli bölümler ----------
    function cokluSoru(sorular) {
        let i = 0;
        const yeni = () => {
            noktalar(sorular.length, i);
            const s = sorular[i];
            const sec = KL.karistir(s.secenekler);
            $('icerik').innerHTML = `<div class="card panel durum-kart"><p class="soru">${kacis(s.soru)}</p>
                <div class="secenekler" id="secenekler">${sec.map(x => `<button>${kacis(x)}</button>`).join('')}</div><p class="fb" id="fb"></p><div id="aciklama"></div><div id="devam"></div></div>`;
            let ilk = true;
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.disabled || $('devam').innerHTML) return;
                if (b.textContent !== s.cevap) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); b.disabled = true; KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Tekrar dene.'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru!';
                $('aciklama').innerHTML = `<div class="aciklama">${kacis(s.aciklama)}</div>`;
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px">${i + 1 < sorular.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < sorular.length ? yeni() : bitir(); };
            };
        };
        yeni();
    }
    function birim() { const r = D.uretec(Date.now()); cokluSoru(D.BIRIM_SORULARI.map(f => f(r))); }
    function ariza() { cokluSoru(KL.karistir(D.ARIZALAR).map(a => ({ soru: a.belirti, secenekler: a.secenekler, cevap: a.secenekler[a.dogru], aciklama: a.aciklama }))); }

    const h = location.hash.slice(1);
    if (D.BOLUMLER.some(b => b.id === h)) basla(h); else listeCiz();
})();
