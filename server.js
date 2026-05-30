import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Menyajikan file statis dari folder hasil build (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Mengarahkan semua rute kembali ke index.html (Penting untuk React Router/Vite)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PitchPerfect Server is running on port ${PORT}`);
});