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
    zil: [h('a_basilinca', [b('ikon_goster', { ikon: 'nota' }), b('nota', { nota: 'mi', ms: 300 }), b('nota', { nota: 'do', ms: 300 }), b('nota', { nota: 'sol', ms: 500 }), b('temizle')])],
    duygu: [h('a_basilinca', [b('ikon_goster', { ikon: 'gulen' })]), h('b_basilinca', [b('ikon_goster', { ikon: 'uzgun' })]), h('ab_basilinca', [b('ikon_goster', { ikon: 'kalp' })])],
    yon: [h('a_basilinca', [b('ikon_goster', { ikon: 'sol' })]), h('b_basilinca', [b('ikon_goster', { ikon: 'sag' })]), h('sallaninca', [b('ikon_goster', { ikon: 'yukari' })])],
    gerisayim: [h('baslayinca', [b('deg_yap', { d: 'a', n: 5 }), b('tekrar', { n: 5, govde: [b('deg_goster', { d: 'a' }), b('bekle', { ms: 1000 }), b('deg_degistir', { d: 'a', n: -1 })] }), b('ikon_goster', { ikon: 'yildiz' })])],
    yanson: [h('surekli', [b('led', { islem: 'yak', x: 2, y: 2 }), b('bekle', { ms: 300 }), b('led', { islem: 'sondur', x: 2, y: 2 }), b('bekle', { ms: 300 })])],
    kose: [h('baslayinca', [b('led', { islem: 'yak', x: 0, y: 0 }), b('led', { islem: 'yak', x: 4, y: 0 }), b('led', { islem: 'yak', x: 0, y: 4 }), b('led', { islem: 'yak', x: 4, y: 4 })])],
    skor: [h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })]), h('b_basilinca', [b('deg_degistir', { d: 'b', n: 1 }), b('deg_goster', { d: 'b' })]), h('ab_basilinca', [b('deg_yap', { d: 'a', n: 0 }), b('deg_yap', { d: 'b', n: 0 }), b('sayi_goster', { n: 0 })])],
    sensoroku: [h('a_basilinca', [b('sensor_goster', { sensor: 'sicaklik' })]), h('b_basilinca', [b('sensor_goster', { sensor: 'isik' })])],
    alarm: [h('surekli', [{ t: 'eger_degilse', k: 'isik>', n: 100, govde: [b('ikon_goster', { ikon: 'hayir' }), b('nota', { nota: 'do2', ms: 200 })], govde2: [b('temizle')] }])],
    sihirli: [h('sallaninca', [{ t: 'eger_degilse', k: 'sans', n: 50, govde: [b('ikon_goster', { ikon: 'evet' })], govde2: [b('ikon_goster', { ikon: 'hayir' })] }])],
    yazitura: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 2 }), { t: 'eger_degilse', k: 'a=', n: 1, govde: [b('yazi_goster', { metin: 'Y' })], govde2: [b('yazi_goster', { metin: 'T' })] }])],
    doremi: [h('a_basilinca', ['do', 're', 'mi', 'fa', 'sol'].map(n => b('nota', { nota: n, ms: 300 })))],
    muzikkutusu: [h('a_basilinca', [b('ikon_goster', { ikon: 'nota' }), ...['mi', 'mi', 'fa', 'sol'].map(n => b('nota', { nota: n, ms: 300 })), b('temizle')]), h('b_basilinca', [b('ikon_goster', { ikon: 'nota' }), ...['do', 'do', 'sol', 'sol', 'la'].map(n => b('nota', { nota: n, ms: 300 })), b('temizle')])],
    adimhedef: [h('sallaninca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' }), { t: 'eger', k: 'a=', n: 10, govde: [b('ikon_goster', { ikon: 'yildiz' })] }])],
    gerisayac: [h('baslayinca', [b('deg_yap', { d: 'a', n: 9 }), b('deg_goster', { d: 'a' })]), h('a_basilinca', [b('deg_degistir', { d: 'a', n: -1 }), { t: 'eger_degilse', k: 'a=', n: 0, govde: [b('ikon_goster', { ikon: 'uzgun' })], govde2: [b('deg_goster', { d: 'a' })] }])],
    ciftzar: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 6 }), b('deg_rastgele', { d: 'b', min: 1, max: 6 }), b('deg_goster', { d: 'a' }), b('bekle', { ms: 700 }), b('temizle'), b('bekle', { ms: 200 }), b('deg_goster', { d: 'b' })])],
    isikolcer: [h('surekli', [{ t: 'eger_degilse', k: 'isik<', n: 50, govde: [b('sayi_goster', { n: 1 })], govde2: [{ t: 'eger_degilse', k: 'isik<', n: 150, govde: [b('sayi_goster', { n: 2 })], govde2: [b('sayi_goster', { n: 3 })] }] }])],
    sicaklikalarm: [h('surekli', [{ t: 'eger_degilse', k: 'sicaklik>', n: 35, govde: [b('ikon_goster', { ikon: 'uzgun' }), b('nota', { nota: 'si', ms: 200 })], govde2: [{ t: 'eger_degilse', k: 'sicaklik<', n: 10, govde: [b('ikon_goster', { ikon: 'hayir' })], govde2: [b('ikon_goster', { ikon: 'gulen' })] }] }])],
    kilit: [h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 })]), h('b_basilinca', [{ t: 'eger_degilse', k: 'a=', n: 2, govde: [b('ikon_goster', { ikon: 'evet' })], govde2: [b('ikon_goster', { ikon: 'hayir' })] }, b('deg_yap', { d: 'a', n: 0 })])],
    kronometre: [h('a_basilinca', [b('deg_yap', { d: 'a', n: 0 }), b('deg_goster', { d: 'a' }), b('tekrar', { n: 9, govde: [b('bekle', { ms: 1000 }), b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })] })])],
    zamanlayici: [h('a_basilinca', [b('deg_yap', { d: 'a', n: 3 }), b('tekrar', { n: 3, govde: [b('deg_goster', { d: 'a' }), b('bekle', { ms: 1000 }), b('deg_degistir', { d: 'a', n: -1 })] }), b('temizle'), b('tekrar', { n: 3, govde: [b('nota', { nota: 'do2', ms: 200 })] }), b('ikon_goster', { ikon: 'gulen' })])],
    gecegunduz: [h('surekli', [{ t: 'eger_degilse', k: 'isik<', n: 60, govde: [b('ikon_goster', { ikon: 'yildiz' })], govde2: [b('ikon_goster', { ikon: 'ev' })] }])],
    robotselam: [h('baslayinca', [b('ikon_goster', { ikon: 'robot' })]), h('a_basilinca', [b('yazi_goster', { metin: 'MERHABA' }), b('ikon_goster', { ikon: 'robot' })])]
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
    zil: [h('a_basilinca', [b('nota', { nota: 'mi', ms: 300 }), b('nota', { nota: 'do', ms: 300 }), b('nota', { nota: 'sol', ms: 500 })])],
    duygu: [h('a_basilinca', [b('ikon_goster', { ikon: 'gulen' })]), h('b_basilinca', [b('ikon_goster', { ikon: 'uzgun' })])],
    yon: [h('a_basilinca', [b('ikon_goster', { ikon: 'sol' })]), h('b_basilinca', [b('ikon_goster', { ikon: 'sag' })])],
    gerisayim: [h('baslayinca', [b('deg_yap', { d: 'a', n: 5 }), b('tekrar', { n: 5, govde: [b('deg_goster', { d: 'a' }), b('deg_degistir', { d: 'a', n: -1 })] }), b('ikon_goster', { ikon: 'yildiz' })])],
    yanson: [h('surekli', [b('led', { islem: 'degistir', x: 2, y: 2 })])],
    kose: [h('baslayinca', [b('ikon_goster', { ikon: 'kare' })])],
    skor: [h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })]), h('b_basilinca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })])],
    sensoroku: [h('a_basilinca', [b('sensor_goster', { sensor: 'sicaklik' })])],
    alarm: [h('surekli', [{ t: 'eger', k: 'isik>', n: 100, govde: [b('ikon_goster', { ikon: 'hayir' }), b('nota', { nota: 'do2', ms: 200 })] }])],
    sihirli: [h('sallaninca', [b('ikon_goster', { ikon: 'evet' })])],
    yazitura: [h('sallaninca', [b('yazi_goster', { metin: 'Y' })])],
    doremi: [h('a_basilinca', ['do', 'mi', 're', 'fa', 'sol'].map(n => b('nota', { nota: n, ms: 300 })))],
    muzikkutusu: [h('a_basilinca', ['mi', 'mi', 'fa', 'sol'].map(n => b('nota', { nota: n, ms: 300 }))), h('b_basilinca', ['mi', 'mi', 'fa', 'sol'].map(n => b('nota', { nota: n, ms: 300 })))],
    adimhedef: [h('sallaninca', [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' }), { t: 'eger', k: 'a>', n: 5, govde: [b('ikon_goster', { ikon: 'yildiz' })] }])],
    gerisayac: [h('baslayinca', [b('deg_yap', { d: 'a', n: 9 }), b('deg_goster', { d: 'a' })]), h('a_basilinca', [b('deg_degistir', { d: 'a', n: -1 }), b('deg_goster', { d: 'a' })])],
    ciftzar: [h('sallaninca', [b('deg_rastgele', { d: 'a', min: 1, max: 6 }), b('deg_goster', { d: 'a' }), b('bekle', { ms: 700 }), b('temizle'), b('bekle', { ms: 200 }), b('deg_goster', { d: 'a' })])],
    isikolcer: [h('surekli', [{ t: 'eger_degilse', k: 'isik<', n: 50, govde: [b('sayi_goster', { n: 1 })], govde2: [b('sayi_goster', { n: 3 })] }])],
    sicaklikalarm: [h('surekli', [{ t: 'eger_degilse', k: 'sicaklik>', n: 35, govde: [b('ikon_goster', { ikon: 'uzgun' })], govde2: [b('ikon_goster', { ikon: 'gulen' })] }])],
    kilit: [h('a_basilinca', [b('deg_degistir', { d: 'a', n: 1 })]), h('b_basilinca', [{ t: 'eger_degilse', k: 'a>', n: 1, govde: [b('ikon_goster', { ikon: 'evet' })], govde2: [b('ikon_goster', { ikon: 'hayir' })] }])],
    kronometre: [h('a_basilinca', [b('deg_yap', { d: 'a', n: 0 }), b('tekrar', { n: 9, govde: [b('deg_degistir', { d: 'a', n: 1 }), b('deg_goster', { d: 'a' })] })])],
    zamanlayici: [h('a_basilinca', [b('tekrar', { n: 3, govde: [b('nota', { nota: 'do2', ms: 200 })] }), b('ikon_goster', { ikon: 'gulen' })])],
    gecegunduz: [h('surekli', [{ t: 'eger', k: 'isik<', n: 60, govde: [b('ikon_goster', { ikon: 'yildiz' })] }])],
    robotselam: [h('a_basilinca', [b('yazi_goster', { metin: 'MERHABA' }), b('ikon_goster', { ikon: 'robot' })])]
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
