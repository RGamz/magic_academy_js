// backend/src/controllers/bookController.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(process.env.DB_FILE || './data/magic_academy.sqlite');
db.pragma('foreign_keys = ON');

// Path to book data JSON files
const BOOKS_DATA_PATH = path.join(__dirname, '../../../data/books');

/**
 * Get all books for library view
 */
export function getAllBooks(req, res) {
  try {
    const books = db.prepare(`
      SELECT 
        id,
        title,
        slug,
        cover_image as cover,
        pdf_path as pdf,
        page_count as pageCount,
        created_at as createdAt
      FROM books
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, data: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
}

/**
 * Get book by slug with page data from JSON
 */
export function getBookBySlug(req, res) {
  try {
    const { slug } = req.params;

    // Get book from database
    const book = db.prepare(`
      SELECT 
        id,
        title,
        slug,
        cover_image as cover,
        pdf_path as pdf,
        page_count as pageCount
      FROM books
      WHERE slug = ?
    `).get(slug);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Try to load page data from JSON file
    const jsonPath = path.join(BOOKS_DATA_PATH, `${slug}.json`);
    let pages = {};

    if (fs.existsSync(jsonPath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        pages = jsonData.pages || {};
      } catch (err) {
        console.warn(`Warning: Could not parse ${slug}.json:`, err.message);
      }
    }

    res.json({
      success: true,
      data: {
        ...book,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book' });
  }
}

/**
 * Get page data for a specific page
 */
export function getBookPage(req, res) {
  try {
    const { slug, pageNum } = req.params;
    const pageNumber = parseInt(pageNum);

    // Verify book exists
    const book = db.prepare('SELECT slug FROM books WHERE slug = ?').get(slug);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Load page data from JSON
    const jsonPath = path.join(BOOKS_DATA_PATH, `${slug}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      return res.json({
        success: true,
        data: { page: pageNumber, audio: null, vocabulary: [] }
      });
    }

    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const pageData = jsonData.pages?.[pageNumber.toString()] || {};

    res.json({
      success: true,
      data: {
        page: pageNumber,
        audio: pageData.audio || null,
        vocabulary: pageData.vocabulary || []
      }
    });
  } catch (error) {
    console.error('Error fetching page data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch page data' });
  }
}