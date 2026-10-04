// Çalıştır: node kodlab/test/oyun.test.js
// Her görev için: örnek çözüm bütün denetimleri geçmeli; boş ve yarım çözümler geçmemeli.
const assert = require('assert');
const M = require('../oyun-motor.js');
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message); } };
const b = (t, o = {}) => ({ t, ...o });
const sapka = (t, govde, o = {}) => ({ t, ...o, govde });
const proje = (g, kodlar) => { const p = M.baslangicProjesi(g); for (const k of p.karakterler) k.betikler = kodlar[k.id] || []; return p; };
const COZUM = M.COZUMLER;
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
