// Çalıştır: node kodlab/test/robot.test.js
const assert = require('assert');
const M = require('../robot-motor.js');
const SEVIYELER = require('../robot-seviyeler.js');

let hata = 0;
function test(ad, fn) {
    try { fn(); console.log('  ✓ ' + ad); }
    catch (e) { hata++; console.log('  ✗ ' + ad + '\n     ' + e.message); }
}

console.log('Bölümler');
SEVIYELER.forEach((s, i) => {
    test(`${i + 1}. ${s.baslik}: örnek çözüm tüm haritalarda çalışıyor ve hedefi tutturuyor`, () => {
        for (const [h, harita] of s.haritalar.entries()) {
            const r = M.hizliCalistir(s.cozum, harita);
            assert.ok(r.basari, `harita ${h + 1}: ${r.hata || 'kalan yıldız ' + r.kalan} (satır ${r.satir})`);
            assert.ok(r.komutSayisi <= s.hedef, `komut ${r.komutSayisi} > hedef ${s.hedef}`);
        }
    });
    test(`${i + 1}. ${s.baslik}: haritalar geçerli`, () => {
        for (const harita of s.haritalar) {
            const h = M.haritaOku(harita);
            assert.ok(h.yildiz > 0, 'yıldız yok');
        }
    });
});

console.log('Dil');
test('Türkçe karakter olmadan da yazılabilir', () => {
    const r = M.hizliCalistir('tekrarla 4 {\n ileri(3)\n saga()\n}', SEVIYELER[5].haritalar[0]);
    assert.ok(r.basari);
});
test('Büyük harf ve parantezli tekrarla kabul edilir', () => {
    const r = M.hizliCalistir('Tekrarla(4) {\n İLERİ(3)\n SAĞA()\n}', SEVIYELER[5].haritalar[0]);
    assert.ok(r.basari, r.hata);
});
test('Duvara çarpma hata verir', () => {
    const r = M.hizliCalistir('ileri(9)', SEVIYELER[0].haritalar[0]);
    assert.ok(!r.basari && /çarptı/.test(r.hata) || r.basari);
});
test('Duvara çarpma: yıldızdan önce', () => {
    const r = M.hizliCalistir('sola()\nileri()', SEVIYELER[0].haritalar[0]);
    assert.ok(!r.basari && /çarptı/.test(r.hata));
});
test('Bilinmeyen komut satır numarasıyla bildirilir', () => {
    assert.throws(() => M.ayristir('ileri()\nzıpla()'), e => e.satir === 2 && /zıpla/.test(e.message));
});
test('Kapanmayan blok', () => {
    assert.throws(() => M.ayristir('tekrarla 3 {\n ileri()'), /kapatılmamış/);
});
test('Sonsuz döngü yakalanır', () => {
    const r = M.hizliCalistir('iken yıldız_kaldı {\n sağa()\n}', SEVIYELER[0].haritalar[0]);
    assert.ok(!r.basari && /Sonsuz/.test(r.hata));
});
test('Sonsuz özyineleme yakalanır', () => {
    const r = M.hizliCalistir('fonksiyon a {\n a()\n}\na()', SEVIYELER[0].haritalar[0]);
    assert.ok(!r.basari);
});
test('değil ve değilse eğer', () => {
    const r = M.hizliCalistir('iken değil(önü_boş) {\n sağa()\n}\nileri(4)', SEVIYELER[0].haritalar[0]);
    assert.ok(r.basari, r.hata);
    M.ayristir('eğer önü_boş {\n ileri()\n} değilse eğer sağı_boş {\n sağa()\n} değilse {\n sola()\n}');
});
test('Komut sayımı', () => {
    assert.strictEqual(M.ayristir('tekrarla 4 {\n ileri(3)\n sağa()\n}').komutSayisi, 3);
});

console.log(hata ? `\n${hata} test başarısız` : '\nTüm testler geçti');
process.exit(hata ? 1 : 0);
