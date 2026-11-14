"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FloatingLetters from "../components/FloatingLetters";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    major: "",
    preferred_field: "Tech",
    cv_url: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/profile")
        .then(r => r.json())
        .then(d => {
          if (d.profile) setProfile(d.profile);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please upload a CV under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, cv_url: reader.result });
      setMessage("CV attached locally! Click Save to finish.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      setMessage("Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  };

  const handleSubscribe = async () => {
    const method = isSubscribed ? "DELETE" : "POST";
    const res = await fetch("/api/subscribe", { method });
    if (res.ok) {
      setIsSubscribed(!isSubscribed);
      setMessage(isSubscribed ? "Unsubscribed from daily emails." : "You are now subscribed to daily emails!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (status === "loading" || !session || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading...</div>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 relative bg-slate-50 text-slate-900 overflow-hidden">
      <FloatingLetters />
      
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8 relative z-10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/redolution-logo.png" alt="REDOLUTION" className="h-10 w-auto" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">Home</Link>
          <Link href="/internships" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">Internships</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-red-600 transition">Dashboard</Link>
          <Link href="/profile" className="text-sm font-semibold text-red-600 transition">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-slate-500 hover:text-red-600 transition ml-2">
            Sign out
          </button>
        </div>
      </header>

      <div className="mb-8 relative z-10">
        <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
        <p className="mt-2 text-slate-600">Set your preferences, upload your CV, and manage email alerts.</p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200 text-green-800 font-medium relative z-10">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md p-8 shadow-sm space-y-8 relative z-10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-lg font-bold">Daily Email Alerts</h3>
            <p className="text-sm text-slate-500 mt-1">Get a daily summary of the newest internships sent to your inbox.</p>
          </div>
          <button 
            type="button" 
            onClick={handleSubscribe} 
            className={`mt-4 sm:mt-0 px-5 py-2.5 text-sm font-bold rounded-lg transition ${
              isSubscribed 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
            }`}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input name="full_name" value={profile.full_name || ""} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
              <input name="university" value={profile.university || ""} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 outline-none" placeholder="Harvard University" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Major</label>
              <input name="major" value={profile.major || ""} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 outline-none" placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Field</label>
              <select name="preferred_field" value={profile.preferred_field || "Tech"} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 outline-none">
                <option value="Tech">Tech</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload CV (PDF, max 2MB)</label>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition" />
            {profile.cv_url && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ CV attached successfully.
              </p>
            )}
          </div>

          <button type="submit" disabled={saving} className="w-full sm:w-auto rounded-lg bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}