"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

const FAVORITES_KEY = "redolution:favorites";

export default function Favorites() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useApp();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      const favIds = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (favIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all internships and filter by IDs
      fetch("/api/internships?limit=3000", { cache: "no-store" })
        .then(r => r.json())
        .then(d => {
          const allJobs = d.internships || [];
          const favJobs = allJobs.filter(job => favIds.includes(job.id));
          setFavorites(favJobs);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || !session || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 relative z-10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 transition">{t("home")}</Link>
          <Link href="/internships" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 transition">{t("internships")}</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 transition">{t("dashboard")}</Link>
          <Link href="/favorites" className="text-sm font-semibold text-red-600 transition">{t("favorites")}</Link>
          <Link href="/profile" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 transition">{t("profile")}</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition ml-2">
            {t("profile")}
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-500 hover:text-red-600 transition ml-2">
            {t("signOut")}
          </button>
        </div>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">{t("yourFavorites")}</h1>
      </div>

      {favorites.length === 0 ? (
        <p className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-8 text-center text-slate-500">
          {t("noFavorites")}
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((job) => (
            <article key={job.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div>
                <h2 className="text-lg font-bold leading-tight">{job.title}</h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{job.company}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1">📍 {job.country}</span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1">💼 {job.field}</span>
                </div>
              </div>
              <a href={job.url} target="_blank" rel="noreferrer" className="mt-5 block w-full rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700 transition">
                {t("apply")}
              </a>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}