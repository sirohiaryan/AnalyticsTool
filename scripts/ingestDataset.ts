import fs from 'node:fs';
import path from 'node:path';

const selected = new Set(['Breaking Bad', 'Stranger Things', 'Dark', 'Money Heist', 'Black Mirror']);

type RawRow = {
  series_title: string;
  season_number: string;
  episode_number: string;
  episode_title: string;
  runtime_minutes: string;
  imdb_rating: string;
  release_year: string;
  genre: string;
};

const input = path.join(process.cwd(), 'data', 'series_episodes.csv');
const output = path.join(process.cwd(), 'data', 'ingested_series.json');

const csv = fs.readFileSync(input, 'utf8').trim().split('\n');
const headers = csv[0].split(',');
const rows: RawRow[] = csv.slice(1).map((line) => {
  const vals = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ''])) as RawRow;
});

const filtered = rows.filter((row) => selected.has(row.series_title)).map((row, idx) => ({
  id: idx + 1,
  series_title: row.series_title,
  season_number: Number(row.season_number),
  episode_number: Number(row.episode_number),
  episode_title: row.episode_title,
  runtime_minutes: Number(row.runtime_minutes),
  imdb_rating: Number(row.imdb_rating),
  release_year: Number(row.release_year),
  genre: row.genre,
}));

fs.writeFileSync(output, JSON.stringify(filtered, null, 2));
console.log(`Ingested ${filtered.length} rows to ${output}`);
