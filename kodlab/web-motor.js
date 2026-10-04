// Kodlayalım — Web Atölyesi bölümleri
// Her görev, önizlemedeki gerçek sayfanın DOM'una ve hesaplanmış stillerine bakan bir denetimdir: d = document, w = window
(function (root) {
    'use strict';

    const renk = (w, el, ozellik = 'color') => {
        const m = w.getComputedStyle(el)[ozellik].match(/\d+(\.\d+)?/g);
        return m ? m.slice(0, 4).map(Number) : [0, 0, 0, 1];
    };
    const saydam = (c) => c.length === 4 && c[3] === 0;
    const mavimsi = ([r, g, b]) => b > 120 && b > r + 40 && b > g + 10;
    const kirmizimsi = ([r, g, b]) => r > 150 && r > g + 60 && r > b + 60;
    const beyazDegil = (c) => !saydam(c) && !(c[0] > 245 && c[1] > 245 && c[2] > 245);
    const px = (w, el, ozellik) => parseFloat(w.getComputedStyle(el)[ozellik]) || 0;
    const metin = (el) => (el ? el.textContent.trim() : '');
    // Öğrencinin CSS kuralları (@media içindekiler dahil)
    const kurallar = (d) => { const l = []; const gez = (r) => { for (const x of r) { if (x.selectorText !== undefined) l.push(x); if (x.cssRules && x.cssRules.length) gez(x.cssRules); } }; const s = d.getElementById('ogrenci-css'); if (s && s.sheet) gez(s.sheet.cssRules); return l; };
    // Bir kutuya yazı yazmış gibi: değeri değiştirip input olayını tetikler
    const yazGir = (w, el, deger) => { el.value = deger; el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); };

    const BOLUMLER = [
        {
            ad: 'İlk Sayfam', sinif: [5, 12],
            anlatim: 'Web sayfaları <b>HTML</b> ile yazılır. HTML, metni <b>etiketler</b> arasına koyar: <code>&lt;h1&gt;</code> açılış, <code>&lt;/h1&gt;</code> kapanış etiketidir. h1 en büyük başlıktır.',
            html: '<!-- Buraya bir başlık yaz -->\n', css: '',
            gorevler: [
                { ad: 'Bir <code>&lt;h1&gt;</code> başlığı ekle', kontrol: (d) => !!d.querySelector('h1') },
                { ad: 'Başlığın içine bir şeyler yaz', kontrol: (d) => metin(d.querySelector('h1')).length >= 3 }
            ],
            cozum: { html: '<h1>Merhaba Dünya!</h1>\n', css: '' }
        },
        {
            ad: 'Paragraf ve Vurgu', sinif: [5, 12],
            anlatim: '<code>&lt;p&gt;</code> paragraf, <code>&lt;strong&gt;</code> kalın, <code>&lt;em&gt;</code> eğik yazı demektir. Etiketler iç içe yazılabilir: önce içteki kapanır.',
            html: '<h1>Hakkımda</h1>\n', css: '',
            gorevler: [
                { ad: 'En az iki <code>&lt;p&gt;</code> paragrafı yaz', kontrol: (d) => [...d.querySelectorAll('p')].filter(p => metin(p).length > 0).length >= 2 },
                { ad: 'Bir kelimeyi <code>&lt;strong&gt;</code> ile kalın yap', kontrol: (d) => !!d.querySelector('p strong, p b') },
                { ad: 'Bir kelimeyi <code>&lt;em&gt;</code> ile eğik yap', kontrol: (d) => !!d.querySelector('p em, p i') }
            ],
            cozum: { html: '<h1>Hakkımda</h1>\n<p>Benim adım <strong>Deniz</strong>.</p>\n<p>En sevdiğim ders <em>Bilişim</em>.</p>\n', css: '' }
        },
        {
            ad: 'Listeler', sinif: [5, 12],
            anlatim: '<code>&lt;ul&gt;</code> madde işaretli, <code>&lt;ol&gt;</code> numaralı liste yapar. Her madde <code>&lt;li&gt;</code> etiketinin içine yazılır.',
            html: '<h2>En sevdiğim oyunlar</h2>\n', css: '',
            gorevler: [
                { ad: 'Bir <code>&lt;ul&gt;</code> listesi oluştur', kontrol: (d) => !!d.querySelector('ul') },
                { ad: 'Listeye en az 3 <code>&lt;li&gt;</code> maddesi ekle', kontrol: (d) => [...d.querySelectorAll('ul > li')].filter(l => metin(l)).length >= 3 },
                { ad: 'Bir de <code>&lt;ol&gt;</code> numaralı liste ekle (en az 2 madde)', kontrol: (d) => d.querySelectorAll('ol > li').length >= 2 }
            ],
            cozum: { html: '<h2>En sevdiğim oyunlar</h2>\n<ul>\n  <li>Satranç</li>\n  <li>Saklambaç</li>\n  <li>Bulmaca</li>\n</ul>\n<h2>Sabah rutinim</h2>\n<ol>\n  <li>Uyan</li>\n  <li>Kahvaltı yap</li>\n</ol>\n', css: '' }
        },
        {
            ad: 'Bağlantılar ve Resimler', sinif: [5, 12],
            anlatim: 'Bağlantı: <code>&lt;a href="adres"&gt;yazı&lt;/a&gt;</code>. Resim: <code>&lt;img src="dosya" alt="açıklama"&gt;</code>. <b>alt</b> yazısı, görme engelli kullanıcıların ekran okuyucularının resmi anlatmasını sağlar: hiç unutma!',
            html: '<h1>Bağlantılar</h1>\n<!-- Bu resmi kullanabilirsin: ikon/ikon.svg -->\n', css: '',
            gorevler: [
                { ad: '<code>&lt;a&gt;</code> ile bir bağlantı ekle (href "http" ile başlasın)', kontrol: (d) => [...d.querySelectorAll('a[href]')].some(a => /^https?:\/\//.test(a.getAttribute('href')) && metin(a)) },
                { ad: '<code>&lt;img&gt;</code> ile <b>ikon/ikon.svg</b> resmini ekle', kontrol: (d) => [...d.querySelectorAll('img')].some(i => /ikon\/ikon\.svg$/.test(i.getAttribute('src') || '')) },
                { ad: 'Resme anlamlı bir <code>alt</code> açıklaması yaz', kontrol: (d) => [...d.querySelectorAll('img')].some(i => (i.getAttribute('alt') || '').trim().length >= 3) },
                { ad: 'Resmin genişliğini <code>width="100"</code> ile küçült', kontrol: (d) => [...d.querySelectorAll('img')].some(i => i.getAttribute('width') && +i.getAttribute('width') <= 200) }
            ],
            cozum: { html: '<h1>Bağlantılar</h1>\n<p><a href="https://kodlayalim.com/">Kodlayalım\'a git</a></p>\n<img src="ikon/ikon.svg" alt="Kodlayalım logosu" width="100">\n', css: '' }
        },
        {
            ad: 'Renkler (CSS)', sinif: [6, 12],
            anlatim: '<b>CSS</b> sayfanın görünüşünü belirler. Bir kural, <b>seçici</b> ve süslü parantez içindeki <b>özellik: değer;</b> çiftlerinden oluşur:<br><code>h1 { color: blue; }</code>',
            html: '<h1>Renkli Sayfa</h1>\n<p>CSS ile her şeyin rengini değiştirebilirim.</p>\n', css: '/* CSS kurallarını buraya yaz */\n',
            gorevler: [
                { ad: '<code>h1</code> başlığını <b>mavi</b> yap (<code>color</code>)', kontrol: (d, w) => d.querySelector('h1') && mavimsi(renk(w, d.querySelector('h1'))) },
                { ad: 'Sayfanın arka planını beyazdan farklı bir renk yap (<code>body { background-color: … }</code>)', kontrol: (d, w) => beyazDegil(renk(w, d.body, 'backgroundColor')) },
                { ad: 'Paragrafın yazı boyutunu en az 20px yap (<code>font-size</code>)', kontrol: (d, w) => d.querySelector('p') && px(w, d.querySelector('p'), 'fontSize') >= 20 }
            ],
            cozum: { html: '<h1>Renkli Sayfa</h1>\n<p>CSS ile her şeyin rengini değiştirebilirim.</p>\n', css: 'h1 {\n  color: royalblue;\n}\nbody {\n  background-color: lightyellow;\n}\np {\n  font-size: 22px;\n}\n' }
        },
        {
            ad: 'Sınıflar', sinif: [6, 12],
            anlatim: 'Her paragrafı değil, sadece bazılarını boyamak istersen onlara bir <b>sınıf</b> ver: <code>&lt;p class="uyari"&gt;</code>. CSS\'te sınıf, başına nokta konarak seçilir: <code>.uyari { … }</code>',
            html: '<h1>Duyurular</h1>\n<p>Yarın bilişim dersi var.</p>\n<p>Laboratuvara yiyecek getirmeyin!</p>\n<p>Kulüp toplantısı cuma günü.</p>\n', css: '',
            gorevler: [
                { ad: 'İkinci paragrafa <code>class="uyari"</code> ekle', kontrol: (d) => !!d.querySelector('p.uyari') },
                { ad: '<code>.uyari</code> sınıfının yazı rengini <b>kırmızı</b> yap', kontrol: (d, w) => d.querySelector('.uyari') && kirmizimsi(renk(w, d.querySelector('.uyari'))) },
                { ad: 'Diğer paragraflar kırmızı olmasın', kontrol: (d, w) => [...d.querySelectorAll('p:not(.uyari)')].length >= 1 && [...d.querySelectorAll('p:not(.uyari)')].every(p => !kirmizimsi(renk(w, p))) },
                { ad: '<code>.uyari</code> sınıfına bir arka plan rengi ver', kontrol: (d, w) => d.querySelector('.uyari') && beyazDegil(renk(w, d.querySelector('.uyari'), 'backgroundColor')) }
            ],
            cozum: { html: '<h1>Duyurular</h1>\n<p>Yarın bilişim dersi var.</p>\n<p class="uyari">Laboratuvara yiyecek getirmeyin!</p>\n<p>Kulüp toplantısı cuma günü.</p>\n', css: '.uyari {\n  color: crimson;\n  background-color: mistyrose;\n}\n' }
        },
        {
            ad: 'Kutu Modeli', sinif: [7, 12],
            anlatim: 'Her HTML öğesi bir kutudur: içerik, onu çevreleyen <b>padding</b> (iç boşluk), <b>border</b> (kenarlık) ve <b>margin</b> (dış boşluk). <code>border-radius</code> köşeleri yuvarlar.',
            html: '<div class="kart">\n  <h2>Robot Kulübü</h2>\n  <p>Her perşembe 15.00\'te laboratuvarda.</p>\n</div>\n', css: '.kart {\n\n}\n',
            gorevler: [
                { ad: '<code>.kart</code> kutusuna en az 16px <code>padding</code> ver', kontrol: (d, w) => d.querySelector('.kart') && px(w, d.querySelector('.kart'), 'paddingLeft') >= 16 && px(w, d.querySelector('.kart'), 'paddingTop') >= 16 },
                { ad: 'Bir <code>border</code> (kenarlık) ekle', kontrol: (d, w) => d.querySelector('.kart') && px(w, d.querySelector('.kart'), 'borderTopWidth') >= 1 && w.getComputedStyle(d.querySelector('.kart')).borderTopStyle !== 'none' },
                { ad: 'Köşeleri <code>border-radius</code> ile yuvarla', kontrol: (d, w) => d.querySelector('.kart') && px(w, d.querySelector('.kart'), 'borderTopLeftRadius') >= 4 },
                { ad: 'Kutunun genişliğini 300px yap (<code>width</code>)', kontrol: (d) => { const k = d.querySelector('.kart'); return k && Math.abs(k.getBoundingClientRect().width - 300) <= 60; } }
            ],
            cozum: { html: '<div class="kart">\n  <h2>Robot Kulübü</h2>\n  <p>Her perşembe 15.00\'te laboratuvarda.</p>\n</div>\n', css: '.kart {\n  width: 300px;\n  padding: 20px;\n  border: 3px solid teal;\n  border-radius: 16px;\n}\n' }
        },
        {
            ad: 'Yan Yana (Flexbox)', sinif: [8, 12],
            anlatim: 'Öğeleri yan yana dizmek için kapsayıcıya <code>display: flex;</code> verilir. <code>gap</code> aralarındaki boşluğu ayarlar.',
            html: '<div class="kutular">\n  <div class="kutu">1</div>\n  <div class="kutu">2</div>\n  <div class="kutu">3</div>\n</div>\n', css: '.kutu {\n  background-color: gold;\n  padding: 20px;\n  font-size: 24px;\n}\n',
            gorevler: [
                { ad: '<code>.kutular</code> kapsayıcısını <code>display: flex</code> yap', kontrol: (d, w) => d.querySelector('.kutular') && w.getComputedStyle(d.querySelector('.kutular')).display.includes('flex') },
                { ad: 'Üç kutu yan yana dursun', kontrol: (d) => { const k = [...d.querySelectorAll('.kutu')].map(x => x.getBoundingClientRect()); return k.length === 3 && Math.abs(k[0].top - k[2].top) < 2 && k[0].left < k[1].left && k[1].left < k[2].left; } },
                { ad: 'Kutuların arasına en az 10px boşluk koy (<code>gap</code>)', kontrol: (d) => { const k = [...d.querySelectorAll('.kutu')].map(x => x.getBoundingClientRect()); return k.length === 3 && k[1].left - k[0].right >= 10; } }
            ],
            cozum: { html: '<div class="kutular">\n  <div class="kutu">1</div>\n  <div class="kutu">2</div>\n  <div class="kutu">3</div>\n</div>\n', css: '.kutular {\n  display: flex;\n  gap: 16px;\n}\n.kutu {\n  background-color: gold;\n  padding: 20px;\n  font-size: 24px;\n}\n' }
        },
        {
            ad: 'Tablolar', sinif: [6, 12],
            anlatim: '<code>&lt;table&gt;</code> tablo, <code>&lt;tr&gt;</code> satır, <code>&lt;th&gt;</code> başlık hücresi, <code>&lt;td&gt;</code> veri hücresidir.',
            html: '<h2>Ders Programı</h2>\n', css: 'table, th, td {\n  border: 1px solid gray;\n  border-collapse: collapse;\n  padding: 6px;\n}\n',
            gorevler: [
                { ad: 'Bir <code>&lt;table&gt;</code> oluştur', kontrol: (d) => !!d.querySelector('table') },
                { ad: 'İlk satıra <code>&lt;th&gt;</code> başlık hücreleri koy (en az 2)', kontrol: (d) => { const r = d.querySelector('table tr'); return r && r.querySelectorAll('th').length >= 2; } },
                { ad: 'En az 2 veri satırı ekle (<code>&lt;td&gt;</code>)', kontrol: (d) => [...d.querySelectorAll('table tr')].filter(r => r.querySelectorAll('td').length >= 2).length >= 2 }
            ],
            cozum: { html: '<h2>Ders Programı</h2>\n<table>\n  <tr><th>Gün</th><th>Ders</th></tr>\n  <tr><td>Pazartesi</td><td>Bilişim</td></tr>\n  <tr><td>Salı</td><td>Matematik</td></tr>\n</table>\n', css: 'table, th, td {\n  border: 1px solid gray;\n  border-collapse: collapse;\n  padding: 6px;\n}\n' }
        },
        {
            ad: 'Tanıtım Sayfam', sinif: [6, 12],
            anlatim: 'Öğrendiklerinin hepsini kullanarak kendini (ya da bir hobini) tanıtan bir sayfa yap. <b>Kişisel bilgilerini</b> (adres, telefon, okul) yazma!',
            html: '', css: '',
            gorevler: [
                { ad: 'Bir başlık (<code>h1</code>)', kontrol: (d) => metin(d.querySelector('h1')).length >= 3 },
                { ad: 'Açıklaması olan bir resim (<code>img</code> + <code>alt</code>)', kontrol: (d) => [...d.querySelectorAll('img')].some(i => (i.getAttribute('alt') || '').trim().length >= 3) },
                { ad: 'Bir liste (<code>ul</code> ya da <code>ol</code>, en az 3 madde)', kontrol: (d) => d.querySelectorAll('ul > li, ol > li').length >= 3 },
                { ad: 'Bir bağlantı', kontrol: (d) => !!d.querySelector('a[href]') },
                { ad: 'En az 3 CSS kuralı', kontrol: (d) => { const s = d.getElementById('ogrenci-css'); return !!(s && s.sheet && s.sheet.cssRules.length >= 3); } },
                { ad: 'Bir sınıf kullan (<code>class</code>)', kontrol: (d) => !!d.body.querySelector('[class]') }
            ],
            cozum: { html: '<h1>Satranç Kulübümüz</h1>\n<img src="ikon/ikon.svg" alt="Kulüp logosu" width="80">\n<p class="giris">Her hafta yeni bir açılış öğreniyoruz.</p>\n<ul>\n  <li>Sicilya Savunması</li>\n  <li>İtalyan Oyunu</li>\n  <li>Vezir Gambiti</li>\n</ul>\n<a href="https://kodlayalim.com/">Daha fazlası</a>\n', css: 'body { font-family: sans-serif; }\nh1 { color: navy; }\n.giris { font-size: 20px; }\n' }
        },
        // ---------- HTML ve CSS: ileri ----------
        {
            ad: 'Başlık Düzeni', sinif: [5, 12],
            anlatim: 'Başlıklar bir kitabın içindekiler gibidir: sayfada tek bir <code>&lt;h1&gt;</code>, bölümler için <code>&lt;h2&gt;</code>, alt bölümler için <code>&lt;h3&gt;</code>. Ekran okuyucular sayfayı bu düzene göre gezer.',
            html: '<h1>Bilgisayarlar</h1>\n<p>Bilgisayar, veriyi işleyen bir makinedir.</p>\n', css: '',
            gorevler: [
                { ad: 'Sayfada yalnızca bir <code>&lt;h1&gt;</code> olsun', kontrol: (d) => d.querySelectorAll('h1').length === 1 },
                { ad: 'En az iki <code>&lt;h2&gt;</code> bölüm başlığı ekle', kontrol: (d) => [...d.querySelectorAll('h2')].filter(h => metin(h)).length >= 2 },
                { ad: 'Bir <code>&lt;h2&gt;</code>\'nin altına bir <code>&lt;h3&gt;</code> ekle', kontrol: (d) => { const l = [...d.querySelectorAll('h1, h2, h3')]; return l.some((h, i) => h.tagName === 'H3' && l.slice(0, i).some(x => x.tagName === 'H2')); } }
            ],
            cozum: { html: '<h1>Bilgisayarlar</h1>\n<p>Bilgisayar, veriyi işleyen bir makinedir.</p>\n<h2>Donanım</h2>\n<h3>İşlemci</h3>\n<p>Hesapları yapar.</p>\n<h2>Yazılım</h2>\n<p>Programlardan oluşur.</p>\n', css: '' }
        },
        {
            ad: 'Anlamlı Etiketler', sinif: [6, 12],
            anlatim: 'Her şeyi <code>&lt;div&gt;</code> ile yapmak yerine anlamlı etiketler kullan: <code>&lt;header&gt;</code> üst kısım, <code>&lt;nav&gt;</code> menü, <code>&lt;main&gt;</code> ana içerik, <code>&lt;footer&gt;</code> alt kısım. Arama motorları ve ekran okuyucular sayfayı böyle anlar.',
            html: '<div>Okul Gazetesi</div>\n<div>Bu hafta bilişim kulübü robot yarışmasına katıldı.</div>\n', css: '',
            gorevler: [
                { ad: '<code>&lt;header&gt;</code> içinde bir <code>&lt;h1&gt;</code>', kontrol: (d) => !!d.querySelector('header h1') },
                { ad: '<code>&lt;nav&gt;</code> içinde en az 2 bağlantı', kontrol: (d) => d.querySelectorAll('nav a').length >= 2 },
                { ad: '<code>&lt;main&gt;</code> içinde bir paragraf', kontrol: (d) => !!d.querySelector('main p') },
                { ad: 'Yazı içeren bir <code>&lt;footer&gt;</code>', kontrol: (d) => metin(d.querySelector('footer')).length >= 3 }
            ],
            cozum: { html: '<header>\n  <h1>Okul Gazetesi</h1>\n  <nav>\n    <a href="#haberler">Haberler</a>\n    <a href="#kulupler">Kulüpler</a>\n  </nav>\n</header>\n<main>\n  <p>Bu hafta bilişim kulübü robot yarışmasına katıldı.</p>\n</main>\n<footer>Okul Gazetesi 2026</footer>\n', css: '' }
        },
        {
            ad: 'Formlar', sinif: [6, 12],
            anlatim: 'Formlar kullanıcıdan bilgi alır. Her kutunun bir <code>&lt;label&gt;</code> etiketi olmalı; <code>for</code> değeri kutunun <code>id</code>\'siyle aynı olunca etikete tıklamak kutuyu seçer.',
            html: '<h2>Kulübe Katıl</h2>\n<form>\n  \n</form>\n', css: '',
            gorevler: [
                { ad: 'Bir metin kutusu: <code>&lt;input type="text" id="ad"&gt;</code>', kontrol: (d) => !!d.querySelector('form input[type="text"]#ad, form input#ad:not([type])') },
                { ad: 'Kutuya bağlı bir etiket: <code>&lt;label for="ad"&gt;</code>', kontrol: (d) => !!d.querySelector('label[for="ad"]') && metin(d.querySelector('label[for="ad"]')).length >= 2 },
                { ad: 'Bir e-posta kutusu (<code>type="email"</code>)', kontrol: (d) => !!d.querySelector('form input[type="email"]') },
                { ad: 'Yazısı olan bir gönder düğmesi (<code>&lt;button&gt;</code>)', kontrol: (d) => [...d.querySelectorAll('form button')].some(b => metin(b).length >= 2) }
            ],
            cozum: { html: '<h2>Kulübe Katıl</h2>\n<form>\n  <label for="ad">Adın</label>\n  <input type="text" id="ad">\n  <label for="eposta">E-posta</label>\n  <input type="email" id="eposta">\n  <button type="submit">Katıl</button>\n</form>\n', css: '' }
        },
        {
            ad: 'Seçenekler', sinif: [6, 12],
            anlatim: '<code>&lt;select&gt;</code> açılır liste, <code>type="radio"</code> tek seçim, <code>type="checkbox"</code> çoklu seçim yapar. Aynı soruya ait radio düğmelerinin <code>name</code> değeri aynı olmalı ki sadece biri seçilebilsin.',
            html: '<h2>Anket</h2>\n<form>\n  <p>Sınıfın:</p>\n  \n</form>\n', css: '',
            gorevler: [
                { ad: 'En az 3 seçenekli bir <code>&lt;select&gt;</code>', kontrol: (d) => !!d.querySelector('select') && d.querySelectorAll('select option').length >= 3 },
                { ad: 'Aynı <code>name</code> değerine sahip en az 2 radio düğmesi', kontrol: (d) => { const s = {}; d.querySelectorAll('input[type="radio"][name]').forEach(r => { s[r.name] = (s[r.name] || 0) + 1; }); return Object.values(s).some(n => n >= 2); } },
                { ad: 'Etiketi olan bir checkbox', kontrol: (d) => [...d.querySelectorAll('input[type="checkbox"]')].some(c => c.closest('label') || (c.id && d.querySelector(`label[for="${c.id}"]`))) }
            ],
            cozum: { html: '<h2>Anket</h2>\n<form>\n  <p>Sınıfın:</p>\n  <select>\n    <option>5</option>\n    <option>6</option>\n    <option>7</option>\n  </select>\n  <p>En sevdiğin etkinlik:</p>\n  <label><input type="radio" name="etkinlik"> Robot</label>\n  <label><input type="radio" name="etkinlik"> Python</label>\n  <p><label><input type="checkbox"> Haber bültenine katıl</label></p>\n</form>\n', css: '' }
        },
        {
            ad: 'Yazı Biçimi', sinif: [6, 12],
            anlatim: 'Okunabilir bir sayfa için yazı tipi, hizalama ve satır aralığı önemlidir: <code>font-family</code>, <code>text-align</code>, <code>line-height</code>.',
            html: '<h1>Dijital Ayak İzi</h1>\n<p>İnternette yaptığımız her şey bir iz bırakır. Paylaşmadan önce düşünmek, gelecekteki kendimizi korur.</p>\n', css: '',
            gorevler: [
                { ad: 'Sayfanın yazı tipini değiştir (ör. <code>body { font-family: Georgia, serif; }</code>)', kontrol: (d, w) => !/^system-ui/.test(w.getComputedStyle(d.body).fontFamily) },
                { ad: 'Başlığı ortala (<code>text-align: center</code>)', kontrol: (d, w) => d.querySelector('h1') && w.getComputedStyle(d.querySelector('h1')).textAlign === 'center' },
                { ad: 'Paragrafın satır aralığını yazı boyunun en az 1,5 katı yap (<code>line-height: 1.6</code>)', kontrol: (d, w) => { const p = d.querySelector('p'); return p && px(w, p, 'lineHeight') >= 1.5 * px(w, p, 'fontSize'); } }
            ],
            cozum: { html: '<h1>Dijital Ayak İzi</h1>\n<p>İnternette yaptığımız her şey bir iz bırakır. Paylaşmadan önce düşünmek, gelecekteki kendimizi korur.</p>\n', css: 'body { font-family: Georgia, serif; }\nh1 { text-align: center; }\np { line-height: 1.6; }\n' }
        },
        {
            ad: 'Ortala ve Boşluk Bırak', sinif: [7, 12],
            anlatim: 'Bir kutuyu yatayda ortalamak için genişlik ver ve <code>margin: 0 auto</code> yaz. <code>margin</code> kutunun dışındaki, <code>padding</code> içindeki boşluktur.',
            html: '<div class="kutu">Ortadaki kutu</div>\n', css: '.kutu {\n  background: #dbeafe;\n}\n',
            gorevler: [
                { ad: 'Kutunun genişliği 300px olsun', kontrol: (d) => { const k = d.querySelector('.kutu'); return k && Math.abs(k.getBoundingClientRect().width - 300) <= 40; } },
                { ad: 'Kutu sayfanın ortasında dursun', kontrol: (d, w) => { const k = d.querySelector('.kutu'); if (!k) return false; const r = k.getBoundingClientRect(); return r.width < w.innerWidth - 80 && Math.abs(r.left + r.width / 2 - d.body.getBoundingClientRect().left - d.body.getBoundingClientRect().width / 2) < 6; } },
                { ad: 'Kutunun içine en az 20px <code>padding</code> ver', kontrol: (d, w) => d.querySelector('.kutu') && px(w, d.querySelector('.kutu'), 'paddingTop') >= 20 }
            ],
            cozum: { html: '<div class="kutu">Ortadaki kutu</div>\n', css: '.kutu {\n  background: #dbeafe;\n  width: 300px;\n  margin: 0 auto;\n  padding: 20px;\n}\n' }
        },
        {
            ad: 'Gölge ve Daire', sinif: [7, 12],
            anlatim: '<code>border-radius: 50%</code> kare bir kutuyu daireye çevirir. <code>box-shadow: 0 4px 12px rgba(0,0,0,.2)</code> kutuya gölge verir.',
            html: '<div class="kart">\n  <div class="foto"></div>\n  <h3>Ada Yılmaz</h3>\n  <p>Bilişim kulübü başkanı</p>\n</div>\n', css: '.foto {\n  background: #93c5fd;\n}\n',
            gorevler: [
                { ad: '<code>.foto</code> 80px × 80px olsun', kontrol: (d) => { const f = d.querySelector('.foto'); if (!f) return false; const r = f.getBoundingClientRect(); return Math.abs(r.width - 80) <= 4 && Math.abs(r.height - 80) <= 4; } },
                { ad: '<code>.foto</code> daire olsun', kontrol: (d, w) => { const f = d.querySelector('.foto'); return f && px(w, f, 'borderTopLeftRadius') >= f.getBoundingClientRect().width / 2 - 1; } },
                { ad: '<code>.kart</code> kutusuna gölge ver', kontrol: (d, w) => d.querySelector('.kart') && w.getComputedStyle(d.querySelector('.kart')).boxShadow !== 'none' }
            ],
            cozum: { html: '<div class="kart">\n  <div class="foto"></div>\n  <h3>Ada Yılmaz</h3>\n  <p>Bilişim kulübü başkanı</p>\n</div>\n', css: '.foto {\n  background: #93c5fd;\n  width: 80px;\n  height: 80px;\n  border-radius: 50%;\n}\n.kart {\n  padding: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, .2);\n}\n' }
        },
        {
            ad: 'Fareyle Üzerine Gel', sinif: [7, 12],
            anlatim: '<code>:hover</code> fare bir öğenin üzerindeyken geçerli olan stildir: <code>.dugme:hover { background: … }</code>. Fare imlecini el yapmak için <code>cursor: pointer</code>.',
            html: '<button class="dugme">Başla</button>\n', css: '.dugme {\n  background: #1d5fd6;\n  color: white;\n  border: 0;\n  padding: 10px 20px;\n}\n',
            gorevler: [
                { ad: 'Düğmenin üzerinde imleç el şeklinde olsun (<code>cursor</code>)', kontrol: (d, w) => d.querySelector('.dugme') && w.getComputedStyle(d.querySelector('.dugme')).cursor === 'pointer' },
                { ad: '<code>.dugme:hover</code> kuralı ekle ve arka plan rengini değiştir', kontrol: (d) => kurallar(d).some(r => /:hover/.test(r.selectorText || '') && /dugme/.test(r.selectorText) && (r.style.backgroundColor || r.style.background)) },
                { ad: 'Düğmenin köşelerini yuvarla', kontrol: (d, w) => d.querySelector('.dugme') && px(w, d.querySelector('.dugme'), 'borderTopLeftRadius') >= 4 }
            ],
            cozum: { html: '<button class="dugme">Başla</button>\n', css: '.dugme {\n  background: #1d5fd6;\n  color: white;\n  border: 0;\n  padding: 10px 20px;\n  cursor: pointer;\n  border-radius: 8px;\n}\n.dugme:hover {\n  background: #7c3aed;\n}\n' }
        },
        {
            ad: 'Izgara (Grid)', sinif: [8, 12],
            anlatim: 'Galeri gibi düzenler için <code>display: grid</code> kullan. <code>grid-template-columns: repeat(3, 1fr)</code> üç eşit sütun yapar; <code>gap</code> aradaki boşluktur.',
            html: '<div class="galeri">\n  <div class="resim">1</div>\n  <div class="resim">2</div>\n  <div class="resim">3</div>\n  <div class="resim">4</div>\n  <div class="resim">5</div>\n  <div class="resim">6</div>\n</div>\n', css: '.resim {\n  background: #fde68a;\n  padding: 30px;\n  text-align: center;\n}\n',
            gorevler: [
                { ad: '<code>.galeri</code> bir grid olsun', kontrol: (d, w) => d.querySelector('.galeri') && w.getComputedStyle(d.querySelector('.galeri')).display === 'grid' },
                { ad: 'Her satırda 3 resim olsun', kontrol: (d) => { const r = [...d.querySelectorAll('.resim')].map(x => x.getBoundingClientRect()); return r.length === 6 && Math.abs(r[0].top - r[2].top) < 2 && r[3].top > r[0].bottom - 1 && Math.abs(r[3].left - r[0].left) < 2; } },
                { ad: 'Resimlerin arasında en az 8px boşluk olsun', kontrol: (d) => { const r = [...d.querySelectorAll('.resim')].map(x => x.getBoundingClientRect()); return r.length === 6 && r[1].left - r[0].right >= 8 && r[3].top - r[0].bottom >= 8; } }
            ],
            cozum: { html: '<div class="galeri">\n  <div class="resim">1</div>\n  <div class="resim">2</div>\n  <div class="resim">3</div>\n  <div class="resim">4</div>\n  <div class="resim">5</div>\n  <div class="resim">6</div>\n</div>\n', css: '.resim {\n  background: #fde68a;\n  padding: 30px;\n  text-align: center;\n}\n.galeri {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n' }
        },
        {
            ad: 'Konumlandırma', sinif: [8, 12],
            anlatim: 'Bir öğeyi başka bir öğenin köşesine yerleştirmek için: kapsayıcıya <code>position: relative</code>, öğeye <code>position: absolute; top: 0; right: 0</code>.',
            html: '<div class="kart">\n  <span class="rozet">YENİ</span>\n  <h3>Python Laboratuvarı</h3>\n  <p>103 görev seni bekliyor.</p>\n</div>\n', css: '.kart {\n  border: 2px solid #ccc;\n  padding: 20px;\n  width: 260px;\n}\n.rozet {\n  background: #ef4444;\n  color: white;\n  padding: 2px 8px;\n}\n',
            gorevler: [
                { ad: '<code>.kart</code> kutusuna <code>position: relative</code> ver', kontrol: (d, w) => d.querySelector('.kart') && w.getComputedStyle(d.querySelector('.kart')).position === 'relative' },
                { ad: '<code>.rozet</code> mutlak konumlu olsun (<code>absolute</code>)', kontrol: (d, w) => d.querySelector('.rozet') && w.getComputedStyle(d.querySelector('.rozet')).position === 'absolute' },
                { ad: 'Rozet kartın sağ üst köşesinde dursun', kontrol: (d) => { const k = d.querySelector('.kart'), r = d.querySelector('.rozet'); if (!k || !r) return false; const a = k.getBoundingClientRect(), b = r.getBoundingClientRect(); return Math.abs(a.right - b.right) <= 20 && Math.abs(a.top - b.top) <= 20; } }
            ],
            cozum: { html: '<div class="kart">\n  <span class="rozet">YENİ</span>\n  <h3>Python Laboratuvarı</h3>\n  <p>103 görev seni bekliyor.</p>\n</div>\n', css: '.kart {\n  border: 2px solid #ccc;\n  padding: 20px;\n  width: 260px;\n  position: relative;\n}\n.rozet {\n  background: #ef4444;\n  color: white;\n  padding: 2px 8px;\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n' }
        },
        {
            ad: 'Telefona Uyum (@media)', sinif: [8, 12],
            anlatim: 'Sayfalar telefonda da düzgün görünmeli. <code>@media (max-width: 500px) { … }</code> içindeki kurallar yalnızca dar ekranlarda çalışır. Geniş ekranda kutular yan yana, telefonda alt alta olsun.',
            html: '<div class="kutular">\n  <div class="kutu">Robot</div>\n  <div class="kutu">Python</div>\n  <div class="kutu">Web</div>\n</div>\n', css: '.kutu {\n  background: #bbf7d0;\n  padding: 16px;\n  flex: 1;\n}\n',
            gorevler: [
                { ad: '<code>.kutular</code> flex olsun, kutular yan yana dursun', kontrol: (d, w) => { const k = d.querySelector('.kutular'); return k && w.getComputedStyle(k).display.includes('flex') && (w.innerWidth <= 500 || w.getComputedStyle(k).flexDirection === 'row'); } },
                { ad: '<code>max-width</code> kullanan bir <code>@media</code> kuralı ekle', kontrol: (d) => [...(d.getElementById('ogrenci-css')?.sheet?.cssRules || [])].some(r => r.type === 4 && /max-width/.test(r.conditionText || r.media.mediaText) && r.cssRules.length > 0) },
                { ad: 'Dar ekranda kutular alt alta olsun (<code>flex-direction: column</code>)', kontrol: (d) => [...(d.getElementById('ogrenci-css')?.sheet?.cssRules || [])].some(r => r.type === 4 && [...r.cssRules].some(x => /kutular/.test(x.selectorText) && x.style.flexDirection === 'column')) }
            ],
            cozum: { html: '<div class="kutular">\n  <div class="kutu">Robot</div>\n  <div class="kutu">Python</div>\n  <div class="kutu">Web</div>\n</div>\n', css: '.kutu {\n  background: #bbf7d0;\n  padding: 16px;\n  flex: 1;\n}\n.kutular {\n  display: flex;\n  gap: 10px;\n}\n@media (max-width: 500px) {\n  .kutular {\n    flex-direction: column;\n  }\n}\n' }
        },
        {
            ad: 'CSS Değişkenleri', sinif: [8, 12],
            anlatim: 'Aynı rengi birçok yerde kullanıyorsan onu bir değişkene koy: <code>:root { --ana: #7c3aed; }</code>, sonra <code>color: var(--ana);</code>. Rengi tek yerden değiştirince bütün sayfa değişir.',
            html: '<h1>Okul Sitesi</h1>\n<button>Kayıt Ol</button>\n<p class="not">Kayıtlar cuma günü kapanıyor.</p>\n', css: 'h1 { color: #7c3aed; }\nbutton { background: #7c3aed; color: white; }\n.not { border-left: 4px solid #7c3aed; }\n',
            gorevler: [
                { ad: '<code>:root</code> içinde <code>--ana</code> değişkenini tanımla', kontrol: (d, w) => w.getComputedStyle(d.documentElement).getPropertyValue('--ana').trim().length > 0 },
                { ad: 'Renkleri en az 3 yerde <code>var(--ana)</code> ile kullan', kontrol: (d) => ((d.getElementById('ogrenci-css')?.textContent || '').match(/var\(\s*--ana\s*\)/g) || []).length >= 3 },
                { ad: 'Başlığın rengi değişkenle aynı olsun', kontrol: (d, w) => { const v = w.getComputedStyle(d.documentElement).getPropertyValue('--ana').trim(); if (!v || !d.querySelector('h1')) return false; const t = d.createElement('i'); t.style.color = v; d.body.appendChild(t); const c = w.getComputedStyle(t).color; t.remove(); return c === w.getComputedStyle(d.querySelector('h1')).color; } }
            ],
            cozum: { html: '<h1>Okul Sitesi</h1>\n<button>Kayıt Ol</button>\n<p class="not">Kayıtlar cuma günü kapanıyor.</p>\n', css: ':root { --ana: #0d9488; }\nh1 { color: var(--ana); }\nbutton { background: var(--ana); color: white; }\n.not { border-left: 4px solid var(--ana); }\n' }
        },
        {
            ad: 'Yumuşak Geçiş', sinif: [8, 12],
            anlatim: '<code>transition: transform 0.3s</code> bir özelliğin değişimini yumuşatır. <code>transform: scale(1.1)</code> öğeyi büyütür, <code>translateY(-4px)</code> yukarı kaldırır.',
            html: '<div class="kart">Fareyi üzerime getir</div>\n', css: '.kart {\n  background: #fef3c7;\n  padding: 24px;\n  width: 200px;\n}\n',
            gorevler: [
                { ad: '<code>.kart</code> kutusuna bir <code>transition</code> ver', kontrol: (d, w) => d.querySelector('.kart') && parseFloat(w.getComputedStyle(d.querySelector('.kart')).transitionDuration) > 0 },
                { ad: '<code>.kart:hover</code> kuralında bir <code>transform</code> kullan', kontrol: (d) => kurallar(d).some(r => /kart:hover/.test(r.selectorText || '') && r.style.transform) },
                { ad: 'Geçiş süresi 1 saniyeden kısa olsun', kontrol: (d, w) => { const k = d.querySelector('.kart'); if (!k) return false; const s = parseFloat(w.getComputedStyle(k).transitionDuration); return s > 0 && s < 1; } }
            ],
            cozum: { html: '<div class="kart">Fareyi üzerime getir</div>\n', css: '.kart {\n  background: #fef3c7;\n  padding: 24px;\n  width: 200px;\n  transition: transform 0.3s;\n}\n.kart:hover {\n  transform: scale(1.1);\n}\n' }
        },
        {
            ad: 'Menü Çubuğu', sinif: [7, 12],
            anlatim: 'Menüler aslında bir bağlantı listesidir. Madde işaretlerini <code>list-style: none</code> ile kaldır, maddeleri <code>display: flex</code> ile yan yana diz, bağlantıların altını <code>text-decoration: none</code> ile çizgisiz yap.',
            html: '<nav>\n  <ul>\n    <li><a href="#">Ana Sayfa</a></li>\n    <li><a href="#">Etkinlikler</a></li>\n    <li><a href="#">İletişim</a></li>\n  </ul>\n</nav>\n', css: 'nav {\n  background: #1e293b;\n}\n',
            gorevler: [
                { ad: 'Madde işaretlerini kaldır', kontrol: (d, w) => d.querySelector('nav ul') && w.getComputedStyle(d.querySelector('nav li')).listStyleType === 'none' },
                { ad: 'Menü maddeleri yan yana dursun', kontrol: (d) => { const l = [...d.querySelectorAll('nav li')].map(x => x.getBoundingClientRect()); return l.length >= 3 && Math.abs(l[0].top - l[2].top) < 2 && l[0].left < l[1].left; } },
                { ad: 'Bağlantıların alt çizgisini kaldır ve yazılarını açık renk yap', kontrol: (d, w) => { const a = d.querySelector('nav a'); if (!a) return false; const s = w.getComputedStyle(a); const [r, g, b] = renk(w, a); return s.textDecorationLine === 'none' && r + g + b > 450; } }
            ],
            cozum: { html: '<nav>\n  <ul>\n    <li><a href="#">Ana Sayfa</a></li>\n    <li><a href="#">Etkinlikler</a></li>\n    <li><a href="#">İletişim</a></li>\n  </ul>\n</nav>\n', css: 'nav {\n  background: #1e293b;\n}\nnav ul {\n  list-style: none;\n  display: flex;\n  gap: 20px;\n  margin: 0;\n  padding: 12px;\n}\nnav a {\n  color: white;\n  text-decoration: none;\n}\n' }
        },
        {
            ad: 'Herkes İçin Web', sinif: [6, 12],
            anlatim: 'Erişilebilir sayfa, engelli kullanıcıların da kullanabildiği sayfadır. Bu sayfadaki üç hatayı düzelt: resmin açıklaması yok, kutunun etiketi yok, düğmenin yazısı yok.',
            html: '<h1>Bülten</h1>\n<img src="ikon/ikon.svg" width="60">\n<input type="email" id="eposta">\n<button></button>\n', css: '',
            gorevler: [
                { ad: 'Bütün resimlerin <code>alt</code> açıklaması olsun', kontrol: (d) => d.querySelectorAll('img').length > 0 && [...d.querySelectorAll('img')].every(i => (i.getAttribute('alt') || '').trim().length >= 3) },
                { ad: 'E-posta kutusunun bir <code>&lt;label&gt;</code> etiketi olsun', kontrol: (d) => [...d.querySelectorAll('input')].every(i => i.closest('label') || (i.id && d.querySelector(`label[for="${i.id}"]`))) && d.querySelectorAll('input').length > 0 },
                { ad: 'Düğmenin içinde ne yaptığını anlatan bir yazı olsun', kontrol: (d) => d.querySelectorAll('button').length > 0 && [...d.querySelectorAll('button')].every(b => metin(b).length >= 2) }
            ],
            cozum: { html: '<h1>Bülten</h1>\n<img src="ikon/ikon.svg" width="60" alt="Kodlayalım robotu">\n<label for="eposta">E-posta adresin</label>\n<input type="email" id="eposta">\n<button>Abone ol</button>\n', css: '' }
        },
        // ---------- JavaScript ----------
        {
            ad: 'İlk JavaScript', sinif: [7, 12], js: '',
            anlatim: 'Artık sayfaya hareket katıyoruz! <b>JavaScript</b> sekmesine yaz. <code>document.getElementById("baslik")</code> öğeyi bulur, <code>.textContent = "..."</code> yazısını değiştirir, <code>.style.color = "red"</code> rengini değiştirir.',
            html: '<h1 id="baslik">Merhaba</h1>\n', css: '',
            gorevler: [
                { ad: 'JavaScript ile başlığın yazısını değiştir', kontrol: (d) => metin(d.getElementById('baslik')) !== 'Merhaba' && metin(d.getElementById('baslik')).length >= 2 },
                { ad: 'JavaScript ile başlığın rengini değiştir (<code>style.color</code>)', kontrol: (d) => !!(d.getElementById('baslik') && d.getElementById('baslik').style.color) },
                { ad: 'Kodunda hata olmasın', kontrol: (d, w) => (w.__hatalar || []).length === 0 && !!w.__jsCalisti }
            ],
            cozum: { html: '<h1 id="baslik">Merhaba</h1>\n', css: '', js: 'const baslik = document.getElementById("baslik");\nbaslik.textContent = "JavaScript çalışıyor!";\nbaslik.style.color = "purple";\n' }
        },
        {
            ad: 'Tıklayınca', sinif: [7, 12], js: 'const dugme = document.getElementById("dugme");\nconst mesaj = document.getElementById("mesaj");\n\ndugme.addEventListener("click", function () {\n  // tıklanınca ne olsun?\n});\n',
            anlatim: '<code>addEventListener("click", function () { … })</code> düğmeye tıklanınca çalışacak kodu belirler. Buna <b>olay</b> denir.',
            html: '<button id="dugme">Tıkla</button>\n<p id="mesaj">Henüz tıklanmadı.</p>\n', css: '',
            gorevler: [
                { ad: 'Tıklanınca mesajın yazısı değişsin', kontrol: (d) => { const b = d.getElementById('dugme'), m = d.getElementById('mesaj'); if (!b || !m) return false; m.textContent = 'Henüz tıklanmadı.'; b.click(); return metin(m) !== 'Henüz tıklanmadı.' && metin(m).length > 0; } },
                { ad: 'Tıklanınca düğmenin yazısı <b>Tıklandı</b> olsun', kontrol: (d) => { const b = d.getElementById('dugme'); if (!b) return false; b.click(); return metin(b) === 'Tıklandı'; } }
            ],
            cozum: { html: '<button id="dugme">Tıkla</button>\n<p id="mesaj">Henüz tıklanmadı.</p>\n', css: '', js: 'const dugme = document.getElementById("dugme");\nconst mesaj = document.getElementById("mesaj");\n\ndugme.addEventListener("click", function () {\n  mesaj.textContent = "Düğmeye tıkladın!";\n  dugme.textContent = "Tıklandı";\n});\n' }
        },
        {
            ad: 'Sayaç', sinif: [7, 12], js: 'let sayi = 0;\nconst ekran = document.getElementById("sayi");\n\ndocument.getElementById("arttir").addEventListener("click", function () {\n  // sayıyı 1 artır ve ekrana yaz\n});\n',
            anlatim: 'Bir <b>değişken</b> (<code>let sayi = 0</code>) değer tutar. Her tıklamada <code>sayi = sayi + 1</code> yap ve <code>ekran.textContent = sayi</code> ile göster.',
            html: '<p id="sayi">0</p>\n<button id="arttir">+1</button>\n<button id="sifirla">Sıfırla</button>\n', css: '#sayi { font-size: 48px; margin: 0; }\n',
            gorevler: [
                { ad: '<b>+1</b> düğmesi sayıyı bir artırsın', kontrol: (d) => { const s = d.getElementById('sayi'), a = d.getElementById('arttir'); if (!s || !a) return false; const once = parseInt(metin(s), 10); a.click(); a.click(); a.click(); return parseInt(metin(s), 10) === once + 3; } },
                { ad: '<b>Sıfırla</b> düğmesi sayıyı 0 yapsın', kontrol: (d) => { const s = d.getElementById('sayi'), a = d.getElementById('arttir'), z = d.getElementById('sifirla'); if (!s || !a || !z) return false; a.click(); z.click(); if (metin(s) !== '0') return false; a.click(); return metin(s) === '1'; } }
            ],
            cozum: { html: '<p id="sayi">0</p>\n<button id="arttir">+1</button>\n<button id="sifirla">Sıfırla</button>\n', css: '#sayi { font-size: 48px; margin: 0; }\n', js: 'let sayi = 0;\nconst ekran = document.getElementById("sayi");\n\ndocument.getElementById("arttir").addEventListener("click", function () {\n  sayi = sayi + 1;\n  ekran.textContent = sayi;\n});\n\ndocument.getElementById("sifirla").addEventListener("click", function () {\n  sayi = 0;\n  ekran.textContent = sayi;\n});\n' }
        },
        {
            ad: 'Karanlık Mod', sinif: [7, 12], js: '',
            anlatim: '<code>document.body.classList.toggle("karanlik")</code> sınıf yoksa ekler, varsa kaldırır. Düğmeye tıklayınca karanlık mod açılıp kapansın; renkleri CSS\'teki <code>.karanlik</code> kuralı versin.',
            html: '<h1>Gece Okuması</h1>\n<p>Gözlerini yormamak için karanlık modu dene.</p>\n<button id="mod">Karanlık mod</button>\n', css: 'body { padding: 8px; }\n',
            gorevler: [
                { ad: 'CSS\'te <code>.karanlik</code> sınıfı arka planı koyu yapsın', kontrol: (d, w) => { d.body.classList.add('karanlik'); const [r, g, b] = renk(w, d.body, 'backgroundColor'); d.body.classList.remove('karanlik'); return r + g + b < 200; } },
                { ad: 'Düğmeye tıklayınca karanlık mod açılsın', kontrol: (d) => { const m = d.getElementById('mod'); if (!m) return false; d.body.classList.remove('karanlik'); m.click(); return d.body.classList.contains('karanlik'); } },
                { ad: 'Tekrar tıklayınca kapansın', kontrol: (d) => { const m = d.getElementById('mod'); if (!m) return false; d.body.classList.add('karanlik'); m.click(); return !d.body.classList.contains('karanlik'); } }
            ],
            cozum: { html: '<h1>Gece Okuması</h1>\n<p>Gözlerini yormamak için karanlık modu dene.</p>\n<button id="mod">Karanlık mod</button>\n', css: 'body { padding: 8px; }\n.karanlik {\n  background: #0f172a;\n  color: #e2e8f0;\n}\n', js: 'document.getElementById("mod").addEventListener("click", function () {\n  document.body.classList.toggle("karanlik");\n});\n' }
        },
        {
            ad: 'Merhaba, Sen!', sinif: [7, 12], js: 'const kutu = document.getElementById("ad");\nconst cikti = document.getElementById("cikti");\n',
            anlatim: 'Bir metin kutusundaki yazı <code>kutu.value</code> ile okunur. Düğmeye tıklanınca <b>Merhaba, Ada!</b> biçiminde selamla. Metinleri birleştirmek için: <code>"Merhaba, " + ad + "!"</code>',
            html: '<input id="ad" placeholder="Adın">\n<button id="selamla">Selamla</button>\n<p id="cikti"></p>\n', css: '',
            gorevler: [
                { ad: 'Ada yazıp tıklayınca <b>Merhaba, Ada!</b> yazsın', kontrol: (d, w) => { const k = d.getElementById('ad'), b = d.getElementById('selamla'), c = d.getElementById('cikti'); if (!k || !b || !c) return false; yazGir(w, k, 'Ada'); b.click(); return metin(c) === 'Merhaba, Ada!'; } },
                { ad: 'Başka bir adla da çalışsın', kontrol: (d, w) => { const k = d.getElementById('ad'), b = d.getElementById('selamla'), c = d.getElementById('cikti'); if (!k || !b || !c) return false; yazGir(w, k, 'Can'); b.click(); return metin(c) === 'Merhaba, Can!'; } }
            ],
            cozum: { html: '<input id="ad" placeholder="Adın">\n<button id="selamla">Selamla</button>\n<p id="cikti"></p>\n', css: '', js: 'const kutu = document.getElementById("ad");\nconst cikti = document.getElementById("cikti");\n\ndocument.getElementById("selamla").addEventListener("click", function () {\n  cikti.textContent = "Merhaba, " + kutu.value + "!";\n});\n' }
        },
        {
            ad: 'Şifre Göstergesi', sinif: [8, 12], js: 'const sifre = document.getElementById("sifre");\nconst durum = document.getElementById("durum");\n\nsifre.addEventListener("input", function () {\n  // sifre.value.length ile uzunluğa bak\n});\n',
            anlatim: '<code>"input"</code> olayı kutuya her harf yazıldığında çalışır. Şifre 8 karakterden kısaysa <b>Zayıf</b>, değilse <b>Güçlü</b> yazdır: <code>if (sifre.value.length &gt;= 8) { … } else { … }</code>',
            html: '<label for="sifre">Şifre</label>\n<input id="sifre" type="password">\n<p id="durum"></p>\n', css: '',
            gorevler: [
                { ad: 'Kısa şifrede <b>Zayıf</b> yazsın', kontrol: (d, w) => { const s = d.getElementById('sifre'), p = d.getElementById('durum'); if (!s || !p) return false; yazGir(w, s, 'kedi'); return metin(p) === 'Zayıf'; } },
                { ad: '8 ve daha uzun şifrede <b>Güçlü</b> yazsın', kontrol: (d, w) => { const s = d.getElementById('sifre'), p = d.getElementById('durum'); if (!s || !p) return false; yazGir(w, s, '12345678'); const a = metin(p); yazGir(w, s, 'Mavi-Deniz-42'); return a === 'Güçlü' && metin(p) === 'Güçlü'; } },
                { ad: 'Durum yazısı Zayıf iken kırmızı, Güçlü iken yeşil olsun', kontrol: (d, w) => { const s = d.getElementById('sifre'), p = d.getElementById('durum'); if (!s || !p) return false; yazGir(w, s, 'abc'); const k = renk(w, p); yazGir(w, s, 'abcdefgh1'); const y = renk(w, p); return k[0] > k[1] + 50 && y[1] > y[0] + 30; } }
            ],
            cozum: { html: '<label for="sifre">Şifre</label>\n<input id="sifre" type="password">\n<p id="durum"></p>\n', css: '', js: 'const sifre = document.getElementById("sifre");\nconst durum = document.getElementById("durum");\n\nsifre.addEventListener("input", function () {\n  if (sifre.value.length >= 8) {\n    durum.textContent = "Güçlü";\n    durum.style.color = "green";\n  } else {\n    durum.textContent = "Zayıf";\n    durum.style.color = "red";\n  }\n});\n' }
        },
        {
            ad: 'Döngüyle Liste', sinif: [8, 12], js: 'const liste = document.getElementById("liste");\n\nfor (let i = 1; i <= 3; i++) {\n  // her sayı için bir <li> oluştur\n}\n',
            anlatim: 'Döngüyle sayfaya öğe ekleyebilirsin: <code>const li = document.createElement("li");</code> yeni öğe oluşturur, <code>li.textContent = i;</code> yazısını verir, <code>liste.appendChild(li);</code> listeye ekler. 1\'den 10\'a kadar sayıları ekle.',
            html: '<h2>Sayılar</h2>\n<ul id="liste"></ul>\n', css: '',
            gorevler: [
                { ad: 'Listede 10 madde olsun', kontrol: (d) => d.querySelectorAll('#liste > li').length === 10 },
                { ad: 'Maddeler 1\'den 10\'a kadar sayılar olsun', kontrol: (d) => [...d.querySelectorAll('#liste > li')].map(metin).join(',') === '1,2,3,4,5,6,7,8,9,10' },
                { ad: 'Çift sayıların yazısı mavi olsun', kontrol: (d, w) => { const l = [...d.querySelectorAll('#liste > li')]; return l.length === 10 && l.every((li, i) => (i % 2 === 1) === mavimsi(renk(w, li))); } }
            ],
            cozum: { html: '<h2>Sayılar</h2>\n<ul id="liste"></ul>\n', css: '', js: 'const liste = document.getElementById("liste");\n\nfor (let i = 1; i <= 10; i++) {\n  const li = document.createElement("li");\n  li.textContent = i;\n  if (i % 2 === 0) {\n    li.style.color = "blue";\n  }\n  liste.appendChild(li);\n}\n' }
        },
        {
            ad: 'Diziden Kartlar', sinif: [8, 12], js: 'const etkinlikler = ["Robot Kodla", "Python", "Web Atölyesi", "Bulmacalar"];\nconst alan = document.getElementById("kartlar");\n\n// her etkinlik için class="kart" olan bir div ekle\n',
            anlatim: 'Bir <b>dizi</b> (array) birden çok değeri tutar. <code>for (const ad of etkinlikler) { … }</code> her eleman için döner. Her etkinlik için <code>class="kart"</code> olan bir <code>div</code> oluştur: <code>kart.className = "kart";</code>',
            html: '<div id="kartlar"></div>\n', css: '#kartlar { display: flex; gap: 8px; flex-wrap: wrap; }\n.kart { background: #e0e7ff; padding: 16px; border-radius: 10px; }\n',
            gorevler: [
                { ad: 'Dizideki her eleman için bir <code>.kart</code> oluştur', kontrol: (d) => d.querySelectorAll('#kartlar .kart').length === 4 },
                { ad: 'Kartların yazıları dizideki adlar olsun', kontrol: (d) => [...d.querySelectorAll('#kartlar .kart')].map(metin).join('|') === 'Robot Kodla|Python|Web Atölyesi|Bulmacalar' },
                { ad: 'Kodda hata olmasın', kontrol: (d, w) => (w.__hatalar || []).length === 0 && !!w.__jsCalisti }
            ],
            cozum: { html: '<div id="kartlar"></div>\n', css: '#kartlar { display: flex; gap: 8px; flex-wrap: wrap; }\n.kart { background: #e0e7ff; padding: 16px; border-radius: 10px; }\n', js: 'const etkinlikler = ["Robot Kodla", "Python", "Web Atölyesi", "Bulmacalar"];\nconst alan = document.getElementById("kartlar");\n\nfor (const ad of etkinlikler) {\n  const kart = document.createElement("div");\n  kart.className = "kart";\n  kart.textContent = ad;\n  alan.appendChild(kart);\n}\n' }
        },
        {
            ad: 'Yapılacaklar Listesi', sinif: [8, 12], js: 'const kutu = document.getElementById("gorev");\nconst liste = document.getElementById("liste");\n',
            anlatim: 'Gerçek bir uygulama! <b>Ekle</b>\'ye basınca kutudaki görev listeye eklensin, kutu boşalsın. Kutu boşsa hiçbir şey eklenmesin: <code>if (kutu.value.trim() === "") return;</code>',
            html: '<input id="gorev" placeholder="Yeni görev">\n<button id="ekle">Ekle</button>\n<ul id="liste"></ul>\n', css: '',
            gorevler: [
                { ad: 'Yazılan görev listeye eklensin', kontrol: (d, w) => { const k = d.getElementById('gorev'), b = d.getElementById('ekle'), l = d.getElementById('liste'); if (!k || !b || !l) return false; const n = l.children.length; yazGir(w, k, 'Ödev yap'); b.click(); return l.children.length === n + 1 && metin(l.lastElementChild) === 'Ödev yap'; } },
                { ad: 'Ekledikten sonra kutu boşalsın', kontrol: (d, w) => { const k = d.getElementById('gorev'), b = d.getElementById('ekle'); if (!k || !b) return false; yazGir(w, k, 'Kitap oku'); b.click(); return k.value === ''; } },
                { ad: 'Boş görev eklenmesin', kontrol: (d, w) => { const k = d.getElementById('gorev'), b = d.getElementById('ekle'), l = d.getElementById('liste'); if (!k || !b || !l) return false; const n = l.children.length; yazGir(w, k, '   '); b.click(); return l.children.length === n; } }
            ],
            cozum: { html: '<input id="gorev" placeholder="Yeni görev">\n<button id="ekle">Ekle</button>\n<ul id="liste"></ul>\n', css: '', js: 'const kutu = document.getElementById("gorev");\nconst liste = document.getElementById("liste");\n\ndocument.getElementById("ekle").addEventListener("click", function () {\n  if (kutu.value.trim() === "") return;\n  const li = document.createElement("li");\n  li.textContent = kutu.value;\n  liste.appendChild(li);\n  kutu.value = "";\n});\n' }
        },
        {
            ad: 'Gizle ve Göster', sinif: [8, 12], js: '',
            anlatim: 'Sıkça sorulan sorular sayfalarında cevaplar tıklayınca açılır. <code>panel.hidden = !panel.hidden;</code> paneli gizler ya da gösterir. Düğmenin yazısı da <b>Göster</b> / <b>Gizle</b> olarak değişsin.',
            html: '<button id="ac">Göster</button>\n<div id="panel" hidden>\n  <p>Kodlayalım internet olmadan da çalışır!</p>\n</div>\n', css: '#panel { background: #f1f5f9; padding: 12px; }\n',
            gorevler: [
                { ad: 'Tıklayınca panel görünsün', kontrol: (d, w) => { const b = d.getElementById('ac'), p = d.getElementById('panel'); if (!b || !p) return false; p.hidden = true; p.style.display = ''; b.click(); return w.getComputedStyle(p).display !== 'none'; } },
                { ad: 'Tekrar tıklayınca gizlensin', kontrol: (d, w) => { const b = d.getElementById('ac'), p = d.getElementById('panel'); if (!b || !p) return false; b.click(); const a = w.getComputedStyle(p).display !== 'none'; b.click(); const c = w.getComputedStyle(p).display !== 'none'; return a !== c; } },
                { ad: 'Panel açıkken düğmede <b>Gizle</b>, kapalıyken <b>Göster</b> yazsın', kontrol: (d, w) => { const b = d.getElementById('ac'), p = d.getElementById('panel'); if (!b || !p) return false; let ok = true; for (let i = 0; i < 2; i++) { b.click(); const acik = w.getComputedStyle(p).display !== 'none'; ok = ok && metin(b) === (acik ? 'Gizle' : 'Göster'); } return ok; } }
            ],
            cozum: { html: '<button id="ac">Göster</button>\n<div id="panel" hidden>\n  <p>Kodlayalım internet olmadan da çalışır!</p>\n</div>\n', css: '#panel { background: #f1f5f9; padding: 12px; }\n', js: 'const dugme = document.getElementById("ac");\nconst panel = document.getElementById("panel");\n\ndugme.addEventListener("click", function () {\n  panel.hidden = !panel.hidden;\n  dugme.textContent = panel.hidden ? "Göster" : "Gizle";\n});\n' }
        },
        {
            ad: 'Hesap Makinesi', sinif: [8, 12], js: 'const a = document.getElementById("a");\nconst b = document.getElementById("b");\nconst sonuc = document.getElementById("sonuc");\n\ndocument.getElementById("topla").addEventListener("click", function () {\n  sonuc.textContent = a.value + b.value;\n});\n',
            anlatim: 'Dikkat, bir tuzak var! Kutudaki değerler <b>metindir</b>: <code>"2" + "3"</code> → <code>"23"</code>. Önce <code>Number(a.value)</code> ile sayıya çevir. Toplama ve çarpma düğmelerini çalıştır.',
            html: '<input id="a" type="number" value="2">\n<input id="b" type="number" value="3">\n<button id="topla">+</button>\n<button id="carp">×</button>\n<p>Sonuç: <b id="sonuc"></b></p>\n', css: '',
            gorevler: [
                { ad: '<b>+</b> iki sayıyı gerçekten toplasın (2 + 3 = 5)', kontrol: (d, w) => { const a = d.getElementById('a'), b = d.getElementById('b'), t = d.getElementById('topla'), s = d.getElementById('sonuc'); if (!a || !b || !t || !s) return false; yazGir(w, a, '2'); yazGir(w, b, '3'); t.click(); const x = metin(s); yazGir(w, a, '10'); yazGir(w, b, '-4'); t.click(); return x === '5' && metin(s) === '6'; } },
                { ad: '<b>×</b> iki sayıyı çarpsın', kontrol: (d, w) => { const a = d.getElementById('a'), b = d.getElementById('b'), c = d.getElementById('carp'), s = d.getElementById('sonuc'); if (!a || !b || !c || !s) return false; yazGir(w, a, '6'); yazGir(w, b, '7'); c.click(); return metin(s) === '42'; } }
            ],
            cozum: { html: '<input id="a" type="number" value="2">\n<input id="b" type="number" value="3">\n<button id="topla">+</button>\n<button id="carp">×</button>\n<p>Sonuç: <b id="sonuc"></b></p>\n', css: '', js: 'const a = document.getElementById("a");\nconst b = document.getElementById("b");\nconst sonuc = document.getElementById("sonuc");\n\ndocument.getElementById("topla").addEventListener("click", function () {\n  sonuc.textContent = Number(a.value) + Number(b.value);\n});\n\ndocument.getElementById("carp").addEventListener("click", function () {\n  sonuc.textContent = Number(a.value) * Number(b.value);\n});\n' }
        },
        {
            ad: 'Zar At', sinif: [8, 12], js: 'const zar = document.getElementById("zar");\n\ndocument.getElementById("at").addEventListener("click", function () {\n  zar.textContent = 1;\n});\n',
            anlatim: '<code>Math.random()</code> 0 ile 1 arasında rastgele bir sayı verir. 1–6 arası bir zar için: <code>Math.floor(Math.random() * 6) + 1</code>. Atılan zarların toplamını da göster.',
            html: '<p id="zar" style="font-size:60px;margin:0">?</p>\n<button id="at">Zar at</button>\n<p>Toplam: <span id="toplam">0</span></p>\n', css: '',
            gorevler: [
                { ad: 'Zar her zaman 1 ile 6 arasında olsun', kontrol: (d) => { const z = d.getElementById('zar'), b = d.getElementById('at'); if (!z || !b) return false; for (let i = 0; i < 40; i++) { b.click(); const v = +metin(z); if (!(v >= 1 && v <= 6 && Number.isInteger(v))) return false; } return true; } },
                { ad: 'Zar rastgele gelsin (her seferinde aynı sayı değil)', kontrol: (d) => { const z = d.getElementById('zar'), b = d.getElementById('at'); if (!z || !b) return false; const g = new Set(); for (let i = 0; i < 60; i++) { b.click(); g.add(metin(z)); } return g.size >= 4; } },
                { ad: 'Toplam, atılan zarların toplamı olsun', kontrol: (d) => { const z = d.getElementById('zar'), b = d.getElementById('at'), t = d.getElementById('toplam'); if (!z || !b || !t) return false; const once = +metin(t); let s = 0; for (let i = 0; i < 5; i++) { b.click(); s += +metin(z); } return +metin(t) === once + s; } }
            ],
            cozum: { html: '<p id="zar" style="font-size:60px;margin:0">?</p>\n<button id="at">Zar at</button>\n<p>Toplam: <span id="toplam">0</span></p>\n', css: '', js: 'const zar = document.getElementById("zar");\nconst toplamYazi = document.getElementById("toplam");\nlet toplam = 0;\n\ndocument.getElementById("at").addEventListener("click", function () {\n  const sayi = Math.floor(Math.random() * 6) + 1;\n  zar.textContent = sayi;\n  toplam = toplam + sayi;\n  toplamYazi.textContent = toplam;\n});\n' }
        },
        {
            ad: 'Not Hesaplayıcı', sinif: [8, 12], js: '',
            anlatim: 'Üç notun ortalamasını hesapla ve <code>ortalama.toFixed(1)</code> ile virgülden sonra 1 basamak göster. Ortalama 50 ve üstüyse <b>Geçti</b>, değilse <b>Kaldı</b> yazsın.',
            html: '<input id="n1" type="number" placeholder="1. not">\n<input id="n2" type="number" placeholder="2. not">\n<input id="n3" type="number" placeholder="3. not">\n<button id="hesapla">Hesapla</button>\n<p>Ortalama: <b id="ortalama">-</b></p>\n<p id="durum"></p>\n', css: '',
            gorevler: [
                { ad: 'Ortalama doğru hesaplansın (70, 80, 95 → 81.7)', kontrol: (d, w) => { const g = ['n1', 'n2', 'n3'].map(i => d.getElementById(i)), b = d.getElementById('hesapla'), o = d.getElementById('ortalama'); if (g.some(x => !x) || !b || !o) return false; [70, 80, 95].forEach((v, i) => yazGir(w, g[i], String(v))); b.click(); return metin(o) === '81.7'; } },
                { ad: 'Durum <b>Geçti</b> ya da <b>Kaldı</b> olsun', kontrol: (d, w) => { const g = ['n1', 'n2', 'n3'].map(i => d.getElementById(i)), b = d.getElementById('hesapla'), s = d.getElementById('durum'); if (g.some(x => !x) || !b || !s) return false; [40, 50, 45].forEach((v, i) => yazGir(w, g[i], String(v))); b.click(); const a = metin(s); [50, 50, 50].forEach((v, i) => yazGir(w, g[i], String(v))); b.click(); return a === 'Kaldı' && metin(s) === 'Geçti'; } }
            ],
            cozum: { html: '<input id="n1" type="number" placeholder="1. not">\n<input id="n2" type="number" placeholder="2. not">\n<input id="n3" type="number" placeholder="3. not">\n<button id="hesapla">Hesapla</button>\n<p>Ortalama: <b id="ortalama">-</b></p>\n<p id="durum"></p>\n', css: '', js: 'document.getElementById("hesapla").addEventListener("click", function () {\n  const a = Number(document.getElementById("n1").value);\n  const b = Number(document.getElementById("n2").value);\n  const c = Number(document.getElementById("n3").value);\n  const ortalama = (a + b + c) / 3;\n  document.getElementById("ortalama").textContent = ortalama.toFixed(1);\n  document.getElementById("durum").textContent = ortalama >= 50 ? "Geçti" : "Kaldı";\n});\n' }
        },
        {
            ad: 'Karakter Sayacı', sinif: [8, 12], js: 'const mesaj = document.getElementById("mesaj");\nconst say = document.getElementById("say");\n',
            anlatim: 'Sosyal medyadaki gibi bir karakter sayacı: yazdıkça <b>12 / 140</b> biçiminde göster. 140\'ı geçince sayaç yazısı kırmızı olsun (sayaca <code>class="asti"</code> ekle; CSS hazır).',
            html: '<textarea id="mesaj" rows="4" cols="40"></textarea>\n<p id="say">0 / 140</p>\n', css: '.asti { color: #dc2626; font-weight: bold; }\n',
            gorevler: [
                { ad: 'Yazdıkça <b>sayı / 140</b> güncellensin', kontrol: (d, w) => { const m = d.getElementById('mesaj'), s = d.getElementById('say'); if (!m || !s) return false; yazGir(w, m, 'Merhaba'); const a = metin(s); yazGir(w, m, ''); return a === '7 / 140' && metin(s) === '0 / 140'; } },
                { ad: '140\'ı geçince sayaç kırmızı olsun, geri inince normale dönsün', kontrol: (d, w) => { const m = d.getElementById('mesaj'), s = d.getElementById('say'); if (!m || !s) return false; yazGir(w, m, 'a'.repeat(141)); const a = s.classList.contains('asti'); yazGir(w, m, 'a'.repeat(140)); return a && !s.classList.contains('asti'); } }
            ],
            cozum: { html: '<textarea id="mesaj" rows="4" cols="40"></textarea>\n<p id="say">0 / 140</p>\n', css: '.asti { color: #dc2626; font-weight: bold; }\n', js: 'const mesaj = document.getElementById("mesaj");\nconst say = document.getElementById("say");\n\nmesaj.addEventListener("input", function () {\n  const n = mesaj.value.length;\n  say.textContent = n + " / 140";\n  say.classList.toggle("asti", n > 140);\n});\n' }
        },
        {
            ad: 'Bilgi Yarışması', sinif: [8, 12], js: 'const sonuc = document.getElementById("sonuc");\n\n// her .secenek düğmesine tıklama olayı ekle\n',
            anlatim: 'Son proje: bir bilgi yarışması! <code>document.querySelectorAll(".secenek")</code> bütün seçenekleri verir. Doğru seçenekte <code>data-dogru</code> özelliği var: <code>dugme.dataset.dogru</code>. Doğruysa <b>Doğru!</b>, değilse <b>Yanlış!</b> yazdır ve puanı artır.',
            html: '<h2>1 bayt kaç bittir?</h2>\n<button class="secenek">4</button>\n<button class="secenek" data-dogru="evet">8</button>\n<button class="secenek">16</button>\n<p id="sonuc"></p>\n<p>Puan: <span id="puan">0</span></p>\n', css: '',
            gorevler: [
                { ad: 'Yanlış seçeneğe tıklayınca <b>Yanlış!</b> yazsın', kontrol: (d) => { const s = d.querySelectorAll('.secenek'), r = d.getElementById('sonuc'); if (s.length < 3 || !r) return false; s[0].click(); return metin(r) === 'Yanlış!'; } },
                { ad: 'Doğru seçeneğe tıklayınca <b>Doğru!</b> yazsın', kontrol: (d) => { const s = d.querySelector('.secenek[data-dogru]'), r = d.getElementById('sonuc'); if (!s || !r) return false; s.click(); return metin(r) === 'Doğru!'; } },
                { ad: 'Doğru cevapta puan 10 artsın, yanlışta değişmesin', kontrol: (d) => { const s = d.querySelectorAll('.secenek'), dg = d.querySelector('.secenek[data-dogru]'), p = d.getElementById('puan'); if (s.length < 3 || !dg || !p) return false; const a = +metin(p); dg.click(); const b = +metin(p); s[2].click(); return b === a + 10 && +metin(p) === b; } }
            ],
            cozum: { html: '<h2>1 bayt kaç bittir?</h2>\n<button class="secenek">4</button>\n<button class="secenek" data-dogru="evet">8</button>\n<button class="secenek">16</button>\n<p id="sonuc"></p>\n<p>Puan: <span id="puan">0</span></p>\n', css: '', js: 'const sonuc = document.getElementById("sonuc");\nconst puanYazi = document.getElementById("puan");\nlet puan = 0;\n\nfor (const dugme of document.querySelectorAll(".secenek")) {\n  dugme.addEventListener("click", function () {\n    if (dugme.dataset.dogru) {\n      sonuc.textContent = "Doğru!";\n      puan = puan + 10;\n      puanYazi.textContent = puan;\n    } else {\n      sonuc.textContent = "Yanlış!";\n    }\n  });\n}\n' }
        }

    ];

    // Önizleme belgesi. js verilmezse (HTML/CSS bölümleri) betik çalışmaz; JavaScript bölümlerinde hatalar __hatalar'a toplanır
    function belge(html, css, js) {
        const betik = js === undefined ? '' : `<script>${String(js).replace(/<\/script/gi, '<\\/script')}\n;window.__jsCalisti = true;</script>`;
        const ust = js === undefined ? '' : '<script>window.__hatalar = []; addEventListener("error", function (e) { __hatalar.push(e.message); });</script>';
        return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">${ust}<style>body{font-family:system-ui,sans-serif;margin:16px;color:#111;background:#fff}</style><style id="ogrenci-css">${css}</style></head><body>${html}${betik}</body></html>`;
    }

    const api = { BOLUMLER, belge };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Web = api;
})(typeof window !== 'undefined' ? window : globalThis);
