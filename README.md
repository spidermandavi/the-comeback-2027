# The Comeback 2027

A Racing Kings opening-training website built for a 2027 RK World Championship comeback.

## Core functions

1. **Study Converter** — fetch a public Lichess study PGN or paste an exported PGN, then convert it into the JSON format used by the trainer.
2. **Opening Trainer** — validate opening JSON files with the Racing Kings rules engine, then train complete repertoire lines on a legal Racing Kings board.
3. **Phase 2 training engine** — build automatic queues for review, weak spots, new lines, or random repertoire; track line mastery from New to Mastered; and schedule repeat reviews locally in the browser.

## How to add an opening

1. Open **Converter**.
2. Paste a public Lichess study URL, or export the study PGN from Lichess and paste it manually.
3. Convert the PGN to JSON.
4. Put the downloaded JSON file in `openings/`.
5. Add the file and a display name to `openings/index.json`.
6. Refresh the Trainer.

The JSON format stores chapter metadata, starting FEN, comments, NAG annotations, and the complete branching move tree. The trainer validates every imported line against the Racing Kings rules engine before allowing it into training.

## Training data

Training statistics are stored locally in the browser. Phase 2 keeps global move statistics plus per-line attempts, mistakes, mastery level, streak, review count, last completion, and the next scheduled review date. Existing v3/v4 local statistics are migrated automatically. No account or server database is required.

The default review schedule uses mastery levels with intervals of today, 1 day, 3 days, 7 days, 14 days and 30 days. Completing a line without mistakes advances mastery; repeated mistakes can reduce mastery and bring the line back sooner.

## GitHub Pages

The project is plain HTML/CSS/JavaScript and can be published directly with GitHub Pages. No build step or Flask backend is required for the current version.

The trainer uses the pinned `chessops` 0.15.1 browser modules from `esm.sh` for Racing Kings legal move generation and validation. A network connection is therefore required when the trainer page first loads the chess library.
