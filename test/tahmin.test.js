// Çalıştır: node test/tahmin.test.js  (python3 gerekir)
// Her üreticiden çok sayıda soru üretip cevabı gerçek Python çıktısıyla karşılaştırır.
const { execFileSync } = require('child_process');
const { SEVIYELER, normalize, kontrol } = require('../tahmin-sorular.js');
let hata = 0, toplam = 0;
SEVIYELER.forEach((s, si) => s.uretici.forEach((u, ui) => {
    for (let k = 0; k < 25; k++) {
        const q = u(); toplam++;
        const out = execFileSync('python3', ['-c', q.kod], { encoding: 'utf8' });
        if (normalize(out) !== normalize(q.cevap)) {
            hata++; console.log(`✗ seviye ${si + 1} üretici ${ui + 1}\n${q.kod}\npython: ${JSON.stringify(out)} beklenen: ${JSON.stringify(q.cevap)}`);
            break;
        }
    }
}));
if (!kontrol('"Merhaba Ali"', 'Merhaba Ali').ipucu) { hata++; console.log('✗ tırnak ipucu'); }
if (!kontrol('0 1 2', '0\n1\n2').ipucu) { hata++; console.log('✗ satır ipucu'); }
if (!kontrol('  3 \n\n 4', '3\n4').dogru) { hata++; console.log('✗ boşluk toleransı'); }
console.log(hata ? `${hata} hata` : `${toplam} soru Python ile doğrulandı`);
process.exit(hata ? 1 : 0);
