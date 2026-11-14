"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Translator } from "@miracleufo/react-g-translator";

const FAVORITES_KEY = "redolution:favorites";

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")); } catch { return new Set(); }
}

export default function InternshipsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [lang, setLang] = useState("en");

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
  const [sort, setSort] = useState("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [favorites, setFavorites] = useState(() => new Set());

  useEffect(() => { 
    setFavorites(loadFavorites()); 
    const savedLang = localStorage.getItem("redolution_lang") || "en";
    setLang(savedLang);
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchInternships = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (country) params.set("country", country);
      if (field) params.set("field", field);
      if (deadlineFrom) params.set("deadlineFrom", deadlineFrom);
      if (deadlineTo) params.set("deadlineTo", deadlineTo);
      if (sort) params.set("sort", sort);
      params.set("page", currentPage.toString());
      params.set("limit", limit.toString());

      const res = await fetch(`/api/internships?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      
      setInternships(data.internships || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (e) { setError("Could not load internships."); } finally { setLoading(false); }
  }, [search, country, field, deadlineFrom, deadlineTo, sort, currentPage, limit]);

  useEffect(() => { fetch("/api/internships?limit=1000").then(r=>r.json()).then(d=>setAllForOptions(d.internships || [])).catch(()=>{}); }, []);
  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const countries = useMemo(() => [...new Set(allForOptions.map((i) => i.country))].sort(), [allForOptions]);
  const fields = useMemo(() => [...new Set(allForOptions.map((i) => i.field))].sort(), [allForOptions]);
  const visible = useMemo(() => favoritesOnly ? internships.filter(i => favorites.has(i.id)) : internships, [internships, favoritesOnly, favorites]);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function clearFilters() {
    setSearch(""); setCountry(""); setField(""); setDeadlineFrom(""); setDeadlineTo(""); setSort("newest"); setFavoritesOnly(false); setCurrentPage(1);
  }

  useEffect(() => { setCurrentPage(1); }, [search, country, field, deadlineFrom, deadlineTo, sort]);

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("redolution_lang", newLang);
  };

  if (status === "loading" || !session) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  return (
    <Translator from="en" to={lang}>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 relative w-full bg-slate-50">
        <AnimatePresence>
          {toastMessage && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white px-6 py-4 shadow-2xl">
              <span className="font-medium text-sm">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8 relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-red-600">Home</Link>
            <Link href="/internships" className="text-sm font-semibold text-red-600">Internships</Link>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-red-600">Dashboard</Link>
            <Link href="/profile" className="text-sm font-semibold text-slate-600 hover:text-red-600">Profile</Link>
          </div>

          <div className="flex items-center gap-3">
            <select value={lang} onChange={(e) => changeLanguage(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-sm outline-none cursor-pointer">
              <option value="en">🇬🇧</option><option value="fr">🇫🇷</option><option value="ar">🇲🇦</option>
            </select>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-500 hover:text-red-600 ml-2">Sign out</button>
          </div>
        </header>

        <div className="mb-8 relative z-10">
          <h1 className="text-3xl font-black">Internships</h1>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative z-10">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-xl border border-slate-300 pl-4 pr-4 py-3 text-sm focus:border-red-500 outline-none mb-4" />
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"><option value="">All countries</option>{countries.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select value={field} onChange={(e) => setField(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"><option value="">All fields</option>{fields.map((f) => <option key={f} value={f}>{f}</option>)}</select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none"><option value="newest">Newest</option><option value="deadline">Deadline</option></select>
            <input type="date" value={deadlineFrom} onChange={(e) => setDeadlineFrom(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
            <input type="date" value={deadlineTo} onChange={(e) => setDeadlineTo(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none" />
            <button onClick={clearFilters} className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-bold hover:bg-slate-700">Clear</button>
          </div>
        </section>

        <section className="mt-8 relative z-10">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((job) => {
              const isFav = favorites.has(job.id);
              return (
                <article key={job.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{job.company}</p>
                    <div className="mt-4 flex gap-2 text-xs font-medium">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">📍 {job.country}</span>
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">💼 {job.field}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => toggleFavorite(job.id)} className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold ${isFav ? "bg-red-50 border-red-200 text-red-600" : "bg-transparent border-slate-200 text-slate-700"}`}>{isFav ? "★ Saved" : "☆ Save"}</button>
                    <a href={job.url} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-red-600 px-2 py-2 text-center text-xs font-bold text-white hover:bg-red-700">View / Apply</a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </Translator>
  );
}