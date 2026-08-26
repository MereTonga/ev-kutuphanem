# 1. Taban imaj olarak Node.js kullanıyoruz
FROM node:24-slim

# 2. Konteynır içindeki çalışma dizini
WORKDIR /app

# 3. Bağımlılık dosyalarını kopyalayıp paketleri yüklüyoruz
COPY package*.json ./
RUN npm install

# 4. Kalan dosyaları kopyalıyoruz
COPY . .

# 5. Vite'ın varsayılan portu
EXPOSE 5173

# 6. Uygulamayı 0.0.0.0 hostu ile dışarı açarak başlatıyoruz
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]