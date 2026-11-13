"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const FAVORITES_KEY = "redolution:favorites";

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export default function InternshipsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(12);

  const [internships, setInternships] = useState([]);
  const [allForOptions, setAllForOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [toastMessage, setToastMessage] = useState("");

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [favorites, setFavorites] = useState(() => new Set());

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (country) params.set("country", country);
      if (field) params.set("field", field);
      if (deadlineFrom) params.set("deadlineFrom", deadlineFrom);
      if (deadlineTo) params.set("deadlineTo", deadlineTo);
      
      params.set("page", currentPage.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/internships?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      
      setInternships(data.internships || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (e) {
      setError("Could not load internships. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }, [search, country, field, deadlineFrom, deadlineTo, currentPage, limit]);

  useEffect(() => {
    fetch("/api/internships?limit=1000", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAllForOptions(d.internships || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const countries = useMemo(
    () => [...new Set(allForOptions.map((i) => i.country))].sort(),
    [allForOptions]
  );
  const fields = useMemo(
    () => [...new Set(allForOptions.map((i) => i.field))].sort(),
    [allForOptions]
  );

  const visible = useMemo(() => {
    if (!favoritesOnly) return internships;
    return internships.filter((i) => favorites.has(i.id));
  }, [internships, favoritesOnly, favorites]);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setCountry("");
    setField("");
    setDeadlineFrom("");
    setDeadlineTo("");
    setFavoritesOnly(false);
    setCurrentPage(1);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [search, country, field, deadlineFrom, deadlineTo]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 relative">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-medium text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8 relative">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">Home</Link>
          <a href="/#features" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">Features</a>
          <a href="/#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">How it works</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/internships" className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition ml-2">
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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Explore Internships
        </h1>
        <p className="mt-2 text-slate-600">
          Find your next opportunity in Morocco & abroad.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* NEW SEARCH BAR */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company (e.g., React, Stripe, Marketing)..." 
              className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
              <option value="">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Field</span>
            <select value={field} onChange={(e) => setField(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
              <option value="">All fields</option>
              {fields.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deadline from</span>
            <input type="date" value={deadlineFrom} onChange={(e) => setDeadlineFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deadline to</span>
            <input type="date" value={deadlineTo} onChange={(e) => setDeadlineTo(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
          </label>
          <div className="flex items-end gap-2">
            <button onClick={clearFilters} className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700 transition">
              Clear
            </button>
          </div>
        </div>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
          Show favourites only ({favorites.size})
        </label>
      </section>

      <section className="mt-8">
        <p className="text-sm font-medium text-slate-500 mb-4">
          {loading ? "Loading..." : `Showing ${visible.length} of ${totalCount} internships`}
        </p>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        {!loading && visible.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No internships match these filters.
          </p>
        )}

        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((job) => {
              const isFav = favorites.has(job.id);
              const isFakeLink = job.url.includes("example.com");
              
              return (
                <motion.article 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  key={job.id} 
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{job.title}</h2>
                        <p className="text-sm font-medium text-slate-600 mt-1">{job.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            const res = await fetch("/api/applications", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                job_title: job.title,
                                company: job.company,
                                status: "Applied",
                                date_applied: new Date().toISOString().split("T")[0]
                              }),
                            });
                            if (res.ok) showToast("Application tracked in your Dashboard!");
                          }} 
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-500 hover:text-red-600 hover:border-red-200 transition"
                          title="Track Application"
                        >
                          + Track
                        </button>
                        <button onClick={() => toggleFavorite(job.id)} className={`shrink-0 rounded-full border px-2 py-1 text-xs font-bold transition ${isFav ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"}`}>
                          {isFav ? "★ Saved" : "☆ Save"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">📍 {job.country}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">💼 {job.field}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-800">Deadline:</span> {job.deadline}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(job.docs || []).map((doc) => (
                        <span key={doc} className="rounded bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 border border-slate-100">{doc}</span>
                      ))}
                    </div>
                  </div>
                  <a 
                    href={isFakeLink ? `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company)}` : job.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={async () => {
                      await fetch("/api/applications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          job_title: job.title,
                          company: job.company,
                          status: "Applied",
                          date_applied: new Date().toISOString().split("T")[0]
                        }),
                      });
                    }}
                    className="mt-5 block w-full rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700 transition"
                  >
                    {isFakeLink ? "Search on Google ↗" : "View / Apply →"}
                  </a>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {totalPages > 1 && !favoritesOnly && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`h-10 w-10 rounded-lg text-sm font-bold transition ${currentPage === pageNum ? "bg-red-600 text-white shadow-md" : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"}`}>
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-slate-400">...</span>
                  <button onClick={() => setCurrentPage(totalPages)} className="h-10 w-10 rounded-lg text-sm font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition">
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}