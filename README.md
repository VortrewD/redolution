# REDOLUTION — Internship Aggregation Dashboard

Prototype skeleton only.

## What this is

- List page with a filter bar: country, field, deadline range.
- Internship cards: position, company, country, deadline, required-documents tags, and a favourite button saved in `localStorage`.
- Minimal API route (`/api/internships`) that reads from a SQLite table.
- 10 sample entries, seeded automatically on first use.
- Google sign-in button that is a placeholder only. It calls the stub route `/api/auth/signin`, which returns a 200 JSON message and does nothing else.
- Logo and SEO: your supplied logo is in the header, as favicon/icon, and as the Open Graph image. Title, description, keywords, Open Graph + Twitter cards, canonical URL, `robots.txt`, `sitemap.xml`, and JSON-LD (Organisation + WebSite) are in `src/app/layout.js`, `src/app/robots.js`, and `src/app/sitemap.js`.

## What this is NOT

- No complete Google OAuth flow. You will integrate NextAuth / Auth.js yourself with the Google Provider, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and callback URLs.
- No user registration, email verification, or password reset.
- No scraper or real data pipeline. The 10 entries are sample data with `example.com` links.
- No claim that this is secure or production-ready. Audit it yourself before any real use.

## Project structure

```
redolution/
├── README.md
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── jsconfig.json
├── .env.local.example      # NEXT_PUBLIC_SITE_URL — set to your real domain on deploy
├── .gitignore
├── data/
│   └── redolution.db        # created on first run, gitignored
├── public/
│   ├── redolution-logo.png  # your logo (1376×768)
│   └── favicon.ico          # square crop of the logo
└── src/
    ├── app/
    │   ├── layout.js         # SEO metadata + JSON-LD
    │   ├── icon.png          # square crop, used as favicon
    │   ├── apple-icon.png
    │   ├── robots.js         # /robots.txt
    │   ├── sitemap.js        # /sitemap.xml
    │   ├── page.js           # list page: logo header, filters, cards, favourites, Google button
    │   ├── globals.css
    │   └── api/
    │       ├── internships/
    │       │   └── route.js  # GET /api/internships?country=&field=&deadlineFrom=&deadlineTo=
    │       └── auth/
    │           └── signin/
    │               └── route.js  # POST/GET stub, placeholder only
    └── lib/
        └── db.js             # SQLite (node:sqlite) + internships table + 10 sample rows
```

## Database

Table `internships`, created in `src/lib/db.js`:

| column | type |
| --- | --- |
| id | INTEGER PRIMARY KEY AUTOINCREMENT |
| title | TEXT NOT NULL |
| company | TEXT NOT NULL |
| country | TEXT NOT NULL |
| field | TEXT NOT NULL |
| deadline | TEXT NOT NULL (YYYY-MM-DD) |
| docs | TEXT NOT NULL (JSON string, e.g. `["CV","Cover Letter"]`) |
| url | TEXT NOT NULL |

The API parses `docs` back to an array before returning JSON.

Filters use parameterised placeholders only — values are never interpolated into the SQL string.

## How to run locally

Requirements: Node.js 22.5+ (Node 24 recommended, for built-in `node:sqlite`), npm.

```bash
cd redolution
npm install
npm run dev
```

Then open http://localhost:3000

- You should see REDOLUTION, the filter bar, and 10 internship cards.
- Change Country / Field / Deadline from / to — the list updates via `/api/internships`.
- Click ☆ Favourite — it becomes ★ Favourite, survives a page reload (localStorage key `redolution:favorites`), and “Show favourites only” filters to it.
- Click “Sign in with Google” — the button is visible, clicking it shows the placeholder message and does not error. It does not sign anyone in.

Other commands:

```bash
npm run build
npm start
```

## Logo & SEO

- Logo files: `public/redolution-logo.png` (your original, 1376×768), `src/app/icon.png` and `src/app/apple-icon.png` (centre-square crops of the R / globe mark), `public/favicon.ico`.
- SEO is in `src/app/layout.js`: title “REDOLUTION — Find Internships in Morocco & Abroad”, description, keywords, Open Graph + Twitter cards (logo as the share image), canonical URL, robots, and icons.
- `src/app/robots.js` → `/robots.txt`, `src/app/sitemap.js` → `/sitemap.xml` (home page only in this skeleton).
- JSON-LD in `layout.js`: Organisation + WebSite, with the logo URL.
- The canonical / Open Graph domain defaults to `https://redolution.example.com` — that is a placeholder, not a live domain. Before deploying, copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your real domain.

## API check

```bash
curl http://localhost:3000/api/internships
curl "http://localhost:3000/api/internships?country=Morocco"
curl -X POST http://localhost:3000/api/auth/signin
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml
```

## Your next steps (after this skeleton)

1. Confirm the list page, filters, and SQLite work.
2. Integrate NextAuth / Auth.js yourself: add the Google Provider, configure callback URLs, protect the dashboard route.
3. Audit security yourself: API routes, session cookies, CSRF, and any other checks you need.
4. Only then consider real data sources (Apify / ATS APIs, etc.).
