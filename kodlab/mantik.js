// Kodlayalım — Mantık Kapıları arayüzü
(function () {
    'use strict';
    const M = window.Mantik;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('mantik', {});

    let no = 0, b = null, girisler = [], secim = {}, bulunan = {}, tiklama = 0, bitti = false;

    const sinifYaz = ([a, c]) => `${a}. – ${c}. sınıf`;
    const acikMi = (i) => ogretmen || i === 0 || (kayit[i - 1] || 0) > 0;
    function goster(id) { ['liste', 'oyun'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }

    function listeCiz() {
        $('lvlGrid').innerHTML = M.BOLUMLER.map((x, i) => `
            <button class="card lvl-card" data-i="${i}" ${acikMi(i) ? '' : 'disabled'}>
                <span class="no">Bölüm ${i + 1} · ${x.tur === 'yak' ? 'Tabloyu doldur' : 'Kapıyı seç'} ${acikMi(i) ? '' : '<i class="fas fa-lock"></i>'}</span>
                <h3>${x.ad}</h3><small>${sinifYaz(x.sinif)}</small>${KL.yildizHTML(kayit[i] || 0)}
            </button>`).join('');
        goster('liste');
    }
    $('lvlGrid').addEventListener('click', (e) => {
        const c = e.target.closest('.lvl-card');
        if (c && !c.disabled) basla(+c.dataset.i);
    });

    // İpucu Asistanı metinleri: [düşündüren soru, somut ipucu]
    const IPUCLARI = [
        ['Anahtar kapalıyken (0) lamba yanıyor mu? Anahtarı açınca ne değişiyor?', 'DEĞİL kapısı girişin tersini verir: 0 → 1, 1 → 0. Anahtarı bir kez aç, bir kez kapat; tablo dolar.'],
        ['İki anahtarın kaç farklı durumu var? 00, 01, …', 'VE kapısı yalnızca iki giriş de 1 iken 1 verir. Dört durumu sırayla dene; her seferinde tek bir anahtarı değiştir.'],
        ['Lambanın yanması için kaç anahtarın açık olması yeter?', 'VEYA kapısı en az bir giriş 1 ise 1 verir; yalnızca ikisi de 0 iken 0. Dört durumu dene.'],
        ['İki anahtar da açıkken lamba yanmalı mı? Tablodaki hedef sütununa bak.', 'Girişler farklıyken 1 veren kapı <b>ÖZEL VEYA (XOR)</b>dur. Soru işaretli kapıya tıklayarak XOR\'u seç.'],
        ['Lamba yalnızca iki anahtar birlikte açıkken sönüyor. Bu hangi kapının tam tersi?', 'Sağdaki DEĞİL sabit. Soldaki kapı <b>VE</b> olursa: VE\'nin tersi, yalnızca ikisi de 1 iken 0 verir.'],
        ['Cümledeki "ve" ile "ya da" kelimelerini bul. Hangi ikisi önce birleşiyor?', '"Kapı açık VE alarm kurulu" ilk kapıdır (VE). Bunun sonucu "ya da cam kırık" ikinci kapıdır (VEYA).'],
        ['Üç anahtarın kaç farklı durumu var? 2 × 2 × 2 = ?', '8 durum var. İkilik sayar gibi sırayla dene: 000, 001, 010, 011, 100, 101, 110, 111.'],
        ['"Yalnızca biri" ile "en az biri" arasındaki fark ne? Hangi durumda ayrılıyorlar?', 'XOR = (A VEYA B) VE DEĞİL(A VE B). Yani en az biri açık olacak, ama ikisi birden açık olmayacak.'],
        ['En az iki kişi "evet" demeli. Hangi ikililer olabilir?', 'Her ikili için bir VE kapısı (A VE B, A VE C, B VE C); sonuçları VEYA kapılarıyla birleştir.'],
        ['1 + 1 ikilikte kaçtır? Hangi durumda elde oluşur?', 'Elde = A VE B (ikisi de 1 ise). Toplam = A XOR B (yalnızca biri 1 ise).'],
        ['Üç biti toplarken toplam ne zaman 1 olur, elde ne zaman çıkar?', 'Önce A ile B\'yi yarım toplayıcıyla topla, sonra çıkan toplamı Eg ile topla. İki eldeden biri 1 ise son elde 1 olur (VEYA).']
    ];
    let ipucuKont = null;
    function ipucuKur() {
        if (ipucuKont) ipucuKont.kaldir();
        const t = IPUCLARI[no] || IPUCLARI[0];
        const cozumMetni = b.tur === 'sec'
            ? 'Soru işaretli kapılar:<br>' + b.dugumler.filter(d => d.tip === '?').map(d => {
                const ad = (x) => { const j = b.dugumler.findIndex(e => e.id === x); return j < 0 ? x : `${j + 1}. kapının çıkışı`; };
                return `• ${d.giris.map(ad).join(' ile ')} → <b>${b.cozum[d.id]}</b>`;
            }).join('<br>')
            : 'Bütün durumları tabloya yerleştirebilirim. Sonra her satırda lambanın neden yandığını ya da sönmediğini kendine açıkla.';
        ipucuKont = KL.ipucu({
            etkinlik: 'mantik', bolum: no, yer: $('ipucuYer'),
            basamaklar: [t[0], t[1], {
                metin: cozumMetni, uygulaYazi: b.tur === 'sec' ? 'Kapıları yerleştir' : 'Tabloyu doldur',
                bildiri: 'Çözüm yerleştirildi. Tablodaki her satırın neden böyle olduğunu incele.',
                uygula: () => {
                    if (b.tur === 'sec') Object.assign(secim, b.cozum);
                    else for (const k of M.kombinasyonlar(b.girisler.length)) bulunan[anahtar(k)] = M.hesapla(b, k, {}).cikis[0];
                    ciz();
                }
            }]
        });
    }
    function basla(i) {
        no = i; b = M.BOLUMLER[i];
        girisler = b.girisler.map(() => false);
        secim = {}; bulunan = {}; tiklama = 0; bitti = false;
        $('baslik').textContent = `${i + 1}. ${b.ad}`;
        $('anlatim').innerHTML = b.anlatim;
        $('ttBaslik').textContent = b.tur === 'yak' ? 'Keşfettiğin durumlar' : 'Doğruluk tablosu: hedef ve senin devren';
        goster('oyun');
        if (b.tur === 'yak') kesfet();
        ipucuKur();
        ciz();
    }

    // ---------- Devre çizimi ----------
    const SX = 150, SY = 46, KW = 86, KH = 46, GW = 58, GH = 40;
    function konumlar() {
        const sut = M.sutunlar(b);
        const enSag = Math.max(...Object.values(sut)) + 1;
        const p = {};
        b.girisler.forEach(g => { p[g.ad] = { x: 50, y: 34 + g.y * SY, w: GW }; });
        b.dugumler.forEach(d => { p[d.id] = { x: 50 + sut[d.id] * SX, y: 34 + d.y * SY, w: KW }; });
        b.cikislar.forEach((c, i) => { p['out' + i] = { x: 50 + enSag * SX - 30, y: p[c.kaynak].y, w: 40 }; });
        return { p, genislik: 50 + enSag * SX + 30, yukseklik: Math.max(...Object.values(p).map(q => q.y)) + 50 };
    }

    function telSinifi(deger) { return 'tel' + (deger === true ? ' bir' : deger === null ? ' belirsiz' : ''); }

    function ciz() {
        const { v, cikis } = M.hesapla(b, girisler, secim);
        const { p, genislik, yukseklik } = konumlar();
        let teller = '', ogeler = '';

        // Teller: kaynağın sağından hedef kapının giriş noktasına dik açılı yol
        const tel = (kaynak, hedefX, hedefY, kayma) => {
            const s = p[kaynak];
            const sx = s.x + s.w / 2, sy = s.y;
            const mx = hedefX - 22 - kayma;
            return `<path class="${telSinifi(v[kaynak])}" d="M${sx},${sy} H${mx} V${hedefY} H${hedefX}"/>`;
        };
        b.dugumler.forEach(d => {
            const q = p[d.id];
            d.giris.forEach((g, k) => {
                const py = d.giris.length === 1 ? q.y : q.y + (k === 0 ? -11 : 11);
                teller += tel(g, q.x - KW / 2, py, k * 10);
            });
        });
        b.cikislar.forEach((c, i) => { const q = p['out' + i]; teller += tel(c.kaynak, q.x - 18, q.y, 0); });

        // Anahtarlar
        b.girisler.forEach((g, i) => {
            const q = p[g.ad], acik = girisler[i];
            ogeler += `<g class="giris" data-i="${i}" role="button" aria-label="${g.ad} anahtarı ${acik ? 'açık' : 'kapalı'}" tabindex="0">
                <rect x="${q.x - GW / 2}" y="${q.y - GH / 2}" width="${GW}" height="${GH}" rx="20" fill="${acik ? '#f5b400' : 'var(--bg-alt)'}" stroke="${acik ? '#c48a00' : 'var(--line)'}"/>
                <circle cx="${acik ? q.x + 12 : q.x - 12}" cy="${q.y}" r="13" fill="#fff" stroke="var(--line)" style="transition:cx .2s"/>
                <text x="${acik ? q.x + 12 : q.x - 12}" y="${q.y + 5}" fill="${acik ? '#c48a00' : 'var(--muted)'}">${acik ? 1 : 0}</text>
                <text x="${q.x - GW / 2 - 16}" y="${q.y + 5}" fill="var(--ink)">${g.ad}</text></g>`;
        });

        // Kapılar
        b.dugumler.forEach(d => {
            const q = p[d.id];
            const tip = d.tip === '?' ? secim[d.id] : d.tip;
            const secilir = d.tip === '?';
            ogeler += `<g class="kapi ${secilir ? 'secilir' : ''}" data-id="${d.id}" ${secilir ? 'role="button" tabindex="0" aria-label="Kapı türünü değiştir"' : ''}>
                <rect x="${q.x - KW / 2}" y="${q.y - KH / 2}" width="${KW}" height="${KH}" rx="10"/>
                <text class="ad" x="${q.x}" y="${q.y + (tip ? 1 : 6)}">${tip || '?'}</text>
                ${tip ? `<text class="ing" x="${q.x}" y="${q.y + 14}">${M.KAPILAR[tip].ing}</text>` : ''}</g>`;
        });

        // Lambalar
        b.cikislar.forEach((c, i) => {
            const q = p['out' + i], yan = cikis[i] === true;
            ogeler += `<g class="lamba">
                ${yan ? `<circle cx="${q.x}" cy="${q.y}" r="26" fill="#ffd166" opacity=".35"/>` : ''}
                <circle class="cam" cx="${q.x}" cy="${q.y}" r="16" fill="${yan ? '#ffd166' : 'var(--bg-alt)'}" stroke="${yan ? '#c48a00' : 'var(--line)'}"/>
                <text x="${q.x}" y="${q.y + 34}">${c.ad}</text></g>`;
        });

        const svg = $('devre');
        svg.setAttribute('viewBox', `0 0 ${genislik} ${yukseklik}`);
        svg.style.width = Math.max(Math.min(genislik, $('devre').parentElement.clientWidth - 24), Math.min(genislik, 520)) + 'px';
        svg.innerHTML = teller + ogeler;
        tabloCiz();
    }

    // ---------- Doğruluk tablosu ----------
    const anahtar = (k) => k.map(Number).join('');

    function tabloCiz() {
        const kombs = M.kombinasyonlar(b.girisler.length);
        const simdiki = anahtar(girisler);
        const bas = b.girisler.map(g => `<th>${g.ad}</th>`).join('');
        let html, tamam = true;
        if (b.tur === 'yak') {
            html = `<tr>${bas}<th class="grp">${b.cikislar[0].ad}</th></tr>` + kombs.map(k => {
                const key = anahtar(k), bil = key in bulunan;
                return `<tr data-k="${key}" class="${key === simdiki ? 'aktif' : ''}">${k.map(x => `<td>${+x}</td>`).join('')}
                    <td class="grp ${bulunan[key] ? 'bir' : ''}">${bil ? +bulunan[key] : '?'}</td></tr>`;
            }).join('');
            const dolu = Object.keys(bulunan).length;
            tamam = dolu === kombs.length;
            durumYaz(tamam, `Doldurulan satır: <b>${dolu}</b> / ${kombs.length}`);
        } else {
            const ciks = b.cikislar;
            html = `<tr>${bas}${ciks.map((c, i) => `<th class="grp">Hedef ${c.ad}</th><th>Senin</th>`).join('')}<th></th></tr>` + kombs.map(k => {
                const h = b.hedef(k.map(Number)).map(Boolean);
                const s = M.hesapla(b, k, secim).cikis;
                const ok = h.every((x, i) => x === s[i]);
                if (!ok) tamam = false;
                return `<tr data-k="${anahtar(k)}" class="${anahtar(k) === simdiki ? 'aktif ' : ''}${ok ? 'ok' : 'bad'}">${k.map(x => `<td>${+x}</td>`).join('')}
                    ${h.map((x, i) => `<td class="grp ${x ? 'bir' : ''}">${+x}</td><td class="${s[i] ? 'bir' : ''}">${s[i] === null ? '?' : +s[i]}</td>`).join('')}
                    <td class="chk">${ok ? '✓' : '✗'}</td></tr>`;
            }).join('');
            const dogru = kombs.filter(k => { const h = b.hedef(k.map(Number)).map(Boolean); const s = M.hesapla(b, k, secim).cikis; return h.every((x, i) => x === s[i]); }).length;
            durumYaz(tamam, `Tutan satır: <b>${dogru}</b> / ${kombs.length}`);
        }
        $('tablo').innerHTML = html;
        if (tamam && !bitti) kazan();
    }

    function durumYaz(tamam, metin) {
        if (bitti) return;
        $('durum').className = 'card durum' + (tamam ? ' ok' : '');
        $('durum').innerHTML = metin;
    }

    function kesfet() {
        const { cikis } = M.hesapla(b, girisler, {});
        const key = anahtar(girisler);
        if (!(key in bulunan)) { bulunan[key] = cikis[0]; if (cikis[0]) KL.ses('dogru'); }
    }

    function kazan() {
        bitti = true;
        const kombs = M.kombinasyonlar(b.girisler.length).length;
        let enAz;
        if (b.tur === 'sec') enAz = b.dugumler.filter(d => d.tip === '?').reduce((t, d) => t + d.izin.indexOf(b.cozum[d.id]) + 1, 0);
        const y = Math.min(ipucuKont ? ipucuKont.yildizSiniri() : 3, b.tur === 'yak'
            ? (tiklama <= kombs ? 3 : tiklama <= kombs * 2 ? 2 : 1)
            : (tiklama <= enAz + 2 ? 3 : tiklama <= enAz * 2 + 4 ? 2 : 1));
        if (y > (kayit[no] || 0)) { kayit[no] = y; KL.yaz('mantik', kayit); }
        const son = no === M.BOLUMLER.length - 1;
        $('durum').className = 'card durum tebrik ok';
        $('durum').innerHTML = `<div style="font-size:1.6rem">${KL.yildizHTML(y)}</div>
            <b>${b.tur === 'yak' ? 'Doğruluk tablosunu tamamladın!' : 'Devre çalışıyor!'}</b>
            ${y < 3 ? `<p style="color:var(--muted);font-weight:400">${b.tur === 'sec' ? 'Daha az deneme yaparak' : 'Daha az anahtar değiştirerek'} 3 yıldız alabilirsin. Önce kafanda hesapla!</p>` : ''}
            <div class="actions"><button class="btn btn-sm" id="tekrar">Tekrar</button>${son ? '' : '<button class="btn btn-primary btn-sm" id="sonraki">Sonraki bölüm <i class="fas fa-arrow-right"></i></button>'}</div>`;
        $('tekrar').onclick = () => basla(no);
        if (!son) $('sonraki').onclick = () => basla(no + 1);
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
    }

    // ---------- Etkileşim ----------
    function girisDegistir(i) {
        if (bitti && b.tur === 'yak') return;
        girisler[i] = !girisler[i];
        if (b.tur === 'yak') { tiklama++; kesfet(); if (ipucuKont && tiklama > M.kombinasyonlar(b.girisler.length).length * 2 && tiklama % 3 === 0) ipucuKont.yanlis(); }
        KL.ses('tik');
        ciz();
    }
    function kapiDegistir(id) {
        if (bitti) return;
        const d = b.dugumler.find(x => x.id === id);
        const i = d.izin.indexOf(secim[id]);
        secim[id] = d.izin[(i + 1) % d.izin.length];
        tiklama++;
        if (ipucuKont && tiklama > 8 && tiklama % 4 === 0) ipucuKont.yanlis();
        KL.ses('tik');
        ciz();
    }
    $('devre').addEventListener('click', (e) => {
        const g = e.target.closest('.giris');
        if (g) return girisDegistir(+g.dataset.i);
        const k = e.target.closest('.kapi.secilir');
        if (k) kapiDegistir(k.dataset.id);
    });
    $('devre').addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Tablodaki bir satıra tıklayınca anahtarları o duruma getir
    $('tablo').addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-k]');
        // "Tabloyu doldur" bölümlerinde cevabı anahtarlarla bulmaları gerekir
        if (!tr || b.tur === 'yak') return;
        girisler = [...tr.dataset.k].map(c => c === '1');
        ciz();
    });
    $('geri').addEventListener('click', listeCiz);

    listeCiz();
})();
