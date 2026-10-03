// KodLab — Çizim Atölyesi arayüzü: sürükle-bırak blok editörü + kalemli robot sahnesi
(function () {
    'use strict';
    const C = window.Cizim;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('cizim', { yildiz: {}, prog: {}, py: {}, mod: 'blok' });
    const SERBEST = 'serbest';
    const TUM_BLOKLAR = ['ileri', 'geri', 'saga', 'sola', 'kaldir', 'indir', 'renk', 'kalinlik', 'tekrar', 'say', 'tanim', 'cagir'];

    // ---------- Blok tanımları ----------
    // parca: ['m', metin] | ['n', alan, varsayılan] sayı/değişken | ['c', alan, varsayılan] renk | ['a', alan, varsayılan] ad | ['f', alan] fonksiyon seçimi
    const TANIM = {
        ileri: { renk: '#1d5fd6', grup: 'Hareket', parca: [['m', 'ileri git'], ['n', 'n', 100], ['m', 'adım']] },
        geri: { renk: '#1d5fd6', grup: 'Hareket', parca: [['m', 'geri git'], ['n', 'n', 50], ['m', 'adım']] },
        saga: { renk: '#0284c7', grup: 'Hareket', parca: [['m', '↻ sağa dön'], ['n', 'n', 90], ['m', '°']] },
        sola: { renk: '#0284c7', grup: 'Hareket', parca: [['m', '↺ sola dön'], ['n', 'n', 90], ['m', '°']] },
        kaldir: { renk: '#16a36a', grup: 'Kalem', parca: [['m', '✎ kalemi kaldır']] },
        indir: { renk: '#16a36a', grup: 'Kalem', parca: [['m', '✎ kalemi indir']] },
        renk: { renk: '#16a36a', grup: 'Kalem', parca: [['m', 'renk'], ['c', 'c', 'kirmizi']] },
        kalinlik: { renk: '#16a36a', grup: 'Kalem', parca: [['m', 'kalınlık'], ['n', 'n', 6]] },
        tekrar: { renk: '#f59e0b', grup: 'Döngü', c: true, parca: [['m', 'tekrarla'], ['n', 'n', 4], ['m', 'kez']] },
        say: { renk: '#ea580c', grup: 'Döngü', c: true, parca: [['m', 'i sayacı:'], ['n', 'a', 10], ['m', 'den'], ['n', 'b', 100], ['m', "'e,"], ['n', 's', 10], ['m', 'artarak']] },
        tanim: { renk: '#8b5cf6', grup: 'Fonksiyon', c: true, parca: [['m', 'fonksiyon'], ['a', 'ad', 'kare']] },
        cagir: { renk: '#8b5cf6', grup: 'Fonksiyon', parca: [['m', 'çağır'], ['f', 'ad']] }
    };

    function yeniDugum(t) {
        const d = { t };
        for (const p of TANIM[t].parca) if (p[0] !== 'm' && p[0] !== 'f') d[p[1]] = p[2];
        if (TANIM[t].c) d.govde = [];
        if (t === 'say') { d.v = 'i'; d.dahil = true; }
        if (t === 'tanim') { d.param = []; d.ad = yeniFonkAdi(); }
        if (t === 'cagir') { d.ad = fonksiyonlar()[0] || ''; d.arg = []; }
        return d;
    }
    function yeniFonkAdi() {
        const var_ = new Set(fonksiyonlar());
        for (const ad of ['kare', 'ucgen', 'cicek', 'desen', 'sekil']) if (!var_.has(ad)) return ad;
        let i = 2; while (var_.has('sekil' + i)) i++; return 'sekil' + i;
    }
    const fonksiyonlar = () => program.filter(s => s.t === 'tanim').map(s => s.ad);

    // ---------- Durum ----------
    let no = 0, bolum = null, program = [], mod = kayit.mod || 'blok', calisiyor = false, animasyon = null;
    const bolumAcik = (i) => i === SERBEST || ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0;

    // ---------- Bölüm listesi ----------
    function bolumleriCiz() {
        $('levels').innerHTML = C.BOLUMLER.map((b, i) => {
            const y = kayit.yildiz[i] || 0;
            return `<button class="lvl ${i === no ? 'active' : ''} ${y ? 'done' : ''} ${bolumAcik(i) ? '' : 'locked'}" data-i="${i}" title="${i + 1}. ${b.ad}">${bolumAcik(i) ? i + 1 : '<i class="fas fa-lock" style="font-size:.75em"></i>'}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('') + `<button class="lvl serbest ${no === SERBEST ? 'active' : ''}" data-i="${SERBEST}"><i class="fas fa-palette"></i> Serbest</button>`;
    }
    $('levels').addEventListener('click', (e) => {
        const b = e.target.closest('.lvl');
        if (!b) return;
        const i = b.dataset.i === SERBEST ? SERBEST : +b.dataset.i;
        if (!bolumAcik(i)) { KL.bildir('Önce önceki bölümü bitir!'); return; }
        bolumAc(i);
    });

    function bolumAc(i) {
        durdur();
        no = i;
        bolum = i === SERBEST
            ? { ad: 'Serbest Çizim', anlatim: 'Hedef yok, hayal gücün var! Bütün blokları kullanarak istediğin resmi çiz. Bitince resmini indirebilirsin.', bloklar: TUM_BLOKLAR, bas: { x: 200, y: 200, h: 0 }, cozum: null }
            : C.BOLUMLER[i];
        $('baslik').textContent = i === SERBEST ? bolum.ad : `${i + 1}. ${bolum.ad}`;
        $('anlatim').innerHTML = bolum.anlatim;
        program = JSON.parse(JSON.stringify(kayit.prog[i] || []));
        $('py').value = kayit.py[i] || '';
        bolumleriCiz();
        modUygula();
        hedefCiz();
        sahneSifirla();
        durum('');
    }

    // ---------- Blok HTML ----------
    const kacis = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    function blokHTML(d, yol, kutuda) {
        const T = TANIM[d.t];
        const parcalar = T.parca.map(([tur, alan]) => {
            if (tur === 'm') return `<span>${alan}</span>`;
            if (tur === 'n') return `<input data-alan="${alan}" value="${kacis(d[alan])}" inputmode="numeric" aria-label="${alan}" ${kutuda ? 'tabindex="-1"' : ''}>`;
            if (tur === 'a') return `<input class="ad" data-alan="${alan}" value="${kacis(d[alan])}" aria-label="Fonksiyon adı" ${kutuda ? 'tabindex="-1"' : ''}>`;
            if (tur === 'c') return `<span class="rk" style="background:${C.RENKLER[d[alan]].hex}"></span><select data-alan="${alan}" aria-label="Renk" ${kutuda ? 'tabindex="-1"' : ''}>${Object.keys(C.RENKLER).map(k => `<option value="${k}" ${k === d[alan] ? 'selected' : ''}>${C.RENK_ADI[k]}</option>`).join('')}</select>`;
            if (tur === 'f') {
                const fs = fonksiyonlar();
                return `<select data-alan="${alan}" aria-label="Fonksiyon" ${kutuda ? 'tabindex="-1"' : ''}>${fs.length ? fs.map(f => `<option ${f === d.ad ? 'selected' : ''}>${kacis(f)}</option>`).join('') : '<option value="">—</option>'}</select>`;
            }
            return '';
        }).join('');
        const ic = T.c ? `<div class="ic"><div class="liste" data-liste="${yol}.g">${(d.govde || []).map((x, j) => blokHTML(x, `${yol}.g.${j}`, kutuda)).join('')}</div></div><div class="alt"></div>` : '';
        return `<div class="blk ${T.c ? 'c' : ''}" style="--b:${T.renk}" data-yol="${yol}" ${kutuda ? `data-tip="${d.t}"` : ''}><div class="ust">${parcalar}</div>${ic}</div>`;
    }

    function kutuCiz() {
        const gruplar = {};
        for (const t of bolum.bloklar) (gruplar[TANIM[t].grup] = gruplar[TANIM[t].grup] || []).push(t);
        $('kutu').innerHTML = Object.entries(gruplar).map(([g, ts]) => `<h3>${g}</h3>` + ts.map(t => blokHTML(yeniDugum(t), 'kutu', true)).join('')).join('');
    }

    function alanCiz() {
        $('alan').innerHTML = `<div class="sapka"><i class="fas fa-play"></i> çalıştırınca</div>
            <div class="liste kok" data-liste="">${program.map((d, i) => blokHTML(d, String(i), false)).join('')}</div>
            ${program.length ? '' : '<div class="ipucu-alan"><i class="fas fa-hand-pointer"></i> Blokları buraya sürükle</div>'}`;
        sayacGuncelle();
    }

    function sayacGuncelle() {
        const n = C.blokSayisi(program);
        const hedef = bolum.cozum ? (bolum.enFazla || C.blokSayisi(bolum.cozum)) : null;
        $('sayac').innerHTML = mod === 'blok'
            ? `Blok sayısı: <b>${n}</b>${hedef ? ` · 3 yıldız için en fazla <b>${hedef}</b>` : ''}`
            : (hedef ? `3 yıldız için en fazla <b>${hedef}</b> komut` : '');
        if (!$('onizle').hidden) onizleCiz();
    }

    // ---------- Yol yardımcıları ----------
    // Yol: "2.g.0" → program[2].govde[0]; liste yolu: "" (kök) ya da "2.g"
    function listeAl(yol) {
        if (yol === '') return program;
        let l = program;
        const p = yol.split('.');
        for (let i = 0; i < p.length; i += 2) l = l[+p[i]].govde;
        return l;
    }
    function konumAl(yol) {
        const parcalar = yol.split('.');
        const sira = +parcalar.pop();
        return { liste: listeAl(parcalar.join('.')), sira };
    }

    // ---------- Sürükle bırak ----------
    let surukle = null;
    const imlec = document.createElement('div');
    imlec.className = 'imlec';

    function basla(e) {
        const ust = e.target.closest('.ust');
        if (!ust || calisiyor) return;
        if (e.target.closest('input, select')) return;
        const blk = ust.parentElement;
        e.preventDefault();
        surukle = { blk, x0: e.clientX, y0: e.clientY, basladi: false, kutudan: !!blk.dataset.tip };
        const r = blk.getBoundingClientRect();
        surukle.dx = e.clientX - r.left; surukle.dy = e.clientY - r.top;
    }
    $('kutu').addEventListener('pointerdown', basla);
    $('alan').addEventListener('pointerdown', basla);

    window.addEventListener('pointermove', (e) => {
        if (!surukle) return;
        if (!surukle.basladi) {
            if (Math.hypot(e.clientX - surukle.x0, e.clientY - surukle.y0) < 5) return;
            surukle.basladi = true;
            if (surukle.kutudan) surukle.dugum = yeniDugum(surukle.blk.dataset.tip);
            else {
                const { liste, sira } = konumAl(surukle.blk.dataset.yol);
                surukle.dugum = liste.splice(sira, 1)[0];
                alanCiz();
            }
            const h = document.createElement('div');
            h.className = 'hayalet';
            h.innerHTML = blokHTML(surukle.dugum, 'hayalet', true);
            document.body.appendChild(h);
            surukle.hayalet = h;
            KL.ses('tik');
        }
        surukle.hayalet.style.left = (e.clientX - surukle.dx) + 'px';
        surukle.hayalet.style.top = (e.clientY - surukle.dy) + 'px';
        surukle.hedef = birakmaYeri(e.clientX, e.clientY);
        $('kutu').classList.toggle('silinecek', !surukle.kutudan && kutuUstunde(e.clientX, e.clientY));
    });

    window.addEventListener('pointerup', (e) => {
        if (!surukle) return;
        const s = surukle;
        surukle = null;
        imlec.remove();
        $('kutu').classList.remove('silinecek');
        if (!s.basladi) return;
        s.hayalet.remove();
        if (s.hedef) {
            listeAl(s.hedef.liste).splice(s.hedef.sira, 0, s.dugum);
        } else if (!s.kutudan && !kutuUstunde(e.clientX, e.clientY)) {
            // Alanın dışına bırakılan blok kaybolmasın: eski yerine dönmez, sona eklenir
            program.push(s.dugum);
        } else if (!s.kutudan) KL.ses('yanlis');
        programDegisti(true);
    });

    function kutuUstunde(x, y) {
        const r = $('kutu').getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    // İmlecin altındaki en derin listeyi ve sırayı bul
    function birakmaYeri(x, y) {
        const alanR = $('alan').getBoundingClientRect();
        if (x < alanR.left || x > alanR.right || y < alanR.top || y > alanR.bottom) { imlec.remove(); return null; }
        let enIyi = null;
        for (const l of $('alan').querySelectorAll('.liste')) {
            const r = l.getBoundingClientRect();
            if (x >= r.left - 12 && x <= r.right + 120 && y >= r.top - 10 && y <= r.bottom + 10) {
                const derinlik = l.dataset.liste === '' ? 0 : l.dataset.liste.split('.').length;
                if (!enIyi || derinlik > enIyi.derinlik) enIyi = { l, derinlik };
            }
        }
        // Fonksiyon tanımı yalnızca en dışa konabilir
        if (!enIyi || (surukle.dugum.t === 'tanim' && enIyi.derinlik > 0)) enIyi = { l: $('alan').querySelector('.kok'), derinlik: 0 };
        const l = enIyi.l;
        const cocuklar = [...l.children].filter(c => c.classList.contains('blk'));
        let sira = cocuklar.findIndex(c => { const r = c.querySelector('.ust').getBoundingClientRect(); return y < r.top + r.height / 2; });
        if (sira < 0) sira = cocuklar.length;
        // İmleci çiz
        const alan = $('alan'), ar = alan.getBoundingClientRect(), lr = l.getBoundingClientRect();
        let top;
        if (cocuklar.length === 0) top = lr.top + 2;
        else if (sira < cocuklar.length) top = cocuklar[sira].getBoundingClientRect().top - 3;
        else top = cocuklar[cocuklar.length - 1].getBoundingClientRect().bottom;
        imlec.style.left = (lr.left - ar.left + alan.scrollLeft) + 'px';
        imlec.style.top = (top - ar.top + alan.scrollTop) + 'px';
        if (!imlec.isConnected) alan.appendChild(imlec);
        return { liste: l.dataset.liste, sira };
    }

    // ---------- Girdi alanları ----------
    $('alan').addEventListener('input', (e) => {
        const g = e.target.closest('[data-alan]');
        const blk = e.target.closest('.blk');
        if (!g || !blk) return;
        const { liste, sira } = konumAl(blk.dataset.yol);
        const d = liste[sira];
        let v = g.value;
        if (g.dataset.alan === 'ad' && d.t === 'tanim') {
            const eski = d.ad;
            v = v.replace(/[^A-Za-z0-9_çğıöşüÇĞİÖŞÜ]/g, '');
            d.ad = v;
            // Bu fonksiyonu çağıran bloklar da yeni adı alsın
            (function gez(l) { for (const s of l) { if (s.t === 'cagir' && s.ad === eski) s.ad = v; if (s.govde) gez(s.govde); } })(program);
        } else d[g.dataset.alan] = v;
        if (g.tagName === 'SELECT' && g.dataset.alan === 'c') g.previousElementSibling.style.background = C.RENKLER[v].hex;
        g.classList.remove('hata');
        programDegisti(g.tagName === 'SELECT');
    });
    $('alan').addEventListener('change', (e) => { if (e.target.dataset.alan === 'ad') programDegisti(true); });

    function programDegisti(yenidenCiz) {
        kayit.prog[no] = program; KL.yaz('cizim', kayit);
        if (yenidenCiz) alanCiz(); else sayacGuncelle();
        if (yenidenCiz) kutuCiz();
        if (!calisiyor) sahneSifirla();
    }

    // Bloklardaki metin değerlerini sayıya çevir; hatalıysa işaretle
    function derle() {
        const hatalar = [];
        function cevir(d, yol, sayacIcinde) {
            const c = { ...d };
            for (const [tur, alan] of TANIM[d.t].parca) {
                if (tur !== 'n') continue;
                const ham = String(d[alan]).trim().replace(',', '.');
                if (/^-?\d+(\.\d+)?$/.test(ham)) c[alan] = parseFloat(ham);
                else if (ham === 'i' && sayacIcinde) c[alan] = 'i';
                else hatalar.push({ yol, alan, mesaj: ham === 'i' ? '"i" sadece sayaç bloğunun içinde kullanılabilir.' : `"${ham}" bir sayı değil.` });
            }
            if (d.t === 'cagir' && !d.ad) hatalar.push({ yol, mesaj: 'Çağırmak için önce bir fonksiyon tanımla.' });
            if (d.govde) c.govde = d.govde.map((x, j) => cevir(x, `${yol}.g.${j}`, sayacIcinde || d.t === 'say'));
            return c;
        }
        const p = program.map((d, i) => cevir(d, String(i), false));
        return { program: p, hatalar };
    }

    // ---------- Sahne ----------
    const OLCEK = 2;
    function izgara(ctx) {
        ctx.clearRect(0, 0, 800, 800);
        ctx.strokeStyle = 'rgba(148, 163, 184, .18)';
        ctx.lineWidth = 1;
        for (let i = 50; i < 400; i += 50) {
            ctx.beginPath(); ctx.moveTo(i * OLCEK, 0); ctx.lineTo(i * OLCEK, 800); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * OLCEK); ctx.lineTo(800, i * OLCEK); ctx.stroke();
        }
    }
    let hedefCizgiler = null;
    function hedefCiz() {
        const ctx = $('hedef').getContext('2d');
        izgara(ctx);
        hedefCizgiler = bolum.cozum ? C.calistir(bolum.cozum, bolum.bas).cizgiler : null;
        if (!hedefCizgiler) return;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const c of hedefCizgiler) {
            ctx.strokeStyle = bolum.renkOnemli ? C.RENKLER[c.renk].hex + '55' : 'rgba(100, 116, 139, .28)';
            ctx.lineWidth = 9 * OLCEK;
            ctx.beginPath(); ctx.moveTo(c.x1 * OLCEK, c.y1 * OLCEK); ctx.lineTo(c.x2 * OLCEK, c.y2 * OLCEK); ctx.stroke();
        }
    }
    function cizgiCiz(ctx, c, oran = 1) {
        ctx.strokeStyle = C.RENKLER[c.renk].hex;
        ctx.lineWidth = c.kalinlik * OLCEK;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(c.x1 * OLCEK, c.y1 * OLCEK);
        ctx.lineTo((c.x1 + (c.x2 - c.x1) * oran) * OLCEK, (c.y1 + (c.y2 - c.y1) * oran) * OLCEK); ctx.stroke();
    }
    // KodLab'ın kalemli robotu (baktığı yön yukarı: anten ve gözler önde)
    function robotCiz(x, y, h) {
        const ctx = $('karakter').getContext('2d');
        ctx.clearRect(0, 0, 800, 800);
        ctx.save();
        ctx.translate(x * OLCEK, y * OLCEK); ctx.rotate(h * Math.PI / 180); ctx.scale(1.45, 1.45);
        const yuvarlak = (x0, y0, w, hh, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, y0, w, hh, r); else ctx.rect(x0, y0, w, hh); };
        // Tekerlekler
        ctx.fillStyle = '#163f8f';
        yuvarlak(-22, -10, 7, 22, 3); ctx.fill(); yuvarlak(15, -10, 7, 22, 3); ctx.fill();
        // Gövde
        ctx.fillStyle = '#1d5fd6'; ctx.strokeStyle = '#0b3a8f'; ctx.lineWidth = 2;
        yuvarlak(-16, -16, 32, 32, 9); ctx.fill(); ctx.stroke();
        // Ekran ve gözler (öne bakar)
        ctx.fillStyle = '#e8f0ff'; yuvarlak(-11, -13, 22, 13, 4); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(-5, -7, 2.6, 0, Math.PI * 2); ctx.arc(5, -7, 2.6, 0, Math.PI * 2); ctx.fill();
        // Anten: yönü gösterir
        ctx.strokeStyle = '#163f8f'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, -25); ctx.stroke();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(0, -27, 4, 0, Math.PI * 2); ctx.fill();
        // Kalem ucu (çizimin yapıldığı nokta)
        ctx.fillStyle = '#ffd166'; ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
    }
    function sahneSifirla() {
        if (animasyon) cancelAnimationFrame(animasyon);
        animasyon = null;
        $('tuval').getContext('2d').clearRect(0, 0, 800, 800);
        robotCiz(bolum.bas.x, bolum.bas.y, bolum.bas.h);
    }

    function durum(m, tur = '') { $('durum').textContent = m; $('durum').className = 'durum ' + tur; }

    // ---------- Çalıştır ----------
    function programHazirla() {
        if (mod === 'python') {
            try { return { program: C.pythonAyristir($('py').value) }; }
            catch (e) { if (e instanceof C.CizimHatasi) return { hata: `Satır ${e.satir}: ${e.message}` }; throw e; }
        }
        const { program: p, hatalar } = derle();
        if (hatalar.length) {
            for (const h of hatalar) {
                const el = $('alan').querySelector(`.blk[data-yol="${h.yol}"] > .ust ${h.alan ? `[data-alan="${h.alan}"]` : 'select'}`);
                if (el) el.classList.add('hata');
            }
            return { hata: hatalar[0].mesaj };
        }
        if (!p.some(s => s.t !== 'tanim')) return { hata: program.length ? 'Fonksiyon tanımladın ama "çalıştırınca" altında hiç çağırmadın.' : 'Önce "çalıştırınca" bloğunun altına birkaç blok sürükle.' };
        return { program: p };
    }

    function calistir() {
        if (calisiyor) { durdur(); return; }
        const h = programHazirla();
        if (h.hata) { durum(h.hata, 'bad'); KL.ses('yanlis'); return; }
        let sonuc;
        try { sonuc = C.calistir(h.program, bolum.bas); }
        catch (e) {
            if (!(e instanceof C.CizimHatasi)) throw e;
            durum((e.satir ? `Satır ${e.satir}: ` : '') + e.message, 'bad'); KL.ses('yanlis'); return;
        }
        sahneSifirla();
        durum('');
        calisiyor = true;
        $('calistir').innerHTML = '<i class="fas fa-stop"></i> Durdur';
        const ctx = $('tuval').getContext('2d');
        const H = sonuc.hareketler;
        const HIZ = [1.5, 4, 9, 22, 1e9][$('hiz').value - 1];
        let i = 0, kat = 0;
        let x = bolum.bas.x, y = bolum.bas.y, yon = bolum.bas.h;
        const kare = () => {
            let butce = HIZ;
            while (i < H.length && butce > 0) {
                const m = H[i];
                if (m.donus) { yon = m.h; i++; butce -= 3; continue; }
                const L = Math.hypot(m.x2 - m.x1, m.y2 - m.y1) || 1;
                const al = Math.min(L - kat, butce);
                kat += al; butce -= al;
                const oran = kat / L;
                yon = m.h;
                x = m.x1 + (m.x2 - m.x1) * oran; y = m.y1 + (m.y2 - m.y1) * oran;
                if (kat >= L - 1e-9) { if (m.kalem) cizgiCiz(ctx, m); i++; kat = 0; }
                else if (m.kalem && butce <= 0) { ctx.save(); cizgiCiz(ctx, m, oran); ctx.restore(); }
            }
            // Tamamlanmamış çizgiyi her karede baştan çizmek yerine kısmi çizim üst üste biner; sorun değil
            robotCiz(x, y, yon);
            if (i < H.length) animasyon = requestAnimationFrame(kare);
            else bitti(sonuc, h.program);
        };
        animasyon = requestAnimationFrame(kare);
    }

    function durdur() {
        if (animasyon) cancelAnimationFrame(animasyon);
        animasyon = null;
        calisiyor = false;
        $('calistir').innerHTML = '<i class="fas fa-play"></i> Çalıştır';
    }

    function bitti(sonuc, prog) {
        durdur();
        // Animasyondaki kısmi çizimleri temizleyip son hali kesin olarak çiz
        const ctx = $('tuval').getContext('2d');
        ctx.clearRect(0, 0, 800, 800);
        for (const c of sonuc.cizgiler) cizgiCiz(ctx, c);
        robotCiz(sonuc.son.x, sonuc.son.y, sonuc.son.h);
        if (!hedefCizgiler) { durum('Harika bir çizim! Resmini indirmek için tuvale sağ tıklayabilirsin.', 'ok'); return; }
        const k = C.karsilastir(hedefCizgiler, sonuc.cizgiler, !!bolum.renkOnemli);
        if (!k.tamam) {
            KL.ses('yanlis');
            let m = 'Neredeyse! Çizimin hedefle tam örtüşmüyor. ';
            if (!sonuc.cizgiler.length) m = 'Robot hiç çizgi çizmedi. Kalem kalkık mı kaldı? ';
            else if (k.eksik > 0.02 && k.fazla < 0.02) m += 'Bazı çizgiler eksik.';
            else if (k.fazla > 0.02 && k.eksik < 0.02) m += 'Fazladan çizgi var ya da çizgiler fazla uzun.';
            else if (bolum.renkOnemli && C.karsilastir(hedefCizgiler, sonuc.cizgiler, false).tamam) m = 'Şekil doğru ama renkler farklı!';
            else m += 'Uzunluklara ve dönüş açılarına bak.';
            durum(m, 'bad');
            return;
        }
        const n = C.blokSayisi(prog);
        const hedef = bolum.enFazla || C.blokSayisi(bolum.cozum);
        const y = n <= hedef ? 3 : n <= hedef + 3 ? 2 : 1;
        kayit.yildiz[no] = Math.max(kayit.yildiz[no] || 0, y);
        KL.yaz('cizim', kayit);
        bolumleriCiz();
        durum('Çizim hedefle aynı!', 'ok');
        $('kBaslik').textContent = y === 3 ? 'Mükemmel!' : 'Başardın!';
        $('kYildiz').innerHTML = KL.yildizHTML(y);
        $('kMetin').textContent = y === 3 ? `${n} ${mod === 'blok' ? 'blokla' : 'komutla'} çizdin. Tam bir sanatçı gibi!`
            : `${n} ${mod === 'blok' ? 'blok' : 'komut'} kullandın. ${hedef} ya da daha azıyla 3 yıldız alabilirsin; tekrar eden kısımları döngüye al.`;
        $('kSonraki').hidden = no === C.BOLUMLER.length - 1;
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        setTimeout(() => $('kazandi').showModal(), 400);
    }

    // ---------- Mod: Bloklar / Python ----------
    function modUygula() {
        document.querySelectorAll('.mod button').forEach(b => b.classList.toggle('sel', b.dataset.m === mod));
        const blok = mod === 'blok';
        $('sekmeler').hidden = !blok;
        $('py').hidden = blok;
        if (blok) { sekme('bloklar'); kutuCiz(); alanCiz(); }
        else {
            $('blokEditor').hidden = true; $('onizle').hidden = true;
            // Python moduna ilk geçişte bloklardaki programı Python'a çevir
            if (!$('py').value.trim()) {
                const d = derle();
                $('py').value = !d.hatalar.length && program.length ? C.pythonYaz(d.program) : 'from turtle import *\n\n';
            }
            sayacGuncelle();
        }
    }
    document.querySelector('.mod').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || calisiyor) return;
        mod = b.dataset.m; kayit.mod = mod; KL.yaz('cizim', kayit);
        modUygula(); sahneSifirla(); durum('');
    });
    $('py').addEventListener('input', () => { kayit.py[no] = $('py').value; KL.yaz('cizim', kayit); });
    $('py').addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); $('py').setRangeText('    ', $('py').selectionStart, $('py').selectionEnd, 'end'); }
        else if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            const ta = $('py'), once = ta.value.slice(0, ta.selectionStart), satir = once.slice(once.lastIndexOf('\n') + 1);
            let g = satir.match(/^ */)[0];
            if (/:\s*$/.test(satir)) g += '    ';
            ta.setRangeText('\n' + g, ta.selectionStart, ta.selectionEnd, 'end');
            ta.dispatchEvent(new Event('input'));
        } else if (e.key === 'Enter' && e.ctrlKey) calistir();
    });

    function sekme(s) {
        document.querySelectorAll('#sekmeler button').forEach(b => b.classList.toggle('sel', b.dataset.s === s));
        $('blokEditor').hidden = s !== 'bloklar';
        $('onizle').hidden = s !== 'onizle';
        if (s === 'onizle') onizleCiz();
    }
    $('sekmeler').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) sekme(b.dataset.s); });
    function onizleCiz() {
        const d = derle();
        if (d.hatalar.length) { $('onizle').textContent = '# Bloklarda hata var: ' + d.hatalar[0].mesaj; return; }
        const kod = C.pythonYaz(d.program);
        $('onizle').innerHTML = kod.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/\b(from|import|for|in|def|pass)\b/g, '<span class="k">$1</span>')
            .replace(/\b(forward|backward|right|left|penup|pendown|color|pensize|range)\b/g, '<span class="f">$1</span>')
            .replace(/("[a-z]+")/g, '<span class="s">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
    }

    // ---------- Olaylar ----------
    $('calistir').addEventListener('click', calistir);
    $('sifirla').addEventListener('click', () => { durdur(); sahneSifirla(); durum(''); });
    $('kKal').addEventListener('click', () => $('kazandi').close());
    $('kSonraki').addEventListener('click', () => { $('kazandi').close(); bolumAc(no + 1); });

    // İlk açılış: kaldığı bölüm
    const ilk = Object.keys(kayit.yildiz).length ? Math.min(Math.max(...Object.keys(kayit.yildiz).map(Number)) + 1, C.BOLUMLER.length - 1) : 0;
    bolumAc(ilk);
    if (ogretmen) KL.bildir('Öğretmen modu: tüm bölümler açık');
})();
