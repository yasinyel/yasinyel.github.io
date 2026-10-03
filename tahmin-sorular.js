// Kodlayalım — Ne Yazar? soru üreticileri
// Her üretici rastgele sayılarla yeni bir Python sorusu üretir: { kod, cevap, aciklama }
// cevap: ekranda görünecek çıktı (birden çok satır "\n" ile)
(function (root) {
    'use strict';

    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const sec = (d) => d[Math.floor(Math.random() * d.length)];
    const farkli = (a, b, haric) => { let x; do { x = r(a, b); } while (x === haric); return x; };
    const py = (v) => (v ? 'True' : 'False');

    const ISIMLER = ['Ayşe', 'Mehmet', 'Elif', 'Can', 'Zeynep', 'Emir', 'Defne', 'Yusuf', 'Ada', 'Kerem'];
    const KELIMELER = ['bilgisayar', 'klavye', 'python', 'algoritma', 'ekran', 'fare', 'yazılım', 'internet', 'robot', 'kodlama'];

    const SEVIYELER = [
        {
            baslik: 'Değişkenler ve İşlemler',
            ozet: 'Atama, dört işlem, işlem önceliği, // ve %',
            uretici: [
                () => {
                    const a = r(2, 15), b = r(2, 15);
                    return { kod: `x = ${a}\ny = ${b}\nprint(x + y)`, cevap: String(a + b), aciklama: `x'in değeri ${a}, y'nin değeri ${b}. Toplamları ${a + b}.` };
                },
                () => {
                    const a = r(2, 9), b = r(2, 9);
                    const s = (a + b) * 2;
                    return {
                        kod: `sayi = ${a}\nsayi = sayi + ${b}\nsayi = sayi * 2\nprint(sayi)`, cevap: String(s),
                        aciklama: `Değişkenin değeri satır satır değişir: ${a} → ${a + b} → ${s}.`
                    };
                },
                () => {
                    const a = r(2, 9), b = r(2, 6), c = r(2, 6);
                    return { kod: `print(${a} + ${b} * ${c})`, cevap: String(a + b * c), aciklama: `Çarpma, toplamadan önce yapılır: ${b} * ${c} = ${b * c}, sonra ${a} + ${b * c} = ${a + b * c}.` };
                },
                () => {
                    const k = r(3, 5), e = r(10, 30);
                    return {
                        kod: `elma = ${e}\nkisi = ${k}\nprint(elma // kisi)\nprint(elma % kisi)`,
                        cevap: `${Math.floor(e / k)}\n${e % k}`,
                        aciklama: `// tam bölme yapar: ${e} // ${k} = ${Math.floor(e / k)}. % bölümden kalanı verir: ${e} % ${k} = ${e % k}.`
                    };
                },
                () => {
                    const a = r(2, 20), b = farkli(2, 20, a);
                    return {
                        kod: `x = ${a}\ny = x\nx = ${b}\nprint(y)`, cevap: String(a),
                        aciklama: `y = x satırında y, x'in o anki değerini (${a}) alır. x sonradan değişse de y değişmez.`
                    };
                }
            ]
        },
        {
            baslik: 'Metinler',
            ozet: 'Metin birleştirme, uzunluk, harf numaraları',
            uretici: [
                () => {
                    const ad = sec(ISIMLER);
                    return { kod: `ad = "${ad}"\nprint("Merhaba " + ad)`, cevap: `Merhaba ${ad}`, aciklama: 'Metinler + ile yan yana eklenir. "Merhaba " sonundaki boşluk da çıktıya dahildir.' };
                },
                () => {
                    const s = sec(['ha', 'la', 'ok', 'ya', 'zı']), n = r(2, 4);
                    return { kod: `print("${s}" * ${n})`, cevap: s.repeat(n), aciklama: `Bir metni sayıyla çarpmak onu o kadar kez tekrarlar.` };
                },
                () => {
                    const k = sec(KELIMELER);
                    return { kod: `kelime = "${k}"\nprint(len(kelime))`, cevap: String([...k].length), aciklama: `len() metindeki karakter sayısını verir: "${k}" ${[...k].length} harftir.` };
                },
                () => {
                    const k = sec(KELIMELER), i = r(0, Math.min(4, k.length - 1));
                    return {
                        kod: `kelime = "${k}"\nprint(kelime[${i}])`, cevap: [...k][i],
                        aciklama: `Python'da sayma 0'dan başlar! kelime[0] ilk harftir, yani kelime[${i}] ${i + 1}. harf olan "${[...k][i]}".`
                    };
                },
                () => {
                    const a = r(1, 9), b = r(1, 9);
                    return {
                        kod: `a = "${a}"\nb = "${b}"\nprint(a + b)`, cevap: `${a}${b}`,
                        aciklama: `Tırnak içindeki ${a} ve ${b} birer sayı değil, metindir. Metinler toplanmaz, yan yana eklenir: "${a}${b}".`
                    };
                }
            ]
        },
        {
            baslik: 'Koşullar',
            ozet: 'if / elif / else, karşılaştırma, and / or',
            uretici: [
                () => {
                    const n = r(25, 100);
                    return {
                        kod: `puan = ${n}\nif puan >= 50:\n    print("Geçti")\nelse:\n    print("Kaldı")`,
                        cevap: n >= 50 ? 'Geçti' : 'Kaldı', aciklama: `${n} >= 50 ${n >= 50 ? 'doğru' : 'yanlış'}, bu yüzden ${n >= 50 ? 'if' : 'else'} bloğu çalışır.`
                    };
                },
                () => {
                    const t = r(-5, 40);
                    const c = t > 30 ? 'Sıcak' : t > 15 ? 'Ilık' : 'Soğuk';
                    return {
                        kod: `sicaklik = ${t}\nif sicaklik > 30:\n    print("Sıcak")\nelif sicaklik > 15:\n    print("Ilık")\nelse:\n    print("Soğuk")`,
                        cevap: c, aciklama: 'Koşullar yukarıdan aşağıya denenir; ilk doğru olan çalışır ve diğerlerine bakılmaz.'
                    };
                },
                () => {
                    const a = r(1, 20), b = r(1, 20);
                    const op = sec(['>', '<', '==', '!=']);
                    const v = op === '>' ? a > b : op === '<' ? a < b : op === '==' ? a === b : a !== b;
                    return { kod: `a = ${a}\nb = ${b}\nprint(a ${op} b)`, cevap: py(v), aciklama: `Karşılaştırmanın sonucu True (doğru) ya da False (yanlış) olur. ${a} ${op} ${b} → ${py(v)}.` };
                },
                () => {
                    const x = r(1, 20), ve = Math.random() < 0.5;
                    const v = ve ? (x > 5 && x < 15) : (x < 5 || x > 15);
                    const kod = ve ? `x = ${x}\nprint(x > 5 and x < 15)` : `x = ${x}\nprint(x < 5 or x > 15)`;
                    return {
                        kod, cevap: py(v),
                        aciklama: ve ? '"and" için iki koşulun da doğru olması gerekir.' : '"or" için koşullardan birinin doğru olması yeter.'
                    };
                },
                () => {
                    const n = r(10, 99);
                    return {
                        kod: `sayi = ${n}\nif sayi % 2 == 0:\n    print("Çift")\nelse:\n    print("Tek")`,
                        cevap: n % 2 === 0 ? 'Çift' : 'Tek', aciklama: `${n} % 2 = ${n % 2}. Kalan 0 ise sayı çifttir.`
                    };
                }
            ]
        },
        {
            baslik: 'Döngüler',
            ozet: 'for, range, while, sayaçlar',
            uretici: [
                () => {
                    const n = r(2, 5);
                    return {
                        kod: `for i in range(${n}):\n    print(i)`, cevap: [...Array(n).keys()].join('\n'),
                        aciklama: `range(${n}) 0'dan başlar ve ${n}'e kadar gider ama ${n}'i dahil etmez: 0..${n - 1}.`
                    };
                },
                () => {
                    const n = r(3, 8);
                    return {
                        kod: `toplam = 0\nfor i in range(1, ${n + 1}):\n    toplam = toplam + i\nprint(toplam)`,
                        cevap: String(n * (n + 1) / 2), aciklama: `1'den ${n}'e kadar olan sayılar toplanır. print döngünün dışında olduğu için sadece bir kez yazar.`
                    };
                },
                () => {
                    const a = r(1, 3), b = a + r(2, 3), k = r(2, 5);
                    const satirlar = [];
                    for (let i = a; i < b; i++) satirlar.push(i * k);
                    return { kod: `for i in range(${a}, ${b}):\n    print(i * ${k})`, cevap: satirlar.join('\n'), aciklama: `i sırasıyla ${satirlar.map((_, j) => a + j).join(', ')} olur; her seferinde ${k} ile çarpılıp yazılır.` };
                },
                () => {
                    const x0 = r(1, 3), lim = r(10, 40);
                    let x = x0; const iz = [x];
                    while (x < lim) { x *= 2; iz.push(x); }
                    return {
                        kod: `x = ${x0}\nwhile x < ${lim}:\n    x = x * 2\nprint(x)`, cevap: String(x),
                        aciklama: `x şöyle değişir: ${iz.join(' → ')}. ${x} < ${lim} yanlış olunca döngü durur.`
                    };
                },
                () => {
                    const k = sec(['kalabalık', 'araba', 'masa', 'kanat', 'bahar', 'salata', 'karakalem']);
                    const say = [...k].filter(h => h === 'a').length;
                    return {
                        kod: `sayac = 0\nfor harf in "${k}":\n    if harf == "a":\n        sayac = sayac + 1\nprint(sayac)`,
                        cevap: String(say), aciklama: `Döngü kelimenin her harfine tek tek bakar ve "a" harflerini sayar.`
                    };
                },
                () => {
                    const n = r(3, 5);
                    return {
                        kod: `for i in range(${n}):\n    print("*" * (i + 1))`,
                        cevap: [...Array(n).keys()].map(i => '*'.repeat(i + 1)).join('\n'),
                        aciklama: 'i 0 iken 1 yıldız, 1 iken 2 yıldız yazılır… Bir üçgen oluşur!'
                    };
                }
            ]
        },
        {
            baslik: 'Listeler ve Fonksiyonlar',
            ozet: 'Liste elemanları, append, def ve return',
            uretici: [
                () => {
                    const l = Array.from({ length: 5 }, () => r(1, 50)), i = r(0, 4);
                    return { kod: `sayilar = [${l.join(', ')}]\nprint(sayilar[${i}])`, cevap: String(l[i]), aciklama: `Listelerde de sayma 0'dan başlar. sayilar[${i}], listenin ${i + 1}. elemanıdır.` };
                },
                () => {
                    const l = Array.from({ length: r(3, 6) }, () => r(1, 50));
                    return { kod: `sayilar = [${l.join(', ')}]\nprint(sayilar[-1])`, cevap: String(l[l.length - 1]), aciklama: 'Eksi sayılar sondan saymayı sağlar: [-1] her zaman son elemandır.' };
                },
                () => {
                    const l = sec([['elma', 'armut'], ['kalem', 'silgi', 'defter'], ['kedi']]), n = r(1, 3);
                    let kod = `liste = [${l.map(x => `"${x}"`).join(', ')}]\n`;
                    for (let i = 0; i < n; i++) kod += `liste.append("yeni")\n`;
                    return { kod: kod + 'print(len(liste))', cevap: String(l.length + n), aciklama: `Listede ${l.length} eleman vardı, append ile ${n} tane eklendi.` };
                },
                () => {
                    const n = r(2, 9);
                    return {
                        kod: `def kare(x):\n    return x * x\n\nprint(kare(${n}) + 1)`, cevap: String(n * n + 1),
                        aciklama: `kare(${n}) fonksiyonu ${n * n} değerini geri döndürür, üstüne 1 eklenir.`
                    };
                },
                () => {
                    const a = r(1, 9), b = r(1, 9);
                    return {
                        kod: `def hesapla(a, b):\n    return a * 2 + b\n\nprint(hesapla(${a}, ${b}))`, cevap: String(a * 2 + b),
                        aciklama: `a = ${a}, b = ${b} olarak fonksiyona girer: ${a} * 2 + ${b} = ${a * 2 + b}.`
                    };
                },
                () => {
                    const l = Array.from({ length: r(3, 5) }, () => r(1, 20));
                    return {
                        kod: `toplam = 0\nfor s in [${l.join(', ')}]:\n    toplam = toplam + s\nprint(toplam)`,
                        cevap: String(l.reduce((x, y) => x + y, 0)), aciklama: 'Döngü listedeki her sayıyı sırayla toplama ekler.'
                    };
                },
                () => {
                    const a = sec(ISIMLER), b = sec(ISIMLER.filter(x => x !== a));
                    return {
                        kod: `def selamla(ad):\n    print("Merhaba " + ad)\n\nselamla("${a}")\nselamla("${b}")`,
                        cevap: `Merhaba ${a}\nMerhaba ${b}`, aciklama: 'Fonksiyon tanımlandığında çalışmaz; her çağrıldığında çalışır. İki kez çağrıldı.'
                    };
                }
            ]
        }
    ];

    // Cevap karşılaştırma: satır başı/sonu boşlukları ve boş satırlar önemsiz
    function normalize(s) {
        return s.replace(/\r/g, '').split('\n').map(x => x.trim().replace(/\s+/g, ' ')).filter(x => x !== '').join('\n');
    }

    function kontrol(girilen, dogru) {
        const g = normalize(girilen), d = normalize(dogru);
        if (g === d) return { dogru: true };
        let ipucu = '';
        if (/^["'].*["']$/m.test(g) && normalize(g.replace(/["']/g, '')) === d) ipucu = 'Neredeyse! print tırnak işaretlerini ekrana yazmaz.';
        else if (g.toLowerCase() === d.toLowerCase()) ipucu = 'Neredeyse! Büyük/küçük harflere dikkat et.';
        else if (g.replace(/\n/g, ' ') === d.replace(/\n/g, ' ')) ipucu = 'Neredeyse! Her print ayrı bir satıra yazar.';
        return { dogru: false, ipucu };
    }

    const api = { SEVIYELER, kontrol, normalize };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.TahminSorular = api;
})(typeof window !== 'undefined' ? window : globalThis);
