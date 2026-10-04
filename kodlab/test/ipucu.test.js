// Çalıştır: node kodlab/test/ipucu.test.js — her bölümün ipucu metni var mı, örnek çözümü var mı
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const denetle = (ad, ipuclari, bolumSayisi, cozumVar) => {
    if (ipuclari.length !== bolumSayisi) hatali(`${ad}: ${bolumSayisi} bölüm ama ${ipuclari.length} ipucu`);
    ipuclari.forEach((t, i) => {
        if (!Array.isArray(t) || t.length !== 2 || t.some(x => typeof x !== 'string' || x.trim().length < 15)) hatali(`${ad} ${i + 1}: ipucu eksik`);
        else if (t[0] === t[1]) hatali(`${ad} ${i + 1}: iki ipucu aynı`);
        if (cozumVar && !cozumVar(i)) hatali(`${ad} ${i + 1}: örnek çözüm yok`);
    });
    console.log(`  ✓ ${ad}: ${ipuclari.length} bölüm`);
};
const R = require('../robot-seviyeler.js');
denetle('Robot Kodla', require('../robot-ipucu.js').IPUCLARI, R.length, i => !!R[i].cozum);
const C = require('../cizim-motor.js');
denetle('Çizim Atölyesi', require('../cizim-ipucu.js'), C.BOLUMLER.length, i => !!C.BOLUMLER[i].cozum);
console.log(hata ? `${hata} hata` : 'İpuçları tam');
process.exit(hata ? 1 : 0);
