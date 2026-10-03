// KodLab — çevrimdışı çalışma (service worker)
// Bütün KodLab sayfaları ilk ziyarette önbelleğe alınır; internet kesilse de etkinlikler açılır.
// Dosya eklendiğinde DOSYALAR listesine eklenmeli ve SURUM artırılmalı (test/sw.test.js denetler).
const SURUM = 'kodlab-v4';
const DOSYALAR = [
        './',
        'ag-motor.js',
        'ag.html',
        'ag.js',
        'algoritma-motor.js',
        'algoritma.html',
        'algoritma.js',
        'blok-editor.css',
        'blok-editor.js',
        'cizim-motor.js',
        'cizim.html',
        'cizim.js',
        'gorev.html',
        'guvenlik-motor.js',
        'guvenlik.html',
        'guvenlik.js',
        'hata-motor.js',
        'hata.html',
        'hata.js',
        'ikilik.html',
        'ikilik.js',
        'index.html',
        'katalog.js',
        'manifest.webmanifest',
        'mantik-motor.js',
        'mantik.html',
        'mantik.js',
        'ogretmen.html',
        'ogretmen.js',
        'ortak.css',
        'ortak.js',
        'oruntu.html',
        'oruntu.js',
        'oyun-motor.js',
        'oyun.html',
        'oyun.js',
        'piksel.html',
        'piksel.js',
        'profil.html',
        'profil.js',
        'python-isci.js',
        'python-motor.js',
        'python.html',
        'python.js',
        'qr.js',
        'robot-motor.js',
        'robot-seviyeler.js',
        'robot.html',
        'robot.js',
        'sensin-motor.js',
        'sensin.html',
        'sensin.js',
        'sifre-motor.js',
        'sifre.html',
        'sifre.js',
        'tahmin-sorular.js',
        'tahmin.html',
        'tahmin.js',
        'web-motor.js',
        'web.html',
        'web.js',
        'yz-motor.js',
        'yz.html',
        'yz.js',
        'ikon/ikon-192.png',
        'ikon/ikon-512.png',
        'ikon/ikon-maskable-512.png',
        'ikon/ikon.svg',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys()
        .then(adlar => Promise.all(adlar.filter(a => a.startsWith('kodlab-') && a !== SURUM && a !== SURUM + '-dis').map(a => caches.delete(a))))
        .then(() => self.clients.claim()));
});

// Kendi dosyalarımız: önce ağ (güncel kalsın), olmazsa önbellek.
// Yazı tipi ve ikon kütüphanesi (CDN): önce önbellek, arkada güncelle.
self.addEventListener('fetch', (e) => {
    const istek = e.request;
    if (istek.method !== 'GET') return;
    const url = new URL(istek.url);
    const disKaynak = /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host);
    if (url.origin === location.origin) {
        e.respondWith(
            fetch(istek).then(yanit => {
                if (yanit.ok) { const kopya = yanit.clone(); caches.open(SURUM).then(c => c.put(istek, kopya)); }
                return yanit;
            }).catch(() => caches.match(istek, { ignoreSearch: true }).then(y => y || caches.match('./')))
        );
    } else if (disKaynak) {
        e.respondWith(caches.open(SURUM + '-dis').then(async c => {
            const onbellek = await c.match(istek);
            const ag = fetch(istek).then(yanit => { if (yanit.ok || yanit.type === 'opaque') c.put(istek, yanit.clone()); return yanit; }).catch(() => onbellek);
            return onbellek || ag;
        }));
    }
});
