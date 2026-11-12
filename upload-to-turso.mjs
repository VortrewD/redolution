import { createClient } from '@libsql/client';
import { DatabaseSync } from 'node:sqlite';

const localDb = new DatabaseSync('data/redolution.db');
const rows = localDb.prepare('SELECT * FROM internships').all();

const turso = createClient({ 
  url: 'libsql://redolution-vortrewd.aws-eu-central-1.turso.io', 
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MjY2NDQ4MjIsImlhdCI6MTc5NDUwNDAyMiwiaWQiOiIwMWExZDBhMy1hMjAxLTc3N2UtODMwNC1iY2Q2ODkxNTkxNmMiLCJraWQiOiJYdWtrTUZYcHlSTVZRdGc4ZkliQmsyei1STGoydUktQ211aWhOaENJME8wIiwicmlkIjoiYTViYzUzZGYtMTE0MC00ZjVmLTk1ZjMtMzg4YjQ0MzM4NjM2In0.C1gblkWJTjrKQcfLq47hcC_8_vZB22Yy_rrT65atr0sMEbdHScMRwBUxUVyP2cU5zH2ImfZ4pv4g4w9bliUbDg' 
});

async function upload() {
  console.log('Creating table in Turso...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      country TEXT NOT NULL,
      field TEXT NOT NULL,
      deadline TEXT NOT NULL,
      docs TEXT NOT NULL,
      url TEXT NOT NULL
    );
  `);
  
  await turso.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_internships_url ON internships(url);
  `);
  
  console.log('Table created. Uploading ' + rows.length + ' internships...');
  
  for (const r of rows) {
    await turso.execute({
      sql: 'INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [r.title, r.company, r.country, r.field, r.deadline, r.docs, r.url]
    });
  }
  
  console.log('Upload complete! Go refresh your Vercel app.');
}

upload();