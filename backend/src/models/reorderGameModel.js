import { escapeSqlValue, runQuery } from '../db/connection.js';

export function fetchReorderGame(identifier) {
  const numericIdentifier = Number(identifier);
  const useNumericLookup = !Number.isNaN(numericIdentifier);

  const gameRows = useNumericLookup
    ? runQuery(
        `SELECT id, slug, title, description FROM reorder_games WHERE id = ${numericIdentifier};`
      )
    : runQuery(
        `SELECT id, slug, title, description FROM reorder_games WHERE slug = ${escapeSqlValue(identifier)};`
      );

  if (!gameRows.length) {
    return null;
  }

  const game = gameRows[0];
  const gameId = Number(game.id);
  const levelRows = runQuery(
    `SELECT image, sentence_json AS sentenceJson, audio FROM reorder_levels WHERE game_id = ${gameId} ORDER BY position;`
  );
  const levels = levelRows.map((level) => {
    let sentence = [];
    if (level.sentenceJson) {
      try {
        sentence = JSON.parse(level.sentenceJson);
      } catch (error) {
        console.warn('Failed to parse sentence JSON for reorder game %s', game.slug, error);
      }
    }

    return {
      image: level.image ?? undefined,
      sentence,
      audio: level.audio ?? undefined,
    };
  });

  return {
    id: gameId,
    slug: game.slug,
    title: game.title ?? undefined,
    description: game.description ?? undefined,
    levels,
  };
}
