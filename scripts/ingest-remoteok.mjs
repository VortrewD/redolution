// scripts/ingest-remoteok.mjs
// Run: node scripts/ingest-remoteok.mjs

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "redolution.db");
const db = new DatabaseSync(DB_PATH);

// Safety: ensure table + unique index exist
db.exec(`
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
  CREATE UNIQUE INDEX IF NOT EXISTS idx_internships_url ON internships(url);
`);

console.log("Fetching RemoteOK...");
const res = await fetch("https://remoteok.com/api", {
  headers: { "User-Agent": "redolution-ingest/0.1" },
});
if (!res.ok) {
  console.error(`Fetch failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const raw = await res.json();

const jobs = raw.filter((j) => j && j.id && j.position);
const internships = jobs.filter((j) => /intern/i.test(j.position || ""));

console.log(`Fetched ${jobs.length} jobs, ${internships.length} match "intern"`);

const insert = db.prepare(`
  INSERT OR IGNORE INTO internships
    (title, company, country, field, deadline, docs, url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
for (const j of internships) {
  const title = String(j.position || "").slice(0, 200);
  const company = String(j.company || "Unknown").slice(0, 200);
  const country = String(j.location || "Remote").slice(0, 100);
  const field = (Array.isArray(j.tags) && j.tags[0]) ? String(j.tags[0]).slice(0, 100) : "Tech";
  const deadline = j.date ? String(j.date).slice(0, 10) : "2099-12-31";
  const docs = JSON.stringify(["CV", "Cover Letter"]);
  const url = j.url || `https://remoteok.com/remote-jobs/${j.id}`;

  try {
    const r = insert.run(title, company, country, field, deadline, docs, url);
    if (r.changes > 0) inserted++;
  } catch (e) {
    console.error(`Insert failed for "${title}": ${e.message}`);
  }
}

console.log(`Inserted ${inserted} new internships`);
db.close();