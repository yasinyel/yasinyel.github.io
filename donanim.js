// Kodlayalım — Bilgisayarın İçi arayüzü
(function () {
    'use strict';
    const D = window.Donanim;
    const $ = (id) => document.getElementById(id);
    const kacis = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const kayit = KL.oku('donanim', { yildiz: {} });
    let bolum = null, hata = 0;

    function goster(id) { ['liste', 'oyun', 'sonuc'].forEach(s => { $(s).hidden = s !== id; }); window.scrollTo(0, 0); }
    function listeCiz() {
        $('bolumler').innerHTML = D.BOLUMLER.map(b => `<button class="card bol" data-id="${b.id}"><span class="ik" style="background:${b.renk}"><i class="fas ${b.ikon}"></i></span>
            <small>${b.sinif[0]}. – ${b.sinif[1]}. sınıf</small><h3>${b.ad}</h3><p>${b.ozet}</p>${KL.yildizHTML(kayit.yildiz[b.id] || 0)}</button>`).join('');
        goster('liste');
    }
    $('bolumler').addEventListener('click', (e) => { const b = e.target.closest('.bol'); if (b) basla(b.dataset.id); });
    $('geri').onclick = listeCiz; $('sListe').onclick = listeCiz; $('sTekrar').onclick = () => basla(bolum.id);
    function basla(id) {
        bolum = D.BOLUMLER.find(b => b.id === id); hata = 0;
        $('baslik').textContent = bolum.ad; $('dots').innerHTML = '';
        goster('oyun');
        ({ topla, eslestir, sinifla, birim, ariza })[id]();
        history.replaceState(null, '', '#' + id);
    }
    function noktalar(n, i) { $('dots').innerHTML = Array.from({ length: n }, (_, j) => `<span class="${j < i ? 'ok' : j === i ? 'cur' : ''}"></span>`).join(''); }
    function bitir(metin) {
        const y = D.yildiz(hata);
        if (y > (kayit.yildiz[bolum.id] || 0)) { kayit.yildiz[bolum.id] = y; KL.yaz('donanim', kayit); }
        $('sBaslik').textContent = y === 3 ? 'Usta teknisyen!' : 'Bölüm tamam!';
        $('sYildiz').innerHTML = KL.yildizHTML(y);
        $('sMetin').textContent = metin || (hata ? `${hata} hatayla bitirdin. Hatasız bitirirsen 3 yıldız alırsın.` : 'Hiç hata yapmadın!');
        if (y === 3) KL.konfeti(); else KL.ses('kazan');
        goster('sonuc');
    }

    // ---------- Parça çizimleri (SVG) ----------
    // Ortak degrade ve desenler sayfaya bir kez eklenir; bütün çizimler bunları kullanır
    if (!document.getElementById('dnTanimlar')) document.body.insertAdjacentHTML('beforeend', `<svg id="dnTanimlar" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
        <linearGradient id="dnMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset=".45" stop-color="#cbd5e1"/><stop offset=".55" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
        <linearGradient id="dnKoyuMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2937"/></linearGradient>
        <linearGradient id="dnAltin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#d97706"/></linearGradient>
        <linearGradient id="dnBakir" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b45309"/><stop offset=".5" stop-color="#fdba74"/><stop offset="1" stop-color="#9a3412"/></linearGradient>
        <linearGradient id="dnPcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14332d"/><stop offset="1" stop-color="#0b1f1b"/></linearGradient>
        <linearGradient id="dnKasa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b3445"/><stop offset="1" stop-color="#151a24"/></linearGradient>
        <linearGradient id="dnRgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset=".5" stop-color="#a855f7"/><stop offset="1" stop-color="#f43f5e"/></linearGradient>
        <linearGradient id="dnCam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".08"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".05"/></linearGradient>
        <pattern id="dnPin" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#b8860b"/><circle cx="2" cy="2" r=".9" fill="#fde68a"/></pattern>
        <pattern id="dnIzgara" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="#0b0f16"/></pattern>
        <pattern id="dnYol" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 8 H14 L20 14 H40 M0 26 H8 L14 32 H26 L32 26 H40 M8 0 V6 M30 0 V10 L34 14 V40" fill="none" stroke="#2f7d68" stroke-width=".8" opacity=".55"/><circle cx="20" cy="14" r="1.2" fill="#c9a227" opacity=".7"/><circle cx="26" cy="32" r="1.2" fill="#c9a227" opacity=".7"/></pattern>
    </defs></svg>`);
    // Fan: kanatlar, göbek ve çerçeve
    const fan = (cx, cy, r, renk = '#1f2937', kanat = '#475569', n = 7) => {
        let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${renk}"/>`;
        for (let i = 0; i < n; i++) s += `<path d="M${cx} ${cy} q ${r * .55} ${-r * .15} ${r * .78} ${-r * .62} q ${-r * .38} ${-r * .12} ${-r * .62} ${r * .05} Z" fill="${kanat}" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`;
        return s + `<circle cx="${cx}" cy="${cy}" r="${r * .3}" fill="#0f172a" stroke="#64748b" stroke-width="${r * .04}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#0b0f16" stroke-width="${r * .08}"/>`;
    };
    const tekrarla = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
    const CIZ = {
        cpu: `<rect x="12" y="2" width="48" height="44" rx="3" fill="#166534"/><rect x="15" y="5" width="42" height="38" rx="3" fill="url(#dnMetal)" stroke="#94a3b8" stroke-width=".8"/>
            <path d="M15 5 L21 5 L15 11 Z" fill="#d97706"/><text x="36" y="20" text-anchor="middle" font-size="5.5" font-weight="800" fill="#334155" font-family="sans-serif">KODLAYALIM</text>
            <text x="36" y="28" text-anchor="middle" font-size="7" font-weight="900" fill="#1e293b" font-family="sans-serif">K7</text><text x="36" y="35" text-anchor="middle" font-size="4" fill="#475569" font-family="sans-serif">8 ÇEKİRDEK · 4.2 GHz</text>`,
        sogutucu: `<rect x="10" y="1" width="52" height="46" rx="4" fill="#111827" stroke="#374151"/>
            ${tekrarla(4, i => `<rect x="${14 + i * 12}" y="0" width="4" height="48" rx="2" fill="url(#dnBakir)"/>`)}
            ${fan(36, 24, 20, '#0f172a', '#334155', 9)}<circle cx="36" cy="24" r="5" fill="#1d5fd6"/><path d="M33.5 24 h5 M36 21.5 v5" stroke="#e0f2fe" stroke-width="1.2"/>`,
        ram: `<rect x="2" y="12" width="68" height="26" rx="2" fill="#0f172a"/><rect x="2" y="9" width="68" height="5" rx="1.5" fill="url(#dnRgb)"/>
            <path d="M4 16 H68 V34 H4 Z" fill="url(#dnKoyuMetal)"/><path d="M8 16 l6 18 M20 16 l6 18 M32 16 l6 18 M44 16 l6 18 M56 16 l6 18" stroke="#6b7280" stroke-width="1.2"/>
            <text x="36" y="28" text-anchor="middle" font-size="5" font-weight="800" fill="#e5e7eb" font-family="sans-serif">DDR5 8GB</text>
            <rect x="4" y="38" width="64" height="4" fill="#166534"/>${tekrarla(20, i => `<rect x="${5 + i * 3.1}" y="40" width="2" height="4" fill="#f59e0b"/>`)}<rect x="34" y="38" width="3" height="6" fill="#fff" opacity=".9"/>`,
        ssd: `<rect x="2" y="14" width="66" height="20" rx="2" fill="#0f3d2e"/><rect x="62" y="16" width="6" height="16" fill="url(#dnAltin)"/>${tekrarla(6, i => `<rect x="62" y="${16.5 + i * 2.6}" width="6" height=".8" fill="#92400e"/>`)}
            <rect x="6" y="17" width="12" height="14" rx="1" fill="#111827"/><rect x="21" y="17" width="16" height="14" rx="1" fill="#1f2937"/><rect x="40" y="17" width="16" height="14" rx="1" fill="#1f2937"/>
            <rect x="21" y="18" width="35" height="7" rx="1" fill="#e2e8f0"/><text x="38.5" y="23.3" text-anchor="middle" font-size="4.4" font-weight="800" fill="#1d4ed8" font-family="sans-serif">NVMe 1 TB</text>
            <circle cx="3.5" cy="24" r="2.2" fill="#0b1f1b" stroke="url(#dnAltin)"/>`,
        gpu: `<rect x="2" y="6" width="68" height="34" rx="4" fill="#111827" stroke="#374151"/><path d="M2 12 L10 6 H62 L70 12" fill="none" stroke="#1d5fd6" stroke-width="1.5"/>
            ${fan(20, 23, 13, '#0b0f16', '#374151', 9)}${fan(52, 23, 13, '#0b0f16', '#374151', 9)}
            <rect x="34" y="9" width="4" height="28" rx="1" fill="#1d5fd6" opacity=".8"/><rect x="8" y="40" width="40" height="5" fill="url(#dnAltin)"/>${tekrarla(14, i => `<rect x="${9 + i * 2.8}" y="40" width=".8" height="5" fill="#92400e"/>`)}
            <rect x="0" y="6" width="3" height="38" fill="url(#dnMetal)"/>`,
        psu: `<rect x="4" y="4" width="64" height="40" rx="3" fill="url(#dnKoyuMetal)" stroke="#6b7280"/><circle cx="30" cy="24" r="15" fill="#0b0f16"/><circle cx="30" cy="24" r="15" fill="url(#dnIzgara)" opacity=".9"/>
            <g fill="none" stroke="#4b5563" stroke-width="1"><circle cx="30" cy="24" r="15"/><circle cx="30" cy="24" r="10"/><circle cx="30" cy="24" r="5"/><path d="M15 24 H45 M30 9 V39"/></g>
            <rect x="49" y="9" width="16" height="14" rx="1.5" fill="#e2e8f0"/><text x="57" y="15" text-anchor="middle" font-size="4.5" font-weight="900" fill="#111827" font-family="sans-serif">750W</text><text x="57" y="20.5" text-anchor="middle" font-size="3.4" fill="#16a34a" font-weight="800" font-family="sans-serif">80+ GOLD</text>
            <path d="M52 30 h10 v8 h-10 z" fill="#111827"/><text x="57" y="36" text-anchor="middle" font-size="5" fill="#facc15" font-family="sans-serif">⚡</text>`,
        yazici: `<rect x="12" y="2" width="48" height="14" rx="1" fill="#f8fafc" stroke="#94a3b8"/><path d="M18 6 h36 M18 10 h28" stroke="#cbd5e1"/>
            <rect x="4" y="14" width="64" height="22" rx="5" fill="url(#dnMetal)" stroke="#64748b"/><rect x="50" y="18" width="12" height="4" rx="1" fill="#1f2937"/><circle cx="12" cy="20" r="1.6" fill="#22c55e"/>
            <rect x="14" y="32" width="44" height="14" fill="#fff" stroke="#94a3b8"/><path d="M19 37 h30 M19 41 h22" stroke="#cbd5e1"/>`
    };
    const ikon = (id) => `<svg viewBox="0 0 72 48">${CIZ[id]}</svg>`;

    // ---------- 1. Bilgisayarı topla ----------
    function topla() {
        const takili = [];
        const parcalar = KL.karistir(D.PARCALAR);
        let secili = null;
        let calisiyor = false;
        const takiliCiz = () => {
            const P = (id) => takili.includes(id);
            let s = '';
            if (P('psu')) s += `<g pointer-events="none">
                <path d="M270 360 C 330 330, 400 300, 412 160" fill="none" stroke="#0b0f16" stroke-width="9" stroke-linecap="round"/><path d="M270 360 C 330 330, 400 300, 412 160" fill="none" stroke="#374151" stroke-width="9" stroke-dasharray="2 3"/>
                <path d="M70 352 C 60 250, 60 120, 84 50" fill="none" stroke="#0b0f16" stroke-width="6" stroke-linecap="round"/><path d="M70 352 C 60 250, 60 120, 84 50" fill="none" stroke="#374151" stroke-width="6" stroke-dasharray="2 3"/>
                <rect x="40" y="352" width="250" height="62" rx="6" fill="url(#dnKoyuMetal)" stroke="#6b7280"/>
                ${tekrarla(14, i => `<rect x="${52 + i * 9}" y="362" width="5" height="42" rx="2" fill="#0b0f16"/>`)}
                <rect x="186" y="362" width="92" height="42" rx="4" fill="#e2e8f0"/><text x="232" y="380" text-anchor="middle" font-size="13" font-weight="900" fill="#111827" font-family="sans-serif">750 W</text>
                <text x="232" y="396" text-anchor="middle" font-size="9" font-weight="800" fill="#16a34a" font-family="sans-serif">80+ GOLD ⚡</text></g>`;
            if (P('cpu')) s += `<g transform="translate(172 72) scale(1.79 1.95) translate(-12 -2)" pointer-events="none">${CIZ.cpu}</g>`;
            if (P('sogutucu')) s += `<g pointer-events="none">${tekrarla(4, i => `<rect x="${183 + i * 18}" y="54" width="8" height="122" rx="4" fill="url(#dnBakir)"/>`)}
                <rect x="161" y="61" width="108" height="108" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                <g class="donen" style="transform-origin:215px 115px">${fan(215, 115, 48, '#0b0f16', '#334155', 9)}</g>
                <circle cx="215" cy="115" r="13" fill="#1d5fd6"/><path d="M209 115 h12 M215 109 v12" stroke="#e0f2fe" stroke-width="2.4"/>
                ${[[166, 66], [256, 66], [166, 156], [256, 156]].map(([x, y]) => `<circle cx="${x + 4}" cy="${y + 4}" r="3" fill="url(#dnMetal)"/>`).join('')}</g>`;
            if (P('ram')) s += `<g pointer-events="none">${[312, 334].map(x => `<rect x="${x - 1}" y="60" width="12" height="150" rx="2" fill="url(#dnKoyuMetal)" stroke="#111827"/>
                <rect x="${x - 3}" y="62" width="4" height="146" rx="2" fill="url(#dnRgb)"/>${tekrarla(5, i => `<path d="M${x + 2} ${74 + i * 26} l7 14" stroke="#6b7280" stroke-width="1.5"/>`)}
                <text x="${x + 6}" y="135" transform="rotate(90 ${x + 6} 135)" text-anchor="middle" font-size="7" font-weight="800" fill="#e5e7eb" font-family="sans-serif">DDR5</text>`).join('')}</g>`;
            if (P('ssd')) s += `<g transform="translate(150 186) scale(1.9 1.3) translate(-2 -14)" pointer-events="none">${CIZ.ssd}</g>`;
            if (P('gpu')) s += `<g pointer-events="none"><rect x="62" y="214" width="336" height="88" rx="10" fill="#111827" stroke="#374151" stroke-width="2"/>
                <path d="M62 236 L84 214 H376 L398 236" fill="none" stroke="#1d5fd6" stroke-width="3"/><rect x="62" y="296" width="336" height="6" rx="3" fill="url(#dnRgb)" opacity=".85"/>
                ${[118, 230, 342].map(x => `<g class="donen" style="transform-origin:${x}px 258px">${fan(x, 258, 36, '#0b0f16', '#374151', 9)}</g>`).join('')}
                <text x="174" y="232" text-anchor="middle" font-size="9" font-weight="900" fill="#93c5fd" letter-spacing="2" font-family="sans-serif">GPU · 8 GB</text>
                <rect x="56" y="210" width="8" height="96" rx="2" fill="url(#dnMetal)"/></g>`;
            return s;
        };
        const kasaCiz = () => `<svg viewBox="0 0 600 440" id="kasaSvg" class="${calisiyor ? 'calisiyor' : ''}" role="img" aria-label="Bilgisayar kasası ve anakart">
            <rect x="10" y="10" width="580" height="420" rx="18" fill="url(#dnKasa)" stroke="#0b0f16" stroke-width="2"/>
            <rect x="18" y="18" width="564" height="404" rx="12" fill="none" stroke="#3b4556" stroke-width="1.5"/>
            <!-- Anakart -->
            <rect x="30" y="26" width="400" height="300" rx="6" fill="url(#dnPcb)" stroke="#0b1f1b" stroke-width="2"/>
            <rect x="30" y="26" width="400" height="300" rx="6" fill="url(#dnYol)"/>
            ${[[40, 36], [420, 36], [40, 316], [420, 316], [290, 36], [290, 316]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#0b1f1b" stroke="url(#dnAltin)" stroke-width="2.5"/>`).join('')}
            <!-- Arka giriş-çıkış paneli -->
            <rect x="32" y="48" width="30" height="130" rx="3" fill="url(#dnKoyuMetal)" stroke="#111827"/>
            ${[[36, 56, '#3b82f6'], [36, 70, '#3b82f6'], [36, 84, '#111827'], [36, 98, '#111827']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="10" height="9" rx="1" fill="${c}" stroke="#0b0f16"/><rect x="${x + 12}" y="${y}" width="10" height="9" rx="1" fill="${c}" stroke="#0b0f16"/>`).join('')}
            <rect x="37" y="114" width="20" height="16" rx="2" fill="#e5e7eb"/><rect x="41" y="118" width="12" height="9" fill="#111827"/>
            ${['#22c55e', '#ec4899', '#3b82f6'].map((c, i) => `<circle cx="${42 + i * 8}" cy="${146}" r="3.2" fill="${c}" stroke="#0b0f16"/>`).join('')}
            <!-- 8 pin işlemci gücü ve VRM soğutucuları -->
            <rect x="76" y="34" width="34" height="16" rx="2" fill="#0b0f16"/>${tekrarla(8, i => `<rect x="${79 + (i % 4) * 7.5}" y="${36 + Math.floor(i / 4) * 7}" width="5" height="5" rx="1" fill="#1f2937"/>`)}
            <rect x="130" y="66" width="30" height="104" rx="3" fill="url(#dnKoyuMetal)"/>${tekrarla(9, i => `<rect x="130" y="${70 + i * 11}" width="30" height="4" fill="#111827" opacity=".7"/>`)}
            <rect x="166" y="38" width="100" height="24" rx="3" fill="url(#dnKoyuMetal)"/>${tekrarla(11, i => `<rect x="${170 + i * 9}" y="38" width="4" height="24" fill="#111827" opacity=".7"/>`)}
            <text x="216" y="54" text-anchor="middle" font-size="7" font-weight="800" fill="#9ca3af" letter-spacing="1.5" font-family="sans-serif">KODLAYALIM</text>
            ${tekrarla(6, i => `<circle cx="${121}" cy="${80 + i * 14}" r="3.6" fill="#111827" stroke="#64748b" stroke-width="1.2"/>`)}
            <!-- İşlemci soketi -->
            <rect x="170" y="70" width="90" height="90" rx="5" fill="url(#dnMetal)"/><rect x="178" y="78" width="74" height="74" fill="url(#dnPin)"/>
            <rect x="200" y="100" width="30" height="30" fill="#14332d" opacity=".55"/><path d="M262 74 V158 M262 74 h6" stroke="url(#dnMetal)" stroke-width="3" fill="none"/>
            <path d="M178 78 L186 78 L178 86 Z" fill="#fde68a"/>
            <!-- RAM yuvaları -->
            ${[302, 312, 324, 334].map((x, i) => `<rect x="${x}" y="62" width="8" height="146" rx="1" fill="${i % 2 ? '#0b0f16' : '#374151'}"/><rect x="${x - 1}" y="58" width="10" height="7" rx="1.5" fill="#e5e7eb"/><rect x="${x - 1}" y="205" width="10" height="7" rx="1.5" fill="#e5e7eb"/>`).join('')}
            <text x="324" y="224" text-anchor="middle" font-size="7" fill="#6ee7b7" opacity=".8" font-family="monospace">DIMM_A1 A2 B1 B2</text>
            <!-- 24 pin güç ve SATA -->
            <rect x="404" y="80" width="18" height="84" rx="2" fill="#0b0f16"/>${tekrarla(12, i => `<rect x="407" y="${84 + i * 6.6}" width="5" height="5" fill="#1f2937"/><rect x="414" y="${84 + i * 6.6}" width="5" height="5" fill="#1f2937"/>`)}
            ${tekrarla(4, i => `<rect x="400" y="${196 + i * 16}" width="22" height="11" rx="1.5" fill="#1f2937" stroke="#0b0f16"/><rect x="404" y="${199 + i * 16}" width="14" height="4" fill="#0b0f16"/>`)}
            <text x="411" y="270" text-anchor="middle" font-size="6.5" fill="#6ee7b7" opacity=".8" font-family="monospace">SATA</text>
            <!-- M.2 yuvası -->
            <rect x="150" y="186" width="130" height="26" rx="3" fill="#0b1f1b" stroke="#2f7d68"/><rect x="270" y="188" width="10" height="22" rx="1" fill="#111827"/><circle cx="156" cy="199" r="3.5" fill="url(#dnAltin)"/>
            <text x="212" y="203" text-anchor="middle" font-size="9" font-weight="700" fill="#6ee7b7" opacity=".85" font-family="monospace">M.2_1 NVMe</text>
            <text x="92" y="200" text-anchor="middle" font-size="9" font-weight="900" fill="#6ee7b7" opacity=".65" letter-spacing="1" font-family="sans-serif">KL-B760</text>
            <!-- PCIe yuvaları -->
            <rect x="70" y="248" width="310" height="26" rx="3" fill="#0b0f16" stroke="url(#dnMetal)" stroke-width="3"/><rect x="80" y="257" width="290" height="7" rx="2" fill="#1f2937"/><rect x="372" y="244" width="12" height="34" rx="2" fill="#e5e7eb"/>
            <rect x="70" y="292" width="80" height="16" rx="2" fill="#0b0f16"/><rect x="76" y="297" width="68" height="6" rx="1" fill="#1f2937"/>
            <text x="225" y="244" text-anchor="middle" font-size="7" fill="#6ee7b7" opacity=".8" font-family="monospace">PCIEX16_1</text>
            <!-- Çipset, pil, ses çipi -->
            <rect x="300" y="282" width="76" height="38" rx="5" fill="url(#dnKoyuMetal)" stroke="#111827"/><text x="338" y="305" text-anchor="middle" font-size="8" font-weight="900" fill="#9ca3af" letter-spacing="1" font-family="sans-serif">ÇİPSET</text>
            <circle cx="212" cy="304" r="12" fill="url(#dnMetal)" stroke="#64748b"/><text x="212" y="307" text-anchor="middle" font-size="6" font-weight="800" fill="#475569" font-family="sans-serif">CR2032</text>
            <rect x="248" y="292" width="22" height="22" rx="2" fill="#111827"/><text x="259" y="306" text-anchor="middle" font-size="5" fill="#9ca3af" font-family="sans-serif">SES</text>
            ${tekrarla(5, i => `<circle cx="${164 + i * 9}" cy="${316}" r="3" fill="#111827" stroke="#a16207" stroke-width="1"/>`)}
            <!-- Güç kaynağı bölmesi -->
            <rect x="22" y="336" width="420" height="84" rx="8" fill="#111827" stroke="#273142"/>${tekrarla(10, i => `<rect x="${304 + i * 12}" y="350" width="6" height="56" rx="3" fill="#0b0f16"/>`)}
            <!-- Ön fanlar ve disk kafesi -->
            ${[80, 190].map(y => `<rect x="474" y="${y - 50}" width="100" height="100" rx="12" fill="#0f141d" stroke="#273142"/><g class="donen" style="transform-origin:524px ${y}px">${fan(524, y, 42, '#0b0f16', '#2b3445', 9)}</g><circle cx="524" cy="${y}" r="44" fill="none" stroke="url(#dnRgb)" stroke-width="3" opacity=".8"/>`).join('')}
            <rect x="468" y="268" width="104" height="146" rx="8" fill="#0f141d" stroke="#273142"/>
            ${[0, 1].map(i => `<rect x="478" y="${282 + i * 64}" width="84" height="52" rx="5" fill="url(#dnKoyuMetal)"/><circle cx="520" cy="${308 + i * 64}" r="15" fill="none" stroke="#6b7280" stroke-width="2"/><text x="520" y="${311 + i * 64}" text-anchor="middle" font-size="7" fill="#9ca3af" font-family="sans-serif">HDD</text>`).join('')}
            <!-- Takma yerleri (tıklanabilir) -->
            <rect data-yuva="cpu" x="170" y="70" width="90" height="90" rx="6" fill="#fff" fill-opacity=".01" stroke="#6ee7b7" stroke-opacity="${takili.includes('sogutucu') ? 0 : .55}" stroke-width="2"/>
            <rect data-yuva="ram" x="298" y="56" width="50" height="158" rx="4" fill="#fff" fill-opacity=".01" stroke="#6ee7b7" stroke-opacity="${takili.includes('ram') ? 0 : .55}" stroke-width="2"/>
            <rect data-yuva="m2" x="148" y="184" width="134" height="30" rx="4" fill="#fff" fill-opacity=".01" stroke="#6ee7b7" stroke-opacity="${takili.includes('ssd') ? 0 : .55}" stroke-width="2"/>
            <rect data-yuva="pcie" x="66" y="242" width="320" height="38" rx="4" fill="#fff" fill-opacity=".01" stroke="#6ee7b7" stroke-opacity="${takili.includes('gpu') ? 0 : .55}" stroke-width="2"/>
            <rect data-yuva="psu" x="40" y="352" width="250" height="62" rx="6" fill="#fff" fill-opacity=".02" stroke="#64748b" stroke-width="2" stroke-dasharray="8 6"/>
            ${takili.includes('psu') ? '' : '<text x="165" y="388" fill="#94a3b8" font-size="12" font-weight="700" text-anchor="middle" pointer-events="none" font-family="sans-serif">GÜÇ KAYNAĞI BÖLMESİ</text>'}
            ${takiliCiz()}
            <rect x="10" y="10" width="580" height="420" rx="18" fill="url(#dnCam)" pointer-events="none"/></svg>`;
        $('icerik').innerHTML = `<div class="topla"><div class="card panel kasa" id="kasa">${kasaCiz()}</div>
            <div class="card panel"><p style="font-weight:700">Parçaları anakarttaki doğru yerlere sürükle (ya da önce parçaya, sonra yerine dokun).</p>
            <div class="tepsi" id="tepsi" style="margin-top:12px">${parcalar.map(p => `<div class="parca" data-id="${p.id}">${ikon(p.id)}<span>${kacis(p.ad)}</span></div>`).join('')}</div>
            <p class="fb" id="fb"></p><div id="devam"></div></div></div>`;
        const yuvaBul = (x, y, pid) => {
            const el = document.elementFromPoint(x, y);
            const r = el && el.closest('[data-yuva]');
            if (!r) return null;
            const id = r.dataset.yuva;
            return id === 'cpu' && (takili.includes('cpu') || pid === 'sogutucu') ? 'sogutucu' : id;
        };
        const dene = (pid, yuva) => {
            if (!yuva) return;
            const r = D.tak(takili, pid, yuva);
            $('fb').className = r.tamam ? 'fb ok' : 'fb bad';
            $('fb').textContent = r.mesaj;
            const kart = document.querySelector(`.parca[data-id="${pid}"]`);
            if (!r.tamam) { hata++; KL.ses('yanlis'); kart.classList.remove('titre'); void kart.offsetWidth; kart.classList.add('titre'); return; }
            takili.push(pid); KL.ses('dogru');
            kart.classList.add('takildi'); kart.classList.remove('sec');
            $('kasa').innerHTML = kasaCiz();
            if (D.toplamaBitti(takili)) {
                $('devam').innerHTML = '<button class="btn btn-primary" style="margin-top:12px;width:100%"><i class="fas fa-power-off"></i> Bilgisayarı çalıştır</button>';
                $('devam').firstElementChild.onclick = acilis;
            }
        };
        const acilis = () => {
            const satirlar = ['Kodlayalım BIOS v1.0', 'İşlemci ........ TAMAM', 'Bellek 16 GB .... TAMAM', 'Depolama SSD .... TAMAM', 'Ekran kartı ..... TAMAM', '', 'İşletim sistemi yükleniyor...', '', 'Hoş geldin! 🎉'];
            calisiyor = true; $('kasaSvg').classList.add('calisiyor');
            const o = document.createElement('div'); o.className = 'acilis'; $('kasa').appendChild(o);
            let i = 0;
            const t = setInterval(() => { o.textContent += satirlar[i++] + '\n'; if (i >= satirlar.length) { clearInterval(t); setTimeout(() => bitir('Bilgisayarı başarıyla topladın ve çalıştırdın!'), 900); } }, 280);
            $('devam').innerHTML = '';
        };
        // Sürükle-bırak ve dokun-seç
        let tasinan = null;
        $('tepsi').addEventListener('pointerdown', (e) => {
            const k = e.target.closest('.parca'); if (!k || k.classList.contains('takildi')) return;
            e.preventDefault();
            tasinan = { id: k.dataset.id, x: e.clientX, y: e.clientY, hayalet: null, kart: k };
            k.setPointerCapture(e.pointerId);
        });
        $('tepsi').addEventListener('pointermove', (e) => {
            if (!tasinan) return;
            if (!tasinan.hayalet && Math.hypot(e.clientX - tasinan.x, e.clientY - tasinan.y) > 8) {
                tasinan.hayalet = document.createElement('div'); tasinan.hayalet.className = 'hayalet';
                tasinan.hayalet.innerHTML = ikon(tasinan.id).replace('<svg', '<svg width="110" height="74"'); document.body.appendChild(tasinan.hayalet);
            }
            if (tasinan.hayalet) {
                tasinan.hayalet.style.left = e.clientX + 'px'; tasinan.hayalet.style.top = e.clientY + 'px';
                tasinan.hayalet.style.display = 'none';
                document.querySelectorAll('[data-yuva].uzerinde').forEach(x => x.classList.remove('uzerinde'));
                const el = document.elementFromPoint(e.clientX, e.clientY);
                const r = el && el.closest('[data-yuva]'); if (r) r.classList.add('uzerinde');
                tasinan.hayalet.style.display = '';
            }
        });
        $('tepsi').addEventListener('pointerup', (e) => {
            if (!tasinan) return;
            const t = tasinan; tasinan = null;
            document.querySelectorAll('[data-yuva].uzerinde').forEach(x => x.classList.remove('uzerinde'));
            if (t.hayalet) { t.hayalet.remove(); dene(t.id, yuvaBul(e.clientX, e.clientY, t.id)); return; }
            // Dokunma: parçayı seç
            document.querySelectorAll('.parca.sec').forEach(x => x.classList.remove('sec'));
            secili = t.id; t.kart.classList.add('sec');
            document.querySelectorAll('[data-yuva]').forEach(x => x.classList.add('secilebilir'));
            $('fb').className = 'fb'; $('fb').textContent = 'Şimdi bu parçanın takılacağı yere dokun.';
        });
        $('kasa').addEventListener('click', (e) => {
            if (!secili) return;
            const r = e.target.closest('[data-yuva]'); if (!r) return;
            const p = secili; secili = null;
            const y = r.dataset.yuva === 'cpu' && (takili.includes('cpu') || p === 'sogutucu') ? 'sogutucu' : r.dataset.yuva;
            document.querySelectorAll('.secilebilir').forEach(x => x.classList.remove('secilebilir'));
            dene(p, y);
        });
    }

    // ---------- 2. Eşleştir ----------
    function eslestir() {
        const sol = KL.karistir(D.ESLESMELER.map((e, i) => [i, e[0]])), sag = KL.karistir(D.ESLESMELER.map((e, i) => [i, e[1]]));
        let secSol = null, biten = 0;
        $('icerik').innerHTML = `<div class="card panel"><p style="font-weight:700;margin-bottom:12px">Soldan bir parça, sağdan onun yaptığı işi seç.</p>
            <div class="esle"><div class="sut" id="sol">${sol.map(([i, t]) => `<button data-i="${i}">${kacis(t)}</button>`).join('')}</div>
            <div class="sut" id="sag">${sag.map(([i, t]) => `<button data-i="${i}">${kacis(t)}</button>`).join('')}</div></div><p class="fb" id="fb"></p></div>`;
        $('sol').onclick = (e) => { const b = e.target.closest('button'); if (!b || b.classList.contains('bitti')) return; document.querySelectorAll('#sol .sec').forEach(x => x.classList.remove('sec')); b.classList.add('sec'); secSol = b; };
        $('sag').onclick = (e) => {
            const b = e.target.closest('button'); if (!b || b.classList.contains('bitti') || !secSol) return;
            if (b.dataset.i === secSol.dataset.i) {
                b.classList.add('bitti'); secSol.classList.remove('sec'); secSol.classList.add('bitti'); secSol = null; biten++; KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru eşleşme!';
                noktalar(D.ESLESMELER.length, biten);
                if (biten === D.ESLESMELER.length) setTimeout(() => bitir(), 500);
            } else {
                hata++; KL.ses('yanlis');
                [b, secSol].forEach(x => { x.classList.remove('titre'); void x.offsetWidth; x.classList.add('titre'); });
                $('fb').className = 'fb bad'; $('fb').textContent = 'Bu parça bu işi yapmaz, tekrar dene.';
            }
        };
        noktalar(D.ESLESMELER.length, 0);
    }

    // ---------- 3. Sınıfla ----------
    function sinifla() {
        const liste = KL.karistir(D.CIHAZLAR).slice(0, 12);
        let i = 0;
        const yeni = () => {
            noktalar(liste.length, i);
            const [ad, em, dogru] = liste[i];
            $('icerik').innerHTML = `<div class="card panel cihaz" style="max-width:760px;margin:0 auto"><div class="em">${em}</div><h3>${kacis(ad)}</h3>
                <div class="kovalar" id="kovalar">${D.SINIFLAR.map(([id, a, ac]) => `<button data-k="${id}">${a}<small>${ac}</small></button>`).join('')}</div>
                <p class="fb" id="fb"></p><div id="devam"></div></div>`;
            let ilk = true;
            $('kovalar').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || $('devam').innerHTML) return;
                if (b.dataset.k !== dogru) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Bir daha düşün: bu cihaz bilgisayara bilgi mi veriyor, bilgisayardan bilgi mi alıyor?'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = D.SINIF_ACIKLAMA[ad] || 'Doğru!';
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px">${i + 1 < liste.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < liste.length ? yeni() : bitir(); };
            };
        };
        yeni();
    }

    // ---------- 4 ve 5. Çoktan seçmeli bölümler ----------
    function cokluSoru(sorular) {
        let i = 0;
        const yeni = () => {
            noktalar(sorular.length, i);
            const s = sorular[i];
            const sec = KL.karistir(s.secenekler);
            $('icerik').innerHTML = `<div class="card panel durum-kart"><p class="soru">${kacis(s.soru)}</p>
                <div class="secenekler" id="secenekler">${sec.map(x => `<button>${kacis(x)}</button>`).join('')}</div><p class="fb" id="fb"></p><div id="aciklama"></div><div id="devam"></div></div>`;
            let ilk = true;
            $('secenekler').onclick = (e) => {
                const b = e.target.closest('button'); if (!b || b.disabled || $('devam').innerHTML) return;
                if (b.textContent !== s.cevap) { if (ilk) hata++; ilk = false; b.classList.add('yanlis'); b.disabled = true; KL.ses('yanlis'); $('fb').className = 'fb bad'; $('fb').textContent = 'Tekrar dene.'; return; }
                b.classList.add('dogru'); KL.ses('dogru');
                $('fb').className = 'fb ok'; $('fb').textContent = 'Doğru!';
                $('aciklama').innerHTML = `<div class="aciklama">${kacis(s.aciklama)}</div>`;
                $('devam').innerHTML = `<button class="btn btn-primary" style="margin-top:12px">${i + 1 < sorular.length ? 'Sonraki' : 'Bitir'} <i class="fas fa-arrow-right"></i></button>`;
                $('devam').firstElementChild.onclick = () => { i++; i < sorular.length ? yeni() : bitir(); };
            };
        };
        yeni();
    }
    function birim() { const r = D.uretec(Date.now()); cokluSoru(D.BIRIM_SORULARI.map(f => f(r))); }
    function ariza() { cokluSoru(KL.karistir(D.ARIZALAR).map(a => ({ soru: a.belirti, secenekler: a.secenekler, cevap: a.secenekler[a.dogru], aciklama: a.aciklama }))); }

    const h = location.hash.slice(1);
    if (D.BOLUMLER.some(b => b.id === h)) basla(h); else listeCiz();
})();
