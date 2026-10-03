// KodLab — Robot Kodla motoru
// Türkçe komutlu küçük bir dil: ayrıştırıcı + adım adım çalışan yorumlayıcı.
// Tarayıcıda window.RobotMotor, Node'da module.exports olarak kullanılır.
(function (root) {
    'use strict';

    // Yönler: 0 kuzey, 1 doğu, 2 güney, 3 batı
    const YONLER = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const YON_KARAKTER = { '^': 0, '>': 1, 'v': 2, '<': 3 };
    const ADIM_SINIRI = 2000;

    class KodHatasi extends Error {
        constructor(mesaj, satir) { super(mesaj); this.satir = satir; }
    }

    // Türkçe karakterleri sadeleştir: "Sağa" == "saga", "ÖNÜ_BOŞ" == "onu_bos"
    function sadelestir(s) {
        return s.toLocaleLowerCase('tr')
            .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
            .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
    }

    const ANAHTAR = new Set(['tekrarla', 'eger', 'degilse', 'iken', 'fonksiyon', 'degil']);
    const KOMUTLAR = { ileri: 'ileri', saga: 'sağa', sola: 'sola' };
    const KOSULLAR = {
        onu_bos: 'önü_boş', sagi_bos: 'sağı_boş', solu_bos: 'solu_boş', yildiz_kaldi: 'yıldız_kaldı'
    };

    // ---------- Harita ----------
    // '.' zemin, '*' yıldız, '#' duvar, ' ' boşluk, ^ > v < robot
    function haritaOku(satirlar) {
        const h = satirlar.length;
        const w = Math.max(...satirlar.map(s => s.length));
        const zemin = [];
        let robot = null, yildiz = 0;
        for (let y = 0; y < h; y++) {
            const sira = [];
            for (let x = 0; x < w; x++) {
                const c = satirlar[y][x] || ' ';
                if (c in YON_KARAKTER) { robot = { x, y, d: YON_KARAKTER[c] }; sira.push('.'); }
                else { if (c === '*') yildiz++; sira.push(c); }
            }
            zemin.push(sira);
        }
        if (!robot) throw new Error('Haritada robot yok');
        return { w, h, zemin, robot, yildiz };
    }

    function dunyaKur(harita) {
        return {
            w: harita.w, h: harita.h,
            zemin: harita.zemin.map(s => s.slice()),
            x: harita.robot.x, y: harita.robot.y, d: harita.robot.d,
            kalan: harita.yildiz
        };
    }

    function yuruNebilir(dunya, x, y) {
        if (x < 0 || y < 0 || x >= dunya.w || y >= dunya.h) return false;
        const c = dunya.zemin[y][x];
        return c === '.' || c === '*';
    }

    function bakis(dunya, donus) {
        const [dx, dy] = YONLER[(dunya.d + donus + 4) % 4];
        return yuruNebilir(dunya, dunya.x + dx, dunya.y + dy);
    }

    // ---------- Sözcükler ----------
    function sozcukle(kaynak) {
        const t = [];
        let i = 0, satir = 1;
        while (i < kaynak.length) {
            const c = kaynak[i];
            if (c === '\n') { satir++; i++; continue; }
            if (/\s/.test(c)) { i++; continue; }
            if (c === '#' || (c === '/' && kaynak[i + 1] === '/')) {
                while (i < kaynak.length && kaynak[i] !== '\n') i++;
                continue;
            }
            if (/[0-9]/.test(c)) {
                let j = i; while (j < kaynak.length && /[0-9]/.test(kaynak[j])) j++;
                t.push({ t: 'sayi', v: parseInt(kaynak.slice(i, j), 10), ham: kaynak.slice(i, j), satir });
                i = j; continue;
            }
            if (/[\p{L}_]/u.test(c)) {
                let j = i; while (j < kaynak.length && /[\p{L}\p{N}_]/u.test(kaynak[j])) j++;
                const ham = kaynak.slice(i, j), v = sadelestir(ham);
                t.push({ t: ANAHTAR.has(v) ? 'anahtar' : 'ad', v, ham, satir });
                i = j; continue;
            }
            if ('(){}'.includes(c)) { t.push({ t: c, v: c, ham: c, satir }); i++; continue; }
            throw new KodHatasi(`Bu karakteri anlayamadım: "${c}"`, satir);
        }
        t.push({ t: 'son', ham: 'kodun sonu', satir });
        return t;
    }

    // ---------- Ayrıştırıcı ----------
    function ayristir(kaynak) {
        const t = sozcukle(kaynak);
        let p = 0;
        const bak = () => t[p];
        const al = () => t[p++];
        const varsa = (tur) => (bak().t === tur ? al() : null);
        function bekle(tur, mesaj) {
            const k = al();
            if (k.t !== tur) throw new KodHatasi(mesaj, k.satir);
            return k;
        }

        function blok(sahip) {
            bekle('{', `"${sahip}" satırından sonra "{" ile bir blok açmalısın.`);
            const govde = [];
            while (bak().t !== '}') {
                if (bak().t === 'son') throw new KodHatasi(`"${sahip}" bloğu kapatılmamış: sona "}" eklemelisin.`, bak().satir);
                govde.push(komut(false));
            }
            al();
            return govde;
        }

        function kosul(sahip) {
            // Esnek yazım: önü_boş, (önü_boş), değil önü_boş, değil(önü_boş()) ...
            let acik = 0, tersi = false;
            while (bak().t === '(') { al(); acik++; }
            if (bak().t === 'anahtar' && bak().v === 'degil') {
                al(); tersi = true;
                while (bak().t === '(') { al(); acik++; }
            }
            const k = al();
            if (k.t !== 'ad' || !KOSULLAR[k.v]) {
                const liste = Object.values(KOSULLAR).join(', ');
                throw new KodHatasi(`"${sahip}" sonrası bir koşul gelmeli: ${liste}`, k.satir);
            }
            if (bak().t === '(' && t[p + 1].t === ')') { al(); al(); }
            for (; acik > 0; acik--) bekle(')', 'Koşuldaki parantezi kapatmalısın: ")"');
            return { tersi, ad: k.v };
        }

        function komut(ustDuzey) {
            const k = al();
            if (k.t === 'anahtar') {
                switch (k.v) {
                    case 'tekrarla': {
                        const parantez = varsa('(');
                        const n = bekle('sayi', '"tekrarla" kelimesinden sonra bir sayı yazmalısın. Örnek: tekrarla 3 { ... }');
                        if (parantez) bekle(')', 'Parantezi kapatmalısın: ")"');
                        return { tur: 'tekrar', n: n.v, govde: blok('tekrarla'), satir: k.satir };
                    }
                    case 'eger': {
                        const c = kosul('eğer');
                        const evet = blok('eğer');
                        let hayir = null;
                        if (bak().t === 'anahtar' && bak().v === 'degilse') {
                            al();
                            hayir = (bak().t === 'anahtar' && bak().v === 'eger') ? [komut(false)] : blok('değilse');
                        }
                        return { tur: 'eger', kosul: c, evet, hayir, satir: k.satir };
                    }
                    case 'iken': {
                        const c = kosul('iken');
                        return { tur: 'iken', kosul: c, govde: blok('iken'), satir: k.satir };
                    }
                    case 'fonksiyon': {
                        if (!ustDuzey) throw new KodHatasi('Fonksiyonlar başka bir bloğun içinde tanımlanamaz.', k.satir);
                        const ad = bekle('ad', 'Fonksiyona bir ad vermelisin. Örnek: fonksiyon zıpla { ... }');
                        if (KOMUTLAR[ad.v]) throw new KodHatasi(`"${ad.ham}" robotun kendi komutu, başka bir ad seç.`, ad.satir);
                        if (varsa('(')) bekle(')', 'Parantezi kapatmalısın: ")"');
                        return { tur: 'tanim', ad: ad.v, ham: ad.ham, govde: blok('fonksiyon ' + ad.ham), satir: k.satir };
                    }
                    case 'degilse':
                        throw new KodHatasi('"değilse" tek başına kullanılamaz, bir "eğer" bloğundan hemen sonra gelmeli.', k.satir);
                    default:
                        throw new KodHatasi(`"${k.ham}" burada kullanılamaz.`, k.satir);
                }
            }
            if (k.t === 'ad') {
                if (KOSULLAR[k.v]) throw new KodHatasi(`"${k.ham}" bir koşul; "eğer" ya da "iken" ile birlikte kullanılır.`, k.satir);
                bekle('(', `Komuttan sonra parantez gelmeli: ${k.ham}()`);
                let arg = null;
                if (bak().t === 'sayi') arg = al().v;
                bekle(')', `Parantezi kapatmayı unuttun: ${k.ham}(${arg ?? ''})`);
                return { tur: 'cagri', ad: k.v, ham: k.ham, arg, satir: k.satir };
            }
            if (k.t === 'son') throw new KodHatasi('Kod beklenmedik şekilde bitti.', k.satir);
            if (k.t === '}') throw new KodHatasi('Fazladan bir "}" var.', k.satir);
            throw new KodHatasi(`"${k.ham}" burada beklenmiyordu.`, k.satir);
        }

        const program = [];
        while (bak().t !== 'son') program.push(komut(true));

        // Fonksiyonları topla ve çağrıları denetle (çalıştırmadan önce hata versin)
        const fonksiyonlar = {};
        for (const k of program) {
            if (k.tur !== 'tanim') continue;
            if (fonksiyonlar[k.ad]) throw new KodHatasi(`"${k.ham}" adında iki fonksiyon var.`, k.satir);
            fonksiyonlar[k.ad] = k;
        }
        (function denetle(liste) {
            for (const k of liste) {
                if (k.tur === 'cagri' && !KOMUTLAR[k.ad] && !fonksiyonlar[k.ad]) {
                    throw new KodHatasi(`"${k.ham}" diye bir komut yok. Kullanabileceklerin: ileri(), sağa(), sola()` +
                        (Object.keys(fonksiyonlar).length ? ' ve kendi fonksiyonların.' : '.'), k.satir);
                }
                if (k.tur === 'cagri' && k.arg !== null && k.ad !== 'ileri') {
                    throw new KodHatasi(`${k.ham}() parantez içine sayı almaz.`, k.satir);
                }
                for (const alt of [k.govde, k.evet, k.hayir]) if (alt) denetle(alt);
            }
        })(program);

        return { program, fonksiyonlar, komutSayisi: say(program) };
    }

    // Kod uzunluğu: her komut, döngü, koşul ve tanım 1 sayılır
    function say(liste) {
        let n = 0;
        for (const k of liste) {
            n += 1;
            for (const alt of [k.govde, k.evet, k.hayir]) if (alt) n += say(alt);
        }
        return n;
    }

    // ---------- Yorumlayıcı ----------
    // Her hareket için bir olay üretir; arayüz bunları animasyonla oynatır.
    function* calistir(derlenmis, dunya) {
        const { program, fonksiyonlar } = derlenmis;
        let adim = 0;

        function sayac(satir) {
            if (++adim > ADIM_SINIRI) throw new KodHatasi('Robot çok uzun süre çalıştı. Sonsuz bir döngü olabilir mi?', satir);
        }

        function kosulDegeri(c) {
            let v;
            switch (c.ad) {
                case 'onu_bos': v = bakis(dunya, 0); break;
                case 'sagi_bos': v = bakis(dunya, 1); break;
                case 'solu_bos': v = bakis(dunya, -1); break;
                case 'yildiz_kaldi': v = dunya.kalan > 0; break;
            }
            return c.tersi ? !v : v;
        }

        function* yurut(liste, derinlik) {
            for (const k of liste) {
                if (dunya.kalan === 0) return;
                sayac(k.satir);
                switch (k.tur) {
                    case 'tanim': break;
                    case 'cagri':
                        if (k.ad === 'ileri') {
                            const n = k.arg ?? 1;
                            for (let i = 0; i < n; i++) {
                                const [dx, dy] = YONLER[dunya.d];
                                const nx = dunya.x + dx, ny = dunya.y + dy;
                                if (!yuruNebilir(dunya, nx, ny)) {
                                    yield { tur: 'carpma', satir: k.satir, x: dunya.x, y: dunya.y, d: dunya.d };
                                    throw new KodHatasi('Robot duvara çarptı! Önünde yol yoktu.', k.satir);
                                }
                                dunya.x = nx; dunya.y = ny;
                                let toplandi = false;
                                if (dunya.zemin[ny][nx] === '*') { dunya.zemin[ny][nx] = '.'; dunya.kalan--; toplandi = true; }
                                yield { tur: 'hareket', satir: k.satir, x: nx, y: ny, d: dunya.d, toplandi };
                                if (dunya.kalan === 0) return;
                                if (i > 0) sayac(k.satir);
                            }
                        } else if (k.ad === 'saga' || k.ad === 'sola') {
                            dunya.d = (dunya.d + (k.ad === 'saga' ? 1 : 3)) % 4;
                            yield { tur: 'donus', satir: k.satir, x: dunya.x, y: dunya.y, d: dunya.d, yon: k.ad };
                        } else {
                            if (derinlik > 40) throw new KodHatasi('Fonksiyonlar birbirini çok fazla çağırdı.', k.satir);
                            yield { tur: 'satir', satir: k.satir };
                            yield* yurut(fonksiyonlar[k.ad].govde, derinlik + 1);
                        }
                        break;
                    case 'tekrar':
                        for (let i = 0; i < k.n; i++) {
                            if (dunya.kalan === 0) return;
                            yield { tur: 'satir', satir: k.satir };
                            yield* yurut(k.govde, derinlik);
                        }
                        break;
                    case 'eger':
                        yield { tur: 'satir', satir: k.satir };
                        if (kosulDegeri(k.kosul)) yield* yurut(k.evet, derinlik);
                        else if (k.hayir) yield* yurut(k.hayir, derinlik);
                        break;
                    case 'iken':
                        while (true) {
                            if (dunya.kalan === 0) return;
                            sayac(k.satir);
                            yield { tur: 'satir', satir: k.satir };
                            if (!kosulDegeri(k.kosul)) break;
                            yield* yurut(k.govde, derinlik);
                        }
                        break;
                }
            }
        }

        yield* yurut(program, 0);
    }

    // Arayüz olmadan tüm kodu çalıştırır (testler için)
    function hizliCalistir(kaynak, haritaSatirlari) {
        const derlenmis = ayristir(kaynak);
        const dunya = dunyaKur(haritaOku(haritaSatirlari));
        try {
            for (const _ of calistir(derlenmis, dunya)) { /* olayları yut */ }
        } catch (e) {
            if (e instanceof KodHatasi) return { basari: false, hata: e.message, satir: e.satir, komutSayisi: derlenmis.komutSayisi };
            throw e;
        }
        return { basari: dunya.kalan === 0, kalan: dunya.kalan, komutSayisi: derlenmis.komutSayisi };
    }

    // Yıldız: hedef komut sayısına göre 1-3 yıldız
    function yildizHesapla(komutSayisi, hedef) {
        if (komutSayisi <= hedef) return 3;
        if (komutSayisi <= Math.ceil(hedef * 1.5) + 1) return 2;
        return 1;
    }

    const api = {
        KodHatasi, ayristir, calistir, haritaOku, dunyaKur, hizliCalistir,
        yildizHesapla, KOMUTLAR, KOSULLAR, YONLER, sadelestir
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.RobotMotor = api;
})(typeof window !== 'undefined' ? window : globalThis);
