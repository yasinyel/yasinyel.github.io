/* Büyük Başarı Koleji — Veli mağazası (demo) */
(function () {
  'use strict';

  const B = window.BBK;
  const { esc, tl } = B;
  const $ = (s, el) => (el || document).querySelector(s);
  const ana = $('#ana');
  const ustSag = $('#ust-sag');
  const OTURUM = 'bbk-veli-oturum';

  /* ---------- Oturum durumu (kart bilgisi asla burada tutulmaz) ---------- */

  function yeniOturum() {
    return {
      adim: 'giris', girisNo: '', otp: false,
      tel: null, veliAd: '', aktif: null, gorulen: [], sepet: [],
      teslimat: 'okul', adres: '', eposta: '',
      fatura: { tip: 'bireysel', tckn: '', unvan: '', vd: '', vno: '' },
      taksit: 1, sonSiparis: null
    };
  }
  let S;
  try { S = Object.assign(yeniOturum(), JSON.parse(sessionStorage.getItem(OTURUM)) || {}); } catch (e) { S = yeniOturum(); }
  function kaydet() { try { sessionStorage.setItem(OTURUM, JSON.stringify(S)); } catch (e) { /* yok say */ } }

  const ogrenciler = () => (S.tel ? B.veliOgrencileri(S.tel) : []);
  const sepette = (no, id) => S.sepet.some(k => k.no === no && k.setId === id);
  const yukari = () => window.scrollTo(0, 0);

  function hesap() {
    const a = B.ayar();
    const kalemler = S.sepet
      .filter(k => B.setById(k.setId))
      .map(k => ({ no: k.no, setId: k.setId, set: B.setById(k.setId), fiyat: B.fiyat(k.setId) }));
    const ara = B.yuvarla(kalemler.reduce((t, k) => t + k.fiyat, 0));
    const grup = {};
    kalemler.forEach(k => { grup[k.no] = (grup[k.no] || 0) + k.fiyat; });
    const tutarlar = Object.values(grup).sort((x, y) => y - x);
    // Kardeş indirimi: en yüksek tutarlı öğrenci hariç diğer kardeşlerin setlerine uygulanır
    const indirim = tutarlar.length >= 2 && a.kardesIndirim > 0
      ? B.yuvarla(tutarlar.slice(1).reduce((t, x) => t + x, 0) * a.kardesIndirim / 100)
      : 0;
    const kargo = S.teslimat === 'kargo' && kalemler.length ? a.kargo : 0;
    const toplam = B.yuvarla(ara - indirim + kargo);
    return { kalemler, ara, indirim, kargo, toplam, ogrSayisi: tutarlar.length, ayar: a };
  }

  // Bir öğrencinin sayfası ilk kez açıldığında okulun belirlediği sınıf setlerini sepete ekler
  function ogrenciyiGor(no) {
    if (S.gorulen.includes(no)) return;
    S.gorulen.push(no);
    const o = B.ogrenciByNo(no);
    const alinan = B.alinanlar()[no] || {};
    B.sinifSetleri(o.sinif).forEach(s => {
      if (s.tur === 'sinif' && !alinan[s.id] && !sepette(no, s.id)) S.sepet.push({ no, setId: s.id });
    });
  }

  /* ---------- Çizim ---------- */

  function render() {
    const acik = [...document.querySelectorAll('details[open][data-k]')].map(d => d.dataset.k);
    if (!S.tel && S.adim !== 'giris') S.adim = 'giris';
    ustRender();
    document.body.classList.toggle('mobil-bar-var', S.adim === 'setler');
    const sayfa = { giris: girisSayfa, setler: setlerSayfa, teslimat: teslimatSayfa, odeme: odemeSayfa, tamam: tamamSayfa }[S.adim] || girisSayfa;
    sayfa();
    kaydet();
    acik.forEach(k => { const d = document.querySelector(`details[data-k="${k}"]`); if (d) d.open = true; });
  }

  function ustRender() {
    if (S.tel) {
      const ad = S.veliAd || (ogrenciler()[0] || {}).veli || '';
      ustSag.innerHTML = `
        <div class="veli-kutu"><span class="avatar">${esc(B.basHarfler(ad))}</span><span>${esc(ad)}</span></div>
        <button class="btn btn-hayalet btn-kucuk" data-act="cikis"><i class="fa-solid fa-right-from-bracket"></i> Çıkış</button>`;
    } else {
      ustSag.innerHTML = `<span class="rozet rozet-yesil"><i class="fa-solid fa-lock"></i> Güvenli alışveriş</span>`;
    }
  }

  function adimlarHTML(n) {
    const adlar = [['setler', 'Setler'], ['teslimat', 'Teslimat ve fatura'], ['odeme', 'Ödeme']];
    return `<nav class="adimlar" aria-label="Sipariş adımları">${adlar.map(([k, ad], i) => {
      const sira = i + 1;
      const cizgi = i ? '<span class="adim-cizgi"></span>' : '';
      if (sira < n) return `${cizgi}<button type="button" class="adim bitti" data-act="git" data-adim="${k}"><span class="no"><i class="fa-solid fa-check"></i></span><span class="ad">${ad}</span></button>`;
      return `${cizgi}<span class="adim ${sira === n ? 'aktif' : ''}"${sira === n ? ' aria-current="step"' : ''}><span class="no">${sira}</span><span class="ad">${ad}</span></span>`;
    }).join('')}</nav>`;
  }

  /* ----- 1. Giriş ----- */

  function girisSayfa() {
    const a = B.ayar();
    const vadesiz = Math.max(1, ...a.taksitler.filter(n => !B.VADE_FARKI[n]));
    let form;
    if (!a.satisAcik) {
      form = `<div class="kapali-not"><i class="fa-solid fa-store-slash"></i><div>Kitap satışları şu anda kapalı. Satış dönemi başladığında SMS ile bilgilendirileceksiniz.</div></div>`;
    } else if (!S.otp) {
      form = `
        <form id="giris-form" novalidate>
          <div class="alan" id="alan-no">
            <label for="ogr-no">Öğrenci numarası</label>
            <input id="ogr-no" inputmode="numeric" autocomplete="off" placeholder="Örn. 2471" maxlength="8" value="${esc(S.girisNo)}">
            <div class="hata-metni"></div>
          </div>
          <button class="btn btn-birincil btn-tam btn-buyuk" style="margin-top:16px">Devam et <i class="fa-solid fa-arrow-right"></i></button>
        </form>`;
    } else {
      const o = B.ogrenciByNo(S.girisNo);
      form = `
        <form id="otp-form" novalidate>
          <div class="bilgi-not"><i class="fa-solid fa-mobile-screen"></i><div>Okul kayıtlarındaki veli telefonuna (<b>${B.telMaske(o.tel)}</b>) 4 haneli doğrulama kodu gönderdik.</div></div>
          <div class="alan" id="alan-otp">
            <label for="otp">Doğrulama kodu</label>
            <input id="otp" class="otp-girdi" inputmode="numeric" autocomplete="one-time-code" maxlength="4" placeholder="••••">
            <div class="hata-metni"></div>
          </div>
          <button class="btn btn-birincil btn-tam btn-buyuk" style="margin-top:16px">Doğrula ve giriş yap</button>
          <div style="display:flex;justify-content:space-between;gap:10px;margin-top:12px;font-size:13px">
            <button type="button" class="baglanti" data-act="geri-no">Numarayı değiştir</button>
            <span style="color:var(--soluk)">Demo kodu: <b>1234</b></span>
          </div>
        </form>`;
    }

    ana.innerHTML = `
      <section class="hero">
        <div class="hero-metin">
          <span class="etiket"><i class="fa-solid fa-calendar-check"></i> Ortaokul ve Anadolu Lisesi · ${B.OKUL.donem} kitap satışları açık</span>
          <h1>Çocuğunuzun kitap seti <em>birkaç dakikada</em> hazır.</h1>
          <p>Öğrenci numaranızla giriş yapın, sınıfına özel setleri görün, kartla tek çekim ya da taksitle ödeyin. Kitaplar okulda öğrencinin sınıfına teslim edilsin.</p>
          <div class="hero-adimlar">
            <div class="hero-adim"><i class="fa-solid fa-id-card"></i><div><b>1. Giriş yapın</b><span>Öğrenci no + SMS kodu</span></div></div>
            <div class="hero-adim"><i class="fa-solid fa-layer-group"></i><div><b>2. Seti onaylayın</b><span>Sınıfa özel hazır liste</span></div></div>
            <div class="hero-adim"><i class="fa-solid fa-credit-card"></i><div><b>3. Güvenle ödeyin</b><span>Okulda sınıfına teslim</span></div></div>
          </div>
        </div>
        <div class="kart giris-kart">
          <h2>Veli girişi</h2>
          <p>Şifre gerekmez. Öğrenci numarasını girin, kayıtlı telefonunuza gelen kodla doğrulayın.</p>
          ${form}
          <div class="demo-ipucu">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Demo öğrencileri:
            <div class="cipler">
              <button type="button" class="cip" data-act="demo-no" data-no="2471"><b>2471</b> · Elif, 7-A (kardeşi Can, 5-B)</button>
              <button type="button" class="cip" data-act="demo-no" data-no="3105"><b>3105</b> · Mert, 12-A</button>
              <button type="button" class="cip" data-act="demo-no" data-no="1820"><b>1820</b> · Zeynep, 9-A</button>
            </div>
          </div>
        </div>
      </section>

      <section class="avantajlar">
        <div class="avantaj"><i class="fa-solid fa-credit-card"></i><div><b>${vadesiz > 1 ? `${vadesiz} taksit vade farksız` : 'Tüm kartlara taksit'}</b><span>Tüm banka kartlarına taksit seçenekleri</span></div></div>
        <div class="avantaj"><i class="fa-solid fa-school"></i><div><b>Okulda ücretsiz teslim</b><span>Kitaplar öğrencinin sınıfına dağıtılır</span></div></div>
        <div class="avantaj"><i class="fa-solid fa-children"></i><div><b>Kardeşler tek sepette</b><span>${a.kardesIndirim > 0 ? `Kardeş setlerine %${a.kardesIndirim} indirim` : 'Tüm çocuklarınız için tek ödeme'}</span></div></div>
        <div class="avantaj"><i class="fa-solid fa-file-invoice"></i><div><b>e-Arşiv fatura</b><span>Faturanız e-postanıza gelir</span></div></div>
      </section>

      <section class="sss">
        <h2>Sık sorulan sorular</h2>
        <details><summary>Hangi kitapları almam gerektiğini nereden bileceğim?</summary><p>Giriş yaptığınızda öğrencinizin sınıfı otomatik tanınır ve öğretmenler kurulunun belirlediği setler listelenir. Ayrıca bir liste aramanıza gerek yok.</p></details>
        <details><summary>Kitaplar ne zaman ve nasıl teslim edilir?</summary><p>“Okulda teslim” seçeneğinde kitaplar dağıtım gününde öğrencinin sınıfına teslim edilir ve size SMS ile bilgi verilir. Dilerseniz adrese kargo da seçebilirsiniz.</p></details>
        <details><summary>Ödeme güvenli mi?</summary><p>Ödemeler bankanın 3D Secure doğrulamasıyla alınır. Kart bilgileriniz okul sistemlerinde saklanmaz; işlem doğrudan banka/ödeme kuruluşu altyapısında gerçekleşir.</p></details>
        <details><summary>İade veya değişim yapabilir miyim?</summary><p>Teslimden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. İade onaylandığında tutar ödemeyi yaptığınız karta iade edilir.</p></details>
      </section>`;
  }

  /* ----- 2. Setler ----- */

  function setlerSayfa() {
    const ogrs = ogrenciler();
    if (!ogrs.length) { S = yeniOturum(); return render(); }
    if (!ogrs.some(o => o.no === S.aktif)) S.aktif = ogrs[0].no;
    ogrenciyiGor(S.aktif);
    const o = B.ogrenciByNo(S.aktif);
    const alinanTum = B.alinanlar();
    const alinan = alinanTum[o.no] || {};
    const oncekiSiparisler = [...new Set(Object.values(alinan))];
    const setler = B.sinifSetleri(o.sinif);
    const veliAd = S.veliAd || ogrs[0].veli;

    const not = oncekiSiparisler.length
      ? `<div class="bilgi-not vurgu"><i class="fa-solid fa-receipt"></i><div>${esc(o.ad.split(' ')[0])} için daha önce sipariş verdiniz (<b>${oncekiSiparisler.join(', ')}</b>). Satın alınan setler işaretlendi; eksik kalanları ekleyebilirsiniz.</div></div>`
      : `<div class="bilgi-not"><i class="fa-solid fa-circle-info"></i><div><b>${o.sinif}. sınıf</b> için okulun belirlediği <b>sınıf setleri</b> sepete eklendi. İsteğe bağlı setleri dilediğiniz gibi ekleyip çıkarabilirsiniz.</div></div>`;

    ana.innerHTML = `
      ${adimlarHTML(1)}
      <div class="karsilama">
        <div>
          <h1>Hoş geldiniz, ${esc(veliAd)}</h1>
          <p>${ogrs.length > 1 ? `Okulumuzda kayıtlı ${ogrs.length} öğrenciniz var. Hepsinin setlerini aynı sepette toplayabilirsiniz.` : 'Öğrencinizin sınıfına göre belirlenen setler aşağıda.'}</p>
        </div>
      </div>
      <div class="duzen setler-duzen">
        <div>
          <div class="ogr-sekmeler" role="tablist">${ogrs.map(sekmeHTML).join('')}</div>
          ${not}
          <div class="set-izgara">${setler.map(s => setKartHTML(o, s, alinan)).join('')}</div>
        </div>
        <aside class="sag-sutun" id="ozet">${ozetHTML('setler')}</aside>
      </div>
      ${mobilBarHTML()}`;
  }

  function sekmeHTML(x) {
    const n = S.sepet.filter(k => k.no === x.no).length;
    const aktif = x.no === S.aktif;
    return `<button class="ogr-sekme ${aktif ? 'aktif' : ''}" role="tab" aria-selected="${aktif}" data-act="ogr" data-no="${x.no}">
      <span class="avatar">${esc(B.basHarfler(x.ad))}</span>
      <span><b>${esc(x.ad)}</b><small>${x.sinif}-${x.sube} · ${B.kademe(x.sinif)}</small></span>
      ${n ? `<span class="sayac">${n} set</span>` : ''}
    </button>`;
  }

  function setKartHTML(o, s, alinan) {
    const sipNo = alinan[s.id];
    const secili = sepette(o.no, s.id);
    const btn = sipNo
      ? `<button class="sec-btn" disabled><i class="fa-solid fa-check"></i> Satın alındı</button>`
      : `<button class="sec-btn ${secili ? 'secili' : ''}" data-act="sec" data-no="${o.no}" data-id="${s.id}" aria-pressed="${secili}">
           ${secili ? '<i class="fa-solid fa-check"></i> Sepette' : '<i class="fa-solid fa-plus"></i> Sepete ekle'}
         </button>`;
    return `<article class="set-kart ${secili ? 'secili' : ''} ${sipNo ? 'alindi' : ''}">
      ${B.kapakHTML(s)}
      <div class="set-govde">
        <div>${s.tur === 'sinif'
          ? '<span class="rozet rozet-marka"><i class="fa-solid fa-school"></i> Sınıf seti</span>'
          : '<span class="rozet">İsteğe bağlı</span>'}</div>
        <h3>${esc(s.ad)}</h3>
        <details data-k="${o.no}-${s.id}"><summary>${s.icerik.length} parça · içeriği gör</summary>
          <ul>${s.icerik.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        </details>
        <div class="set-alt"><span class="fiyat">${tl(B.fiyat(s.id))}</span>${btn}</div>
      </div>
    </article>`;
  }

  function ozetHTML(asama) {
    const h = hesap();
    const gruplar = {};
    h.kalemler.forEach(k => (gruplar[k.no] = gruplar[k.no] || []).push(k));
    const govde = h.kalemler.length
      ? Object.keys(gruplar).map(no => {
        const o = B.ogrenciByNo(no);
        return `<div class="ozet-grup">
          <div class="ozet-ogr">${esc(o.ad)} · ${o.sinif}-${o.sube}</div>
          ${gruplar[no].map(k => `<div class="ozet-kalem"><span>${esc(k.set.ad)}</span><b>${tl(k.fiyat)}</b>${asama === 'setler'
            ? `<button data-act="cikar" data-no="${no}" data-id="${k.setId}" aria-label="${esc(k.set.ad)} sepetten çıkar"><i class="fa-solid fa-xmark"></i></button>` : ''}</div>`).join('')}
        </div>`;
      }).join('')
      : `<div class="bos-sepet"><i class="fa-solid fa-basket-shopping"></i>Sepetiniz boş</div>`;

    let ipucu = '';
    if (asama === 'setler' && h.ogrSayisi === 1 && ogrenciler().length > 1 && h.ayar.kardesIndirim > 0) {
      ipucu = `<div class="bilgi-not vurgu" style="margin:10px 0 0"><i class="fa-solid fa-children"></i><div>Kardeşinin setlerini de eklerseniz <b>%${h.ayar.kardesIndirim} kardeş indirimi</b> uygulanır.</div></div>`;
    }

    const th = B.taksitHesapla(h.toplam, S.taksit);
    const odemeAsamasi = asama === 'odeme';
    const odenecek = odemeAsamasi ? th.vadeli : h.toplam;

    const btn = asama === 'setler'
      ? `<button class="btn btn-birincil btn-tam btn-buyuk" data-act="ileri" ${h.kalemler.length ? '' : 'disabled'}>Teslimat bilgilerine geç <i class="fa-solid fa-arrow-right"></i></button>`
      : '';

    return `<div class="kart ozet">
      <h3><i class="fa-solid fa-basket-shopping"></i> Sepet <span class="rozet">${h.kalemler.length} set</span></h3>
      ${govde}
      <div class="satir"><span>Ara toplam</span><b>${tl(h.ara)}</b></div>
      ${h.indirim ? `<div class="satir indirim"><span>Kardeş indirimi (%${h.ayar.kardesIndirim})</span><b>−${tl(h.indirim)}</b></div>` : ''}
      ${asama !== 'setler' ? `<div class="satir"><span>Teslimat</span><b>${h.kargo ? tl(h.kargo) : 'Ücretsiz'}</b></div>` : ''}
      ${odemeAsamasi && th.oran ? `<div class="satir"><span>Vade farkı (${S.taksit} taksit)</span><b>${tl(th.vadeli - h.toplam)}</b></div>` : ''}
      <div class="satir toplam"><span>Toplam</span><b>${tl(odenecek)}</b></div>
      ${odemeAsamasi && S.taksit > 1 ? `<div class="satir"><span>${S.taksit} × aylık</span><b>${tl(th.aylik)}</b></div>` : ''}
      ${ipucu}
      ${btn}
      <div class="guven"><i class="fa-solid fa-shield-halved"></i> 3D Secure ile güvenli ödeme · Fiyatlara KDV dahildir</div>
    </div>`;
  }

  function mobilBarHTML() {
    const h = hesap();
    return `<div class="mobil-bar">
      <div><small>${h.kalemler.length} set${h.indirim ? ' · kardeş indirimi dahil' : ''}</small><b>${tl(h.toplam)}</b></div>
      <button class="btn btn-birincil" data-act="ileri" ${h.kalemler.length ? '' : 'disabled'}>Devam et <i class="fa-solid fa-arrow-right"></i></button>
    </div>`;
  }

  function ozetYenile(asama) {
    const oz = $('#ozet');
    if (oz) oz.innerHTML = ozetHTML(asama);
  }

  /* ----- 3. Teslimat ve fatura ----- */

  function teslimatSayfa() {
    if (!S.sepet.length) { S.adim = 'setler'; return render(); }
    const a = B.ayar();
    const ogrs = ogrenciler();
    const siniflar = [...new Set(S.sepet.map(k => { const o = B.ogrenciByNo(k.no); return `${o.sinif}-${o.sube}`; }))].join(' ve ');
    const f = S.fatura;
    const fGoster = tip => (f.tip === tip ? '' : 'hidden');

    ana.innerHTML = `
      ${adimlarHTML(2)}
      <div class="duzen">
        <div>
          <form id="teslimat-form" novalidate>
            <div class="kart">
              <h2>Teslimat yöntemi</h2>
              <div class="secim-kartlari">
                <label class="secim-kart">
                  <input type="radio" name="teslimat" value="okul" ${S.teslimat === 'okul' ? 'checked' : ''}>
                  <i class="fa-solid fa-school"></i>
                  <div><b>Okulda sınıfına teslim</b><span>Kitaplar ${siniflar} sınıfına teslim edilir, sınıf öğretmeni dağıtır.</span></div>
                  <em class="ucretsiz">Ücretsiz</em>
                </label>
                <label class="secim-kart">
                  <input type="radio" name="teslimat" value="kargo" ${S.teslimat === 'kargo' ? 'checked' : ''}>
                  <i class="fa-solid fa-truck-fast"></i>
                  <div><b>Adrese kargo</b><span>Ödemeden sonra 2–4 iş günü içinde kargoya verilir.</span></div>
                  <em>${tl(a.kargo)}</em>
                </label>
              </div>
              <div class="alan" id="alan-adres" style="margin-top:14px" ${S.teslimat === 'kargo' ? '' : 'hidden'}>
                <label for="adres">Teslimat adresi</label>
                <textarea id="adres" placeholder="Mahalle, sokak, bina ve daire no, ilçe / il">${esc(S.adres)}</textarea>
                <div class="hata-metni"></div>
              </div>
            </div>

            <div class="kart">
              <h2>İletişim ve fatura bilgileri</h2>
              <p class="aciklama">Sipariş onayı ve e-Arşiv fatura bu bilgilere gönderilir.</p>
              <div class="form-izgara">
                <div class="alan" id="alan-ad">
                  <label for="veli-ad">Veli adı soyadı</label>
                  <input id="veli-ad" autocomplete="name" value="${esc(S.veliAd || ogrs[0].veli)}">
                  <div class="hata-metni"></div>
                </div>
                <div class="alan">
                  <label for="tel">Cep telefonu</label>
                  <input id="tel" value="${B.telMaske(S.tel)}  ✓ doğrulandı" readonly>
                </div>
                <div class="alan tam" id="alan-eposta">
                  <label for="eposta">E-posta</label>
                  <input id="eposta" type="email" autocomplete="email" placeholder="ornek@eposta.com" value="${esc(S.eposta)}">
                  <div class="hata-metni"></div>
                </div>
                <div class="alan tam">
                  <span class="etiket-ad">Fatura tipi</span>
                  <div class="secim-grup">
                    <button type="button" class="${f.tip === 'bireysel' ? 'aktif' : ''}" data-act="fatura" data-tip="bireysel">Bireysel</button>
                    <button type="button" class="${f.tip === 'kurumsal' ? 'aktif' : ''}" data-act="fatura" data-tip="kurumsal">Kurumsal</button>
                  </div>
                </div>
                <div class="alan tam" data-fatura="bireysel" ${fGoster('bireysel')}>
                  <label for="tckn">T.C. kimlik no <span style="font-weight:500;color:var(--soluk)">(isteğe bağlı)</span></label>
                  <input id="tckn" inputmode="numeric" maxlength="11" value="${esc(f.tckn)}">
                  <span class="alan-ipucu">Boş bırakırsanız e-Arşiv fatura veli adına düzenlenir.</span>
                </div>
                <div class="alan tam" data-fatura="kurumsal" id="alan-unvan" ${fGoster('kurumsal')}>
                  <label for="unvan">Firma unvanı</label>
                  <input id="unvan" value="${esc(f.unvan)}">
                  <div class="hata-metni"></div>
                </div>
                <div class="alan" data-fatura="kurumsal" id="alan-vd" ${fGoster('kurumsal')}>
                  <label for="vd">Vergi dairesi</label>
                  <input id="vd" value="${esc(f.vd)}">
                  <div class="hata-metni"></div>
                </div>
                <div class="alan" data-fatura="kurumsal" id="alan-vno" ${fGoster('kurumsal')}>
                  <label for="vno">Vergi no</label>
                  <input id="vno" inputmode="numeric" maxlength="10" value="${esc(f.vno)}">
                  <div class="hata-metni"></div>
                </div>
              </div>
            </div>

            <div class="aksiyonlar">
              <button type="button" class="btn btn-ikincil" data-act="git" data-adim="setler"><i class="fa-solid fa-arrow-left"></i> Setlere dön</button>
              <button class="btn btn-birincil btn-buyuk">Ödemeye geç <i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </form>
        </div>
        <aside class="sag-sutun" id="ozet">${ozetHTML('teslimat')}</aside>
      </div>`;
  }

  function teslimatGonder() {
    let gecerli = true;
    const deger = id => ($('#' + id) ? $('#' + id).value.trim() : '');
    S.veliAd = deger('veli-ad');
    S.eposta = deger('eposta');
    S.adres = deger('adres');
    Object.assign(S.fatura, { tckn: deger('tckn'), unvan: deger('unvan'), vd: deger('vd'), vno: deger('vno') });

    if (S.veliAd.length < 3) gecerli = hata('alan-ad', 'Lütfen adınızı ve soyadınızı yazın.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.eposta)) gecerli = hata('alan-eposta', 'Geçerli bir e-posta adresi girin.');
    if (S.teslimat === 'kargo' && S.adres.length < 10) gecerli = hata('alan-adres', 'Lütfen açık adresinizi yazın.');
    if (S.fatura.tip === 'kurumsal') {
      if (S.fatura.unvan.length < 2) gecerli = hata('alan-unvan', 'Firma unvanını yazın.');
      if (S.fatura.vd.length < 2) gecerli = hata('alan-vd', 'Vergi dairesini yazın.');
      if (!/^\d{10}$/.test(S.fatura.vno)) gecerli = hata('alan-vno', 'Vergi no 10 haneli olmalı.');
    }
    if (!gecerli) { kaydet(); return; }
    S.adim = 'odeme';
    render();
    yukari();
  }

  /* ----- 4. Ödeme ----- */

  function odemeSayfa() {
    if (!S.sepet.length) { S.adim = 'setler'; return render(); }
    const a = B.ayar();
    if (S.taksit !== 1 && !a.taksitler.includes(S.taksit)) S.taksit = 1;
    const h = hesap();

    ana.innerHTML = `
      ${adimlarHTML(3)}
      <div class="duzen">
        <div>
          <form id="odeme-form" novalidate autocomplete="off">
            <div class="kart">
              <h2>Kart bilgileri <small><i class="fa-solid fa-lock"></i> Kart bilgileriniz okulda saklanmaz</small></h2>
              <div class="odeme-izgara">
                <div>
                  <div class="kredi-kart" id="kk" aria-hidden="true"></div>
                  <p class="demo-kart-not"><i class="fa-solid fa-flask"></i> Demo: <button type="button" class="baglanti" data-act="demo-kart">test kartıyla doldur</button></p>
                </div>
                <div class="form-izgara">
                  <div class="alan tam" id="alan-kno">
                    <label for="kno">Kart numarası</label>
                    <input id="kno" inputmode="numeric" placeholder="0000 0000 0000 0000" maxlength="19" autocomplete="off">
                    <div class="hata-metni"></div>
                  </div>
                  <div class="alan tam" id="alan-kad">
                    <label for="kad">Kart üzerindeki isim</label>
                    <input id="kad" placeholder="AD SOYAD" autocomplete="off">
                    <div class="hata-metni"></div>
                  </div>
                  <div class="alan" id="alan-skt">
                    <label for="skt">Son kullanma</label>
                    <input id="skt" inputmode="numeric" placeholder="AA/YY" maxlength="5" autocomplete="off">
                    <div class="hata-metni"></div>
                  </div>
                  <div class="alan" id="alan-cvv">
                    <label for="cvv">CVV</label>
                    <input id="cvv" inputmode="numeric" placeholder="•••" maxlength="3" autocomplete="off">
                    <div class="hata-metni"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="kart">
              <h2>Taksit seçenekleri <small id="program-not"></small></h2>
              <div class="taksit-tablo" id="taksitler">${taksitlerHTML(h.toplam)}</div>
            </div>

            <div class="kart">
              <label class="onay"><input type="checkbox" id="onay-mss">
                <span><button type="button" class="baglanti" data-act="belge" data-belge="on">Ön Bilgilendirme Formu</button>’nu ve
                <button type="button" class="baglanti" data-act="belge" data-belge="mss">Mesafeli Satış Sözleşmesi</button>’ni okudum, onaylıyorum.</span>
              </label>
              <label class="onay"><input type="checkbox" id="onay-kvkk">
                <span><button type="button" class="baglanti" data-act="belge" data-belge="kvkk">KVKK Aydınlatma Metni</button>’ni okudum.</span>
              </label>
              <div id="onay-hata" style="color:var(--kirmizi);font-size:13px;font-weight:600;margin-top:8px"></div>
            </div>

            <div class="aksiyonlar">
              <button type="button" class="btn btn-ikincil" data-act="git" data-adim="teslimat"><i class="fa-solid fa-arrow-left"></i> Geri</button>
              <button class="btn btn-vurgu btn-buyuk" id="ode-btn"><i class="fa-solid fa-lock"></i> <span>${tl(B.taksitHesapla(h.toplam, S.taksit).vadeli)} öde</span></button>
            </div>
          </form>
        </div>
        <aside class="sag-sutun" id="ozet">${ozetHTML('odeme')}</aside>
      </div>`;
    kartOnizle();
  }

  function taksitlerHTML(toplam) {
    const a = B.ayar();
    const secenekler = [1].concat(a.taksitler.slice().sort((x, y) => x - y));
    return secenekler.map(n => {
      const t = B.taksitHesapla(toplam, n);
      const ad = n === 1 ? 'Tek çekim' : `${n} taksit`;
      const alt = n > 1 && t.oran ? `<span>%${(t.oran * 100).toLocaleString('tr-TR')} vade farkı</span>` : n > 1 ? '<span>Vade farkını okul karşılar</span>' : '<span>Peşin ödeme</span>';
      return `<label class="taksit-satir">
        <input type="radio" name="taksit" value="${n}" ${S.taksit === n ? 'checked' : ''}>
        <span class="t-ad"><b>${ad}${n > 1 && !t.oran ? '<span class="rozet rozet-yesil">Vade farksız</span>' : ''}</b>${alt}</span>
        <span class="t-aylik">${n === 1 ? '' : `${n} × ${tl(t.aylik)}`}</span>
        <span class="t-toplam">${tl(t.vadeli)}</span>
      </label>`;
    }).join('');
  }

  function odemeTutarYenile() {
    const h = hesap();
    const btn = $('#ode-btn span');
    if (btn) btn.textContent = `${tl(B.taksitHesapla(h.toplam, S.taksit).vadeli)} öde`;
    ozetYenile('odeme');
  }

  function kartOnizle() {
    const kk = $('#kk');
    if (!kk) return;
    const no = ($('#kno').value || '').replace(/\D/g, '');
    const ad = $('#kad').value.trim();
    const skt = $('#skt').value;
    const prog = B.kartProgrami(no);
    const goster = (no + '•'.repeat(16)).slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
    const marka = no[0] === '4' ? '<i class="fa-brands fa-cc-visa"></i>'
      : (no[0] === '5' || no[0] === '2') ? '<i class="fa-brands fa-cc-mastercard"></i>'
      : no[0] === '9' ? '<span class="troy">TROY</span>' : '';
    kk.innerHTML = `
      <div class="kk-ust"><span class="kk-cip"></span>${prog ? `<span class="kk-program">${prog}</span>` : ''}</div>
      <div class="kk-no">${goster}</div>
      <div class="kk-alt">
        <div class="kk-ad"><small>Kart sahibi</small><b>${esc(ad || 'AD SOYAD')}</b></div>
        <div><small>SKT</small><b>${esc(skt || 'AA/YY')}</b></div>
        <div class="kk-marka">${marka}</div>
      </div>`;
    const not = $('#program-not');
    if (not) {
      not.innerHTML = prog
        ? `<i class="fa-solid fa-circle-check" style="color:var(--yesil)"></i> ${prog} kartınıza özel seçenekler`
        : 'Kart numaranızı girdiğinizde kartınıza özel seçenekler gösterilir';
    }
  }

  let bekleyenOdeme = null;
  let sayacId = null;

  function odemeGonder() {
    let gecerli = true;
    const no = $('#kno').value.replace(/\D/g, '');
    const ad = $('#kad').value.trim();
    const skt = $('#skt').value.trim();
    const cvv = $('#cvv').value.trim();
    if (no.length !== 16) gecerli = hata('alan-kno', 'Kart numarası 16 haneli olmalı.');
    if (ad.length < 3) gecerli = hata('alan-kad', 'Kart üzerindeki ismi yazın.');
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(skt);
    if (!m) gecerli = hata('alan-skt', 'AA/YY biçiminde girin.');
    else {
      const simdi = new Date();
      const yil = 2000 + Number(m[2]);
      const ay = Number(m[1]);
      if (yil < simdi.getFullYear() || (yil === simdi.getFullYear() && ay < simdi.getMonth() + 1)) gecerli = hata('alan-skt', 'Kartın süresi dolmuş.');
    }
    if (!/^\d{3}$/.test(cvv)) gecerli = hata('alan-cvv', '3 haneli güvenlik kodu.');
    const onayHata = $('#onay-hata');
    if (!$('#onay-mss').checked || !$('#onay-kvkk').checked) {
      onayHata.textContent = 'Devam etmek için sözleşmeleri onaylamanız gerekiyor.';
      gecerli = false;
    } else onayHata.textContent = '';
    if (!gecerli) { B.bildir('Lütfen işaretli alanları kontrol edin.', 'hata'); return; }

    const h = hesap();
    // Kart numarasının yalnızca program adı ve son 4 hanesi kullanılır; tam numara hiçbir yerde tutulmaz.
    bekleyenOdeme = { program: B.kartProgrami(no) || 'Banka', son4: no.slice(-4), taksit: S.taksit, tutar: B.taksitHesapla(h.toplam, S.taksit).vadeli };
    ['kno', 'cvv'].forEach(id => { $('#' + id).value = ''; });
    ucDModal(bekleyenOdeme);
  }

  function ucDModal(od) {
    modalAc(`<div class="modal modal-3d" role="dialog" aria-modal="true" aria-label="3D Secure doğrulama">
      <div class="banka-ust"><b>${esc(od.program)} · 3D Secure</b><span><i class="fa-solid fa-shield-halved"></i> Güvenli doğrulama</span></div>
      <div class="modal-govde" id="ucd-govde">
        <div class="uc-d-bilgi">
          <span>İşyeri</span><b>${esc(B.OKUL.ad.toLocaleUpperCase('tr-TR'))}</b>
          <span>Tutar</span><b>${tl(od.tutar)}</b>
          <span>Taksit</span><b>${od.taksit === 1 ? 'Tek çekim' : od.taksit + ' taksit'}</b>
          <span>Kart</span><b>**** **** **** ${esc(od.son4)}</b>
        </div>
        <p style="margin-bottom:12px">${B.telMaske(S.tel)} numaralı telefonunuza gönderilen tek kullanımlık şifreyi girin.</p>
        <div class="alan" id="alan-sms">
          <input id="sms" class="otp-girdi" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code" aria-label="SMS şifresi">
          <div class="hata-metni"></div>
        </div>
        <p class="alan-ipucu" style="text-align:center;margin-top:8px">Demo şifre: <b>123456</b></p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn btn-ikincil" data-act="modal-kapat" style="flex:1">İptal</button>
          <button type="button" class="btn btn-birincil" data-act="ucd-onay" style="flex:2">Onayla</button>
        </div>
        <div class="sayac" id="sayac">Kalan süre 3:00</div>
      </div>
    </div>`);
    setTimeout(() => { const i = $('#sms'); if (i) i.focus(); }, 60);
    let kalan = 180;
    sayacId = setInterval(() => {
      kalan--;
      const el = $('#sayac');
      if (el) el.textContent = `Kalan süre ${Math.floor(kalan / 60)}:${String(kalan % 60).padStart(2, '0')}`;
      if (kalan <= 0) { modalKapat(); B.bildir('3D doğrulama süresi doldu. Lütfen tekrar deneyin.', 'hata'); }
    }, 1000);
  }

  function ucdOnayla() {
    const kod = ($('#sms') || {}).value || '';
    if (kod.trim() !== '123456') return hata('alan-sms', 'Şifre hatalı. Demo için 123456 girin.');
    clearInterval(sayacId);
    $('#ucd-govde').innerHTML = `<div style="padding:30px 0;text-align:center"><div class="donen"></div><p style="margin-top:16px;font-weight:600;color:var(--murekkep)">Ödeme onaylanıyor…</p><p class="alan-ipucu" style="margin-top:4px">Lütfen sayfayı kapatmayın.</p></div>`;
    setTimeout(() => {
      const s = siparisOlustur(bekleyenOdeme);
      bekleyenOdeme = null;
      modalKapat();
      S.adim = 'tamam';
      render();
      yukari();
      B.bildir(`Ödeme başarılı · Sipariş ${s.no}`);
    }, 1500);
  }

  function siparisOlustur(od) {
    const h = hesap();
    const th = B.taksitHesapla(h.toplam, S.taksit);
    const s = B.siparisEkle({
      ogrenciler: [...new Set(h.kalemler.map(k => k.no))],
      kalemler: h.kalemler.map(k => ({ ogrenciNo: k.no, setId: k.setId, fiyat: k.fiyat })),
      ara: h.ara, indirim: h.indirim, kargo: h.kargo, toplam: h.toplam, tahsilat: th.vadeli,
      taksit: S.taksit,
      kart: { program: od.program, son4: od.son4 },
      provizyon: String(100000 + Math.floor(Math.random() * 900000)),
      teslimat: S.teslimat, adres: S.teslimat === 'kargo' ? S.adres : '',
      veli: S.veliAd, tel: S.tel, eposta: S.eposta,
      fatura: Object.assign({}, S.fatura)
    });
    S.sonSiparis = s.no;
    S.sepet = [];
    S.taksit = 1;
    return s;
  }

  /* ----- 5. Sonuç ----- */

  function tamamSayfa() {
    const s = S.sonSiparis && B.siparis(S.sonSiparis);
    if (!s) { S.adim = S.tel ? 'setler' : 'giris'; return render(); }
    const gruplar = {};
    s.kalemler.forEach(k => (gruplar[k.ogrenciNo] = gruplar[k.ogrenciNo] || []).push(k));
    const siniflar = s.ogrenciler.map(no => { const o = B.ogrenciByNo(no); return `${o.sinif}-${o.sube}`; }).join(' ve ');

    ana.innerHTML = `
      <div class="kart tamam">
        <div class="tamam-ikon"><i class="fa-solid fa-check"></i></div>
        <h1>Ödemeniz alındı</h1>
        <p>Siparişiniz oluşturuldu. Özetini SMS ve e-posta ile gönderdik.</p>
        <div class="siparis-no">${s.no}</div>
        <div class="tamam-izgara">
          <div><i class="fa-solid fa-credit-card"></i><b>${s.taksit === 1 ? 'Tek çekim' : s.taksit + ' taksit'} · ${tl(s.tahsilat)}</b>${esc(s.kart.program)} **** ${esc(s.kart.son4)}<br>Provizyon: ${s.provizyon}</div>
          <div><i class="fa-solid ${s.teslimat === 'okul' ? 'fa-school' : 'fa-truck-fast'}"></i><b>${s.teslimat === 'okul' ? 'Okulda sınıfına teslim' : 'Adrese kargo'}</b>${s.teslimat === 'okul' ? `${siniflar} sınıfına teslim edilecek. Teslimde SMS alacaksınız.` : '2–4 iş günü içinde kargoya verilecek.'}</div>
          <div><i class="fa-solid fa-file-invoice"></i><b>e-Arşiv fatura</b>${s.eposta ? esc(s.eposta) + ' adresine gönderilecek.' : 'E-posta adresinize gönderilecek.'}</div>
        </div>
        <div class="tamam-kalemler">
          ${Object.keys(gruplar).map(no => {
            const o = B.ogrenciByNo(no);
            return `<div class="ozet-grup"><div class="ozet-ogr">${esc(o.ad)} · ${o.sinif}-${o.sube}</div>
              ${gruplar[no].map(k => `<div class="ozet-kalem"><span>${esc(B.setById(k.setId).ad)}</span><b>${tl(k.fiyat)}</b></div>`).join('')}</div>`;
          }).join('')}
          ${s.indirim ? `<div class="satir indirim"><span>Kardeş indirimi</span><b>−${tl(s.indirim)}</b></div>` : ''}
          ${s.kargo ? `<div class="satir"><span>Kargo</span><b>${tl(s.kargo)}</b></div>` : ''}
          <div class="satir toplam"><span>Ödenen</span><b>${tl(s.tahsilat)}</b></div>
        </div>
        <div class="aksiyonlar">
          <button class="btn btn-ikincil" data-act="git" data-adim="setler"><i class="fa-solid fa-arrow-left"></i> Setlere dön</button>
          <a class="btn btn-birincil" href="yonetim.html#siparisler/${s.no}" target="_blank" rel="noopener"><i class="fa-solid fa-gauge"></i> Okul panelinde gör</a>
        </div>
        <p class="alan-ipucu" style="margin-top:14px"><i class="fa-solid fa-lightbulb"></i> Sunum ipucu: “Okul panelinde gör” ile siparişin yönetim paneline anında düştüğünü gösterebilirsiniz.</p>
      </div>`;
  }

  /* ---------- Belgeler (örnek metinler) ---------- */

  function sepetListesiHTML() {
    const h = hesap();
    if (!h.kalemler.length) return '<p>Sepetinizdeki ürünler, adetleri ve KDV dahil satış fiyatları burada listelenir.</p>';
    return `<ul>${h.kalemler.map(k => { const o = B.ogrenciByNo(k.no); return `<li>${esc(k.set.ad)} (${esc(o.ad)}, ${o.sinif}-${o.sube}) — ${tl(k.fiyat)}</li>`; }).join('')}</ul>
      <p><b>Toplam (KDV dahil):</b> ${tl(h.toplam)}</p>`;
  }

  const SATICI = `<p><b>Satıcı:</b> [Okul işletmesinin ticari unvanı] · [Adres] · [Vergi dairesi / no] · [MERSİS no] · [Telefon / e-posta]</p>`;

  const BELGELER = {
    on: ['Ön Bilgilendirme Formu', () => `
      <h4>Satıcı bilgileri</h4>${SATICI}
      <h4>Ürünlerin temel nitelikleri ve fiyatı</h4>${sepetListesiHTML()}
      <h4>Ödeme ve teslimat</h4><p>Ödeme, 3D Secure doğrulamalı kredi/banka kartı ile alınır. Okulda teslim seçeneğinde ürünler öğrencinin sınıfına, kargo seçeneğinde bildirilen adrese en geç 30 gün içinde teslim edilir.</p>
      <h4>Cayma hakkı</h4><p>Teslimden itibaren 14 gün içinde gerekçe göstermeksizin cayma hakkı kullanılabilir. Etkinleştirilmiş dijital erişim kodları gibi yönetmelikte sayılan istisnalar saklıdır.</p>
      <h4>Şikâyet ve itiraz</h4><p>Başvurular, yasal parasal sınırlar dahilinde tüketicinin yerleşim yerindeki Tüketici Hakem Heyeti’ne veya Tüketici Mahkemesi’ne yapılabilir.</p>`],
    mss: ['Mesafeli Satış Sözleşmesi', () => `
      <h4>1. Taraflar</h4>${SATICI}<p><b>Alıcı:</b> Siparişi veren veli (ad, telefon ve e-posta sipariş sırasında alınır).</p>
      <h4>2. Konu</h4><p>Alıcının ${esc(B.OKUL.magazaAdresi)} üzerinden verdiği siparişe konu ürünlerin satışı ve teslimine ilişkin hak ve yükümlülükler, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği’ne göre belirlenir.</p>
      <h4>3. Ürünler</h4>${sepetListesiHTML()}
      <h4>4. Teslimat</h4><p>Okulda teslim seçeneğinde ürünler öğrencinin sınıfına teslim edilir; kargo seçeneğinde alıcının bildirdiği adrese gönderilir. Teslim süresi en geç 30 gündür.</p>
      <h4>5. Cayma hakkı</h4><p>Alıcı, teslimden itibaren 14 gün içinde cayma hakkını kullanabilir. Bedel, cayma bildiriminden itibaren 14 gün içinde ödemenin yapıldığı karta iade edilir.</p>
      <h4>6. Ödeme</h4><p>Kart bilgileri satıcı tarafından saklanmaz; işlem banka/ödeme kuruluşu altyapısında gerçekleşir.</p>`],
    kvkk: ['KVKK Aydınlatma Metni', () => `
      <h4>Veri sorumlusu</h4><p>[Okul işletmesinin ticari unvanı]</p>
      <h4>İşlenen veriler</h4><p>Veli: ad-soyad, telefon, e-posta, fatura ve (kargo seçilirse) adres bilgileri. Öğrenci: ad-soyad, okul numarası, sınıf/şube (okul kayıtlarından).</p>
      <h4>Amaç ve hukuki sebep</h4><p>Siparişin alınması, ödemenin tahsili, faturalandırma, teslimat ve bilgilendirme; sözleşmenin kurulması ve ifası (KVKK m.5/2-c) ile hukuki yükümlülüklerin yerine getirilmesi (m.5/2-ç).</p>
      <h4>Aktarım</h4><p>Yalnızca hizmetin gerektirdiği ölçüde: banka/ödeme kuruluşu, e-fatura entegratörü, SMS sağlayıcısı ve (kargo seçilirse) kargo firması.</p>
      <h4>Haklarınız</h4><p>KVKK m.11 kapsamındaki taleplerinizi [başvuru e-posta adresi] üzerinden iletebilirsiniz.</p>`],
    iade: ['İade ve Değişim', () => `
      <p>Eksik, hatalı veya hasarlı ürünleri teslimden itibaren 14 gün içinde okul muhasebe birimine bildirebilirsiniz.</p>
      <p>İade onaylandığında tutar, ödemenin yapıldığı karta iade edilir. Taksitli işlemlerde iade, bankanızın uygulamasına göre taksitlere yansıtılır.</p>
      <p>Okulda teslim edilen setlerde değişim, sınıf öğretmeni aracılığıyla da yapılabilir.</p>`],
    iletisim: ['İletişim', () => `
      <p><b>Okul muhasebe birimi</b></p>
      <p><i class="fa-solid fa-phone"></i> ${esc(B.OKUL.telefon)}<br><i class="fa-solid fa-envelope"></i> [Muhasebe e-posta adresi]<br><i class="fa-solid fa-clock"></i> Hafta içi 08.30–17.00</p>`]
  };

  function belgeAc(k) {
    const b = BELGELER[k];
    if (!b) return;
    modalAc(`<div class="modal" role="dialog" aria-modal="true" aria-label="${b[0]}">
      <div class="modal-bas"><h3>${b[0]}</h3><button class="kapat-btn" data-act="modal-kapat" aria-label="Kapat"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="modal-govde">
        <div class="taslak-not"><i class="fa-solid fa-scale-balanced"></i> Örnek metindir; yayına almadan önce okulun hukuk ve mali müşavir onayından geçirilecektir.</div>
        ${b[1]()}
      </div>
      <div class="modal-alt"><button class="btn btn-birincil" data-act="modal-kapat">Anladım</button></div>
    </div>`);
  }

  /* ---------- Modal ---------- */

  function modalAc(html) {
    $('#modal').innerHTML = `<div class="modal-arka" data-act="modal-arka">${html}</div>`;
    document.body.style.overflow = 'hidden';
  }
  function modalKapat() {
    clearInterval(sayacId);
    $('#modal').innerHTML = '';
    document.body.style.overflow = '';
  }

  /* ---------- Form yardımcıları ---------- */

  function hata(alanId, mesaj) {
    const alan = document.getElementById(alanId);
    if (alan) {
      alan.classList.add('hatali');
      const m = alan.querySelector('.hata-metni');
      if (m) m.textContent = mesaj;
    }
    return false;
  }

  function girisDene(no) {
    no = String(no || '').trim();
    if (!/^\d{3,8}$/.test(no)) return hata('alan-no', 'Lütfen öğrenci numarasını girin.');
    const o = B.ogrenciByNo(no);
    if (!o) return hata('alan-no', 'Bu numarayla kayıtlı öğrenci bulunamadı. Numarayı kontrol edin veya okul muhasebesine danışın.');
    S.girisNo = no;
    S.otp = true;
    render();
    setTimeout(() => { const i = $('#otp'); if (i) i.focus(); }, 50);
    B.bildir(`Doğrulama kodu ${B.telMaske(o.tel)} numarasına gönderildi (demo kodu: 1234)`, 'bilgi');
    return true;
  }

  function otpDogrula(kod) {
    if (kod !== '1234') return hata('alan-otp', 'Kod hatalı. Demo için 1234 girin.');
    const o = B.ogrenciByNo(S.girisNo);
    Object.assign(S, { tel: o.tel, veliAd: o.veli, aktif: o.no, otp: false, adim: 'setler', gorulen: [], sepet: [] });
    render();
    yukari();
    return true;
  }

  /* ---------- Olaylar ---------- */

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act === 'modal-arka') { if (e.target === el) modalKapat(); return; }

    switch (act) {
      case 'sifirla':
        if (confirm('Demo verileri sıfırlansın mı? Demoda verilen siparişler ve panel değişiklikleri silinir.')) {
          B.sifirla();
          S = yeniOturum();
          render();
          B.bildir('Demo sıfırlandı.');
        }
        break;
      case 'demo-no':
        S.otp = false;
        render();
        if ($('#ogr-no')) { $('#ogr-no').value = el.dataset.no; girisDene(el.dataset.no); }
        break;
      case 'geri-no': S.otp = false; render(); break;
      case 'cikis': S = yeniOturum(); render(); yukari(); break;
      case 'ogr': S.aktif = el.dataset.no; render(); break;
      case 'sec': {
        const { no, id } = el.dataset;
        if (sepette(no, id)) S.sepet = S.sepet.filter(k => !(k.no === no && k.setId === id));
        else S.sepet.push({ no, setId: id });
        render();
        break;
      }
      case 'cikar': {
        const { no, id } = el.dataset;
        S.sepet = S.sepet.filter(k => !(k.no === no && k.setId === id));
        render();
        break;
      }
      case 'ileri':
        if (S.sepet.length) { S.adim = 'teslimat'; render(); yukari(); }
        break;
      case 'git':
        S.adim = el.dataset.adim;
        render();
        yukari();
        break;
      case 'fatura':
        S.fatura.tip = el.dataset.tip;
        document.querySelectorAll('[data-act="fatura"]').forEach(b => b.classList.toggle('aktif', b === el));
        document.querySelectorAll('[data-fatura]').forEach(a => { a.hidden = a.dataset.fatura !== S.fatura.tip; });
        kaydet();
        break;
      case 'demo-kart':
        $('#kno').value = '4111 1111 1111 1111';
        $('#kad').value = (S.veliAd || '').toLocaleUpperCase('tr-TR');
        $('#skt').value = '12/29';
        $('#cvv').value = '123';
        document.querySelectorAll('#odeme-form .hatali').forEach(a => a.classList.remove('hatali'));
        kartOnizle();
        break;
      case 'belge': e.preventDefault(); belgeAc(el.dataset.belge); break;
      case 'modal-kapat': modalKapat(); break;
      case 'ucd-onay': ucdOnayla(); break;
    }
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const id = e.target.id;
    if (id === 'giris-form') girisDene($('#ogr-no').value);
    else if (id === 'otp-form') otpDogrula($('#otp').value.trim());
    else if (id === 'teslimat-form') teslimatGonder();
    else if (id === 'odeme-form') odemeGonder();
  });

  document.addEventListener('input', e => {
    const t = e.target;
    const alan = t.closest('.alan.hatali');
    if (alan) { alan.classList.remove('hatali'); const m = alan.querySelector('.hata-metni'); if (m) m.textContent = ''; }
    if (t.id === 'kno') {
      const d = t.value.replace(/\D/g, '').slice(0, 16);
      t.value = d.replace(/(.{4})(?=.)/g, '$1 ');
      kartOnizle();
    } else if (t.id === 'skt') {
      let d = t.value.replace(/\D/g, '').slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
      t.value = d;
      kartOnizle();
    } else if (t.id === 'kad') {
      t.value = t.value.toLocaleUpperCase('tr-TR');
      kartOnizle();
    } else if (t.id === 'cvv' || t.id === 'otp' || t.id === 'sms' || t.id === 'tckn' || t.id === 'vno' || t.id === 'ogr-no') {
      t.value = t.value.replace(/\D/g, '');
      if (t.id === 'otp' && t.value.length === 4) otpDogrula(t.value);
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'teslimat') {
      S.teslimat = t.value;
      const a = $('#alan-adres');
      if (a) a.hidden = S.teslimat !== 'kargo';
      kaydet();
      ozetYenile('teslimat');
    } else if (t.name === 'taksit') {
      S.taksit = Number(t.value);
      kaydet();
      odemeTutarYenile();
    } else if (t.id === 'onay-mss' || t.id === 'onay-kvkk') {
      const h = $('#onay-hata');
      if (h && $('#onay-mss').checked && $('#onay-kvkk').checked) h.textContent = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modal').innerHTML) modalKapat();
    if (e.key === 'Enter' && e.target.id === 'sms') { e.preventDefault(); ucdOnayla(); }
  });

  // Yönetim panelinde (başka sekmede) fiyat/ayar değişirse mağaza güncellenir
  B.degisince(() => { if (S.adim === 'giris' || S.adim === 'setler') render(); });

  render();
})();
