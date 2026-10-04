// Kodlayalım — Paket Yolculuğu arayüzü
(function () {
    'use strict';
    const A = window.Ag;
    const $ = (id) => document.getElementById(id);
    const kayit = KL.oku('ag', {});

    const BOLUMLER = [
        { id: 'paket', ad: 'Paketleri Birleştir', ikon: 'fa-boxes-stacked', renk: '#f97316', sinif: '4. – 12. sınıf', ozet: 'Karışık ve eksik gelen paketlerden mesajı kur.',
          anlatim: 'Mesajın küçük <b>paketlere</b> bölünüp yola çıktı. Her paket farklı yoldan gittiği için hedefe <b>karışık sırayla</b> geldiler. Her paketin başlığındaki <b>sıra numarasına</b> bakarak paketleri doğru sırayla seç. Bazen bir paket yolda kaybolur: o zaman eksik paketi tekrar iste!' },
        { id: 'yonlendir', ad: 'Yönlendirici Sensin', ikon: 'fa-route', renk: '#1d5fd6', sinif: '5. – 12. sınıf', ozet: 'Paketi ağ üzerinde en hızlı yoldan hedefe ulaştır.',
          anlatim: 'Yönlendiriciler (router) paketlere yol gösteren trafik polisleridir. Her durakta paketi hangi komşuya göndereceğine sen karar ver.' },
        { id: 'dns', ad: 'DNS Rehberi', ikon: 'fa-address-book', renk: '#16a36a', sinif: '6. – 12. sınıf', ozet: 'Bir site adını, bilgisayarların anladığı IP adresine çevir.',
          anlatim: 'Bilgisayarlar birbirini isimle değil <b>IP adresiyle</b> bulur. DNS, internetin telefon rehberidir. Ama tek bir rehber yoktur: önce <b>kök sunucuya</b>, sonra uzantının (.tr, .com) sunucusuna, en son da sitenin kendi sunucusuna sorulur.' },
        { id: 'ip', ad: 'IP Adresi Dedektifi', ikon: 'fa-network-wired', renk: '#8b5cf6', sinif: '6. – 12. sınıf', ozet: 'Hangi adres geçerli, hangisi sahte?',
          anlatim: 'IPv4 adresi noktalarla ayrılmış <b>4 sayıdan</b> oluşur. Her sayı 1 bayttır (8 bit), bu yüzden <b>0 ile 255</b> arasında olmalıdır. Örneğin 192.168.1.10 geçerli bir adrestir.' }
    ];
    let bolum = null, hata = 0, ipucuKont = null, cozumYardim = () => '';
    const IPUCLARI = {
        paket: ['Bir mesajın sırasını ne belirler: paketlerin geliş sırası mı, başlıklarındaki numara mı?', 'Önce <b>#1</b> numaralı paketi bul, sonra #2, #3… Aradığın numara gelen paketlerin hiçbirinde yoksa, o paket yolda kaybolmuştur: "Sıradaki paket gelmedi!" düğmesine bas.'],
        yonlendir: ['Daha az durak her zaman daha hızlı mıdır? Tellerin üstündeki sayılar neyi gösteriyor?', 'Her olası yolun gecikmelerini <b>topla</b> ve en küçük toplamı seç. Kablo koparsa, bulunduğun yerden yeniden hesapla.'],
        dns: ['Bir site adını sağdan sola okursan ilk ne görürsün? (.tr, .com, .org)', 'Sıra her zaman aynıdır: önce <b>kök sunucu</b>, sonra uzantının sunucusu (.tr / .com / .org), en son sitenin kendi ad sunucusu.'],
        ip: ['Noktalarla ayrılmış kaç parça olmalı? Her parça en fazla kaç olabilir?', 'Kontrol listesi: tam <b>4 parça</b> var mı? Hepsi rakamdan mı oluşuyor? Hepsi <b>0 ile 255</b> arasında mı? Üçüne de evet ise geçerlidir.']
    };
    function ipucuKur() {
        if (ipucuKont) ipucuKont.kaldir();
        const t = IPUCLARI[bolum.id];
        ipucuKont = KL.ipucu({ etkinlik: 'ag', bolum: bolum.id, yer: $('ipucuYer'), basamaklar: [t[0], t[1], { metin: () => cozumYardim() || 'Şu anki soruya göre çözüm burada görünecek.' }] });
    }
    const hataYap = () => { hata++; if (ipucuKont) ipucuKont.yanlis(); };
    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = BOLUMLER.map(b => `<button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif}</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    function basla(id) {
        bolum = BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad; $('anlatim').innerHTML = bolum.anlatim; $('dots').innerHTML = '';
        goster('oyun');
        cozumYardim = () => '';
        ipucuKur();
        ({ paket, yonlendir, dns, ip })[id]();
    }
    const noktalar = (n, i) => { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); };
    function bitir(y, metin) {
        y = Math.min(y ?? (hata === 0 ? 3 : hata <= 2 ? 2 : 1), ipucuKont ? ipucuKont.yildizSiniri() : 3);
        if (y > (kayit[bolum.id] || 0)) { kayit[bolum.id] = y; KL.yaz('ag', kayit); }
        $('sBaslik').textContent = y === 3 ? 'İnternet ustası!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    // ---------- 1. Paketler ----------
    function paket() {
        const TUR = 3;
        let tur = 0;
        const yeni = () => {
            noktalar(TUR, tur);
            const q = A.paketSorusu(tur > 0);
            let beklenen = 1;
            const n = q.paketler.length;
            cozumYardim = () => beklenen > n ? 'Bu mesaj tamam!' : q.kayip === beklenen
                ? `Sıradaki paket <b>#${beklenen}</b>. Gelen paketlere bak: #${beklenen} hiçbirinde yok. Yani kaybolmuş, "Sıradaki paket gelmedi!" düğmesine basmalısın.`
                : `Sıradaki paket <b>#${beklenen}</b>: başlığında "Sıra: ${beklenen}/${n}" yazan paketi seç. Onun verisi: "${q.paketler[beklenen - 1].veri}".`;
            $('icerik').innerHTML = `<div class="card panel">
                <p style="font-weight:700;margin-bottom:8px">Alınan mesaj</p><div class="yuvalar" id="yuvalar">${q.paketler.map(p => `<div class="yuva" data-s="${p.sira}">#${p.sira}</div>`).join('')}</div>
                <p style="font-weight:700;margin-bottom:8px">Gelen paketler <small style="color:var(--muted);font-weight:500">— sıradaki paketi seç</small></p>
                <div class="paketler" id="paketler">${q.gelen.map(p => `<button class="paket" data-s="${p.sira}"><div class="ust">Sıra: <b>${p.sira}/${p.toplam}</b><br>Kaynak: ${p.kaynak}<br>Hedef: ${p.hedef}</div><div class="veri">${p.veri.replace(/ /g, '␣')}</div></button>`).join('')}</div>
                <div id="eksikAlan" style="margin-top:14px"><button class="btn" id="eksik"><i class="fas fa-triangle-exclamation"></i> Sıradaki paket gelmedi!</button></div>
                <p class="fb" id="fb"></p><div id="sonucAlan"></div></div>`;
            const yerlestir = (p) => {
                const y = document.querySelector(`.yuva[data-s="${p.sira}"]`);
                y.classList.add('dolu'); y.textContent = p.veri;
                beklenen++;
                if (beklenen > n) {
                    KL.ses('dogru');
                    $('eksikAlan').innerHTML = '';
                    $('sonucAlan').innerHTML = `<div class="mesaj-sonuc">${q.mesaj}</div>`;
                    $('fb').className = 'fb ok'; $('fb').textContent = 'Mesaj tamamlandı!';
                    tur++; setTimeout(() => (tur < TUR ? yeni() : bitir(null, 'TCP denen kurallar bilgisayarlarda tam olarak bunu yapar: paketleri sıraya dizer, eksikleri tekrar ister.')), 1800);
                }
            };
            $('paketler').onclick = (e) => {
                const b = e.target.closest('.paket'); if (!b) return;
                const s = +b.dataset.s;
                if (s !== beklenen) {
                    hataYap(); KL.ses('yanlis');
                    b.classList.remove('hata'); b.offsetWidth; b.classList.add('hata');
                    $('fb').className = 'fb bad'; $('fb').textContent = `Sıradaki paket #${beklenen} olmalı. Paket başlıklarındaki sıra numarasına bak.`;
                    return;
                }
                KL.ses('tik'); b.classList.add('kullanildi'); $('fb').textContent = '';
                yerlestir(q.paketler[s - 1]);
            };
            $('eksik').onclick = () => {
                if (q.kayip !== beklenen) {
                    hataYap(); KL.ses('yanlis');
                    $('fb').className = 'fb bad'; $('fb').textContent = `#${beklenen} numaralı paket gelen paketlerin arasında var, dikkatli bak!`;
                    return;
                }
                KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = `Doğru! #${q.kayip} numaralı paket kaybolmuştu. Göndericiden tekrar istendi ve geldi.`;
                yerlestir(q.paketler[q.kayip - 1]);
            };
        };
        yeni();
    }

    // ---------- 2. Yönlendirme ----------
    function yonlendir() {
        const yildizlar = KL.oku('ag.yonlendir', {});
        let agNo = 0;
        const sec = () => {
            noktalar(A.AGLAR.length, agNo);
            const ag = A.AGLAR[agNo];
            let simdi = 'K', yol = ['K'], sure = 0, kopuk = null, ttl = ag.ttl || 12, hareket = false;
            cozumYardim = () => {
                if (simdi === 'H') return 'Paket hedefte. "Tekrar dene" ile en hızlı yolu bulmaya çalış.';
                const e = A.enKisaYol(ag, simdi, kopuk);
                if (!e.yol) return 'Buradan hedefe yol kalmadı; paketi yeniden gönder.';
                return `Bulunduğun yerden en hızlı yol: <b>${e.yol.map(d => d === 'K' ? 'Sen' : d === 'H' ? 'Hedef' : d).join(' → ')}</b> (toplam ${e.sure} ms). Gecikmeleri tek tek toplayarak kontrol et.`;
            };
            $('icerik').innerHTML = `<div class="iki">
                <div class="card panel"><div class="ag-sec" id="agSec" style="margin-bottom:10px">${A.AGLAR.map((a, i) => `<button class="${i === agNo ? 'sel' : ''} ${yildizlar[i] ? 'bitti' : ''}" data-i="${i}">${i + 1}. ${a.ad}</button>`).join('')}</div>
                    <svg class="ag" id="ag" viewBox="-4 4 108 92" role="img" aria-label="Ağ haritası"></svg></div>
                <div class="card panel"><p style="color:var(--muted);margin-bottom:10px">${ag.anlatim}</p>
                    <div class="baslik-kutu">PAKET BAŞLIĞI<br>Kaynak IP: 198.51.100.7<br>Hedef IP: <b>203.0.113.20</b><br>TTL: <b id="ttl">${ttl}</b></div>
                    <div class="olcu"><div><b id="sure">0 ms</b><span>Toplam gecikme</span></div><div><b id="durak">0</b><span>Durak</span></div></div>
                    <p class="fb" id="fb">Parlayan komşulardan birine tıkla.</p><div id="sonucAlan"></div></div></div>`;
            $('agSec').onclick = (e) => { const b = e.target.closest('button'); if (b && !hareket) { agNo = +b.dataset.i; sec(); } };
            const ciz = () => {
                const D = ag.dugumler;
                const komsu = A.komsular(ag, simdi, kopuk).map(k => k.d);
                const yolKenar = (a, b) => yol.some((d, i) => i > 0 && ((yol[i - 1] === a && d === b) || (yol[i - 1] === b && d === a)));
                let h = '';
                for (const [a, b, w] of ag.kenarlar) {
                    const [x1, y1] = D[a], [x2, y2] = D[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                    const kp = A.kopukMu([a, b], kopuk);
                    h += `<line class="kenar ${yolKenar(a, b) ? 'yol' : ''} ${kp ? 'kopuk' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
                    h += `<rect class="etiket-arka" x="${mx - 4.5}" y="${my - 2.4}" width="9" height="4.6" rx="1"/><text class="etiket" x="${mx}" y="${my + 1.1}">${kp ? '✕' : w}</text>`;
                }
                for (const [d, [x, y]] of Object.entries(D)) {
                    const sinif = d === simdi ? 'simdi' : d === 'H' ? 'uc' : komsu.includes(d) && simdi !== 'H' ? 'secilir' : '';
                    const ad = d === 'K' ? 'Sen' : d === 'H' ? 'Hedef' : d;
                    h += `<g class="dugum ${sinif} ${komsu.includes(d) && simdi !== 'H' ? 'secilir' : ''}" data-d="${d}"><circle cx="${x}" cy="${y}" r="${d === 'K' || d === 'H' ? 6 : 4.6}"/><text x="${x}" y="${y}">${ad}</text></g>`;
                }
                h += `<circle id="paketNokta" cx="${D[simdi][0]}" cy="${D[simdi][1] - 7.5}" r="2" fill="#f5b400" stroke="#fff" stroke-width=".5"/>`;
                $('ag').innerHTML = h;
                $('sure').textContent = sure + ' ms'; $('durak').textContent = yol.length - 1; $('ttl').textContent = ttl;
            };
            $('ag').onclick = (e) => {
                const g = e.target.closest('.dugum.secilir'); if (!g || hareket || simdi === 'H') return;
                const hedef = g.dataset.d;
                const k = A.komsular(ag, simdi, kopuk).find(x => x.d === hedef);
                hareket = true;
                // Paketi kablo boyunca canlandır
                const [x1, y1] = ag.dugumler[simdi], [x2, y2] = ag.dugumler[hedef], t0 = performance.now(), T = 250 + k.w * 8;
                const nokta = $('paketNokta');
                const kare = (t) => {
                    const o = Math.min(1, (t - t0) / T);
                    nokta.setAttribute('cx', x1 + (x2 - x1) * o); nokta.setAttribute('cy', y1 + (y2 - y1) * o);
                    if (o < 1) return requestAnimationFrame(kare);
                    hareket = false;
                    simdi = hedef; yol.push(hedef); sure += k.w; ttl--;
                    KL.ses('tik');
                    if (ag.kopma && simdi === ag.kopma[0] && !kopuk) {
                        kopuk = ag.kopma; ciz(); KL.ses('yanlis');
                        $('fb').className = 'fb bad'; $('fb').textContent = `Eyvah! ${ag.kopma[0]}–${ag.kopma[1]} kablosu koptu! Başka bir yol bul.`;
                        return;
                    }
                    ciz();
                    if (simdi === 'H') return vardi();
                    if (ttl <= 0) {
                        KL.ses('yanlis'); hataYap();
                        $('fb').className = 'fb bad'; $('fb').textContent = 'TTL sıfırlandı: paket çok fazla dolaştığı için bir yönlendirici onu çöpe attı! Bu, sonsuza kadar dolaşan paketleri önler.';
                        $('sonucAlan').innerHTML = '<button class="btn btn-primary" id="yeniden" style="width:100%;margin-top:8px">Paketi yeniden gönder</button>';
                        $('yeniden').onclick = sec;
                        simdi = 'H'; ciz();
                        return;
                    }
                    $('fb').className = 'fb'; $('fb').textContent = `${hedef} yönlendiricisindesin. Sıradaki durağı seç.`;
                };
                requestAnimationFrame(kare);
            };
            const vardi = () => {
                // En iyi süre: bağlantı koptuysa, kopma noktasına kadar en iyi + oradan kopuk ağdaki en iyi
                let enIyi = A.enKisaYol(ag).sure;
                if (kopuk) enIyi = A.enKisaYol(ag, 'K', null, ag.kopma[0]).sure + A.enKisaYol(ag, ag.kopma[0], ag.kopma).sure;
                const y = Math.min(sure <= enIyi ? 3 : sure <= enIyi * 1.3 ? 2 : 1, ipucuKont ? ipucuKont.yildizSiniri() : 3);
                if (y < 3 && ipucuKont) ipucuKont.yanlis();
                yildizlar[agNo] = Math.max(yildizlar[agNo] || 0, y);
                KL.yaz('ag.yonlendir', yildizlar);
                KL.ses(y === 3 ? 'dogru' : 'kazan');
                $('fb').className = 'fb ' + (y === 3 ? 'ok' : '');
                $('fb').innerHTML = y === 3 ? `Paket ${sure} ms'de ulaştı. Bu en hızlı yol!` : `Paket ${sure} ms'de ulaştı. En hızlı yol ${enIyi} ms sürerdi.`;
                const son = agNo === A.AGLAR.length - 1;
                $('sonucAlan').innerHTML = `<div style="margin:8px 0">${KL.yildizHTML(y)}</div><div style="display:flex;gap:8px"><button class="btn" id="tekrarAg">Tekrar dene</button>${son ? '<button class="btn btn-primary" id="bitirAg">Bitir</button>' : '<button class="btn btn-primary" id="sonrakiAg">Sonraki ağ <i class="fas fa-arrow-right"></i></button>'}</div>`;
                $('tekrarAg').onclick = sec;
                if (son) $('bitirAg').onclick = () => {
                    const toplam = A.AGLAR.map((_, i) => yildizlar[i] || 0);
                    bitir(Math.min(...toplam) || 1, `Dört ağda ${toplam.reduce((a, b) => a + b, 0)} yıldız topladın. Gerçek yönlendiriciler en hızlı yolu saniyede milyonlarca kez, Dijkstra gibi algoritmalarla hesaplar.`);
                };
                else $('sonrakiAg').onclick = () => { agNo++; sec(); };
            };
            ciz();
        };
        sec();
    }

    // ---------- 3. DNS ----------
    function dns() {
        const TUR = 3;
        let tur = 0;
        const yeni = () => {
            noktalar(TUR, tur);
            const q = A.dnsSorusu();
            let adim = 0;
            cozumYardim = () => {
                if (adim >= 3) return 'Adres bulundu!';
                const ad = ['Kök sunucu her sorguya en tepeden başlar', `".${q.alan.split('.').pop()}" uzantısını bu sunucu bilir`, 'Sitenin kendi ad sunucusu IP adresini verir'][adim];
                return `Şimdi sorman gereken: <b>${q.adimlar[adim].sunucu}</b>. ${ad}.`;
            };
            const sunucular = KL.karistir([...q.adimlar.map(a => a.sunucu), ...KL.karistir(q.yanlis).slice(0, 3)]);
            $('icerik').innerHTML = `<div class="iki"><div class="card panel">
                <div class="tarayici"><div class="adres"><i class="fas fa-magnifying-glass"></i> ${q.alan}</div><div class="sayfa" id="sayfa">Bilgisayarın bu sitenin IP adresini bilmiyor. Kime sormalı?</div></div>
                <p style="font-weight:700;margin:14px 0 8px">Sunucular <small style="color:var(--muted);font-weight:500">— sırayla doğru sunucuya sor</small></p>
                <div class="dns" id="sunucular">${sunucular.map(s => `<button class="sunucu" data-s="${s}"><i class="fas fa-server"></i>${s}</button>`).join('')}</div></div>
                <div class="card panel"><p style="font-weight:700">Konuşma</p><div class="konusma" id="konusma"></div><p class="fb" id="fb"></p></div></div>`;
            $('sunucular').onclick = (e) => {
                const b = e.target.closest('.sunucu'); if (!b || adim >= 3) return;
                const s = b.dataset.s, beklenen = q.adimlar[adim].sunucu;
                if (s !== beklenen) {
                    hataYap(); KL.ses('yanlis');
                    b.classList.remove('hata'); b.offsetWidth; b.classList.add('hata');
                    $('fb').className = 'fb bad';
                    $('fb').textContent = adim === 0 ? 'Her DNS sorgusu en tepeden, kök sunucudan başlar.' : 'Son cevabı tekrar oku: kimi sorman söylendi?';
                    return;
                }
                KL.ses('tik'); b.classList.add('soruldu'); $('fb').textContent = '';
                const k = $('konusma');
                k.insertAdjacentHTML('beforeend', `<div class="ben">${s}, "${q.alan}" nerede?</div>`);
                const cevap = q.adimlar[adim].cevap || `"${q.alan}" adresinin IP'si: <b>${q.ip}</b>`;
                k.insertAdjacentHTML('beforeend', `<div class="o"><b>${s}:</b> ${cevap}</div>`);
                adim++;
                if (adim === 3) {
                    KL.ses('dogru');
                    $('sayfa').innerHTML = `<div style="font-family:var(--mono);color:var(--accent);margin-bottom:6px">→ ${q.ip}</div><i class="fas fa-circle-check" style="color:var(--ok);font-size:2rem"></i><p style="margin-top:6px">Sayfa açıldı! Tarayıcın bu adresi bir süre hatırlayacak (önbellek), bir dahakine sormasına gerek kalmayacak.</p>`;
                    tur++; setTimeout(() => (tur < TUR ? yeni() : bitir(null, 'Bir site adresi yazdığında bütün bu sorular saniyenin binde birkaçı içinde sorulur. DNS olmasaydı her sitenin IP adresini ezberlememiz gerekirdi!')), 2600);
                }
            };
        };
        yeni();
    }

    // ---------- 4. IP ----------
    function ip() {
        const TUR = 10;
        let tur = 0;
        const yeni = () => {
            noktalar(TUR, tur);
            const q = A.ipSorusu();
            cozumYardim = () => {
                const p = q.ip.split('.');
                const sat = p.map(x => `<code>${x}</code> ${/^\d+$/.test(x) && +x <= 255 ? '✓' : '✗'}`).join(' · ');
                return `Parça sayısı: <b>${p.length}</b> ${p.length === 4 ? '✓' : '✗'}<br>${sat}<br>${q.gecerli ? 'Hepsi tamam: <b>geçerli</b>.' : 'Bir kural bozuluyor: <b>geçersiz</b>.'}`;
            };
            $('icerik').innerHTML = `<div class="card panel ip-kart"><p style="color:var(--muted)">Bu IP adresi geçerli mi?</p><div class="ip">${q.ip}</div>
                <div class="karar" id="karar"><button class="btn" data-k="1"><i class="fas fa-check" style="color:var(--ok)"></i> Geçerli</button><button class="btn" data-k="0"><i class="fas fa-xmark" style="color:var(--bad)"></i> Geçersiz</button></div><p class="fb" id="fb"></p></div>`;
            $('karar').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || $('karar').dataset.bitti) return;
                $('karar').dataset.bitti = '1';
                const dogru = (b.dataset.k === '1') === q.gecerli;
                if (!dogru) hataYap();
                KL.ses(dogru ? 'dogru' : 'yanlis');
                $('fb').className = 'fb ' + (dogru ? 'ok' : 'bad');
                $('fb').textContent = (dogru ? 'Doğru! ' : 'Olmadı. ') + q.neden;
                tur++; setTimeout(() => (tur < TUR ? yeni() : bitir()), 2200);
            };
        };
        yeni();
    }

    $('geri').onclick = listeCiz; $('sListe').onclick = listeCiz; $('sTekrar').onclick = () => basla(bolum.id);
    const q = new URLSearchParams(location.search).get('b');
    if (BOLUMLER.some(b => b.id === q)) basla(q); else listeCiz();
})();
