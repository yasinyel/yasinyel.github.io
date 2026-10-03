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
    assert.strictEqual(K.parca('cizim').seviye, require('../cizim-motor.js').BOLUMLER.length);
    assert.strictEqual(K.parca('sifre').seviye, require('../sifre-motor.js').BOLUMLER.length);
    assert.strictEqual(K.parca('web').seviye, require('../web-motor.js').BOLUMLER.length);
    for (const p of K.PARCALAR) assert.strictEqual(p.yildiz().length, p.seviye, p.id);
    // Gizli Mesaj sırası motordaki bölüm sırasıyla aynı olmalı
    store.sifre = Object.fromEntries(require('../sifre-motor.js').BOLUMLER.map((b, i) => [b.id, (i % 3) + 1]));
    assert.deepStrictEqual(K.parca('sifre').yildiz(), require('../sifre-motor.js').BOLUMLER.map((_, i) => (i % 3) + 1));
    delete store.sifre;
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
test('Python görev listesi motorla aynı', () => {
    const M = require('../python-motor.js');
    assert.strictEqual(K.parca('python').yildiz().length, M.GOREVLER.length);
    assert.strictEqual(M.GOREVLER.findIndex(g => g.unite === 'fonk'), 25);
    const src = require('fs').readFileSync(require('path').join(__dirname, '../katalog.js'), 'utf8');
    assert.deepStrictEqual(JSON.parse(src.match(/PYTHON_IDLER = (\[.*?\]);/)[1].replace(/'/g, '"')), M.GOREVLER.map(g => g.id));
});
test('KodKart görev listesi motorla aynı', () => {
    const D = require('../devre-motor.js');
    assert.strictEqual(K.parca('devre').yildiz().length, D.GOREVLER.filter(g => !g.serbest).length);
});
console.log(hata ? `${hata} hata` : 'Katalog doğrulandı');
process.exit(hata ? 1 : 0);
