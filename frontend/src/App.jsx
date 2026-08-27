import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const metniNormallestir = (deger) => deger.toLocaleLowerCase("tr-TR").trim();

function App() {
  const [kitaplar, setKitaplar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [durumFiltresi, setDurumFiltresi] = useState("hepsi");
  const [yazarFiltresi, setYazarFiltresi] = useState("hepsi");
  const [siralama, setSiralama] = useState("yazar-az");
  const [iceAktarmaDurumu, setIceAktarmaDurumu] = useState("");
  const [iceAktariliyor, setIceAktariliyor] = useState(false);
  const dosyaInputRef = useRef(null);
  const [secilenIdler, setSecilenIdler] = useState([]);
  const [secimBaslangicId, setSecimBaslangicId] = useState(null);

  // Sol Panel: Ekleme form state'leri
  const [kitapAd, setKitapAd] = useState("");
  const [yazarAdSoyad, setYazarAdSoyad] = useState("");
  const [okunduMu, setOkunduMu] = useState(false);

  // Secili kitap ve Sag Panel: Guncelleme state'leri
  const [guncelKitapAd, setGuncelKitapAd] = useState("");
  const [guncelYazarAdSoyad, setGuncelYazarAdSoyad] = useState("");
  const [guncelOkunduMu, setGuncelOkunduMu] = useState(false);

  // Kitaplari getir
  const kitaplariGetir = () => {
    return fetch("http://localhost:8000/kitaplar")
      .then((res) => {
        if (!res.ok) throw new Error("Kitap listesi alınamadı.");
        return res.json();
      })
      .then((data) => setKitaplar(data))
      .catch((err) => {
        console.error("Hata:", err);
        throw err;
      });
  };

  useEffect(() => {
    kitaplariGetir();
  }, []);

  const seciliKitap = kitaplar.find((kitap) => kitap.id === secilenIdler[0]);

  const guncellemePaneliniDoldur = (kitap) => {
    if (!kitap) return;
    setGuncelKitapAd(kitap.kitap_ad);
    setGuncelYazarAdSoyad(kitap.yazar_ad_soyad);
    setGuncelOkunduMu(kitap.okundu_mu);
  };

  // Normal tik tek secim, Ctrl/Cmd ekle-cikar, Shift aralik secimi yapar.
  const kitapSec = (kitap, e) => {
    const gorunenIndex = filtrelenmisKitaplar.findIndex((listeKitabi) => listeKitabi.id === kitap.id);
    const komutTiklamasi = e.ctrlKey || e.metaKey;
    const aralikTiklamasi = e.shiftKey && secimBaslangicId !== null;

    if (aralikTiklamasi) {
      const baslangicIndex = filtrelenmisKitaplar.findIndex((listeKitabi) => listeKitabi.id === secimBaslangicId);
      if (baslangicIndex < 0 || gorunenIndex < 0) {
        setSecilenIdler([kitap.id]);
        setSecimBaslangicId(kitap.id);
        guncellemePaneliniDoldur(kitap);
        return;
      }
      const aralikBaslangici = Math.min(baslangicIndex, gorunenIndex);
      const aralikSonu = Math.max(baslangicIndex, gorunenIndex);
      const aralikIdleri = filtrelenmisKitaplar
        .slice(aralikBaslangici, aralikSonu + 1)
        .map((listeKitabi) => listeKitabi.id);

      setSecilenIdler((oncekiIdler) => [...new Set([...oncekiIdler, ...aralikIdleri])]);
      return;
    }

    if (komutTiklamasi) {
      const yeniIdler = secilenIdler.includes(kitap.id)
        ? secilenIdler.filter((id) => id !== kitap.id)
        : [...secilenIdler, kitap.id];

      setSecilenIdler(yeniIdler);
      setSecimBaslangicId(kitap.id);
      guncellemePaneliniDoldur(kitaplar.find((listeKitabi) => listeKitabi.id === yeniIdler[0]));
      return;
    }

    if (secilenIdler.includes(kitap.id)) {
      const yeniIdler = secilenIdler.filter((id) => id !== kitap.id);
      setSecilenIdler(yeniIdler);
      setSecimBaslangicId(yeniIdler[0] ?? null);
      guncellemePaneliniDoldur(kitaplar.find((listeKitabi) => listeKitabi.id === yeniIdler[0]));
      return;
    }

    setSecilenIdler([kitap.id]);
    setSecimBaslangicId(kitap.id);
    guncellemePaneliniDoldur(kitap);
  };

  // Kitap ekle
  const kitapEkle = (e) => {
    e.preventDefault();
    if (!kitapAd.trim() || !yazarAdSoyad.trim()) return;

    fetch("http://localhost:8000/kitaplar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kitap_ad: kitapAd,
        yazar_ad_soyad: yazarAdSoyad,
        okundu_mu: okunduMu,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        kitaplariGetir();
        setKitapAd("");
        setYazarAdSoyad("");
        setOkunduMu(false);
      })
      .catch((err) => console.error("Ekleme hatası:", err));
  };

  // Kitap guncelle
  const kitapGuncelle = (e) => {
    e.preventDefault();
    if (!secilenIdler[0]) return;

    fetch(`http://localhost:8000/kitaplar/${secilenIdler[0]}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kitap_ad: guncelKitapAd,
        yazar_ad_soyad: guncelYazarAdSoyad,
        okundu_mu: guncelOkunduMu,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        kitaplariGetir();
      })
      .catch((err) => console.error("Güncelleme hatası:", err));
  };

  // Kitap sil
  const kitapSil = () => {
    if (secilenIdler.length === 0) {
      alert("Lütfen önce listeden bir kitap seçin!");
      return;
    }

    fetch("http://localhost:8000/kitaplar/toplu-sil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secilenIdler),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Seçili kitaplar silinemedi.");
        const sonuc = await res.json();
        await kitaplariGetir();
        setSecilenIdler([]);
        setSecimBaslangicId(null);
        setIceAktarmaDurumu(`${sonuc.silinen} kitap silindi.`);
      })
      .catch((err) => console.error("Silme hatası:", err));
  };

  const kitaplariIndir = () => {
    const blob = new Blob([JSON.stringify(kitaplar, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "kitaplar.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  const secilenKitaplariIndir = () => {
    if (secilenIdler.length === 0) {
      alert("Lütfen önce listeden en az bir kitap seçin!");
      return;
    }

    const secilenKitaplar = kitaplar.filter((kitap) => secilenIdler.includes(kitap.id));
    const blob = new Blob([JSON.stringify(secilenKitaplar, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "secilen-kitaplar.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  const kitaplariIceAktar = async (e) => {
    const dosya = e.target.files?.[0];
    e.target.value = "";

    if (!dosya) return;

    setIceAktariliyor(true);
    setIceAktarmaDurumu("");

    const formData = new FormData();
    formData.append("dosya", dosya);

    try {
      const response = await fetch("http://localhost:8000/kitaplar/import", {
        method: "POST",
        body: formData,
      });
      const sonuc = await response.json();

      if (!response.ok) {
        throw new Error(sonuc.detail || "Kitaplar içeri aktarılamadı.");
      }

      await kitaplariGetir();
      setIceAktarmaDurumu(`${sonuc.eklenen} kitap eklendi, ${sonuc.atlanan} kayıt zaten vardı.`);
    } catch (err) {
      setIceAktarmaDurumu(`İçe aktarma başarısız: ${err.message}`);
    } finally {
      setIceAktariliyor(false);
    }
  };

  const okunanSayisi = kitaplar.filter((kitap) => kitap.okundu_mu).length;
  const okunmayanSayisi = kitaplar.length - okunanSayisi;

  const yazarlar = useMemo(() => {
    return [...new Set(kitaplar.map((kitap) => kitap.yazar_ad_soyad.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr-TR")
    );
  }, [kitaplar]);

  const filtrelenmisKitaplar = useMemo(() => {
    let sonuc = [...kitaplar];

    if (aramaMetni.trim()) {
      const arama = metniNormallestir(aramaMetni);
      sonuc = sonuc.filter((kitap) => {
        const kitapAdi = metniNormallestir(kitap.kitap_ad);
        const yazarAdi = metniNormallestir(kitap.yazar_ad_soyad);
        return kitapAdi.includes(arama) || yazarAdi.includes(arama);
      });
    }

    if (durumFiltresi === "okundu") {
      sonuc = sonuc.filter((kitap) => kitap.okundu_mu);
    } else if (durumFiltresi === "okunmadı") {
      sonuc = sonuc.filter((kitap) => !kitap.okundu_mu);
    }

    if (yazarFiltresi !== "hepsi") {
      sonuc = sonuc.filter((kitap) => kitap.yazar_ad_soyad === yazarFiltresi);
    }

    sonuc.sort((a, b) => {
      if (siralama === "yazar-az") {
        return a.yazar_ad_soyad.localeCompare(b.yazar_ad_soyad, "tr-TR");
      }
      if (siralama === "yazar-za") {
        return b.yazar_ad_soyad.localeCompare(a.yazar_ad_soyad, "tr-TR");
      }
      if (siralama === "kitap-az") {
        return a.kitap_ad.localeCompare(b.kitap_ad, "tr-TR");
      }
      if (siralama === "kitap-za") {
        return b.kitap_ad.localeCompare(a.kitap_ad, "tr-TR");
      }
      return 0;
    });

    return sonuc;
  }, [aramaMetni, durumFiltresi, yazarFiltresi, siralama, kitaplar]);

  const azSonucDekoruGoster = filtrelenmisKitaplar.length > 0 && filtrelenmisKitaplar.length <= 3;

  return (
    <div className="library-shell">
      <div className="library-background" aria-hidden="true" />

      <header className="library-header">
        <div>
          <p className="eyebrow">Personal Collection</p>
          <h1>Kütüphanem</h1>
        </div>
        <div className="header-stats">
          <span className="chip chip-total">Toplam {kitaplar.length}</span>
          <span className="chip chip-read">Okundu {okunanSayisi}</span>
          <span className="chip chip-unread">Okunmadı {okunmayanSayisi}</span>
          <span className="chip chip-filter">Görünen {filtrelenmisKitaplar.length}</span>
        </div>
      </header>

      <div className={`library-grid ${secilenIdler.length > 0 ? "has-selection" : ""}`}>
        <section className="card form-card">
          <h2>Yeni Kitap Ekle</h2>
          <form onSubmit={kitapEkle}>
            <div className="form-group">
              <label className="label">Kitap İsmi</label>
              <input
                type="text"
                value={kitapAd}
                onChange={(e) => setKitapAd(e.target.value)}
                className="control"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Yazar İsmi</label>
              <input
                type="text"
                value={yazarAdSoyad}
                onChange={(e) => setYazarAdSoyad(e.target.value)}
                className="control"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Durum</label>
              <select
                value={okunduMu ? "true" : "false"}
                onChange={(e) => setOkunduMu(e.target.value === "true")}
                className="control"
              >
                <option value="false">Okunmadı</option>
                <option value="true">Okundu</option>
              </select>
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                Ekle
              </button>
              <button type="button" onClick={kitapSil} className="btn btn-danger">
                {secilenIdler.length > 1 ? `Seçilenleri Sil (${secilenIdler.length})` : "Sil"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={kitaplariIndir}>
                Listeyi İndir
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => dosyaInputRef.current?.click()}
                disabled={iceAktariliyor}
              >
                {iceAktariliyor ? "Aktarılıyor..." : "Listeyi İçeri Aktar"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={secilenKitaplariIndir}>
                Seçilenleri İndir
              </button>
            </div>
          </form>
          <p className="counter">Kitap Sayısı: {kitaplar.length}</p>
          <input
            ref={dosyaInputRef}
            className="file-input"
            type="file"
            accept=".json,application/json"
            onChange={kitaplariIceAktar}
          />
          {iceAktarmaDurumu && <p className="import-status">{iceAktarmaDurumu}</p>}
        </section>

        <section className="card list-card">
          <div className="list-head">
            <h2>Koleksiyon</h2>
            <p>
              {kitaplar.length === 0
                ? "Henüz kitap yok"
                : `${filtrelenmisKitaplar.length}/${kitaplar.length} kitap listeleniyor`}
            </p>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              className="control control-search"
              placeholder="Kitap veya yazar ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
            />

            <select
              className="control control-compact"
              value={yazarFiltresi}
              onChange={(e) => setYazarFiltresi(e.target.value)}
            >
              <option value="hepsi">Tüm yazarlar</option>
              {yazarlar.map((yazar) => (
                <option key={yazar} value={yazar}>
                  {yazar}
                </option>
              ))}
            </select>

            <select
              className="control control-compact"
              value={durumFiltresi}
              onChange={(e) => setDurumFiltresi(e.target.value)}
            >
              <option value="hepsi">Tüm durumlar</option>
              <option value="okundu">Sadece okundu</option>
              <option value="okunmadı">Sadece okunmadı</option>
            </select>

            <select className="control control-compact" value={siralama} onChange={(e) => setSiralama(e.target.value)}>
              <option value="yazar-az">Yazar (A-Z)</option>
              <option value="yazar-za">Yazar (Z-A)</option>
              <option value="kitap-az">Kitap (A-Z)</option>
              <option value="kitap-za">Kitap (Z-A)</option>
            </select>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setAramaMetni("");
                setDurumFiltresi("hepsi");
                setYazarFiltresi("hepsi");
                setSiralama("yazar-az");
              }}
            >
              Temizle
            </button>
          </div>

          <div className={`list-box ${azSonucDekoruGoster ? "sparse" : ""}`}>
            {kitaplar.length === 0 && (
              <div className="empty-state">İlk kitabı ekleyerek kütüphaneni oluştur.</div>
            )}
            {kitaplar.length > 0 && filtrelenmisKitaplar.length === 0 && (
              <div className="empty-state">Filtreye uygun kitap bulunamadı.</div>
            )}
            {filtrelenmisKitaplar.map((kitap) => {
              const isSelected = secilenIdler.includes(kitap.id);
              return (
                <button
                  type="button"
                  key={kitap.id}
                  onClick={(e) => kitapSec(kitap, e)}
                  className={`list-item ${isSelected ? "selected" : ""}`}
                >
                  <span className="item-title">{kitap.kitap_ad}</span>
                  <span className="item-meta">{kitap.yazar_ad_soyad}</span>
                  <span className={`item-badge ${kitap.okundu_mu ? "done" : "pending"}`}>
                    {kitap.okundu_mu ? "Okundu" : "Okunmadı"}
                  </span>
                </button>
              );
            })}
            {azSonucDekoruGoster && <div className="shelf-illustration" aria-hidden="true" />}
          </div>
          {secilenIdler.length > 0 && (
            <p className="selection-status">
              {secilenIdler.length} kitap seçildi. Güncelleme paneli ilk seçilen kitabı gösteriyor.
            </p>
          )}
        </section>

        {secilenIdler.length > 0 && seciliKitap && (
          <section className="card form-card update-card">
            <h2>Seçili Kitabı Güncelle</h2>
            <form onSubmit={kitapGuncelle}>
              <div className="form-group">
                <label className="label">Kitap İsmi</label>
                <input
                  type="text"
                  value={guncelKitapAd}
                  onChange={(e) => setGuncelKitapAd(e.target.value)}
                  className="control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Yazar İsmi</label>
                <input
                  type="text"
                  value={guncelYazarAdSoyad}
                  onChange={(e) => setGuncelYazarAdSoyad(e.target.value)}
                  className="control"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Durum</label>
                <select
                  value={guncelOkunduMu ? "true" : "false"}
                  onChange={(e) => setGuncelOkunduMu(e.target.value === "true")}
                  className="control"
                >
                  <option value="false">Okunmadı</option>
                  <option value="true">Okundu</option>
                </select>
              </div>
              <div className="button-group single">
                <button type="submit" className="btn btn-primary">
                  Güncelle
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;