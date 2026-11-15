import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const field = searchParams.get("field") || "";
    const deadlineFrom = searchParams.get("deadlineFrom") || "";
    const deadlineTo = searchParams.get("deadlineTo") || "";
    const sort = searchParams.get("sort") || "newest";
    const favoritesOnly = searchParams.get("favoritesOnly") === "true";
    const favoritesList = searchParams.get("favoritesList") || "";
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const where = [];
    const args = [];

    // 1. Deterministic Search Logic (matches title and company)
    if (search) {
      where.push("(title LIKE ? OR company LIKE ?)");
      args.push(`%${search}%`, `%${search}%`);
    }

    // 2. Filters
    if (country) { where.push("country = ?"); args.push(country); }
    if (field) { where.push("field = ?"); args.push(field); }
    
    // Handle null deadlines correctly
    if (deadlineFrom) { where.push("(deadline >= ? OR deadline IS NULL)"); args.push(deadlineFrom); }
    if (deadlineTo) { where.push("(deadline <= ? OR deadline IS NULL)"); args.push(deadlineTo); }

    // 3. Global Favourites Logic
    if (favoritesOnly && favoritesList) {
      const ids = favoritesList.split(',').map(Number).filter(id => !isNaN(id));
      if (ids.length > 0) {
        const placeholders = ids.map(() => "?").join(",");
        where.push(`id IN (${placeholders})`);
        args.push(...ids);
      } else {
        where.push("1 = 0"); // If empty, return nothing
      }
    }

    const whereClause = where.length ? ` WHERE ${where.join(" AND ")}` : "";

    // Get total count for pagination
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM internships${whereClause}`,
      args: args
    });
    
    const totalCount = Number(countResult.rows[0].count);

    // Get the data
    let orderBy = "id DESC";
    if (sort === "deadline") orderBy = "deadline IS NULL, deadline ASC"; // Real deadlines first
    if (sort === "company") orderBy = "company ASC";

    const sql = `SELECT id, title, company, country, field, deadline, docs, url 
                 FROM internships${whereClause} 
                 ORDER BY ${orderBy} 
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