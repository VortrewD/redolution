import { createClient } from '@libsql/client';
import * as cheerio from 'cheerio';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const START_ID = 50000;
const END_ID = 60000;
const CONCURRENCY = 10; // Fetch 10 pages at the exact same time

async function scrape() {
  let totalInserted = 0;
  let scanned = 0;
  const ids = Array.from({ length: END_ID - START_ID + 1 }, (_, i) => START_ID + i);

  console.log(`Starting Fast Solidarity Scraper... (Scanning ${ids.length} IDs)`);

  // Process IDs in chunks of 10
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const chunk = ids.slice(i, i + CONCURRENCY);
    
    await Promise.all(chunk.map(async (id) => {
      const url = `https://youth.europa.eu/solidarity/placement/${id}_en`;
      
      try {
        const res = await fetch(url);
        if (!res.ok) return; 

        const html = await res.text();
        const $ = cheerio.load(html);

        const title = $('h1').text().trim();
        if (!title || title.includes('Page not found')) return;

        const locationText = $('p:has(i.fa-location-arrow)').text().trim();
        
        let deadline = null;
        $('p, div, span, li').each((i, el) => {
          const text = $(el).text();
          if (text.includes('Apply by') || text.includes('Deadline') || text.includes('Application deadline')) {
            const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (match) deadline = match[1];
          }
        });

        const websiteLink = $('a.btn__link--website').attr('href') || url;

        if (title && locationText) {
          let formattedDeadline = null;
          if (deadline) {
            const parts = deadline.split('/');
            if (parts.length === 3) formattedDeadline = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }

          await turso.execute({
            sql: `INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url, type) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              title,
              "European Solidarity Corps", 
              locationText, 
              "Solidarity", 
              formattedDeadline,
              JSON.stringify(["CV", "Motivation Letter"]),
              websiteLink,
              "solidarity"
            ]
          });
          totalInserted++;
          console.log(`✅ Added: ${title} (${locationText})`);
        }
      } catch (error) {
        // Skip errors silently to keep the scan fast
      }
      
      scanned++;
      if (scanned % 100 === 0) console.log(`Scanned ${scanned} / ${ids.length}... Found ${totalInserted} so far.`);
    }));
  }

  console.log(`\nDONE! Total solidarity opportunities added: ${totalInserted}`);
}

scrape();