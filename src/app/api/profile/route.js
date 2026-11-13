import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  const result = await db.execute({
    sql: "SELECT * FROM profiles WHERE user_email = ?",
    args: [session.user.email],
  });

  return Response.json({ profile: result.rows[0] || null });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { full_name, university, major, preferred_field, cv_url } = await request.json();
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  
  await db.execute({
    sql: `INSERT INTO profiles (user_email, full_name, university, major, preferred_field, cv_url) 
          VALUES (?, ?, ?, ?, ?, ?) 
          ON CONFLICT(user_email) DO UPDATE SET 
          full_name=excluded.full_name, university=excluded.university, 
          major=excluded.major, preferred_field=excluded.preferred_field, cv_url=excluded.cv_url`,
    args: [session.user.email, full_name, university, major, preferred_field, cv_url],
  });

  return Response.json({ success: true });
}