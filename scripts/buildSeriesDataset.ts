import fs from 'node:fs';
import path from 'node:path';

const titles = ['Breaking Bad', 'Game of Thrones', 'Stranger Things', 'Black Mirror', 'Money Heist'];

const series = titles.map((title, idx) => ({
  id: idx + 1,
  title,
  platform: 'Netflix',
  start_year: [2008, 2011, 2016, 2011, 2017][idx],
  end_year: [2013, 2019, 2025, 2024, 2021][idx],
  genre: ['Crime, Drama', 'Fantasy, Drama', 'Sci-Fi, Horror', 'Sci-Fi, Anthology', 'Crime, Thriller'][idx],
  total_seasons: [5, 8, 5, 6, 5][idx],
}));

const episodes = series.flatMap((s) =>
  Array.from({ length: 12 }).map((_, i) => ({
    id: s.id * 100 + i + 1,
    series_id: s.id,
    season_number: Math.floor(i / 4) + 1,
    episode_number: (i % 4) + 1,
    title: `${s.title} Episode ${i + 1}`,
    runtime_minutes: 45 + (i % 3) * 8,
  })),
);

fs.writeFileSync(path.join(process.cwd(), 'data', 'series.json'), JSON.stringify(series, null, 2));
fs.writeFileSync(path.join(process.cwd(), 'data', 'episodes.json'), JSON.stringify(episodes, null, 2));
console.log('Built /data/series.json and /data/episodes.json');
console.log('IMDB source tables expected: title.basics.tsv, title.episode.tsv, title.ratings.tsv');
