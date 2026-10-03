// KodLab — Bilgisayarsız çalışma kağıtları arayüzü
(function () {
    'use strict';
    const K = window.Kagit;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    let secili = K.KAGITLAR[0], tohum = yeniTohum(), kademe = 2;

    function yeniTohum() { return 1000 + Math.floor(Math.random() * 899000); }
    const alt = () => `<div class="alt"><span>KodLab · yasinyel.com/kodlab</span><span>Sürüm: ${secili.id}-${kademe}-${tohum}</span></div>`;
    function sayfa(baslik, yonerge, icerik, anahtar) {
        return `<div class="sayfa ${anahtar ? 'anahtar' : 'ogrenci'}">${anahtar ? '<span class="anahtar-etiket">CEVAP ANAHTARI</span>' : ''}
            <div class="ust"><b>KodLab · Bilgisayarsız Etkinlik</b><span>${secili.sinif[0]}.–${secili.sinif[1]}. sınıf</span></div>
            <h2>${kacis(baslik)}</h2>
            ${anahtar ? '' : '<div class="kimlik"><span>Ad Soyad:</span><span>Sınıf:</span><span>Tarih:</span></div>'}
            ${yonerge ? `<div class="yonerge">${yonerge}</div>` : ''}${icerik}${alt()}</div>`;
    }

    // ---------- Robot ızgarası ----------
    function izgaraSVG(iz, bas, hedef, yol) {
        const H = 40, G = iz[0].length, Y = iz.length;
        let s = `<svg viewBox="-2 -2 ${G * H + 4} ${Y * H + 4}" width="${G * H + 4}">`;
        for (let y = 0; y < Y; y++) for (let x = 0; x < G; x++) {
            s += `<rect x="${x * H}" y="${y * H}" width="${H}" height="${H}" fill="${iz[y][x] === '#' ? '#4b5563' : '#fff'}" stroke="#777"/>`;
            if (iz[y][x] === '#') s += `<path d="M${x * H + 6},${y * H + H - 6} L${x * H + H - 6},${y * H + 6}" stroke="#9ca3af" stroke-width="3"/>`;
        }
        if (yol) {
            let [x, y] = bas; const p = [[x, y]];
            yol.forEach(ad => { const d = K.YONLER.find(v => v[0] === ad); x += d[1]; y += d[2]; p.push([x, y]); });
            s += `<polyline points="${p.map(([a, b]) => `${a * H + H / 2},${b * H + H / 2}`).join(' ')}" fill="none" stroke="#dc2626" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
        }
        s += `<text x="${bas[0] * H + H / 2}" y="${bas[1] * H + H / 2 + 9}" text-anchor="middle" font-size="26">🤖</text>`;
        s += `<text x="${hedef[0] * H + H / 2}" y="${hedef[1] * H + H / 2 + 9}" text-anchor="middle" font-size="26">⭐</text>`;
        return s + '</svg>';
    }
    const kutular = (l, ek = 0, isaretli = -1) => `<div class="kutular">${[...l, ...Array(ek).fill('')].map((a, i) => `<span class="${i === isaretli ? 'hatali' : ''}"><small>${i + 1}</small>${a}</span>`).join('')}</div>`;

    const CIZICILER = {
        robot(t, kd, anahtar) {
            const b = [K.robotYolu(t, kd), K.robotYolu(t * 7 + 1, kd)];
            const yon = 'Robot 🤖 yıldıza ⭐ gitmek istiyor. Gri kareler duvardır. Robotu <b>en az adımla</b> yıldıza götüren ok programını kutulara yaz. Oklar: ↑ yukarı · → sağa · ↓ aşağı · ← sola';
            return sayfa('Robot Yolu', anahtar ? '' : yon, b.map((p, i) => `<div class="bulmaca"><h3>Bulmaca ${i + 1}${anahtar ? ` — ${p.cevap.length} adım` : ''}</h3>${izgaraSVG(p.izgara, p.bas, p.hedef, anahtar ? p.cevap : null)}${kutular(anahtar ? p.cevap : [], anahtar ? 0 : p.cevap.length + 2)}</div>`).join(''), anahtar);
        },
        hata(t, kd, anahtar) {
            const b = [K.hataAvi(t, kd), K.hataAvi(t * 7 + 1, kd)];
            const yon = 'Bu programlarda <b>bir adım hatalı</b>, bu yüzden robot yıldıza ulaşamıyor. Programı parmağınla izle, hatalı kutuyu yuvarlak içine al ve altına doğru oku yaz. Gri kareler duvardır.';
            return sayfa('Hata Avcısı', anahtar ? '' : yon, b.map((p, i) => {
                const dogru = [...p.program]; dogru[p.hataSirasi] = p.dogru;
                return `<div class="bulmaca"><h3>Program ${i + 1}${anahtar ? ` — Hata: ${p.hataSirasi + 1}. adım, ${p.program[p.hataSirasi]} yerine <span class="cevap-y">${p.dogru}</span>` : ''}</h3>
                    ${izgaraSVG(p.izgara, p.bas, p.hedef, anahtar ? dogru : null)}${kutular(p.program, 0, anahtar ? p.hataSirasi : -1)}${anahtar ? '' : '<p style="font-size:12px;margin-top:6px">Doğrusu: ______ . adım ______ olmalı.</p>'}</div>`;
            }).join(''), anahtar);
        },
        ikilik(t, kd, anahtar) {
            const p = K.ikilik(t, kd);
            const kart = Array.from({ length: p.bit }, (_, i) => 2 ** (p.bit - 1 - i));
            const kartlar = `<div class="kartlar">${kart.map(v => `<div><div class="noktalar">${v <= 32 ? Array(v).fill('<i></i>').join('') : `<span style="font-size:20px">●×${v}</span>`}</div>${v}</div>`).join('')}</div>`;
            const yon = `Her kartın bir yüzü noktalı (1), diğer yüzü boştur (0). Kartlar soldan sağa ${kart.join(', ')} nokta taşır. Bir sayıyı ikilikte yazmak için hangi kartların açık olacağını bul: açık kart <b>1</b>, kapalı kart <b>0</b>.`;
            const tablo = (baslik, l, solA, sagA) => `<table class="kt"><tr><th>${solA}</th><th>${sagA}</th></tr>${l.map(q => `<tr><td style="font-family:var(--mono);font-size:16px">${q.soru}</td><td class="${anahtar ? 'cevap' : 'bos'}">${anahtar ? q.cevap : ''}</td></tr>`).join('')}</table>`;
            return sayfa('İkilik Sayılar', anahtar ? '' : yon, kartlar + `<div class="iki"><div><h3 style="font-size:14px">Onluktan ikiliğe</h3>${tablo('', p.onlukIkilik, 'Onluk', `İkilik (${p.bit} bit)`)}</div><div><h3 style="font-size:14px">İkilikten onluğa</h3>${tablo('', p.ikilikOnluk, 'İkilik', 'Onluk')}</div></div>
                ${anahtar ? '' : '<p style="font-size:13px;margin-top:10px"><b>Düşün:</b> Kartların hepsi açıkken kaç olur? Bir kart daha ekleseydik kaç nokta taşırdı?</p>'}`, anahtar);
        },
        piksel(t, kd, anahtar) {
            const p = K.piksel(t), H = 38;
            let s = `<svg viewBox="-150 -2 ${p.gen * H + 154} ${p.kodlar.length * H + 4}" width="${p.gen * H + 154}">`;
            p.kodlar.forEach((kod, y) => {
                s += `<text x="-12" y="${y * H + H / 2 + 6}" text-anchor="end" font-size="17" font-family="monospace" font-weight="700">${kod.join(', ')}</text>`;
                for (let x = 0; x < p.gen; x++) s += `<rect x="${x * H}" y="${y * H}" width="${H}" height="${H}" fill="${anahtar && p.cevap[y][x] === '#' ? '#111' : '#fff'}" stroke="#777"/>`;
            });
            s += '</svg>';
            const yon = 'Bilgisayarlar resimleri sıkıştırarak saklar. Her satırın başındaki sayılar sırayla <b>kaç beyaz, kaç siyah, kaç beyaz…</b> kare olduğunu söyler. Satır her zaman beyazla başlar (ilk sayı 0 ise ilk kare siyahtır). Kareleri boyayarak gizli resmi bul!';
            return sayfa(anahtar ? `Piksel Resim — ${p.ad}` : 'Piksel Resim', anahtar ? '' : yon, `<div style="display:flex;justify-content:center;margin-top:10px">${s}</div>
                ${anahtar ? '' : '<p style="font-size:13px;margin-top:14px">Resmin ne? ____________________ &nbsp;&nbsp; <b>Düşün:</b> Bu yöntem hangi resimlerde çok yer kazandırır, hangilerinde kazandırmaz?</p>'}`, anahtar);
        },
        sifre(t, kd, anahtar) {
            const p = K.sifre(t), A = [...K.ALFABE];
            const cark = (r, rh, renk, kes) => {
                let s = `<svg viewBox="${-r - 6} ${-r - 6} ${2 * r + 12} ${2 * r + 12}" width="${2 * r + 12}"><circle r="${r}" fill="${renk}" stroke="#333" ${kes ? 'stroke-dasharray="6 4"' : ''}/>`;
                A.forEach((h, i) => {
                    const a = (i / A.length) * 2 * Math.PI - Math.PI / 2;
                    s += `<text x="${Math.cos(a) * rh}" y="${Math.sin(a) * rh + 5}" text-anchor="middle" font-size="14" font-weight="700" transform="rotate(${i * 360 / A.length} ${Math.cos(a) * rh} ${Math.sin(a) * rh})">${h}</text>`;
                    s += `<line x1="${Math.cos(a + Math.PI / A.length) * (rh - 12)}" y1="${Math.sin(a + Math.PI / A.length) * (rh - 12)}" x2="${Math.cos(a + Math.PI / A.length) * r}" y2="${Math.sin(a + Math.PI / A.length) * r}" stroke="#bbb"/>`;
                });
                return s + '<circle r="3" fill="#333"/></svg>';
            };
            const tablo = (l, a, b) => `<table class="kt"><tr><th>${a}</th><th>${b}</th></tr>${l.map(q => `<tr><td style="font-family:var(--mono)">${q.soru}</td><td class="${anahtar ? 'cevap' : 'bos'}">${anahtar ? q.cevap : ''}</td></tr>`).join('')}</table>`;
            const yon = `İki çarkı kesip ortalarından bir raptiyeyle birleştir. İç çarkı <b>${p.anahtar} harf</b> döndürerek şifrele: dış çarktaki harfin karşısındaki iç harfi yaz. Çözmek için tersini yap. (Türk alfabesi, 29 harf)`;
            return sayfa('Sezar Şifresi', anahtar ? '' : yon, `${anahtar ? `<p><b>Anahtar:</b> ${p.anahtar} (her harf ${p.anahtar} ileri kayar)</p>` : `<div style="display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap">${cark(130, 114, '#fff', true)}${cark(96, 80, '#f3f4f6', true)}</div>`}
                <div class="iki"><div><h3 style="font-size:14px">Şifrele (anahtar ${p.anahtar})</h3>${tablo(p.sifrele, 'Açık mesaj', 'Şifreli')}</div><div><h3 style="font-size:14px">Çöz (anahtar ${p.anahtar})</h3>${tablo(p.coz, 'Şifreli', 'Açık mesaj')}</div></div>`, anahtar);
        },
        parite(t, kd, anahtar) {
            const p = K.parite(t, kd), H = 40, n = p.n + 1;
            let s = `<svg viewBox="-2 -2 ${n * H + 4} ${n * H + 4}" width="${n * H + 4}">`;
            p.izgara.forEach((sat, y) => sat.forEach((v, x) => {
                const ek = x === p.n || y === p.n;
                s += `<rect x="${x * H + 3}" y="${y * H + 3}" width="${H - 6}" height="${H - 6}" rx="4" fill="${v ? '#111' : '#fff'}" stroke="${ek ? '#2563eb' : '#555'}" stroke-width="${ek ? 3 : 1.5}"/>`;
            }));
            if (anahtar) s += `<circle cx="${p.cevap[0] * H + H / 2}" cy="${p.cevap[1] * H + H / 2}" r="${H / 2 + 2}" fill="none" stroke="#dc2626" stroke-width="4"/>`;
            s += '</svg>';
            const yon = `Sihirbaz ${p.n}×${p.n} kartlık bir tablo dizdi ve her satırın, her sütunun sonuna (mavi çerçeveli) <b>bir kart daha ekledi</b>: böylece her satırda ve her sütunda <b>siyah kart sayısı çift</b> oldu. Sen arkanı dönünce bir kartı ters çevirdi. Hangi kart? Siyah sayısı tek olan satırı ve sütunu bul, kesiştikleri kartı yuvarlak içine al.`;
            return sayfa('Parite Sihri', anahtar ? '' : yon, `<div style="display:flex;justify-content:center;margin:10px 0">${s}</div>
                ${anahtar ? `<p>Çevrilen kart: <b>${p.cevap[1] + 1}. satır, ${p.cevap[0] + 1}. sütun</b></p>` : '<p style="font-size:13px">Satır: _____ &nbsp; Sütun: _____</p><p style="font-size:13px;margin-top:8px"><b>Düşün:</b> Bilgisayarlar veri gönderirken bu yöntemi neden kullanır? İki kart birden çevrilseydi bulabilir miydin?</p>'}`, anahtar);
        },
        mantik(t, kd, anahtar) {
            const p = K.mantik(t, kd);
            const kapi = (x, y, ad) => `<rect x="${x}" y="${y}" width="96" height="56" rx="10" fill="#fff" stroke="#111" stroke-width="2"/><text x="${x + 48}" y="${y + 33}" text-anchor="middle" font-size="14" font-weight="800">${ad}</text>`;
            let s = '<svg viewBox="0 0 520 190" width="520">';
            s += '<text x="10" y="44" font-size="16" font-weight="700">A</text><text x="10" y="104" font-size="16" font-weight="700">B</text>';
            s += '<line x1="26" y1="40" x2="110" y2="56" stroke="#111" stroke-width="2"/><line x1="26" y1="100" x2="110" y2="84" stroke="#111" stroke-width="2"/>';
            s += kapi(110, 42, p.g1);
            const cx = p.degil ? 222 : 206;
            if (p.degil) s += '<circle cx="214" cy="70" r="7" fill="#fff" stroke="#111" stroke-width="2"/>';
            if (p.g2) {
                s += `<line x1="${cx}" y1="70" x2="300" y2="96" stroke="#111" stroke-width="2"/><text x="10" y="164" font-size="16" font-weight="700">C</text><line x1="26" y1="160" x2="300" y2="124" stroke="#111" stroke-width="2"/>`;
                s += kapi(300, 82, p.g2) + '<line x1="396" y1="110" x2="470" y2="110" stroke="#111" stroke-width="2"/><text x="478" y="116" font-size="16" font-weight="700">Ç</text>';
            } else s += `<line x1="${cx}" y1="70" x2="300" y2="70" stroke="#111" stroke-width="2"/><text x="308" y="76" font-size="16" font-weight="700">Ç</text>`;
            s += '</svg>';
            const yon = '<b>VE:</b> iki giriş de 1 ise 1 · <b>VEYA:</b> en az biri 1 ise 1 · <b>ÖZEL VEYA:</b> girişler farklıysa 1' + (p.degil ? ' · <b>○ (DEĞİL):</b> sinyali tersine çevirir' : '') + '. Devrenin çıkışını (Ç) her satır için bul ve tabloya yaz.';
            return sayfa('Mantık Kapıları', anahtar ? '' : yon, `<div style="display:flex;justify-content:center">${s}</div>
                <table class="kt" style="max-width:420px;margin:10px auto"><tr>${p.giris.map(g => `<th>${g}</th>`).join('')}<th>Ç</th></tr>${p.tablo.map(r => `<tr>${r.girisler.map(v => `<td>${v}</td>`).join('')}<td class="${anahtar ? 'cevap' : 'bos'}">${anahtar ? r.cikis : ''}</td></tr>`).join('')}</table>`, anahtar);
        },
        ag(t, kd, anahtar) {
            const p = K.ag(t), konum = Object.fromEntries(p.dugumler.map(d => [d[0], [d[1], d[2]]]));
            const yolda = (a, b) => p.cevap.yol.some((v, i) => i && ((p.cevap.yol[i - 1] === a && v === b) || (p.cevap.yol[i - 1] === b && v === a)));
            let s = '<svg viewBox="0 0 530 300" width="530">';
            p.kenarlar.forEach(([a, b, w]) => {
                const [x1, y1] = konum[a], [x2, y2] = konum[b], k = anahtar && yolda(a, b);
                s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${k ? '#dc2626' : '#555'}" stroke-width="${k ? 6 : 2.5}"/>`;
                s += `<circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="14" fill="#fff" stroke="#555"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + 5}" text-anchor="middle" font-size="15" font-weight="800">${w}</text>`;
            });
            p.dugumler.forEach(([ad, x, y]) => { s += `<circle cx="${x}" cy="${y}" r="22" fill="${ad === 'A' || ad === 'F' ? '#2563eb' : '#fff'}" stroke="#111" stroke-width="2"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="800" fill="${ad === 'A' || ad === 'F' ? '#fff' : '#111'}">${ad}</text>`; });
            s += '</svg>';
            const yon = 'İnternetteki veri paketleri yönlendiriciler (harfler) arasında yolculuk eder. Çizgilerdeki sayılar o bağlantıdan geçmenin süresidir (ms). Paketi <b>A\'dan F\'ye en kısa sürede</b> götüren yolu bul ve kalemle boya.';
            return sayfa('En Kısa Yol', anahtar ? '' : yon, `<div style="display:flex;justify-content:center;margin:8px 0">${s}</div>
                ${anahtar ? `<p>En kısa yol: <b class="cevap-y">${p.cevap.yol.join(' → ')}</b> · Toplam süre: <b class="cevap-y">${p.cevap.uzunluk} ms</b></p>` : '<p style="font-size:14px">Yol: A → ____ → ____ → ____ → F &nbsp;&nbsp; Toplam süre: ______ ms</p><p style="font-size:13px;margin-top:8px"><b>Düşün:</b> D–F bağlantısı kopsaydı paket hangi yoldan giderdi?</p>'}`, anahtar);
        }
    };

    // ---------- Arayüz ----------
    function listeCiz() {
        $('liste').innerHTML = K.KAGITLAR.map(k => `<button data-id="${k.id}" class="${k === secili ? 'sel' : ''}"><i class="fas ${k.ikon}"></i><span><b>${k.ad}</b><small>${k.sinif[0]}.–${k.sinif[1]}. sınıf · ${k.aciklama}</small></span></button>`).join('');
    }
    function ciz() {
        $('kademe').disabled = !secili.kademeli;
        $('onizleme').innerHTML = CIZICILER[secili.id](tohum, kademe, false) + CIZICILER[secili.id](tohum, kademe, true);
        $('surum').textContent = `Sürüm: ${secili.id}-${kademe}-${tohum}`;
        history.replaceState(null, '', `#${secili.id}-${kademe}-${tohum}`);
        listeCiz();
    }
    $('liste').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; secili = K.KAGITLAR.find(k => k.id === b.dataset.id); tohum = yeniTohum(); ciz(); };
    $('kademe').onchange = () => { kademe = +$('kademe').value; ciz(); };
    $('yeni').onclick = () => { tohum = yeniTohum(); ciz(); };
    const yazdir = (anahtar) => {
        document.querySelectorAll('.sayfa').forEach(s => s.classList.toggle('gizle-yazdir', s.classList.contains('anahtar') !== anahtar));
        window.print();
    };
    $('yazdir').onclick = () => yazdir(false);
    $('yazdirAnahtar').onclick = () => yazdir(true);

    const m = location.hash.match(/^#(\w+)-(\d)-(\d+)$/);
    if (m && K.KAGITLAR.some(k => k.id === m[1])) { secili = K.KAGITLAR.find(k => k.id === m[1]); kademe = +m[2]; tohum = +m[3]; $('kademe').value = kademe; }
    else if (/^#\w+$/.test(location.hash)) secili = K.KAGITLAR.find(k => k.id === location.hash.slice(1)) || secili;
    ciz();
})();
