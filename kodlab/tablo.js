// Kodlayalım — Tablo Atölyesi arayüzü: ızgara, formül çubuğu, doldurma ve görev denetimi
(function () {
    'use strict';
    const T = window.TabloMotor;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('tablo', { yildiz: {}, calisma: {} });
    const giris = $('giris'), izgara = $('izgara');

    let g = null, ham = {}, tablo = null, sutun = 8, satir = 12, yanlis = 0;
    let aktif = { c: 0, r: 0 }, son = { c: 0, r: 0 }, duzen = null, surukle = null, ekleme = null, sonuc = null;
    const ad = (p) => T.hucreAd(p.c, p.r);
    const kilitli = (h) => !g.serbest && h in g.tablo;
    const hamMetin = (v) => v === undefined ? '' : typeof v === 'number' ? T.bicimle(v) : String(v);
    const secim = () => ({ c1: Math.min(aktif.c, son.c), c2: Math.max(aktif.c, son.c), r1: Math.min(aktif.r, son.r), r2: Math.max(aktif.r, son.r) });

    // ---------- Görev listesi ----------
    function listeCiz() {
        $('gorevler').innerHTML = T.GOREVLER.map((x, i) => `<button data-i="${i}" class="${x === g ? 'sel' : ''} ${kayit.yildiz[x.id] ? 'ok' : ''}"><span class="no">${x.serbest ? '<i class="fas fa-pen" style="font-size:.7em"></i>' : i + 1}</span>${x.ad}${x.serbest ? '' : KL.yildizHTML(kayit.yildiz[x.id] || 0)}</button>`).join('');
    }
    $('gorevler').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ac(+b.dataset.i); });

    function ac(i) {
        g = T.GOREVLER[i]; yanlis = 0; sonuc = null;
        ham = { ...g.tablo, ...(kayit.calisma[g.id] || {}) };
        const kullanilan = Object.keys({ ...g.tablo, ...g.ref }).map(T.hucreAyir);
        sutun = g.serbest ? 10 : Math.max(6, ...kullanilan.map(p => p.c + 2));
        satir = g.serbest ? 30 : Math.max(10, ...kullanilan.map(p => p.r + 3));
        $('baslik').innerHTML = `${kacis(g.ad)} <span class="sinif">${g.sinif[0]}. – ${g.sinif[1]}. sınıf</span>`;
        $('anlatim').innerHTML = g.anlatim;
        $('kontrol').hidden = !!g.serbest;
        $('ipucu').hidden = true; $('sonuclar').innerHTML = '';
        const ilk = g.hedef[0] ? T.hucreAyir(g.hedef[0]) : { c: 0, r: 0 };
        aktif = { ...ilk }; son = { ...ilk };
        izgaraKur(); sec(ilk.c, ilk.r);
        listeCiz();
        history.replaceState(null, '', '#' + g.id);
    }

    // ---------- Izgara ----------
    function izgaraKur() {
        let h = '<thead><tr><th></th>';
        for (let c = 0; c < sutun; c++) h += `<th data-c="${c}">${T.SUTUN(c)}</th>`;
        h += '</tr></thead><tbody>';
        for (let r = 0; r < satir; r++) {
            h += `<tr><th data-r="${r}">${r + 1}</th>`;
            for (let c = 0; c < sutun; c++) h += `<td data-c="${c}" data-r="${r}"></td>`;
            h += '</tr>';
        }
        izgara.innerHTML = h + '</tbody>';
        ciz();
    }
    const hucreTd = (c, r) => izgara.querySelector(`td[data-c="${c}"][data-r="${r}"]`);
    function gosterim(v) {
        if (T.hataMi(v)) return v.hata;
        if (typeof v === 'number') return T.bicimle(Math.round(v * 1e4) / 1e4);
        return T.metne(v);
    }
    function ciz() {
        tablo = new T.Tablo(ham);
        const s = secim();
        const durum = Object.fromEntries((sonuc || []).map(x => [x.hucre, x.gecti]));
        const hedefler = new Set(g.hedef);
        const basliklar = new Set(Object.keys(g.tablo).filter(h => /^[A-Z]+1$/.test(h) && typeof g.tablo[h] === 'string'));
        izgara.querySelectorAll('td').forEach(td => {
            const c = +td.dataset.c, r = +td.dataset.r, h = T.hucreAd(c, r);
            const v = tablo.deger(h), hm = ham[h];
            td.textContent = hm === undefined || hm === '' ? '' : gosterim(v);
            td.title = typeof hm === 'string' && hm.startsWith('=') ? hm : '';
            td.className = [
                typeof v === 'number' ? 'sayi' : '',
                T.hataMi(v) ? 'hata' : '',
                kilitli(h) ? 'veri' : '',
                basliklar.has(h) ? 'baslik' : '',
                hedefler.has(h) ? 'hedef' : '',
                typeof hm === 'string' && hm.startsWith('=') && !kilitli(h) ? 'formul' : '',
                h in durum ? (durum[h] ? 'gecti' : 'kaldi') : '',
                c >= s.c1 && c <= s.c2 && r >= s.r1 && r <= s.r2 && (s.c1 !== s.c2 || s.r1 !== s.r2) ? 'secim' : '',
                c === aktif.c && r === aktif.r ? 'aktif' : ''
            ].filter(Boolean).join(' ');
            if (c === s.c2 && r === s.r2) td.insertAdjacentHTML('beforeend', '<span class="tutamac" aria-hidden="true"></span>');
        });
        izgara.querySelectorAll('thead th[data-c]').forEach(th => th.classList.toggle('vurgu', +th.dataset.c >= s.c1 && +th.dataset.c <= s.c2));
        izgara.querySelectorAll('tbody th').forEach(th => th.classList.toggle('vurgu', +th.dataset.r >= s.r1 && +th.dataset.r <= s.r2));
        basvuruVurgula();
    }
    function sec(c, r, uzat) {
        c = Math.max(0, Math.min(sutun - 1, c)); r = Math.max(0, Math.min(satir - 1, r));
        if (uzat) son = { c, r }; else { aktif = { c, r }; son = { c, r }; }
        duzen = ad(aktif);
        const sc = secim();
        $('hAd').textContent = ad(aktif) === ad(son) ? ad(aktif) : `${T.hucreAd(sc.c1, sc.r1)}:${T.hucreAd(sc.c2, sc.r2)}`;
        giris.value = hamMetin(ham[duzen]);
        giris.readOnly = kilitli(duzen);
        ciz();
        const td = hucreTd(son.c, son.r);
        if (td && td.scrollIntoView) td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // ---------- Düzenleme ----------
    function kaydet() {
        if (!g.serbest || Object.keys(ham).length) {
            const cal = {};
            for (const [h, v] of Object.entries(ham)) if (!kilitli(h) && v !== '') cal[h] = v;
            kayit.calisma[g.id] = cal; KL.yaz('tablo', kayit);
        }
    }
    function yazHucre(h, deger) {
        if (kilitli(h)) return false;
        deger = String(deger).trim();
        if (deger.startsWith('=')) deger = '=' + deger.slice(1).replace(/(\$?[a-z]{1,2}\$?\d+)(?![\wçğıöşü(])/gi, m => m.toUpperCase());
        if (deger === '') delete ham[h]; else ham[h] = deger;
        return true;
    }
    function onayla() {
        if (!duzen) return false;
        const eski = hamMetin(ham[duzen]);
        if (giris.value === eski) return false;
        if (kilitli(duzen)) { KL.bildir('Bu hücre görevin verisi; değiştirilemez.'); giris.value = eski; return false; }
        yazHucre(duzen, giris.value);
        sonuc = null; ekleme = null; kaydet(); ciz();
        const v = tablo.deger(duzen);
        if (T.hataMi(v)) KL.ses('yanlis');
        return true;
    }
    giris.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); onayla(); giris.blur(); sec(aktif.c, aktif.r + (e.shiftKey ? -1 : 1)); }
        else if (e.key === 'Tab') { e.preventDefault(); onayla(); giris.blur(); sec(aktif.c + (e.shiftKey ? -1 : 1), aktif.r); }
        else if (e.key === 'Escape') { giris.value = hamMetin(ham[duzen]); ekleme = null; giris.blur(); basvuruVurgula(); }
    });
    giris.addEventListener('blur', () => { onayla(); });
    giris.addEventListener('input', () => { ekleme = null; basvuruVurgula(); });
    $('onay').onclick = () => { onayla(); sec(aktif.c, aktif.r); };

    // Formüldeki başvuruları ızgarada göster
    function basvuruVurgula() {
        izgara.querySelectorAll('td.basvuru').forEach(td => td.classList.remove('basvuru'));
        const f = document.activeElement === giris ? giris.value : '';
        if (!f.startsWith('=')) return;
        const temiz = f.replace(/"(?:[^"]|"")*"/g, '""');
        for (const m of temiz.matchAll(/\$?([A-Za-z]{1,2})\$?(\d+)(?::\$?([A-Za-z]{1,2})\$?(\d+))?(?![\wçğıöşüÇĞİÖŞÜ(])/g)) {
            const a = T.hucreAyir(m[1].toUpperCase() + m[2]), b = m[3] ? T.hucreAyir(m[3].toUpperCase() + m[4]) : a;
            for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r) && r < satir; r++) for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c) && c < sutun; c++) { const td = hucreTd(c, r); if (td) td.classList.add('basvuru'); }
        }
    }
    giris.addEventListener('focus', basvuruVurgula);

    // Formül yazarken hücreye tıklanırsa başvurusu eklenir
    function basvuruEklenebilir() {
        if (document.activeElement !== giris || !giris.value.startsWith('=') || giris.readOnly) return false;
        const k = giris.selectionStart;
        if (ekleme && k === ekleme.son) return true;
        return /[=(;+\-*/^&<>:,]\s*$/.test(giris.value.slice(0, k));
    }
    function basvuruYaz(a, b) {
        const metin = a.c === b.c && a.r === b.r ? ad(a) : `${ad({ c: Math.min(a.c, b.c), r: Math.min(a.r, b.r) })}:${ad({ c: Math.max(a.c, b.c), r: Math.max(a.r, b.r) })}`;
        const bas = ekleme ? ekleme.bas : giris.selectionStart, bit = ekleme ? ekleme.son : giris.selectionEnd;
        giris.value = giris.value.slice(0, bas) + metin + giris.value.slice(bit);
        ekleme = { bas, son: bas + metin.length };
        giris.setSelectionRange(ekleme.son, ekleme.son);
        basvuruVurgula();
    }

    // ---------- Fare / dokunma ----------
    const tdBul = (x, y) => { const el = document.elementFromPoint(x, y); const td = el && el.closest && el.closest('td'); return td && izgara.contains(td) ? { c: +td.dataset.c, r: +td.dataset.r } : null; };
    izgara.addEventListener('pointerdown', (e) => {
        const td = e.target.closest('td');
        if (!td) return;
        const p = { c: +td.dataset.c, r: +td.dataset.r };
        if (e.target.classList.contains('tutamac')) {
            e.preventDefault(); onayla();
            surukle = { tur: 'doldur', hedef: p };
            return;
        }
        if (basvuruEklenebilir()) {
            e.preventDefault();
            if (!ekleme || giris.selectionStart !== ekleme.son) ekleme = null;
            surukle = { tur: 'basvuru', bas: p };
            basvuruYaz(p, p);
            return;
        }
        if (document.activeElement === giris) { onayla(); giris.blur(); }
        sec(p.c, p.r, e.shiftKey);
        if (e.pointerType === 'mouse') surukle = { tur: 'sec' };
    });
    document.addEventListener('pointermove', (e) => {
        if (!surukle) return;
        const p = tdBul(e.clientX, e.clientY);
        if (!p) return;
        if (surukle.tur === 'sec' && (p.c !== son.c || p.r !== son.r)) sec(p.c, p.r, true);
        else if (surukle.tur === 'basvuru') basvuruYaz(surukle.bas, p);
        else if (surukle.tur === 'doldur') {
            surukle.hedef = p;
            const s = secim();
            izgara.querySelectorAll('td.secim').forEach(x => x.classList.remove('secim'));
            const dikey = Math.abs(p.r - s.r2) >= Math.abs(p.c - s.c2);
            const alan = dikey ? { c1: s.c1, c2: s.c2, r1: s.r1, r2: Math.max(s.r2, p.r) } : { c1: s.c1, c2: Math.max(s.c2, p.c), r1: s.r1, r2: s.r2 };
            for (let r = alan.r1; r <= alan.r2; r++) for (let c = alan.c1; c <= alan.c2; c++) hucreTd(c, r).classList.add('secim');
        }
    });
    document.addEventListener('pointerup', () => {
        if (surukle && surukle.tur === 'doldur') {
            const s = secim(), p = surukle.hedef;
            if (Math.abs(p.r - s.r2) >= Math.abs(p.c - s.c2) && p.r > s.r2) { son = { c: s.c2, r: p.r }; aktif = { c: s.c1, r: s.r1 }; doldur('asagi'); }
            else if (p.c > s.c2) { son = { c: p.c, r: s.r2 }; aktif = { c: s.c1, r: s.r1 }; doldur('sag'); }
            else ciz();
        }
        surukle = null;
    });

    // ---------- Doldurma ----------
    function doldur(yon) {
        if (document.activeElement === giris) { onayla(); giris.blur(); }
        let s = secim();
        const hedefler = new Set(g.hedef);
        const uygun = (h) => g.serbest || hedefler.has(h);
        if (s.c1 === s.c2 && s.r1 === s.r2) {
            // Tek hücre seçiliyse: yanındaki sütun/satır dolu olduğu sürece uzat
            if (yon === 'asagi') { let r = s.r1; const komsu = s.c1 > 0 ? s.c1 - 1 : s.c1 + 1; while (r + 1 < satir && (ham[T.hucreAd(komsu, r + 1)] ?? '') !== '' && uygun(T.hucreAd(s.c1, r + 1))) r++; s.r2 = r; }
            else { let c = s.c1; const komsu = s.r1 > 0 ? s.r1 - 1 : s.r1 + 1; while (c + 1 < sutun && (ham[T.hucreAd(c + 1, komsu)] ?? '') !== '' && uygun(T.hucreAd(c + 1, s.r1))) c++; s.c2 = c; }
            if (s.r2 === s.r1 && s.c2 === s.c1) { KL.bildir(yon === 'asagi' ? 'Doldurulacak hücreleri seç (ör. Shift + ↓) ya da köşedeki kareyi sürükle.' : 'Doldurulacak hücreleri seç (ör. Shift + →) ya da köşedeki kareyi sürükle.'); return; }
        }
        let atlanan = 0, yazilan = 0;
        for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) {
            const kaynak = yon === 'asagi' ? { c, r: s.r1 } : { c: s.c1, r };
            if (kaynak.c === c && kaynak.r === r) continue;
            const h = T.hucreAd(c, r), v = ham[ad(kaynak)];
            if (kilitli(h)) { atlanan++; continue; }
            const yeni = typeof v === 'string' && v.startsWith('=') ? T.kaydir(v, r - kaynak.r, c - kaynak.c) : v;
            if (yeni === undefined || yeni === '') delete ham[h]; else ham[h] = yeni;
            yazilan++;
        }
        aktif = { c: s.c1, r: s.r1 }; son = { c: s.c2, r: s.r2 };
        sonuc = null; kaydet(); sec(aktif.c, aktif.r); son = { c: s.c2, r: s.r2 }; ciz();
        if (atlanan) KL.bildir(`${atlanan} veri hücresi korundu.`);
        else if (yazilan) KL.ses('dogru');
    }
    $('doldurAsagi').onclick = () => doldur('asagi');
    $('doldurSag').onclick = () => doldur('sag');
    function temizle() {
        const s = secim(); let n = 0;
        for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) { const h = T.hucreAd(c, r); if (!kilitli(h) && h in ham) { delete ham[h]; n++; } }
        if (n) { sonuc = null; kaydet(); giris.value = hamMetin(ham[duzen]); ciz(); }
    }
    $('temizle').onclick = temizle;
    $('sifirla').onclick = () => {
        if (!confirm('Bu görevdeki bütün çalışman silinsin mi?')) return;
        delete kayit.calisma[g.id]; KL.yaz('tablo', kayit);
        ac(T.GOREVLER.indexOf(g));
    };

    // ---------- Klavye ----------
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === giris || !g || e.altKey) return;
        const odak = document.activeElement;
        if (odak && odak !== document.body && !izgara.contains(odak) && odak.closest('input, textarea, select, button, a, summary, details')) return;
        const yon = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
        if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'r')) { e.preventDefault(); doldur(e.key === 'd' ? 'asagi' : 'sag'); return; }
        if (e.ctrlKey || e.metaKey) return;
        if (yon) { e.preventDefault(); const p = e.shiftKey ? son : aktif; sec(p.c + yon[0], p.r + yon[1], e.shiftKey); }
        else if (e.key === 'Tab') { e.preventDefault(); sec(aktif.c + (e.shiftKey ? -1 : 1), aktif.r); }
        else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); if (!giris.readOnly) { giris.focus(); giris.setSelectionRange(giris.value.length, giris.value.length); } }
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); temizle(); }
        else if (e.key.length === 1 && !giris.readOnly) { e.preventDefault(); giris.value = e.key; giris.focus(); giris.setSelectionRange(1, 1); basvuruVurgula(); }
        else if (e.key.length === 1 && giris.readOnly) KL.bildir('Bu hücre görevin verisi; değiştirilemez.');
    });

    // Fonksiyon düğmeleri formüle ekler
    $('fonklar').innerHTML = ['TOPLA', 'ORTALAMA', 'MAK', 'MİN', 'EĞER', 'EĞERSAY', 'ETOPLA', 'YUVARLA', 'UZUNLUK', '$'].map(f => `<button data-f="${f}">${f === '$' ? '$ sabitle' : f + '( )'}</button>`).join('');
    $('fonklar').addEventListener('pointerdown', (e) => e.preventDefault());
    $('fonklar').addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b || giris.readOnly) return;
        const f = b.dataset.f;
        if (document.activeElement !== giris) { giris.focus(); if (!giris.value.startsWith('=')) giris.value = '='; giris.setSelectionRange(giris.value.length, giris.value.length); }
        const k = giris.selectionStart, onceki = giris.value.slice(0, k);
        if (f === '$') {
            // İmlecin solundaki başvuruyu A1 → $A$1 → A$1 → $A1 → A1 döngüsünde değiştir (F4 gibi)
            const m = /(\$?)([A-Z]{1,2})(\$?)(\d+)$/i.exec(onceki);
            if (!m) { KL.bildir('Önce bir hücre başvurusu yaz, sonra $ ile sabitle.'); return; }
            const durumlar = ['', '$$', 'r', 'c'];
            const simdiki = m[1] && m[3] ? 1 : m[3] ? 2 : m[1] ? 3 : 0;
            const yeni = durumlar[(simdiki + 1) % 4];
            const metin = (yeni === '$$' || yeni === 'c' ? '$' : '') + m[2] + (yeni === '$$' || yeni === 'r' ? '$' : '') + m[4];
            giris.value = onceki.slice(0, onceki.length - m[0].length) + metin + giris.value.slice(k);
            const yer = k - m[0].length + metin.length; giris.setSelectionRange(yer, yer);
        } else {
            const ek = f + '(';
            giris.value = onceki + ek + ')' + giris.value.slice(giris.selectionEnd);
            giris.setSelectionRange(k + ek.length, k + ek.length);
        }
        ekleme = null; basvuruVurgula();
    });

    // ---------- Denetim ----------
    $('kontrol').onclick = () => {
        if (document.activeElement === giris) { onayla(); giris.blur(); }
        sonuc = T.denetle(g, ham);
        const tamam = sonuc.every(s => s.gecti);
        const neden = (s) => s.neden === 'boş' ? 'boş' : s.neden === 'formül değil' ? 'sonucu elle yazmışsın; = ile başlayan bir formül yaz'
            : s.neden === 'veriler değişince yanlış' ? 'şimdilik doğru görünüyor ama veriler değişince yanlış sonuç veriyor (sabit sayı ya da yanlış başvuru mu var?)'
                : s.neden.startsWith('#') ? `${s.neden} hatası` : `sonuç ${s.bulunan || '(boş)'} çıktı, ${s.beklenen || '(boş metin)'} olmalıydı`;
        $('sonuclar').innerHTML = sonuc.map(s => `<div><i class="fas ${s.gecti ? 'fa-circle-check' : 'fa-circle-xmark'}"></i><span><b>${s.hucre}</b> ${s.gecti ? 'doğru' : kacis(neden(s))}</span></div>`).join('');
        ciz();
        if (tamam) {
            const y = T.yildiz(yanlis);
            if (y > (kayit.yildiz[g.id] || 0)) kayit.yildiz[g.id] = y;
            KL.yaz('tablo', kayit); listeCiz();
            $('sonuclar').insertAdjacentHTML('afterbegin', `<div style="font-weight:700;font-size:1rem">${KL.yildizHTML(y)} Harika! Görev tamam.${y < 3 ? ' Hatasız denetimle 3 yıldız alırsın.' : ''}</div>`);
            if (y === 3) KL.konfeti(); else KL.ses('kazan');
            const sonraki = T.GOREVLER.indexOf(g) + 1;
            $('sonuclar').insertAdjacentHTML('beforeend', `<div><button class="btn btn-primary" id="sonraki">Sonraki görev <i class="fas fa-arrow-right"></i></button></div>`);
            $('sonraki').onclick = () => { ac(sonraki); window.scrollTo(0, 0); };
            $('ipucu').hidden = true;
        } else {
            yanlis++; KL.ses('yanlis');
            if (yanlis >= 2) {
                const ilk = sonuc.find(s => !s.gecti);
                $('ipucu').innerHTML = `<i class="fas fa-lightbulb"></i> ${g.ipucu ? kacis(g.ipucu) + ' ' : ''}<b>${ilk.hucre}</b> için örnek bir çözüm: <code>${kacis(g.ref[ilk.hucre])}</code>`;
                $('ipucu').hidden = false;
            }
        }
    };

    listeCiz();
    const bas = T.GOREVLER.findIndex(x => '#' + x.id === location.hash);
    ac(bas >= 0 ? bas : Math.max(0, T.GOREVLER.findIndex(x => !kayit.yildiz[x.id] && !x.serbest)));
})();
