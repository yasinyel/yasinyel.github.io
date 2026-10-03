// KodLab — Robot Kodla arayüzü
(function () {
    'use strict';
    const M = window.RobotMotor;
    const SEVIYELER = window.ROBOT_SEVIYELER;
    const $ = (id) => document.getElementById(id);

    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('robot', { yildiz: {}, kod: {} });
    let no = Math.min(kayit.son ?? 0, SEVIYELER.length - 1);
    let gosterilenHarita = 0;
    let calisan = null;   // { derlenmis, haritaNo, dunya, gen, mod }
    let donus = 0;        // robotun toplam dönüş açısı (animasyon için)
    let yuklendi = false; // ilk bölüm açılmadan editördeki boş kod kaydedilmesin

    // Komut paleti: [metin, eklenecek kod, hangi bölümde açılır, tür]
    const PALET = [
        ['ileri()', 'ileri()', 0], ['sağa()', 'sağa()', 1], ['sola()', 'sola()', 2],
        ['ileri(n)', 'ileri(2)', 3],
        ['tekrarla', 'tekrarla 2 {\n\t\n}', 4, 'flow'],
        ['iken', 'iken önü_boş {\n\t\n}', 8, 'flow'],
        ['eğer', 'eğer önü_boş {\n\t\n}', 9, 'flow'],
        ['eğer … değilse', 'eğer önü_boş {\n\t\n} değilse {\n\t\n}', 9, 'flow'],
        ['önü_boş', 'önü_boş', 8, 'cond'], ['yıldız_kaldı', 'yıldız_kaldı', 9, 'cond'],
        ['sağı_boş', 'sağı_boş', 10, 'cond'], ['solu_boş', 'solu_boş', 10, 'cond'], ['değil', 'değil ', 10, 'cond'],
        ['fonksiyon', 'fonksiyon adı {\n\t\n}', 11, 'flow']
    ];

    const ROBOT_SVG = `<svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 2 L25 8 L15 8 Z" fill="#ffd166"/>
        <rect x="7" y="8" width="26" height="26" rx="8" fill="#1d5fd6"/>
        <rect x="11" y="12" width="18" height="11" rx="4" fill="#e8f0ff"/>
        <circle cx="16" cy="17.5" r="2.4" fill="#0f172a"/><circle cx="24" cy="17.5" r="2.4" fill="#0f172a"/>
        <rect x="14" y="27" width="12" height="3" rx="1.5" fill="#6ea4ff"/>
        <rect x="3" y="15" width="4" height="12" rx="2" fill="#163f8f"/><rect x="33" y="15" width="4" height="12" rx="2" fill="#163f8f"/>
    </svg>`;

    // ---------- Bölüm listesi ----------
    function acikMi(i) {
        return ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0 || (kayit.yildiz[i] || 0) > 0;
    }

    function bolumleriCiz() {
        $('levels').innerHTML = SEVIYELER.map((s, i) => {
            const y = kayit.yildiz[i] || 0;
            const sinif = ['lvl', i === no ? 'active' : '', y ? 'done' : '', acikMi(i) ? '' : 'locked'].join(' ');
            const ic = acikMi(i) ? (i + 1) : '<i class="fas fa-lock" style="font-size:.8em"></i>';
            return `<button class="${sinif}" data-i="${i}" title="${i + 1}. ${s.baslik}">${ic}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('');
        const aktif = $('levels').querySelector('.active');
        if (aktif) aktif.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    $('levels').addEventListener('click', (e) => {
        const b = e.target.closest('.lvl');
        if (!b) return;
        const i = +b.dataset.i;
        if (!acikMi(i)) { KL.bildir('Önce önceki bölümü tamamla!'); return; }
        bolumAc(i);
    });

    // ---------- Bölüm ----------
    function bolumAc(i) {
        durdur();
        if (yuklendi) kodKaydet();
        yuklendi = true;
        no = i;
        kayit.son = i; KL.yaz('robot', kayit);
        const s = SEVIYELER[i];
        $('topic').textContent = `Bölüm ${i + 1} · ${s.konu}`;
        $('title').textContent = s.baslik;
        $('goal').textContent = s.hedef;
        $('lesson').innerHTML = s.anlatim;
        $('newTags').innerHTML = (s.yeni || []).map(t => `<span>Yeni: ${t}</span>`).join('');
        $('example').hidden = !s.ornek;
        $('example').textContent = s.ornek || '';
        $('kod').value = kayit.kod[i] ?? s.baslangic ?? '';
        gosterilenHarita = 0;
        haritaSekmeleri();
        haritaGoster(0);
        paletCiz();
        editorGuncelle();
        durum('');
        bolumleriCiz();
    }

    function haritaSekmeleri(tamamlanan = -1) {
        const s = SEVIYELER[no];
        if (s.haritalar.length < 2) { $('maps').innerHTML = ''; return; }
        $('maps').innerHTML = s.haritalar.map((_, i) =>
            `<button data-i="${i}" class="${i === gosterilenHarita ? 'active' : ''} ${i <= tamamlanan ? 'ok' : ''}">Harita ${i + 1}</button>`).join('');
    }
    $('maps').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || calisan) return;
        gosterilenHarita = +b.dataset.i;
        haritaSekmeleri();
        haritaGoster(gosterilenHarita);
    });

    // ---------- Tahta ----------
    function hucreBoyu(w, h) {
        const genislik = $('boardWrap').clientWidth - 36;
        return Math.max(26, Math.min(58, Math.floor(genislik / w), Math.floor(420 / h)));
    }

    function haritaGoster(i, dunya) {
        const harita = M.haritaOku(SEVIYELER[no].haritalar[i]);
        const d = dunya || M.dunyaKur(harita);
        const c = hucreBoyu(d.w, d.h);
        const b = $('board');
        b.style.setProperty('--c', c + 'px');
        b.style.gridTemplateColumns = `repeat(${d.w}, ${c}px)`;
        b.style.gridTemplateRows = `repeat(${d.h}, ${c}px)`;
        let html = '';
        for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) {
            const z = d.zemin[y][x];
            const sinif = z === '#' ? 'w' : (z === '.' || z === '*') ? 'f' : '';
            html += `<div class="cell ${sinif}" id="h${x}_${y}">${z === '*' ? '<span class="gem"><i class="fas fa-star"></i></span>' : ''}</div>`;
        }
        html += `<div class="robot" id="robot">${ROBOT_SVG}</div>`;
        b.innerHTML = html;
        donus = d.d * 90;
        robotKonum(d.x, d.y, false);
    }

    function robotKonum(x, y, animasyon = true) {
        const r = $('robot');
        const c = parseFloat($('board').style.getPropertyValue('--c'));
        if (!animasyon) r.style.transition = 'none';
        r.style.transform = `translate(${x * c}px, ${y * c}px)`;
        r.querySelector('svg').style.transform = `rotate(${donus}deg)`;
        if (!animasyon) { r.offsetHeight; r.style.transition = ''; }
    }

    window.addEventListener('resize', () => { if (!calisan) haritaGoster(gosterilenHarita); });

    // ---------- Editör ----------
    const kod = $('kod');
    function editorGuncelle() {
        const n = kod.value.split('\n').length;
        let g = '';
        for (let i = 1; i <= n; i++) g += `<div>${i}</div>`;
        $('gutter').innerHTML = g;
        try { $('count').textContent = M.ayristir(kod.value).komutSayisi; }
        catch (e) { $('count').textContent = '–'; }
        satirIsaretle(null);
    }
    kod.addEventListener('input', () => {
        if (calisan && calisan.mod === 'bitti') { durdur(); haritaGoster(gosterilenHarita); }
        editorGuncelle();
        if (!calisan) durum('');
        kodKaydetGecikmeli();
    });
    kod.addEventListener('scroll', () => {
        $('gutter').scrollTop = kod.scrollTop;
        $('hl').style.marginTop = -kod.scrollTop + 'px';
    });
    kod.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); ekle('    ', false); }
        else if (e.key === 'Enter') {
            // Girintiyi koru; "{" ile biten satırdan sonra bir kademe artır
            e.preventDefault();
            const once = kod.value.slice(0, kod.selectionStart);
            const satir = once.slice(once.lastIndexOf('\n') + 1);
            let girinti = satir.match(/^\s*/)[0];
            if (/\{\s*$/.test(satir)) girinti += '    ';
            ekle('\n' + girinti, false);
        } else if (e.key === '}' ) {
            // Boş satırda "}" yazınca bir kademe geri çek
            const bas = kod.value.lastIndexOf('\n', kod.selectionStart - 1) + 1;
            const satir = kod.value.slice(bas, kod.selectionStart);
            if (/^ {4,}$/.test(satir)) {
                e.preventDefault();
                kod.setSelectionRange(bas, kod.selectionStart);
                ekle(satir.slice(4) + '}', false);
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { calistirTikla(); }
    });

    function ekle(metin, satirBasi = true) {
        kod.focus();
        let bas = kod.selectionStart, son = kod.selectionEnd;
        const v = kod.value;
        if (satirBasi) {
            const satirBas = v.lastIndexOf('\n', bas - 1) + 1;
            const satir = v.slice(satirBas, bas);
            const girinti = satir.match(/^\s*/)[0];
            const parcalar = metin.split('\n');
            metin = parcalar.map((p, i) => (i === 0 ? '' : girinti) + p.replace(/\t/g, '    ')).join('\n');
            if (satir.trim() !== '') metin = '\n' + girinti + metin;
        }
        kod.setRangeText(metin, bas, son, 'end');
        // Bloğun içine imleci yerleştir
        if (satirBasi && metin.includes('{\n')) {
            const ic = kod.value.indexOf('{\n', bas) + 2;
            const satirSonu = kod.value.indexOf('\n', ic);
            kod.setSelectionRange(satirSonu, satirSonu);
        }
        kod.dispatchEvent(new Event('input'));
    }

    function paletCiz() {
        $('palette').innerHTML = PALET.filter(p => ogretmen || p[2] <= no).map((p, i) =>
            `<button class="chip ${p[3] || ''}" data-i="${PALET.indexOf(p)}">${p[0]}</button>`).join('');
    }
    $('palette').addEventListener('click', (e) => {
        const b = e.target.closest('.chip');
        if (!b) return;
        const p = PALET[+b.dataset.i];
        ekle(p[1], !p[3] || p[3] === 'flow');
    });

    let kayitZamani;
    function kodKaydetGecikmeli() { clearTimeout(kayitZamani); kayitZamani = setTimeout(kodKaydet, 400); }
    function kodKaydet() { kayit.kod[no] = kod.value; KL.yaz('robot', kayit); }

    function satirIsaretle(satir, hata = false) {
        const hl = $('hl');
        [...$('gutter').children].forEach((d, i) => { d.className = (i + 1 === satir) ? (hata ? 'err' : 'cur') : ''; });
        if (!satir) { hl.style.display = 'none'; return; }
        hl.style.display = 'block';
        hl.className = 'hl' + (hata ? ' err' : '');
        hl.style.top = (12 + (satir - 1) * 24) + 'px';
    }

    function durum(metin, tur = 'info') {
        const s = $('status');
        s.className = 'status' + (metin ? ' show ' + tur : '');
        s.innerHTML = metin;
    }

    // ---------- Çalıştırma ----------
    const HIZLAR = [650, 380, 220, 100, 35];
    const bekleme = () => HIZLAR[$('speed').value - 1];
    const uyu = (ms) => new Promise(r => setTimeout(r, ms));

    function hazirla() {
        let derlenmis;
        try { derlenmis = M.ayristir(kod.value); }
        catch (e) {
            if (!(e instanceof M.KodHatasi)) throw e;
            durum(`<i class="fas fa-bug"></i> Satır ${e.satir}: ${e.message}`, 'err');
            satirIsaretle(e.satir, true);
            return false;
        }
        if (derlenmis.komutSayisi === 0) { durum('Önce robota birkaç komut yaz.', 'err'); return false; }
        calisan = { derlenmis, haritaNo: 0, mod: 'adim' };
        haritaBaslat(0);
        durum('');
        kod.readOnly = true;
        dugmeler();
        return true;
    }

    function haritaBaslat(i) {
        calisan.haritaNo = i;
        calisan.dunya = M.dunyaKur(M.haritaOku(SEVIYELER[no].haritalar[i]));
        calisan.gen = M.calistir(calisan.derlenmis, calisan.dunya);
        gosterilenHarita = i;
        haritaSekmeleri(i - 1);
        haritaGoster(i);
    }

    // Bir olay işler. Dönüş: 'devam' | 'harita' | 'bitti' | 'dur'
    function birAdim() {
        let r;
        try { r = calisan.gen.next(); }
        catch (e) {
            if (!(e instanceof M.KodHatasi)) throw e;
            durum(`<i class="fas fa-triangle-exclamation"></i> Satır ${e.satir}: ${e.message}` + haritaEki(), 'err');
            satirIsaretle(e.satir, true);
            return 'dur';
        }
        if (r.done) {
            if (calisan.dunya.kalan > 0) {
                durum(`<i class="fas fa-circle-info"></i> Kod bitti ama ${calisan.dunya.kalan} yıldız toplanmadı.` + haritaEki(), 'err');
                satirIsaretle(null);
                return 'dur';
            }
            return calisan.haritaNo < SEVIYELER[no].haritalar.length - 1 ? 'harita' : 'bitti';
        }
        const o = r.value;
        satirIsaretle(o.satir);
        const robot = $('robot');
        robot.style.setProperty('--hiz', Math.min(bekleme(), 400) + 'ms');
        if (o.tur === 'hareket') {
            robotKonum(o.x, o.y);
            if (o.toplandi) {
                const g = document.querySelector(`#h${o.x}_${o.y} .gem`);
                if (g) setTimeout(() => g.classList.add('taken'), bekleme() * 0.6);
            }
        } else if (o.tur === 'donus') {
            donus += o.yon === 'saga' ? 90 : -90;
            robotKonum(o.x, o.y);
        } else if (o.tur === 'carpma') {
            robot.classList.remove('crash'); robot.offsetWidth; robot.classList.add('crash');
        }
        return o.tur === 'satir' ? 'satir' : 'devam';
    }

    function haritaEki() {
        return SEVIYELER[no].haritalar.length > 1 ? ` <small>(Harita ${calisan.haritaNo + 1})</small>` : '';
    }

    async function calistirTikla() {
        if (calisan && calisan.mod === 'calis') return;
        if (calisan && calisan.mod === 'bitti') durdur();
        if (!calisan && !hazirla()) return;
        calisan.mod = 'calis';
        dugmeler();
        const benim = calisan;
        while (calisan === benim && benim.mod === 'calis') {
            const s = birAdim();
            if (s === 'devam') await uyu(bekleme());
            else if (s === 'satir') await uyu(bekleme() * 0.35);
            else if (s === 'harita') {
                haritaSekmeleri(benim.haritaNo);
                durum(`<i class="fas fa-check"></i> Harita ${benim.haritaNo + 1} tamam, sıradaki deneniyor…`, 'ok');
                await uyu(900);
                if (calisan !== benim) return;
                haritaBaslat(benim.haritaNo + 1);
            } else if (s === 'bitti') { kazandi(); return; }
            else { bitir(); return; }
        }
    }

    function adimTikla() {
        if (calisan && calisan.mod === 'calis') return;
        if (calisan && calisan.mod === 'bitti') durdur();
        if (!calisan && !hazirla()) return;
        calisan.mod = 'adim';
        dugmeler();
        let s;
        do { s = birAdim(); } while (s === 'satir');
        if (s === 'harita') {
            haritaSekmeleri(calisan.haritaNo);
            durum(`<i class="fas fa-check"></i> Harita ${calisan.haritaNo + 1} tamam! Devam etmek için tekrar "Adım"a bas.`, 'ok');
            haritaBaslat(calisan.haritaNo + 1);
        } else if (s === 'bitti') kazandi();
        else if (s === 'dur') bitir();
    }

    function bitir() {
        if (calisan) calisan.mod = 'bitti';
        kod.readOnly = false;
        dugmeler();
    }

    function durdur() {
        calisan = null;
        kod.readOnly = false;
        satirIsaretle(null);
        dugmeler();
    }

    function sifirla() {
        durdur();
        durum('');
        haritaSekmeleri();
        haritaGoster(gosterilenHarita);
    }

    function dugmeler() {
        const calisiyor = calisan && calisan.mod === 'calis';
        $('runBtn').disabled = calisiyor;
        $('stepBtn').disabled = calisiyor;
        $('resetBtn').innerHTML = calisiyor ? '<i class="fas fa-stop"></i> Durdur' : '<i class="fas fa-rotate-left"></i>';
    }

    function kazandi() {
        const s = SEVIYELER[no];
        const n = calisan.derlenmis.komutSayisi;
        const y = M.yildizHesapla(n, s.hedef);
        calisan.mod = 'bitti';
        haritaSekmeleri(s.haritalar.length - 1);
        satirIsaretle(null);
        kod.readOnly = false;
        dugmeler();
        const onceki = kayit.yildiz[no] || 0;
        kayit.yildiz[no] = Math.max(onceki, y);
        kodKaydet();
        bolumleriCiz();
        durum(`<i class="fas fa-trophy"></i> Bölüm tamamlandı! ${n} komut kullandın.`, 'ok');
        KL.konfeti();

        $('winTitle').textContent = y === 3 ? 'Mükemmel!' : 'Başardın!';
        $('winStars').innerHTML = KL.yildizHTML(y);
        $('winText').innerHTML = y === 3
            ? `${n} komutla çözdün. Daha kısası zor!`
            : `${n} komut kullandın. ${s.hedef} ya da daha az komutla 3 yıldız alabilirsin. Tekrar eden kısımları döngüyle yazmayı dene.`;
        const sonuncu = no === SEVIYELER.length - 1;
        $('winNext').hidden = sonuncu;
        if (sonuncu) $('winText').innerHTML += '<br><br><b>Tüm bölümleri bitirdin, tebrikler! 🎉</b>';
        setTimeout(() => $('winDialog').showModal(), 500);
    }

    $('winNext').addEventListener('click', () => { $('winDialog').close(); bolumAc(no + 1); });
    $('winStay').addEventListener('click', () => { $('winDialog').close(); });
    $('runBtn').addEventListener('click', calistirTikla);
    $('stepBtn').addEventListener('click', adimTikla);
    $('resetBtn').addEventListener('click', sifirla);

    bolumAc(no);
    if (ogretmen) KL.bildir('Öğretmen modu: tüm bölümler açık');
})();
