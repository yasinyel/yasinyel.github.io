// Kodlayalım — "Algoritma Sensin" motoru
// Arama ve sıralama algoritmalarını öğrenci adım adım kendisi yürütür. Motor her algoritma için
// baştan sona bütün adımları üretir: her adımda ekranın durumu, sorulan soru ve beklenen cevap vardır.
(function (root) {
    'use strict';

    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    function farkliSayilar(adet, a, b) {
        const s = new Set();
        while (s.size < adet) s.add(r(a, b));
        return [...s];
    }

    // Adım üretici yardımcı: her adımda durumun kopyasını saklar
    function kaydedici() {
        const adimlar = [];
        return {
            adimlar,
            sor(durum, soru) { adimlar.push({ durum: kopya(durum), ...soru }); }
        };
    }
    const kopya = (d) => JSON.parse(JSON.stringify(d));

    const EVET_HAYIR = (evet, hayir) => [{ id: 'evet', ad: evet }, { id: 'hayir', ad: hayir }];

    const ALGORITMALAR = [
        {
            id: 'enbuyuk', ad: 'En Büyüğü Bul', sinif: [3, 6], ikon: 'fa-trophy', renk: '#f59e0b',
            ozet: 'Kartlara tek tek bak ve şimdiye kadarki en büyüğü aklında tut.',
            kod: ['enb = dizi[0]', 'for i in range(1, len(dizi)):', '    if dizi[i] > enb:', '        enb = dizi[i]', 'print(enb)'],
            uret() {
                const dizi = farkliSayilar(7, 1, 99);
                const k = kaydedici();
                const d = { dizi, acik: [0], vurgu: [], sirali: [], soluk: [], degisken: { enb: dizi[0] }, satir: 1, isaret: { 0: 'enb' } };
                for (let i = 1; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken.i = i; d.satir = 3;
                    const buyuk = dizi[i] > d.degisken.enb;
                    k.sor(d, {
                        soru: `${dizi[i]}, şimdiye kadarki en büyükten (${d.degisken.enb}) büyük mü?`,
                        secenekler: EVET_HAYIR('Evet, yeni en büyük!', 'Hayır, devam'),
                        beklenen: buyuk ? 'evet' : 'hayir',
                        aciklama: buyuk ? `${dizi[i]} > ${d.degisken.enb}, en büyük değişmeli.` : `${dizi[i]} < ${d.degisken.enb}, en büyük aynı kalır.`
                    });
                    if (buyuk) { d.degisken.enb = dizi[i]; d.isaret = { [i]: 'enb' }; }
                }
                d.vurgu = []; d.satir = 5; delete d.degisken.i;
                return { adimlar: k.adimlar, son: d, ozet: `En büyük sayı ${d.degisken.enb}. ${dizi.length - 1} karşılaştırma yaptın: her kartı mutlaka bir kez görmen gerekiyor.`, sayac: dizi.length - 1 };
            }
        },
        {
            id: 'dogrusal', ad: 'Doğrusal Arama', sinif: [4, 8], ikon: 'fa-magnifying-glass', renk: '#16a36a',
            ozet: 'Aranan sayıyı bulmak için kartları baştan sona tek tek çevir.',
            kod: ['for i in range(len(dizi)):', '    if dizi[i] == aranan:', '        return i', 'return -1'],
            uret() {
                const dizi = farkliSayilar(8, 1, 60);
                const var_ = Math.random() < 0.8;
                const aranan = var_ ? dizi[r(2, dizi.length - 1)] : (() => { let x; do { x = r(1, 60); } while (dizi.includes(x)); return x; })();
                const k = kaydedici();
                const d = { dizi, acik: [], vurgu: [], sirali: [], soluk: [], degisken: { aranan }, satir: 1, baslik: `Aranan: ${aranan}` };
                let bulundu = -1;
                for (let i = 0; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken.i = i; d.satir = 2;
                    const esit = dizi[i] === aranan;
                    k.sor(d, {
                        soru: `dizi[${i}] = ${dizi[i]}. Aranan sayı bu mu?`,
                        secenekler: EVET_HAYIR('Evet, bulundu!', 'Hayır, sonraki kart'),
                        beklenen: esit ? 'evet' : 'hayir',
                        aciklama: esit ? `${dizi[i]} == ${aranan}` : `${dizi[i]} ≠ ${aranan}`
                    });
                    if (esit) { bulundu = i; break; }
                    d.soluk.push(i);
                }
                d.vurgu = bulundu >= 0 ? [bulundu] : []; d.satir = bulundu >= 0 ? 3 : 4;
                if (bulundu >= 0) d.sirali = [bulundu];
                const say = bulundu >= 0 ? bulundu + 1 : dizi.length;
                return {
                    adimlar: k.adimlar, son: d, sayac: say,
                    ozet: bulundu >= 0 ? `${aranan} sayısını ${bulundu + 1}. kartta (indeks ${bulundu}) buldun. ${say} kart çevirdin.` : `${aranan} dizide yok! Bunu anlamak için ${say} kartın hepsine bakmak zorundaydın.`
                };
            }
        },
        {
            id: 'ikili', ad: 'İkili Arama', sinif: [6, 12], ikon: 'fa-arrows-left-right-to-line', renk: '#1d5fd6',
            ozet: 'Kartlar sıralı! Her seferinde ortadaki karta bak, aramanın yarısını at.',
            kod: ['alt, ust = 0, len(dizi) - 1', 'while alt <= ust:', '    orta = (alt + ust) // 2', '    if dizi[orta] == aranan:', '        return orta', '    elif dizi[orta] < aranan:', '        alt = orta + 1', '    else:', '        ust = orta - 1', 'return -1'],
            uret() {
                const dizi = farkliSayilar(15, 1, 99).sort((a, b) => a - b);
                const var_ = Math.random() < 0.85;
                const aranan = var_ ? dizi[r(0, dizi.length - 1)] : (() => { let x; do { x = r(1, 99); } while (dizi.includes(x)); return x; })();
                const k = kaydedici();
                let alt = 0, ust = dizi.length - 1, bulundu = -1, say = 0;
                const d = { dizi, acik: [], vurgu: [], sirali: [], soluk: [], degisken: { aranan, alt, ust }, satir: 1, baslik: `Aranan: ${aranan}`, indeks: true };
                while (alt <= ust) {
                    const orta = (alt + ust) >> 1;
                    d.degisken = { aranan, alt, ust }; d.vurgu = []; d.satir = 3;
                    d.soluk = dizi.map((_, i) => i).filter(i => i < alt || i > ust);
                    k.sor(d, {
                        tur: 'kart', tiklanabilir: [alt, ust],
                        soru: `orta = (${alt} + ${ust}) // 2 kaç? Ortadaki karta tıkla.`,
                        beklenen: orta,
                        aciklama: `(${alt} + ${ust}) // 2 = ${orta}. // tam bölmedir, küsurat atılır.`
                    });
                    say++;
                    d.acik.push(orta); d.vurgu = [orta]; d.degisken.orta = orta; d.satir = 4;
                    const cevap = dizi[orta] === aranan ? 'bulundu' : dizi[orta] < aranan ? 'sag' : 'sol';
                    k.sor(d, {
                        soru: `dizi[${orta}] = ${dizi[orta]}, aranan ${aranan}. Ne yapmalı?`,
                        secenekler: [{ id: 'sol', ad: '← Sola (aranan daha küçük)' }, { id: 'bulundu', ad: 'Bulundu!' }, { id: 'sag', ad: 'Sağa (aranan daha büyük) →' }],
                        beklenen: cevap,
                        aciklama: cevap === 'bulundu' ? `${dizi[orta]} == ${aranan}` : cevap === 'sag' ? `${dizi[orta]} < ${aranan}, aranan sağ yarıda: alt = ${orta + 1}` : `${dizi[orta]} > ${aranan}, aranan sol yarıda: ust = ${orta - 1}`
                    });
                    if (cevap === 'bulundu') { bulundu = orta; break; }
                    if (cevap === 'sag') alt = orta + 1; else ust = orta - 1;
                }
                d.degisken = { aranan, alt, ust }; d.vurgu = bulundu >= 0 ? [bulundu] : [];
                d.soluk = bulundu >= 0 ? dizi.map((_, i) => i).filter(i => i !== bulundu) : dizi.map((_, i) => i);
                d.sirali = bulundu >= 0 ? [bulundu] : []; d.satir = bulundu >= 0 ? 5 : 10;
                const dogrusal = bulundu >= 0 ? bulundu + 1 : dizi.length;
                return {
                    adimlar: k.adimlar, son: d, sayac: say,
                    ozet: (bulundu >= 0 ? `${aranan} bulundu (indeks: ${bulundu}).` : `alt > ust oldu: ${aranan} dizide yok.`) +
                        ` Sadece ${say} karta baktın. Doğrusal arama ${dogrusal} karta bakardı. 1000 kartlık bir dizide ikili arama en fazla 10 karta bakar!`
                };
            }
        },
        {
            id: 'kabarcik', ad: 'Kabarcık Sıralama', sinif: [7, 12], ikon: 'fa-soap', renk: '#0ea5e9',
            ozet: 'Yan yana iki karta bak, büyük olan sağdaysa geç, soldaysa yer değiştir.',
            kod: ['n = len(dizi)', 'for i in range(n - 1):', '    for j in range(n - 1 - i):', '        if dizi[j] > dizi[j + 1]:', '            dizi[j], dizi[j + 1] = dizi[j + 1], dizi[j]'],
            uret() {
                const dizi = farkliSayilar(6, 1, 50);
                const n = dizi.length, k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: {}, satir: 1 };
                let say = 0, takas = 0;
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - 1 - i; j++) {
                        d.vurgu = [j, j + 1]; d.degisken = { i, j }; d.satir = 4;
                        const degis = d.dizi[j] > d.dizi[j + 1];
                        k.sor(d, {
                            soru: `${d.dizi[j]} ile ${d.dizi[j + 1]}: soldaki daha büyük mü?`,
                            secenekler: EVET_HAYIR('Yer değiştir ⇄', 'Olduğu gibi geç'),
                            beklenen: degis ? 'evet' : 'hayir', takas: degis ? [j, j + 1] : null,
                            aciklama: degis ? `${d.dizi[j]} > ${d.dizi[j + 1]}, büyük olan sağa geçmeli.` : `${d.dizi[j]} < ${d.dizi[j + 1]}, sıra doğru.`
                        });
                        say++;
                        if (degis) { [d.dizi[j], d.dizi[j + 1]] = [d.dizi[j + 1], d.dizi[j]]; takas++; }
                    }
                    d.sirali.push(n - 1 - i);
                }
                d.sirali.push(0); d.vurgu = []; d.degisken = {};
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: `Dizi sıralandı! ${say} karşılaştırma, ${takas} yer değiştirme yaptın. Her turda en büyük sayı bir kabarcık gibi en sona yükseldi.` };
            }
        },
        {
            id: 'secmeli', ad: 'Seçmeli Sıralama', sinif: [7, 12], ikon: 'fa-hand-pointer', renk: '#8b5cf6',
            ozet: 'Sıralanmamış kısımdaki en küçük kartı bul ve başa koy.',
            kod: ['for i in range(len(dizi) - 1):', '    enk = i', '    for j in range(i + 1, len(dizi)):', '        if dizi[j] < dizi[enk]:', '            enk = j', '    dizi[i], dizi[enk] = dizi[enk], dizi[i]'],
            uret() {
                const dizi = farkliSayilar(7, 1, 50);
                const n = dizi.length, k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: {}, satir: 1 };
                let say = 0;
                for (let i = 0; i < n - 1; i++) {
                    let enk = i;
                    for (let j = i + 1; j < n; j++) if (d.dizi[j] < d.dizi[enk]) enk = j;
                    say += n - 1 - i;
                    d.vurgu = []; d.degisken = { i }; d.satir = 3;
                    k.sor(d, {
                        tur: 'kart', tiklanabilir: [i, n - 1],
                        soru: `Sıralanmamış kısımdaki (indeks ${i} ve sonrası) en küçük karta tıkla.`,
                        beklenen: enk, takas: enk !== i ? [i, enk] : null,
                        aciklama: `En küçük ${d.dizi[enk]}; indeks ${i}'deki kartla yer değiştirir.`
                    });
                    [d.dizi[i], d.dizi[enk]] = [d.dizi[enk], d.dizi[i]];
                    d.sirali.push(i);
                }
                d.sirali.push(n - 1); d.vurgu = []; d.degisken = {}; d.satir = 6;
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: `Dizi sıralandı! En küçüğü bulmak için bilgisayar toplam ${say} karşılaştırma yapar; sen bunu gözünle yaptın. Ama yer değiştirme sadece ${n - 1} kez oldu.` };
            }
        },
        {
            id: 'eklemeli', ad: 'Eklemeli Sıralama', sinif: [9, 12], ikon: 'fa-layer-group', renk: '#e5484d',
            ozet: 'Elindeki kartı, soldaki sıralı kartların arasında doğru yere yerleştir.',
            kod: ['for i in range(1, len(dizi)):', '    anahtar = dizi[i]', '    j = i - 1', '    while j >= 0 and dizi[j] > anahtar:', '        dizi[j + 1] = dizi[j]', '        j -= 1', '    dizi[j + 1] = anahtar'],
            uret() {
                const dizi = farkliSayilar(6, 1, 50);
                const n = dizi.length, k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [0], soluk: [], degisken: {}, satir: 1, bosluk: null, anahtar: null };
                let say = 0;
                for (let i = 1; i < n; i++) {
                    const anahtar = d.dizi[i];
                    d.anahtar = anahtar; d.bosluk = i; d.dizi[i] = null;
                    let j = i - 1;
                    while (j >= 0) {
                        d.vurgu = [j]; d.degisken = { i, j, anahtar }; d.satir = 4;
                        const kaydir = d.dizi[j] > anahtar;
                        k.sor(d, {
                            soru: `${d.dizi[j]} > ${anahtar} mı? Evetse ${d.dizi[j]} sağa kayar.`,
                            secenekler: EVET_HAYIR(`Evet, ${d.dizi[j]} sağa kaysın`, `Hayır, ${anahtar} buraya yerleşsin`),
                            beklenen: kaydir ? 'evet' : 'hayir',
                            aciklama: kaydir ? `${d.dizi[j]} > ${anahtar}, kaydırılır.` : `${d.dizi[j]} < ${anahtar}, anahtar onun sağına yerleşir.`
                        });
                        say++;
                        if (!kaydir) break;
                        d.dizi[j + 1] = d.dizi[j]; d.dizi[j] = null; d.bosluk = j; j--;
                    }
                    d.dizi[j + 1] = anahtar; d.anahtar = null; d.bosluk = null;
                    d.sirali = [...Array(i + 1).keys()];
                }
                d.vurgu = []; d.degisken = {}; d.satir = 7;
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: `Dizi sıralandı! ${say} karşılaştırma yaptın. Kart oyuncuları elindeki kartları tam olarak böyle sıralar.` };
            }
        },
        {
            id: 'enkucuk', ad: 'En Küçüğü Bul', sinif: [3, 6], ikon: 'fa-arrow-down-short-wide', renk: '#14b8a6',
            ozet: 'Bu kez en küçük sayıyı arıyoruz. Şimdiye kadarki en küçüğü aklında tut.',
            kod: ['enk = dizi[0]', 'for x in dizi[1:]:', '    if x < enk:', '        enk = x', 'print(enk)'],
            uret() {
                const dizi = farkliSayilar(8, 1, 99);
                const k = kaydedici();
                const d = { dizi, acik: [0], vurgu: [], sirali: [], soluk: [], degisken: { enk: dizi[0] }, satir: 1, isaret: { 0: 'enk' } };
                for (let i = 1; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken.x = dizi[i]; d.satir = 3;
                    const kucuk = dizi[i] < d.degisken.enk;
                    k.sor(d, {
                        soru: `${dizi[i]}, şimdiye kadarki en küçükten (${d.degisken.enk}) küçük mü?`,
                        secenekler: EVET_HAYIR('Evet, yeni en küçük!', 'Hayır, devam'),
                        beklenen: kucuk ? 'evet' : 'hayir',
                        aciklama: kucuk ? `${dizi[i]} < ${d.degisken.enk}` : `${dizi[i]} > ${d.degisken.enk}`
                    });
                    if (kucuk) { d.degisken.enk = dizi[i]; d.isaret = { [i]: 'enk' }; }
                }
                d.vurgu = []; d.satir = 5; delete d.degisken.x;
                return { adimlar: k.adimlar, son: d, sayac: dizi.length - 1, ozet: `En küçük sayı ${d.degisken.enk}. En büyüğü bulmakla aynı algoritma; sadece karşılaştırma işareti ters döndü.` };
            }
        },
        {
            id: 'ciftsay', ad: 'Çiftleri Say', sinif: [3, 6], ikon: 'fa-calculator', renk: '#f97316',
            ozet: 'Bir sayaç tut: her çift sayıda sayacı 1 artır.',
            kod: ['sayac = 0', 'for x in dizi:', '    if x % 2 == 0:', '        sayac += 1', 'print(sayac)'],
            uret() {
                const dizi = Array.from({ length: 8 }, () => r(1, 40));
                const k = kaydedici();
                const d = { dizi, acik: [], vurgu: [], sirali: [], soluk: [], degisken: { sayac: 0 }, satir: 1 };
                for (let i = 0; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken.x = dizi[i]; d.satir = 3;
                    const cift = dizi[i] % 2 === 0;
                    k.sor(d, {
                        soru: `${dizi[i]} çift mi? (2'ye kalansız bölünüyor mu?)`,
                        secenekler: EVET_HAYIR('Çift: sayaç +1', 'Tek: sayaç aynı'),
                        beklenen: cift ? 'evet' : 'hayir',
                        aciklama: `${dizi[i]} % 2 = ${dizi[i] % 2}`
                    });
                    if (cift) { d.degisken.sayac++; d.sirali.push(i); } else d.soluk.push(i);
                }
                d.vurgu = []; d.satir = 5; delete d.degisken.x;
                return { adimlar: k.adimlar, son: d, sayac: dizi.length, ozet: `Dizide ${d.degisken.sayac} çift sayı var. Sayaç, programlarda bir şeyi saymanın en temel yoludur.` };
            }
        },
        {
            id: 'toplam', ad: 'Toplamı Bul', sinif: [4, 8], ikon: 'fa-plus', renk: '#22c55e',
            ozet: 'Toplamı 0\'dan başlat, her kartı toplama ekle.',
            kod: ['toplam = 0', 'for x in dizi:', '    toplam = toplam + x', 'print(toplam)'],
            uret() {
                const dizi = Array.from({ length: 6 }, () => r(2, 30));
                const k = kaydedici();
                const d = { dizi, acik: [], vurgu: [], sirali: [], soluk: [], degisken: { toplam: 0 }, satir: 1 };
                for (let i = 0; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken.x = dizi[i]; d.satir = 3;
                    const t = d.degisken.toplam, dogru = t + dizi[i];
                    const yanlislar = [dogru + (r(0, 1) ? 10 : -10), dogru + (r(0, 1) ? 1 : -1)].filter(v => v >= 0 && v !== dogru);
                    const secenek = [dogru, ...new Set(yanlislar)].slice(0, 3).sort((a, b) => a - b);
                    k.sor(d, {
                        soru: `toplam = ${t} + ${dizi[i]} = ?`,
                        secenekler: secenek.map(v => ({ id: String(v), ad: String(v) })),
                        beklenen: String(dogru),
                        aciklama: `${t} + ${dizi[i]} = ${dogru}`
                    });
                    d.degisken.toplam = dogru; d.sirali.push(i);
                }
                d.vurgu = []; d.satir = 4; delete d.degisken.x;
                return { adimlar: k.adimlar, son: d, sayac: dizi.length, ozet: `Toplam ${d.degisken.toplam}. Ortalama için toplamı kart sayısına (${dizi.length}) bölmek yeter: ${(d.degisken.toplam / dizi.length).toFixed(1)}` };
            }
        },
        {
            id: 'ters', ad: 'Diziyi Ters Çevir', sinif: [6, 12], ikon: 'fa-right-left', renk: '#a855f7',
            ozet: 'Baştaki ile sondaki kartı değiştir, sonra bir içeri gir. Ortada buluşunca bitti.',
            kod: ['sol, sag = 0, len(dizi) - 1', 'while sol < sag:', '    dizi[sol], dizi[sag] = dizi[sag], dizi[sol]', '    sol += 1', '    sag -= 1'],
            uret() {
                const dizi = farkliSayilar(r(6, 8), 1, 99);
                const n = dizi.length, k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: {}, satir: 1 };
                for (let sol = 0, sag = n - 1; sol < sag; sol++, sag--) {
                    d.vurgu = [sol]; d.degisken = { sol, sag }; d.satir = 3; d.isaret = { [sol]: 'sol' };
                    k.sor(d, {
                        tur: 'kart', tiklanabilir: [sol + 1, n - 1 - sol],
                        soru: `sol = ${sol}. Bu kart hangi kartla yer değiştirir? (sag = ${sag}) Tıkla.`,
                        beklenen: sag, takas: [sol, sag],
                        aciklama: `İndeks ${sol} ile indeks ${sag} yer değiştirir.`
                    });
                    [d.dizi[sol], d.dizi[sag]] = [d.dizi[sag], d.dizi[sol]];
                    d.sirali.push(sol, sag);
                }
                if (n % 2) d.sirali.push(n >> 1);
                d.vurgu = []; d.isaret = {}; d.degisken = {}; d.satir = 2;
                return { adimlar: k.adimlar, son: d, sayac: n >> 1, ozet: `${n} kartlık dizi ${n >> 1} yer değiştirmeyle ters döndü. İki işaretçi (sol, sag) tekniği birçok algoritmada kullanılır.` };
            }
        },
        {
            id: 'palindrom', ad: 'Palindrom mu?', sinif: [6, 10], ikon: 'fa-arrows-left-right', renk: '#ec4899',
            ozet: 'Dizi baştan ve sondan aynı okunuyor mu? İki uçtan içeri doğru karşılaştır.',
            kod: ['sol, sag = 0, len(dizi) - 1', 'while sol < sag:', '    if dizi[sol] != dizi[sag]:', '        return False', '    sol += 1', '    sag -= 1', 'return True'],
            uret() {
                const yari = Array.from({ length: r(3, 4) }, () => r(1, 9));
                const dizi = [...yari, ...(r(0, 1) ? [r(1, 9)] : []), ...[...yari].reverse()];
                if (Math.random() < 0.4) { const i = r(0, yari.length - 1); dizi[dizi.length - 1 - i] = (dizi[i] % 9) + 1; }
                const n = dizi.length, k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: {}, satir: 1 };
                let sonuc = true, say = 0;
                for (let sol = 0, sag = n - 1; sol < sag; sol++, sag--) {
                    d.vurgu = [sol, sag]; d.degisken = { sol, sag }; d.satir = 3;
                    const esit = dizi[sol] === dizi[sag];
                    k.sor(d, {
                        soru: `dizi[${sol}] = ${dizi[sol]}, dizi[${sag}] = ${dizi[sag]}. Eşit mi?`,
                        secenekler: EVET_HAYIR('Eşit, içeri gir', 'Farklı, palindrom değil!'),
                        beklenen: esit ? 'evet' : 'hayir',
                        aciklama: esit ? `${dizi[sol]} == ${dizi[sag]}` : `${dizi[sol]} ≠ ${dizi[sag]}`
                    });
                    say++;
                    if (!esit) { sonuc = false; break; }
                    d.sirali.push(sol, sag);
                }
                d.vurgu = []; d.degisken = {}; d.satir = sonuc ? 7 : 4;
                if (sonuc && n % 2) d.sirali.push(n >> 1);
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: sonuc ? `Dizi bir palindrom: baştan da sondan da ${dizi.join(' ')}. "Kayık", "ey edip adanada pide ye" gibi.` : `Palindrom değil. Farklı bir çift bulunca hemen durduk; geri kalanına bakmaya gerek yok.` };
            }
        },
        {
            id: 'tekrar', ad: 'Tekrar Eden Kart', sinif: [5, 9], ikon: 'fa-clone', renk: '#0891b2',
            ozet: 'Kartları sırayla aç. Daha önce gördüğün bir sayı gelirse bulundu!',
            kod: ['gorulen = set()', 'for x in dizi:', '    if x in gorulen:', '        return x', '    gorulen.add(x)'],
            uret() {
                const dizi = farkliSayilar(8, 1, 50);
                const tekrar = r(2, 7), kaynak = r(0, tekrar - 1);
                dizi[tekrar] = dizi[kaynak];
                const k = kaydedici();
                const d = { dizi, acik: [], vurgu: [], sirali: [], soluk: [], degisken: { 'görülen': '{}' }, satir: 1 };
                const gor = [];
                let bulunan = -1;
                for (let i = 0; i < dizi.length; i++) {
                    d.acik.push(i); d.vurgu = [i]; d.degisken = { x: dizi[i], 'görülen': `{${gor.join(', ')}}` }; d.satir = 3;
                    const var_ = gor.includes(dizi[i]);
                    k.sor(d, {
                        soru: `${dizi[i]} daha önce görülen sayılar arasında var mı?`,
                        secenekler: EVET_HAYIR('Var, tekrar bulundu!', 'Yok, kümeye ekle'),
                        beklenen: var_ ? 'evet' : 'hayir',
                        aciklama: var_ ? `${dizi[i]} kümede var.` : `${dizi[i]} ilk kez görülüyor.`
                    });
                    if (var_) { bulunan = i; break; }
                    gor.push(dizi[i]); d.soluk.push(i);
                }
                d.vurgu = [bulunan, dizi.indexOf(dizi[bulunan])]; d.sirali = [...d.vurgu]; d.satir = 4;
                return { adimlar: k.adimlar, son: d, sayac: bulunan + 1, ozet: `${dizi[bulunan]} tekrar ediyor (indeks ${dizi.indexOf(dizi[bulunan])} ve ${bulunan}). Küme (set) sayesinde her kartı yalnız bir kez açtık; her kartı diğerleriyle karşılaştırsaydık çok daha uzun sürerdi.` };
            }
        },
        {
            id: 'birlestir', ad: 'Birleştirme', sinif: [8, 12], ikon: 'fa-code-merge', renk: '#64748b',
            ozet: 'İki sıralı yığını tek sıralı yığına birleştir: her seferinde iki yığının başındaki küçük kartı al.',
            kod: ['i, j, sonuc = 0, 0, []', 'while i < len(sol) and j < len(sag):', '    if sol[i] <= sag[j]:', '        sonuc.append(sol[i]); i += 1', '    else:', '        sonuc.append(sag[j]); j += 1', 'sonuc += sol[i:] + sag[j:]'],
            uret() {
                const t = farkliSayilar(8, 1, 99);
                const sol = t.slice(0, 4).sort((a, b) => a - b), sag = t.slice(4).sort((a, b) => a - b);
                const dizi = [...sol, ...sag], k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: {}, satir: 1, baslik: 'Sonuç: (boş)' };
                const sonuc = [];
                let i = 0, j = 0, say = 0;
                while (i < 4 && j < 4) {
                    d.vurgu = [i, 4 + j]; d.isaret = { [i]: 'sol', [4 + j]: 'sağ' }; d.degisken = { i, j }; d.satir = 3;
                    const solAl = sol[i] <= sag[j];
                    k.sor(d, {
                        soru: `Soldaki yığının başı ${sol[i]}, sağdakinin başı ${sag[j]}. Hangisi sonuca eklenir?`,
                        secenekler: [{ id: 'sol', ad: `← ${sol[i]} (sol)` }, { id: 'sag', ad: `${sag[j]} (sağ) →` }],
                        beklenen: solAl ? 'sol' : 'sag',
                        aciklama: `Küçük olan ${Math.min(sol[i], sag[j])} alınır.`
                    });
                    say++;
                    if (solAl) { sonuc.push(sol[i]); d.soluk.push(i); i++; } else { sonuc.push(sag[j]); d.soluk.push(4 + j); j++; }
                    d.baslik = 'Sonuç: ' + sonuc.join(' ');
                }
                while (i < 4) { sonuc.push(sol[i]); d.soluk.push(i); i++; }
                while (j < 4) { sonuc.push(sag[j]); d.soluk.push(4 + j); j++; }
                d.dizi = sonuc; d.soluk = []; d.sirali = sonuc.map((_, x) => x); d.vurgu = []; d.isaret = {}; d.degisken = {}; d.satir = 7; d.baslik = 'Sonuç: ' + sonuc.join(' ');
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: `Birleştirme ${say} karşılaştırmada bitti; bir yığın bitince diğerinin kalanı olduğu gibi eklendi. Birleştirmeli Sıralama (merge sort) bu adımı tekrar tekrar kullanır.` };
            }
        },
        {
            id: 'pivot', ad: 'Pivotla Bölme', sinif: [9, 12], ikon: 'fa-scale-balanced', renk: '#b45309',
            ozet: 'Hızlı Sıralama\'nın kalbi: son kart pivot. Pivottan küçükleri sola topla, sonra pivotu araya koy.',
            kod: ['pivot = dizi[-1]', 'i = -1', 'for j in range(len(dizi) - 1):', '    if dizi[j] < pivot:', '        i += 1', '        dizi[i], dizi[j] = dizi[j], dizi[i]', 'dizi[i + 1], dizi[-1] = dizi[-1], dizi[i + 1]'],
            uret() {
                const dizi = farkliSayilar(7, 1, 60);
                const n = dizi.length, k = kaydedici(), pivot = dizi[n - 1];
                const d = { dizi, acik: dizi.map((_, x) => x), vurgu: [], sirali: [], soluk: [], degisken: { pivot, i: -1 }, satir: 1, isaret: { [n - 1]: 'pivot' } };
                let i = -1;
                for (let j = 0; j < n - 1; j++) {
                    d.vurgu = [j]; d.degisken = { pivot, i, j }; d.satir = 4;
                    const kucuk = d.dizi[j] < pivot;
                    k.sor(d, {
                        soru: `${d.dizi[j]} pivottan (${pivot}) küçük mü?`,
                        secenekler: EVET_HAYIR('Küçük: i += 1, sola al', 'Büyük: yerinde kalsın'),
                        beklenen: kucuk ? 'evet' : 'hayir', takas: kucuk && i + 1 !== j ? [i + 1, j] : null,
                        aciklama: kucuk ? `${d.dizi[j]} < ${pivot}: i = ${i + 1}, dizi[${i + 1}] ile dizi[${j}] yer değiştirir.` : `${d.dizi[j]} > ${pivot}`
                    });
                    if (kucuk) { i++; [d.dizi[i], d.dizi[j]] = [d.dizi[j], d.dizi[i]]; d.sirali.push(i); }
                }
                d.vurgu = []; d.degisken = { pivot, i }; d.satir = 7;
                k.sor(d, {
                    tur: 'kart', tiklanabilir: [0, n - 1],
                    soru: `Son adım: pivot (${pivot}) hangi indekse yerleşir? (i + 1 = ${i + 1}) O karta tıkla.`,
                    beklenen: i + 1, takas: i + 1 !== n - 1 ? [i + 1, n - 1] : null,
                    aciklama: `Pivot, küçüklerin hemen sağına: indeks ${i + 1}.`
                });
                [d.dizi[i + 1], d.dizi[n - 1]] = [d.dizi[n - 1], d.dizi[i + 1]];
                d.isaret = { [i + 1]: 'pivot' }; d.sirali = [i + 1]; d.soluk = []; d.vurgu = [];
                return { adimlar: k.adimlar, son: d, sayac: n - 1, ozet: `Pivot ${pivot} artık kesin yerinde (indeks ${i + 1}): solundakilerin hepsi küçük, sağındakilerin hepsi büyük. Hızlı Sıralama aynı işi sol ve sağ parçalara da uygular.` };
            }
        },
        {
            id: 'ikitoplam', ad: 'İki Toplam', sinif: [10, 12], ikon: 'fa-bullseye', renk: '#dc2626',
            ozet: 'Sıralı dizide toplamı hedefe eşit iki kart bul. Biri baştan, biri sondan başlar.',
            kod: ['sol, sag = 0, len(dizi) - 1', 'while sol < sag:', '    t = dizi[sol] + dizi[sag]', '    if t == hedef:', '        return sol, sag', '    elif t < hedef:', '        sol += 1', '    else:', '        sag -= 1'],
            uret() {
                const dizi = farkliSayilar(9, 1, 60).sort((a, b) => a - b);
                const n = dizi.length;
                let a = r(0, n - 2), b = r(a + 1, n - 1);
                let hedef = dizi[a] + dizi[b];
                if (Math.random() < 0.15) { do { hedef = r(10, 110); } while (dizi.some((x, i) => dizi.some((y, j) => i < j && x + y === hedef))); }
                const k = kaydedici();
                const d = { dizi, acik: dizi.map((_, i) => i), vurgu: [], sirali: [], soluk: [], degisken: { hedef }, satir: 1, baslik: `Hedef toplam: ${hedef}` };
                let sol = 0, sag = n - 1, say = 0, bulundu = null;
                while (sol < sag) {
                    const t = dizi[sol] + dizi[sag];
                    d.vurgu = [sol, sag]; d.isaret = { [sol]: 'sol', [sag]: 'sag' }; d.degisken = { hedef, sol, sag, t }; d.satir = 4;
                    d.soluk = dizi.map((_, i) => i).filter(i => i < sol || i > sag);
                    const cevap = t === hedef ? 'bulundu' : t < hedef ? 'sol' : 'sag';
                    k.sor(d, {
                        soru: `${dizi[sol]} + ${dizi[sag]} = ${t}, hedef ${hedef}. Ne yapmalı?`,
                        secenekler: [{ id: 'sol', ad: 'Toplam küçük: sol →' }, { id: 'bulundu', ad: 'Bulundu!' }, { id: 'sag', ad: '← sag: Toplam büyük' }],
                        beklenen: cevap,
                        aciklama: cevap === 'bulundu' ? `${t} == ${hedef}` : cevap === 'sol' ? `${t} < ${hedef}: daha büyük bir sayı lazım, sol bir sağa kayar.` : `${t} > ${hedef}: daha küçük bir sayı lazım, sag bir sola kayar.`
                    });
                    say++;
                    if (cevap === 'bulundu') { bulundu = [sol, sag]; break; }
                    if (cevap === 'sol') sol++; else sag--;
                }
                d.vurgu = []; d.isaret = {}; d.soluk = []; d.sirali = bulundu || []; d.satir = bulundu ? 5 : 2;
                return { adimlar: k.adimlar, son: d, sayac: say, ozet: (bulundu ? `${dizi[bulundu[0]]} + ${dizi[bulundu[1]]} = ${hedef}! ` : `Hedefi veren iki kart yok. `) + `${say} adımda bitti. Her ikiliyi tek tek denesek ${n * (n - 1) / 2} deneme gerekebilirdi.` };
            }

        }
    ];

    const api = { ALGORITMALAR };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.AlgoMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
