from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

import models
import schemas
from database import engine, SessionLocal

# Tablolar yoksa otomatik oluşturur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kütüphane API")

origins = [
    "http://localhost:5173", # Vite kullanırsak
    "http://localhost:3000", # Standart React portu
]

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Hangi adreslerden istek gelebilir?
    allow_credentials=True,      # Çerez/kimlik bilgisi kabul edilsin mi?
    allow_methods=["*"],         # Hangi HTTP metodlarına izin verilsin? (GET, POST, PUT, DELETE vb. hepsi)
    allow_headers=["*"],         # Hangi başlıklara (headers) izin verilsin?
)

# Her istek için oturum açıp kapatan bağımlılık fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def api_karsilama():
    return {
        "mesaj": "Kütüphane API çalışıyor.",
        "dokumantasyon": "/docs",
        "kitaplar": "/kitaplar",
    }

# -----------------------------------------
# CREATE - Yeni Kitap Ekle
# -----------------------------------------
@app.post("/kitaplar", response_model=schemas.KitapResponse, status_code=status.HTTP_201_CREATED)
def kitap_ekle(kitap: schemas.KitapCreate, db: Session = Depends(get_db)):
    
    # Aynı kitap ve yazarın zaten kayıtlı olup olmadığını kontrol et
    mevcut_kitap = db.query(models.Kitap).filter(
        models.Kitap.kitap_ad == kitap.kitap_ad,
        models.Kitap.yazar_ad_soyad == kitap.yazar_ad_soyad
    ).first()

    # Eğer aynı kitap ve yazar zaten varsa, 409 Conflict hatası döndür
    if mevcut_kitap:
        raise HTTPException(
            status_code=409,
            detail="Bu kitap ve yazar zaten kayıtlı."
        )
    
    # 1. Pydantic şemasındaki veriyi SQLAlchemy modeline çeviriyoruz
    yeni_kitap = models.Kitap(
        kitap_ad=kitap.kitap_ad,
        yazar_ad_soyad=kitap.yazar_ad_soyad,
        okundu_mu=kitap.okundu_mu
    )
    
    # 2. Oturuma ekle
    db.add(yeni_kitap)
    
    # 3. Değişiklikleri veritabanına kalıcı olarak kaydet
    try:
        db.commit()
        # 4. Veritabanının ürettiği ID ve güncel verileri modele geri yükle
        db.refresh(yeni_kitap)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kitap ve yazar zaten kayıtlı."
        )
    
    
    return yeni_kitap

# -----------------------------------------
# READ - Kitapları Listele
# -----------------------------------------
@app.get("/kitaplar", response_model=List[schemas.KitapResponse])
def kitaplari_getir(db: Session = Depends(get_db)):
    return db.query(models.Kitap).all()

# -----------------------------------------
# DELETE - Kitap Sil
# -----------------------------------------
@app.delete("/kitaplar/{kitap_id}", status_code=status.HTTP_204_NO_CONTENT)
def kitap_sil(kitap_id: int, db: Session = Depends(get_db)):
    kitap = db.query(models.Kitap).filter(models.Kitap.id == kitap_id).first()
    
    if not kitap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kitap bulunamadı.")
    
    db.delete(kitap)
    db.commit()
    
    return None

# -----------------------------------------
# UPDATE - Kitap Güncelle
# -----------------------------------------
@app.put("/kitaplar/{kitap_id}", response_model=schemas.KitapResponse)
def kitap_guncelle(kitap_id: int, guncel_bilgiler: schemas.KitapCreate, db: Session = Depends(get_db)):
    kitap = db.query(models.Kitap).filter(models.Kitap.id == kitap_id).first()
    
    if not kitap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Güncellenmek istenen kitap bulunamadı."
        )
    
    # Güncellenmek istenen kitap+yazar kombinasyonu başka bir kayıtta var mı?
    mevcut_kitap = db.query(models.Kitap).filter(
        models.Kitap.kitap_ad == guncel_bilgiler.kitap_ad,
        models.Kitap.yazar_ad_soyad == guncel_bilgiler.yazar_ad_soyad,
        models.Kitap.id != kitap_id
    ).first()
    
    # Eğer aynı kitap ve yazar başka bir kayıtta varsa, 409 Conflict hatası döndür
    if mevcut_kitap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kitap ve yazar zaten başka bir kayıtta mevcut."
        )
    
    # Alanları yeni gelen bilgilerle güncelle
    kitap.kitap_ad = guncel_bilgiler.kitap_ad
    kitap.yazar_ad_soyad = guncel_bilgiler.yazar_ad_soyad
    kitap.okundu_mu = guncel_bilgiler.okundu_mu
    
    try:
        db.commit()
        db.refresh(kitap)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu kitap ve yazar zaten kayıtlı."
        )

    return kitap