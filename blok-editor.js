// Kodlayalım — genel blok editörü (olay tabanlı)
// Çalışma alanı, her biri bir olay (şapka) bloğuyla başlayan betiklerden oluşur.
// Fare, dokunmatik ekran ve akıllı tahtada çalışır (Pointer Events).
//
// Blok tanımı: TANIM[tür] = { renk, kategori, sapka?: true, c?: 1|2, ust2?: 'değilse', parca: [...] }
//   parca: ['m', metin] | ['n', alan, varsayılan] sayı | ['t', alan, varsayılan] metin |
//          ['s', alan, varsayılan, seçenekler | () => seçenekler]  seçenek: [değer, etiket]
// Model: [{ t: şapkaTürü, ...alanlar, govde: [ { t, ...alanlar, govde?, govde2? } ] }]
(function (root) {
    'use strict';

    const kacis = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

    function BlokEditor(ayar) {
        const { kutu, alan, tanim } = ayar;
        let model = [];
        let izinli = ayar.izinli || Object.keys(tanim);
        let surukle = null;
        const imlec = document.createElement('div');
        imlec.className = 'be-imlec';

        // ---------- Düğüm ----------
        function yeni(t) {
            const T = tanim[t], d = { t };
            for (const p of T.parca) {
                if (p[0] === 'n' || p[0] === 't') d[p[1]] = p[2];
                if (p[0] === 's') d[p[1]] = p[2] !== undefined ? p[2] : (secenekler(p)[0] || [''])[0];
            }
            if (T.sapka || T.c) d.govde = [];
            if (T.c === 2) d.govde2 = [];
            return d;
        }
        const secenekler = (p) => (typeof p[3] === 'function' ? p[3]() : p[3]) || [];

        // ---------- HTML ----------
        function html(d, yol, kutuda) {
            const T = tanim[d.t];
            if (!T) return '';
            const ti = kutuda ? 'tabindex="-1"' : '';
            const parcalar = T.parca.map(p => {
                const [tur, a] = p;
                if (tur === 'm') return `<span>${a}</span>`;
                if (tur === 'n') return `<input class="be-n" data-alan="${a}" value="${kacis(d[a])}" inputmode="decimal" aria-label="${a}" ${ti}>`;
                if (tur === 't') return `<input class="be-t" data-alan="${a}" value="${kacis(d[a])}" aria-label="${a}" ${ti}>`;
                if (tur === 's') return `<select data-alan="${a}" aria-label="${a}" ${ti}>${secenekler(p).map(([v, et]) => `<option value="${kacis(v)}" ${String(v) === String(d[a]) ? 'selected' : ''}>${et}</option>`).join('')}</select>`;
                return '';
            }).join('');
            const liste = (anahtar, l) => `<div class="be-liste" data-liste="${yol}.${anahtar}">${(l || []).map((x, j) => html(x, `${yol}.${anahtar}.${j}`, kutuda)).join('')}</div>`;
            let ic = '';
            if (T.c) {
                ic = `<div class="be-ic">${liste('g', d.govde)}</div>`;
                if (T.c === 2) ic += `<div class="be-ara"><span>${T.ust2 || 'değilse'}</span></div><div class="be-ic">${liste('g2', d.govde2)}</div>`;
                ic += '<div class="be-alt"></div>';
            }
            if (T.sapka) ic = kutuda ? "" : `<div class="be-yigin">${liste('g', d.govde)}</div>`;
            return `<div class="be-blk ${T.c ? 'be-c' : ''} ${T.sapka ? 'be-sapka' : ''}" style="--b:${T.renk}" data-yol="${yol}" ${kutuda ? `data-tip="${d.t}"` : ''}><div class="be-ust">${parcalar}</div>${ic}</div>`;
        }

        function kutuCiz() {
            const gruplar = {};
            for (const t of izinli) { const k = tanim[t].kategori; (gruplar[k] = gruplar[k] || []).push(t); }
            const sira = ayar.kategoriler || Object.keys(gruplar);
            kutu.innerHTML = sira.filter(k => gruplar[k]).map(k => `<h3>${k}</h3>` + gruplar[k].map(t => html(yeni(t), 'kutu', true)).join('')).join('');
        }
        function alanCiz() {
            alan.innerHTML = `<div class="be-kok">${model.map((d, i) => html(d, String(i), false)).join('')}</div>` +
                (model.length ? '' : `<div class="be-bos"><i class="fas fa-hand-pointer"></i> ${ayar.bosMetin || 'Bir olay bloğunu buraya sürükle'}</div>`);
        }
        function ciz() { kutuCiz(); alanCiz(); }

        // ---------- Yol ----------
        function listeAl(yol) {
            if (yol === '') return model;
            const p = yol.split('.');
            let l = model;
            for (let i = 0; i < p.length; i += 2) { const d = l[+p[i]]; l = p[i + 1] === 'g2' ? d.govde2 : d.govde; }
            return l;
        }
        function konum(yol) {
            const p = yol.split('.');
            const sira = +p.pop();
            return { liste: listeAl(p.join('.')), sira };
        }
        const dugum = (yol) => { const k = konum(yol); return k.liste[k.sira]; };

        // ---------- Sürükle bırak ----------
        function basla(e) {
            const ust = e.target.closest('.be-ust');
            if (!ust || e.target.closest('input, select') || ayar.kilitli?.()) return;
            const blk = ust.parentElement;
            e.preventDefault();
            const r = blk.getBoundingClientRect();
            surukle = { blk, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, basladi: false, kutudan: !!blk.dataset.tip };
        }
        kutu.addEventListener('pointerdown', basla);
        alan.addEventListener('pointerdown', basla);

        window.addEventListener('pointermove', (e) => {
            if (!surukle) return;
            if (!surukle.basladi) {
                if (Math.hypot(e.clientX - surukle.x0, e.clientY - surukle.y0) < 5) return;
                surukle.basladi = true;
                if (surukle.kutudan) surukle.d = yeni(surukle.blk.dataset.tip);
                else { const k = konum(surukle.blk.dataset.yol); surukle.d = k.liste.splice(k.sira, 1)[0]; alanCiz(); }
                const h = document.createElement('div');
                h.className = 'be-hayalet';
                h.innerHTML = html(surukle.d, 'h', true);
                document.body.appendChild(h);
                surukle.h = h;
                if (root.KL) root.KL.ses('tik');
            }
            surukle.h.style.left = (e.clientX - surukle.dx) + 'px';
            surukle.h.style.top = (e.clientY - surukle.dy) + 'px';
            surukle.hedef = birakmaYeri(e.clientX, e.clientY);
            kutu.classList.toggle('be-sil', !surukle.kutudan && icinde(kutu, e.clientX, e.clientY));
        });

        window.addEventListener('pointerup', (e) => {
            if (!surukle) return;
            const s = surukle;
            surukle = null;
            imlec.remove();
            kutu.classList.remove('be-sil');
            if (!s.basladi) return;
            s.h.remove();
            const sapka = !!tanim[s.d.t].sapka;
            if (s.hedef) listeAl(s.hedef.liste).splice(s.hedef.sira, 0, s.d);
            else if (sapka && icinde(alan, e.clientX, e.clientY)) model.push(s.d);
            else if (!s.kutudan && !icinde(kutu, e.clientX, e.clientY)) {
                // Boşluğa bırakılan blok kaybolmasın: son betiğin sonuna eklenir
                if (model.length && !sapka) model[model.length - 1].govde.push(s.d);
                else if (sapka) model.push(s.d);
                else if (ayar.uyari) ayar.uyari('Blokları bir olay bloğunun altına bırak.');
            } else if (!s.kutudan && root.KL) root.KL.ses('yanlis');
            else if (s.kutudan && !sapka && ayar.uyari && icinde(alan, e.clientX, e.clientY)) ayar.uyari('Bu bloğu bir olay bloğunun (sarı şapkalı) altına bırak.');
            degisti(true);
        });

        const icinde = (el, x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };

        function birakmaYeri(x, y) {
            if (!icinde(alan, x, y)) { imlec.remove(); return null; }
            const sapka = !!tanim[surukle.d.t].sapka;
            if (sapka) {
                // Şapka blokları betiklerin arasına girer
                const yiginlar = [...alan.querySelectorAll('.be-kok > .be-blk')];
                let sira = yiginlar.findIndex(b => y < b.getBoundingClientRect().top + 20);
                if (sira < 0) sira = yiginlar.length;
                imlecKoy(alan.querySelector('.be-kok'), yiginlar, sira);
                return { liste: '', sira };
            }
            let enIyi = null;
            for (const l of alan.querySelectorAll('.be-liste')) {
                const r = l.getBoundingClientRect();
                if (x >= r.left - 14 && x <= r.right + 140 && y >= r.top - 10 && y <= r.bottom + 10) {
                    const der = l.dataset.liste.split('.').length;
                    if (!enIyi || der > enIyi.der) enIyi = { l, der };
                }
            }
            if (!enIyi) { imlec.remove(); return null; }
            const l = enIyi.l;
            const cocuk = [...l.children].filter(c => c.classList.contains('be-blk'));
            let sira = cocuk.findIndex(c => { const r = c.querySelector('.be-ust').getBoundingClientRect(); return y < r.top + r.height / 2; });
            if (sira < 0) sira = cocuk.length;
            imlecKoy(l, cocuk, sira);
            return { liste: l.dataset.liste, sira };
        }
        function imlecKoy(l, cocuk, sira) {
            const ar = alan.getBoundingClientRect(), lr = l.getBoundingClientRect();
            const top = !cocuk.length ? lr.top + 2 : sira < cocuk.length ? cocuk[sira].getBoundingClientRect().top - 3 : cocuk[cocuk.length - 1].getBoundingClientRect().bottom;
            imlec.style.left = (lr.left - ar.left + alan.scrollLeft) + 'px';
            imlec.style.top = (top - ar.top + alan.scrollTop) + 'px';
            if (!imlec.isConnected) alan.appendChild(imlec);
        }

        // ---------- Girdiler ----------
        alan.addEventListener('input', (e) => {
            const g = e.target.closest('[data-alan]'), blk = e.target.closest('.be-blk');
            if (!g || !blk) return;
            const d = dugum(blk.dataset.yol);
            d[g.dataset.alan] = g.tagName === 'SELECT' ? g.value : g.value;
            g.classList.remove('be-hata');
            degisti(false);
        });

        function degisti(yeniden) {
            if (yeniden) alanCiz();
            if (ayar.degisti) ayar.degisti(model);
        }

        // Sayı alanlarını sayıya çevir; hatalı olanları işaretle
        function derle() {
            const hatalar = [];
            const cevir = (d, yol) => {
                const c = { ...d };
                for (const p of tanim[d.t].parca) {
                    if (p[0] !== 'n') continue;
                    const ham = String(d[p[1]]).trim().replace(',', '.');
                    if (/^-?\d+(\.\d+)?$/.test(ham)) c[p[1]] = parseFloat(ham);
                    else hatalar.push({ yol, alan: p[1], mesaj: `"${ham}" bir sayı değil.` });
                }
                if (d.govde) c.govde = d.govde.map((x, j) => cevir(x, `${yol}.g.${j}`));
                if (d.govde2) c.govde2 = d.govde2.map((x, j) => cevir(x, `${yol}.g2.${j}`));
                return c;
            };
            const m = model.map((d, i) => cevir(d, String(i)));
            for (const h of hatalar) {
                const el = alan.querySelector(`.be-blk[data-yol="${h.yol}"] > .be-ust [data-alan="${h.alan}"]`);
                if (el) el.classList.add('be-hata');
            }
            return { model: m, hatalar };
        }

        return {
            yukle(m) { model = JSON.parse(JSON.stringify(m || [])); ciz(); },
            model: () => model,
            derle,
            izinliAyarla(l) { izinli = l; kutuCiz(); },
            yenile: ciz,
            vurgula(yollar) {
                alan.querySelectorAll('.be-calisiyor').forEach(x => x.classList.remove('be-calisiyor'));
                for (const y of yollar || []) { const el = alan.querySelector(`.be-blk[data-yol="${y}"]`); if (el) el.classList.add('be-calisiyor'); }
            }
        };
    }

    root.BlokEditor = BlokEditor;
})(typeof window !== 'undefined' ? window : globalThis);
