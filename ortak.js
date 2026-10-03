// KodLab ortak yardımcılar: tema, ilerleme kaydı, bildirim, konfeti, ses, çevrimdışı çalışma
(function () {
    'use strict';

    try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

    const KL = {
        // İlerleme bu cihazın tarayıcısında saklanır; giriş gerekmez.
        oku(anahtar, varsayilan) {
            try { const v = localStorage.getItem('kodlab.' + anahtar); return v ? JSON.parse(v) : varsayilan; }
            catch (e) { return varsayilan; }
        },
        yaz(anahtar, deger) {
            try { localStorage.setItem('kodlab.' + anahtar, JSON.stringify(deger)); } catch (e) {}
        },
        sil(anahtar) {
            try { localStorage.removeItem('kodlab.' + anahtar); } catch (e) {}
        },

        temaDegistir() {
            const koyu = document.documentElement.dataset.theme
                ? document.documentElement.dataset.theme === 'dark'
                : matchMedia('(prefers-color-scheme: dark)').matches;
            const yeni = koyu ? 'light' : 'dark';
            document.documentElement.dataset.theme = yeni;
            try { localStorage.setItem('theme', yeni); } catch (e) {}
        },

        bildir(mesaj, sure = 2200) {
            let el = document.querySelector('.toast');
            if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
            el.textContent = mesaj;
            el.classList.add('show');
            clearTimeout(el._t);
            el._t = setTimeout(() => el.classList.remove('show'), sure);
        },

        // Kısa ses efektleri (dosya gerekmez, tarayıcıda sentezlenir)
        sesAcik() { return KL.oku('ses', true); },
        ses(tur) {
            if (!KL.sesAcik()) return;
            try {
                const ctx = KL._ctx || (KL._ctx = new (window.AudioContext || window.webkitAudioContext)());
                if (ctx.state === 'suspended') ctx.resume();
                const NOTALAR = {
                    dogru: [[660, 0, .08], [880, .07, .12]],
                    yanlis: [[200, 0, .16, 'square'], [150, .1, .18, 'square']],
                    tik: [[520, 0, .05]],
                    kazan: [[523, 0, .12], [659, .1, .12], [784, .2, .12], [1047, .3, .3]]
                }[tur] || [];
                const t0 = ctx.currentTime;
                for (const [frekans, bas, sure, dalga] of NOTALAR) {
                    const o = ctx.createOscillator(), g = ctx.createGain();
                    o.type = dalga || 'sine'; o.frequency.value = frekans;
                    g.gain.setValueAtTime(0.0001, t0 + bas);
                    g.gain.exponentialRampToValueAtTime(dalga ? 0.05 : 0.14, t0 + bas + 0.01);
                    g.gain.exponentialRampToValueAtTime(0.0001, t0 + bas + sure);
                    o.connect(g).connect(ctx.destination);
                    o.start(t0 + bas); o.stop(t0 + bas + sure + 0.02);
                }
            } catch (e) {}
        },

        konfeti(adet = 70) {
            KL.ses('kazan');
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const renkler = ['#1d5fd6', '#f2b01e', '#16a36a', '#e5484d', '#8b5cf6', '#06b6d4'];
            for (let i = 0; i < adet; i++) {
                const p = document.createElement('div');
                p.className = 'confetti';
                p.style.left = Math.random() * 100 + 'vw';
                p.style.background = renkler[i % renkler.length];
                p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
                p.style.animationDelay = Math.random() * 0.4 + 's';
                p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 4000);
            }
        },

        yildizHTML(n, toplam = 3) {
            let s = '<span class="stars" aria-label="' + n + ' yıldız">';
            for (let i = 0; i < toplam; i++) s += '<i class="fas fa-star' + (i < n ? ' on' : '') + '"></i>';
            return s + '</span>';
        },

        rastgele(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
        sec(dizi) { return dizi[Math.floor(Math.random() * dizi.length)]; },
        karistir(dizi) {
            const d = dizi.slice();
            for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
            return d;
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const b = document.getElementById('themeBtn');
        if (b) {
            b.addEventListener('click', KL.temaDegistir);
            // Her sayfanın üst barına ses ve profil düğmeleri
            const ses = document.createElement('button');
            ses.className = 'icon-btn'; ses.id = 'sesBtn';
            const ciz = () => {
                ses.innerHTML = `<i class="fas fa-volume-${KL.sesAcik() ? 'high' : 'xmark'}"></i>`;
                ses.setAttribute('aria-label', KL.sesAcik() ? 'Sesi kapat' : 'Sesi aç');
            };
            ciz();
            ses.addEventListener('click', () => { KL.yaz('ses', !KL.sesAcik()); ciz(); KL.ses('dogru'); });
            b.before(ses);
            if (!/profil\.html$/.test(location.pathname)) {
                const p = document.createElement('a');
                p.className = 'icon-btn'; p.href = 'profil.html'; p.setAttribute('aria-label', 'Profilim');
                const ad = KL.oku('profil', {}).ad;
                if (ad) {
                    const h = document.createElement('span');
                    h.style.cssText = 'font-weight:800;font-family:var(--display)';
                    h.textContent = ad.trim()[0].toLocaleUpperCase('tr');
                    p.appendChild(h);
                } else p.innerHTML = '<i class="fas fa-user"></i>';
                p.title = ad ? ad + ' — Profilim' : 'Profilim';
                b.before(p);
            }
        }
    });

    // Çevrimdışı çalışma: sayfalar ilk ziyarette önbelleğe alınır, internet kesilse de açılır
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }

    window.KL = KL;
})();
