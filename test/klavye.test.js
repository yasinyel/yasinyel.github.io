// Çalıştır: node kodlab/test/klavye.test.js — Klavye Ustası dersleri ve metin üretici
const K = require('../klavye-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const tuslar = new Set(K.DUZEN.flat());
for (const c of Object.keys(K.PARMAK)) if (!tuslar.has(c)) hatali('parmak eşlemesinde düzende olmayan tuş: ' + c);
for (const c of tuslar) if (K.PARMAK[c] === undefined) hatali('parmağı belli olmayan tuş: ' + JSON.stringify(c));
// Sol el 0-4, sağ el 5-9: f sol işaret, j sağ işaret
if (K.parmak('f') !== 3 || K.parmak('j') !== 6 || K.parmak('İ') !== K.parmak('i') || K.parmak('I') !== K.parmak('ı')) hatali('temel parmak eşlemesi');
const gorulen = new Set([' ']);
K.DERSLER.forEach((d, i) => {
    d.yeni.forEach(c => { if (!tuslar.has(c)) hatali(`${d.ad}: yeni tuş düzende yok ${c}`); if (gorulen.has(c)) hatali(`${d.ad}: ${c} daha önce öğretilmişti`); gorulen.add(c); });
    for (let t = 1; t <= 40; t++) {
        const m = K.metinUret(d, t * 31 + i);
        if (m.length < 100) { hatali(`${d.ad}: metin kısa`); break; }
        if (!d.cumle) {
            const disari = [...m].filter(c => !d.izinli.includes(c));
            if (disari.length) { hatali(`${d.ad}: izin verilmeyen karakter ${disari[0]}`); break; }
            if (d.yeni.length && ![...m].some(c => d.yeni.includes(c))) { hatali(`${d.ad}: yeni tuşlar metinde yok`); break; }
        } else if ([...m].some(c => K.parmak(c) === undefined)) { hatali(`${d.ad}: klavyede olmayan karakter`); break; }
    }
});
// Bütün Türkçe harfler öğretiliyor
for (const c of 'abcçdefgğhıijklmnoöprsştuüvyz') if (!gorulen.has(c)) hatali('öğretilmeyen harf ' + c);
if (K.KELIMELER.some(k => !/^[a-zçğıöşü]+$/.test(k))) hatali('kelime listesinde klavyede olmayan harf');
const s = K.istatistik(250, 5, 60000);
if (s.kdk !== 50 || s.dogruluk !== 98) hatali('istatistik ' + JSON.stringify(s));
if (K.yildiz(97) !== 3 || K.yildiz(95) !== 2 || K.yildiz(80) !== 1) hatali('yıldız');
for (let sv = 0; sv < 20; sv++) if (K.yagmurKelimeleri(sv).length < 8) hatali('yağmur kelimeleri az ' + sv);
if (K.metinUret(K.DERSLER[3], 9) !== K.metinUret(K.DERSLER[3], 9)) hatali('tohum tekrarlanabilir değil');
console.log(hata ? `${hata} hata` : `Klavye Ustası doğrulandı (${K.DERSLER.length} ders, ${K.KELIMELER.length} kelime)`);
process.exit(hata ? 1 : 0);
