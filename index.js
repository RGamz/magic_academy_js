const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Home route (basic HTML for now)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Magic Academy server running at http://localhost:${PORT}`);
});