from fastapi import FastAPI, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, SessionLocal

# Tablolar yoksa otomatik oluşturur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kütüphane API")

# Her istek için oturum açıp kapatan bağımlılık fonksiyonu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Yeni Kitap Ekleme (POST)
@app.post("/kitaplar", response_model=schemas.KitapResponse, status_code=status.HTTP_201_CREATED)
def kitap_ekle(kitap: schemas.KitapCreate, db: Session = Depends(get_db)):
    # 1. Pydantic şemasındaki veriyi SQLAlchemy modeline çeviriyoruz
    yeni_kitap = models.Kitap(
        kitap_ad=kitap.kitap_ad,
        yazar_ad_soyad=kitap.yazar_ad_soyad,
        okundu_mu=kitap.okundu_mu
    )
    
    # 2. Oturuma ekle
    db.add(yeni_kitap)
    
    # 3. Değişiklikleri veritabanına kalıcı olarak kaydet
    db.commit()
    
    # 4. Veritabanının ürettiği ID ve güncel verileri modele geri yükle
    db.refresh(yeni_kitap)
    
    return yeni_kitap

# Kitapları Listeleme (GET)
@app.get("/kitaplar", response_model=List[schemas.KitapResponse])
def kitaplari_getir(db: Session = Depends(get_db)):
    kitaplar = db.query(models.Kitap).all()
    return kitaplar

# Kitap Silme (DELETE)
@app.delete("/kitaplar/{kitap_id}", status_code=status.HTTP_204_NO_CONTENT)
def kitap_sil(kitap_id: int, db: Session = Depends(get_db)):
    kitap = db.query(models.Kitap).filter(models.Kitap.id == kitap_id).first()
    
    if not kitap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kitap bulunamadı.")
    
    db.delete(kitap)
    db.commit()
    
    return None

# Kitabı Güncelleme (PUT)
@app.put("/kitaplar/{kitap_id}", response_model=schemas.KitapResponse)
def kitap_guncelle(kitap_id: int, guncel_bilgiler: schemas.KitapCreate, db: Session = Depends(get_db)):
    kitap = db.query(models.Kitap).filter(models.Kitap.id == kitap_id).first()
    
    if not kitap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Güncellenmek istenen kitap bulunamadı."
        )
    
    # Alanları yeni gelen bilgilerle güncelle
    kitap.kitap_ad = guncel_bilgiler.kitap_ad
    kitap.yazar_ad_soyad = guncel_bilgiler.yazar_ad_soyad
    kitap.okundu_mu = guncel_bilgiler.okundu_mu
    
    db.commit()
    db.refresh(kitap)
    return kitap