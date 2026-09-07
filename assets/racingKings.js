import { setupPosition } from 'https://esm.sh/chessops@0.15.1/variant';
import { makeFen, parseFen } from 'https://esm.sh/chessops@0.15.1/fen';
import { makeSan, parseSan } from 'https://esm.sh/chessops@0.15.1/san';
import { makeSquare, parseSquare } from 'https://esm.sh/chessops@0.15.1/util';

export const RACING_KINGS_FEN = '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1';

function positionFromFen(fen) {
  const setup = parseFen(String(fen || RACING_KINGS_FEN)).unwrap();
  return setupPosition('racingkings', setup).unwrap();
}

export class RacingKingsGame {
  constructor(position) {
    this.position = position || positionFromFen(RACING_KINGS_FEN);
  }

  fen() {
    return makeFen(this.position.toSetup());
  }

  clone() {
    return new RacingKingsGame(this.position.clone());
  }

  turn() {
    return this.position.turn === 'white' ? 'w' : 'b';
  }

  get(square) {
    const parsed = parseSquare(square);
    return parsed === undefined ? undefined : this.position.board.get(parsed);
  }

  move(move) {
    const from = typeof move.from === 'number' ? move.from : parseSquare(move.from);
    const to = typeof move.to === 'number' ? move.to : parseSquare(move.to);
    if (from === undefined || to === undefined) return null;

    const candidate = {
      from,
      to,
      ...(move.promotion ? { promotion: move.promotion } : {}),
    };
    if (!this.position.isLegal(candidate)) return null;

    const capturedPiece = this.position.board.get(to);
    const san = makeSan(this.position, candidate);
    this.position.play(candidate);
    return {
      from: makeSquare(from),
      to: makeSquare(to),
      san,
      captured: Boolean(capturedPiece),
      promotion: move.promotion || null,
    };
  }

  outcome() {
    return this.position.outcome();
  }

  isEnd() {
    return this.position.isEnd();
  }
}

export function cloneGame(game) {
  return game.clone();
}

export function createRacingKingsGame(fen = RACING_KINGS_FEN) {
  return new RacingKingsGame(positionFromFen(fen));
}

export function getLegalMoves(game, square = null) {
  const target = square == null ? null : parseSquare(square);
  if (square != null && target === undefined) return [];

  const moves = [];
  for (const [from, destinations] of game.position.allDests()) {
    if (target != null && from !== target) continue;
    for (const to of destinations) {
      const captured = game.position.board.get(to);
      const move = { from, to };
      const san = makeSan(game.position, move);
      moves.push({
        from: makeSquare(from),
        to: makeSquare(to),
        san,
        captured: Boolean(captured),
        promotion: null,
      });
    }
  }
  return moves;
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
  const legal = getLegalMoves(game, move.from).find(candidate =>
    candidate.to === move.to
    && (candidate.promotion || null) === (move.promotion || null)
  );
  if (!legal) return null;
  return game.move({ from: legal.from, to: legal.to, promotion: legal.promotion || undefined });
}

export function tryMoveSAN(game, san) {
  const wanted = String(san || '').trim();
  const move = parseSan(game.position, wanted);
  if (!move) return null;
  return game.move({
    from: makeSquare(move.from),
    to: makeSquare(move.to),
    promotion: move.promotion || undefined,
  });
}

export function isRacingKingsWin(game) {
  return Boolean(game.outcome());
}

function validateNodeList(position, nodes, path = []) {
  if (!Array.isArray(nodes)) {
    throw new Error(`Invalid move tree at ${path.join(' ') || 'root'}.`);
  }

  return nodes.map((node, index) => {
    if (!node || typeof node !== 'object' || typeof node.san !== 'string' || !node.san.trim()) {
      throw new Error(`Invalid move node at ${[...path, index + 1].join('.')}.`);
    }

    const move = parseSan(position, node.san.trim());
    if (!move) {
      throw new Error(`Illegal Racing Kings move "${node.san}" at ${[...path, node.san].join(' → ')}.`);
    }

    const canonicalSan = makeSan(position, move);
    const next = position.clone();
    next.play(move);
    const children = Array.isArray(node.children) ? node.children : [];

    if (next.isEnd() && children.length) {
      throw new Error(`Variation continues after the Racing Kings game ended at ${[...path, canonicalSan].join(' ')}.`);
    }

    return {
      ...node,
      san: canonicalSan,
      comments: Array.isArray(node.comments) ? [...node.comments] : [],
      nags: Array.isArray(node.nags) ? [...node.nags] : [],
      glyphs: Array.isArray(node.glyphs) ? [...node.glyphs] : [],
      children: validateNodeList(next, children, [...path, canonicalSan]),
    };
  });
}

export function validateRacingKingsOpening(data) {
  if (!data || typeof data !== 'object') throw new Error('Opening JSON is not an object.');
  if (data.schemaVersion !== 1) throw new Error('Unsupported opening schema version.');
  if (data.variant !== 'racingKings') throw new Error('Opening is not marked as Racing Kings.');
  if (!Array.isArray(data.chapters) || data.chapters.length === 0) {
    throw new Error('Opening contains no chapters.');
  }

  let lineCount = 0;
  const chapters = data.chapters.map((chapter, chapterIndex) => {
    if (!chapter || typeof chapter !== 'object') {
      throw new Error(`Chapter ${chapterIndex + 1} is invalid.`);
    }
    const startingFen = chapter.startingFen || chapter.tags?.FEN || RACING_KINGS_FEN;
    let game;
    try {
      game = createRacingKingsGame(startingFen);
    } catch (error) {
      throw new Error(`Chapter ${chapterIndex + 1} has an invalid Racing Kings starting FEN: ${error.message || error}`);
    }

    const moves = validateNodeList(game.position, chapter.moves, [`chapter ${chapterIndex + 1}`]);
    const countLeaves = nodes => {
      let count = 0;
      for (const node of nodes) {
        if (!node.children.length) count += 1;
        else count += countLeaves(node.children);
      }
      return count;
    };
    lineCount += countLeaves(moves);

    return {
      ...chapter,
      startingFen: game.fen(),
      moves,
    };
  });

  return {
    ...data,
    chapters,
    validation: {
      ...(data.validation || {}),
      validatedAt: new Date().toISOString(),
      completeLines: lineCount,
    },
  };
}
