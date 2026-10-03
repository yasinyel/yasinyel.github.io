// KodLab — Bilgisayar Sensin arayüzü
(function () {
    'use strict';
    const S = window.Sensin;
    const $ = (id) => document.getElementById(id);
    const prm = new URLSearchParams(location.search);
    const ogretmen = prm.has('ogretmen');
    const kayit = KL.oku('sensin', {});

    let kademe = S.KADEMELER.find(k => k.id === (prm.get('kademe') || kayit.sonKademe)) || S.KADEMELER[0];
    let no = 0, bolum = null, adim = 0, hata = 0, adimHatasi = 0, ipucuKullanildi = false, bitti = false;
    let yolBilgi = null, c = 40;

    const KARAKTER = `<svg viewBox="0 0 40 40" aria-hidden="true">
        <rect x="7" y="8" width="26" height="26" rx="8" fill="#1d5fd6"/>
        <rect x="11" y="12" width="18" height="11" rx="4" fill="#e8f0ff"/>
        <circle cx="16" cy="17.5" r="2.4" fill="#0f172a"/><circle cx="24" cy="17.5" r="2.4" fill="#0f172a"/>
        <rect x="14" y="27" width="12" height="3" rx="1.5" fill="#6ea4ff"/>
        <rect x="18.5" y="2" width="3" height="6" rx="1.5" fill="#163f8f"/><circle cx="20" cy="3" r="2.5" fill="#ffd166"/>
        <rect x="3" y="15" width="4" height="12" rx="2" fill="#163f8f"/><rect x="33" y="15" width="4" height="12" rx="2" fill="#163f8f"/>
    </svg>`;

    const yildizlar = (kd) => kayit[kd.id] || {};
    const acikMi = (kd, i) => ogretmen || i === 0 || (yildizlar(kd)[i - 1] || 0) > 0;

    function goster(id) { ['liste', 'oyun'].forEach(s => { $(s).hidden = s !== id; }); }

    // ---------- Liste ----------
    function listeCiz() {
        $('kademeler').innerHTML = S.KADEMELER.map(kd => {
            const y = Object.values(yildizlar(kd)).reduce((a, b) => a + b, 0);
            return `<button class="card kademe ${kd === kademe ? 'sel' : ''}" data-k="${kd.id}" style="--kc:${kd.renk}">
                <span class="ik"><i class="fas ${kd.ikon}"></i></span>
                <h3>${kd.ad}</h3><small>${kd.sinif}</small><p>${kd.aciklama}</p>
                <div class="bar"><div style="width:${Math.round(y / (kd.bolumler.length * 3) * 100)}%"></div></div>
            </button>`;
        }).join('');
        const yk = yildizlar(kademe);
        $('bolumler').innerHTML = kademe.bolumler.map((b, i) => {
            const y = yk[i] || 0;
            return `<button class="card bolum ${y ? 'done' : ''}" data-i="${i}" ${acikMi(kademe, i) ? '' : 'disabled'}>
                <span class="no">${acikMi(kademe, i) ? i + 1 : '<i class="fas fa-lock" style="font-size:.8em"></i>'}</span>
                <span><b>${b.ad}</b>${KL.yildizHTML(y)}</span></button>`;
        }).join('');
        goster('liste');
    }
    $('kademeler').addEventListener('click', (e) => {
        const b = e.target.closest('.kademe');
        if (!b) return;
        kademe = S.KADEMELER.find(k => k.id === b.dataset.k);
        kayit.sonKademe = kademe.id; KL.yaz('sensin', kayit);
        listeCiz();
    });
    $('bolumler').addEventListener('click', (e) => {
        const b = e.target.closest('.bolum');
        if (b && !b.disabled) baslat(+b.dataset.i, true);
    });

    // ---------- Oyun ----------
    function baslat(i, yeniProgram) {
        no = i;
        if (yeniProgram || !bolum) bolum = S.bolumUret(kademe, no);
        adim = 0; hata = 0; adimHatasi = 0; ipucuKullanildi = false; ipucuAcik = false; bitti = false;
        const b = kademe.bolumler[no];
        $('baslik').innerHTML = `<small>${kademe.ad} · Bölüm ${no + 1}</small>${b.ad}`;
        $('yeni').hidden = !b.yeni;
        $('yeni').innerHTML = b.yeni ? `<b><i class="fas fa-star"></i> Yeni:</b> ${b.yeni}` : '';
        $('ipucu').hidden = kademe.gosterim === 'ok';
        $('kodBaslik').textContent = { ok: 'Oklar', blok: 'Kod blokları', turkce: 'Kod', python: 'Python kodu' }[kademe.gosterim];
        kodCiz();
        goster('oyun');
        tahtaCiz();
        mesaj(kademe.gosterim === 'ok' ? 'Parlayan oku takip et!' : 'Kodu oku ve ilk hamleyi yap.');
        guncelle();
    }

    function kodCiz() {
        const p = bolum.program;
        if (kademe.gosterim === 'ok') $('kod').innerHTML = `<div class="oklar">${S.okYaz(p)}</div>`;
        else if (kademe.gosterim === 'blok') $('kod').innerHTML = `<div class="bloklar">${S.blokYaz(p)}</div>`;
        else {
            const satirlar = S.metinYaz(p, kademe.gosterim);
            $('kod').innerHTML = '<pre class="code">' + satirlar.map((s, i) =>
                `<span class="ln" data-n="${i + 1}" ${s.id ? `data-id="${s.id}"` : ''}>${'    '.repeat(s.girinti)}${s.html || ' '}</span>`).join('') + '</pre>';
        }
    }

    function tahtaCiz() {
        yolBilgi = S.yol(bolum.hamleler);
        const w = yolBilgi.maxX - yolBilgi.minX + 3, h = yolBilgi.maxY - yolBilgi.minY + 3;
        const genislik = $('boardWrap').clientWidth - 34;
        c = Math.max(24, Math.min(56, Math.floor(genislik / w), Math.floor(380 / h)));
        const b = $('board');
        b.style.setProperty('--c', c + 'px');
        b.style.gridTemplateColumns = `repeat(${w}, ${c}px)`;
        let html = '';
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) html += `<div class="cell" id="c${x}_${y}"></div>`;
        b.innerHTML = html + `<div class="karakter" id="karakter">${KARAKTER}</div>`;
        b.dataset.w = w;
        const [bx, by] = hucre(0);
        $(`c${bx}_${by}`).classList.add('bas');
        karakterKonum(false);
    }

    // i. noktanın tahtadaki hücresi
    function hucre(i) {
        const [x, y] = yolBilgi.noktalar[i];
        return [x - yolBilgi.minX + 1, y - yolBilgi.minY + 1];
    }

    function karakterKonum(animasyon = true) {
        const k = $('karakter');
        const [x, y] = hucre(adim);
        if (!animasyon) k.style.transition = 'none';
        k.style.transform = `translate(${x * c}px, ${y * c}px)`;
        if (!animasyon) { k.offsetHeight; k.style.transition = ''; }
    }

    function guncelle() {
        $('ilerleme').textContent = `${adim}/${bolum.hamleler.length}`;
        $('hatalar').textContent = hata;
        document.querySelectorAll('#kod .cur').forEach(e => e.classList.remove('cur'));
        const otomatik = kademe.gosterim === 'ok';
        if ((otomatik || ipucuAcik) && !bitti) isaretle();
    }
    let ipucuAcik = false;

    function isaretle() {
        const h = bolum.hamleler[adim];
        if (!h) return;
        const el = document.querySelector(`#kod [data-id="${h.id}"]`);
        if (el) { el.classList.add('cur'); el.scrollIntoView({ block: 'nearest' }); }
    }

    function mesaj(m, tur = '') { const e = $('msg'); e.textContent = m; e.className = 'msg ' + tur; }

    function tus(d) {
        if (bitti || $('oyun').hidden || $('kazandi').open) return;
        const dugme = document.querySelector(`.pad [data-d="${d}"]`);
        const beklenen = bolum.hamleler[adim].d;
        if (d === beklenen) {
            dugme.classList.add('bas'); setTimeout(() => dugme.classList.remove('bas'), 120);
            const [x, y] = hucre(adim);
            $(`c${x}_${y}`).classList.add('iz');
            adim++; adimHatasi = 0; ipucuAcik = false;
            KL.ses('tik');
            karakterKonum();
            mesaj('');
            if (adim === bolum.hamleler.length) { bitti = true; guncelle(); setTimeout(kazan, 350); return; }
        } else {
            hata++; adimHatasi++;
            KL.ses('yanlis');
            dugme.classList.remove('hata'); dugme.offsetWidth; dugme.classList.add('hata');
            clearTimeout(dugme._t); dugme._t = setTimeout(() => dugme.classList.remove('hata'), 350);
            const k = $('karakter'); k.classList.remove('sars'); k.offsetWidth; k.classList.add('sars');
            const [x, y] = hucre(adim);
            const [dx, dy] = S.YON[d];
            const hedef = $(`c${x + dx}_${y + dy}`);
            if (hedef) {
                hedef.classList.remove('yanlis'); hedef.offsetWidth; hedef.classList.add('yanlis');
                setTimeout(() => hedef.classList.remove('yanlis'), 500);
            }
            // Takılan öğrenciye kademesine göre otomatik yardım
            const sinir = { ok: 99, blok: 2, turkce: 3, python: 3 }[kademe.gosterim];
            if (adimHatasi >= sinir && !ipucuAcik) { ipucuAcik = true; ipucuKullanildi = true; mesaj('Sıradaki hamleyi yapan satırı işaretledim.', 'bad'); }
            else mesaj(kademe.gosterim === 'ok' ? 'Olmadı, parlayan oka bak!' : 'Olmadı! Kod bu adımda başka bir şey yapıyor.', 'bad');
        }
        guncelle();
    }

    function kazan() {
        let y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
        if (ipucuKullanildi) y = Math.min(y, 2);
        kayit[kademe.id] = kayit[kademe.id] || {};
        kayit[kademe.id][no] = Math.max(kayit[kademe.id][no] || 0, y);
        KL.yaz('sensin', kayit);
        mesaj('Tebrikler, kodu doğru çalıştırdın!', 'ok');
        $('kTitle').textContent = y === 3 ? 'Kusursuz!' : 'Başardın!';
        $('kStars').innerHTML = KL.yildizHTML(y);
        $('kText').textContent = `${bolum.hamleler.length} hamleyi ${hata} hatayla yaptın.` +
            (ipucuKullanildi ? ' İpucu kullandığın için en fazla 2 yıldız.' : '') +
            (y < 3 ? ' Yeni sayılarla tekrar deneyip 3 yıldız alabilirsin.' : '');
        $('kSonraki').hidden = no === kademe.bolumler.length - 1;
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        $('kazandi').showModal();
    }

    // ---------- Olaylar ----------
    const TUSLAR = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R', w: 'U', s: 'D', a: 'L', d: 'R', W: 'U', S: 'D', A: 'L', D: 'R' };
    document.addEventListener('keydown', (e) => {
        const d = TUSLAR[e.key];
        if (!d || $('oyun').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();
        if (!e.repeat) tus(d);
    });
    $('pad').addEventListener('pointerdown', (e) => {
        const b = e.target.closest('button');
        if (b) { e.preventDefault(); tus(b.dataset.d); }
    });
    $('ipucu').addEventListener('click', () => {
        if (bitti) return;
        ipucuAcik = true; ipucuKullanildi = true;
        guncelle();
    });
    $('bastan').addEventListener('click', () => baslat(no, false));
    $('yeniSoru').addEventListener('click', () => baslat(no, true));
    $('geri').addEventListener('click', listeCiz);
    $('kTekrar').addEventListener('click', () => { $('kazandi').close(); baslat(no, true); });
    $('kSonraki').addEventListener('click', () => { $('kazandi').close(); baslat(no + 1, true); });
    window.addEventListener('resize', () => {
        if ($('oyun').hidden) return;
        const iz = [...document.querySelectorAll('.cell.iz')].map(e => e.id);
        tahtaCiz();
        iz.forEach(id => $(id).classList.add('iz'));
    });

    listeCiz();
    if (ogretmen) KL.bildir('Öğretmen modu: tüm bölümler açık');
})();
