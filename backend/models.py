from sqlalchemy import Column, Integer, String, Boolean, UniqueConstraint
from database import Base

class Kitap(Base):
    __tablename__ = "kitaplar"

    # Tablonun sütunları ve özellikleri
    id = Column(Integer, primary_key=True, index=True) # primary key olunca otomatik olarak unique ve not null olur ve auto increment özelliği kazanır
    kitap_ad = Column(String, nullable=False)
    yazar_ad_soyad = Column(String, nullable=False)
    okundu_mu = Column(Boolean, default=False)
    
    __table_args__ = (
        UniqueConstraint(
            "kitap_ad",
            "yazar_ad_soyad",
            name="uq_kitap_yazar"
        ),
    )