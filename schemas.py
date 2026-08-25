from pydantic import BaseModel

# Kullanıcıdan veri alırken kullanılan şema
class KitapCreate(BaseModel):
    kitap_ad: str
    yazar_ad_soyad: str
    okundu_mu: bool = False

# Kullanıcıya veri dönerken kullanılan şema
class KitapResponse(KitapCreate):
    id: int

    class Config:
        from_attributes = True