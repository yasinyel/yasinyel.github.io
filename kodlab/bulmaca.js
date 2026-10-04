// Kodlayalım — Bilişim Bulmacaları arayüzü
(function () {
    'use strict';
    const B = window.Bulmaca;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('bulmaca', { yildiz: {}, cozulen: {}, sira: {}, gunluk: {} });
    const KURAL = {
        piksel: 'Soldaki sayılar o satırda, üstteki sayılar o sütunda art arda kaç kare boyanacağını gösterir. "3 1" demek: önce 3 dolu kare, en az bir boşluk, sonra 1 dolu kare. Emin olduğun boş kareleri <b>×</b> ile işaretle. Parmağını ya da fareyi sürükleyerek çok kare boyayabilirsin; sağ tık × koyar.',
        ikili: 'Boş karelere dokunarak 0 ya da 1 yaz. <b>1)</b> Yan yana ya da alt alta üç aynı rakam olamaz. <b>2)</b> Her satır ve sütunda 0 ile 1 sayısı eşittir. <b>3)</b> Aynı iki satır ya da aynı iki sütun olamaz. Kuralı bozan kareler kırmızı görünür.',
        ag: 'Bir kareye dokununca kablo parçası saat yönünde döner (sağ tık ters yöne çevirir). Bütün bilgisayarlar mavi sunucuya bağlanınca kablolar yeşil yanar. Açıkta kablo ucu kalmamalı.',
        isik: 'Bir lambaya basınca o lamba ve dört komşusu (yukarı, aşağı, sağ, sol) açıksa kapanır, kapalıysa açılır. Bütün lambaları söndür. En az basışla bitirirsen 3 yıldız!'
    };
    let tur = null, zorluk = 0, tohum = 1, b = null, durum = null, ipucu = 0, hamle = 0, bitti = false, gunluk = false;
    let mod = 1; // piksel: 1 boya, 2 çarpı

    // ---------- Liste ----------
    const anahtar = (t, z) => `${t}-${z}`;
    const bugun = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    function gununBulmacasi() { const t = B.gununTohumu(bugun()); return { tur: B.TURLER[t % B.TURLER.length].id, zorluk: 1, tohum: t }; }
    function listeCiz() {
        $('turler').innerHTML = B.TURLER.map(t => `<button class="card tur" data-id="${t.id}" style="--c:${t.renk}"><span class="ik"><i class="fas ${t.ikon}"></i></span><h3>${t.ad}</h3><p>${t.ozet}</p>
            <div class="sev">${B.ZORLUKLAR.map((z, i) => `<span>${z.ad} ${KL.yildizHTML(kayit.yildiz[anahtar(t.id, i)] || 0)} ${kayit.cozulen[anahtar(t.id, i)] ? '· ' + kayit.cozulen[anahtar(t.id, i)] : ''}</span>`).join('')}</div></button>`).join('');
        const g = gununBulmacasi(), gt = B.TURLER.find(t => t.id === g.tur);
        $('gunMetin').textContent = kayit.gunluk[bugun()] ? `Bugünkü ${gt.ad} bulmacasını çözdün! Yarın yenisi gelecek.` : `Bugün: ${gt.ad} · #${g.tohum}. Herkes aynı bulmacayı çözüyor.`;
        $('oyun').hidden = true; $('liste').hidden = false;
        history.replaceState(null, '', location.pathname);
    }
    $('turler').addEventListener('click', (e) => { const k = e.target.closest('.tur'); if (k) { const z = Math.max(0, B.ZORLUKLAR.findIndex((_, i) => !(kayit.yildiz[anahtar(k.dataset.id, i)]))); ac(k.dataset.id, z === -1 ? 0 : z); } });
    $('gunBtn').onclick = () => { const g = gununBulmacasi(); ac(g.tur, g.zorluk, g.tohum, true); };
    $('geri').onclick = listeCiz;

    // ---------- Açma ----------
    function ac(t, z, n, gun) {
        tur = t; zorluk = z; gunluk = !!gun;
        tohum = n || kayit.sira[anahtar(t, z)] || 1;
        const tt = B.TURLER.find(x => x.id === t);
        b = B.uret(t, z, tohum);
        ipucu = 0; hamle = 0; bitti = false;
        $('liste').hidden = true; $('oyun').hidden = false;
        $('baslik').textContent = tt.ad + (gunluk ? ' · Günün bulmacası' : '');
        $('no').textContent = `#${tohum}`;
        $('zorluk').innerHTML = B.ZORLUKLAR.map((x, i) => `<button data-z="${i}" class="${i === z ? 'sel' : ''}" title="${x.sinif}">${x.ad}</button>`).join('');
        $('kural').innerHTML = KURAL[t];
        $('bilisim').innerHTML = '<b><i class="fas fa-microchip"></i> Bunun bilişimle ilgisi ne?</b><br>' + tt.bilisim;
        $('sonuc').hidden = true; $('araclar').hidden = false;
        $('mod').hidden = t !== 'piksel'; mod = 1; modCiz();
        durum = t === 'piksel' ? b.cozum.map(s => s.map(() => 0)) : t === 'ikili' ? b.bulmaca.map(s => [...s]) : t === 'ag' ? b.donus.map(s => [...s]) : [...b.baslangic];
        b.kilit = new Set();
        b.aci = t === 'ag' ? b.donus.map(s => s.map(v => v * 90)) : null;
        ciz();
        history.replaceState(null, '', `#${t}-${z + 1}-${tohum}`);
        window.scrollTo(0, 0);
    }
    $('zorluk').addEventListener('click', (e) => { const x = e.target.closest('button'); if (x) ac(tur, +x.dataset.z); });
    $('yeni').onclick = () => {
        if (gunluk) { ac(tur, zorluk); return; }
        kayit.sira[anahtar(tur, zorluk)] = tohum + 1; KL.yaz('bulmaca', kayit); ac(tur, zorluk, tohum + 1);
    };
    $('bastan').onclick = () => ac(tur, zorluk, tohum, gunluk);
    $('numara').onclick = () => {
        const n = parseInt(prompt('Bulmaca numarasını yaz (1 – 99999):', tohum), 10);
        if (n >= 1 && n <= 99999) ac(tur, zorluk, n);
    };
    $('paylas').onclick = async () => {
        const url = location.href;
        try { await navigator.clipboard.writeText(url); KL.bildir('Bağlantı kopyalandı. Arkadaşların aynı bulmacayı çözebilir.'); }
        catch (e) { prompt('Bağlantıyı kopyala:', url); }
    };
    function modCiz() { $('mod').innerHTML = mod === 1 ? '<i class="fas fa-paintbrush"></i> Boya' : '<i class="fas fa-xmark"></i> Çarpı'; $('mod').classList.toggle('sel', mod === 2); }
    $('mod').onclick = () => { mod = mod === 1 ? 2 : 1; modCiz(); };

    // Tahta boyutuna göre kare genişliği
    function kareBoyu(n, ek = 0, enFazla = 56) {
        const gen = Math.min($('tahta').parentElement.clientWidth - 24, 620);
        return Math.max(22, Math.min(enFazla, Math.floor((gen - ek) / n)));
    }

    // ---------- Çizim ----------
    function ciz() {
        const t = $('tahta');
        if (tur === 'piksel') {
            const n = b.boyut, sol = Math.max(...b.satirIp.map(x => x.length)), ust = Math.max(...b.sutunIp.map(x => x.length));
            const h = kareBoyu(n, sol * 15 + 14, 44);
            let html = `<div class="np ${bitti ? 'bitti' : ''}" style="--h:${h}px;grid-template-columns:auto repeat(${n}, ${h}px);grid-template-rows:${ust * 15 + 10}px repeat(${n}, ${h}px)"><div></div>`;
            b.sutunIp.forEach((ip, c) => { html += `<div class="ip sut ${cizgiTamam(durum.map(s => s[c]), ip) ? 'tamam' : ''}">${ip.map(v => `<span>${v}</span>`).join('')}</div>`; });
            for (let y = 0; y < n; y++) {
                html += `<div class="ip ${cizgiTamam(durum[y], b.satirIp[y]) ? 'tamam' : ''}">${b.satirIp[y].map(v => `<span>${v}</span>`).join('')}</div>`;
                for (let x = 0; x < n; x++) html += `<div class="h ${durum[y][x] === 1 ? 'd' : durum[y][x] === 2 ? 'x' : ''} ${(x + 1) % 5 === 0 && x < n - 1 ? 'k5' : ''} ${(y + 1) % 5 === 0 && y < n - 1 ? 'a5' : ''}" data-x="${x}" data-y="${y}"></div>`;
            }
            t.innerHTML = html + '</div>';
            $('durum').textContent = bitti ? `Resim: ${b.ad || 'gizli desen'}` : `${durum.flat().filter(v => v === 1).length} kare boyandı`;
        } else if (tur === 'ikili') {
            const n = b.boyut, h = kareBoyu(n, 0, 56), hatalar = B.ikiliHatalar(durum);
            t.innerHTML = `<div class="ik-tahta" style="--h:${h}px;grid-template-columns:repeat(${n}, ${h}px)">${durum.map((s, y) => s.map((v, x) => `<button data-x="${x}" data-y="${y}" class="${v === -1 ? '' : 'v' + v} ${b.bulmaca[y][x] !== -1 ? 'sabit' : ''} ${hatalar.has(`${y},${x}`) ? 'hata' : ''}" aria-label="${y + 1}. satır ${x + 1}. sütun: ${v === -1 ? 'boş' : v}">${v === -1 ? '' : v}</button>`).join('')).join('')}</div>`;
            const bos = durum.flat().filter(v => v === -1).length;
            $('durum').textContent = bitti ? 'Bütün kurallar sağlandı!' : hatalar.size ? 'Kırmızı kareler bir kuralı bozuyor.' : `${bos} boş kare kaldı`;
        } else if (tur === 'ag') {
            const n = b.boyut, h = kareBoyu(n, 12, 72), eris = B.agErisim(b, durum);
            const cihazSay = b.kare.flat().filter(m => [1, 2, 4, 8].includes(m)).length;
            let bagliCihaz = 0;
            let html = `<div class="ag-tahta" style="--h:${h}px;grid-template-columns:repeat(${n}, ${h}px)">`;
            for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
                const m = b.kare[y][x], bagli = eris.has(`${x},${y}`), sunucu = b.sunucu[0] === x && b.sunucu[1] === y, uc = [1, 2, 4, 8].includes(m);
                if (uc && bagli && !sunucu) bagliCihaz++;
                let s = `<g class="don" style="transform:rotate(${b.aci[y][x]}deg)">`;
                for (const [dx, dy, bit] of B.YON) if (m & bit) s += `<line class="kablo" x1="50" y1="50" x2="${50 + dx * 50}" y2="${50 + dy * 50}"/>`;
                s += '</g>';
                if (sunucu) s += '<rect class="sunucu" x="24" y="20" width="52" height="60" rx="8"/><g fill="#93c5fd"><rect x="32" y="30" width="36" height="7" rx="2"/><rect x="32" y="45" width="36" height="7" rx="2"/><circle cx="62" cy="66" r="4" fill="#4ade80"/></g>';
                else if (uc) s += '<rect class="cihaz" x="28" y="30" width="44" height="34" rx="5"/><rect class="cihaz" x="40" y="64" width="20" height="6" rx="2"/>';
                else s += '<circle cx="50" cy="50" r="9" class="kablo" style="stroke-width:0;fill:currentColor"/>';
                html += `<button data-x="${x}" data-y="${y}" class="${bagli ? 'bagli' : ''} ${b.kilit.has(`${x},${y}`) ? 'kilit' : ''}" aria-label="Kablo parçası ${y + 1}. satır ${x + 1}. sütun"><svg viewBox="0 0 100 100" style="color:${bagli ? '#16a34a' : 'var(--muted)'}">${s}</svg></button>`;
            }
            t.innerHTML = html + '</div>';
            $('durum').textContent = bitti ? 'Bütün bilgisayarlar internete bağlandı!' : `${bagliCihaz} / ${cihazSay} bilgisayar bağlı`;
        } else {
            const n = b.boyut, h = kareBoyu(n, 0, 76);
            t.innerHTML = `<div class="isik-tahta" style="--h:${h}px;grid-template-columns:repeat(${n}, ${h}px)">${durum.map((v, i) => `<button data-i="${i}" class="${v ? 'acik' : ''}" aria-label="Lamba ${i + 1}: ${v ? 'açık' : 'kapalı'}"></button>`).join('')}</div>`;
            $('durum').textContent = bitti ? `${hamle} basışta söndürdün (en az ${b.enAz}).` : `${durum.filter(Boolean).length} lamba açık · ${hamle} basış · en az ${b.enAz} basışta çözülebilir`;
        }
    }
    const cizgiTamam = (cizgi, ip) => B.ipuclari(cizgi.map(v => v === 1 ? 1 : 0)).join() === ip.join();

    // ---------- Etkileşim ----------
    let boyama = null;
    $('tahta').addEventListener('contextmenu', (e) => e.preventDefault());
    $('tahta').addEventListener('pointerdown', (e) => {
        if (bitti) return;
        const el = e.target.closest('[data-x], [data-i]');
        if (!el) return;
        e.preventDefault();
        const sag = e.button === 2;
        if (tur === 'piksel') {
            const x = +el.dataset.x, y = +el.dataset.y, m = sag ? 2 : mod;
            const deger = durum[y][x] === m ? 0 : m;
            boyama = { deger };
            pikselYaz(x, y, deger);
        } else if (tur === 'ikili') {
            const x = +el.dataset.x, y = +el.dataset.y;
            if (b.bulmaca[y][x] !== -1) return;
            const v = durum[y][x];
            durum[y][x] = sag ? (v === -1 ? 1 : v === 1 ? 0 : -1) : (v === -1 ? 0 : v === 0 ? 1 : -1);
            KL.ses('tik'); denetle();
        } else if (tur === 'ag') {
            const x = +el.dataset.x, y = +el.dataset.y;
            if (b.kilit.has(`${x},${y}`)) { KL.bildir('Bu parça ipucuyla yerine kilitlendi.'); return; }
            const d = sag ? -1 : 1;
            durum[y][x] = (durum[y][x] + d + 4) % 4; b.aci[y][x] += d * 90; hamle++;
            KL.ses('tik'); denetle();
        } else {
            const i = +el.dataset.i;
            B.isikBas(durum, b.boyut, i); hamle++;
            KL.ses('tik'); denetle();
        }
    });
    function pikselYaz(x, y, v) {
        if (durum[y][x] === v) return;
        durum[y][x] = v;
        denetle();
    }
    document.addEventListener('pointermove', (e) => {
        if (!boyama || tur !== 'piksel' || bitti) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const h = el && el.closest && el.closest('.np .h');
        if (h) pikselYaz(+h.dataset.x, +h.dataset.y, boyama.deger);
    });
    document.addEventListener('pointerup', () => { boyama = null; });

    function denetle() {
        const tamam = tur === 'piksel' ? B.pikselTamam(b, durum) : tur === 'ikili' ? B.ikiliTamam(b, durum) : tur === 'ag' ? B.agTamam(b, durum) : B.isikTamam(durum);
        if (tamam) {
            bitti = true;
            if (tur === 'piksel') durum = durum.map(s => s.map(v => v === 1 ? 1 : 0));
            ciz(); kazan();
        } else ciz();
    }
    function kazan() {
        const k = anahtar(tur, zorluk);
        const y = B.yildiz(ipucu, tur === 'isik' ? hamle - b.enAz : 0);
        if (y > (kayit.yildiz[k] || 0)) kayit.yildiz[k] = y;
        kayit.cozulen[k] = (kayit.cozulen[k] || 0) + 1;
        if (!gunluk && tohum >= (kayit.sira[k] || 1)) kayit.sira[k] = tohum + 1;
        if (gunluk) kayit.gunluk[bugun()] = true;
        KL.yaz('bulmaca', kayit);
        $('araclar').hidden = true;
        const not = ipucu ? `${ipucu} ipucu kullandın.` : tur === 'isik' && hamle > b.enAz ? `${hamle} basış yaptın; ${b.enAz} basışta da olurdu.` : 'Hiç ipucu kullanmadan çözdün!';
        $('sonuc').innerHTML = `<div class="big-stars">${KL.yildizHTML(y)}</div><b>${gunluk ? 'Günün bulmacası tamam!' : 'Çözüldü!'}</b><span style="color:var(--muted)">${kacis(not)} Bu zorlukta ${kayit.cozulen[k]} bulmaca çözdün.</span>
            <div class="araclar"><button class="btn" id="sListe">Bulmacalar</button><button class="btn btn-primary" id="sYeni"><i class="fas fa-arrow-right"></i> Sıradaki bulmaca</button></div>`;
        $('sonuc').hidden = false;
        $('sListe').onclick = listeCiz;
        $('sYeni').onclick = () => { const g = gunluk; gunluk = false; ac(tur, zorluk, g ? kayit.sira[k] || 1 : tohum + 1); };
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
    }

    // ---------- İpucu ----------
    $('ipucuBtn').onclick = () => {
        if (bitti) return;
        ipucu++;
        if (tur === 'piksel') {
            // Önce yanlış boyanmış bir kare, yoksa boyanması gereken bir kare
            const n = b.boyut, yanlis = [], eksik = [];
            for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = durum[y][x] === 1 ? 1 : 0; if (v !== b.cozum[y][x]) (v === 1 || durum[y][x] === 2 && b.cozum[y][x] ? yanlis : eksik).push([x, y]); }
            const [x, y] = (yanlis.length ? yanlis : eksik)[0] || [];
            if (x === undefined) return;
            durum[y][x] = b.cozum[y][x] ? 1 : 2;
            denetle();
            const el = document.querySelector(`.np .h[data-x="${x}"][data-y="${y}"]`); if (el) el.classList.add('ipucu');
        } else if (tur === 'ikili') {
            const n = b.boyut; let hedef = null;
            for (let y = 0; y < n && !hedef; y++) for (let x = 0; x < n; x++) if (durum[y][x] !== -1 && durum[y][x] !== b.cozum[y][x]) { hedef = [x, y]; break; }
            if (!hedef) {
                // Mantıkla bulunabilen bir boş kare
                const c = B.ikiliCoz(durum);
                for (let y = 0; y < n && !hedef; y++) for (let x = 0; x < n; x++) if (durum[y][x] === -1 && c && c[y][x] !== -1) { hedef = [x, y]; break; }
                for (let y = 0; y < n && !hedef; y++) for (let x = 0; x < n; x++) if (durum[y][x] === -1) { hedef = [x, y]; break; }
            }
            if (!hedef) return;
            durum[hedef[1]][hedef[0]] = b.cozum[hedef[1]][hedef[0]];
            denetle();
            const el = document.querySelector(`.ik-tahta button[data-x="${hedef[0]}"][data-y="${hedef[1]}"]`); if (el) el.classList.add('ipucu');
        } else if (tur === 'ag') {
            const n = b.boyut, adaylar = [];
            for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!b.kilit.has(`${x},${y}`) && B.dondur(b.kare[y][x], durum[y][x]) !== b.kare[y][x]) adaylar.push([x, y]);
            const [x, y] = adaylar.sort((p, q) => Math.abs(p[0] - b.sunucu[0]) + Math.abs(p[1] - b.sunucu[1]) - Math.abs(q[0] - b.sunucu[0]) - Math.abs(q[1] - b.sunucu[1]))[0] || [];
            if (x === undefined) return;
            const fark = (4 - durum[y][x]) % 4;
            b.aci[y][x] += fark * 90; durum[y][x] = 0; b.kilit.add(`${x},${y}`);
            denetle();
        } else {
            const c = B.isikCoz(durum, b.boyut), i = c.indexOf(1);
            ciz();
            const el = document.querySelector(`.isik-tahta button[data-i="${i}"]`); if (el) el.classList.add('ipucu');
            $('durum').textContent = 'Kesikli çizgili lambaya bas.';
        }
    };

    window.addEventListener('resize', () => { if (b && !$('oyun').hidden) ciz(); });

    // Bağlantıyla açma: #tur-zorluk-numara
    const m = /^#(piksel|ikili|ag|isik)(?:-(\d)(?:-(\d+))?)?$/.exec(location.hash);
    if (m) ac(m[1], Math.min(2, Math.max(0, (+m[2] || 1) - 1)), m[3] ? +m[3] : undefined);
    else listeCiz();
    window.__bulmaca = { durum: () => ({ tur, zorluk, tohum, b, durum, bitti }) };
})();
