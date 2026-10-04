// Kodlayalım — Python Laboratuvarı: görevler, değerlendirme düzeneği ve Türkçe hata açıklamaları
// Python kodu tarayıcıda Pyodide (WebAssembly) ile çalışır; sunucu gerekmez.
(function (root) {
    'use strict';

    // Pyodide içinde bir kez yüklenen yardımcı Python kodu.
    // _kl_calistir: öğrencinin kodunu temiz bir ad alanında çalıştırır, çıktıyı yaz() ile dışarı verir.
    // Girdi kuyruğu bitince input() programı durdurur ve "girdi" sonucu döner; arayüz yeni girdiyle programı baştan oynatır.
    const HARNESS = `
import sys, builtins, random, traceback

class _KLGirdiYok(BaseException):
    pass

class _KLCokCikti(BaseException):
    pass

def _kl_calistir(kod, girdiler, tohum, yaz, istem_yaz, ek=''):
    # ek verilirse (fonksiyon testleri) öğrencinin kendi çıktısı yok sayılır, sadece ek kodun çıktısı alınır
    hedef = [(lambda s: None) if ek else yaz]
    kuyruk = list(girdiler)
    toplam = [0]
    class Akis:
        def write(self, s):
            s = str(s)
            toplam[0] += len(s)
            if toplam[0] > 50000:
                raise _KLCokCikti()
            hedef[0](s)
            return len(s)
        def flush(self):
            pass
    def girdi(istem=''):
        istem = str(istem)
        if not kuyruk:
            raise _KLGirdiYok(istem)
        deger = kuyruk.pop(0)
        if istem_yaz:
            hedef[0](istem)
            hedef[0](deger + '\\n')
        return deger
    eski = (sys.stdout, sys.stderr, builtins.input)
    sys.stdout = Akis()
    builtins.input = girdi
    random.seed(tohum)
    ad_alani = {'__name__': '__main__', '__builtins__': builtins}
    try:
        exec(compile(kod, '<kod>', 'exec'), ad_alani)
        if ek:
            hedef[0] = yaz
            exec(compile(ek, '<test>', 'exec'), ad_alani)
        return ['tamam', '', 0, '']
    except _KLGirdiYok as e:
        return ['girdi', '', 0, str(e)]
    except _KLCokCikti:
        return ['hata', 'CokCikti', 0, '']
    except SystemExit:
        return ['tamam', '', 0, '']
    except SyntaxError as e:
        return ['hata', type(e).__name__, e.lineno or 0, str(e.msg)]
    except RecursionError as e:
        return ['hata', 'RecursionError', 0, str(e)]
    except BaseException as e:
        satir = 0
        for f in traceback.extract_tb(e.__traceback__):
            if f.filename == '<kod>':
                satir = f.lineno
        return ['hata', type(e).__name__, satir, str(e)]
    finally:
        sys.stdout, sys.stderr, builtins.input = eski
`;

    const ALFABE = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

    // ---------- Görevler ----------
    // testler: { girdi: [satırlar], kod?: öğrencinin kodundan sonra eklenecek satırlar, cikti: beklenen çıktı }
    const UNITELER = [
        { id: 'ilk', ad: 'İlk Adımlar', ikon: 'fa-shoe-prints', sinif: 5 },
        { id: 'girdi', ad: 'Girdi ve Çıktı', ikon: 'fa-keyboard', sinif: 6 },
        { id: 'kosul', ad: 'Karar Verme', ikon: 'fa-code-branch', sinif: 6 },
        { id: 'dongu', ad: 'Döngüler', ikon: 'fa-rotate', sinif: 7 },
        { id: 'liste', ad: 'Metinler ve Listeler', ikon: 'fa-list-ol', sinif: 8 },
        { id: 'fonk', ad: 'Fonksiyonlar ve Algoritmalar', ikon: 'fa-cubes', sinif: 9 }
    ];

    const GOREVLER = [
        // ---- İlk Adımlar ----
        {
            id: 'merhaba', unite: 'ilk', ad: 'Merhaba Kodlayalım',
            anlatim: '<code>print()</code> ekrana yazı yazar. Yazıyı tırnak içine koymayı unutma.<br>Ekrana tam olarak <b>Merhaba Kodlayalım!</b> yazdır.',
            baslangic: '# Bu satır bir yorumdur, Python onu çalıştırmaz.\n',
            ipucu: 'print("Merhaba Kodlayalım!")',
            cozum: 'print("Merhaba Kodlayalım!")',
            testler: [{ girdi: [], cikti: 'Merhaba Kodlayalım!' }]
        },
        {
            id: 'parcalar', unite: 'ilk', ad: 'Bilgisayarın Parçaları',
            anlatim: 'Her <code>print()</code> yeni bir satıra yazar. Aşağıdaki dört satırı aynen yazdır:<pre>Bilgisayarın parçaları:\n- İşlemci\n- Bellek\n- Depolama</pre>',
            baslangic: 'print("Bilgisayarın parçaları:")\n',
            ipucu: 'Üç tane daha print satırı ekle. Tire ile kelime arasında bir boşluk var.',
            cozum: 'print("Bilgisayarın parçaları:")\nprint("- İşlemci")\nprint("- Bellek")\nprint("- Depolama")',
            testler: [{ girdi: [], cikti: 'Bilgisayarın parçaları:\n- İşlemci\n- Bellek\n- Depolama' }]
        },
        {
            id: 'gb', unite: 'ilk', ad: 'Gigabayt Hesabı',
            anlatim: 'Değişken, bir değeri saklayan isimli kutudur. 1 GB = 1024 MB.<br><code>gb</code> değişkenindeki değeri MB\'a çevirip yazdır. Sayının kendisini değil, <code>gb * 1024</code> işlemini yazdır.',
            baslangic: 'gb = 5\n',
            ipucu: 'print(gb * 1024)',
            cozum: 'gb = 5\nprint(gb * 1024)',
            testler: [{ girdi: [], cikti: '5120' }]
        },
        {
            id: 'birlestir', unite: 'ilk', ad: 'Cihaz Etiketi',
            anlatim: 'f-metin ile değişkenleri yazının içine koyabilirsin: <code>print(f"Merhaba {ad}")</code><br>Değişkenleri kullanarak şunu yazdır: <b>Tablet-07 cihazının pili %85</b>',
            baslangic: 'cihaz = "Tablet-07"\npil = 85\n',
            ipucu: 'print(f"{cihaz} cihazının pili %{pil}")',
            cozum: 'cihaz = "Tablet-07"\npil = 85\nprint(f"{cihaz} cihazının pili %{pil}")',
            testler: [{ girdi: [], cikti: 'Tablet-07 cihazının pili %85' }]
        },
        {
            id: 'islemler', unite: 'ilk', ad: 'Dört İşlem',
            anlatim: 'Python\'da <code>//</code> tam bölme, <code>%</code> kalan bulur. 250 dosya 16\'lık klasörlere bölünecek.<br>İlk satıra kaç klasörün <b>tam dolduğunu</b>, ikinci satıra <b>artan dosya sayısını</b> yazdır.',
            baslangic: 'dosya = 250\nklasor = 16\n',
            ipucu: 'print(dosya // klasor) ve print(dosya % klasor)',
            cozum: 'dosya = 250\nklasor = 16\nprint(dosya // klasor)\nprint(dosya % klasor)',
            testler: [{ girdi: [], cikti: '15\n10' }]
        },
        // ---- Girdi ve Çıktı ----
        {
            id: 'selam', unite: 'girdi', ad: 'Selamlama',
            anlatim: '<code>input()</code> kullanıcıdan bir satır okur. Kullanıcının adını sor ve <b>Merhaba, Ada!</b> biçiminde selamla.',
            baslangic: 'ad = input("Adın ne? ")\n',
            ipucu: 'print(f"Merhaba, {ad}!")',
            cozum: 'ad = input("Adın ne? ")\nprint(f"Merhaba, {ad}!")',
            testler: [{ girdi: ['Ada'], cikti: 'Merhaba, Ada!' }, { girdi: ['Alan'], cikti: 'Merhaba, Alan!' }]
        },
        {
            id: 'kb', unite: 'girdi', ad: 'MB → KB',
            anlatim: '<code>input()</code> her zaman <b>metin</b> verir. Sayı olarak kullanmak için <code>int()</code> ile çevir.<br>Kullanıcıdan MB cinsinden bir dosya boyutu al, kaç KB olduğunu yazdır (1 MB = 1024 KB).',
            baslangic: 'mb = input("Kaç MB? ")\nprint(mb * 1024)\n',
            ipucu: 'mb = int(input("Kaç MB? ")) — önce sayıya çevir. Metni 1024 ile çarpınca ne oluyor, bir dene!',
            cozum: 'mb = int(input("Kaç MB? "))\nprint(mb * 1024)',
            testler: [{ girdi: ['3'], cikti: '3072' }, { girdi: ['1'], cikti: '1024' }, { girdi: ['0'], cikti: '0' }]
        },
        {
            id: 'sure', unite: 'girdi', ad: 'İndirme Süresi',
            anlatim: 'Bir dosyanın indirilmesi saniye cinsinden veriliyor. Bunu <b>dakika ve saniye</b> olarak yazdır.<br>Örnek: girdi <code>125</code> → <b>2 dakika 5 saniye</b>',
            baslangic: 'saniye = int(input("Kaç saniye? "))\n',
            ipucu: 'dakika = saniye // 60, kalan = saniye % 60',
            cozum: 'saniye = int(input("Kaç saniye? "))\nprint(f"{saniye // 60} dakika {saniye % 60} saniye")',
            testler: [{ girdi: ['125'], cikti: '2 dakika 5 saniye' }, { girdi: ['60'], cikti: '1 dakika 0 saniye' }, { girdi: ['59'], cikti: '0 dakika 59 saniye' }, { girdi: ['3601'], cikti: '60 dakika 1 saniye' }]
        },
        {
            id: 'pilsure', unite: 'girdi', ad: 'Pil Ne Kadar Gider?',
            anlatim: 'Önce pil yüzdesini, sonra dakikada harcanan yüzdeyi oku. Pilin kaç <b>tam dakika</b> daha gideceğini yazdır.<br>Örnek: 90 ve 4 → <b>22</b>',
            baslangic: '',
            ipucu: 'İki ayrı input() satırı yaz, ikisini de int() ile çevir, sonra // ile böl.',
            cozum: 'pil = int(input())\nharcama = int(input())\nprint(pil // harcama)',
            testler: [{ girdi: ['90', '4'], cikti: '22' }, { girdi: ['100', '5'], cikti: '20' }, { girdi: ['7', '3'], cikti: '2' }]
        },
        // ---- Karar Verme ----
        {
            id: 'sifreuzun', unite: 'kosul', ad: 'Şifre Uzunluğu',
            anlatim: '<code>len(metin)</code> metnin uzunluğunu verir. Bir şifre oku: 8 karakter ya da daha uzunsa <b>Yeterli</b>, değilse <b>Çok kısa</b> yazdır.',
            baslangic: 'sifre = input("Şifre: ")\nif len(sifre) >= 8:\n    print("Yeterli")\n',
            ipucu: 'if bloğunun altına aynı hizada else: ekle, altına 4 boşluk içeriden print("Çok kısa") yaz.',
            cozum: 'sifre = input("Şifre: ")\nif len(sifre) >= 8:\n    print("Yeterli")\nelse:\n    print("Çok kısa")',
            testler: [{ girdi: ['kedi123'], cikti: 'Çok kısa' }, { girdi: ['Mavi-Deniz42'], cikti: 'Yeterli' }, { girdi: ['12345678'], cikti: 'Yeterli' }, { girdi: [''], cikti: 'Çok kısa' }]
        },
        {
            id: 'cifttek', unite: 'kosul', ad: 'Eşlik Biti',
            anlatim: 'Veri gönderirken hataları yakalamak için sayının çift mi tek mi olduğuna bakılır. Bir sayı oku; çiftse <b>çift</b>, tekse <b>tek</b> yazdır.',
            baslangic: 'sayi = int(input())\n',
            ipucu: 'sayi % 2 == 0 ise sayı çifttir.',
            cozum: 'sayi = int(input())\nif sayi % 2 == 0:\n    print("çift")\nelse:\n    print("tek")',
            testler: [{ girdi: ['4'], cikti: 'çift' }, { girdi: ['7'], cikti: 'tek' }, { girdi: ['0'], cikti: 'çift' }, { girdi: ['1001'], cikti: 'tek' }]
        },
        {
            id: 'pildurum', unite: 'kosul', ad: 'Pil Uyarısı',
            anlatim: 'Pil yüzdesini oku. 20 ya da altıysa <b>Kritik</b>, 50 ya da altıysa <b>Orta</b>, daha fazlaysa <b>İyi</b> yazdır. <code>elif</code> kullan.',
            baslangic: 'pil = int(input())\n',
            ipucu: 'if pil <= 20: ... elif pil <= 50: ... else: ... — sıralama önemli!',
            cozum: 'pil = int(input())\nif pil <= 20:\n    print("Kritik")\nelif pil <= 50:\n    print("Orta")\nelse:\n    print("İyi")',
            testler: [{ girdi: ['5'], cikti: 'Kritik' }, { girdi: ['20'], cikti: 'Kritik' }, { girdi: ['21'], cikti: 'Orta' }, { girdi: ['50'], cikti: 'Orta' }, { girdi: ['51'], cikti: 'İyi' }, { girdi: ['100'], cikti: 'İyi' }]
        },
        {
            id: 'ipoktet', unite: 'kosul', ad: 'IP Adresi Parçası',
            anlatim: 'Bir IP adresi (örneğin 192.168.1.20) dört parçadan oluşur ve her parça <b>0 ile 255</b> arasında olmalıdır. Bir sayı oku; geçerliyse <b>Geçerli</b>, değilse <b>Geçersiz</b> yazdır.',
            baslangic: 'parca = int(input())\n',
            ipucu: 'İki koşulu and ile birleştir: parca >= 0 and parca <= 255',
            cozum: 'parca = int(input())\nif 0 <= parca <= 255:\n    print("Geçerli")\nelse:\n    print("Geçersiz")',
            testler: [{ girdi: ['192'], cikti: 'Geçerli' }, { girdi: ['0'], cikti: 'Geçerli' }, { girdi: ['255'], cikti: 'Geçerli' }, { girdi: ['256'], cikti: 'Geçersiz' }, { girdi: ['-1'], cikti: 'Geçersiz' }]
        },
        {
            id: 'giris', unite: 'kosul', ad: 'Hesap Kilidi',
            anlatim: 'Önce kullanıcı adını, sonra şifreyi oku. Kullanıcı <b>ada</b> ve şifre <b>Kod-2024!</b> ise <b>Giriş başarılı</b>, değilse <b>Hatalı giriş</b> yazdır.<br><small>Not: Gerçek sistemler şifreyi kodun içine yazmaz; şifrenin özetini (hash) saklar.</small>',
            baslangic: 'kullanici = input("Kullanıcı: ")\nsifre = input("Şifre: ")\n',
            ipucu: 'if kullanici == "ada" and sifre == "Kod-2024!":',
            cozum: 'kullanici = input("Kullanıcı: ")\nsifre = input("Şifre: ")\nif kullanici == "ada" and sifre == "Kod-2024!":\n    print("Giriş başarılı")\nelse:\n    print("Hatalı giriş")',
            testler: [{ girdi: ['ada', 'Kod-2024!'], cikti: 'Giriş başarılı' }, { girdi: ['ada', 'kod-2024!'], cikti: 'Hatalı giriş' }, { girdi: ['alan', 'Kod-2024!'], cikti: 'Hatalı giriş' }, { girdi: ['', ''], cikti: 'Hatalı giriş' }]
        },
        // ---- Döngüler ----
        {
            id: 'gerisay', unite: 'dongu', ad: 'Geri Sayım',
            anlatim: 'Bir sayı oku ve o sayıdan 1\'e kadar geri say, sonunda <b>Kalkış!</b> yazdır.<br>Örnek: 3 → <code>3, 2, 1, Kalkış!</code> (her biri ayrı satırda)',
            baslangic: 'n = int(input())\nfor i in range(n, 0, -1):\n    pass\n',
            ipucu: 'pass yerine print(i) yaz. Döngü bitince (girintisiz) print("Kalkış!")',
            cozum: 'n = int(input())\nfor i in range(n, 0, -1):\n    print(i)\nprint("Kalkış!")',
            testler: [{ girdi: ['3'], cikti: '3\n2\n1\nKalkış!' }, { girdi: ['1'], cikti: '1\nKalkış!' }, { girdi: ['0'], cikti: 'Kalkış!' }]
        },
        {
            id: 'kuvvet', unite: 'dongu', ad: 'İkinin Kuvvetleri',
            anlatim: 'Bilgisayar belleği hep 2\'nin kuvvetleriyle büyür: 1, 2, 4, 8, 16... Bir n sayısı oku ve 2⁰\'dan 2ⁿ\'e kadar bütün kuvvetleri alt alta yazdır.',
            baslangic: 'n = int(input())\n',
            ipucu: 'for i in range(n + 1): print(2 ** i)',
            cozum: 'n = int(input())\nfor i in range(n + 1):\n    print(2 ** i)',
            testler: [{ girdi: ['3'], cikti: '1\n2\n4\n8' }, { girdi: ['0'], cikti: '1' }, { girdi: ['10'], cikti: '1\n2\n4\n8\n16\n32\n64\n128\n256\n512\n1024' }]
        },
        {
            id: 'sensor', unite: 'dongu', ad: 'Sensör Toplamı',
            anlatim: 'Önce kaç ölçüm olduğunu (n), sonra n tane ölçümü tek tek oku. Ölçümlerin <b>toplamını</b> yazdır.',
            baslangic: 'n = int(input())\ntoplam = 0\n',
            ipucu: 'for _ in range(n): toplam = toplam + int(input())',
            cozum: 'n = int(input())\ntoplam = 0\nfor _ in range(n):\n    toplam += int(input())\nprint(toplam)',
            testler: [{ girdi: ['3', '10', '20', '5'], cikti: '35' }, { girdi: ['1', '-4'], cikti: '-4' }, { girdi: ['0'], cikti: '0' }]
        },
        {
            id: 'piksel', unite: 'dongu', ad: 'Piksel Üçgeni',
            anlatim: 'Ekrandaki şekiller piksellerden oluşur. Bir n sayısı oku ve # karakterleriyle bir üçgen çiz. <code>"#" * 3</code> → <code>###</code><pre>n = 3 için:\n#\n##\n###</pre>',
            baslangic: 'n = int(input())\n',
            ipucu: 'for i in range(1, n + 1): print("#" * i)',
            cozum: 'n = int(input())\nfor i in range(1, n + 1):\n    print("#" * i)',
            testler: [{ girdi: ['3'], cikti: '#\n##\n###' }, { girdi: ['1'], cikti: '#' }, { girdi: ['5'], cikti: '#\n##\n###\n####\n#####' }]
        },
        {
            id: 'bipbop', unite: 'dongu', ad: 'Bip Bop',
            anlatim: 'Robot 1\'den n\'e kadar sayıyor. 3\'e bölünen sayılar yerine <b>Bip</b>, 5\'e bölünenler yerine <b>Bop</b>, ikisine de bölünenler yerine <b>BipBop</b> diyor. Diğer sayıları aynen söylüyor.',
            baslangic: 'n = int(input())\nfor i in range(1, n + 1):\n    print(i)\n',
            ipucu: 'Önce ikisine birden bölünmeyi kontrol et: if i % 15 == 0 (ya da i % 3 == 0 and i % 5 == 0)',
            cozum: 'n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print("BipBop")\n    elif i % 3 == 0:\n        print("Bip")\n    elif i % 5 == 0:\n        print("Bop")\n    else:\n        print(i)',
            testler: [{ girdi: ['5'], cikti: '1\n2\nBip\n4\nBop' }, { girdi: ['15'], cikti: '1\n2\nBip\n4\nBop\nBip\n7\n8\nBip\nBop\n11\nBip\n13\n14\nBipBop' }]
        },
        {
            id: 'tahminoyun', unite: 'dongu', ad: 'Doğru Şifreyi Bul',
            anlatim: '<code>while</code> döngüsü, koşul doğru olduğu sürece döner. Kullanıcı <b>python</b> yazana kadar şifre sor. Her yanlış denemede <b>Yanlış</b> yazdır; doğru olunca <b>Kilit açıldı</b> ve kaçıncı denemede bulduğunu yazdır.<pre>Girdi: kod, java, python\nÇıktı:\nYanlış\nYanlış\nKilit açıldı\n3</pre>',
            baslangic: 'deneme = 0\ntahmin = ""\nwhile tahmin != "python":\n    tahmin = input("Şifre: ")\n    deneme += 1\n',
            ipucu: 'Döngünün içinde: if tahmin != "python": print("Yanlış"). Döngüden sonra iki print.',
            cozum: 'deneme = 0\ntahmin = ""\nwhile tahmin != "python":\n    tahmin = input("Şifre: ")\n    deneme += 1\n    if tahmin != "python":\n        print("Yanlış")\nprint("Kilit açıldı")\nprint(deneme)',
            testler: [{ girdi: ['kod', 'java', 'python'], cikti: 'Yanlış\nYanlış\nKilit açıldı\n3' }, { girdi: ['python'], cikti: 'Kilit açıldı\n1' }]
        },
        // ---- Metinler ve Listeler ----
        {
            id: 'sesli', unite: 'liste', ad: 'Sesli Harf Sayacı',
            anlatim: 'Küçük harflerle yazılmış bir cümle oku. İçindeki sesli harflerin (a e ı i o ö u ü) sayısını yazdır.<br><code>for harf in metin:</code> metnin harflerini tek tek gezer; <code>harf in "aeıioöuü"</code> sesli mi diye bakar.',
            baslangic: 'metin = input()\nsayac = 0\n',
            ipucu: 'for harf in metin:\n    if harf in "aeıioöuü":\n        sayac += 1',
            cozum: 'metin = input()\nsayac = 0\nfor harf in metin:\n    if harf in "aeıioöuü":\n        sayac += 1\nprint(sayac)',
            testler: [{ girdi: ['bilgisayar'], cikti: '4' }, { girdi: ['kod yazmak çok güzel'], cikti: '6' }, { girdi: ['xyz'], cikti: '0' }]
        },
        {
            id: 'palindrom', unite: 'liste', ad: 'Ters Okuma',
            anlatim: '<code>metin[::-1]</code> metni ters çevirir. Bir kelime oku; tersten de aynıysa <b>Palindrom</b>, değilse <b>Değil</b> yazdır. (örnek: kek, radar)',
            baslangic: 'kelime = input()\nprint(kelime[::-1])\n',
            ipucu: 'if kelime == kelime[::-1]:',
            cozum: 'kelime = input()\nif kelime == kelime[::-1]:\n    print("Palindrom")\nelse:\n    print("Değil")',
            testler: [{ girdi: ['radar'], cikti: 'Palindrom' }, { girdi: ['kek'], cikti: 'Palindrom' }, { girdi: ['python'], cikti: 'Değil' }, { girdi: ['a'], cikti: 'Palindrom' }]
        },
        {
            id: 'ping', unite: 'liste', ad: 'Ping Süreleri',
            anlatim: 'Bir sunucuya gönderilen ping sürelerini boşlukla ayrılmış tek satır olarak oku. <code>input().split()</code> bir liste verir.<br>Sırasıyla <b>en hızlıyı</b> (en küçük), <b>en yavaşı</b> (en büyük) ve <b>ortalamayı</b> (tam bölme ile) yazdır.',
            baslangic: 'sureler = [int(x) for x in input().split()]\n',
            ipucu: 'min(sureler), max(sureler), sum(sureler) // len(sureler)',
            cozum: 'sureler = [int(x) for x in input().split()]\nprint(min(sureler))\nprint(max(sureler))\nprint(sum(sureler) // len(sureler))',
            testler: [{ girdi: ['20 35 18 40'], cikti: '18\n40\n28' }, { girdi: ['7'], cikti: '7\n7\n7' }, { girdi: ['100 1 50'], cikti: '1\n100\n50' }]
        },
        {
            id: 'kelime', unite: 'liste', ad: 'Kelime Sayacı',
            anlatim: 'Bir mesaj oku. Kaç kelime olduğunu ve <b>en uzun kelimeyi</b> yazdır. Aynı uzunlukta birden fazla varsa ilk geleni yaz.',
            baslangic: 'kelimeler = input().split()\nprint(len(kelimeler))\n',
            ipucu: 'en_uzun = ""\nfor k in kelimeler:\n    if len(k) > len(en_uzun):\n        en_uzun = k',
            cozum: 'kelimeler = input().split()\nprint(len(kelimeler))\nen_uzun = ""\nfor k in kelimeler:\n    if len(k) > len(en_uzun):\n        en_uzun = k\nprint(en_uzun)',
            testler: [{ girdi: ['yapay zeka veriden öğreniyor'], cikti: '4\nöğreniyor' }, { girdi: ['ağ'], cikti: '1\nağ' }, { girdi: ['bit bayt'], cikti: '2\nbayt' }, { girdi: ['abc def'], cikti: '2\nabc' }]
        },
        {
            id: 'gizle', unite: 'liste', ad: 'Numara Gizleme',
            anlatim: 'Kişisel verileri korumak için telefon numarasının sadece son 4 hanesi gösterilir. Bir numara oku; son 4 hane hariç her karakteri <b>*</b> yap.<br>Örnek: <code>5321234567</code> → <code>******4567</code>',
            baslangic: 'numara = input()\n',
            ipucu: '"*" * (len(numara) - 4) + numara[-4:]',
            cozum: 'numara = input()\nprint("*" * (len(numara) - 4) + numara[-4:])',
            testler: [{ girdi: ['5321234567'], cikti: '******4567' }, { girdi: ['12345'], cikti: '*2345' }, { girdi: ['4444'], cikti: '4444' }]
        },
        // ---- Fonksiyonlar ve Algoritmalar ----
        {
            id: 'ikilik', unite: 'fonk', ad: 'Onluktan İkiliğe',
            anlatim: '<code>ikilik(n)</code> fonksiyonunu yaz: n sayısının ikilik karşılığını <b>metin olarak döndürsün</b>. <code>bin()</code> kullanmadan, 2\'ye bölüp kalanları toplayarak yap.<br><code>ikilik(5)</code> → <code>"101"</code>, <code>ikilik(0)</code> → <code>"0"</code>',
            baslangic: 'def ikilik(n):\n    if n == 0:\n        return "0"\n    sonuc = ""\n    while n > 0:\n        # kalanı (n % 2) sonucun başına ekle\n        n = n // 2\n    return sonuc\n\nprint(ikilik(5))\n',
            ipucu: 'n = n // 2 satırının üstüne: sonuc = str(n % 2) + sonuc',
            cozum: 'def ikilik(n):\n    if n == 0:\n        return "0"\n    sonuc = ""\n    while n > 0:\n        sonuc = str(n % 2) + sonuc\n        n = n // 2\n    return sonuc',
            testler: [{ kod: 'print(ikilik(5))', cikti: '101' }, { kod: 'print(ikilik(0))', cikti: '0' }, { kod: 'print(ikilik(1))', cikti: '1' }, { kod: 'print(ikilik(255))', cikti: '11111111' }, { kod: 'print(ikilik(1024))', cikti: '10000000000' }],
            fonksiyon: true
        },
        {
            id: 'onluk', unite: 'fonk', ad: 'İkilikten Onluğa',
            anlatim: '<code>onluk(metin)</code> fonksiyonu "1011" gibi bir ikilik sayıyı onluk sayıya çevirip <b>döndürsün</b>. Her basamakta sonucu 2 ile çarp ve basamağı ekle.<br><code>onluk("1011")</code> → <code>11</code>',
            baslangic: 'def onluk(metin):\n    sonuc = 0\n    for basamak in metin:\n        pass\n    return sonuc\n',
            ipucu: 'sonuc = sonuc * 2 + int(basamak)',
            cozum: 'def onluk(metin):\n    sonuc = 0\n    for basamak in metin:\n        sonuc = sonuc * 2 + int(basamak)\n    return sonuc',
            testler: [{ kod: 'print(onluk("1011"))', cikti: '11' }, { kod: 'print(onluk("0"))', cikti: '0' }, { kod: 'print(onluk("11111111"))', cikti: '255' }, { kod: 'print(onluk("100000"))', cikti: '32' }],
            fonksiyon: true
        },
        {
            id: 'sezar', unite: 'fonk', ad: 'Sezar Şifresi',
            anlatim: '<code>sezar(metin, kaydir)</code> fonksiyonu, Türk alfabesindeki her büyük harfi <code>kaydir</code> kadar ileri kaydırsın. Alfabe sonundan başa dönülür. Alfabede olmayan karakterler (boşluk, rakam) aynen kalsın.<br><code>sezar("ABC", 1)</code> → <code>"BCÇ"</code>, <code>sezar("Z", 1)</code> → <code>"A"</code>',
            baslangic: `ALFABE = "${ALFABE}"\n\ndef sezar(metin, kaydir):\n    sonuc = ""\n    for harf in metin:\n        if harf in ALFABE:\n            sira = ALFABE.index(harf)\n            # yeni harfi bul ve sonuca ekle\n        else:\n            sonuc += harf\n    return sonuc\n\nprint(sezar("KODLAYALIM", 3))\n`,
            ipucu: 'sonuc += ALFABE[(sira + kaydir) % len(ALFABE)]',
            cozum: `ALFABE = "${ALFABE}"\n\ndef sezar(metin, kaydir):\n    sonuc = ""\n    for harf in metin:\n        if harf in ALFABE:\n            sira = ALFABE.index(harf)\n            sonuc += ALFABE[(sira + kaydir) % len(ALFABE)]\n        else:\n            sonuc += harf\n    return sonuc`,
            testler: [{ kod: 'print(sezar("ABC", 1))', cikti: 'BCÇ' }, { kod: 'print(sezar("Z", 1))', cikti: 'A' }, { kod: 'print(sezar("GİZLİ MESAJ 2", 3))', cikti: 'ILCOL ÖĞUÇM 2' }, { kod: 'print(sezar(sezar("ŞİFRE", 5), -5))', cikti: 'ŞİFRE' }],
            fonksiyon: true
        },
        {
            id: 'guc', unite: 'fonk', ad: 'Şifre Gücü Ölçer',
            anlatim: '<code>guc(sifre)</code> 0–4 arası puan döndürsün. Her koşul 1 puan:<br>• en az 8 karakter • en az bir rakam • en az bir büyük harf • en az bir küçük harf<br>Yardımcılar: <code>harf.isdigit()</code>, <code>harf.isupper()</code>, <code>harf.islower()</code>',
            baslangic: 'def guc(sifre):\n    puan = 0\n    if len(sifre) >= 8:\n        puan += 1\n    return puan\n',
            ipucu: 'any(h.isdigit() for h in sifre) — ya da bir for döngüsü ve True/False değişkenleri kullan.',
            cozum: 'def guc(sifre):\n    puan = 0\n    if len(sifre) >= 8:\n        puan += 1\n    if any(h.isdigit() for h in sifre):\n        puan += 1\n    if any(h.isupper() for h in sifre):\n        puan += 1\n    if any(h.islower() for h in sifre):\n        puan += 1\n    return puan',
            testler: [{ kod: 'print(guc("abc"))', cikti: '1' }, { kod: 'print(guc("abcdefgh"))', cikti: '2' }, { kod: 'print(guc("Abcdefg1"))', cikti: '4' }, { kod: 'print(guc("12345678"))', cikti: '2' }, { kod: 'print(guc("KISA1"))', cikti: '2' }, { kod: 'print(guc(""))', cikti: '0' }],
            fonksiyon: true
        },
        {
            id: 'ara', unite: 'fonk', ad: 'Doğrusal Arama',
            anlatim: '<code>ara(liste, aranan)</code> arananın listedeki <b>ilk sırasını</b> döndürsün; yoksa <b>-1</b> döndürsün. <code>index()</code> kullanmadan, döngüyle tek tek bak.',
            baslangic: 'def ara(liste, aranan):\n    for i in range(len(liste)):\n        pass\n    return -1\n',
            ipucu: 'if liste[i] == aranan: return i',
            cozum: 'def ara(liste, aranan):\n    for i in range(len(liste)):\n        if liste[i] == aranan:\n            return i\n    return -1',
            testler: [{ kod: 'print(ara([4, 8, 15, 16], 15))', cikti: '2' }, { kod: 'print(ara([4, 8, 15, 16], 4))', cikti: '0' }, { kod: 'print(ara([4, 8, 15, 16], 23))', cikti: '-1' }, { kod: 'print(ara([], 1))', cikti: '-1' }, { kod: 'print(ara(["a", "b", "a"], "a"))', cikti: '0' }],
            fonksiyon: true
        },
        {
            id: 'sirala', unite: 'fonk', ad: 'Kabarcık Sıralaması',
            anlatim: '<code>sirala(liste)</code> listeyi küçükten büyüğe sıralayıp döndürsün. <code>sort()</code> ya da <code>sorted()</code> kullanmadan: yan yana iki eleman yanlış sıradaysa yerlerini değiştir, bunu liste sıralanana kadar tekrarla.',
            baslangic: 'def sirala(liste):\n    n = len(liste)\n    for tur in range(n):\n        for i in range(n - 1):\n            # liste[i] > liste[i + 1] ise yer değiştir\n            pass\n    return liste\n',
            ipucu: 'liste[i], liste[i + 1] = liste[i + 1], liste[i]',
            cozum: 'def sirala(liste):\n    n = len(liste)\n    for tur in range(n):\n        for i in range(n - 1):\n            if liste[i] > liste[i + 1]:\n                liste[i], liste[i + 1] = liste[i + 1], liste[i]\n    return liste',
            testler: [{ kod: 'print(sirala([5, 2, 9, 1]))', cikti: '[1, 2, 5, 9]' }, { kod: 'print(sirala([]))', cikti: '[]' }, { kod: 'print(sirala([3, 3, 1]))', cikti: '[1, 3, 3]' }, { kod: 'print(sirala([9, 8, 7, 6, 5, 4, 3, 2, 1]))', cikti: '[1, 2, 3, 4, 5, 6, 7, 8, 9]' }],
            fonksiyon: true,
            yasak: ['sort', 'sorted']
        },
        {
            id: 'asal', unite: 'fonk', ad: 'Asal Sayı Dedektörü',
            anlatim: 'İnternetteki şifreleme (RSA) çok büyük asal sayılara dayanır. <code>asal_mi(n)</code> n asalsa <b>True</b>, değilse <b>False</b> döndürsün. (1 asal değildir.)',
            baslangic: 'def asal_mi(n):\n    if n < 2:\n        return False\n    return True\n',
            ipucu: 'for b in range(2, n): if n % b == 0: return False — daha hızlısı için sadece b * b <= n olana kadar bak.',
            cozum: 'def asal_mi(n):\n    if n < 2:\n        return False\n    b = 2\n    while b * b <= n:\n        if n % b == 0:\n            return False\n        b += 1\n    return True',
            testler: [{ kod: 'print(asal_mi(2), asal_mi(3), asal_mi(4))', cikti: 'True True False' }, { kod: 'print(asal_mi(1), asal_mi(0))', cikti: 'False False' }, { kod: 'print(asal_mi(97), asal_mi(91))', cikti: 'True False' }, { kod: 'print([n for n in range(30) if asal_mi(n)])', cikti: '[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]' }],
            fonksiyon: true
        }
    ];

    // ---------- Ek görevler (ikinci set) ----------
    UNITELER.push(
        { id: 'sozluk', ad: 'Sözlükler ve Kümeler', ikon: 'fa-book', sinif: 9 },
        { id: 'nesne', ad: 'Sınıflar ve Nesneler', ikon: 'fa-shapes', sinif: 10 },
        { id: 'proje', ad: 'Bilişim Projeleri', ikon: 'fa-rocket', sinif: 11 }
    );
    const g2 = (id, unite, ad, anlatim, baslangic, ipucu, cozum, testler, ek = {}) => ({ id, unite, ad, anlatim, baslangic, ipucu, cozum, testler, ...ek });
    const F = { fonksiyon: true };
    GOREVLER.push(
        // ---- İlk Adımlar ----
        g2('tb', 'ilk', 'Terabayt', '1 TB = 1024 GB. <code>gb</code> değişkenini TB\'a çevirip yazdır. <code>/</code> bölmesi ondalıklı sonuç verir.',
            'gb = 2048\n', 'print(gb / 1024)', 'gb = 2048\nprint(gb / 1024)', [{ girdi: [], cikti: '2.0' }]),
        g2('ekranalan', 'ilk', 'Ekrandaki Pikseller', 'Bir ekranın çözünürlüğü 1920 × 1080. Ekranda toplam kaç piksel olduğunu değişkenleri çarparak yazdır.',
            'genislik = 1920\nyukseklik = 1080\n', 'print(genislik * yukseklik)', 'genislik = 1920\nyukseklik = 1080\nprint(genislik * yukseklik)', [{ girdi: [], cikti: '2073600' }]),
        g2('tirnak', 'ilk', 'Tırnak İçinde Tırnak', 'Metnin içinde çift tırnak kullanmak istersen metni tek tırnakla aç. Şunu aynen yazdır: <b>Python "kolay" bir dil</b>',
            'print("Python kolay bir dil")\n', 'print(\'Python "kolay" bir dil\')', 'print(\'Python "kolay" bir dil\')', [{ girdi: [], cikti: 'Python "kolay" bir dil' }]),
        g2('cizgi', 'ilk', 'Metin Çarpma', 'Python\'da metin bir sayıyla çarpılabilir: <code>"ab" * 3</code> → <code>ababab</code>. Ekrana 20 tane <b>=</b> işaretinden oluşan bir çizgi çiz, altına <b>KODLAYALIM</b>, altına yine 20 tane <b>=</b> yazdır.',
            'print("=")\n', 'print("=" * 20)', 'print("=" * 20)\nprint("KODLAYALIM")\nprint("=" * 20)', [{ girdi: [], cikti: '====================\nKODLAYALIM\n====================' }]),
        g2('yuvarla', 'ilk', 'Ortalama Hız', 'Bir veri paketi 100 km\'yi 3 saniyede gidiyor. Hızı <code>round(sayı, 1)</code> ile virgülden sonra 1 basamağa yuvarlayıp yazdır.',
            'mesafe = 100\nsure = 3\nprint(mesafe / sure)\n', 'print(round(mesafe / sure, 1))', 'mesafe = 100\nsure = 3\nprint(round(mesafe / sure, 1))', [{ girdi: [], cikti: '33.3' }]),
        g2('takas', 'ilk', 'Değişken Takası', '<code>a</code> ile <code>b</code>\'nin değerlerini değiştir, sonra <code>print(a, b)</code> ile yazdır. Python\'da <code>a, b = b, a</code> tek satırda takas yapar.',
            'a = 5\nb = 9\n# a ile b\'nin değerlerini değiştir\nprint(a, b)\n', 'a, b = b, a', 'a = 5\nb = 9\na, b = b, a\nprint(a, b)', [{ girdi: [], cikti: '9 5' }]),
        // ---- Girdi ve Çıktı ----
        g2('yas', 'girdi', 'Kaç Yaşındasın?', 'Doğum yılını oku ve 2026 yılında kaç yaşında olacağını yazdır.',
            'yil = input("Doğum yılın: ")\n', 'yil = int(input(...)) ve print(2026 - yil)', 'yil = int(input("Doğum yılın: "))\nprint(2026 - yil)', [{ girdi: ['2012'], cikti: '14' }, { girdi: ['2000'], cikti: '26' }, { girdi: ['2026'], cikti: '0' }]),
        g2('ortalama3', 'girdi', 'Üç Notun Ortalaması', 'Üç sınav notu oku (her biri ayrı satırda). Ortalamayı virgülden sonra 1 basamağa yuvarlayıp yazdır.',
            '', 'round((a + b + c) / 3, 1)', 'a = int(input())\nb = int(input())\nc = int(input())\nprint(round((a + b + c) / 3, 1))', [{ girdi: ['70', '80', '90'], cikti: '80.0' }, { girdi: ['50', '60', '65'], cikti: '58.3' }, { girdi: ['100', '100', '99'], cikti: '99.7' }]),
        g2('derece', 'girdi', 'Sıcaklık Çevirici', 'İşlemci sıcaklığı santigrat (°C) olarak okunuyor. Fahrenhayta çevir: <code>F = C × 9 / 5 + 32</code>. Sonucu 1 basamağa yuvarla.',
            'c = float(input())\n', 'print(round(c * 9 / 5 + 32, 1))', 'c = float(input())\nprint(round(c * 9 / 5 + 32, 1))', [{ girdi: ['100'], cikti: '212.0' }, { girdi: ['0'], cikti: '32.0' }, { girdi: ['37'], cikti: '98.6' }, { girdi: ['-40'], cikti: '-40.0' }]),
        g2('cozunurluk', 'girdi', 'Çözünürlük', 'Çözünürlük <b>1920x1080</b> biçiminde tek satırda girilecek. <code>split("x")</code> ile ikiye ayır ve toplam piksel sayısını yazdır.',
            'metin = input()\n', 'g, y = metin.split("x") — sonra int() ile çevirip çarp.', 'metin = input()\ng, y = metin.split("x")\nprint(int(g) * int(y))', [{ girdi: ['1920x1080'], cikti: '2073600' }, { girdi: ['800x600'], cikti: '480000' }, { girdi: ['1x1'], cikti: '1' }]),
        g2('bitbayt', 'girdi', 'Bit ve Bayt', '8 bit = 1 bayt. Bit sayısını oku; kaç tam bayt ettiğini ve artan bit sayısını <b>3 bayt 2 bit</b> biçiminde yazdır.',
            'bit = int(input())\n', 'bit // 8 ve bit % 8', 'bit = int(input())\nprint(f"{bit // 8} bayt {bit % 8} bit")', [{ girdi: ['26'], cikti: '3 bayt 2 bit' }, { girdi: ['8'], cikti: '1 bayt 0 bit' }, { girdi: ['5'], cikti: '0 bayt 5 bit' }]),
        g2('fatura', 'girdi', 'Bilgisayarın Elektriği', 'Bir bilgisayar saatte kaç watt harcadığını ve günde kaç saat çalıştığını oku (iki satır). 30 günde kaç <b>kilowatt-saat</b> harcadığını 1 basamağa yuvarlayarak yazdır. (1 kWh = 1000 Wh)',
            '', 'round(watt * saat * 30 / 1000, 1)', 'watt = int(input())\nsaat = int(input())\nprint(round(watt * saat * 30 / 1000, 1))', [{ girdi: ['200', '5'], cikti: '30.0' }, { girdi: ['65', '8'], cikti: '15.6' }, { girdi: ['450', '3'], cikti: '40.5' }]),
        // ---- Karar Verme ----
        g2('buyuk', 'kosul', 'Büyük Olanı Bul', 'İki sayı oku ve büyük olanı yazdır. Eşitlerse o sayıyı yazdır. <code>max()</code> kullanmadan, <code>if</code> ile yap.',
            'a = int(input())\nb = int(input())\n', 'if a > b: print(a) else: print(b)', 'a = int(input())\nb = int(input())\nif a > b:\n    print(a)\nelse:\n    print(b)', [{ girdi: ['3', '9'], cikti: '9' }, { girdi: ['12', '4'], cikti: '12' }, { girdi: ['7', '7'], cikti: '7' }, { girdi: ['-5', '-2'], cikti: '-2' }], { yasak: ['max'] }),
        g2('artik', 'kosul', 'Artık Yıl', 'Bir yıl 4\'e bölünüyorsa artık yıldır; ama 100\'e bölünüp 400\'e bölünmüyorsa değildir. Yılı oku, <b>Artık yıl</b> ya da <b>Normal yıl</b> yazdır.',
            'yil = int(input())\nif yil % 4 == 0:\n    print("Artık yıl")\nelse:\n    print("Normal yıl")\n', '(yil % 4 == 0 and yil % 100 != 0) or yil % 400 == 0', 'yil = int(input())\nif (yil % 4 == 0 and yil % 100 != 0) or yil % 400 == 0:\n    print("Artık yıl")\nelse:\n    print("Normal yıl")', [{ girdi: ['2024'], cikti: 'Artık yıl' }, { girdi: ['2023'], cikti: 'Normal yıl' }, { girdi: ['1900'], cikti: 'Normal yıl' }, { girdi: ['2000'], cikti: 'Artık yıl' }]),
        g2('harfnot', 'kosul', 'Harf Notu', 'Bir puan oku (0–100). 85 ve üstü <b>A</b>, 70 ve üstü <b>B</b>, 60 ve üstü <b>C</b>, 50 ve üstü <b>D</b>, daha azı <b>F</b>.',
            'puan = int(input())\n', 'Büyükten küçüğe if / elif zinciri kur.', 'puan = int(input())\nif puan >= 85:\n    print("A")\nelif puan >= 70:\n    print("B")\nelif puan >= 60:\n    print("C")\nelif puan >= 50:\n    print("D")\nelse:\n    print("F")', [{ girdi: ['100'], cikti: 'A' }, { girdi: ['85'], cikti: 'A' }, { girdi: ['84'], cikti: 'B' }, { girdi: ['60'], cikti: 'C' }, { girdi: ['50'], cikti: 'D' }, { girdi: ['49'], cikti: 'F' }]),
        g2('ucgen', 'kosul', 'Üçgen Olur mu?', 'Üç kenar uzunluğu oku. Her kenar diğer ikisinin toplamından küçükse <b>Üçgen olur</b>, değilse <b>Üçgen olmaz</b> yazdır.',
            'a = int(input())\nb = int(input())\nc = int(input())\n', 'a < b + c and b < a + c and c < a + b', 'a = int(input())\nb = int(input())\nc = int(input())\nif a < b + c and b < a + c and c < a + b:\n    print("Üçgen olur")\nelse:\n    print("Üçgen olmaz")', [{ girdi: ['3', '4', '5'], cikti: 'Üçgen olur' }, { girdi: ['1', '2', '3'], cikti: 'Üçgen olmaz' }, { girdi: ['10', '2', '3'], cikti: 'Üçgen olmaz' }, { girdi: ['5', '5', '5'], cikti: 'Üçgen olur' }]),
        g2('kota', 'kosul', 'İnternet Kotası', 'Paket kotasını ve kullanılan miktarı (GB) oku. Aşıldıysa <b>Kota aşıldı</b>, değilse kalanı <b>12 GB kaldı</b> biçiminde yazdır.',
            'kota = int(input())\nkullanilan = int(input())\n', 'if kullanilan > kota: ... else: print(f"{kota - kullanilan} GB kaldı")', 'kota = int(input())\nkullanilan = int(input())\nif kullanilan > kota:\n    print("Kota aşıldı")\nelse:\n    print(f"{kota - kullanilan} GB kaldı")', [{ girdi: ['20', '8'], cikti: '12 GB kaldı' }, { girdi: ['10', '15'], cikti: 'Kota aşıldı' }, { girdi: ['10', '10'], cikti: '0 GB kaldı' }]),
        g2('ekransure', 'kosul', 'Ekran Süresi', 'Bugünkü ekran süreni dakika olarak oku. 60\'tan azsa <b>Harika</b>, 120 ve altıysa <b>Mola ver</b>, daha fazlaysa <b>Çok uzun</b> yazdır.',
            'dk = int(input())\n', 'if dk < 60 / elif dk <= 120 / else', 'dk = int(input())\nif dk < 60:\n    print("Harika")\nelif dk <= 120:\n    print("Mola ver")\nelse:\n    print("Çok uzun")', [{ girdi: ['30'], cikti: 'Harika' }, { girdi: ['60'], cikti: 'Mola ver' }, { girdi: ['120'], cikti: 'Mola ver' }, { girdi: ['121'], cikti: 'Çok uzun' }]),
        g2('sifreguc', 'kosul', 'Şifre Gücü', 'Bir şifre oku. En az 8 karakter <b>ve</b> içinde en az bir rakam varsa <b>Güçlü</b>, değilse <b>Zayıf</b> yazdır. İpucu: <code>any(k.isdigit() for k in sifre)</code> içinde rakam var mı söyler.',
            'sifre = input()\nif len(sifre) >= 8:\n    print("Güçlü")\nelse:\n    print("Zayıf")\n', 'if len(sifre) >= 8 and any(k.isdigit() for k in sifre):', 'sifre = input()\nif len(sifre) >= 8 and any(k.isdigit() for k in sifre):\n    print("Güçlü")\nelse:\n    print("Zayıf")', [{ girdi: ['kedi'], cikti: 'Zayıf' }, { girdi: ['uzunsifre'], cikti: 'Zayıf' }, { girdi: ['uzunsifre7'], cikti: 'Güçlü' }, { girdi: ['a1'], cikti: 'Zayıf' }]),
        // ---- Döngüler ----
        g2('carpim', 'dongu', 'Çarpım Tablosu', 'Bir sayı oku ve 1\'den 10\'a kadar çarpım tablosunu <b>7 x 3 = 21</b> biçiminde yazdır.',
            'n = int(input())\n', 'for i in range(1, 11): print(f"{n} x {i} = {n * i}")', 'n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")', [{ girdi: ['7'], cikti: Array.from({ length: 10 }, (_, i) => `7 x ${i + 1} = ${7 * (i + 1)}`).join('\n') }, { girdi: ['1'], cikti: Array.from({ length: 10 }, (_, i) => `1 x ${i + 1} = ${i + 1}`).join('\n') }]),
        g2('toplam1n', 'dongu', '1\'den n\'e Toplam', 'Bir n sayısı oku ve 1 + 2 + … + n toplamını döngüyle hesaplayıp yazdır.',
            'n = int(input())\ntoplam = 0\nprint(toplam)\n', 'for i in range(1, n + 1): toplam += i', 'n = int(input())\ntoplam = 0\nfor i in range(1, n + 1):\n    toplam += i\nprint(toplam)', [{ girdi: ['10'], cikti: '55' }, { girdi: ['1'], cikti: '1' }, { girdi: ['100'], cikti: '5050' }]),
        g2('faktoriyel', 'dongu', 'Faktöriyel', 'n! = 1 × 2 × … × n. Bir sayı oku ve faktöriyelini yazdır. 0! = 1 kabul edilir.',
            'n = int(input())\nsonuc = 0\nprint(sonuc)\n', 'sonuc = 1 ile başla ve döngüde çarp.', 'n = int(input())\nsonuc = 1\nfor i in range(2, n + 1):\n    sonuc *= i\nprint(sonuc)', [{ girdi: ['5'], cikti: '120' }, { girdi: ['0'], cikti: '1' }, { girdi: ['10'], cikti: '3628800' }]),
        g2('yildizucgen', 'dongu', 'Yıldız Üçgeni', 'Bir n sayısı oku. 1. satırda 1, 2. satırda 2 … n. satırda n yıldız (*) yazdır.',
            'n = int(input())\n', 'for i in range(1, n + 1): print("*" * i)', 'n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)', [{ girdi: ['3'], cikti: '*\n**\n***' }, { girdi: ['5'], cikti: '*\n**\n***\n****\n*****' }]),
        g2('ikikuvvet', 'dongu', '2\'nin Kuvvetleri', 'Bilgisayar belleği 2\'nin kuvvetleriyle büyür. Bir n oku ve 2⁰\'dan 2ⁿ\'ye kadar her kuvveti ayrı satıra yazdır.',
            'n = int(input())\n', 'for i in range(n + 1): print(2 ** i)', 'n = int(input())\nfor i in range(n + 1):\n    print(2 ** i)', [{ girdi: ['3'], cikti: '1\n2\n4\n8' }, { girdi: ['10'], cikti: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].join('\n') }]),
        g2('rakamtop', 'dongu', 'Rakamlar Toplamı', 'Bir sayının rakamlarını <code>while</code> döngüsüyle topla: son rakam <code>n % 10</code>, onu atmak için <code>n // 10</code>. Metne çevirmeden yap.',
            'n = int(input())\ntoplam = 0\nprint(toplam)\n', 'while n > 0: toplam += n % 10; n = n // 10', 'n = int(input())\ntoplam = 0\nwhile n > 0:\n    toplam += n % 10\n    n = n // 10\nprint(toplam)', [{ girdi: ['1234'], cikti: '10' }, { girdi: ['0'], cikti: '0' }, { girdi: ['99999'], cikti: '45' }], { yasak: ['str'] }),
        g2('fibonacci', 'dongu', 'Fibonacci', 'Fibonacci dizisinde her sayı önceki ikisinin toplamıdır: 0 1 1 2 3 5 8… Bir n oku ve ilk n sayıyı aralarında boşlukla tek satıra yazdır.',
            'n = int(input())\na, b = 0, 1\n', 'for _ in range(n): print(a, end=" "); a, b = b, a + b', 'n = int(input())\na, b = 0, 1\nsayilar = []\nfor _ in range(n):\n    sayilar.append(str(a))\n    a, b = b, a + b\nprint(" ".join(sayilar))', [{ girdi: ['7'], cikti: '0 1 1 2 3 5 8' }, { girdi: ['1'], cikti: '0' }, { girdi: ['12'], cikti: '0 1 1 2 3 5 8 13 21 34 55 89' }]),
        g2('ebob', 'dongu', 'EBOB: Öklid Algoritması', '2300 yıllık bir algoritma: b sıfır olana kadar <code>a, b = b, a % b</code> yap; sonunda a, en büyük ortak bölendir. İki sayı oku, EBOB\'larını yazdır.',
            'a = int(input())\nb = int(input())\n', 'while b != 0: a, b = b, a % b', 'a = int(input())\nb = int(input())\nwhile b != 0:\n    a, b = b, a % b\nprint(a)', [{ girdi: ['48', '18'], cikti: '6' }, { girdi: ['17', '5'], cikti: '1' }, { girdi: ['100', '75'], cikti: '25' }, { girdi: ['7', '0'], cikti: '7' }], { yasak: ['gcd'] }),
        g2('ciftler', 'dongu', 'Çift Sayılar', 'Bir n oku ve 0\'dan n\'e kadar (n dahil) çift sayıları aralarında boşlukla yazdır. <code>range(başla, bitir, adım)</code> kullan.',
            'n = int(input())\n', 'range(0, n + 1, 2)', 'n = int(input())\nprint(" ".join(str(i) for i in range(0, n + 1, 2)))', [{ girdi: ['10'], cikti: '0 2 4 6 8 10' }, { girdi: ['7'], cikti: '0 2 4 6' }, { girdi: ['0'], cikti: '0' }]),
        g2('sinirsiz', 'dongu', 'Bitene Kadar Oku', 'Sayılar okumaya devam et; <b>-1</b> gelince dur. Okunan sayıların toplamını yazdır (-1 hariç).',
            'toplam = 0\n', 'while True: s = int(input()); if s == -1: break', 'toplam = 0\nwhile True:\n    s = int(input())\n    if s == -1:\n        break\n    toplam += s\nprint(toplam)', [{ girdi: ['5', '10', '-1'], cikti: '15' }, { girdi: ['-1'], cikti: '0' }, { girdi: ['1', '2', '3', '4', '-1'], cikti: '10' }]),
        // ---- Metinler ve Listeler ----
        g2('enyuksek', 'liste', 'En Yüksek Puan', '<code>max()</code> kullanmadan listedeki en yüksek puanı bul: ilk elemanı "şimdilik en büyük" kabul et, diğerleriyle karşılaştır.',
            'puanlar = [72, 95, 88, 61, 99, 45]\n', 'enb = puanlar[0]; for p in puanlar: if p > enb: enb = p', 'puanlar = [72, 95, 88, 61, 99, 45]\nenb = puanlar[0]\nfor p in puanlar:\n    if p > enb:\n        enb = p\nprint(enb)', [{ girdi: [], cikti: '99' }], { yasak: ['max', 'sorted', 'sort'] }),
        g2('kelimesay', 'liste', 'Kelime Sayacı', 'Bir cümle oku ve kaç kelimeden oluştuğunu yazdır. <code>split()</code> cümleyi boşluklardan böler.',
            'cumle = input()\n', 'print(len(cumle.split()))', 'cumle = input()\nprint(len(cumle.split()))', [{ girdi: ['Bilgisayar verileri saklar'], cikti: '3' }, { girdi: ['Kodlayalım'], cikti: '1' }, { girdi: ['bir  iki   üç dört'], cikti: '4' }]),
        g2('harfsay', 'liste', 'Harf Sayacı', 'Bir metin ve bir harf oku (iki satır). Harfin metinde kaç kez geçtiğini <code>count()</code> ile bul.',
            'metin = input()\nharf = input()\n', 'print(metin.count(harf))', 'metin = input()\nharf = input()\nprint(metin.count(harf))', [{ girdi: ['bilgisayar', 'a'], cikti: '2' }, { girdi: ['kodlama', 'z'], cikti: '0' }, { girdi: ['aaaa', 'a'], cikti: '4' }]),
        g2('tersyaz', 'liste', 'Tersten Yaz', 'Bir metni tersine çevirip yazdır. Dilimleme ile: <code>metin[::-1]</code>',
            'metin = input()\nprint(metin)\n', 'print(metin[::-1])', 'metin = input()\nprint(metin[::-1])', [{ girdi: ['kodla'], cikti: 'aldok' }, { girdi: ['12345'], cikti: '54321' }, { girdi: ['a'], cikti: 'a' }]),
        g2('gecenler', 'liste', 'Geçenler Listesi', 'Notlardan 50 ve üstü olanları yeni bir listeye ekle ve listeyi yazdır.',
            'notlar = [45, 78, 50, 32, 91, 66, 49]\ngecenler = []\nprint(gecenler)\n', 'for n in notlar: if n >= 50: gecenler.append(n)', 'notlar = [45, 78, 50, 32, 91, 66, 49]\ngecenler = []\nfor n in notlar:\n    if n >= 50:\n        gecenler.append(n)\nprint(gecenler)', [{ girdi: [], cikti: '[78, 50, 91, 66]' }]),
        g2('listeort', 'liste', 'Liste Ortalaması', 'Bir hafta boyunca günlük adım sayıları listede. <code>sum()</code> ve <code>len()</code> ile ortalamayı bul, tam sayıya yuvarla.',
            'adimlar = [6500, 8200, 4300, 10100, 7600, 12000, 3900]\n', 'print(round(sum(adimlar) / len(adimlar)))', 'adimlar = [6500, 8200, 4300, 10100, 7600, 12000, 3900]\nprint(round(sum(adimlar) / len(adimlar)))', [{ girdi: [], cikti: '7514' }]),
        g2('tekrarsiz', 'liste', 'Tekrarları Sil', 'Listede aynı kullanıcı adı birden fazla kez geçiyor. Sırayı bozmadan her adı bir kez içeren yeni listeyi yazdır.',
            'adlar = ["ada", "can", "ada", "ece", "can", "deniz"]\ntekil = []\nprint(tekil)\n', 'for a in adlar: if a not in tekil: tekil.append(a)', 'adlar = ["ada", "can", "ada", "ece", "can", "deniz"]\ntekil = []\nfor a in adlar:\n    if a not in tekil:\n        tekil.append(a)\nprint(tekil)', [{ girdi: [], cikti: "['ada', 'can', 'ece', 'deniz']" }]),
        g2('eposta', 'liste', 'E-posta Denetimi', 'Bir e-posta adresi oku. İçinde tam olarak bir <b>@</b> varsa ve @\'den sonraki kısımda <b>.</b> varsa <b>Geçerli</b>, değilse <b>Geçersiz</b> yazdır.',
            'adres = input()\n', 'adres.count("@") == 1 and "." in adres.split("@")[1]', 'adres = input()\nif adres.count("@") == 1 and "." in adres.split("@")[1]:\n    print("Geçerli")\nelse:\n    print("Geçersiz")', [{ girdi: ['ada@okul.k12.tr'], cikti: 'Geçerli' }, { girdi: ['ada.okul.tr'], cikti: 'Geçersiz' }, { girdi: ['ada@okul'], cikti: 'Geçersiz' }, { girdi: ['a@@b.com'], cikti: 'Geçersiz' }]),
        g2('listeters', 'liste', 'Listeyi Ters Çevir', '<code>reverse()</code> ya da <code>[::-1]</code> kullanmadan listeyi ters çevirip yazdır: listenin sonundan başına doğru dolaş.',
            'liste = [1, 2, 3, 4, 5]\nters = []\nprint(ters)\n', 'for i in range(len(liste) - 1, -1, -1): ters.append(liste[i])', 'liste = [1, 2, 3, 4, 5]\nters = []\nfor i in range(len(liste) - 1, -1, -1):\n    ters.append(liste[i])\nprint(ters)', [{ girdi: [], cikti: '[5, 4, 3, 2, 1]' }], { yasak: ['reverse', 'reversed'] }),
        g2('kullaniciadi', 'liste', 'Kullanıcı Adı Üret', 'Ad ve soyadı oku (iki satır, küçük harf). Kullanıcı adı: adın ilk harfi + soyad + adın uzunluğu. Örnek: ada, kaya → <b>akaya3</b>',
            'ad = input()\nsoyad = input()\n', 'print(ad[0] + soyad + str(len(ad)))', 'ad = input()\nsoyad = input()\nprint(ad[0] + soyad + str(len(ad)))', [{ girdi: ['ada', 'kaya'], cikti: 'akaya3' }, { girdi: ['deniz', 'yel'], cikti: 'dyel5' }]),
        // ---- Fonksiyonlar ----
        g2('karef', 'fonk', 'Kare Fonksiyonu', '<code>kare(n)</code> fonksiyonu n\'nin karesini <b>döndürsün</b> (print değil, return).',
            'def kare(n):\n    print(n * n)\n', 'return n * n', 'def kare(n):\n    return n * n', [{ kod: 'print(kare(4))', cikti: '16' }, { kod: 'print(kare(0))', cikti: '0' }, { kod: 'print(kare(-3) + 1)', cikti: '10' }], F),
        g2('mutlak', 'fonk', 'Mutlak Değer', '<code>mutlak(n)</code> sayının mutlak değerini döndürsün. <code>abs()</code> kullanma.',
            'def mutlak(n):\n    return n\n', 'if n < 0: return -n', 'def mutlak(n):\n    if n < 0:\n        return -n\n    return n', [{ kod: 'print(mutlak(-7))', cikti: '7' }, { kod: 'print(mutlak(3))', cikti: '3' }, { kod: 'print(mutlak(0))', cikti: '0' }], { ...F, yasak: ['abs'] }),
        g2('enbuyukf', 'fonk', 'En Büyüğü Bulan Fonksiyon', '<code>en_buyuk(liste)</code> listedeki en büyük sayıyı döndürsün; liste boşsa <code>None</code> döndürsün. <code>max()</code> kullanma.',
            'def en_buyuk(liste):\n    pass\n', 'if not liste: return None', 'def en_buyuk(liste):\n    if not liste:\n        return None\n    enb = liste[0]\n    for x in liste:\n        if x > enb:\n            enb = x\n    return enb', [{ kod: 'print(en_buyuk([3, 8, 2]))', cikti: '8' }, { kod: 'print(en_buyuk([]))', cikti: 'None' }, { kod: 'print(en_buyuk([-5, -2, -9]))', cikti: '-2' }], { ...F, yasak: ['max', 'sorted', 'sort'] }),
        g2('harfsayf', 'fonk', 'Harf Sayan Fonksiyon', '<code>harf_say(metin, harf)</code> harfin metinde kaç kez geçtiğini döndürsün. <code>count()</code> kullanmadan döngüyle say.',
            'def harf_say(metin, harf):\n    return 0\n', 'for k in metin: if k == harf: sayac += 1', 'def harf_say(metin, harf):\n    sayac = 0\n    for k in metin:\n        if k == harf:\n            sayac += 1\n    return sayac', [{ kod: 'print(harf_say("bilgisayar", "a"))', cikti: '2' }, { kod: 'print(harf_say("", "a"))', cikti: '0' }, { kod: 'print(harf_say("kodlayalım", "l"))', cikti: '2' }], { ...F, yasak: ['count'] }),
        g2('faktoriyelr', 'fonk', 'Özyineleme: Faktöriyel', 'Bir fonksiyon kendini çağırabilir (özyineleme). <code>fakt(n)</code>: n 0 ise 1, değilse <code>n * fakt(n - 1)</code> döndürsün.',
            'def fakt(n):\n    return n * fakt(n - 1)\n', 'Önce durma koşulunu yaz: if n == 0: return 1', 'def fakt(n):\n    if n == 0:\n        return 1\n    return n * fakt(n - 1)', [{ kod: 'print(fakt(5))', cikti: '120' }, { kod: 'print(fakt(0))', cikti: '1' }, { kod: 'print(fakt(12))', cikti: '479001600' }], F),
        g2('ikiliara', 'fonk', 'İkili Arama', 'Sıralı bir listede aramanın hızlı yolu: ortadaki elemana bak, aradığın küçükse sol yarıda, büyükse sağ yarıda ara. <code>ikili_ara(liste, aranan)</code> bulunca sırasını, bulamazsa -1 döndürsün. <code>index()</code> kullanma.',
            'def ikili_ara(liste, aranan):\n    sol, sag = 0, len(liste) - 1\n    while sol <= sag:\n        orta = (sol + sag) // 2\n        # karşılaştır ve sol ya da sag\'ı güncelle\n        break\n    return -1\n', 'if liste[orta] == aranan: return orta; elif liste[orta] < aranan: sol = orta + 1; else: sag = orta - 1', 'def ikili_ara(liste, aranan):\n    sol, sag = 0, len(liste) - 1\n    while sol <= sag:\n        orta = (sol + sag) // 2\n        if liste[orta] == aranan:\n            return orta\n        elif liste[orta] < aranan:\n            sol = orta + 1\n        else:\n            sag = orta - 1\n    return -1', [{ kod: 'print(ikili_ara([1, 3, 5, 7, 9, 11], 7))', cikti: '3' }, { kod: 'print(ikili_ara([1, 3, 5, 7, 9, 11], 1))', cikti: '0' }, { kod: 'print(ikili_ara([1, 3, 5, 7, 9, 11], 4))', cikti: '-1' }, { kod: 'print(ikili_ara([], 4))', cikti: '-1' }], { ...F, yasak: ['index'] }),
        g2('secmeli', 'fonk', 'Seçmeli Sıralama', '<code>secmeli(liste)</code>: her turda kalan kısmın en küçüğünü bul ve başa al. <code>sort()</code>, <code>sorted()</code>, <code>min()</code> kullanma.',
            'def secmeli(liste):\n    return liste\n', 'for i in range(len(liste)): enk = i; for j in range(i + 1, len(liste)): ... sonra yer değiştir', 'def secmeli(liste):\n    for i in range(len(liste)):\n        enk = i\n        for j in range(i + 1, len(liste)):\n            if liste[j] < liste[enk]:\n                enk = j\n        liste[i], liste[enk] = liste[enk], liste[i]\n    return liste', [{ kod: 'print(secmeli([4, 1, 3, 2]))', cikti: '[1, 2, 3, 4]' }, { kod: 'print(secmeli([]))', cikti: '[]' }, { kod: 'print(secmeli([5, 5, 0, -1]))', cikti: '[-1, 0, 5, 5]' }], { ...F, yasak: ['sort', 'sorted', 'min'] }),
        g2('hanoi', 'fonk', 'Hanoi Kuleleri', 'n diski A çubuğundan C\'ye taşı: önce n-1 diski B\'ye, sonra en büyüğü C\'ye, sonra n-1 diski C\'ye. <code>hanoi(n, kaynak, hedef, ara)</code> her hamleyi <b>A -> C</b> biçiminde yazdırsın.',
            'def hanoi(n, kaynak, hedef, ara):\n    print(kaynak, "->", hedef)\n', 'if n == 0: return; hanoi(n - 1, kaynak, ara, hedef); print(...); hanoi(n - 1, ara, hedef, kaynak)', 'def hanoi(n, kaynak, hedef, ara):\n    if n == 0:\n        return\n    hanoi(n - 1, kaynak, ara, hedef)\n    print(kaynak, "->", hedef)\n    hanoi(n - 1, ara, hedef, kaynak)', [{ kod: 'hanoi(1, "A", "C", "B")', cikti: 'A -> C' }, { kod: 'hanoi(2, "A", "C", "B")', cikti: 'A -> B\nA -> C\nB -> C' }, { kod: 'hanoi(3, "A", "C", "B")', cikti: 'A -> C\nA -> B\nC -> B\nA -> C\nB -> A\nB -> C\nA -> C' }], F),
        // ---- Sözlükler ve Kümeler ----
        g2('rehber', 'sozluk', 'Telefon Rehberi', 'Sözlük, anahtarla değere ulaşır: <code>rehber["ada"]</code>. Bir ad oku; rehberde varsa numarasını, yoksa <b>Bulunamadı</b> yazdır.',
            'rehber = {"ada": "555-0101", "can": "555-0177", "ece": "555-0142"}\nad = input()\nprint(rehber[ad])\n', 'if ad in rehber: ... else: print("Bulunamadı")', 'rehber = {"ada": "555-0101", "can": "555-0177", "ece": "555-0142"}\nad = input()\nif ad in rehber:\n    print(rehber[ad])\nelse:\n    print("Bulunamadı")', [{ girdi: ['can'], cikti: '555-0177' }, { girdi: ['deniz'], cikti: 'Bulunamadı' }, { girdi: ['ada'], cikti: '555-0101' }]),
        g2('siklik', 'sozluk', 'Harf Sıklığı', '<code>siklik(metin)</code> her harfin kaç kez geçtiğini bir sözlük olarak döndürsün. Örnek: <code>siklik("aba")</code> → <code>{"a": 2, "b": 1}</code>',
            'def siklik(metin):\n    sayim = {}\n    return sayim\n', 'for k in metin: sayim[k] = sayim.get(k, 0) + 1', 'def siklik(metin):\n    sayim = {}\n    for k in metin:\n        sayim[k] = sayim.get(k, 0) + 1\n    return sayim', [{ kod: 'print(sorted(siklik("kodla").items()))', cikti: "[('a', 1), ('d', 1), ('k', 1), ('l', 1), ('o', 1)]" }, { kod: 'print(siklik("aab"))', cikti: "{'a': 2, 'b': 1}" }, { kod: 'print(siklik(""))', cikti: '{}' }], F),
        g2('stok', 'sozluk', 'Kırtasiye Stoğu', 'Bir ürün adı ve satılan adedi oku (iki satır). Stoktan düş ve güncel stok sözlüğünü yazdır. Stok yetmiyorsa <b>Yetersiz stok</b> yazdır, stoğu değiştirme.',
            'stok = {"kalem": 40, "defter": 25, "silgi": 60}\nurun = input()\nadet = int(input())\n', 'if stok[urun] >= adet: stok[urun] -= adet', 'stok = {"kalem": 40, "defter": 25, "silgi": 60}\nurun = input()\nadet = int(input())\nif stok[urun] >= adet:\n    stok[urun] -= adet\n    print(stok)\nelse:\n    print("Yetersiz stok")', [{ girdi: ['kalem', '15'], cikti: "{'kalem': 25, 'defter': 25, 'silgi': 60}" }, { girdi: ['defter', '30'], cikti: 'Yetersiz stok' }, { girdi: ['silgi', '60'], cikti: "{'kalem': 40, 'defter': 25, 'silgi': 0}" }]),
        g2('secim', 'sozluk', 'Okul Seçimi', 'Önce oy sayısını (n), sonra n tane aday adını oku. Her adayın oyunu sözlükte say ve en çok oy alanı yazdır. Eşitlikte alfabede önce gelen kazanır.',
            'n = int(input())\noylar = {}\n', 'Kazananı bulmak için: sorted(oylar, key=lambda a: (-oylar[a], a))[0]', 'n = int(input())\noylar = {}\nfor _ in range(n):\n    aday = input()\n    oylar[aday] = oylar.get(aday, 0) + 1\nprint(sorted(oylar, key=lambda a: (-oylar[a], a))[0])', [{ girdi: ['5', 'ada', 'can', 'ada', 'ece', 'ada'], cikti: 'ada' }, { girdi: ['4', 'can', 'ece', 'ece', 'can'], cikti: 'can' }, { girdi: ['1', 'deniz'], cikti: 'deniz' }]),
        g2('karnesoz', 'sozluk', 'Karne Sözlüğü', 'Her öğrencinin notları bir listede. Her öğrenci için <b>Ada: 85.0</b> biçiminde ortalamayı (1 basamak) yazdır. <code>for ad, notlar in karne.items():</code>',
            'karne = {"Ada": [90, 80, 85], "Can": [70, 65, 72], "Ece": [100, 95, 98]}\n', 'print(f"{ad}: {round(sum(notlar) / len(notlar), 1)}")', 'karne = {"Ada": [90, 80, 85], "Can": [70, 65, 72], "Ece": [100, 95, 98]}\nfor ad, notlar in karne.items():\n    print(f"{ad}: {round(sum(notlar) / len(notlar), 1)}")', [{ girdi: [], cikti: 'Ada: 85.0\nCan: 69.0\nEce: 97.7' }]),
        g2('terssoz', 'sozluk', 'Sözlüğü Ters Çevir', '<code>ters(sozluk)</code> anahtarları değer, değerleri anahtar yapan yeni bir sözlük döndürsün. Örnek: renk kodlarını renk adına çevirmek.',
            'def ters(sozluk):\n    return sozluk\n', 'return {d: a for a, d in sozluk.items()}', 'def ters(sozluk):\n    yeni = {}\n    for a, d in sozluk.items():\n        yeni[d] = a\n    return yeni', [{ kod: 'print(ters({"kırmızı": "#ff0000", "yeşil": "#00ff00"}))', cikti: "{'#ff0000': 'kırmızı', '#00ff00': 'yeşil'}" }, { kod: 'print(ters({}))', cikti: '{}' }], F),
        g2('ortak', 'sozluk', 'Ortak Arkadaşlar', 'Küme (set) tekrarsız elemanlar tutar; <code>a & b</code> ortak elemanları verir. İki kişinin ortak arkadaşlarını alfabetik sırayla liste olarak yazdır.',
            'ada = {"can", "ece", "deniz", "efe"}\ncan = {"ada", "ece", "efe", "zeynep"}\n', 'print(sorted(ada & can))', 'ada = {"can", "ece", "deniz", "efe"}\ncan = {"ada", "ece", "efe", "zeynep"}\nprint(sorted(ada & can))', [{ girdi: [], cikti: "['ece', 'efe']" }]),
        g2('benzersiz', 'sozluk', 'Kaç Farklı Ziyaretçi?', 'Bir sitenin giriş kayıtlarında aynı IP adresi birçok kez var. Bir satırda boşlukla ayrılmış IP\'leri oku ve kaç <b>farklı</b> IP olduğunu yazdır.',
            'kayitlar = input().split()\nprint(len(kayitlar))\n', 'print(len(set(kayitlar)))', 'kayitlar = input().split()\nprint(len(set(kayitlar)))', [{ girdi: ['10.0.0.1 10.0.0.2 10.0.0.1 10.0.0.3 10.0.0.2'], cikti: '3' }, { girdi: ['1.1.1.1'], cikti: '1' }]),
        // ---- Sınıflar ve Nesneler ----
        g2('robotsinif', 'nesne', 'Robot Sınıfı', 'Sınıf, nesneler için bir kalıptır. <code>Robot</code> sınıfı <code>ad</code> alsın; <code>selam()</code> metodu <b>Merhaba, ben R2!</b> biçiminde metin döndürsün.',
            'class Robot:\n    def __init__(self, ad):\n        pass\n\n    def selam(self):\n        return "Merhaba"\n', 'self.ad = ad ve return f"Merhaba, ben {self.ad}!"', 'class Robot:\n    def __init__(self, ad):\n        self.ad = ad\n\n    def selam(self):\n        return f"Merhaba, ben {self.ad}!"', [{ kod: 'print(Robot("R2").selam())', cikti: 'Merhaba, ben R2!' }, { kod: 'r = Robot("Kodi")\nprint(r.ad)\nprint(r.selam())', cikti: 'Kodi\nMerhaba, ben Kodi!' }], F),
        g2('hesap', 'nesne', 'Kumbara Hesabı', '<code>Kumbara</code> sınıfı 0 bakiyeyle başlasın. <code>yatir(tutar)</code> bakiyeyi artırsın; <code>cek(tutar)</code> bakiye yetiyorsa düşüp <code>True</code>, yetmiyorsa <code>False</code> döndürsün.',
            'class Kumbara:\n    def __init__(self):\n        self.bakiye = 0\n\n    def yatir(self, tutar):\n        pass\n\n    def cek(self, tutar):\n        return True\n', 'if tutar <= self.bakiye: self.bakiye -= tutar; return True', 'class Kumbara:\n    def __init__(self):\n        self.bakiye = 0\n\n    def yatir(self, tutar):\n        self.bakiye += tutar\n\n    def cek(self, tutar):\n        if tutar <= self.bakiye:\n            self.bakiye -= tutar\n            return True\n        return False', [{ kod: 'k = Kumbara()\nk.yatir(50)\nprint(k.cek(20), k.bakiye)', cikti: 'True 30' }, { kod: 'k = Kumbara()\nk.yatir(10)\nprint(k.cek(25), k.bakiye)', cikti: 'False 10' }, { kod: 'k = Kumbara()\nprint(k.bakiye)', cikti: '0' }], F),
        g2('nokta', 'nesne', 'Ekrandaki Noktalar', '<code>Nokta(x, y)</code> sınıfı yaz. <code>uzaklik(diger)</code> metodu iki nokta arasındaki uzaklığı 2 basamağa yuvarlayıp döndürsün: √((x₁−x₂)² + (y₁−y₂)²)',
            'class Nokta:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def uzaklik(self, diger):\n        return 0\n', 'round(((self.x - diger.x) ** 2 + (self.y - diger.y) ** 2) ** 0.5, 2)', 'class Nokta:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def uzaklik(self, diger):\n        return round(((self.x - diger.x) ** 2 + (self.y - diger.y) ** 2) ** 0.5, 2)', [{ kod: 'print(Nokta(0, 0).uzaklik(Nokta(3, 4)))', cikti: '5.0' }, { kod: 'print(Nokta(1, 1).uzaklik(Nokta(2, 2)))', cikti: '1.41' }, { kod: 'print(Nokta(5, 5).uzaklik(Nokta(5, 5)))', cikti: '0.0' }], F),
        g2('dikdortgen', 'nesne', 'Dikdörtgen Sınıfı', '<code>Dikdortgen(en, boy)</code> sınıfının <code>alan()</code> ve <code>cevre()</code> metotları olsun.',
            'class Dikdortgen:\n    def __init__(self, en, boy):\n        self.en = en\n        self.boy = boy\n', 'def alan(self): return self.en * self.boy', 'class Dikdortgen:\n    def __init__(self, en, boy):\n        self.en = en\n        self.boy = boy\n\n    def alan(self):\n        return self.en * self.boy\n\n    def cevre(self):\n        return 2 * (self.en + self.boy)', [{ kod: 'd = Dikdortgen(4, 3)\nprint(d.alan(), d.cevre())', cikti: '12 14' }, { kod: 'd = Dikdortgen(1920, 1080)\nprint(d.alan())', cikti: '2073600' }], F),
        g2('sayacsinif', 'nesne', 'Ziyaretçi Sayacı', '<code>Sayac</code> sınıfında <code>deger</code> 0\'dan başlasın; <code>arttir()</code> 1 artırsın, <code>sifirla()</code> 0 yapsın. İki ayrı sayaç birbirini etkilememeli!',
            'class Sayac:\n    deger = 0\n', '__init__ içinde self.deger = 0', 'class Sayac:\n    def __init__(self):\n        self.deger = 0\n\n    def arttir(self):\n        self.deger += 1\n\n    def sifirla(self):\n        self.deger = 0', [{ kod: 's = Sayac()\ns.arttir()\ns.arttir()\nprint(s.deger)', cikti: '2' }, { kod: 'a = Sayac()\nb = Sayac()\na.arttir()\nprint(a.deger, b.deger)', cikti: '1 0' }, { kod: 's = Sayac()\ns.arttir()\ns.sifirla()\nprint(s.deger)', cikti: '0' }], F),
        g2('kalitim', 'nesne', 'Kalıtım: Cihazlar', '<code>Cihaz</code> sınıfının <code>tur()</code> metodu "Cihaz" döndürüyor. <code>Yazici</code> ve <code>Tarayici</code> sınıfları <code>Cihaz</code>\'dan türesin ve <code>tur()</code> metodunu "Çıktı birimi" ve "Girdi birimi" döndürecek şekilde yeniden yazsın.',
            'class Cihaz:\n    def tur(self):\n        return "Cihaz"\n\nclass Yazici(Cihaz):\n    pass\n\nclass Tarayici(Cihaz):\n    pass\n', 'class Yazici(Cihaz): içinde def tur(self): return "Çıktı birimi"', 'class Cihaz:\n    def tur(self):\n        return "Cihaz"\n\nclass Yazici(Cihaz):\n    def tur(self):\n        return "Çıktı birimi"\n\nclass Tarayici(Cihaz):\n    def tur(self):\n        return "Girdi birimi"', [{ kod: 'print(Yazici().tur())\nprint(Tarayici().tur())\nprint(Cihaz().tur())', cikti: 'Çıktı birimi\nGirdi birimi\nCihaz' }, { kod: 'print(isinstance(Yazici(), Cihaz))', cikti: 'True' }], F),
        // ---- Bilişim Projeleri ----
        g2('rle', 'proje', 'RLE Sıkıştırma', 'Art arda tekrar eden harfleri harf + sayı olarak yaz: <code>sikistir("aaabcc")</code> → <code>"a3b1c2"</code>. Piksel resimler de böyle sıkıştırılabilir.',
            'def sikistir(metin):\n    return metin\n', 'Bir önceki harfi ve sayacı tut; harf değişince sonuca ekle.', 'def sikistir(metin):\n    if not metin:\n        return ""\n    sonuc = ""\n    onceki = metin[0]\n    sayi = 1\n    for k in metin[1:]:\n        if k == onceki:\n            sayi += 1\n        else:\n            sonuc += onceki + str(sayi)\n            onceki = k\n            sayi = 1\n    return sonuc + onceki + str(sayi)', [{ kod: 'print(sikistir("aaabcc"))', cikti: 'a3b1c2' }, { kod: 'print(sikistir("x"))', cikti: 'x1' }, { kod: 'print(sikistir(""))', cikti: '' }, { kod: 'print(sikistir("bbbbbbbbbbbbw"))', cikti: 'b12w1' }], F),
        g2('rleac', 'proje', 'RLE Açma', 'Sıkıştırılmış metni geri aç: <code>ac("a3b1c2")</code> → <code>"aaabcc"</code>. Sayılar birden fazla basamaklı olabilir (<code>b12</code>).',
            'def ac(metin):\n    return metin\n', 'Harfi sakla, ardından gelen rakamları biriktir; yeni harf gelince harf * sayı ekle.', 'def ac(metin):\n    sonuc = ""\n    harf = ""\n    sayi = ""\n    for k in metin:\n        if k.isdigit():\n            sayi += k\n        else:\n            if harf:\n                sonuc += harf * int(sayi)\n            harf = k\n            sayi = ""\n    if harf:\n        sonuc += harf * int(sayi)\n    return sonuc', [{ kod: 'print(ac("a3b1c2"))', cikti: 'aaabcc' }, { kod: 'print(ac("b12w1"))', cikti: 'bbbbbbbbbbbbw' }, { kod: 'print(ac(""))', cikti: '' }], F),
        g2('pariteekle', 'proje', 'Eşlik Biti Ekle', 'Veri gönderilirken sona bir eşlik biti eklenir: 1\'lerin sayısı tekse 1, çiftse 0. <code>parite_ekle("1011")</code> → <code>"10111"</code>',
            'def parite_ekle(bitler):\n    return bitler\n', 'bitler.count("1") % 2', 'def parite_ekle(bitler):\n    return bitler + str(bitler.count("1") % 2)', [{ kod: 'print(parite_ekle("1011"))', cikti: '10111' }, { kod: 'print(parite_ekle("1001"))', cikti: '10010' }, { kod: 'print(parite_ekle("0000"))', cikti: '00000' }], F),
        g2('ipdogrula', 'proje', 'IP Adresi Doğrulama', '<code>gecerli_ip(adres)</code>: nokta ile ayrılmış tam 4 parça varsa, her parça yalnız rakamlardan oluşuyorsa ve 0–255 arasındaysa <code>True</code> döndürsün.',
            'def gecerli_ip(adres):\n    return True\n', 'parcalar = adres.split("."); len(parcalar) == 4; p.isdigit() and 0 <= int(p) <= 255', 'def gecerli_ip(adres):\n    parcalar = adres.split(".")\n    if len(parcalar) != 4:\n        return False\n    for p in parcalar:\n        if not p.isdigit() or int(p) > 255:\n            return False\n    return True', [{ kod: 'print(gecerli_ip("192.168.1.20"))', cikti: 'True' }, { kod: 'print(gecerli_ip("256.1.1.1"))', cikti: 'False' }, { kod: 'print(gecerli_ip("10.0.0"))', cikti: 'False' }, { kod: 'print(gecerli_ip("a.b.c.d"))', cikti: 'False' }, { kod: 'print(gecerli_ip("0.0.0.0"))', cikti: 'True' }], F),
        g2('mors', 'proje', 'Mors Alfabesi', 'Sözlükteki karşılıkları kullanarak <code>mors(metin)</code> metni Mors koduna çevirsin; harfler arasında bir boşluk olsun.',
            'KOD = {"S": "...", "O": "---", "K": "-.-", "D": "-..", "A": ".-", "L": ".-.."}\n\ndef mors(metin):\n    return ""\n', 'return " ".join(KOD[h] for h in metin)', 'KOD = {"S": "...", "O": "---", "K": "-.-", "D": "-..", "A": ".-", "L": ".-.."}\n\ndef mors(metin):\n    return " ".join(KOD[h] for h in metin)', [{ kod: 'print(mors("SOS"))', cikti: '... --- ...' }, { kod: 'print(mors("KOD"))', cikti: '-.- --- -..' }, { kod: 'print(mors("A"))', cikti: '.-' }], F),
        g2('histogram', 'proje', 'Metin Grafiği', 'Haftanın 5 günü için ekran saatlerini (tek satırda, boşlukla) oku. Her gün için <b>1: ###</b> biçiminde, saat kadar # içeren bir çubuk çiz.',
            'saatler = input().split()\n', 'for i, s in enumerate(saatler, 1): print(f"{i}: " + "#" * int(s))', 'saatler = input().split()\nfor i, s in enumerate(saatler, 1):\n    print(f"{i}: " + "#" * int(s))', [{ girdi: ['3 1 4 0 2'], cikti: '1: ###\n2: #\n3: ####\n4: \n5: ##' }]),
        g2('dondur', 'proje', 'Resmi Döndür', 'Bir resim, piksellerden oluşan bir matristir (liste içinde liste). <code>dondur(m)</code> resmi saat yönünde 90° döndürsün.',
            'def dondur(m):\n    return m\n', 'Yeni satır i: eski sütun i\'nin aşağıdan yukarı okunuşu → [list(s) for s in zip(*m[::-1])]', 'def dondur(m):\n    return [list(s) for s in zip(*m[::-1])]', [{ kod: 'print(dondur([[1, 2], [3, 4]]))', cikti: '[[3, 1], [4, 2]]' }, { kod: 'print(dondur([[1, 2, 3]]))', cikti: '[[1], [2], [3]]' }, { kod: 'print(dondur([[1, 0, 0], [1, 1, 0], [1, 1, 1]]))', cikti: '[[1, 1, 1], [1, 1, 0], [1, 0, 0]]' }], F),
        g2('ikilitopla', 'proje', 'İkilik Toplama', 'İki ikilik sayıyı metin olarak topla: <code>topla("1011", "110")</code> → <code>"10001"</code>. Sağdan sola, eldeyle topla; <code>int(x, 2)</code> ya da <code>bin()</code> kullanma.',
            'def topla(a, b):\n    return ""\n', 'Kısa olanı başına 0 ekleyerek eşitle (zfill), sağdan sola elde ile topla.', 'def topla(a, b):\n    n = max(len(a), len(b))\n    a, b = a.zfill(n), b.zfill(n)\n    sonuc = ""\n    elde = 0\n    for i in range(n - 1, -1, -1):\n        t = int(a[i]) + int(b[i]) + elde\n        sonuc = str(t % 2) + sonuc\n        elde = t // 2\n    if elde:\n        sonuc = "1" + sonuc\n    return sonuc', [{ kod: 'print(topla("1011", "110"))', cikti: '10001' }, { kod: 'print(topla("0", "0"))', cikti: '0' }, { kod: 'print(topla("1", "1"))', cikti: '10' }, { kod: 'print(topla("1111", "1"))', cikti: '10000' }], { ...F, yasak: ['bin'] }),
        g2('asmaca', 'proje', 'Adam Asmaca Ekranı', '<code>goster(kelime, tahminler)</code>: tahmin edilen harfleri göster, diğerlerinin yerine _ koy; aralarına boşluk koy. <code>goster("kod", ["o"])</code> → <code>"_ o _"</code>',
            'def goster(kelime, tahminler):\n    return kelime\n', '" ".join(h if h in tahminler else "_" for h in kelime)', 'def goster(kelime, tahminler):\n    return " ".join(h if h in tahminler else "_" for h in kelime)', [{ kod: 'print(goster("kod", ["o"]))', cikti: '_ o _' }, { kod: 'print(goster("python", []))', cikti: '_ _ _ _ _ _' }, { kod: 'print(goster("ada", ["a", "d"]))', cikti: 'a d a' }], F),
        g2('saatfark', 'proje', 'Ders Süresi', '<code>fark(bas, bit)</code> "08:30" gibi iki saat arasındaki farkı dakika olarak döndürsün.',
            'def fark(bas, bit):\n    return 0\n', 'Her saati dakikaya çevir: saat * 60 + dakika', 'def fark(bas, bit):\n    def dk(s):\n        saat, dakika = s.split(":")\n        return int(saat) * 60 + int(dakika)\n    return dk(bit) - dk(bas)', [{ kod: 'print(fark("08:30", "10:15"))', cikti: '105' }, { kod: 'print(fark("12:00", "12:40"))', cikti: '40' }, { kod: 'print(fark("09:45", "09:45"))', cikti: '0' }], F)
    );

    // Görevler ünite sırasıyla dizilir (numaralar arayüzde sıralı görünsün); ilerleme kimlikle saklandığı için kayıtlar etkilenmez
    GOREVLER.sort((a, b) => UNITELER.findIndex(u => u.id === a.unite) - UNITELER.findIndex(u => u.id === b.unite));

    // ---------- Çıktı karşılaştırma ----------
    const normal = (s) => String(s).replace(/\r/g, '').split('\n').map(x => x.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
    const ayni = (a, b) => normal(a) === normal(b);

    // Yasaklı yapı kullanımı (yorumlar ve metinler hariç basit kontrol)
    function yasakKullanim(g, kod) {
        if (!g.yasak) return null;
        const temiz = kod.replace(/#.*$/gm, '').replace(/("""|''')[\s\S]*?\1|"[^"\n]*"|'[^'\n]*'/g, '""');
        return g.yasak.find(y => new RegExp(`\\b${y}\\s*\\(|\\.${y}\\s*\\(`).test(temiz)) || null;
    }

    // ---------- Türkçe hata açıklamaları ----------
    function hataAcikla(tur, mesaj, satir) {
        const yer = satir ? `${satir}. satırda ` : '';
        const m = String(mesaj || '');
        let ad, aciklama;
        switch (tur) {
            case 'SyntaxError':
                ad = 'Yazım hatası';
                if (/unterminated string|EOL while scanning/.test(m)) aciklama = 'Bir metnin tırnağı kapanmamış. Açtığın tırnağı kapatmayı unutma.';
                else if (/was never closed|unexpected EOF/.test(m)) aciklama = 'Açılan bir parantez kapanmamış.';
                else if (/expected ':'/.test(m)) aciklama = 'if, else, for, while ve def satırlarının sonuna iki nokta (:) koymalısın.';
                else if (/invalid syntax\. Maybe you meant '==' or ':=' instead of '='/.test(m) || /cannot assign/.test(m)) aciklama = 'Karşılaştırma için == (iki eşittir) kullanılır. Tek = değer atar.';
                else if (/unmatched/.test(m)) aciklama = 'Fazladan bir kapanış parantezi var.';
                else if (/invalid character/.test(m)) aciklama = 'Python\'un tanımadığı bir karakter var. Türkçe tırnak (“ ”) yerine düz tırnak (" ") kullan.';
                else aciklama = 'Python bu satırı anlayamadı. Parantez, tırnak ya da iki nokta (:) eksik olabilir.';
                break;
            case 'IndentationError': case 'TabError':
                ad = 'Girinti hatası';
                aciklama = /expected an indented block/.test(m) ? 'İki noktayla (:) biten satırın altındaki satırlar 4 boşluk içeriden başlamalı.' : /unexpected indent/.test(m) ? 'Bu satır gereksiz yere içeriden başlıyor. Üstündeki satırla aynı hizaya getir.' : 'Satırların başındaki boşluklar birbirini tutmuyor. Aynı bloktaki satırlar aynı hizada olmalı.';
                break;
            case 'NameError': {
                ad = 'İsim hatası';
                const isim = (m.match(/name '([^']+)'/) || [])[1];
                aciklama = isim ? `"${isim}" diye bir değişken ya da fonksiyon yok. Yazımını kontrol et; büyük-küçük harf önemli. Metin yazmak istediysen tırnak içine al.` : 'Tanımlanmamış bir isim kullandın.';
                break;
            }
            case 'TypeError':
                ad = 'Tür hatası';
                if (/can only concatenate str|must be str, not int|unsupported operand type.*'str'.*'int'|'int'.*'str'/.test(m)) aciklama = 'Metin ile sayıyı birlikte işleme sokamazsın. input() her zaman metin verir; sayı için int() kullan. Metne sayı eklemek için str() ya da f-metin kullan.';
                else if (/can't multiply sequence/.test(m)) aciklama = 'Bir metni ondalıklı sayıyla ya da başka bir metinle çarpamazsın.';
                else if (/not callable/.test(m)) aciklama = 'Fonksiyon olmayan bir şeyi fonksiyon gibi () ile çağırdın.';
                else if (/missing \d+ required positional argument|takes \d+ positional argument/.test(m)) aciklama = 'Fonksiyonu yanlış sayıda değerle çağırdın. Parantez içindeki değerleri kontrol et.';
                else aciklama = 'Bu işlem bu tür değerlerle yapılamıyor.';
                break;
            case 'ValueError':
                ad = 'Değer hatası';
                aciklama = /invalid literal for int/.test(m) ? 'int() bu metni sayıya çeviremedi. Girdi bir tam sayı olmalı (harf, boşluk ya da virgül olmamalı).' : 'Fonksiyona uygun olmayan bir değer verdin.';
                break;
            case 'ZeroDivisionError': ad = 'Sıfıra bölme'; aciklama = 'Bir sayı sıfıra bölünemez. Bölen değişkenin 0 olup olmadığına bak.'; break;
            case 'IndexError': ad = 'Sıra hatası'; aciklama = 'Listede ya da metinde olmayan bir sıraya ulaşmaya çalıştın. Saymanın 0\'dan başladığını, son sıranın len() - 1 olduğunu unutma.'; break;
            case 'KeyError': ad = 'Anahtar hatası'; aciklama = 'Sözlükte olmayan bir anahtarı kullandın.'; break;
            case 'AttributeError': ad = 'Özellik hatası'; aciklama = 'Bu değerin böyle bir özelliği ya da metodu yok. Yazımı kontrol et.'; break;
            case 'RecursionError': ad = 'Sonsuz özyineleme'; aciklama = 'Fonksiyon kendini durmadan çağırıyor. Bir durma koşulu (if ... return) ekle.'; break;
            case 'CokCikti': ad = 'Çok fazla çıktı'; aciklama = 'Program çok fazla yazı üretti. Sonsuz bir döngü olabilir mi?'; break;
            case 'Zaman': ad = 'Süre doldu'; aciklama = 'Program çok uzun sürdü ve durduruldu. Döngünün koşulu hiç yanlış olmuyor olabilir (sonsuz döngü).'; break;
            default: ad = tur; aciklama = 'Program çalışırken bir hata oluştu.';
        }
        return { ad, aciklama, yer, satir: satir || 0, ham: tur && tur !== 'Zaman' && tur !== 'CokCikti' ? `${tur}: ${m}` : '' };
    }

    // ---------- Çalıştırma (Pyodide nesnesi py ile; tarayıcıda işçide, testte Node'da) ----------
    function calistir(py, kod, girdiler, tohum, yaz, istemYaz, ek) {
        const f = py.globals.get('_kl_calistir');
        const g = py.toPy(girdiler || []);
        try {
            const r = f(kod, g, tohum || 0, yaz, !!istemYaz, ek || '');
            const d = r.toJs(); r.destroy();
            return { durum: d[0], tur: d[1], satir: d[2], mesaj: d[3] };
        } finally { g.destroy(); f.destroy(); }
    }
    // Bir görevin bütün testlerini çalıştırır: [{ gecti, girdi, beklenen, cikti, hata? }]
    function denetle(py, g, kod) {
        return g.testler.map(t => {
            let cikti = '';
            const r = calistir(py, kod, t.girdi, 1, (s) => { cikti += s; }, false, t.kod);
            const sonuc = { girdi: t.girdi || [], kod: t.kod || '', beklenen: t.cikti, cikti };
            if (r.durum === 'hata') sonuc.hata = hataAcikla(r.tur, r.mesaj, r.satir);
            else if (r.durum === 'girdi') sonuc.hata = { ad: 'Eksik girdi', aciklama: 'Program bu testte verilenden daha fazla input() istedi.', yer: '', satir: 0, ham: '' };
            sonuc.gecti = r.durum === 'tamam' && ayni(cikti, t.cikti);
            return sonuc;
        });
    }

    const api = { calistir, denetle, HARNESS, UNITELER, GOREVLER, ALFABE, normal, ayni, yasakKullanim, hataAcikla };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.PythonMotor = api;
})(typeof self !== 'undefined' ? self : this);
