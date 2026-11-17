import { createClient } from '@libsql/client';
import Parser from 'rss-parser';

// Hardcoded Turso credentials for local execution
const turso = createClient({
  url: "libsql://redolution-vortrewd.aws-eu-central-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MjY2NDQ4MjIsImlhdCI6MTc5NDUwNDAyMiwiaWQiOiIwMWExZDBhMy1hMjAxLTc3N2UtODMwNC1iY2Q2ODkxNTkxNmMiLCJraWQiOiJYdWtrTUZYcHlSTVZRdGc4ZkliQmsyei1STGoydUktQ211aWhOaENJME8wIiwicmlkIjoiYTViYzUzZGYtMTE0MC00ZjVmLTk1ZjMtMzg4YjQ0MzM4NjM2In0.C1gblkWJTjrKQcfLq47hcC_8_vZB22Yy_rrT65atr0sMEbdHScMRwBUxUVyP2cU5zH2ImfZ4pv4g4w9bliUbDg",
});

const parser = new Parser();

// NEW, working RSS feeds
const RSS_FEEDS = [
  'https://opportunitiescorners.com/feed/',
  'https://www.scholarshiptab.com/feed/',
  'https://www.scholars4dev.com/feed/',
  'https://scholarshipunion.com/feed/',
  'https://www.studyinmorocco.com/feed/'
];

async function scrape() {
  let totalInserted = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`Fetching ${feedUrl}...`);
    try {
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items) {
        const title = item.title || "";
        // Filter for posts that look like scholarships (contain "scholarship" or "fellowship")
        if (!title.toLowerCase().includes('scholarship') && !title.toLowerCase().includes('fellowship')) continue;

        // Clean the title (remove quotes, limit length)
        const cleanTitle = title.replace(/'/g, "''").slice(0, 200);
        const link = item.link || "";
        if (!link) continue;

        // Try to extract a deadline from the description (simple regex)
        const desc = item.contentSnippet || item.content || "";
        let deadline = null;
        const dateMatch = desc.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)[,\s]+\d{4})/i);
        if (dateMatch) {
          deadline = dateMatch[1]; 
        }

        // Insert into database
        await turso.execute({
          sql: `INSERT OR IGNORE INTO internships 
                (title, company, country, field, deadline, docs, url, type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            cleanTitle,
            "Scholarship Provider",
            "Global",
            "Scholarship",
            deadline,
            JSON.stringify(["CV", "Motivation Letter"]),
            link,
            "scholarship"
          ]
        });
        totalInserted++;
        console.log(`  -> Added: ${cleanTitle}`);
      }
    } catch (error) {
      console.error(`  -> Error fetching ${feedUrl}:`, error.message);
    }
  }

  console.log(`\nDONE! Total scholarships added: ${totalInserted}`);
}

scrape();