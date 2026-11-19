/*
 * Büyük Başarı Koleji — Kitap Satış Demo
 * Ortak veri katmanı: setler, öğrenciler, siparişler, ayarlar.
 *
 * Bu bir sunum demosudur: veriler tarayıcıda üretilir, yeni siparişler ve
 * ayar değişiklikleri yalnızca bu tarayıcının localStorage'ında tutulur.
 * Gerçek sürümde bu katmanın yerini sunucu tarafı API + veritabanı alır.
 */
(function () {
  'use strict';

  const OKUL = {
    ad: 'Büyük Başarı Koleji',
    kisaAd: 'Büyük Başarı',
    magazaAdresi: 'kitap.buyukbasari.k12.tr',
    donem: '2026–2027',
    kampus: 'Isparta',
    telefon: '0246 223 39 99',
    slogan: 'Bizimle Başlamak Başarmaktır.',
    siparisOnEki: 'BB26-'
  };

  // Excel ile içe aktarılan veriler. Yüklenmemişse örnek veriler kullanılır.
  const VERI_ANAHTAR = 'bbk-kitap-veri-v1';
  const ICE = (function () {
    try { return JSON.parse(localStorage.getItem(VERI_ANAHTAR)) || {}; } catch (e) { return {}; }
  })();
  const iceOgrenci = Array.isArray(ICE.ogrenciler) && ICE.ogrenciler.length > 0;
  const iceKitap = Array.isArray(ICE.setler) && ICE.setler.length > 0;

  // Okulun kademeleri: Ortaokul (5–8) ve Anadolu Lisesi (9–12)
  const ORNEK_SINIFLAR = [5, 6, 7, 8, 9, 10, 11, 12];
  const kademe = sinif => (sinif <= 4 ? 'İlkokul' : sinif <= 8 ? 'Ortaokul' : 'Anadolu Lisesi');

  /* ---------- Yardımcılar ---------- */

  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const paraBicim = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });
  const paraBicimTam = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
  const sayiBicim = new Intl.NumberFormat('tr-TR');
  const kisaBicim = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });

  const tl = n => paraBicim.format(n || 0);
  const tlTam = n => paraBicimTam.format(Math.round(n || 0));
  const tlKisa = n => kisaBicim.format(n || 0) + ' ₺';
  const sayi = n => sayiBicim.format(n || 0);
  const yuvarla = n => Math.round(n * 100) / 100;

  function tarih(iso, secenek) {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleString('tr-TR', secenek || { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function telMaske(tel) {
    const t = String(tel || '').replace(/\D/g, '');
    if (t.length < 11) return tel || '';
    return `${t.slice(0, 4)} *** ** ${t.slice(9, 11)}`;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function basHarfler(ad) {
    return String(ad).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toLocaleUpperCase('tr-TR')).join('');
  }

  /* ---------- Setler ---------- */

  const RENKLER = {
    mavi: ['#5b6e83', '#36434f'],
    kirmizi: ['#d0503a', '#8f2a1c'],
    yesil: ['#2a9364', '#16583a'],
    turuncu: ['#e0912e', '#a35a0c'],
    mor: ['#7449c2', '#43237f']
  };

  function setlerOlustur() {
    const S = [];
    const ekle = (sinif, kod, ad, kisa, tur, fiyat, icerik, renk, ikon) =>
      S.push({ id: `s${sinif}-${kod}`, sinif, kod, ad, kisa, tur, fiyat, icerik, renk, ikon });

    for (const s of ORNEK_SINIFLAR) {
      if (s <= 8) {
        if (s < 8) {
          ekle(s, 'ana', `${s}. Sınıf Ana Yayın Seti`, 'Ana Yayın', 'sinif', 3650, [
            'Türkçe Soru Bankası', 'Matematik Soru Bankası', 'Fen Bilimleri Soru Bankası',
            'Sosyal Bilgiler Soru Bankası', 'Din Kültürü Soru Bankası'
          ], 'mavi', 'fa-book');
        } else {
          ekle(8, 'lgs', 'LGS Hazırlık Seti', 'LGS', 'sinif', 4250, [
            'Türkçe LGS Soru Bankası', 'Matematik LGS Soru Bankası', 'Fen Bilimleri LGS Soru Bankası',
            'T.C. İnkılap Tarihi Soru Bankası', 'Din Kültürü Soru Bankası', 'İngilizce LGS Soru Bankası'
          ], 'mor', 'fa-graduation-cap');
        }
        ekle(s, 'ing', `${s}. Sınıf İngilizce Seti`, 'İngilizce', 'sinif', 2450, [
          "Student's Book", 'Workbook', 'Grammar Practice', 'Dijital Platform Erişimi'
        ], 'kirmizi', 'fa-language');
        ekle(s, 'den', s === 8 ? 'LGS Deneme Paketi' : 'Deneme Sınavı Paketi', 'Deneme', 'ek', s === 8 ? 1950 : 1400,
          s === 8
            ? ['12 LGS provası (yıl boyu)', 'Kazanım bazlı sonuç karnesi', 'Video çözümler']
            : ['8 deneme sınavı (yıl boyu)', 'Sonuç analiz karnesi'],
          'turuncu', 'fa-clipboard-check');
        ekle(s, 'oku', 'Okuma Kitapları Seti', 'Okuma', 'ek', 1250, [
          'Yaşa uygun 8 okuma kitabı', 'Okuma Takip Defteri'
        ], 'yesil', 'fa-book-open');
      } else {
        if (s <= 10) {
          ekle(s, 'ana', `${s}. Sınıf Ana Yayın Seti`, 'Ana Yayın', 'sinif', 3950, [
            'Türk Dili ve Edebiyatı Soru Bankası', 'Matematik Soru Bankası', 'Fizik Soru Bankası',
            'Kimya Soru Bankası', 'Biyoloji Soru Bankası', 'Tarih Soru Bankası', 'Coğrafya Soru Bankası'
          ], 'mavi', 'fa-book');
        } else {
          ekle(s, 'yks', 'YKS Hazırlık Seti (TYT–AYT)', 'YKS', 'sinif', 4850, [
            'TYT Türkçe Soru Bankası', 'TYT Matematik Soru Bankası', 'AYT Matematik Soru Bankası',
            'TYT Fen Bilimleri Soru Bankası', 'TYT Sosyal Bilimler Soru Bankası', 'Konu Anlatım Fasikülleri'
          ], 'mor', 'fa-graduation-cap');
        }
        ekle(s, 'ing', `${s}. Sınıf İngilizce Seti`, 'İngilizce', 'sinif', 2650, [
          "Student's Book", 'Workbook', 'Exam Practice', 'Dijital Platform Erişimi'
        ], 'kirmizi', 'fa-language');
        ekle(s, 'den', s >= 11 ? 'YKS Deneme Paketi' : 'Deneme Sınavı Paketi', 'Deneme', 'ek', s >= 11 ? 2250 : 1500,
          s >= 11
            ? ['10 TYT + 6 AYT denemesi', 'Türkiye geneli sıralama', 'Video çözümler']
            : ['8 deneme sınavı (yıl boyu)', 'Sonuç analiz karnesi'],
          'turuncu', 'fa-clipboard-check');
      }
    }
    return S;
  }

  // Excel'den gelen kitap adına göre kapak rengi ve simgesi
  function setGorunum(ad) {
    const a = String(ad).toLocaleLowerCase('tr-TR');
    if (/ingilizce|english|almanca|yabancı/.test(a)) return ['kirmizi', 'fa-language'];
    if (/deneme|sınav|prova/.test(a)) return ['turuncu', 'fa-clipboard-check'];
    if (/okuma|hikâye|hikaye|roman/.test(a)) return ['yesil', 'fa-book-open'];
    if (/lgs|yks|tyt|ayt|hazırlık/.test(a)) return ['mor', 'fa-graduation-cap'];
    return ['mavi', 'fa-book'];
  }

  const SETLER = iceKitap ? ICE.setler : setlerOlustur();
  const SET_MAP = Object.fromEntries(SETLER.map(s => [s.id, s]));
  const sinifSetleri = sinif => SETLER.filter(s => s.sinif === sinif);

  /* ---------- Öğrenciler ---------- */

  const KIZ = ['Elif', 'Zeynep', 'Defne', 'Ecrin', 'Asel', 'Azra', 'Nehir', 'Eylül', 'Ela', 'Duru', 'Meryem', 'Ada', 'Lina', 'Miray', 'Ebrar', 'Nisa', 'Yağmur', 'Beren', 'İpek', 'Selin', 'Ceren', 'Irmak'];
  const ERKEK = ['Yusuf', 'Eymen', 'Ömer', 'Mustafa', 'Ali', 'Kerem', 'Aras', 'Emir', 'Mert', 'Alparslan', 'Çınar', 'Göktuğ', 'Kuzey', 'Yiğit', 'Batuhan', 'Efe', 'Arda', 'Berk', 'Kaan', 'Deniz', 'Can', 'Poyraz'];
  const ANNE = ['Ayşe', 'Fatma', 'Emine', 'Hatice', 'Merve', 'Esra', 'Özlem', 'Derya', 'Gül', 'Seda', 'Burcu', 'Pınar', 'Sevgi', 'Gamze', 'Tuba'];
  const BABA = ['Mehmet', 'Ahmet', 'Mustafa', 'Hasan', 'Murat', 'Emre', 'Burak', 'Serkan', 'Volkan', 'Onur', 'Okan', 'Tolga', 'Cem', 'Levent'];
  const SOYAD = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat', 'Erdoğan', 'Güneş', 'Aksoy', 'Tekin', 'Korkmaz', 'Avcı', 'Uçar'];

  // Sunumda kullanılacak öğrenciler (bunlar için hazır sipariş üretilmez)
  const DEMO_OGRENCILER = [
    { no: '2471', ad: 'Elif Yılmaz', sinif: 7, sube: 'A', veli: 'Ayşe Yılmaz', veliTc: '11111111110', tel: '05324164567', indirim: 0, demo: true },
    { no: '2472', ad: 'Can Yılmaz', sinif: 5, sube: 'B', veli: 'Ayşe Yılmaz', veliTc: '11111111110', tel: '05324164567', indirim: 0, demo: true },
    { no: '3105', ad: 'Mert Demir', sinif: 12, sube: 'A', veli: 'Murat Demir', veliTc: '22222222220', tel: '05051234589', indirim: 20, demo: true },
    { no: '1820', ad: 'Zeynep Kaya', sinif: 9, sube: 'A', veli: 'Esra Kaya', veliTc: '33333333330', tel: '05437770312', indirim: 0, demo: true }
  ];

  const r = prng(20262027);
  const sec = a => a[Math.floor(r() * a.length)];
  const URETILEN = [];
  let sira = 4001;
  for (const s of ORNEK_SINIFLAR) {
    for (const sube of ['A', 'B']) {
      const n = 16 + Math.floor(r() * 5);
      for (let i = 0; i < n; i++) {
        const soyad = sec(SOYAD);
        const ad = `${sec(r() < 0.5 ? KIZ : ERKEK)} ${soyad}`;
        const veli = `${sec(r() < 0.7 ? ANNE : BABA)} ${soyad}`;
        const tel = '05' + (30 + Math.floor(r() * 25)) + String(Math.floor(r() * 1e7)).padStart(7, '0');
        URETILEN.push({ no: String(sira++), ad, sinif: s, sube, veli, veliTc: '', tel, indirim: 0 });
      }
    }
  }
  DEMO_OGRENCILER.forEach(o => URETILEN.push(o));
  const OGRENCILER = iceOgrenci ? ICE.ogrenciler : URETILEN;
  const OGR_MAP = Object.fromEntries(OGRENCILER.map(o => [o.no, o]));

  const SINIFLAR = [...new Set(OGRENCILER.map(o => o.sinif).concat(SETLER.map(s => s.sinif)))].sort((a, b) => a - b);
  const SUBELER = [...new Set(OGRENCILER.map(o => `${o.sinif}-${o.sube}`))]
    .map(ad => { const [g, sb] = ad.split('-'); return { sinif: Number(g), sube: sb, ad }; })
    .sort((a, b) => a.sinif - b.sinif || a.sube.localeCompare(b.sube, 'tr'));

  /* ---------- Ödeme sabitleri ---------- */

  // Taksitler bankanın sunduğu şekilde peşin fiyatına (vade farksız) gösterilir
  const VADE_FARKI = {};
  const KART_PROGRAMLARI = ['Bonus', 'World', 'Maximum', 'Axess', 'CardFinans', 'Paraf', 'Bankkart'];

  function kartProgrami(bin) {
    const d = String(bin || '').replace(/\D/g, '');
    if (d.length < 6) return null;
    let h = 0;
    for (const c of d.slice(0, 6)) h = (h * 31 + Number(c)) % 9973;
    return KART_PROGRAMLARI[h % KART_PROGRAMLARI.length];
  }

  function taksitHesapla(toplam, n) {
    const oran = VADE_FARKI[n] || 0;
    const vadeli = yuvarla(toplam * (1 + oran));
    return { n, oran, vadeli, aylik: yuvarla(vadeli / n) };
  }

  const DURUMLAR = {
    odendi: { ad: 'Ödendi', ikon: 'fa-circle-check', cls: 'd-odendi' },
    hazirlaniyor: { ad: 'Hazırlanıyor', ikon: 'fa-box', cls: 'd-hazirlaniyor' },
    teslim: { ad: 'Teslim edildi', ikon: 'fa-check-double', cls: 'd-teslim' },
    iade: { ad: 'İade edildi', ikon: 'fa-rotate-left', cls: 'd-iade' }
  };

  /* ---------- Hazır (tohum) siparişler ---------- */

  // Kardeş indirimi isteğe bağlıdır: okul açarsa, belirlediği oranla uygulanır
  const AYAR_VARSAYILAN = { satisAcik: true, kardesIndirimAcik: false, kardesIndirim: 5, taksitler: [2, 3, 6] };

  const TOHUM = (function () {
    const oran = s => (s <= 6 ? 0.74 : s === 7 ? 0.64 : s === 8 ? 0.79 : s <= 10 ? 0.52 : 0.72);
    const simdi = new Date();
    const bugun = new Date(simdi); bugun.setHours(0, 0, 0, 0);
    const liste = [];
    if (iceOgrenci) return liste; // Okulun kendi listesi yüklendiyse örnek sipariş üretilmez
    for (const o of OGRENCILER) {
      if (o.demo) continue;
      if (r() > oran(o.sinif)) continue;
      const setler = sinifSetleri(o.sinif).filter(s => (s.tur === 'sinif' ? r() < 0.93 : r() < 0.42));
      if (!setler.length) continue;
      // Satış ~18 gün önce açıldı: ilk hafta yoğun, sonra düzenli akış
      const gun = r() < 0.38 ? 12 + Math.floor(r() * 6) : Math.floor(r() * 12);
      let t = new Date(bugun.getTime() - gun * 864e5 + (8 + r() * 15) * 36e5);
      if (t > simdi) t = new Date(simdi.getTime() - (5 + r() * 120) * 6e4);
      const teslimat = 'okul';
      const kalemler = setler.map(s => ({ ogrenciNo: o.no, setId: s.id, fiyat: s.fiyat }));
      const ara = kalemler.reduce((a, k) => a + k.fiyat, 0);
      const kargo = 0;
      const tr = r();
      const taksit = tr < 0.45 ? 1 : tr < 0.55 ? 2 : tr < 0.85 ? 3 : 6;
      const th = taksitHesapla(ara + kargo, taksit);
      let durum;
      const dr = r();
      if (gun <= 2) durum = 'odendi';
      else if (gun <= 8) durum = dr < 0.6 ? 'hazirlaniyor' : 'teslim';
      else durum = dr < 0.85 ? 'teslim' : dr < 0.98 ? 'hazirlaniyor' : 'iade';
      liste.push({
        tarih: t.toISOString(),
        ogrenciler: [o.no],
        kalemler, ara, indirim: 0, kargo,
        toplam: yuvarla(ara + kargo),
        tahsilat: th.vadeli,
        taksit,
        kart: { program: sec(KART_PROGRAMLARI), son4: String(1000 + Math.floor(r() * 9000)) },
        provizyon: String(100000 + Math.floor(r() * 900000)),
        teslimat,
        veli: o.veli, tel: o.tel,
        eposta: '',
        fatura: { tip: 'bireysel' },
        durum
      });
    }
    liste.sort((a, b) => a.tarih.localeCompare(b.tarih));
    liste.forEach((s, i) => { s.no = OKUL.siparisOnEki + String(i + 1).padStart(5, '0'); });
    return liste;
  })();

  /* ---------- Kalıcı durum (localStorage) ---------- */

  const ANAHTAR = 'bbk-kitap-demo-v1';
  function oku() {
    try { return JSON.parse(localStorage.getItem(ANAHTAR)) || {}; } catch (e) { return {}; }
  }
  function bos() { return { fiyat: {}, durum: {}, siparisler: [], ayar: {} }; }
  let D = Object.assign(bos(), oku());
  function yaz() {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(D)); } catch (e) { /* özel pencere vb. */ }
  }

  const dinleyiciler = [];
  window.addEventListener('storage', e => {
    if (e.key === VERI_ANAHTAR) { location.reload(); return; }
    if (e.key !== ANAHTAR) return;
    const onceki = D.siparisler.length;
    D = Object.assign(bos(), oku());
    dinleyiciler.forEach(f => f({ yeniSiparis: D.siparisler.length > onceki ? D.siparisler[D.siparisler.length - 1] : null }));
  });

  /* ---------- Sorgular ---------- */

  function ayar() {
    const a = Object.assign({}, AYAR_VARSAYILAN, D.ayar);
    a.kardesEtkin = a.kardesIndirimAcik ? a.kardesIndirim : 0;
    return a;
  }
  const fiyat = setId => (D.fiyat[setId] != null ? D.fiyat[setId] : SET_MAP[setId].fiyat);

  function siparisler() {
    return TOHUM.concat(D.siparisler)
      .map(s => (D.durum[s.no] ? Object.assign({}, s, { durum: D.durum[s.no] }) : s))
      .sort((a, b) => b.tarih.localeCompare(a.tarih));
  }

  function siparis(no) { return siparisler().find(s => s.no === no) || null; }

  function aktifSiparisler() { return siparisler().filter(s => s.durum !== 'iade'); }

  // ogrenciNo -> { setId -> siparisNo } (iade edilenler hariç)
  function alinanlar() {
    const m = {};
    for (const s of aktifSiparisler()) {
      for (const k of s.kalemler) {
        (m[k.ogrenciNo] = m[k.ogrenciNo] || {})[k.setId] = s.no;
      }
    }
    return m;
  }

  function veliOgrencileri(tel) {
    return OGRENCILER.filter(o => o.tel === tel).sort((a, b) => b.sinif - a.sinif);
  }

  // Telefonu 05XXXXXXXXX biçimine getirir (Excel'de baştaki 0 düşmüş olabilir)
  function telNormal(t) {
    let d = String(t == null ? '' : t).replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('90')) d = '0' + d.slice(2);
    if (d.length === 10 && d[0] === '5') d = '0' + d;
    return d;
  }

  // Veli girişi: T.C. kimlik no + kayıtlı cep telefonu, ya da öğrenci no + kayıtlı cep telefonu
  function girisTc(tc, tel) {
    const t = telNormal(tel);
    const k = String(tc || '').replace(/\D/g, '');
    return OGRENCILER.find(o => o.veliTc && o.veliTc === k && o.tel === t) || null;
  }
  function girisNo(no, tel) {
    const o = OGR_MAP[String(no || '').trim()];
    return o && o.tel === telNormal(tel) ? o : null;
  }

  /* ---------- Yazma işlemleri ---------- */

  function siparisEkle(veri) {
    const no = OKUL.siparisOnEki + String(TOHUM.length + D.siparisler.length + 1).padStart(5, '0');
    const s = Object.assign({ no, tarih: new Date().toISOString(), durum: 'odendi', yeni: true }, veri);
    D.siparisler.push(s);
    yaz();
    return s;
  }

  function durumGuncelle(no, durum) { D.durum[no] = durum; yaz(); }
  function fiyatGuncelle(setId, deger) { D.fiyat[setId] = yuvarla(Number(deger) || 0); yaz(); }
  function ayarGuncelle(degisiklik) { D.ayar = Object.assign({}, D.ayar, degisiklik); yaz(); }
  function sifirla() {
    D = bos(); yaz();
    try { localStorage.removeItem(VERI_ANAHTAR); sessionStorage.clear(); } catch (e) { /* yok say */ }
  }

  // Excel içe aktarımı: listeyi kaydeder, eski demo siparişlerini temizler
  function veriKaydet(degisiklik) {
    const yeni = Object.assign({}, ICE, degisiklik);
    if (degisiklik.ogrenciler) yeni.ogrenciTarih = new Date().toISOString();
    if (degisiklik.setler) yeni.kitapTarih = new Date().toISOString();
    try { localStorage.setItem(VERI_ANAHTAR, JSON.stringify(yeni)); } catch (e) { return false; }
    D = bos(); yaz();
    return true;
  }
  function veriSifirla() {
    try { localStorage.removeItem(VERI_ANAHTAR); } catch (e) { /* yok say */ }
    D = bos(); yaz();
  }
  const iceAktarim = { ogrenci: iceOgrenci ? ICE.ogrenciTarih : null, kitap: iceKitap ? ICE.kitapTarih : null };

  /* ---------- Arayüz yardımcıları ---------- */

  function bildir(mesaj, tip) {
    let kutu = document.getElementById('bildirimler');
    if (!kutu) {
      kutu = document.createElement('div');
      kutu.id = 'bildirimler';
      kutu.setAttribute('aria-live', 'polite');
      document.body.appendChild(kutu);
    }
    const el = document.createElement('div');
    el.className = 'bildirim' + (tip ? ' bildirim-' + tip : '');
    const ikon = tip === 'hata' ? 'fa-circle-exclamation' : tip === 'bilgi' ? 'fa-circle-info' : 'fa-circle-check';
    el.innerHTML = `<i class="fa-solid ${ikon}"></i><span>${mesaj}</span>`;
    kutu.appendChild(el);
    requestAnimationFrame(() => el.classList.add('gorunur'));
    setTimeout(() => { el.classList.remove('gorunur'); setTimeout(() => el.remove(), 300); }, 4200);
  }

  function kapakHTML(set, buyuk) {
    const [a, b] = RENKLER[set.renk] || RENKLER.mavi;
    return `<div class="kapak${buyuk ? ' kapak-buyuk' : ''}" style="--k1:${a};--k2:${b}">
      <i class="fa-solid ${set.ikon}"></i>
      <span class="kapak-sinif">${set.sinif}. Sınıf</span>
      <b>${esc(set.kisa)}</b>
    </div>`;
  }

  window.BBK = {
    OKUL, SINIFLAR, kademe, SETLER, OGRENCILER, SUBELER, DURUMLAR, VADE_FARKI, KART_PROGRAMLARI, RENKLER,
    setById: id => SET_MAP[id],
    ogrenciByNo: no => OGR_MAP[String(no).trim()] || null,
    sinifSetleri, veliOgrencileri, telNormal, girisTc, girisNo, setGorunum,
    veriKaydet, veriSifirla, iceAktarim, siparisler, siparis, aktifSiparisler, alinanlar,
    ayar, fiyat, kartProgrami, taksitHesapla,
    siparisEkle, durumGuncelle, fiyatGuncelle, ayarGuncelle, sifirla,
    degisince: f => dinleyiciler.push(f),
    tl, tlTam, tlKisa, sayi, yuvarla, tarih, telMaske, esc, basHarfler, bildir, kapakHTML
  };
})();
