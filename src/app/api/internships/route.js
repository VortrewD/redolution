import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    // 2. Connect to Database
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "";
    const field = searchParams.get("field") || "";
    const deadlineFrom = searchParams.get("deadlineFrom") || "";
    const deadlineTo = searchParams.get("deadlineTo") || "";

    const where = [];
    const args = [];

    if (country) { where.push("country = ?"); args.push(country); }
    if (field) { where.push("field = ?"); args.push(field); }
    if (deadlineFrom) { where.push("deadline >= ?"); args.push(deadlineFrom); }
    if (deadlineTo) { where.push("deadline <= ?"); args.push(deadlineTo); }

    const sql =
      "SELECT id, title, company, country, field, deadline, docs, url FROM internships" +
      (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
      " ORDER BY deadline ASC";

    const result = await db.execute({ sql, args });

    const internships = result.rows.map((row) => {
      let docs = [];
      try {
        docs = JSON.parse(row.docs || "[]");
      } catch {
        docs = [];
      }
      return { ...row, docs };
    });

    return Response.json({ internships });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}