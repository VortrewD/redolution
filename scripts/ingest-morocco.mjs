import { scrapeJobs } from 'ts-jobspy';
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "redolution.db");
const db = new DatabaseSync(DB_PATH);

db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_internships_url ON internships(url);`);

const insert = db.prepare(`
  INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

console.log("Fetching Morocco internships from Indeed...");

const searchTerms = ["stage", "internship"];

for (const term of searchTerms) {
  console.log(`Searching for "${term}"...`);
  try {
    const result = await scrapeJobs({
      sites: ['indeed'],
      searchTerm: term,
      location: 'Morocco',
      country: 'morocco',
      resultsWanted: 15,
      siteConcurrency: 1,
    });

    // The new version returns an object! Check for .jobs and .meta
    if (!result || typeof result !== 'object') {
      console.error(`  ❌ Unexpected return type:`, typeof result);
      continue;
    }

    // Print the meta information to see what Indeed actually returned
    console.log(`  📊 Meta info:`, JSON.stringify(result.meta, null, 2));

    // Check if there are jobs
    if (result.jobs && Array.isArray(result.jobs)) {
      console.log(`  ✅ Found ${result.jobs.length} jobs for "${term}"`);
      
      for (const j of result.jobs) {
        const title = String(j.title || "").slice(0, 200);
        const company = String(j.company || "Unknown").slice(0, 200);
        const country = "Morocco";
        const field = "Internship";
        const deadline = "2099-12-31"; 
        const docs = JSON.stringify(["CV", "Cover Letter"]);
        const url = j.jobUrl || j.jobUrlDirect || "";

        if (!url) continue;

        const r = insert.run(title, company, country, field, deadline, docs, url);
        if (r.changes > 0) console.log(`  + ${title} @ ${company}`);
      }
    } else {
      console.log(`  ⚠️ No jobs array found. Full result keys:`, Object.keys(result));
    }
  } catch (e) {
    console.error(`  ❌ Error searching "${term}":`, e.message);
  }
}

console.log("Done.");
db.close();