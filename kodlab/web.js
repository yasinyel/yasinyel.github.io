// Kodlayalım — Web Atölyesi arayüzü
(function () {
    'use strict';
    const W = window.Web;
    const $ = (id) => document.getElementById(id);
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('web', { yildiz: {}, kod: {}, cozumBakti: {} });
    let no = 0, sekme = 'html', kod = { html: '', css: '' }, bitti = false, zaman = null;
    const jsVar = () => W.BOLUMLER[no].js !== undefined;
    const baslangic = (b) => b.js !== undefined ? { html: b.html, css: b.css, js: b.js } : { html: b.html, css: b.css };

    const acikMi = (i) => ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0;
    function bolumleriCiz() {
        $('levels').innerHTML = W.BOLUMLER.map((b, i) => {
            const y = kayit.yildiz[i] || 0;
            return `<button class="lvl ${i === no ? 'active' : ''} ${y ? 'done' : ''} ${acikMi(i) ? '' : 'locked'}" data-i="${i}" title="${i + 1}. ${b.ad}">${acikMi(i) ? i + 1 : '<i class="fas fa-lock" style="font-size:.75em"></i>'}${y ? KL.yildizHTML(y) : ''}</button>`;
        }).join('');
    }
    $('levels').onclick = (e) => {
        const b = e.target.closest('.lvl'); if (!b) return;
        if (!acikMi(+b.dataset.i)) { KL.bildir('Önce önceki bölümü bitir!'); return; }
        ac(+b.dataset.i);
    };

    function ac(i) {
        no = i; bitti = false;
        const b = W.BOLUMLER[i];
        $('baslik').textContent = `${i + 1}. ${b.ad}`;
        $('anlatim').innerHTML = b.anlatim;
        kod = kayit.kod[i] ? { ...baslangic(b), ...kayit.kod[i] } : baslangic(b);
        $('jsSekme').hidden = b.js === undefined;
        $('onizBaslik').textContent = b.js === undefined ? 'Önizleme (JavaScript kapalı)' : 'Önizleme (JavaScript açık)';
        $('onizleme').setAttribute('sandbox', b.js === undefined ? 'allow-same-origin' : 'allow-same-origin allow-scripts');
        sekmeSec(b.js !== undefined ? (sekme === 'css' ? 'css' : sekme === 'js' ? 'js' : 'html') : sekme === 'js' ? 'html' : (kod.css || b.css ? sekme : 'html'));
        bolumleriCiz();
        onizle();
    }

    // ---------- Editör ----------
    const kacis = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    function renklendirHTML(s) {
        return kacis(s)
            .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="t-yorum">$1</span>')
            .replace(/(&lt;\/?)([a-zA-Z0-9]+)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)(\s*\/?&gt;)/g, (m, a, ad, oz, b) =>
                `<span class="t-etiket">${a}${ad}</span>${oz.replace(/([a-zA-Z-]+)(="[^"]*")?/g, (x, o, d) => `<span class="t-ozn">${o}</span>${d ? `<span class="t-deger">${d}</span>` : ''}`)}<span class="t-etiket">${b}</span>`);
    }
    function renklendirCSS(s) {
        return kacis(s)
            .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="t-yorum">$1</span>')
            .replace(/([^{}\n][^{}]*?)(\s*\{)/g, (m, sec, p) => /t-yorum/.test(sec) ? m : `<span class="t-secici">${sec}</span>${p}`)
            .replace(/([a-z-]+)(\s*:\s*)([^;{}\n]+)(;?)/g, '<span class="t-css-ozn">$1</span>$2<span class="t-css-deger">$3</span>$4');
    }
    function renklendirJS(s) {
        return kacis(s).replace(/(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(const|let|var|function|if|else|for|of|in|while|return|true|false|null|new)\b|\b(\d+(?:\.\d+)?)\b/g, (m, yorum, metin, anahtar, sayi) =>
            yorum ? `<span class="t-yorum">${yorum}</span>` : metin ? `<span class="t-deger">${metin}</span>` : anahtar ? `<span class="t-etiket">${anahtar}</span>` : `<span class="t-css-deger">${sayi}</span>`);
    }
    function editorCiz() {
        const v = $('kod').value;
        $('renkli').innerHTML = (sekme === 'html' ? renklendirHTML(v) : sekme === 'js' ? renklendirJS(v) : renklendirCSS(v)) + '\n';
        const satir = v.split('\n').length;
        $('no').innerHTML = Array.from({ length: satir }, (_, i) => `<div>${i + 1}</div>`).join('');
    }
    function sekmeSec(s) {
        sekme = s;
        document.querySelectorAll('#sekmeler button').forEach(b => b.classList.toggle('sel', b.dataset.s === s));
        $('kod').value = kod[s];
        editorCiz();
    }
    $('sekmeler').onclick = (e) => { const b = e.target.closest('button'); if (b) sekmeSec(b.dataset.s); };
    $('kod').addEventListener('input', () => {
        kod[sekme] = $('kod').value;
        editorCiz();
        kayit.kod[no] = kod; KL.yaz('web', kayit);
        clearTimeout(zaman); zaman = setTimeout(onizle, 350);
    });
    $('kod').addEventListener('scroll', () => { $('renkli').scrollTop = $('kod').scrollTop; $('no').scrollTop = $('kod').scrollTop; });
    // Kolaylık: Tab ile girinti, ">" yazınca kapanış etiketini otomatik ekle
    $('kod').addEventListener('keydown', (e) => {
        const ta = $('kod');
        if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); return; }
        if (e.key === '>' && sekme === 'html') {
            const once = ta.value.slice(0, ta.selectionStart);
            const m = once.match(/<([a-zA-Z][a-zA-Z0-9]*)(\s[^<>]*)?$/);
            const bos = ['img', 'br', 'hr', 'input', 'meta', 'link'];
            if (m && !bos.includes(m[1].toLowerCase()) && !/\/$/.test(once)) {
                e.preventDefault();
                const yer = ta.selectionStart + 1;
                ta.setRangeText(`></${m[1]}>`, ta.selectionStart, ta.selectionEnd, 'start');
                ta.setSelectionRange(yer, yer);
                ta.dispatchEvent(new Event('input'));
            }
        }
        if (e.key === '{' && (sekme === 'css' || sekme === 'js')) {
            e.preventDefault();
            const yer = ta.selectionStart;
            ta.setRangeText('{\n  \n}', yer, ta.selectionEnd, 'start');
            ta.setSelectionRange(yer + 4, yer + 4);
            ta.dispatchEvent(new Event('input'));
        }
    });

    // ---------- Önizleme ve denetim ----------
    function onizle() {
        const f = $('onizleme');
        const belge = W.belge(kod.html, kod.css, jsVar() ? kod.js : undefined);
        if (jsVar()) {
            // JavaScript bölümlerinde denetimler düğmelere tıklar; öğrencinin önizlemesi bozulmasın diye görünmez bir kopyada çalışır
            f.onload = null;
            let g = $('denetimCerceve');
            if (!g) {
                g = document.createElement('iframe'); g.id = 'denetimCerceve'; g.setAttribute('aria-hidden', 'true'); g.tabIndex = -1;
                g.style.cssText = `position:fixed;left:-10000px;top:0;width:${f.clientWidth || 600}px;height:300px;border:0;visibility:hidden`;
                document.body.appendChild(g);
            }
            g.setAttribute('sandbox', 'allow-same-origin allow-scripts');
            g.onload = denetle;
            g.srcdoc = belge;
        } else f.onload = denetle;
        f.srcdoc = belge;
    }
    // Sık görülen JavaScript hatalarını Türkçe açıklar
    function jsHataTr(m) {
        let x;
        if ((x = /(\w+) is not defined/.exec(m))) return `"${x[1]}" tanımlı değil. Yazımını kontrol et ya da önce const/let ile tanımla.`;
        if (/Cannot read properties of null|Cannot set properties of null/.test(m)) return 'Öğe bulunamadı: getElementById içindeki id, HTML\'deki id ile aynı mı?';
        if ((x = /(\S+) is not a function/.exec(m))) return `${x[1]} bir fonksiyon değil. Yazımını kontrol et.`;
        if (/Assignment to constant/.test(m)) return 'const ile tanımlanan değişken değiştirilemez; değişecekse let kullan.';
        if (/SyntaxError/.test(m)) return 'Yazım hatası: parantez, tırnak ya da süslü parantez eksik olabilir.';
        return m;
    }
    function denetle() {
        const b = W.BOLUMLER[no];
        let d, w;
        const cerceve = jsVar() ? $('denetimCerceve') : $('onizleme');
        try { d = cerceve.contentDocument; w = cerceve.contentWindow; } catch (e) { return; }
        if (!d) return;
        const hatalar = jsVar() ? [...(w.__hatalar || [])] : [];
        const sonuc = b.gorevler.map(g => { try { return !!g.kontrol(d, w); } catch (e) { return false; } });
        $('jsHata').hidden = !hatalar.length;
        $('jsHata').textContent = hatalar.length ? '⚠ ' + jsHataTr(hatalar[0]) : '';
        $('jsHata').title = hatalar[0] || '';
        const onceki = [...document.querySelectorAll('#gorevler li')].map(li => li.classList.contains('tamam'));
        $('gorevler').innerHTML = b.gorevler.map((g, i) => `<li class="${sonuc[i] ? 'tamam' : ''}"><i class="fas ${sonuc[i] ? 'fa-circle-check' : 'fa-circle'}"></i><span>${g.ad}</span></li>`).join('');
        if (sonuc.some((s, i) => s && onceki.length && !onceki[i])) KL.ses('tik');
        if (sonuc.every(Boolean) && !bitti) {
            bitti = true;
            const y = kayit.cozumBakti[no] ? 2 : 3;
            kayit.yildiz[no] = Math.max(kayit.yildiz[no] || 0, y);
            KL.yaz('web', kayit);
            bolumleriCiz();
            $('kBaslik').textContent = y === 3 ? 'Harika bir sayfa!' : 'Görevler tamam!';
            $('kYildiz').innerHTML = KL.yildizHTML(y);
            $('kMetin').textContent = y === 3 ? 'Bütün görevleri kendi başına tamamladın.' : 'Örnek çözüme baktığın için 2 yıldız. Tekrar kendin yazarak 3 yıldız alabilirsin!';
            $('kSonraki').hidden = no === W.BOLUMLER.length - 1;
            if (y === 3) KL.konfeti(); else KL.ses('kazan');
            setTimeout(() => $('kazandi').showModal(), 500);
        }
    }

    $('sifirla').onclick = () => {
        if (!confirm('Bu bölümdeki kodun başlangıç haline dönsün mü?')) return;
        const b = W.BOLUMLER[no];
        kod = baslangic(b); kayit.kod[no] = kod; KL.yaz('web', kayit);
        bitti = false; sekmeSec(sekme); onizle();
    };
    $('cozum').onclick = () => {
        if (!confirm('Örnek çözüm kodunun yerine geçecek ve bu bölümden en fazla 2 yıldız alabileceksin. Emin misin?')) return;
        kayit.cozumBakti[no] = true;
        kod = { ...W.BOLUMLER[no].cozum }; kayit.kod[no] = kod; KL.yaz('web', kayit);
        sekmeSec(sekme); onizle();
    };
    $('kKal').onclick = () => $('kazandi').close();
    $('kSonraki').onclick = () => { $('kazandi').close(); ac(no + 1); };

    const ilk = Object.keys(kayit.yildiz).length ? Math.min(Math.max(...Object.keys(kayit.yildiz).map(Number)) + 1, W.BOLUMLER.length - 1) : 0;
    ac(ilk);
    window.__web = { yaz: (h, c, j) => { kod = j === undefined ? { html: h, css: c } : { html: h, css: c, js: j }; sekmeSec(sekme); onizle(); } };
})();
