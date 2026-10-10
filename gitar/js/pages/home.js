import { Fretboard } from '../fretboard.js';
import { playPos } from '../audio.js';
import { pcAt, isNatural, bothNames, midiAt, octaveOf } from '../theory.js';
import { store, streak, practicedThisWeek, onSettings } from '../state.js';
import { LESSONS } from '../data/lessons.js';
import { SONGS } from '../data/songs.js';
import { icon } from '../ui.js';

const SECTIONS = [
    { href: '#klavye', name: 'Klavye haritası', text: 'Bütün notalar, doğal notalar ya da tek bir notanın her yeri. Dokun, dinle.', meta: '6 tel · 24 perdeye kadar' },
    { href: '#dersler', name: 'Dersler', text: 'Tellerin adından bare akora adım adım bir yol.', meta: `${LESSONS.length} ders` },
    { href: '#alistirma', name: 'Nota avı', text: 'Notayı adlandır, perdeyi bul, hepsini bul. Zayıf noktaların ısı haritasında.', meta: '3 oyun · 60 sn sprint' },
    { href: '#pozisyonlar', name: 'Pozisyonlar', text: 'Doğal notalar, majör, minör, pentatonik ve blues; pozisyon pozisyon.', meta: '8 dizi · 12 ton' },
    { href: '#akorlar', name: 'Akorlar', text: 'Açık akorlar, E ve A formu bare, power chord, geçiş antrenmanı.', meta: '32 açık akor · her tonda bare' },
    { href: '#sarkilar', name: 'Şarkılar', text: 'Tab\'lı melodiler, akorlu şarkılar ve senin eklediklerin.', meta: `${SONGS.length} hazır parça` },
    { href: '#araclar', name: 'Akort ve metronom', text: 'Mikrofonla akort, vurgulu metronom ve hız antrenörü.', meta: 'Mikrofon gerekir' }
];

const ROUTINE = [
    ['3 dk', 'Akort ve ısınma', 'Akort et, sonra Örümcek Isınması\'nı yavaş çal.', '#sarki-orumcek'],
    ['4 dk', 'Nota avı', 'Bir tel seç ve 60 saniyelik sprint yap.', '#alistirma'],
    ['4 dk', 'Pozisyon', 'Bir diziyi bir pozisyonda yukarı-aşağı çal.', '#pozisyonlar'],
    ['4 dk', 'Akor ve şarkı', 'Bir dakika geçiş, sonra bir şarkı.', '#akorlar']
];

export default {
    title: '',
    mount(root) {
        const done = LESSONS.filter(l => store.lessons[l.id]).length;
        const next = LESSONS.find(l => !store.lessons[l.id]);
        const bestStreak = Math.max(0, ...Object.values(store.quiz.best).map(b => b.streak || 0));
        const days = streak();
        const week = practicedThisWeek();

        root.innerHTML = `
        <section class="hero">
            <div class="hero-text">
                <p class="kicker">Elektro gitar atölyesi</p>
                <h1>Klavyede kaybolma.</h1>
                <p class="lede">Notaları, pozisyonları ve bare akorları dinleyerek, dokunarak öğren. Sonra şarkılarla pekiştir. Ücretsiz, kurulum yok, telefonda da çalışır.</p>
                <div class="row-actions">
                    <a class="btn btn-primary" href="#ders-${next ? next.id : '1'}">${next && done ? 'Kaldığın dersten devam et' : 'Derslere başla'} ${icon('arrow')}</a>
                    <a class="btn" href="#alistirma">Nota avına çık</a>
                </div>
            </div>
            <div class="hero-status" aria-label="İlerleme">
                <div class="stat">
                    <span class="stat-k">Çalışma serisi</span>
                    <span class="stat-v">${days}<small> gün</small></span>
                    <span class="week">${week.map(d => `<i class="${d.done ? 'on' : ''}" title="${d.name}"><b>${d.day}</b></i>`).join('')}</span>
                </div>
                <div class="stat">
                    <span class="stat-k">Dersler</span>
                    <span class="stat-v">${done}<small> / ${LESSONS.length}</small></span>
                    <span class="meter"><i style="width:${Math.round(done / LESSONS.length * 100)}%"></i></span>
                </div>
                <div class="stat">
                    <span class="stat-k">Nota avı en iyi seri</span>
                    <span class="stat-v">${bestStreak}</span>
                    <span class="stat-note">${bestStreak ? 'üst üste doğru' : 'henüz oynamadın'}</span>
                </div>
            </div>
        </section>

        <section class="stage" aria-label="Doğal notalar">
            <div class="stage-head">
                <p class="kicker">Doğal notalar · 0–12. perde</p>
                <p class="readout" id="homeReadout" aria-live="polite">Bir notaya dokun: sesini duy, adını gör.</p>
            </div>
            <div id="homeBoard"></div>
        </section>

        <section class="block">
            <h2 class="h2">Bölümler</h2>
            <div class="cards">
                ${SECTIONS.map(s => `
                <a class="card" href="${s.href}">
                    <span class="card-meta">${s.meta}</span>
                    <strong>${s.name}</strong>
                    <span>${s.text}</span>
                </a>`).join('')}
            </div>
        </section>

        <section class="block">
            <h2 class="h2">Günde 15 dakika</h2>
            <p class="lede-sm">Uzun ve seyrek değil, kısa ve her gün. Önerilen sıra:</p>
            <ol class="routine">
                ${ROUTINE.map(([t, name, text, href]) => `
                <li><a href="${href}"><span class="r-time">${t}</span><strong>${name}</strong><span>${text}</span></a></li>`).join('')}
            </ol>
        </section>`;

        const readout = root.querySelector('#homeReadout');
        const fb = new Fretboard(root.querySelector('#homeBoard'), {
            frets: 12,
            label: 'Doğal notaların gösterildiği klavye',
            onTap(s, f) {
                playPos(s, f);
                const pc = pcAt(s, f);
                fb.flash({ s, f, note: true, kind: isNatural(pc) ? 'hot' : 'ghost' }, 700);
                readout.innerHTML = `<b>${bothNames(pc)}</b> <span>${s}. tel · ${f === 0 ? 'boş' : f + '. perde'} · ${bothNames(pc).split(' · ')[0]}${octaveOf(midiAt(s, f))}</span>`;
            }
        });
        const paint = () => {
            const ms = [];
            for (let s = 1; s <= 6; s++) for (let f = 0; f <= 12; f++) if (isNatural(pcAt(s, f))) ms.push({ s, f, note: true, kind: pcAt(s, f) === 0 ? 'root' : 'note' });
            fb.setMarkers(ms);
        };
        paint();
        const off = onSettings(paint);
        return () => { off(); fb.destroy(); };
    }
};
