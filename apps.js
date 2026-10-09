// Yeni uygulama eklemek için bu listeye bir nesne eklemek yeterli.
// platform: 'web' | 'desktop' | 'mobile'   status: 'active' | 'soon'
// image: img/ klasöründeki ekran görüntüsü (yoksa renkli önizleme çizilir)
const APPS = [
    {
        id: 'eagle',
        image: 'img/eagle.png',
        name: 'Eagle Eye',
        tagline: 'Laboratuvar bilgisayarlarını tek merkezden yönetin',
        platform: 'desktop',
        status: 'active',
        color: '#1f3b63',
        icon: 'fa-eye',
        description: 'Laboratuvardaki tüm bilgisayarları canlı bir ızgarada gösteren Windows uygulaması. Ekranları kilitleme, mesaj ve dosya gönderme, web sitesi açma, uygulama kapatma ve Wake-on-LAN ile uzaktan açma/kapatma sağlar. SYSTEM yetkisiyle çalışan servis sayesinde öğrenci ajanı kapatamaz.',
        features: ['Canlı ekran ızgarası', 'Toplu kilitleme', 'Mesaj gönderme', 'Dosya dağıtımı', 'Wake-on-LAN', 'Korumalı servis'],
        tech: ['C#', '.NET Framework', 'Windows Forms', 'Windows Servisi'],
        link: null,
        linkLabel: 'Windows masaüstü uygulaması'
    },
    {
        id: 'ekilit',
        image: 'img/ekilit.jpg',
        name: 'E-Kilit Sistemi',
        tagline: 'Akıllı tahtaları QR kodla açın',
        platform: 'web',
        status: 'active',
        color: '#6d4ae0',
        icon: 'fa-lock',
        description: 'Okuldaki akıllı tahtalar varsayılan olarak kilitli durur. Öğretmen tahtadaki QR kodu telefonuyla okutarak tahtayı açar, süre dolunca tahta otomatik yeniden kilitlenir. Yönetici tüm tahtaları tek panelden görür, çevrimiçi durumlarını izler ve uzaktan açıp kilitleyebilir. Tahtalarda C# ile yazılmış bir kiosk programı çalışır.',
        features: ['QR ile açma', 'Otomatik kilit', 'Uzaktan yönetim', 'Çevrimiçi takibi', 'Excel ile öğretmen ekleme', 'Kiosk programı'],
        tech: ['React', 'Vite', 'Firebase', 'C# Kiosk', 'Vercel'],
        link: 'https://ekilitsistemi.com'
    },
    {
        id: 'cikis',
        image: 'img/cikis.jpg',
        name: 'Çıkış Sistemi',
        tagline: 'QR kodlu veli çağrı sistemi — BK QR SİS',
        platform: 'web',
        status: 'active',
        color: '#0e8aa8',
        icon: 'fa-door-open',
        description: 'Anasınıfı öğrencilerinin akşam çıkışını düzenler. Veli kapıda QR kodunu okutur, öğrencinin adı sınıfın akıllı tahtasında sesli uyarıyla belirir. Öğretmen çocuğu gönderince kapıdaki ekranda "yolda" olarak görünür. Nöbetçi öğretmen tüm sınıfları anlık izler.',
        features: ['QR veli kartı', 'Sesli çağrı', 'Tahta ekranı', 'Nöbetçi paneli', 'Çıkış geçmişi'],
        tech: ['React', 'Vite', 'TypeScript', 'Firebase', 'Vercel'],
        link: 'https://bkqrsis.com'
    },
    {
        id: 'store',
        image: 'img/store.jpg',
        name: 'Store Sistemi',
        tagline: 'Okul kıyafeti satış ve stok takibi',
        platform: 'web',
        status: 'active',
        color: '#c2366f',
        icon: 'fa-store',
        description: 'Okul kıyafeti satışı için barkodlu kasa, beden bazında stok takibi, öğrenciye bağlı satış geçmişi, iade/değişim, gün sonu kasa kontrolü ve eğitim-öğretim yılı geçişi. Yönetici, kasiyer ve müdür için ayrı yetkiler.',
        features: ['Barkodlu kasa', 'Beden bazlı stok', 'İade & değişim', 'Gün sonu', 'Excel aktarımı', 'Rol yönetimi'],
        tech: ['React', 'Vite', 'TypeScript', 'Firebase', 'Vercel'],
        link: 'https://store-sistemi.vercel.app'
    },
    {
        id: 'anket',
        image: 'img/anket.jpg',
        name: 'Anket Sistemi',
        tagline: 'QR kodlu okul anketleri, canlı sonuçlar',
        platform: 'web',
        status: 'active',
        color: '#138a7e',
        icon: 'fa-square-poll-vertical',
        description: 'Okul etkinlikleri, veli ve öğrenci anketleri için QR kodlu anket sistemi. Katılımcılar telefonlarından anonim yanıt verir; projeksiyon ekranında yanıt sayacı canlı güncellenir. Sonuçlar grafiklerle izlenir ve Excel raporu olarak indirilir.',
        features: ['Anket oluşturma', 'QR ile katılım', 'Canlı grafikler', 'Projeksiyon ekranı', 'Excel raporu'],
        tech: ['Vite', 'JavaScript', 'Firebase', 'Vercel'],
        link: 'https://anket-black.vercel.app'
    },
    {
        id: 'yoklama',
        image: 'img/yoklama.jpg',
        name: 'Öğrenci Yoklama Sistemi',
        tagline: 'Okullar için dijital yoklama',
        platform: 'web',
        status: 'active',
        color: '#15935f',
        icon: 'fa-clipboard-check',
        description: 'Öğretmenlerin dijital ortamda hızlı ve kolay yoklama almasını sağlayan web tabanlı sistem. Sınıf yönetimi, yoklama raporları ve devamsızlık takibiyle okul süreçlerini dijitalleştirir.',
        features: ['Hızlı yoklama', 'Sınıf yönetimi', 'Devamsızlık raporu', 'Raporlama', 'Güvenli giriş'],
        tech: ['Next.js', 'React', 'TypeScript', 'Firebase'],
        link: 'https://yoklamasistemi.com'
    },
    {
        id: 'ibkit',
        image: 'img/ibkit.jpg',
        name: 'IBKIT',
        tagline: 'Okulun bilgi işlem yönetim sistemi',
        platform: 'web',
        status: 'active',
        color: '#2563eb',
        icon: 'fa-server',
        description: 'Eğitim kurumlarının bilgi işlem altyapısını yönetmek için geliştirilmiş kapsamlı bir web uygulaması. Envanter takibi, arıza yönetimi, stok kontrolü, harcama ve teklif yönetimi, laboratuvar takibi ve personel yönetimi modüllerini içerir.',
        features: ['Envanter', 'Arıza takibi', 'Stok kontrolü', 'Harcama & teklif', 'Laboratuvar', 'Raporlama'],
        tech: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Vercel'],
        link: 'https://ibkit.vercel.app'
    },
    {
        id: 'pdf',
        image: 'img/pdfhazirla.png',
        name: 'PDF Hazırla',
        tagline: 'PDF\'leri saniyeler içinde birleştir, düzenle',
        platform: 'web',
        status: 'active',
        color: '#d9412f',
        icon: 'fa-file-pdf',
        description: 'Öğretmenlerin ders materyali, sınav ve çalışma kâğıtlarını hızlıca hazırlamasını sağlayan ücretsiz PDF editörü. PDF\'lerden bölgeleri kesip birleştirme, üzerine yazma, çizme, vurgulama ve filigran kaldırma; tamamı tarayıcıda çalışır, dosyalar sunucuya gönderilmez.',
        features: ['Kes & birleştir', 'Yaz & çiz', 'Filigran kaldırma', 'Çalışma sayfası', 'Bulut kayıt', 'Mobil uyumlu'],
        tech: ['Next.js', 'React', 'TypeScript', 'Firebase'],
        link: 'https://pdfhazirla.com'
    },
    {
        id: 'kodlayalim',
        image: 'img/kodlayalim.png',
        name: 'Kodlayalım',
        tagline: 'Anasınıfından liseye kodlama etkinlikleri',
        platform: 'web',
        status: 'active',
        color: '#1d5fd6',
        icon: 'fa-robot',
        description: 'Anasınıfından liseye bilişim ve kodlama etkinlikleri. Blokla çizim, kod okuma, algoritma, şifre kırma ve yapay zekâ gibi 27 etkinlik, 557\'den fazla bölüm ve görev. İnternet olmadan da çalışır; öğretmen sınıf açar, ödev verir ve öğrencilerinin ilerlemesini takip eder.',
        features: ['27 etkinlik', 'İnternetsiz çalışma', 'Öğretmen paneli', 'Sınıf kodu ile giriş', 'İlerleme takibi', 'Türkçe'],
        tech: ['HTML', 'JavaScript', 'Firebase', 'Vercel'],
        link: 'https://kodlayalim.com'
    },
    {
        id: 'takip',
        name: 'Öğrenci Takip Sistemi',
        tagline: 'Özel ders öğretmenleri için mobil uygulama',
        platform: 'mobile',
        status: 'soon',
        color: '#d98a0b',
        icon: 'fa-graduation-cap',
        description: 'Özel ders öğretmenlerinin öğrenci takibi, ders planlama, ödeme yönetimi ve deneme sınavı takibi yapmasını sağlayan mobil uygulama. Veliler kendi hesaplarıyla çocuklarının derslerini ve ödemelerini izleyebilir.',
        features: ['Öğrenci yönetimi', 'Ders planlama', 'Ödeme takibi', 'Sınav analizi', 'Bildirimler', 'Veli paneli'],
        tech: ['React Native', 'TypeScript', 'Firebase', 'Xcode', 'RevenueCat'],
        link: null,
        linkLabel: 'App Store & Google Play — yakında'
    }
];

// "Okulda bir gün" zaman çizelgesi (örnek bir gün)
const DAY = [
    { time: '08:15', app: 'ekilit',  text: 'Öğretmen QR kodu okutur, sınıftaki akıllı tahta açılır.' },
    { time: '08:30', app: 'yoklama', text: 'İlk derste yoklama birkaç dokunuşla alınır.' },
    { time: '10:20', app: 'eagle',   text: 'Laboratuvar dersinde 30 ekran tek panelden izlenir.' },
    { time: '12:40', app: 'store',   text: 'Öğle arasında okul kıyafeti barkodla satılır.' },
    { time: '14:00', app: 'anket',   text: 'Veli toplantısında anket QR ile projeksiyona yansır.' },
    { time: '16:30', app: 'cikis',   text: 'Veli kapıda kartını okutur, çocuğun adı tahtada belirir.' }
];
