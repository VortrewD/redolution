import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/redolution.db");
const result = db.prepare("DELETE FROM internships WHERE url LIKE '%example.com%'").run();
console.log(`Successfully deleted ${result.changes} fake sample internships!`);
db.close();