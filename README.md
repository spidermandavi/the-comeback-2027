# The Comeback 2027

A Racing Kings opening-training website built for a 2027 RK World Championship comeback.

## Core functions

1. **Study Converter** — fetch a public Lichess study PGN or paste an exported PGN, then convert it into the JSON format used by the trainer.
2. **Opening Trainer** — load opening JSON files from `openings/index.json`, train complete repertoire variations on a legal Racing Kings board, and track local training results.

## Reliability-first architecture

The move rules are provided by the pinned `chessops` 0.15.1 Racing Kings implementation rather than by filtering normal chess moves. This covers Racing Kings-specific legal move generation and the variant's special finishing/draw rule. The board UI remains `react-chessboard` 4.7.3 and receives only variant-legal destinations from the move engine.

Opening JSON is validated before training. The converter validates every chapter, branch and SAN move against Racing Kings rules before allowing an export. The trainer validates registered opening files again when loading them, so a malformed file cannot silently become an active training repertoire.

Training statistics are stored locally in the browser. Existing v3 statistics are read and migrated to the current storage format without intentionally discarding progress. Line statistics use a stable key based on the opening, chapter and move sequence rather than the generated display-line number, so reordering variations does not normally invalidate progress.

## How to add an opening

1. Open **Converter**.
2. Paste a public Lichess study URL, a specific chapter URL, or an exported PGN.
3. Validate and convert the PGN to JSON.
4. Put the downloaded JSON file in `openings/`.
5. Add the file and a display name to `openings/index.json`.
6. Refresh the Trainer.

The JSON format stores chapter metadata, starting FEN, comments, NAG annotations, and the complete branching move tree. The trainer exposes the resulting repertoire lines so alternative variations are not silently skipped.

## GitHub Pages

The project is plain HTML/CSS/JavaScript and can be published directly with GitHub Pages. No build step or Flask backend is required for the current version.

The trainer and converter use pinned browser modules from `esm.sh`; a network connection is required the first time those modules are loaded.
