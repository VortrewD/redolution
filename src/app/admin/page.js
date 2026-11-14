"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      // Check if it's you
      if (session.user.email !== "vortexmontassir@gmail.com") {
        router.push("/");
        return;
      }
      
      fetch("/api/admin")
        .then(r => r.json())
        .then(d => {
          if (d.error) setError(d.error);
          else setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session, router]);

  if (status === "loading" || loading || !session) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Checking Admin Access...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Access Denied: {error}</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 relative bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-red-600">ADMIN MODE</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-500 hover:text-red-600">Sign out</button>
        </div>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Overview of your platform's growth.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Users</p>
          <p className="text-4xl font-black text-red-600">{data?.stats?.users || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Internships</p>
          <p className="text-4xl font-black text-slate-900">{data?.stats?.internships || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Applications Tracked</p>
          <p className="text-4xl font-black text-slate-900">{data?.stats?.applications || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Email Subscribers</p>
          <p className="text-4xl font-black text-slate-900">{data?.stats?.subscribers || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* RECENT USERS */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold">Recent Users</h2>
          </div>
          <ul className="divide-y divide-slate-200">
            {data?.recentUsers?.map((user) => (
              <li key={user.user_email} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{user.full_name || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">{user.user_email}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">{user.university || "N/A"}</span>
              </li>
            ))}
            {(!data?.recentUsers || data.recentUsers.length === 0) && (
              <li className="p-4 text-slate-500 text-center">No users yet.</li>
            )}
          </ul>
        </div>

        {/* RECENT APPLICATIONS */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold">Recent Applications</h2>
          </div>
          <ul className="divide-y divide-slate-200">
            {data?.recentApps?.map((app) => (
              <li key={app.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{app.job_title}</p>
                  <p className="text-xs text-slate-500">{app.company} · {app.user_email}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded">{app.status}</span>
              </li>
            ))}
            {(!data?.recentApps || data.recentApps.length === 0) && (
              <li className="p-4 text-slate-500 text-center">No applications yet.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}