// Kodlayalım — Python Laboratuvarı arayüzü
(function () {
    'use strict';
    const P = window.PythonMotor;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('python', { yildiz: {}, kod: {}, deneme: {}, ipucu: {} });
    const kacis = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let gorev = null, isci = null, hazir = false, calisiyor = null, sayac = 0, girdiler = [], tohum = 1, hataSatir = 0;

    // ---------- Python işçisi ----------
    function isciBaslat() {
        hazir = false; dugmeler();
        durumYaz('<span class="yukleniyor"></span> Python hazırlanıyor…');
        try { isci = new Worker('python-isci.js', { type: 'module' }); } catch (e) { durumYaz('<i class="fas fa-triangle-exclamation"></i> Python başlatılamadı'); return; }
        isci.onmessage = (e) => mesajAl(e.data);
        isci.onerror = () => durumYaz('<i class="fas fa-triangle-exclamation"></i> Python yüklenemedi');
    }
    function durumYaz(h) { $('durum').innerHTML = h; }
    function dugmeler() {
        $('calistir').disabled = !hazir || !!calisiyor;
        $('denetle').disabled = !hazir || !!calisiyor;
    }
    function mesajAl(m) {
        if (m.tur === 'hazir') { hazir = true; durumYaz('<i class="fab fa-python" style="color:var(--ok)"></i> Python 3 hazır'); dugmeler(); return; }
        if (m.tur === 'yuklenemedi') { durumYaz('<i class="fas fa-triangle-exclamation"></i> Python yüklenemedi'); konsol.yaz('Python yüklenemedi: ' + m.mesaj, 'h'); return; }
        if (!calisiyor || m.no !== calisiyor.no) return;
        if (m.tur === 'cikti') konsol.ekle(m.s);
        else if (m.tur === 'bitti') { bitir(); calismaBitti(m.sonuc); }
        else if (m.tur === 'denetim') { bitir(); denetimBitti(m.sonuclar); }
    }
    function gonder(m, sure, zamanAsimi) {
        m.no = ++sayac;
        calisiyor = { no: m.no, zaman: setTimeout(() => { isci.terminate(); bitir(); zamanAsimi(); isciBaslat(); }, sure) };
        dugmeler();
        isci.postMessage(m);
    }
    function bitir() { if (calisiyor) clearTimeout(calisiyor.zaman); calisiyor = null; dugmeler(); }

    // ---------- Konsol ----------
    const konsol = {
        metin: '', ek: '', bekleyen: false,
        temizle() { this.metin = ''; this.ek = ''; $('konsol').innerHTML = ''; },
        ekle(s) { this.metin += s; if (!this.bekleyen) { this.bekleyen = true; requestAnimationFrame(() => { if (this.bekleyen) this.ciz(this.ek); }); } },
        ciz(ek = '') { this.bekleyen = false; this.ek = ek; $('konsol').innerHTML = kacis(this.metin) + ek; $('konsol').scrollTop = 1e9; },
        yaz(s, sinif) { $('konsol').innerHTML += `<span class="${sinif}">${kacis(s)}</span>`; }
    };

    function calistir(yeniGirdi) {
        if (!hazir || calisiyor) return;
        if (!yeniGirdi) { girdiler = []; tohum = Math.floor(Math.random() * 1e9); }
        hataGoster(0);
        konsol.temizle();
        gonder({ tur: 'calistir', kod: $('kod').value, girdiler, tohum }, 5000, () => {
            konsol.ciz(hataHTML(P.hataAcikla('Zaman')));
        });
    }
    function calismaBitti(r) {
        if (r.durum === 'girdi') {
            // Program girdi bekliyor: kutudan alınan değerle program baştan, aynı rastgele tohumla oynatılır
            konsol.ciz(kacis(r.mesaj) + '<input id="girdiKutu" autocomplete="off" aria-label="Girdi">');
            const k = $('girdiKutu');
            k.focus();
            k.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); girdiler.push(k.value); calistir(true); } };
            return;
        }
        if (r.durum === 'hata') { konsol.ciz(hataHTML(r.hata)); hataGoster(r.hata.satir); KL.ses('yanlis'); return; }
        konsol.ciz(konsol.metin ? '' : '<span class="soluk">(Program bir şey yazdırmadı)</span>');
    }
    const hataHTML = (h) => `<div class="hata-kutu"><b><i class="fas fa-bug"></i> ${h.ad}</b>${h.yer ? ` — ${h.yer.trim()}` : ''}<br>${h.aciklama}${h.ham ? `<small>${kacis(h.ham)}</small>` : ''}</div>`;

    // ---------- Denetim ----------
    function denetle() {
        if (!hazir || calisiyor) return;
        const kod = $('kod').value;
        const yasak = P.yasakKullanim(gorev, kod);
        if (yasak) { KL.bildir(`Bu görevde ${yasak}() kullanmak yok — algoritmayı kendin yazmalısın!`); return; }
        hataGoster(0);
        $('sonucKart').hidden = false;
        $('testler').innerHTML = gorev.testler.map((_, i) => `<span class="test">${i + 1}</span>`).join('');
        $('fark').innerHTML = '<p style="color:var(--muted);font-size:.85rem;margin-top:8px"><span class="yukleniyor"></span> Testler çalışıyor…</p>';
        gonder({ tur: 'denetle', gorev: gorev.id, kod }, 8000, () => {
            kayit.deneme[gorev.id] = (kayit.deneme[gorev.id] || 0) + 1; KL.yaz('python', kayit);
            $('fark').innerHTML = `<div class="konsol" style="height:auto;margin-top:10px">${hataHTML(P.hataAcikla('Zaman'))}</div>`;
        });
    }
    let sonSonuclar = [];
    function denetimBitti(s) {
        sonSonuclar = s;
        const ilkHata = s.findIndex(x => !x.gecti);
        $('testler').innerHTML = s.map((x, i) => `<button class="test ${x.gecti ? 'ok' : 'no'} ${i === ilkHata ? 'sel' : ''}" data-i="${i}" title="Test ${i + 1}">${x.gecti ? '<i class="fas fa-check"></i>' : i + 1}</button>`).join('');
        if (ilkHata < 0) {
            $('fark').innerHTML = `<p style="color:var(--ok);font-weight:700;margin-top:8px"><i class="fas fa-circle-check"></i> ${s.length} testin hepsi geçti!</p>`;
            kazan();
        } else {
            kayit.deneme[gorev.id] = (kayit.deneme[gorev.id] || 0) + 1; KL.yaz('python', kayit);
            farkGoster(ilkHata);
            KL.ses('yanlis');
        }
    }
    function farkGoster(i) {
        const x = sonSonuclar[i];
        document.querySelectorAll('.test').forEach(t => t.classList.toggle('sel', +t.dataset.i === i));
        const pre = (s) => s === '' ? '<span class="bosluk">(boş)</span>' : kacis(s);
        let h = '<div class="fark">';
        if (x.girdi.length) h += `<div class="tam"><b>Verilen girdi</b><pre>${pre(x.girdi.join('\n'))}</pre></div>`;
        if (x.kod) h += `<div class="tam"><b>Çalıştırılan test</b><pre>${pre(x.kod)}</pre></div>`;
        h += `<div><b>Beklenen</b><pre>${pre(x.beklenen)}</pre></div><div><b>Senin çıktın</b><pre>${pre(P.normal(x.cikti))}</pre></div>`;
        if (x.hata) h += `<div class="tam konsol" style="height:auto;padding:0;background:none;border:0">${hataHTML(x.hata)}</div>`;
        else if (P.normal(x.cikti).toLowerCase() === P.normal(x.beklenen).toLowerCase()) h += '<div class="tam" style="border-color:#f0c75e">Neredeyse! Sadece büyük-küçük harf farkı var.</div>';
        else if (P.normal(x.cikti).replace(/\s+/g, '') === P.normal(x.beklenen).replace(/\s+/g, '')) h += '<div class="tam" style="border-color:#f0c75e">Neredeyse! Sadece boşluklarda fark var.</div>';
        $('fark').innerHTML = h + '</div>';
        if (x.hata && x.hata.satir && !x.kod) hataGoster(x.hata.satir);
    }
    $('testler').onclick = (e) => { const b = e.target.closest('.test.no'); if (b) farkGoster(+b.dataset.i); };

    function kazan() {
        const d = kayit.deneme[gorev.id] || 0;
        let y = d === 0 ? 3 : d <= 2 ? 2 : 1;
        if (kayit.ipucu[gorev.id]) y = Math.min(y, 2);
        const ilk = !kayit.yildiz[gorev.id];
        kayit.yildiz[gorev.id] = Math.max(kayit.yildiz[gorev.id] || 0, y);
        KL.yaz('python', kayit);
        yanCiz();
        $('kBaslik').textContent = y === 3 ? 'Kusursuz kod!' : 'Görev tamam!';
        $('kYildiz').innerHTML = KL.yildizHTML(y);
        $('kMetin').textContent = y === 3 ? 'Bütün testler ilk denemede geçti.' : kayit.ipucu[gorev.id] && d === 0 ? 'İpucuyla çözdün. Bir sonrakinde ipucusuz dene!' : `Testler ${d + 1}. kontrolde geçti. Hata yapmak öğrenmenin parçası!`;
        const no = P.GOREVLER.indexOf(gorev);
        $('kSonraki').hidden = no === P.GOREVLER.length - 1;
        if (y === 3 && ilk) KL.konfeti(); else KL.ses('kazan');
        setTimeout(() => $('kazandi').showModal(), 300);
    }
    $('kKal').onclick = () => $('kazandi').close();
    $('kSonraki').onclick = () => { $('kazandi').close(); ac(P.GOREVLER[P.GOREVLER.indexOf(gorev) + 1].id); };

    // ---------- Görev listesi ----------
    function yanCiz() {
        $('yan').innerHTML = P.UNITELER.map(u => {
            const l = P.GOREVLER.filter(g => g.unite === u.id);
            const biten = l.filter(g => kayit.yildiz[g.id]).length;
            return `<h3><i class="fas ${u.ikon}"></i> ${u.ad}<small>${biten}/${l.length}</small></h3>` + l.map(g => {
                const y = kayit.yildiz[g.id] || 0;
                return `<button data-id="${g.id}" class="${g === gorev ? 'sel' : ''} ${y ? 'ok' : ''}"><span class="d">${y ? '<i class="fas fa-check"></i>' : P.GOREVLER.indexOf(g) + 1}</span>${g.ad}${y ? KL.yildizHTML(y) : ''}</button>`;
            }).join('');
        }).join('');
        $('gorevSec').innerHTML = P.UNITELER.map(u => `<optgroup label="${u.ad}">${P.GOREVLER.filter(g => g.unite === u.id).map(g => `<option value="${g.id}" ${g === gorev ? 'selected' : ''}>${P.GOREVLER.indexOf(g) + 1}. ${g.ad}${kayit.yildiz[g.id] ? ' ✓' : ''}</option>`).join('')}</optgroup>`).join('');
    }
    $('yan').onclick = (e) => { const b = e.target.closest('button[data-id]'); if (b) ac(b.dataset.id); };
    $('gorevSec').onchange = () => ac($('gorevSec').value);

    function ac(id) {
        gorev = P.GOREVLER.find(g => g.id === id) || P.GOREVLER[0];
        const u = P.UNITELER.find(x => x.id === gorev.unite);
        $('ust').textContent = `${u.ad} · Görev ${P.GOREVLER.indexOf(gorev) + 1}/${P.GOREVLER.length}`;
        $('baslik').textContent = gorev.ad;
        $('anlatim').innerHTML = gorev.anlatim;
        const t = gorev.testler[0];
        $('ornek').innerHTML = gorev.fonksiyon ? '' :
            (t.girdi.length ? `<div><b>Örnek girdi</b><pre>${kacis(t.girdi.join('\n'))}</pre></div>` : '') +
            `<div><b>Beklenen çıktı</b><pre>${kacis(t.cikti)}</pre></div>`;
        $('ipucuAlan').innerHTML = kayit.ipucu[gorev.id] ? ipucuHTML() : '';
        $('kod').value = kayit.kod[gorev.id] ?? gorev.baslangic;
        $('sonucKart').hidden = true;
        hataGoster(0);
        konsol.temizle(); $('konsol').innerHTML = '<span class="soluk">Kodunu yaz ve Çalıştır\'a bas.</span>';
        editorCiz();
        yanCiz();
        try { localStorage.setItem('kodlab.python.son', gorev.id); } catch (e) { /* önemli değil */ }
        $('cozum').hidden = !ogretmen;
    }
    const ipucuHTML = () => `<div class="ipucu"><b><i class="fas fa-lightbulb"></i> İpucu</b><pre>${kacis(gorev.ipucu)}</pre></div>`;
    $('ipucuBtn').onclick = () => {
        if (kayit.ipucu[gorev.id]) return;
        if (!kayit.yildiz[gorev.id] && !confirm('İpucuna bakarsan bu görevden en fazla 2 yıldız alabilirsin. Bakmak ister misin?')) return;
        kayit.ipucu[gorev.id] = true; KL.yaz('python', kayit);
        $('ipucuAlan').innerHTML = ipucuHTML();
    };
    $('sifirla').onclick = () => {
        if (!confirm('Kodun silinip başlangıç koduna dönülsün mü?')) return;
        $('kod').value = gorev.baslangic; kodDegisti();
    };
    $('cozum').onclick = () => { $('kod').value = gorev.cozum; kodDegisti(); };
    $('calistir').onclick = () => calistir(false);
    $('denetle').onclick = denetle;

    // ---------- Editör ----------
    const ANAHTAR = new Set('False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
    const YERLESIK = new Set('print input int float str len range list dict set tuple bool abs min max sum sorted round type enumerate zip any all ord chr reversed map filter open isinstance'.split(' '));
    function renklendir(s) {
        const re = /(#[^\n]*)|([fFrRbB]{0,2}(?:"""[\s\S]*?(?:"""|$(?![\s\S]))|'''[\s\S]*?(?:'''|$(?![\s\S]))|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)/g;
        let o = '', son = 0, m;
        while ((m = re.exec(s))) {
            o += kacis(s.slice(son, m.index));
            const v = kacis(m[0]);
            if (m[1]) o += `<span class="p-yor">${v}</span>`;
            else if (m[2]) o += `<span class="p-met">${v}</span>`;
            else if (m[3]) o += `<span class="p-say">${v}</span>`;
            else if (ANAHTAR.has(m[4])) o += `<span class="p-an">${v}</span>`;
            else if (YERLESIK.has(m[4])) o += `<span class="p-yer">${v}</span>`;
            else if (/^\s*\(/.test(s.slice(re.lastIndex))) o += `<span class="p-fn">${v}</span>`;
            else o += v;
            son = re.lastIndex;
        }
        return o + kacis(s.slice(son));
    }
    function editorCiz() {
        const v = $('kod').value;
        $('renkli').innerHTML = renklendir(v) + '\n';
        const n = v.split('\n').length;
        $('no').innerHTML = Array.from({ length: n }, (_, i) => `<div class="${i + 1 === hataSatir ? 'h' : ''}">${i + 1}</div>`).join('');
        kaydir();
    }
    function hataGoster(satir) {
        hataSatir = satir;
        const eski = document.querySelector('.hata-cizgi'); if (eski) eski.remove();
        if (satir) $('kodKutu').insertAdjacentHTML('beforeend', '<div class="hata-cizgi"></div>');
        editorCiz();
    }
    function kaydir() {
        const ta = $('kod');
        $('renkli').scrollTop = ta.scrollTop; $('renkli').scrollLeft = ta.scrollLeft;
        $('no').scrollTop = ta.scrollTop;
        const c = document.querySelector('.hata-cizgi');
        if (c) c.style.top = (14 + (hataSatir - 1) * 22 - ta.scrollTop) + 'px';
    }
    let kayitZaman = null;
    function kodDegisti() {
        if (hataSatir) hataGoster(0); else editorCiz();
        clearTimeout(kayitZaman);
        kayitZaman = setTimeout(() => { kayit.kod[gorev.id] = $('kod').value; KL.yaz('python', kayit); }, 300);
    }
    $('kod').addEventListener('input', kodDegisti);
    $('kod').addEventListener('scroll', kaydir);
    $('kod').addEventListener('keydown', (e) => {
        const ta = $('kod'), v = ta.value, bas = ta.selectionStart, son = ta.selectionEnd;
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); calistir(false); return; }
        if (e.key === 'Tab') {
            e.preventDefault();
            const satirBas = v.lastIndexOf('\n', bas - 1) + 1;
            if (bas === son && !e.shiftKey) { ta.setRangeText('    ', bas, son, 'end'); }
            else {
                // Seçili satırları içeri/dışarı al
                const satirSon = son > bas && v[son - 1] === '\n' ? son - 1 : son;
                const blok = v.slice(satirBas, satirSon);
                const yeni = blok.split('\n').map(l => e.shiftKey ? l.replace(/^ {1,4}/, '') : '    ' + l).join('\n');
                ta.setRangeText(yeni, satirBas, satirSon, 'select');
            }
            kodDegisti(); return;
        }
        if (e.key === 'Enter' && bas === son) {
            e.preventDefault();
            const satir = v.slice(v.lastIndexOf('\n', bas - 1) + 1, bas);
            let girinti = satir.match(/^ */)[0];
            if (/:\s*(#.*)?$/.test(satir)) girinti += '    ';
            else if (/^\s*(return|pass|break|continue)\b/.test(satir)) girinti = girinti.slice(4);
            ta.setRangeText('\n' + girinti, bas, son, 'end');
            kodDegisti(); return;
        }
        if (e.key === 'Backspace' && bas === son && bas > 0) {
            const satir = v.slice(v.lastIndexOf('\n', bas - 1) + 1, bas);
            if (satir.length && /^ +$/.test(satir) && satir.length % 4 === 0) {
                e.preventDefault(); ta.setRangeText('', bas - 4, bas, 'end'); kodDegisti();
            }
        }
    });

    window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (P.GOREVLER.some(g => g.id === h)) ac(h); });

    // ---------- Başlangıç ----------
    isciBaslat();
    let ilk = null;
    try { ilk = localStorage.getItem('kodlab.python.son'); } catch (e) { /* yok */ }
    const h = location.hash.match(/^#(\w+)/);
    ac((h && P.GOREVLER.some(g => g.id === h[1]) && h[1]) || ilk || (P.GOREVLER.find(g => !kayit.yildiz[g.id]) || P.GOREVLER[0]).id);
})();
