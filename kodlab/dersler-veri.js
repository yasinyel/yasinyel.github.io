// Kodlayalım — Ders planları (40 dakikalık ders için önerilen akış)
// Her plan katalogdaki bir etkinliğe bağlıdır; kagit: ilgili bilgisayarsız çalışma kağıdı.
(function (root) {
    'use strict';
    const PLANLAR = {
        klavye: {
            hedefler: ['Parmaklarını ana sıraya doğru yerleştirir.', 'Her tuşa doğru parmakla basar.', 'Klavyeye bakmadan, doğruluğunu koruyarak yazar.'],
            giris: 'İki parmakla ve on parmakla yazan iki kişinin videosunu ya da canlı gösterimini karşılaştırın: "Hangisi daha hızlı, neden?"',
            isinma: 'Masaya kâğıttan bir klavye çizip parmakları ana sıraya (a s d f — j k l ş) koyma alıştırması yapın; f ve j tuşlarındaki çıkıntıları gösterin.',
            adimlar: ['Öğrenciler sırayla derslere başlasın; ekrandaki renkli parmak rehberini kullansınlar.', 'Doğruluğun hızdan önemli olduğunu vurgulayın: 3 yıldız için en az %97 doğruluk gerekir.', 'Son 10 dakikada Kelime Yağmuru oyunuyla sınıf içi dostça bir yarışma yapın.'],
            tartisma: ['Klavyeye bakmadan yazmak neden zor ama faydalı?', 'Hangi parmağın en çok zorlandı?', 'Doğru oturuş ve ekrana uzaklık neden önemli?'],
            cikis: 'Hız testinde ulaştığınız kelime/dakika ve doğruluk değerini kâğıda yazın; bir sonraki derste karşılaştıracağız.',
            destek: 'İlk dersleri tekrarlatın; ekran klavyesindeki renkli ipuçlarını açık tutun.',
            zenginlestirme: 'Büyük harf, noktalama ve rakam derslerine geçip hız testinde rekor denemesi yapsınlar.'
        },
        oruntu: {
            hedefler: ['Tekrar eden bir örüntüyü fark eder.', 'Örüntünün devamını tahmin eder.', 'Kendi örüntüsünü oluşturur.'],
            giris: 'Sınıfta alkış-şaplak ritmi yapın (alkış, alkış, dizine vur…). "Sırada ne var?" diye sorun.',
            isinma: 'Öğrencileri kırmızı-mavi-kırmızı-mavi gibi giysi renklerine göre sıraya dizin; sıradaki kişiyi tahmin ettirin.',
            adimlar: ['Etkinliği akıllı tahtada birlikte açın, ilk soruyu sesli düşünerek çözün.', 'Öğrenciler sırayla tahtaya gelip bir soruyu çözsün; sınıf "neden?" diye sorsun.', 'İkili gruplar boya kalemleriyle kâğıda kendi örüntülerini çizsin, karşı grup devamını bulsun.'],
            tartisma: ['Örüntüyü nasıl fark ettin?', 'Günlük hayatta hangi örüntüler var? (trafik ışığı, mevsimler, günler)', 'Bilgisayar örüntüleri neden sever?'],
            cikis: 'Elinizle bir örüntü gösterin (yumruk-açık-yumruk-açık); devamını herkes göstersin.',
            destek: 'İki ögeli örüntülerle başlayın, somut nesneler (bloklar) kullanın.',
            zenginlestirme: 'Üç ögeli ve büyüyen örüntüler (1, 2, 3 kare) oluşturmalarını isteyin.'
        },
        sensin: {
            hedefler: ['Bir programı adım adım izler (kod izleme).', 'Komutları sırayla uygulamanın önemini açıklar.', 'Yönleri ve tekrarları doğru yorumlar.'],
            giris: '"Bilgisayar düşünebilir mi?" diye sorun. Bilgisayarın sadece verilen komutları sırayla yaptığını vurgulayın.',
            isinma: 'Bir öğrenci "robot" olsun, diğerleri ona sadece "1 adım ileri, sağa dön" gibi komutlar versin. Komut yanlışsa robot yine de onu yapar!',
            adimlar: ['Seviyeye uygun kademeyi seçin (okul öncesi: oklar, ilkokul: bloklar, ortaokul: Türkçe kod, lise: Python).', 'İlk görevi birlikte yapın: kodu okuyun, parmakla izleyin, sonra ok tuşlarıyla karakteri yürütün.', 'Öğrenciler kendi hızlarında ilerlesin; takılanlar kodu sesli okusun.', 'Hata yapınca "bilgisayar burada ne yaptı?" sorusunu sorun.'],
            tartisma: ['Tek bir komutu atlarsak ne olur?', 'Tekrar (döngü) bloğu işimizi nasıl kolaylaştırdı?', 'Bilgisayar sen olsaydın en çok neyde zorlanırdın?'],
            cikis: 'Tahtaya 3 komutluk bir program yazın; öğrenciler karakterin nereye gideceğini kâğıda çizsin.',
            destek: 'Az adımlı görevler ve fiziksel yön kartları kullanın.',
            zenginlestirme: 'Bir üst kademenin kod gösterimini deneyin (blok → Türkçe → Python).',
            kagit: 'robot'
        },
        piksel: {
            hedefler: ['Bir resmin sayılarla nasıl saklandığını açıklar.', 'Satır kodlarını çözerek resim oluşturur.', 'Sıkıştırmanın neden gerektiğini tartışır.'],
            giris: 'Bir fotoğrafı çok büyütün ve küçük karelerin (piksellerin) görünmesini sağlayın.',
            isinma: 'Piksel Resim çalışma kağıdını dağıtın; öğrenciler sayılardan resmi boyasın.',
            adimlar: ['Kâğıttaki resmi birlikte kontrol edin: kim hangi resmi buldu?', 'Etkinliğe geçin: önce kodu çözüp resmi oluşturun, sonra bir resmi koda çevirin.', 'İkililer birbirine gizli resim kodu yazıp göndersin.'],
            tartisma: ['Neden ilk sayı beyazı gösteriyor?', 'Tamamen siyah bir satır nasıl kodlanır?', 'Renkli resimler nasıl saklanıyor olabilir?'],
            cikis: '"0, 2, 2, 2, 2" kodunun 8 karelik satırını çizin.',
            destek: '5×5 küçük ızgarayla başlayın.',
            zenginlestirme: 'Hangi resimlerde bu yöntemin yer kazandırmadığını bulup açıklasınlar.',
            kagit: 'piksel'
        },
        robot: {
            hedefler: ['Sıralı komutlardan oluşan program yazar.', 'Döngü ve koşul kullanarak programını kısaltır.', 'Programını test eder ve düzeltir.'],
            giris: 'Sınıfta bir öğrenciyi kapıdan masasına "programla" götürün. En kısa program hangisi?',
            isinma: 'Robot Yolu çalışma kağıdının 1. bulmacasını yapın.',
            adimlar: ['İlk seviyeyi birlikte yapın; "Çalıştır"dan önce tahmin ettirin.', 'Öğrenciler seviyelerde ilerlesin; 3 yıldız için en kısa programı arasınlar.', 'Döngü seviyesine gelince "Aynı komutu kaç kez yazdın?" diye sorun.'],
            tartisma: ['Programın neden çalışmadı? Nasıl buldun?', 'Döngü programı nasıl kısalttı?', 'Labirentte "sağ eli duvarda tut" kuralı her zaman işe yarar mı?'],
            cikis: 'Tahtadaki ızgara için en kısa ok programını kâğıda yazın.',
            destek: 'Akran eşliği yapın: biri sürücü, biri yol gösterici.',
            zenginlestirme: 'Fonksiyon seviyelerini ve labirent algoritmasını deneyin.',
            kagit: 'robot'
        },
        hata: {
            hedefler: ['Programın beklenen ve gerçek davranışını karşılaştırır.', 'Hatanın yerini sistematik biçimde bulur.', 'Hata ayıklamanın programlamanın doğal parçası olduğunu açıklar.'],
            giris: '"Hata yapmayan programcı yoktur" — ilk bilgisayar böceği (bug) hikâyesini anlatın.',
            isinma: 'Hata Avcısı çalışma kağıdını dağıtın.',
            adimlar: ['Kâğıttaki hatalı adımları birlikte kontrol edin: kim nasıl buldu?', 'Etkinlikte hatalı programları çalıştırın, beklenenle karşılaştırın.', 'Her hatada "hangi satır, ne olmalıydı, neden?" üçlüsünü yazdırın.'],
            tartisma: ['Hatayı bulmak için hangi stratejiyi kullandın? (baştan izleme, ortadan bölme…)', 'En sık hangi hatayı yaptınız?', 'Hata ayıklarken sabırlı olmak neden önemli?'],
            cikis: 'Tahtadaki 4 satırlık programdaki hatayı bulun.',
            destek: 'Programı birlikte satır satır sesli okuyun.',
            zenginlestirme: 'Arkadaşları için hatalı program yazsınlar.',
            kagit: 'hata'
        },
        ikilik: {
            hedefler: ['Bilgisayarın sayıları 0 ve 1 ile sakladığını açıklar.', 'Onluk sayıları ikiliğe ve ikilik sayıları onluğa çevirir.', 'Bit ve bayt kavramlarını tanımlar.'],
            giris: '5 öğrenciye 16, 8, 4, 2, 1 noktalı kartlar verin; tahtaya sayı yazın, doğru kartlar yüzünü çevirsin.',
            isinma: 'İkilik Sayılar çalışma kağıdının ilk bölümünü yapın.',
            adimlar: ['Etkinlikte kartları açıp kapatarak sayılar oluşturun.', 'Hız turları yapın: en hızlı ikilik çeviri kimde?', 'Bir harfin (ör. A = 65) ikilik halini bulun.'],
            tartisma: ['Neden kartlar hep iki katına çıkıyor?', 'Bir kart daha ekleseydik en büyük sayı ne olurdu?', 'Bilgisayar neden sadece 0 ve 1 kullanıyor?'],
            cikis: '13 sayısının ikilik halini ve 10110\'un onluk halini yazın.',
            destek: 'Gerçek noktalı kartlarla somut çalışın.',
            zenginlestirme: 'Bir baytla kaç farklı sayı yazılır? Neden?',
            kagit: 'ikilik'
        },
        algoritma: {
            hedefler: ['Arama ve sıralama algoritmalarını adım adım uygular.', 'Farklı algoritmaların adım sayılarını karşılaştırır.', 'İkili aramanın neden hızlı olduğunu açıklar.'],
            giris: 'Telefon rehberinde bir ismi nasıl ararsınız? Baştan mı, ortadan mı?',
            isinma: '"Aklımdan 1–100 arası bir sayı tuttum" oyunu: en az soruyla bulun.',
            adimlar: ['Doğrusal arama ile başlayın, kapalı kartları tek tek açın.', 'İkili aramaya geçin; kaç adımda bulduğunuzu karşılaştırın.', 'Sıralama algoritmalarını sırayla deneyin; adım sayılarını tahtaya yazın.'],
            tartisma: ['Hangi algoritma daha az adım attı? Neden?', 'İkili arama sırasız listede neden çalışmaz?', '1 milyon isim olsaydı fark ne kadar büyürdü?'],
            cikis: '16 sıralı kartta ikili arama en fazla kaç adım sürer?',
            destek: 'Az sayıda kartla (8) başlayın.',
            zenginlestirme: 'Adım sayılarını tablo ve grafiğe dökün.'
        },
        mantik: {
            hedefler: ['VE, VEYA, DEĞİL ve ÖZEL VEYA kapılarının çalışmasını açıklar.', 'Bir devrenin doğruluk tablosunu oluşturur.', 'Kapılardan toplama devresi kurulabileceğini fark eder.'],
            giris: '"Kapı açık VE kart okundu ise turnike açılır" gibi günlük örneklerle başlayın.',
            isinma: 'Mantık Kapıları çalışma kağıdını yapın.',
            adimlar: ['Etkinlikte anahtarları değiştirip lambanın yanmasını gözlemleyin.', 'Her devre için doğruluk tablosunu tamamlayın.', 'Yarım toplayıcıya gelince 1+1=10 (ikilik) bağlantısını kurun.'],
            tartisma: ['VE ile VEYA arasındaki fark nedir?', 'Bilgisayar toplama işlemini nasıl yapıyor olabilir?', 'Günlük hayatta ÖZEL VEYA örneği bulabilir misin? (merdiven lambası)'],
            cikis: 'A=1, B=0 için VE, VEYA ve ÖZEL VEYA çıkışlarını yazın.',
            destek: 'Önce iki girişli tek kapılarla çalışın.',
            zenginlestirme: 'Tam toplayıcı devresini açıklasınlar.',
            kagit: 'mantik'
        },
        cizim: {
            hedefler: ['Blok kodla şekil çizer.', 'Açı ve tekrar ilişkisini (360° ÷ kenar sayısı) keşfeder.', 'İç içe döngü ve fonksiyon kullanır.'],
            giris: 'Tahtaya bir kare çizin: "Bunu bir robota nasıl tarif ederiz?"',
            isinma: 'Bir öğrenci sınıfın ortasında yürüyerek kare çizsin (4 kez: 3 adım ileri, sağa dön).',
            adimlar: ['İlk seviyeleri birlikte yapın; dönüş açısını tartışın.', 'Çokgen seviyelerinde 360 ÷ kenar sayısı kuralını keşfettirin.', 'Desen seviyelerinde iç içe döngü ve fonksiyon kullanın; Python görünümünü gösterin.'],
            tartisma: ['Altıgen için hangi açıyla dönmeliyiz? Neden?', 'Tekrar bloğu kaç satır kod kazandırdı?', 'Fonksiyon nedir, neden kullanırız?'],
            cikis: 'Eşkenar üçgen çizen programı yazın.',
            destek: 'Açıları gönye ya da kâğıt katlayarak gösterin.',
            zenginlestirme: 'Serbest çizimde kendi desenlerini tasarlasınlar.'
        },
        sifre: {
            hedefler: ['Sezar şifresiyle mesaj şifreler ve çözer.', 'Kaba kuvvet ve frekans analizinin nasıl çalıştığını açıklar.', 'Modern şifrelemenin neden güçlü olduğunu tartışır.'],
            giris: 'Tahtaya şifreli bir mesaj yazın; çözen ilk öğrenciye "kriptograf" unvanı verin.',
            isinma: 'Sezar Şifresi çalışma kağıdındaki çarkları kesip kullanın.',
            adimlar: ['Etkinlikte Sezar bölümleriyle başlayın.', 'Kaba kuvvet bölümünde 29 anahtarı denemenin kolaylığını görün.', 'Frekans analizinde Türkçede en sık harfleri (A, E, İ…) kullanın; ileri gruplar Vigenère\'e geçsin.'],
            tartisma: ['Sezar şifresi neden kolay kırılır?', 'Vigenère neden daha güçlü?', 'Bugün internette verilerimiz nasıl korunuyor?'],
            cikis: 'KOD kelimesini anahtar 3 ile şifreleyin.',
            destek: 'Çarkla somut çalışın, kısa kelimeler seçin.',
            zenginlestirme: 'Kendi şifreleme yöntemlerini icat edip arkadaşlarına kırdırsınlar.',
            kagit: 'sifre'
        },
        guvenlik: {
            hedefler: ['Güçlü şifrenin özelliklerini sıralar.', 'Oltalama mesajlarının işaretlerini tanır.', 'Kişisel bilgilerini korumak için doğru davranışları seçer.'],
            giris: '"En çok kullanılan şifre hangisidir?" (123456) sorusuyla başlayın.',
            isinma: 'Sözlü oyun: öğretmen örnek bir şifre söyler, sınıf "güçlü" ya da "zayıf" diye oylar ve nedenini söyler.',
            adimlar: ['Şifre Laboratuvarı\'nda örnek şifrelerin kırılma süresini karşılaştırın (gerçek şifre yazılmamalı!).', 'Oltalama Avı\'nda ipuçlarını bulun; her ipucunu tahtaya listeleyin.', 'Ne Yapmalı? bölümünü sınıfça oylayarak yapın.'],
            tartisma: ['Parola cümlesi neden hem güçlü hem kolay hatırlanır?', 'Bir mesajın oltalama olduğunu en hızlı nasıl anlarsın?', 'Şifremi kimseyle paylaşmamalıyım — en yakın arkadaşım bile mi?'],
            cikis: 'Bir oltalama mesajının 3 işaretini yazın.',
            destek: 'Oltalama ipuçlarını önceden bir kontrol listesi olarak verin.',
            zenginlestirme: 'İki adımlı doğrulamanın nasıl çalıştığını araştırıp anlatsınlar.'
        },
        yz: {
            hedefler: ['Makine öğrenmesinin örneklerden öğrendiğini açıklar.', 'Eğitim verisinin kalitesinin sonucu etkilediğini gösterir.', 'Önyargılı verinin adil olmayan sonuçlara yol açtığını tartışır.'],
            giris: 'Telefonların yüzümüzü nasıl tanıdığını sorun.',
            isinma: 'Öğrencilere 6 hayvan resmi gösterip "kanatlı / kanatsız" diye kendi kurallarını yazdırın.',
            adimlar: ['Uzay Radarı\'nda modeli birlikte eğitin; az ve çok örnekle sonucu karşılaştırın.', 'Önyargı bölümünde tek tip veriyle eğitilen modelin hatalarını gösterin.', 'İleri gruplar k-en yakın komşu bölümünde k değerini değiştirsin.'],
            tartisma: ['Model neden yanıldı?', 'Önyargılı bir yapay zekâ gerçek hayatta kime zarar verebilir?', 'Yapay zekânın kararlarını kim denetlemeli?'],
            cikis: '"Daha fazla veri her zaman daha iyi mi?" sorusunu bir cümleyle yanıtlayın.',
            destek: 'Az özellikli örneklerle başlayın.',
            zenginlestirme: 'Aşırı öğrenme (ezberleme) kavramını kendi örnekleriyle açıklasınlar.'
        },
        ag: {
            hedefler: ['Verinin internette paketlere bölünerek gittiğini açıklar.', 'Yönlendirmenin en kısa yolu nasıl seçtiğini gösterir.', 'DNS ve IP adreslerinin görevini tanımlar.'],
            giris: 'Bir mektubun başka şehre nasıl ulaştığını sorun: postane, ayırma merkezi, kargo…',
            isinma: 'En Kısa Yol çalışma kağıdını yapın.',
            adimlar: ['Paketler bölümünde bir mesajın paketlere ayrılıp yeniden birleşmesini izleyin.', 'Yönlendirme bölümünde bağlantı kopunca yeni yol bulunmasını gözlemleyin.', 'DNS ve IP bölümlerini yapın; okulun sitesinin adresini düşünün.'],
            tartisma: ['Paketler neden farklı yollardan gidebilir?', 'Bir bağlantı kopunca internet neden çökmez?', 'DNS olmasaydı siteleri nasıl açardık?'],
            cikis: 'Bir web sitesine girdiğinizde olan 3 şeyi sırayla yazın.',
            destek: 'Sınıfı ağ gibi dizin; kâğıt paketleri elden ele geçirin.',
            zenginlestirme: 'Dijkstra algoritmasını adım adım tablo ile uygulasınlar.',
            kagit: 'ag'
        },
        web: {
            hedefler: ['HTML etiketleriyle bir sayfanın yapısını oluşturur.', 'CSS ile görünümü değiştirir.', 'Erişilebilirlik için resimlere alt metin yazar.'],
            giris: 'Tarayıcıda herhangi bir sayfanın kaynağını gösterin: "Her site bu yazılardan oluşur."',
            isinma: 'Kâğıda bir sayfa taslağı çizin: başlık, paragraf, resim, liste.',
            adimlar: ['İlk bölümleri birlikte yapın; etiketlerin açılıp kapanmasına dikkat çekin.', 'Görevler kendiliğinden işaretlendikçe öğrenciler ilerlesin.', 'Son bölümde kendi tanıtım sayfalarını tasarlasınlar.'],
            tartisma: ['HTML ile CSS arasındaki fark ne?', 'Alt metin görme engelli kullanıcılar için neden önemli?', 'Bir sitede en çok neyi değiştirmek isterdin?'],
            cikis: 'Bir başlık ve iki maddelik liste içeren HTML kodunu yazın.',
            destek: 'Hazır kod parçalarını değiştirerek başlasınlar.',
            zenginlestirme: 'Flexbox ile kart düzeni oluştursunlar.'
        },
        oyun: {
            hedefler: ['Olay tabanlı programlamayı (tıklanınca, tuşa basılınca, değince) kullanır.', 'Puan ve can için değişken kullanır.', 'Kendi oyununu tasarlayıp paylaşır.'],
            giris: 'Sevdikleri bir oyunun kurallarını üç cümleyle anlatmalarını isteyin.',
            isinma: 'Kâğıda oyun tasarım şablonu: karakterler, amaç, kazanma ve kaybetme koşulu.',
            adimlar: ['Balon Patlat görevini birlikte yapın.', 'Yıldız Avcısı görevlerini sırayla tamamlasınlar; her görevde "Kontrol et"i kullansınlar.', 'Kalan sürede serbest modda kendi oyunlarını yapıp linkini paylaşsınlar.'],
            tartisma: ['Hangi olaylar oyunu başlatıyor?', 'Puan değişkeni olmasaydı ne olurdu?', 'Arkadaşının oyununda neyi geliştirirdin?'],
            cikis: '"Robot yıldıza değince puan 1 artsın" kuralını blok olarak çizin.',
            destek: 'Görev açıklamasındaki ipuçlarını birlikte okuyun.',
            zenginlestirme: 'Seviye, zamanlayıcı ya da yeni düşmanlar ekleyerek oyunu zorlaştırsınlar.'
        },
        devre: {
            hedefler: ['Girdi–işlem–çıktı modelini açıklar.', 'Düğme ve sensör olaylarıyla program yazar.', 'LED ekranda koordinat kullanır.'],
            giris: 'Etrafımızdaki gömülü sistemleri sayın: çamaşır makinesi, akıllı saat, trafik ışığı…',
            isinma: 'Kareli kâğıda 5×5 ızgara çizip kendi ikonlarını tasarlasınlar.',
            adimlar: ['Atan Kalp görevini birlikte yapın; "bekle" olmadan ne olduğunu gösterin.', 'Görevlerde ilerlerken kartı sanal düğme ve kaydırıcılarla test etsinler.', 'Serbest atölyede kendi icatlarını yapsınlar (reaksiyon oyunu, alarm…).'],
            tartisma: ['Termometrede girdi, işlem ve çıktı neler?', '"Sürekli" bloğu neden gerekli?', 'Gerçek bir kartla neler yapabilirdin?'],
            cikis: '"Işık azsa LED\'leri yak" programının bloklarını sıralayın.',
            destek: 'Görev açıklamasındaki ipucu bloklarını birlikte bulun.',
            zenginlestirme: 'İki değişkenli bir oyun (ör. reaksiyon süresi ölçer) tasarlasınlar.'
        },
        veri: {
            hedefler: ['Tablodaki veriyi sıralar ve süzer.', 'Soruya uygun grafik türünü seçer.', 'Ortalama ve ortancayı hesaplayıp yorumlar; yanıltıcı grafikleri tanır.'],
            giris: 'Bir reklamdaki "%90 memnuniyet" ifadesini gösterip "Bu sayıya güvenir misiniz?" diye sorun.',
            isinma: 'Sınıfta el kaldırarak hızlı anket yapın (en sevilen uygulama türü) ve tahtaya çetele tutun.',
            adimlar: ['Kendi Anketin bölümüne ısınmadaki verileri girin; sütun ve pasta grafiği karşılaştırın.', 'Tablo Dedektifi ve Doğru Grafik bölümlerini yapın.', 'Ortaokul ve üstü: Ortalama mı Ortanca mı? ile Yanıltıcı Grafikler bölümleri; lise: Dağılım ve İlişki.'],
            tartisma: ['Uç değer ortalamayı neden bu kadar etkiler?', 'Bir grafik bizi nasıl kandırabilir?', 'Korelasyon nedensellik değildir — bir örnek verebilir misin?'],
            cikis: '3, 5, 5, 7, 30 listesinin ortalamasını ve ortancasını bulun; hangisi daha "tipik"?',
            destek: 'Hesap makinesi kullanımına izin verin.',
            zenginlestirme: 'Okul genelinde anket yapıp sonuçları sunsunlar.'
        },
        dijital: {
            hedefler: ['Bir haberin güvenilirliğini kaynak, tarih ve diğer kaynaklarla sınar.', 'Gizli reklamları ve kişisel bilgi risklerini tanır.', 'Siber zorbalıkta doğru davranışları ve lisans kurallarını uygular.'],
            giris: 'Gerçek gibi görünen ama uydurma bir manşet okuyun: "Sizce doğru mu? Nasıl anlarız?"',
            isinma: 'Kendi dijital ayak izlerini düşünsünler: internette onlar hakkında neler bulunabilir? (paylaşmadan, sadece düşünerek)',
            adimlar: ['Haber Dedektifi\'nde araç düğmelerini (tersine görsel arama, diğer kaynaklar) kullanmayı gösterin.', 'Reklamı Yakala ve Dijital Ayak İzi bölümlerini ikili gruplarla yapın.', 'Siber Zorbalığa Dur De senaryolarını sınıfça oylayıp tartışın; lisede Telif ve Lisans bölümünü ekleyin.'],
            tartisma: ['Bir haberi paylaşmadan önce hangi 3 soruyu sormalıyız?', 'İzleyici olarak zorbalığı durdurmak için ne yapabiliriz?', 'Başkasının fotoğrafını izinsiz paylaşmak neden sorun?'],
            cikis: '"Paylaşmadan önce düşün" için kendi 3 maddelik kuralınızı yazın.',
            destek: 'Senaryoları sesli okuyun, görsel ipuçlarını vurgulayın.',
            zenginlestirme: 'Sınıf için bir "dijital vatandaşlık sözleşmesi" hazırlasınlar.'
        },
        python: {
            hedefler: ['Python ile girdi alan ve çıktı veren programlar yazar.', 'Koşul, döngü ve fonksiyon kullanır.', 'Hata mesajlarını okuyarak programını düzeltir.'],
            giris: '"Merhaba Dünya" geleneğini anlatın; ilk görevi birlikte yazın.',
            isinma: 'Kâğıda bir programın çıktısını tahmin ettirin (Ne Yazar? etkinliğinden bir soru).',
            adimlar: ['Python Laboratuvarı\'nda üniteye uygun görevi açın; "Çalıştır" ile deneyip "Kontrol et" ile test ettirin.', 'Hata çıkınca Türkçe açıklamayı birlikte okuyun.', 'Hızlı bitirenler bir sonraki üniteye geçsin; ipucu yerine önce arkadaşına sorsun.'],
            tartisma: ['input() neden metin verir?', 'Döngü ile kaç satır yazmaktan kurtuldun?', 'Testlerden biri neden geçmedi, nasıl buldun?'],
            cikis: 'Kullanıcıdan iki sayı alıp toplamını yazan programı kâğıda yazın.',
            destek: 'Başlangıç kodunu birlikte okuyun, ipuçlarını kullanmalarına izin verin.',
            zenginlestirme: 'Fonksiyonlar ve Algoritmalar ünitesindeki sıralama ve arama görevleri.'
        },
        tahmin: {
            hedefler: ['Python kodunu çalıştırmadan izler.', 'Değişkenlerin değerini adım adım takip eder.', 'Operatör ve döngü davranışlarını açıklar.'],
            giris: 'Tahtaya x = 3; x = x + 2; print(x) yazın; herkes cevabını kâğıda yazsın.',
            isinma: 'İzleme tablosu yapın: her satırdan sonra değişkenlerin değerini yazın.',
            adimlar: ['Etkinlikte seviyeye uygun soruları yapın.', 'Yanlış cevaplarda açıklamayı birlikte okuyun.', 'Zor sorularda izleme tablosu kullanmaya teşvik edin.'],
            tartisma: ['Hangi soru seni en çok şaşırttı?', 'range(1, 5) neden 5\'i içermiyor?', 'İzleme tablosu nasıl yardımcı oldu?'],
            cikis: 'for i in range(3): print(i * 2) kodunun çıktısını yazın.',
            destek: 'Kısa kodlarla ve izleme tablosuyla başlayın.',
            zenginlestirme: 'Arkadaşları için "Ne yazar?" sorusu hazırlasınlar.'
        }
    };
    const api = { PLANLAR };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Dersler = api;
})(typeof window !== 'undefined' ? window : globalThis);
