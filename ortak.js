// KodLab ortak yardımcılar: tema, ilerleme kaydı, bildirim, konfeti
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

        konfeti(adet = 70) {
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
        if (b) b.addEventListener('click', KL.temaDegistir);
    });

    window.KL = KL;
})();
