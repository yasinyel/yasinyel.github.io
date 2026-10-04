// Çalıştır: node test/sifre.test.js
const assert = require('assert');
const S = require('../sifre-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
test('Alfabe 29 harf, tekrar yok', () => { assert.strictEqual(S.ALFABE.length, 29); assert.strictEqual(new Set(S.ALFABE).size, 29); assert.strictEqual(S.TR_FREKANS.length, 29); });
test('Sezar örnekleri', () => {
    assert.strictEqual(S.sezar('ABC', 1), 'BCÇ');
    assert.strictEqual(S.sezar('Z', 1), 'A');
    assert.strictEqual(S.sezar('ışık', 3), S.sezar('IŞIK', 3), 'küçük harf Türkçe kurallarla büyütülmeli');
    assert.strictEqual(S.sezar('İ Ğ, Ü!', 2), 'K I, Y!');
});
test('Sezar ve Vigenère tersinir', () => {
    for (const m of [...S.CUMLELER, ...S.UZUN_METINLER]) for (let k = 0; k < 29; k++) assert.strictEqual(S.sezar(S.sezar(m, k), -k), m);
    for (const m of S.CUMLELER) for (const a of ['KOD', 'AĞ', 'ŞİFRE', 'Z']) assert.strictEqual(S.vigenere(S.vigenere(m, a), a, true), m);
    assert.strictEqual(S.vigenere('AAAA', 'BC'), 'BCBC');
});
test('Bütün metinler yalnızca Türk alfabesi + boşluk/noktalama içeriyor', () => {
    for (const m of [...S.CUMLELER, ...S.UZUN_METINLER, ...S.KELIMELER]) for (const h of m) assert.ok(S.ALFABE.includes(h) || /[ .,!?]/.test(h), `"${h}" (${m})`);
});
test('Frekans analizi her uzun metinde her anahtarı doğru buluyor (bölüm çözülebilir)', () => {
    for (const m of S.UZUN_METINLER) for (let k = 1; k < 29; k++) assert.strictEqual(S.frekansCoz(S.sezar(m, k)), k, `k=${k}`);
});
test('Bölüm soruları üretiliyor ve cevaplar tutarlı', () => {
    for (const b of S.BOLUMLER) for (let t = 0; t < 200; t++) {
        const q = b.soru(t % b.tur);
        assert.ok(q && q.soru);
        if (b.id === 'sezar1') assert.strictEqual(S.sezar(q.cevap, -q.k), q.metin);
        if (b.id === 'vig1') assert.strictEqual(S.vigenere(q.cevap, q.anahtar, true), q.metin);
        if (b.id === 'kaba' || b.id === 'frekans') assert.strictEqual(S.sezar(q.sifreli, -q.cevap), q.metin);
    }
});
test('Kırma süresi metni', () => {
    assert.strictEqual(S.kirmaSuresi(5), 'göz açıp kapayıncaya kadar');
    assert.ok(/yıl/.test(S.kirmaSuresi(80)));
    assert.ok(/milyar yıl/.test(S.kirmaSuresi(128)));
});
console.log(hata ? `${hata} hata` : 'Şifre motoru doğrulandı');
process.exit(hata ? 1 : 0);
