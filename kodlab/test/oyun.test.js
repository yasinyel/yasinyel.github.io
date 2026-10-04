// Çalıştır: node kodlab/test/oyun.test.js
// Her görev için: örnek çözüm bütün denetimleri geçmeli; boş ve yarım çözümler geçmemeli.
const assert = require('assert');
const M = require('../oyun-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
const b = (t, o = {}) => ({ t, ...o });
const sapka = (t, govde, o = {}) => ({ t, ...o, govde });
const proje = (g, kodlar) => { const p = M.baslangicProjesi(g); for (const k of p.karakterler) k.betikler = kodlar[k.id] || []; return p; };
const hareket = [sapka('tus_basili', [b('x_degistir', { n: 5 })], { tus: 'sag' }), sapka('tus_basili', [b('x_degistir', { n: -5 })], { tus: 'sol' }), sapka('tus_basili', [b('y_degistir', { n: 5 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -5 })], { tus: 'asagi' })];
const yildiz = [sapka('degince', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('ses', { tur: 'dogru' })], { hedef: 'robot' })];
const dusman = [sapka('surekli', [b('x_degistir', { n: 4 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: -220, y: 0 })] })]), sapka('degince', [b('can_degistir', { n: -1 }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet', { metin: 'Bitti' })] })], { hedef: 'robot' })];
const yatay = [sapka('tus_basili', [b('x_degistir', { n: 6 })], { tus: 'sag' }), sapka('tus_basili', [b('x_degistir', { n: -6 })], { tus: 'sol' })];
const dikey = [sapka('tus_basili', [b('y_degistir', { n: 5 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -5 })], { tus: 'asagi' })];
const elmaDus = [sapka('surekli', [b('y_degistir', { n: -4 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: 0, y: 150 })] })])];
const kurbaga = [sapka('tiklaninca', [b('puan_degistir', { n: 1 }), b('gizle')]), sapka('surekli', [b('eger', { k: 'sans', n: 2, govde: [b('rastgele_git'), b('goster')] })])];
const meteorAk = [sapka('surekli', [b('x_degistir', { n: -6 }), b('eger', { k: 'kenar', n: 0, govde: [b('git', { x: 210, y: 0 })] })])];
const meteorCarp = sapka('degince', [b('can_degistir', { n: -1 }), b('git', { x: 210, y: 0 }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })], { hedef: 'roket' });
const hayaletK = [sapka('surekli', [b('eger', { k: 'sans', n: 3, govde: [b('rastgele_git')] })]), sapka('degince', [b('can_degistir', { n: -1 }), b('rastgele_git')], { hedef: 'robot' })];
const COZUM = {
    balon: { balon: [sapka('tiklaninca', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('eger', { k: 'puan=', n: 10, govde: [b('kazan', { metin: 'Süper!' })] })])] },
    hareket: { robot: hareket },
    yildiz: { robot: hareket, yildiz },
    dusman: { robot: hareket, yildiz, dusman },
    kazan: { robot: [sapka('baslayinca', [b('puan_yap', { n: 0 }), b('can_yap', { n: 3 })]), ...hareket, sapka('surekli', [b('eger', { k: 'puan=', n: 10, govde: [b('kazan', { metin: 'Kazandın' })] })])], yildiz, dusman },
    elma1: { kedi: yatay },
    elma2: { kedi: yatay, elma: elmaDus },
    elma3: { kedi: yatay, elma: [...elmaDus, sapka('degince', [b('puan_degistir', { n: 1 }), b('git', { x: 0, y: 150 }), b('eger', { k: 'puan=', n: 5, govde: [b('kazan')] })], { hedef: 'kedi' })] },
    kurbaga1: { kurbaga: kurbaga },
    kurbaga2: { kurbaga: [...kurbaga, sapka('tiklaninca', [b('eger', { k: 'puan=', n: 10, govde: [b('kazan')] })])], bomba: [sapka('tiklaninca', [b('can_degistir', { n: -1 }), b('rastgele_git'), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })])] },
    meteor1: { roket: dikey, meteor: meteorAk },
    meteor2: { roket: dikey, meteor: [...meteorAk, meteorCarp] },
    meteor3: { roket: [...dikey, sapka('surekli', [b('puan_degistir', { n: 1 }), b('eger', { k: 'puan>', n: 600, govde: [b('kazan')] })])], meteor: [...meteorAk, meteorCarp] },
    hayalet1: { robot: hareket, hayalet: hayaletK },
    hayalet2: { robot: [...hareket, sapka('baslayinca', [b('can_yap', { n: 3 }), b('puan_yap', { n: 0 })]), sapka('surekli', [b('puan_degistir', { n: 1 }), b('eger', { k: 'puan>', n: 900, govde: [b('kazan')] }), b('eger', { k: 'can=', n: 0, govde: [b('kaybet')] })])], hayalet: hayaletK },
    sohbet: { robot: [sapka('baslayinca', [b('soyle', { metin: 'Merhaba, ben Kodi!', sure: 2 })]), sapka('tus_basilinca', [b('soyle', { metin: 'Bilgisayar neden üşür? Pencereleri açık!', sure: 3 })], { tus: 'bosluk' }), sapka('tiklaninca', [b('kostum', { emoji: '🐱' })])] },
    duvar: { robot: [...hareket, sapka('degince', [b('git', { x: -180, y: -120 })], { hedef: 'duvar' }), sapka('degince', [b('kazan')], { hedef: 'yildiz' })] },
    penalti: { top: [sapka('tus_basilinca', [b('tekrar', { n: 10, govde: [b('x_degistir', { n: 20 })] })], { tus: 'bosluk' }), sapka('tus_basili', [b('y_degistir', { n: 4 })], { tus: 'yukari' }), sapka('tus_basili', [b('y_degistir', { n: -4 })], { tus: 'asagi' }), sapka('degince', [b('puan_degistir', { n: 1 }), b('git', { x: -150, y: 0 }), b('eger', { k: 'puan=', n: 3, govde: [b('kazan')] })], { hedef: 'kale' })] },
    kalp: { robot: hareket, kalp: [sapka('degince', [b('eger', { k: 'can<', n: 5, govde: [b('can_degistir', { n: 1 })] }), b('rastgele_git')], { hedef: 'robot' })], dusman },
    final: { robot: hareket, yildiz: [sapka('degince', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('eger', { k: 'puan=', n: 10, govde: [b('kazan')] })], { hedef: 'robot' })], dusman: [...dusman, sapka('surekli', [b('eger', { k: 'puan>', n: 5, govde: [b('boyut', { n: 150 })] })])] }
};
for (const g of M.GOREVLER.filter(g => !g.serbest)) {
    test(`${g.ad}: örnek çözüm bütün denetimleri geçiyor`, () => {
        const s = M.denetle(g, proje(g, COZUM[g.id]));
        assert.ok(s.every(x => x.gecti), JSON.stringify(s.filter(x => !x.gecti).map(x => x.ad)));
    });
    test(`${g.ad}: boş proje geçmiyor`, () => { assert.ok(!M.denetle(g, proje(g, {})).every(x => x.gecti)); });
    test(`${g.ad}: çözüm yalnızca araç kutusundaki blokları kullanıyor`, () => {
        (function gez(l) { for (const d of l) { assert.ok(g.bloklar.includes(d.t), d.t); for (const x of [d.govde, d.govde2]) if (x) gez(x); } })(Object.values(COZUM[g.id]).flat());
    });
}
test('Yarım çözümler yakalanıyor', () => {
    const g = M.GOREVLER.find(x => x.id === 'balon');
    const sadecePuan = M.denetle(g, proje(g, { balon: [sapka('tiklaninca', [b('puan_degistir', { n: 1 })])] }));
    assert.deepStrictEqual(sadecePuan.map(x => x.gecti), [true, false, false, true]);
    const erkenKazan = M.denetle(g, proje(g, { balon: [sapka('tiklaninca', [b('puan_degistir', { n: 1 }), b('rastgele_git'), b('eger', { k: 'puan>', n: 5, govde: [b('kazan')] })])] }));
    assert.ok(!erkenKazan[3].gecti, '6. tıklamada kazanan geçmemeli');
    const g2 = M.GOREVLER.find(x => x.id === 'hareket');
    const ters = M.denetle(g2, proje(g2, { robot: [sapka('tus_basili', [b('x_degistir', { n: -5 })], { tus: 'sag' })] }));
    assert.ok(!ters[0].gecti, 'ters yön geçmemeli');
});
test('Çarpışma olayı yalnızca temas başında bir kez çalışıyor', () => {
    const o = new M.Oyun({ karakterler: [{ ...M.KAR.robot, betikler: [] }, { ...M.KAR.yildiz, betikler: [sapka('degince', [b('puan_degistir', { n: 1 })], { hedef: 'robot' })] }] }, 1);
    o.baslat(); o.kar('yildiz').x = o.kar('robot').x; o.kar('yildiz').y = o.kar('robot').y;
    for (let i = 0; i < 10; i++) o.tik();
    assert.strictEqual(o.puan, 1);
});
test('Tuşa basılınca olayı basılı tutulurken tekrar etmiyor', () => {
    const o = new M.Oyun({ karakterler: [{ ...M.KAR.robot, betikler: [sapka('tus_basilinca', [b('puan_degistir', { n: 1 })], { tus: 'bosluk' })] }] }, 1);
    o.baslat(); for (let i = 0; i < 10; i++) o.tik(new Set(['bosluk'])); o.tik(); o.tik(new Set(['bosluk']));
    assert.strictEqual(o.puan, 2);
});
test('Karakter sahne dışına çıkamıyor; sonsuz tekrar donmuyor', () => {
    const o = new M.Oyun({ karakterler: [{ ...M.KAR.robot, betikler: [sapka('surekli', [b('tekrar', { n: 99999, govde: [b('x_degistir', { n: 50 })] })])] }] }, 1);
    o.baslat(); o.tik(); assert.ok(o.kar('robot').x <= 240);
});
console.log(hata ? `${hata} hata` : 'Oyun motoru doğrulandı');
process.exit(hata ? 1 : 0);
