// KodLab — Python Laboratuvarı işçisi (modül türünde Web Worker)
// Python ayrı bir iş parçacığında çalışır; sonsuz döngüde sayfa donmaz, arayüz işçiyi sonlandırıp yeniden başlatır.
import { loadPyodide } from './vendor/pyodide/pyodide.mjs';
import './python-motor.js';
const PythonMotor = self.PythonMotor;

let py = null;
const hazir = loadPyodide({ indexURL: new URL('vendor/pyodide/', self.location.href).href })
    .then((p) => { py = p; py.runPython(PythonMotor.HARNESS); postMessage({ tur: 'hazir' }); })
    .catch((e) => postMessage({ tur: 'yuklenemedi', mesaj: String(e && e.message || e) }));

onmessage = async (e) => {
    await hazir;
    if (!py) return;
    const m = e.data;
    if (m.tur === 'calistir') {
        const r = PythonMotor.calistir(py, m.kod, m.girdiler, m.tohum, (s) => postMessage({ tur: 'cikti', no: m.no, s }), true);
        if (r.durum === 'hata') r.hata = PythonMotor.hataAcikla(r.tur, r.mesaj, r.satir);
        postMessage({ tur: 'bitti', no: m.no, sonuc: r });
    } else if (m.tur === 'denetle') {
        const g = PythonMotor.GOREVLER.find(x => x.id === m.gorev);
        postMessage({ tur: 'denetim', no: m.no, sonuclar: PythonMotor.denetle(py, g, m.kod) });
    }
};
