// Kodlayalım — bağımsız QR kod üretici (bayt kipi, hata düzeltme M, sürüm 1–40)
// Dış kütüphane gerektirmez; böylece çevrimdışı da çalışır.
(function (root) {
    'use strict';

    // Sürüm başına blok başına hata düzeltme kod sözcüğü ve blok sayısı (sıra: L, M, Q, H)
    const ECC_SOZCUK = [
        [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
    ];
    const BLOK_SAYISI = [
        [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
    ];
    const FORMAT_BITLERI = [1, 0, 3, 2]; // L, M, Q, H
    const SEVIYE = 1; // M: %15 hata düzeltme

    const bit = (x, i) => ((x >>> i) & 1) !== 0;

    function hamModulSayisi(v) {
        let n = (16 * v + 128) * v + 64;
        if (v >= 2) { const a = Math.floor(v / 7) + 2; n -= (25 * a - 10) * a - 55; if (v >= 7) n -= 36; }
        return n;
    }
    const veriSozcukSayisi = (v) => Math.floor(hamModulSayisi(v) / 8) - ECC_SOZCUK[SEVIYE][v] * BLOK_SAYISI[SEVIYE][v];

    // GF(2^8) çarpma ve Reed-Solomon
    function carp(x, y) {
        let z = 0;
        for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
        return z;
    }
    function rsBolen(derece) {
        const r = new Array(derece).fill(0); r[derece - 1] = 1;
        let kok = 1;
        for (let i = 0; i < derece; i++) {
            for (let j = 0; j < r.length; j++) { r[j] = carp(r[j], kok); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
            kok = carp(kok, 0x02);
        }
        return r;
    }
    function rsKalan(veri, bolen) {
        const r = new Array(bolen.length).fill(0);
        for (const b of veri) {
            const f = b ^ r.shift(); r.push(0);
            bolen.forEach((c, i) => { r[i] ^= carp(c, f); });
        }
        return r;
    }

    function olustur(metin, zorlaMaske) {
        const baytlar = [...new TextEncoder().encode(metin)];
        // En küçük uygun sürümü bul
        let v, sayiBit;
        for (v = 1; v <= 40; v++) {
            sayiBit = v <= 9 ? 8 : 16;
            if (4 + sayiBit + baytlar.length * 8 <= veriSozcukSayisi(v) * 8) break;
        }
        if (v > 40) throw new Error('Metin QR kod için çok uzun');

        // Bit dizisi
        const bitler = [];
        const ekle = (deger, uzunluk) => { for (let i = uzunluk - 1; i >= 0; i--) bitler.push((deger >>> i) & 1); };
        ekle(0b0100, 4); ekle(baytlar.length, sayiBit);
        baytlar.forEach(b => ekle(b, 8));
        const kapasite = veriSozcukSayisi(v) * 8;
        ekle(0, Math.min(4, kapasite - bitler.length));
        ekle(0, (8 - bitler.length % 8) % 8);
        for (let p = 0xEC; bitler.length < kapasite; p ^= 0xEC ^ 0x11) ekle(p, 8);
        const veri = [];
        for (let i = 0; i < bitler.length; i += 8) veri.push(bitler.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

        // Bloklara böl, hata düzeltme ekle, iç içe geçir
        const blokSay = BLOK_SAYISI[SEVIYE][v], eccUz = ECC_SOZCUK[SEVIYE][v];
        const hamSozcuk = Math.floor(hamModulSayisi(v) / 8);
        const kisaBlok = blokSay - hamSozcuk % blokSay, kisaUz = Math.floor(hamSozcuk / blokSay);
        const bolen = rsBolen(eccUz);
        const bloklar = [];
        for (let i = 0, k = 0; i < blokSay; i++) {
            const d = veri.slice(k, k + kisaUz - eccUz + (i < kisaBlok ? 0 : 1));
            k += d.length;
            const ecc = rsKalan(d, bolen);
            if (i < kisaBlok) d.push(0);
            bloklar.push(d.concat(ecc));
        }
        const sozcukler = [];
        for (let i = 0; i < bloklar[0].length; i++)
            bloklar.forEach((b, j) => { if (i !== kisaUz - eccUz || j >= kisaBlok) sozcukler.push(b[i]); });

        // Matris
        const n = v * 4 + 17;
        const m = Array.from({ length: n }, () => new Array(n).fill(false));
        const fonk = Array.from({ length: n }, () => new Array(n).fill(false));
        const koy = (x, y, d) => { m[y][x] = d; fonk[y][x] = true; };

        for (let i = 0; i < n; i++) { koy(6, i, i % 2 === 0); koy(i, 6, i % 2 === 0); }
        const bulucu = (x, y) => {
            for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
                const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy;
                if (xx >= 0 && xx < n && yy >= 0 && yy < n) koy(xx, yy, d !== 2 && d !== 4);
            }
        };
        bulucu(3, 3); bulucu(n - 4, 3); bulucu(3, n - 4);
        if (v > 1) {
            const sayi = Math.floor(v / 7) + 2;
            const adim = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (sayi * 2 - 2)) * 2;
            const konum = [6];
            for (let p = n - 7; konum.length < sayi; p -= adim) konum.splice(1, 0, p);
            const son = konum.length - 1;
            konum.forEach((a, i) => konum.forEach((b, j) => {
                if ((i === 0 && j === 0) || (i === 0 && j === son) || (i === son && j === 0)) return;
                for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) koy(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
            }));
        }
        const formatCiz = (maske) => {
            const d = FORMAT_BITLERI[SEVIYE] << 3 | maske;
            let r = d;
            for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
            const b = (d << 10 | r) ^ 0x5412;
            for (let i = 0; i <= 5; i++) koy(8, i, bit(b, i));
            koy(8, 7, bit(b, 6)); koy(8, 8, bit(b, 7)); koy(7, 8, bit(b, 8));
            for (let i = 9; i < 15; i++) koy(14 - i, 8, bit(b, i));
            for (let i = 0; i < 8; i++) koy(n - 1 - i, 8, bit(b, i));
            for (let i = 8; i < 15; i++) koy(8, n - 15 + i, bit(b, i));
            koy(8, n - 8, true);
        };
        formatCiz(0);
        if (v >= 7) {
            let r = v;
            for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
            const b = v << 12 | r;
            for (let i = 0; i < 18; i++) { const a = n - 11 + i % 3, c = Math.floor(i / 3); koy(a, c, bit(b, i)); koy(c, a, bit(b, i)); }
        }

        // Veriyi zigzag yerleştir
        let i = 0;
        for (let sag = n - 1; sag >= 1; sag -= 2) {
            if (sag === 6) sag = 5;
            for (let dik = 0; dik < n; dik++) for (let j = 0; j < 2; j++) {
                const x = sag - j, yukari = ((sag + 1) & 2) === 0, y = yukari ? n - 1 - dik : dik;
                if (!fonk[y][x] && i < sozcukler.length * 8) { m[y][x] = bit(sozcukler[i >>> 3], 7 - (i & 7)); i++; }
            }
        }

        // Maske: en düşük cezalıyı seç
        const MASKE = [
            (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
            (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
            (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0
        ];
        const uygula = (k) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fonk[y][x] && MASKE[k](x, y)) m[y][x] = !m[y][x]; };
        const ceza = () => {
            let p = 0, koyu = 0;
            for (let y = 0; y < n; y++) {
                let sx = 1, sy = 1;
                for (let x = 0; x < n; x++) {
                    if (m[y][x]) koyu++;
                    if (x > 0) {
                        if (m[y][x] === m[y][x - 1]) { sx++; if (sx === 5) p += 3; else if (sx > 5) p++; } else sx = 1;
                        if (m[x][y] === m[x - 1][y]) { sy++; if (sy === 5) p += 3; else if (sy > 5) p++; } else sy = 1;
                    }
                    if (x > 0 && y > 0 && m[y][x] === m[y][x - 1] && m[y][x] === m[y - 1][x] && m[y][x] === m[y - 1][x - 1]) p += 3;
                }
            }
            return p + Math.floor(Math.abs(koyu * 20 - n * n * 10) / (n * n)) * 10;
        };
        let enIyi = 0, enAz = Infinity;
        for (let k = 0; k < 8; k++) {
            uygula(k); formatCiz(k);
            const c = ceza();
            if (c < enAz) { enAz = c; enIyi = k; }
            uygula(k);
        }
        if (zorlaMaske !== undefined) enIyi = zorlaMaske;
        uygula(enIyi); formatCiz(enIyi);
        return m;
    }

    // SVG olarak çiz (4 modül sessiz alan)
    function svg(metin, boyut = 220) {
        const m = olustur(metin), n = m.length, s = n + 8;
        let yol = '';
        m.forEach((sira, y) => sira.forEach((d, x) => { if (d) yol += `M${x + 4},${y + 4}h1v1h-1z`; }));
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${boyut}" height="${boyut}" shape-rendering="crispEdges" role="img" aria-label="QR kod"><rect width="${s}" height="${s}" fill="#fff"/><path d="${yol}" fill="#000"/></svg>`;
    }

    const api = { olustur, svg };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.QR = api;
})(typeof window !== 'undefined' ? window : globalThis);
