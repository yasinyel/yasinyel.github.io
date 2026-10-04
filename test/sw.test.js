// Çalıştır: node test/sw.test.js
// Çevrimdışı önbellek listesi kodlab klasöründeki bütün dosyaları içermeli.
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..');
const sw = fs.readFileSync(path.join(kok, 'sw.js'), 'utf8');
const liste = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map(m => m[1]).filter(x => x !== './');
const gercek = fs.readdirSync(kok).filter(f => /\.(html|js|css|webmanifest)$/.test(f) && f !== 'sw.js')
    .concat(fs.readdirSync(path.join(kok, 'ikon')).map(f => 'ikon/' + f));
const eksik = gercek.filter(f => !liste.includes(f)), fazla = liste.filter(f => !gercek.includes(f));
if (eksik.length || fazla.length) { console.log('✗ sw.js listesi güncel değil. Eksik:', eksik, 'Fazla:', fazla); process.exit(1); }
console.log(`✓ sw.js ${liste.length} dosyayı önbelleğe alıyor`);
