// Çalıştır: node test/sensin.test.js  (python3 gerekir)
// Her bölümü rastgele parametrelerle defalarca üretir; motorun beklediği hamleleri
// aynı programın gerçek Python'da çalışan haliyle karşılaştırır.
const { execFileSync } = require('child_process');
const S = require('../sensin-motor.js');
const SHIM = 'H=[]\ndef sag(): H.append("R")\ndef sol(): H.append("L")\ndef yukari(): H.append("U")\ndef asagi(): H.append("D")\n';
let hata = 0, toplam = 0;
for (const kd of S.KADEMELER) {
    kd.bolumler.forEach((b, i) => {
        const kodlar = [], beklenen = [];
        try {
            for (let t = 0; t < 30; t++) {
                const { program, hamleler } = S.bolumUret(kd, i);
                const y = S.yol(hamleler);
                const w = y.maxX - y.minX + 1, h = y.maxY - y.minY + 1;
                if (hamleler.length < 3 || hamleler.length > 30) throw new Error(`hamle sayısı ${hamleler.length}`);
                if (w > 13 || h > 10) throw new Error(`alan çok büyük ${w}x${h}`);
                if (kd.gosterim === 'ok') S.okYaz(program);
                if (kd.gosterim === 'blok') S.blokYaz(program);
                if (kd.gosterim === 'turkce') S.metinYaz(program, 'turkce');
                kodlar.push(S.pythonMetni(program));
                beklenen.push(hamleler.map(x => x.d).join(''));
            }
            // Hepsini tek Python sürecinde çalıştır
            const py = SHIM + kodlar.map(k => 'H.clear()\n' + k + '\nprint("".join(H))').join('\n');
            const cikti = execFileSync('python3', ['-c', py], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n');
            cikti.forEach((c, j) => { if (c !== beklenen[j]) throw new Error(`Python "${c}" ≠ motor "${beklenen[j]}"\n${kodlar[j]}`); });
            toplam += kodlar.length;
            console.log(`  ✓ ${kd.ad} ${i + 1}. ${b.ad}  (ör. ${beklenen[0].length} hamle)`);
        } catch (e) { hata++; console.log(`  ✗ ${kd.ad} ${i + 1}. ${b.ad}: ${e.message.slice(0, 400)}`); }
    });
}
console.log(hata ? `\n${hata} bölüm hatalı` : `\n${toplam} program Python ile doğrulandı`);
process.exit(hata ? 1 : 0);
