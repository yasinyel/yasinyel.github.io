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

        // ---------- İpucu Asistanı ----------
        // Üç basamaklı yardım: 1) düşündüren soru (yıldız düşmez), 2) ipucu (en fazla 2 yıldız), 3) örnek çözüm (en fazla 1 yıldız).
        // ayar: { etkinlik, bolum, yer: düğmenin ekleneceği öğe, basamaklar: [metin, metin, { metin, uygula?, uygulaYazi? }] }
        // Kullanım kaydı 'ipucu' anahtarında tutulur (öğretmen raporu için).
        ipucu(ayar) {
            const BASLIK = ['Düşün', 'İpucu', 'Örnek çözüm'], IKON = ['fa-circle-question', 'fa-lightbulb', 'fa-key'];
            const NOT = ['', 'Bu ipucunu açarsan bu denemede en fazla 2 yıldız alırsın.', 'Çözümü görürsen bu denemede en fazla 1 yıldız alırsın. Önce bir kez daha denemek ister misin?'];
            const basamak = (ayar.basamaklar || []).filter(Boolean).map(b => typeof b === 'string' ? { metin: b } : b);
            let acik = 0, yanlis = 0, durtuldu = false;
            const eski = ayar.yer.querySelector('.kl-ipucu'); if (eski) eski.remove();
            const kok = document.createElement('div'); kok.className = 'kl-ipucu';
            kok.innerHTML = `<button type="button" class="btn kl-ipucu-btn" aria-expanded="false"><i class="fas fa-lightbulb"></i> İpucu <span class="kl-ipucu-say"></span></button>
                <div class="kl-ipucu-balon" hidden>Takıldın mı? Bir ipucu ister misin? <button type="button" class="kl-ipucu-kapat" aria-label="Kapat">×</button></div>
                <div class="kl-ipucu-panel" hidden role="dialog" aria-label="İpucu Asistanı"><div class="kl-ipucu-ust"><span class="kl-logo" aria-hidden="true"></span><b>Kodi yardıma geldi</b><button type="button" class="kl-ipucu-kapat" aria-label="Kapat">×</button></div><div class="kl-ipucu-icerik"></div></div>`;
            ayar.yer.appendChild(kok);
            const $ = (s) => kok.querySelector(s);
            const kaydet = () => {
                const k = KL.oku('ipucu', {});
                const e = k[ayar.etkinlik] || (k[ayar.etkinlik] = {});
                e[ayar.bolum] = Math.max(e[ayar.bolum] || 0, acik);
                KL.yaz('ipucu', k);
            };
            const ciz = () => {
                $('.kl-ipucu-say').textContent = basamak.length ? `${acik}/${basamak.length}` : '';
                let h = basamak.slice(0, acik).map((b, i) => ({ ...b, metin: typeof b.metin === 'function' ? b.metin() : b.metin })).map((b, i) => `<div class="kl-ipucu-adim a${i}" data-seslendir="${String(b.metin).replace(/<[^>]+>/g, ' ').replace(/"/g, '&quot;')}"><div class="kl-ipucu-etiket"><i class="fas ${IKON[i]}"></i> ${BASLIK[i]}</div><div>${b.metin}</div>${b.uygula ? `<button type="button" class="btn btn-sm kl-ipucu-uygula" data-i="${i}"><i class="fas fa-wand-magic-sparkles"></i> ${b.uygulaYazi || 'Çözümü yükle'}</button>` : ''}</div>`).join('');
                if (acik < basamak.length) h += `<div class="kl-ipucu-sonraki">${NOT[acik] ? `<small>${NOT[acik]}</small>` : ''}<button type="button" class="btn btn-sm ${acik ? '' : 'btn-primary'} kl-ipucu-ac"><i class="fas ${IKON[acik]}"></i> ${acik ? (acik === 1 ? 'Daha fazla ipucu' : 'Örnek çözümü göster') : 'İlk ipucunu göster'}</button></div>`;
                else h += '<p class="kl-ipucu-son">Çözümü anladıktan sonra kendin yazmayı dene; bir dahaki sefere ipucusuz 3 yıldız alabilirsin!</p>';
                $('.kl-ipucu-icerik').innerHTML = h;
            };
            const panelAc = (ac) => {
                $('.kl-ipucu-panel').hidden = !ac; $('.kl-ipucu-btn').setAttribute('aria-expanded', ac);
                if (ac) { $('.kl-ipucu-balon').hidden = true; ciz(); }
            };
            $('.kl-ipucu-btn').onclick = () => panelAc($('.kl-ipucu-panel').hidden);
            kok.querySelectorAll('.kl-ipucu-kapat').forEach(b => { b.onclick = () => { panelAc(false); $('.kl-ipucu-balon').hidden = true; }; });
            $('.kl-ipucu-icerik').addEventListener('click', (e) => {
                if (e.target.closest('.kl-ipucu-ac')) { acik = Math.min(basamak.length, acik + 1); kaydet(); ciz(); KL.ses('tik'); if (ayar.acilinca) ayar.acilinca(acik); }
                const u = e.target.closest('.kl-ipucu-uygula');
                if (u) { const b = basamak[+u.dataset.i]; if (b.uygula) { b.uygula(); panelAc(false); const m = b.bildiri ?? 'Örnek çözüm yüklendi. Çalıştırıp nasıl çalıştığını incele.'; if (m) KL.bildir(m); } }
            });
            ciz();
            return {
                // Açılan basamak sayısı ve buna göre bu denemede alınabilecek en fazla yıldız
                acik: () => acik,
                yildizSiniri: () => (acik >= 3 ? 1 : acik >= 2 ? 2 : 3),
                // Yanlış denemeleri bildir: 2. yanlıştan sonra düğme dikkat çeker ve bir kez öneri balonu çıkar
                yanlis() {
                    yanlis++;
                    if (yanlis >= 2 && acik < basamak.length) {
                        $('.kl-ipucu-btn').classList.add('dikkat');
                        if (!durtuldu && $('.kl-ipucu-panel').hidden) { durtuldu = true; $('.kl-ipucu-balon').hidden = false; }
                    }
                },
                kaldir() { kok.remove(); }
            };
        },
        // Bütün etkinliklerde açılan ipucu basamaklarının toplamı (öğretmen raporu için)
        ipucuOzeti() {
            const k = KL.oku('ipucu', {}), o = {};
            for (const [e, b] of Object.entries(k)) { const v = Object.values(b); if (v.length) o[e] = [v.filter(x => x >= 1).length, v.filter(x => x >= 3).length]; }
            return o;
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
            f.innerHTML = '<div class="wrap"><span><span class="kl-logo" aria-hidden="true"></span><span><b>Kodlayalım</b> · Anasınıfından liseye bilişim etkinlikleri</span></span><span>Tasarım ve geliştirme: <a href="https://yasinyel.com" rel="author">Yasin Yel</a></span></div>';
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
