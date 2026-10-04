// Çalıştır: node test/dersler.test.js — her etkinliğin eksiksiz bir ders planı olmalı
const K = require('../katalog.js'), D = require('../dersler-veri.js'), G = require('../kagit-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
for (const e of K.ETKINLIKLER) {
    const p = D.PLANLAR[e.id];
    if (!p) { hatali(e.id + ': ders planı yok'); continue; }
    for (const a of ['giris', 'isinma', 'cikis', 'destek', 'zenginlestirme']) if (!p[a] || p[a].length < 15) hatali(`${e.id}: ${a} eksik`);
    for (const a of ['hedefler', 'adimlar', 'tartisma']) if (!Array.isArray(p[a]) || p[a].length < 3) hatali(`${e.id}: ${a} en az 3 madde olmalı`);
    if (p.kagit && !G.KAGITLAR.some(k => k.id === p.kagit)) hatali(`${e.id}: bilinmeyen çalışma kağıdı ${p.kagit}`);
}
Object.keys(D.PLANLAR).filter(id => !K.ETKINLIKLER.some(e => e.id === id)).forEach(id => hatali('katalogda olmayan plan ' + id));
console.log(hata ? `${hata} hata` : `${Object.keys(D.PLANLAR).length} ders planı doğrulandı`);
process.exit(hata ? 1 : 0);
