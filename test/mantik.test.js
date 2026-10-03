// Çalıştır: node kodlab/test/mantik.test.js
const M = require('../mantik-motor.js');
let hata = 0;
M.BOLUMLER.forEach((b, i) => {
    try {
        const ids = new Set(b.girisler.map(g => g.ad));
        for (const d of b.dugumler) {
            for (const g of d.giris) if (!ids.has(g)) throw new Error(`${d.id} girişi ${g} önce tanımlanmamış`);
            const tip = d.tip === '?' ? (b.cozum || {})[d.id] : d.tip;
            if (!M.KAPILAR[tip]) throw new Error(`${d.id} türü yok`);
            if (M.KAPILAR[tip].giris !== d.giris.length) throw new Error(`${d.id} giriş sayısı uyuşmuyor`);
            if (d.tip === '?' && !d.izin.includes(tip)) throw new Error(`${d.id} çözümü izin listesinde yok`);
            ids.add(d.id);
        }
        const kombs = M.kombinasyonlar(b.girisler.length);
        if (b.tur === 'sec') {
            for (const k of kombs) {
                const { cikis } = M.hesapla(b, k, b.cozum);
                const h = b.hedef(k.map(Number)).map(Boolean);
                if (JSON.stringify(cikis) !== JSON.stringify(h)) throw new Error('çözüm tabloyu tutturmuyor: ' + k);
            }
            // Başlangıçta (hiç seçim yokken) çözülmüş görünmemeli
            if (kombs.every(k => M.hesapla(b, k, {}).cikis.every(x => x !== null))) throw new Error('seçilecek kapı yok');
        } else {
            const yanan = kombs.filter(k => M.hesapla(b, k, {}).cikis[0]).length;
            if (yanan === 0 || yanan === kombs.length) throw new Error('yanan durum sayısı anlamsız: ' + yanan);
        }
        console.log(`  ✓ ${i + 1}. ${b.ad}`);
    } catch (e) { hata++; console.log(`  ✗ ${i + 1}. ${b.ad}: ${e.message}`); }
});
console.log(hata ? `${hata} hata` : 'Tüm devreler doğru');
process.exit(hata ? 1 : 0);
