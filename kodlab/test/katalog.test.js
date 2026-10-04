// Çalıştır: node kodlab/test/katalog.test.js
const assert = require('assert');
const store = {};
global.KL = { oku: (k, v) => (k in store ? JSON.parse(JSON.stringify(store[k])) : v), yaz: (k, v) => { store[k] = JSON.parse(JSON.stringify(v)); }, ipucuOzeti: () => store.ipucuOzeti || {} };
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
    store.ipucuOzeti = { robot: [3, 1] };
    const kod = K.raporOlustur({ ad: 'Çağrı Işık Öztürk', sinif: '9-Ş', no: '42' }, 'g123');
    const r = K.raporOku('Merhaba öğretmenim, kodum: ' + kod + ' teşekkürler');
    assert.strictEqual(r.ad, 'Çağrı Işık Öztürk'); assert.strictEqual(r.sinif, '9-Ş'); assert.strictEqual(r.gorev, 'g123');
    const dolgu = (id, s) => s.padEnd(K.parca(id).seviye, '0');
    assert.strictEqual(r.ilerleme.robot, dolgu('robot', '320001'));
    assert.strictEqual(r.ilerleme['sensin.lise'], dolgu('sensin.lise', '300000000002'));
    assert.strictEqual(r.ilerleme.algoritma, dolgu('algoritma', '003'));
    assert.deepStrictEqual(r.ipucu, { robot: [3, 1] });
    delete store.ipucuOzeti;
    assert.ok(kod.length < 320, 'kod çok uzun: ' + kod.length);
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
    const src = require('fs').readFileSync(require('path').join(__dirname, '../katalog.js'), 'utf8');
    assert.deepStrictEqual(JSON.parse(src.match(/PYTHON_FONK = (\[.*?\]);/)[1].replace(/'/g, '"')), M.GOREVLER.filter(g => g.unite === 'fonk').map(g => g.id));
    assert.deepStrictEqual(JSON.parse(src.match(/PYTHON_IDLER = (\[.*?\]);/)[1].replace(/'/g, '"')), M.GOREVLER.map(g => g.id));
});
test('KodKart görev listesi motorla aynı', () => {
    const D = require('../devre-motor.js');
    assert.strictEqual(K.parca('devre').yildiz().length, D.GOREVLER.filter(g => !g.serbest).length);
});
test('Günün görevleri ve gün serisi', () => {
    const t1 = K.gununGorevleri('2026-10-04', [5, 8]);
    assert.deepStrictEqual(t1, K.gununGorevleri('2026-10-04', [5, 8]), 'aynı gün aynı görevler');
    assert.strictEqual(t1.length, 3); assert.strictEqual(t1[0], 'bulmaca');
    assert.strictEqual(new Set(t1.map(id => K.parca(id).etkinlik.id)).size, 3, 'farklı etkinlikler');
    for (const id of t1) { const p = K.parca(id); assert.ok(p.sinif[0] <= 8 && p.sinif[1] >= 5, id + ' kademe'); }
    const farkli = new Set(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'].map(d => K.gununGorevleri(d, [5, 8]).join()));
    assert.ok(farkli.size >= 4, 'günler arasında çeşitlilik');
    for (const k of Object.keys(store)) delete store[k];
    const gun = (d) => new Date(d + 'T10:00:00').getTime();
    let g = K.gunluk(gun('2026-10-04'), [5, 8]);
    assert.ok(!g.bitti && g.seri === 0 && g.gorevler.every(x => !x.tamam));
    // Görevleri tamamla: bulmaca günlük, diğer ikisinde bir yıldız artışı
    store.bulmaca = { gunluk: { '2026-10-04': true }, cozulen: { 'piksel-0': 1 }, yildiz: { 'piksel-0': 3 } };
    g = K.gunluk(gun('2026-10-04'), [5, 8]);
    assert.ok(g.gorevler[0].tamam && !g.bitti);
    // Ölçüyü elle artırmak için diğer görevlerin başlangıç ölçüsünü düşür (yıldız kazanmış gibi)
    const kayit = store.gunluk; kayit.gorevler.forEach((x, i) => { if (i) x.bas = K.olcu(x.id) - 1; }); store.gunluk = kayit;
    g = K.gunluk(gun('2026-10-04'), [5, 8]);
    assert.ok(g.bitti && g.yeniBitti && g.seri === 1);
    g = K.gunluk(gun('2026-10-04'), [5, 8]);
    assert.ok(g.bitti && !g.yeniBitti && g.seri === 1, 'aynı gün ikinci kez sayılmaz');
    // Ertesi gün: yeni görevler, seri sürüyor; bitirince 2
    g = K.gunluk(gun('2026-10-05'), [5, 8]);
    assert.ok(!g.bitti && g.seri === 1 && store.gunluk.tarih === '2026-10-05');
    store.bulmaca.gunluk['2026-10-05'] = true;
    store.gunluk.gorevler.forEach((x, i) => { if (i) x.bas = K.olcu(x.id) - 1; });
    assert.strictEqual(K.gunluk(gun('2026-10-05'), [5, 8]).seri, 2);
    // Bir gün atlanırsa seri sıfırlanır
    assert.strictEqual(K.gunluk(gun('2026-10-07'), [5, 8]).seri, 0);
    store.bulmaca.gunluk['2026-10-07'] = true;
    store.gunluk.gorevler.forEach((x, i) => { if (i) x.bas = K.olcu(x.id) - 1; });
    const s = K.gunluk(gun('2026-10-07'), [5, 8]);
    assert.ok(s.seri === 1 && s.enUzun === 2);
    // Sürpriz kademeye uygun
    for (let i = 0; i < 20; i++) { const p = K.surpriz([0, 0], () => i / 20); assert.ok(p.sinif[0] === 0, p.id); }
    for (const k of Object.keys(store)) delete store[k];
});

console.log(hata ? `${hata} hata` : 'Katalog doğrulandı');
process.exit(hata ? 1 : 0);
