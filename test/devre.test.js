// Çalıştır: node kodlab/test/devre.test.js — KodKart motoru ve görev denetimleri
const D = require('../devre-motor.js');
let hata = 0;
const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
const h = (t, govde) => ({ t, govde });
const b = (t, o = {}) => ({ t, ...o });
const COZUM = {
    kalp: [h('surekli', [b('ikon_goster', { ikon: 'kalp' }), b('bekle', { ms: 500 }), b('ikon_goster', { ikon: 'kucuk_kalp' }), b('bekle', { ms: 500 })])],
    isim: [h('a_basilinca', [b('yazi_goster', { metin: 'ADA' })]), h('b_basilinca', [b('ikon_goster', { ikon: 'gulen' })])],
    sayac: [h('baslayinca', [b('deg_yap', { d: 'a', n: 0 }), b('deg_goster', { d: 'a' })]), h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })]), h('b_basilinca', [b('deg_yap', { d: 'a', n: 0 }), b('deg_goster', { d: 'a' })])],
    zar: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 6 }), b('deg_goster', { d: 'a' })])],
    termo: [h('surekli', [{ t: 'eger_degilse', k: 'sicaklik>', n: 30, govde: [b('ikon_goster', { ikon: 'uzgun' })], govde2: [b('ikon_goster', { ikon: 'gulen' })] }])],
    gece: [h('surekli', [{ t: 'eger_degilse', k: 'isik<', n: 50, govde: [b('ikon_goster', { ikon: 'dolu' })], govde2: [b('temizle')] }])],
    tkm: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 3 }), { t: 'eger', k: 'a=', n: 1, govde: [b('ikon_goster', { ikon: 'tas' })] }, { t: 'eger', k: 'a=', n: 2, govde: [b('ikon_goster', { ikon: 'kagit' })] }, { t: 'eger', k: 'a=', n: 3, govde: [b('ikon_goster', { ikon: 'makas' })] }])],
    zil: [h('a_basilinca', [b('ikon_goster', { ikon: 'nota' }), b('nota', { nota: 'mi', ms: 300 }), b('nota', { nota: 'do', ms: 300 }), b('nota', { nota: 'sol', ms: 500 }), b('temizle')])]
};
// Yarım çözümler: en az bir denetim geçmemeli
const YARIM = {
    kalp: [h('baslayinca', [b('ikon_goster', { ikon: 'kalp' })])],
    isim: [h('a_basilinca', [b('yazi_goster', { metin: 'ADA' })])],
    sayac: [h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })])],
    zar: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 0, max: 9 }), b('deg_goster', { d: 'a' })])],
    termo: [h('baslayinca', [{ t: 'eger_degilse', k: 'sicaklik>', n: 30, govde: [b('ikon_goster', { ikon: 'uzgun' })], govde2: [b('ikon_goster', { ikon: 'gulen' })] }])],
    gece: [h('surekli', [{ t: 'eger', k: 'isik<', n: 50, govde: [b('ikon_goster', { ikon: 'dolu' })] }])],
    tkm: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 2 }), { t: 'eger_degilse', k: 'a=', n: 1, govde: [b('ikon_goster', { ikon: 'tas' })], govde2: [b('ikon_goster', { ikon: 'kagit' })] }])],
    zil: [h('a_basilinca', [b('nota', { nota: 'mi', ms: 300 }), b('nota', { nota: 'do', ms: 300 }), b('nota', { nota: 'sol', ms: 500 })])]
};
for (const g of D.GOREVLER.filter(g => !g.serbest)) {
    const p = { betikler: COZUM[g.id] };
    // çözüm sadece izinli blokları kullanmalı
    const kullan = (l) => l.flatMap(x => [x.t, ...kullan(x.govde || []), ...kullan(x.govde2 || [])]);
    kullan(p.betikler).filter(t => !g.bloklar.includes(t)).forEach(t => hatali(`${g.id}: çözümde izinsiz blok ${t}`));
    const s = D.denetle(g, p);
    s.filter(x => !x.gecti).forEach(x => hatali(`${g.id} çözüm geçmedi: ${x.ad}`));
    if (D.denetle(g, { betikler: [] }).every(x => x.gecti)) hatali(`${g.id}: boş proje geçiyor`);
    if (D.denetle(g, { betikler: YARIM[g.id] }).every(x => x.gecti)) hatali(`${g.id}: yarım çözüm geçiyor`);
}
// Motor ayrıntıları
const k = new D.Kart({ betikler: [h('surekli', [])] }); k.baslat(); k.adim(1000); // boş sonsuz döngü takılmamalı
const r = new D.Kart({ betikler: [h('baslayinca', [b('tekrar', { n: 1000000, govde: [b('deg_degistir', { d: 'a', n: 1 })] })])] }); r.baslat(); r.adim(200);
if (!(r.d.a > 0)) hatali('uzun döngü ilerlemiyor');
for (const c of '0123456789') { const x = new D.Kart({ betikler: [h('baslayinca', [b('sayi_goster', { n: c })])] }); x.baslat(); x.adim(40); if (D.ekrandakiRakam(x.ekran) !== +c) hatali('rakam ' + c); }
const y = new D.Kart({ betikler: [h('baslayinca', [b('yazi_goster', { metin: 'Çığ' })])] }); y.baslat(); y.adim(200); if (!y.ekran.includes(1)) hatali('kayan yazı');
y.adim(5000); if (y.ekran.includes(1)) hatali('kayan yazı bitince ekran temizlenmeli');
const l = new D.Kart({ betikler: [h('baslayinca', [b('led', { islem: 'yak', x: 9, y: -3 }), b('led', { islem: 'degistir', x: 0, y: 0 })])] }); l.baslat(); l.adim(40);
if (l.ekran[4] !== 1 || l.ekran[0] !== 1) hatali('LED koordinatları');
for (const [ad, i] of Object.entries(D.IKONLAR)) if (i.length !== 5 || i.some(s => s.length !== 5)) hatali('ikon boyutu ' + ad);
for (const [c, g] of Object.entries(D.F)) if (g.length !== 5 || g.some(s => s.length !== g[0].length)) hatali('glif ' + c);
console.log(hata ? `${hata} hata` : 'KodKart motoru doğrulandı');
process.exit(hata ? 1 : 0);
