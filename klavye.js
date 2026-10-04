// Kodlayalım — Klavye Ustası arayüzü
(function () {
    'use strict';
    const K = window.Klavye;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('klavye', { yildiz: {}, yagmurRekor: 0, hizRekor: 0 });
    const kaydet = () => KL.yaz('klavye', kayit);
    let sekme = 'ders';

    // ---------- Ekrandaki klavye ve eller ----------
    function klavyeCiz() {
        const sira = (l, ek = '') => `<div class="sira">${ek}${l.map(c => `<button class="tus ${K.ANA_SIRA[c] ? 'cikinti' : ''} ${c === ' ' ? 'bosluk-tus' : ''}" data-c="${kacis(c)}" style="--p:${K.PARMAK_RENK[K.parmak(c)]}">${c === ' ' ? 'boşluk' : kacis(c.toLocaleUpperCase('tr-TR'))}</button>`).join('')}</div>`;
        $('klavye').innerHTML = K.DUZEN.map((l, i) => sira(l, i === 3 ? '<button class="tus shift" data-c="shift" style="--p:#ef4444">⇧ Shift</button>' : '')).join('');
        const el = (l) => `<div class="el">${l.map(p => `<span class="parmak" data-p="${p}" style="background:${K.PARMAK_RENK[p]};height:${[34, 44, 50, 46, 30, 30, 46, 50, 44, 34][p]}px"></span>`).join('')}</div>`;
        $('eller').innerHTML = el([0, 1, 2, 3, 4]) + el([5, 6, 7, 8, 9]);
    }
    function hedefGoster(c) {
        document.querySelectorAll('.tus.hedef, .parmak.aktif').forEach(x => x.classList.remove('hedef', 'aktif'));
        if (c === undefined) { $('ipucu').innerHTML = ''; return; }
        const k = c === ' ' ? ' ' : c.toLocaleLowerCase('tr-TR');
        const t = document.querySelector(`.tus[data-c="${CSS.escape(k)}"]`);
        if (t) t.classList.add('hedef');
        const p = K.parmak(c);
        const buyuk = c !== k && /\p{L}/u.test(c);
        if (buyuk) document.querySelector('.tus[data-c="shift"]').classList.add('hedef');
        document.querySelectorAll(`.parmak[data-p="${p}"]`).forEach(x => x.classList.add('aktif'));
        $('ipucu').innerHTML = `<span class="nokta" style="background:${K.PARMAK_RENK[p]}"></span> <b>${c === ' ' ? 'Boşluk' : kacis(c)}</b> → ${K.PARMAK_ADLARI[p]} parmak${buyuk ? ' + karşı eldeki Shift' : ''}`;
    }
    function tusVurgu(c, dogru) {
        const k = c === ' ' ? ' ' : c.toLocaleLowerCase('tr-TR');
        const t = document.querySelector(`.tus[data-c="${CSS.escape(k)}"]`);
        if (!t) return;
        t.classList.add(dogru ? 'basildi' : 'yanlis');
        setTimeout(() => t.classList.remove('basildi', 'yanlis'), 140);
    }

    // ---------- Yazma alıştırması (ders ve hız testi ortak) ----------
    function yazici(kutu, metin, bitince, guncelle) {
        const y = { metin, i: 0, dogru: 0, yanlis: 0, hatali: new Set(), bas: 0, bitti: false };
        y.ciz = () => {
            // Kelimeler satır sonunda bölünmesin: her kelime (ve ardındaki boşluk) tek parça
            let h = '', kelime = '';
            [...metin].forEach((c, j) => {
                kelime += `<span class="${j < y.i ? (y.hatali.has(j) ? 'y' : 'd') : j === y.i ? 's' + (c === ' ' ? ' bosluk' : '') : 'b'}">${c === ' ' ? '&nbsp;' : kacis(c)}</span>`;
                if (c === ' ' || j === metin.length - 1) { h += `<span class="kel">${kelime}</span>`; kelime = ''; }
            });
            kutu.innerHTML = h;
            const s = kutu.querySelector('.s');
            if (s && s.offsetTop > kutu.clientHeight + kutu.scrollTop - 40) kutu.scrollTop = s.offsetTop - 40;
        };
        y.bas_ = (c) => {
            if (y.bitti) return;
            if (!y.bas) y.bas = performance.now();
            const beklenen = metin[y.i];
            if (c === beklenen) { y.dogru++; y.i++; tusVurgu(c, true); }
            else { y.yanlis++; y.hatali.add(y.i); tusVurgu(c, false); KL.ses('tik'); }
            y.ciz();
            guncelle && guncelle(y);
            if (y.i >= metin.length) { y.bitti = true; bitince(y); }
        };
        y.ciz();
        return y;
    }
    const sure = (y) => (y.bas ? performance.now() - y.bas : 0);

    // ---------- Dersler ----------
    let dersNo = 0, aktif = null;
    const acik = (i) => ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0;
    function dersleriCiz() {
        $('dersler').innerHTML = K.DERSLER.map((d, i) => {
            const y = kayit.yildiz[i] || 0;
            return `<button data-i="${i}" class="${i === dersNo ? 'sel' : ''} ${y ? 'ok' : ''} ${acik(i) ? '' : 'kilit'}"><span class="no">${acik(i) ? i + 1 : '<i class="fas fa-lock" style="font-size:.6rem"></i>'}</span>${kacis(d.ad)}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('');
    }
    $('dersler').onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (!acik(+b.dataset.i)) { KL.bildir('Önce önceki dersi bitir!'); return; }
        dersAc(+b.dataset.i);
    };
    function dersAc(i) {
        dersNo = i;
        const d = K.DERSLER[i];
        $('baslik').textContent = `${i + 1}. ${d.ad}`;
        $('anlatim').textContent = d.ipucu || (d.yeni.length ? `Yeni tuşlar: ${d.yeni.join(' ')}. Ekrandaki klavyeye değil, metne bak!` : 'Bakmadan yazmaya çalış; doğruluk hızdan önemlidir.');
        const metin = K.metinUret(d, Date.now() % 1e9, d.cumle ? 140 : 110);
        aktif = yazici($('metin'), metin, dersBitti, olcumGuncelle);
        $('hiz').textContent = 0; $('dogruluk').textContent = 100; $('ilerleme').style.width = '0%';
        hedefGoster(metin[0]);
        dersleriCiz();
        $('metin').focus({ preventScroll: true });
    }
    function olcumGuncelle(y) {
        const s = K.istatistik(y.dogru, y.yanlis, sure(y));
        $('hiz').textContent = s.kdk; $('dogruluk').textContent = s.dogruluk;
        $('ilerleme').style.width = Math.round(y.i / y.metin.length * 100) + '%';
        hedefGoster(y.metin[y.i]);
    }
    function dersBitti(y) {
        const s = K.istatistik(y.dogru, y.yanlis, sure(y)), yil = K.yildiz(s.dogruluk);
        kayit.yildiz[dersNo] = Math.max(kayit.yildiz[dersNo] || 0, yil); kaydet(); dersleriCiz();
        $('bBaslik').textContent = yil === 3 ? 'Parmakların uçuyor!' : 'Ders tamam!';
        $('bYildiz').innerHTML = KL.yildizHTML(yil);
        $('bMetin').textContent = `Hız: ${s.kdk} kelime/dk · Doğruluk: %${s.dogruluk}. ${yil < 3 ? '3 yıldız için en az %97 doğruluk gerekir; yavaş ve doğru yaz.' : ''}`;
        $('bSonraki').hidden = dersNo >= K.DERSLER.length - 1;
        if (yil === 3) KL.konfeti(); else KL.ses('kazan');
        $('bitti').showModal();
    }
    $('bTekrar').onclick = () => { $('bitti').close(); dersAc(dersNo); };
    $('bSonraki').onclick = () => { $('bitti').close(); dersAc(dersNo + 1); };
    $('yeniden').onclick = () => dersAc(dersNo);

    // ---------- Hız testi ----------
    let hiz = null, hizSaat = null;
    function hizBaslat() {
        const metin = K.metinUret(K.DERSLER.find(d => d.cumle), Date.now() % 1e9, 600);
        hiz = yazici($('hMetin'), metin, hizBitir, (y) => { $('hHiz').textContent = K.istatistik(y.dogru, y.yanlis, sure(y)).kdk; });
        $('hSure').textContent = 60; $('hHiz').textContent = 0; $('hSonuc').textContent = '';
        $('hBasla').disabled = true;
        clearInterval(hizSaat);
        hizSaat = setInterval(() => {
            if (!hiz.bas) return;
            const kalan = Math.max(0, 60 - Math.floor(sure(hiz) / 1000));
            $('hSure').textContent = kalan;
            if (kalan === 0) hizBitir(hiz);
        }, 200);
        $('hMetin').focus();
    }
    function hizBitir(y) {
        if (y.sonlandi) return;
        y.sonlandi = y.bitti = true; clearInterval(hizSaat);
        const s = K.istatistik(y.dogru, y.yanlis, Math.min(sure(y), 60000));
        const rekor = s.kdk > (kayit.hizRekor || 0) && s.dogruluk >= 90;
        if (rekor) { kayit.hizRekor = s.kdk; kaydet(); KL.konfeti(); } else KL.ses('kazan');
        $('hRekor').textContent = kayit.hizRekor || '–';
        $('hSonuc').textContent = `${s.kdk} kelime/dk, %${s.dogruluk} doğruluk${rekor ? ' — yeni rekor!' : s.dogruluk < 90 ? ' (rekor için en az %90 doğruluk)' : ''}`;
        $('hBasla').disabled = false; $('hBasla').innerHTML = '<i class="fas fa-rotate-left"></i> Tekrar';
    }
    $('hBasla').onclick = hizBaslat;
    $('hRekor').textContent = kayit.hizRekor || '–';

    // ---------- Kelime yağmuru ----------
    const yg = { calisiyor: false, kelimeler: [], yazilan: '', skor: 0, can: 3, son: 0, uret: 0, hiz: 26 };
    function yagmurBaslat() {
        const biten = Object.keys(kayit.yildiz).length;
        yg.havuz = K.yagmurKelimeleri(Math.max(biten, 5));
        yg.kelimeler.forEach(k => k.el.remove());
        Object.assign(yg, { calisiyor: true, kelimeler: [], yazilan: '', skor: 0, can: 3, son: performance.now(), uret: 0, hiz: 26 });
        $('yBilgi').hidden = true; yagmurOlcu(); $('yYazilan').textContent = '';
        requestAnimationFrame(yagmurAdim);
    }
    function yagmurOlcu() { $('ySkor').textContent = yg.skor; $('yCan').textContent = '❤'.repeat(yg.can) || '–'; $('yRekor').textContent = kayit.yagmurRekor || 0; }
    function yagmurAdim(t) {
        if (!yg.calisiyor) return;
        const dt = Math.min(60, t - yg.son) / 1000; yg.son = t;
        const kutu = $('yagmur'), H = kutu.clientHeight, W = kutu.clientWidth;
        yg.uret -= dt;
        if (yg.uret <= 0) {
            const metin = yg.havuz[Math.floor(Math.random() * yg.havuz.length)];
            const el = document.createElement('span'); el.className = 'kel'; el.textContent = metin; kutu.appendChild(el);
            const x = 10 + Math.random() * Math.max(10, W - 20 - metin.length * 15 - 30);
            yg.kelimeler.push({ metin, el, x, y: -40 });
            yg.uret = Math.max(1.1, 2.6 - yg.skor * 0.04);
        }
        yg.hiz = 26 + yg.skor * 1.2;
        for (const k of [...yg.kelimeler]) {
            k.y += yg.hiz * dt;
            k.el.style.transform = `translate(${k.x}px, ${k.y}px)`;
            const on = yg.yazilan && k.metin.startsWith(yg.yazilan);
            k.el.classList.toggle('hedefte', !!on);
            k.el.innerHTML = on ? `<u>${kacis(yg.yazilan)}</u>${kacis(k.metin.slice(yg.yazilan.length))}` : kacis(k.metin);
            if (k.y > H - 30) {
                k.el.remove(); yg.kelimeler.splice(yg.kelimeler.indexOf(k), 1);
                yg.can--; KL.ses('yanlis'); yagmurOlcu();
                if (yg.can <= 0) return yagmurBitir();
            }
        }
        requestAnimationFrame(yagmurAdim);
    }
    function yagmurTus(c) {
        if (!yg.calisiyor) return;
        if (c === '\b') yg.yazilan = yg.yazilan.slice(0, -1);
        else if (c === ' ' || c === '\n') yg.yazilan = '';
        else {
            const yeni = yg.yazilan + c;
            if (yg.kelimeler.some(k => k.metin.startsWith(yeni))) yg.yazilan = yeni; else { KL.ses('tik'); return; }
        }
        const tam = yg.kelimeler.find(k => k.metin === yg.yazilan);
        if (tam) {
            tam.el.remove(); yg.kelimeler.splice(yg.kelimeler.indexOf(tam), 1);
            yg.skor++; yg.yazilan = ''; KL.ses('dogru'); yagmurOlcu();
        }
        $('yYazilan').textContent = yg.yazilan;
    }
    function yagmurBitir() {
        yg.calisiyor = false;
        const rekor = yg.skor > (kayit.yagmurRekor || 0);
        if (rekor) { kayit.yagmurRekor = yg.skor; kaydet(); KL.konfeti(); }
        yagmurOlcu();
        $('yBilgi').hidden = false;
        $('yBilgi').innerHTML = `<div><h2>${rekor ? 'Yeni rekor!' : 'Oyun bitti'}</h2><p style="opacity:.85;margin:8px 0 16px">${yg.skor} kelime yakaladın.</p><button class="btn btn-primary" id="yBasla"><i class="fas fa-rotate-left"></i> Tekrar oyna</button></div>`;
        $('yBasla').onclick = yagmurBaslat;
    }
    $('yBasla').onclick = yagmurBaslat;

    // ---------- Klavye girişi ----------
    function karakter(c) {
        if (sekme === 'ders' && aktif) aktif.bas_(c);
        else if (sekme === 'hiz' && hiz && !hiz.bitti) hiz.bas_(c);
        else if (sekme === 'yagmur') yagmurTus(c);
    }
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || $('bitti').open) return;
        if (e.target.closest('input, textarea, select')) return;
        if (e.key === 'Backspace' && sekme === 'yagmur') { e.preventDefault(); return yagmurTus('\b'); }
        if (e.key.length !== 1) return;
        e.preventDefault();
        karakter(e.key);
    });
    // Dokunmatik ekran: ekrandaki tuşlar (Shift bir sonraki harfi büyütür)
    let shift = false;
    $('klavye').addEventListener('click', (e) => {
        const t = e.target.closest('.tus'); if (!t) return;
        const c = t.dataset.c;
        if (c === 'shift') { shift = !shift; t.classList.toggle('basildi', shift); return; }
        karakter(shift ? c.toLocaleUpperCase('tr-TR') : c);
        if (shift) { shift = false; document.querySelector('.tus[data-c="shift"]').classList.remove('basildi'); }
    });

    // ---------- Sekmeler ----------
    $('sekmeler').onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        sekme = b.dataset.s;
        document.querySelectorAll('#sekmeler button').forEach(x => x.classList.toggle('sel', x === b));
        $('dersAlan').hidden = sekme !== 'ders'; $('yagmurAlan').hidden = sekme !== 'yagmur'; $('hizAlan').hidden = sekme !== 'hiz';
        if (sekme !== 'yagmur' && yg.calisiyor) yagmurBitir();
        b.blur();
    };

    klavyeCiz();
    yagmurOlcu();
    const ilk = Math.min(K.DERSLER.length - 1, Math.max(0, K.DERSLER.findIndex((_, i) => !kayit.yildiz[i])));
    dersAc(ogretmen ? 0 : (ilk < 0 ? 0 : ilk));
    window.__klavye = { aktif: () => aktif };
})();
