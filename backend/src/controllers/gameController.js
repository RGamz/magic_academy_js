import { fetchReorderGame } from '../models/reorderGameModel.js';

export function getReorderGame(req, res) {
  try {
    const { idOrSlug } = req.params;
    const game = fetchReorderGame(idOrSlug);
    if (!game) {
      res.status(404).json({ success: false, message: 'Game not found' });
      return;
    }

    res.json({ success: true, data: game });
  } catch (error) {
    console.error('Failed to load reorder game from database', error);
    res.status(500).json({ success: false, message: 'Unable to load game' });
  }
}
