// Ders yolu. Her dersin bir anlatımı, etkileşimli bir şekli ve bir alıştırma bağlantısı var.
// figure.build(note) → klavye işaretleri; figure.play → "Dinle" ile çalınacak [tel, perde] dizisi
import { isNatural, pcAt, mod12 } from '../theory.js';
import { scalePositions } from '../positions.js';

const all = (maxFret, keep, kind = () => 'note') => {
    const out = [];
    for (let s = 1; s <= 6; s++) for (let f = 0; f <= maxFret; f++) {
        if (keep(s, f)) out.push({ s, f, note: true, kind: kind(s, f) });
    }
    return out;
};

export const LESSONS = [
    {
        id: '1',
        title: 'Teller ve akort',
        tag: 'Temel',
        minutes: 5,
        summary: 'Altı telin adı, numarası ve standart akort.',
        body: `
<p>Elektro gitarın altı teli var. Kalın telden ince tele doğru standart akort <strong>E – A – D – G – B – E</strong>, yani <strong>Mi – La – Re – Sol – Si – Mi</strong>.</p>
<p>Teller inceden kalına numaralanır: en ince tel <strong>1. tel</strong>, en kalın tel <strong>6. tel</strong>. Tablarda ve akor şemalarında hep bu numaraları göreceksin.</p>
<p class="mnemonic"><b>E</b>ski <b>A</b>rabalar <b>D</b>ağda <b>G</b>ezer, <b>B</b>azen <b>E</b>ğlenir.</p>
<p>Aşağıdaki boş tellere tek tek dokun. Kalın E ile ince E aynı notadır; arada iki oktav vardır.</p>`,
        figure: {
            frets: 5,
            build: () => [6, 5, 4, 3, 2, 1].map(s => ({ s, f: 0, note: true, kind: s === 6 || s === 1 ? 'root' : 'note', sub: String(s) })),
            play: [[6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0]]
        },
        practice: [{ label: 'Akort aracını aç', href: '#araclar' }],
        tip: 'Her çalışmaya akort ederek başla. Akort bozuk bir gitarda doğru bastığın nota bile yanlış duyulur.'
    },
    {
        id: '2',
        title: 'Perdeler ve yarım ses',
        tag: 'Temel',
        minutes: 5,
        summary: 'Her perde yarım ses; 12. perde bir oktav.',
        body: `
<p>Her perde sesi <strong>yarım ses</strong> yükseltir. Batı müziğinde 12 farklı nota vardır ve 12 perde ilerleyince aynı notaya bir oktav yukarıda ulaşırsın. 12. perdedeki çift nokta bu yüzden oradadır.</p>
<p>Diyez (♯) yarım ses yukarı, bemol (♭) yarım ses aşağı demektir. <strong>C♯ ile D♭ aynı perdedir</strong>, sadece adı farklıdır.</p>
<p>Aşağıda 5. tel (A teli) boydan boya. Dinle'ye bas ve sesin perde perde yükselişini duy.</p>`,
        figure: {
            frets: 12,
            build: () => Array.from({ length: 13 }, (_, f) => ({ s: 5, f, note: true, kind: f === 0 || f === 12 ? 'root' : isNatural(pcAt(5, f)) ? 'note' : 'ghost' })),
            play: Array.from({ length: 13 }, (_, f) => [5, f])
        },
        practice: [{ label: 'Klavye haritasında tüm notalar', href: '#klavye', intent: { show: 'all' } }],
        tip: 'Perdeye tam üstünden değil, perde telinin hemen arkasından bas. Daha az güçle daha temiz ses çıkar.'
    },
    {
        id: '3',
        title: 'Doğal notalar',
        tag: 'Notalar',
        minutes: 8,
        summary: 'Yedi doğal nota ve tek bir kural: E–F, B–C arası yarım ses.',
        body: `
<p>Diyez ya da bemol almayan yedi notaya <strong>doğal nota</strong> denir: <strong>C D E F G A B</strong> (Do Re Mi Fa Sol La Si).</p>
<p class="rule">E ile F, B ile C arasında <b>yarım ses (1 perde)</b> vardır. Diğer bütün doğal notaların arası <b>tam ses (2 perde)</b>.</p>
<p>Bu kuralı bilirsen hiçbir teli ezberlemen gerekmez: boş telin adından başlar, saymaya devam edersin. Örneğin 6. tel: E (boş) → F (1) → G (3) → A (5) → B (7) → C (8) → D (10) → E (12).</p>`,
        figure: {
            frets: 12,
            build: () => all(12, (s, f) => isNatural(pcAt(s, f)), (s, f) => mod12(pcAt(s, f)) === 4 || mod12(pcAt(s, f)) === 11 || mod12(pcAt(s, f)) === 5 || mod12(pcAt(s, f)) === 0 ? 'root' : 'note'),
            play: [[6, 0], [6, 1], [6, 3], [6, 5], [6, 7], [6, 8], [6, 10], [6, 12]]
        },
        legend: 'Turuncu notalar yarım ses komşuları: E–F ve B–C.',
        practice: [{ label: 'Nota avı: doğal notalar', href: '#alistirma', intent: { mode: 'name', strings: [1, 2, 3, 4, 5, 6], from: 0, to: 12, naturals: true } }],
        tip: 'Her gün 6. telden bir, 1. telden bir nota seç ve gözün kapalı bul.'
    },
    {
        id: '4',
        title: '6. ve 5. telde yol bulmak',
        tag: 'Notalar',
        minutes: 10,
        summary: 'Power chord ve bare akorların kökleri bu iki telde.',
        body: `
<p>Power chord ve bare akorların kök notası 6. ya da 5. teldedir. Bu iki teldeki doğal notaları bilmek, bir akoru klavyede istediğin yere taşımanı sağlar.</p>
<table class="ref">
<tr><th>6. tel</th><td>E<small>0</small></td><td>F<small>1</small></td><td>G<small>3</small></td><td>A<small>5</small></td><td>B<small>7</small></td><td>C<small>8</small></td><td>D<small>10</small></td><td>E<small>12</small></td></tr>
<tr><th>5. tel</th><td>A<small>0</small></td><td>B<small>2</small></td><td>C<small>3</small></td><td>D<small>5</small></td><td>E<small>7</small></td><td>F<small>8</small></td><td>G<small>10</small></td><td>A<small>12</small></td></tr>
</table>
<p>Noktalı perdeler (3, 5, 7) yer imi gibidir: 6. telde <strong>G – A – B</strong>, 5. telde <strong>C – D – E</strong>.</p>`,
        figure: {
            frets: 12,
            build: () => all(12, (s, f) => (s === 6 || s === 5) && isNatural(pcAt(s, f)), (s, f) => [3, 5, 7].includes(f) ? 'root' : 'note'),
            play: [[6, 3], [6, 5], [6, 7], [5, 3], [5, 5], [5, 7]]
        },
        practice: [{ label: 'Nota avı: 6. ve 5. tel', href: '#alistirma', intent: { mode: 'find', strings: [5, 6], from: 0, to: 12, naturals: true } }],
        tip: 'Önce 3-5-7 yer imlerini otomatikleştir, sonra aralarını doldur.'
    },
    {
        id: '5',
        title: 'Oktav şekilleri',
        tag: 'Notalar',
        minutes: 10,
        summary: 'Bir notayı bildiğin yerden, aynı notayı başka tellerde bul.',
        body: `
<p>Aynı notanın bir oktav üstünü bulmanın en hızlı yolu oktav şekilleridir:</p>
<ul>
<li><strong>6. telden 4. tele</strong> ve <strong>5. telden 3. tele</strong>: bir tel atla, <b>2 perde</b> ileri git.</li>
<li><strong>4. telden 2. tele</strong> ve <strong>3. telden 1. tele</strong>: bir tel atla, <b>3 perde</b> ileri git. B teli bir perde kaydırır.</li>
<li><strong>6. tel ile 1. tel</strong> aynı perdede aynı notadır, iki oktav arayla.</li>
</ul>
<p>Aşağıdan bir nota seç: klavyedeki bütün yerleri görünür. Oktav şekillerini parmaklarınla takip et.</p>`,
        figure: {
            frets: 15,
            control: 'note',
            defaultNote: 9,
            build: note => all(15, (s, f) => pcAt(s, f) === note, () => 'root'),
            play: null
        },
        practice: [{ label: 'Nota avı: hepsini bul', href: '#alistirma', intent: { mode: 'all', strings: [1, 2, 3, 4, 5, 6], from: 0, to: 12, naturals: true } }],
        tip: 'Bir notayı 6. telde biliyorsan, oktav şekliyle 4. telde, oradan da 2. telde bulursun. Üç yer, tek bilgi.'
    },
    {
        id: '6',
        title: 'I. pozisyon: açık pozisyonda doğal notalar',
        tag: 'Pozisyonlar',
        minutes: 12,
        summary: 'Her perdeye bir parmak; boş tellerle birlikte ilk 3 perde.',
        body: `
<p><strong>Pozisyon</strong>, sol elin klavyede durduğu yerdir ve işaret parmağının perdesiyle adlandırılır. I. pozisyonda işaret parmağın 1. perdededir ve her parmak bir perdeden sorumludur: <b>1. perde işaret, 2. orta, 3. yüzük, 4. serçe</b>.</p>
<p>Bu pozisyondaki doğal notalar C majör dizisidir; boş tellerle birlikte kalın E'den ince teldeki G'ye kadar uzanır. Küçük rakamlar hangi parmağı kullanacağını gösterir.</p>
<p>Dinle'ye bas, sonra aynı sırayla kendin çal. Her notayı çalarken adını yüksek sesle söyle.</p>`,
        figure: {
            frets: 5,
            build: () => scalePositions({ root: 0, scale: 'major', view: 'position', index: 1 }).map(m => ({ ...m, note: true, kind: m.kind === 'stretch' ? 'stretch' : m.pc === 0 ? 'root' : 'note', sub: m.finger ? String(m.finger) : undefined })),
            play: 'ascending'
        },
        practice: [{ label: 'Pozisyonlar sayfasında aç', href: '#pozisyonlar', intent: { root: 0, scale: 'major', view: 'position', index: 1 } }],
        tip: 'Parmaklarını perdelerin hemen üstünde, havada beklet. Kullanmadığın parmağı uzaklaştırma.'
    },
    {
        id: '7',
        title: 'V. pozisyon ve pozisyon kaydırma',
        tag: 'Pozisyonlar',
        minutes: 12,
        summary: 'Aynı doğal notalar 5–8. perdelerde, boş tel olmadan.',
        body: `
<p>Elini 5. perdeye taşıdığında <strong>V. pozisyondasın</strong>. Burada boş tel yok; her nota bir parmakla basılır, bu yüzden aynı parmak kalıbını başka tonlara da taşıyabilirsin.</p>
<p>Kesik çizgili notalar <strong>esneme</strong> notalarıdır: el pozisyonu bozmadan serçe parmağını bir perde ileri (ya da işaret parmağını bir perde geri) uzatarak basarsın.</p>
<p>Pozisyonlar sayfasında aynı diziyi II., III., VII. pozisyonlara kaydırıp karşılaştır: notalar aynı, şekiller farklı.</p>`,
        figure: {
            frets: 12,
            build: () => scalePositions({ root: 0, scale: 'major', view: 'position', index: 5 }).map(m => ({ ...m, note: true, kind: m.kind === 'stretch' ? 'stretch' : m.pc === 0 ? 'root' : 'note', sub: m.finger ? String(m.finger) : undefined })),
            shade: [5, 8],
            play: 'ascending'
        },
        practice: [{ label: 'Pozisyonları kaydır', href: '#pozisyonlar', intent: { root: 0, scale: 'major', view: 'position', index: 5 } }],
        tip: 'Pozisyon değiştirirken bileğini değil bütün kolu kaydır; başparmak da elle birlikte gitsin.'
    },
    {
        id: '8',
        title: 'Minör pentatonik: 1. kutu',
        tag: 'Pozisyonlar',
        minutes: 12,
        summary: 'Rock ve blues sololarının temeli. Her telde iki nota.',
        body: `
<p>Rock ve blues sololarının çoğu <strong>minör pentatonik</strong> diziyle çalınır. Beş notalıdır; A minör pentatonik: <strong>A C D E G</strong>.</p>
<p>1. kutu 5. perdede başlar ve her telde iki nota vardır: işaret parmağı 5. perdede, yüzük ya da serçe parmak 7–8. perdede. Turuncu notalar kök (A).</p>
<p>Önce yukarı-aşağı çal, sonra kök notalarına uğrayan küçük ezgiler uydur. Distorsiyonu aç, bend (tel çekme) denemeyi unutma.</p>`,
        figure: {
            frets: 12,
            build: () => scalePositions({ root: 9, scale: 'minPent', view: 'pattern', index: 1 }).map(m => ({ ...m, note: true, kind: m.pc === 9 ? 'root' : 'note' })),
            shade: [5, 8],
            play: 'ascending'
        },
        practice: [{ label: 'Beş kutunun hepsi', href: '#pozisyonlar', intent: { root: 9, scale: 'minPent', view: 'pattern', index: 1 } }],
        tip: 'Kutuları tek tek değil, ikişer ikişer öğren: 1. kutunun üst kenarı 2. kutunun alt kenarıdır.'
    },
    {
        id: '9',
        title: 'Power chord',
        tag: 'Akorlar',
        minutes: 10,
        summary: 'Kök ve beşli. Rock gitarın yapı taşı.',
        body: `
<p><strong>Power chord</strong> yalnızca kök ve beşliden oluşur; majör ya da minör değildir. Distorsiyonlu seste bile temiz duyulduğu için rock müziğin temelidir. Adı kökün yanına 5 yazılarak gösterilir: G5, A5.</p>
<p>Şekil: kök 6. telde <b>işaret parmağı</b>, iki perde ileride bir alt telde <b>yüzük parmağı</b>. İstersen <b>serçe parmakla</b> bir alt telde aynı perdeye oktavı ekle. Şekli hiç bozmadan sapta kaydırırsın: 6. telde 3. perde G5, 5. perde A5.</p>
<p>Aynı şekil 5. telde de çalışır: 5. telde 3. perde C5, 5. perde D5.</p>`,
        chords: ['E:5@G', 'E:5@A', 'A:5@C', 'A:5@D'],
        practice: [{ label: 'Garaj Rifi\'ni çal', href: '#sarki-garaj-rifi' }, { label: 'Power chord sayfası', href: '#akorlar', intent: { tab: 'power' } }],
        tip: 'Çalmadığın telleri işaret parmağının ucu ve sağ el avucunla sustur. Power chord\'un temizliği susturmadadır.'
    },
    {
        id: '10',
        title: 'Bare akor: E formu',
        tag: 'Akorlar',
        minutes: 15,
        summary: 'Açık E akorunu kaydır, her perdede yeni bir akor.',
        body: `
<p>Açık E akorunu yapıp işaret parmağınla <strong>bare</strong> yaparak (tüm telleri boydan boya bastırarak) sapta kaydırırsan her perdede yeni bir majör akor elde edersin. Kök 6. teldedir: <b>1. perdede F, 3. perdede G, 5. perdede A</b>.</p>
<p>Minör için Em şeklini kullan: orta parmak kalkar, işaret parmağının barı 3. teli de basar.</p>
<h4>Temiz bare için</h4>
<ul>
<li>İşaret parmağının başparmağa bakan kemikli yanıyla bas, yumuşak iç kısmıyla değil.</li>
<li>Başparmak sapın arkasında, orta parmağın hizasında dursun. Sıkmak yerine kolun ağırlığını kullan.</li>
<li>Parmağı perde telinin hemen arkasına yaklaştır.</li>
<li>Akoru bas, sonra telleri tek tek çal: hangi tel boğuk çıkıyorsa onu düzelt.</li>
</ul>`,
        chords: ['E:@F', 'E:@G', 'E:m@F', 'E:m@A'],
        practice: [{ label: 'Bare akor çalışma alanı', href: '#akorlar', intent: { tab: 'barre', form: 'E' } }],
        tip: 'İlk haftalarda 5. perdede (A) çalış: orada teller daha yumuşak basılır. Sonra 1. perdedeki F\'ye in.'
    },
    {
        id: '11',
        title: 'Bare akor: A formu',
        tag: 'Akorlar',
        minutes: 15,
        summary: 'Kök 5. telde: B♭, C, D ve minörleri.',
        body: `
<p>A formunda kök <strong>5. teldedir</strong>: <b>1. perdede B♭, 3. perdede C, 5. perdede D</b>. 6. tel çalınmaz; işaret parmağının ucuyla hafifçe dokunarak sustur.</p>
<p>Majör şekilde 2, 3 ve 4. teller aynı perdededir. Üç parmakla basabilir ya da yüzük parmağınla küçük bir bare yapabilirsin. Minör şekil ise Am akorunun kaydırılmış hâlidir.</p>
<p>E ve A formunu birlikte kullanınca her akoru iki yerde çalabilirsin: biri sapın başına, diğeri ortasına yakın.</p>`,
        chords: ['A:@C', 'A:@D', 'A:m@C', 'A:m@B'],
        practice: [{ label: 'Bare akor çalışma alanı', href: '#akorlar', intent: { tab: 'barre', form: 'A' } }],
        tip: 'Bir şarkıdaki akorları E ve A formu arasında dağıt: elin sapta az yol gitsin.'
    },
    {
        id: '12',
        title: 'Akor geçişleri ve ritim',
        tag: 'Ritim',
        minutes: 10,
        summary: 'Bir dakika geçiş alıştırması ve ilk tıngırdatma kalıbı.',
        body: `
<p>Akorları bilmek ile aralarında hızlı geçmek ayrı becerilerdir. En etkili yöntem <strong>bir dakika geçiş</strong> alıştırması: iki akor seç, bir dakika boyunca aralarında geçiş yap ve kaç kez temiz geçtiğini say. Rekorun kaydedilir.</p>
<p>Ritim için önce her vuruşa bir <b>aşağı (↓)</b> vuruş yap. Oturunca şu kalıbı dene:</p>
<p class="mnemonic">↓ &nbsp; ↓ ↑ &nbsp; ↑ ↓ ↑</p>
<p>Sağ elin metronom gibi sürekli aşağı yukarı sallansın; sadece bazı vuruşlarda tellere değsin. Böylece ritim hiç kaymaz.</p>`,
        chords: ['open:Am', 'open:C', 'open:Em', 'open:G'],
        practice: [{ label: 'Geçiş antrenmanını aç', href: '#akorlar', intent: { tab: 'trainer' } }, { label: 'Metronom', href: '#araclar' }],
        tip: 'Ortak parmakları telden kaldırma. Am → C geçişinde işaret ve orta parmak yerinde kalır; yalnızca yüzük parmağı 3. telden 5. tele geçer.'
    },
    {
        id: '13',
        title: 'İlk şarkıların',
        tag: 'Şarkılar',
        minutes: 20,
        summary: 'Öğrendiklerini müziğe çevir.',
        body: `
<p>Şarkılar bölümünde iki tür parça var:</p>
<ul>
<li><strong>Tab'lı melodiler</strong>: Neşeye Övgü ilk üç telin, Parla Parla Küçük Yıldız kalın tellerin doğal notalarını çalıştırır. Çalarken notalar klavyede de yanar.</li>
<li><strong>Akorlu şarkılar</strong>: Amazing Grace ve When the Saints; G, C, D, Em akorlarıyla ilk şarkılar. Akorlara dokununca şemaları ve sesleri çıkar; tonu değiştirebilirsin.</li>
</ul>
<p>Kendi çalmak istediğin şarkıları da ekleyebilirsin. Akorlu bir şarkıyı köşeli parantezle yazman yeterli: <code>[Am]Bir şarkı [G]sözü</code>.</p>`,
        figure: null,
        practice: [{ label: 'Neşeye Övgü', href: '#sarki-neseye-ovgu' }, { label: 'Amazing Grace', href: '#sarki-amazing-grace' }, { label: 'Tüm şarkılar', href: '#sarkilar' }],
        tip: 'Bir şarkıyı önce %60 hızda hatasız çal, sonra hızı artır. Yavaş ve temiz, hızlı ve kirliden iyidir.'
    }
];

