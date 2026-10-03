// Çalıştır: node kodlab/test/algoritma.test.js
const { ALGORITMALAR } = require('../algoritma-motor.js');
let hata = 0;
for (const a of ALGORITMALAR) {
    try {
        for (let t = 0; t < 300; t++) {
            const { adimlar, son } = a.uret();
            if (!adimlar.length) throw new Error('adım yok');
            for (const s of adimlar) {
                if (s.tur === 'kart') {
                    const [lo, hi] = s.tiklanabilir;
                    if (!(s.beklenen >= lo && s.beklenen <= hi)) throw new Error('beklenen kart tıklanabilir aralıkta değil');
                } else if (!s.secenekler.some(x => x.id === s.beklenen)) throw new Error('beklenen seçeneklerde yok');
                if (!s.soru || s.durum.satir < 1 || s.durum.satir > a.kod.length) throw new Error('soru/satır hatalı');
            }
            if (['kabarcik', 'secmeli', 'eklemeli'].includes(a.id)) {
                const ilk = adimlar[0].durum.dizi.filter(x => x !== null).concat(adimlar[0].durum.anahtar ?? []);
                const beklenen = [...ilk].sort((x, y) => x - y);
                if (JSON.stringify(son.dizi) !== JSON.stringify(beklenen)) throw new Error('sıralanmadı: ' + son.dizi);
            }
            if (a.id === 'ikili' && adimlar.length > 8) throw new Error('ikili arama çok uzun: ' + adimlar.length);
        }
        console.log('  ✓ ' + a.ad);
    } catch (e) { hata++; console.log('  ✗ ' + a.ad + ': ' + e.message); }
}
console.log(hata ? `${hata} hata` : 'Tüm algoritmalar doğru');
process.exit(hata ? 1 : 0);
