// scripts/add-book.js
// Add a book to the database
//
// Usage:
//   node scripts/add-book.js <json-file>
//   node scripts/add-book.js --title "Book Title" --pdf "/assets/books/book.pdf" --cover "/assets/images/books/cover.jpg"

import fs from 'fs';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');         // Trim hyphens
}

// Normalize path to web-accessible format
function normalizePath(inputPath) {
  if (!inputPath) return null;

  // If it's already a relative web path starting with /, return as-is
  if (inputPath.startsWith('/assets/')) {
    return inputPath;
  }

  // If it's an absolute filesystem path, extract the /assets/... portion
  const assetsMatch = inputPath.match(/\/assets\/.+$/);
  if (assetsMatch) {
    return assetsMatch[0];
  }

  // Windows-style absolute path (C:/, D:/, etc.)
  const windowsMatch = inputPath.match(/[A-Z]:[\/\\].+[\/\\]assets[\/\\](.+)$/i);
  if (windowsMatch) {
    return '/assets/' + windowsMatch[1].replace(/\\/g, '/');
  }

  console.warn(`⚠️  Warning: Path "${inputPath}" doesn't contain /assets/. Using as-is.`);
  return inputPath;
}

// Add single book
function addBook(bookData) {
  const slug = bookData.slug || generateSlug(bookData.title);
  
  // Check if book already exists
  const existing = db.prepare('SELECT id FROM books WHERE slug = ?').get(slug);
  if (existing) {
    console.log(`⚠️  Book "${bookData.title}" already exists (slug: ${slug})`);
    return existing.id;
  }

  // Normalize paths to ensure they're web-accessible
  const coverPath = normalizePath(bookData.cover);
  const pdfPath = normalizePath(bookData.pdf);

  const result = db.prepare(`
    INSERT INTO books (title, slug, cover_image, pdf_path, page_count)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    bookData.title,
    slug,
    coverPath,
    pdfPath,
    bookData.pageCount || 0
  );

  console.log(`✅ Added book: "${bookData.title}" (slug: ${slug}, id: ${result.lastInsertRowid})`);
  return result.lastInsertRowid;
}

// Bulk add books from JSON
function bulkAddBooks(jsonFilePath) {
  console.log(`\n📚 Adding books from: ${jsonFilePath}\n`);

  const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const books = data.books || [data]; // Support both { books: [...] } and single book

  const addAll = db.transaction(() => {
    let count = 0;
    for (const book of books) {
      addBook(book);
      count++;
    }
    return count;
  });

  const count = addAll();
  console.log(`\n🎉 Added ${count} book(s) to the database`);
  console.log('💡 Don\'t forget to restart Docker: docker compose restart\n');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📚 Add Books to Library
═════════════════════════════════════════════════════

Usage:
  node scripts/add-book.js <json-file>
  node scripts/add-book.js --title "Title" --pdf "/path/to/book.pdf" [options]

Options:
  --title <text>      Book title (required)
  --pdf <path>        Path to PDF file - use web paths like /assets/books/file.pdf (required)
  --cover <path>      Path to cover image - use web paths like /assets/images/books/cover.jpg (optional)
  --slug <text>       Custom slug (optional, auto-generated from title)
  --pages <number>    Page count (optional)

Note: Paths are automatically normalized to web-accessible format (/assets/...)

JSON file format:
{
  "books": [
    {
      "title": "Le Petit Prince",
      "pdf": "/assets/books/petit-prince.pdf",
      "cover": "/assets/images/books/petit-prince-cover.jpg",
      "pageCount": 96
    }
  ]
}

Examples:
  node scripts/add-book.js data/imports/books.json
  node scripts/add-book.js --title "Mon Premier Livre" --pdf "/assets/books/livre1.pdf"
    `);
    process.exit(1);
  }

  // Check if first arg is a file
  if (!args[0].startsWith('--') && fs.existsSync(args[0])) {
    return { type: 'file', path: args[0] };
  }

  // Parse flags
  const bookData = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      bookData.title = args[++i];
    } else if (args[i] === '--pdf' && args[i + 1]) {
      bookData.pdf = args[++i];
    } else if (args[i] === '--cover' && args[i + 1]) {
      bookData.cover = args[++i];
    } else if (args[i] === '--slug' && args[i + 1]) {
      bookData.slug = args[++i];
    } else if (args[i] === '--pages' && args[i + 1]) {
      bookData.pageCount = parseInt(args[++i]);
    }
  }

  if (!bookData.title || !bookData.pdf) {
    console.error('❌ --title and --pdf are required');
    process.exit(1);
  }

  return { type: 'inline', data: bookData };
}

// Main
const input = parseArgs();

if (input.type === 'file') {
  bulkAddBooks(input.path);
} else {
  console.log('\n📚 Adding book...\n');
  addBook(input.data);
  console.log('\n💡 Don\'t forget to restart Docker: docker compose restart\n');
}

db.close();
