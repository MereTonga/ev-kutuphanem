# Kütüphanem

Kişisel kitap koleksiyonunu yönetmek için hazırlanmış, Türkçe arayüze sahip full-stack bir ev kütüphanesi uygulaması. Kitap ekleyebilir, kayıtları güncelleyebilir veya silebilir; koleksiyonu arayabilir, filtreleyebilir, sıralayabilir ve JSON olarak indirebilirsiniz.

## Özellikler

- Kitap adı, yazar ve okundu durumu ile kitap ekleme
- Seçili kitabı güncelleme ve silme
- Kitap adı veya yazar adına göre arama
- Yazara ve okundu durumuna göre filtreleme
- Yazar ya da kitap adına göre A-Z / Z-A sıralama
- Toplam, okunan, okunmayan ve görünür kitap sayılarını gösterme
- Koleksiyonu `kitaplar.json` olarak dışa aktarma
- Aynı kitap-yazar çiftinin tekrar eklenmesini engelleme
- Kitap ve yazar adlarında boşluk temizleme ve veri doğrulama
- Responsive, raf temalı kullanıcı arayüzü

## Teknolojiler

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn
- `python-dotenv`

### Frontend

- React 19
- React DOM
- Vite
- Oxlint
- CSS ile özel responsive tasarım

## Proje Yapısı

```text
Home Library/
├── backend/
│   ├── database.py       # Veritabanı bağlantısı ve SQLAlchemy ayarları
│   ├── main.py           # FastAPI uygulaması ve API endpoint'leri
│   ├── models.py         # SQLAlchemy kitap modeli
│   ├── schemas.py        # Pydantic istek/yanıt şemaları
│   └── requirements.txt  # Python bağımlılıkları
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Ana React uygulaması
│   │   ├── App.css       # Uygulama stilleri
│   │   └── main.jsx      # React giriş noktası
│   ├── package.json
│   └── vite.config.js
├── .env.example
└── README.md
```

## Gereksinimler

- Python 3.10 veya üzeri
- Node.js ve npm
- PostgreSQL

## Kurulum

### 1. Veritabanını oluşturun

PostgreSQL içinde uygulama için bir veritabanı oluşturun:

```sql
CREATE DATABASE kutuphane_db;
```

Uygulama başlarken `kitaplar` tablosunu SQLAlchemy `create_all()` ile otomatik oluşturur. Şema değişiklikleri için migration sistemi kullanılmamaktadır.

### 2. Ortam değişkenini ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın ve PostgreSQL bilgilerinizi girin:

```env
DATABASE_URL=postgresql://postgres:SIFRENIZ@localhost:5432/kutuphane_db
```

`.env` dosyasını GitHub’a göndermeyin. Gerçek veritabanı parolası yalnızca yerel ortamda tutulmalıdır.

### 3. Backend bağımlılıklarını kurun

Proje kök dizininden PowerShell ile:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Backend’i çalıştırın:

```powershell
uvicorn main:app --app-dir backend --reload --port 8000
```

API şu adreste çalışır: `http://localhost:8000`

FastAPI dokümantasyonu:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. Frontend bağımlılıklarını kurun

Yeni bir terminalde:

```powershell
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` adresinde açılır. Uygulamanın frontend’i API’ye `http://localhost:8000` üzerinden bağlanır.

## Kullanım

1. Sol panelden kitap adı, yazar ve okundu durumunu girip **Ekle** düğmesine basın.
2. Koleksiyondaki bir kitaba tıklayarak sağ panelde bilgilerini güncelleyin.
3. Seçili kitabı silmek için **Sil** düğmesini kullanın.
4. Arama kutusu, yazar filtresi, durum filtresi ve sıralama seçenekleriyle listeyi daraltın.
5. Mevcut koleksiyonu indirmek için **Listeyi İndir** düğmesine basın.

## API


| Method   | Endpoint               | Açıklama                   | Başarı durumu  |
| ---------- | ------------------------ | ------------------------------ | ------------------ |
| `GET`    | `/kitaplar`            | Tüm kitapları listeler     | `200 OK`         |
| `POST`   | `/kitaplar`            | Yeni kitap ekler             | `201 Created`    |
| `PUT`    | `/kitaplar/{kitap_id}` | Kitap bilgilerini günceller | `200 OK`         |
| `DELETE` | `/kitaplar/{kitap_id}` | Kitabı siler                | `204 No Content` |

### Kitap nesnesi

```json
{
  "id": 1,
  "kitap_ad": "Tutunamayanlar",
  "yazar_ad_soyad": "Oğuz Atay",
  "okundu_mu": false
}
```

`kitap_ad` ve `yazar_ad_soyad` boş bırakılamaz. Aynı kitap ve yazar kombinasyonu veritabanında benzersizdir; tekrar ekleme veya güncelleme durumunda API `409 Conflict` döndürür. Var olmayan kitap kimlikleri için `404 Not Found` döndürülür.

## Geliştirme Komutları

Frontend dizininde:

```powershell
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Production build'i yerel olarak önizleme
npm run lint     # Oxlint kontrolü
```

Backend’de şu an otomatik test paketi bulunmamaktadır. API davranışı Swagger UI üzerinden manuel olarak denenebilir.

## Mevcut Kapsam ve Sınırlar

- Kimlik doğrulama ve kullanıcı yetkilendirmesi yoktur.
- Veriler PostgreSQL’de tutulur; SQLite için yapılandırma bulunmaz.
- Kitapların tamamı frontend’e yüklenir; pagination backend’de uygulanmamıştır.
- Frontend API adresi şu anda `App.jsx` içinde sabittir.
- Dışa aktarma, aktif filtrelerden bağımsız olarak frontend’de yüklenmiş tüm kitapları indirir.
- Kullanıcıya görünür hata ve başarı bildirimleri sınırlıdır; hatalar ağırlıklı olarak tarayıcı konsoluna yazılır.
- Production deployment, migration ve CI/CD yapılandırması bu projenin mevcut kapsamına dahil değildir.
