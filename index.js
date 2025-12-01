// index.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import lessonRoutes from './backend/src/routes/lessonRoutes.js';
import gameRoutes from './backend/src/routes/gameRoutes.js';
import vocabularyRoutes from './backend/src/routes/vocabularyRoutes.js';
import bookRoutes from './backend/src/routes/bookRoutes.js';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });
const PORT = process.env.PORT || 3000;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// API Routes
app.use('/api/lessons', lessonRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/books', bookRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/assets', express.static(path.join(__dirname, 'backend', 'assets')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on http://localhost:' + PORT);
  console.log('📚 API available at http://localhost:' + PORT + '/api/lessons');
});
