import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
const PORT = process.env.PORT || 3000;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from ./backend/public  (adjust path if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static JSON data from /data folder
app.use('/data', express.static(path.join(__dirname, 'data')));

// Serve static files from backend assets (images, audio, lessons, etc.)
app.use('/assets', express.static(path.join(__dirname, 'backend', 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log('✅ Listening on http://localhost:3000'));
