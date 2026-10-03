// KodLab — Piksel Kodlama
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);

    const RENKLER = [
        { ad: 'beyaz', hex: '#ffffff' }, { ad: 'siyah', hex: '#1f2937' }, { ad: 'kırmızı', hex: '#e5484d' },
        { ad: 'sarı', hex: '#f5c518' }, { ad: 'mavi', hex: '#3b82f6' }, { ad: 'yeşil', hex: '#22a35a' },
        { ad: 'turuncu', hex: '#f97316' }, { ad: 'kahverengi', hex: '#8b5a2b' }, { ad: 'pembe', hex: '#f472b6' }
    ];
    const HARF = { '.': 0, '#': 1, r: 2, y: 3, b: 4, g: 5, o: 6, n: 7, p: 8 };

    // Bulmacalar: '.' beyaz, '#' siyah, r kırmızı, y sarı, b mavi, g yeşil, o turuncu, n kahverengi, p pembe
    const BULMACALAR = [
        { ad: 'Kalp', resim: ['........', '.##..##.', '########', '########', '.######.', '..####..', '...##...', '........'] },
        { ad: 'Ev', resim: ['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.'] },
        { ad: 'Gülen Yüz', resim: ['..####..', '.#....#.', '#.#..#.#', '#......#', '#.#..#.#', '#..##..#', '.#....#.', '..####..'] },
        { ad: 'Uzaylı', resim: ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'] },
        { ad: 'Ağaç', resim: ['...gg...', '..gggg..', '.gggggg.', 'gggggggg', '.gggggg.', '...nn...', '...nn...', 'gggggggg'] },
        { ad: 'Çilek', resim: ['..g..g..', '...gg...', '.rrrrrr.', 'rryrrryr', 'rrrrrrrr', '.rryrrr.', '..rrrr..', '...rr...'] },
        { ad: 'Robot', resim: ['....y....', '....#....', '.bbbbbbb.', '.b##b##b.', '.bbbbbbb.', '.b.....b.', '.bbbbbbb.', '..b...b..', '.bb...bb.'] },
        { ad: 'Balık', resim: ['..........', '....oo....', '..oooooo.o', '.o#oooooo.', 'oooooooooo', '.oooooooo.', '..oooooo.o', '....oo....', '..........', 'bbbbbbbbbb'] }
    ];

    const kayit = KL.oku('piksel', { tamam: {} });
    let hedef = null;      // çözülecek resim (sayı dizisi), tasarımda null
    let piksel = [];       // boyanan resim
    let w = 8, h = 8, renk = 1, boyuyor = false, tasarim = false, kodGizli = false, bulmacaNo = null;

    const cevir = (satirlar) => satirlar.map(s => [...s].map(c => HARF[c]));

    // Satırı "kaç tane, hangi renk" çiftlerine çevir
    function satirKodu(satir) {
        const out = [];
        for (const c of satir) {
            if (out.length && out[out.length - 1][1] === c) out[out.length - 1][0]++;
            else out.push([1, c]);
        }
        return out;
    }

    function kucukResim(resim) {
        const cv = document.createElement('canvas');
        cv.width = resim[0].length; cv.height = resim.length;
        const ctx = cv.getContext('2d');
        resim.forEach((s, y) => s.forEach((c, x) => { ctx.fillStyle = RENKLER[c].hex; ctx.fillRect(x, y, 1, 1); }));
        return cv;
    }

    function goster(id) { ['liste', 'oyun'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

    function listeCiz() {
        history.replaceState(null, '', location.pathname + location.search);
        $('pzGrid').innerHTML = BULMACALAR.map((b, i) => `
            <button class="card pz-card" data-i="${i}">
                <div class="thumb" data-thumb="${i}">${kayit.tamam[i] ? '' : '<i class="fas fa-question"></i>'}</div>
                <h3>${kayit.tamam[i] ? b.ad : 'Bulmaca ' + (i + 1)} ${kayit.tamam[i] ? '<i class="fas fa-circle-check done"></i>' : ''}</h3>
                <small>${b.resim[0].length}×${b.resim.length} · ${renkSayisi(cevir(b.resim))} renk</small>
            </button>`).join('') + `
            <button class="card pz-card design" data-i="tasarim">
                <div class="thumb"><i class="fas fa-paintbrush"></i></div>
                <h3>Kendi resmini tasarla</h3><small>Çiz, kodunu gör, paylaş</small>
            </button>`;
        BULMACALAR.forEach((b, i) => { if (kayit.tamam[i]) document.querySelector(`[data-thumb="${i}"]`).appendChild(kucukResim(cevir(b.resim))); });
        goster('liste');
    }
    const renkSayisi = (r) => new Set(r.flat()).size;

    $('pzGrid').addEventListener('click', (e) => {
        const b = e.target.closest('.pz-card');
        if (!b) return;
        if (b.dataset.i === 'tasarim') tasarimBasla(8);
        else bulmacaBasla(cevir(BULMACALAR[+b.dataset.i].resim), +b.dataset.i);
    });

    function bulmacaBasla(resim, no, baslik) {
        tasarim = false; bulmacaNo = no; kodGizli = false;
        hedef = resim; h = resim.length; w = resim[0].length;
        piksel = Array.from({ length: h }, () => Array(w).fill(0));
        const kullanilan = [...new Set(resim.flat())].sort((a, b) => a - b);
        renk = kullanilan.find(c => c !== 0) ?? 1;
        paletCiz(kullanilan.includes(0) ? kullanilan : [0, ...kullanilan]);
        $('gTitle').textContent = baslik || (no !== null && kayit.tamam[no] ? BULMACALAR[no].ad : `Bulmaca ${no + 1}`);
        $('solvePanel').hidden = false; $('designPanel').hidden = true;
        goster('oyun');
        tahtaCiz();
    }

    function tasarimBasla(boyut) {
        tasarim = true; hedef = null; bulmacaNo = null;
        w = h = boyut;
        piksel = Array.from({ length: h }, () => Array(w).fill(0));
        renk = 1;
        paletCiz(RENKLER.map((_, i) => i));
        $('gTitle').textContent = 'Kendi resmini tasarla';
        $('solvePanel').hidden = true; $('designPanel').hidden = false; $('shareOut').hidden = true;
        document.querySelectorAll('#size button').forEach(b => b.classList.toggle('sel', +b.dataset.s === boyut));
        goster('oyun');
        tahtaCiz();
    }

    function paletCiz(renkler) {
        $('palette').innerHTML = renkler.map(i =>
            `<button data-c="${i}" class="${i === renk ? 'sel' : ''}" style="background:${RENKLER[i].hex}" title="${RENKLER[i].ad}" aria-label="${RENKLER[i].ad}"></button>`).join('');
    }
    $('palette').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        renk = +b.dataset.c;
        $('palette').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
    });

    function hucreBoyu() {
        const genislik = Math.min(document.querySelector('.board-card')?.clientWidth || 600, 720) - 36;
        const kodGenisligi = tasarim && kodGizli ? 0 : Math.min(genislik * 0.4, 220);
        return Math.max(24, Math.min(40, Math.floor((genislik - kodGenisligi) / w)));
    }

    function tahtaCiz() {
        const b = $('board');
        const c = hucreBoyu();
        b.style.setProperty('--c', c + 'px');
        b.style.gridTemplateColumns = `auto repeat(${w}, ${c}px)`;
        let html = '';
        for (let y = 0; y < h; y++) {
            html += `<div class="rc" id="rc${y}"></div>`;
            for (let x = 0; x < w; x++) html += `<div class="px" data-x="${x}" data-y="${y}"></div>`;
        }
        b.innerHTML = html;
        for (let y = 0; y < h; y++) { satirKodCiz(y); for (let x = 0; x < w; x++) hucreBoya(x, y); }
        if (tasarim) istatistik();
    }

    function hucreBoya(x, y) {
        const el = $('board').children[y * (w + 1) + 1 + x];
        el.style.background = RENKLER[piksel[y][x]].hex;
        el.classList.remove('wrong');
    }

    function satirKodCiz(y) {
        const el = $('rc' + y);
        const kaynak = tasarim ? piksel[y] : hedef[y];
        if (tasarim && kodGizli) { el.innerHTML = ''; return; }
        const kod = satirKodu(kaynak).map(([n, c]) =>
            `<span class="run">${n}<span class="sw" style="background:${RENKLER[c].hex}" title="${RENKLER[c].ad}"></span></span>`).join('');
        const tamam = !tasarim && piksel[y].every((c, x) => c === hedef[y][x]);
        el.className = 'rc' + (tamam ? ' ok' : '');
        el.innerHTML = kod + (tasarim ? '' : `<span class="chk">${tamam ? '✓' : ''}</span>`);
    }

    // Boyama: fare ile sürükle ya da dokunmatik ekranda parmakla çiz
    function boya(el) {
        if (!el || !el.classList.contains('px')) return;
        const x = +el.dataset.x, y = +el.dataset.y;
        if (piksel[y][x] === renk) return;
        piksel[y][x] = renk;
        hucreBoya(x, y);
        satirKodCiz(y);
        if (tasarim) istatistik();
        else kontrol();
    }
    $('board').addEventListener('pointerdown', (e) => {
        if (!e.target.classList.contains('px')) return;
        e.preventDefault();
        boyuyor = true;
        // Aynı renkteki kareye tıklamak onu silsin (beyaz yapsın)
        const x = +e.target.dataset.x, y = +e.target.dataset.y;
        if (piksel[y][x] === renk && renk !== 0) { const r = renk; renk = 0; boya(e.target); renk = r; boyuyor = 'sil'; }
        else boya(e.target);
    });
    $('board').addEventListener('pointermove', (e) => {
        if (!boyuyor) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (boyuyor === 'sil') { const r = renk; renk = 0; boya(el); renk = r; }
        else boya(el);
    });
    window.addEventListener('pointerup', () => { boyuyor = false; });

    function kontrol() {
        const tamam = piksel.every((s, y) => s.every((c, x) => c === hedef[y][x]));
        if (!tamam) return;
        if (bulmacaNo !== null) {
            kayit.tamam[bulmacaNo] = true; KL.yaz('piksel', kayit);
            $('gTitle').textContent = BULMACALAR[bulmacaNo].ad;
        }
        KL.konfeti();
        KL.bildir(bulmacaNo !== null ? `Tebrikler! Resim: ${BULMACALAR[bulmacaNo].ad}` : 'Tebrikler, resmi çözdün!', 3000);
    }

    function istatistik() {
        const toplam = w * h;
        const sayilar = piksel.reduce((t, s) => t + satirKodu(s).length * 2, 0);
        $('stat').innerHTML = `Piksel sayısı: <b>${toplam}</b><br>Kodda kullanılan sayı: <b>${sayilar}</b><br>` +
            (sayilar < toplam ? `Kod, resmin %${Math.round(100 - sayilar / toplam * 100)} daha kısa hali.` : 'Bu resimde kısaltma işe yaramıyor!');
    }

    // Paylaşım: resim linkin içine yazılır (#b=genişlik.yükseklik.rakamlar)
    function linkOlustur() {
        const veri = `${w}.${h}.${piksel.flat().join('')}`;
        return location.origin + location.pathname + '#b=' + veri;
    }
    function linktenOku() {
        const m = location.hash.match(/^#b=(\d+)\.(\d+)\.([0-8]+)$/);
        if (!m) return null;
        const W = +m[1], H = +m[2], d = m[3];
        if (W < 2 || H < 2 || W > 16 || H > 16 || d.length !== W * H) return null;
        return Array.from({ length: H }, (_, y) => [...d.slice(y * W, y * W + W)].map(Number));
    }

    $('paylas').addEventListener('click', () => {
        if (piksel.flat().every(c => c === 0)) { KL.bildir('Önce bir şeyler çiz!'); return; }
        $('shareUrl').value = linkOlustur();
        $('shareOut').hidden = false;
        $('shareUrl').select();
    });
    $('kopyala').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText($('shareUrl').value); KL.bildir('Link kopyalandı! Öğrencilerle paylaşabilirsin.'); }
        catch (e) { $('shareUrl').select(); KL.bildir('Linki seçip kopyala (Ctrl+C).'); }
    });
    $('size').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (b) tasarimBasla(+b.dataset.s);
    });
    $('dTemizle').addEventListener('click', () => { piksel = piksel.map(s => s.map(() => 0)); tahtaCiz(); });
    $('kodGizle').addEventListener('click', () => {
        kodGizli = !kodGizli;
        $('kodGizle').innerHTML = kodGizli ? '<i class="fas fa-eye"></i> Kodu göster' : '<i class="fas fa-eye-slash"></i> Kodu gizle';
        tahtaCiz();
    });
    $('temizle').addEventListener('click', () => { piksel = piksel.map(s => s.map(() => 0)); tahtaCiz(); });
    $('geri').addEventListener('click', listeCiz);
    window.addEventListener('resize', () => { if (!$('oyun').hidden) tahtaCiz(); });

    const paylasilan = linktenOku();
    if (paylasilan) bulmacaBasla(paylasilan, null, 'Öğretmenin bulmacası');
    else listeCiz();
})();
