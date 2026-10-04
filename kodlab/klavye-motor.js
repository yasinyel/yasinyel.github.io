// Kodlayalım — Klavye Ustası motoru: Türkçe Q klavye düzeni, parmak eşlemesi, dersler ve metin üretici
(function (root) {
    'use strict';

    // Türkçe Q klavye (küçük harf). Her satır: [tuş, ...]
    const DUZEN = [
        ['"', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '-'],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i', ','],
        ['<', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '.'],
        [' ']
    ];
    // Parmaklar: 0 sol serçe, 1 sol yüzük, 2 sol orta, 3 sol işaret, 4 sol başparmak, 5 sağ başparmak, 6 sağ işaret, 7 sağ orta, 8 sağ yüzük, 9 sağ serçe
    const PARMAK_ADLARI = ['Sol serçe', 'Sol yüzük', 'Sol orta', 'Sol işaret', 'Sol başparmak', 'Sağ başparmak', 'Sağ işaret', 'Sağ orta', 'Sağ yüzük', 'Sağ serçe'];
    const PARMAK_RENK = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#94a3b8', '#94a3b8', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];
    const PARMAK = {};
    const ata = (p, s) => [...s].forEach(c => { PARMAK[c] = p; });
    ata(0, '"1qaz<'); ata(1, '2wsx'); ata(2, '3edc'); ata(3, '45rtfgvb');
    ata(6, '67yuhjnm'); ata(7, '8ıkö'); ata(8, '9olç'); ata(9, '0*-pğüşi,.');
    PARMAK[' '] = 5;
    // Büyük harfler küçük harfin parmağıyla basılır (karşı eldeki Shift ile)
    const kucuk = (c) => c.toLocaleLowerCase('tr-TR');
    const parmak = (c) => PARMAK[c] ?? PARMAK[kucuk(c)];
    const ANA_SIRA = { f: true, j: true }; // tırtıklı tuşlar

    // Türkçe kelimeler (bilişim ağırlıklı ve günlük), metin üreticisi bunları izin verilen harflere göre süzer
    const KELIMELER = ('ağ ad af ak al alan alt ana anla arka aş at ay az baba bak bal bas basit bayt bekle beş bil bilgi bilgisayar bit blok bu bul cep çiz çizgi daha dal dalga dans dede değer değişken dene deniz ders dijital dik dil dili disk dosya döngü dön düz ekle ekran el elle eş et fal fare fasıl fil fikir fiş gaz gel ger gez git göz gül hak hal hala hali has hata hayal haz hece hız ılık ırk ışık iki ikilik il ile ilk iş işle jel kaç kafa kal kale kalem kalk kâr kart kas kasa kaş kaşık kaz kek kel kes kılık kış kız kitap klavye kod kodla kol kural kutu laf lale lira liste mal masa menü mesaj mod modem not oda ok oku okul olay ona orta oyun ödev öğren pil piksel posta program renk robot sal sala salı salla sana saf sağ say sayı sel ses sınıf sil sinyal site soru şaka şal şiş şifre tablet tak tara tasarım tek tel test tık tuş tut uç uygulama veri yaz yazı yaz yeni yol yön zar zil ağaç akıl alfa ara arı asal baskı biçim bilgiç çıkış dik düğme ekle fiyat göster hafıza hesap kablo kopya kayıt kaydet klasör konum mantık menüler okuma paylaş satır sıra sunucu süre şebeke tarayıcı tasarla uzay yapay yardım yazıcı yedek zekâ').split(' ').filter((k, i, l) => /^[a-zçğıöşü]+$/.test(k) && l.indexOf(k) === i);
    const CUMLELER = [
        'Bilgisayar verileri sıfır ve birlerle saklar.',
        'Güçlü bir şifre en az on iki karakterden oluşur.',
        'Algoritma bir işi yapmak için sıralı adımlardır.',
        'Döngüler aynı işi tekrar tekrar yapmamızı sağlar.',
        'Klavyede bakmadan yazmak zaman kazandırır.',
        'İnternette paylaştığımız her şey iz bırakır.',
        'Robotu hedefe götürmek için doğru komutları seç.',
        'Bir piksel ekrandaki en küçük renkli noktadır.',
        'Makine öğrenmesi programların örneklerden öğrenmesidir.',
        'Hata ayıklamak programcının en önemli becerisidir.',
        'Web sayfaları HTML ile yazılır, CSS ile süslenir.',
        'Bir bayt sekiz bitten oluşur.',
        'Paylaşmadan önce haberin kaynağını kontrol et.',
        'Python öğrenmesi kolay ve güçlü bir dildir.',
        'Sensörler ortamdan bilgi toplar ve karta gönderir.',
        'Değişkenler bilgileri saklayan isimli kutulardır.',
        'Bilgisayarı kapatmadan önce dosyalarını kaydet.',
        'Ekran başında uzun süre oturduktan sonra mola ver.'
    ];

    // Dersler: yeni tuşlar ve o derste kullanılabilecek bütün tuşlar
    const DERSLER = [];
    let izinli = ' ';
    const ders = (ad, yeni, ek = {}) => { izinli += yeni; DERSLER.push({ ad, yeni: [...yeni].filter(c => c !== ' '), izinli: izinli, ...ek }); };
    ders('Ana sıra: f ve j', 'fj', { ipucu: 'İşaret parmaklarını f ve j tuşlarındaki küçük çıkıntılara koy. Başparmakların boşlukta.' });
    ders('Orta parmaklar: d ve k', 'dk');
    ders('Yüzük parmaklar: s ve l', 'sl');
    ders('Serçe parmaklar: a ve ş', 'aş');
    ders('İşaret parmakları içe: g ve h', 'gh');
    ders('Ana sıranın sonu: i', 'i', { ipucu: 'Türkçe Q klavyede "i" sağ serçe parmağınla, ş tuşunun sağında.' });
    ders('Üst sıra: e ve ı', 'eı');
    ders('Üst sıra: r ve u', 'ru');
    ders('Üst sıra: t ve y', 'ty');
    ders('Üst sıra: o ve w', 'ow');
    ders('Üst sıra: p ve q', 'pq');
    ders('Türkçe harfler: ğ ve ü', 'ğü');
    ders('Alt sıra: c ve ö', 'cö');
    ders('Alt sıra: v ve m', 'vm');
    ders('Alt sıra: b ve n', 'bn');
    ders('Alt sıra: x, ç ve z', 'xçz');
    ders('Noktalama: virgül ve nokta', ',.');
    ders('Bütün harfler: kelimeler', '', { kelime: true });
    ders('Büyük harf ve cümleler', '', { cumle: true, ipucu: 'Büyük harf için karşı eldeki Shift tuşuna serçe parmağınla bas.' });
    ders('Rakamlar', '1234567890', { ipucu: 'Rakamlara uzanırken parmağını ana sıradan ayırıp geri getir.' });

    function uretec(tohum) {
        let s = (tohum >>> 0) || 1;
        const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
        r.sec = (l) => l[Math.floor(r() * l.length)];
        return r;
    }
    const izinliMi = (kelime, izin) => [...kelime].every(c => izin.includes(c));

    // Bir ders için yaklaşık "uzunluk" karakterlik alıştırma metni üretir
    function metinUret(d, tohum, uzunluk = 120) {
        const r = uretec(tohum);
        if (d.cumle) {
            const l = []; let n = 0;
            while (n < uzunluk) { const c = r.sec(CUMLELER); if (!l.includes(c)) { l.push(c); n += c.length + 1; } }
            return l.join(' ');
        }
        const kelimeler = KELIMELER.filter(k => k.length >= 2 && izinliMi(k, d.izinli));
        const yeniKelime = kelimeler.filter(k => d.yeni.some(y => k.includes(y)));
        const harf = d.izinli.replace(/ /g, '');
        const parcalar = [];
        let n = 0;
        while (n < uzunluk) {
            let p;
            const t = r();
            if (d.yeni.length && (t < 0.35 || !yeniKelime.length)) {
                // Yeni tuşları pekiştiren harf grupları: "fff jjj fj"
                const a = r.sec(d.yeni), b = r.sec(d.yeni.length > 1 ? d.yeni : harf);
                p = r() < 0.5 ? a.repeat(3) : (a + b + (r() < 0.5 ? a : b));
            } else if (yeniKelime.length && t < 0.75) p = r.sec(yeniKelime);
            else if (kelimeler.length) p = r.sec(kelimeler);
            else p = Array.from({ length: 3 + Math.floor(r() * 2) }, () => r.sec([...harf])).join('');
            parcalar.push(p); n += p.length + 1;
        }
        return parcalar.join(' ');
    }

    // Hız: dakikada kelime (standart: 5 karakter = 1 kelime). Doğruluk: doğru vuruş / bütün vuruşlar
    function istatistik(dogru, yanlis, ms) {
        const dk = Math.max(ms, 1000) / 60000;
        return { kdk: Math.round(dogru / 5 / dk), dogruluk: dogru + yanlis ? Math.round(dogru / (dogru + yanlis) * 1000) / 10 : 100 };
    }
    const yildiz = (dogruluk) => dogruluk >= 97 ? 3 : dogruluk >= 92 ? 2 : 1;

    // Kelime yağmuru için seviyeye uygun kelimeler
    function yagmurKelimeleri(seviye) {
        const d = DERSLER[Math.min(seviye, DERSLER.length - 3)];
        const l = KELIMELER.filter(k => izinliMi(k, d.izinli) && k.length >= 2 && k.length <= 4 + seviye);
        return l.length >= 8 ? l : KELIMELER.filter(k => k.length <= 6);
    }

    const api = { DUZEN, PARMAK, PARMAK_ADLARI, PARMAK_RENK, ANA_SIRA, parmak, KELIMELER, CUMLELER, DERSLER, uretec, metinUret, istatistik, yildiz, yagmurKelimeleri };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Klavye = api;
})(typeof window !== 'undefined' ? window : globalThis);
