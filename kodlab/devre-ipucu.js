// Kodlayalım — KodKart ipuçları: görev kimliği → [düşündüren soru, somut ipucu]. Üçüncü basamak görevin örnek çözümüdür.
(function (root) {
    'use strict';
    const IPUCLARI = {
        kalp: ['Kalbin "atması" için iki resmin sırayla, durmadan değişmesi gerekiyor. Hangi olay hiç bitmeden çalışır?', '<b>sürekli</b> bloğunun içine: ikon göster kalp, bekle 500, ikon göster küçük kalp, bekle 500.'],
        isim: ['İki düğmenin iki ayrı görevi var. Her düğme için ayrı bir sarı olay bloğu gerekir mi?', '<b>Ⓐ düğmesine basılınca</b>: yazı kaydır (adın). <b>Ⓑ düğmesine basılınca</b>: ikon göster gülen yüz.'],
        sayac: ['Sayıyı aklında tutmak için bir değişken gerekir. Başlangıçta ve her basışta değişken ne olmalı?', '<b>başlayınca</b>: a = 0, değişkeni göster. <b>Ⓐ</b>: a değerini 1 artır, göster. <b>Ⓑ</b>: a = 0, göster.'],
        zar: ['Zar her atışta farklı bir sayı verir. Rastgele sayıyı nereye saklayıp nasıl göstereceksin?', '<b>kart sallanınca</b>: a = rastgele 1 ile 6 arası, değişkeni göster a.'],
        termo: ['Kart sıcaklığı bir kez değil, sürekli kontrol etmeli. Sonra iki seçenekten birini seçmeli.', '<b>sürekli</b> içinde <b>eğer sıcaklık > 30</b>: üzgün yüz; <b>değilse</b>: gülen yüz.'],
        gece: ['Karanlıkta yanan, aydınlıkta sönen bir lamba. Işık sensörü hangi koşulda "karanlık" der?', '<b>sürekli</b> içinde <b>eğer ışık &lt; 50</b>: ikon göster dolu; <b>değilse</b>: ekranı temizle.'],
        tkm: ['Üç seçenek var. 1, 2 ve 3 sayılarını taş, kâğıt ve makasa nasıl eşlersin?', '<b>sallanınca</b>: a = rastgele 1 ile 3; eğer a = 1 taş, eğer a = 2 kâğıt, eğer a = 3 makas.'],
        zil: ['Melodi birkaç nota arka arkaya. Melodiden önce ve sonra ekranda ne olmalı?', '<b>Ⓐ</b>: ikon göster nota, sonra en az 3 <b>nota çal</b> bloğu, en sonda ekranı temizle.'],
        duygu: ['Üç farklı düğme hareketi var: A, B ve ikisi birlikte. Her biri için ayrı bir olay var mı?', '<b>Ⓐ</b> gülen yüz, <b>Ⓑ</b> üzgün yüz, <b>Ⓐ+Ⓑ birlikte basılınca</b> kalp.'],
        yon: ['Düğmeler ve sallama: üç olay, üç ok. Hangi ok hangi olaya?', '<b>Ⓐ</b>: sol ok, <b>Ⓑ</b>: sağ ok, <b>kart sallanınca</b>: yukarı ok.'],
        gerisayim: ['5\'ten 1\'e saymak için bir sayının her seferinde 1 azalması gerekir. Kaç kez tekrar ediyor?', '<b>başlayınca</b>: a = 5; tekrarla 5 kez (değişkeni göster a, bekle 1000, a değerini -1 artır); sonra ikon göster yıldız.'],
        yanson: ['Yanıp sönme: yak, bekle, söndür, bekle… Bu hiç durmuyor. Ortadaki LED\'in koordinatı ne?', '<b>sürekli</b>: LED yak x:2 y:2, bekle 300, LED söndür x:2 y:2, bekle 300.'],
        kose: ['Dört köşenin koordinatları neler? Sol üst (0,0). Sağ alt?', '<b>başlayınca</b>: dört LED yak bloğu: (0,0), (4,0), (0,4), (4,4).'],
        skor: ['İki takım, iki ayrı değişken: a ve b. Sıfırlama için iki düğmeye birden basılıyor.', '<b>Ⓐ</b>: a +1, a\'yı göster. <b>Ⓑ</b>: b +1, b\'yi göster. <b>Ⓐ+Ⓑ</b>: a = 0, b = 0, sayı göster 0.'],
        sensoroku: ['Kartın iki sensörü var. Hangi blok bir sensörün değerini ekranda gösterir?', '<b>Ⓐ</b>: göster 🌡 sıcaklık. <b>Ⓑ</b>: göster ☀ ışık düzeyi.'],
        alarm: ['Kutu açılınca içeri ışık girer. Alarm hem açılınca çalmalı hem kapanınca susmalı: iki durum var.', '<b>sürekli</b> içinde <b>eğer ışık > 100</b>: ikon göster hayır (✖), nota çal; <b>değilse</b>: ekranı temizle.'],
        sihirli: ['Yarı yarıya şans: evet ya da hayır. Koşul listesinde şansla ilgili bir seçenek var mı?', '<b>sallanınca</b>: <b>eğer % sayı şansla</b> (sayı: 50) evet ikonu; <b>değilse</b> hayır ikonu.'],
        yazitura: ['İki sonuç var: Y ve T. Rastgele 1 ya da 2 seçip ona göre harf gösterebilir misin?', '<b>sallanınca</b>: a = rastgele 1 ile 2; eğer a = 1: yazı kaydır "Y", değilse: yazı kaydır "T".'],
        doremi: ['Gamın ilk beş notası hangi sırada? Do, re, …', '<b>Ⓐ</b>: nota çal do, re, mi, fa, sol (5 ayrı nota bloğu, sırayla).'],
        muzikkutusu: ['İki düğme, iki farklı melodi. Her melodide en az 4 nota olmalı ve birbirinden farklı olmalı.', '<b>Ⓐ</b>: nota ikonu, 4 nota (ör. mi mi fa sol), temizle. <b>Ⓑ</b>: nota ikonu, başka 4–5 nota (ör. do do sol sol la), temizle.'],
        adimhedef: ['Her sallanış bir adım. Adım sayısı 10 olduğunda ödül ver. Bunu nerede kontrol etmelisin?', '<b>sallanınca</b>: a +1, değişkeni göster a, <b>eğer a = 10</b>: ikon göster yıldız.'],
        gerisayac: ['Hak 9\'dan başlayıp azalıyor. Hak bitince sayı yerine üzgün yüz çıkmalı.', '<b>başlayınca</b>: a = 9, göster. <b>Ⓐ</b>: a değerini -1 artır; eğer a = 0 üzgün yüz, değilse a\'yı göster.'],
        ciftzar: ['İki zar için iki değişken gerekir. İki sayı arka arkaya görünürken araya ne koymalısın ki ayrı oldukları anlaşılsın?', '<b>sallanınca</b>: a ve b rastgele 1–6; a\'yı göster, bekle 700, temizle, bekle 200, b\'yi göster.'],
        isikolcer: ['Üç seviye var. İki koşulu iç içe koyarak üç seçenek oluşturabilir misin?', '<b>sürekli</b>: eğer ışık &lt; 50 → 1; değilse (eğer ışık &lt; 150 → 2; değilse → 3).'],
        sicaklikalarm: ['Üç durum var: çok sıcak, çok soğuk, normal. Hangi sırayla sorarsan doğru çalışır?', '<b>sürekli</b>: eğer sıcaklık > 35 → üzgün yüz ve nota; değilse (eğer sıcaklık &lt; 10 → hayır ikonu; değilse → gülen yüz).'],
        kilit: ['A\'ya kaç kez basıldığını saymak gerekiyor. B\'ye basılınca bu sayıya bakılıp karar veriliyor.', '<b>Ⓐ</b>: a +1. <b>Ⓑ</b>: eğer a = 2 evet ikonu, değilse hayır ikonu; sonra <b>a = 0</b> (yeni deneme için).'],
        kronometre: ['Her saniye sayı 1 artıyor ve 9\'da duruyor. Kaç kez tekrar etmeli, her turda ne kadar beklemeli?', '<b>Ⓐ</b>: a = 0, göster; tekrarla 9 kez (bekle 1000, a +1, a\'yı göster).'],
        zamanlayici: ['Önce geri sayım, sonra zil, en son gülen yüz. Bu üç bölümü sırayla yazabilir misin?', '<b>Ⓐ</b>: a = 3; tekrarla 3 (göster a, bekle 1000, a -1); temizle; tekrarla 3 (nota çal); ikon göster gülen yüz.'],
        gecegunduz: ['Işık azsa gece, çoksa gündüz. Sınır kaç?', '<b>sürekli</b>: eğer ışık &lt; 60 → yıldız; değilse → ev.'],
        robotselam: ['Açılışta ve düğmeye basınca iki ayrı şey oluyor. Yazı bittikten sonra ne görünmeli?', '<b>başlayınca</b>: robot ikonu. <b>Ⓐ</b>: yazı kaydır "MERHABA", sonra yine robot ikonu.']
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = IPUCLARI;
    else root.DEVRE_IPUCLARI = IPUCLARI;
})(typeof window !== 'undefined' ? window : globalThis);
