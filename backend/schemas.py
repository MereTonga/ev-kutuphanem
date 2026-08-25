from pydantic import BaseModel, ConfigDict, field_validator


class KitapCreate(BaseModel):
    kitap_ad: str
    yazar_ad_soyad: str
    okundu_mu: bool = False

    @field_validator("kitap_ad")
    @classmethod
    def kitap_adini_formatla(cls, value: str) -> str:
        value = " ".join(value.strip().split())

        if not value:
            raise ValueError("Kitap adı boş olamaz.")

        return value

    @field_validator("yazar_ad_soyad")
    @classmethod
    def yazari_formatla(cls, value: str) -> str:
        value = " ".join(value.strip().split())

        if not value:
            raise ValueError("Yazar adı boş olamaz.")

        return value.title()


class KitapResponse(KitapCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)