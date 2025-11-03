import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import contentRoutes from './backend/src/routes/contentRoutes.js';
import gameRoutes from './backend/src/routes/gameRoutes.js';
import { initializeDatabase } from './backend/src/db/initDb.js';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
const PORT = process.env.PORT || 3000;

initializeDatabase();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'backend', 'assets')));

// API routes
app.use('/api', contentRoutes);
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log('✅ Listening on http://localhost:3000'));
