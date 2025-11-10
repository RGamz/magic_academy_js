# 🎓 L'Académie des Mots Magiques

A French language learning web application featuring interactive lessons, games, and multimedia content. Built with Express.js, SQLite, and vanilla JavaScript.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen.svg)

## 📖 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Adding Content](#-adding-content)
- [Deployment](#-deployment)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 📚 **Interactive Lessons** - Multi-task lessons with audio, images, and text
- 🎮 **Educational Games** - Word arrangement games, color matching, and more
- 🗣️ **Audio Support** - Native pronunciation for vocabulary learning
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🌐 **RESTful API** - Clean API architecture for easy content management
- 💾 **SQLite Database** - Normalized database structure with migrations
- 🔄 **Hot Reload** - Auto-restart during development with nodemon
- 🎨 **Modern UI** - Clean, accessible interface with custom CSS

## 🎬 Demo

Visit the live application: `https://magicacademy.duckdns.org`

### Screenshots

**Home Page - Lesson Selection**
```
┌─────────────────────────────────────┐
│  L'Académie des Mots Magiques       │
├─────────────────────────────────────┤
│  [Lesson Card 1]  [Lesson Card 2]   │
│  [Lesson Card 3]  [Lesson Card 4]   │
└─────────────────────────────────────┘
```

**Lesson View - Interactive Tasks**
```
┌──────────────────┬──────────┐
│                  │ Tasks    │
│  Main Image      │ ▸ Task 1 │
│                  │ ▸ Task 2 │
│                  │ ▸ Task 3 │
└──────────────────┴──────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** (v20+) - JavaScript runtime
- **Express.js** (v5.1) - Web framework
- **better-sqlite3** (v12.4) - SQLite database driver
- **dotenv** - Environment configuration

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **Interact.js** - Drag-and-drop functionality

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **GitHub Actions** - CI/CD pipeline
- **Let's Encrypt** - SSL/TLS certificates

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart on changes

## 📁 Project Structure

```
magic_academy/
├── backend/
│   ├── assets/
│   │   ├── audio/          # Audio files (.mp3)
│   │   └── images/         # Image files (.jpg, .png)
│   └── src/
│       ├── config/         # Configuration files
│       ├── controllers/    # Request handlers
│       │   ├── lessonController.js
│       │   └── gameController.js
│       ├── db/
│       │   ├── migrations/ # Database migrations
│       │   │   ├── 001_init.sql
│       │   │   └── 002_add_lesson_preview_fields.sql
│       │   └── migrate.js  # Migration runner
│       ├── routes/         # API routes
│       └── models/         # Data models (legacy)
├── public/                 # Static frontend files
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── renderLesson.js
│   ├── index.html          # Home page
│   ├── lesson.html         # Lesson viewer
│   ├── games.html          # Games hub
│   └── *.html              # Individual game pages
├── data/
│   ├── magic_academy.sqlite  # SQLite database
│   └── imports/            # JSON files for bulk import
├── scripts/
│   ├── bulk-add-lessons.js # Bulk lesson importer
│   └── lesson-status.js    # Database status checker
├── nginx/
│   └── default.conf        # Nginx configuration
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Container definition
├── index.js                # Express app entry point
├── package.json            # Dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Git**

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RGamz/magic_academy_js.git
   cd magic_academy_js
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   PORT=3000
   DB_FILE=./data/magic_academy.sqlite
   DEBUG=false
   ```

4. **Initialize the database**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### Docker Setup (Recommended for Production)

1. **Build and start containers**
   ```bash
   docker compose up -d --build
   ```

2. **Run migrations**
   ```bash
   docker compose run --rm app npm run migrate
   ```

3. **Access the application**
   ```
   http://localhost:3000
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Get All Lessons
```http
GET /api/lessons
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "lesson_1",
      "title": "Bonjour",
      "description": "Learn basic greetings",
      "cover": "/assets/images/lesson1.jpg",
      "tag": "Débutant",
      "created_at": "2025-01-10 10:00:00"
    }
  ]
}
```

#### Get Lesson by ID
```http
GET /api/lessons/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Bonjour",
    "mainImage": "/assets/images/lesson1.jpg",
    "breadcrumb": ["Bonjour"],
    "tasks": [
      {
        "title": "Objectifs",
        "lines": ["1. Apprendre à dire bonjour"],
        "audio": "/assets/audio/bonjour.mp3",
        "image": null,
        "game": null
      }
    ]
  }
}
```

#### Get Lesson by Slug
```http
GET /api/lessons/slug/:slug
```

**Example:** `/api/lessons/slug/lesson_1`

#### Get Game Data
```http
GET /api/games/:id
```

**Example:** `/api/games/reorder_game_1`

**Response:**
```json
{
  "success": true,
  "data": {
    "levels": [
      {
        "image": "/assets/images/level1.jpg",
        "sentence": ["Léo", "pose", "un", "crayon", "bleu."],
        "audio": "/assets/audio/sentence1.mp3"
      }
    ]
  }
}
```

### Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Status Codes:**
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

## 🗃️ Database Schema

### Core Tables

```sql
-- Lessons table
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY,
  title_id INTEGER NOT NULL,
  preview_image_id INTEGER,
  main_image_id INTEGER,
  description_id INTEGER,
  slug TEXT UNIQUE,
  tag TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(title_id) REFERENCES text_translations(id)
);

-- Lesson tasks
CREATE TABLE lesson_tasks (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL,
  title_id INTEGER NOT NULL,
  description_id INTEGER NOT NULL,
  audio_id INTEGER,
  image_id INTEGER,
  game_id INTEGER,
  added_by INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(lesson_id) REFERENCES lessons(id)
);

-- Text translations (for multi-language support)
CREATE TABLE text_translations (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  language_id INTEGER NOT NULL,
  FOREIGN KEY(language_id) REFERENCES languages(id)
);
```

### Relationships

```
lessons (1) ─────→ (N) lesson_tasks
   │                      │
   │                      ├─→ text_translations (title)
   │                      ├─→ text_translations (description)
   ├─→ text_translations  ├─→ audio_content
   ├─→ images (preview)   ├─→ images
   └─→ images (main)      └─→ games
```

### Migration Management

Create a new migration:
```bash
touch backend/src/db/migrations/003_add_your_feature.sql
```

Run all pending migrations:
```bash
npm run migrate
```

Check migration status:
```sql
SELECT * FROM _migrations;
```

## 📝 Adding Content

### Method 1: Bulk Import from JSON

1. **Create a JSON file** in `data/imports/`:

```json
{
  "lessons": [
    {
      "title": "Les Couleurs",
      "description": "Learn colors in French",
      "slug": "lesson_colors",
      "tag": "Débutant",
      "previewImage": "/assets/images/colors_preview.jpg",
      "mainImage": "/assets/images/colors_main.jpg",
      "tasks": [
        {
          "title": "Objectifs",
          "lines": ["1. Apprendre les couleurs de base"],
          "audio": "/assets/audio/colors_intro.mp3",
          "image": null,
          "game": null
        }
      ]
    }
  ]
}
```

2. **Import the lessons:**
   ```bash
   npm run lesson:add data/imports/new-lessons.json
   ```

3. **Restart the app:**
   ```bash
   docker compose restart
   ```

### Method 2: Direct Database Insert

```javascript
import Database from 'better-sqlite3';
const db = new Database('./data/magic_academy.sqlite');

// Insert a text translation
const titleId = db.prepare(
  'INSERT INTO text_translations (content, language_id) VALUES (?, ?)'
).run('Mon Titre', 1).lastInsertRowid;

// Insert a lesson
const lessonId = db.prepare(
  'INSERT INTO lessons (title_id, slug, tag) VALUES (?, ?, ?)'
).run(titleId, 'lesson_new', 'Nouveau').lastInsertRowid;
```

### Adding Assets

1. **Place files in appropriate directories:**
   ```
   backend/assets/audio/    → .mp3 files
   backend/assets/images/   → .jpg, .png files
   ```

2. **Reference them in JSON:**
   ```json
   {
     "audio": "/assets/audio/your-file.mp3",
     "image": "/assets/images/your-image.jpg"
   }
   ```

### Check Database Status

```bash
npm run lesson:status
```

Output:
```
📚 Lesson Database Status
═════════════════════════════════════════════════════
📊 Statistics:
   Lessons: 10
   Tasks: 45
   Images: 25
   Audio files: 40
   Games: 5
```

## 🚢 Deployment

### Automated Deployment (GitHub Actions)

Every push to `main` branch triggers automatic deployment:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - SSH to server
      - Pull latest changes
      - Run migrations
      - Restart containers
```

### Required GitHub Secrets

Configure these in Settings → Secrets:

```
SSH_PRIVATE_KEY  - Your SSH private key
SERVER_HOST      - Your server IP/domain
SERVER_PORT      - SSH port (usually 22)
SERVER_USER      - SSH username
APP_PATH         - Path to app on server
```

### Manual Deployment

1. **SSH to your server:**
   ```bash
   ssh user@your-server.com
   ```

2. **Navigate to app directory:**
   ```bash
   cd /path/to/magic_academy
   ```

3. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

4. **Run migrations:**
   ```bash
   docker compose run --rm app npm run migrate
   ```

5. **Restart services:**
   ```bash
   docker compose down
   docker compose up -d --build
   ```

### SSL Certificate Setup

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
```

## 💻 Development

### Available Scripts

```bash
# Start production server
npm start

# Start development server (auto-reload)
npm run dev

# Run database migrations
npm run migrate

# Migrate content from JSON
npm run migrate:content

# Add lessons from JSON file
npm run lesson:add data/imports/file.json

# Check database status
npm run lesson:status

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Code Style

This project uses ESLint and Prettier:

```javascript
// .prettierrc
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

Run before committing:
```bash
npm run lint:fix && npm run format
```

### Debugging

Enable debug mode in `.env`:
```env
DEBUG=true
```

Add console logs in controllers:
```javascript
export function getLessonById(req, res) {
  console.log('📥 Request params:', req.params);
  const lesson = db.prepare('SELECT...').get(req.params.id);
  console.log('📊 Query result:', lesson);
  // ...
}
```

View Docker logs:
```bash
docker compose logs -f app
```

### Testing API with curl

```bash
# Get all lessons
curl http://localhost:3000/api/lessons

# Get specific lesson
curl http://localhost:3000/api/lessons/1

# Get lesson by slug
curl http://localhost:3000/api/lessons/slug/lesson_1

# Get game data
curl http://localhost:3000/api/games/reorder_game_1
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Coding Guidelines

- Use ES6+ features (arrow functions, destructuring, etc.)
- Follow existing code style (ESLint + Prettier)
- Write descriptive commit messages
- Add comments for complex logic
- Test thoroughly before submitting

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No new warnings or errors
- [ ] Database migrations included (if applicable)
- [ ] README updated (if needed)

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- French language content sourced from educational materials
- Icons and images from open-source resources
- Built with ❤️ for French language learners

## 📞 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/RGamz/magic_academy/issues)
- **Discussions:** [GitHub Discussions](https://github.com/RGamz/magic_academy/discussions)

---

Made with 🇫🇷 by Gamzat Ramazanov
