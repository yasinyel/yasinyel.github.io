// Çalıştır: node kodlab/test/qr.test.js  (python3 + opencv gerekir: pip install opencv-python-headless)
// Farklı uzunluktaki metinleri QR'a çevirir, OpenCV ile okuyup aynı metni geri aldığını doğrular.
// (Klasik QRCodeDetector bazı geçerli kodlarda bulma adımında takılabildiği için önce Aruco okuyucu denenir.)
const { execFileSync } = require('child_process');
const QR = require('../qr.js');
const ornekler = ['KL1', 'https://yasinyel.com/kodlab/', 'Merhaba Dünya! Çğıöşü İĞÜŞÖÇ',
    'https://yasinyel.com/kodlab/gorev.html#g=' + 'x'.repeat(150), 'KL1|Ayşe Yılmaz|7-B|' + 'r1.2.3.3.3.2.1|'.repeat(12),
    'a'.repeat(600)];
const matrisler = ornekler.map(o => QR.olustur(o).map(s => s.map(Number)));
const py = `
import json, sys, numpy as np, cv2
data = json.loads(sys.stdin.read())
d1 = cv2.QRCodeDetectorAruco()
d2 = cv2.QRCodeDetector()
for m in data:
    a = np.array(m, dtype=np.uint8)
    img = (1 - a) * 255
    img = np.pad(img, 4, constant_values=255)
    img = cv2.resize(img, None, fx=8, fy=8, interpolation=cv2.INTER_NEAREST)
    t = d1.detectAndDecode(img)[0] or d2.detectAndDecode(img)[0]
    print(json.dumps(t))
`;
const out = execFileSync('python3', ['-c', py], { input: JSON.stringify(matrisler), encoding: 'utf8' }).trim().split('\n').map(JSON.parse);
let hata = 0;
ornekler.forEach((o, i) => {
    const ok = out[i] === o;
    if (!ok) hata++;
    console.log(`  ${ok ? '✓' : '✗'} ${o.length} karakter, ${matrisler[i].length}×${matrisler[i].length}${ok ? '' : ' okunan: ' + JSON.stringify(out[i]).slice(0, 60)}`);
});
console.log(hata ? `${hata} hata` : 'Tüm QR kodlar okundu');
process.exit(hata ? 1 : 0);
