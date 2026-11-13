"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  // Route Protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const [internships, setInternships] = useState([]);
  const [allForOptions, setAllForOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [favorites, setFavorites] = useState(() => new Set());

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (country) params.set("country", country);
      if (field) params.set("field", field);
      if (deadlineFrom) params.set("deadlineFrom", deadlineFrom);
      if (deadlineTo) params.set("deadlineTo", deadlineTo);

      const res = await fetch(`/api/internships?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      setInternships(data.internships || []);
    } catch (e) {
      setError("Could not load internships. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  }, [country, field, deadlineFrom, deadlineTo]);

  useEffect(() => {
    fetch("/api/internships", { cache: "no-store" })
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
    setCountry("");
    setField("");
    setDeadlineFrom("");
    setDeadlineTo("");
    setFavoritesOnly(false);
  }

  if (status === "loading" || !session) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/internships" className="text-sm font-bold text-red-600">
            Internships
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-red-600">
            Dashboard
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-600 hover:text-red-600">
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
          {loading ? "Loading..." : `Showing ${visible.length} internship${visible.length === 1 ? "" : "s"}`}
        </p>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

        {!loading && visible.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            No internships match these filters.
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((job) => {
            const isFav = favorites.has(job.id);
            const isFakeLink = job.url.includes("example.com");
            
            return (
              <article key={job.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">{job.title}</h2>
                      <p className="text-sm font-medium text-slate-600 mt-1">{job.company}</p>
                    </div>
                    <button onClick={() => toggleFavorite(job.id)} className={`shrink-0 rounded-full border px-2 py-1 text-xs font-bold transition ${isFav ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"}`}>
                      {isFav ? "★ Saved" : "☆ Save"}
                    </button>
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
                <a href={isFakeLink ? `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company)}` : job.url} target="_blank" rel="noreferrer" className="mt-5 block w-full rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700 transition">
                  {isFakeLink ? "Search on Google ↗" : "View / Apply →"}
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}