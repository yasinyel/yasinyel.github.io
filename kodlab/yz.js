// KodLab — Makineye Öğret arayüzü
(function () {
    'use strict';
    const Y = window.YZ;
    const $ = (id) => document.getElementById(id);
    const kayit = KL.oku('yz', {});
    const tohum = () => Math.floor(Math.random() * 1e9) + 1;
    const yuzde = (x) => '%' + Math.round(x * 100);

    const BOLUMLER = [
        { id: 'okyanus', ad: 'Okyanusu Temizle', ikon: 'fa-fish', renk: '#0ea5e9', sinif: '3. – 12. sınıf', ozet: 'Modele balığı ve çöpü ayırt etmeyi öğret, sonra okyanusu temizlesin.',
          anlatim: 'Yapay zekâ önce <b>eğitim verisinden</b> öğrenir. Sana gösterilen her nesnenin balık mı çöp mü olduğunu söyle. Yeterince örnek gösterince model, hiç görmediği nesneleri kendisi sınıflandıracak.' },
        { id: 'onyargi', ad: 'Önyargılı Veri', ikon: 'fa-scale-unbalanced', renk: '#e5484d', sinif: '5. – 12. sınıf', ozet: 'Model neden kediye köpek dedi? Veriyi düzelt, modeli düzelt.',
          anlatim: 'Bu model kedi ve köpek fotoğraflarıyla eğitildi. Ama fotoğrafları çeken kişi bütün köpekleri <b>bahçede</b>, bütün kedileri <b>evin içinde</b> çekmiş. Bakalım model ne öğrenmiş?' },
        { id: 'kural', ad: 'Kendi Kuralını Öğret', ikon: 'fa-wand-magic-sparkles', renk: '#8b5cf6', sinif: '3. – 12. sınıf', ozet: 'Uzaylılar için kendi kuralını uydur, modelin bulup bulamayacağını gör.',
          anlatim: 'Aklından gizli bir kural tut (ör. "boynuzu olanlar dost", "gülümseyenler sevimli"). Kuralını kimseye söyleme; sadece uzaylıları etiketle. Model senin kuralını yalnızca örneklerden çıkarmaya çalışacak.' },
        { id: 'knn', ad: 'k ve Aşırı Öğrenme', ikon: 'fa-circle-nodes', renk: '#0891b2', sinif: '9. – 12. sınıf', ozet: 'k-en yakın komşu algoritmasının karar sınırını gör, ezberlemeyi (overfitting) keşfet.',
          anlatim: 'Bu modelin adı <b>k-en yakın komşu</b>: yeni bir noktaya, ona en yakın <b>k</b> eğitim noktasının çoğunluğu hangi renkse o rengi verir. Arka plan rengi modelin her bölge için kararını gösterir. Bazı eğitim noktaları ölçüm hatası yüzünden yanlış renkte!' }
    ];
    let bolum = null, hata = 0;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = BOLUMLER.map(b => `<button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif}</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    function basla(id) {
        bolum = BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad; $('anlatim').innerHTML = bolum.anlatim;
        goster('oyun');
        ({ okyanus, onyargi, kural, knn })[id]();
    }
    function bitir(y, metin) {
        if (y > (kayit[bolum.id] || 0)) { kayit[bolum.id] = y; KL.yaz('yz', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Harika bir eğitmensin!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin;
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }
    function soruSor(el, soru, secenekler, dogru, aciklama, bitince) {
        el.innerHTML = `<p style="font-weight:700">${soru}</p><div class="secenekler">${secenekler.map((s, i) => `<button data-i="${i}">${s}</button>`).join('')}</div><p class="fb"></p>`;
        let ilk = true;
        el.querySelector('.secenekler').onclick = (e) => {
            const b = e.target.closest('button'); if (!b || b.classList.contains('yanlis') || el.dataset.bitti) return;
            const fb = el.querySelector('.fb');
            if (+b.dataset.i !== dogru) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); KL.ses('yanlis'); fb.className = 'fb bad'; fb.textContent = 'Tekrar düşün.'; return; }
            el.dataset.bitti = '1'; b.classList.add('dogru'); KL.ses('dogru'); fb.className = 'fb ok'; fb.textContent = aciklama;
            if (bitince) setTimeout(bitince, 400);
        };
    }

    // ---------- Çizimler ----------
    function nesneSVG(n) {
        const s = 0.6 + n.boyut * 0.4, c = `hsl(${n.ton},70%,55%)`, k = `hsl(${n.ton},70%,38%)`;
        let ic;
        if (n.tur === 'balik') {
            const rx = 34, ry = 34 * n.oran;
            ic = `<path d="M${-rx + 4},0 L${-rx - 22},${-ry * 0.9} L${-rx - 22},${ry * 0.9} Z" fill="${k}"/>
                <ellipse rx="${rx}" ry="${ry}" fill="${c}"/>
                ${n.cizgili ? `<path d="M-10,${-ry * .9} V${ry * .9} M5,${-ry * .95} V${ry * .95}" stroke="${k}" stroke-width="4" opacity=".7"/>` : ''}
                ${n.yuzgec ? `<path d="M-6,${-ry + 2} L6,${-ry - 14} L14,${-ry + 4} Z" fill="${k}"/>` : ''}
                <circle cx="${rx * .55}" cy="${-ry * .25}" r="5" fill="#fff"/><circle cx="${rx * .6}" cy="${-ry * .25}" r="2.6" fill="#111"/>`;
        } else if (n.cesit === 0) {
            ic = `<rect x="-14" y="-30" width="28" height="58" rx="8" fill="hsla(${n.ton},50%,70%,.75)" stroke="hsl(${n.ton},40%,40%)" stroke-width="2"/><rect x="-6" y="-42" width="12" height="14" rx="3" fill="hsl(${n.ton},40%,45%)"/>${n.cizgili ? '<rect x="-14" y="-6" width="28" height="12" fill="#fff" opacity=".8"/>' : ''}`;
        } else if (n.cesit === 1) {
            ic = `<rect x="-20" y="-26" width="40" height="52" rx="5" fill="${c}" stroke="${k}" stroke-width="2"/><rect x="-20" y="-8" width="40" height="8" fill="#fff" opacity=".8"/><ellipse cy="-26" rx="20" ry="5" fill="#cbd5e1"/>`;
        } else if (n.cesit === 2) {
            ic = `<path d="M-28,-10 Q-20,-34 -8,-22 Q0,-38 10,-22 Q24,-34 28,-8 Q34,20 18,28 Q0,36 -18,28 Q-36,18 -28,-10Z" fill="hsla(${n.ton},40%,85%,.85)" stroke="hsl(${n.ton},20%,55%)" stroke-width="2"/>`;
        } else {
            ic = `<circle r="26" fill="none" stroke="#334155" stroke-width="14"/><circle r="26" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4 5"/>`;
        }
        return `<svg viewBox="-60 -60 120 120" aria-hidden="true"><g transform="scale(${s})">${ic}</g></svg>`;
    }
    function hayvanSVG(n) {
        const tuy = `hsl(${25 + n.renk * 20},${30 + n.renk * 30}%,${35 + n.renk * 30}%)`;
        const arka = n.disari
            ? '<rect width="120" height="80" fill="#93c5fd"/><circle cx="100" cy="18" r="9" fill="#fde047"/><rect y="80" width="120" height="40" fill="#4ade80"/><path d="M0,80 Q30,74 60,80 T120,80" fill="#22c55e"/>'
            : '<rect width="120" height="84" fill="#fde68a"/><rect x="10" y="14" width="30" height="26" fill="#bae6fd" stroke="#a16207" stroke-width="2"/><rect y="84" width="120" height="36" fill="#b45309"/><path d="M0,90 H120 M0,102 H120" stroke="#92400e" stroke-width="1"/>';
        // Kulak: sivri üçgen (kedi) ↔ sarkık oval (köpek)
        const sivri = n.kulak;
        const kulak = (y) => sivri > 0.5
            ? `<path d="M${60 + y * 14},40 L${60 + y * (20 + sivri * 6)},${18 - sivri * 10} L${60 + y * 30},44 Z" fill="${tuy}" stroke="#00000033"/>`
            : `<ellipse cx="${60 + y * 27}" cy="${56}" rx="7" ry="${14 + (0.5 - sivri) * 12}" fill="${tuy}" stroke="#00000044" transform="rotate(${y * 15} ${60 + y * 27} 56)"/>`;
        const burun = 6 + n.burun * 12;
        return `<svg viewBox="0 0 120 120" aria-hidden="true">${arka}
            ${kulak(-1)}${kulak(1)}<circle cx="60" cy="62" r="24" fill="${tuy}" stroke="#00000033"/>
            <ellipse cx="60" cy="${72 + n.burun * 4}" rx="${burun}" ry="${6 + n.burun * 4}" fill="#fef3c7" opacity=".9"/>
            <circle cx="51" cy="58" r="3" fill="#111"/><circle cx="69" cy="58" r="3" fill="#111"/><ellipse cx="60" cy="${68 + n.burun * 3}" rx="3.5" ry="2.5" fill="#111"/>
            ${n.biyik ? '<path d="M48,72 L32,68 M48,75 L32,77 M72,72 L88,68 M72,75 L88,77" stroke="#111" stroke-width="1.2"/>' : ''}</svg>`;
    }
    function uzayliSVG(n) {
        const c = `hsl(${Y.UZAYLI_RENK[n.renk]},65%,55%)`, s = n.boyut ? 1 : 0.78;
        const gozler = Array.from({ length: n.goz }, (_, i) => { const x = (i - (n.goz - 1) / 2) * 16; return `<circle cx="${x}" cy="-8" r="7" fill="#fff"/><circle cx="${x}" cy="-7" r="3.4" fill="#111"/>`; }).join('');
        return `<svg viewBox="-60 -60 120 120" aria-hidden="true"><g transform="scale(${s})">
            ${n.boynuz ? `<path d="M-18,-30 L-26,-52 L-8,-34 Z M18,-30 L26,-52 L8,-34 Z" fill="hsl(${Y.UZAYLI_RENK[n.renk]},50%,35%)"/>` : ''}
            <path d="M-34,10 Q-38,-40 0,-40 Q38,-40 34,10 Q30,40 0,40 Q-30,40 -34,10Z" fill="${c}"/>
            ${n.benek ? '<circle cx="-20" cy="18" r="4" fill="#00000030"/><circle cx="18" cy="24" r="5" fill="#00000030"/><circle cx="22" cy="-22" r="3" fill="#00000030"/>' : ''}
            ${gozler}
            ${n.agiz ? '<path d="M-14,14 Q0,28 14,14" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>' : '<path d="M-14,22 Q0,10 14,22" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>'}
            </g></svg>`;
    }

    // ---------- 1. Okyanusu temizle ----------
    function okyanus() {
        const t = tohum();
        const akis = Y.okyanus(t, 60), deneme = Y.okyanus(t + 1, 40);
        const egitim = [];
        let i = 0;
        $('icerik').innerHTML = `<div class="iki">
            <div class="card panel"><h3 style="font-size:1.05rem;margin-bottom:10px">1. Modeli eğit</h3>
                <div class="buyuk" id="nesne"></div>
                <div class="etiketle"><button class="btn" data-e="balik">🐟 Balık</button><button class="btn" data-e="cop">🗑️ Çöp</button></div>
                <div class="sayac">Örnek: <b id="say">0</b> <span>🐟 <b id="sb">0</b></span> <span>🗑️ <b id="sc">0</b></span></div>
                <button class="btn btn-primary" id="calistir" style="width:100%;margin-top:14px" disabled><i class="fas fa-robot"></i> Modeli okyanusta çalıştır</button>
                <p style="color:var(--muted);font-size:.85rem;margin-top:8px">En az 6 örnek göster (her türden en az 1). Az örnekle de deneyebilir, sonra daha fazla eğitebilirsin.</p></div>
            <div class="card panel"><h3 style="font-size:1.05rem;margin-bottom:10px">2. Model ne öğrendi?</h3><div id="sonucAlan"><p style="color:var(--muted)">Model henüz çalıştırılmadı.</p></div>
                <h4 style="font-size:.9rem;margin:14px 0 6px;color:var(--muted)">Eğitim verin</h4><div class="mini-izgara" id="egitimIzgara"></div></div></div>`;
        const goster1 = () => { $('nesne').innerHTML = nesneSVG(akis[i % akis.length]); };
        const guncelle = () => {
            $('say').textContent = egitim.length;
            $('sb').textContent = egitim.filter(e => e.y === 'balik').length;
            $('sc').textContent = egitim.filter(e => e.y === 'cop').length;
            $('calistir').disabled = egitim.length < 6 || new Set(egitim.map(e => e.y)).size < 2;
            $('egitimIzgara').innerHTML = egitim.map(e => `<div class="mini">${nesneSVG(e.n)}<span class="et" style="background:${e.y === 'balik' ? '#0ea5e9' : '#64748b'}">${e.y === 'balik' ? 'balık' : 'çöp'}</span></div>`).join('');
        };
        document.querySelector('.etiketle').onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            const n = akis[i % akis.length];
            egitim.push({ x: n.x, y: b.dataset.e, n });
            i++; KL.ses('tik'); goster1(); guncelle();
        };
        $('calistir').onclick = () => {
            let dogru = 0;
            const html = deneme.map(n => {
                const p = Y.tahmin(egitim, n.x, 3).y, ok = p === n.y;
                if (ok) dogru++;
                return `<div class="mini ${ok ? 'dogru' : 'yanlis'}">${nesneSVG(n)}<span class="isaret" style="color:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? '✓' : '✗'}</span><span class="et" style="background:${p === 'balik' ? '#0ea5e9' : '#64748b'}">${p === 'balik' ? 'balık' : 'çöp'}</span></div>`;
            }).join('');
            const ac = dogru / deneme.length;
            const yanlisEtiket = egitim.filter(e => e.y !== e.n.y).length;
            $('sonucAlan').innerHTML = `<div class="sonuc-bant ${ac >= 0.9 ? 'iyi' : 'kotu'}"><b>${yuzde(ac)}</b> Model hiç görmediği ${deneme.length} nesneden ${dogru} tanesini doğru bildi.</div>
                <div class="okyanus"><div class="mini-izgara">${html}</div></div>
                <p style="margin-top:10px;color:var(--muted)">${ac >= 0.9 ? 'Model artık balıkları çöpten ayırabiliyor!' : yanlisEtiket ? `Eğitim verinde ${yanlisEtiket} yanlış etiket var. Model, ona öğrettiğin hataları da öğrenir!` : 'Model henüz yeterince öğrenemedi. Daha fazla ve daha çeşitli örnek göster.'}</p>`;
            KL.ses(ac >= 0.9 ? 'dogru' : 'yanlis');
            if (ac >= 0.9) {
                const y = egitim.length <= 12 ? 3 : egitim.length <= 25 ? 2 : 1;
                setTimeout(() => bitir(y, `Model ${egitim.length} örnekle ${yuzde(ac)} doğruluğa ulaştı. ${y < 3 ? '12 ya da daha az örnekle 3 yıldız alabilirsin: çeşitli örnekler seç!' : 'Az ama çeşitli örnek, iyi eğitimin sırrıdır.'}`), 3500);
            }
        };
        goster1(); guncelle();
    }

    // ---------- 2. Önyargılı veri ----------
    function onyargi() {
        const v = Y.onyargiliVeri(tohum());
        const egitim = [...v.egitim];
        const ad = (y) => (y === 'kedi' ? 'kedi' : 'köpek');
        const kart = (n, etiket, sinif = '') => `<div class="mini ${sinif}">${hayvanSVG(n)}${etiket || ''}</div>`;
        $('icerik').innerHTML = `<div class="iki">
            <div class="card panel"><h3 style="font-size:1.05rem;margin-bottom:10px">Eğitim verisi <small style="color:var(--muted);font-weight:500" id="egSay"></small></h3><div class="mini-izgara" id="egIzgara"></div>
                <div id="havuzAlan" hidden><h3 style="font-size:1.05rem;margin:16px 0 8px">Veriyi düzelt</h3><p style="color:var(--muted);font-size:.9rem;margin-bottom:8px">Eğitim verisine eklemek istediğin fotoğraflara tıkla, sonra modeli yeniden test et.</p><div class="mini-izgara" id="havuz"></div></div></div>
            <div class="card panel"><button class="btn btn-primary" id="test" style="width:100%"><i class="fas fa-vial"></i> Modeli yeni fotoğraflarla test et</button><div id="testAlan" style="margin-top:12px"></div><div id="soruAlan" style="margin-top:12px"></div></div></div>`;
        const egCiz = () => {
            $('egSay').textContent = `(${egitim.length} fotoğraf)`;
            $('egIzgara').innerHTML = egitim.map(n => kart(n, `<span class="et" style="background:${n.y === 'kedi' ? '#8b5cf6' : '#f97316'}">${ad(n.y)}</span>`)).join('');
        };
        let asama = 'ilk', eklenen = 0;
        $('test').onclick = () => {
            let dogru = 0;
            const html = v.test.map(n => { const p = Y.tahmin(egitim, n.x, 3, Y.HAYVAN_AGIRLIK).y, ok = p === n.y; if (ok) dogru++; return kart(n, `<span class="isaret" style="color:${ok ? 'var(--ok)' : 'var(--bad)'}">${ok ? '✓' : '✗'}</span><span class="et" style="background:${p === 'kedi' ? '#8b5cf6' : '#f97316'}">${ad(p)}?</span>`, ok ? 'dogru' : 'yanlis'); }).join('');
            const ac = dogru / v.test.length;
            $('testAlan').innerHTML = `<div class="sonuc-bant ${ac >= 0.85 ? 'iyi' : 'kotu'}"><b>${yuzde(ac)}</b> ${v.test.length} yeni fotoğraftan ${dogru} tanesi doğru.</div><div class="mini-izgara">${html}</div>`;
            KL.ses(ac >= 0.85 ? 'dogru' : 'yanlis');
            if (asama === 'ilk') {
                asama = 'soru';
                soruSor($('soruAlan'), 'Model hangi fotoğraflarda yanıldı ve neden?',
                    ['Kediler ve köpekler birbirine çok benzediği için rastgele yanılıyor.', 'Hayvana değil arka plana bakmayı öğrenmiş: bahçedeki her şeye "köpek", evdeki her şeye "kedi" diyor.', 'Model bozuk, baştan yazılmalı.'],
                    1, 'Aynen öyle! Eğitim verisindeki bütün köpekler bahçede olduğu için model "çimen = köpek" kuralını öğrendi. Buna veri önyargısı denir. Gerçek hayatta da yüz tanıma sistemleri, eğitim verisinde az bulunan insanlarda daha çok hata yapabilir.',
                    () => { $('havuzAlan').hidden = false; havuzCiz(); $('soruAlan').insertAdjacentHTML('beforeend', '<p class="fb" style="color:var(--ink)">Şimdi soldan bahçede kedi, evde köpek fotoğrafları ekleyerek veriyi çeşitlendir.</p>'); asama = 'duzelt'; });
            } else if (asama === 'duzelt' && ac >= 0.85) {
                asama = 'bitti';
                const y = hata === 0 ? 3 : hata === 1 ? 2 : 1;
                setTimeout(() => bitir(y, `${eklenen} çeşitli fotoğraf ekleyerek modeli düzelttin: ${yuzde(ac)} doğruluk. Yapay zekâ ancak verisi kadar adil olabilir.`), 2500);
            } else if (asama === 'duzelt') {
                $('soruAlan').innerHTML = '<p class="fb bad">Hâlâ yanılıyor. Özellikle bahçedeki kedi ve evdeki köpek fotoğraflarından ekle.</p>';
            }
        };
        const havuzCiz = () => {
            $('havuz').innerHTML = v.havuz.map((n, j) => kart(n, `<span class="et" style="background:${n.y === 'kedi' ? '#8b5cf6' : '#f97316'}">${ad(n.y)}</span>`, 'secilebilir" data-j="' + j)).join('');
            $('havuz').onclick = (e) => {
                const m = e.target.closest('.mini'); if (!m || m.classList.contains('eklendi')) return;
                m.classList.add('eklendi'); egitim.push(v.havuz[+m.dataset.j]); eklenen++; KL.ses('tik'); egCiz();
            };
        };
        egCiz();
    }

    // ---------- 3. Kendi kuralını öğret ----------
    function kural() {
        const t = tohum(), akis = Y.uzaylilar(t, 40), yeni = Y.uzaylilar(t + 7, 24);
        const ornekler = [];
        let i = 0;
        $('icerik').innerHTML = `<div class="iki">
            <div class="card panel"><div class="kural-in"><span style="font-weight:700">Kuralımın adı:</span><input id="etiketAd" value="Sevimli" maxlength="16"><small style="color:var(--muted)">(kuralın kendisini yazma!)</small></div>
                <div class="buyuk" id="uzayli" style="background:linear-gradient(#1e1b4b,#4c1d95)"></div>
                <div class="etiketle"><button class="btn btn-ok" data-e="evet"><span class="ad"></span> ✓</button><button class="btn" data-e="hayir"><span class="ad"></span> değil ✗</button></div>
                <div class="sayac">Etiketlenen: <b id="say">0</b> / en az 12</div>
                <button class="btn btn-primary" id="ogren" style="width:100%;margin-top:14px" disabled><i class="fas fa-brain"></i> Model kuralımı bulsun</button></div>
            <div class="card panel" id="sag"><p style="color:var(--muted)">Uzaylıları kuralına göre etiketle. Kurala uymayanlar da en az uyanlar kadar önemli!</p></div></div>`;
        const adGuncelle = () => document.querySelectorAll('.etiketle .ad').forEach(s => { s.textContent = $('etiketAd').value || 'Evet'; });
        $('etiketAd').oninput = adGuncelle; adGuncelle();
        const goster1 = () => { $('uzayli').innerHTML = uzayliSVG(akis[i % akis.length]); };
        document.querySelector('.etiketle').onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            const n = akis[i % akis.length];
            ornekler.push({ x: n.x, y: b.dataset.e, n }); i++;
            $('say').textContent = ornekler.length;
            $('ogren').disabled = ornekler.length < 12 || new Set(ornekler.map(o => o.y)).size < 2;
            KL.ses('tik'); goster1();
        };
        $('ogren').onclick = () => {
            const ad = $('etiketAd').value || 'Evet';
            const tahminler = yeni.map(n => ({ n, y: Y.tahmin(ornekler, n.x, 3).y }));
            const onem = Y.ozellikOnemi(ornekler, Y.UZAYLI_OZELLIK).slice(0, 4);
            $('sag').innerHTML = `<h3 style="font-size:1.05rem;margin-bottom:10px">Model 24 yeni uzaylıyı şöyle ayırdı:</h3>
                <div class="gruplar"><div class="grup"><h4>✓ ${ad}</h4><div class="mini-izgara">${tahminler.filter(x => x.y === 'evet').map(x => `<div class="mini" style="background:#1e1b4b">${uzayliSVG(x.n)}</div>`).join('') || '<small>—</small>'}</div></div>
                <div class="grup"><h4>✗ ${ad} değil</h4><div class="mini-izgara">${tahminler.filter(x => x.y === 'hayir').map(x => `<div class="mini" style="background:#1e1b4b">${uzayliSVG(x.n)}</div>`).join('') || '<small>—</small>'}</div></div></div>
                <h4 style="font-size:.95rem;margin:14px 0 4px">Model en çok neye bakıyor?</h4>
                <div class="onem">${onem.map(o => `<div><span>${o.ad}</span><span class="cubuk"><i style="width:${Math.round(o.deger * 100)}%"></i></span><span>${yuzde(o.deger)}</span></div>`).join('')}</div>
                <div id="yansit" style="margin-top:14px"></div>`;
            KL.ses('dogru');
            soruSor($('yansit'), 'Model gizli kuralını bulabildi mi? Gruplara bak.', ['Evet, neredeyse hepsini doğru ayırdı.', 'Kısmen; bazılarını karıştırdı.', 'Hayır, kuralımı anlayamadı.'], -1, '', null);
            // Bu soru öğrencinin kendi değerlendirmesi: her cevap kabul edilir
            $('yansit').querySelector('.secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b) return;
                const j = +b.dataset.i;
                $('yansit').querySelectorAll('button').forEach(x => x.disabled = true);
                b.classList.add('dogru');
                const m = ['Harika! Model, kuralını sadece örneklerden çıkardı. Gerçek yapay zekâ da kuralları kimse yazmadan böyle öğrenir.',
                    'Model belirsiz kalan örneklerde zorlanır. Kuralına uyan ve uymayan daha çok örnek gösterirsen daha iyi öğrenir.',
                    'Bazı kuralları öğrenmek için daha çok örnek gerekir. Ya da modelin göremediği bir şeye (ör. bir isme) dayalı bir kural seçmiş olabilirsin.'][j];
                $('yansit').insertAdjacentHTML('beforeend', `<p class="fb ok">${m}</p><p style="color:var(--muted);font-size:.9rem;margin-top:8px"><b>Unutma:</b> model senin kararlarını kopyalar. Etiketlerken haksız ya da önyargılı davranırsan model de öyle davranır.</p><button class="btn btn-primary" id="kBitir" style="margin-top:10px">Bitir</button>`);
                $('kBitir').onclick = () => bitir(3, `${ornekler.length} örnekle kendi modelini eğittin. Bilgisayar sana kuralı sormadan, sadece örneklerden öğrendi!`);
            };
        };
        goster1();
    }

    // ---------- 4. k ve aşırı öğrenme ----------
    function knn() {
        const v = Y.noktaVeri(tohum());
        let egitim = [...v.egitim], k = 1, veriEklendi = false;
        const gorevler = { k1: false, enIyi: false, veri: false };
        $('icerik').innerHTML = `<div class="iki">
            <div class="card panel"><canvas class="harita" id="harita" width="480" height="480"></canvas>
                <div class="k-satir">k = <b id="kDeger">1</b><input type="range" id="k" min="1" max="25" step="2" value="1" aria-label="k"></div>
                <div class="olcum"><div><b id="egAc">—</b><span>Eğitim verisinde doğruluk</span></div><div><b id="testAc">—</b><span>Yeni (test) verisinde doğruluk</span></div></div>
                <button class="btn btn-sm" id="ekle"><i class="fas fa-plus"></i> 120 eğitim noktası daha ekle</button></div>
            <div class="card panel"><h3 style="font-size:1.05rem">Görevler</h3>
                <ul class="gorevler"><li id="g1">1. k = 1 iken eğitim ve test doğruluğunu karşılaştır.</li><li id="g2">2. Test doğruluğunu en yüksek yapan k değerini bul ve seç.</li><li id="g3">3. Daha fazla veri ekle; ne değişti?</li></ul>
                <div id="soru1" style="margin-top:14px"></div><div style="margin-top:10px"><button class="btn btn-primary" id="buK" hidden><i class="fas fa-bullseye"></i> En iyi k bu!</button></div><div id="soru2" style="margin-top:14px"></div></div></div>`;
        const cv = $('harita'), ctx = cv.getContext('2d');
        const ciz = () => {
            const N = 60, h = 480 / N;
            for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
                const p = Y.tahmin(egitim, [(i + 0.5) / N, (j + 0.5) / N], k).y;
                ctx.fillStyle = p === 'A' ? '#bfdbfe' : '#fed7aa';
                ctx.fillRect(i * h, j * h, h + 0.5, h + 0.5);
            }
            for (const o of egitim) {
                ctx.beginPath(); ctx.arc(o.x[0] * 480, o.x[1] * 480, 5, 0, Math.PI * 2);
                ctx.fillStyle = o.y === 'A' ? '#1d5fd6' : '#ea580c'; ctx.fill();
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
            }
            $('egAc').textContent = yuzde(Y.dogruluk(egitim, egitim, k));
            $('testAc').textContent = yuzde(Y.dogruluk(egitim, v.test, k));
            $('kDeger').textContent = k;
        };
        const enIyiTest = () => Math.max(...[3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25].map(x => Y.dogruluk(egitim, v.test, x)));
        const isaretle = (g) => { gorevler[g] = true; $({ k1: 'g1', enIyi: 'g2', veri: 'g3' }[g]).classList.add('tamam'); if (Object.values(gorevler).every(Boolean)) setTimeout(() => bitir(hata === 0 ? 3 : hata <= 2 ? 2 : 1, 'k-en yakın komşu algoritmasını, aşırı öğrenmeyi ve verinin gücünü keşfettin. Gerçek makine öğrenmesi mühendisleri her gün bu dengeyi kurar!'), 1500); };
        soruSor($('soru1'), 'k = 1 iken eğitim doğruluğu %100 ama test doğruluğu daha düşük. Bu ne demek?',
            ['Model eğitim verisini ezberlemiş, yanlış etiketli noktalara bile uymuş: aşırı öğrenme (overfitting).', 'Model çok az öğrenmiş.', 'Test verisi hatalı.'],
            0, 'Doğru! k=1 her eğitim noktasının, hatta ölçüm hatalarının etrafına bir "ada" çizer. Haritadaki küçük adalara bak.',
            () => { isaretle('k1'); $('buK').hidden = false; });
        $('k').oninput = () => { k = +$('k').value; ciz(); };
        $('buK').onclick = () => {
            const ac = Y.dogruluk(egitim, v.test, k), en = enIyiTest();
            if (ac >= en - 0.015 && k > 1) { KL.ses('dogru'); $('buK').disabled = true; $('buK').innerHTML = `<i class="fas fa-check"></i> k = ${k} seçildi (${yuzde(ac)})`; isaretle('enIyi'); }
            else { hata++; KL.ses('yanlis'); KL.bildir(k === 1 ? 'k = 1 ezberliyor, başka değerleri dene.' : `Daha iyisi var! En iyi test doğruluğu ${yuzde(en)}.`, 2600); }
        };
        $('ekle').onclick = () => {
            if (veriEklendi) return;
            veriEklendi = true;
            const once = Y.dogruluk(egitim, v.test, k);
            egitim = [...egitim, ...v.ek];
            $('ekle').disabled = true; ciz(); KL.ses('tik');
            const sonra = Y.dogruluk(egitim, v.test, k);
            soruSor($('soru2'), `Veri eklenince test doğruluğu ${yuzde(once)} → ${yuzde(sonra)} oldu. Neden?`,
                ['Daha çok örnek, modelin gerçek kuralı (daireyi) hatalı noktalardan ayırmasını kolaylaştırdı.', 'Rastgele oldu, verinin etkisi yok.', 'Model artık ezberliyor.'],
                0, 'Evet! Daha çok ve daha temiz veri, yapay zekânın en güçlü ilacıdır.', () => isaretle('veri'));
        };
        ciz();
    }

    $('geri').onclick = listeCiz; $('sListe').onclick = listeCiz; $('sTekrar').onclick = () => basla(bolum.id);
    const q = new URLSearchParams(location.search).get('b');
    if (BOLUMLER.some(b => b.id === q)) basla(q); else listeCiz();
})();
