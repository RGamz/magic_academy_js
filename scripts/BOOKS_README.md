# Book Management Guide

## Adding Books to the Library

Use the `add-book.js` script to add books to the database.

### Method 1: Using a JSON file (Recommended)

Create a JSON file with book data:

```json
{
  "books": [
    {
      "title": "Amis pour la vie",
      "pdf": "/assets/books/amis-pour-la-vie.pdf",
      "cover": "/assets/images/book_covers/amis-pour-la-vie.jpg",
      "pageCount": 27
    }
  ]
}
```

Then run:
```bash
node scripts/add-book.js data/books/your-book.json
```

### Method 2: Using command-line arguments

```bash
node scripts/add-book.js \
  --title "Book Title" \
  --pdf "/assets/books/book.pdf" \
  --cover "/assets/images/book_covers/cover.jpg" \
  --pages 30
```

## Important: Path Format

**Always use web-accessible paths starting with `/assets/`**

✅ **Correct:**
- `/assets/books/my-book.pdf`
- `/assets/images/book_covers/my-cover.jpg`

❌ **Avoid (but will be auto-corrected):**
- `C:/Program Files/Git/assets/books/my-book.pdf`
- `/home/user/project/backend/assets/books/my-book.pdf`
- `backend/assets/books/my-book.pdf`

The script automatically normalizes absolute paths, but it's best practice to use the correct format from the start.

## File Organization

Books should be placed in:
- **PDFs:** `backend/assets/books/`
- **Covers:** `backend/assets/images/book_covers/`
- **Page data:** `data/books/<slug>.json`

## After Adding a Book

1. Restart the Docker container: `docker compose restart`
2. Verify the book appears in the library at `/books.html`
3. Check the API response: `curl http://localhost:3000/api/books`

## Common Issues

### Book cover not loading
- Check the file exists in `backend/assets/images/book_covers/`
- Verify the filename matches the database entry (check hyphens vs underscores)
- Ensure the path in the database starts with `/assets/`

### PDF not displaying
- Check the file exists in `backend/assets/books/`
- Verify the file extension is `.pdf` (case-sensitive on some systems)
