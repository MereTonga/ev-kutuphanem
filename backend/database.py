from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Bağlantı adresi
DATABASE_URL = "postgresql://postgres:147951@localhost:5432/kutuphane_db"

# 2. Veritabanı motoru
engine = create_engine(DATABASE_URL)

# 3. Oturum fabrikası
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Tablolarımızın miras alacağı temel sınıf
Base = declarative_base()