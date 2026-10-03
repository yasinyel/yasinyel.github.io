// Kodlayalım — Şifre Kalesi motoru: şifre gücü tahmini, oltalama senaryoları, güvenlik durumları
// Not: Şifre analizi tamamen tarayıcıda yapılır; hiçbir şey hiçbir yere gönderilmez.
(function (root) {
    'use strict';

    // ---------- Şifre gücü ----------
    // Saldırganın ilk denediği şifreler
    const YAYGIN = ['123456', '123456789', '12345678', '12345', '1234567', '111111', '000000', '123123', 'qwerty', 'qwerty123', 'password', 'sifre', 'şifre', 'parola', 'abc123', '1q2w3e4r', 'asdasd', 'asdfgh', 'qweasd', '654321', '666666', '121212', 'galatasaray', 'fenerbahce', 'besiktas', 'trabzonspor', 'iloveyou', 'admin', 'sifre123', 'sevgilim', 'aşkım', 'askim', 'canım', 'canim', 'ankara', 'istanbul', 'turkiye', 'türkiye', 'mustafa', 'mehmet', 'ahmet', 'ayşe', 'fatma', 'zeynep', 'elif', 'emre', 'can', 'deniz'];
    // Sözlük: saldırganların denediği kelimeler (Türkçe + İngilizce yaygın kelimeler, isimler, takımlar)
    const SOZLUK = [...new Set([...YAYGIN, 'kedi', 'köpek', 'kopek', 'aslan', 'kaplan', 'kartal', 'güneş', 'gunes', 'ay', 'yıldız', 'yildiz', 'deniz', 'mavi', 'kırmızı', 'kirmizi', 'yeşil', 'yesil', 'sarı', 'sari', 'siyah', 'beyaz', 'okul', 'oyun', 'futbol', 'basket', 'minecraft', 'roblox', 'pubg', 'fortnite', 'messi', 'ronaldo', 'anne', 'baba', 'kardeş', 'kardes', 'aile', 'sevgi', 'mutlu', 'kalem', 'kitap', 'bilgisayar', 'telefon', 'tablet', 'oyuncu', 'prenses', 'kral', 'kraliçe', 'ejderha', 'dragon', 'monkey', 'master', 'shadow', 'sunshine', 'princess', 'football', 'baseball', 'welcome', 'login', 'hello', 'merhaba', 'selam', 'love', 'ask', 'aşk', 'pizza', 'çikolata', 'cikolata', 'elma', 'muz', 'yaz', 'kış', 'kis', 'bahar', 'pamuk', 'boncuk', 'tarçın', 'tarcin', 'karamel', 'zeytin', 'ali', 'veli', 'murat', 'hasan', 'hüseyin', 'huseyin', 'ömer', 'omer', 'yusuf', 'ibrahim', 'ismail', 'emine', 'hatice', 'merve', 'esra', 'büşra', 'busra', 'kübra', 'kubra', 'ece', 'eylül', 'eylul', 'defne', 'ada', 'asel', 'miray', 'kerem', 'burak', 'berk', 'efe', 'arda', 'kaan', 'alp', 'baran', 'mert', 'ozan', 'sena', 'irem', 'selin', 'damla', 'derya', 'gizli', 'admin', 'root', 'test', 'user', 'kullanici'])];
    const SIRALAR = ['abcçdefgğhıijklmnoöprsştuüvyz', 'abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuıopğü', 'asdfghjklşi', 'zxcvbnmöç', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    const kucuk = (s) => s.toLocaleLowerCase('tr');

    function havuz(sifre) {
        let n = 0;
        if (/[a-zçğıöşü]/.test(sifre)) n += 29;
        if (/[A-ZÇĞİÖŞÜ]/.test(sifre)) n += 29;
        if (/[0-9]/.test(sifre)) n += 10;
        if (/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(sifre)) n += 33;
        return Math.max(n, 10);
    }

    // Şifreyi parçalara ayırıp her parçanın tahmin edilme zorluğunu (bit) toplar
    function analiz(sifre) {
        const parcalar = [];
        const k = kucuk(sifre);
        const tum = YAYGIN.includes(k) || YAYGIN.includes(k.replace(/[0-9!.]+$/, '')) && k.replace(/[0-9!.]+$/, '').length >= 4 && k.length - k.replace(/[0-9!.]+$/, '').length <= 3;
        if (!sifre) return { bit: 0, seviye: 0, parcalar, kontroller: kontroller(sifre), yaygin: false };
        if (YAYGIN.includes(k)) {
            parcalar.push({ tur: 'yaygin', metin: sifre, bit: 4 });
        } else {
            const H = Math.log2(havuz(sifre));
            let i = 0;
            while (i < sifre.length) {
                let en = null;
                // Sözlük kelimesi (en uzun eşleşme, en az 3 harf)
                for (let j = sifre.length; j >= i + 3; j--) {
                    const p = k.slice(i, j);
                    if (SOZLUK.includes(p)) { en = { tur: 'kelime', metin: sifre.slice(i, j), bit: Math.log2(SOZLUK.length * 4) + (sifre.slice(i, j) !== p ? 1 : 0) }; break; }
                }
                // Yıl (1950–2029)
                if (!en) { const m = sifre.slice(i).match(/^(19[5-9]\d|20[0-2]\d)/); if (m) en = { tur: 'yil', metin: m[0], bit: 6.5 }; }
                // Ardışık (abc, 123, qwe) ya da ters (cba, 321)
                if (!en) {
                    let uz = 0;
                    for (const s of SIRALAR) for (const yon of [s, [...s].reverse().join('')]) {
                        let j = i;
                        while (j < k.length && yon.includes(k.slice(i, j + 1))) j++;
                        if (j - i > uz) uz = j - i;
                    }
                    if (uz >= 3) en = { tur: 'sira', metin: sifre.slice(i, i + uz), bit: 4 + Math.log2(uz) };
                }
                // Tekrar (aaa, 111)
                if (!en) { const m = sifre.slice(i).match(/^(.)\1{2,}/); if (m) en = { tur: 'tekrar', metin: m[0], bit: H + Math.log2(m[0].length) }; }
                if (!en) en = { tur: 'karakter', metin: sifre[i], bit: H };
                // Art arda gelen karakterleri tek parçada topla
                const son = parcalar[parcalar.length - 1];
                if (en.tur === 'karakter' && son && son.tur === 'karakter') { son.metin += en.metin; son.bit += en.bit; }
                else parcalar.push(en);
                i += en.metin.length;
            }
        }
        let bit = parcalar.reduce((t, p) => t + p.bit, 0);
        if (tum && !YAYGIN.includes(k)) bit = Math.min(bit, 12);
        const seviye = bit < 25 ? 0 : bit < 40 ? 1 : bit < 55 ? 2 : bit < 70 ? 3 : 4;
        return { bit, seviye, parcalar, kontroller: kontroller(sifre), yaygin: YAYGIN.includes(k) || tum };
    }

    function kontroller(s) {
        return [
            { ad: 'En az 12 karakter', ok: [...s].length >= 12 },
            { ad: 'Küçük harf', ok: /[a-zçğıöşü]/.test(s) },
            { ad: 'Büyük harf', ok: /[A-ZÇĞİÖŞÜ]/.test(s) },
            { ad: 'Rakam', ok: /[0-9]/.test(s) },
            { ad: 'Sembol (! ? - _ …)', ok: /[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(s) }
        ];
    }

    const SEVIYELER = [
        { ad: 'Çok zayıf', renk: '#e5484d' }, { ad: 'Zayıf', renk: '#f97316' }, { ad: 'Orta', renk: '#eab308' },
        { ad: 'Güçlü', renk: '#22a35a' }, { ad: 'Çok güçlü', renk: '#16a36a' }
    ];

    // Saniyede 10 milyar deneme yapan bir saldırgan için ortalama süre
    function kirmaSuresi(bit) {
        const sn = Math.pow(2, Math.max(bit - 1, 0)) / 1e10;
        const B = [[31557600e9, 'milyar yıl'], [31557600e6, 'milyon yıl'], [31557600e3, 'bin yıl'], [31557600, 'yıl'], [2629800, 'ay'], [86400, 'gün'], [3600, 'saat'], [60, 'dakika'], [1, 'saniye']];
        if (sn > 31557600e12) return 'evrenin yaşından çok daha uzun';
        for (const [b, ad] of B) if (sn >= b) return `${Math.round(sn / b).toLocaleString('tr-TR')} ${ad}`;
        return 'bir saniyeden kısa';
    }

    // ---------- Hangisi daha güçlü? ----------
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const sec = (d) => d[Math.floor(Math.random() * d.length)];
    const KELIME_HAVUZU = ['bulut', 'portakal', 'zürafa', 'pusula', 'kumsal', 'fener', 'kaktüs', 'gezegen', 'fırtına', 'balon', 'çınar', 'pinpon', 'düdük', 'karpuz', 'robot', 'okyanus', 'lale', 'tren', 'mangal', 'tüy'];
    const ZAYIF_URET = [
        () => sec(YAYGIN.filter(x => x.length >= 6)),
        () => sec(['ahmet', 'zeynep', 'mehmet', 'elif', 'emre', 'ayşe']) + r(1990, 2015),
        () => sec(['galatasaray', 'fenerbahce', 'besiktas']) + r(1, 99),
        () => sec(['qwerty', 'asdfgh', '123456', 'abcdef']) + sec(['', '!', '1']),
        () => sec(['Kedi', 'Aslan', 'Futbol', 'Minecraft']) + r(100, 999),
        () => String(r(1, 9)).repeat(r(6, 9))
    ];
    const GUCLU_URET = [
        () => [sec(KELIME_HAVUZU), sec(KELIME_HAVUZU), sec(KELIME_HAVUZU), sec(KELIME_HAVUZU)].join('-') + r(1, 9),
        () => { const h = 'abcdefghijkmnoprstuvyzABCDEFGHJKLMNPRSTUVYZ23456789!?-_*'; return Array.from({ length: r(13, 16) }, () => h[r(0, h.length - 1)]).join(''); },
        () => sec(KELIME_HAVUZU)[0].toUpperCase() + sec(KELIME_HAVUZU).slice(1) + sec(['!', '?', '*', '-']) + sec(KELIME_HAVUZU) + r(10, 99) + sec(KELIME_HAVUZU)
    ];
    function ciftUret() {
        const zayif = sec(ZAYIF_URET)(), guclu = sec(GUCLU_URET)();
        return Math.random() < 0.5 ? { a: zayif, b: guclu, dogru: 'b' } : { a: guclu, b: zayif, dogru: 'a' };
    }

    // ---------- Oltalama senaryoları (hayali kurumlar) ----------
    // tur: eposta | sms | site. ipuclari: metindeki [[id|metin]] işaretleriyle eşleşir.
    const OLTALAMA = [
        {
            tur: 'eposta', oltalama: true, kimden: 'KodBank Güvenlik <guvenlik@kodbank-hesap-dogrulama.xyz>', konu: 'ACİL: Hesabınız askıya alındı!',
            govde: '[[hitap|Sayın Müşterimiz]],\n\nHesabınızda şüpheli işlem tespit edildi. [[acele|24 saat içinde doğrulama yapmazsanız hesabınız kalıcı olarak kapatılacaktır.]]\n\nLütfen aşağıdaki bağlantıya tıklayarak [[sifre|kullanıcı adınızı, şifrenizi ve kart bilgilerinizi]] girin:\n\n[[link|Hesabımı Doğrula]]',
            link: 'http://kodbank.giris-dogrula.xyz/hesap',
            ipuclari: {
                gonderen: 'Gönderen adresi KodBank\'ın resmi adresi değil: "kodbank-hesap-dogrulama.xyz" tuhaf bir alan adı.',
                hitap: 'Adın yerine "Sayın Müşterimiz" yazıyor. Gerçek kurumlar genellikle adınla hitap eder.',
                acele: 'Korkutup acele ettirmeye çalışıyor. Dolandırıcılar düşünmeden tıklamanı ister.',
                sifre: 'Hiçbir banka e-postayla şifre veya kart bilgisi istemez!',
                link: 'Bağlantı "giris-dogrula.xyz" adresine gidiyor, bankanın sitesine değil.'
            }
        },
        {
            tur: 'sms', oltalama: true, kimden: '+90 850 *** 47 12',
            govde: '[[odul|TEBRİKLER! 5.000 TL değerinde hediye çeki kazandınız!]] [[cekilis|Katıldığınız çekiliş sonucunda]] seçildiniz. [[acele|Ödülünüzü 2 saat içinde]] almak için tıklayın: [[link|bit.ly/hediye-cek-al]]',
            link: 'https://bit.ly/hediye-cek-al',
            ipuclari: {
                gonderen: 'Tanımadığın bir numaradan geliyor.',
                odul: 'Gerçek olamayacak kadar iyi bir teklif. Bedava büyük ödül = büyük tuzak.',
                cekilis: 'Katılmadığın bir çekilişi nasıl kazanabilirsin?',
                acele: 'Süre baskısıyla düşünmeden tıklamanı istiyor.',
                link: 'Kısaltılmış bağlantı gerçek adresi gizler. Nereye gittiğini göremezsin.'
            }
        },
        {
            tur: 'eposta', oltalama: false, kimden: 'Atatürk Ortaokulu <duyuru@ataturkortaokulu.k12.tr>', konu: 'Veli toplantısı hakkında',
            govde: 'Sayın Veli Yılmaz,\n\n7-B sınıfı veli toplantısı 14 Kasım Perşembe günü saat 17.00\'de okulumuzun konferans salonunda yapılacaktır.\n\nKatılımınızı rica ederiz.\n\nOkul Müdürlüğü',
            aciklama: 'Bu mesaj güvenli görünüyor: adres okulun kendi alan adından, adınla hitap ediyor, bağlantı yok, şifre ya da para istemiyor, acele ettirmiyor.'
        },
        {
            tur: 'sms', oltalama: true, kimden: 'KARGO-TAKIP',
            govde: 'Kargonuz adres eksikliği nedeniyle teslim edilemedi. [[ucret|4,90 TL gümrük ücretini]] ödemezseniz [[acele|paketiniz bugün iade edilecek.]] Ödeme: [[link|kargo-takip-tr.top/ode]]',
            link: 'http://kargo-takip-tr.top/ode',
            ipuclari: {
                ucret: 'Beklemediğin küçük bir ücret isteniyor. Amaç kart bilgilerini çalmak.',
                acele: 'Yine acele ettiriyor.',
                link: '".top" ile biten, kargo şirketine ait olmayan bir site.',
                gonderen: 'Gönderen adı herkesin yazabileceği "KARGO-TAKIP". Hangi kargo şirketi olduğu bile yazmıyor.'
            }
        },
        {
            tur: 'eposta', oltalama: true, kimden: 'OyunDünyası Destek <destek@oyundunyasi-elmas.ru>', konu: '🎁 Ücretsiz 10.000 elmas seni bekliyor!',
            govde: 'Merhaba oyuncu!\n\nSadakatin için sana [[bedava|10.000 elmas HEDİYE]] ediyoruz! Elmasları hesabına eklememiz için [[sifre|kullanıcı adını ve şifreni]] aşağıdaki forma yaz.\n\n[[yazim|Bu teklif sadece bu gün gecerlidir, kacırma!]]\n\n[[link|Elmaslarımı Al]]',
            link: 'http://oyundunyasi-elmas.ru/form',
            ipuclari: {
                gonderen: 'Oyun şirketinin resmi adresi değil: "-elmas.ru" eklenmiş.',
                bedava: 'Bedava oyun parası vaadi, çocukları kandırmanın en yaygın yolu.',
                sifre: 'Hiçbir oyun şirketi hediye vermek için şifreni istemez.',
                yazim: 'Yazım hataları ("gecerlidir", "kacırma") sahte mesajların işaretidir.',
                link: 'Bağlantı oyunun kendi sitesine değil, başka bir ülkedeki tuhaf bir siteye gidiyor.'
            }
        },
        {
            tur: 'sms', oltalama: false, kimden: 'KODBANK',
            govde: 'KodBank mobil uygulamanıza bugün 14:32\'de yeni bir cihazdan giriş yapıldı. Bu siz değilseniz kartınızın arkasındaki numaradan bankanızı arayın. Bu mesajda bağlantı bulunmamaktadır.',
            aciklama: 'Bu bilgilendirme mesajı güvenli: bağlantı yok, şifre istemiyor, seni bankanın bildiğin numarasını aramaya yönlendiriyor. Yine de emin değilsen bankayı kendin ara.'
        },
        {
            tur: 'sms', oltalama: true, kimden: 'Arkadaşın Mert',
            govde: 'Selam, [[acele|çok acil]] bir durum var, [[para|500 TL lazım. Şu IBAN\'a gönderebilir misin?]] Akşam geri veririm. [[gizli|Kimseye söyleme lütfen.]]',
            ipuclari: {
                acele: 'Aciliyet baskısı.',
                para: 'Mesajla para istemek, hesabı çalınmış birinin en tipik işareti.',
                gizli: '"Kimseye söyleme" diyerek senin kontrol etmeni engellemek istiyor. Arkadaşını telefonla arayıp sor!'
            }
        },
        {
            tur: 'site', oltalama: true, adres: 'http://www.kodbamk.com/giris',
            govde: 'KodBank İnternet Şubesi\n\n[[bilgi|T.C. Kimlik No · Şifre · Kart Numarası · Son Kullanma Tarihi · CVV · Anne Kızlık Soyadı]]\n\n▶ Giriş Yap',
            ipuclari: {
                adres: 'Adres "kodbank" değil "kodbamk": tek harf değiştirilmiş sahte alan adı.',
                https: 'Adres "https" değil "http" ile başlıyor: bağlantı şifrelenmemiş, kilit simgesi yok.',
                bilgi: 'Bir giriş sayfası asla kart numarası, CVV ve anne kızlık soyadını birlikte istemez.'
            }
        }
    ];
    // Her senaryoda hangi ipucunun nerede olduğu (gönderen/adres/https başlıkta, diğerleri metinde)
    function ipucuSayisi(s) { return s.oltalama ? Object.keys(s.ipuclari).length : 0; }

    // ---------- Ne yapmalı? ----------
    const DURUMLAR = [
        { sinif: [3, 12], durum: 'En yakın arkadaşın, oyundaki hesabına girip sana yardım etmek için şifreni istiyor.', secenekler: ['Arkadaşım olduğu için veririm.', 'Şifremi kimseyle paylaşmam, yardımı ekran başında birlikte yaparız.', 'Şifremi verir, sonra unuturum.'], dogru: 1, aciklama: 'Şifre diş fırçası gibidir: kimseyle paylaşılmaz. En iyi arkadaşlar bile yanlışlıkla başkasına söyleyebilir.' },
        { sinif: [3, 12], durum: 'Okul bahçesinde yerde bir USB bellek buldun. Üstünde "Sınav cevapları" yazıyor.', secenekler: ['Bilgisayara takıp içine bakarım.', 'Takmadan öğretmenime ya da okul yönetimine teslim ederim.', 'Evdeki bilgisayara takarım, orada güvenli olur.'], dogru: 1, aciklama: 'Bulunan USB bellekler virüs bulaştırmak için kullanılan bilinen bir tuzaktır. Merak uyandıran etiketler bilerek yazılır.' },
        { sinif: [4, 12], durum: 'Bilgisayarın "Önemli güvenlik güncellemesi hazır" diyor ama oyun oynuyorsun.', secenekler: ['Güncellemeyi hep ertelerim.', 'Oyunu kaydedip güncellemeyi en kısa sürede yaparım.', 'Güncellemeleri tamamen kapatırım.'], dogru: 1, aciklama: 'Güncellemeler, saldırganların kullandığı güvenlik açıklarını kapatır. Ertelenen her gün risktir.' },
        { sinif: [5, 12], durum: 'Telefonuna "Giriş kodunuz: 482913. Bu kodu kimseyle paylaşmayın" mesajı geldi ama sen giriş yapmaya çalışmıyordun.', secenekler: ['Kodu bana mesaj atan kişiye gönderirim.', 'Kimseyle paylaşmam, şifremi hemen değiştiririm.', 'Mesajı görmezden gelirim, önemli değildir.'], dogru: 1, aciklama: 'Biri şifreni biliyor ve giriş yapmaya çalışıyor! İki adımlı doğrulama seni korudu. Kodu asla paylaşma ve şifreni değiştir.' },
        { sinif: [6, 12], durum: 'Kafede ücretsiz ve şifresiz bir Wi-Fi ağı buldun. Annen internet bankacılığına girmek istiyor.', secenekler: ['Şifresiz ağdan girmesi sorun olmaz.', 'Bankacılık gibi önemli işler için mobil veriyi kullanmasını öneririm.', 'Ağın adı "Ücretsiz_WiFi" ise güvenlidir.'], dogru: 1, aciklama: 'Açık ağlarda aynı ağdaki biri trafiği izleyebilir ya da sahte bir ağ kurmuş olabilir. Önemli işler için güvendiğin bağlantıyı kullan.' },
        { sinif: [3, 12], durum: 'Sosyal medyada okul formanla, okulunun önünde çekilmiş bir fotoğraf paylaşmak istiyorsun. Konum da otomatik ekleniyor.', secenekler: ['Paylaşırım, herkes görsün.', 'Konumu ve okulu belli eden ayrıntıları kaldırır, hesabımın gizli olduğundan emin olurum.', 'Sadece konumu açık bırakırım.'], dogru: 1, aciklama: 'Forma, okul adı ve konum; seni tanımayan birinin seni bulmasını sağlar. İnternete koyduğun şey kolay kolay silinmez.' },
        { sinif: [5, 12], durum: 'Bütün hesaplarında aynı şifreyi kullanıyorsun. Bir oyun sitesinin şifreleri çalındı haberi geldi.', secenekler: ['Sadece oyun sitesindeki şifremi değiştiririm.', 'Hepsini değiştirir, her hesaba farklı şifre koyarım.', 'Bir şey yapmama gerek yok.'], dogru: 1, aciklama: 'Saldırganlar çalınan şifreyi diğer sitelerde de dener. Her hesaba farklı şifre, bir hesap çalınsa bile diğerlerini korur.' },
        { sinif: [3, 12], durum: 'Oyunda tanıştığın biri seninle yaşını, okulunu ve fotoğrafını istiyor. "Sakın ailene söyleme" diyor.', secenekler: ['Arkadaş olduğumuz için gönderirim.', 'Bilgi vermem ve durumu hemen ailem ya da öğretmenimle konuşurum.', 'Sadece fotoğraf gönderirim.'], dogru: 1, aciklama: '"Ailene söyleme" diyen biri asla güvenilir değildir. İnternette tanıdığın kişiler kendini olduğundan farklı gösterebilir.' },
        { sinif: [6, 12], durum: 'Ücretsiz bir el feneri uygulaması yüklerken uygulama rehberine, mesajlarına ve konumuna erişmek istiyor.', secenekler: ['Hepsine izin veririm.', 'Bu izinlere gerek olmadığı için uygulamayı yüklemem.', 'Sadece rehbere izin veririm.'], dogru: 1, aciklama: 'Bir el fenerinin rehberine ihtiyacı yoktur. Gereğinden fazla izin isteyen uygulamalar verilerini toplayıp satabilir.' },
        { sinif: [7, 12], durum: 'Okul bilgisayarında e-posta hesabına girdin ve ders bitti.', secenekler: ['Tarayıcıyı kapatırım, yeter.', 'Hesabımdan çıkış yapar, "beni hatırla" seçmediğimden emin olurum.', 'Bir sonraki ders için açık bırakırım.'], dogru: 1, aciklama: 'Ortak bilgisayarlarda çıkış yapmazsan, senden sonra oturan kişi hesabına girebilir.' }
    ];

    const api = { analiz, kirmaSuresi, SEVIYELER, ciftUret, OLTALAMA, ipucuSayisi, DURUMLAR, YAYGIN, SOZLUK };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Guvenlik = api;
})(typeof window !== 'undefined' ? window : globalThis);
