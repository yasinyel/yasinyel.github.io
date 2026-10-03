// Çalıştır: node kodlab/test/veri.test.js — istatistikler Python'un statistics modülüyle karşılaştırılır
const V = require('../veri-motor.js');
const { execFileSync } = require('child_process');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
// İstatistik ↔ Python
const r = V.uretec(5);
const listeler = Array.from({ length: 200 }, () => Array.from({ length: 1 + Math.floor(r() * 9) }, () => Math.floor(r() * 50)));
const py = JSON.parse(execFileSync('python3', ['-c', `
import json, statistics, sys
L = json.load(sys.stdin)
print(json.dumps([[statistics.mean(l), statistics.median(l), sorted(statistics.multimode(l)) if len(set(l)) < len(l) else None, max(l) - min(l)] for l in L]))
`], { input: JSON.stringify(listeler) }).toString());
listeler.forEach((l, i) => {
    const [o, m, t, a] = py[i];
    if (Math.abs(V.ortalama(l) - o) > 1e-9 || V.ortanca(l) !== m || JSON.stringify(V.tepe(l)) !== JSON.stringify(t) || V.aciklik(l) !== a) hatali('istatistik ' + JSON.stringify(l));
});
const kor = JSON.parse(execFileSync('python3', ['-c', `
import json, statistics, sys
print(json.dumps([statistics.correlation([p[0] for p in v], [p[1] for p in v]) for v in json.load(sys.stdin)]))
`], { input: JSON.stringify(V.ILISKILER.map(x => x.veri)) }).toString());
V.ILISKILER.forEach((x, i) => {
    const rr = V.korelasyon(x.veri.map(p => p[0]), x.veri.map(p => p[1]));
    if (Math.abs(rr - kor[i]) > 1e-9) hatali('korelasyon ' + x.id);
    if (V.iliskiYonu(x.veri) !== x.yon) hatali(`${x.id}: ilişki yönü ${V.iliskiYonu(x.veri)} (r=${rr.toFixed(2)}), beklenen ${x.yon}`);
});
// Tablo: en büyük/küçük değerler tek olmalı (soru belirsiz olmasın)
for (const alan of ['ekran', 'kodlama', 'uyku']) {
    const d = V.OGRENCILER.map(o => o[alan]);
    if (d.filter(x => x === Math.max(...d)).length > 1 && alan !== 'uyku') hatali(alan + ' en büyük tek değil');
    if (alan === 'uyku' && d.filter(x => x === Math.min(...d)).length > 1) hatali('uyku en küçük tek değil');
}
for (const e of [3, 4]) { const l = V.OGRENCILER.filter(o => o.ekran > e).map(o => o.uyku); if (l.filter(x => x === Math.min(...l)).length > 1) hatali('ekran>' + e + ' en az uyku tek değil'); }
// Üreticiler: her tohumda geçerli soru
for (const [ad, liste] of [['tablo', V.TABLO_SORULARI], ['ortalama', V.ORTALAMA_SORULARI]]) {
    liste.forEach((f, i) => {
        for (let t = 1; t <= 60; t++) {
            const s = f(V.uretec(t * 97 + i));
            if (!s.soru || s.cevap === undefined || !s.aciklama) { hatali(`${ad}[${i}] eksik alan`); break; }
            if (s.tur === 'secim' && !s.secenekler.includes(s.cevap)) { hatali(`${ad}[${i}] cevap seçeneklerde yok`); break; }
            if (s.tur === 'sayi' && !V.sayiDogru(String(s.cevap).replace('.', ','), s.cevap)) { hatali(`${ad}[${i}] sayı kontrolü`); break; }
        }
    });
}
if (!V.sayiDogru('7,5', 7.5) || V.sayiDogru('7', 7.5) || V.sayiDogru('abc', 0)) hatali('sayiDogru');
for (const g of V.GRAFIK_SORULARI) if (!V.GRAFIK_TURLERI.some(t => t[0] === g.cevap)) hatali('grafik cevabı ' + g.cevap);
for (const y of V.YANILTICI) if (y.cevap < 0 || y.cevap >= y.secenekler.length) hatali('yanıltıcı ' + y.id);
const oz = V.anketOzet([{ ad: 'A', sayi: 5 }, { ad: 'B', sayi: 3 }, { ad: 'C', sayi: 2 }]);
if (oz.toplam !== 10 || oz.enCok[0] !== 'A' || oz.yuzdeler[0] !== 50 || !oz.tamam) hatali('anket özeti');
if (!V.csv('Soru; 1', [{ ad: 'X', sayi: 1 }]).includes('"Soru; 1";Kişi sayısı')) hatali('csv');
console.log(hata ? `${hata} hata` : 'Veri motoru Python ile doğrulandı');
process.exit(hata ? 1 : 0);
