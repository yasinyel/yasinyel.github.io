// KodLab — Gizli Mesaj arayüzü
(function () {
    'use strict';
    const S = window.Sifre;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('sifre', {});
    let no = 0, b = null, tur = 0, hata = 0, soru = null, kilit = false, cark = 0;

    const acikMi = (i) => ogretmen || i === 0 || (kayit[S.BOLUMLER[i - 1].id] || 0) > 0;
    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

    function listeCiz() {
        $('lvlGrid').innerHTML = S.BOLUMLER.map((x, i) => `
            <button class="card lvl-card" data-i="${i}" ${acikMi(i) ? '' : 'disabled'}>
                <span class="no">Bölüm ${i + 1} ${acikMi(i) ? '' : '<i class="fas fa-lock"></i>'}</span>
                <h3>${x.ad}</h3><small>${x.sinif[0]}. – ${x.sinif[1]}. sınıf</small>${KL.yildizHTML(kayit[x.id] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('lvlGrid').addEventListener('click', (e) => { const c = e.target.closest('.lvl-card'); if (c && !c.disabled) basla(+c.dataset.i); });

    function basla(i) {
        no = i; b = S.BOLUMLER[i]; tur = 0; hata = 0;
        $('baslik').textContent = `${i + 1}. ${b.ad}`;
        $('anlatim').innerHTML = b.anlatim;
        goster('oyun');
        yeniSoru();
    }

    function noktalar() {
        $('dots').innerHTML = Array.from({ length: b.tur }, (_, i) => `<span class="${i < tur ? 'ok' : i === tur ? 'cur' : ''}"></span>`).join('');
    }

    function yeniSoru() {
        kilit = false;
        soru = b.soru(tur);
        noktalar();
        const arac = b.arac;
        if (arac === 'cark' || arac === 'vigenere') metinSorusu();
        else if (arac === 'kaba' || arac === 'frekans') anahtarSorusu();
        else if (arac === 'guc') secmeliSoru();
        aracCiz();
    }

    // ---------- Metin cevaplı sorular (şifrele / çöz) ----------
    function metinSorusu() {
        $('soruPanel').innerHTML = `<p class="soru">${soru.soru}</p>
            <div class="cevap"><input id="cevap" autocomplete="off" spellcheck="false" aria-label="Cevap"><button class="btn btn-primary" id="kontrol">Kontrol</button></div>
            <div class="klavye" id="klavye">${S.ALFABE.map(h => `<button data-h="${h}">${h}</button>`).join('')}<button class="genis" data-h=" ">boşluk</button><button class="genis" data-h="sil">⌫</button></div>
            <p class="fb" id="fb"></p>`;
        $('cevap').focus();
        $('kontrol').onclick = metinKontrol;
        $('cevap').onkeydown = (e) => { if (e.key === 'Enter') metinKontrol(); };
        // Türkçe klavyesi olmayan cihazlar için ekran klavyesi
        $('klavye').onclick = (e) => {
            const k = e.target.closest('button'); if (!k) return;
            const c = $('cevap');
            if (k.dataset.h === 'sil') c.value = c.value.slice(0, -1); else c.value += k.dataset.h;
            c.focus();
        };
    }
    function metinKontrol() {
        if (kilit) return;
        const v = S.normal($('cevap').value);
        if (!v) return;
        if (v === S.normal(soru.cevap)) return dogru(`Doğru! Cevap: ${S.normal(soru.cevap)}`);
        // Yaygın hata: ters yöne kaydırma
        let ipucu = 'Olmadı, harf harf tekrar kontrol et.';
        if (b.arac === 'cark' && soru.k) {
            if (v === S.normal(S.sezar(soru.metin, -soru.k)) || v === S.normal(S.sezar(S.sezar(soru.metin, soru.k), soru.k))) ipucu = 'Kaydırma yönü ters! Şifrelerken ileri, çözerken geri kaydır.';
        }
        yanlis(ipucu);
    }

    // ---------- Anahtar bulma (kaba kuvvet / frekans) ----------
    function anahtarSorusu() {
        $('soruPanel').innerHTML = `<p class="soru">${soru.soru}</p><div class="sifreli-kutu">${soru.sifreli}</div>
            <div class="kbilgi"><span>Denediğin anahtar</span><b id="kDeger">0</b></div>
            <input type="range" class="k" id="kKaydir" min="0" max="${S.N - 1}" value="0" aria-label="Anahtar">
            <p style="margin:10px 0 4px;font-weight:600;font-size:.9rem;color:var(--muted)">Bu anahtarla çözülmüş hali:</p>
            <div class="onizleme" id="onizleme"></div>
            <div class="cevap"><button class="btn btn-primary" id="kontrol" style="flex:1"><i class="fas fa-key"></i> Anahtar bu!</button></div>
            <p class="fb" id="fb"></p>`;
        const guncelle = () => {
            const k = +$('kKaydir').value;
            $('kDeger').textContent = k;
            const coz = S.sezar(soru.sifreli, -k);
            $('onizleme').textContent = b.arac === 'frekans' ? coz.slice(0, 90) + '…' : coz;
            if (b.arac === 'frekans') grafikCiz(k);
        };
        $('kKaydir').oninput = () => { guncelle(); KL.ses('tik'); };
        $('kontrol').onclick = () => {
            if (kilit) return;
            const k = +$('kKaydir').value;
            if (k === soru.cevap) dogru(`Anahtar ${k}! Mesaj: "${soru.metin.length > 60 ? soru.metin.slice(0, 60) + '…' : soru.metin}"`);
            else yanlis(k === 0 ? 'Anahtar 0 mesajı hiç değiştirmez.' : 'Bu anahtarla çıkan metin anlamlı değil. Kaydırmaya devam et.');
        };
        guncelle();
    }

    // ---------- Çoktan seçmeli (modern şifreleme) ----------
    function secmeliSoru() {
        $('soruPanel').innerHTML = `<p class="soru">${soru.soru}</p>
            <div class="secenekler" id="secenekler">${soru.secenekler.map((s, i) => `<button data-i="${i}">${s}</button>`).join('')}</div><p class="fb" id="fb"></p>`;
        $('secenekler').onclick = (e) => {
            const btn = e.target.closest('button'); if (!btn || kilit || btn.classList.contains('hata')) return;
            if (+btn.dataset.i === soru.dogru) { btn.classList.add('dogru'); dogru(soru.aciklama); }
            else { btn.classList.add('hata'); yanlis('Olmadı. Sağdaki hesaplayıcıyı kullanarak düşün.'); }
        };
    }

    function dogru(m) {
        kilit = true;
        KL.ses('dogru');
        $('fb').className = 'fb ok'; $('fb').textContent = m;
        tur++; noktalar();
        setTimeout(() => (tur < b.tur ? yeniSoru() : bitir()), 1600);
    }
    function yanlis(m) {
        hata++;
        KL.ses('yanlis');
        $('fb').className = 'fb bad'; $('fb').textContent = m;
    }

    function bitir() {
        const y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
        if (y > (kayit[b.id] || 0)) { kayit[b.id] = y; KL.yaz('sifre', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Usta kriptograf!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!';
        $('sSonraki').hidden = no === S.BOLUMLER.length - 1;
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    // ---------- Araçlar ----------
    function aracCiz() {
        const p = $('aracPanel');
        if (b.arac === 'cark') {
            p.innerHTML = `<div class="cark-wrap"><svg class="cark" id="cark" viewBox="-200 -200 400 400" role="img" aria-label="Şifre çarkı"></svg>
                <div class="cark-kontrol"><button class="icon-btn" id="carkSol" aria-label="Geri"><i class="fas fa-rotate-left"></i></button>Anahtar <b id="carkK">0</b><button class="icon-btn" id="carkSag" aria-label="İleri"><i class="fas fa-rotate-right"></i></button></div>
                <small style="color:var(--muted)">Dış halka: düz harf · İç halka: şifreli harf. Çarkı sürükleyerek de döndürebilirsin.</small></div>`;
            carkCiz();
            $('carkSol').onclick = () => { cark = (cark + S.N - 1) % S.N; carkCiz(); KL.ses('tik'); };
            $('carkSag').onclick = () => { cark = (cark + 1) % S.N; carkCiz(); KL.ses('tik'); };
            carkSurukle();
        } else if (b.arac === 'kaba') {
            p.innerHTML = `<h3 style="font-size:1rem;margin-bottom:8px">Kaba kuvvet nedir?</h3>
                <p style="color:var(--muted)">Anahtarı bilmeyen biri, bütün olası anahtarları tek tek dener. Sezar şifresinde yalnızca 28 anahtar olduğu için bunu bir insan birkaç dakikada, bir bilgisayar ise saniyenin milyonda birinde yapar.</p>
                <p style="color:var(--muted);margin-top:10px">Bu yüzden iyi bir şifrede <b>olası anahtar sayısı çok büyük</b> olmalıdır. Son bölümde bunu hesaplayacaksın.</p>`;
        } else if (b.arac === 'frekans') {
            p.innerHTML = `<h3 style="font-size:1rem">Harf sıklıkları</h3>
                <div class="grafik" id="grafik"></div>
                <div class="lejant"><span><i style="background:rgba(100,116,139,.35)"></i>Türkçe metinlerde</span><span><i style="background:var(--accent)"></i>Seçtiğin anahtarla çözülmüş metinde</span></div>
                <p style="color:var(--muted);font-size:.9rem;margin-top:8px">Mavi çubuklar gri çubuklarla örtüştüğünde anahtarı bulmuşsundur. İpucu: en uzun gri çubuk A harfinde.</p>`;
            grafikCiz(+($('kKaydir')?.value || 0));
        } else if (b.arac === 'vigenere') {
            p.innerHTML = `<h3 style="font-size:1rem;margin-bottom:6px">Anahtarı mesajın altına yaz</h3><div class="hizala" id="hizala"></div>
                <h3 style="font-size:1rem;margin:12px 0 6px">Vigenère tablosu <small style="color:var(--muted);font-weight:500">(satır: anahtar harfi, sütun: mesaj harfi)</small></h3>
                <div class="tablo-vig" id="vigTablo"></div>`;
            hizalaCiz();
            vigTabloCiz();
        } else if (b.arac === 'guc') {
            p.innerHTML = `<h3 style="font-size:1rem">Kırma süresi hesaplayıcı</h3>
                <p style="color:var(--muted);font-size:.9rem">Saniyede 1 milyar anahtar deneyen bir bilgisayarla:</p>
                <div class="guc-satir"><span>Anahtar uzunluğu</span><b id="bit">40 bit</b></div>
                <input type="range" class="k" id="bitK" min="4" max="256" value="40" aria-label="Bit">
                <div class="guc-satir"><span>Olası anahtar</span><span id="olasi" style="font-family:var(--mono)"></span></div>
                <div class="guc-satir"><span>Ortalama kırma süresi</span><b id="sure" style="font-size:1.2rem"></b></div>
                <div class="ornekler" id="ornekler">
                    <button data-b="5">Sezar şifresi <small>≈ 5 bit</small></button>
                    <button data-b="13">4 haneli PIN <small>≈ 13 bit</small></button>
                    <button data-b="38">8 küçük harfli şifre <small>≈ 38 bit</small></button>
                    <button data-b="72">12 karakterli karışık şifre <small>≈ 72 bit</small></button>
                    <button data-b="128">AES-128 <small>128 bit</small></button>
                    <button data-b="256">AES-256 <small>256 bit</small></button>
                </div>`;
            const g = () => {
                const bit = +$('bitK').value;
                $('bit').textContent = bit + ' bit';
                $('olasi').textContent = bit <= 40 ? (2 ** bit).toLocaleString('tr-TR') : `2^${bit} ≈ 10^${Math.round(bit * Math.log10(2))}`;
                $('sure').textContent = S.kirmaSuresi(bit);
            };
            $('bitK').oninput = g;
            $('ornekler').onclick = (e) => { const x = e.target.closest('button'); if (x) { $('bitK').value = x.dataset.b; g(); } };
            g();
        }
    }

    function carkCiz() {
        const svg = $('cark');
        if (!svg) return;
        $('carkK').textContent = cark;
        let h = '<circle r="196" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><circle r="150" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/><circle r="104" fill="var(--surface)" stroke="var(--line)"/>';
        S.ALFABE.forEach((harf, i) => {
            const a = (i / S.N) * Math.PI * 2 - Math.PI / 2;
            h += `<text x="${Math.cos(a) * 173}" y="${Math.sin(a) * 173}" font-size="17" fill="var(--ink)">${harf}</text>`;
            const ic = S.ALFABE[(i + cark) % S.N];
            h += `<text x="${Math.cos(a) * 127}" y="${Math.sin(a) * 127}" font-size="17" fill="var(--accent)">${ic}</text>`;
            const c = (i + 0.5) / S.N * Math.PI * 2 - Math.PI / 2;
            h += `<line x1="${Math.cos(c) * 104}" y1="${Math.sin(c) * 104}" x2="${Math.cos(c) * 196}" y2="${Math.sin(c) * 196}" stroke="var(--line)"/>`;
        });
        h += `<text y="-14" font-size="15" fill="var(--muted)">A →</text><text y="14" font-size="26" fill="var(--accent)">${S.ALFABE[cark]}</text>`;
        svg.innerHTML = h;
    }
    function carkSurukle() {
        const svg = $('cark');
        let aci0 = null, k0 = 0;
        const aci = (e) => { const r = svg.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); };
        svg.onpointerdown = (e) => { aci0 = aci(e); k0 = cark; svg.setPointerCapture(e.pointerId); };
        svg.onpointermove = (e) => {
            if (aci0 === null) return;
            const fark = Math.round(-(aci(e) - aci0) / (Math.PI * 2) * S.N);
            const yeni = ((k0 + fark) % S.N + S.N) % S.N;
            if (yeni !== cark) { cark = yeni; carkCiz(); KL.ses('tik'); }
        };
        svg.onpointerup = () => { aci0 = null; };
    }

    function grafikCiz(k) {
        const g = $('grafik');
        if (!g) return;
        const f = S.frekans(S.sezar(soru.sifreli, -k));
        const enb = Math.max(...S.TR_FREKANS, ...f);
        g.innerHTML = S.ALFABE.map((h, i) => `<div class="sutun"><div class="b1" style="height:calc(${S.TR_FREKANS[i] / enb} * (100% - 18px))"></div><div class="b2" style="height:calc(${f[i] / enb} * (100% - 18px))"></div><span>${h}</span></div>`).join('');
    }

    function hizalaCiz() {
        const el = $('hizala');
        const m = [...(b.id === 'vig1' ? soru.metin : S.vigenere(soru.metin, soru.anahtar))].filter(h => h !== ' ');
        const a = [...soru.anahtar];
        el.style.gridTemplateColumns = `auto repeat(${m.length}, minmax(22px, 1fr))`;
        el.innerHTML = `<div class="d">${b.id === 'vig1' ? 'mesaj' : 'şifreli'}</div>` + m.map(h => `<div class="m">${h}</div>`).join('') +
            '<div class="d">anahtar</div>' + m.map((_, i) => `<div class="a">${a[i % a.length]}</div>`).join('') +
            '<div class="d">kaydır</div>' + m.map((_, i) => { const k = S.ALFABE.indexOf(a[i % a.length]); return `<div class="d">${k ? (b.id === 'vig1' ? '+' : '−') + k : '0'}</div>`; }).join('');
    }
    function vigTabloCiz() {
        let h = '<table><tr><th class="sol"></th>' + S.ALFABE.map((x, j) => `<th data-j="${j}">${x}</th>`).join('') + '</tr>';
        S.ALFABE.forEach((x, i) => {
            h += `<tr><th class="sol">${x}</th>` + S.ALFABE.map((_, j) => `<td data-i="${i}" data-j="${j}">${S.ALFABE[(i + j) % S.N]}</td>`).join('') + '</tr>';
        });
        $('vigTablo').innerHTML = h + '</table>';
        $('vigTablo').onmouseover = (e) => {
            const td = e.target.closest('td'); if (!td) return;
            const i = td.dataset.i, j = td.dataset.j;
            $('vigTablo').querySelectorAll('td').forEach(c => { c.className = c === td ? 'kes' : c.dataset.i === i && +c.dataset.j < +j ? 'sat' : c.dataset.j === j && +c.dataset.i < +i ? 'sut' : ''; });
        };
    }

    $('geri').onclick = listeCiz;
    $('sListe').onclick = listeCiz;
    $('sTekrar').onclick = () => basla(no);
    $('sSonraki').onclick = () => basla(no + 1);
    window.__sifre = () => ({ soru, b });
    listeCiz();
})();
