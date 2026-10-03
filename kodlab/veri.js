// Kodlayalım — Veri Bilimi Atölyesi arayüzü
(function () {
    'use strict';
    const V = window.Veri;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const sayi = (x) => String(V.yuvarla(x, 2)).replace('.', ',');
    const kayit = KL.oku('veri', { yildiz: {}, anket: null });
    let bolum = null, hata = 0;

    // ---------- Grafikler (SVG) ----------
    const W = 560, H = 300, M = { l: 52, r: 16, t: 18, b: 42 };
    const renk = (i) => `var(--s${(i % 8) + 1})`;
    function adimlar(min, max, hedef = 5) {
        const ham = (max - min) / hedef, us = 10 ** Math.floor(Math.log10(ham));
        const adim = [1, 2, 2.5, 5, 10].map(k => k * us).find(a => ham <= a) || us * 10;
        const l = [];
        for (let v = Math.ceil(min / adim - 1e-9) * adim; v <= max + 1e-9; v += adim) l.push(V.yuvarla(v, 4));
        return l;
    }
    function ekseniY(ymin, ymax, birim) {
        const y = (v) => M.t + (H - M.t - M.b) * (1 - (v - ymin) / (ymax - ymin));
        const cizgiler = adimlar(ymin, ymax).map(v => `<line class="izgara" x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${M.l - 8}" y="${y(v) + 4}" text-anchor="end">${sayi(v)}</text>`).join('');
        return { y, svg: cizgiler + (birim ? `<text x="${M.l - 8}" y="${M.t - 6}" text-anchor="end" style="font-size:11px">${kacis(birim)}</text>` : '') };
    }
    const kutu = (ic, etiket) => `<div class="viz"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${kacis(etiket || 'Grafik')}">${ic}</svg></div>`;
    // Üstü 4px yuvarlatılmış sütun
    function sutunYolu(x, y0, y1, w) {
        const h = y0 - y1, r = Math.min(4, Math.max(0, h), w / 2);
        return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`;
    }
    function sutun(veri, { ymin = 0, ymax, birim = '', etiket = '', degerYaz = true } = {}) {
        ymax = ymax ?? Math.max(...veri.map(d => d[1])) * 1.15;
        const { y, svg } = ekseniY(ymin, ymax, birim);
        const bant = (W - M.l - M.r) / veri.length, w = Math.min(64, bant * 0.6);
        const sutunlar = veri.map(([ad, v], i) => {
            const x = M.l + bant * i + (bant - w) / 2, ust = y(Math.min(Math.max(v, ymin), ymax));
            return `<path class="isaret" fill="${renk(0)}" d="${sutunYolu(x, y(ymin), ust, w)}"><title>${kacis(ad)}: ${sayi(v)} ${kacis(birim)}</title></path>` +
                (degerYaz ? `<text x="${x + w / 2}" y="${ust - 6}" text-anchor="middle" style="font-weight:700">${sayi(v)}</text>` : '') +
                `<text x="${x + w / 2}" y="${H - M.b + 18}" text-anchor="middle">${kacis(ad)}</text>`;
        }).join('');
        return kutu(svg + sutunlar + `<line class="eksen" x1="${M.l}" x2="${W - M.r}" y1="${y(ymin)}" y2="${y(ymin)}"/>`, etiket);
    }
    function cizgi(veri, { ymin = 0, ymax, birim = '', etiket = '', esit = true } = {}) {
        ymax = ymax ?? Math.max(...veri.map(d => d[1])) * 1.15;
        const { y, svg } = ekseniY(ymin, ymax, birim);
        const xs = veri.map(d => +d[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), gen = W - M.l - M.r - 30;
        const x = (i) => M.l + 15 + (esit || veri.length < 2 ? gen * i / Math.max(1, veri.length - 1) : gen * (xs[i] - x0) / (x1 - x0));
        const yol = veri.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[1])}`).join(' ');
        return kutu(svg + `<line class="eksen" x1="${M.l}" x2="${W - M.r}" y1="${y(ymin)}" y2="${y(ymin)}"/>` +
            `<path d="${yol}" fill="none" stroke="${renk(0)}" stroke-width="2" stroke-linejoin="round"/>` +
            veri.map((d, i) => `<circle class="isaret" cx="${x(i)}" cy="${y(d[1])}" r="5" fill="${renk(0)}" stroke="var(--yuzey)" stroke-width="2"><title>${kacis(d[0])}: ${sayi(d[1])} ${kacis(birim)}</title></circle>` +
                `<text x="${x(i)}" y="${H - M.b + 18}" text-anchor="middle">${kacis(d[0])}</text>`).join(''), etiket);
    }
    function pasta(veri, { etiket = '', birim = '%', yuzde = false } = {}) {
        const t = V.toplam(veri.map(d => d[1])) || 1;
        const cx = 150, cy = H / 2, r = 112;
        const yaz = (v) => yuzde ? '%' + Math.round(v / t * 100) : birim === '%' ? '%' + sayi(v) : sayi(v) + birim;
        let a = -Math.PI / 2;
        const dilimler = veri.map(([ad, v], i) => {
            const b = a + 2 * Math.PI * v / t, buyuk = b - a > Math.PI ? 1 : 0;
            const p = (u, rr = r) => `${cx + rr * Math.cos(u)},${cy + rr * Math.sin(u)}`;
            const orta = (a + b) / 2;
            const yol = veri.length === 1 || v === t ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${renk(i)}"/>` : `<path class="isaret" d="M${cx},${cy} L${p(a)} A${r},${r} 0 ${buyuk} 1 ${p(b)} Z" fill="${renk(i)}" stroke="var(--yuzey)" stroke-width="2"><title>${kacis(ad)}: ${yaz(v)}</title></path>`;
            const deger = yaz(v);
            const s = yol + (v / t > 0.07 ? `<text x="${p(orta, r * 0.62).split(',')[0]}" y="${+p(orta, r * 0.62).split(',')[1] + 4}" text-anchor="middle" style="fill:#fff;font-weight:700">${deger}</text>` : '');
            a = b;
            return s;
        }).join('');
        const lejant = veri.map(([ad, v], i) => `<rect x="300" y="${60 + i * 26}" width="14" height="14" rx="3" fill="${renk(i)}"/><text x="322" y="${72 + i * 26}" style="font-size:13px">${kacis(ad)} — ${yaz(v)}</text>`).join('');
        return kutu(dilimler + lejant, etiket);
    }
    function dagilim(veri, { x: xEt, y: yEt, etiket = '' } = {}) {
        const xs = veri.map(p => p[0]), ys = veri.map(p => p[1]);
        const pay = (a, b) => [a - (b - a) * 0.08, b + (b - a) * 0.08];
        const [x0, x1] = pay(Math.min(...xs), Math.max(...xs)), [y0, y1] = pay(Math.min(...ys), Math.max(...ys));
        const { y, svg } = ekseniY(y0, y1, '');
        const x = (v) => M.l + (W - M.l - M.r) * (v - x0) / (x1 - x0);
        const xt = adimlar(x0, x1).map(v => `<text x="${x(v)}" y="${H - M.b + 16}" text-anchor="middle">${sayi(v)}</text>`).join('');
        return kutu(svg + xt + `<line class="eksen" x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}"/>` +
            `<text x="${(M.l + W - M.r) / 2}" y="${H - 6}" text-anchor="middle" class="baslik-y">${kacis(xEt)}</text>` +
            `<text transform="translate(14 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle" class="baslik-y">${kacis(yEt)}</text>` +
            veri.map(p => `<circle class="isaret" cx="${x(p[0])}" cy="${y(p[1])}" r="6" fill="${renk(0)}" stroke="var(--yuzey)" stroke-width="2"><title>${sayi(p[0])} ; ${sayi(p[1])}</title></circle>`).join(''), etiket);
    }
    // Resimli grafik: hileli halinde simge hem eni hem boyu büyür
    function resim(veri, hileli) {
        const simge = (x, yAlt, k) => `<g transform="translate(${x} ${yAlt - 80 * k}) scale(${k})"><rect width="44" height="80" rx="8" fill="${renk(0)}"/><rect x="5" y="9" width="34" height="58" rx="3" fill="var(--yuzey)"/><circle cx="22" cy="73" r="3" fill="var(--yuzey)"/></g>`;
        const taban = H - M.b;
        let ic = '';
        if (hileli) {
            ic = simge(110, taban, 1) + simge(320, taban, 2);
        } else {
            ic = simge(110, taban, 1) + simge(300, taban, 1) + simge(356, taban, 1);
        }
        ic += veri.map(([ad, v], i) => `<text x="${i ? 360 : 132}" y="${H - M.b + 20}" text-anchor="middle" style="font-weight:700">${kacis(ad)}: ${sayi(v)} milyon</text>`).join('');
        return kutu(ic + `<line class="eksen" x1="40" x2="${W - 20}" y1="${taban}" y2="${taban}"/>`);
    }

    // ---------- Genel akış ----------
    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = V.BOLUMLER.map(b => `
            <button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif[0]}. – ${b.sinif[1]}. sınıf</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit.yildiz[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    $('geri').onclick = listeCiz;
    $('sListe').onclick = listeCiz;
    $('sTekrar').onclick = () => basla(bolum.id);
    function basla(id) {
        bolum = V.BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad;
        $('dots').innerHTML = '';
        goster('oyun');
        ({ tablo, grafik, ortalama, yaniltici, iliski, anket })[id]();
        history.replaceState(null, '', '#' + id);
    }
    function noktalar(n, i) { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); }
    function bitir(metin, y) {
        y = y ?? V.yildiz(hata);
        if (y > (kayit.yildiz[bolum.id] || 0)) { kayit.yildiz[bolum.id] = y; KL.yaz('veri', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Veri bilimci oldun!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }
    const devam = (son, f) => {
        $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px;width:100%">${son ? 'Bitir' : 'Sonraki'} <i class="fas fa-arrow-right"></i></button>`;
        $('devam').firstElementChild.onclick = f;
        $('devam').firstElementChild.focus();
    };
    // Soru kartı: sayı ya da seçim cevabı; sonuç geri çağırmayla bildirilir
    function soruKart(s, sonra) {
        const giris = s.tur === 'sayi'
            ? '<input id="cevap" inputmode="decimal" autocomplete="off" aria-label="Cevap" placeholder="Cevabın">'
            : `<select id="cevap" aria-label="Cevap"><option value="">Seç…</option>${s.secenekler.map(x => `<option>${kacis(x)}</option>`).join('')}</select>`;
        return `<div class="card panel soru-kart"><p class="soru">${s.soru}</p><div class="cevap">${giris}<button class="btn btn-primary" id="kontrol">Kontrol et</button></div>
            <p class="fb" id="fb"></p><div id="aciklama"></div><div id="devam"></div></div>`;
    }
    function soruBagla(s, bitince) {
        const kontrol = () => {
            const v = $('cevap').value;
            if (!String(v).trim()) return;
            const dogru = s.tur === 'sayi' ? V.sayiDogru(v, s.cevap) : v === s.cevap;
            $('kontrol').disabled = true; $('cevap').disabled = true;
            if (!dogru) hata++;
            $('fb').className = dogru ? 'fb ok' : 'fb bad';
            $('fb').textContent = dogru ? 'Doğru!' : `Doğru cevap: ${s.tur === 'sayi' ? sayi(s.cevap) : s.cevap}`;
            $('aciklama').innerHTML = `<div class="aciklama">${s.aciklama}</div>`;
            KL.ses(dogru ? 'dogru' : 'yanlis');
            bitince();
        };
        $('kontrol').onclick = kontrol;
        $('cevap').addEventListener('keydown', (e) => { if (e.key === 'Enter') kontrol(); });
    }

    // ---------- 1. Tablo Dedektifi ----------
    function tablo() {
        const r = V.uretec(Date.now());
        const sorular = KL.karistir(V.TABLO_SORULARI).slice(0, 6).map(f => f(r));
        let i = 0, sirala = null, yon = 1, cihaz = '', sinif = '';
        const tabloCiz = () => {
            let l = V.OGRENCILER.filter(o => (!cihaz || o.cihaz === cihaz) && (!sinif || o.sinif === +sinif));
            if (sirala) l = [...l].sort((a, b) => (a[sirala] > b[sirala] ? 1 : a[sirala] < b[sirala] ? -1 : 0) * yon);
            $('tablo').innerHTML = `<thead><tr>${V.SUTUNLAR.map(c => `<th><button data-s="${c.id}" class="${sirala === c.id ? 'aktif' : ''}">${c.ad} ${sirala === c.id ? (yon > 0 ? '▲' : '▼') : '⇅'}</button></th>`).join('')}</tr></thead>
                <tbody>${l.map(o => `<tr>${V.SUTUNLAR.map(c => `<td class="${c.tur === 'sayi' ? 's' : ''}">${c.tur === 'sayi' ? sayi(o[c.id]) : kacis(o[c.id])}</td>`).join('')}</tr>`).join('')}</tbody>`;
            $('satir').textContent = `${l.length} satır`;
        };
        $('icerik').innerHTML = `<div class="dd"><div class="card gr-kart"><h3><i class="fas fa-table"></i> 16 öğrencinin verisi</h3>
            <div class="suzgec"><span>Süz:</span><select id="sCihaz" aria-label="Cihaz süzgeci"><option value="">Bütün cihazlar</option><option>Tablet</option><option>Telefon</option><option>Bilgisayar</option></select>
            <select id="sSinif" aria-label="Sınıf süzgeci"><option value="">Bütün sınıflar</option>${[5, 6, 7, 8].map(s => `<option value="${s}">${s}. sınıf</option>`).join('')}</select><span id="satir" style="color:var(--muted)"></span></div>
            <p style="font-size:.82rem;color:var(--muted);margin-bottom:6px">Sütun başlığına tıklayarak sırala.</p>
            <div class="tablo-kutu"><table class="veri" id="tablo"></table></div></div><div id="soruAlan"></div></div>`;
        $('tablo').onclick = (e) => { const b = e.target.closest('button[data-s]'); if (!b) return; yon = sirala === b.dataset.s ? -yon : 1; sirala = b.dataset.s; tabloCiz(); };
        $('sCihaz').onchange = () => { cihaz = $('sCihaz').value; tabloCiz(); };
        $('sSinif').onchange = () => { sinif = $('sSinif').value; tabloCiz(); };
        tabloCiz();
        const yeni = () => {
            noktalar(sorular.length, i);
            $('soruAlan').innerHTML = soruKart(sorular[i]);
            soruBagla(sorular[i], () => devam(i + 1 >= sorular.length, () => { i++; i < sorular.length ? yeni() : bitir(); }));
        };
        yeni();
    }

    // ---------- 2. Doğru Grafik ----------
    function grafik() {
        const sorular = KL.karistir(V.GRAFIK_SORULARI).slice(0, 6);
        let i = 0;
        const adim = sorular.length + 1;
        const yeni = () => {
            noktalar(adim, i);
            const s = sorular[i];
            $('icerik').innerHTML = `<div class="card panel soru-kart" style="max-width:820px;margin:0 auto"><p class="soru">${s.soru}<br><small style="color:var(--muted)">Hangi gösterim en uygun?</small></p>
                <div class="turler" id="turler">${V.GRAFIK_TURLERI.map(([id, ad, ik]) => `<button data-t="${id}"><i class="fas ${ik}"></i>${ad}</button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="aciklama"></div><div id="devam"></div></div>`;
            let ilk = true;
            $('turler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || $('devam').innerHTML) return;
                if (b.dataset.t === s.cevap) {
                    b.classList.add('dogru'); KL.ses('dogru');
                    $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru!';
                    $('aciklama').innerHTML = `<div class="aciklama">${s.aciklama}</div>`;
                    devam(false, () => { i++; i < sorular.length ? yeni() : ciz(); });
                } else {
                    if (ilk) hata++;
                    ilk = false;
                    b.classList.add('yanlis'); b.disabled = true; KL.ses('yanlis');
                    $('fb').className = 'fb bad'; $('fb').textContent = 'Bu grafik bu soruya pek uygun değil. Tekrar dene.';
                }
            };
        };
        // Son adım: sütunları sürükleyerek grafiği öğrenci çizer
        const ciz = () => {
            noktalar(adim, adim - 1);
            const hedef = V.UYGULAMALAR, deger = hedef.map(() => 0), YMAX = 10;
            $('icerik').innerHTML = `<div class="dd"><div class="card gr-kart"><h3>Sınıfın en çok kullandığı uygulama türleri</h3><div id="cizim" class="cizim-alan"></div>
                <p style="font-size:.85rem;color:var(--muted)">Sütunların tepesini yukarı-aşağı sürükle.</p></div>
                <div class="card panel"><p style="font-weight:700;margin-bottom:8px">Tablodaki veriyle sütun grafiğini çiz</p>
                <table class="veri"><thead><tr><th>Uygulama türü</th><th>Öğrenci</th></tr></thead><tbody>${hedef.map(([a, v]) => `<tr><td>${a}</td><td class="s">${v}</td></tr>`).join('')}</tbody></table>
                <button class="btn btn-primary" id="cizKontrol" style="margin-top:12px"><i class="fas fa-clipboard-check"></i> Kontrol et</button><p class="fb" id="fb"></p><div id="devam"></div></div></div>`;
            const yCiz = () => {
                $('cizim').innerHTML = sutun(hedef.map(([a], k) => [a, deger[k]]), { ymax: YMAX, birim: 'öğrenci', etiket: 'Senin grafiğin' });
                const svg = $('cizim').querySelector('svg');
                const yv = (v) => M.t + (H - M.t - M.b) * (1 - v / YMAX), bant = (W - M.l - M.r) / hedef.length;
                svg.insertAdjacentHTML('beforeend', hedef.map((_, k) => `<rect class="tutamak" data-k="${k}" x="${M.l + bant * k + 6}" y="${yv(deger[k]) - 14}" width="${bant - 12}" height="28" fill="transparent"/><rect x="${M.l + bant * k + bant / 2 - 16}" y="${yv(deger[k]) - 3}" width="32" height="6" rx="3" fill="var(--yazi)" pointer-events="none"/>`).join(''));
            };
            let surukle = null;
            const deger_ = (e) => {
                const svg = $('cizim').querySelector('svg'), rr = svg.getBoundingClientRect();
                const yy = (e.clientY - rr.top) / rr.height * H;
                return Math.max(0, Math.min(YMAX, Math.round((1 - (yy - M.t) / (H - M.t - M.b)) * YMAX)));
            };
            $('cizim').addEventListener('pointerdown', (e) => {
                const svg = $('cizim').querySelector('svg'), rr = svg.getBoundingClientRect();
                const xx = (e.clientX - rr.left) / rr.width * W, k = Math.floor((xx - M.l) / ((W - M.l - M.r) / hedef.length));
                if (k < 0 || k >= hedef.length || $('devam').innerHTML) return;
                surukle = k; $('cizim').setPointerCapture(e.pointerId);
                deger[k] = deger_(e); yCiz(); e.preventDefault();
            });
            $('cizim').addEventListener('pointermove', (e) => { if (surukle === null) return; const v = deger_(e); if (v !== deger[surukle]) { deger[surukle] = v; yCiz(); KL.ses('tik'); } });
            $('cizim').addEventListener('pointerup', () => { surukle = null; });
            yCiz();
            $('cizKontrol').onclick = () => {
                const yanlis = hedef.filter(([, v], k) => deger[k] !== v).map(([a]) => a);
                if (yanlis.length) { hata++; KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = `Şu sütunlar tabloyla uyuşmuyor: ${yanlis.join(', ')}`; return; }
                $('cizKontrol').hidden = true; KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Mükemmel! Grafiğin tabloyla birebir aynı. Gördün mü, sütunlar karşılaştırmayı tablodan çok daha kolay yapıyor.';
                devam(true, () => bitir());
            };
            window.__veriCiz = { deger, hedef, yCiz };
        };
        yeni();
    }

    // ---------- 3. Ortalama mı, Ortanca mı? ----------
    function ortalama() {
        const r = V.uretec(Date.now());
        const sorular = V.ORTALAMA_SORULARI.map(f => f(r));
        let i = 0;
        const yeni = () => {
            noktalar(sorular.length, i);
            const s = sorular[i];
            $('icerik').innerHTML = `<div style="max-width:760px;margin:0 auto">${i === 0 ? `<div class="card panel" style="margin-bottom:14px;font-size:.92rem;line-height:1.6">
                <b>Ortalama:</b> bütün sayıların toplamı ÷ sayı adedi · <b>Ortanca:</b> sıralayınca tam ortadaki sayı · <b>Tepe değer:</b> en çok tekrar eden · <b>Açıklık:</b> en büyük − en küçük</div>` : ''}
                ${soruKart(s)}${s.liste ? `<div class="card gr-kart" style="margin-top:14px" id="gr" hidden></div>` : ''}</div>`;
            soruBagla(s, () => {
                if (s.liste && $('gr')) { $('gr').hidden = false; $('gr').innerHTML = '<h3>Sıralanmış hali</h3>' + sutun([...s.liste].sort((a, b) => a - b).map((v, k) => [String(k + 1), v]), { etiket: 'Sıralanmış değerler' }); }
                devam(i + 1 >= sorular.length, () => { i++; i < sorular.length ? yeni() : bitir(); });
            });
            $('cevap').focus();
        };
        yeni();
    }

    // ---------- 4. Yanıltıcı Grafikler ----------
    function yanilticiCiz(y, hileli) {
        const ayar = hileli ? y.hileli : y.durust;
        if (y.tur === 'sutun') return sutun(y.veri, { ...ayar, birim: y.birim, etiket: y.baslik });
        if (y.tur === 'cizgi') return cizgi(y.veri.slice(ayar.bas || 0), { ymin: ayar.ymin, ymax: ayar.ymax, birim: y.birim, esit: ayar.esit !== false, etiket: y.baslik });
        if (y.tur === 'resim') return resim(y.veri, hileli);
        if (y.tur === 'pasta') return hileli ? pasta(y.veri, { etiket: y.baslik }) : sutun(y.veri, { ymax: 100, birim: '%', etiket: y.baslik });
        return '';
    }
    function yaniltici() {
        const liste = KL.karistir(V.YANILTICI);
        let i = 0;
        const yeni = () => {
            noktalar(liste.length, i);
            const y = liste[i];
            const secenekler = KL.karistir(y.secenekler.map((s, k) => [s, k]));
            $('icerik').innerHTML = `<div class="dd"><div class="card gr-kart"><h3>${kacis(y.baslik)}</h3>${yanilticiCiz(y, true)}<div id="durust"></div></div>
                <div class="card panel durum-kart"><p class="soru">${kacis(y.soru)}</p><div class="secenekler" id="secenekler">${secenekler.map(([s, k]) => `<button data-k="${k}">${kacis(s)}</button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="aciklama"></div><div id="devam"></div></div></div>`;
            let ilk = true;
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.disabled || $('devam').innerHTML) return;
                if (+b.dataset.k !== y.cevap) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); b.disabled = true; KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Tekrar düşün.'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Hileyi yakaladın!';
                $('aciklama').innerHTML = `<div class="aciklama">${kacis(y.aciklama)}</div>`;
                $('durust').innerHTML = `<h3 style="margin-top:14px;color:var(--ok)"><i class="fas fa-check"></i> Dürüst hali</h3>${yanilticiCiz(y, false)}`;
                devam(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir(); });
            };
        };
        yeni();
    }

    // ---------- 5. Dağılım ve İlişki ----------
    function iliski() {
        const liste = V.ILISKILER;
        let i = 0;
        const yeni = () => {
            noktalar(liste.length, i);
            const x = liste[i];
            $('icerik').innerHTML = `<div class="dd"><div class="card gr-kart"><h3>${kacis(x.baslik)}</h3>${dagilim(x.veri, { x: x.x, y: x.y, etiket: x.baslik })}</div>
                <div class="card panel durum-kart"><p class="soru">Bu iki değişken arasında nasıl bir ilişki var?</p>
                <div class="secenekler" id="secenekler"><button data-k="pozitif">↗ Pozitif: biri artınca diğeri de artıyor</button><button data-k="negatif">↘ Negatif: biri artınca diğeri azalıyor</button><button data-k="yok">∴ Belirgin bir ilişki yok</button></div>
                <p class="fb" id="fb"></p><div id="aciklama"></div><div id="ek"></div><div id="devam"></div></div></div>`;
            let ilk = true;
            const ileri = () => devam(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir(); });
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.disabled || $('aciklama').innerHTML) return;
                if (b.dataset.k !== x.yon) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); b.disabled = true; KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Noktaların genel gidişine bak: sağa doğru yükseliyor mu, alçalıyor mu?'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                const rr = V.korelasyon(x.veri.map(p => p[0]), x.veri.map(p => p[1]));
                $('fb').className = 'fb ok'; $('fb').textContent = `Doğru! Korelasyon katsayısı r = ${sayi(V.yuvarla(rr, 2))}`;
                $('aciklama').innerHTML = `<div class="aciklama">${kacis(x.nedensellik ? 'Noktalar sağa doğru yükseliyor: pozitif ilişki. (r, −1 ile +1 arasında bir sayıdır; 0\'a yakınsa ilişki yok demektir.)' : x.aciklama)}</div>`;
                if (!x.nedensellik) return ileri();
                const n = x.nedensellik;
                $('ek').innerHTML = `<p class="soru" style="margin-top:16px">${kacis(n.soru)}</p><div class="secenekler" id="sec2">${n.secenekler.map((s, k) => `<button data-k="${k}">${kacis(s)}</button>`).join('')}</div><p class="fb" id="fb2"></p>`;
                let ilk2 = true;
                $('sec2').onclick = (e2) => {
                    const c = e2.target.closest('button'); if (!c || c.disabled || $('devam').innerHTML) return;
                    if (+c.dataset.k !== n.cevap) { if (ilk2) hata++; ilk2 = false; c.classList.add('yanlis'); c.disabled = true; KL.ses('yanlis'); $('fb2').className = 'fb bad'; $('fb2').textContent = 'Başka bir şey ikisini birden etkiliyor olabilir mi?'; return; }
                    c.classList.add('dogru'); KL.ses('dogru');
                    $('fb2').className = 'fb ok'; $('fb2').textContent = x.aciklama;
                    ileri();
                };
            };
        };
        yeni();
    }

    // ---------- 6. Kendi Anketin ----------
    function anket() {
        const a = kayit.anket || { baslik: 'En çok hangi cihazla internete giriyorsun?', gorunum: 'sutun', secenekler: [{ ad: 'Telefon', sayi: 0 }, { ad: 'Tablet', sayi: 0 }, { ad: 'Bilgisayar', sayi: 0 }] };
        const kaydet = () => { kayit.anket = a; KL.yaz('veri', kayit); };
        $('icerik').innerHTML = `<div class="anket"><div class="card panel">
            <label style="font-weight:700;font-size:.85rem;color:var(--muted)" for="aBaslik">ANKET SORUSU</label>
            <input class="baslik-in" id="aBaslik" maxlength="80" style="margin-top:6px">
            <div id="aSecenekler"></div>
            <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn btn-sm" id="aEkle"><i class="fas fa-plus"></i> Seçenek ekle</button><button class="btn btn-sm" id="aSifirla"><i class="fas fa-rotate-left"></i> Sayıları sıfırla</button></div>
            <p style="font-size:.85rem;color:var(--muted);margin-top:12px">Sınıfta el kaldırtarak say, ya da herkes sırayla + düğmesine bassın. En az 3 seçenek ve 10 cevap topla.</p></div>
            <div class="card gr-kart"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 id="aGrBaslik" style="margin:0"></h3>
            <div class="sekme" id="aGorunum"><button data-g="sutun">Sütun</button><button data-g="pasta">Pasta</button></div></div>
            <div id="aGrafik" style="margin-top:8px"></div><div class="ozet" id="aOzet"></div>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-sm" id="aCsv"><i class="fas fa-file-csv"></i> CSV indir</button><button class="btn btn-sm" id="aYazdir"><i class="fas fa-print"></i> Yazdır</button><button class="btn btn-primary btn-sm" id="aBitir"><i class="fas fa-flag-checkered"></i> Anketi bitir</button></div>
            <p class="fb" id="fb"></p></div></div>`;
        $('aBaslik').value = a.baslik;
        $('aBaslik').oninput = () => { a.baslik = $('aBaslik').value; kaydet(); grafikCiz(); };
        const seceneklerCiz = () => {
            $('aSecenekler').innerHTML = a.secenekler.map((s, k) => `<div class="secenek"><span class="renk" style="background:var(--s${k + 1})"></span><input value="${kacis(s.ad)}" data-k="${k}" maxlength="24" aria-label="Seçenek ${k + 1}">
                <button class="btn" data-eksi="${k}" aria-label="Azalt">−</button><span class="sayi">${s.sayi}</span><button class="btn btn-primary" data-arti="${k}" aria-label="Artır">+</button><button class="icon-btn" data-sil="${k}" aria-label="Sil" ${a.secenekler.length <= 2 ? 'disabled' : ''}><i class="fas fa-xmark"></i></button></div>`).join('');
            $('aEkle').disabled = a.secenekler.length >= 6;
        };
        $('aSecenekler').addEventListener('input', (e) => { const k = e.target.dataset.k; if (k !== undefined) { a.secenekler[k].ad = e.target.value; kaydet(); grafikCiz(); } });
        $('aSecenekler').addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.arti) { a.secenekler[b.dataset.arti].sayi++; KL.ses('tik'); }
            else if (b.dataset.eksi) a.secenekler[b.dataset.eksi].sayi = Math.max(0, a.secenekler[b.dataset.eksi].sayi - 1);
            else if (b.dataset.sil) a.secenekler.splice(+b.dataset.sil, 1);
            kaydet(); seceneklerCiz(); grafikCiz();
        });
        $('aEkle').onclick = () => { a.secenekler.push({ ad: 'Seçenek ' + (a.secenekler.length + 1), sayi: 0 }); kaydet(); seceneklerCiz(); grafikCiz(); };
        $('aSifirla').onclick = () => { if (confirm('Bütün sayılar sıfırlansın mı?')) { a.secenekler.forEach(s => { s.sayi = 0; }); kaydet(); seceneklerCiz(); grafikCiz(); } };
        $('aGorunum').onclick = (e) => { const b = e.target.closest('button'); if (b) { a.gorunum = b.dataset.g; kaydet(); grafikCiz(); } };
        const grafikCiz = () => {
            const oz = V.anketOzet(a.secenekler);
            const veri = a.secenekler.map(s => [s.ad || '?', s.sayi]);
            $('aGrBaslik').textContent = a.baslik || 'Anket';
            document.querySelectorAll('#aGorunum button').forEach(b => b.classList.toggle('sel', b.dataset.g === a.gorunum));
            $('aGrafik').innerHTML = oz.toplam === 0 ? '<p style="color:var(--muted);padding:40px 0;text-align:center">Henüz cevap yok. + düğmeleriyle saymaya başla.</p>'
                : a.gorunum === 'pasta' ? pasta(veri.filter(d => d[1] > 0), { birim: '', yuzde: true, etiket: a.baslik }) : sutun(veri, { birim: 'kişi', etiket: a.baslik, ymax: Math.max(5, Math.max(...veri.map(d => d[1])) * 1.2) });
            $('aOzet').innerHTML = `<div><b>${oz.toplam}</b>toplam cevap</div><div><b>${oz.enCok.length ? kacis(oz.enCok.join(', ')) : '—'}</b>en çok seçilen (tepe değer)</div>` +
                (oz.toplam ? `<div><b>%${sayi(Math.max(...oz.yuzdeler))}</b>en büyük pay</div>` : '');
            $('aBitir').disabled = !oz.tamam;
        };
        $('aCsv').onclick = () => {
            const b = new Blob([V.csv(a.baslik, a.secenekler)], { type: 'text/csv;charset=utf-8' });
            const l = document.createElement('a'); l.href = URL.createObjectURL(b); l.download = 'anket.csv'; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 1000);
        };
        $('aYazdir').onclick = () => window.print();
        $('aBitir').onclick = () => {
            const oz = V.anketOzet(a.secenekler);
            bitir(`${oz.toplam} kişiden veri topladın. En çok seçilen: ${oz.enCok.join(', ')}. Şimdi sonucu yorumla: Neden böyle çıkmış olabilir? Başka bir sınıfta da aynı mı çıkar?`, 3);
        };
        seceneklerCiz(); grafikCiz();
    }

    const h = location.hash.slice(1);
    if (V.BOLUMLER.some(b => b.id === h)) basla(h); else listeCiz();
})();
