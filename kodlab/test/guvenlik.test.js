// Çalıştır: node kodlab/test/guvenlik.test.js
const assert = require('assert');
const G = require('../guvenlik-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
const sev = (s) => G.analiz(s).seviye;
test('Bilinen zayıf şifreler zayıf çıkıyor', () => {
    for (const s of ['123456', 'qwerty', 'galatasaray', 'Galatasaray1905', 'ahmet2010', 'şifre123', 'aaaaaaaa', 'abcdef', 'qwerty123', 'Kedi123', 'zeynep2012!', '11111111', 'asdfgh1'])
        assert.ok(sev(s) <= 1, `${s} → ${G.SEVIYELER[sev(s)].ad} (${G.analiz(s).bit.toFixed(1)} bit)`);
});
test('Güçlü şifreler güçlü çıkıyor', () => {
    for (const s of ['bulut-kaktüs-tren-lale7', 'M4v!Kedi_Uçan#Pizza', 'xK9#mPq2$vL8!nR4', 'Gezegen?fener42pusula', 'ÇınarAltındaKitapOkuyorum!2'])
        assert.ok(sev(s) >= 3, `${s} → ${G.SEVIYELER[sev(s)].ad} (${G.analiz(s).bit.toFixed(1)} bit)`);
});
test('Uzunluk artınca güç azalmıyor', () => {
    let once = 0;
    for (const s of ['k', 'kx', 'kxq', 'kxq7', 'kxq7!', 'kxq7!B', 'kxq7!Bz', 'kxq7!Bzm']) { const b = G.analiz(s).bit; assert.ok(b >= once, s); once = b; }
});
test('Parçalar: kelime, yıl, sıra doğru tanınıyor', () => {
    const p = G.analiz('Aslan2010abc').parcalar.map(x => x.tur);
    assert.deepStrictEqual(p, ['kelime', 'yil', 'sira']);
});
test('Hangisi güçlü: üretilen çiftlerde güçlü olan her zaman daha yüksek seviyede', () => {
    for (let i = 0; i < 500; i++) {
        const c = G.ciftUret(), g = c[c.dogru], z = c[c.dogru === 'a' ? 'b' : 'a'];
        assert.ok(sev(g) >= 3 && sev(z) <= 1, `güçlü:${g}(${sev(g)}) zayıf:${z}(${sev(z)})`);
    }
});
test('Oltalama senaryoları tutarlı', () => {
    for (const s of G.OLTALAMA) {
        if (!s.oltalama) { assert.ok(s.aciklama); assert.ok(!/\[\[/.test(s.govde)); continue; }
        const metindekiler = [...s.govde.matchAll(/\[\[(\w+)\|/g)].map(m => m[1]);
        for (const id of metindekiler) assert.ok(s.ipuclari[id], `açıklaması olmayan ipucu: ${id}`);
        for (const id of Object.keys(s.ipuclari)) assert.ok(metindekiler.includes(id) || ['gonderen', 'adres', 'https'].includes(id), `metinde olmayan ipucu: ${id}`);
        assert.ok(G.ipucuSayisi(s) >= 3);
        const m = JSON.stringify(s).match(/(?<![a-zçğıöşü])(garanti|ziraat|akbank|yapı ?kredi|türk telekom|turkcell|vodafone|ptt|aras|yurtiçi|e-devlet|edevlet|trendyol|hepsiburada)(?![a-zçğıöşü])/i);
        assert.ok(!m, 'gerçek kurum adı kullanılmamalı: ' + (m && m[0]));
    }
    assert.ok(G.OLTALAMA.filter(s => !s.oltalama).length >= 2, 'güvenli örnekler de olmalı');
});
test('Durumlar: doğru cevap geçerli', () => { for (const d of G.DURUMLAR) { assert.ok(d.secenekler[d.dogru]); assert.ok(d.aciklama); } });
test('Kırma süresi', () => { assert.strictEqual(G.kirmaSuresi(10), 'bir saniyeden kısa'); assert.ok(/yıl/.test(G.kirmaSuresi(90))); });
console.log(hata ? `${hata} hata` : 'Güvenlik motoru doğrulandı');
process.exit(hata ? 1 : 0);
