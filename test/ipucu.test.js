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
const O = require('../oyun-motor.js'), OI = require('../oyun-ipucu.js'), og = O.GOREVLER.filter(g => !g.serbest);
denetle('Oyun Atölyesi', og.map(g => OI[g.id] || []), og.length, i => !!O.COZUMLER[og[i].id]);
const D = require('../devre-motor.js'), DI = require('../devre-ipucu.js'), dg = D.GOREVLER.filter(g => !g.serbest);
denetle('KodKart', dg.map(g => DI[g.id] || []), dg.length, i => !!D.COZUMLER[dg[i].id]);
// Sayfa betiğinin içindeki IPUCLARI dizisini (ve seviye listesini) kaynaktan okuyarak denetle
const fs = require('fs'), path = require('path');
const kaynaktan = (dosya, ad) => {
    const k = fs.readFileSync(path.join(__dirname, '..', dosya), 'utf8');
    const m = k.match(new RegExp(`const ${ad} = (\\[[\\s\\S]*?\\n    \\]);`));
    return m ? eval(m[1]) : [];
};
const yapilan = (cozumVar) => () => cozumVar;
denetle('Mantık Kapıları', kaynaktan('mantik.js', 'IPUCLARI'), require('../mantik-motor.js').BOLUMLER.length, yapilan(true));
denetle('Örüntü Bul', kaynaktan('oruntu.js', 'IPUCLARI'), kaynaktan('oruntu.js', 'SEVIYELER').length, yapilan(true));
denetle('İkilik Kartlar', kaynaktan('ikilik.js', 'IPUCLARI'), kaynaktan('ikilik.js', 'SEVIYELER').length, yapilan(true));
const agK = fs.readFileSync(path.join(__dirname, '..', 'ag.js'), 'utf8');
denetle('Paket Yolculuğu', ['paket', 'yonlendir', 'dns', 'ip'].map(id => { const m = agK.match(new RegExp(`\\n        ${id}: (\\[.*\\]),?\\n`)); return m ? eval(m[1]) : []; }), 4, yapilan(true));
console.log(hata ? `${hata} hata` : 'İpuçları tam');
process.exit(hata ? 1 : 0);
