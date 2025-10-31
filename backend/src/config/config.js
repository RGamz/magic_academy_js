// backend/src/config/config.js — global configuration for backend
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname (not available in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the configuration object
const config = {
  lessonsDirectory: path.resolve(__dirname, '../../assets/lessons'),
  // TODO: add more config such as localization path, games path, etc.
};

// Export for ES Modules
export default config;
