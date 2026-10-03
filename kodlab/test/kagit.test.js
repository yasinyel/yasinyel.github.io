// Çalıştır: node kodlab/test/kagit.test.js — çalışma kağıtlarının cevap anahtarları doğru mu?
const K = require('../kagit-motor.js');
const { execFileSync } = require('child_process');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
for (let t = 1; t <= 150; t++) {
    for (const kd of [1, 2, 3]) {
        const r = K.robotYolu(t, kd);
        const son = K.yolUygula(r.izgara, r.bas, r.cevap);
        if (!son || son.join() !== r.hedef.join()) hatali(`robot ${t}/${kd}: cevap hedefe ulaşmıyor`);
        if (r.izgara[r.bas[1]][r.bas[0]] === '#' || r.izgara[r.hedef[1]][r.hedef[0]] === '#') hatali('robot: başlangıç/hedef engelde');
        // BFS en kısa olmalı: daha kısa bir yol yok (kaba kuvvetle değil, tüm komşuluklarla) — uzunluk Manhattan'dan kısa olamaz
        if (r.cevap.length < Math.abs(r.hedef[0] - r.bas[0]) + Math.abs(r.hedef[1] - r.bas[1])) hatali('robot: imkânsız kısa yol');
        const h = K.hataAvi(t, kd);
        const p = [...h.program]; p[h.hataSirasi] = h.dogru;
        const s2 = K.yolUygula(h.izgara, h.bas, p);
        if (!s2 || s2.join() !== h.hedef.join()) hatali(`hata avı ${t}: düzeltilmiş program hedefe ulaşmıyor`);
        const s3 = K.yolUygula(h.izgara, h.bas, h.program);
        if (s3 && s3.join() === h.hedef.join()) hatali(`hata avı ${t}: hatalı program zaten çalışıyor`);
        const pa = K.parite(t, kd);
        if (K.hataBul(pa.izgara).join() !== pa.cevap.join()) hatali(`parite ${t}: hata yeri bulunamıyor`);
        if (K.hataBul(pa.dogru) !== null) hatali(`parite ${t}: doğru ızgarada hata var`);
        const ik = K.ikilik(t, kd);
        [...ik.onlukIkilik, ...ik.ikilikOnluk].forEach(q => { const [a, b] = typeof q.soru === 'number' ? [q.soru, q.cevap] : [q.cevap, q.soru]; if (parseInt(b, 2) !== a || b.length !== ik.bit) hatali('ikilik ' + JSON.stringify(q)); });
        const m = K.mantik(t, kd);
        if (m.tablo.length !== 2 ** m.giris.length) hatali('mantık tablo boyu');
    }
    const pk = K.piksel(t);
    pk.kodlar.forEach((kod, i) => { if (K.satirCoz(kod, pk.gen) !== pk.cevap[i]) hatali(`piksel ${pk.ad} satır ${i}`); });
    const s = K.sifre(t);
    s.sifrele.forEach(q => { if (K.sezar(q.cevap, -s.anahtar) !== q.soru) hatali('sezar'); });
    s.coz.forEach(q => { if (K.sezar(q.soru, -s.anahtar) !== q.cevap) hatali('sezar çöz'); });
    const a = K.ag(t);
    if (a.cevap.yol[0] !== 'A' || a.cevap.yol[a.cevap.yol.length - 1] !== 'F') hatali('ağ yolu');
    const top = a.cevap.yol.slice(1).reduce((t2, v, i) => t2 + a.kenarlar.find(k => (k[0] === a.cevap.yol[i] && k[1] === v) || (k[1] === a.cevap.yol[i] && k[0] === v))[2], 0);
    if (top !== a.cevap.uzunluk) hatali('ağ uzunluğu');
}
// Ağ en kısa yollarını Python ile (Floyd–Warshall) karşılaştır
const aglar = Array.from({ length: 40 }, (_, i) => K.ag(i + 1));
const py = JSON.parse(execFileSync('python3', ['-c', `
import json, sys
out = []
for kenarlar in json.load(sys.stdin):
    d = {}
    ds = 'ABCDEF'
    for a in ds:
        for b in ds: d[(a, b)] = 0 if a == b else 10**9
    for a, b, w in kenarlar: d[(a, b)] = min(d[(a, b)], w); d[(b, a)] = min(d[(b, a)], w)
    for k in ds:
        for i in ds:
            for j in ds: d[(i, j)] = min(d[(i, j)], d[(i, k)] + d[(k, j)])
    out.append(d[('A', 'F')])
print(json.dumps(out))
`], { input: JSON.stringify(aglar.map(a => a.kenarlar)) }).toString());
aglar.forEach((a, i) => { if (a.cevap.uzunluk !== py[i]) hatali(`ağ ${i + 1}: ${a.cevap.uzunluk} ≠ Python ${py[i]}`); });
// Mantık: Python ile doğruluk tablosu
const mt = Array.from({ length: 30 }, (_, i) => K.mantik(i + 1, 2 + (i % 2)));
const pm = JSON.parse(execFileSync('python3', ['-c', `
import json, sys
G = {'VE': lambda a, b: a & b, 'VEYA': lambda a, b: a | b, 'ÖZEL VEYA': lambda a, b: a ^ b}
out = []
for m in json.load(sys.stdin):
    r = []
    for i in range(8):
        a, b, c = (i >> 2) & 1, (i >> 1) & 1, i & 1
        x = G[m['g1']](a, b)
        if m['degil']: x = 1 - x
        r.append(G[m['g2']](x, c))
    out.append(r)
print(json.dumps(out))
`], { input: JSON.stringify(mt) }).toString());
mt.forEach((m, i) => { if (m.tablo.map(x => x.cikis).join() !== pm[i].join()) hatali('mantık tablosu ' + i); });
// Aynı tohum aynı kağıt
if (JSON.stringify(K.robotYolu(42, 2)) !== JSON.stringify(K.robotYolu(42, 2))) hatali('tohum tekrarlanabilir değil');
console.log(hata ? `${hata} hata` : 'Çalışma kağıtları ve cevap anahtarları doğrulandı');
process.exit(hata ? 1 : 0);
