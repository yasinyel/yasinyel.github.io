// Kodlayalım ortak yardımcılar: tema, ilerleme kaydı, bildirim, konfeti, ses, çevrimdışı çalışma
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

        // ---------- Sesli yönerge (tarayıcının Türkçe metin okuma özelliği) ----------
        seslendirmeVar() { return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; },
        seslendir(metin) {
            if (!KL.seslendirmeVar() || !metin) return false;
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(metin).replace(/\s+/g, ' ').trim());
            u.lang = 'tr-TR'; u.rate = 0.95;
            const ses = speechSynthesis.getVoices().find(v => /^tr/i.test(v.lang));
            if (ses) u.voice = ses;
            speechSynthesis.speak(u);
            return true;
        },
        // Sayfadaki görünür yönergeyi bulur: önce data-seslendir, sonra bilinen yönerge alanları
        yonergeMetni() {
            const gorunur = (e) => e.getClientRects().length > 0 && !e.closest('[hidden], dialog:not([open])');
            const SECICILER = ['dialog[open] [data-seslendir]', 'dialog[open] p', '[data-seslendir]', '#anlatim', '.anlatim', '#lesson', '#goal', '#taskQ', '#gorev', '#adim', '.soru', '.gorev-kart p', '#msg', '.intro p', 'h1 + p'];
            for (const s of SECICILER) for (const e of document.querySelectorAll(s)) {
                if (!gorunur(e)) continue;
                const t = (e.dataset.seslendir || e.innerText || '').trim();
                if (t) return t;
            }
            return '';
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
        // Her sayfanın altına imza (sayfa kendi imzasını taşımıyorsa)
        if (!document.querySelector('.kl-imza') && !document.body.hasAttribute('data-imzasiz')) {
            const f = document.createElement('footer');
            f.className = 'kl-imza';
            f.innerHTML = '<div class="wrap"><span><span class="kl-logo" aria-hidden="true"></span><span><b>Kodlayalım</b> · Bilişim Teknolojileri için ücretsiz etkinlikler</span></span><span>Tasarım ve geliştirme: <a href="https://yasinyel.com" rel="author">Yasin Yel</a></span></div>';
            document.body.appendChild(f);
        }
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
            if (KL.seslendirmeVar()) sesliYonergeKur(ses);
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

    // Üst bara "yönergeyi dinle" düğmesi ve otomatik okuma
    function sesliYonergeKur(once) {
        const d = document.createElement('button');
        d.className = 'icon-btn'; d.id = 'dinleBtn';
        d.setAttribute('aria-label', 'Yönergeyi sesli dinle'); d.title = 'Yönergeyi sesli dinle';
        d.setAttribute('aria-haspopup', 'true');
        d.innerHTML = '<i class="fas fa-ear-listen"></i>';
        const menu = document.createElement('div');
        menu.className = 'kl-menu'; menu.hidden = true;
        menu.innerHTML = '<button data-m="oku"><i class="fas fa-play"></i> Yönergeyi şimdi oku</button><label><input type="checkbox" data-m="oto"> Yeni yönergeleri kendiliğinden oku</label>';
        once.before(d);
        document.body.appendChild(menu);
        const oto = menu.querySelector('[data-m="oto"]');
        oto.checked = !!KL.oku('sesliYonerge', false);
        const konumla = () => { const r = d.getBoundingClientRect(); menu.style.top = (r.bottom + 6 + window.scrollY) + 'px'; menu.style.left = Math.max(8, Math.min(r.right - 260, innerWidth - 268)) + 'px'; };
        d.addEventListener('click', (e) => { e.stopPropagation(); if (speechSynthesis.speaking) { speechSynthesis.cancel(); menu.hidden = true; return; } konumla(); menu.hidden = !menu.hidden; });
        document.addEventListener('click', (e) => { if (!menu.contains(e.target)) menu.hidden = true; });
        let son = '';
        menu.querySelector('[data-m="oku"]').addEventListener('click', () => {
            menu.hidden = true;
            son = KL.yonergeMetni();
            if (!KL.seslendir(son || 'Bu ekranda okunacak bir yönerge yok.')) KL.bildir('Tarayıcın sesli okumayı desteklemiyor.');
        });
        oto.addEventListener('change', () => { KL.yaz('sesliYonerge', oto.checked); if (oto.checked) { son = ''; kontrol(); } else speechSynthesis.cancel(); });
        // Otomatik okuma: sayfa içeriği değişip yeni bir yönerge görünür olunca okunur
        let zaman = null;
        const kontrol = () => {
            if (!KL.oku('sesliYonerge', false)) return;
            const t = KL.yonergeMetni();
            if (t && t !== son) { son = t; KL.seslendir(t); }
        };
        new MutationObserver(() => { clearTimeout(zaman); zaman = setTimeout(kontrol, 700); }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open'] });
        setTimeout(kontrol, 900);
    }

    // Çevrimdışı çalışma: sayfalar ilk ziyarette önbelleğe alınır, internet kesilse de açılır
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }

    window.KL = KL;
})();
