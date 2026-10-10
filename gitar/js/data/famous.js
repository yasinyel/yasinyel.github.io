// Ünlü şarkılar için çalışma rehberleri.
// Bu şarkıların söz ve tabları telifli olduğu için burada yalnızca ton, akor adları, teknikler
// ve hazırlık önerileri var. Tabın kendisi için lisanslı kaynaklara bağlantı verilir.
// chords: şarkıda geçen başlıca akorlar (tam liste değil)

export const FAMOUS = [
    {
        id: 'nothing-else-matters', title: 'Nothing Else Matters', artist: 'Metallica', year: 1991,
        level: 2, key: 'Em', time: '6/8',
        chords: ['Em', 'D', 'C', 'A', 'G', 'B7'],
        techniques: ['Boş tellerle arpej', 'Kalın tele bas notası, ince tellerde tekrarlanan desen', 'Yavaş 6/8 hissi'],
        prep: [['Rising Sun Arpejleri', '#sarki-rising-sun'], ['İnen Bas Arpeji', '#sarki-inen-bas'], ['Ders 12: Akor geçişleri', '#ders-12']],
        notes: 'Girişteki arpej Em akorunun boş telleri üzerine kurulu. Önce akorları tıngırdatarak şarkının iskeletini öğren, sonra arpeje geç. Sağ elde pena ya da parmak, ikisi de olur.'
    },
    {
        id: 'enter-sandman', title: 'Enter Sandman', artist: 'Metallica', year: 1991,
        level: 2, key: 'Em', time: '4/4',
        chords: ['E5', 'G5', 'A5'],
        techniques: ['6. telde palm mute', 'Power chord', 'Aşağı vuruşla (downpicking) ritim'],
        prep: [['Garaj Rifi', '#sarki-garaj-rifi'], ['Dörtnala Ritim', '#sarki-dortnala'], ['Ders 9: Power chord', '#ders-9']],
        notes: 'Rif kalın E teli ve onun oktavı etrafında döner. Sağ el avucunu köprüye yasla, her notayı aşağı vuruşla çal. Distorsiyonu aç.'
    },
    {
        id: 'master-of-puppets', title: 'Master of Puppets', artist: 'Metallica', year: 1986,
        level: 3, key: 'Em', time: '4/4',
        chords: ['E5', 'D5', 'C5'],
        techniques: ['Hızlı downpicking', 'Dörtnala (gallop) ritim', 'Kromatik inen power chordlar'],
        prep: [['Dörtnala Ritim', '#sarki-dortnala'], ['Örümcek Isınması', '#sarki-orumcek'], ['Metronom: hız antrenörü', '#araclar']],
        notes: 'Thrash ritminin ders kitabı. Asıl zorluk hız: metronomun hız antrenörüyle 120 BPM\'den başla, her 8 ölçüde 4 BPM artır. Bilek gevşek kalmalı.'
    },
    {
        id: 'crazy-little-thing', title: 'Crazy Little Thing Called Love', artist: 'Queen', year: 1979,
        level: 1, key: 'D', time: '4/4',
        chords: ['D', 'G', 'C', 'Bb', 'E', 'A'],
        techniques: ['Rockabilly tıngırdatma', 'Açık akorlar arasında hızlı geçiş', 'B♭ için küçük bare'],
        prep: [['Ders 12: Akor geçişleri', '#ders-12'], ['Oh! Susanna', '#sarki-oh-susanna'], ['Ders 11: A formu bare', '#ders-11']],
        notes: 'Freddie Mercury\'nin gitarda yazdığı şarkı; açık akorlarla çalınır. Tek zor akor B♭: A formu bare ile 1. perdede.'
    },
    {
        id: 'bohemian-rhapsody', title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975,
        level: 3, key: 'Bb', time: '4/4',
        chords: ['Bb', 'Gm', 'Cm', 'F', 'Eb'],
        techniques: ['Bare akorlar (B♭, Gm, Cm, E♭)', 'Melodik solo', 'Bölüm bölüm çalışma'],
        prep: [['Ders 10: E formu bare', '#ders-10'], ['Ders 11: A formu bare', '#ders-11'], ['Pozisyonlar: B♭ majör', '#pozisyonlar', { root: 10, scale: 'major', view: 'position', index: 1 }]],
        notes: 'Piyano üzerine kurulu, bölümleri çok farklı bir eser. Gitarda önce balad bölümünün akorlarını, sonra Brian May\'in solosunu çalış. Bemol tonları bare akorlarla çalınır.'
    },
    {
        id: 'wish-you-were-here', title: 'Wish You Were Here', artist: 'Pink Floyd', year: 1975,
        level: 2, key: 'G', time: '4/4',
        chords: ['C', 'D/F#', 'Am', 'G', 'Em7', 'A7sus4'],
        techniques: ['Çekiç (hammer-on) ile süslenen giriş', 'Akustik tıngırdatma', 'D/F♯ için başparmakla bas'],
        prep: [['Akor bulucu: D/F♯', '#akorlar', { tab: 'find' }], ['Amazing Grace', '#sarki-amazing-grace'], ['Ders 12: Ritim', '#ders-12']],
        notes: 'Akustik gitarla da elektroyla da güzel. D/F♯ akorunda 6. telin 2. perdesini başparmakla ya da orta parmakla basarsın. Giriş, Em7 ve G arasında küçük bir ezgi.'
    },
    {
        id: 'comfortably-numb', title: 'Comfortably Numb', artist: 'Pink Floyd', year: 1979,
        level: 3, key: 'Bm', time: '4/4',
        chords: ['Bm', 'A', 'G', 'Em', 'D', 'C'],
        techniques: ['B minör pentatonik solo', 'Tel çekme (bend) ve vibrato', 'Uzun, şarkı söyler gibi notalar'],
        prep: [['Pozisyonlar: B minör pentatonik', '#pozisyonlar', { root: 11, scale: 'minPent', view: 'pattern', index: 1 }], ['Ders 8: Pentatonik kutu', '#ders-8'], ['Ders 10: E formu bare (Bm)', '#ders-10']],
        notes: 'Kıtalar Bm, nakarat D majör merkezli. Gilmour\'un soloları B minör pentatonik kutularında; az nota, çok duygu. Bend\'lerde hedef notayı önce normal basıp dinle, sonra çekerek ona ulaş.'
    },
    {
        id: 'stairway-to-heaven', title: 'Stairway to Heaven', artist: 'Led Zeppelin', year: 1971,
        level: 3, key: 'Am', time: '4/4',
        chords: ['Am', 'C', 'D', 'Fmaj7', 'G', 'Em'],
        techniques: ['Arpej ve inen kromatik iç ses', 'Parmakla ya da hibrit çalma', 'A minör pentatonik solo'],
        prep: [['İnen Bas Arpeji', '#sarki-inen-bas'], ['Rising Sun Arpejleri', '#sarki-rising-sun'], ['Ders 8: Pentatonik kutu', '#ders-8']],
        notes: 'Girişte Am akoru içinde bir ses yarım ses yarım ses iner. Önce İnen Bas Arpeji alıştırmasıyla bu fikre alış. Solo, 5. perdedeki A minör pentatonik kutusunda.'
    },
    {
        id: 'whole-lotta-love', title: 'Whole Lotta Love', artist: 'Led Zeppelin', year: 1969,
        level: 2, key: 'E', time: '4/4',
        chords: ['E5', 'D5', 'A5'],
        techniques: ['Boş E teli üzerinde rif', 'Kaydırma (slide)', 'E minör pentatonik'],
        prep: [['Garaj Rifi', '#sarki-garaj-rifi'], ['Pozisyonlar: E minör pentatonik', '#pozisyonlar', { root: 4, scale: 'minPent', view: 'pattern', index: 1 }], ['Pentatonik Merdiven', '#sarki-pentatonik-merdiven']],
        notes: 'Rif, boş 6. tel ile 4. ve 5. teldeki pentatonik notalar arasında gidip gelir. Boş teli çalarken sol el bir sonraki notaya hazırlanır.'
    },
    {
        id: 'smoke-on-the-water', title: 'Smoke on the Water', artist: 'Deep Purple', year: 1972,
        level: 1, key: 'Gm', time: '4/4',
        chords: ['G5', 'Bb5', 'C5'],
        techniques: ['İki notalı power chord (D ve G telleri)', 'Kaydırma', 'Notaları tam süresince tutma'],
        prep: [['Ders 9: Power chord', '#ders-9'], ['Garaj Rifi', '#sarki-garaj-rifi']],
        notes: 'Dünyanın ilk öğrenilen rifi. İki notalı şekilleri 4. ve 3. telde çal; işaret parmağı iki teli birden basabilir. Distorsiyonu aç.'
    },
    {
        id: 'paranoid', title: 'Paranoid', artist: 'Black Sabbath', year: 1970,
        level: 2, key: 'Em', time: '4/4',
        chords: ['E5', 'D5', 'G5'],
        techniques: ['Hızlı sekizlik ritim', 'Power chord kaydırma', 'E minör pentatonik rif'],
        prep: [['Garaj Rifi', '#sarki-garaj-rifi'], ['Ders 9: Power chord', '#ders-9']],
        notes: 'Kısa ve hızlı bir rock klasiği. Sağ el hiç durmadan aşağı vuruş yapar; power chord şekli değişmez, sadece kayar.'
    },
    {
        id: 'smells-like-teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', year: 1991,
        level: 2, key: 'Fm', time: '4/4',
        chords: ['F5', 'Bb5', 'Ab5', 'Db5'],
        techniques: ['Dört power chordluk dizi', 'Sustur-vur (ghost) vuruşlar', 'Temiz kıta, distorsiyonlu nakarat'],
        prep: [['Ders 9: Power chord', '#ders-9'], ['Akorlar: power chord', '#akorlar', { tab: 'power' }]],
        notes: 'Bütün şarkı aynı dört akor. Akor değiştirirken sol eli gevşetip tellere vurursan o "çık" sesi çıkar.'
    },
    {
        id: 'hotel-california', title: 'Hotel California', artist: 'Eagles', year: 1976,
        level: 3, key: 'Bm', time: '4/4',
        chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em'],
        techniques: ['Bare akorlar', 'Arpej', 'İki gitarlı solo (B minör)'],
        prep: [['Ders 10: E formu bare', '#ders-10'], ['Ders 11: A formu bare', '#ders-11'], ['Pozisyonlar: B armonik minör', '#pozisyonlar', { root: 11, scale: 'harmMinor', view: 'pattern', index: 1 }]],
        notes: 'Orijinal kayıt 12 telli gitarda capo 7 ile çalınır; aynı akorları capo\'suz bare ile de çalabilirsin. F♯ akoru E formu ile 2. perdede.'
    },
    {
        id: 'knockin-on-heavens-door', title: 'Knockin\' on Heaven\'s Door', artist: 'Bob Dylan / Guns N\' Roses', year: 1973,
        level: 1, key: 'G', time: '4/4',
        chords: ['G', 'D', 'Am', 'C'],
        techniques: ['Dört açık akor', 'Yavaş, düzenli tıngırdatma'],
        prep: [['When the Saints', '#sarki-saints'], ['Ders 12: Ritim', '#ders-12']],
        notes: 'İlk şarkı için ideal: dört akor ve tekrar eden bir dizi. G ile D arasında geçişi bir dakika geçiş antrenmanıyla çalış.'
    },
    {
        id: 'sweet-child-o-mine', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', year: 1987,
        level: 3, key: 'D', time: '4/4', tuning: 'Yarım ses pes (E♭)',
        chords: ['D', 'C', 'G', 'A'],
        techniques: ['Telden tele atlayan melodik giriş', 'Akor şekli tutarken melodi çalma', 'Solo: E minör ve armonik minör'],
        prep: [['Örümcek Isınması', '#sarki-orumcek'], ['Pentatonik Merdiven', '#sarki-pentatonik-merdiven']],
        notes: 'Grup gitarlarını yarım ses pes akort eder; standart akortla da çalabilirsin, sadece kayıttan yarım ses tiz duyulur. Giriş rifi tel atlama (string skipping) için harika bir alıştırmadır.'
    },
    {
        id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis', year: 1995,
        level: 1, key: 'F#m', time: '4/4', capo: 2,
        chords: ['Em7', 'G', 'Dsus4', 'A7sus4', 'Cadd9'],
        techniques: ['Capo 2', 'Yüzük ve serçe parmak hep aynı yerde kalır', 'On altılık tıngırdatma'],
        prep: [['Açık akorlar', '#akorlar'], ['Ders 12: Ritim', '#ders-12']],
        notes: 'Akor adları capo\'ya göre yazılıdır (capo 2. perdede). Bütün akorlarda 2. teli ve 1. teli 3. perdede tutarsın; böylece geçişler çok kolaylaşır.'
    },
    {
        id: 'zombie', title: 'Zombie', artist: 'The Cranberries', year: 1994,
        level: 1, key: 'Em', time: '4/4',
        chords: ['Em', 'Cmaj7', 'G', 'D/F#'],
        techniques: ['Dört akorluk döngü', 'Temiz kıta, distorsiyonlu nakarat'],
        prep: [['Ders 12: Ritim', '#ders-12'], ['Akor bulucu: D/F♯', '#akorlar', { tab: 'find' }]],
        notes: 'Bütün şarkı tek bir dört akorluk döngü; ritim ve dinamik çalışmak için ideal.'
    },
    {
        id: 'highway-to-hell', title: 'Highway to Hell', artist: 'AC/DC', year: 1979,
        level: 2, key: 'A', time: '4/4',
        chords: ['A', 'D/F#', 'G', 'D', 'E'],
        techniques: ['Açık akorlarla sert rock ritmi', 'Akorlar arasında susturma (boşluk) bırakma'],
        prep: [['Ders 12: Ritim', '#ders-12'], ['Garaj Rifi', '#sarki-garaj-rifi']],
        notes: 'AC/DC\'nin sırrı az distorsiyon ve sessizlik: akorları vurup susturmak. Kanalı distorsiyona al ama sesi kısık tut.'
    }
];

export const songsterrUrl = s => `https://www.songsterr.com/?pattern=${encodeURIComponent(`${s.artist.split(' / ').pop()} ${s.title}`)}`;
export const ugUrl = s => `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(`${s.artist.split(' / ').pop()} ${s.title}`)}`;
export const lessonUrl = s => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.title} ${s.artist.split(' / ').pop()} gitar dersi`)}`;
