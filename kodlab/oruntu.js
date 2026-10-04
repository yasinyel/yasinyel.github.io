// Kodlayalım — Örüntü Bul
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const TUR = 6;
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('oruntu', { yildiz: {} });

    const SETLER = [
        ['🍎', '🍌', '🍇', '🍓', '🍊', '🍐'],
        ['🐶', '🐱', '🐰', '🐸', '🐻', '🐥'],
        ['🚗', '🚌', '🚲', '✈️', '🚀', '⛵'],
        ['⭐', '🌙', '☀️', '☁️', '⚡', '❄️'],
        ['⚽', '🏀', '🎈', '🎁', '🔔', '🎵']
    ];

    // Renk + şekil seviyesi için SVG şekiller
    const RENK = ['#e5484d', '#1d5fd6', '#16a36a', '#f5b400'];
    const SEKIL = {
        daire: (c) => `<circle cx="20" cy="20" r="16" fill="${c}"/>`,
        kare: (c) => `<rect x="5" y="5" width="30" height="30" rx="4" fill="${c}"/>`,
        ucgen: (c) => `<path d="M20 4 L37 35 L3 35 Z" fill="${c}"/>`
    };
    const sekilSVG = (s) => `<svg class="sh" viewBox="0 0 40 40">${SEKIL[s.sekil](RENK[s.renk])}</svg>`;

    // kalip: harf dizisi, A,B,C öğelere karşılık gelir
    const SEVIYELER = [
        { ad: 'İkili örüntü', kalip: ['AB'] },
        { ad: 'Üçlü örüntü', kalip: ['ABC'] },
        { ad: 'İki tane, bir tane', kalip: ['AAB'] },
        { ad: 'Bir tane, iki tane', kalip: ['ABB'] },
        { ad: 'İkişer ikişer', kalip: ['AABB'] },
        { ad: 'Eksik parça', kalip: ['AB', 'ABC', 'AAB', 'ABB'], ortada: true },
        { ad: 'Renk ve şekil', sekil: true },
        { ad: 'Büyüyen örüntü', buyuyen: true }
    ];

    // İpucu Asistanı: [düşündüren soru, ipucu]; üçüncü basamak yanlış bir seçeneği eler
    const IPUCLARI = [
        ['Hangi iki şey sırayla tekrar ediyor?', 'Parmağınla göster ve sesli söyle: "elma, muz, elma, muz…" Sıradaki ne?'],
        ['Kaç farklı şey var? Hangisi hep en sonda geliyor?', 'Üç şey sırayla tekrar ediyor. Üçerli gruplara ayır, son grubu tamamla.'],
        ['Aynı şeyden yan yana kaç tane var?', 'Örüntü: iki tane aynı, bir tane farklı. İkişerli ve tekli grupları say.'],
        ['Bu kez hangisi iki kez geliyor?', 'Örüntü: bir tane, sonra aynı şeyden iki tane. Son grubu tamamla.'],
        ['Her şeyden yan yana kaç tane var?', 'İkişer ikişer: iki tane biri, iki tane diğeri. Son ikiliyi tamamla.'],
        ['Soru işaretinin solunda ve sağında ne var?', 'Önce tekrar eden parçayı bul. Sonra soru işaretinden önceki ve sonraki şeylere bakarak boşluğu doldur.'],
        ['Şekil ve renk aynı kurala mı uyuyor? Önce yalnızca şekillere bak.', 'Şekil ve renk ayrı ayrı tekrar ediyor. Önce sıradaki şekli bul, sonra sıradaki rengi. İkisini birleştir.'],
        ['Her grupta mavi kaç tane? 1, 2, 3, …', 'Her seferinde bir tane daha ekleniyor. Son gruptaki ikinci şeyden kaç tane var, bir sonrakinde kaç olmalı?']
    ];
    let ipucuKont = null;
    let sv = 0, tur = 0, hata = 0, soru = null, kilit = false;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    const acikMi = (i) => ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0;

    function ornekOnizleme(i) {
        const s = SEVIYELER[i];
        if (s.sekil) return [{ sekil: 'daire', renk: 0 }, { sekil: 'kare', renk: 1 }, { sekil: 'daire', renk: 2 }, { sekil: 'kare', renk: 0 }].map(sekilSVG).join('');
        if (s.buyuyen) return '🔴🔵 🔴🔵🔵 🔴…';
        const k = s.kalip[0], e = ['🔴', '🔵', '🟢'];
        return (k + k).split('').map(h => e[h.charCodeAt(0) - 65]).join('') + (s.ortada ? '' : '…');
    }

    function listeCiz() {
        $('lvlGrid').innerHTML = SEVIYELER.map((s, i) => `
            <button class="card lvl-card" data-i="${i}" ${acikMi(i) ? '' : 'disabled'}>
                <span class="no">Seviye ${i + 1} ${acikMi(i) ? '' : '<i class="fas fa-lock"></i>'}</span>
                <span class="prev">${ornekOnizleme(i)}</span>
                <h3>${s.ad}</h3>${KL.yildizHTML(kayit.yildiz[i] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('lvlGrid').addEventListener('click', (e) => {
        const b = e.target.closest('.lvl-card');
        if (b && !b.disabled) basla(+b.dataset.i);
    });

    function basla(i) {
        sv = i; tur = 0; hata = 0;
        $('gTitle').textContent = SEVIYELER[i].ad;
        if (ipucuKont) ipucuKont.kaldir();
        ipucuKont = KL.ipucu({ etkinlik: 'oruntu', bolum: i, yer: $('ipucuYer'), basamaklar: [IPUCLARI[i][0], IPUCLARI[i][1], {
            metin: 'Yanlış bir seçeneği senin için eleyebilirim. Kalan iki seçenekten doğruyu sen bul!', uygulaYazi: 'Bir yanlışı ele', bildiri: '',
            uygula: () => {
                const i = soru.secenekler.findIndex((x, j) => !ayni(x, soru.dogru) && !$('opts').children[j].classList.contains('hata'));
                if (i >= 0) $('opts').children[i].classList.add('hata');
            }
        }] });
        goster('oyun');
        yeniTur();
    }

    // Soru üret: { dizi: [öğe], bos: soru işaretinin yeri, dogru: öğe, secenekler: [öğe] }
    function uret() {
        const s = SEVIYELER[sv];
        if (s.sekil) {
            // Şekil bir kurala, renk başka bir kurala göre değişir
            const sekiller = KL.karistir(Object.keys(SEKIL)).slice(0, 2);
            const renkler = KL.karistir([0, 1, 2, 3]).slice(0, 3);
            const rk = KL.sec([2, 3]);
            const dizi = Array.from({ length: 7 }, (_, i) => ({ sekil: sekiller[i % 2], renk: renkler[i % rk] }));
            const dogru = dizi.pop();
            const yanlis1 = { sekil: sekiller[(dizi.length + 1) % 2], renk: dogru.renk };
            const yanlis2 = { sekil: dogru.sekil, renk: renkler.find(r => r !== dogru.renk) };
            return { dizi: [...dizi, null], dogru, secenekler: KL.karistir([dogru, yanlis1, yanlis2]), svg: true };
        }
        const ogeler = KL.karistir(KL.sec(SETLER)).slice(0, 3);
        let dizi;
        if (s.buyuyen) {
            // A B, A B B, A B B B ...
            dizi = [];
            for (let n = 1; dizi.length < 9; n++) { dizi.push('A'); for (let j = 0; j < n; j++) dizi.push('B'); }
            dizi = dizi.slice(0, KL.rastgele(7, 9)).map(h => ogeler[h.charCodeAt(0) - 65]);
        } else {
            const k = KL.sec(s.kalip);
            const uzunluk = Math.max(k.length * 2 + 1, 7);
            dizi = Array.from({ length: uzunluk + (s.ortada ? 1 : 0) }, (_, i) => ogeler[k.charCodeAt(i % k.length) - 65]);
        }
        let bos = s.ortada ? KL.rastgele(2, dizi.length - 2) : dizi.length;
        let dogru;
        if (bos === dizi.length) { dogru = sonraki(); dizi.push(null); }
        else { dogru = dizi[bos]; dizi[bos] = null; }
        const kullanilan = [...new Set(dizi.filter(Boolean))];
        const yanlislar = KL.karistir([...kullanilan.filter(x => x !== dogru), ...ogeler.filter(x => !kullanilan.includes(x))]).slice(0, 2);
        return { dizi, dogru, secenekler: KL.karistir([dogru, ...yanlislar]) };

        function sonraki() {
            if (s.buyuyen) {
                const tam = [];
                for (let n = 1; tam.length <= dizi.length; n++) { tam.push(ogeler[0]); for (let j = 0; j < n; j++) tam.push(ogeler[1]); }
                return tam[dizi.length];
            }
            const k = s.kalip.find(x => dizi.every((o, i) => o === ogeler[x.charCodeAt(i % x.length) - 65]));
            return ogeler[k.charCodeAt(dizi.length % k.length) - 65];
        }
    }

    const oge = (x) => soru.svg ? sekilSVG(x) : x;
    const ayni = (a, b) => soru.svg ? (a.sekil === b.sekil && a.renk === b.renk) : a === b;

    function yeniTur() {
        kilit = false;
        soru = uret();
        $('seq').innerHTML = soru.dizi.map(x => x === null ? '<div class="item q" id="bos">?</div>' : `<div class="item">${oge(x)}</div>`).join('');
        $('opts').innerHTML = soru.secenekler.map((x, i) => `<button class="opt" data-i="${i}" aria-label="Seçenek ${i + 1}">${oge(x)}</button>`).join('');
        let h = '';
        for (let i = 0; i < TUR; i++) h += `<span class="${i < tur ? 'ok' : i === tur ? 'cur' : ''}"></span>`;
        $('dots').innerHTML = h;
    }

    function sec(i) {
        if (kilit) return;
        const b = $('opts').children[i];
        if (!b || b.classList.contains('hata')) return;
        if (ayni(soru.secenekler[i], soru.dogru)) {
            kilit = true;
            KL.ses('dogru');
            const bos = $('bos');
            bos.innerHTML = oge(soru.dogru);
            bos.classList.add('dolu');
            tur++;
            setTimeout(() => (tur < TUR ? yeniTur() : bitir()), 900);
        } else {
            hata++;
            if (ipucuKont) ipucuKont.yanlis();
            KL.ses('yanlis');
            b.classList.add('hata');
        }
    }
    $('opts').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b) sec(+b.dataset.i); });
    document.addEventListener('keydown', (e) => { if (!$('oyun').hidden && /^[1-3]$/.test(e.key)) sec(+e.key - 1); });

    function bitir() {
        const y = Math.min(hata === 0 ? 3 : hata <= 2 ? 2 : 1, ipucuKont ? ipucuKont.yildizSiniri() : 3);
        if (y > (kayit.yildiz[sv] || 0)) { kayit.yildiz[sv] = y; KL.yaz('oruntu', kayit); }
        $('rTitle').textContent = y === 3 ? 'Süpersin!' : 'Aferin!';
        $('rStars').innerHTML = KL.yildizHTML(y);
        $('rNext').hidden = sv === SEVIYELER.length - 1;
        if (y === 3) KL.konfeti();
        goster('sonuc');
    }

    $('geri').addEventListener('click', listeCiz);
    $('rList').addEventListener('click', listeCiz);
    $('rAgain').addEventListener('click', () => basla(sv));
    $('rNext').addEventListener('click', () => basla(sv + 1));

    listeCiz();
})();
