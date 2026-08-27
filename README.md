# Kütüphanem

Kişisel kitap koleksiyonunu yönetmek için geliştirilmiş, Türkçe arayüze sahip full-stack ev kütüphanesi uygulaması. Kitaplar PostgreSQL veritabanında saklanır; React arayüzü üzerinden koleksiyon eklenebilir, güncellenebilir, silinebilir, aranabilir, filtrelenebilir ve JSON olarak yedeklenebilir.

<img width="1887" height="1202" alt="image" src="https://github.com/user-attachments/assets/7cfd0dc2-5a09-4d11-8220-c55ba12f1ebe" />

## Özellikler

- Kitap adı, yazar ve okundu durumu ile kitap ekleme
- Seçili kitabı güncelleme
- Tekli veya çoklu kitap silme
- Normal tıklama ile tekli seçim
- `Ctrl` / `Cmd` tıklaması ile birden fazla seçim
- `Shift` tıklaması ile görünen liste üzerinde aralık seçimi
- Kitap adı veya yazar adına göre Türkçe locale destekli arama
- Yazara ve okundu durumuna göre filtreleme
- Yazar ya da kitap adına göre A-Z / Z-A sıralama
- Tüm koleksiyonu `kitaplar.json` olarak dışa aktarma
- Seçili kitapları `secilen-kitaplar.json` olarak dışa aktarma
- JSON dosyasından toplu kitap içe aktarma
- İçe aktarma sırasında mevcut ve aynı dosya içindeki yinelenen kayıtları atlama
- Toplam, okunan, okunmayan ve görünür kitap sayılarını gösterme
- Aynı kitap-yazar çiftinin tekrar eklenmesini engelleme
- Kitap ve yazar adlarında boşluk temizleme ve veri doğrulama
- Docker Compose ile PostgreSQL, FastAPI ve React servislerini birlikte çalıştırma
- Geliştirme sırasında backend ve frontend hot reload desteği

## Teknoloji Stack'i

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- PostgreSQL 18 Alpine
- Pydantic
- Uvicorn
- `python-dotenv`

### Frontend

- React 19
- React DOM
- Vite
- Oxlint
- Özel responsive CSS tasarımı

### Containerization

- Docker
- Docker Compose
- Named PostgreSQL volume
- Üç servisli yapı: `db`, `backend`, `frontend`

## Mimari

```text
Tarayıcı
   │
   │ http://localhost:5173
   ▼
Frontend (Vite + React)
   │
   │ http://localhost:8000
   ▼
Backend (FastAPI + Uvicorn)
   │
   │ PostgreSQL bağlantısı: db:5432
   ▼
Database (PostgreSQL)
```

Docker Compose aşağıdaki servisleri çalıştırır:

| Servis | Container | Port | Görevi |
| --- | --- | --- | --- |
| `db` | `kutuphane_db` | `${DB_PORT}:5432` | PostgreSQL veritabanı |
| `backend` | `kutuphane_backend` | `8000:8000` | FastAPI REST API |
| `frontend` | `kutuphane_frontend` | `5173:5173` | React/Vite kullanıcı arayüzü |

PostgreSQL verileri `postgres_data` named volume’unda tutulur. Container’ları durdurmak verileri silmez; volume’u da silmek için `docker compose down -v` kullanılması gerekir.

## Proje Yapısı

```text
Home Library/
├── backend/
│   ├── database.py       # Veritabanı bağlantısı ve SQLAlchemy ayarları
│   ├── main.py           # FastAPI uygulaması ve endpoint'ler
│   ├── models.py         # SQLAlchemy kitap modeli
│   ├── schemas.py        # Pydantic istek/yanıt şemaları
│   ├── Dockerfile        # Backend container imajı
│   └── requirements.txt  # Python bağımlılıkları
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Ana React uygulaması
│   │   ├── App.css       # Uygulama stilleri
│   │   └── main.jsx      # React giriş noktası
│   ├── Dockerfile        # Frontend container imajı
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Gereksinimler

Docker ile çalıştırma için:

- Docker Desktop
- Docker Compose v2

Manuel geliştirme için ayrıca:

- Python 3.12 veya üzeri
- Node.js ve npm
- PostgreSQL

## Docker ile Çalıştırma (Önerilen)

### 1. Ortam dosyasını oluşturun

Proje kök dizininde `.env.example` dosyasını `.env` olarak kopyalayın:

```powershell
Copy-Item .env.example .env
```

`.env` içindeki PostgreSQL bilgilerini düzenleyin:

```env
DATABASE_URL=postgresql://postgres:sifreniz@localhost:5432/kutuphane_db

DB_USER=postgres
DB_PASSWORD=sifreniz
DB_NAME=kutuphane_db
DB_PORT=5432
```

Compose, container içindeki backend için bağlantı adresini otomatik olarak oluşturur ve PostgreSQL’e `db` servis adı üzerinden bağlanır. Bu nedenle container ortamında `localhost` kullanılmaz.

### 2. Servisleri başlatın

```powershell
docker compose up --build
```

Uygulamayı açın:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Compose yapılandırması veritabanı healthcheck’inin başarılı olmasını bekler. Backend ve frontend kaynak klasörleri container’lara bind mount edildiği için geliştirme değişiklikleri hot reload ile yansır.

### Docker komutları

```powershell
docker compose ps                 # Servis durumlarını gösterir
docker compose logs -f            # Tüm servis loglarını izler
docker compose logs -f backend    # Yalnızca backend loglarını izler
docker compose down               # Container'ları durdurur, veriyi korur
docker compose down -v            # Container'ları ve PostgreSQL volume'unu siler
```

## Manuel Çalıştırma

Docker kullanmadan PostgreSQL’in çalışıyor ve `kutuphane_db` veritabanının oluşturulmuş olması gerekir:

```sql
CREATE DATABASE kutuphane_db;
```

### Backend

Proje kök dizininden PowerShell ile:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
uvicorn main:app --app-dir backend --reload --port 8000
```

API şu adreste çalışır: `http://localhost:8000`

### Frontend

Yeni bir terminalde:

```powershell
cd frontend
npm install
npm run dev
```

Frontend şu adreste çalışır: `http://localhost:5173`

## Kullanım

1. Sol panelden kitap adı, yazar ve okundu durumunu girip **Ekle** düğmesine basın.
2. Bir kitaba tıklayarak seçin ve sağ panelden bilgilerini güncelleyin.
3. Birden fazla kitap seçmek için `Ctrl` / `Cmd` ile tıklayın veya `Shift` ile görünür bir aralık seçin.
4. Seçili kitapları **Sil** veya **Seçilenleri İndir** düğmeleriyle işleyin.
5. **Listeyi İndir** tüm koleksiyonu JSON olarak dışa aktarır.
6. **Listeyi İçeri Aktar** ile daha önce dışa aktarılmış JSON dosyasını yükleyin.
7. Arama, yazar filtresi, durum filtresi ve sıralama seçenekleriyle koleksiyonu daraltın.

İçe aktarma başarılı olduğunda eklenen ve zaten mevcut olduğu için atlanan kayıt sayıları gösterilir. Yüklenen JSON dosyası UTF-8 olmalı, en fazla 5 MB büyüklüğünde olmalı ve kitap nesnelerinden oluşan bir liste içermelidir.

## API

| Method | Endpoint | Açıklama | Başarı durumu |
| --- | --- | --- | --- |
| `GET` | `/` | API durum ve bağlantı bilgilerini döndürür | `200 OK` |
| `GET` | `/kitaplar` | Tüm kitapları listeler | `200 OK` |
| `POST` | `/kitaplar` | Yeni kitap ekler | `201 Created` |
| `POST` | `/kitaplar/import` | JSON dosyasındaki kitapları ekler | `200 OK` |
| `POST` | `/kitaplar/toplu-sil` | ID listesine göre birden fazla kitap siler | `200 OK` |
| `PUT` | `/kitaplar/{kitap_id}` | Kitap bilgilerini günceller | `200 OK` |
| `DELETE` | `/kitaplar/{kitap_id}` | Tek bir kitabı siler | `204 No Content` |

### Kitap nesnesi

```json
{
  "id": 1,
  "kitap_ad": "Tutunamayanlar",
  "yazar_ad_soyad": "Oğuz Atay",
  "okundu_mu": false
}
```

`kitap_ad` ve `yazar_ad_soyad` boş bırakılamaz. Girdi doğrulaması baştaki/sondaki boşlukları ve tekrarlanan boşlukları temizler; yazar adı title case formatına dönüştürülür. Aynı kitap ve yazar kombinasyonu benzersizdir ve çakışma durumunda API `409 Conflict` döndürür. Var olmayan kitap kimlikleri için `404 Not Found` döndürülür.

### JSON içe aktarma

Endpoint, `multipart/form-data` formatında `dosya` alanı bekler:

```json
[
  {
    "kitap_ad": "Tutunamayanlar",
    "yazar_ad_soyad": "Oğuz Atay",
    "okundu_mu": false
  }
]
```

`id` alanı gönderilse bile dikkate alınmaz; ID’leri PostgreSQL üretir. Veritabanında bulunan veya aynı dosya içinde tekrarlanan kitap-yazar çiftleri atlanır.

### Toplu silme

Endpoint, silinecek kitap ID’lerinden oluşan JSON dizi bekler:

```json
[1, 2, 3]
```

Tekrarlanan ID’ler bir kez değerlendirilir. Bulunamayan ID’ler hata üretmez ve yanıtta yalnızca gerçekten silinen kayıt sayısı döndürülür.

## Geliştirme Komutları

Frontend dizininde:

```powershell
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Production build'i önizleme
npm run lint     # Oxlint kontrolü
```

Backend’de şu an otomatik test paketi bulunmamaktadır. API davranışı Swagger UI üzerinden manuel olarak denenebilir.

## Mevcut Kapsam ve Sınırlar

- Kimlik doğrulama ve kullanıcı yetkilendirmesi yoktur.
- Kitapların tamamı frontend’e yüklenir; pagination ve server-side filtreleme uygulanmamıştır.
- Frontend API adresi `App.jsx` içinde sabittir: `http://localhost:8000`.
- Dışa aktarma işlemleri aktif filtrelenmiş görünümü değil, yüklenmiş koleksiyonun tamamını veya seçilen kayıtları kullanır.
- İçe aktarma ve toplu silme durumları arayüzde gösterilir; ekleme ve güncelleme hataları için kullanıcı bildirimleri hâlâ sınırlıdır.
- `create_all()` eksik tabloları oluşturur, ancak migration sistemi yoktur.
- Production deployment, CI/CD ve otomatik backend testleri bu projenin mevcut kapsamına dahil değildir.


## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
