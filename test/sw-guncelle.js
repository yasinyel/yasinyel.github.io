// Çalıştır: node test/sw-guncelle.js — sw.js dosya listesini yeniden üretir ve SURUM'u bir artırır.
const fs = require('fs'), path = require('path');
const kok = path.join(__dirname, '..');
const dosya = path.join(kok, 'sw.js');
let sw = fs.readFileSync(dosya, 'utf8');
const liste = ['./'].concat(fs.readdirSync(kok).filter(f => /\.(html|js|css|webmanifest)$/.test(f) && f !== 'sw.js').sort(),
    fs.readdirSync(path.join(kok, 'ikon')).sort().map(f => 'ikon/' + f));
sw = sw.replace(/const DOSYALAR = \[[\s\S]*?\];/, 'const DOSYALAR = [\n' + liste.map(f => `        '${f}',`).join('\n') + '\n];');
sw = sw.replace(/const SURUM = 'kodlab-v(\d+)';/, (_, n) => `const SURUM = 'kodlab-v${+n + 1}';`);
fs.writeFileSync(dosya, sw);
console.log(`sw.js: ${liste.length} dosya, ${sw.match(/kodlab-v\d+/)[0]}`);
