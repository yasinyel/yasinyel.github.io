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
        }
    ];

    // Önizleme belgesi: öğrencinin kodu, JavaScript çalışmaz (iframe sandbox)
    function belge(html, css) {
        return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;margin:16px;color:#111;background:#fff}</style><style id="ogrenci-css">${css}</style></head><body>${html}</body></html>`;
    }

    const api = { BOLUMLER, belge };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Web = api;
})(typeof window !== 'undefined' ? window : globalThis);
