// backend/src/controllers/gameController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get game data by game ID
 * For now, serves from JSON files. In future, this can be migrated to database.
 */
export function getGameData(req, res) {
  try {
    const gameId = req.params.id; // e.g., "reorder_game_1"

    // Construct path to game data file
    const gameDataPath = path.resolve(__dirname, '../../../data', `${gameId}.json`);

    // Check if file exists
    if (!fs.existsSync(gameDataPath)) {
      return res.status(404).json({
        success: false,
        message: `Game data not found for: ${gameId}`
      });
    }

    // Read and parse the JSON file
    const gameData = JSON.parse(fs.readFileSync(gameDataPath, 'utf-8'));

    res.json({ success: true, data: gameData });
  } catch (error) {
    console.error('Error fetching game data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game data'
    });
  }
}
