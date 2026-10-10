// Hazır şarkılar. Yalnızca kamu malı / geleneksel eserler ve Perde için yazılmış alıştırmalar.
// kind: 'chords' (ChordPro metni) | 'tab' (tab.js biçimi)
// level: 1 başlangıç, 2 orta, 3 ileri
// strum: sekizlik dilimler, D aşağı, U yukarı, - boş (4/4 için 8, 3/4 için 6 dilim)

// A minör pentatonik 1. kutu, üçerli gruplar halinde yukarı ve aşağı
const BOX1 = ['6.5', '6.8', '5.5', '5.7', '4.5', '4.7', '3.5', '3.7', '2.5', '2.8', '1.5', '1.8'];
function threes(notes) {
    const out = [];
    for (let i = 0; i + 2 < notes.length; i++) out.push(notes[i], notes[i + 1], notes[i + 2]);
    return out;
}
function ladder() {
    const up = threes(BOX1), down = threes([...BOX1].reverse());
    const all = [...up, ...down];                 // 60 nota = 20 vuruş
    const bars = [];
    for (let i = 0; i < all.length; i += 12) bars.push(all.slice(i, i + 12));
    const txt = bars.map((b, i) => b.map((n, j) => (i === 0 && j === 0 ? n + ':1/3' : n)).join(' '));
    return txt.join(' | ') + ' | 5.5:4';          // son ölçü: kök A
}

export const SONGS = [
    {
        id: 'neseye-ovgu',
        title: 'Neşeye Övgü',
        artist: 'L. v. Beethoven, 9. Senfoni (1824)',
        source: 'Kamu malı',
        kind: 'tab',
        level: 1,
        key: 'C',
        tempo: 96,
        time: '4/4',
        focus: 'İlk üç telin doğal notaları: G, B, C, D, E, F',
        notes: 'Tüm melodi I. pozisyonda. Sol el işaret parmağı 1. perdede, yüzük parmağı 3. perdede dursun. Önce yavaş çal, sonra tempoyu artır.',
        tab: `
1.0:1 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 1.0:1.5 2.3:0.5 2.3:2 |
1.0:1 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 2.3:1.5 2.1:0.5 2.1:2 |
2.3:1 2.3 1.0 2.1 | 2.3 1.0:0.5 1.1 1.0:1 2.1 | 2.3 1.0:0.5 1.1 1.0:1 2.3 | 2.1 2.3 3.0:2 |
1.0:1 1.0 1.1 1.3 | 1.3 1.1 1.0 2.3 | 2.1 2.1 2.3 1.0 | 2.3:1.5 2.1:0.5 2.1:2`
    },
    {
        id: 'kucuk-yildiz',
        title: 'Parla Parla Küçük Yıldız',
        artist: 'Fransız halk ezgisi (18. yy)',
        source: 'Geleneksel',
        kind: 'tab',
        level: 1,
        key: 'C',
        tempo: 90,
        time: '4/4',
        focus: '5., 4. ve 3. telde C, D, E, F, G, A',
        notes: 'Kalın tellerde doğal notalar. Üstteki akorları bir arkadaşın çalarsa ikili çalabilirsiniz.',
        tab: `
[C] 5.3:1 5.3 3.0 3.0 | [F] 3.2 3.2 [C] 3.0:2 | [F] 4.3:1 4.3 [C] 4.2 4.2 | [G] 4.0 4.0 [C] 5.3:2 |
[C] 3.0:1 3.0 [F] 4.3 4.3 | [C] 4.2 4.2 [G] 4.0:2 | [C] 3.0:1 3.0 [F] 4.3 4.3 | [C] 4.2 4.2 [G] 4.0:2 |
[C] 5.3:1 5.3 3.0 3.0 | [F] 3.2 3.2 [C] 3.0:2 | [F] 4.3:1 4.3 [C] 4.2 4.2 | [G] 4.0 4.0 [C] 5.3:2`
    },
    {
        id: 'fur-elise',
        lang: 'de',
        title: 'Für Elise (giriş)',
        artist: 'L. v. Beethoven (1810)',
        source: 'Kamu malı',
        kind: 'tab',
        level: 2,
        key: 'Am',
        tempo: 60,
        time: '3/8',
        focus: 'D♯ ve G♯ gibi doğal olmayan notalar, hızlı on altılıklar',
        notes: 'Piyano eserinin sağ el melodisi, gitar için bir oktav aşağıda. D♯ notası 2. telin 4. perdesinde: serçe parmakla bas.',
        tab: `
1.0:0.25 2.4 | 1.0 2.4 1.0 2.0 2.3 2.1 | 3.2:0.5 -:0.25 5.3 4.2 3.2 | 2.0:0.5 -:0.25 4.2 3.1 2.0 |
2.1:0.5 -:0.25 4.2 1.0 2.4 | 1.0 2.4 1.0 2.0 2.3 2.1 | 3.2:0.5 -:0.25 5.3 4.2 3.2 | 2.0:0.5 -:0.25 4.2 2.1 2.0 | 3.2:1.5`
    },
    {
        id: 'orumcek',
        title: 'Örümcek Isınması',
        artist: 'Perde alıştırması',
        source: 'Alıştırma',
        kind: 'tab',
        level: 1,
        key: '',
        tempo: 70,
        time: '4/4',
        focus: 'Parmak bağımsızlığı, her perdeye bir parmak',
        notes: 'Her perdeye bir parmak: 1. perde işaret, 2. orta, 3. yüzük, 4. serçe. Önce I. pozisyonda yukarı, sonra II. pozisyonda aşağı. Parmakları teli bıraktıktan sonra perdenin hemen üstünde tut.',
        tab: `
6.1:0.5 6.2 6.3 6.4 5.1 5.2 5.3 5.4 | 4.1 4.2 4.3 4.4 3.1 3.2 3.3 3.4 | 2.1 2.2 2.3 2.4 1.1 1.2 1.3 1.4 |
1.5 1.4 1.3 1.2 2.5 2.4 2.3 2.2 | 3.5 3.4 3.3 3.2 4.5 4.4 4.3 4.2 | 5.5 5.4 5.3 5.2 6.5 6.4 6.3 6.2`
    },
    {
        id: 'garaj-rifi',
        title: 'Garaj Rifi',
        artist: 'Perde alıştırması',
        source: 'Alıştırma',
        kind: 'tab',
        level: 1,
        key: 'Em',
        tempo: 104,
        time: '4/4',
        tone: 'drive',
        focus: 'İki notalı power chord, sap boyunca kaydırma',
        notes: 'Distorsiyonlu sesle çal. Boş E power chord\'larında sağ elin avuç kenarını köprüdeki tellere hafifçe yasla (palm mute). Kaydırırken parmak şeklini bozma.',
        tab: `
[E5] 6.0+5.2:0.5 6.0+5.2 6.0+5.2 6.0+5.2 [G5] 6.3+5.5:1 [A5] 6.5+5.7:1 |
[E5] 6.0+5.2:0.5 6.0+5.2 6.0+5.2 6.0+5.2 [D5] 5.5+4.7:1 [C5] 5.3+4.5:1 |
[E5] 6.0+5.2:0.5 6.0+5.2 6.0+5.2 6.0+5.2 [G5] 6.3+5.5:1 [A5] 6.5+5.7:1 |
[E5] 6.0+5.2:0.5 6.0+5.2 [B5] 5.2+4.4:1 [C5] 5.3+4.5:0.5 [B5] 5.2+4.4:0.5 [E5] 6.0+5.2+4.2:1`
    },
    {
        id: 'blues-a',
        title: '12 Ölçülük Blues (A)',
        artist: 'Geleneksel blues kalıbı',
        source: 'Geleneksel',
        kind: 'tab',
        level: 2,
        key: 'A',
        tempo: 92,
        time: '4/4',
        swing: true,
        tone: 'drive',
        focus: 'Blues akor dizisi: I – IV – V, shuffle ritmi',
        notes: 'Klasik "boogie" kalıbı: kök ve beşli, sonra yüzük parmağıyla altılı. Sekizlikler shuffle (uzun-kısa) çalınır. 12 ölçüyü ezberle; birçok blues ve rock şarkısı bu dizi üzerine kuruludur.',
        tab: `
[A] 5.0+4.2:0.5 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
[D] 4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 |
4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 |
[A] 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
[E] 6.0+5.2 6.0+5.2 6.0+5.4 6.0+5.4 6.0+5.2 6.0+5.2 6.0+5.4 6.0+5.4 |
[D] 4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 4.0+3.2 4.0+3.2 4.0+3.4 4.0+3.4 |
[A] 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 5.0+4.2 5.0+4.2 5.0+4.4 5.0+4.4 |
[E] 6.0+5.2 6.0+5.2 6.0+5.4 6.0+5.4 6.0+5.2:1 -:1`
    },
    {
        id: 'rising-sun',
        title: 'Rising Sun Arpejleri',
        artist: 'Geleneksel Amerikan ezgisi "House of the Rising Sun"',
        source: 'Geleneksel',
        kind: 'tab',
        level: 2,
        key: 'Am',
        tempo: 100,
        time: '6/8',
        focus: 'Am, C, D, F, E akorlarında arpej (tek tek çalma)',
        notes: 'Her ölçüde akoru bas, sonra telleri tek tek çal. F için küçük F şeklini kullan (xx3211). Sağ el: bas notası başparmak ya da pena ile, diğerleri sırayla.',
        tab: `
[Am] 5.0:0.5 4.2 3.2 2.1 1.0 2.1 | [C] 5.3 4.2 3.0 2.1 1.0 2.1 | [D] 4.0 3.2 2.3 1.2 2.3 3.2 | [F] 4.3 3.2 2.1 1.1 2.1 3.2 |
[Am] 5.0 4.2 3.2 2.1 1.0 2.1 | [C] 5.3 4.2 3.0 2.1 1.0 2.1 | [E] 6.0 5.2 4.2 3.1 2.0 3.1 | [E] 6.0 5.2 4.2 3.1 2.0 3.1 |
[Am] 5.0 4.2 3.2 2.1 1.0 2.1 | [C] 5.3 4.2 3.0 2.1 1.0 2.1 | [D] 4.0 3.2 2.3 1.2 2.3 3.2 | [F] 4.3 3.2 2.1 1.1 2.1 3.2 |
[Am] 5.0 4.2 3.2 2.1 1.0 2.1 | [E] 6.0 5.2 4.2 3.1 2.0 3.1 | [Am] 5.0 4.2 3.2 2.1 1.0 2.1 | [E] 6.0 5.2 4.2 3.1 2.0 3.1`
    },
    {
        id: 'dortnala',
        title: 'Dörtnala Ritim',
        artist: 'Perde alıştırması',
        source: 'Alıştırma',
        kind: 'tab',
        level: 2,
        key: 'Em',
        tempo: 110,
        time: '4/4',
        tone: 'drive',
        focus: 'Gallop ritmi (bir sekizlik + iki on altılık), downpicking',
        notes: 'Metal ritim gitarının temel kalıbı: "da-ga-dak". Boş E telini avuçla hafifçe sustur (palm mute), her notayı aşağı vuruşla çal. Önce 80 BPM, sonra hız antrenörüyle yukarı.',
        tab: `
6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 [G5] 6.3+5.5:0.5 [A5] 6.5+5.7 |
6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 [B5] 6.7+5.9:1 |
6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 [G5] 6.3+5.5:0.5 [A5] 6.5+5.7 |
6.0:0.5 6.0:0.25 6.0 6.0:0.5 6.0:0.25 6.0 [C5] 5.3+4.5:1 [B5] 5.2+4.4:1`
    },
    {
        id: 'inen-bas',
        title: 'İnen Bas Arpeji',
        artist: 'Perde alıştırması',
        source: 'Alıştırma',
        kind: 'tab',
        level: 2,
        key: 'Am',
        tempo: 84,
        time: '4/4',
        focus: 'Am akorunda yarım ses yarım ses inen bas, arpej',
        notes: 'Rock baladlarının çok sevdiği bir fikir: Am akorunu tutarken bas sesi A, G♯, G, F♯ diye iner. Üst teller aynı kalır, sadece işaret ya da orta parmak 6. telde kayar.',
        tab: `
[Am] 5.0:0.5 4.2 3.2 2.1 1.0 2.1 3.2 4.2 | [Am/G#] 6.4 4.2 3.2 2.1 1.0 2.1 3.2 4.2 | [Am/G] 6.3 4.2 3.2 2.1 1.0 2.1 3.2 4.2 |
[D/F#] 6.2 4.0 3.2 2.3 1.2 2.3 3.2 4.0 | [Fmaj7] 4.3 3.2 2.1 1.0 2.1 3.2 4.3 3.2 | [E] 6.0 5.2 4.2 3.1 2.0 3.1 4.2 5.2 | [Am] 5.0+4.2+3.2+2.1+1.0:4`
    },
    {
        id: 'pentatonik-merdiven',
        title: 'Pentatonik Merdiven',
        artist: 'Perde alıştırması',
        source: 'Alıştırma',
        kind: 'tab',
        level: 2,
        key: 'Am',
        tempo: 72,
        time: '4/4',
        tone: 'drive',
        focus: 'A minör pentatonik 1. kutu, üçerli gruplar (triole)',
        notes: 'Solo çalanların klasik ısınması: kutuyu düz çıkmak yerine üçerli gruplarla çık ve in. Her vuruşa üç nota düşer. Pena yönünü düzenli değiştir: aşağı-yukarı-aşağı, yukarı-aşağı-yukarı.',
        tab: ladder()
    },
    {
        id: 'amazing-grace',
        lang: 'en',
        title: 'Amazing Grace',
        artist: 'John Newton (1779), ezgi "New Britain"',
        source: 'Kamu malı',
        kind: 'chords',
        level: 1,
        key: 'G',
        tempo: 80,
        time: '3/4',
        strum: 'D-DUDU',
        focus: 'G, G7, C, D, Em akorları; 3/4 ritim',
        notes: 'Üç vuruşlu (vals) ritim. Her ölçüde 1. vuruşa vurgu yap: GÜM-tı-tı.',
        body: `{c: 1. kıta}
A[G]mazing [G7]grace, how [C]sweet the [G]sound
That saved a wretch like [D]me
I [G]once was [G7]lost, but [C]now am [G]found
Was [Em]blind, but [D]now I [G]see

{c: 2. kıta}
'Twas [G]grace that [G7]taught my [C]heart to [G]fear
And grace my fears re[D]lieved
How [G]precious [G7]did that [C]grace ap[G]pear
The [Em]hour I [D]first be[G]lieved

{c: 3. kıta}
Through [G]many [G7]dangers, [C]toils and [G]snares
I have already [D]come
'Tis [G]grace hath [G7]brought me [C]safe thus [G]far
And [Em]grace will [D]lead me [G]home`
    },
    {
        id: 'saints',
        lang: 'en',
        title: 'When the Saints Go Marching In',
        artist: 'Geleneksel gospel',
        source: 'Geleneksel',
        kind: 'chords',
        level: 1,
        key: 'G',
        tempo: 100,
        time: '4/4',
        strum: 'D-D-D-D-',
        focus: 'G, D, G7, C ile ilk akor değişimleri',
        notes: 'Her vuruşa bir aşağı vuruş. Akor değişiminden bir vuruş önce sol elini hazırla.',
        body: `{c: 1. kıta}
Oh when the [G]saints go marching in
Oh when the saints go marching [D]in
Oh Lord, I [G]want to [G7]be in that [C]number
When the [G]saints go [D]marching [G]in

{c: 2. kıta}
Oh when the [G]sun refuse to shine
Oh when the sun refuse to [D]shine
Oh Lord, I [G]want to [G7]be in that [C]number
When the [G]sun re[D]fuse to [G]shine`
    },
    {
        id: 'oh-susanna',
        lang: 'en',
        title: 'Oh! Susanna',
        artist: 'Stephen Foster (1848)',
        source: 'Kamu malı',
        kind: 'chords',
        level: 1,
        key: 'C',
        tempo: 110,
        time: '4/4',
        strum: 'D-DU-UDU',
        focus: 'C, F, G, G7: üç akorlu klasik',
        notes: 'Hareketli bir parça. Önce her vuruşa bir aşağı vuruşla başla, oturunca aşağıdaki ritim kalıbına geç.',
        body: `I [C]come from Alabama with my [G7]banjo on my knee
I'm [C]goin' to Louisiana, my [G7]true love for to [C]see
It [C]rained all night the day I left, the [G7]weather it was dry
The [C]sun so hot I froze to death, Su[G7]sanna, don't you [C]cry

{soc}
Oh, Su[F]sanna, oh [C]don't you cry for [G7]me
For I [C]come from Alabama with my [G7]banjo on my [C]knee
{eoc}`
    },
    {
        id: 'greensleeves',
        lang: 'en',
        title: 'Greensleeves',
        artist: 'İngiliz halk şarkısı (16. yy)',
        source: 'Kamu malı',
        kind: 'chords',
        level: 2,
        key: 'Am',
        tempo: 90,
        time: '3/4',
        strum: 'D-DUDU',
        focus: 'Am, G, F, E, C: minör tonda akor dizisi',
        notes: 'F akorunu küçük F (xx3211) ile başlatabilir, sonra tam bare F\'ye geçebilirsin. E akoruna geçerken parmakları aynı anda kaldır.',
        body: `A[Am]las, my [G]love, you [F]do me [E]wrong
To [Am]cast me [G]off dis[E]courteously
For [Am]I have [G]loved you [F]well and [E]long
De[Am]lighting [E]in your [Am]company

{soc}
[C]Greensleeves was [G]all my [Am]joy [E]
[C]Greensleeves was [G]my de[Am]light [E]
[C]Greensleeves was my [G]heart of [Am]gold
And [E]who but my lady [Am]Greensleeves
{eoc}`
    }
];
