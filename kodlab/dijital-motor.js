// KodLab — Dijital Dedektif: medya okuryazarlığı ve dijital vatandaşlık içerikleri
// Bütün kişi, kurum, site ve marka adları hayalidir.
// Metinlerdeki [[id|metin]] işaretleri tıklanabilir ipuçlarıdır; açıklamaları ipuclari[id] içindedir.
(function (root) {
    'use strict';

    const BOLUMLER = [
        { id: 'haber', ad: 'Haber Dedektifi', ikon: 'fa-newspaper', renk: '#e5484d', sinif: [5, 12], ozet: 'Sahte, eski ya da yanıltıcı haberleri yakala. Görseli tersine ara, başka kaynaklara bak.' },
        { id: 'reklam', ad: 'Reklamı Yakala', ikon: 'fa-bullhorn', renk: '#f59e0b', sinif: [3, 12], ozet: 'Hangi paylaşım reklam? Gizli reklamların ipuçlarını bul.' },
        { id: 'ayakizi', ad: 'Dijital Ayak İzi', ikon: 'fa-shoe-prints', renk: '#8b5cf6', sinif: [3, 12], ozet: 'Profillerde paylaşılmaması gereken kişisel bilgileri bul.' },
        { id: 'zorbalik', ad: 'Siber Zorbalığa Dur De', ikon: 'fa-hand', renk: '#16a36a', sinif: [3, 12], ozet: 'Çevrim içi zor durumlarda en doğru davranışı seç.' },
        { id: 'telif', ad: 'Telif ve Lisans', ikon: 'fa-copyright', renk: '#1d5fd6', sinif: [6, 12], ozet: 'Hangi görseli, müziği nerede kullanabilirsin? Creative Commons lisanslarını öğren.' }
    ];

    // ---------- Haber Dedektifi ----------
    // tur: 'sahte' (sahte, eski ya da yanıltıcı) | 'guvenilir'. arac: araç düğmeleriyle açılan ek bilgiler.
    const HABERLER = [
        {
            id: 'tatil', tur: 'sahte', bicim: 'site', kaynak: 'SON DAKİKA 24', adres: '[[site|sondakika-haber24.xyz]]', tarih: 'Tarih yok',
            baslik: '[[buyuk|ŞOK! OKULLAR BÜTÜN YIL TATİL EDİLDİ!!!]]',
            metin: 'Gizli bir karara göre okullar bir yıl boyunca kapalı kalacak. Kararı [[kaynaksiz|adını vermek istemeyen bir yetkili]] açıkladı. [[paylas|Bu haber silinmeden önce herkese paylaş!]]',
            gorsel: { emoji: '🏫', yazi: 'Boş bir okul koridoru' },
            arac: { kaynak: '[[diger|Bakanlığın resmî sitesinde ve tanınmış haber sitelerinin hiçbirinde böyle bir haber yok.]]', gorsel: 'Bu fotoğraf birçok farklı haberde kullanılmış hazır bir görsel.' },
            ipuclari: {
                site: 'Tanınmayan, garip uzantılı (.xyz) bir site. Bu kadar önemli bir haber resmî kurumlarda ve bilinen haber sitelerinde de olurdu.',
                buyuk: 'Büyük harfler, ünlemler ve "ŞOK" kelimesi duygularını harekete geçirip düşünmeden paylaşman için kullanılır.',
                kaynaksiz: 'Kaynak belirsiz: kim olduğu bilinmeyen biri. Güvenilir haberlerde konuşan kişinin adı ve görevi yazar.',
                paylas: 'Haber, paylaşmaya zorluyor. Gerçek haberler "silinmeden paylaş" demez.',
                diger: 'Başka hiçbir güvenilir kaynak doğrulamıyor.'
            }
        },
        {
            id: 'sel', tur: 'sahte', bicim: 'paylasim', kaynak: '@gundem_bomba', tarih: 'Bugün 08:12',
            metin: '[[abarti|ŞU AN kent merkezi tamamen sular altında!!! 😱😱]] Kimse dışarı çıkmasın, herkese yollayın!',
            gorsel: { emoji: '🌊', yazi: 'Sular altında kalmış bir cadde' },
            arac: { gorsel: 'Tersine görsel arama: [[eski|Bu fotoğraf internette ilk kez 2015 yılında, başka bir ülkedeki sel haberinde yayımlanmış.]]', kaynak: '[[meteo|Meteoroloji bugün için yağış uyarısı yapmamış; yerel haber siteleri böyle bir sel bildirmiyor.]]' },
            ipuclari: {
                abarti: 'Abartılı ve korkutucu dil, emojiler ve ünlemler. Paylaşım hızla yayılsın diye yazılmış.',
                eski: 'Fotoğraf eski ve başka bir yere ait! Tersine görsel arama, bir fotoğrafın ilk nerede çıktığını gösterir.',
                meteo: 'Resmî kurumlar ve yerel haberler doğrulamıyor.'
            }
        },
        {
            id: 'kutuphane', tur: 'guvenilir', bicim: 'site', kaynak: 'Yeşilvadi Gazetesi', adres: 'yesilvadigazetesi.com.tr', tarih: '3 Ekim 2026 · Selin Kaya',
            baslik: 'Kent kütüphanesinde ücretsiz kodlama atölyesi açıldı',
            metin: 'Belediye ve kütüphane müdürlüğünün ortak çalışmasıyla açılan atölyede 8–14 yaş arası çocuklara ücretsiz eğitim verilecek. Kütüphane Müdürü Ahmet Demir, kayıtların kütüphanenin internet sitesinden yapılabileceğini söyledi.',
            gorsel: { emoji: '📚', yazi: 'Atölyede çalışan çocuklar (Fotoğraf: Yeşilvadi Gazetesi)' },
            arac: { kaynak: 'Belediyenin resmî sitesinde de aynı duyuru yayımlanmış.', gorsel: 'Tersine görsel arama: Fotoğraf ilk kez bu haberde yayımlanmış.' },
            iyi: ['Yazarın adı ve tarih belli.', 'Konuşan kişinin adı ve görevi yazıyor.', 'Resmî kaynakta da aynı bilgi var.', 'Dil sakin ve abartısız.']
        },
        {
            id: 'mucize', tur: 'sahte', bicim: 'site', kaynak: 'Sağlıklı Yaşam Sırları', adres: 'saglik-mucizesi.blog', tarih: '1 gün önce',
            baslik: '[[mucize|Doktorların Sakladığı Mucize: Bu Meyveyi Yiyen Asla Hastalanmıyor!]]',
            metin: '[[uzman|Uzmanlar]] bu yöntemin [[yuzde|%100 etkili]] olduğunu söylüyor. Binlerce kişi denedi. [[satis|Mucize meyve tozunu şimdi %70 indirimle sipariş et!]]',
            gorsel: { emoji: '🥝', yazi: 'Parlak renkli meyveler' },
            arac: { kaynak: '[[bilim|Adı belli bir doktor, üniversite ya da bilimsel araştırma bulunamadı.]]', gorsel: 'Fotoğraf ücretsiz görsel sitelerinden alınmış hazır bir görsel.' },
            ipuclari: {
                mucize: '"Mucize", "sakladıkları sır", "asla" gibi kelimeler bilimsel haberlerde kullanılmaz.',
                uzman: 'Hangi uzmanlar? İsim ve kurum yok.',
                yuzde: 'Hiçbir yöntem %100 etkili değildir. Kesin vaatler şüphe uyandırmalı.',
                satis: 'Haber gibi görünen bir satış sayfası. Asıl amaç ürün satmak.',
                bilim: 'Bilimsel bir kanıt yok.'
            }
        },
        {
            id: 'deepfake', tur: 'sahte', bicim: 'paylasim', kaynak: '@teknoloji_gercekleri', tarih: 'Dün 21:40',
            metin: 'Ünlü bilim insanı Prof. Kemal Uslu videoda "telefonlar 2027\'de yasaklanacak" diyor! [[duygu|Herkes bunu görmeli, şok olacaksınız!]]',
            gorsel: { emoji: '🎥', yazi: 'Video: Prof. Kemal Uslu konuşuyor' },
            arac: { gorsel: 'Video incelemesi: [[sahte|Dudak hareketleri sesle uyuşmuyor, yüzün kenarları bulanık, göz kırpma çok az. Video yapay zekâyla üretilmiş (deepfake).]]', kaynak: '[[yok|Profesörün kendi hesaplarında ve üniversitesinin sitesinde böyle bir açıklama yok.]]' },
            ipuclari: {
                duygu: 'Şaşırtıp hemen paylaşman isteniyor.',
                sahte: 'Yapay zekâ ile insanların söylemediği şeyleri söylüyormuş gibi videolar yapılabilir. Dudak-ses uyumsuzluğuna ve yüz kenarlarına dikkat et.',
                yok: 'Kişinin kendisi ve resmî kaynakları doğrulamıyor.'
            }
        },
        {
            id: 'bilim', tur: 'guvenilir', bicim: 'site', kaynak: 'Bilim Günlüğü', adres: 'bilimgunlugu.org', tarih: '28 Eylül 2026 · Dr. Elif Arslan',
            baslik: 'Araştırma: Yatmadan önce ekran kullanımı uykuyu geciktirebilir',
            metin: 'Üniversite araştırmacılarının 1.200 öğrenciyle yaptığı çalışmaya göre yatmadan önceki bir saatte ekran kullanmak uykuya dalmayı ortalama 20 dakika geciktiriyor. Araştırmacılar sonuçların kesin olmadığını, daha fazla çalışma gerektiğini belirtiyor.',
            gorsel: { emoji: '🌙', yazi: 'Grafik: ekran süresi ve uykuya dalma süresi' },
            arac: { kaynak: 'Araştırmanın kendisi bir bilim dergisinde yayımlanmış; başka bilim siteleri de aynı çalışmayı haber yapmış.', gorsel: 'Grafik, araştırmanın kendi verilerinden çizilmiş.' },
            iyi: ['Araştırmanın kaç kişiyle yapıldığı yazıyor.', 'Sınırlılıkları dürüstçe söylüyor ("kesin değil").', 'Yazar ve tarih belli.', 'Asıl araştırmaya ulaşılabiliyor.']
        },
        {
            id: 'mizah', tur: 'sahte', bicim: 'site', kaynak: 'Gülmece Haber', adres: 'gulmecehaber.com', tarih: '2 Ekim 2026',
            baslik: 'Ödevleri yapan robot icat edildi, öğretmenler şaşkın',
            metin: 'Bir öğrencinin icat ettiği robot bütün ödevleri 3 saniyede bitiriyor. Robot ayrıca öğretmenlere "ödev vermeyin" diye mektup yazmış. [[mizah|Bu sitedeki haberler tamamen mizah amaçlıdır ve gerçek değildir.]]',
            gorsel: { emoji: '🤖', yazi: 'Ödev yapan robot (çizim)' },
            arac: { kaynak: 'Başka hiçbir haber sitesinde yok. Site "Hakkımızda" sayfasında kendini mizah sitesi olarak tanıtıyor.', gorsel: 'Görsel bir çizim, gerçek fotoğraf değil.' },
            ipuclari: { mizah: 'Bu bir mizah (şaka) sitesi! Mizah haberleri gerçek sanılıp paylaşılınca yanlış bilgi yayılır. Sitenin kim olduğuna bak.' }
        },
        {
            id: 'tik', tur: 'sahte', bicim: 'site', kaynak: 'Oyun Gündemi', adres: 'oyungundemi.net', tarih: '2 Ekim 2026',
            baslik: '[[baslik|Dünyaca ünlü oyun KAPANIYOR!]]',
            metin: 'Oyunun yapımcı şirketi, sunucularda bakım yapılacağı için [[icerik|yarın saat 10.00–12.00 arasında oyuna 2 saat ara verileceğini]] duyurdu.',
            gorsel: { emoji: '🎮', yazi: 'Oyun logosu' },
            arac: { kaynak: 'Oyun şirketinin duyurusunda sadece 2 saatlik bakım var.', gorsel: 'Logo oyunun resmî logosu.' },
            ipuclari: {
                baslik: 'Başlık, haberin içeriğiyle uyuşmuyor. Tıklanma almak için abartılmış başlığa "tık tuzağı" denir.',
                icerik: 'Asıl haber: sadece 2 saatlik bakım. Haberi başlığına göre değil, tamamını okuyarak değerlendir.'
            }
        },
        {
            id: 'ruzgar', tur: 'guvenilir', bicim: 'site', kaynak: 'Yeşilvadi Valiliği', adres: 'yesilvadi.gov.tr', tarih: '3 Ekim 2026 · Duyurular',
            baslik: 'Kuvvetli rüzgâr uyarısı',
            metin: 'Meteoroloji verilerine göre yarın 14.00–20.00 saatleri arasında ilimizde kuvvetli rüzgâr bekleniyor. Vatandaşlarımızın çatı uçması ve ağaç devrilmesi gibi durumlara karşı dikkatli olması rica olunur.',
            gorsel: { emoji: '🌬️', yazi: 'Rüzgâr haritası' },
            arac: { kaynak: 'Meteoroloji\'nin sitesinde ve yerel haberlerde aynı uyarı var.', gorsel: 'Harita meteorolojinin resmî haritası.' },
            iyi: ['Resmî kurumun kendi sitesi (.gov.tr).', 'Bilginin nereden geldiği yazıyor.', 'Saat ve tarih net.', 'Paniğe sürüklemeden ne yapılacağını söylüyor.']
        },
        {
            id: 'taklit', tur: 'sahte', bicim: 'site', kaynak: 'Yeşilvadi Gazetesi', adres: '[[taklit|yesilvadi-gazetesi.click]]', tarih: '3 Ekim 2026',
            baslik: 'Kent kütüphanesi kapatılıyor, bütün kitaplar satılacak',
            metin: 'Kütüphanenin yarın kapanacağı ve kitapların internetten satılacağı öğrenildi. [[link|Kitapları ucuza almak için hemen tıkla.]]',
            gorsel: { emoji: '📚', yazi: 'Kütüphane rafları' },
            arac: { kaynak: '[[gercek|Gazetenin gerçek sitesinde (yesilvadigazetesi.com.tr) böyle bir haber yok; kütüphane aynı gün yeni atölye açtığını duyurmuş.]]', gorsel: 'Tersine görsel arama: Fotoğraf gerçek gazeteden kopyalanmış.' },
            ipuclari: {
                taklit: 'Gerçek gazetenin adresine benziyor ama değil: tire ve ".click" eklenmiş. Taklit site!',
                link: 'Haberin sonunda seni bir satış/oltalama sayfasına götürmek isteyen bağlantı var.',
                gercek: 'Gerçek kaynak bu haberi yalanlıyor.'
            }
        }
    ];

    // ---------- Reklamı Yakala ----------
    const REKLAMLAR = [
        {
            id: 'kulaklik', tur: 'reklam', hesap: '@oyuncu_deniz', avatar: '🎧',
            metin: 'Bu kulaklıkla oyunlarda resmen her adımı duyuyorum 🎧🔥 Siz de mutlaka alın! [[etiket|#işbirliği]] [[kod|DENIZ20 koduyla %20 indirim]]',
            ipuclari: { etiket: '"#işbirliği" etiketi bu paylaşım için para ya da ürün alındığını gösterir.', kod: 'İndirim kodu: fenomen her satıştan pay alıyor olabilir.' }
        },
        {
            id: 'cizim', tur: 'normal', hesap: '@ayse_cizer', avatar: '🎨',
            metin: 'Bugün tabletimde yaptığım ilk dijital çizim 🎨 Renkler sizce nasıl olmuş?',
            aciklama: 'Bir şey satmıyor, marka adı ya da bağlantı yok. Kendi çalışmasını paylaşıyor.'
        },
        {
            id: 'sponsor', tur: 'reklam', hesap: 'SüperTab', avatar: '📱', ust: '[[sponsor|Sponsorlu]]',
            metin: 'SüperTab X: Okul için en iyi tablet! [[firsat|Sadece bu hafta 1.000 TL indirim!]]',
            ipuclari: { sponsor: '"Sponsorlu" yazısı bunun parayla gösterilen bir reklam olduğunu söyler. Bazen çok küçük yazılır.', firsat: '"Sadece bu hafta" gibi süre baskısı satın almaya acele ettirir.' }
        },
        {
            id: 'telefon', tur: 'reklam', hesap: '@teknoloji_kerem', avatar: '📸',
            metin: 'Yıllardır kullandığım EN İYİ telefon bu, başka marka alan pişman olur! 📱 [[link|Satın alma linki profilimde 👆]] [[hediye|(Telefonu firma hediye etti)]]',
            ipuclari: { link: 'Satın alma bağlantısı: tıklayıp alanlar olursa paylaşan kişi para kazanabilir.', hediye: 'Ürün hediye edilmiş. Hediye ürün tanıtmak da reklamdır ve açıkça belirtilmelidir.' }
        },
        {
            id: 'atolye', tur: 'normal', hesap: '@yesilvadi_kutuphane', avatar: '📚',
            metin: 'Cumartesi 10.00\'da kodlama atölyemiz var. Katılım ücretsiz, herkesi bekleriz! 🤖',
            aciklama: 'Bir kurumun ücretsiz etkinlik duyurusu. Ürün satmıyor, para istemiyor.'
        },
        {
            id: 'arama', tur: 'reklam', hesap: 'Arama sonuçları', avatar: '🔎', ust: 'Aranan: "oyun elması nasıl kazanılır"',
            metin: '[[reklam|Reklam]] · elmas-ucuz.shop — Ucuz elmas al, hemen hesabına yüklensin! ⬇ — Oyun Rehberi: Elmas kazanmanın 5 güvenli yolu',
            ipuclari: { reklam: 'Arama sonuçlarının en üstündeki "Reklam" yazılı sonuçlar parayla oraya konmuştur; en doğru sonuç oldukları anlamına gelmez.' }
        },
        {
            id: 'paket', tur: 'reklam', hesap: 'Oyun içi bildirim', avatar: '💎',
            metin: '[[ozel|Sana özel teklif!]] Süper Paket 49,99 TL [[sure|⏰ Sadece 09:59 dakika kaldı!]] [[kutu|Şanslıysan efsane kılıç çıkabilir!]]',
            ipuclari: { ozel: '"Sana özel" denmesi seni özel hissettirip satın aldırmak için.', sure: 'Geri sayım sayacı acele ettirir; çoğu zaman teklif sonra yine çıkar.', kutu: 'Şans kutuları (ganimet kutusu) kumara benzer: ne çıkacağı belli değil.' }
        },
        {
            id: 'python', tur: 'normal', hesap: '@mert.kodluyor', avatar: '🐍',
            metin: 'Python ile ilk oyunumu yaptım! Kodlarını herkes kullanabilsin diye paylaşıyorum 🐍',
            aciklama: 'Kendi projesini ücretsiz paylaşıyor. Bir ürün ya da marka tanıtımı yok.'
        },
        {
            id: 'yemek', tur: 'reklam', hesap: '@lezzet_avcisi', avatar: '🍔',
            metin: 'Bu hamburgerciyi denediniz mi? Bayıldım! 😍 [[konum|📍 Burger Durağı]] [[reklamiz|#reklam]]',
            ipuclari: { reklamiz: '"#reklam" etiketi açıkça yazılmış. Dürüst fenomenler reklamı böyle belirtir.', konum: 'Belirli bir işletmenin adı ve konumu öne çıkarılmış.' }
        }
    ];

    // ---------- Dijital Ayak İzi ----------
    const PROFILLER = [
        {
            id: 'ece', ad: '@ece.2014', avatar: '🌸',
            bio: 'Ece 🌸 | [[okul|Yeşilvadi Ortaokulu 6-B]] | Doğum günüm: [[dogum|12.05.2014]] 🎂',
            gonderiler: [
                'Yeni evimizin önündeyiz! 🏠 [[adres|Çınar Sokak No: 7, Yeşilvadi]]',
                'Kedim Pamuk bugün çok tatlıydı 😻',
                'Her salı ve perşembe [[rutin|saat 17.00\'de yüzme kursundayım]] 🏊',
                '[[tatil|Yarın 2 hafta tatile gidiyoruz, ev boş kalacak]] ✈️',
                'Bugün okulda robot yaptık 🤖 Çok eğlenceliydi!',
                'Yeni telefonum geldi! [[telefon|Beni arayın: 0532 418 27 18]] 📱',
                'Şifremi kimse bilmez, ipucu: [[sifre|kedimin adı + doğum yılım]] 😄'
            ],
            ipuclari: {
                okul: 'Okul ve şube adı, seni gerçek hayatta bulmayı kolaylaştırır.',
                dogum: 'Tam doğum tarihi kimlik doğrulamada ve şifre tahmininde kullanılabilir.',
                adres: 'Ev adresi asla herkese açık paylaşılmamalı.',
                rutin: 'Nerede, ne zaman olacağın tanımadığın biri tarafından bilinmemeli.',
                tatil: 'Evin boş kalacağını duyurmak hırsızlara davetiye çıkarır. Tatil fotoğraflarını dönünce paylaş.',
                telefon: 'Telefon numarası dolandırıcılar ve tanımadığın kişiler tarafından kullanılabilir.',
                sifre: 'Şifre ipucu ve şifre parçaları (evcil hayvan adı, doğum yılı) asla paylaşılmamalı. Üstelik ikisi de profilde zaten yazıyor!'
            }
        },
        {
            id: 'kaan', ad: '@kaan_oyunda', avatar: '🎮',
            bio: 'Kaan | 12 yaş | [[gercekad|Gerçek adım Kaan Yıldız]] | Oyun oynamayı seviyorum',
            gonderiler: [
                'Oyunda sonunda efsane kılıcı aldım! ⚔️',
                '[[ekran|Oyun hesabımın ayarlar ekranı 👇 (kullanıcı adı ve e-posta adresi görünüyor)]]',
                '[[bilet|Konser biletim geldi! 🎫 (biletin barkodu ve koltuk numarası görünüyor)]]',
                'Bu bölümü bir türlü geçemiyorum, ipucu olan var mı? 🤔',
                '[[kart|Annemin kartıyla oyun parası aldım 😅 (kartın ön yüzünün fotoğrafı)]]',
                '[[cikis|Okul 15.30\'da bitiyor, her gün sonra Çamlık Parkı\'nda top oynuyoruz]] ⚽',
                'Hafta sonu kodlama atölyesine gideceğim 🤖'
            ],
            ipuclari: {
                gercekad: 'Oyun profillerinde gerçek ad-soyad yerine takma ad kullan.',
                ekran: 'Ekran görüntülerinde e-posta ve kullanıcı adı gibi hesap bilgileri görünmemeli. Paylaşmadan önce kırp ya da kapat.',
                bilet: 'Barkod kopyalanıp senin yerine kullanılabilir; koltuk numarası nerede olacağını söyler.',
                kart: 'Kart fotoğrafı ile başkaları alışveriş yapabilir. Kart bilgisi asla paylaşılmaz.',
                cikis: 'Her gün aynı saatte nerede olduğunu herkese söylüyor.'
            }
        },
        {
            id: 'zeynep', ad: '@zeynep.okuyor', avatar: '📖',
            bio: 'Kitap kurdu 📚 | Lise 10. sınıf | [[konumacik|📍 Konum paylaşımı: Açık]]',
            gonderiler: [
                'Bu ay okuduğum 3 kitap 📚 En çok bilim kurgu olanı sevdim.',
                '[[kimlik|Öğrenci kartım geldi! 🪪 (T.C. kimlik numaram ve fotoğrafım görünüyor)]]',
                'Kütüphanede ders çalışıyoruz ☕',
                '[[sinav|Arkadaşım Elif\'in sınav sonucunu paylaşıyorum, çok düşük almış 😂]]',
                '[[foto|Evden çektiğim manzara 🌅 (fotoğrafın konum bilgisi silinmemiş)]]',
                'Yazılım kampına kabul edildim! 🎉'
            ],
            ipuclari: {
                konumacik: 'Sürekli açık konum paylaşımı, nerede olduğunu herkese gösterir. Sadece gerektiğinde ve güvendiğin kişilerle aç.',
                kimlik: 'Kimlik numarası, kimlik hırsızlığında kullanılabilir. Belgeleri paylaşırken bilgileri kapat.',
                sinav: 'Başkasının kişisel bilgisini izinsiz paylaşmak hem kırıcıdır hem de onun dijital ayak izine zarar verir.',
                foto: 'Fotoğrafların içinde çekildiği yerin konumu (GPS bilgisi) saklı olabilir. Paylaşmadan önce konum bilgisini kapat.'
            }
        }
    ];

    // ---------- Siber Zorbalık ----------
    // puan: 2 en iyi, 1 kısmen doğru, 0 yanlış
    const ZORBALIK = [
        {
            id: 'grup', baslik: 'Sınıf grubu',
            sohbet: [['Burak', '😂😂 Şu Can\'ın fotoğrafına bakın! [düzenlenmiş komik fotoğraf]'], ['Selin', '😂😂😂'], ['Mert', 'Ahahaha efsane']],
            soru: 'Sınıf grubunda bir arkadaşınızla alay eden bir fotoğraf paylaşıldı. Ne yaparsın?',
            secenekler: [
                ['Ben de gülen emoji atarım, herkes atıyor.', 0, 'Gülmek ya da beğenmek zorbalığa katılmaktır. Can bu mesajları görünce yalnız hissedecek.'],
                ['Hiçbir şey yapmam, beni ilgilendirmez.', 1, 'Katılmaman iyi ama sessiz kalan izleyiciler zorbalığın sürmesine izin verir.'],
                ['Katılmam; Can\'a özelden destek mesajı atarım ve öğretmenime haber veririm.', 2, 'Harika! Zorbalığa ortak olmadın, arkadaşına yalnız olmadığını gösterdin ve bir yetişkinden yardım istedin.'],
                ['Burak\'a grupta hakaret ederim.', 0, 'Kızgınlığın anlaşılır ama hakaret ortamı daha da kötüleştirir. Sakin kal, yetişkinden yardım iste.']
            ]
        },
        {
            id: 'yabanci', baslik: 'Oyun sohbeti',
            sohbet: [['YıldızOyuncu99', 'Selam! Sen çok iyi oynuyorsun 😊 Ben de 12 yaşındayım.'], ['YıldızOyuncu99', 'Sana 5.000 bedava elmas verebilirim. Bir fotoğrafını atar mısın?'], ['YıldızOyuncu99', 'Ama ailene söyleme, aramızda kalsın 🤫']],
            soru: 'Oyunda tanımadığın biri yukarıdaki mesajları atıyor. Ne yaparsın?',
            secenekler: [
                ['Fotoğrafımı atarım, elmaslar çok işime yarar.', 0, 'Asla! İnternette tanımadığın biri yaşını yalan söylüyor olabilir. Hediye vaadi ve "kimseye söyleme" çok tehlikeli işaretler.'],
                ['Fotoğraf atmam ama konuşmaya devam ederim.', 0, 'Bu kişi seni kandırmaya çalışıyor. Konuşmaya devam etmek riskli.'],
                ['Konuşmayı keserim, kişiyi engeller ve bildiririm, aileme anlatırım.', 2, 'Doğru! "Aramızda kalsın" diyen bir yabancı mutlaka bir yetişkine anlatılmalı. Sen hiçbir şekilde suçlu değilsin.'],
                ['Bir arkadaşıma sorarım, o ne derse onu yaparım.', 1, 'Paylaşmak iyi ama bu durumda mutlaka bir yetişkine anlatmalısın.']
            ]
        },
        {
            id: 'sahtehesap', baslik: 'Sahte hesap',
            sohbet: [['Arkadaşın Defne', 'Senin adınla bir hesap açılmış, fotoğrafını da koymuşlar!'], ['Arkadaşın Defne', 'Herkese kötü mesajlar atıyor, sen sanıyorlar 😟']],
            soru: 'Biri senin adına sahte bir hesap açmış. Ne yaparsın?',
            secenekler: [
                ['Ekran görüntüsü alır, platforma "taklit hesap" olarak bildirir, aileme ve öğretmenime anlatırım.', 2, 'Doğru! Kanıt topla, platforma bildir ve bir yetişkinden destek al. Gerekirse arkadaşlarına durumu açıkla.'],
                ['Ben de onun adına sahte hesap açarım.', 0, 'İntikam, sorunu büyütür ve seni de suçlu durumuna düşürür.'],
                ['Hesabın şifresini tahmin edip girmeye çalışırım.', 0, 'Başkasının hesabına izinsiz girmeye çalışmak suçtur.'],
                ['Görmezden gelirim, kendiliğinden kapanır.', 0, 'Sahte hesap kendiliğinden kapanmaz ve adına zarar vermeye devam eder.']
            ]
        },
        {
            id: 'kirici', baslik: 'Özel mesajlar',
            sohbet: [['Bilinmeyen hesap', 'Sen çok çirkinsin, kimse seni sevmiyor.'], ['Bilinmeyen hesap', 'Okula gelme bence 😈'], ['Bilinmeyen hesap', 'Neden cevap vermiyorsun?']],
            soru: 'Birkaç gündür sana kırıcı mesajlar geliyor. Ne yaparsın?',
            secenekler: [
                ['Ben de ona daha kötü şeyler yazarım.', 0, 'Zorbalar tepki almak ister. Cevap vermek zorbalığı uzatır.'],
                ['Mesajları siler, unutmaya çalışırım.', 1, 'Silersen kanıt kaybolur ve yaşadıklarını kimse bilmez. Yalnız taşımak zorunda değilsin.'],
                ['Cevap vermem; ekran görüntüsü alır, engeller ve güvendiğim bir yetişkine anlatırım.', 2, 'En doğrusu bu: cevap verme, kanıtı sakla, engelle ve yardım iste. Söylenenler senin hakkında doğru değil.']
            ]
        },
        {
            id: 'utanc', baslik: 'Arkadaşından mesaj',
            sohbet: [['Arkadaşın Kerem', 'Bak Ayşe\'nin kantinde düştüğü videosu 😂'], ['Arkadaşın Kerem', 'Herkese yolla!']],
            soru: 'Arkadaşın, başka birinin utanç verici bir videosunu yaymanı istiyor. Ne yaparsın?',
            secenekler: [
                ['Herkese yollarım.', 0, 'Bir kez yayılan video geri alınamaz. Bunu yayan herkes zorbalığa ortak olur.'],
                ['Sadece en yakın arkadaşıma yollarım.', 0, '"Sadece bir kişi" de olsa video yayılmaya başlar.'],
                ['Yollamam; Kerem\'e silmesini söyler, yayılıyorsa bir yetişkine haber veririm.', 2, 'Doğru! İzinsiz video paylaşmak kırıcıdır ve yasal sorun da yaratabilir.']
            ]
        },
        {
            id: 'oyunici', baslik: 'Takım sohbeti',
            sohbet: [['Takım arkadaşı', 'Ege yine kaybettirdi, işe yaramazsın!'], ['Takım arkadaşı', 'Ege oyunu bırak bence 🤡'], ['Ege', '...']],
            soru: 'Oyunda takım arkadaşın Ege\'yi sürekli aşağılıyor. Ne yaparsın?',
            secenekler: [
                ['Ege\'ye "boş ver, iyi oynadın" yazar, aşağılayan oyuncuyu oyunda bildiririm.', 2, 'Harika! Hem Ege\'ye destek oldun hem de kural ihlalini bildirdin.'],
                ['Ben de güler emoji atarım.', 0, 'Bu, zorbaya destek vermek demektir.'],
                ['Oyundan çıkarım.', 1, 'Kendini korumak iyidir ama Ege\'ye destek olmak ve bildirmek daha da iyi olurdu.']
            ]
        },
        {
            id: 'saka', baslik: 'Senin mesajın',
            sohbet: [['Sen', 'Çok kötü oynuyorsun yaa 😂'], ['Arkadaşın Ali', 'Bunu bilmiyordum... Tamam bir daha oynamam.']],
            soru: 'Şaka olsun diye yazdığın mesaj arkadaşını üzdü. Ne yaparsın?',
            secenekler: [
                ['"Şakaydı, alınma" derim, o kadar.', 1, 'Yazılı mesajlarda ses tonu ve yüz ifadesi görünmez. Şaka sandığın şey kırıcı olabilir.'],
                ['Özür dilerim ve neden üzüldüğünü anlamaya çalışırım.', 2, 'Doğru! Özür dilemek güçlü bir davranıştır. Bir dahaki sefere yazmadan önce "bunu yüzüne söyler miydim?" diye düşün.'],
                ['Hiçbir şey yazmam, kendiliğinden geçer.', 0, 'Sessiz kalmak arkadaşını daha da üzebilir.']
            ]
        },
        {
            id: 'yorum', baslik: 'Video yorumları',
            sohbet: [['yorumcu_1', 'Bu ne ya berbat 👎'], ['yorumcu_2', 'Sesin çok kötü'], ['yorumcu_3', 'Kanalını kapat 😂']],
            soru: 'Paylaştığın videoya çok sayıda kötü yorum geliyor. Ne yaparsın?',
            secenekler: [
                ['Hepsine tek tek cevap yazıp tartışırım.', 0, 'Tartışmak daha fazla kötü yorum çeker.'],
                ['Yorumları kısıtlar ya da kapatır, hakaret içerenleri bildirir, bir yetişkinle konuşurum.', 2, 'Doğru! Platformların koruma ayarlarını kullan. Kötü yorumlar senin değerini belirlemez.'],
                ['Hesabımı silip bir daha hiçbir şey paylaşmam.', 1, 'Mola vermek iyi olabilir ama önce yardım istemek ve koruma ayarlarını kullanmak daha iyi.']
            ]
        }
    ];

    // ---------- Telif ve Lisans ----------
    const LISANSLAR = {
        'CC0': { ad: 'CC0 (Kamu malı)', renk: '#16a36a', aciklama: 'Herkes, her amaçla, izin ve atıf olmadan kullanabilir.' },
        'CC BY': { ad: 'CC BY', renk: '#1d5fd6', aciklama: 'Her amaçla kullanılabilir, değiştirilebilir. Yapanın adını (atıf) yazmak zorunlu.' },
        'CC BY-SA': { ad: 'CC BY-SA', renk: '#0891b2', aciklama: 'Atıf yaparak kullanılabilir. Değiştirip paylaşırsan senin eserin de aynı lisansla paylaşılmalı (SA = Aynı lisansla paylaş).' },
        'CC BY-NC': { ad: 'CC BY-NC', renk: '#8b5cf6', aciklama: 'Atıf yaparak kullanılabilir ama para kazanılan (ticari) işlerde kullanılamaz (NC = Ticari değil).' },
        'CC BY-ND': { ad: 'CC BY-ND', renk: '#f59e0b', aciklama: 'Atıf yaparak olduğu gibi kullanılabilir ama değiştirilemez (ND = Türev yok).' },
        'CC BY-NC-SA': { ad: 'CC BY-NC-SA', renk: '#a855f7', aciklama: 'Ticari olmayan işlerde atıfla kullanılabilir; değiştirirsen aynı lisansla paylaşmalısın.' },
        'CC BY-NC-ND': { ad: 'CC BY-NC-ND', renk: '#db2777', aciklama: 'En kısıtlı CC lisansı: atıfla, ticari olmayan işlerde, değiştirmeden kullanılabilir.' },
        '©': { ad: '© Tüm hakları saklıdır', renk: '#e5484d', aciklama: 'Sahibinden izin almadan kullanılamaz.' }
    };
    const KAYNAKLAR = [
        { id: 'gunbatimi', ad: 'Gün batımı fotoğrafı', emoji: '🌅', sahip: 'Ayla Demir', lisans: 'CC BY' },
        { id: 'piyano', ad: 'Neşeli piyano müziği', emoji: '🎹', sahip: 'Murat Er', lisans: 'CC BY-NC' },
        { id: 'kedi', ad: 'Kedi çizimi', emoji: '🐱', sahip: 'Deniz Ak', lisans: 'CC0' },
        { id: 'harita', ad: 'Dünya haritası', emoji: '🗺️', sahip: 'Açık Harita Topluluğu', lisans: 'CC BY-SA' },
        { id: 'rock', ad: 'Popüler bir şarkı', emoji: '🎸', sahip: 'Bir plak şirketi', lisans: '©' },
        { id: 'uzay', ad: 'Uzay fotoğrafı', emoji: '🪐', sahip: 'Gözlemevi Kulübü', lisans: 'CC BY-ND' },
        { id: 'kapi', ad: 'Kapı sesi efekti', emoji: '🚪', sahip: 'Ses Arşivi', lisans: 'CC0' },
        { id: 'ikon', ad: 'Robot ikonları', emoji: '🤖', sahip: 'Elif Tasarım', lisans: 'CC BY-NC-SA' },
        { id: 'film', ad: 'Bir film sahnesi', emoji: '🎬', sahip: 'Bir film şirketi', lisans: '©' },
        { id: 'orman', ad: 'Orman fotoğrafı', emoji: '🌲', sahip: 'Can Yeşil', lisans: 'CC BY-NC-ND' },
        { id: 'davul', ad: 'Davul ritmi', emoji: '🥁', sahip: 'Ritim Atölyesi', lisans: 'CC BY' },
        { id: 'logo', ad: 'Ünlü bir markanın logosu', emoji: '™️', sahip: 'Bir şirket', lisans: '©' }
    ];
    const SENARYOLAR = [
        { id: 'sunum', metin: 'Okul ödevin için hazırladığın sunumda görseli <b>olduğu gibi</b> kullanacaksın.', ticari: false, degistir: false },
        { id: 'afis', metin: 'Okul etkinliği afişi yapıyorsun: görseli <b>kırpıp üstüne yazı ekleyeceksin</b>.', ticari: false, degistir: true },
        { id: 'tisort', metin: 'Satacağın tişörtlere görseli <b>olduğu gibi</b> basacaksın.', ticari: true, degistir: false },
        { id: 'kanal', metin: 'Reklamdan <b>para kazanan</b> video kanalında, müziği <b>kesip videona göre düzenleyeceksin</b>.', ticari: true, degistir: true },
        { id: 'site', metin: 'Okulunun ücretsiz web sitesinde, görselleri <b>birleştirip yeni bir çizim</b> yapacaksın.', ticari: false, degistir: true },
        { id: 'oyun', metin: 'Uygulama mağazasında <b>satılacak</b> oyununda sesi <b>olduğu gibi</b> kullanacaksın.', ticari: true, degistir: false }
    ];
    // Bir lisans bu kullanıma izin veriyor mu?
    function kullanilabilir(lisans, s) {
        if (lisans === '©') return false;
        if (s.ticari && /NC/.test(lisans)) return false;
        if (s.degistir && /ND/.test(lisans)) return false;
        return true;
    }
    function nedeni(lisans, s) {
        if (lisans === '©') return 'Tüm hakları saklı: sahibinden izin almadan kullanamazsın.';
        if (s.ticari && /NC/.test(lisans)) return 'NC: ticari (para kazanılan) işlerde kullanılamaz.';
        if (s.degistir && /ND/.test(lisans)) return 'ND: değiştirilemez, sen ise değiştireceksin.';
        if (lisans === 'CC0') return 'CC0: serbestçe kullanabilirsin (yine de kaynağı yazmak güzel bir davranıştır).';
        return `Kullanabilirsin ama yapanın adını yazmalısın (atıf).${/SA/.test(lisans) && s.degistir ? ' Değiştirdiğin için eserini de aynı lisansla paylaşmalısın.' : ''}`;
    }
    const atif = (k) => `"${k.ad}" — ${k.sahip}, ${k.lisans} lisansıyla`;

    // ---------- Yardımcılar ----------
    // Metni parçalara ayırır: ipucu parçaları {id, metin}, diğerleri cümle/öbek parçaları {metin}
    function parcala(metin) {
        const sonuc = [];
        String(metin).split(/(\[\[\w+\|[^\]]+\]\])/).forEach(p => {
            const m = p.match(/^\[\[(\w+)\|([^\]]+)\]\]$/);
            if (m) { sonuc.push({ id: m[1], metin: m[2] }); return; }
            // Cümle sonlarından ve virgüllerden böl; boşlukları koru
            (p.match(/[^.!?,]+[.!?,]*\s*|\s+/g) || []).forEach(x => { if (x) sonuc.push({ metin: x }); });
        });
        return sonuc;
    }
    // Bir öğedeki bütün ipucu kimlikleri (metin alanlarında geçen)
    function ipucuIdleri(...metinler) {
        const s = new Set();
        metinler.flat().filter(Boolean).forEach(m => { for (const x of String(m).matchAll(/\[\[(\w+)\|/g)) s.add(x[1]); });
        return [...s];
    }
    const haberMetinleri = (h) => [h.adres, h.baslik, h.metin, h.arac && h.arac.kaynak, h.arac && h.arac.gorsel];
    const reklamMetinleri = (r) => [r.ust, r.metin];
    const profilMetinleri = (p) => [p.bio, ...p.gonderiler];
    const yildiz = (hata) => hata === 0 ? 3 : hata <= 2 ? 2 : 1;

    const api = { BOLUMLER, HABERLER, REKLAMLAR, PROFILLER, ZORBALIK, LISANSLAR, KAYNAKLAR, SENARYOLAR, kullanilabilir, nedeni, atif, parcala, ipucuIdleri, haberMetinleri, reklamMetinleri, profilMetinleri, yildiz };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Dijital = api;
})(typeof window !== 'undefined' ? window : globalThis);
