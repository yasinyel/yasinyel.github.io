// Çalıştır: node kodlab/test/algoritma.test.js
const { ALGORITMALAR } = require('../algoritma-motor.js');
let hata = 0;
for (const a of ALGORITMALAR) {
    try {
        for (let t = 0; t < 300; t++) {
            const { adimlar, son } = a.uret();
            if (!adimlar.length) throw new Error('adım yok');
            for (const s of adimlar) {
                if (s.tur === 'kart') {
                    const [lo, hi] = s.tiklanabilir;
                    if (!(s.beklenen >= lo && s.beklenen <= hi)) throw new Error('beklenen kart tıklanabilir aralıkta değil');
                } else if (!s.secenekler.some(x => x.id === s.beklenen)) throw new Error('beklenen seçeneklerde yok');
                if (!s.soru || s.durum.satir < 1 || s.durum.satir > a.kod.length) throw new Error('soru/satır hatalı');
            }
            if (['kabarcik', 'secmeli', 'eklemeli'].includes(a.id)) {
                const ilk = adimlar[0].durum.dizi.filter(x => x !== null).concat(adimlar[0].durum.anahtar ?? []);
                const beklenen = [...ilk].sort((x, y) => x - y);
                if (JSON.stringify(son.dizi) !== JSON.stringify(beklenen)) throw new Error('sıralanmadı: ' + son.dizi);
            }
            if (a.id === 'ikili' && adimlar.length > 8) throw new Error('ikili arama çok uzun: ' + adimlar.length);
            const ilk = adimlar[0].durum;
            if (a.id === 'ters' && JSON.stringify(son.dizi) !== JSON.stringify([...ilk.dizi].reverse())) throw new Error('ters çevrilmedi');
            if (a.id === 'birlestir' && JSON.stringify(son.dizi) !== JSON.stringify([...ilk.dizi].sort((x, y) => x - y))) throw new Error('birleştirme sıralı değil');
            if (a.id === 'pivot') { const p = son.dizi.indexOf(ilk.dizi[ilk.dizi.length - 1]); if (!son.dizi.every((x, i) => i < p ? x < son.dizi[p] : i > p ? x > son.dizi[p] : true)) throw new Error('bölme yanlış: ' + son.dizi); }
            if (a.id === 'tekrar' && son.sirali.length !== 2) throw new Error('tekrar bulunamadı');
            if (a.id === 'ciftsay' && son.degisken.sayac !== ilk.dizi.filter(x => x % 2 === 0).length) throw new Error('çift sayısı yanlış');
            if (a.id === 'toplam' && son.degisken.toplam !== ilk.dizi.reduce((x, y) => x + y, 0)) throw new Error('toplam yanlış');
            if (a.id === 'enkucuk' && son.degisken.enk !== Math.min(...ilk.dizi)) throw new Error('en küçük yanlış');
            if (a.id === 'ikitoplam') { const h = ilk.degisken.hedef, var_ = ilk.dizi.some((x, i) => ilk.dizi.some((y, j) => i < j && x + y === h)); if (var_ !== (son.sirali.length === 2)) throw new Error('iki toplam yanlış'); }
            if (a.id === 'palindrom') { const pal = JSON.stringify(ilk.dizi) === JSON.stringify([...ilk.dizi].reverse()); if (pal !== (son.satir === 7)) throw new Error('palindrom kararı yanlış'); }
            for (const st of adimlar) if (st.secenekler && st.secenekler.length > 3) throw new Error('3\'ten fazla seçenek');
        }
        console.log('  ✓ ' + a.ad);
    } catch (e) { hata++; console.log('  ✗ ' + a.ad + ': ' + e.message); }
}
console.log(hata ? `${hata} hata` : 'Tüm algoritmalar doğru');
process.exit(hata ? 1 : 0);
