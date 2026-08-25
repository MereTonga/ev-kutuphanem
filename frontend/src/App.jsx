import { useState, useEffect } from "react";

function App() {
  const [kitaplar, setKitaplar] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);
  
  // 📥 Sol Panel: Ekleme form state'leri
  const [kitapAd, setKitapAd] = useState("");
  const [yazarAdSoyad, setYazarAdSoyad] = useState("");
  const [okunduMu, setOkunduMu] = useState(false);
  
  // 🎯 Seçili Kitap ve Sağ Panel: Güncelleme state'leri
  const [secilenId, setSecilenId] = useState(null);
  const [guncelKitapAd, setGuncelKitapAd] = useState("");
  const [guncelYazarAdSoyad, setGuncelYazarAdSoyad] = useState("");
  const [guncelOkunduMu, setGuncelOkunduMu] = useState(false);

  // 🔄 Kitapları Getir
  const kitaplariGetir = () => {
    fetch("http://localhost:8000/kitaplar")
      .then((res) => res.json())
      .then((data) => setKitaplar(data))
      .catch((err) => console.error("Hata:", err));
  };

  useEffect(() => {
    kitaplariGetir();
  }, []);

  // 📋 Listeden Kitap Seçme
  const kitapSec = (kitap) => {
    setSecilenId(kitap.id);
    setGuncelKitapAd(kitap.kitap_ad);
    setGuncelYazarAdSoyad(kitap.yazar_ad_soyad);
    setGuncelOkunduMu(kitap.okundu_mu);
  };

  // ➕ Kitap Ekle
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

  // ✏️ Kitap Güncelle (PUT)
  const kitapGuncelle = (e) => {
    e.preventDefault();
    if (!secilenId) return;

    fetch(`http://localhost:8000/kitaplar/${secilenId}`, {
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

  // 🗑️ Kitap Sil
  const kitapSil = () => {
    if (!secilenId) {
      alert("Lütfen önce listeden bir kitap seçin!");
      return;
    }

    fetch(`http://localhost:8000/kitaplar/${secilenId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          kitaplariGetir();
          setSecilenId(null);
        }
      })
      .catch((err) => console.error("Silme hatası:", err));
  };

  const getButtonStyle = (buttonKey) => {
    const isHovered = hoveredButton === buttonKey;
    const isPressed = pressedButton === buttonKey;

    return {
      ...styles.button,
      background: isPressed
        ? "linear-gradient(180deg, #d6d6d6 0%, #c4c4c4 100%)"
        : isHovered
        ? "linear-gradient(180deg, #ffffff 0%, #e8eefc 100%)"
        : "linear-gradient(180deg, #f8f8f8 0%, #e1e1e1 100%)",
      borderColor: isHovered ? "#3a78d0" : "#7a7a7a",
      boxShadow: isPressed
        ? "inset 0 2px 4px rgba(0,0,0,0.18)"
        : isHovered
        ? "0 6px 14px rgba(58, 120, 208, 0.25)"
        : "0 2px 4px rgba(0,0,0,0.08)",
      transform: isPressed ? "translateY(1px) scale(0.99)" : isHovered ? "translateY(-1px)" : "none",
    };
  };

  return (
    <div style={{ ...styles.windowContainer, width: secilenId ? "1750px" : "1300px" }}>
      <div style={styles.titleBar}>
        <span>📚 Kütüphanem</span>
      </div>

      <div style={styles.content}>
        {/* 📐 1. Panel: Ekleme Formu */}
        <div style={styles.panel}>
          <form onSubmit={kitapEkle}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Kitap İsmi</label>
              <input
                type="text"
                value={kitapAd}
                onChange={(e) => setKitapAd(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Yazar İsmi</label>
              <input
                type="text"
                value={yazarAdSoyad}
                onChange={(e) => setYazarAdSoyad(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Durum</label>
              <select
                value={okunduMu ? "true" : "false"}
                onChange={(e) => setOkunduMu(e.target.value === "true")}
                style={styles.select}
              >
                <option value="false">Okunmadı</option>
                <option value="true">Okundu</option>
              </select>
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={getButtonStyle("ekle")}
                onMouseEnter={() => setHoveredButton("ekle")}
                onMouseLeave={() => {
                  setHoveredButton(null);
                  setPressedButton(null);
                }}
                onMouseDown={() => setPressedButton("ekle")}
                onMouseUp={() => setPressedButton(null)}
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={kitapSil}
                style={getButtonStyle("sil")}
                onMouseEnter={() => setHoveredButton("sil")}
                onMouseLeave={() => {
                  setHoveredButton(null);
                  setPressedButton(null);
                }}
                onMouseDown={() => setPressedButton("sil")}
                onMouseUp={() => setPressedButton(null)}
              >
                Sil
              </button>
              <button
                type="button"
                style={getButtonStyle("indir")}
                onMouseEnter={() => setHoveredButton("indir")}
                onMouseLeave={() => {
                  setHoveredButton(null);
                  setPressedButton(null);
                }}
                onMouseDown={() => setPressedButton("indir")}
                onMouseUp={() => setPressedButton(null)}
                onClick={() => {
                  const dataStr =
                    "data:text/json;charset=utf-8," +
                    encodeURIComponent(JSON.stringify(kitaplar, null, 2));
                  const downloadAnchorNode = document.createElement("a");
                  downloadAnchorNode.setAttribute("href", dataStr);
                  downloadAnchorNode.setAttribute("download", "kitaplar.json");
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
              >
                Listeyi İndir
              </button>
            </div>
          </form>
          <div style={styles.counterText}>Kitap Sayısı: {kitaplar.length}</div>
        </div>

        {/* 📜 2. Panel: Kitap Listesi */}
        <div style={styles.listPanel}>
          <div style={styles.listBox}>
            {kitaplar.map((kitap) => {
              const isSelected = secilenId === kitap.id;
              return (
                <div
                  key={kitap.id}
                  onClick={() => kitapSec(kitap)}
                  style={{
                    ...styles.listItem,
                    backgroundColor: isSelected ? "#0078d7" : "transparent",
                    color: isSelected ? "#ffffff" : "#000000",
                  }}
                >
                  {kitap.yazar_ad_soyad} - {kitap.kitap_ad} [{kitap.okundu_mu ? "Okundu" : "Okunmadı"}]
                </div>
              );
            })}
          </div>
        </div>

        {/* ✏️ 3. Panel: Güncelleme Paneli (Yalnızca seçim varsa görünür) */}
        {secilenId && (
          <div style={{ ...styles.panel, borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
            <form onSubmit={kitapGuncelle}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kitap İsmi</label>
                <input
                  type="text"
                  value={guncelKitapAd}
                  onChange={(e) => setGuncelKitapAd(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Yazar İsmi</label>
                <input
                  type="text"
                  value={guncelYazarAdSoyad}
                  onChange={(e) => setGuncelYazarAdSoyad(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Durum</label>
                <select
                  value={guncelOkunduMu ? "true" : "false"}
                  onChange={(e) => setGuncelOkunduMu(e.target.value === "true")}
                  style={styles.select}
                >
                  <option value="false">Okunmadı</option>
                  <option value="true">Okundu</option>
                </select>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={getButtonStyle("guncelle")}
                  onMouseEnter={() => setHoveredButton("guncelle")}
                  onMouseLeave={() => {
                    setHoveredButton(null);
                    setPressedButton(null);
                  }}
                  onMouseDown={() => setPressedButton("guncelle")}
                  onMouseUp={() => setPressedButton(null)}
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  windowContainer: {
    height: "700px",
    margin: "30px auto",
    border: "2px solid #999",
    borderRadius: "1px",
    backgroundColor: "#f0f0f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Segoe UI, sans-serif",
    transition: "width 0.2s ease",
  },
  titleBar: {
    backgroundColor: "#ffffff",
    padding: "8px 12px",
    borderBottom: "2px solid #ddd",
    fontWeight: "bold",
    fontSize: "16px",
  },
  content: {
    display: "flex",
    padding: "20px",
    gap: "20px",
  },
  panel: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  listPanel: {
    flex: "1.4",
  },
  formGroup: {
    marginBottom: "35px",
  },
  label: {
    display: "block",
    fontSize: "22px",
    marginBottom: "8px",
    color: "#222",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "20px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    color: "#000000",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "22px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    color: "#000000",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  button: {
    flex: "1",
    padding: "12px 0",
    fontSize: "22px",
    cursor: "pointer",
    background: "linear-gradient(180deg, #f8f8f8 0%, #e1e1e1 100%)",
    color: "#000000",
    border: "1px solid #7a7a7a",
    borderRadius: "2px",
    transition: "all 0.18s ease",
    userSelect: "none",
  },
  counterText: {
    fontSize: "24px",
    marginTop: "125px",
    color: "#111",
  },
  listBox: {
    height: "600px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    overflowY: "scroll",
    padding: "1px",
  },
  listItem: {
    padding: "12px 14px",
    fontSize: "22px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default App;