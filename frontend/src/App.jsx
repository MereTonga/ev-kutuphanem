import { useState, useEffect } from "react";

function App() {
  const [kitaplar, setKitaplar] = useState([]);
  
  // Form durumları
  const [kitapAd, setKitapAd] = useState("");
  const [yazarAdSoyad, setYazarAdSoyad] = useState("");
  const [okunduMu, setOkunduMu] = useState(false);
  
  // Listeden seçilen kitabın ID'si
  const [secilenId, setSecilenId] = useState(null);

  // Kitapları Getir
  const kitaplariGetir = () => {
    fetch("http://localhost:8000/kitaplar")
      .then((res) => res.json())
      .then((data) => setKitaplar(data))
      .catch((err) => console.error("Hata:", err));
  };

  useEffect(() => {
    kitaplariGetir();
  }, []);

  // Yeni Kitap Ekle
  const kitapEkle = (e) => {
    e.preventDefault();
    if (!kitapAd.trim() || !yazarAdSoyad.trim()) return;

    const yeniKitap = {
      kitap_ad: kitapAd,
      yazar_ad_soyad: yazarAdSoyad,
      okundu_mu: okunduMu,
    };

    fetch("http://localhost:8000/kitaplar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(yeniKitap),
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

  // Seçilen Kitabı Sil
  const kitapSil = () => {
    if (!secilenId) {
      alert("Lütfen önce sağdaki listeden silmek istediğiniz kitabı seçin!");
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

  return (
    <div style={styles.windowContainer}>
      {/* 🪟 Pencere Başlık Çubuğu */}
      <div style={styles.titleBar}>
        <span>📚 Kütüphanem</span>
      </div>

      {/* 📦 Ana İçerik (İki Panel) */}
      <div style={styles.content}>
        {/* 📐 Sol Panel */}
        <div style={styles.leftPanel}>
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

            {/* 🔘 Butonlar */}
            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.button}>Ekle</button>
              <button type="button" onClick={kitapSil} style={styles.button}>Sil</button>
            </div>
          </form>

          {/* 🔢 Kitap Sayısı */}
          <div style={styles.counterText}>
            Kitap Sayısı: {kitaplar.length}
          </div>
        </div>

        {/* 📜 Sağ Panel (Liste Kutusu) */}
        <div style={styles.rightPanel}>
          <div style={styles.listBox}>
            {kitaplar.map((kitap) => {
              const isSelected = secilenId === kitap.id;
              return (
                <div
                  key={kitap.id}
                  onClick={() => setSecilenId(kitap.id)}
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
      </div>
    </div>
  );
}

// 🎨 Görseldeki Düzeni Sağlayan Stiller
const styles = {
  windowContainer: {
    width: "800px",
    margin: "30px auto",
    border: "1px solid #999",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Segoe UI, sans-serif",
  },
  titleBar: {
    backgroundColor: "#ffffff",
    padding: "8px 12px",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
    fontSize: "14px",
  },
  content: {
    display: "flex",
    padding: "20px",
    gap: "25px",
  },
  leftPanel: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "20px",
    marginBottom: "6px",
    color: "#222",
  },
// App.jsx içindeki stiller kısmında şu alanları güncelleyebilirsin:
  input: {
    width: "100%",
    padding: "6px 8px",
    fontSize: "15px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    color: "#000000",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "6px 8px",
    fontSize: "15px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    color: "#000000",
    boxSizing: "border-box",
  },
  button: {
    flex: "1",
    padding: "8px 0",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#e1e1e1",
    color: "#000000",
    border: "1px solid #7a7a7a",
    borderRadius: "2px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
    marginBottom: "20px",
  },
  counterText: {
    fontSize: "22px",
    marginTop: "15px",
    color: "#111",
  },
  rightPanel: {
    flex: "1.6",
  },
  listBox: {
    height: "360px",
    border: "1px solid #7a7a7a",
    backgroundColor: "#ffffff",
    overflowY: "scroll",
    padding: "2px",
  },
  listItem: {
    padding: "4px 8px",
    fontSize: "15px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default App;