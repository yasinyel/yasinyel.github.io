// Çalıştır: node kodlab/test/dijital.test.js — Dijital Dedektif içeriklerinin tutarlılığı
const D = require('../dijital-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const esles = (ad, idler, ipuclari) => {
    const anah = Object.keys(ipuclari || {});
    idler.filter(i => !anah.includes(i)).forEach(i => hatali(`${ad}: "${i}" ipucunun açıklaması yok`));
    anah.filter(i => !idler.includes(i)).forEach(i => hatali(`${ad}: "${i}" açıklaması metinde işaretli değil`));
};
const tekil = (ad, l) => { const s = new Set(); l.forEach(x => { if (s.has(x.id)) hatali(`${ad}: tekrarlanan id ${x.id}`); s.add(x.id); }); };
tekil('haber', D.HABERLER); tekil('reklam', D.REKLAMLAR); tekil('profil', D.PROFILLER); tekil('zorbalik', D.ZORBALIK);
for (const h of D.HABERLER) {
    const idler = D.ipucuIdleri(D.haberMetinleri(h));
    if (h.tur === 'sahte') { if (!idler.length) hatali(h.id + ': sahte haberde ipucu yok'); esles(h.id, idler, h.ipuclari); }
    else if (h.tur === 'guvenilir') { if (idler.length || !h.iyi || h.iyi.length < 2) hatali(h.id + ': güvenilir haber ipucu içermemeli ve iyi işaretleri olmalı'); }
    else hatali(h.id + ': tür');
    if (!h.arac || !h.arac.kaynak || !h.arac.gorsel) hatali(h.id + ': araç bilgisi eksik');
}
const sahteSay = D.HABERLER.filter(h => h.tur === 'sahte').length;
if (sahteSay < 4 || D.HABERLER.length - sahteSay < 3) hatali('haber dengesi');
for (const r of D.REKLAMLAR) {
    const idler = D.ipucuIdleri(D.reklamMetinleri(r));
    if (r.tur === 'reklam') { if (!idler.length) hatali(r.id + ': reklamda ipucu yok'); esles(r.id, idler, r.ipuclari); }
    else if (idler.length || !r.aciklama) hatali(r.id + ': normal paylaşım ipucu içermemeli, açıklaması olmalı');
}
for (const p of D.PROFILLER) {
    const idler = D.ipucuIdleri(D.profilMetinleri(p));
    if (idler.length < 4) hatali(p.id + ': az ipucu');
    esles(p.id, idler, p.ipuclari);
    if (!p.gonderiler.some(g => !/\[\[/.test(g))) hatali(p.id + ': güvenli gönderi yok');
}
for (const z of D.ZORBALIK) {
    if (z.secenekler.filter(s => s[1] === 2).length !== 1) hatali(z.id + ': tam bir en iyi seçenek olmalı');
    if (z.secenekler.some(s => !s[2])) hatali(z.id + ': geri bildirim eksik');
}
// parcala: metin kaybolmamalı
for (const m of [...D.HABERLER.flatMap(D.haberMetinleri), ...D.PROFILLER.flatMap(D.profilMetinleri), ...D.REKLAMLAR.flatMap(D.reklamMetinleri)].filter(Boolean)) {
    const duz = m.replace(/\[\[\w+\|([^\]]+)\]\]/g, '$1');
    if (D.parcala(m).map(p => p.metin).join('') !== duz) hatali('parçalama metni bozdu: ' + m.slice(0, 40));
}
// Lisans kuralları
const k = (l, t, d) => D.kullanilabilir(l, { ticari: t, degistir: d });
const bek = [['CC0', 1, 1, true], ['CC BY', 1, 1, true], ['CC BY-SA', 1, 1, true], ['CC BY-NC', 1, 0, false], ['CC BY-NC', 0, 1, true], ['CC BY-ND', 0, 1, false], ['CC BY-ND', 1, 0, true], ['CC BY-NC-ND', 0, 0, true], ['CC BY-NC-ND', 0, 1, false], ['CC BY-NC-SA', 0, 1, true], ['©', 0, 0, false]];
bek.forEach(([l, t, d, b]) => { if (k(l, !!t, !!d) !== b) hatali(`lisans ${l} ticari=${t} değiştir=${d}`); });
for (const x of D.KAYNAKLAR) if (!D.LISANSLAR[x.lisans]) hatali(x.id + ': bilinmeyen lisans');
for (const s of D.SENARYOLAR) {
    const evet = D.KAYNAKLAR.filter(x => D.kullanilabilir(x.lisans, s)).length;
    if (evet < 2 || D.KAYNAKLAR.length - evet < 2) hatali(s.id + ': senaryo dengesiz');
}
console.log(hata ? `${hata} hata` : 'Dijital Dedektif içerikleri doğrulandı');
process.exit(hata ? 1 : 0);
