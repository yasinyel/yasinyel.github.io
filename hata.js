// KodLab — Hata Avcısı arayüzü
(function () {
    'use strict';
    const S = window.Sensin, H = window.HataMotor;
    const $ = (id) => document.getElementById(id);
    const TUR = 5;
    const kayit = KL.oku('hata', {});
    const KADEMELER = S.KADEMELER.filter(k => k.id !== 'okuloncesi');
    const ACIKLAMA = {
        ilkokul: 'Blokların arasında yanlış yöne giden ya da yanlış sayıda tekrar eden bir blok var.',
        ortaokul: 'Türkçe kodda bir sayı, bir yön ya da bir karşılaştırma yanlış yazılmış.',
        lise: 'Python kodunda bir sayı, operatör ya da koşul hatalı. Sınır değerlerine dikkat!'
    };

    let kademe = null, tur = 0, hata = 0, soru = null, asama = 'satir', c = 40, sinir = null;

    const KARAKTER = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="7" y="8" width="26" height="26" rx="8" fill="#1d5fd6"/><rect x="11" y="12" width="18" height="11" rx="4" fill="#e8f0ff"/><circle cx="16" cy="17.5" r="2.4" fill="#0f172a"/><circle cx="24" cy="17.5" r="2.4" fill="#0f172a"/><rect x="14" y="27" width="12" height="3" rx="1.5" fill="#6ea4ff"/><rect x="18.5" y="2" width="3" height="6" rx="1.5" fill="#163f8f"/><circle cx="20" cy="3" r="2.5" fill="#ffd166"/></svg>`;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

    function listeCiz() {
        $('kademeler').innerHTML = KADEMELER.map(k => `
            <button class="card kademe" data-k="${k.id}" style="--kc:${k.renk}">
                <span class="ik"><i class="fas ${k.ikon}"></i></span>
                <h3>${k.ad}</h3><small>${k.sinif}</small><p>${ACIKLAMA[k.id]}</p>${KL.yildizHTML(kayit[k.id] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('kademeler').addEventListener('click', (e) => {
        const b = e.target.closest('.kademe');
        if (b) basla(KADEMELER.find(k => k.id === b.dataset.k));
    });

    function basla(k) {
        kademe = k; tur = 0; hata = 0;
        goster('oyun');
        yeniSoru();
    }

    function yeniSoru() {
        soru = H.hataUret(kademe);
        asama = 'satir';
        $('baslik').innerHTML = `<small>${kademe.ad} · Hata ${tur + 1}/${TUR}</small>${soru.bolum}`;
        $('dots').innerHTML = Array.from({ length: TUR }, (_, i) => `<span class="${i < tur ? 'ok' : i === tur ? 'cur' : ''}"></span>`).join('');
        $('gorev').innerHTML = `<span class="adim">1</span> Hatalı ${kademe.gosterim === 'blok' ? 'bloğa' : 'satıra'} tıkla.`;
        $('duzeltme').innerHTML = '';
        $('fb').textContent = ''; $('fb').className = 'fb';
        kodCiz();
        tahtaCiz();
    }

    function kodCiz() {
        $('kodPanel').classList.add('secilebilir');
        if (kademe.gosterim === 'blok') $('kod').innerHTML = `<div class="bloklar">${S.blokYaz(soru.program)}</div>`;
        else $('kod').innerHTML = '<pre class="code">' + S.metinYaz(soru.program, kademe.gosterim).map((s, i) =>
            `<span class="ln" data-n="${i + 1}" ${s.id ? `data-id="${s.id}"` : ''}>${'    '.repeat(s.girinti)}${s.html || ' '}</span>`).join('') + '</pre>';
    }

    // ---------- Tahta: iki yol birlikte ----------
    function tahtaCiz() {
        const y1 = S.yol(soru.dogruHamle), y2 = S.yol(soru.hataliHamle);
        sinir = { minX: Math.min(y1.minX, y2.minX), maxX: Math.max(y1.maxX, y2.maxX), minY: Math.min(y1.minY, y2.minY), maxY: Math.max(y1.maxY, y2.maxY) };
        const w = sinir.maxX - sinir.minX + 3, h = sinir.maxY - sinir.minY + 3;
        c = Math.max(20, Math.min(48, Math.floor(($('boardWrap').clientWidth - 34) / w), Math.floor(380 / h)));
        const b = $('board');
        b.style.setProperty('--c', c + 'px');
        b.style.gridTemplateColumns = `repeat(${w}, ${c}px)`;
        const merkez = ([x, y]) => [(x - sinir.minX + 1.5) * c, (y - sinir.minY + 1.5) * c];
        const cizgi = (y, renk, kesik, kayma) => {
            const nok = y.noktalar.map(merkez).map(([x, yy]) => `${x + kayma},${yy + kayma}`).join(' ');
            return `<polyline points="${nok}" fill="none" stroke="${renk}" stroke-width="${Math.max(3, c / 9)}" stroke-linecap="round" stroke-linejoin="round" ${kesik ? `stroke-dasharray="${c / 5} ${c / 6}"` : ''} opacity=".9"/>`;
        };
        const [hx, hy] = merkez(y1.noktalar[y1.noktalar.length - 1]);
        const [kx, ky] = merkez(y2.noktalar[y2.noktalar.length - 1]);
        b.innerHTML = Array.from({ length: w * h }, () => '<div class="cell"></div>').join('') +
            `<svg class="yollar" width="${w * c}" height="${h * c}">
                ${cizgi(y2, '#e5484d', false, c * 0.08)}${cizgi(y1, '#16a36a', true, -c * 0.08)}
                <g transform="translate(${kx + c * .08},${ky + c * .08})"><circle r="${c / 4}" fill="#e5484d"/><path d="M-${c / 9},-${c / 9} L${c / 9},${c / 9} M${c / 9},-${c / 9} L-${c / 9},${c / 9}" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
                <g transform="translate(${hx - c * .08},${hy - c * .08})"><circle r="${c / 3.2}" fill="#16a36a"/><path d="M-${c / 12},-${c / 7} V${c / 7} M-${c / 12},-${c / 7} L${c / 7},-${c / 14} L-${c / 12},${c / 50}" stroke="#fff" stroke-width="2.5" fill="#fff" stroke-linejoin="round"/></g>
            </svg><div class="karakter" id="karakter">${KARAKTER}</div>`;
        karakterGit(0, y1);
    }

    function karakterGit(i, y) {
        const [x, yy] = y.noktalar[i];
        $('karakter').style.transform = `translate(${(x - sinir.minX + 1) * c}px, ${(yy - sinir.minY + 1) * c}px)`;
    }

    // ---------- Etkileşim ----------
    $('kod').addEventListener('click', (e) => {
        if (asama !== 'satir') return;
        const el = e.target.closest('[data-id]');
        if (!el) return;
        document.querySelectorAll('#kod .yanlis').forEach(x => x.classList.remove('yanlis'));
        if (+el.dataset.id === soru.hedefId) {
            KL.ses('dogru');
            el.classList.add('bulundu');
            asama = 'duzelt';
            $('kodPanel').classList.remove('secilebilir');
            $('fb').className = 'fb ok'; $('fb').textContent = 'Hatayı buldun!';
            $('gorev').innerHTML = '<span class="adim">2</span> Bu satır nasıl olmalı? Doğrusunu seç.';
            $('duzeltme').innerHTML = soru.secenekler.map((s, i) => `<button data-i="${i}">${secenekYaz(s.ifade)}</button>`).join('');
        } else {
            hata++;
            KL.ses('yanlis');
            el.classList.add('yanlis');
            $('fb').className = 'fb bad';
            $('fb').textContent = 'Bu satır doğru çalışıyor. Robotun yolunun nerede ayrıldığına bak!';
        }
    });

    // Bir ifadenin yalnızca ilk satırı (gövdesi olmadan)
    function secenekYaz(ifade) {
        const tek = { ...ifade, govde: [], evet: [], hayir: null };
        if (kademe.gosterim === 'blok') {
            if (ifade.t === 'mv') return `${{ R: '→ sağa git', L: '← sola git', U: '↑ yukarı git', D: '↓ aşağı git' }[ifade.d]}`;
            return `${ifade.n.v} kez tekrarla`;
        }
        return S.metinYaz([tek], kademe.gosterim)[0].html;
    }

    $('duzeltme').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || asama !== 'duzelt' || b.classList.contains('hata')) return;
        const s = soru.secenekler[+b.dataset.i];
        if (!s.dogru) {
            hata++;
            KL.ses('yanlis');
            b.classList.add('hata');
            $('fb').className = 'fb bad';
            $('fb').textContent = s.mevcut ? 'Bu, şu anki hatalı hali. Başka bir şey olmalı.' : 'Bununla da robot yanlış yere gider.';
            return;
        }
        KL.ses('dogru');
        asama = 'bitti';
        $('fb').className = 'fb ok';
        $('fb').textContent = 'Düzeltildi! Robot şimdi doğru yoldan gidiyor…';
        $('duzeltme').innerHTML = '';
        // Düzeltilmiş kodu göster ve robotu doğru yolda yürüt
        soru.program = H.degistir(soru.program, soru.hedefId, s.ifade);
        kodCiz();
        $('kodPanel').classList.remove('secilebilir');
        const el = document.querySelector(`#kod [data-id="${soru.hedefId}"]`);
        if (el) el.classList.add('bulundu');
        const y = S.yol(soru.dogruHamle);
        let i = 0;
        const t = setInterval(() => {
            i++;
            if (i >= y.noktalar.length) {
                clearInterval(t);
                tur++;
                setTimeout(() => (tur < TUR ? yeniSoru() : bitir()), 600);
                return;
            }
            karakterGit(i, y);
        }, 170);
    });

    function bitir() {
        const y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
        if (y > (kayit[kademe.id] || 0)) { kayit[kademe.id] = y; KL.yaz('hata', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Usta hata avcısı!' : '5 hata yakalandı!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = hata ? `${hata} yanlış tahminle bitirdin. Hiç yanlış yapmadan 3 yıldız alabilirsin.` : 'Hiç yanlış yapmadan bütün hataları buldun!';
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    $('geri').addEventListener('click', listeCiz);
    $('sListe').addEventListener('click', listeCiz);
    $('sTekrar').addEventListener('click', () => basla(kademe));
    window.__hata = () => soru;

    const k = new URLSearchParams(location.search).get('kademe');
    const ilk = KADEMELER.find(x => x.id === k);
    if (ilk) basla(ilk); else listeCiz();
})();
