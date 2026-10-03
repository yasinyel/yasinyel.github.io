// Çalıştır: node kodlab/test/cizim.test.js  (python3 gerekir)
const assert = require('assert');
const { execFileSync } = require('child_process');
const C = require('../cizim-motor.js');
const { I } = C;
let hata = 0;
const test = (ad, f) => { try { f(); console.log('  ✓ ' + ad); } catch (e) { hata++; console.log('  ✗ ' + ad + ': ' + e.message.slice(0, 400)); } };

// Python'da turtle yerine geçen sahte modül: aynı koordinat düzeniyle çizgileri kaydeder
const SAHTE = `
import math, json, sys, types
C=[]; S={'x':0,'y':0,'h':0,'k':True,'r':'black'}
def _git(m):
    r=math.radians(S['h']); nx=S['x']+math.sin(r)*m; ny=S['y']-math.cos(r)*m
    if S['k'] and m!=0: C.append([round(S['x'],3),round(S['y'],3),round(nx,3),round(ny,3),S['r']])
    S['x'],S['y']=nx,ny
t=types.ModuleType('turtle')
t.forward=t.fd=lambda m:_git(m); t.backward=t.back=t.bk=lambda m:_git(-m)
def _sag(a): S['h']=(S['h']+a)%360
def _sol(a): S['h']=(S['h']-a)%360
t.right=t.rt=_sag; t.left=t.lt=_sol
def _k(): S['k']=False
def _i(): S['k']=True
t.penup=t.pu=t.up=_k; t.pendown=t.pd=t.down=_i
def _r(c): S['r']=c
t.color=t.pencolor=_r; t.pensize=t.width=lambda n:None
t.__all__=['forward','fd','backward','back','bk','right','rt','left','lt','penup','pu','up','pendown','pd','down','color','pencolor','pensize','width']
sys.modules['turtle']=t
`;
function pythondaCiz(kod, bas) {
    const py = SAHTE + `S['x'],S['y'],S['h']=${bas.x},${bas.y},${bas.h}\n` + kod + '\nprint(json.dumps(C))\n';
    return JSON.parse(execFileSync('python3', ['-c', py], { encoding: 'utf8' }));
}

C.BOLUMLER.forEach((b, i) => test(`${i + 1}. ${b.ad}: çözüm tuvale sığıyor, Python ile aynı çiziyor, ayrıştırıcıdan geri dönüyor`, () => {
    const { cizgiler } = C.calistir(b.cozum, b.bas);
    assert.ok(cizgiler.length > 0, 'çizgi yok');
    for (const c of cizgiler) for (const [x, y] of [[c.x1, c.y1], [c.x2, c.y2]]) assert.ok(x >= 10 && x <= 390 && y >= 10 && y <= 390, `tuval dışı: ${x.toFixed(0)},${y.toFixed(0)}`);
    // Çözümde yalnızca araç kutusundaki bloklar kullanılmış mı?
    (function gez(l) { for (const s of l) { assert.ok(b.bloklar.includes(s.t), 'araç kutusunda olmayan blok: ' + s.t); if (s.govde) gez(s.govde); } })(b.cozum);
    const kod = C.pythonYaz(b.cozum);
    const py = pythondaCiz(kod, b.bas);
    assert.strictEqual(py.length, cizgiler.length, 'çizgi sayısı farklı');
    py.forEach((p, j) => { const c = cizgiler[j]; assert.ok(Math.abs(p[0] - c.x1) < 0.01 && Math.abs(p[3] - c.y2) < 0.01, 'koordinat farklı'); assert.strictEqual(p[4], C.RENKLER[c.renk].py); });
    const geri = C.calistir(C.pythonAyristir(kod), b.bas).cizgiler;
    assert.ok(C.karsilastir(cizgiler, geri, true).tamam, 'Python ayrıştırıcıdan dönüş farklı');
}));

test('Yanlış çizimler kabul edilmiyor', () => {
    const b = C.BOLUMLER[3], hedef = C.calistir(b.cozum, b.bas).cizgiler;
    const dene = (p) => C.karsilastir(hedef, C.calistir(p, b.bas).cizgiler).tamam;
    assert.ok(dene([I.tekrar(4, I.ileri(100), I.saga(90))]));
    assert.ok(!dene([I.tekrar(3, I.ileri(100), I.saga(90))]), 'eksik kenar');
    assert.ok(!dene([I.tekrar(4, I.ileri(110), I.saga(90))]), 'büyük kare');
    assert.ok(!dene([I.tekrar(4, I.ileri(100), I.sola(90))]), 'ters kare');
    assert.ok(!dene([I.tekrar(4, I.ileri(100), I.saga(90)), I.saga(45), I.ileri(30)]), 'fazla çizgi');
    // Farklı sırayla ama aynı şekli çizmek kabul
    assert.ok(dene([I.saga(90), I.ileri(100), I.sola(90), I.ileri(100), I.sola(90), I.ileri(100), I.sola(90), I.ileri(100)]));
});
test('Renk önemli bölümde yanlış renk reddediliyor', () => {
    const b = C.BOLUMLER.find(x => x.renkOnemli), hedef = C.calistir(b.cozum, b.bas).cizgiler;
    const yanlis = b.cozum.map(s => s.t === 'renk' && s.c === 'mavi' ? I.renk('mor') : s);
    assert.ok(!C.karsilastir(hedef, C.calistir(yanlis, b.bas).cizgiler, true).tamam);
});
test('Python ayrıştırıcı: yazım çeşitleri ve hatalar', () => {
    const p = C.pythonAyristir('import turtle\nt = turtle.Turtle()\nt.speed(0)\nfor i in range(4):\n    t.fd(50)\n    t.rt(90)\nboy = 10\nboy += 5\nforward(boy * 2)\n');
    const c = C.calistir(p, { x: 200, y: 200, h: 0 }).cizgiler;
    assert.strictEqual(c.length, 5); assert.ok(Math.abs(c[4].y1 - c[4].y2 - 30) < 1e-9);
    assert.throws(() => C.pythonAyristir('for i in range(4)\n    forward(10)'), /":"/);
    assert.throws(() => C.pythonAyristir('forward(10)\n    right(90)'), /girinti/i);
    assert.throws(() => C.pythonAyristir('color("magenta")'), /rengi/);
    assert.throws(() => C.pythonAyristir('for i in range(3):\nforward(5)'), e => e.satir === 1);
    assert.throws(() => C.calistir(C.pythonAyristir('kare()'), { x: 0, y: 0, h: 0 }), /tanımlanmamış/);
    assert.throws(() => C.calistir([I.tekrar(1000, I.tekrar(1000, I.saga(1)))], { x: 0, y: 0, h: 0 }), /uzun/);
});
test('Parametreli fonksiyon ve range adımı', () => {
    const kod = 'from turtle import *\ndef cokgen(kenar, boy):\n    for _ in range(kenar):\n        forward(boy)\n        right(360 / kenar)\n\nfor n in range(3, 7, 2):\n    cokgen(n, 40)\n';
    const bas = { x: 200, y: 200, h: 0 };
    const js = C.calistir(C.pythonAyristir(kod), bas).cizgiler;
    assert.strictEqual(js.length, 8);
    assert.strictEqual(pythondaCiz(kod, bas).length, 8);
});
console.log(hata ? `${hata} hata` : 'Çizim motoru doğrulandı');
process.exit(hata ? 1 : 0);
