# The Comeback 2027

A Racing Kings opening-training website built for a 2027 RK World Championship comeback.

## Two core functions

1. **Study Converter** — paste a Lichess Racing Kings study URL or PGN and convert it into the JSON format used by the trainer.
2. **Opening Trainer** — load opening JSON files from `openings/index.json`, replay the opening lines on a Racing Kings board, and track basic training results locally.

## How to add an opening

1. Open **Converter**.
2. Paste the Lichess study URL or PGN.
3. Export the generated JSON.
4. Put the JSON file in `openings/`.
5. Add the file and a display name to `openings/index.json`.
6. Refresh the Trainer.

The trainer uses `chessops`, which supports Racing Kings rules and legal move generation.

## GitHub Pages

The project is plain HTML/CSS/JavaScript and can be published directly with GitHub Pages. No build step is required.
