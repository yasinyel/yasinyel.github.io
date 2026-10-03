// Kodlayalım — KodKart Simülatörü arayüzü
(function () {
    'use strict';
    const D = window.Devre;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('devre', { yildiz: {}, proje: {}, deneme: {} });
    let gorevNo = 0, gorev = null, kart = null, dongu = null;
    const tanim = D.tanim();

    // ---------- LED ekran ----------
    $('ledler').innerHTML = Array.from({ length: 25 }, () => '<span class="led"></span>').join('');
    const ledler = [...document.querySelectorAll('.led')];
    function ekranCiz(e) { ledler.forEach((l, i) => l.classList.toggle('yanik', !!(e && e[i]))); }

    // ---------- Editör ----------
    const ed = BlokEditor({
        kutu: $('kutu'), alan: $('alan'), tanim,
        kategoriler: ['Olaylar', 'Ekran', 'Değişkenler', 'Kontrol', 'Ses'],
        bosMetin: 'Sarı bir olay bloğunu buraya sürükle, altına yapılacakları ekle',
        kilitli: () => !!kart,
        uyari: (m) => KL.bildir(m),
        degisti: (m) => { kayit.proje[gorev.id] = m; KL.yaz('devre', kayit); }
    });

    // ---------- Görevler ----------
    const acikMi = (i) => ogretmen || i === 0 || D.GOREVLER[i].serbest || (kayit.yildiz[D.GOREVLER[i - 1].id] || 0) > 0;
    function gorevBarCiz() {
        $('gorevBar').innerHTML = D.GOREVLER.map((g, i) => {
            const y = kayit.yildiz[g.id] || 0;
            return `<button class="${i === gorevNo ? 'sel' : ''} ${y ? 'done' : ''} ${acikMi(i) ? '' : 'kilit'}" data-i="${i}">${g.serbest ? '<i class="fas fa-wand-magic-sparkles"></i>' : i + 1 + '.'} ${g.ad}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('');
    }
    $('gorevBar').onclick = (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (!acikMi(+b.dataset.i)) { KL.bildir('Önce önceki görevi bitir!'); return; }
        gorevAc(+b.dataset.i);
    };
    function gorevAc(i) {
        durdur();
        gorevNo = i; gorev = D.GOREVLER[i];
        ed.izinliAyarla(gorev.bloklar || Object.keys(tanim));
        ed.yukle(kayit.proje[gorev.id] || []);
        gorevKartCiz();
        gorevBarCiz();
        ekranCiz(null);
        history.replaceState(null, '', location.search + '#' + gorev.id);
    }
    function gorevKartCiz(sonuc) {
        const g = gorev;
        $('gorevKart').innerHTML = `<h2>${g.serbest ? '' : (gorevNo + 1) + '. '}${g.ad}</h2><p>${g.anlatim}</p>` + (g.serbest ? '' :
            `<ul class="denetim">${g.denetimler.map((d, i) => `<li class="${sonuc ? (sonuc[i].gecti ? 'ok' : 'no') : ''}"><i class="fas ${sonuc ? (sonuc[i].gecti ? 'fa-circle-check' : 'fa-circle-xmark') : 'fa-circle'}"></i>${d.ad}</li>`).join('')}</ul>
            <button class="btn btn-primary btn-sm" id="denetle"><i class="fas fa-clipboard-check"></i> Programımı kontrol et</button>
            <small style="color:var(--muted);display:block;margin-top:6px">Kontrol, kartı arka planda senin yerine deneyerek yapılır.</small>`);
        if (!g.serbest) $('denetle').onclick = denetle;
    }
    function denetle() {
        const { model, hatalar } = ed.derle();
        if (hatalar.length) { KL.bildir(hatalar[0].mesaj); return; }
        const s = D.denetle(gorev, { betikler: model });
        gorevKartCiz(s);
        if (s.every(x => x.gecti)) {
            const d = kayit.deneme[gorev.id] || 0, y = d <= 1 ? 3 : d <= 3 ? 2 : 1;
            kayit.yildiz[gorev.id] = Math.max(kayit.yildiz[gorev.id] || 0, y);
            KL.yaz('devre', kayit); gorevBarCiz();
            $('kBaslik').textContent = y === 3 ? 'Harika bir mühendis!' : 'Görev tamam!';
            $('kYildiz').innerHTML = KL.yildizHTML(y);
            $('kMetin').textContent = y === 3 ? 'Programın bütün denemeleri geçti.' : `Programın ${d + 1}. kontrolde geçti. Daha az denemeyle 3 yıldız alabilirsin.`;
            $('kSonraki').hidden = gorevNo === D.GOREVLER.length - 1;
            if (y === 3) KL.konfeti(); else KL.ses('kazan');
            $('kazandi').showModal();
        } else {
            kayit.deneme[gorev.id] = (kayit.deneme[gorev.id] || 0) + 1; KL.yaz('devre', kayit);
            KL.ses('yanlis');
            KL.bildir(`${s.filter(x => !x.gecti).length} kontrol geçmedi. Kırmızı olanlara bak, kartı çalıştırıp kendin dene.`);
        }
    }
    $('kKal').onclick = () => $('kazandi').close();
    $('kSonraki').onclick = () => { $('kazandi').close(); gorevAc(gorevNo + 1); };

    // ---------- Çalıştırma ----------
    let ses = null;
    function nota(f, ms) {
        if (!KL.sesAcik()) return;
        try {
            ses = ses || new (window.AudioContext || window.webkitAudioContext)();
            const o = ses.createOscillator(), g = ses.createGain(), t = ses.currentTime;
            o.type = 'square'; o.frequency.value = f;
            g.gain.setValueAtTime(0.06, t); g.gain.setValueAtTime(0.06, t + ms / 1000 * 0.9); g.gain.linearRampToValueAtTime(0, t + ms / 1000);
            o.connect(g); g.connect(ses.destination); o.start(t); o.stop(t + ms / 1000);
        } catch (e) { /* ses desteklenmiyor */ }
    }
    function baslat() {
        durdur();
        const { model, hatalar } = ed.derle();
        if (hatalar.length) { KL.bildir(hatalar[0].mesaj); return; }
        kart = new D.Kart({ betikler: model });
        kart.sicaklik = +$('sicaklik').value; kart.isik = +$('isik').value;
        kart.baslat();
        $('baslat').innerHTML = '<i class="fas fa-rotate-right"></i> Yeniden'; $('durdur').disabled = false;
        let son = performance.now(), sesNo = 0, kare = 0;
        const adim = (t) => {
            if (!kart) return;
            const ms = Math.min(200, t - son);
            if (ms >= D.TIK) {
                kart.adim(Math.floor(ms / D.TIK) * D.TIK); son = t - (ms % D.TIK);
                for (; sesNo < kart.sesler.length; sesNo++) nota(kart.sesler[sesNo].f, kart.sesler[sesNo].ms);
                ekranCiz(kart.ekran);
                if (++kare % 5 === 0) ed.vurgula([...kart.calisanlar]);
            }
            dongu = requestAnimationFrame(adim);
        };
        dongu = requestAnimationFrame(adim);
    }
    function durdur() {
        if (dongu) cancelAnimationFrame(dongu);
        dongu = null; kart = null;
        $('baslat').innerHTML = '<i class="fas fa-play"></i> Çalıştır'; $('durdur').disabled = true;
        ed.vurgula([]); ekranCiz(null);
    }
    $('baslat').onclick = baslat;
    $('durdur').onclick = durdur;

    // Düğmeler: fare/dokunma ve klavye (A, B)
    const bas = (d) => {
        if (!kart) { KL.bildir('Önce ▶ Çalıştır\'a bas.'); return; }
        if (kart.basili.has(d)) return;
        kart.basili.add(d); $('d' + d).classList.add('basili');
        kart.dugme(d);
        if (kart.basili.has('A') && kart.basili.has('B')) kart.dugme('AB');
    };
    const birak = (d) => { $('d' + d).classList.remove('basili'); if (kart) kart.basili.delete(d); };
    ['A', 'B'].forEach(d => {
        $('d' + d).addEventListener('pointerdown', (e) => { e.preventDefault(); $('d' + d).setPointerCapture(e.pointerId); bas(d); });
        ['pointerup', 'pointercancel'].forEach(o => $('d' + d).addEventListener(o, () => birak(d)));
    });
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea, select') || e.repeat) return;
        const d = e.key.toUpperCase() === 'A' ? 'A' : e.key.toUpperCase() === 'B' ? 'B' : null;
        if (d && kart) { e.preventDefault(); bas(d); }
        if (e.key.toUpperCase() === 'S' && kart) $('salla').click();
    });
    document.addEventListener('keyup', (e) => { const k = e.key.toUpperCase(); if (k === 'A' || k === 'B') birak(k); });
    $('salla').onclick = () => {
        if (!kart) { KL.bildir('Önce ▶ Çalıştır\'a bas.'); return; }
        $('pcb').classList.remove('sallaniyor'); void $('pcb').offsetWidth; $('pcb').classList.add('sallaniyor');
        kart.salla();
    };
    $('sicaklik').oninput = () => { $('sicaklikD').textContent = $('sicaklik').value + ' °C'; if (kart) kart.sicaklik = +$('sicaklik').value; };
    $('isik').oninput = () => { $('isikD').textContent = $('isik').value; if (kart) kart.isik = +$('isik').value; };

    const h = location.hash.slice(1);
    const hi = D.GOREVLER.findIndex(g => g.id === h);
    const ilk = Math.max(0, D.GOREVLER.findIndex(g => !kayit.yildiz[g.id]));
    gorevAc(hi >= 0 && acikMi(hi) ? hi : ogretmen ? 0 : ilk);
    window.__devre = { kart: () => kart };
})();
