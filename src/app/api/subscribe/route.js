import { createClient } from "@libsql/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  
  await db.execute({
    sql: "INSERT OR IGNORE INTO subscribers (email, name, created_at) VALUES (?, ?, ?)",
    args: [session.user.email, session.user.name, new Date().toISOString()],
  });

  return Response.json({ success: true, message: "Subscribed to daily alerts!" });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  
  await db.execute({
    sql: "DELETE FROM subscribers WHERE email = ?",
    args: [session.user.email],
  });

  return Response.json({ success: true, message: "Unsubscribed." });
}