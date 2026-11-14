import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // SECURITY: Only allow your email to access this
    if (!session || session.user.email !== "vortexmontassir@gmail.com") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Fetch stats
    const usersCount = await db.execute("SELECT COUNT(*) as count FROM profiles");
    const internshipsCount = await db.execute("SELECT COUNT(*) as count FROM internships");
    const applicationsCount = await db.execute("SELECT COUNT(*) as count FROM applications");
    const subscribersCount = await db.execute("SELECT COUNT(*) as count FROM subscribers");

    // Fetch recent users
    const recentUsers = await db.execute("SELECT * FROM profiles ORDER BY rowid DESC LIMIT 5");
    
    // Fetch recent applications
    const recentApps = await db.execute("SELECT * FROM applications ORDER BY id DESC LIMIT 5");

    return Response.json({
      stats: {
        users: Number(usersCount.rows[0].count),
        internships: Number(internshipsCount.rows[0].count),
        applications: Number(applicationsCount.rows[0].count),
        subscribers: Number(subscribersCount.rows[0].count),
      },
      recentUsers: recentUsers.rows,
      recentApps: recentApps.rows,
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}