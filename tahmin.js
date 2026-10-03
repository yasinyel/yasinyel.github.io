// KodLab — Ne Yazar? arayüzü
(function () {
    'use strict';
    const { SEVIYELER, kontrol } = window.TahminSorular;
    const $ = (id) => document.getElementById(id);
    const SORU_SAYISI = 5;
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('tahmin', { yildiz: {} });

    let seviye = 0, sira = 0, sonuclar = [], soru = null, cevaplandi = false, sonUretici = -1;

    function goster(id) {
        ['liste', 'soru', 'sonuc'].forEach(s => { $(s).hidden = s !== id; });
        window.scrollTo(0, 0);
    }

    function acikMi(i) { return ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0; }

    function listeCiz() {
        $('lvlGrid').innerHTML = SEVIYELER.map((s, i) => `
            <button class="card lvl-card" data-i="${i}" ${acikMi(i) ? '' : 'disabled'}>
                <span class="no">Seviye ${i + 1} ${acikMi(i) ? '' : '<i class="fas fa-lock"></i>'}</span>
                <h3>${s.baslik}</h3>
                <p>${s.ozet}</p>
                ${KL.yildizHTML(kayit.yildiz[i] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('lvlGrid').addEventListener('click', (e) => {
        const b = e.target.closest('.lvl-card');
        if (b && !b.disabled) basla(+b.dataset.i);
    });

    function basla(i) {
        seviye = i; sira = 0; sonuclar = []; sonUretici = -1;
        $('qTitle').textContent = `Seviye ${i + 1}: ${SEVIYELER[i].baslik}`;
        goster('soru');
        yeniSoru();
    }

    // Aynı soru tipi art arda gelmesin; ilk sorular sırayla tüm tipleri gezsin
    function uretec() {
        const u = SEVIYELER[seviye].uretici;
        let i;
        if (sira < u.length && Math.random() < 0.7) i = (sonUretici + 1) % u.length;
        else do { i = Math.floor(Math.random() * u.length); } while (u.length > 1 && i === sonUretici);
        sonUretici = i;
        return u[i]();
    }

    function yeniSoru() {
        soru = uretec();
        cevaplandi = false;
        $('code').innerHTML = renklendir(soru.kod);
        const cok = soru.cevap.includes('\n');
        $('cokSatir').textContent = cok ? '— birden fazla satır yazılacak, her satırı Enter ile ayır' : '';
        const c = $('cevap');
        c.value = ''; c.className = ''; c.readOnly = false;
        c.rows = cok ? Math.min(soru.cevap.split('\n').length, 6) : 1;
        $('fb').className = 'fb';
        $('kontrol').hidden = false; $('devam').hidden = true;
        noktalar();
        c.focus();
    }

    function noktalar() {
        let h = '';
        for (let i = 0; i < SORU_SAYISI; i++) {
            const s = sonuclar[i];
            h += `<span class="${s === true ? 'ok' : s === false ? 'bad' : i === sira ? 'cur' : ''}"></span>`;
        }
        $('dots').innerHTML = h;
    }

    function kontrolEt() {
        if (cevaplandi) return;
        const c = $('cevap');
        if (!c.value.trim()) { KL.bildir('Önce bir cevap yaz.'); c.focus(); return; }
        const sonuc = kontrol(c.value, soru.cevap);
        if (!sonuc.dogru && sonuc.ipucu && !c.dataset.ipucu) {
            // Küçük yazım hataları için bir kez uyar, ceza verme
            c.dataset.ipucu = '1';
            KL.bildir(sonuc.ipucu, 3200);
            return;
        }
        delete c.dataset.ipucu;
        cevaplandi = true;
        sonuclar[sira] = sonuc.dogru;
        c.readOnly = true;
        c.className = sonuc.dogru ? 'ok' : 'bad';
        const fb = $('fb');
        fb.className = 'fb show ' + (sonuc.dogru ? 'ok' : 'bad');
        fb.innerHTML = sonuc.dogru
            ? `<h4><i class="fas fa-check"></i> Doğru!</h4><p>${kacis(soru.aciklama)}</p>`
            : `<h4><i class="fas fa-xmark"></i> Olmadı</h4>Doğru çıktı:<pre>${kacis(soru.cevap)}</pre><p>${kacis(soru.aciklama)}</p>`;
        $('kontrol').hidden = true; $('devam').hidden = false;
        $('devam').focus();
        noktalar();
    }

    function devam() {
        sira++;
        if (sira < SORU_SAYISI) yeniSoru();
        else bitir();
    }

    function bitir() {
        const yanlis = sonuclar.filter(x => !x).length;
        const y = yanlis === 0 ? 3 : yanlis === 1 ? 2 : yanlis <= 2 ? 1 : 0;
        if (y > (kayit.yildiz[seviye] || 0)) { kayit.yildiz[seviye] = y; KL.yaz('tahmin', kayit); }
        const dogru = SORU_SAYISI - yanlis;
        $('rTitle').textContent = y === 3 ? 'Kusursuz!' : y > 0 ? 'Seviye tamam!' : 'Biraz daha pratik';
        $('rStars').innerHTML = KL.yildizHTML(y);
        $('rText').textContent = y > 0
            ? `${SORU_SAYISI} sorudan ${dogru} tanesini doğru bildin.` + (y < 3 ? ' Hepsini bilirsen 3 yıldız alırsın.' : '')
            : `${SORU_SAYISI} sorudan ${dogru} tanesini doğru bildin. Sonraki seviyenin açılması için en az 3 doğru gerekiyor.`;
        $('rNext').hidden = y === 0 || seviye === SEVIYELER.length - 1;
        if (y === 3) KL.konfeti();
        goster('sonuc');
    }

    // Basit Python renklendirme
    function kacis(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function renklendir(kod) {
        const KEY = /^(def|return|for|in|if|elif|else|while|and|or|not|True|False)$/;
        const FN = /^(print|len|range|str|int|append)$/;
        return kod.split('\n').map(satir => {
            let h = '';
            const re = /("[^"]*"|'[^']*'|#.*$|\b\d+\b|[A-Za-zÇĞİÖŞÜçğıöşü_][\wÇĞİÖŞÜçğıöşü]*|\s+|.)/g;
            let m;
            while ((m = re.exec(satir))) {
                const t = m[0], e = kacis(t);
                if (t[0] === '"' || t[0] === "'") h += `<span class="s">${e}</span>`;
                else if (t[0] === '#') h += `<span class="c">${e}</span>`;
                else if (/^\d/.test(t)) h += `<span class="n">${e}</span>`;
                else if (KEY.test(t)) h += `<span class="k">${e}</span>`;
                else if (FN.test(t)) h += `<span class="f">${e}</span>`;
                else h += e;
            }
            return `<span class="ln">${h || ' '}</span>`;
        }).join('');
    }

    $('kontrol').addEventListener('click', kontrolEt);
    $('devam').addEventListener('click', devam);
    $('cevap').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); cevaplandi ? devam() : kontrolEt(); }
        else if (e.key === 'Enter' && !soru.cevap.includes('\n')) { e.preventDefault(); cevaplandi ? devam() : kontrolEt(); }
    });
    $('geri').addEventListener('click', listeCiz);
    $('rList').addEventListener('click', listeCiz);
    $('rAgain').addEventListener('click', () => basla(seviye));
    $('rNext').addEventListener('click', () => basla(seviye + 1));

    listeCiz();
})();
