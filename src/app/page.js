"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const FAVORITES_KEY = "redolution:favorites";

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export default function Home() {
  const { data: session } = useSession();
  
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
  const [authMessage, setAuthMessage] = useState("");

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

      const res = await fetch(`/api/internships?${params.toString()}`);
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
    fetch("/api/internships")
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

  async function handleGoogleSignIn() {
    if (session) {
      await signOut();
    } else {
      await signIn("google");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <img
            src="/redolution-logo.png"
            alt="REDOLUTION logo"
            width={344}
            height={192}
            className="h-20 w-auto rounded-xl"
          />
          <h1 className="mt-3 text-2xl font-black tracking-tight">
            Find internships in Morocco &amp; abroad
          </h1>
          <p className="mt-1 text-slate-600">
            Internship aggregation dashboard
          </p>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
        >
          {session ? `Sign out (${session.user.name})` : "Sign in with Google"}
        </button>
      </header>

      {/* Filter bar */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Country
            </span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Field
            </span>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">All fields</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Deadline from
            </span>
            <input
              type="date"
              value={deadlineFrom}
              onChange={(e) => setDeadlineFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Deadline to
            </span>
            <input
              type="date"
              value={deadlineTo}
              onChange={(e) => setDeadlineTo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Clear filters
            </button>
          </div>
        </div>

        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
          />
          Show favourites only ({favorites.size})
        </label>
      </section>

      {/* Results */}
      <section className="mt-6">
        <p className="text-sm text-slate-600">
          {loading
            ? "Loading…"
            : `${visible.length} internship${visible.length === 1 ? "" : "s"}`}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!loading && visible.length === 0 ? (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-slate-600">
            No internships match these filters. Try clearing them.
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visible.map((job) => {
            const isFav = favorites.has(job.id);
            const isFakeLink = job.url.includes("example.com");
            
            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{job.title}</h2>
                    <p className="text-slate-600">
                      {job.company} · {job.country}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(job.id)}
                    aria-label={
                      isFav
                        ? `Remove ${job.title} from favourites`
                        : `Save ${job.title} to favourites`
                    }
                    aria-pressed={isFav}
                    className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${
                      isFav
                        ? "border-amber-300 bg-amber-100 text-amber-800"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isFav ? "★ Favourite" : "☆ Favourite"}
                  </button>
                </div>

                <p className="mt-3 text-sm">
                  <span className="font-semibold">Field:</span> {job.field}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Deadline:</span>{" "}
                  {job.deadline}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(job.docs || []).map((doc) => (
                    <span
                      key={doc}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {doc}
                    </span>
                  ))}
                </div>

                <a
                  href={
                    isFakeLink
                      ? `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company)}`
                      : job.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
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