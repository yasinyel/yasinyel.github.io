// Çalıştır: node kodlab/test/katalog.test.js
const assert = require('assert');
const store = {};
global.KL = { oku: (k, v) => (k in store ? store[k] : v) };
const K = require('../katalog.js');
const S = require('../sensin-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };

test('Bölüm sayıları motorlarla aynı', () => {
    for (const kd of S.KADEMELER) assert.strictEqual(K.parca('sensin.' + kd.id).seviye, kd.bolumler.length, kd.id);
    assert.strictEqual(K.parca('robot').seviye, require('../robot-seviyeler.js').length);
    assert.strictEqual(K.parca('mantik').seviye, require('../mantik-motor.js').BOLUMLER.length);
    assert.strictEqual(K.parca('algoritma').seviye, require('../algoritma-motor.js').ALGORITMALAR.length);
    assert.strictEqual(K.parca('tahmin').seviye, require('../tahmin-sorular.js').SEVIYELER.length);
    for (const p of K.PARCALAR) assert.strictEqual(p.yildiz().length, p.seviye, p.id);
});
test('Rapor kodu gidip geliyor (Türkçe karakterlerle)', () => {
    store.robot = { yildiz: { 0: 3, 1: 2, 5: 1 } };
    store.sensin = { lise: { 0: 3, 11: 2 } };
    store.algoritma = { ikili: 3 };
    const kod = K.raporOlustur({ ad: 'Çağrı Işık Öztürk', sinif: '9-Ş', no: '42' }, 'g123');
    const r = K.raporOku('Merhaba öğretmenim, kodum: ' + kod + ' teşekkürler');
    assert.strictEqual(r.ad, 'Çağrı Işık Öztürk'); assert.strictEqual(r.sinif, '9-Ş'); assert.strictEqual(r.gorev, 'g123');
    assert.strictEqual(r.ilerleme.robot, '32000100000000');
    assert.strictEqual(r.ilerleme['sensin.lise'], '300000000002');
    assert.strictEqual(r.ilerleme.algoritma, '003000');
    assert.ok(kod.length < 300, 'kod çok uzun: ' + kod.length);
});
test('Bozuk kod reddediliyor', () => {
    const kod = K.raporOlustur({ ad: 'Ali', sinif: '5-A' });
    const bozuk = kod.slice(0, 12) + (kod[12] === 'A' ? 'B' : 'A') + kod.slice(13);
    assert.ok(K.raporOku(bozuk).hata);
    assert.strictEqual(K.raporOku('alakasız metin'), null);
});
test('Rozet ve unvan', () => {
    assert.ok(K.ROZETLER.find(r => r.id === 'ilk').kosul());
    assert.ok(K.ROZETLER.find(r => r.id === 'arama').kosul());
    assert.strictEqual(K.unvan(0).ad, 'Yeni Başlayan');
    assert.strictEqual(K.unvan(35).ad, 'Algoritma Kaşifi');
});
console.log(hata ? `${hata} hata` : 'Katalog doğrulandı');
process.exit(hata ? 1 : 0);
