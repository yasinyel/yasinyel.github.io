// Çalıştır: node test/hata.test.js (python3 gerekir)
// Üretilen her hatalı programın gerçekten farklı yol izlediğini, doğru seçeneğin yolu
// düzelttiğini ve hatalı programın Python'da da motorla aynı davrandığını doğrular.
const { execFileSync } = require('child_process');
global.Sensin = require('../sensin-motor.js');
const S = global.Sensin;
const H = require('../hata-motor.js');
const SHIM = 'H=[]\ndef sag(): H.append("R")\ndef sol(): H.append("L")\ndef yukari(): H.append("U")\ndef asagi(): H.append("D")\n';
let hata = 0;
for (const id of ['ilkokul', 'ortaokul', 'lise']) {
    const kd = S.KADEMELER.find(k => k.id === id);
    const kodlar = [], beklenen = [];
    try {
        for (let t = 0; t < 120; t++) {
            const q = H.hataUret(kd);
            const yol = (h) => h.map(x => x.d).join('');
            if (yol(q.hataliHamle) === yol(q.dogruHamle)) throw new Error('hata yolu değiştirmiyor');
            const dogruSec = q.secenekler.find(s => s.dogru);
            const duzeltilmis = H.degistir(q.program, q.hedefId, dogruSec.ifade);
            if (yol(S.calistir(duzeltilmis)) !== yol(q.dogruHamle)) throw new Error('doğru seçenek düzeltmiyor');
            if (q.secenekler.length < 2) throw new Error('seçenek az');
            if (id === 'ilkokul') S.blokYaz(q.program); else S.metinYaz(q.program, id === 'lise' ? 'python' : 'turkce');
            kodlar.push(S.pythonMetni(q.program)); beklenen.push(yol(q.hataliHamle));
        }
        const py = SHIM + kodlar.map(k => 'H.clear()\n' + k + '\nprint("".join(H))').join('\n');
        const cikti = execFileSync('python3', ['-c', py], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n');
        cikti.forEach((c, j) => { if (c !== beklenen[j]) throw new Error(`Python "${c}" ≠ motor "${beklenen[j]}"\n${kodlar[j]}`); });
        console.log(`  ✓ ${kd.ad}: 120 hatalı program`);
    } catch (e) { hata++; console.log(`  ✗ ${kd.ad}: ${e.message.slice(0, 500)}`); }
}
console.log(hata ? `${hata} hata` : 'Hata Avcısı doğrulandı');
process.exit(hata ? 1 : 0);
