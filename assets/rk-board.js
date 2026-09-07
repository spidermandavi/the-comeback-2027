import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { Chessboard } from 'https://esm.sh/react-chessboard@4.7.3?deps=react@18.3.1,react-dom@18.3.1';
import { getLegalMoves } from './racingKings.js';

const h = React.createElement;
const DOT = 'radial-gradient(circle, rgba(231,187,99,.96) 0 21%, transparent 22%)';
const CAPTURE = 'radial-gradient(circle, transparent 0 52%, rgba(231,187,99,.96) 54% 64%, transparent 66%)';

function BoardInner({ fen, game, interactive, orientation, highlightSquares = {}, onMove }) {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(560);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const update = () => {
      const value = wrapperRef.current?.getBoundingClientRect().width || 560;
      setWidth(Math.max(240, Math.min(720, Math.floor(value))));
    };
    update();
    const observer = new ResizeObserver(update);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => setSelected(null), [fen, interactive]);

  const legalMoves = useMemo(
    () => (interactive ? getLegalMoves(game) : []),
    [game, fen, interactive],
  );
  const byFrom = useMemo(() => {
    const map = new Map();
    for (const move of legalMoves) {
      if (!map.has(move.from)) map.set(move.from, []);
      map.get(move.from).push(move);
    }
    return map;
  }, [legalMoves]);

  const squareStyles = useMemo(() => {
    const styles = { ...highlightSquares };
    if (!selected) return styles;
    styles[selected] = { ...(styles[selected] || {}), backgroundColor: 'rgba(231,187,99,.30)' };
    for (const move of byFrom.get(selected) || []) {
      styles[move.to] = {
        ...(styles[move.to] || {}),
        background: move.captured ? CAPTURE : DOT,
      };
    }
    return styles;
  }, [selected, byFrom, highlightSquares]);

  const chooseSquare = (square) => {
    if (!interactive) return;
    if (selected) {
      const target = (byFrom.get(selected) || []).find((move) => move.to === square);
      if (target) {
        if (onMove(selected, square)) {
          setSelected(null);
          return;
        }
        return;
      }
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn() && byFrom.has(square)) setSelected(square);
    else setSelected(null);
  };

  const drop = (sourceSquare, targetSquare) => {
    if (!interactive) return false;
    const accepted = onMove(sourceSquare, targetSquare);
    if (accepted) setSelected(null);
    return accepted;
  };

  return h(
    'div',
    { ref: wrapperRef, className: 'rk-board-react-shell' },
    h(Chessboard, {
      id: 'Comeback2027RKBoard',
      position: fen,
      boardOrientation: orientation,
      boardWidth: width,
      arePremovesAllowed: false,
      customDarkSquareStyle: { backgroundColor: '#8b5a2b' },
      customLightSquareStyle: { backgroundColor: '#d2b48c' },
      customBoardStyle: { borderRadius: '6px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.25)' },
      customSquareStyles: squareStyles,
      showBoardNotation: true,
      isDraggablePiece: ({ piece }) => Boolean(interactive && piece?.[0] === game.turn()),
      onSquareClick: chooseSquare,
      onPieceDrop: drop,
      animationDuration: 180,
    }),
  );
}

export const RKChessboard = React.memo(BoardInner);
