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
    sql: "SELECT * FROM applications WHERE user_email = ? ORDER BY id DESC",
    args: [session.user.email],
  });

  return Response.json({ applications: result.rows });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { job_title, company, status, date_applied } = await request.json();
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  
  await db.execute({
    sql: "INSERT INTO applications (user_email, job_title, company, status, date_applied) VALUES (?, ?, ?, ?, ?)",
    args: [session.user.email, job_title, company, status, date_applied],
  });

  return Response.json({ success: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  await db.execute({
    sql: "DELETE FROM applications WHERE id = ? AND user_email = ?",
    args: [id, session.user.email],
  });

  return Response.json({ success: true });
}