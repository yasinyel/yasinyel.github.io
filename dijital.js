// Kodlayalım — Dijital Dedektif arayüzü
(function () {
    'use strict';
    const D = window.Dijital;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('dijital', { yildiz: {} });
    let bolum = null, hata = 0;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = D.BOLUMLER.map(b => `
            <button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif[0]}. – ${b.sinif[1]}. sınıf</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit.yildiz[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    $('geri').onclick = listeCiz;
    $('sListe').onclick = listeCiz;
    $('sTekrar').onclick = () => basla(bolum.id);

    function basla(id) {
        bolum = D.BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad;
        $('dots').innerHTML = '';
        goster('oyun');
        ({ haber, reklam, ayakizi, zorbalik, telif })[id]();
        history.replaceState(null, '', '#' + id);
    }
    function noktalar(n, i) { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); }
    function bitir(metin) {
        const y = D.yildiz(hata);
        if (y > (kayit.yildiz[bolum.id] || 0)) { kayit.yildiz[bolum.id] = y; KL.yaz('dijital', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Usta dedektif!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }
    const devamDugmesi = (son, f) => {
        $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px;width:100%">${son ? 'Bitir' : 'Sonraki'} <i class="fas fa-arrow-right"></i></button>`;
        $('devam').firstElementChild.onclick = f;
    };

    // Metni tıklanabilir parçalara çevirir: ipucu parçaları data-i taşır
    const parcaHTML = (m) => D.parcala(m || '').map(p => /^\s+$/.test(p.metin) ? p.metin.replace(/\n/g, '<br>')
        : `<span class="k"${p.id ? ` data-i="${p.id}"` : ''}>${kacis(p.metin).replace(/\n/g, '<br>')}</span>`).join('');

    // ---------- Karar + ipucu oyunu (Haber Dedektifi ve Reklamı Yakala) ----------
    function ipucuOyunu({ liste, kart, kararlar, supheliMi, metinler, dogruMetin, yanlisMetin, bitisMetni, araclar }) {
        let i = 0;
        const yeni = () => {
            const s = liste[i];
            noktalar(liste.length, i);
            const supheli = supheliMi(s);
            const tumIdler = supheli ? Object.keys(s.ipuclari) : [];
            const bulunan = new Set();
            let asama = 'karar', yanlisTik = 0;
            $('icerik').innerHTML = `<div class="dd"><div id="kutu">${kart(s)}</div>
                <div class="card panel"><p style="font-weight:700;font-size:1.05rem" id="adim">1. Sence bu ${kararlar.soru}</p>
                <div class="karar" id="karar">${kararlar.secenek.map(([k, ad, ik, renk]) => `<button class="btn" data-k="${k}"><i class="fas ${ik}" style="color:${renk}"></i> ${ad}</button>`).join('')}</div>
                <p class="fb" id="fb"></p><ul class="ipucu-listesi" id="ipuclari"></ul><div id="devam"></div></div></div>`;
            if (araclar) $('kutu').addEventListener('click', (e) => {
                const b = e.target.closest('[data-arac]'); if (!b) return;
                const alan = $('arac-' + b.dataset.arac);
                alan.hidden = false; b.disabled = true; KL.ses('tik');
            });
            const ipucuListesi = () => {
                $('ipuclari').innerHTML = tumIdler.map(id => bulunan.has(id) ? `<li><b>✓</b> ${s.ipuclari[id]}</li>` : '<li class="gizli">? Bulunmayı bekliyor</li>').join('');
                $('adim').textContent = `2. Şüpheli yerlere tıkla (${bulunan.size}/${tumIdler.length})`;
                if (bulunan.size === tumIdler.length) tamam();
            };
            const tamam = () => {
                asama = 'bitti';
                $('kutu').classList.remove('bulmaca');
                $('fb').className = 'fb ok';
                $('fb').innerHTML = bitisMetni(s);
                devamDugmesi(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir(); });
                KL.ses('dogru');
            };
            $('karar').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || asama !== 'karar') return;
                const dogru = (b.dataset.k === 'supheli') === supheli;
                $('karar').hidden = true;
                if (!dogru) { hata++; KL.ses('yanlis'); }
                if (!supheli) { if (!dogru) { $('fb').className = 'fb bad'; $('fb').textContent = yanlisMetin(s); } return tamam(); }
                asama = 'ipucu';
                $('kutu').classList.add('bulmaca');
                $('fb').className = dogru ? 'fb ok' : 'fb bad';
                $('fb').textContent = dogru ? dogruMetin(s) : yanlisMetin(s);
                if (dogru) KL.ses('dogru');
                ipucuListesi();
                $('devam').innerHTML = '<button class="btn btn-sm" style="margin-top:10px" id="goster"><i class="fas fa-lightbulb"></i> Kalanları göster</button>';
                $('goster').onclick = () => {
                    hata++;
                    tumIdler.forEach(id => { bulunan.add(id); document.querySelectorAll(`#kutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu')); });
                    document.querySelectorAll('#kutu .arac-sonuc').forEach(x => { x.hidden = false; });
                    ipucuListesi();
                };
            };
            $('kutu').addEventListener('click', (e) => {
                if (asama !== 'ipucu') return;
                const k = e.target.closest('.k'); if (!k) return;
                const id = k.dataset.i;
                if (id && s.ipuclari[id]) {
                    if (!bulunan.has(id)) { bulunan.add(id); KL.ses('tik'); }
                    document.querySelectorAll(`#kutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu'));
                    ipucuListesi();
                } else {
                    yanlisTik++;
                    k.classList.remove('bos'); void k.offsetWidth; k.classList.add('bos');
                    if (yanlisTik === 3) { $('fb').className = 'fb'; $('fb').textContent = araclar ? 'İpucu: başlığa, adrese, kaynağa ve abartılı cümlelere bak. Araç düğmelerini de kullanmayı unutma!' : 'İpucu: etiketlere, bağlantılara ve küçük yazılara bak.'; }
                }
            });
        };
        yeni();
    }

    // ---------- 1. Haber Dedektifi ----------
    function haberKart(h) {
        const gorsel = `<div class="gorsel">${h.gorsel.emoji}<small>${kacis(h.gorsel.yazi)}</small></div>`;
        const araclar = `<div class="araclar"><button class="btn btn-sm" data-arac="gorsel"><i class="fas fa-image"></i> Görseli tersine ara</button><button class="btn btn-sm" data-arac="kaynak"><i class="fas fa-magnifying-glass"></i> Başka kaynaklara bak</button></div>
            <div class="arac-sonuc" id="arac-gorsel" hidden><b>Görsel araması</b>${parcaHTML(h.arac.gorsel)}</div>
            <div class="arac-sonuc" id="arac-kaynak" hidden><b>Diğer kaynaklar</b>${parcaHTML(h.arac.kaynak)}</div>`;
        if (h.bicim === 'paylasim') return `<div class="haber"><div class="post-bas"><span class="avatar">👤</span><div><b>${kacis(h.kaynak)}</b><small>${kacis(h.tarih)}</small></div></div>
            <div class="ic"><div class="metin">${parcaHTML(h.metin)}</div>${gorsel}</div>${araclar}</div>`;
        return `<div class="haber"><div class="ubar"><i class="fas fa-globe" style="color:var(--muted)"></i><span class="adres">${parcaHTML(h.adres)}</span></div>
            <div class="ic"><div class="kaynak-ad">${kacis(h.kaynak)}</div><h3>${parcaHTML(h.baslik)}</h3><div class="tarih">${kacis(h.tarih)}</div>${gorsel}<div class="metin">${parcaHTML(h.metin)}</div></div>${araclar}</div>`;
    }
    function haber() {
        $('icerik').innerHTML = '';
        ipucuOyunu({
            liste: KL.karistir(D.HABERLER), kart: haberKart, araclar: true,
            kararlar: { soru: 'haber güvenilir mi?', secenek: [['guvenilir', 'Güvenilir', 'fa-circle-check', 'var(--ok)'], ['supheli', 'Şüpheli', 'fa-magnifying-glass', 'var(--bad)']] },
            supheliMi: (h) => h.tur === 'sahte',
            dogruMetin: () => 'Doğru, bu haberde bir sorun var! Şimdi ipuçlarını bul. Araç düğmelerini kullanmayı unutma.',
            yanlisMetin: (h) => h.tur === 'sahte' ? 'Dikkat! Bu haber güvenilir değil. Daha yakından bak ve ipuçlarını bul.' : 'Aslında bu haber güvenilir. Neden güvenilir olduğuna bak:',
            bitisMetni: (h) => h.tur === 'sahte' ? 'Bütün ipuçlarını buldun! Böyle bir haberi paylaşma; yanlış bilgi hızla yayılır.' : `Bu haber güvenilir görünüyor:<ul class="iyi-liste">${h.iyi.map(x => `<li>✓ ${x}</li>`).join('')}</ul>`
        });
    }

    // ---------- 2. Reklamı Yakala ----------
    function reklamKart(r) {
        return `<div class="haber">${r.ust ? `<div class="post-ust">${parcaHTML(r.ust)}</div>` : ''}<div class="post-bas"><span class="avatar">${r.avatar}</span><div><b>${kacis(r.hesap)}</b><small>Paylaşım</small></div></div>
            <div class="ic"><div class="metin" style="font-size:1.05rem">${parcaHTML(r.metin)}</div></div></div>`;
    }
    function reklam() {
        ipucuOyunu({
            liste: KL.karistir(D.REKLAMLAR), kart: reklamKart,
            kararlar: { soru: 'paylaşım bir reklam mı?', secenek: [['normal', 'Reklam değil', 'fa-user', 'var(--ok)'], ['supheli', 'Reklam', 'fa-bullhorn', '#f59e0b']] },
            supheliMi: (r) => r.tur === 'reklam',
            dogruMetin: () => 'Doğru, bu bir reklam! Şimdi bunu gösteren ipuçlarını bul.',
            yanlisMetin: (r) => r.tur === 'reklam' ? 'Aslında bu bir reklam! Nasıl anlaşıldığını bul.' : 'Aslında bu bir reklam değil.',
            bitisMetni: (r) => r.tur === 'reklam' ? 'Harika! Reklam olduğunu bilmek, bir ürünü gerçekten isteyip istemediğine kendin karar vermeni sağlar.' : kacis(r.aciklama)
        });
    }

    // ---------- 3. Dijital Ayak İzi ----------
    function ayakizi() {
        const liste = D.PROFILLER;
        let i = 0;
        const yeni = () => {
            const p = liste[i];
            noktalar(liste.length, i);
            const tum = Object.keys(p.ipuclari), bulunan = new Set(), yanlislar = new Set();
            $('icerik').innerHTML = `<div class="dd"><div class="profil bulmaca" id="kutu"><div class="kapak"></div><div class="kimlik"><span class="avatar">${p.avatar}</span><b style="padding-bottom:6px">${kacis(p.ad)}</b></div>
                <div class="bio">${parcaHTML(p.bio)}</div>${p.gonderiler.map(g => `<div class="gonderi">${parcaHTML(g)}</div>`).join('')}</div>
                <div class="card panel"><p style="font-weight:700;font-size:1.05rem" id="adim"></p><p style="color:var(--muted);font-size:.92rem">Bu profil herkese açık. Paylaşılmaması gereken kişisel bilgilere tıkla.</p>
                <p class="fb" id="fb"></p><ul class="ipucu-listesi" id="ipuclari"></ul><div id="devam"></div></div></div>`;
            const ciz = () => {
                $('adim').textContent = `Riskli bilgiler: ${bulunan.size}/${tum.length}`;
                $('ipuclari').innerHTML = tum.filter(id => bulunan.has(id)).map(id => `<li><b>✓</b> ${p.ipuclari[id]}</li>`).join('');
                if (bulunan.size === tum.length && !$('devam').innerHTML.includes('Sonraki') && !$('devam').innerHTML.includes('Bitir')) {
                    $('kutu').classList.remove('bulmaca');
                    $('fb').className = 'fb ok';
                    $('fb').textContent = 'Hepsini buldun! Paylaşmadan önce sor: "Bunu tanımadığım biri görse sorun olur mu?"';
                    KL.ses('dogru');
                    devamDugmesi(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir(); });
                }
            };
            $('devam').innerHTML = '<button class="btn btn-sm" style="margin-top:10px" id="goster"><i class="fas fa-lightbulb"></i> Kalanları göster</button>';
            $('goster').onclick = () => { hata++; $('devam').innerHTML = ''; tum.forEach(id => { bulunan.add(id); document.querySelectorAll(`#kutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu')); }); ciz(); };
            $('kutu').onclick = (e) => {
                if (!$('kutu').classList.contains('bulmaca')) return;
                const k = e.target.closest('.k'); if (!k) return;
                const id = k.dataset.i;
                if (id) {
                    if (!bulunan.has(id)) { bulunan.add(id); KL.ses('tik'); }
                    document.querySelectorAll(`#kutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu'));
                    ciz();
                } else {
                    k.classList.remove('bos'); void k.offsetWidth; k.classList.add('bos');
                    if (!yanlislar.has(k)) { yanlislar.add(k); if (yanlislar.size % 3 === 0) hata++; }
                    $('fb').className = 'fb'; $('fb').textContent = 'Bu bilgiyi paylaşmak genellikle sorun değil. Adres, telefon, şifre, okul, rutin ve belgeler gibi bilgilere bak.';
                }
            };
            ciz();
        };
        yeni();
    }

    // ---------- 4. Siber Zorbalık ----------
    function zorbalik() {
        const liste = KL.karistir(D.ZORBALIK);
        let i = 0;
        const yeni = () => {
            const z = liste[i];
            noktalar(liste.length, i);
            const secenekler = KL.karistir(z.secenekler);
            $('icerik').innerHTML = `<div class="sohbet"><div class="bas"><i class="fas fa-comments"></i> ${kacis(z.baslik)}</div>
                ${z.sohbet.map(([kim, m]) => `<div class="msj ${kim === 'Sen' ? 'ben' : ''}"><small>${kacis(kim)}</small>${kacis(m)}</div>`).join('')}</div>
                <div class="card panel durum-kart"><p class="soru">${kacis(z.soru)}</p><div class="secenekler" id="secenekler">${secenekler.map((s, j) => `<button data-j="${j}">${kacis(s[0])}</button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="devam"></div></div>`;
            let ilk = true;
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.disabled || $('devam').innerHTML) return;
                const [, puan, geri] = secenekler[+b.dataset.j];
                if (ilk) hata += 2 - puan;
                ilk = false;
                b.disabled = true;
                if (puan === 2) {
                    b.classList.add('dogru');
                    $('fb').className = 'fb ok'; $('fb').textContent = geri; KL.ses('dogru');
                    devamDugmesi(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir('Unutma: çevrim içi bir sorun yaşadığında yalnız değilsin. Kanıtı sakla, engelle, bildir ve güvendiğin bir yetişkine anlat.'); });
                } else {
                    b.classList.add(puan ? 'kismen' : 'yanlis');
                    $('fb').className = puan ? 'fb' : 'fb bad'; $('fb').textContent = geri + ' Daha iyi bir seçenek var, tekrar dene.';
                    KL.ses('yanlis');
                }
            };
        };
        yeni();
    }

    // ---------- 5. Telif ve Lisans ----------
    function telif() {
        const liste = KL.karistir(D.SENARYOLAR);
        let i = 0;
        const rozet = (l) => `<span class="rozet" style="background:${D.LISANSLAR[l].renk}">${kacis(l)}</span>`;
        const rehber = `<details class="card lisans-rehber"><summary><i class="fas fa-book"></i> Lisans rehberi</summary><div class="liste">${Object.keys(D.LISANSLAR).map(l => `<div>${rozet(l)}<br>${D.LISANSLAR[l].aciklama}</div>`).join('')}</div></details>`;
        const yeni = () => {
            const s = liste[i];
            noktalar(liste.length, i);
            // 5 kaynak: en az 2 kullanılabilir, en az 2 kullanılamaz
            let secim;
            do { secim = KL.karistir(D.KAYNAKLAR).slice(0, 5); }
            while (secim.filter(k => D.kullanilabilir(k.lisans, s)).length < 2 || secim.filter(k => !D.kullanilabilir(k.lisans, s)).length < 2);
            const secili = new Set();
            $('icerik').innerHTML = rehber + `<div class="card panel"><p class="senaryo">${s.metin}<br><small style="color:var(--muted)">Kullanabileceğin bütün kaynakları seç, sonra kontrol et.</small></p>
                <div class="kaynaklar" id="kaynaklar">${secim.map(k => `<button class="kaynak" data-id="${k.id}"><span class="em">${k.emoji}</span><b>${kacis(k.ad)}</b><small>${kacis(k.sahip)}</small>${rozet(k.lisans)}<span class="sec">○ Kullanmam</span><span class="neden" hidden></span></button>`).join('')}</div>
                <button class="btn btn-primary" id="kontrol" style="margin-top:14px"><i class="fas fa-clipboard-check"></i> Kontrol et</button>
                <p class="fb" id="fb"></p><div id="devam"></div></div>`;
            let bitti = false;
            $('kaynaklar').onclick = (e) => {
                const b = e.target.closest('.kaynak'); if (!b || bitti) return;
                const id = b.dataset.id;
                secili.has(id) ? secili.delete(id) : secili.add(id);
                b.classList.toggle('secili', secili.has(id));
                b.querySelector('.sec').textContent = secili.has(id) ? '✓ Kullanırım' : '○ Kullanmam';
                KL.ses('tik');
            };
            $('kontrol').onclick = () => {
                bitti = true; $('kontrol').hidden = true;
                let yanlis = 0;
                secim.forEach(k => {
                    const b = document.querySelector(`.kaynak[data-id="${k.id}"]`);
                    const dogru = D.kullanilabilir(k.lisans, s) === secili.has(k.id);
                    if (!dogru) yanlis++;
                    b.classList.add(dogru ? 'ok' : 'no');
                    const n = b.querySelector('.neden'); n.hidden = false;
                    n.innerHTML = (dogru ? '✓ ' : '✗ ') + kacis(D.nedeni(k.lisans, s)) + (D.kullanilabilir(k.lisans, s) && k.lisans !== 'CC0' ? `<br><i>Atıf: ${kacis(D.atif(k))}</i>` : '');
                });
                hata += yanlis;
                $('fb').className = yanlis ? 'fb bad' : 'fb ok';
                $('fb').textContent = yanlis ? `${yanlis} kaynakta yanıldın. Kırmızı kartların açıklamalarını oku.` : 'Hepsi doğru! Lisanslara uymak, emeğe saygı göstermektir.';
                KL.ses(yanlis ? 'yanlis' : 'dogru');
                devamDugmesi(i + 1 >= liste.length, () => { i++; i < liste.length ? yeni() : bitir(); });
            };
        };
        yeni();
    }

    const h = location.hash.slice(1);
    if (D.BOLUMLER.some(b => b.id === h)) basla(h); else listeCiz();
})();
