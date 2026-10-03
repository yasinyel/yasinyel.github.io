// Çalıştır: node kodlab/test/web.test.js  (Playwright + Chromium gerekir)
// Her bölümde: örnek çözüm bütün görevleri geçmeli, başlangıç kodu geçmemeli. Denetimler gerçek tarayıcıda çalışır.
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const kok = path.join(__dirname, '..');
const sunucu = http.createServer((q, s) => {
    const f = path.join(kok, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); s.end(); } else { s.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.js') ? 'text/javascript' : f.endsWith('.svg') ? 'image/svg+xml' : 'text/plain' }); s.end(d); } });
}).listen(0);
(async () => {
    const b = await chromium.launch();
    const p = await b.newPage();
    await p.goto(`http://localhost:${sunucu.address().port}/web.html?ogretmen`);
    let hata = 0;
    const n = await p.evaluate(() => Web.BOLUMLER.length);
    for (let i = 0; i < n; i++) {
        const sonuc = await p.evaluate(async (i) => {
            const b = Web.BOLUMLER[i];
            const dene = (html, css) => new Promise(ok => {
                const f = document.createElement('iframe');
                f.setAttribute('sandbox', 'allow-same-origin'); f.style.cssText = 'width:800px;height:600px';
                f.onload = () => { const r = b.gorevler.map(g => { try { return !!g.kontrol(f.contentDocument, f.contentWindow); } catch (e) { return false; } }); f.remove(); ok(r); };
                f.srcdoc = Web.belge(html, css); document.body.appendChild(f);
            });
            const cozum = await dene(b.cozum.html, b.cozum.css);
            const bas = await dene(b.html, b.css);
            // Çözümün yarısı (CSS'siz ya da HTML'in ilk satırları) her görevi geçmemeli
            const yarim = await dene(b.cozum.html.split('\n').slice(0, 1).join('\n'), '');
            return { cozum, bas, yarim };
        }, i);
        const ad = await p.evaluate(i => Web.BOLUMLER[i].ad, i);
        const sorun = [];
        if (!sonuc.cozum.every(Boolean)) sorun.push('çözüm geçmiyor: ' + JSON.stringify(sonuc.cozum));
        if (sonuc.bas.every(Boolean)) sorun.push('başlangıç kodu zaten geçiyor');
        if (sonuc.yarim.every(Boolean) && i > 0) sorun.push('yarım çözüm geçiyor');
        if (sorun.length) { hata++; console.log(`  ✗ ${i + 1}. ${ad}: ${sorun.join('; ')}`); } else console.log(`  ✓ ${i + 1}. ${ad}`);
    }
    await b.close(); sunucu.close();
    console.log(hata ? `${hata} hata` : 'Web Atölyesi denetimleri doğrulandı');
    process.exit(hata ? 1 : 0);
})();
