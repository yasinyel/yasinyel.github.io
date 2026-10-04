// Kodlayalım — Robot Kodla bölüm tasarlayıcı: tasarımı linke çevirir, linkten geri okur ve doğrular
// Harita karakterleri robot-seviyeler.js ile aynı: '.' zemin, '*' yıldız, '#' duvar, ' ' boşluk, ^ > v < robot
(function (root) {
    'use strict';
    const EN_FAZLA = { w: 12, h: 10 };
    const b64 = (s) => (typeof btoa !== 'undefined' ? btoa(String.fromCharCode(...new TextEncoder().encode(s))) : Buffer.from(s, 'utf8').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64coz = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); return typeof atob !== 'undefined' ? new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))) : Buffer.from(s, 'base64').toString('utf8'); };

    // Haritanın sağındaki ve altındaki boşlukları kırpar
    function kirp(satirlar) {
        let l = satirlar.map(s => s.replace(/\s+$/, ''));
        while (l.length && !l[l.length - 1]) l.pop();
        while (l.length && !l[0].trim()) l.shift();
        const sol = Math.min(...l.filter(s => s.trim()).map(s => s.length - s.trimStart().length));
        return l.map(s => s.slice(sol));
    }

    // Tasarımın sorunlarını Türkçe listeler; boş liste = oynanabilir
    function dogrula(t) {
        const sorun = [];
        const h = t.harita || [];
        const w = Math.max(0, ...h.map(s => s.length));
        if (!h.length || h.length > EN_FAZLA.h || w > EN_FAZLA.w) sorun.push(`Harita en fazla ${EN_FAZLA.w} × ${EN_FAZLA.h} kare olabilir.`);
        const robotlar = [], yildizlar = [];
        h.forEach((s, y) => [...s].forEach((c, x) => { if ('^>v<'.includes(c)) robotlar.push([x, y]); if (c === '*') yildizlar.push([x, y]); }));
        if (robotlar.length !== 1) sorun.push(robotlar.length ? 'Haritada yalnızca bir robot olmalı.' : 'Haritaya robotu yerleştir.');
        if (!yildizlar.length) sorun.push('En az bir yıldız koy.');
        if (robotlar.length === 1 && yildizlar.length) {
            const yuru = (x, y) => y >= 0 && y < h.length && x >= 0 && x < (h[y] || '').length && '.*^>v<'.includes(h[y][x]);
            const gor = new Set([robotlar[0].join()]), kuyruk = [robotlar[0]];
            while (kuyruk.length) {
                const [x, y] = kuyruk.shift();
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = [x + dx, y + dy]; if (yuru(...k) && !gor.has(k.join())) { gor.add(k.join()); kuyruk.push(k); } }
            }
            const ulasilmaz = yildizlar.filter(p => !gor.has(p.join())).length;
            if (ulasilmaz) sorun.push(`${ulasilmaz} yıldıza robot ulaşamıyor; aradaki yolu zeminle birleştir.`);
        }
        if (!(t.hedef >= 1 && t.hedef <= 99)) sorun.push('3 yıldız için komut sayısı 1 ile 99 arasında olmalı.');
        if (String(t.baslik || '').length > 40) sorun.push('Başlık en fazla 40 karakter olabilir.');
        return sorun;
    }

    function kodla(t) {
        return b64(JSON.stringify({ v: 1, b: String(t.baslik || '').slice(0, 40), a: String(t.yazar || '').slice(0, 30), n: String(t.not || '').slice(0, 160), h: kirp(t.harita).join('|'), z: t.hedef }));
    }
    function coz(kod) {
        try {
            const v = JSON.parse(b64coz(String(kod)));
            if (v.v !== 1 || typeof v.h !== 'string') return null;
            const t = { baslik: String(v.b || ''), yazar: String(v.a || ''), not: String(v.n || ''), harita: v.h.split('|').map(s => s.replace(/[^.*# ^>v<]/g, ' ')), hedef: +v.z };
            return dogrula(t).length ? null : t;
        } catch (e) { return null; }
    }
    // Robot Kodla'nın bölüm biçimine çevirir (metinler kaçışlanır)
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    function seviye(t) {
        return {
            baslik: t.baslik || 'Arkadaşımın Bölümü', konu: t.yazar ? `${t.yazar} tasarladı` : 'Tasarlanmış bölüm',
            anlatim: (t.not ? kacis(t.not) + '<br>' : '') + 'Bu bölümü bir arkadaşın tasarladı. Bütün yıldızları topla! Bütün komutlar açık.',
            haritalar: [t.harita], hedef: t.hedef, ozel: true
        };
    }
    const api = { EN_FAZLA, kirp, dogrula, kodla, coz, seviye };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.RobotTasarim = api;
})(typeof window !== 'undefined' ? window : globalThis);
