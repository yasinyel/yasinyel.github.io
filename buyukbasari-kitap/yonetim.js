/* Büyük Başarı Koleji — Okul yönetim paneli (demo) */
(function () {
  'use strict';

  const B = window.BBK;
  const { esc, tl } = B;
  const $ = (s, el) => (el || document).querySelector(s);
  const uyg = $('#uygulama');
  const GIRIS = 'bbk-yonetim-oturum';

  let girisli = false;
  try { girisli = sessionStorage.getItem(GIRIS) === '1'; } catch (e) { /* yok say */ }

  const SAYFALAR = [
    ['genel', 'Genel Bakış', 'fa-chart-pie'],
    ['veri', 'Excel ile Tanımlama', 'fa-file-excel'],
    ['siparisler', 'Siparişler', 'fa-receipt'],
    ['dagitim', 'Dağıtım Listeleri', 'fa-clipboard-list'],
    ['ogrenciler', 'Öğrenciler', 'fa-user-graduate'],
    ['setler', 'Kitaplar ve Fiyatlar', 'fa-book'],
    ['ayarlar', 'Ayarlar', 'fa-gear']
  ];

  // Sayfalar arası korunan arayüz durumu
  const U = {
    sipAra: '', sipSinif: '', sipDurum: '', sipLimit: 50,
    dagSube: '7-A',
    ogrAra: '', ogrSinif: '', ogrDurum: '', secili: new Set(),
    setSinif: ''
  };

  const rota = () => {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    const [sayfa, param] = h.split('/');
    return [SAYFALAR.some(s => s[0] === sayfa) ? sayfa : 'genel', param || null];
  };

  const durumHTML = d => {
    const x = B.DURUMLAR[d];
    return `<span class="durum ${x.cls}"><i class="fa-solid ${x.ikon}"></i> ${x.ad}</span>`;
  };
  const taksitAd = n => (n === 1 ? 'Tek çekim' : `${n} taksit`);
  const sinifSecenekleri = sec => B.SINIFLAR
    .map(g => `<option value="${g}" ${String(sec) === String(g) ? 'selected' : ''}>${g}. Sınıf</option>`).join('');

  function once(iso) {
    const dk = Math.round((Date.now() - new Date(iso).getTime()) / 6e4);
    if (dk < 1) return 'az önce';
    if (dk < 60) return `${dk} dk önce`;
    if (dk < 1440) return `${Math.floor(dk / 60)} sa önce`;
    return B.tarih(iso, { day: 'numeric', month: 'short' });
  }

  function csvIndir(ad, satirlar) {
    const metin = '﻿' + satirlar.map(r => r.map(h => {
      const v = String(h == null ? '' : h);
      return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([metin], { type: 'text/csv;charset=utf-8' }));
    a.download = ad;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  const csvSayi = n => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');

  /* ---------- Giriş ve iskelet ---------- */

  function girisEkrani() {
    uyg.innerHTML = `
      <div class="giris-ekran">
        <form class="kart" id="yonetim-giris" novalidate>
          <div class="marka marka-dikey"><img class="logo-img" src="img/logo-koyu.png" alt="Büyük Başarı Koleji" width="512" height="192"><small>Kitap Satış · Yönetim Paneli</small></div>
          <h1>Personel girişi</h1>
          <p>Muhasebe, idare ve sınıf öğretmenleri için</p>
          <div class="alan"><label for="k-ad">Kullanıcı adı</label><input id="k-ad" value="muhasebe" autocomplete="username"></div>
          <div class="alan"><label for="k-sifre">Şifre</label><input id="k-sifre" type="password" value="demo1234" autocomplete="current-password"></div>
          <button class="btn btn-birincil btn-tam btn-buyuk" style="margin-top:20px">Giriş yap <i class="fa-solid fa-arrow-right"></i></button>
          <p class="not"><i class="fa-solid fa-flask"></i> Demo bilgileri otomatik dolduruldu. Gerçek sürümde SMS ile iki adımlı doğrulama kullanılır.</p>
        </form>
      </div>`;
  }

  function iskelet() {
    uyg.innerHTML = `
      <div class="panel">
        <aside class="yan" id="yan">
          <a class="marka marka-dikey" href="#genel" aria-label="Genel bakış"><img class="logo-img" src="img/logo-beyaz.png" alt="Büyük Başarı Koleji" width="512" height="192"><small>Kitap Satış Paneli</small></a>
          <button class="mobil-menu-btn" data-act="menu" aria-label="Menüyü aç"><i class="fa-solid fa-bars"></i></button>
          <nav id="nav" aria-label="Panel menüsü"></nav>
          <div class="yan-alt">
            <span class="avatar">MB</span>
            <div><b>Muhasebe Birimi</b>Tam yetki</div>
            <button data-act="cikis" title="Çıkış" aria-label="Çıkış"><i class="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </aside>
        <main class="icerik" id="icerik"></main>
      </div>
      <div id="cekmece"></div>
      <div id="modal"></div>
      <div class="ipucu" id="ipucu" hidden></div>`;
  }

  function navGuncelle(sayfa) {
    const islemBekleyen = B.siparisler().filter(s => s.durum === 'odendi').length;
    const vermeyen = B.OGRENCILER.length - Object.keys(B.alinanlar()).length;
    $('#nav').innerHTML = SAYFALAR.map(([k, ad, ikon]) => {
      const say = k === 'siparisler' && islemBekleyen ? `<span class="say yeni" title="İşlem bekleyen">${islemBekleyen}</span>`
        : k === 'ogrenciler' ? `<span class="say" title="Sipariş vermeyen">${vermeyen}</span>` : '';
      return `<a href="#${k}" class="${k === sayfa ? 'aktif' : ''}"${k === sayfa ? ' aria-current="page"' : ''}><i class="fa-solid ${ikon}"></i> ${ad} ${say}</a>`;
    }).join('');
  }

  function render() {
    if (!girisli) return girisEkrani();
    const [sayfa, param] = rota();
    if (!$('.panel')) iskelet();
    navGuncelle(sayfa);
    ({ genel, veri, siparisler, dagitim, ogrenciler, setler, ayarlar })[sayfa](param);
  }

  const icerik = () => $('#icerik');

  /* ---------- Genel bakış ---------- */

  function niceMax(v) {
    if (v <= 0) return 1000;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }

  function genel() {
    const sip = B.siparisler();
    const aktif = sip.filter(s => s.durum !== 'iade');
    const veren = new Set(Object.keys(B.alinanlar()));
    const ciro = aktif.reduce((t, s) => t + s.toplam, 0);
    const bugun0 = new Date(); bugun0.setHours(0, 0, 0, 0);
    const bugunku = aktif.filter(s => new Date(s.tarih) >= bugun0);
    const ogrSay = B.OGRENCILER.length;
    const kapsam = veren.size / ogrSay;
    const bekleyen = aktif.filter(s => s.durum === 'odendi' || s.durum === 'hazirlaniyor').length;
    const taksitli = aktif.length ? aktif.filter(s => s.taksit > 1).length / aktif.length : 0;

    const sinifVeri = [];
    for (const g of B.SINIFLAR) {
      const ogr = B.OGRENCILER.filter(o => o.sinif === g);
      const v = ogr.filter(o => veren.has(o.no)).length;
      let c = 0;
      aktif.forEach(s => s.kalemler.forEach(k => { if (B.ogrenciByNo(k.ogrenciNo).sinif === g) c += k.fiyat; }));
      sinifVeri.push({ g, toplam: ogr.length, veren: v, oran: v / ogr.length, ciro: c });
    }

    const gunler = [];
    for (let i = 13; i >= 0; i--) {
      const bas = new Date(bugun0); bas.setDate(bas.getDate() - i);
      const son = new Date(bas); son.setDate(son.getDate() + 1);
      const g = aktif.filter(s => { const t = new Date(s.tarih); return t >= bas && t < son; });
      gunler.push({ tarih: bas, tutar: g.reduce((t, s) => t + s.toplam, 0), adet: g.length });
    }
    const max = niceMax(Math.max(...gunler.map(g => g.tutar)));
    const tikler = [0, max / 2, max];

    const cubuklar = sinifVeri.map(v => `
      <div class="cubuk-satir" data-ipucu="${esc(`<b>${v.g}. Sınıf</b><br>${v.veren} / ${v.toplam} öğrenci sipariş verdi<br><span>Satış: ${B.tlTam(v.ciro)}</span>`)}">
        <span class="c-ad">${v.g}. Sınıf</span>
        <span class="cubuk-iz"><span class="cubuk-dolgu" style="width:${(v.oran * 100).toFixed(1)}%"></span></span>
        <span class="c-deger">%${Math.round(v.oran * 100)} <small>${v.veren}/${v.toplam}</small></span>
      </div>`).join('');

    const sutunlar = gunler.map(g => `
      <div class="sutun" data-ipucu="${esc(`<b>${B.tlTam(g.tutar)}</b><br><span>${g.tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })} · ${g.adet} sipariş</span>`)}">
        <span style="height:${(g.tutar / max * 100).toFixed(1)}%"></span>
      </div>`).join('');

    const son = sip.slice(0, 7);

    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Genel Bakış</h1><p>${B.OKUL.donem} kitap satış dönemi · ${B.OKUL.kampus}</p></div>
        <span class="canli"><span class="nokta"></span> Canlı</span>
      </header>

      <div class="kpi-izgara">
        <div class="kpi"><div class="kpi-ad"><i class="fa-solid fa-turkish-lira-sign"></i> Toplam satış</div>
          <div class="kpi-deger">${B.tlTam(ciro)}</div>
          <div class="kpi-alt"><span class="arti">+${B.tlTam(bugunku.reduce((t, s) => t + s.toplam, 0))}</span> bugün</div></div>
        <div class="kpi"><div class="kpi-ad"><i class="fa-solid fa-receipt"></i> Sipariş</div>
          <div class="kpi-deger">${B.sayi(aktif.length)}</div>
          <div class="kpi-alt"><span class="arti">+${bugunku.length}</span> bugün · %${Math.round(taksitli * 100)} taksitli</div></div>
        <div class="kpi"><div class="kpi-ad"><i class="fa-solid fa-user-check"></i> Öğrenci kapsamı</div>
          <div class="kpi-deger">%${Math.round(kapsam * 100)}</div>
          <div class="kpi-alt">${B.sayi(veren.size)} / ${B.sayi(ogrSay)} öğrenci</div>
          <div class="ilerleme"><span style="width:${(kapsam * 100).toFixed(1)}%"></span></div></div>
        <div class="kpi"><div class="kpi-ad"><i class="fa-solid fa-box"></i> Dağıtım bekleyen</div>
          <div class="kpi-deger">${B.sayi(bekleyen)}</div>
          <div class="kpi-alt"><a href="#dagitim">Dağıtım listelerine git →</a></div></div>
      </div>

      <div class="izgara-2">
        <section class="kart">
          <h2>Sınıflara göre sipariş oranı</h2>
          <p class="aciklama">Sipariş veren öğrenci / sınıf mevcudu</p>
          <div class="cubuk-liste" role="list">${cubuklar}</div>
        </section>
        <section class="kart grafik-kart">
          <h2>Günlük satış</h2>
          <p class="aciklama">Son 14 gün, iadeler hariç</p>
          <div class="sutun-grafik" role="img" aria-label="Son 14 günün günlük satış tutarları">
            <div class="sutun-eksen">${tikler.map(t => `<span style="bottom:${t / max * 100}%">${B.tlKisa(t)}</span>`).join('')}</div>
            <div class="sutun-alan">
              <div class="sutun-cizim">
                ${tikler.slice(1).map(t => `<span class="izgara-cizgi" style="bottom:${t / max * 100}%"></span>`).join('')}
                <div class="sutunlar">${sutunlar}</div>
              </div>
              <div class="sutun-etiketler">${gunler.map(g => `<span>${g.tarih.getDate()}.${g.tarih.getMonth() + 1}</span>`).join('')}</div>
            </div>
          </div>
        </section>
      </div>

      <section class="kart">
        <h2>Son siparişler <small><a href="#siparisler">Tümünü gör →</a></small></h2>
        <div class="tablo-kap" style="margin-top:12px">
          <table class="tablo">
            <thead><tr><th>Sipariş</th><th>Öğrenci</th><th class="sag">Tutar</th><th>Durum</th><th class="sag">Zaman</th></tr></thead>
            <tbody>${son.map(s => `
              <tr class="tiklanir ${s.yeni ? 'yeni-satir' : ''}" data-act="siparis-git" data-no="${s.no}">
                <td><b>${s.no}</b></td>
                <td>${s.ogrenciler.map(no => { const o = B.ogrenciByNo(no); return `${esc(o.ad)} <span class="ikincil">${o.sinif}-${o.sube}</span>`; }).join(', ')}</td>
                <td class="sag mono">${tl(s.toplam)}</td>
                <td>${durumHTML(s.durum)}</td>
                <td class="sag ikincil">${once(s.tarih)}</td>
              </tr>`).join('')}</tbody>
          </table>
        </div>
      </section>`;
  }

  /* ---------- Siparişler ---------- */

  function siparisler(param) {
    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Siparişler</h1><p id="sip-bilgi"></p></div>
        <div class="araclar"><button class="btn btn-ikincil" data-act="csv-siparis"><i class="fa-solid fa-file-excel"></i> Excel’e aktar</button></div>
      </header>
      <div class="filtreler">
        <div class="ara"><i class="fa-solid fa-magnifying-glass"></i><input class="girdi" id="sip-ara" placeholder="Sipariş no, öğrenci veya veli ara…" value="${esc(U.sipAra)}"></div>
        <select id="sip-sinif" aria-label="Sınıf"><option value="">Tüm sınıflar</option>${sinifSecenekleri(U.sipSinif)}</select>
        <select id="sip-durum" aria-label="Durum"><option value="">Tüm durumlar</option>${Object.entries(B.DURUMLAR).map(([k, d]) => `<option value="${k}" ${U.sipDurum === k ? 'selected' : ''}>${d.ad}</option>`).join('')}</select>
      </div>
      <div class="tablo-kap">
        <table class="tablo">
          <thead><tr><th>Sipariş</th><th>Tarih</th><th>Öğrenci</th><th>Veli</th><th class="sag">Tutar</th><th>Ödeme</th><th>Durum</th></tr></thead>
          <tbody id="sip-govde"></tbody>
        </table>
      </div>
      <div class="tablo-alt" id="sip-alt"></div>`;
    siparisTablo();
    if (param) siparisDetay(param);
  }

  function filtreliSiparisler() {
    const q = U.sipAra.trim().toLocaleLowerCase('tr-TR');
    return B.siparisler().filter(s => {
      if (U.sipDurum && s.durum !== U.sipDurum) return false;
      const ogrs = s.ogrenciler.map(B.ogrenciByNo);
      if (U.sipSinif && !ogrs.some(o => String(o.sinif) === U.sipSinif)) return false;
      if (q) {
        const metin = [s.no, s.veli, ...ogrs.map(o => `${o.ad} ${o.no} ${o.sinif}-${o.sube}`)].join(' ').toLocaleLowerCase('tr-TR');
        if (!metin.includes(q)) return false;
      }
      return true;
    });
  }

  function siparisTablo() {
    const liste = filtreliSiparisler();
    const toplam = liste.filter(s => s.durum !== 'iade').reduce((t, s) => t + s.toplam, 0);
    $('#sip-bilgi').textContent = `${B.sayi(liste.length)} sipariş · ${tl(toplam)} (iadeler hariç)`;
    $('#sip-govde').innerHTML = liste.slice(0, U.sipLimit).map(s => {
      const ogrs = s.ogrenciler.map(B.ogrenciByNo);
      return `<tr class="tiklanir ${s.yeni ? 'yeni-satir' : ''}" data-act="siparis" data-no="${s.no}">
        <td><b>${s.no}</b>${s.yeni ? ' <span class="rozet rozet-vurgu">Yeni</span>' : ''}</td>
        <td class="ikincil">${B.tarih(s.tarih)}</td>
        <td>${ogrs.map(o => `${esc(o.ad)} <span class="ikincil">${o.sinif}-${o.sube}</span>`).join('<br>')}</td>
        <td>${esc(s.veli)}</td>
        <td class="sag mono">${tl(s.toplam)}</td>
        <td class="ikincil">${taksitAd(s.taksit)}</td>
        <td>${durumHTML(s.durum)}</td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--soluk)">Bu filtrelere uyan sipariş yok.</td></tr>`;
    $('#sip-alt').innerHTML = `<span>${Math.min(U.sipLimit, liste.length)} / ${liste.length} gösteriliyor · satıra tıklayarak detayı açın</span>
      ${liste.length > U.sipLimit ? '<button class="btn btn-ikincil btn-kucuk" data-act="daha">Daha fazla göster</button>' : ''}`;
  }

  function siparisDetay(no) {
    const s = B.siparis(no);
    if (!s) { B.bildir(`Sipariş bulunamadı: ${esc(no)}`, 'hata'); return; }
    if (rota()[1] !== no) history.replaceState(null, '', `#siparisler/${no}`);
    const gruplar = {};
    s.kalemler.forEach(k => (gruplar[k.ogrenciNo] = gruplar[k.ogrenciNo] || []).push(k));
    const eArsiv = `BBK${new Date(s.tarih).getFullYear()}${s.no.slice(-5).padStart(9, '0')}`;
    const fatura = s.fatura && s.fatura.tip === 'kurumsal'
      ? `Kurumsal · ${esc(s.fatura.unvan)} · VN ${esc(s.fatura.vno)}`
      : 'Bireysel (e-Arşiv)';

    $('#cekmece').innerHTML = `
      <div class="cekmece-arka" data-act="cekmece-arka">
        <aside class="cekmece" role="dialog" aria-modal="true" aria-label="Sipariş ${s.no}">
          <header>
            <div><h3>${s.no}</h3><small>${B.tarih(s.tarih)}</small></div>
            <button class="kapat-btn" data-act="cekmece-kapat" aria-label="Kapat"><i class="fa-solid fa-xmark"></i></button>
          </header>
          <div class="cek-govde">
            <div class="cek-bolum"><h4>Durum ve teslim</h4>
              <div class="bilgi-izgara">
                <span>Sipariş durumu</span>
                <span><select id="durum-sec" data-no="${s.no}" aria-label="Sipariş durumu">${Object.entries(B.DURUMLAR).map(([k, d]) => `<option value="${k}" ${k === s.durum ? 'selected' : ''}>${d.ad}</option>`).join('')}</select></span>
                <span>Teslim</span><b>Okulda · ${s.ogrenciler.map(no => { const o = B.ogrenciByNo(no); return `${o.sinif}-${esc(o.sube)}`; }).join(', ')} sınıfı</b>
              </div>
            </div>
            <div class="cek-bolum"><h4>Veli</h4>
              <div class="bilgi-izgara">
                <span>Ad soyad</span><b>${esc(s.veli)}</b>
                <span>Telefon</span><b style="font-weight:500">${B.telMaske(s.tel)}</b>
                <span>E-posta</span><b style="font-weight:500">${esc(s.eposta || '—')}</b>
                <span>Fatura</span><b style="font-weight:500">${fatura}</b>
              </div>
            </div>
            <div class="cek-bolum"><h4>Kalemler</h4>
              ${Object.keys(gruplar).map(no => {
                const o = B.ogrenciByNo(no);
                return `<div class="ozet-grup"><div class="ozet-ogr">${esc(o.ad)} · ${o.sinif}-${o.sube} · No ${o.no}</div>
                  ${gruplar[no].map(k => `<div class="ozet-kalem"><span>${esc(B.setById(k.setId).ad)}</span><b>${tl(k.fiyat)}</b></div>`).join('')}</div>`;
              }).join('')}
              ${s.ogrIndirim ? `<div class="satir indirim"><span>Öğrenciye özel indirim</span><b>−${tl(s.ogrIndirim)}</b></div>` : ''}
              ${s.indirim ? `<div class="satir indirim"><span>Kardeş indirimi</span><b>−${tl(s.indirim)}</b></div>` : ''}
              <div class="satir toplam"><span>Toplam</span><b>${tl(s.toplam)}</b></div>
            </div>
            <div class="cek-bolum"><h4>Ödeme</h4>
              <div class="bilgi-izgara">
                <span>Kart</span><b>${esc(s.kart.program)} **** ${esc(s.kart.son4)}</b>
                <span>Taksit</span><b style="font-weight:500">${taksitAd(s.taksit)}</b>
                <span>Tahsil edilen</span><b>${tl(s.tahsilat)}</b>
                <span>3D Secure</span><b style="color:var(--yesil)"><i class="fa-solid fa-shield-halved"></i> Doğrulandı</b>
                <span>Provizyon no</span><b style="font-weight:500">${s.provizyon}</b>
                <span>e-Arşiv fatura</span><b style="font-weight:500">${eArsiv}</b>
              </div>
            </div>
          </div>
          <footer>
            <button class="btn btn-ikincil btn-kucuk" data-act="fatura-goster"><i class="fa-solid fa-file-pdf"></i> Fatura</button>
            <button class="btn btn-ikincil btn-kucuk" data-act="sms-tek"><i class="fa-solid fa-comment-sms"></i> Veliye SMS</button>
            ${s.durum !== 'iade' ? `<button class="btn btn-tehlike btn-kucuk" data-act="iade" data-no="${s.no}" style="margin-left:auto"><i class="fa-solid fa-rotate-left"></i> İade et</button>` : ''}
          </footer>
        </aside>
      </div>`;
  }

  function cekmeceKapat() {
    $('#cekmece').innerHTML = '';
    if (rota()[0] === 'siparisler' && rota()[1]) history.replaceState(null, '', '#siparisler');
  }

  /* ---------- Dağıtım listeleri ---------- */

  function dagitim() {
    const [g, sb] = U.dagSube.split('-');
    const sinif = Number(g);
    const ogrs = B.OGRENCILER.filter(o => o.sinif === sinif && o.sube === sb).sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    const setler = B.sinifSetleri(sinif);
    const harita = {};
    B.aktifSiparisler().forEach(s => s.kalemler.forEach(k => {
      const h = (harita[k.ogrenciNo] = harita[k.ogrenciNo] || { setler: {}, siparisler: [] });
      h.setler[k.setId] = s;
      if (!h.siparisler.includes(s)) h.siparisler.push(s);
    }));
    const paket = setler.map(st => ({
      st,
      adet: ogrs.filter(o => harita[o.no] && harita[o.no].setler[st.id]).length
    }));
    const verenSay = ogrs.filter(o => harita[o.no]).length;
    const teslimSay = ogrs.filter(o => harita[o.no] && harita[o.no].siparisler.every(s => s.durum === 'teslim')).length;

    const subeSecenek = [];
    for (const i of B.SINIFLAR) {
      subeSecenek.push(`<optgroup label="${i}. Sınıf">${['A', 'B'].map(x => `<option value="${i}-${x}" ${U.dagSube === `${i}-${x}` ? 'selected' : ''}>${i}-${x}</option>`).join('')}</optgroup>`);
    }

    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Dağıtım Listeleri</h1><p>Okulda teslim edilecek setlerin şube bazlı listesi</p></div>
        <div class="araclar">
          <button class="btn btn-ikincil" data-act="tumunu-teslim"><i class="fa-solid fa-check-double"></i> Tümünü teslim edildi işaretle</button>
          <button class="btn btn-birincil" data-act="yazdir"><i class="fa-solid fa-print"></i> Yazdır</button>
        </div>
      </header>
      <div class="filtreler">
        <select id="dag-sube" aria-label="Şube">${subeSecenek.join('')}</select>
        <span style="color:var(--soluk);font-size:14px">${verenSay} / ${ogrs.length} öğrenci sipariş verdi · ${teslimSay} teslim edildi</span>
      </div>

      <div class="yalniz-baski">
        <h2 style="margin-bottom:4px">${esc(B.OKUL.ad)} — ${U.dagSube} Kitap Dağıtım Listesi</h2>
        <p style="margin-bottom:12px">${B.OKUL.donem} Eğitim Yılı · Dağıtım tarihi: ____ / ____ / ________ · Sınıf öğretmeni: ______________________</p>
      </div>

      <section class="kart baski-gizle" style="margin-bottom:16px">
        <h2>Hazırlanacak paketler <small>${U.dagSube} şubesi</small></h2>
        <div class="paket-ozet" style="margin-top:10px">${paket.map(p => `<span class="paket"><b>${p.adet}</b> ${esc(p.st.ad)}</span>`).join('')}</div>
      </section>

      <div class="tablo-kap">
        <table class="tablo">
          <thead><tr>
            <th>#</th><th>Öğrenci</th>
            ${setler.map(st => `<th class="orta" title="${esc(st.ad)}">${esc(st.kisa)}</th>`).join('')}
            <th>Durum</th><th class="orta baski-gizle">Teslim</th><th class="imza">İmza</th>
          </tr></thead>
          <tbody>${ogrs.map((o, i) => {
            const h = harita[o.no];
            const teslim = h && h.siparisler.every(s => s.durum === 'teslim');
            return `<tr>
              <td class="ikincil">${i + 1}</td>
              <td><b>${esc(o.ad)}</b> <span class="ikincil">No ${o.no}</span></td>
              ${setler.map(st => `<td class="orta">${h && h.setler[st.id] ? '<span class="var" aria-label="var">✓</span>' : '<span class="yok" aria-label="yok">—</span>'}</td>`).join('')}
              <td>${h ? durumHTML(h.siparisler[0].durum) : '<span class="ikincil">Sipariş yok</span>'}</td>
              <td class="orta baski-gizle">${h ? `<input type="checkbox" class="teslim-cb" data-nolar="${h.siparisler.map(s => s.no).join(',')}" ${teslim ? 'checked' : ''} aria-label="${esc(o.ad)} teslim edildi">` : ''}</td>
              <td class="imza"></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>`;
  }

  /* ---------- Öğrenciler ve hatırlatma ---------- */

  function ogrenciler() {
    const vermeyen = B.OGRENCILER.length - Object.keys(B.alinanlar()).length;
    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Öğrenciler ve Hatırlatma</h1><p>${B.sayi(B.OGRENCILER.length)} öğrenci · ${B.SUBELER.length} şube</p></div>
        <div class="araclar"><a class="btn btn-ikincil" href="#veri"><i class="fa-solid fa-file-excel"></i> Excel ile güncelle</a></div>
      </header>

      <div class="uyari-kart">
        <i class="fa-solid fa-bell"></i>
        <div><b>${B.sayi(vermeyen)} öğrenci için henüz sipariş verilmedi</b><span>Velilere tek tıkla, öğrencinin adını içeren SMS hatırlatması gönderebilirsiniz.</span></div>
        <button class="btn btn-vurgu" data-act="sms-vermeyen"><i class="fa-solid fa-paper-plane"></i> Hepsine hatırlatma gönder</button>
      </div>

      <a class="yukleme-alani" href="#veri" style="margin-bottom:16px;text-decoration:none">
        <i class="fa-solid fa-file-excel"></i>
        <b>Öğrenci ve veli listesini Excel ile güncelle</b>
        <span>Yeni kayıt, sınıf değişikliği ya da telefon güncellemesi tek dosyayla yapılır.</span>
      </a>

      <div class="filtreler">
        <div class="ara"><i class="fa-solid fa-magnifying-glass"></i><input class="girdi" id="ogr-ara" placeholder="Öğrenci, numara veya veli ara…" value="${esc(U.ogrAra)}"></div>
        <select id="ogr-sinif" aria-label="Sınıf"><option value="">Tüm sınıflar</option>${sinifSecenekleri(U.ogrSinif)}</select>
        <select id="ogr-durum" aria-label="Sipariş durumu">
          <option value="">Tüm öğrenciler</option>
          <option value="verdi" ${U.ogrDurum === 'verdi' ? 'selected' : ''}>Sipariş verdi</option>
          <option value="vermedi" ${U.ogrDurum === 'vermedi' ? 'selected' : ''}>Sipariş vermedi</option>
        </select>
        <button class="btn btn-birincil" data-act="sms-secili" id="sms-secili-btn" disabled><i class="fa-solid fa-comment-sms"></i> Seçilenlere SMS (<span id="secili-say">0</span>)</button>
      </div>

      <div class="tablo-kap">
        <table class="tablo">
          <thead><tr>
            <th style="width:40px"><input type="checkbox" id="hepsini-sec" aria-label="Listelenenlerin hepsini seç"></th>
            <th>No</th><th>Öğrenci</th><th>Şube</th><th>Veli</th><th>Telefon</th><th>Sipariş</th>
          </tr></thead>
          <tbody id="ogr-govde"></tbody>
        </table>
      </div>
      <div class="tablo-alt" id="ogr-alt"></div>`;
    ogrenciTablo();
  }

  function filtreliOgrenciler() {
    const alinan = B.alinanlar();
    const q = U.ogrAra.trim().toLocaleLowerCase('tr-TR');
    return B.OGRENCILER.filter(o => {
      if (U.ogrSinif && String(o.sinif) !== U.ogrSinif) return false;
      if (U.ogrDurum === 'verdi' && !alinan[o.no]) return false;
      if (U.ogrDurum === 'vermedi' && alinan[o.no]) return false;
      if (q && !`${o.no} ${o.ad} ${o.veli}`.toLocaleLowerCase('tr-TR').includes(q)) return false;
      return true;
    }).sort((a, b) => a.sinif - b.sinif || a.sube.localeCompare(b.sube) || a.ad.localeCompare(b.ad, 'tr'));
  }

  function ogrenciTablo() {
    const alinan = B.alinanlar();
    const liste = filtreliOgrenciler();
    $('#ogr-govde').innerHTML = liste.map(o => {
      const nolar = alinan[o.no] ? [...new Set(Object.values(alinan[o.no]))] : [];
      return `<tr>
        <td><input type="checkbox" class="ogr-cb" data-no="${o.no}" ${U.secili.has(o.no) ? 'checked' : ''} aria-label="${esc(o.ad)} seç"></td>
        <td class="ikincil">${o.no}</td>
        <td><b>${esc(o.ad)}</b></td>
        <td>${o.sinif}-${o.sube}</td>
        <td>${esc(o.veli)}</td>
        <td class="ikincil">${B.telMaske(o.tel)}</td>
        <td>${nolar.length
          ? `<span class="durum d-teslim"><i class="fa-solid fa-check"></i> Verdi</span> <a href="#siparisler/${nolar[0]}" class="ikincil">${nolar[0]}</a>`
          : '<span class="durum d-iade"><i class="fa-solid fa-xmark"></i> Vermedi</span>'}</td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--soluk)">Bu filtrelere uyan öğrenci yok.</td></tr>`;
    $('#ogr-alt').innerHTML = `<span>${B.sayi(liste.length)} öğrenci listeleniyor</span>`;
    seciliGuncelle();
  }

  function seciliGuncelle() {
    const n = U.secili.size;
    const say = $('#secili-say');
    if (say) say.textContent = n;
    const btn = $('#sms-secili-btn');
    if (btn) btn.disabled = !n;
    const hepsi = $('#hepsini-sec');
    if (hepsi) {
      const gorunen = [...document.querySelectorAll('.ogr-cb')];
      hepsi.checked = gorunen.length > 0 && gorunen.every(c => c.checked);
    }
  }

  function smsModal(nolar) {
    if (!nolar.length) return;
    const ornek = B.ogrenciByNo(nolar[0]);
    modalAc(`
      <div class="modal" role="dialog" aria-modal="true" aria-label="SMS hatırlatma">
        <div class="modal-bas"><h3><i class="fa-solid fa-comment-sms"></i> SMS hatırlatma</h3><button class="kapat-btn" data-act="modal-kapat" aria-label="Kapat"><i class="fa-solid fa-xmark"></i></button></div>
        <div class="modal-govde">
          <p><b style="color:var(--murekkep)">${B.sayi(nolar.length)} veliye</b> aşağıdaki mesaj gönderilecek. Örnek önizleme:</p>
          <div style="background:var(--yuzey-2);border:1px solid var(--cizgi);border-radius:12px;padding:14px;margin:12px 0;color:var(--murekkep)">
            Sayın Veli, ${esc(ornek.ad.split(' ')[0])} için ${B.OKUL.donem} kitap seti siparişiniz henüz oluşturulmadı. ${esc(B.OKUL.magazaAdresi)} adresinden öğrenci numaranızla birkaç dakikada sipariş verebilirsiniz. ${esc(B.OKUL.ad)}
          </div>
          <p class="alan-ipucu">Öğrenci adı her veli için otomatik doldurulur. Kardeşi olan velilere tek SMS gider.</p>
        </div>
        <div class="modal-alt">
          <button class="btn btn-ikincil" data-act="modal-kapat">Vazgeç</button>
          <button class="btn btn-birincil" data-act="sms-gonder" data-say="${new Set(nolar.map(n => B.ogrenciByNo(n).tel)).size}"><i class="fa-solid fa-paper-plane"></i> Gönder</button>
        </div>
      </div>`);
  }

  /* ---------- Setler ve fiyatlar ---------- */

  function setler() {
    const satis = {};
    B.aktifSiparisler().forEach(s => s.kalemler.forEach(k => {
      const x = (satis[k.setId] = satis[k.setId] || { adet: 0, ciro: 0 });
      x.adet++; x.ciro += k.fiyat;
    }));
    const liste = B.SETLER.filter(s => !U.setSinif || String(s.sinif) === U.setSinif);
    const toplamAdet = Object.values(satis).reduce((t, x) => t + x.adet, 0);

    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Kitaplar ve Fiyatlar</h1><p>${B.SETLER.length} set · fiyat değişikliği veli mağazasına anında yansır</p></div>
        <div class="araclar">
          <a class="btn btn-ikincil" href="#veri"><i class="fa-solid fa-file-excel"></i> Kitap listesini Excel ile güncelle</a>
          <button class="btn btn-birincil" data-act="csv-yayinevi"><i class="fa-solid fa-truck-ramp-box"></i> Yayınevi sipariş listesi</button>
        </div>
      </header>

      <div class="uyari-kart" style="background:var(--marka-acik);border-color:var(--marka-orta)">
        <i class="fa-solid fa-boxes-stacked" style="color:var(--marka)"></i>
        <div><b>Toplam ${B.sayi(toplamAdet)} set satıldı</b><span style="color:var(--marka)">Yayınevlerine verilecek toplu siparişi set bazında tek dosyada indirebilirsiniz; tahmini değil, gerçek satış adedine göre sipariş verilir.</span></div>
      </div>

      <div class="filtreler">
        <select id="set-sinif" aria-label="Sınıf"><option value="">Tüm sınıflar</option>${sinifSecenekleri(U.setSinif)}</select>
      </div>

      <div class="tablo-kap">
        <table class="tablo">
          <thead><tr><th>Sınıf</th><th>Set</th><th>Tür</th><th class="sag">Satış fiyatı (₺)</th><th class="sag">Satılan</th><th class="sag">Satış tutarı</th></tr></thead>
          <tbody>${liste.map(s => {
            const x = satis[s.id] || { adet: 0, ciro: 0 };
            return `<tr>
              <td>${s.sinif}. Sınıf</td>
              <td><b>${esc(s.ad)}</b><br><span class="ikincil">${s.icerik.length} parça: ${esc(s.icerik.slice(0, 3).join(', '))}${s.icerik.length > 3 ? '…' : ''}</span></td>
              <td>${s.tur === 'sinif' ? '<span class="rozet rozet-marka">Sınıf seti</span>' : '<span class="rozet">İsteğe bağlı</span>'}</td>
              <td class="sag"><input class="fiyat-girdi" type="number" min="0" step="10" value="${B.fiyat(s.id)}" data-id="${s.id}" aria-label="${esc(s.ad)} fiyatı"></td>
              <td class="sag mono">${B.sayi(x.adet)}</td>
              <td class="sag mono">${B.tlTam(x.ciro)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>`;
  }

  /* ---------- Ayarlar ---------- */

  function ayarlar() {
    const a = B.ayar();
    const taksitSecenek = [2, 3, 6, 9];
    icerik().innerHTML = `
      <header class="sayfa-bas"><div><h1>Ayarlar</h1><p>Değişiklikler veli mağazasına anında yansır</p></div></header>
      <div class="ayar-izgara">
        <section class="kart">
          <h2>Satış ve kampanya</h2>
          <div class="ayar-satir">
            <div><b>Satış açık</b><span>Kapalıyken veliler giriş ekranında bilgilendirme görür</span></div>
            <label class="anahtar"><input type="checkbox" id="ayar-satis" ${a.satisAcik ? 'checked' : ''}><span></span></label>
          </div>
          <div class="ayar-satir">
            <div><b>Kardeş indirimi (%)</b><span>İkinci ve sonraki kardeşlerin setlerine uygulanır</span></div>
            <input type="number" id="ayar-kardes" min="0" max="50" step="1" value="${a.kardesIndirim}">
          </div>
          <div class="ayar-satir">
            <div><b>Teslim</b><span>Kitaplar okulda, öğrencinin sınıfına teslim edilir</span></div>
            <span class="rozet rozet-yesil"><i class="fa-solid fa-school"></i> Okulda</span>
          </div>
        </section>

        <section class="kart">
          <h2>Taksit seçenekleri</h2>
          <p class="aciklama">Vade farkı oranları demo amaçlıdır; gerçek oranlar POS anlaşmasına göre belirlenir.</p>
          ${taksitSecenek.map(n => {
            const oran = B.VADE_FARKI[n];
            return `<div class="ayar-satir">
              <div><b>${n} taksit</b><span>${oran ? `Veliye %${(oran * 100).toLocaleString('tr-TR')} vade farkı yansıtılır` : 'Vade farksız: komisyonu okul üstlenir'}</span></div>
              <label class="anahtar"><input type="checkbox" class="ayar-taksit" value="${n}" ${a.taksitler.includes(n) ? 'checked' : ''}><span></span></label>
            </div>`;
          }).join('')}
        </section>

        <section class="kart">
          <h2>Entegrasyonlar</h2>
          <p class="aciklama">Gerçek sürümde bağlanacak servisler</p>
          <div class="entegrasyon"><i class="fa-solid fa-credit-card"></i><div><b>Sanal POS</b><span>Okulun banka sanal POS’u veya bir ödeme kuruluşu (3D Secure)</span></div><span class="rozet rozet-vurgu">Test modu</span></div>
          <div class="entegrasyon"><i class="fa-solid fa-file-invoice"></i><div><b>e-Arşiv / e-Fatura</b><span>Her ödemede faturanın otomatik kesilmesi</span></div><span class="rozet">Seçilecek</span></div>
          <div class="entegrasyon"><i class="fa-solid fa-comment-sms"></i><div><b>SMS</b><span>Doğrulama kodu, sipariş ve teslim bildirimi</span></div><span class="rozet">Seçilecek</span></div>
          <div class="entegrasyon"><i class="fa-solid fa-table"></i><div><b>Öğrenci listesi</b><span>Okul yazılımından Excel ile içe aktarım</span></div><span class="rozet rozet-yesil">Hazır</span></div>
        </section>

        <section class="kart">
          <h2>Kullanıcılar ve yetkiler</h2>
          <p class="aciklama">Her personel yalnızca yetkisi olan ekranları görür</p>
          <div class="entegrasyon"><i class="fa-solid fa-calculator"></i><div><b>Muhasebe</b><span>Tüm siparişler, iade, fiyat ve ayarlar</span></div><span class="rozet rozet-marka">Tam yetki</span></div>
          <div class="entegrasyon"><i class="fa-solid fa-user-tie"></i><div><b>Okul yönetimi</b><span>Raporlar ve genel bakış</span></div><span class="rozet">Görüntüleme</span></div>
          <div class="entegrasyon"><i class="fa-solid fa-chalkboard-user"></i><div><b>Sınıf öğretmeni</b><span>Yalnızca kendi şubesinin dağıtım listesi</span></div><span class="rozet">Sınırlı</span></div>
        </section>
      </div>`;
  }

  /* ---------- Excel ile toplu tanımlama ---------- */

  const DUZEY_ADLARI = ['duzey', 'sinif', 'sinifduzey', 'sinifduzeyi', 'seviye'];
  const SUTUNLAR = {
    ogrenci: [
      ['no', 'Öğrenci No', ['ogrencino', 'ogrencinumarasi', 'okulno', 'no', 'numara']],
      ['ad', 'Öğrenci Ad Soyad', ['ogrenciadsoyad', 'ogrenciadisoyadi', 'ogrenciadi', 'adsoyad', 'ogrenci']],
      ['sinif', 'Düzey', DUZEY_ADLARI],
      ['sube', 'Şube', ['sube', 'subesi']],
      ['veli', 'Veli Ad Soyad', ['veliadsoyad', 'veliadisoyadi', 'veliadi', 'veli']],
      ['veliTc', 'Veli T.C. Kimlik No', ['velitckimlikno', 'velitc', 'velitckn', 'tckimlikno', 'tckn', 'tc']],
      ['tel', 'Veli Cep Telefonu', ['veliceptelefonu', 'velicep', 'velitelefonu', 'velitelefon', 'ceptelefonu', 'telefon', 'gsm']],
      ['indirim', 'İndirim (%)', ['indirim', 'indirimorani', 'kitapindirimi', 'burs', 'bursorani']]
    ],
    kitap: [
      ['sinif', 'Düzey', DUZEY_ADLARI],
      ['paket', 'Paket Adı', ['paketadi', 'paket', 'setadi', 'set']],
      ['kitap', 'Kitap Adı', ['kitapadi', 'kitap', 'urunadi', 'urun']],
      ['yayinevi', 'Yayınevi', ['yayinevi', 'yayin']],
      ['fiyat', 'Fiyat (TL)', ['fiyattl', 'fiyat', 'satisfiyati', 'tutar', 'ucret']],
      ['tur', 'Tür', ['tur', 'turu', 'zorunluluk']]
    ]
  };
  const ISTEGE_BAGLI = { ogrenci: ['veliTc', 'indirim', 'sube'], kitap: ['paket', 'yayinevi', 'tur'] };
  let onizleme = null;

  const normal = v => String(v == null ? '' : v).toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, c => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c]))
    .replace(/[^a-z0-9]/g, '');
  const tcMaske = tc => (tc ? `${tc.slice(0, 3)}*****${tc.slice(-3)}` : '—');

  function sayiOku(v) {
    if (typeof v === 'number') return v;
    let t = String(v || '').replace(/[^\d.,-]/g, '');
    if (!t) return NaN;
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    return Number(t);
  }

  function baslikBul(aoa, tanim) {
    for (let i = 0; i < Math.min(aoa.length, 6); i++) {
      const n = (aoa[i] || []).map(normal);
      const esle = {};
      tanim.forEach(([alan, , adlar]) => {
        const j = n.findIndex(h => adlar.includes(h));
        if (j >= 0) esle[alan] = j;
      });
      if (Object.keys(esle).length >= 3) return { esle, bas: i };
    }
    return { esle: {}, bas: -1 };
  }

  function eksikSutunlar(esle, tur, zorunlu) {
    const adlar = Object.fromEntries(SUTUNLAR[tur].map(([k, ad]) => [k, ad]));
    return zorunlu.filter(k => esle[k] == null).map(k => adlar[k] || k);
  }

  function ogrenciCozumle(aoa) {
    const { esle, bas } = baslikBul(aoa, SUTUNLAR.ogrenci);
    const eksik = eksikSutunlar(esle, 'ogrenci', ['no', 'ad', 'sinif', 'veli', 'tel']);
    if (bas < 0 || eksik.length) return { hataGenel: `Gerekli sütunlar bulunamadı: ${eksik.join(', ') || 'başlık satırı'}. Lütfen şablondaki sütun adlarını kullanın.` };
    const kayitlar = []; const hatalar = []; const uyarilar = [];
    const gorulen = new Set();
    let tcsiz = 0;
    for (let i = bas + 1; i < aoa.length; i++) {
      const r = aoa[i] || [];
      if (r.every(c => String(c).trim() === '')) continue;
      const al = k => (esle[k] == null ? '' : String(r[esle[k]] == null ? '' : r[esle[k]]).trim());
      const no = al('no').replace(/\.0+$/, '');
      const ad = al('ad');
      const sinif = parseInt(al('sinif'), 10);
      const sube = (al('sube') || 'A').toLocaleUpperCase('tr-TR');
      const veli = al('veli');
      const tel = B.telNormal(al('tel'));
      const tc = al('veliTc').replace(/\D/g, '');
      const ind = al('indirim') === '' ? 0 : sayiOku(al('indirim'));
      const sorun = [];
      if (!no) sorun.push('öğrenci no boş');
      else if (gorulen.has(no)) sorun.push(`öğrenci no ${no} tekrar ediyor`);
      if (!ad) sorun.push('öğrenci adı boş');
      if (!(sinif >= 1 && sinif <= 12)) sorun.push('düzey 1–12 arası bir sayı olmalı');
      if (!veli) sorun.push('veli adı boş');
      if (!/^05\d{9}$/.test(tel)) sorun.push('veli telefonu geçersiz');
      if (tc && tc.length !== 11) sorun.push('T.C. kimlik no 11 haneli olmalı');
      if (!(ind >= 0 && ind <= 100)) sorun.push('indirim 0–100 arası olmalı');
      if (sorun.length) { hatalar.push({ satir: i + 1, mesaj: sorun.join(', ') }); continue; }
      if (!tc) tcsiz++;
      gorulen.add(no);
      kayitlar.push({ no, ad, sinif, sube, veli, veliTc: tc, tel, indirim: Math.round(ind) });
    }
    if (tcsiz) uyarilar.push(`${tcsiz} öğrencinin velisi için T.C. kimlik no girilmemiş. Bu veliler “öğrenci no + telefon” ile giriş yapabilir.`);
    const indirimli = kayitlar.filter(k => k.indirim > 0).length;
    if (indirimli) uyarilar.push(`${indirimli} öğrenciye özel indirim tanımlı; tutarlarına otomatik uygulanacak.`);
    return { tur: 'ogrenci', kayitlar, hatalar, uyarilar };
  }

  function kitapCozumle(aoa) {
    const { esle, bas } = baslikBul(aoa, SUTUNLAR.kitap);
    const eksik = eksikSutunlar(esle, 'kitap', ['sinif', 'kitap', 'fiyat']);
    if (bas < 0 || eksik.length) return { hataGenel: `Gerekli sütunlar bulunamadı: ${eksik.join(', ') || 'başlık satırı'}. Lütfen şablondaki sütun adlarını kullanın.` };
    const gruplar = new Map(); const hatalar = []; const uyarilar = [];
    let satirSay = 0;
    for (let i = bas + 1; i < aoa.length; i++) {
      const r = aoa[i] || [];
      if (r.every(c => String(c).trim() === '')) continue;
      const al = k => (esle[k] == null ? '' : String(r[esle[k]] == null ? '' : r[esle[k]]).trim());
      const sinif = parseInt(al('sinif'), 10);
      const kitap = al('kitap');
      const paket = al('paket');
      const fiyat = esle.fiyat != null && typeof r[esle.fiyat] === 'number' ? r[esle.fiyat] : sayiOku(al('fiyat'));
      const sorun = [];
      if (!(sinif >= 1 && sinif <= 12)) sorun.push('düzey 1–12 arası bir sayı olmalı');
      if (!kitap) sorun.push('kitap adı boş');
      if (!(fiyat >= 0)) sorun.push('fiyat geçersiz');
      if (sorun.length) { hatalar.push({ satir: i + 1, mesaj: sorun.join(', ') }); continue; }
      satirSay++;
      const anahtar = `${sinif}|${normal(paket || kitap)}`;
      if (!gruplar.has(anahtar)) gruplar.set(anahtar, { sinif, ad: paket || kitap, kitaplar: [], fiyat: 0, ek: false });
      const g = gruplar.get(anahtar);
      const yayinevi = al('yayinevi');
      g.kitaplar.push(yayinevi ? `${kitap} (${yayinevi})` : kitap);
      g.fiyat += fiyat;
      if (/iste|secme|opsiyon|^ek$/.test(normal(al('tur')))) g.ek = true;
    }
    const sayac = {};
    const kayitlar = [...gruplar.values()].sort((a, b) => a.sinif - b.sinif).map(g => {
      sayac[g.sinif] = (sayac[g.sinif] || 0) + 1;
      const [renk, ikon] = B.setGorunum(g.ad);
      const kisa = g.ad.replace(/^\d+\.?\s*sınıf\s*/i, '').replace(/\s*(seti|paketi|set|paket)\s*$/i, '').split(/\s+/).slice(0, 2).join(' ') || g.ad;
      return {
        id: `x${g.sinif}-${sayac[g.sinif]}`, sinif: g.sinif, kod: String(sayac[g.sinif]),
        ad: g.ad, kisa, tur: g.ek ? 'ek' : 'sinif', fiyat: Math.round(g.fiyat * 100) / 100,
        icerik: g.kitaplar, renk, ikon
      };
    });
    const ogrDuzey = new Set(B.OGRENCILER.map(o => o.sinif));
    const listesiz = [...ogrDuzey].filter(d => !kayitlar.some(k => k.sinif === d)).sort((a, b) => a - b);
    if (listesiz.length) uyarilar.push(`${listesiz.map(d => d + '.').join(', ')} sınıf düzeyleri için kitap yok; bu velilere “liste henüz tanımlanmadı” mesajı gösterilir.`);
    return { tur: 'kitap', kayitlar, hatalar, uyarilar, satirSay };
  }

  function dosyaOku(dosya, tur) {
    if (!window.XLSX) { B.bildir('Excel okuyucu yüklenemedi; internet bağlantısını kontrol edin.', 'hata'); return; }
    const csv = /\.csv$/i.test(dosya.name);
    (csv ? dosya.text() : dosya.arrayBuffer()).then(icerikV => {
      const wb = csv ? XLSX.read(icerikV, { type: 'string' }) : XLSX.read(icerikV, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
      onizleme = Object.assign({ dosyaAdi: dosya.name, tur }, tur === 'ogrenci' ? ogrenciCozumle(aoa) : kitapCozumle(aoa));
      onizlemeCiz();
      const el = $('#onizleme');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(() => { onizleme = { dosyaAdi: dosya.name, tur, hataGenel: 'Dosya okunamadı. Excel (.xlsx) ya da CSV dosyası seçtiğinizden emin olun.' }; onizlemeCiz(); });
  }

  function onizlemeCiz() {
    const el = $('#onizleme');
    if (el) el.innerHTML = onizlemeHTML();
  }

  function onizlemeHTML() {
    if (!onizleme) return '';
    const o = onizleme;
    if (o.hataGenel) {
      return `<section class="kart onizleme onizleme-hata">
        <h2><i class="fa-solid fa-triangle-exclamation"></i> “${esc(o.dosyaAdi)}” okunamadı</h2>
        <p class="aciklama">${esc(o.hataGenel)}</p>
        <div class="veri-btnler"><button class="btn btn-ikincil" data-act="onizleme-kapat">Kapat</button></div>
      </section>`;
    }
    const k = o.kayitlar;
    const sayilar = o.tur === 'ogrenci'
      ? [[k.length, 'öğrenci'], [new Set(k.map(x => `${x.sinif}-${x.sube}`)).size, 'şube'], [new Set(k.map(x => x.tel)).size, 'veli'], [new Set(k.map(x => x.sinif)).size, 'düzey']]
      : [[o.satirSay, 'kitap'], [k.length, 'paket'], [new Set(k.map(x => x.sinif)).size, 'düzey']];
    const tablo = o.tur === 'ogrenci'
      ? `<thead><tr><th>Satır</th><th>No</th><th>Öğrenci</th><th>Şube</th><th>Veli</th><th>T.C.</th><th>Telefon</th><th class="sag">İndirim</th></tr></thead>
         <tbody>${k.slice(0, 8).map((x, i) => `<tr><td class="ikincil">${i + 1}</td><td>${esc(x.no)}</td><td><b>${esc(x.ad)}</b></td><td>${x.sinif}-${esc(x.sube)}</td><td>${esc(x.veli)}</td><td class="ikincil">${tcMaske(x.veliTc)}</td><td class="ikincil">${B.telMaske(x.tel)}</td><td class="sag">${x.indirim ? '%' + x.indirim : '—'}</td></tr>`).join('')}</tbody>`
      : `<thead><tr><th>Düzey</th><th>Paket</th><th>Tür</th><th>Kitaplar</th><th class="sag">Tutar</th></tr></thead>
         <tbody>${k.slice(0, 10).map(x => `<tr><td>${x.sinif}. Sınıf</td><td><b>${esc(x.ad)}</b></td><td>${x.tur === 'sinif' ? '<span class="rozet rozet-marka">Sınıf listesi</span>' : '<span class="rozet">İsteğe bağlı</span>'}</td><td class="ikincil">${x.icerik.length} kitap</td><td class="sag mono">${tl(x.fiyat)}</td></tr>`).join('')}</tbody>`;
    const fazla = k.length > (o.tur === 'ogrenci' ? 8 : 10) ? `<p class="alan-ipucu" style="margin-top:8px">İlk ${o.tur === 'ogrenci' ? 8 : 10} kayıt gösteriliyor; toplam ${B.sayi(k.length)} kayıt aktarılacak.</p>` : '';
    return `<section class="kart onizleme">
      <h2><i class="fa-solid fa-magnifying-glass-chart"></i> Önizleme: ${esc(o.dosyaAdi)}</h2>
      <p class="aciklama">Sistem dosyayı kontrol etti. Onayladığınızda ${o.tur === 'ogrenci' ? 'öğrenci ve veli listesi' : 'kitap listesi ve fiyatlar'} güncellenir.</p>
      <div class="paket-ozet">${sayilar.map(([n, ad]) => `<span class="paket"><b>${B.sayi(n)}</b> ${ad}</span>`).join('')}
        ${o.hatalar.length ? `<span class="paket paket-hata"><b>${o.hatalar.length}</b> hatalı satır atlanacak</span>` : '<span class="paket paket-tamam"><i class="fa-solid fa-circle-check"></i> Hatalı satır yok</span>'}</div>
      ${o.hatalar.length ? `<div class="mesaj-liste hata-liste">${o.hatalar.slice(0, 6).map(h => `<div><b>Satır ${h.satir}:</b> ${esc(h.mesaj)}</div>`).join('')}${o.hatalar.length > 6 ? `<div>… ve ${o.hatalar.length - 6} satır daha</div>` : ''}</div>` : ''}
      ${o.uyarilar.length ? `<div class="mesaj-liste uyari-liste">${o.uyarilar.map(u => `<div><i class="fa-solid fa-circle-info"></i> ${esc(u)}</div>`).join('')}</div>` : ''}
      <div class="tablo-kap" style="margin-top:14px"><table class="tablo">${tablo}</table></div>
      ${fazla}
      <div class="veri-btnler" style="justify-content:flex-end">
        <button class="btn btn-ikincil" data-act="onizleme-kapat">Vazgeç</button>
        <button class="btn btn-vurgu" data-act="ice-aktar" ${k.length ? '' : 'disabled'}><i class="fa-solid fa-check"></i> Onayla ve içe aktar (${B.sayi(k.length)} kayıt)</button>
      </div>
    </section>`;
  }

  function iceAktar() {
    if (!onizleme || !onizleme.kayitlar || !onizleme.kayitlar.length) return;
    const tamam = B.veriKaydet(onizleme.tur === 'ogrenci' ? { ogrenciler: onizleme.kayitlar } : { setler: onizleme.kayitlar });
    if (!tamam) { B.bildir('Kayıt sırasında sorun oluştu (tarayıcı depolama alanı dolu olabilir).', 'hata'); return; }
    try { sessionStorage.setItem('bbk-ice-aktarildi', onizleme.tur === 'ogrenci' ? `${onizleme.kayitlar.length} öğrenci` : `${onizleme.kayitlar.length} kitap paketi`); } catch (e) { /* yok say */ }
    location.reload();
  }

  function sablonIndir(tur) {
    let satirlar;
    if (tur === 'ogrenci') {
      satirlar = [SUTUNLAR.ogrenci.map(s => s[1])].concat(
        B.OGRENCILER.slice().sort((a, b) => a.sinif - b.sinif || a.sube.localeCompare(b.sube) || a.ad.localeCompare(b.ad, 'tr'))
          .map(o => [o.no, o.ad, o.sinif, o.sube, o.veli, o.veliTc || '', o.tel, o.indirim || '']));
    } else {
      satirlar = [SUTUNLAR.kitap.map(s => s[1])];
      B.SETLER.forEach(st => {
        const n = st.icerik.length;
        const birim = Math.floor(B.fiyat(st.id) / n / 10) * 10;
        st.icerik.forEach((kitap, i) => {
          const f = i === n - 1 ? B.fiyat(st.id) - birim * (n - 1) : birim;
          satirlar.push([st.sinif, st.ad, kitap, '', f, st.tur === 'sinif' ? 'Sınıf listesi' : 'İsteğe bağlı']);
        });
      });
    }
    const ad = tur === 'ogrenci' ? 'ogrenci-veli-listesi' : 'kitap-listesi-ve-fiyatlar';
    if (!window.XLSX) { csvIndir(ad + '.csv', satirlar); return; }
    const ws = XLSX.utils.aoa_to_sheet(satirlar);
    ws['!cols'] = satirlar[0].map((h, i) => ({ wch: Math.max(10, ...satirlar.slice(0, 60).map(r => String(r[i] == null ? '' : r[i]).length + 2)) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tur === 'ogrenci' ? 'Öğrenciler' : 'Kitaplar');
    XLSX.writeFile(wb, ad + '.xlsx');
    B.bildir('Şablon indirildi. Mevcut veriler örnek olarak içinde; kendi listenizi yapıştırıp yükleyebilirsiniz.');
  }

  function veri() {
    const ia = B.iceAktarim;
    const kaynak = (t, metin) => (t
      ? `<span class="rozet rozet-yesil"><i class="fa-solid fa-check"></i> ${B.tarih(t)} yüklendi · ${metin}</span>`
      : `<span class="rozet">Örnek veri · ${metin}</span>`);
    const cipler = tur => SUTUNLAR[tur].map(([k, ad]) => `<span class="cip-sutun ${ISTEGE_BAGLI[tur].includes(k) ? 'istege' : ''}">${ad}</span>`).join('');
    const duzeyler = B.SINIFLAR.map(d => {
      const ogr = B.OGRENCILER.filter(o => o.sinif === d);
      const setler = B.sinifSetleri(d);
      const liste = setler.filter(s => s.tur === 'sinif');
      return { d, ogr: ogr.length, sube: new Set(ogr.map(o => o.sube)).size, liste: liste.length, ek: setler.length - liste.length, tutar: liste.reduce((t, s) => t + B.fiyat(s.id), 0) };
    });

    icerik().innerHTML = `
      <header class="sayfa-bas">
        <div><h1>Excel ile Toplu Tanımlama</h1><p>Öğrenciler, veliler, düzeyler, kitap listeleri ve fiyatlar dosyayla yüklenir; tek tek giriş yapılmaz.</p></div>
        ${ia.ogrenci || ia.kitap ? '<div class="araclar"><button class="btn btn-ikincil" data-act="veri-sifirla"><i class="fa-solid fa-rotate-left"></i> Örnek verilere dön</button></div>' : ''}
      </header>

      <div class="akis">
        <div><span>1</span><b>Şablonu indirin</b><small>Sütunlar hazır gelir</small></div>
        <div><span>2</span><b>Listeyi yapıştırın</b><small>Okul yazılımından kopyalayın</small></div>
        <div><span>3</span><b>Yükleyin</b><small>Sistem hataları gösterir</small></div>
        <div><span>4</span><b>Onaylayın</b><small>Veliler anında görür</small></div>
      </div>

      <div class="izgara-2">
        <section class="kart veri-kart">
          <div class="veri-bas"><span class="veri-ikon"><i class="fa-solid fa-user-graduate"></i></span>
            <div><h2>Öğrenci ve veli listesi</h2>${kaynak(ia.ogrenci, `${B.sayi(B.OGRENCILER.length)} öğrenci`)}</div></div>
          <p class="aciklama">Her satır bir öğrenci. Aynı telefona sahip öğrenciler kardeş olarak tek veli hesabında birleşir.</p>
          <div class="sutun-cipleri">${cipler('ogrenci')}</div>
          <div class="veri-btnler">
            <button class="btn btn-ikincil" data-act="sablon-ogrenci"><i class="fa-solid fa-download"></i> Şablonu indir</button>
            <label class="btn btn-birincil"><input type="file" class="veri-dosya" data-tur="ogrenci" accept=".xlsx,.xls,.csv" hidden><i class="fa-solid fa-file-arrow-up"></i> Excel yükle</label>
          </div>
        </section>
        <section class="kart veri-kart">
          <div class="veri-bas"><span class="veri-ikon"><i class="fa-solid fa-book"></i></span>
            <div><h2>Düzeylere göre kitap listesi</h2>${kaynak(ia.kitap, `${B.SETLER.length} paket, ${new Set(B.SETLER.map(s => s.sinif)).size} düzey`)}</div></div>
          <p class="aciklama">Her satır bir kitap ve fiyatı. Aynı paket adındaki kitaplar birleşir; velinin ödeyeceği tutar otomatik hesaplanır.</p>
          <div class="sutun-cipleri">${cipler('kitap')}</div>
          <div class="veri-btnler">
            <button class="btn btn-ikincil" data-act="sablon-kitap"><i class="fa-solid fa-download"></i> Şablonu indir</button>
            <label class="btn btn-birincil"><input type="file" class="veri-dosya" data-tur="kitap" accept=".xlsx,.xls,.csv" hidden><i class="fa-solid fa-file-arrow-up"></i> Excel yükle</label>
          </div>
        </section>
      </div>
      <p class="alan-ipucu" style="margin:-4px 0 16px"><span class="cip-sutun istege" style="margin-right:6px">Soluk</span> sütunlar isteğe bağlıdır. Sütun sırası önemli değil; sistem başlıkları tanır.</p>

      <div id="onizleme">${onizlemeHTML()}</div>

      <section class="kart">
        <h2>Düzey özeti <small>Velinin göreceği tutar, sınıf listesinin toplamıdır</small></h2>
        <div class="tablo-kap" style="margin-top:12px">
          <table class="tablo">
            <thead><tr><th>Düzey</th><th>Kademe</th><th class="sag">Öğrenci</th><th class="sag">Şube</th><th class="sag">Sınıf listesi</th><th class="sag">İsteğe bağlı</th><th class="sag">Veli başı tutar</th></tr></thead>
            <tbody>${duzeyler.map(x => `<tr>
              <td><b>${x.d}. Sınıf</b></td><td class="ikincil">${B.kademe(x.d)}</td>
              <td class="sag mono">${B.sayi(x.ogr)}</td><td class="sag">${x.sube}</td>
              <td class="sag">${x.liste ? x.liste + ' paket' : '<span class="ikincil">Tanımlı değil</span>'}</td>
              <td class="sag">${x.ek || '—'}</td>
              <td class="sag mono">${x.tutar ? tl(x.tutar) : '—'}</td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </section>`;
  }

  /* ---------- Modal ---------- */

  function modalAc(html) {
    $('#modal').innerHTML = `<div class="modal-arka" data-act="modal-arka">${html}</div>`;
  }
  function modalKapat() { const m = $('#modal'); if (m) m.innerHTML = ''; }

  /* ---------- Olaylar ---------- */

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'modal-arka') { if (e.target === el) modalKapat(); return; }
    if (act === 'cekmece-arka') { if (e.target === el) cekmeceKapat(); return; }

    switch (act) {
      case 'sifirla':
        if (confirm('Demo verileri sıfırlansın mı? Demoda verilen siparişler, fiyat ve ayar değişiklikleri silinir.')) {
          B.sifirla();
          girisli = false;
          location.hash = '';
          render();
          B.bildir('Demo sıfırlandı.');
        }
        break;
      case 'menu': $('#yan').classList.toggle('acik'); break;
      case 'cikis':
        try { sessionStorage.removeItem(GIRIS); } catch (err) { /* yok say */ }
        girisli = false;
        render();
        break;
      case 'siparis-git': location.hash = `siparisler/${el.dataset.no}`; break;
      case 'siparis': siparisDetay(el.dataset.no); break;
      case 'cekmece-kapat': cekmeceKapat(); break;
      case 'daha': U.sipLimit += 50; siparisTablo(); break;
      case 'csv-siparis': {
        const satirlar = [['Sipariş No', 'Tarih', 'Öğrenci No', 'Öğrenci', 'Şube', 'Set', 'Fiyat', 'Sipariş Toplamı', 'Taksit', 'Durum', 'Veli']];
        filtreliSiparisler().forEach(s => s.kalemler.forEach(k => {
          const o = B.ogrenciByNo(k.ogrenciNo);
          satirlar.push([s.no, B.tarih(s.tarih), o.no, o.ad, `${o.sinif}-${o.sube}`, B.setById(k.setId).ad, csvSayi(k.fiyat), csvSayi(s.toplam), s.taksit, B.DURUMLAR[s.durum].ad, s.veli]);
        }));
        csvIndir('siparisler.csv', satirlar);
        B.bildir('Sipariş listesi indirildi (Excel ile açılabilir).');
        break;
      }
      case 'fatura-goster': B.bildir('Gerçek sürümde e-Arşiv fatura PDF’i entegratörden açılır.', 'bilgi'); break;
      case 'sms-tek': B.bildir('Veliye bilgilendirme SMS’i kuyruğa alındı (demo — gerçek SMS gönderilmez).'); break;
      case 'iade': {
        const s = B.siparis(el.dataset.no);
        if (s && confirm(`${s.no} iade edilsin mi? ${tl(s.tahsilat)} karta iade edilir (demo).`)) {
          B.durumGuncelle(s.no, 'iade');
          B.bildir(`İade başlatıldı: ${tl(s.tahsilat)} ${s.kart.program} **** ${s.kart.son4} kartına iade edilecek (demo).`);
          render();
        }
        break;
      }
      case 'yazdir': window.print(); break;
      case 'tumunu-teslim': {
        const cbs = [...document.querySelectorAll('.teslim-cb')];
        cbs.forEach(cb => cb.dataset.nolar.split(',').forEach(no => B.durumGuncelle(no, 'teslim')));
        B.bildir(`${U.dagSube} şubesinde ${cbs.length} öğrencinin setleri teslim edildi olarak işaretlendi. Velilere SMS gider.`);
        render();
        break;
      }
      case 'sablon-ogrenci': sablonIndir('ogrenci'); break;
      case 'sablon-kitap': sablonIndir('kitap'); break;
      case 'onizleme-kapat': onizleme = null; onizlemeCiz(); break;
      case 'ice-aktar': iceAktar(); break;
      case 'veri-sifirla':
        if (confirm('Yüklenen Excel listeleri silinip örnek verilere dönülsün mü?')) { B.veriSifirla(); location.reload(); }
        break;
      case 'sms-vermeyen': {
        const alinan = B.alinanlar();
        smsModal(B.OGRENCILER.filter(o => !alinan[o.no]).map(o => o.no));
        break;
      }
      case 'sms-secili': smsModal([...U.secili]); break;
      case 'sms-gonder':
        modalKapat();
        B.bildir(`${B.sayi(Number(el.dataset.say))} veliye SMS kuyruğa alındı (demo — gerçek SMS gönderilmez).`);
        U.secili.clear();
        if ($('#ogr-govde')) ogrenciTablo();
        break;
      case 'csv-yayinevi': {
        const satis = {};
        B.aktifSiparisler().forEach(s => s.kalemler.forEach(k => { satis[k.setId] = (satis[k.setId] || 0) + 1; }));
        const satirlar = [['Sınıf', 'Set', 'Satılan Adet', 'İçerik']];
        B.SETLER.forEach(s => satirlar.push([`${s.sinif}. Sınıf`, s.ad, satis[s.id] || 0, s.icerik.join(' + ')]));
        csvIndir('yayinevi-siparis-listesi.csv', satirlar);
        B.bildir('Yayınevi sipariş listesi indirildi.');
        break;
      }
      case 'modal-kapat': modalKapat(); break;
    }
  });

  document.addEventListener('submit', e => {
    if (e.target.id !== 'yonetim-giris') return;
    e.preventDefault();
    girisli = true;
    try { sessionStorage.setItem(GIRIS, '1'); } catch (err) { /* yok say */ }
    render();
  });

  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'sip-ara') { U.sipAra = t.value; U.sipLimit = 50; siparisTablo(); }
    else if (t.id === 'ogr-ara') { U.ogrAra = t.value; ogrenciTablo(); }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'sip-sinif') { U.sipSinif = t.value; U.sipLimit = 50; siparisTablo(); }
    else if (t.id === 'sip-durum') { U.sipDurum = t.value; U.sipLimit = 50; siparisTablo(); }
    else if (t.id === 'durum-sec') {
      B.durumGuncelle(t.dataset.no, t.value);
      B.bildir(`${t.dataset.no} → ${B.DURUMLAR[t.value].ad}${t.value === 'teslim' ? ' · veliye teslim SMS’i gider' : ''}`);
      siparisTablo();
      navGuncelle('siparisler');
      siparisDetay(t.dataset.no);
    }
    else if (t.id === 'dag-sube') { U.dagSube = t.value; dagitim(); }
    else if (t.classList.contains('teslim-cb')) {
      t.dataset.nolar.split(',').forEach(no => B.durumGuncelle(no, t.checked ? 'teslim' : 'hazirlaniyor'));
      B.bildir(t.checked ? 'Teslim edildi olarak işaretlendi · veliye SMS gider.' : 'Teslim işareti kaldırıldı.');
      dagitim();
      navGuncelle('dagitim');
    }
    else if (t.id === 'ogr-sinif') { U.ogrSinif = t.value; ogrenciTablo(); }
    else if (t.id === 'ogr-durum') { U.ogrDurum = t.value; ogrenciTablo(); }
    else if (t.classList.contains('ogr-cb')) {
      if (t.checked) U.secili.add(t.dataset.no); else U.secili.delete(t.dataset.no);
      seciliGuncelle();
    }
    else if (t.id === 'hepsini-sec') {
      document.querySelectorAll('.ogr-cb').forEach(cb => {
        cb.checked = t.checked;
        if (t.checked) U.secili.add(cb.dataset.no); else U.secili.delete(cb.dataset.no);
      });
      seciliGuncelle();
    }
    else if (t.classList.contains('veri-dosya') && t.files && t.files[0]) {
      dosyaOku(t.files[0], t.dataset.tur);
      t.value = '';
    }
    else if (t.id === 'set-sinif') { U.setSinif = t.value; setler(); }
    else if (t.classList.contains('fiyat-girdi')) {
      const v = Number(t.value);
      if (!(v >= 0)) { B.bildir('Geçerli bir fiyat girin.', 'hata'); return; }
      B.fiyatGuncelle(t.dataset.id, v);
      B.bildir(`${esc(B.setById(t.dataset.id).ad)} (${B.setById(t.dataset.id).sinif}. sınıf) → ${tl(v)} · veli mağazasında anında geçerli. Verilmiş siparişler etkilenmez.`);
    }
    else if (t.id === 'ayar-satis') { B.ayarGuncelle({ satisAcik: t.checked }); B.bildir(t.checked ? 'Satış açıldı.' : 'Satış kapatıldı — veliler bilgilendirme mesajı görecek.'); }
    else if (t.id === 'ayar-kardes') { B.ayarGuncelle({ kardesIndirim: Math.max(0, Math.min(50, Number(t.value) || 0)) }); B.bildir('Kardeş indirimi güncellendi.'); }
    else if (t.classList.contains('ayar-taksit')) {
      const secili = [...document.querySelectorAll('.ayar-taksit:checked')].map(x => Number(x.value));
      B.ayarGuncelle({ taksitler: secili });
      B.bildir('Taksit seçenekleri güncellendi.');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('#modal') && $('#modal').innerHTML) modalKapat();
    else if ($('#cekmece') && $('#cekmece').innerHTML) cekmeceKapat();
  });

  // Grafik ipuçları
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-ipucu]');
    const ip = $('#ipucu');
    if (!ip) return;
    if (!el) { ip.hidden = true; return; }
    ip.innerHTML = el.dataset.ipucu;
    ip.hidden = false;
    ipucuKonum(e);
  });
  function ipucuKonum(e) {
    const ip = $('#ipucu');
    if (!ip || ip.hidden) return;
    const w = ip.offsetWidth / 2 + 8;
    ip.style.left = Math.min(window.innerWidth - w, Math.max(w, e.clientX)) + 'px';
    ip.style.top = e.clientY + 'px';
  }
  document.addEventListener('mousemove', ipucuKonum);
  window.addEventListener('scroll', () => { const ip = $('#ipucu'); if (ip) ip.hidden = true; }, { passive: true });

  window.addEventListener('hashchange', () => {
    const yan = $('#yan');
    if (yan) yan.classList.remove('acik');
    const c = $('#cekmece');
    if (c) c.innerHTML = '';
    render();
    window.scrollTo(0, 0);
  });

  // Veli mağazasında (başka sekmede) verilen sipariş panele canlı düşer
  B.degisince(({ yeniSiparis }) => {
    if (!girisli) return;
    if (yeniSiparis) {
      const adlar = yeniSiparis.ogrenciler.map(no => B.ogrenciByNo(no).ad).join(', ');
      B.bildir(`<b>Yeni sipariş ${yeniSiparis.no}</b> · ${esc(adlar)} · ${tl(yeniSiparis.toplam)}`, 'bilgi');
    }
    render();
  });

  render();
  try {
    const m = sessionStorage.getItem('bbk-ice-aktarildi');
    if (m) { sessionStorage.removeItem('bbk-ice-aktarildi'); B.bildir(`İçe aktarıldı: ${m}. Veli ekranı güncellendi.`); }
  } catch (e) { /* yok say */ }
})();
