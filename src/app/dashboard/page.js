"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [statusValue, setStatusValue] = useState("Applied");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchApplications = async () => {
    if (!session) return;
    const res = await fetch("/api/applications", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchApplications();
  }, [session]);

  const handleAddApplication = async (e) => {
    e.preventDefault();
    const newApp = {
      job_title: jobTitle,
      company: company,
      status: statusValue,
      date_applied: new Date().toISOString().split("T")[0],
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newApp),
    });

    if (res.ok) {
      setJobTitle("");
      setCompany("");
      setStatusValue("Applied");
      fetchApplications();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
    fetchApplications();
  };

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/internships" className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition">
            Internships
          </Link>
          <Link href="/dashboard" className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:text-red-600 transition">
            Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-500 hover:text-red-600 transition ml-2">
            Sign out
          </button>
        </div>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Your Application Dashboard</h1>
        <p className="mt-2 text-slate-600">Track your internship applications, interviews, and offers.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Application Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Log a New Application</h2>
            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input required type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="Software Engineer Intern" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input required type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" placeholder="Stripe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button type="submit" className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition">
                Save Application
              </button>
            </form>
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Your Activity ({applications.length})</h2>
            </div>
            
            {loading ? (
              <p className="p-6 text-slate-500">Loading...</p>
            ) : applications.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">No applications logged yet. Add one to get started!</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <li key={app.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <h3 className="font-bold text-slate-900">{app.job_title}</h3>
                      <p className="text-sm text-slate-600">{app.company} · Applied on {app.date_applied}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        app.status === 'Offer' ? 'bg-green-50 text-green-700 border-green-200' :
                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        app.status === 'Interviewing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {app.status}
                      </span>
                      <button onClick={() => handleDelete(app.id)} className="text-slate-400 hover:text-red-600 transition" title="Delete">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}