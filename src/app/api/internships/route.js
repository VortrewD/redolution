import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/internships?country=Morocco&field=Data%20%2F%20AI&deadlineFrom=2026-12-01&deadlineTo=2027-03-01
// Returns the rows from the SQLite internships table.
// Filters use parameterised placeholders only — values are never
// interpolated into the SQL string.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "";
  const field = searchParams.get("field") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";

  const db = getDb();

  const where = [];
  const params = [];

  if (country) {
    where.push("country = ?");
    params.push(country);
  }
  if (field) {
    where.push("field = ?");
    params.push(field);
  }
  if (deadlineFrom) {
    where.push("deadline >= ?");
    params.push(deadlineFrom);
  }
  if (deadlineTo) {
    where.push("deadline <= ?");
    params.push(deadlineTo);
  }

  const sql =
    "SELECT id, title, company, country, field, deadline, docs, url FROM internships" +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY deadline ASC";

  const rows = db.prepare(sql).all(...params);

  const internships = rows.map((row) => {
    let docs = [];
    try {
      docs = JSON.parse(row.docs || "[]");
    } catch {
      docs = [];
    }
    return { ...row, docs };
  });

  return Response.json({ internships });
}
