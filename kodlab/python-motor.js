// KodLab — Python Laboratuvarı: görevler, değerlendirme düzeneği ve Türkçe hata açıklamaları
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
            id: 'merhaba', unite: 'ilk', ad: 'Merhaba KodLab',
            anlatim: '<code>print()</code> ekrana yazı yazar. Yazıyı tırnak içine koymayı unutma.<br>Ekrana tam olarak <b>Merhaba KodLab!</b> yazdır.',
            baslangic: '# Bu satır bir yorumdur, Python onu çalıştırmaz.\n',
            ipucu: 'print("Merhaba KodLab!")',
            cozum: 'print("Merhaba KodLab!")',
            testler: [{ girdi: [], cikti: 'Merhaba KodLab!' }]
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
            baslangic: `ALFABE = "${ALFABE}"\n\ndef sezar(metin, kaydir):\n    sonuc = ""\n    for harf in metin:\n        if harf in ALFABE:\n            sira = ALFABE.index(harf)\n            # yeni harfi bul ve sonuca ekle\n        else:\n            sonuc += harf\n    return sonuc\n\nprint(sezar("KODLAB", 3))\n`,
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
