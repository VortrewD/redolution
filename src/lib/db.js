// REDOLUTION — SQLite helper (prototype skeleton)
// Uses Node's built-in node:sqlite (Node 22.5+ / 24), so no native
// better-sqlite3 build step is needed. No scraper, no real data pipeline.
// The DB file is created on first use at data/redolution.db and seeded
// with 10 sample entries only if the table is empty.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data", "redolution.db");

let db = null;

export function getDb() {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);

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
  `);

  const count = db.prepare("SELECT COUNT(*) AS c FROM internships").get();
  if (count.c === 0) {
    seed(db);
  }

  return db;
}

function seed(db) {
  // docs is stored as a JSON string in the DB, per the spec.
  const samples = [
    {
      title: "Software Engineering Intern",
      company: "Atlas Tech",
      country: "Morocco",
      field: "Software Engineering",
      deadline: "2026-12-15",
      docs: ["CV", "Cover Letter", "Transcript"],
      url: "https://example.com/internships/atlas-tech-software",
    },
    {
      title: "Data Science Intern",
      company: "Casablanca Data Lab",
      country: "Morocco",
      field: "Data / AI",
      deadline: "2027-01-20",
      docs: ["CV", "Cover Letter", "GitHub Portfolio"],
      url: "https://example.com/internships/casablanca-data-lab",
    },
    {
      title: "Frontend Developer Intern",
      company: "Marrakech Digital Studio",
      country: "Morocco",
      field: "Web Development",
      deadline: "2026-12-01",
      docs: ["CV", "Portfolio"],
      url: "https://example.com/internships/marrakech-digital-frontend",
    },
    {
      title: "Machine Learning Intern",
      company: "Nova AI",
      country: "France",
      field: "Data / AI",
      deadline: "2027-02-10",
      docs: ["CV", "Cover Letter", "Transcript", "GitHub Portfolio"],
      url: "https://example.com/internships/nova-ai-ml",
    },
    {
      title: "Backend Developer Intern",
      company: "RheinSoft",
      country: "Germany",
      field: "Software Engineering",
      deadline: "2027-01-15",
      docs: ["CV", "Cover Letter"],
      url: "https://example.com/internships/rheinsoft-backend",
    },
    {
      title: "Cybersecurity Intern",
      company: "Baltic Secure",
      country: "Lithuania",
      field: "Cybersecurity",
      deadline: "2027-03-01",
      docs: ["CV", "Cover Letter", "Transcript"],
      url: "https://example.com/internships/baltic-secure",
    },
    {
      title: "Mobile App Developer Intern",
      company: "Northwind Apps",
      country: "Netherlands",
      field: "Mobile Development",
      deadline: "2027-02-28",
      docs: ["CV", "Portfolio"],
      url: "https://example.com/internships/northwind-mobile",
    },
    {
      title: "DevOps Intern",
      company: "CloudBridge",
      country: "Spain",
      field: "DevOps",
      deadline: "2026-12-20",
      docs: ["CV", "Cover Letter"],
      url: "https://example.com/internships/cloudbridge-devops",
    },
    {
      title: "Full-Stack Developer Intern",
      company: "Maple Leaf Labs",
      country: "Canada",
      field: "Web Development",
      deadline: "2027-04-15",
      docs: ["CV", "Cover Letter", "GitHub Portfolio"],
      url: "https://example.com/internships/maple-leaf-fullstack",
    },
    {
      title: "AI Research Intern",
      company: "Desert Rose AI",
      country: "United Arab Emirates",
      field: "Data / AI",
      deadline: "2027-05-01",
      docs: ["CV", "Cover Letter", "Transcript", "Recommendation Letter"],
      url: "https://example.com/internships/desert-rose-ai",
    },
  ];

  const insert = db.prepare(
    `INSERT INTO internships (title, company, country, field, deadline, docs, url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  for (const s of samples) {
    insert.run(
      s.title,
      s.company,
      s.country,
      s.field,
      s.deadline,
      JSON.stringify(s.docs),
      s.url
    );
  }
}
