// KodLab — "Algoritma Sensin" motoru
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
        }
    ];

    const api = { ALGORITMALAR };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.AlgoMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
