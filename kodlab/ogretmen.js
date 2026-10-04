// Kodlayalım — Öğretmen Paneli
(function () {
    'use strict';
    const K = window.Katalog;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const taban = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const parcaAdi = (p) => p.etkinlik.parcalar.length > 1 ? `${p.etkinlik.ad} · ${p.ad}` : p.ad;

    // ---------- Sekmeler ----------
    document.querySelector('.tabs').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('sel', x === b));
        ['panelGorev', 'panelSinif', 'panelBaglanti'].forEach(id => { $(id).hidden = id !== b.dataset.p; });
        if (b.dataset.p === 'panelSinif') sinifCiz();
    });

    // ---------- Görev oluştur ----------
    const KADEMELER = [['hepsi', 'Tümü', [0, 12]], ['oo', 'Okul Öncesi', [0, 0]], ['ilk', 'İlkokul', [1, 4]], ['orta', 'Ortaokul', [5, 8]], ['lise', 'Lise', [9, 12]]];
    let kademe = KL.oku('kademe', 'hepsi');
    const kademeEsle = { okuloncesi: 'oo', ilkokul: 'ilk', ortaokul: 'orta', lise: 'lise' };
    kademe = kademeEsle[kademe] || (KADEMELER.some(k => k[0] === kademe) ? kademe : 'hepsi');
    const secili = new Set();

    function secimCiz() {
        $('kademeChips').innerHTML = KADEMELER.map(([id, ad]) => `<button class="${id === kademe ? 'sel' : ''}" data-k="${id}">${ad}</button>`).join('');
        const [, , [a, b]] = KADEMELER.find(k => k[0] === kademe);
        const liste = K.PARCALAR.filter(p => p.sinif[0] <= b && p.sinif[1] >= a);
        $('secim').innerHTML = liste.map(p => `
            <label><input type="checkbox" value="${p.id}" ${secili.has(p.id) ? 'checked' : ''}>
                <span class="ik" style="background:${p.etkinlik.renk}"><i class="fas ${p.etkinlik.ikon}"></i></span>
                <span>${parcaAdi(p)}<small>${p.seviye} bölüm · ${p.sinif[0] === 0 ? 'Anasınıfı' : p.sinif[0] + '. sınıf'} – ${p.sinif[1]}. sınıf</small></span></label>`).join('');
    }
    $('kademeChips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { kademe = b.dataset.k; secimCiz(); } });
    $('secim').addEventListener('change', (e) => { if (e.target.checked) secili.add(e.target.value); else secili.delete(e.target.value); });

    $('olustur').addEventListener('click', () => {
        if (!secili.size) { KL.bildir('En az bir etkinlik seçin.'); return; }
        const g = { i: Date.now().toString(36), b: $('gBaslik').value.trim() || 'Kodlayalım görevi', o: $('gOgretmen').value.trim(), p: [...secili] };
        if (!g.o) delete g.o;
        const url = `${taban}gorev.html#g=${K.gorevKodla(g)}`;
        const gorevler = KL.oku('ogretmen.gorevler', []);
        gorevler.unshift({ ...g, url, tarih: Date.now() });
        KL.yaz('ogretmen.gorevler', gorevler.slice(0, 50));
        KL.yaz('ogretmen.ad', g.o || '');
        $('gorevSonuc').className = '';
        $('gorevSonuc').innerHTML = `<div class="qr">${QR.svg(url, 220)}</div>
            <input class="in" id="gUrl" readonly value="${kacis(url)}">
            <div class="row-actions">
                <button class="btn btn-sm" id="gKopya"><i class="fas fa-copy"></i> Linki kopyala</button>
                <button class="btn btn-sm" id="gTam"><i class="fas fa-expand"></i> Tahtada göster</button>
                <a class="btn btn-sm" href="${kacis(url)}" target="_blank" rel="noopener"><i class="fas fa-eye"></i> Önizle</a>
            </div>`;
        $('gKopya').onclick = () => kopyala(url, 'Görev linki kopyalandı.');
        $('gTam').onclick = () => tamEkran(g.b, url);
        KL.ses('dogru');
    });
    $('gOgretmen').value = KL.oku('ogretmen.ad', '');

    async function kopyala(metin, mesaj) {
        try { await navigator.clipboard.writeText(metin); KL.bildir(mesaj); }
        catch (e) { KL.bildir('Kopyalanamadı; metni seçip Ctrl+C yapın.'); }
    }
    function tamEkran(baslik, url) {
        $('tamBaslik').textContent = baslik;
        $('tamQr').innerHTML = QR.svg(url, Math.min(innerHeight - 260, innerWidth - 80, 520));
        $('tamUrl').textContent = url.length > 70 ? url.replace(/#.*/, '#…') : url;
        $('tamEkran').showModal();
    }
    $('tamKapat').addEventListener('click', () => $('tamEkran').close());

    // ---------- Sınıfım ----------
    let ogrenciler = KL.oku('ogretmen.sinif', {});
    let siralama = { alan: 'ad', ters: false };
    const anahtar = (r) => `${(r.ad || '').toLocaleLowerCase('tr').trim()}|${(r.sinif || '').toLocaleUpperCase('tr').trim()}`;

    function kodlariEkle(metin) {
        const bulunan = metin.match(/KL1\.[A-Za-z0-9_-]+\.[0-9a-z]{4}/g) || [];
        let eklenen = 0, hatali = 0;
        for (const k of bulunan) {
            const r = K.raporOku(k);
            if (!r || r.hata || !r.ad) { hatali++; continue; }
            const key = anahtar(r), eski = ogrenciler[key];
            if (!eski || eski.zaman <= r.zaman) {
                // Görev teslimlerini birleştir
                const gorevler = new Set([...(eski?.gorevler || []), ...(r.gorev ? [r.gorev] : [])]);
                ogrenciler[key] = { ...r, gorevler: [...gorevler] };
                eklenen++;
            }
        }
        KL.yaz('ogretmen.sinif', ogrenciler);
        return { eklenen, hatali, toplam: bulunan.length };
    }

    $('ekle').addEventListener('click', () => {
        const s = kodlariEkle($('kodlar').value);
        if (!s.toplam) { KL.bildir('Metinde KL1 ile başlayan kod bulunamadı.'); return; }
        KL.bildir(`${s.eklenen} öğrenci eklendi/güncellendi${s.hatali ? `, ${s.hatali} kod hatalı` : ''}.`, 3000);
        $('kodlar').value = '';
        KL.ses('dogru');
        sinifCiz();
    });

    function sinifCiz() {
        const liste = Object.values(ogrenciler);
        // Filtreler
        const siniflar = [...new Set(liste.map(r => r.sinif).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr', { numeric: true }));
        const fs = $('fSinif').value;
        $('fSinif').innerHTML = '<option value="">Bütün sınıflar</option>' + siniflar.map(s => `<option ${s === fs ? 'selected' : ''}>${kacis(s)}</option>`).join('');
        const gorevler = KL.oku('ogretmen.gorevler', []);
        const fg = $('fGorev').value;
        $('fGorev').innerHTML = '<option value="">Bütün etkinlikler</option>' + gorevler.map(g => `<option value="${g.i}" ${g.i === fg ? 'selected' : ''}>Görev: ${kacis(g.b)}</option>`).join('');
        const ara = $('fAra').value.toLocaleLowerCase('tr');
        const gorev = gorevler.find(g => g.i === $('fGorev').value);

        let rows = liste.filter(r => (!$('fSinif').value || r.sinif === $('fSinif').value) && (!ara || r.ad.toLocaleLowerCase('tr').includes(ara)));
        // Sütunlar: görev seçiliyse onun parçaları, değilse herhangi bir öğrencinin ilerlediği parçalar
        const parcalar = gorev ? gorev.p.map(K.parca).filter(Boolean) : K.PARCALAR.filter(p => rows.some(r => r.ilerleme[p.id]));
        const yildizlar = (r, p) => (r.ilerleme[p.id] || '').padEnd(p.seviye, '0').split('').map(Number);
        const toplamY = (r) => parcalar.reduce((t, p) => t + yildizlar(r, p).reduce((a, b) => a + b, 0), 0);
        const tamamlanan = (r) => parcalar.reduce((t, p) => t + yildizlar(r, p).filter(x => x > 0).length, 0);
        const toplamBolum = parcalar.reduce((t, p) => t + p.seviye, 0);
        // İpucu kullanımı: [ipucu alınan bölüm, çözümü görülen bölüm]
        const ipucu = (r) => Object.values(r.ipucu || {}).reduce((t, [a, c]) => [t[0] + a, t[1] + c], [0, 0]);
        const ipucuDetay = (r) => Object.entries(r.ipucu || {}).map(([e, [a, c]]) => `${(K.ETKINLIKLER.find(x => x.id === e) || { ad: e }).ad}: ${a} bölümde ipucu, ${c} bölümde çözüm`).join('\n') || 'İpucu kullanmadı';

        const deger = { ad: r => r.ad, sinif: r => r.sinif, zaman: r => r.zaman, toplam: toplamY, ipucu: r => ipucu(r)[0] * 100 + ipucu(r)[1] };
        parcalar.forEach(p => { deger[p.id] = r => yildizlar(r, p).filter(x => x > 0).length; });
        const f = deger[siralama.alan] || deger.ad;
        rows.sort((a, b) => { const x = f(a), y = f(b); const c = typeof x === 'string' ? x.localeCompare(y, 'tr', { numeric: true }) : x - y; return siralama.ters ? -c : c; });

        // Özet
        const ort = rows.length ? Math.round(rows.reduce((t, r) => t + tamamlanan(r), 0) / rows.length / (toplamBolum || 1) * 100) : 0;
        const biten = gorev ? rows.filter(r => tamamlanan(r) === toplamBolum).length : rows.filter(r => r.gorevler?.length).length;
        $('statlar').innerHTML = `
            <div class="stat"><b>${rows.length}</b><span>Öğrenci</span></div>
            <div class="stat"><b>%${ort}</b><span>Ortalama tamamlama</span></div>
            <div class="stat"><b>${biten}</b><span>${gorev ? 'Görevi bitiren' : 'Görev teslim eden'}</span></div>
            <div class="stat"><b>${rows.length ? Math.round(rows.reduce((t, r) => t + toplamY(r), 0) / rows.length) : 0}</b><span>Ortalama yıldız</span></div>`;

        if (!liste.length) {
            $('tablo').innerHTML = '<tr><td class="bos">Henüz öğrenci yok. Öğrencilerden gelen kodları yukarıya yapıştırın ya da kamerayla QR okutun.</td></tr>';
            return;
        }
        const ok = (alan) => siralama.alan === alan ? (siralama.ters ? ' ▼' : ' ▲') : '';
        $('tablo').innerHTML = `<thead><tr>
            <th data-s="ad">Öğrenci${ok('ad')}</th><th data-s="sinif">Sınıf${ok('sinif')}</th>
            ${parcalar.map(p => `<th data-s="${p.id}" title="${kacis(parcaAdi(p))}">${kacis(parcaAdi(p).replace('Bilgisayar Sensin · ', 'Sensin · '))}${ok(p.id)}</th>`).join('')}
            <th data-s="toplam">Yıldız${ok('toplam')}</th><th data-s="ipucu" title="İpucu alınan bölüm / çözümü görülen bölüm">İpucu${ok('ipucu')}</th><th data-s="zaman">Güncelleme${ok('zaman')}</th><th></th></tr></thead><tbody>` +
            rows.map(r => `<tr>
                <td><b>${kacis(r.ad)}</b>${r.no ? ` <small style="color:var(--muted)">${kacis(r.no)}</small>` : ''}</td><td>${kacis(r.sinif)}</td>
                ${parcalar.map(p => { const y = yildizlar(r, p), b = y.filter(x => x > 0).length; return `<td class="p" title="Bölüm yıldızları: ${y.join(' ')}">${b}/${p.seviye}<div class="pb"><div style="width:${b / p.seviye * 100}%"></div></div></td>`; }).join('')}
                <td><b style="color:var(--gold)">★</b> ${toplamY(r)}</td>
                <td title="${kacis(ipucuDetay(r))}">${(([a, c]) => a ? `<i class="fas fa-lightbulb" style="color:var(--gold)"></i> ${a}${c ? ` <small style="color:var(--muted)">· ${c} çözüm</small>` : ''}` : '<small style="color:var(--muted)">—</small>')(ipucu(r))}</td>
                <td><small>${new Date(r.zaman).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></td>
                <td><button class="sil" data-k="${kacis(anahtar(r))}" aria-label="Sil"><i class="fas fa-xmark"></i></button></td></tr>`).join('') + '</tbody>';

        // Excel için son görünümü sakla
        sonGorunum = { rows, parcalar, yildizlar, toplamY, ipucu };
    }
    let sonGorunum = null;

    $('tablo').addEventListener('click', (e) => {
        const th = e.target.closest('th[data-s]');
        if (th) { siralama = { alan: th.dataset.s, ters: siralama.alan === th.dataset.s ? !siralama.ters : false }; sinifCiz(); return; }
        const s = e.target.closest('.sil');
        if (s && confirm('Bu öğrenci listeden silinsin mi?')) { delete ogrenciler[s.dataset.k]; KL.yaz('ogretmen.sinif', ogrenciler); sinifCiz(); }
    });
    ['fSinif', 'fGorev'].forEach(id => $(id).addEventListener('change', sinifCiz));
    $('fAra').addEventListener('input', sinifCiz);
    $('temizle').addEventListener('click', () => {
        if (!confirm('Bütün öğrenci kayıtları bu tarayıcıdan silinsin mi?')) return;
        ogrenciler = {}; KL.yaz('ogretmen.sinif', ogrenciler); sinifCiz();
    });
    $('yazdir').addEventListener('click', () => window.print());

    // Türkçe Excel noktalı virgülü ayraç olarak bekler; BOM ile Türkçe karakterler doğru açılır
    $('csv').addEventListener('click', () => {
        if (!sonGorunum || !sonGorunum.rows.length) { KL.bildir('Aktarılacak öğrenci yok.'); return; }
        const { rows, parcalar, yildizlar, toplamY, ipucu } = sonGorunum;
        const h = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
        const satirlar = [['Öğrenci', 'No', 'Sınıf', ...parcalar.map(p => `${parcaAdi(p)} (bölüm)`), ...parcalar.map(p => `${parcaAdi(p)} (yıldız)`), 'Toplam yıldız', 'İpucu alınan bölüm', 'Çözümü görülen bölüm', 'Son güncelleme'].map(h).join(';')];
        for (const r of rows) satirlar.push([r.ad, r.no, r.sinif,
            ...parcalar.map(p => `${yildizlar(r, p).filter(x => x > 0).length}/${p.seviye}`),
            ...parcalar.map(p => yildizlar(r, p).reduce((a, b) => a + b, 0)),
            toplamY(r), ipucu(r)[0], ipucu(r)[1], new Date(r.zaman).toLocaleString('tr-TR')].map(h).join(';'));
        const blob = new Blob(['﻿' + satirlar.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `kodlayalim-sinif-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });

    // ---------- Kamerayla QR okutma (destekleyen tarayıcılarda) ----------
    let akis = null, tarama = null;
    if ('BarcodeDetector' in window) {
        BarcodeDetector.getSupportedFormats().then(f => { if (f.includes('qr_code')) $('tara').hidden = false; }).catch(() => {});
    }
    $('tara').addEventListener('click', async () => {
        try {
            akis = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        } catch (e) { KL.bildir('Kameraya erişilemedi.'); return; }
        const v = $('video');
        v.srcObject = akis; await v.play();
        $('okunan').textContent = '';
        $('kamera').showModal();
        const dedektor = new BarcodeDetector({ formats: ['qr_code'] });
        const gorulen = new Set();
        tarama = setInterval(async () => {
            try {
                for (const k of await dedektor.detect(v)) {
                    if (gorulen.has(k.rawValue)) continue;
                    gorulen.add(k.rawValue);
                    const s = kodlariEkle(k.rawValue);
                    const r = K.raporOku(k.rawValue);
                    if (s.eklenen && r) { KL.ses('dogru'); $('okunan').textContent = `✓ ${r.ad} (${r.sinif}) eklendi`; }
                }
            } catch (e) {}
        }, 350);
    });
    function kameraKapat() {
        clearInterval(tarama);
        if (akis) akis.getTracks().forEach(t => t.stop());
        akis = null;
        if ($('kamera').open) $('kamera').close();
        sinifCiz();
    }
    $('kameraKapat').addEventListener('click', kameraKapat);
    $('kamera').addEventListener('close', kameraKapat);

    // ---------- Tahtada göster ----------
    const anaUrl = taban;
    $('anaQr').innerHTML = QR.svg(anaUrl, 240);
    $('anaUrl').textContent = anaUrl;
    $('anaTam').addEventListener('click', () => tamEkran('Kodlayalım\'a hoş geldiniz!', anaUrl));

    secimCiz();
    if (location.hash === '#sinif') document.querySelector('[data-p="panelSinif"]').click();
})();
