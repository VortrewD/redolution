"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function RedMatrix() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = "REDOLUTION01".split("");
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#dc2626";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 35);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-40 z-0" />;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newJob, setNewJob] = useState({
    title: "", company: "", country: "Morocco", field: "Tech", deadline: "", url: "", type: "internship"
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchAdminData = () => {
    fetch("/api/admin", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      if (session.user.email !== "vortexmontassir@gmail.com") {
        router.push("/");
        return;
      }
      fetchAdminData();
    }
  }, [status, session, router]);

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`/api/admin?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAdminData();
      else alert("Failed to delete job.");
    } catch (err) {
      alert("Error deleting job.");
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        alert("Added successfully!");
        setNewJob({ title: "", company: "", country: "Morocco", field: "Tech", deadline: "", url: "", type: "internship" });
        fetchAdminData();
      } else {
        alert("Failed to add.");
      }
    } catch (err) {
      alert("Error adding.");
    }
    setIsAdding(false);
  };

  if (status === "loading" || loading || !session) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-white bg-black">Checking Admin Access...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold bg-black">Access Denied: {error}</div>;
  }

  return (
    <main className="min-h-screen relative bg-black text-white overflow-hidden">
      <RedMatrix />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-red-900/50 pb-6 mb-8 bg-black/50 backdrop-blur-md p-4 rounded-xl">
          <Link href="/" className="flex items-center gap-3">
            <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-red-500 animate-pulse">● ADMIN MODE</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-300 hover:text-red-500 transition">Sign out</button>
          </div>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="mt-2 text-red-400">Overview of your platform's growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Total Users</p>
            <p className="text-4xl font-black text-white">{data?.stats?.users || 0}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Internships</p>
            <p className="text-4xl font-black text-white">{data?.stats?.internships || 0}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Applications Tracked</p>
            <p className="text-4xl font-black text-white">{data?.stats?.applications || 0}</p>
          </div>
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">Email Subscribers</p>
            <p className="text-4xl font-black text-white">{data?.stats?.subscribers || 0}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-900/50 bg-red-950/30">
              <h2 className="text-lg font-bold text-white">Recent Users</h2>
            </div>
            <ul className="divide-y divide-red-900/30">
              {data?.recentUsers?.map((user) => (
                <li key={user.user_email} className="p-4 flex items-center justify-between hover:bg-red-900/10 transition">
                  <div>
                    <p className="font-bold text-white">{user.full_name || "Anonymous"}</p>
                    <p className="text-xs text-red-400">{user.user_email}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-red-900/30 rounded text-red-300 border border-red-900/50">{user.university || "N/A"}</span>
                </li>
              ))}
              {(!data?.recentUsers || data.recentUsers.length === 0) && <li className="p-4 text-red-400 text-center">No users yet.</li>}
            </ul>
          </div>

          <div className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-900/50 bg-red-950/30">
              <h2 className="text-lg font-bold text-white">Recent Applications</h2>
            </div>
            <ul className="divide-y divide-red-900/30">
              {data?.recentApps?.map((app) => (
                <li key={app.id} className="p-4 flex items-center justify-between hover:bg-red-900/10 transition">
                  <div>
                    <p className="font-bold text-white">{app.job_title}</p>
                    <p className="text-xs text-red-400">{app.company} · {app.user_email}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-red-600 text-white rounded shadow-lg shadow-red-900/50">{app.status}</span>
                </li>
              ))}
              {(!data?.recentApps || data.recentApps.length === 0) && <li className="p-4 text-red-400 text-center">No applications yet.</li>}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-md shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-red-900/50 bg-red-950/30 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Unknown Users (No Profile)</h2>
            <span className="text-xs text-red-400">Signed in but haven't set a name</span>
          </div>
          <ul className="divide-y divide-red-900/30">
            {data?.unknownUsers?.map((user) => (
              <li key={user.user_email} className="p-4 flex items-center justify-between hover:bg-red-900/10 transition">
                <div>
                  <p className="font-bold text-red-400">Anonymous User</p>
                  <p className="text-xs text-slate-300">{user.user_email}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-red-900/30 rounded text-red-300 border border-red-900/50">Needs Name</span>
              </li>
            ))}
            {(!data?.unknownUsers || data.unknownUsers.length === 0) && <li className="p-4 text-red-400 text-center">All users have profiles. Nice!</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-md shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-red-900/50 bg-red-950/30">
            <h2 className="text-lg font-bold text-white">Add a New Opportunity</h2>
            <p className="text-xs text-red-400">Manually insert local jobs, scholarships, or solidarity offers</p>
          </div>
          <form onSubmit={handleAddJob} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Title" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
            <input required type="text" placeholder="Company/Organization" value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
            <select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none">
              <option value="internship">Internship</option>
              <option value="job">Job Offer</option>
              <option value="scholarship">Scholarship</option>
              <option value="solidarity">Solidarity / Volunteer</option>
            </select>
            <input type="text" placeholder="Country" value={newJob.country} onChange={(e) => setNewJob({...newJob, country: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
            <input type="text" placeholder="Field" value={newJob.field} onChange={(e) => setNewJob({...newJob, field: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
            <input type="date" placeholder="Deadline (Optional)" value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} className="w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none [color-scheme:dark]" />
            <input required type="url" placeholder="Application URL (https://...)" value={newJob.url} onChange={(e) => setNewJob({...newJob, url: e.target.value})} className="md:col-span-2 w-full rounded-lg border border-red-900/50 bg-black/50 px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={isAdding} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg shadow-red-900/50 transition disabled:opacity-50">
                {isAdding ? "Adding..." : "Add to Database"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-red-900/50 bg-black/60 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-900/50 bg-red-950/30 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Manage Newest Jobs</h2>
            <span className="text-xs text-red-400">Delete spam or fake listings</span>
          </div>
          <ul className="divide-y divide-red-900/30">
            {data?.recentInternships?.map((job) => (
              <li key={job.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-red-900/10 transition">
                <div>
                  <p className="font-bold text-white">{job.title}</p>
                  <p className="text-xs text-red-400">{job.company} · {job.country} · {job.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <a href={job.url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 underline hover:text-white">View Link</a>
                  <button onClick={() => handleDeleteJob(job.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-lg shadow-red-900/50 transition">Delete</button>
                </div>
              </li>
            ))}
            {(!data?.recentInternships || data.recentInternships.length === 0) && <li className="p-4 text-red-400 text-center">No internships found.</li>}
          </ul>
        </div>
      </div>
    </main>
  );
}