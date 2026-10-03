// KodLab — Şifre Kalesi arayüzü
(function () {
    'use strict';
    const G = window.Guvenlik;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('guvenlik', {});
    const karistir = (d) => KL.karistir(d);

    const BOLUMLER = [
        { id: 'lab', ad: 'Şifre Laboratuvarı', ikon: 'fa-flask', renk: '#1d5fd6', sinif: '4. – 12. sınıf', ozet: 'Şifrenin gücünü canlı ölç: kaç saniyede kırılır, neden zayıf?' },
        { id: 'cift', ad: 'Hangisi Daha Güçlü?', ikon: 'fa-scale-balanced', renk: '#8b5cf6', sinif: '3. – 12. sınıf', ozet: 'İki şifreden hangisinin kırılması daha zor? 8 tur.' },
        { id: 'olta', ad: 'Oltalama Avı', ikon: 'fa-fish', renk: '#e5484d', sinif: '4. – 12. sınıf', ozet: 'Sahte e-posta, SMS ve siteleri yakala, ipuçlarını bul.' },
        { id: 'durum', ad: 'Ne Yapmalı?', ikon: 'fa-shield-halved', renk: '#16a36a', sinif: '3. – 12. sınıf', ozet: 'Gerçek hayattan güvenlik durumlarında doğru kararı ver.' }
    ];
    let bolum = null, hata = 0;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = BOLUMLER.map(b => `
            <button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif}</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });

    function basla(id) {
        bolum = BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad;
        $('dots').innerHTML = '';
        goster('oyun');
        ({ lab: lab, cift: cift, olta: olta, durum: durumlar })[id]();
    }
    function noktalar(n, i) { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); }

    function bitir(y, metin) {
        y = y ?? (hata === 0 ? 3 : hata <= 2 ? 2 : 1);
        if (y > (kayit[bolum.id] || 0)) { kayit[bolum.id] = y; KL.yaz('guvenlik', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Kale güvende!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} yanlışla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç yanlış yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    // ---------- 1. Şifre laboratuvarı ----------
    const TUR_ADI = { kelime: 'sözlük kelimesi', yil: 'yıl', sira: 'ardışık', tekrar: 'tekrar', yaygin: 'çok yaygın', karakter: 'rastgele' };
    function lab() {
        $('icerik').innerHTML = `
            <div class="uyari"><i class="fas fa-lock"></i> <b>Gerçek şifreni buraya yazma!</b> Bu sayfa hiçbir şeyi bir yere göndermez, ama şifreni hiçbir siteye "denemek için" yazmamayı alışkanlık edin.</div>
            <div class="lab">
                <div class="card panel">
                    <label for="sifre" style="font-weight:700">Bir şifre dene</label>
                    <div class="sifre-in" style="margin-top:8px"><input id="sifre" autocomplete="off" spellcheck="false" placeholder="ör. kedi123"><button class="btn" id="goz" aria-label="Göster/gizle"><i class="fas fa-eye-slash"></i></button></div>
                    <div class="metre"><div id="metre"></div></div>
                    <div class="seviye"><span id="seviye">—</span><span id="bit" style="color:var(--muted);font-family:var(--mono)"></span></div>
                    <div class="sure"><small>Saniyede 10 milyar deneme yapan bir bilgisayar bu şifreyi ortalama</small><span id="sure">—</span> <small>içinde kırar.</small></div>
                    <div class="parcalar" id="parcalar"></div>
                    <ul class="kontrol-liste" id="kontrol"></ul>
                    <p class="ipucu-kutu" id="ipucu"></p>
                </div>
                <div class="card panel">
                    <h3 style="font-size:1.05rem;margin-bottom:10px">Görevler</h3>
                    <div class="gorevler">
                        <div class="gorev" id="g1"><i class="fas fa-circle-check"></i><span><b>Yaygın şifreyi dene:</b> "123456" ya da "galatasaray" gibi çok kullanılan bir şifre yaz ve ne kadar çabuk kırıldığını gör.</span></div>
                        <div class="gorev" id="g2"><i class="fas fa-circle-check"></i><span><b>Sözlük tuzağı:</b> Bir isim ya da kelimenin sonuna doğum yılı ekle (ör. ahmet2012). Neden zayıf?</span></div>
                        <div class="gorev" id="g3"><i class="fas fa-circle-check"></i><span><b>Parola cümlesi:</b> Aralarına işaret koyduğun en az 4 kelimeden oluşan, <b>Güçlü</b> seviyesinde bir şifre oluştur. Ör: bulut-kaktüs-tren-lale7</span></div>
                        <div class="gorev" id="g4"><i class="fas fa-circle-check"></i><span><b>Kale kapısı:</b> 16 karakterden kısa ama <b>Çok güçlü</b> bir şifre oluştur.</span></div>
                    </div>
                    <p style="color:var(--muted);font-size:.85rem;margin-top:12px">Bu ölçer, saldırganların kullandığı yöntemleri (sözlük, yıl, klavye sırası) taklit eden bir tahmindir.</p>
                </div>
            </div>`;
        const yapilan = new Set();
        const kontrolEt = () => {
            const s = $('sifre').value;
            const a = G.analiz(s);
            const sv = G.SEVIYELER[a.seviye];
            $('metre').style.width = s ? Math.min(100, 8 + a.bit / 80 * 92) + '%' : '0';
            $('metre').style.background = sv.renk;
            $('seviye').textContent = s ? sv.ad : '—';
            $('seviye').style.color = s ? sv.renk : '';
            $('bit').textContent = s ? `≈ ${Math.round(a.bit)} bit` : '';
            $('sure').textContent = s ? G.kirmaSuresi(a.bit) : '—';
            $('parcalar').innerHTML = a.parcalar.map(p => `<span class="parca ${p.tur}">${kacis($('goz').dataset.acik ? p.metin : '•'.repeat([...p.metin].length))}<small>${TUR_ADI[p.tur]}</small></span>`).join('');
            $('kontrol').innerHTML = a.kontroller.map(k => `<li><i class="fas ${k.ok ? 'fa-check' : 'fa-xmark'}"></i>${k.ad}</li>`).join('');
            const tur = new Set(a.parcalar.map(p => p.tur));
            $('ipucu').textContent = !s ? '' : a.yaygin ? 'Bu, saldırganların ilk denediği şifrelerden biri!'
                : tur.has('kelime') && a.seviye < 3 ? 'Sözlükte olan kelimeler ve isimler saldırganın listesindedir. Kelime kullanacaksan birden fazla, birbiriyle ilgisiz kelime seç.'
                : tur.has('yil') ? 'Yıllar (doğum yılı, takım kuruluş yılı) kolayca tahmin edilir.'
                : tur.has('sira') ? 'Klavyedeki ya da alfabedeki sıralar (qwerty, abc, 123) ilk denenenlerdir.'
                : a.seviye >= 3 ? 'Harika! Uzunluk en büyük güç kaynağıdır.' : 'Daha uzun yap: her yeni karakter kırma süresini katlar.';
            // Görevler
            const kelimeSayisi = s.split(/[^A-Za-zçğıöşüÇĞİÖŞÜ]+/).filter(w => w.length >= 3).length;
            if (a.yaygin) yapilan.add('g1');
            if (tur.has('kelime') && tur.has('yil')) yapilan.add('g2');
            if (kelimeSayisi >= 4 && /[^A-Za-zçğıöşüÇĞİÖŞÜ]/.test(s) && a.seviye >= 3) yapilan.add('g3');
            if ([...s].length < 16 && a.seviye === 4) yapilan.add('g4');
            ['g1', 'g2', 'g3', 'g4'].forEach(g => {
                const el = $(g);
                if (yapilan.has(g) && !el.classList.contains('tamam')) { el.classList.add('tamam'); KL.ses('dogru'); }
            });
            noktalar(4, yapilan.size);
            if (yapilan.size === 4 && !lab.bitti) { lab.bitti = true; setTimeout(() => bitir(3, 'Dört görevi de tamamladın. Artık güçlü bir şifrenin sırrını biliyorsun: uzunluk ve tahmin edilemezlik!'), 900); }
        };
        lab.bitti = false;
        $('sifre').addEventListener('input', kontrolEt);
        $('goz').addEventListener('click', () => {
            const ac = !$('goz').dataset.acik;
            if (ac) $('goz').dataset.acik = '1'; else delete $('goz').dataset.acik;
            $('sifre').type = ac ? 'text' : 'password';
            $('goz').innerHTML = `<i class="fas fa-eye${ac ? '' : '-slash'}"></i>`;
            kontrolEt();
        });
        $('sifre').type = 'password';
        noktalar(4, 0);
        kontrolEt();
        $('sifre').focus();
    }

    // ---------- 2. Hangisi daha güçlü ----------
    function cift() {
        const TUR = 8;
        let i = 0, kilit = false;
        const yeni = () => {
            kilit = false;
            const c = G.ciftUret();
            noktalar(TUR, i);
            $('icerik').innerHTML = `<div class="card panel durum-kart"><p class="soru" style="text-align:center">Hangi şifrenin kırılması daha zor?</p>
                <div class="cift"><button data-s="a">${kacis(c.a)}</button><button data-s="b">${kacis(c.b)}</button></div><p class="fb" id="fb" style="text-align:center"></p></div>`;
            document.querySelector('.cift').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || kilit) return;
                kilit = true;
                const dogru = b.dataset.s === c.dogru;
                document.querySelectorAll('.cift button').forEach(x => {
                    const a = G.analiz(c[x.dataset.s]);
                    x.classList.add(x.dataset.s === c.dogru ? 'dogru' : 'yanlis');
                    x.insertAdjacentHTML('beforeend', `<small><b style="color:${G.SEVIYELER[a.seviye].renk}">${G.SEVIYELER[a.seviye].ad}</b> · ${G.kirmaSuresi(a.bit)}</small>`);
                });
                if (dogru) KL.ses('dogru'); else { hata++; KL.ses('yanlis'); }
                const z = G.analiz(c[c.dogru === 'a' ? 'b' : 'a']);
                const neden = z.yaygin ? 'Zayıf olan, en çok kullanılan şifrelerden biri.' : z.parcalar.some(p => p.tur === 'kelime') ? 'Zayıf olan, sözlükte bulunan bir kelime ya da isim içeriyor.' : z.parcalar.some(p => p.tur === 'sira' || p.tur === 'tekrar') ? 'Zayıf olan, tahmin edilebilir bir sıra ya da tekrar içeriyor.' : 'Zayıf olan çok kısa.';
                $('fb').className = 'fb ' + (dogru ? 'ok' : 'bad');
                $('fb').textContent = (dogru ? 'Doğru! ' : 'Olmadı. ') + neden;
                i++;
                setTimeout(() => (i < TUR ? yeni() : bitir()), 2300);
            };
        };
        yeni();
    }

    // ---------- 3. Oltalama avı ----------
    // [[id|metin]] işaretlerini ve kelimeleri tıklanabilir parçalara çevir
    function metinCiz(govde) {
        return govde.split(/(\[\[\w+\|[^\]]+\]\])/).map(p => {
            const m = p.match(/^\[\[(\w+)\|([^\]]+)\]\]$/);
            if (m) return `<span class="k ${m[1] === 'link' ? 'lnk' : ''}" data-i="${m[1]}">${kacis(m[2])}</span>`;
            return kacis(p).split(/(\s+)/).map(w => /^\s+$/.test(w) ? w.replace(/\n/g, '<br>') : w ? `<span class="k">${w}</span>` : '').join('');
        }).join('');
    }

    function olta() {
        const liste = karistir(G.OLTALAMA);
        let i = 0;
        const yeni = () => {
            const s = liste[i];
            noktalar(liste.length, i);
            const bulunan = new Set();
            let asama = 'karar', yanlisTik = 0;
            let ust;
            if (s.tur === 'eposta') ust = `<div class="mesaj"><div class="bas"><span><b>Kimden:</b><span class="k" data-i="gonderen">${kacis(s.kimden)}</span></span><span><b>Konu:</b>${kacis(s.konu)}</span></div><div class="govde">${metinCiz(s.govde)}</div><div class="durum-cubugu" id="cubuk"></div></div>`;
            else if (s.tur === 'sms') ust = `<div class="telefon"><div class="kimden"><span class="k" data-i="gonderen">${kacis(s.kimden)}</span></div><div class="balon">${metinCiz(s.govde)}</div><div class="durum-cubugu" id="cubuk" style="margin-top:12px;border-radius:8px"></div></div>`;
            else {
                const [proto, ...geri] = s.adres.split('://');
                ust = `<div class="mesaj tarayici"><div class="bas"><div class="adres"><i class="fas fa-lock-open" style="color:var(--bad)"></i><span class="k" data-i="https">${proto}://</span><span class="k" data-i="adres">${kacis(geri.join('://'))}</span></div></div><div class="sitebody">${metinCiz(s.govde).replace(/<br><br>/, '<br><div class="alanlar">').replace(/(<br><br>)(?!.*<br><br>)/, '</div><br>')}</div></div>`;
            }
            $('icerik').innerHTML = `<div class="olta"><div class="${s.oltalama ? '' : ''}" id="mesajKutu">${ust}</div>
                <div class="card panel"><p style="font-weight:700;font-size:1.05rem" id="adim">1. Bu ${s.tur === 'site' ? 'site' : 'mesaj'} güvenli mi, yoksa oltalama mı?</p>
                <div class="karar" id="karar"><button class="btn" data-k="guvenli"><i class="fas fa-circle-check" style="color:var(--ok)"></i> Güvenli</button><button class="btn" data-k="olta"><i class="fas fa-fish" style="color:var(--bad)"></i> Oltalama</button></div>
                <p class="fb" id="fb"></p><ul class="ipucu-listesi" id="ipuclari"></ul><div id="devam"></div></div></div>`;
            // Bağlantının üstüne gelince/dokununca gerçek adresi göster (güvenlik alışkanlığı)
            $('mesajKutu').addEventListener('mouseover', (e) => { const l = e.target.closest('.lnk'); if (l && $('cubuk')) $('cubuk').textContent = '🔗 ' + s.link; });
            $('mesajKutu').addEventListener('mouseout', (e) => { if (e.target.closest('.lnk') && $('cubuk')) $('cubuk').textContent = ''; });

            const ipucuListesi = () => {
                const ids = Object.keys(s.ipuclari);
                $('ipuclari').innerHTML = ids.map(id => bulunan.has(id) ? `<li><b>✓</b> ${s.ipuclari[id]}</li>` : '<li class="gizli">? Bulunmayı bekliyor</li>').join('');
                $('adim').textContent = `2. Şüpheli yerlere tıkla (${bulunan.size}/${ids.length})`;
                if (bulunan.size === ids.length) tamam();
            };
            const tamam = () => {
                asama = 'bitti';
                document.querySelector('.bulmaca')?.classList.remove('bulmaca');
                $('fb').className = 'fb ok';
                $('fb').textContent = s.oltalama ? 'Bütün ipuçlarını buldun! Böyle bir mesajı silip bir yetişkine haber ver.' : s.aciklama;
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px;width:100%">${i + 1 < liste.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < liste.length ? yeni() : bitir(); };
                KL.ses('dogru');
            };
            $('karar').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || asama !== 'karar') return;
                const dogru = (b.dataset.k === 'olta') === s.oltalama;
                if (!dogru) {
                    hata++; KL.ses('yanlis');
                    $('fb').className = 'fb bad';
                    $('fb').textContent = s.oltalama ? 'Dikkat! Bu bir oltalama. Mesaja daha dikkatli bak.' : 'Aslında bu mesajda bir sorun yok. Her mesaj tehlikeli değildir; neden güvenli olduğuna bak.';
                    if (!s.oltalama) { $('karar').hidden = true; return tamam(); }
                    b.disabled = true;
                    return;
                }
                $('karar').hidden = true;
                if (!s.oltalama) return tamam();
                asama = 'ipucu';
                $('mesajKutu').classList.add('bulmaca');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru, bu bir oltalama! Şimdi seni neyin uyarması gerektiğini bul.';
                KL.ses('dogru');
                ipucuListesi();
                $('devam').innerHTML = '<button class="btn btn-sm" style="margin-top:10px" id="goster"><i class="fas fa-lightbulb"></i> Kalanları göster</button>';
                $('goster').onclick = () => { hata++; Object.keys(s.ipuclari).forEach(id => { bulunan.add(id); document.querySelectorAll(`#mesajKutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu')); }); ipucuListesi(); };
            };
            $('mesajKutu').onclick = (e) => {
                if (asama !== 'ipucu') return;
                const k = e.target.closest('.k'); if (!k) return;
                const id = k.dataset.i;
                if (id && s.ipuclari[id]) {
                    if (!bulunan.has(id)) { bulunan.add(id); KL.ses('tik'); }
                    document.querySelectorAll(`#mesajKutu [data-i="${id}"]`).forEach(x => x.classList.add('bulundu'));
                    if (id === 'link' && $('cubuk')) $('cubuk').textContent = '🔗 ' + s.link;
                    ipucuListesi();
                } else {
                    yanlisTik++;
                    k.classList.remove('bos'); k.offsetWidth; k.classList.add('bos');
                    if (yanlisTik === 3) { $('fb').className = 'fb'; $('fb').textContent = 'İpucu: gönderene, bağlantılara, istenen bilgilere ve acele ettiren cümlelere bak.'; }
                }
            };
        };
        yeni();
    }

    // ---------- 4. Ne yapmalı ----------
    function durumlar() {
        const liste = karistir(G.DURUMLAR).map(d => {
            const sira = karistir(d.secenekler.map((s, j) => j));
            return { ...d, secenekler: sira.map(j => d.secenekler[j]), dogru: sira.indexOf(d.dogru) };
        });
        let i = 0;
        const yeni = () => {
            const d = liste[i];
            noktalar(liste.length, i);
            $('icerik').innerHTML = `<div class="card panel durum-kart"><p class="soru">${d.durum}</p>
                <div class="secenekler" id="secenekler">${d.secenekler.map((s, j) => `<button data-j="${j}">${s}</button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="devam"></div></div>`;
            let ilk = true;
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.classList.contains('yanlis') || $('devam').innerHTML) return;
                if (+b.dataset.j !== d.dogru) {
                    if (ilk) hata++;
                    ilk = false;
                    b.classList.add('yanlis'); KL.ses('yanlis');
                    $('fb').className = 'fb bad'; $('fb').textContent = 'Bu riskli olabilir. Bir daha düşün.';
                    return;
                }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = d.aciklama;
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px">${i + 1 < liste.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < liste.length ? yeni() : bitir(); };
            };
        };
        yeni();
    }

    $('geri').onclick = listeCiz;
    $('sListe').onclick = listeCiz;
    $('sTekrar').onclick = () => basla(bolum.id);
    const q = new URLSearchParams(location.search).get('b');
    if (BOLUMLER.some(b => b.id === q)) basla(q); else listeCiz();
})();
