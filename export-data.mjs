import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('data/redolution.db');
const rows = db.prepare('SELECT * FROM internships').all();

let sql = "";
for (const r of rows) {
  // Escape single quotes so SQL doesn't break
  const title = r.title.replace(/'/g, "''");
  const company = r.company.replace(/'/g, "''");
  const country = r.country.replace(/'/g, "''");
  const field = r.field.replace(/'/g, "''");
  const docs = r.docs.replace(/'/g, "''");
  const url = r.url.replace(/'/g, "''");

  sql += `INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url) VALUES ('${title}', '${company}', '${country}', '${field}', '${r.deadline}', '${docs}', '${url}');\n`;
}

fs.writeFileSync('data-export.sql', sql);
console.log(`Exported ${rows.length} internships to data-export.sql!`);