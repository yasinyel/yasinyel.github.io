// Bütün KodLab testlerini çalıştırır: node kodlab/test/hepsi.js
// Gerekenler: Node.js, python3 (Python karşılaştırmaları), opencv-python-headless (QR), Playwright + Chromium (Web Atölyesi)
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const testler = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
let basarisiz = 0;
for (const t of testler) {
    const r = spawnSync(process.execPath, [path.join(__dirname, t)], { encoding: 'utf8' });
    const son = (r.stdout || '').trim().split('\n').pop();
    console.log(`${r.status === 0 ? '✓' : '✗'} ${t.padEnd(22)} ${son}`);
    if (r.status !== 0) { basarisiz++; console.log((r.stdout || '') + (r.stderr || '')); }
}
console.log(basarisiz ? `\n${basarisiz} test dosyası başarısız` : `\n${testler.length} test dosyasının hepsi geçti`);
process.exit(basarisiz ? 1 : 0);
