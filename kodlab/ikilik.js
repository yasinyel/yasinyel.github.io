// KodLab — İkilik Kartlar
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const TUR_SAYISI = 8;
    const ogretmen = new URLSearchParams(location.search).has('ogretmen');
    const kayit = KL.oku('ikilik', { yildiz: {} });

    const SEVIYELER = [
        { baslik: '4 Kart', ozet: '0 ile 15 arası sayılar. Kartlarda 8, 4, 2, 1 nokta var.', bit: 4, mod: 'olustur' },
        { baslik: '5 Kart', ozet: '0 ile 31 arası. Yeni kartta kaç nokta olmalı?', bit: 5, mod: 'karisik' },
        { baslik: 'Sayıyı Oku', ozet: 'Kartlar hazır, sen onluk sayıyı bul.', bit: 6, mod: 'oku' },
        { baslik: '1 Bayt = 8 Bit', ozet: '0 ile 255 arası. Bilgisayarın temel ölçü birimi.', bit: 8, mod: 'karisik' },
        { baslik: 'Hızlı Ol!', ozet: '8 kart, süre tutuluyor. 60 saniyenin altında bitirebilir misin?', bit: 8, mod: 'karisik', sure: true }
    ];

    let sv = null, tur = 0, hata = 0, bitler = [], hedef = 0, mod = 'olustur', baslangic = 0, serbest = false, kilitli = false;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    const acikMi = (i) => ogretmen || i === 0 || (kayit.yildiz[i - 1] || 0) > 0;

    function listeCiz() {
        $('lvlGrid').innerHTML = SEVIYELER.map((s, i) => `
            <button class="card lvl-card" data-i="${i}" ${acikMi(i) ? '' : 'disabled'}>
                <span class="no">Seviye ${i + 1} ${acikMi(i) ? '' : '<i class="fas fa-lock"></i>'}</span>
                <h3>${s.baslik}</h3><p>${s.ozet}</p>${KL.yildizHTML(kayit.yildiz[i] || 0)}
            </button>`).join('') + `
            <button class="card lvl-card free" data-i="serbest">
                <span class="no"><i class="fas fa-flask"></i> Keşif</span>
                <h3>Serbest Keşif</h3><p>Kartları istediğin gibi aç, kapa. Puan yok, sadece keşif.</p>
            </button>`;
        goster('liste');
    }
    $('lvlGrid').addEventListener('click', (e) => {
        const b = e.target.closest('.lvl-card');
        if (!b || b.disabled) return;
        b.dataset.i === 'serbest' ? serbestBasla() : basla(+b.dataset.i);
    });

    function kartlariCiz(bit, tiklanabilir) {
        let h = '';
        for (let i = bit - 1; i >= 0; i--) {
            const v = 2 ** i;
            const pips = v <= 32
                ? `<div class="pips" style="grid-template-columns:repeat(${Math.ceil(Math.sqrt(v))}, auto)">${'<i></i>'.repeat(v)}</div>`
                : `<div class="pips many">${v} nokta</div>`;
            h += `<button class="bcard off" data-b="${i}" ${tiklanabilir ? '' : 'disabled'} aria-label="${v} noktalı kart">
                    <div class="bcard-in"><div class="face">${pips}<span class="val">${v}</span></div><div class="back"></div></div>
                  </button>`;
        }
        $('cards').innerHTML = h;
    }

    function guncelle() {
        const bit = bitler.length;
        document.querySelectorAll('.bcard').forEach(k => k.classList.toggle('off', !bitler[+k.dataset.b]));
        let b = '';
        for (let i = bit - 1; i >= 0; i--) b += `<span class="${bitler[i] ? 'one' : 'zero'}">${bitler[i] ? 1 : 0}</span>`;
        $('bits').innerHTML = b;
        const toplam = deger();
        const acik = []; for (let i = bit - 1; i >= 0; i--) if (bitler[i]) acik.push(2 ** i);
        const goster = serbest || ($('toplamGoster').checked && mod === 'olustur');
        $('sum').textContent = goster ? (acik.length ? `${acik.join(' + ')} = ${toplam}` : '0') : '';
    }
    const deger = () => bitler.reduce((t, b, i) => t + (b ? 2 ** i : 0), 0);

    $('cards').addEventListener('click', (e) => {
        const k = e.target.closest('.bcard');
        if (!k || k.disabled || kilitli) return;
        const i = +k.dataset.b;
        bitler[i] = !bitler[i];
        KL.ses('tik');
        guncelle();
    });

    function basla(i) {
        sv = SEVIYELER[i]; sv.no = i; serbest = false;
        tur = 0; hata = 0; baslangic = Date.now();
        $('gTitle').textContent = `Seviye ${i + 1}: ${sv.baslik}`;
        $('kontrol').hidden = false; $('opts').hidden = false;
        goster('oyun');
        yeniTur();
    }

    function serbestBasla() {
        serbest = true; sv = null; mod = 'olustur';
        $('gTitle').textContent = 'Serbest Keşif';
        $('dots').innerHTML = '';
        bitler = Array(8).fill(false);
        kartlariCiz(8, true);
        $('taskQ').innerHTML = 'Kartları aç ve kapat. Hangi sayıları oluşturabiliyorsun?';
        $('readIn').hidden = true; $('kontrol').hidden = true; $('temizle').hidden = false; $('opts').hidden = true;
        goster('oyun');
        guncelle();
    }

    function yeniTur() {
        kilitli = false;
        const max = 2 ** sv.bit - 1;
        mod = sv.mod === 'karisik' ? (tur % 2 ? 'oku' : 'olustur') : sv.mod;
        // Son turda büyük bir sayı gelsin ki tüm kartlar kullanılsın
        const onceki = hedef;
        do { hedef = tur === TUR_SAYISI - 1 ? KL.rastgele(Math.floor(max * 0.75), max) : KL.rastgele(1, max); } while (hedef === onceki);
        kartlariCiz(sv.bit, mod === 'olustur');
        if (mod === 'olustur') {
            bitler = Array(sv.bit).fill(false);
            $('taskQ').innerHTML = `Kartları çevirerek bu sayıyı oluştur:<b>${hedef}</b>`;
            $('readIn').hidden = true; $('temizle').hidden = false;
        } else {
            bitler = Array.from({ length: sv.bit }, (_, i) => !!(hedef & (1 << i)));
            $('taskQ').innerHTML = 'Açık kartların gösterdiği sayı kaç?<b>?</b>';
            $('readIn').hidden = false; $('temizle').hidden = true;
            $('okuInput').value = '';
            setTimeout(() => $('okuInput').focus(), 50);
        }
        $('opts').hidden = mod !== 'olustur';
        noktalar();
        guncelle();
    }

    function noktalar() {
        let h = '';
        for (let i = 0; i < TUR_SAYISI; i++) h += `<span class="${i < tur ? 'ok' : i === tur ? 'cur' : ''}"></span>`;
        $('dots').innerHTML = h;
    }

    function kontrolEt() {
        if (kilitli) return;
        const dogru = mod === 'olustur' ? deger() === hedef : parseInt($('okuInput').value, 10) === hedef;
        if (mod === 'oku' && $('okuInput').value === '') { $('okuInput').focus(); return; }
        if (!dogru) {
            hata++;
            KL.ses('yanlis');
            const t = $('task'); t.classList.remove('shake'); t.offsetWidth; t.classList.add('shake');
            KL.bildir(mod === 'olustur' ? `Şu an ${deger()} oluşturdun, ${hedef} olmalı.` : 'Tekrar topla: sadece açık kartlar sayılır.');
            return;
        }
        kilitli = true;
        KL.ses('dogru');
        if (mod === 'oku') $('taskQ').innerHTML = `Açık kartların gösterdiği sayı kaç?<b>${hedef}</b>`;
        KL.bildir('Doğru! 🎉', 900);
        tur++;
        noktalar();
        setTimeout(() => (tur < TUR_SAYISI ? yeniTur() : bitir()), 900);
    }

    function bitir() {
        const sn = Math.round((Date.now() - baslangic) / 1000);
        let y = hata === 0 ? 3 : hata <= 2 ? 2 : 1;
        if (sv.sure && sn > 60) y = Math.min(y, 2);
        if (sv.sure && sn > 120) y = 1;
        if (y > (kayit.yildiz[sv.no] || 0)) { kayit.yildiz[sv.no] = y; KL.yaz('ikilik', kayit); }
        $('rTitle').textContent = y === 3 ? 'Kusursuz!' : 'Seviye tamam!';
        $('rStars').innerHTML = KL.yildizHTML(y);
        $('rText').textContent = `${TUR_SAYISI} sayıyı ${sn} saniyede, ${hata} hatayla tamamladın.` +
            (sv.sure && sn > 60 ? ' 3 yıldız için 60 saniyenin altına in!' : '');
        $('rNext').hidden = sv.no === SEVIYELER.length - 1;
        if (y === 3) KL.konfeti();
        goster('sonuc');
    }

    $('kontrol').addEventListener('click', kontrolEt);
    $('okuInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') kontrolEt(); });
    $('temizle').addEventListener('click', () => { if (kilitli) return; bitler = bitler.map(() => false); guncelle(); });
    $('toplamGoster').addEventListener('change', guncelle);
    $('geri').addEventListener('click', listeCiz);
    $('rList').addEventListener('click', listeCiz);
    $('rAgain').addEventListener('click', () => basla(sv.no));
    $('rNext').addEventListener('click', () => basla(sv.no + 1));

    listeCiz();
})();
