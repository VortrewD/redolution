"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/redolution-logo.png" alt="REDOLUTION" className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">How it works</a>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/internships" className="text-sm font-bold text-slate-900 hover:text-red-600 transition">
                Dashboard
              </Link>
            ) : (
              <button onClick={() => signIn("google")} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Log in
              </button>
            )}
            <Link href="/internships" className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 hover:shadow-lg transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
        
        {/* Abstract Red Glows */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[40rem] h-[40rem] bg-red-100 rounded-full blur-[100px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[30rem] h-[30rem] bg-red-50 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live in Morocco & Abroad</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
                Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Internship</span> faster.
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                Stop checking 10 different websites every day. REDOLUTION automatically aggregates the latest opportunities from Indeed, Greenhouse, and top tech companies into one clean dashboard.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/internships" className="rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  Explore Internships
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
                <a href="#how-it-works" className="rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center">
                  How it works
                </a>
              </div>
            </div>

            {/* Right Mockup (Floating Card) */}
            <div className="relative lg:ml-10 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-100 to-slate-100 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-sm"></div>
              <div className="relative bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Software Engineer, Intern</h3>
                    <p className="text-sm font-medium text-slate-500">Stripe · London</p>
                  </div>
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">New</span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">💻 Tech</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">🎓 Summer 2027</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-3/4 rounded-full"></div></div>
                  <p className="text-xs text-slate-400 font-medium">Deadline: 2 days left</p>
                </div>
                <button className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition">View / Apply</button>
              </div>

              {/* Decorative floating badges */}
              <div className="absolute -right-6 top-10 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-black">✓</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Auto-Updated</p>
                  <p className="text-[10px] text-slate-500">Every 24 hours</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- LOGO CLOUD --- */}
      <section className="border-y border-slate-200/60 bg-white/50 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Aggregating internships from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-black text-slate-800">Stripe</span>
            <span className="text-xl font-black text-slate-800">Airbnb</span>
            <span className="text-xl font-black text-slate-800">Indeed</span>
            <span className="text-xl font-black text-slate-800">Datadog</span>
            <span className="text-xl font-black text-slate-800">Maersk</span>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Your unfair advantage in the internship hunt.</h2>
            <p className="mt-4 text-lg text-slate-600">We built the tool we wish we had when we were applying.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-red-100 via-red-300 to-red-100 z-0"></div>
            
            {[
              { step: "1", title: "We Aggregate", desc: "Our bots scan Indeed, Greenhouse, and top companies 24/7 to find new internships.", icon: "🤖" },
              { step: "2", title: "You Filter", desc: "Use our smart filters to find exactly what you want by country, field, and deadline.", icon: "🎯" },
              { step: "3", title: "Apply Anywhere", desc: "Save your favorites and click Apply to go straight to the official application page.", icon: "🚀" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center text-4xl mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BENTO FEATURES --- */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-200/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Everything you need to get hired.</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">⚡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Auto-Aggregated Data</h3>
              <p className="text-slate-600">Stop manually checking company websites. Our pipeline fetches new internships from multiple sources and puts them in one place.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-sm hover:shadow-md transition group">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-red-400 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">🔖</div>
              <h3 className="text-2xl font-bold mb-2">Save Favorites</h3>
              <p className="text-slate-400">Bookmark internships you love and keep track of your applications in one clean dashboard.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">📍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Global & Local</h3>
              <p className="text-slate-600 text-sm">Filter by country to find opportunities right in Morocco, or explore tech hubs like London and San Francisco.</p>
            </div>
            {/* Feature 4 */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">⚡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Real-time Deadlines</h3>
              <p className="text-slate-600">Never miss an application window again. Filter by deadlines and see exactly when applications close.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/redolution-logo.png" alt="REDOLUTION" className="h-6 w-auto grayscale opacity-50" />
          </div>
          <p className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} REDOLUTION. Built for students.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-red-600 transition">Twitter</a>
            <a href="#" className="text-slate-400 hover:text-red-600 transition">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}