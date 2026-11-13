import { createClient } from "@libsql/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Fetch only the 3 most recent internships
    const result = await db.execute({
      sql: "SELECT id, title, company, country, field FROM internships ORDER BY id DESC LIMIT 3",
      args: []
    });

    return Response.json({ internships: result.rows });
  } catch (error) {
    console.error("Public API error:", error);
    return Response.json({ error: "Failed to load featured jobs" }, { status: 500 });
  }
}