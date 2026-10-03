// Kodlayalım — Profilim
(function () {
    'use strict';
    const K = window.Katalog;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    let profil = KL.oku('profil', {});

    function toplamYildiz() { return K.PARCALAR.reduce((t, p) => t + p.yildiz().reduce((a, b) => a + b, 0), 0); }

    function ciz() {
        const ad = profil.ad || '';
        $('ad').value = ad; $('sinif').value = profil.sinif || ''; $('no').value = profil.no || '';
        $('avatar').textContent = ad ? ad.trim()[0].toLocaleUpperCase('tr') : '?';
        $('adBaslik').textContent = ad ? `Merhaba ${ad.split(' ')[0]}!` : 'Merhaba! Önce adını yaz.';
        $('sinifYazi').textContent = profil.sinif ? '· ' + profil.sinif : '';
        const y = toplamYildiz(), u = K.unvan(y);
        $('toplamYildiz').textContent = y;
        $('unvan').textContent = u.ad;
        $('unvanBar').style.width = (u.sonraki ? Math.round(u.sonraki.oran * 100) : 100) + '%';
        $('unvanSonraki').textContent = u.sonraki ? `"${u.sonraki.ad}" unvanına ${u.sonraki.kalan} yıldız kaldı` : 'En yüksek unvana ulaştın!';

        // Rozetler
        const kazanilan = K.ROZETLER.filter(r => r.kosul());
        $('rozetSay').textContent = `${kazanilan.length} / ${K.ROZETLER.length}`;
        $('rozetler').innerHTML = K.ROZETLER.map(r => `
            <div class="rozet ${kazanilan.includes(r) ? 'var' : ''}" title="${r.aciklama}">
                <div class="ik"><i class="fas ${r.ikon}"></i></div><b>${r.ad}</b><small>${r.aciklama}</small></div>`).join('');

        // Etkinlikler
        $('parcalar').innerHTML = K.PARCALAR.map(p => {
            const y = p.yildiz(), t = y.reduce((a, b) => a + b, 0), biten = y.filter(x => x > 0).length;
            return `<a class="parca" href="${p.url}">
                <span class="ik" style="background:${p.etkinlik.renk}"><i class="fas ${p.etkinlik.ikon}"></i></span>
                <span class="bilgi"><b>${p.etkinlik.parcalar.length > 1 ? p.etkinlik.ad + ' · ' + p.ad : p.ad}</b>
                <small>${biten}/${p.seviye} bölüm · ${t} yıldız</small>
                <div class="mini"><div style="width:${Math.round(biten / p.seviye * 100)}%"></div></div></span></a>`;
        }).join('');

        gorevlerCiz();
        raporCiz();
    }

    function raporCiz() {
        const kod = K.raporOlustur(profil);
        $('kod').value = kod;
        $('qr').innerHTML = QR.svg(kod, 200);
    }

    // Görevler (öğretmenin gönderdiği görev linkleriyle eklenir)
    function gorevlerCiz() {
        const gorevler = KL.oku('gorevler', []);
        $('gorevKart').hidden = !gorevler.length;
        $('gorevler').innerHTML = gorevler.map(g => {
            const parcalar = g.p.map(K.parca).filter(Boolean);
            const bitti = parcalar.every(p => p.yildiz().every(x => x > 0));
            return `<div class="gorev"><h3><span>${kacis(g.b)}</span>${bitti ? '<span class="done"><i class="fas fa-circle-check"></i> Tamamlandı</span>' : ''}</h3>
                <div class="parcalar" style="margin-top:10px">${parcalar.map(p => {
                    const y = p.yildiz(), biten = y.filter(x => x > 0).length;
                    return `<a class="parca" href="${p.url}"><span class="ik" style="background:${p.etkinlik.renk}"><i class="fas ${p.etkinlik.ikon}"></i></span>
                        <span class="bilgi"><b>${p.etkinlik.parcalar.length > 1 ? p.etkinlik.ad + ' · ' + p.ad : p.ad}</b><small>${biten}/${p.seviye} bölüm</small>
                        <div class="mini"><div style="width:${Math.round(biten / p.seviye * 100)}%"></div></div></span></a>`;
                }).join('')}</div>
                <div style="margin-top:10px"><a class="btn btn-sm ${bitti ? 'btn-ok' : ''}" href="gorev.html#g=${g.kod}"><i class="fas fa-paper-plane"></i> ${bitti ? 'Görevi teslim et' : 'Görev sayfası'}</a></div></div>`;
        }).join('');
    }

    $('form').addEventListener('submit', (e) => {
        e.preventDefault();
        profil = { ad: $('ad').value.trim(), sinif: $('sinif').value.trim().toLocaleUpperCase('tr'), no: $('no').value.trim() };
        KL.yaz('profil', profil);
        KL.bildir('Kaydedildi!');
        KL.ses('dogru');
        ciz();
    });

    $('kopyala').addEventListener('click', async () => {
        if (!profil.ad) { KL.bildir('Önce adını yazıp kaydet.'); $('ad').focus(); return; }
        try { await navigator.clipboard.writeText($('kod').value); KL.bildir('Kod kopyalandı! Öğretmenine gönderebilirsin.'); }
        catch (e) { $('kod').select(); KL.bildir('Kodu seçtim, Ctrl+C ile kopyala.'); }
    });
    if (navigator.share) {
        $('paylas').hidden = false;
        $('paylas').addEventListener('click', () => {
            if (!profil.ad) { KL.bildir('Önce adını yazıp kaydet.'); return; }
            navigator.share({ title: 'Kodlayalım ilerlemem', text: `${profil.ad} (${profil.sinif || ''}) Kodlayalım ilerleme kodu:\n${$('kod').value}` }).catch(() => {});
        });
    }

    $('belgeBtn').addEventListener('click', () => {
        if (!profil.ad) { KL.bildir('Belgeye adının yazılması için önce adını kaydet.'); $('ad').focus(); return; }
        const y = toplamYildiz(), u = K.unvan(y);
        const kazanilan = K.ROZETLER.filter(r => r.kosul());
        const biten = K.PARCALAR.reduce((t, p) => t + p.yildiz().filter(x => x > 0).length, 0);
        $('bAd').textContent = profil.ad;
        $('bMetin').innerHTML = `${profil.sinif ? kacis(profil.sinif) + ' sınıfı öğrencisi olarak ' : ''}Kodlayalım etkinliklerinde <b>${biten} bölümü</b> tamamlayıp <b>${y} yıldız</b> toplamış ve <b>"${u.ad}"</b> unvanını kazanmıştır.`;
        $('bRozet').innerHTML = kazanilan.map(r => `<span>★ ${r.ad}</span>`).join('');
        $('bTarih').textContent = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        window.print();
    });

    ciz();
})();
