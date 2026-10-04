// Kodlayalım — Robot Kodla bölümleri
// harita(lar): '.' zemin, '*' yıldız, '#' duvar, ' ' boşluk, ^ > v < robot ve baktığı yön
// hedef: 3 yıldız için en fazla komut sayısı. cozum: örnek çözüm (testlerde doğrulanır).
// Birden fazla harita varsa, aynı kod hepsinde çalışmalıdır.
(function (root) {
    'use strict';

    const SEVIYELER = [
        {
            baslik: 'İlk Adımlar',
            konu: 'Sıralı komutlar',
            anlatim: 'Robotun bütün yıldızları toplaması gerekiyor. <code>ileri()</code> komutu robotu baktığı yönde bir kare ilerletir. Her komutu ayrı bir satıra yaz.',
            yeni: ['ileri()'],
            haritalar: [['>.*.*']],
            hedef: 4,
            cozum: 'ileri()\nileri()\nileri()\nileri()',
            baslangic: 'ileri()\n'
        },
        {
            baslik: 'Köşeyi Dön',
            konu: 'Sıralı komutlar',
            anlatim: '<code>sağa()</code> robotu olduğu yerde sağa çevirir; ilerlemez, sadece yönünü değiştirir. Sağa dönmek robotun kendi sağıdır, ekranın sağı değil!',
            yeni: ['sağa()'],
            haritalar: [['>.*.', '   .', '   *']],
            hedef: 6,
            cozum: 'ileri()\nileri()\nileri()\nsağa()\nileri()\nileri()'
        },
        {
            baslik: 'Sağ mı, Sol mu?',
            konu: 'Sıralı komutlar',
            anlatim: '<code>sola()</code> robotu sola çevirir. Robotun yerinde olduğunu düşün: hangi tarafa dönmesi gerekiyor?',
            yeni: ['sola()'],
            haritalar: [['   ..*', '   .  ', '>.*.  ']],
            hedef: 9,
            cozum: 'ileri()\nileri()\nileri()\nsola()\nileri()\nileri()\nsağa()\nileri()\nileri()'
        },
        {
            baslik: 'Büyük Adımlar',
            konu: 'Parametreler',
            anlatim: 'Aynı komutu art arda yazmak yorucu. <code>ileri(5)</code> robotu tek komutla 5 kare ilerletir. Parantezin içindeki sayıya <b>parametre</b> denir.',
            yeni: ['ileri(5)'],
            haritalar: [['>....*', '     .', '     .', '*....*']],
            hedef: 5,
            cozum: 'ileri(5)\nsağa()\nileri(3)\nsağa()\nileri(5)'
        },
        {
            baslik: 'Merdiven',
            konu: 'Döngüler',
            anlatim: 'Bazı hareketler kendini tekrar ediyor. Tekrar eden komutları <code>tekrarla 3 { ... }</code> bloğunun içine yazarsan robot onları 3 kez yapar. Bloğun içindekileri girintili yazmak okumayı kolaylaştırır.',
            yeni: ['tekrarla 3 { }'],
            ornek: 'tekrarla 3 {\n    ileri()\n    sağa()\n}',
            haritalar: [['     *', '    *.', '   *. ', '  *.  ', ' *.   ', '>.    ']],
            hedef: 5,
            cozum: 'tekrarla 5 {\n    ileri()\n    sola()\n    ileri()\n    sağa()\n}'
        },
        {
            baslik: 'Kare Turu',
            konu: 'Döngüler',
            anlatim: 'Robot karenin etrafında bir tur atmalı. Bir karenin kaç kenarı var? Her kenarda robot ne yapıyor?',
            haritalar: [['>..*', '.  .', '*  .', '*..*']],
            hedef: 3,
            cozum: 'tekrarla 4 {\n    ileri(3)\n    sağa()\n}'
        },
        {
            baslik: 'Tarla Sürme',
            konu: 'Döngüler',
            anlatim: 'Tarladaki bütün yıldızları topla. İpucu: robot bir sıra gidip bir sıra geri geliyor. İki sıralık hareketi bulursan gerisini döngü halleder. Son yıldız toplandığı anda görev biter.',
            haritalar: [['>*****', '******', '******', '******']],
            hedef: 9,
            cozum: 'tekrarla 2 {\n    ileri(5)\n    sağa()\n    ileri()\n    sağa()\n    ileri(5)\n    sola()\n    ileri()\n    sola()\n}'
        },
        {
            baslik: 'Üç Kare',
            konu: 'İç içe döngüler',
            anlatim: 'Bir döngünün içine başka bir döngü yazabilirsin. Önce tek bir kareyi çizen kodu düşün, sonra onu üç kez tekrarla.',
            yeni: ['iç içe tekrarla'],
            ornek: 'tekrarla 2 {\n    tekrarla 4 {\n        ...\n    }\n    ...\n}',
            haritalar: [['.*.*.*.', '* . . *', '>......']],
            hedef: 5,
            cozum: 'tekrarla 3 {\n    tekrarla 4 {\n        ileri(2)\n        sola()\n    }\n    ileri(2)\n}'
        },
        {
            baslik: 'Duvara Kadar',
            konu: 'Koşullu döngü',
            anlatim: 'Bu bölümde <b>üç farklı harita</b> var ve kodun hepsinde çalışmalı! Yolun uzunluğu her haritada farklı. <code>iken önü_boş { ... }</code> bloğu, robotun önü boş olduğu sürece içindekileri tekrarlar.',
            yeni: ['iken önü_boş { }'],
            ornek: 'iken önü_boş {\n    ileri()\n}',
            haritalar: [['>..*.*'], ['>.*......*'], ['>.*']],
            hedef: 2,
            cozum: 'iken önü_boş {\n    ileri()\n}'
        },
        {
            baslik: 'Köşe Bulucu',
            konu: 'Koşullar',
            anlatim: '<code>eğer önü_boş { ... } değilse { ... }</code> robotun karar vermesini sağlar: önü boşsa ilk bloğu, değilse ikinci bloğu yapar. <code>iken yıldız_kaldı</code> ise yıldız bitene kadar tekrarlar. Üç haritada da çalışan tek bir kod yaz.',
            yeni: ['eğer … değilse', 'yıldız_kaldı'],
            ornek: 'iken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse {\n        sağa()\n    }\n}',
            haritalar: [['>..*', '   .', '*...'], ['>.....*', '      .', '      .', '      *'], ['>.*', '  .', '  .', '*..']],
            hedef: 4,
            cozum: 'iken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse {\n        sağa()\n    }\n}'
        },
        {
            baslik: 'Kıvrımlı Yol',
            konu: 'İç içe koşullar',
            anlatim: 'Yol bazen sağa, bazen sola dönüyor. Robot <code>sağı_boş</code> ve <code>solu_boş</code> ile yanlarına da bakabilir. Bir <code>eğer</code> bloğunun içine başka bir <code>eğer</code> yazabilirsin.',
            yeni: ['sağı_boş', 'solu_boş'],
            haritalar: [['>..', '  .', '  ...*'], ['*.   ', ' .   ', ' ...<'], ['   ..*', '   .  ', '^...  ']],
            hedef: 6,
            cozum: 'iken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse {\n        eğer sağı_boş {\n            sağa()\n        } değilse {\n            sola()\n        }\n    }\n}'
        },
        {
            baslik: 'Engel Atlama',
            konu: 'Fonksiyonlar',
            anlatim: 'Engelin üstünden atlama hareketini her seferinde yeniden yazmak yerine ona bir ad ver: <code>fonksiyon atla { ... }</code>. Sonra istediğin yerde <code>atla()</code> yazarak kullan. Kendi komutunu icat etmiş oldun!',
            yeni: ['fonksiyon ad { }'],
            ornek: 'fonksiyon atla {\n    sola()\n    ...\n}\n\nileri(2)\natla()',
            haritalar: [['  .*.*. .*. ', '>..#.#...#.*']],
            hedef: 14,
            cozum: 'fonksiyon atla {\n    sola()\n    ileri()\n    sağa()\n    ileri(2)\n    sağa()\n    ileri()\n    sola()\n}\n\nileri(2)\natla()\natla()\nileri(2)\natla()\nileri()'
        },
        {
            baslik: 'Salyangoz',
            konu: 'Döngü içinde döngü',
            anlatim: 'Robot bir sarmalın içine doğru ilerlemeli; her kenar bir öncekinden kısa. Bir <code>iken</code> döngüsünün içine başka bir <code>iken</code> koyabilirsin. İki haritada da çalışmalı.',
            haritalar: [
                ['>......', '      .', '..... .', '.   . .', '. *.. .', '.     .', '.......'],
                ['>....', '    .', '..* .', '.   .', '.....']
            ],
            hedef: 4,
            cozum: 'iken yıldız_kaldı {\n    iken önü_boş {\n        ileri()\n    }\n    sağa()\n}'
        },
        {
            baslik: 'Labirent',
            konu: 'Algoritma',
            anlatim: 'Labirentten çıkmanın ünlü bir yolu vardır: <b>sağ elini duvardan hiç ayırma.</b> Sağın boşsa sağa dön ve ilerle; değilse önün boşsa ilerle; o da değilse sola dön. Bu tarife <b>algoritma</b> denir. İki labirentte de çalışmalı.',
            yeni: ['algoritma'],
            haritalar: [
                ['>..#...', '##.#.#.', '.....#.', '.#####.', '...*#..'],
                ['v#.....', '.#.###.', '...#*#.', '##.#.##', '...#...', '.###.#.', '.....#.']
            ],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer sağı_boş {\n        sağa()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sola()\n    }\n}'
        },
        {
            baslik: 'Zikzak',
            konu: 'Döngüler',
            anlatim: 'Robot yukarı ve sağa doğru zikzak çiziyor. Tekrar eden parçayı bul ve <code>tekrarla</code> içine yaz.',
            haritalar: [['        *', '        .', '      *.*', '      .', '    *.*', '    .', '  *.*', '  .', '>.*']],
            hedef: 5,
            cozum: 'tekrarla 4 {\n    ileri(2)\n    sola()\n    ileri(2)\n    sağa()\n}'
        },
        {
            baslik: 'Kare Dalga',
            konu: 'Döngüler',
            anlatim: 'Bu yol bir yukarı bir aşağı inen kare dalga gibi. Bir dalganın kaç komut olduğunu say, sonra döngüyle tekrarla.',
            haritalar: [[' ********', '>********']],
            hedef: 9,
            cozum: 'tekrarla 4 {\n    ileri()\n    sola()\n    ileri()\n    sağa()\n    ileri()\n    sağa()\n    ileri()\n    sola()\n}'
        },
        {
            baslik: 'Üç Kenar',
            konu: 'Döngüler',
            anlatim: 'Bir karenin üç kenarını dolaşan bir yol. Her kenarda aynı iki komut var.',
            haritalar: [['>...*', '    .', '    .', '    .', '*...*']],
            hedef: 3,
            cozum: 'tekrarla 3 {\n    ileri(4)\n    sağa()\n}'
        },
        {
            baslik: 'Basamak İnişi',
            konu: 'Döngüler',
            anlatim: 'Robot merdivenden aşağı iniyor. Her basamakta iki adım ileri, bir adım aşağı.',
            haritalar: [['>.*', '  *.*', '    *.*', '      *.*', '        *.*', '          *']],
            hedef: 5,
            cozum: 'tekrarla 5 {\n    ileri(2)\n    sağa()\n    ileri()\n    sola()\n}'
        },
        {
            baslik: 'Dağlar',
            konu: 'İç içe döngüler',
            anlatim: 'Robot bir dağa tırmanıp iniyor, sonra bir dağa daha. Tırmanış da iniş de kendi içinde tekrar ediyor: döngünün içine döngü yaz.',
            haritalar: [['   **    **', '  ****  ****', ' **  ****  **', '>*    **    *']],
            hedef: 11,
            cozum: 'tekrarla 2 {\n    tekrarla 3 {\n        ileri()\n        sola()\n        ileri()\n        sağa()\n    }\n    tekrarla 3 {\n        ileri()\n        sağa()\n        ileri()\n        sola()\n    }\n}'
        },
        {
            baslik: 'Kale Duvarı',
            konu: 'Döngüler',
            anlatim: 'Kale duvarının mazgallarını dolaş. Bir mazgal: ileri, yukarı, ileri, aşağı.',
            haritalar: [['  *.* *.* *.*', '  . . . . . .', '>.* *.* *.* *']],
            hedef: 9,
            cozum: 'tekrarla 3 {\n    ileri(2)\n    sola()\n    ileri(2)\n    sağa()\n    ileri(2)\n    sağa()\n    ileri(2)\n    sola()\n}'
        },
        {
            baslik: 'Büyük Tarla',
            konu: 'Döngüler',
            anlatim: 'Beş sıralık tarladaki bütün yıldızları topla. Gidiş-dönüşü bir döngüye koy; son sıra için döngüden sonra bir komut yeter.',
            haritalar: [['>******', '*******', '*******', '*******', '*******']],
            hedef: 10,
            cozum: 'tekrarla 2 {\n    ileri(6)\n    sağa()\n    ileri()\n    sağa()\n    ileri(6)\n    sola()\n    ileri()\n    sola()\n}\nileri(6)'
        },
        {
            baslik: 'Dört Pencere',
            konu: 'İç içe döngüler',
            anlatim: 'Robot dört küçük kare çizerek bir pencere oluşturuyor. Bir kareyi çizen döngüyü bul, sonra her kareden sonra robotu sağa çevir.',
            haritalar: [['*.*.*', '. . .', '*.>.*', '. . .', '*.*.*']],
            hedef: 5,
            cozum: 'tekrarla 4 {\n    tekrarla 4 {\n        ileri(2)\n        sağa()\n    }\n    sağa()\n}'
        },
        {
            baslik: 'Kare Fonksiyonu',
            konu: 'Fonksiyonlar',
            anlatim: 'Aynı kareyi üç yerde çizmek gerekiyor. Kareyi çizen kodu <code>fonksiyon kare { ... }</code> içine yaz, sonra <code>kare()</code> diye çağır.',
            haritalar: [['>.*.*.*.*.*', '. . . . . .', '*.* *.* *.*']],
            hedef: 9,
            cozum: 'fonksiyon kare {\n    tekrarla 4 {\n        ileri(2)\n        sağa()\n    }\n}\n\nkare()\nileri(4)\nkare()\nileri(4)\nkare()'
        },
        {
            baslik: 'Basamak Fonksiyonu',
            konu: 'Fonksiyonlar',
            anlatim: 'Bir fonksiyon başka bir fonksiyonu çağırabilir. Önce tek basamağı çıkan <code>basamak</code> fonksiyonunu yaz, sonra üç basamaklı <code>merdiven</code> fonksiyonunu onunla yap.',
            haritalar: [['        *', '       **', '      **', '   *..*', '  **', ' **', '>*']],
            hedef: 11,
            cozum: 'fonksiyon basamak {\n    ileri()\n    sola()\n    ileri()\n    sağa()\n}\n\nfonksiyon merdiven {\n    tekrarla 3 {\n        basamak()\n    }\n}\n\nmerdiven()\nileri(2)\nmerdiven()'
        },
        {
            baslik: 'Zıpla Zıpla',
            konu: 'Fonksiyonlar',
            anlatim: 'Yolda dört çukur var; robot her birinin üstünden atlamalı. Atlama hareketini bir fonksiyona koy ve döngüyle kullan.',
            haritalar: [[' *.**.**.**.*', '>* ** ** ** *']],
            hedef: 11,
            cozum: 'fonksiyon zıpla {\n    sola()\n    ileri()\n    sağa()\n    ileri(2)\n    sağa()\n    ileri()\n    sola()\n}\n\ntekrarla 4 {\n    ileri()\n    zıpla()\n}'
        },
        {
            baslik: 'Çiçek',
            konu: 'Fonksiyonlar',
            anlatim: 'Bir yaprak küçük bir karedir. <code>yaprak</code> fonksiyonunu yaz; her yapraktan sonra robot sağa dönerse dört yapraklı bir çiçek oluşur.',
            haritalar: [['*..*..*', '.  .  .', '.  .  .', '*..>..*', '.  .  .', '.  .  .', '*..*..*']],
            hedef: 7,
            cozum: 'fonksiyon yaprak {\n    tekrarla 4 {\n        ileri(3)\n        sola()\n    }\n    sağa()\n}\n\ntekrarla 4 {\n    yaprak()\n}'
        },
        {
            baslik: 'Kule Katları',
            konu: 'Fonksiyonlar',
            anlatim: 'Robot bir binanın katlarını tek tek temizliyor: bir kat gidiş, bir kat dönüş. İki katlık hareketi bir fonksiyona koy.',
            haritalar: [['*', '.*.*.', '*.*.*', '.*.*.', '*.*.*', '.*.*.', '>.*.*']],
            hedef: 11,
            cozum: 'fonksiyon katlar {\n    ileri(4)\n    sola()\n    ileri()\n    sola()\n    ileri(4)\n    sağa()\n    ileri()\n    sağa()\n}\n\ntekrarla 3 {\n    katlar()\n}'
        },
        {
            baslik: 'Takımyıldız',
            konu: 'Fonksiyonlar',
            anlatim: 'Robot bir yıldızdan çıkan dalları geziyor: her dal ileri gidip geri dönüyor. Geri dönmek için iki kez dönmek gerekir. <code>dal</code> fonksiyonunu yaz.',
            haritalar: [['   *', '   .', '   .', '*..>..*', '   .', '   .', '   *']],
            hedef: 8,
            cozum: 'fonksiyon dal {\n    ileri(3)\n    sağa()\n    sağa()\n    ileri(3)\n    sağa()\n}\n\ntekrarla 4 {\n    dal()\n}'
        },
        {
            baslik: 'Uzun Koridor',
            konu: 'Koşullu döngü',
            anlatim: 'Koridorların uzunluğu her haritada farklı. <code>iken önü_boş</code> ile duvara kadar git, dön ve yine duvara kadar git. Üç haritada da çalışmalı.',
            haritalar: [['>..*.', '    .', '    *'], ['>.*.....', '       .', '       .', '       *'], ['>.', ' .', ' *', ' .', ' *']],
            hedef: 5,
            cozum: 'iken önü_boş {\n    ileri()\n}\nsağa()\niken önü_boş {\n    ileri()\n}'
        },
        {
            baslik: 'Çevre Turu',
            konu: 'Koşullu döngü',
            anlatim: 'Robot odanın çevresindeki yıldızları topluyor; odaların boyu farklı. Duvara kadar git, sağa dön; yıldız kalmayana kadar.',
            haritalar: [['>..*', '.  .', '*..*'], ['>....*', '.    .', '.    .', '*....*'], ['>.*', '. .', '. .', '. .', '*..']],
            hedef: 4,
            cozum: 'iken yıldız_kaldı {\n    iken önü_boş {\n        ileri()\n    }\n    sağa()\n}'
        },
        {
            baslik: 'Merdiven Çık',
            konu: 'Koşullu döngü',
            anlatim: 'Basamakların genişliği her haritada farklı. Robot basamağın sonuna kadar gitsin, bir basamak çıksın ve devam etsin.',
            haritalar: [['      ..*', '     ..', '  ....', '>..'], ['       *..*', '     *.*', '    **', '>...*'], ['    .*', '   ..', '  ..', ' ..', '>.']],
            hedef: 6,
            cozum: 'iken yıldız_kaldı {\n    iken önü_boş {\n        ileri()\n    }\n    sola()\n    ileri()\n    sağa()\n}'
        },
        {
            baslik: 'Kapıyı Bul',
            konu: 'Koşullu döngü',
            anlatim: 'Koridor uzayıp gidiyor ama hazine sağdaki kapının arkasında. Sağın boş olmadığı sürece ilerle: <code>iken değil sağı_boş</code>. Kapıyı bulunca içeri gir.',
            haritalar: [['>.......', '   .', '   *'], ['>.........', '      .', '      .', '      *'], ['>.....', ' .', ' .', ' *']],
            hedef: 5,
            cozum: 'iken değil sağı_boş {\n    ileri()\n}\nsağa()\niken önü_boş {\n    ileri()\n}'
        },
        {
            baslik: 'Ceplerdeki Yıldızlar',
            konu: 'Koşullar',
            anlatim: 'Koridorun sol tarafında küçük cepler var ve yıldızlar ceplerde. Her adımdan sonra solun boşsa cebe gir, geri çık ve yoluna devam et.',
            haritalar: [[' * *  *', '>......*'], ['  *  * *', '>.......*'], ['*  **', '>....*']],
            hedef: 9,
            cozum: 'iken yıldız_kaldı {\n    eğer solu_boş {\n        sola()\n        ileri()\n        sağa()\n        sağa()\n        ileri()\n        sola()\n    }\n    ileri()\n}'
        },
        {
            baslik: 'İki Yanda Cepler',
            konu: 'Fonksiyon ve koşul',
            anlatim: 'Şimdi cepler iki yanda da var. Bir cebe girip çıkmak hep aynı: ileri, geri dön, ileri. Bunu <code>cep</code> fonksiyonu yap; sola ya da sağa döndükten sonra çağır.',
            haritalar: [[' *  *', '>.....*', '  * *'], ['   *  *', '>.......*', ' *  *'], ['* *', '>..*', ' *']],
            hedef: 15,
            cozum: 'fonksiyon cep {\n    ileri()\n    sağa()\n    sağa()\n    ileri()\n}\n\niken yıldız_kaldı {\n    eğer solu_boş {\n        sola()\n        cep()\n        sola()\n    }\n    eğer sağı_boş {\n        sağa()\n        cep()\n        sağa()\n    }\n    ileri()\n}'
        },
        {
            baslik: 'Robot Süpürge',
            konu: 'Algoritma',
            anlatim: 'Robot süpürge odanın her karesini temizlemeli; odaların boyu farklı. Duvara kadar git, aşağı in, geri gel, aşağı in… Yıldız kalmayınca kendiliğinden durur.',
            haritalar: [['>***', '****', '****'], ['>*****', '******', '******', '******'], ['>**', '***', '***', '***', '***']],
            hedef: 11,
            cozum: 'iken yıldız_kaldı {\n    iken önü_boş {\n        ileri()\n    }\n    sağa()\n    ileri()\n    sağa()\n    iken önü_boş {\n        ileri()\n    }\n    sola()\n    ileri()\n    sola()\n}'
        },
        {
            baslik: 'Kule Tırmanışı',
            konu: 'Fonksiyon ve koşul',
            anlatim: 'Yolda farklı yükseklikte kuleler var. Kuleye gelince yukarı tırman (sağın kule olduğu sürece), üstünden geç ve öbür yandan in. Kulenin üstünden geçmek için iki adım gerekir. Tırmanışı <code>tırman</code> fonksiyonu yap.',
            haritalar: [['..........', '..........', '.....#....', '..#..#....', '>.#*.#*#.*'], ['.......', '.......', '.#.....', '.#.....', '.#...#.', '>#*#*#*']],
            hedef: 14,
            cozum: 'fonksiyon tırman {\n    sola()\n    iken değil sağı_boş {\n        ileri()\n    }\n    sağa()\n    ileri(2)\n    sağa()\n    iken önü_boş {\n        ileri()\n    }\n    sola()\n}\n\niken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse {\n        tırman()\n    }\n}'
        },
        {
            baslik: 'Sol El Kuralı',
            konu: 'Algoritma',
            anlatim: 'Labirentte sağ el kuralı yerine <b>sol el kuralını</b> kullan: solun boşsa sola dön ve ilerle; değilse önün boşsa ilerle; o da değilse sağa dön. Sol elini duvardan hiç ayırma!',
            haritalar: [['v....#.', '####.#.', '...#...', '.#.###.', '.#...#.', '.###.#.', '...#..*'], ['v....#...', '####.###.', '.#...#...', '.#.###.##', '...#.....', '.#######.', '........*']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer solu_boş {\n        sola()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sağa()\n    }\n}'
        },
        {
            baslik: 'Büyük Labirent',
            konu: 'Algoritma',
            anlatim: 'Labirentler büyüdü ama algoritma değişmedi. Duvar takip eden bir algoritma, döngüsü olmayan her labirentten çıkış yolunu bulur. İki labirentte de çalışmalı.',
            haritalar: [['>..........#.', '##########.#.', '...#.....#...', '##.#.#.#.###.', '...#.#.#.#.#.', '.###.#.#.#.#.', '.....#.#...#.', '.#####.#####.', '.#...#.......', '.###.########', '............*'], ['>....#.......#.', '####.#.#####.#.', '.....#.....#...', '.#####.###.####', '.#.......#.....', '.#######.#####.', '.....#...#.#...', '####.#.###.#.#.', '.....#.....#.#.', '.###########.#.', '.............#*']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer sağı_boş {\n        sağa()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sola()\n    }\n}'
        },
        {
            baslik: 'Hazine Labirenti',
            konu: 'Algoritma',
            anlatim: 'Bu labirentte yıldızlar çıkmaz sokakların sonunda. Duvar takip eden robot bütün sokaklara girip çıkar, yani bütün hazineleri bulur!',
            haritalar: [['>....#...', '####.#.#.', '.....#*#.', '.#######.', '.#.......', '.#.#.###.', '.#*#...#.', '.#####.#.', '.......#*'], ['>..........', '##########.', '..*#.....#.', '.###.###.#.', '.#...#*#...', '.#.###.####', '..........*']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer sağı_boş {\n        sağa()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sola()\n    }\n}'
        },
        {
            baslik: 'Labirent Ustası',
            konu: 'Algoritma',
            anlatim: 'Üç farklı labirent, tek kod. En kısa kodla çöz: koşulları iyi sırala.',
            haritalar: [['>..#.#.....', '##.#.#.#.##', '...#.#.#...', '.###.#.###.', '...#.....#.', '##.#######.', '.#.#.......', '.#.#.#####.', '...#...#.#.', '.#####.#.#.', '.......#..*'], ['>....#*#.....', '####.#.#.###.', '*#...#.#...#.', '.#.###.###.#.', '.#.#*......#.', '.#.#########.', '.#.....#.....', '.#####.#.###.', '.........#*..'], ['>..#.....#.....', '##.###.#.###.#.', '.#...#.#.....#.', '.###.#.########', '...#.#.........', '##.#.#######.#.', '...#.......#.#.', '.#########.###.', '.........#.#...', '.#######.#.#.#.', '.....#.#.#...#.', '####.#.#.#####.', '.......#......*']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer sağı_boş {\n        sağa()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sola()\n    }\n}'
        },
        {
            baslik: 'Dev Merdiven',
            konu: 'İç içe döngüler',
            anlatim: 'Merdivenin her dört basamağında bir sahanlık var. Basamakları içteki döngü, sahanlıkları dıştaki döngü yapsın.',
            haritalar: [['                  *..*', '                 **', '                **', '               **', '           *...*', '          **', '         **', '        **', '    *...*', '   **', '  **', ' **', '>*']],
            hedef: 7,
            cozum: 'tekrarla 3 {\n    tekrarla 4 {\n        ileri()\n        sola()\n        ileri()\n        sağa()\n    }\n    ileri(3)\n}'
        },
        {
            baslik: 'Şato',
            konu: 'Fonksiyonlar',
            anlatim: 'Şatonun dört duvarının her birinde iki mazgal var. Bir duvarı <code>duvar</code> fonksiyonu yap; dört kez çağırırken her seferinde köşeyi dön.',
            haritalar: [['   *.* *.*', ' >.* *.* *.*', ' .         .', '**         **', '.           .', '**         **', ' .         .', '**         **', '.           .', '**         **', ' .         .', ' *.* *.* *.*', '   *.* *.*']],
            hedef: 14,
            cozum: 'fonksiyon duvar {\n    tekrarla 2 {\n        ileri(2)\n        sola()\n        ileri()\n        sağa()\n        ileri(2)\n        sağa()\n        ileri()\n        sola()\n    }\n    ileri(2)\n}\n\ntekrarla 4 {\n    duvar()\n    sağa()\n}'
        },
        {
            baslik: 'Elmas',
            konu: 'İç içe döngüler',
            anlatim: 'Basamaklı kenarlardan oluşan bir elmas. Her kenar aynı basamak hareketinden oluşuyor; kenar bitince robot dönüyor.',
            haritalar: [['   *', '  ***', ' ** **', '>*   **', ' ** **', '  ***', '   *']],
            hedef: 7,
            cozum: 'tekrarla 4 {\n    tekrarla 3 {\n        ileri()\n        sola()\n        ileri()\n        sağa()\n    }\n    sağa()\n}'
        },
        {
            baslik: 'Yılan',
            konu: 'Döngüler',
            anlatim: 'Uzun bir yılan yolu. Yıldızlar her üç adımda bir. Yılanın bir kıvrımını bul, gerisini döngü yapsın.',
            haritalar: [['>..*..*', '      .', '..*..*.', '*', '..*..*.', '      .', '*..*..*', '.', '.*..*..', '      *', '.*..*..', '.', '*']],
            hedef: 9,
            cozum: 'tekrarla 3 {\n    ileri(6)\n    sağa()\n    ileri(2)\n    sağa()\n    ileri(6)\n    sola()\n    ileri(2)\n    sola()\n}'
        },
        {
            baslik: 'Kare İçinde Kare',
            konu: 'Fonksiyonlar',
            anlatim: 'Bir büyük karenin her köşesinde küçük bir kare var. Küçük kareyi fonksiyon yap; büyük karenin her kenarında onu çağır.',
            haritalar: [[' **', ' >*...**', ' .    **', ' .    .', ' .    .', '**    .', '**...**', '     **']],
            hedef: 8,
            cozum: 'fonksiyon minik {\n    tekrarla 4 {\n        ileri()\n        sola()\n    }\n}\n\ntekrarla 4 {\n    minik()\n    ileri(5)\n    sağa()\n}'
        },
        {
            baslik: 'Büyük Süpürge',
            konu: 'Algoritma',
            anlatim: 'Robot süpürge bu kez dev odalarda. Önceki algoritman çalışıyor mu? Daha kısa yazabilir misin?',
            haritalar: [['>*******', '********', '********', '********', '********', '********'], ['>****', '*****', '*****', '*****', '*****', '*****', '*****'], ['>********', '*********', '*********']],
            hedef: 11,
            cozum: 'iken yıldız_kaldı {\n    iken önü_boş {\n        ileri()\n    }\n    sağa()\n    ileri()\n    sağa()\n    iken önü_boş {\n        ileri()\n    }\n    sola()\n    ileri()\n    sola()\n}'
        },
        {
            baslik: 'Yüksek Kuleler',
            konu: 'Fonksiyon ve koşul',
            anlatim: 'Kuleler yükseldi ve sayıları arttı. Tırmanma fonksiyonun her yükseklikte çalışmalı.',
            haritalar: [['..........', '..........', '.#........', '.#....#...', '.#....#...', '.#.#..#...', '>#*#.*#*#*'], ['.........', '.........', '.......#.', '.....#.#.', '...#.#.#.', '>#*#*#*#*']],
            hedef: 14,
            cozum: 'fonksiyon tırman {\n    sola()\n    iken değil sağı_boş {\n        ileri()\n    }\n    sağa()\n    ileri(2)\n    sağa()\n    iken önü_boş {\n        ileri()\n    }\n    sola()\n}\n\niken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse {\n        tırman()\n    }\n}'
        },
        {
            baslik: 'Karanlık Labirent',
            konu: 'Algoritma',
            anlatim: 'Bu labirentlerde robot sola bakarak başlıyor. Yönü önemli mi? Duvar takibi her yönden başlasa da çalışır mı? Dene ve gör.',
            haritalar: [['<......#...', '######.#.##', '.#.....#...', '.#.#######.', '.#.#.......', '.#.#.#####.', '...#.#...#.', '.###.#.#.#.', '.....#.#.#.', '######.#.#.', '.......#..*'], ['^..#....*#...', '##.#.#####.#.', '*#.#.#...#.#.', '.#.#.#.#.#.#.', '...#...#...#.', '.###.#####.#.', '.#*..#...#.#.', '.#####.#.#.#.', '.......#.#.#.', '########.#.#.', '*#...#...#*#.', '.#.#.#.#####.', '...#.........']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer sağı_boş {\n        sağa()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sola()\n    }\n}'
        },
        {
            baslik: 'Dev Labirent',
            konu: 'Algoritma',
            anlatim: 'Şimdiye kadarki en büyük labirent. Robot binlerce adım atabilir; algoritman doğruysa mutlaka çıkacak.',
            haritalar: [['>..#.............#.', '##.#.#########.#.#.', '...#.#...#...#.#...', '.###.###.#.#.#.###.', '.#.#.....#.#...#.#.', '.#.###.###.#####.#.', '.#.#...#...#.....#.', '.#.#.###.###.#####.', '.#...#...#.........', '.#.###.#####.######', '.#...#.....#...#...', '.#########.###.#.##', '.....#.....#...#...', '####.#.#####.#####.', '.......#..........*'], ['>....#*.........*', '####.#####.######', '...#.....#.#.....', '.#.#####.#.#.###.', '.#.......#....*#.', '.###########.###.', '.#.....#...#*#...', '.#.###.#.#.###.##', '...#*#...#...#...', '####.#######.###.', '.......#.....#...', '.###.#.#.#####.#.', '...#.#.#...#...#*', '##.#.#.###.#.####', '...#.#*#...#.....', '.###.###.#######.', '..*#.............']],
            hedef: 7,
            cozum: 'iken yıldız_kaldı {\n    eğer solu_boş {\n        sola()\n        ileri()\n    } değilse eğer önü_boş {\n        ileri()\n    } değilse {\n        sağa()\n    }\n}'
        },
        {
            baslik: 'Final: Usta Robotçu',
            konu: 'Her şey',
            anlatim: 'Son görev! Yollar sağa da sola da kıvrılıyor. Öğrendiğin her şeyi kullan: döngüler, koşullar, fonksiyonlar. Üç haritada da çalışan tek bir kod yaz.',
            haritalar: [['      *', '      .', '>..*  .', '   .  .', '   *..*'], ['  *..*', '  .  .', '>.*  .', '     .', '     .', '   *.*'], ['>.*.*', '    .', '    *', '  .*.', '  *', '  *']],
            hedef: 6,
            cozum: 'iken yıldız_kaldı {\n    eğer önü_boş {\n        ileri()\n    } değilse eğer sağı_boş {\n        sağa()\n    } değilse {\n        sola()\n    }\n}'
        }
    ];

    if (typeof module !== 'undefined' && module.exports) module.exports = SEVIYELER;
    else root.ROBOT_SEVIYELER = SEVIYELER;
})(typeof window !== 'undefined' ? window : globalThis);
