// Çalıştır: node test/tablo.test.js — Tablo Atölyesi formül motoru ve görev denetimi
const T = require('../tablo-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const esit = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) hatali(`${m}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); };

// Hücre adları
esit([0, 25, 26, 27].map(T.SUTUN), ['A', 'Z', 'AA', 'AB'], 'sütun adları');
esit(T.hucreAyir('$C$12'), { c: 2, r: 11 }, 'hücre ayırma');

const t = new T.Tablo({ A1: 10, A2: 20, A3: '30', A4: 'metin', B1: '=A1+A2*2', B2: '=(A1+A2)*2', B3: '=2^3^1', B4: '=-A1+5', B5: '=A1/0', B6: '=B6+1', B7: '=C1+1', C1: '=B7', B8: '=10%', B9: '="a"&"b"&A1', B10: '=A1>=10', B11: '=1,5*2', B12: '=TOPLA(A1:A4)', B13: '=ORTALAMA(A1:A3)', B14: '=MAK(A1:A3;100)', B15: '=MİN(A1:A3)', B16: '=EĞER(A1>5;"büyük";"küçük")', B17: '=EĞERSAY(A1:A3;">15")', B18: '=ETOPLA(A1:A3;">=20")', B19: '=YUVARLA(2/3;2)', B20: '=UZUNLUK("çiçek")', B21: '=BAĞ_DEĞ_SAY(A1:A4)', B22: '=BAĞ_DEĞ_DOLU_SAY(A1:A5)', B23: '=A4+1', B24: '=BİLİNMEYEN(1)', B25: '=VE(A1>5;A2>5)', B26: '=YADA(A1>50;A2>50)', B27: '=a1+a2', B28: '=EĞERSAY(A1:A4;"METİN")', B29: '=EĞER(A1=10;"x")', B30: '=TOPLA(', B31: '=A1+', B32: '=KAREKÖK(16)', B33: '=YUVARLA(-2,5;0)', B34: '="5"+1', B35: '=10/4' });
const beklenen = { B1: 50, B2: 60, B3: 8, B4: -5, B5: '#BÖL/0!', B6: '#DÖNGÜ!', B8: '0,1', B9: 'ab10', B10: 'DOĞRU', B11: 3, B12: 60, B13: 20, B14: 100, B15: 10, B16: 'büyük', B17: 2, B18: 50, B19: '0,67', B20: 5, B21: 3, B22: 4, B23: '#DEĞER!', B24: '#AD?', B25: 'DOĞRU', B26: 'YANLIŞ', B27: 30, B28: 1, B29: 'x', B30: '#AD?', B31: '#AD?', B32: 4, B33: -3, B34: 6, B35: '2,5' };
for (const [h, b] of Object.entries(beklenen)) esit(t.goster(h), String(b), h + ' ' + t.hamDeger(h));
if (!['#DÖNGÜ!'].includes(t.goster('B7')) || t.goster('C1') !== '#DÖNGÜ!') hatali('karşılıklı döngü ' + t.goster('B7') + ' ' + t.goster('C1'));

// Formül kaydırma
esit(T.kaydir('=B2*C2', 1, 0), '=B3*C3', 'aşağı kaydır');
esit(T.kaydir('=B4*(1-$B$1)', 2, 0), '=B6*(1-$B$1)', 'mutlak başvuru');
esit(T.kaydir('=A$1+$A2', 1, 1), '=B$1+$A3', 'karışık başvuru');
esit(T.kaydir('=EĞER(B2>=50;"A2";"B2")', 1, 0), '=EĞER(B3>=50;"A2";"B2")', 'metin içi korunur');
esit(T.kaydir('=TOPLA(B2:B5)', 0, 1), '=TOPLA(C2:C5)', 'aralık kaydır');
esit(T.kaydir('=A1', -1, 0), '=#BAŞV!', 'tablo dışı');
esit(T.kaydir('42', 3, 0), '42', 'formül olmayan');

// Ölçüt
if (!T.olcutUyar(5, '>3') || T.olcutUyar(5, '<>5') || !T.olcutUyar('Geçti', 'geçti') || T.olcutUyar('abc', '>3')) hatali('ölçüt');

// Görevler: doğru formüllerle hepsi geçer, boş tablo/elle yazılmış sayı geçmez
const idler = new Set();
for (const g of T.GOREVLER) {
    if (idler.has(g.id)) hatali('tekrarlanan görev ' + g.id); idler.add(g.id);
    if (g.serbest) continue;
    if (!g.hedef.length || g.hedef.some(h => !(h in g.ref))) { hatali(g.id + ': hedef/ref uyumsuz'); continue; }
    for (const h of g.hedef) if (h in g.tablo) hatali(`${g.id}: hedef ${h} başlangıç tablosunda dolu`);
    const rt = new T.Tablo({ ...g.tablo, ...g.ref });
    for (const h of g.hedef) if (T.hataMi(rt.deger(h))) hatali(`${g.id}: ref ${h} hata veriyor ${rt.goster(h)}`);
    for (const h of Object.keys(g.tablo)) if (T.hataMi(rt.deger(h))) hatali(`${g.id}: tablo ${h} hata ${rt.goster(h)}`);
    const dogru = T.denetle(g, { ...g.tablo, ...g.ref });
    if (!dogru.every(s => s.gecti)) hatali(`${g.id}: doğru çözüm geçmedi ${JSON.stringify(dogru.filter(s => !s.gecti))}`);
    const bos = T.denetle(g, { ...g.tablo });
    if (bos.some(s => s.gecti)) hatali(`${g.id}: boş çözüm geçti`);
    // Sonucu sayı olarak elle yazmak (değişken veriler varsa) geçmemeli
    const elle = { ...g.tablo, ...Object.fromEntries(g.hedef.map(h => [h, String(T.metne(rt.deger(h)))])) };
    if (T.denetle(g, elle).some(s => s.gecti)) hatali(`${g.id}: elle yazılan sonuç geçti`);
    // Değişken veri olan görevlerde sabit sonuç formülü (="..." ya da =sayı) geçmemeli
    if (g.degisken.length) {
        const sabit = { ...g.tablo, ...Object.fromEntries(g.hedef.map(h => { const v = rt.deger(h); return [h, typeof v === 'number' ? '=' + T.metne(v) : `="${T.metne(v)}"`]; })) };
        const s = T.denetle(g, sabit);
        if (s.every(x => x.gecti)) hatali(`${g.id}: sabit formül geçti`);
    }
    if (!(g.sinif[0] >= 1 && g.sinif[1] <= 12)) hatali(g.id + ' sınıf');
}
// Alternatif doğru çözümler de geçmeli
const gTop = T.GOREVLER.find(g => g.id === 'topla');
if (!T.denetle(gTop, { ...gTop.tablo, B9: '=B2+B3+B4+B5+B6+B7+B8' })[0].gecti) hatali('alternatif toplama');
const gMut = T.GOREVLER.find(g => g.id === 'mutlak');
const goreli = { ...gMut.tablo, ...Object.fromEntries([4, 5, 6, 7, 8].map(r => [`C${r}`, `=B${r}*(1-B${r - 3})`])) };
if (T.denetle(gMut, goreli).every(s => s.gecti)) hatali('$ olmadan kaydırılan formül geçti');
const gEg = T.GOREVLER.find(g => g.id === 'eger');
if (!T.denetle(gEg, { ...gEg.tablo, ...Object.fromEntries([2, 3, 4, 5, 6, 7].map(r => [`C${r}`, `=EĞER(B${r}<50;"Kaldı";"Geçti")`])) }).every(s => s.gecti)) hatali('alternatif EĞER');
if (T.denetle(gEg, { ...gEg.tablo, ...Object.fromEntries([2, 3, 4, 5, 6, 7].map(r => [`C${r}`, `=EĞER(B${r}>50;"Geçti";"Kaldı")`])) }).every(s => s.gecti)) hatali('> yerine >= hatası yakalanmadı');
if (T.yildiz(0) !== 3 || T.yildiz(2) !== 2 || T.yildiz(5) !== 1) hatali('yıldız');
console.log(hata ? `${hata} hata` : `Tablo Atölyesi doğrulandı (${T.GOREVLER.length} görev, ${T.FONKSIYONLAR.length} fonksiyon)`);
process.exit(hata ? 1 : 0);
