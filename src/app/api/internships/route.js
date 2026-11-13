import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "";
    const field = searchParams.get("field") || "";
    const deadlineFrom = searchParams.get("deadlineFrom") || "";
    const deadlineTo = searchParams.get("deadlineTo") || "";
    
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const where = [];
    const args = [];

    if (country) { where.push("country = ?"); args.push(country); }
    if (field) { where.push("field = ?"); args.push(field); }
    if (deadlineFrom) { where.push("deadline >= ?"); args.push(deadlineFrom); }
    if (deadlineTo) { where.push("deadline <= ?"); args.push(deadlineTo); }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

    // Get total count for pagination
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM internships${whereClause}`,
      args: args
    });
    
    // CRITICAL FIX: Convert BigInt to standard Number so JSON can parse it
    const totalCount = Number(countResult.rows[0].count);

    // Get the paginated data
    const sql = `SELECT id, title, company, country, field, deadline, docs, url 
                 FROM internships${whereClause} 
                 ORDER BY id DESC 
                 LIMIT ? OFFSET ?`;
    
    const result = await db.execute({
      sql: sql,
      args: [...args, limit, offset]
    });

    const internships = result.rows.map((row) => {
      let docs = [];
      try {
        docs = JSON.parse(row.docs || "[]");
      } catch {
        docs = [];
      }
      return { ...row, docs };
    });

    return Response.json({ 
      internships, 
      totalCount, 
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page 
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}