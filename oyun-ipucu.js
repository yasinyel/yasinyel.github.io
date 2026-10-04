// Kodlayalım — Oyun Atölyesi ipuçları: görev kimliği → [düşündüren soru, somut ipucu]. Üçüncü basamak görevin örnek çözümüdür.
(function (root) {
    'use strict';
    const IPUCLARI = {
        balon: ['Oyunda ne olunca puan artmalı? Hangi sarı olay bloğu tam o anı yakalar?', 'Balonu seç, <b>bu karaktere tıklanınca</b> bloğunu sürükle. Altına <b>puanı 1 değiştir</b>, <b>rastgele bir yere git</b> ve <b>eğer puan = 10</b> içine <b>oyunu kazan</b> koy.'],
        hareket: ['Robotun sağa gitmesi için hangi değeri değiştirmeliyiz: x mi, y mi? Artırmalı mı, azaltmalı mı?', 'Dört tane <b>tuşu basılıyken</b> bloğu kullan: sağ → x\'i 5, sol → x\'i -5, yukarı → y\'yi 5, aşağı → y\'yi -5 değiştir.'],
        yildiz: ['Puanı kim kazandırıyor: robot mu, yıldız mı? Yıldız robota değdiğinde ne olmalı?', 'Yıldızı seç; <b>robot karakterine değince</b> bloğunun altına <b>puanı 1 değiştir</b> ve <b>rastgele bir yere git</b> koy.'],
        dusman: ['Uzaylının kendi kendine hareket etmesi için hangi olay sürekli çalışır?', 'Uzaylıya <b>her an</b>: x\'i 4 değiştir, eğer kenara değiyorsa başa git. <b>robot karakterine değince</b>: canı -1 değiştir, eğer can = 0 ise oyunu kaybet.'],
        kazan: ['Oyunun başında puan ve can kaç olmalı? Kazanmayı hangi koşul belirliyor?', 'Robota <b>oyun başlayınca</b>: puanı 0 yap, canı 3 yap. <b>her an</b>: eğer puan = 10 ise oyunu kazan.'],
        elma1: ['Kedi yalnızca sağa-sola gidecek. Hangi tuşları ve hangi değeri kullanmalısın?', 'Kediye iki <b>tuşu basılıyken</b> bloğu: sağ ok → x\'i 6, sol ok → x\'i -6 değiştir. y\'ye hiç dokunma.'],
        elma2: ['Elmanın sürekli düşmesi için ne olmalı? Aşağı gitmek y\'yi artırır mı azaltır mı?', 'Elmaya <b>her an</b>: y\'yi -4 değiştir; <b>eğer kenara değiyorsa</b>: git x: 0 y: 150.'],
        elma3: ['Elmayı kedi yakalayınca hem puan artmalı hem elma yukarı dönmeli. Hangi olay?', 'Elmaya <b>kedi karakterine değince</b>: puanı 1 değiştir, git x: 0 y: 150, eğer puan = 5 ise oyunu kazan.'],
        kurbaga1: ['Kurbağa tıklanınca saklanıyor. Tekrar ne zaman görünmeli? Her an mı, arada bir mi?', 'Tıklanınca: puanı 1 değiştir, gizlen. <b>her an</b>: eğer <b>% sayı şansla</b> (sayı: 2) → rastgele bir yere git ve görün.'],
        kurbaga2: ['Ateş topuna tıklamak ceza, kurbağaya tıklamak ödül. Kazanma ve kaybetme koşulları neler?', 'Ateş topuna tıklanınca: canı -1 değiştir, rastgele git, eğer can = 0 ise kaybet. Kurbağaya tıklanınca ayrıca: eğer puan = 10 ise kazan.'],
        meteor1: ['Meteor soldan sağa mı, sağdan sola mı akıyor? x nasıl değişmeli?', 'Meteora <b>her an</b>: x\'i -6 değiştir; eğer kenara değiyorsa git x: 210 y: 0. Rokete yukarı/aşağı ok ile y\'yi değiştir.'],
        meteor2: ['Çarpışmayı hangi karakterin kodu yakalamalı? Çarpınca meteor nereye gitmeli?', 'Meteora <b>roket karakterine değince</b>: canı -1 değiştir, git x: 210 y: 0, eğer can = 0 ise oyunu kaybet.'],
        meteor3: ['Zamanla artan puan için hangi olay her an çalışır? Kazanma sınırı kaç?', 'Rokete <b>her an</b>: puanı 1 değiştir; eğer puan > 600 ise oyunu kazan.'],
        hayalet1: ['Hayalet her an değil, arada bir ışınlanmalı. Hangi koşul "arada bir" demektir?', 'Hayalete <b>her an</b>: eğer % şansla (3) → rastgele bir yere git. <b>robot karakterine değince</b>: canı -1 değiştir, rastgele git.'],
        hayalet2: ['Oyunun kuralları: başlangıç değerleri, puan kazanma, kaybetme ve kazanma. Hepsini bir yere yazdın mı?', 'Robota <b>oyun başlayınca</b>: canı 3, puanı 0 yap. <b>her an</b>: puanı 1 değiştir; eğer puan > 900 kazan; eğer can = 0 kaybet.'],
        sohbet: ['Robot üç farklı anda konuşuyor ya da değişiyor. Bu üç an hangi olaylar?', '<b>oyun başlayınca</b>: söyle "Merhaba…". <b>boşluk tuşuna basılınca</b>: söyle bir şaka. <b>bu karaktere tıklanınca</b>: görünüm 🐱.'],
        duvar: ['Robot duvara değince ne olmalı, yıldıza değince ne olmalı? İki ayrı çarpışma var.', 'Robota ok tuşlarıyla hareket ekle. <b>duvar karakterine değince</b>: git x: -180 y: -120. <b>yıldız karakterine değince</b>: oyunu kazan.'],
        penalti: ['Top tek tuşla hızla fırlamalı. Bir hareketi çok kez hızlıca yapmak için hangi blok?', 'Topa <b>boşluk tuşuna basılınca</b>: tekrarla 10 kez (x\'i 20 değiştir). <b>kale karakterine değince</b>: puanı 1 değiştir, git x: -150 y: 0, eğer puan = 3 kazan.'],
        kalp: ['Kalp toplayınca can artmalı ama 5\'i geçmemeli. Bunu hangi koşulla sağlarsın?', 'Kalbe <b>robot karakterine değince</b>: <b>eğer can &lt; 5</b> → canı 1 değiştir; sonra rastgele bir yere git.'],
        final: ['Uzaylının büyümesi puana bağlı. Uzaylı puanı nasıl "görür"? Hangi olayda kontrol etmeli?', 'Uzaylıya <b>her an</b>: eğer <b>puan > 5</b> → boyut 150. Yıldız robota değince puan artsın; eğer puan = 10 kazan.']
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = IPUCLARI;
    else root.OYUN_IPUCLARI = IPUCLARI;
})(typeof window !== 'undefined' ? window : globalThis);
