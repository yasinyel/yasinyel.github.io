// KodLab — Algoritma Sensin arayüzü
(function () {
    'use strict';
    const { ALGORITMALAR } = window.AlgoMotor;
    const $ = (id) => document.getElementById(id);
    const kayit = KL.oku('algoritma', {});
    let algo = null, oyun = null, adim = 0, hata = 0, kilit = false, oncekiDegisken = {};

    const sinifYaz = ([a, b]) => `${a}. – ${b}. sınıf`;
    function goster(id) { ['liste', 'oyun'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

    function listeCiz() {
        $('algoGrid').innerHTML = ALGORITMALAR.map(a => `
            <button class="card algo" data-id="${a.id}">
                <span class="ik" style="background:${a.renk}"><i class="fas ${a.ikon}"></i></span>
                <span class="grade">${sinifYaz(a.sinif)}</span>
                <h3>${a.ad}</h3><p>${a.ozet}</p>${KL.yildizHTML(kayit[a.id] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('algoGrid').addEventListener('click', (e) => {
        const b = e.target.closest('.algo');
        if (b) basla(ALGORITMALAR.find(a => a.id === b.dataset.id));
    });

    // Basit Python renklendirme
    function renklendir(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\b(for|in|if|elif|else|while|return|and)\b/g, '<span class="k">$1</span>')
            .replace(/\b(range|len|print)\b/g, '<span class="f">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
    }

    function basla(a) {
        algo = a;
        oyun = a.uret();
        adim = 0; hata = 0; kilit = false; oncekiDegisken = {};
        $('baslik').textContent = a.ad;
        $('kod').innerHTML = a.kod.map((s, i) => `<span class="ln" data-n="${i + 1}">${renklendir(s)}</span>`).join('');
        $('ozet').hidden = true;
        goster('oyun');
        ciz();
    }

    function durum() { return adim < oyun.adimlar.length ? oyun.adimlar[adim].durum : oyun.son; }

    function ciz() {
        const d = durum();
        const s = oyun.adimlar[adim];
        $('adimNo').textContent = `${Math.min(adim + 1, oyun.adimlar.length)}/${oyun.adimlar.length}`;
        $('hataNo').textContent = hata;
        $('hedef').innerHTML = d.baslik ? d.baslik.replace(/(\d+)$/, '<span>$1</span>') : '';
        document.querySelectorAll('#kod .ln').forEach((l, i) => l.classList.toggle('cur', i + 1 === d.satir));

        // Değişkenler (değişeni vurgula)
        const dg = d.degisken || {};
        $('vars').innerHTML = Object.keys(dg).length
            ? Object.entries(dg).map(([k, v]) => `<tr class="${oncekiDegisken[k] !== undefined && oncekiDegisken[k] !== v ? 'chg' : ''}"><td>${k}</td><td>${v}</td></tr>`).join('')
            : '<tr><td colspan="2" style="color:var(--muted)">—</td></tr>';
        oncekiDegisken = { ...dg };

        // Eklemeli sıralamada elde tutulan kart
        $('anahtar').innerHTML = d.anahtar != null ? `<div class="crd anahtar"><span class="tag">anahtar</span>${d.anahtar}</div>` : '';

        const tiklanabilir = s && s.tur === 'kart' ? s.tiklanabilir : null;
        $('kartlar').style.setProperty('--n', d.dizi.length);
        $('kartlar').innerHTML = d.dizi.map((v, i) => {
            const c = ['crd'];
            if (v === null) c.push('bos');
            else if (!d.acik.includes(i)) c.push('kapali');
            if (d.vurgu.includes(i)) c.push('vurgu');
            if (d.sirali.includes(i)) c.push('sirali');
            if (d.soluk.includes(i)) c.push('soluk');
            if (tiklanabilir && i >= tiklanabilir[0] && i <= tiklanabilir[1]) c.push('tikla');
            const tag = d.isaret && d.isaret[i] ? `<span class="tag">${d.isaret[i]}</span>` : '';
            return `<div class="${c.join(' ')}" data-i="${i}">${tag}${v === null ? '' : v}<span class="ix">${i}</span></div>`;
        }).join('');

        if (!s) { bitir(); return; }
        $('soru').textContent = s.soru;
        $('secenekler').innerHTML = s.tur === 'kart' ? '' : s.secenekler.map((o, i) =>
            `<button class="btn" data-id="${o.id}">${o.ad}<kbd>${i + 1}</kbd></button>`).join('');
    }

    function cevapla(cevap, el) {
        if (kilit || !oyun.adimlar[adim]) return;
        const s = oyun.adimlar[adim];
        if (cevap !== s.beklenen) {
            hata++;
            KL.ses('yanlis');
            $('hataNo').textContent = hata;
            $('fb').className = 'fb bad';
            $('fb').textContent = 'Olmadı. ' + (hata >= 2 && s.aciklama ? 'İpucu: ' + s.aciklama : 'Algoritmanın bu satırda ne yaptığına tekrar bak.');
            if (el) { el.classList.remove('hata'); el.offsetWidth; el.classList.add('hata'); }
            return;
        }
        KL.ses('dogru');
        $('fb').className = 'fb ok';
        $('fb').textContent = s.aciklama || 'Doğru!';
        kilit = true;
        const ilerle = () => { adim++; kilit = false; ciz(); };
        if (s.takas) takasAnimasyonu(s.takas, ilerle);
        else setTimeout(ilerle, 380);
    }

    // İki kartın yer değiştirmesini göster
    function takasAnimasyonu([a, b], bitince) {
        const ka = $('kartlar').children[a], kb = $('kartlar').children[b];
        const dx = kb.getBoundingClientRect().left - ka.getBoundingClientRect().left;
        ka.style.transform = `translate(${dx}px, -14px)`;
        kb.style.transform = `translate(${-dx}px, 14px)`;
        setTimeout(bitince, 420);
    }

    function bitir() {
        $('soru').textContent = '';
        $('secenekler').innerHTML = '';
        $('fb').textContent = '';
        const y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
        if (y > (kayit[algo.id] || 0)) { kayit[algo.id] = y; KL.yaz('algoritma', kayit); }
        $('ozBaslik').textContent = y === 3 ? 'Kusursuz işlemci!' : 'Algoritma tamamlandı!';
        $('ozYildiz').innerHTML = KL.yildizHTML(y);
        $('ozMetin').textContent = oyun.ozet + (hata ? ` (${hata} hata)` : '');
        $('ozet').hidden = false;
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
    }

    $('secenekler').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) cevapla(b.dataset.id, b); });
    $('kartlar').addEventListener('click', (e) => {
        const c = e.target.closest('.crd.tikla');
        if (c) cevapla(+c.dataset.i, c);
    });
    document.addEventListener('keydown', (e) => {
        if ($('oyun').hidden || !/^[1-3]$/.test(e.key)) return;
        const b = $('secenekler').children[+e.key - 1];
        if (b) cevapla(b.dataset.id, b);
    });
    $('geri').addEventListener('click', listeCiz);
    $('digerleri').addEventListener('click', listeCiz);
    $('tekrar').addEventListener('click', () => basla(algo));

    window.__algoOyun = () => ({ oyun, adim });
    const q = new URLSearchParams(location.search).get('a');
    const ilk = ALGORITMALAR.find(a => a.id === q);
    if (ilk) basla(ilk); else listeCiz();
})();
