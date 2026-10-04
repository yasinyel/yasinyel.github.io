// Çalıştır: node kodlab/test/bulmaca.test.js — Bilişim Bulmacaları üreticileri ve çözücüleri
const B = require('../bulmaca-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const sure = {};
const zaman = (ad, f) => { const t = Date.now(); const s = f(); sure[ad] = Math.max(sure[ad] || 0, Date.now() - t); return s; };

// Satır çözücü: bilinen örnekler
const sc = (ip, h) => JSON.stringify(B.satirCoz(ip, h));
if (sc([3], [-1, -1, -1, -1]) !== '[-1,1,1,-1]') hatali('satır çözücü 3/4');
if (sc([2, 1], [-1, -1, -1, -1]) !== '[1,1,0,1]') hatali('satır çözücü 2,1/4');
if (sc([0], [-1, -1]) !== '[0,0]') hatali('satır çözücü boş');
if (B.satirCoz([2], [1, 0, 1]) !== null) hatali('çelişki bulunamadı');
if (JSON.stringify(B.ipuclari([1, 1, 0, 1, 0, 0, 1, 1, 1])) !== '[2,1,3]') hatali('ipuçları');

// Işık: Gauss çözümü gerçekten söndürüyor mu
for (let n = 3; n <= 5; n++) for (let t = 1; t <= 30; t++) {
    const b = zaman('isik', () => B.uret('isik', n - 3, t));
    const d = [...b.baslangic], c = B.isikCoz(b.baslangic, n);
    c.forEach((v, i) => { if (v) B.isikBas(d, n, i); });
    if (!B.isikTamam(d)) hatali(`ışık ${n} #${t} çözüm söndürmüyor`);
    if (b.enAz < 1 || B.isikTamam(b.baslangic)) hatali('ışık başlangıçta çözülmüş');
    // En az basış: kaba kuvvetle (3x3 ve 4x4)
    if (n <= 4 && t <= 8) {
        let en = 99;
        for (let m = 0; m < 1 << (n * n); m++) { const x = [...b.baslangic]; let k = 0; for (let i = 0; i < n * n; i++) if ((m >> i) & 1) { B.isikBas(x, n, i); k++; } if (k < en && B.isikTamam(x)) en = k; }
        if (en !== b.enAz) hatali(`ışık ${n} #${t} en az ${b.enAz}, kaba kuvvet ${en}`);
    }
}

for (let z = 0; z < 3; z++) for (let t = 1; t <= 25; t++) {
    // Piksel: mantıkla tek çözüm
    const p = zaman('piksel', () => B.uret('piksel', z, t));
    const c = B.nonogramCoz(p.satirIp, p.sutunIp);
    if (!c || !B.pikselTamam(p, c)) hatali(`piksel ${z} #${t} mantıkla çözülmüyor`);
    if (!p.cozum.flat().some(Boolean)) hatali('piksel boş');
    if (JSON.stringify(B.uret('piksel', z, t)) !== JSON.stringify(p)) hatali('piksel tekrarlanabilir değil');
    // İkili: çözüm geçerli, bulmaca mantıkla çözülüyor, çözüm bulmacayla uyumlu
    const k = zaman('ikili', () => B.uret('ikili', z, t)), n = k.boyut;
    const sat = k.cozum.map(s => s.join('')), sut = k.cozum[0].map((_, i) => k.cozum.map(s => s[i]).join(''));
    if (new Set(sat).size !== n || new Set(sut).size !== n) hatali(`ikili ${n} #${t} tekrarlanan satır/sütun`);
    if (B.ikiliHatalar(k.cozum).size) hatali(`ikili ${n} #${t} çözüm kuralları çiğniyor`);
    if (!sat.every(s => B.gecerliSatirlar(n).some(g => g.join('') === s))) hatali('ikili geçersiz satır');
    const kc = B.ikiliCoz(k.bulmaca);
    if (!kc || !B.ikiliTamam(k, kc)) hatali(`ikili ${n} #${t} mantıkla çözülmüyor`);
    if (k.bulmaca.some((s, y) => s.some((v, x) => v !== -1 && v !== k.cozum[y][x]))) hatali('ikili ipucu çözümle uyumsuz');
    const bos = k.bulmaca.flat().filter(v => v === -1).length;
    if (bos < n * n * 0.35) hatali(`ikili ${n} #${t} çok az boşluk (${bos})`);
    // Ağ: özgün dönüşler çözüm, karışık hali değil, ağaç
    const a = zaman('ag', () => B.uret('ag', z, t));
    const sifir = a.kare.map(s => s.map(() => 0));
    if (!B.agTamam(a, sifir)) hatali(`ağ ${a.boyut} #${t} özgün hali çözüm değil`);
    if (B.agTamam(a, a.donus)) hatali(`ağ ${a.boyut} #${t} karışık hali çözülmüş`);
    const kenar = a.kare.flat().reduce((s, m) => s + [1, 2, 4, 8].filter(b => m & b).length, 0) / 2;
    if (kenar !== a.boyut * a.boyut - 1) hatali(`ağ ${a.boyut} #${t} ağaç değil`);
    if (a.kare.flat().some(m => m === 0)) hatali('ağda bağlantısız kare');
}
for (const [n, l] of Object.entries(B.RESIMLER)) l.forEach((r, i) => { const p = B.piksel(+n, i + 1); if (p.ad !== r[0]) hatali(`${n}x${n} resim mantıkla çözülmüyor: ${r[0]}`); });
if (B.dondur(1) !== 2 || B.dondur(8) !== 1 || B.dondur(5, 1) !== 10 || B.dondur(3, 4) !== 3) hatali('döndür');
if (B.yildiz(0) !== 3 || B.yildiz(1) !== 2 || B.yildiz(5) !== 1 || B.yildiz(0, 2) !== 2) hatali('yıldız');
if (B.gununTohumu('2026-10-04') === B.gununTohumu('2026-10-05')) hatali('günün tohumu');
for (const [k, v] of Object.entries(sure)) if (v > 1500) hatali(`${k} üretimi yavaş: ${v} ms`);
console.log(hata ? `${hata} hata` : `Bilişim Bulmacaları doğrulandı (${B.TURLER.length} tür; en uzun üretim ${JSON.stringify(sure)} ms)`);
process.exit(hata ? 1 : 0);
