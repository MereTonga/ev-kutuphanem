# 1. Taban imaj: Kullandığın Python sürümünün hafif (slim) versiyonu
FROM python:3.12-slim

# 2. Python'ın terminal çıktılarını anında basması ve .pyc üretmemesi için optimizasyonlar
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Konteynır içindeki çalışma klasörü
WORKDIR /app

# 4. Önce sadece bağımlılıkları kopyalayıp kuruyoruz (Docker cache avantajı)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Kalan tüm backend kodlarını içeri aktar
COPY . .

# 6. Uvicorn'un çalışacağı port
EXPOSE 8000

# 7. Uygulamayı başlatma komutu (0.0.0.0 dışarıdan erişim için zorunludur)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]