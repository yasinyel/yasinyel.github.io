// Çalıştır: node kodlab/test/yz.test.js
// Etkinliklerin öğretmek istediği sonuçların gerçekten ortaya çıktığını yüzlerce rastgele veriyle doğrular.
const assert = require('assert');
const Y = require('../yz-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
const ort = (d) => d.reduce((a, b) => a + b, 0) / d.length;

test('Balık/çöp: 12 doğru etiketli örnekle model %85+ doğru', () => {
    const sonuclar = [];
    for (let t = 1; t <= 200; t++) {
        const veri = Y.okyanus(t, 112), egitim = veri.slice(0, 12), deneme = veri.slice(12);
        if (new Set(egitim.map(e => e.y)).size < 2) continue;
        sonuclar.push(Y.dogruluk(egitim, deneme, 3));
    }
    assert.ok(ort(sonuclar) > 0.85, 'ortalama ' + ort(sonuclar).toFixed(2));
});
test('Balık/çöp: yanlış etiketlenen veri modeli bozuyor', () => {
    const veri = Y.okyanus(7, 112), egitim = veri.slice(0, 20).map(e => ({ ...e, y: e.y === 'balik' ? 'cop' : 'balik' }));
    assert.ok(Y.dogruluk(egitim, veri.slice(20), 3) < 0.2);
});
test('Önyargı: yalnızca önyargılı veriyle eğitilen model "yerinde olmayan" hayvanları yanlış biliyor', () => {
    for (let t = 1; t <= 300; t++) {
        const { egitim, test: ts } = Y.onyargiliVeri(t);
        const yerinde = ts.filter(x => (x.y === 'kopek') === !!x.disari), yersiz = ts.filter(x => (x.y === 'kopek') !== !!x.disari);
        assert.ok(Y.dogruluk(egitim, yerinde, 3, Y.HAYVAN_AGIRLIK) >= 0.9, 't=' + t + ' yerinde');
        assert.ok(Y.dogruluk(egitim, yersiz, 3, Y.HAYVAN_AGIRLIK) <= 0.2, 't=' + t + ' yersiz ' + Y.dogruluk(egitim, yersiz, 3, Y.HAYVAN_AGIRLIK));
    }
});
test('Önyargı: çeşitli örnekler eklenince model düzeliyor (her veri setinde %85+, ortalama %93+)', () => {
    const d = [];
    for (let t = 1; t <= 300; t++) {
        const { egitim, havuz, test: ts } = Y.onyargiliVeri(t);
        const ac = Y.dogruluk([...egitim, ...havuz.slice(0, 12)], ts, 3, Y.HAYVAN_AGIRLIK);
        assert.ok(ac >= 0.85, 't=' + t + ' ' + ac);
        d.push(ac);
    }
    assert.ok(ort(d) >= 0.93, 'ortalama ' + ort(d));
});
test('Kendi kuralı: "boynuzlu olanlar" kuralı 15 örnekle öğreniliyor ve en önemli özellik boynuz çıkıyor', () => {
    const acc = [];
    let boynuzEnUstte = 0, sayi = 0;
    for (let t = 1; t <= 150; t++) {
        const u = Y.uzaylilar(t, 115).map(x => ({ ...x, y: x.boynuz ? 'evet' : 'hayir' }));
        const eg = u.slice(0, 15);
        if (new Set(eg.map(e => e.y)).size < 2) continue;
        acc.push(Y.dogruluk(eg, u.slice(15), 3));
        sayi++;
        if (Y.ozellikOnemi(eg, Y.UZAYLI_OZELLIK)[0].ad === 'boynuz') boynuzEnUstte++;
    }
    assert.ok(ort(acc) > 0.85, 'ortalama ' + ort(acc).toFixed(2));
    assert.ok(boynuzEnUstte / sayi > 0.9);
});
test('Aşırı öğrenme: k=1 eğitim verisini ezberliyor ama test başarısı daha iyi bir k değerinin altında kalıyor', () => {
    let kotu = 0;
    for (let t = 1; t <= 100; t++) {
        const v = Y.noktaVeri(t);
        assert.strictEqual(Y.dogruluk(v.egitim, v.egitim, 1), 1);
        const t1 = Y.dogruluk(v.egitim, v.test, 1);
        const enIyi = Math.max(...[3, 5, 7, 9].map(k => Y.dogruluk(v.egitim, v.test, k)));
        if (enIyi <= t1) kotu++;
    }
    assert.ok(kotu <= 10, `${kotu}/100 veri setinde k>1 daha iyi değildi`);
});
test('Aşırı öğrenme: daha fazla veri test başarısını artırıyor', () => {
    const a = [], b = [];
    for (let t = 1; t <= 100; t++) { const v = Y.noktaVeri(t); a.push(Y.dogruluk(v.egitim, v.test, 5)); b.push(Y.dogruluk([...v.egitim, ...v.ek], v.test, 5)); }
    assert.ok(ort(b) > ort(a) + 0.02, `${ort(a).toFixed(3)} → ${ort(b).toFixed(3)}`);
});
test('Aynı tohum aynı veriyi üretiyor', () => { assert.deepStrictEqual(Y.okyanus(5, 10), Y.okyanus(5, 10)); });
console.log(hata ? `${hata} hata` : 'Yapay zekâ motoru doğrulandı');
process.exit(hata ? 1 : 0);
