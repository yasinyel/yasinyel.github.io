// Kodlayalım — Gizli Mesaj motoru: Türk alfabesiyle Sezar ve Vigenère şifreleri, frekans analizi
(function (root) {
    'use strict';

    const ALFABE = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
    const N = ALFABE.length; // 29
    const SIRA = Object.fromEntries(ALFABE.map((h, i) => [h, i]));
    const buyut = (s) => s.toLocaleUpperCase('tr');

    // Alfabe dışındaki karakterler (boşluk, noktalama) olduğu gibi kalır
    function sezar(metin, k) {
        k = ((k % N) + N) % N;
        return [...buyut(metin)].map(h => h in SIRA ? ALFABE[(SIRA[h] + k) % N] : h).join('');
    }

    function vigenere(metin, anahtar, coz = false) {
        const a = [...buyut(anahtar)].filter(h => h in SIRA).map(h => SIRA[h]);
        if (!a.length) return buyut(metin);
        let j = 0;
        return [...buyut(metin)].map(h => {
            if (!(h in SIRA)) return h;
            const k = a[j++ % a.length];
            return ALFABE[(SIRA[h] + (coz ? N - k : k)) % N];
        }).join('');
    }

    function frekans(metin) {
        const say = Object.fromEntries(ALFABE.map(h => [h, 0]));
        let toplam = 0;
        for (const h of buyut(metin)) if (h in SIRA) { say[h]++; toplam++; }
        return ALFABE.map(h => toplam ? say[h] / toplam * 100 : 0);
    }

    // Türkçe metinlerde harflerin yaklaşık kullanım yüzdeleri
    const TR_FREKANS = [11.92, 2.84, 0.96, 1.16, 4.71, 8.91, 0.46, 1.25, 1.12, 1.18, 5.11, 8.60, 0.03, 4.68, 5.75, 3.75, 7.49, 2.48, 0.78, 0.89, 6.95, 3.01, 1.78, 3.31, 3.24, 1.85, 0.96, 3.34, 1.50];

    // Frekans analiziyle Sezar anahtarını tahmin et (en iyi örtüşen kaydırma)
    function frekansCoz(sifreli) {
        const f = frekans(sifreli);
        let enIyi = 0, enAz = Infinity;
        for (let k = 0; k < N; k++) {
            let fark = 0;
            for (let i = 0; i < N; i++) fark += (f[(i + k) % N] - TR_FREKANS[i]) ** 2;
            if (fark < enAz) { enAz = fark; enIyi = k; }
        }
        return enIyi;
    }

    // Bilişim temalı cümleler ve kelimeler
    const KELIMELER = ['KOD', 'ROBOT', 'PİKSEL', 'DÖNGÜ', 'ŞİFRE', 'VERİ', 'BİLGİ', 'YAZILIM', 'DONANIM', 'AĞ', 'SUNUCU', 'İŞLEMCİ', 'BELLEK', 'KLAVYE', 'EKRAN', 'ALGORİTMA', 'DEĞİŞKEN', 'FONKSİYON', 'BAYT', 'TABLET'];
    const CUMLELER = [
        'BİLGİSAYAR SADECE SIFIR VE BİR ANLAR',
        'GÜÇLÜ BİR ŞİFRE EN AZ ON İKİ KARAKTER OLMALI',
        'ALGORİTMA BİR PROBLEMİN ÇÖZÜM ADIMLARIDIR',
        'İNTERNETTE KİŞİSEL BİLGİLERİNİ PAYLAŞMA',
        'YAZILIMDAKİ HATALARA BÖCEK DENİR',
        'BİR BAYT SEKİZ BİTTEN OLUŞUR',
        'İŞLEMCİ BİLGİSAYARIN BEYNİDİR',
        'ŞİFRENİ KİMSEYLE PAYLAŞMA',
        'DÖNGÜLER TEKRAR EDEN İŞLERİ KISALTIR',
        'TANIMADIĞIN KİŞİLERDEN GELEN BAĞLANTILARA TIKLAMA',
        'VERİLER İNTERNETTE PAKETLER HALİNDE YOLCULUK EDER',
        'ROBOTLAR KODLA HAREKET EDER'
    ];
    // Frekans analizi için uzun metinler (kısa metinde frekans yanıltıcı olur)
    const UZUN_METINLER = [
        'BİLGİSAYARLAR HER ŞEYİ SIFIR VE BİRLERLE SAKLAR. BİR RESİM, BİR ŞARKI YA DA BİR METİN ASLINDA ÇOK UZUN BİR SAYI DİZİSİDİR. BU SAYILARI DOĞRU ŞEKİLDE YORUMLAYAN PROGRAMLAR SAYESİNDE EKRANDA RESİMLERİ GÖRÜR, HOPARLÖRDEN SESLERİ DUYARIZ.',
        'İNTERNETTE GÜVENDE KALMAK İÇİN HER HESAPTA FARKLI VE UZUN BİR ŞİFRE KULLANMALISIN. ŞİFRENİ ARKADAŞLARINLA BİLE PAYLAŞMAMALISIN. TANIMADIĞIN KİŞİLERDEN GELEN MESAJLARDAKİ BAĞLANTILARA TIKLAMADAN ÖNCE MUTLAKA BİR YETİŞKİNE DANIŞMALISIN.',
        'ALGORİTMA BİR İŞİ YAPMAK İÇİN İZLENEN ADIMLARIN SIRALI LİSTESİDİR. YEMEK TARİFLERİ, YOL TARİFLERİ VE OYUN KURALLARI DA BİRER ALGORİTMADIR. PROGRAMCILAR ALGORİTMALARI BİLGİSAYARIN ANLAYACAĞI BİR DİLE ÇEVİRİR VE BUNA KODLAMA DENİR.',
        'ŞİFRELEME SAYESİNDE İNTERNETTE GÖNDERDİĞİMİZ MESAJLARI BAŞKALARI OKUYAMAZ. BANKALAR, OKULLAR VE HASTANELER BİLGİLERİ KORUMAK İÇİN ÇOK GÜÇLÜ ŞİFRELEME YÖNTEMLERİ KULLANIR. BU YÖNTEMLERİN ANAHTARLARINI DENEYEREK BULMAK MİLYONLARCA YIL SÜRER.'
    ];

    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const sec = (d) => d[Math.floor(Math.random() * d.length)];
    const ANAHTAR_KELIMELER = ['KOD', 'AĞ', 'BİT', 'YAZ', 'VERİ', 'EKRAN', 'ROBOT'];

    // Bölümler: her biri tur sayısı kadar soru üretir
    const BOLUMLER = [
        { id: 'sezar1', ad: 'Sezar Şifrele', tur: 3, sinif: [4, 12], arac: 'cark',
          anlatim: 'Jül Sezar 2000 yıl önce ordusuna gizli mesajları böyle gönderirdi: her harf alfabede belirli sayıda ileri kaydırılır. Çarkı döndürerek anahtarı ayarla, dış halkadaki harfin altındaki harfi yaz.',
          soru() { const m = sec(KELIMELER), k = r(1, 6); return { metin: m, k, cevap: sezar(m, k), soru: `<b>${m}</b> kelimesini <b>${k}</b> anahtarıyla şifrele.` }; } },
        { id: 'sezar2', ad: 'Sezar Çöz', tur: 3, sinif: [4, 12], arac: 'cark',
          anlatim: 'Şimdi tersini yap: şifreli mesajdaki her harfi anahtar kadar <b>geri</b> kaydır. Çarkta iç halkadaki harfi bul, üstündeki dış halka harfini yaz.',
          soru() { const m = sec(CUMLELER.filter(c => c.length < 32)), k = r(2, 9); return { metin: m, k, cevap: m, soru: `Anahtar <b>${k}</b>. Bu mesajı çöz: <code class="sifreli">${sezar(m, k)}</code>` }; } },
        { id: 'kaba', ad: 'Anahtarı Bul', tur: 3, sinif: [5, 12], arac: 'kaba',
          anlatim: 'Anahtarı bilmiyorsun! Ama Sezar şifresinin sadece 28 olası anahtarı var. Kaydırıcıyla hepsini dene; anlamlı bir Türkçe cümle çıktığında anahtarı buldun. Buna <b>kaba kuvvet saldırısı</b> denir.',
          soru() { const m = sec(CUMLELER), k = r(3, 26); return { metin: m, k, sifreli: sezar(m, k), cevap: k, soru: 'Bu mesajın anahtarını bul:' }; } },
        { id: 'frekans', ad: 'Frekans Analizi', tur: 2, sinif: [7, 12], arac: 'frekans',
          anlatim: 'Türkçede en çok kullanılan harf <b>A</b>, sonra <b>E</b> ve <b>İ</b> gelir. Şifreli metinde en sık geçen harf büyük ihtimalle A\'nın şifrelenmiş halidir! Grafikleri üst üste getirecek kaydırmayı bul. 9. yüzyılda El-Kindi bu yöntemi bulduğunda Sezar şifresinin sonu geldi.',
          soru() { const m = sec(UZUN_METINLER), k = r(3, 26); return { metin: m, k, sifreli: sezar(m, k), cevap: k, soru: 'Bu uzun mesajın anahtarını frekans analiziyle bul:' }; } },
        { id: 'vig1', ad: 'Vigenère Şifrele', tur: 3, sinif: [7, 12], arac: 'vigenere',
          anlatim: 'Vigenère şifresinde anahtar bir <b>kelimedir</b>. Anahtarın her harfi farklı bir kaydırma miktarı söyler (A=0, B=1, C=2…). Mesajın 1. harfi anahtarın 1. harfi kadar, 2. harfi 2. harfi kadar kaydırılır; anahtar bitince başa dönülür. Tablodan yardım alabilirsin.',
          soru() { const m = sec(KELIMELER.filter(w => w.length >= 4)), a = sec(ANAHTAR_KELIMELER.filter(w => w.length <= 4)); return { metin: m, anahtar: a, cevap: vigenere(m, a), soru: `<b>${m}</b> kelimesini <b>${a}</b> anahtar kelimesiyle şifrele.` }; } },
        { id: 'vig2', ad: 'Vigenère Çöz', tur: 3, sinif: [8, 12], arac: 'vigenere',
          anlatim: 'Çözmek için her harfi anahtar harfinin değeri kadar <b>geri</b> kaydır. Aynı harfin farklı harflere dönüştüğüne dikkat et: frekans analizi artık işe yaramaz!',
          soru() { const m = sec(KELIMELER.filter(w => w.length >= 4 && w.length <= 8)), a = sec(ANAHTAR_KELIMELER); return { metin: m, anahtar: a, cevap: m, soru: `Anahtar kelime <b>${a}</b>. Çöz: <code class="sifreli">${vigenere(m, a)}</code>` }; } },
        { id: 'guc', ad: 'Modern Şifreleme', tur: 4, sinif: [8, 12], arac: 'guc',
          anlatim: 'Bilgisayarlar saniyede milyarlarca anahtar deneyebilir. Bu yüzden bugünkü şifreleme yöntemleri (AES gibi) çok uzun anahtarlar kullanır. Kaydırıcıyla anahtar uzunluğunu değiştir ve kırmanın ne kadar süreceğini gör, sonra soruları cevapla.',
          sorular: [
            { soru: 'Türk alfabesiyle Sezar şifresinde kaç farklı anlamlı anahtar vardır?', secenekler: ['28', '29', '256', 'Sonsuz'], dogru: 0, aciklama: '29 harf var ama 0 kaydırma mesajı değiştirmez; geriye 28 anahtar kalır.' },
            { soru: 'Anahtara 1 bit eklemek kırma süresini nasıl etkiler?', secenekler: ['1 saniye artırır', 'İki katına çıkarır', 'Değiştirmez', '10 katına çıkarır'], dogru: 1, aciklama: 'Her bit olası anahtar sayısını ikiye katlar.' },
            { soru: 'Vigenère neden frekans analizine Sezar\'dan daha dayanıklıdır?', secenekler: ['Daha çok harf kullandığı için', 'Aynı harf farklı yerlerde farklı harflere dönüştüğü için', 'Boşlukları sildiği için', 'Sayılar kullandığı için'], dogru: 1, aciklama: 'Anahtar kelime harfleri değiştikçe kaydırma da değişir, harf sıklıkları birbirine karışır.' },
            { soru: 'Günümüzde internet bankacılığında kullanılan AES şifrelemesinin anahtarı genellikle kaç bittir?', secenekler: ['8', '16', '64', '256'], dogru: 3, aciklama: '2²⁵⁶ olası anahtar vardır; bu, evrendeki atom sayısından bile fazladır.' }
          ],
          soru(i) { return this.sorular[i]; } }
    ];

    // Saniyede 1 milyar deneme ile ortalama kırma süresi (olası anahtarların yarısı)
    function kirmaSuresi(bit) {
        const sn = Math.pow(2, bit - 1) / 1e9;
        const birimler = [[31557600e9, 'milyar yıl'], [31557600e6, 'milyon yıl'], [31557600, 'yıl'], [86400, 'gün'], [3600, 'saat'], [60, 'dakika'], [1, 'saniye']];
        for (const [b, ad] of birimler) if (sn >= b) return `${(sn / b).toLocaleString('tr-TR', { maximumFractionDigits: sn / b < 10 ? 1 : 0 })} ${ad}`;
        return sn >= 0.001 ? `${(sn * 1000).toFixed(1)} milisaniye` : 'göz açıp kapayıncaya kadar';
    }

    // Cevap karşılaştırma: büyük/küçük harf ve fazla boşluk önemsiz
    const normal = (s) => buyut(String(s)).replace(/\s+/g, ' ').trim();

    const api = { ALFABE, N, sezar, vigenere, frekans, TR_FREKANS, frekansCoz, kirmaSuresi, KELIMELER, CUMLELER, UZUN_METINLER, BOLUMLER, normal, buyut };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.Sifre = api;
})(typeof window !== 'undefined' ? window : globalThis);
