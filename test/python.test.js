// Çalıştır: node test/python.test.js
// Görevler gerçek Python'da (Pyodide, sitedeki aynı dosyalar) denetlenir:
// örnek çözüm bütün testleri geçmeli, başlangıç kodu geçmemeli, hata açıklamaları Türkçe olmalı.
const path = require('path');
const M = require('../python-motor.js');
(async () => {
    const { loadPyodide } = await import('../vendor/pyodide/pyodide.mjs');
    const py = await loadPyodide({ indexURL: path.join(__dirname, '../vendor/pyodide') + '/' });
    py.runPython(M.HARNESS);
    let hata = 0;
    const hatali = (m) => { hata++; console.log('  ✗ ' + m); };
    const idler = new Set();
    for (const g of M.GOREVLER) {
        if (idler.has(g.id)) hatali('tekrarlanan id ' + g.id); idler.add(g.id);
        if (!M.UNITELER.some(u => u.id === g.unite)) hatali(g.id + ': ünite yok');
        const coz = M.denetle(py, g, g.cozum);
        coz.forEach((r, i) => { if (!r.gecti) hatali(`${g.id} çözüm test ${i + 1}: beklenen ${JSON.stringify(r.beklenen)} çıktı ${JSON.stringify(r.cikti)} ${r.hata ? r.hata.ham : ''}`); });
        const bas = M.denetle(py, g, g.baslangic);
        if (bas.every(r => r.gecti)) hatali(g.id + ': başlangıç kodu zaten geçiyor');
        if (M.yasakKullanim(g, g.cozum)) hatali(g.id + ': çözüm yasaklı yapı kullanıyor');
    }
    // Etkileşimli çalıştırma: girdi bekleme ve tekrar oynatma
    let c = '';
    let r = M.calistir(py, 'a = input("Ad? ")\nprint("Selam", a)', [], 0, s => { c += s; }, true);
    if (r.durum !== 'girdi' || r.mesaj !== 'Ad? ') hatali('girdi bekleme çalışmıyor ' + JSON.stringify(r));
    c = ''; r = M.calistir(py, 'a = input("Ad? ")\nprint("Selam", a)', ['Ada'], 0, s => { c += s; }, true);
    if (r.durum !== 'tamam' || c !== 'Ad? Ada\nSelam Ada\n') hatali('girdi yankısı yanlış ' + JSON.stringify(c));
    // Rastgele sayılar aynı tohumla aynı gelmeli (tekrar oynatma için)
    const rs = () => { let o = ''; M.calistir(py, 'import random\nprint(random.randint(1, 1000000))', [], 42, s => { o += s; }, true); return o; };
    if (rs() !== rs()) hatali('aynı tohum farklı sayı verdi');
    // Hatalar
    const hataTuru = (kod, beklenen, satir) => {
        const r = M.calistir(py, kod, [], 0, () => {}, false);
        const a = M.hataAcikla(r.tur, r.mesaj, r.satir);
        if (r.durum !== 'hata' || a.ad !== beklenen || (satir && r.satir !== satir)) hatali(`hata ${JSON.stringify(kod)} → ${r.tur} ${a.ad} satır ${r.satir}`);
    };
    hataTuru('print("a"\n', 'Yazım hatası', 1);
    hataTuru('if 1 > 0\n    print(1)', 'Yazım hatası', 1);
    hataTuru('if 1 > 0:\nprint(1)', 'Girinti hatası', 2);
    hataTuru('x = 1\nprint(y)', 'İsim hatası', 2);
    hataTuru('print("a" + 1)', 'Tür hatası', 1);
    hataTuru('int("on")', 'Değer hatası', 1);
    hataTuru('a = 0\nprint(5 / a)', 'Sıfıra bölme', 2);
    hataTuru('l = [1]\nl[3]', 'Sıra hatası', 2);
    hataTuru('def f():\n    return f()\nf()', 'Sonsuz özyineleme');
    hataTuru('while True:\n    print("x")', 'Çok fazla çıktı');
    // Python ortamı her çalıştırmada temiz olmalı
    M.calistir(py, 'gizli = 5', [], 0, () => {}, false);
    r = M.calistir(py, 'print(gizli)', [], 0, () => {}, false);
    if (r.tur !== 'NameError') hatali('ad alanı temizlenmiyor');
    // Fonksiyon testlerinde öğrencinin kendi print'leri sayılmaz
    const ik = M.GOREVLER.find(g => g.id === 'ikilik');
    if (!M.denetle(py, ik, ik.cozum + '\nprint("deneme")').every(x => x.gecti)) hatali('fonksiyon testinde öğrenci çıktısı karıştı');
    if (M.yasakKullanim(M.GOREVLER.find(g => g.id === 'sirala'), 'def sirala(l):\n    return sorted(l)') !== 'sorted') hatali('yasak denetimi çalışmıyor');
    if (M.yasakKullanim(M.GOREVLER.find(g => g.id === 'sirala'), '# sorted() kullanma\nx = "sort()"') !== null) hatali('yasak denetimi yorumu saydı');
    console.log(hata ? `${hata} hata` : `${M.GOREVLER.length} Python görevi Pyodide ile doğrulandı`);
    process.exit(hata ? 1 : 0);
})();
