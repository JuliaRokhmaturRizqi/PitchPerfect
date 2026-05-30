# Gunakan image Node.js yang ringan
FROM node:20-alpine

# Buat direktori kerja di dalam kontainer
WORKDIR /app

# Salin file konfigurasi paket
COPY package*.json ./

# Instal semua dependensi
RUN npm install

# Salin seluruh kode proyek
COPY . .

# Bangun aplikasi Vite menjadi file statis (folder dist)
RUN npm run build

# Ekspos port yang digunakan oleh Cloud Run
EXPOSE 8080

# Jalankan server Express
CMD ["node", "server.js"]