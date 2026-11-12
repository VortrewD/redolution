import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('data/redolution.db');
const rows = db.prepare('SELECT * FROM internships').all();

let sql = "";
for (const r of rows) {
  const t = r.title.replace(/'/g, "''");
  const c = r.company.replace(/'/g, "''");
  const co = r.country.replace(/'/g, "''");
  const f = r.field.replace(/'/g, "''");
  const d = r.docs.replace(/'/g, "''");
  const u = r.url.replace(/'/g, "''");
  
  sql += `INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url) VALUES ('${t}', '${c}', '${co}', '${f}', '${r.deadline}', '${d}', '${u}');\n`;
}

fs.writeFileSync('data-export.sql', sql);
console.log(`Successfully exported ${rows.length} rows to data-export.sql!`);