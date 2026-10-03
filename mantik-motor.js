// KodLab — Mantık Kapıları motoru: bölümler ve devre hesaplama
(function (root) {
    'use strict';

    const KAPILAR = {
        'VE': { ing: 'AND', f: (a, b) => a && b, giris: 2 },
        'VEYA': { ing: 'OR', f: (a, b) => a || b, giris: 2 },
        'ÖZEL VEYA': { ing: 'XOR', f: (a, b) => a !== b, giris: 2 },
        'DEĞİL': { ing: 'NOT', f: (a) => !a, giris: 1 }
    };

    // tur 'yak': anahtarlarla bütün durumları deneyerek doğruluk tablosunu doldur. tur 'sec': ? kapıları seçerek tabloyu tuttur.
    // dugumler sırayla hesaplanır (her düğüm yalnızca kendinden öncekileri kullanır). y: satır konumu.
    const BOLUMLER = [
        {
            ad: 'Ters Çevir', tur: 'yak', sinif: [5, 12],
            anlatim: '<b>DEĞİL</b> kapısı girişi tersine çevirir: 1 gelirse 0, 0 gelirse 1 verir. Anahtara tıklayarak aç, kapat ve her durumda lambanın yanıp yanmadığını tabloya kaydet.',
            girisler: [{ ad: 'A', y: 1 }],
            dugumler: [{ id: 'g1', tip: 'DEĞİL', giris: ['A'], y: 1 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g1' }]
        },
        {
            ad: 'İkisi Birden', tur: 'yak', sinif: [5, 12],
            anlatim: '<b>VE</b> kapısı ancak iki girişi de 1 olduğunda 1 verir. Anahtarları değiştirerek bütün durumları dene ve tabloyu doldur.',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }],
            dugumler: [{ id: 'g1', tip: 'VE', giris: ['A', 'B'], y: 1 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g1' }]
        },
        {
            ad: 'Biri Yeter', tur: 'yak', sinif: [5, 12],
            anlatim: '<b>VEYA</b> kapısı girişlerden en az biri 1 olduğunda 1 verir. Bütün durumları dene ve tabloyu doldur.',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }],
            dugumler: [{ id: 'g1', tip: 'VEYA', giris: ['A', 'B'], y: 1 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g1' }]
        },
        {
            ad: 'Yalnızca Biri', tur: 'sec', sinif: [6, 12],
            anlatim: 'Merdiven lambası: alttaki ya da üstteki anahtardan <b>yalnızca biri</b> açıkken yanmalı. Soru işaretli kapıya tıklayarak türünü değiştir. Yeni kapı: <b>ÖZEL VEYA</b> (XOR) girişler farklıysa 1 verir.',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }],
            dugumler: [{ id: 'g1', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['A', 'B'], y: 1 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g1' }],
            hedef: ([a, b]) => [a !== b], cozum: { g1: 'ÖZEL VEYA' }
        },
        {
            ad: 'Ters VE', tur: 'sec', sinif: [6, 12],
            anlatim: 'Lamba her zaman yansın; sadece iki anahtar <b>birlikte</b> açıldığında sönsün. Sağdaki DEĞİL kapısı sabit, soldakini sen seç.',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }],
            dugumler: [{ id: 'g1', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'B'], y: 1 }, { id: 'g2', tip: 'DEĞİL', giris: ['g1'], y: 1 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g2' }],
            hedef: ([a, b]) => [!(a && b)], cozum: { g1: 'VE' }
        },
        {
            ad: 'Hırsız Alarmı', tur: 'sec', sinif: [6, 12],
            anlatim: 'Siren şu durumda çalmalı: <b>kapı açık VE alarm kurulu</b>, ya da <b>cam kırık</b>. (A: kapı açık, B: alarm kurulu, C: cam kırık)',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }, { ad: 'C', y: 4 }],
            dugumler: [{ id: 'g1', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'B'], y: 1 }, { id: 'g2', tip: '?', izin: ['VE', 'VEYA'], giris: ['g1', 'C'], y: 2.5 }],
            cikislar: [{ ad: 'Siren', kaynak: 'g2' }],
            hedef: ([a, b, c]) => [(a && b) || c], cozum: { g1: 'VE', g2: 'VEYA' }
        },
        {
            ad: 'Üç Anahtar', tur: 'yak', sinif: [7, 12],
            anlatim: 'Bu devrede üç kapı var. Sekiz durumun hepsini dene ve tabloyu doldur. İpucu: her seferinde tek bir anahtarı değiştirerek 8 durumu 7 hamlede gezebilirsin!',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2 }, { ad: 'C', y: 4 }],
            dugumler: [{ id: 'g1', tip: 'VEYA', giris: ['A', 'B'], y: 1 }, { id: 'g2', tip: 'DEĞİL', giris: ['C'], y: 4 }, { id: 'g3', tip: 'VE', giris: ['g1', 'g2'], y: 2.5 }],
            cikislar: [{ ad: 'Lamba', kaynak: 'g3' }]
        },
        {
            ad: 'XOR\'u İnşa Et', tur: 'sec', sinif: [8, 12],
            anlatim: 'Elinde ÖZEL VEYA kapısı yok! Sadece VE, VEYA ve DEĞİL kullanarak "yalnızca biri" devresini kur. İpucu: "en az biri" VE "ikisi birden değil".',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 3 }],
            dugumler: [
                { id: 'g1', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'B'], y: 0 },
                { id: 'g2', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'B'], y: 3 },
                { id: 'g3', tip: 'DEĞİL', giris: ['g2'], y: 3 },
                { id: 'g4', tip: '?', izin: ['VE', 'VEYA'], giris: ['g1', 'g3'], y: 1.5 }
            ],
            cikislar: [{ ad: 'Lamba', kaynak: 'g4' }],
            hedef: ([a, b]) => [a !== b], cozum: { g1: 'VEYA', g2: 'VE', g4: 'VE' }
        },
        {
            ad: 'Çoğunluk Oyu', tur: 'sec', sinif: [9, 12],
            anlatim: 'Üç kişilik jüri: en az <b>iki kişi</b> "evet" derse ışık yansın. Her ikili için bir kapı, sonra bunları birleştir.',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 2.5 }, { ad: 'C', y: 5 }],
            dugumler: [
                { id: 'g1', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'B'], y: 0.5 },
                { id: 'g2', tip: '?', izin: ['VE', 'VEYA'], giris: ['B', 'C'], y: 2.5 },
                { id: 'g3', tip: '?', izin: ['VE', 'VEYA'], giris: ['A', 'C'], y: 4.5 },
                { id: 'g4', tip: '?', izin: ['VE', 'VEYA'], giris: ['g1', 'g2'], y: 1.5 },
                { id: 'g5', tip: '?', izin: ['VE', 'VEYA'], giris: ['g4', 'g3'], y: 3 }
            ],
            cikislar: [{ ad: 'Işık', kaynak: 'g5' }],
            hedef: ([a, b, c]) => [(a + b + c) >= 2], cozum: { g1: 'VE', g2: 'VE', g3: 'VE', g4: 'VEYA', g5: 'VEYA' }
        },
        {
            ad: 'Yarım Toplayıcı', tur: 'sec', sinif: [9, 12],
            anlatim: 'Bilgisayar toplamayı kapılarla yapar! A + B toplamını ikilik olarak göster: <b>Elde</b> ve <b>Toplam</b>. Örneğin 1 + 1 = 10 (Elde 1, Toplam 0).',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 3 }],
            dugumler: [
                { id: 'g1', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['A', 'B'], y: 0 },
                { id: 'g2', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['A', 'B'], y: 3 }
            ],
            cikislar: [{ ad: 'Toplam', kaynak: 'g1' }, { ad: 'Elde', kaynak: 'g2' }],
            hedef: ([a, b]) => [a !== b, a && b], cozum: { g1: 'ÖZEL VEYA', g2: 'VE' }
        },
        {
            ad: 'Tam Toplayıcı', tur: 'sec', sinif: [10, 12],
            anlatim: 'Önceki basamaktan gelen elde (Eg) ile birlikte üç biti topla. Bu devreden 64 tane yan yana koyarsan işlemcinin toplama birimini yapmış olursun!',
            girisler: [{ ad: 'A', y: 0 }, { ad: 'B', y: 1.5 }, { ad: 'Eg', y: 3.5 }],
            dugumler: [
                { id: 'g1', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['A', 'B'], y: 0.75 },
                { id: 'g3', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['A', 'B'], y: 5 },
                { id: 'g2', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['g1', 'Eg'], y: 1.5 },
                { id: 'g4', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['g1', 'Eg'], y: 3.5 },
                { id: 'g5', tip: '?', izin: ['VE', 'VEYA', 'ÖZEL VEYA'], giris: ['g4', 'g3'], y: 4.25 }
            ],
            cikislar: [{ ad: 'Toplam', kaynak: 'g2' }, { ad: 'Elde', kaynak: 'g5' }],
            hedef: ([a, b, c]) => { const t = a + b + c; return [t % 2 === 1, t >= 2]; },
            cozum: { g1: 'ÖZEL VEYA', g2: 'ÖZEL VEYA', g3: 'VE', g4: 'VE', g5: 'VEYA' }
        }
    ];

    // Devreyi hesapla. secim: { dugumId: kapı türü } (? kapılar için). Seçilmemiş kapı null verir.
    function hesapla(b, girisDegerleri, secim) {
        const v = {};
        b.girisler.forEach((g, i) => { v[g.ad] = !!girisDegerleri[i]; });
        for (const d of b.dugumler) {
            const tip = d.tip === '?' ? secim[d.id] : d.tip;
            const ins = d.giris.map(x => v[x]);
            v[d.id] = !tip || ins.some(x => x === null) ? null : KAPILAR[tip].f(...ins);
        }
        return { v, cikis: b.cikislar.map(c => v[c.kaynak]) };
    }

    // Bütün giriş kombinasyonları: 00, 01, 10, 11 ...
    function kombinasyonlar(n) {
        return Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (_, i) => !!((k >> (n - 1 - i)) & 1)));
    }

    // Düğümlerin sütunu: girişler 0, her kapı girdilerinin en büyük sütunu + 1
    function sutunlar(b) {
        const s = {};
        b.girisler.forEach(g => { s[g.ad] = 0; });
        for (const d of b.dugumler) s[d.id] = Math.max(...d.giris.map(x => s[x])) + 1;
        return s;
    }

    const api = { KAPILAR, BOLUMLER, hesapla, kombinasyonlar, sutunlar };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Mantik = api;
})(typeof window !== 'undefined' ? window : globalThis);
