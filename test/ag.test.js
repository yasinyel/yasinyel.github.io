// Çalıştır: node test/ag.test.js
const assert = require('assert');
const A = require('../ag-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
test('Paketler birleşince mesaj geri geliyor', () => {
    for (let t = 0; t < 200; t++) {
        const q = A.paketSorusu(t % 2 === 1);
        assert.strictEqual(q.paketler.map(p => p.veri).join(''), q.mesaj);
        assert.strictEqual(q.gelen.length, q.paketler.length - (q.kayip ? 1 : 0));
        if (q.kayip) assert.ok(!q.gelen.some(p => p.sira === q.kayip) && q.kayip > 1 && q.kayip < q.paketler.length);
    }
});
test('Ağlar bağlantılı ve en kısa yol var', () => {
    for (const ag of A.AGLAR) {
        const e = A.enKisaYol(ag);
        assert.ok(e.yol && isFinite(e.sure), ag.ad);
        for (const [a, b] of ag.kenarlar) assert.ok(ag.dugumler[a] && ag.dugumler[b]);
    }
});
test('Bölüm 2: en az duraklı yol en hızlı değil (öğretilen fikir)', () => {
    const ag = A.AGLAR[1], e = A.enKisaYol(ag);
    // En az durak (BFS)
    const kuyruk = [['K']], gor = new Set(['K']); let enAz = null;
    while (kuyruk.length) { const y = kuyruk.shift(), s = y[y.length - 1]; if (s === 'H') { enAz = y; break; } for (const { d } of A.komsular(ag, s)) if (!gor.has(d)) { gor.add(d); kuyruk.push([...y, d]); } }
    const sure = (y) => y.slice(1).reduce((t, d, i) => t + ag.kenarlar.find(([a, b]) => (a === y[i] && b === d) || (b === y[i] && a === d))[2], 0);
    assert.ok(enAz.length < e.yol.length && sure(enAz) > e.sure, `${enAz} ${sure(enAz)} vs ${e.yol} ${e.sure}`);
});
test('Bölüm 3: kopan bağlantı en kısa yolun üzerinde ve kopunca başka yol var', () => {
    const ag = A.AGLAR[2], e = A.enKisaYol(ag);
    const yolKenari = e.yol.some((d, i) => i > 0 && A.kopukMu([e.yol[i - 1], d], ag.kopma));
    assert.ok(yolKenari, 'kopma en kısa yolda olmalı: ' + e.yol);
    // Kopma, paket D'ye vardığında olur; D'den yeni en kısa yol olmalı
    const yeni = A.enKisaYol(ag, 'D', ag.kopma);
    assert.ok(yeni.yol && yeni.yol.length > 2, 'kopmadan sonra yol yok');
});
test('Bölüm 4: en kısa yol TTL sınırına sığıyor', () => {
    const ag = A.AGLAR[3], e = A.enKisaYol(ag);
    assert.ok(e.yol.length - 1 <= ag.ttl);
});
test('IP doğrulama', () => {
    for (const s of ['192.168.1.1', '8.8.8.8', '0.0.0.0', '255.255.255.255']) assert.ok(A.ipGecerliMi(s), s);
    for (const s of ['256.1.1.1', '1.1.1', '1.1.1.1.1', '1.a.1.1', '01.2.3.4', '']) assert.ok(!A.ipGecerliMi(s), s);
    for (let t = 0; t < 500; t++) { const q = A.ipSorusu(); assert.strictEqual(A.ipGecerliMi(q.ip), q.gecerli, q.ip); }
});
test('DNS soruları', () => { for (let t = 0; t < 50; t++) { const q = A.dnsSorusu(); assert.strictEqual(q.adimlar.length, 3); assert.ok(A.ipGecerliMi(q.ip)); assert.ok(!q.yanlis.includes(q.adimlar[1].sunucu)); } });
console.log(hata ? `${hata} hata` : 'Ağ motoru doğrulandı');
process.exit(hata ? 1 : 0);
