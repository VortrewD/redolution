// scripts/ingest-greenhouse.mjs
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "redolution.db");
const db = new DatabaseSync(DB_PATH);

// Make sure our unique index is there for deduplication
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_internships_url ON internships(url);`);

// List of companies using Greenhouse (you can add more!)
const companies = ["stripe", "airbnb", "gitlab", "doordash", "robinhood", "datadog"];
const insert = db.prepare(`
  INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;

for (const slug of companies) {
  console.log(`Fetching ${slug}...`);
  // The public Greenhouse API endpoint
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) continue;
    const data = await res.json();
    if (!data.jobs) continue;

    // Filter for internships
    const internships = data.jobs.filter(j => /intern/i.test(j.title));

    for (const j of internships) {
      const title = j.title.slice(0, 200);
      const company = slug.charAt(0).toUpperCase() + slug.slice(1);
      const country = j.location?.name || "Remote";
      const field = "Tech";
      const deadline = "2099-12-31"; // Greenhouse doesn't provide deadlines
      const docs = JSON.stringify(["CV", "Cover Letter"]);
      
      const r = insert.run(title, company, country, field, deadline, docs, j.absolute_url);
      if (r.changes > 0) inserted++;
    }
  } catch (e) {
    console.error(`Error fetching ${slug}:`, e.message);
  }
}

console.log(`Inserted ${inserted} new tech internships from Greenhouse!`);
db.close();