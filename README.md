# The Comeback 2027

A Racing Kings opening-training website built for a 2027 RK World Championship comeback.

## Core functions

1. **Study Converter** — fetch a public Lichess study PGN or paste an exported PGN, then convert it into the JSON format used by the trainer.
2. **Opening Trainer** — load opening JSON files from `openings/index.json`, train every complete variation/line on a legal Racing Kings board, and track local training results.

## How to add an opening

1. Open **Converter**.
2. Paste a public Lichess study URL, or export the study PGN from Lichess and paste it manually.
3. Convert the PGN to JSON.
4. Put the downloaded JSON file in `openings/`.
5. Add the file and a display name to `openings/index.json`.
6. Refresh the Trainer.

The JSON format stores chapter metadata, starting FEN, comments, NAG annotations, and the complete branching move tree. The trainer exposes the resulting repertoire lines so alternative variations are not silently skipped.

## Training data

Training statistics are stored locally in the browser. The current version keeps both session statistics and lifetime statistics, with separate totals for each opening/chapter/line. No account or server database is required.

## GitHub Pages

The project is plain HTML/CSS/JavaScript and can be published directly with GitHub Pages. No build step or Flask backend is required for the current version.

The trainer uses the pinned `chessops` 0.15.1 browser modules from `esm.sh` for Racing Kings legal move generation. A network connection is therefore required when the trainer page first loads the chess library.
