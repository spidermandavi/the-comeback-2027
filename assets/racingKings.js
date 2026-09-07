import { Chess } from 'https://esm.sh/chess.js@1.4.0';

export const RACING_KINGS_FEN = '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1';

export function cloneGame(game) {
  return new Chess(game.fen());
}

export function moveGivesCheck(game, move) {
  try {
    const test = cloneGame(game);
    test.move({ from: move.from, to: move.to, promotion: move.promotion || undefined });
    return test.inCheck();
  } catch {
    return true;
  }
}

export function getLegalMoves(game, square = null) {
  const moves = game.moves({ verbose: true }).filter((move) => !moveGivesCheck(game, move));
  return square ? moves.filter((move) => move.from === square) : moves;
}

export function legalDestinationMap(game) {
  const map = new Map();
  for (const move of getLegalMoves(game)) {
    if (!map.has(move.from)) map.set(move.from, []);
    map.get(move.from).push(move.to);
  }
  return map;
}

export function tryMove(game, move) {
  const legal = getLegalMoves(game, move.from).find((candidate) =>
    candidate.to === move.to && (candidate.promotion || null) === (move.promotion || null),
  );
  if (!legal) return null;
  try {
    return game.move({ from: legal.from, to: legal.to, promotion: legal.promotion || undefined });
  } catch {
    return null;
  }
}

export function tryMoveSAN(game, san) {
  const wanted = String(san || '').trim();
  const candidate = getLegalMoves(game).find((move) => {
    try {
      const test = cloneGame(game);
      const result = test.move({ from: move.from, to: move.to, promotion: move.promotion || undefined });
      return result?.san === wanted;
    } catch {
      return false;
    }
  });
  if (!candidate) return null;
  return tryMove(game, candidate);
}

export function kingOnEighthRank(game, color) {
  const piece = game.board().flat().find((item) => item && item.type === 'k' && item.color === color);
  return Boolean(piece?.square?.endsWith('8'));
}

export function isRacingKingsWin(game) {
  return kingOnEighthRank(game, 'w') || kingOnEighthRank(game, 'b');
}

export function createRacingKingsGame(fen = RACING_KINGS_FEN) {
  return new Chess(fen || RACING_KINGS_FEN);
}
