// KodLab — Robot Kodla bölümleri
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
        }
    ];

    if (typeof module !== 'undefined' && module.exports) module.exports = SEVIYELER;
    else root.ROBOT_SEVIYELER = SEVIYELER;
})(typeof window !== 'undefined' ? window : globalThis);
