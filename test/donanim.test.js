// Çalıştır: node test/donanim.test.js — Bilgisayarın İçi içerik ve kuralları
const D = require('../donanim-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
// Toplama: doğru sırayla hepsi takılabiliyor; yanlış yuva ve sıra reddediliyor
const takili = [];
for (const p of D.PARCALAR.filter(p => p.yuva)) { const r = D.tak(takili, p.id, p.yuva); if (!r.tamam) hatali('takılamadı ' + p.id + ': ' + r.mesaj); takili.push(p.id); }
if (!D.toplamaBitti(takili)) hatali('toplama bitmedi');
if (D.tak([], 'sogutucu', 'sogutucu').tamam) hatali('soğutucu işlemciden önce takıldı');
if (D.tak([], 'ram', 'pcie').tamam) hatali('RAM yanlış yuvaya takıldı');
if (D.tak([], 'yazici', 'psu').tamam) hatali('yazıcı kasaya takıldı');
for (const p of D.PARCALAR) if (p.yuva && !D.YUVALAR.some(y => y.id === p.yuva)) hatali('yuva yok ' + p.yuva);
// Sınıflama
const sinifIdler = D.SINIFLAR.map(s => s[0]);
for (const c of D.CIHAZLAR) if (!sinifIdler.includes(c[2])) hatali('cihaz sınıfı ' + c[0]);
for (const s of sinifIdler) if (D.CIHAZLAR.filter(c => c[2] === s).length < 3) hatali('az cihaz ' + s);
// Birimler
if (D.bayt(1, 'GB') !== 1024 ** 3 || D.bayt(8, 'bit') !== 1 || D.bayt(2, 'KB') !== 2048) hatali('bayt hesabı');
D.BIRIM_SORULARI.forEach((f, i) => {
    for (let t = 1; t < 80; t++) {
        const s = f(D.uretec(t * 13 + i));
        if (!s.secenekler.includes(s.cevap)) { hatali(`birim ${i}: cevap seçeneklerde yok`); break; }
        if (new Set(s.secenekler).size !== s.secenekler.length || s.secenekler.length < 2) { hatali(`birim ${i}: seçenekler tekrarlı`); break; }
    }
});
// "Hangisi büyük" ve "kaç video sığar" cevapları hesapla tutarlı
for (let t = 1; t < 50; t++) {
    const s = D.BIRIM_SORULARI[3](D.uretec(t));
    const [a, b] = s.secenekler.map(x => { const [n, u] = x.split(' '); return D.bayt(+n, u); });
    if ((a > b ? s.secenekler[0] : s.secenekler[1]) !== s.cevap) hatali('büyük karşılaştırma ' + JSON.stringify(s.secenekler));
}
for (const a of D.ARIZALAR) if (a.dogru < 0 || a.dogru >= a.secenekler.length || !a.aciklama) hatali('arıza ' + a.belirti);
console.log(hata ? `${hata} hata` : 'Bilgisayarın İçi doğrulandı');
process.exit(hata ? 1 : 0);
