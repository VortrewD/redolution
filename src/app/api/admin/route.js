import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "vortexmontassir@gmail.com") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const usersCount = await db.execute("SELECT COUNT(*) as count FROM profiles");
    const internshipsCount = await db.execute("SELECT COUNT(*) as count FROM internships");
    const applicationsCount = await db.execute("SELECT COUNT(*) as count FROM applications");
    const subscribersCount = await db.execute("SELECT COUNT(*) as count FROM subscribers");

    const recentUsers = await db.execute("SELECT * FROM profiles WHERE full_name IS NOT NULL AND full_name != '' ORDER BY rowid DESC LIMIT 5");
    const unknownUsers = await db.execute("SELECT * FROM profiles WHERE full_name IS NULL OR full_name = '' ORDER BY rowid DESC");
    const recentApps = await db.execute("SELECT * FROM applications ORDER BY id DESC LIMIT 5");
    const recentInternships = await db.execute("SELECT * FROM internships ORDER BY id DESC LIMIT 10");

    return Response.json({
      stats: {
        users: Number(usersCount.rows[0].count),
        internships: Number(internshipsCount.rows[0].count),
        applications: Number(applicationsCount.rows[0].count),
        subscribers: Number(subscribersCount.rows[0].count),
      },
      recentUsers: recentUsers.rows,
      recentApps: recentApps.rows,
      recentInternships: recentInternships.rows,
      unknownUsers: unknownUsers.rows,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "vortexmontassir@gmail.com") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    await db.execute({
      sql: "DELETE FROM internships WHERE id = ?",
      args: [id],
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== "vortexmontassir@gmail.com") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, country, field, deadline, docs, url, type } = body;

    if (!title || !company || !url) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const docsString = Array.isArray(docs) ? JSON.stringify(docs) : JSON.stringify(["CV", "Cover Letter"]);
    const finalDeadline = deadline || null;
    const finalType = type || "internship";

    await db.execute({
      sql: `INSERT INTO internships (title, company, country, field, deadline, docs, url, type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [title, company, country, field, finalDeadline, docsString, url, finalType],
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}