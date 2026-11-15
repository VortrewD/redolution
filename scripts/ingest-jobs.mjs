import { scrapeJobs } from 'ts-jobspy';
import { createClient } from '@libsql/client';

// Hardcoded Turso credentials for local execution
const turso = createClient({
  url: "libsql://redolution-vortrewd.aws-eu-central-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE4MjY2NDQ4MjIsImlhdCI6MTc5NDUwNDAyMiwiaWQiOiIwMWExZDBhMy1hMjAxLTc3N2UtODMwNC1iY2Q2ODkxNTkxNmMiLCJraWQiOiJYdWtrTUZYcHlSTVZRdGc4ZkliQmsyei1STGoydUktQ211aWhOaENJME8wIiwicmlkIjoiYTViYzUzZGYtMTE0MC00ZjVmLTk1ZjMtMzg4YjQ0MzM4NjM2In0.C1gblkWJTjrKQcfLq47hcC_8_vZB22Yy_rrT65atr0sMEbdHScMRwBUxUVyP2cU5zH2ImfZ4pv4g4w9bliUbDg",
});

// Search terms focused on entry-level / junior roles in multiple languages
const searchTerms = [
  'junior', 
  'entry level', 
  'jeune diplômé', 
  'débutant',
  'recién graduado', // Spanish
  'neolaureato', // Italian
  'berufseinstieg' // German
];

// Target countries
const countries = ['morocco', 'france', 'germany', 'usa', 'uk', 'spain', 'italy', 'canada'];

// Helper to clean encoding bugs
function cleanString(str) {
  if (!str) return "Unknown";
  return str
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã©/g, 'é')
    .replace(/Ã /g, 'à')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã´/g, 'ô');
}

async function run() {
  let totalInserted = 0;

  for (const country of countries) {
    for (const term of searchTerms) {
      console.log(`Searching "${term}" in ${country}...`);
      
      try {
        const result = await scrapeJobs({
          sites: ['indeed'],
          searchTerm: term,
          location: country,
          country: country,
          jobType: 'fulltime', 
          resultsWanted: 20, // Reduced slightly to avoid getting blocked
          offset: 0,
          siteConcurrency: 1,
        });

        if (result.jobs && result.jobs.length > 0) {
          for (const job of result.jobs) {
            const title = cleanString(job.title);
            const company = cleanString(job.company);
            const jobCountry = cleanString(job.location) || country;
            const field = "Full-Time";
            
            // Skip senior/manager/lead roles that slip through
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('senior') || lowerTitle.includes('manager') || lowerTitle.includes('lead') || lowerTitle.includes('director')) {
              continue;
            }

            const deadline = null;
            const docs = JSON.stringify(["CV", "Cover Letter"]);
            const url = job.jobUrl || '';

            if (url) {
              await turso.execute({
                sql: `INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url, type) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [title, company, jobCountry, field, deadline, docs, url, "job"]
              });
              totalInserted++;
            }
          }
          console.log(`  -> Added ${result.jobs.length} jobs.`);
        } else {
          console.log(`  -> No jobs found.`);
        }
      } catch (error) {
        console.error(`  -> Error for ${term} in ${country}:`, error.message);
      }
      
      // Wait between requests to prevent rate-limiting
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\nDONE! Total job offers added: ${totalInserted}`);
}

run();