// Çalıştır: node kodlab/test/tasarim.test.js — Robot Kodla bölüm tasarlayıcı
const T = require('../robot-tasarim.js');
const M = require('../robot-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const iyi = { baslik: 'Çılgın Labirent <b>', yazar: 'Ada Ç.', not: 'Duvarlara dikkat!', harita: ['>..#*', '.#.#.', '.....', '     '], hedef: 6 };
if (T.dogrula(iyi).length) hatali('iyi tasarım reddedildi: ' + T.dogrula(iyi));
const kod = T.kodla(iyi);
if (!/^[A-Za-z0-9_-]+$/.test(kod)) hatali('kod URL için uygun değil');
const geri = T.coz(kod);
if (!geri || geri.baslik !== iyi.baslik || geri.yazar !== 'Ada Ç.' || geri.hedef !== 6 || geri.harita.join('|') !== '>..#*|.#.#.|.....') hatali('kod gidip gelmiyor: ' + JSON.stringify(geri));
// Tasarlanan bölüm motorda çözülebilir
const s = T.seviye(geri);
const r = M.hizliCalistir('ileri(2)\nsağa()\nileri(2)\nsola()\nileri(2)\nsola()\nileri(2)', s.haritalar[0]);
if (!r.basari) hatali('tasarlanan bölüm çözülemedi: ' + (r.hata || r.kalan));
if (s.anlatim.includes('<b>') || !s.konu.includes('Ada')) hatali('metinler kaçışlanmadı / yazar yok');
const kotu = [
    [{ ...iyi, harita: ['...*'] }, 'robot'],
    [{ ...iyi, harita: ['>..', '...'] }, 'yıldız'],
    [{ ...iyi, harita: ['>.#*'] }, 'ulaşamıyor'],
    [{ ...iyi, harita: ['>.*>'] }, 'bir robot'],
    [{ ...iyi, harita: ['>' + '.'.repeat(12) + '*'] }, 'en fazla'],
    [{ ...iyi, hedef: 0 }, 'komut sayısı']
];
for (const [t, beklenen] of kotu) if (!T.dogrula(t).some(x => x.includes(beklenen))) hatali('yakalanmadı: ' + beklenen + ' → ' + T.dogrula(t));
if (T.coz('bozuk!!') !== null || T.coz(T.kodla({ ...iyi, harita: ['...*'] })) !== null) hatali('bozuk/geçersiz kod kabul edildi');
if (T.kirp(['   ', '  >.*  ', '   .   ', '']).join('|') !== '>.*| .') hatali('kırpma: ' + T.kirp(['   ', '  >.*  ', '   .   ', '']).join('|'));
console.log(hata ? `${hata} hata` : 'Bölüm tasarlayıcı doğrulandı');
process.exit(hata ? 1 : 0);
