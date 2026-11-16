import { scrapeJobs } from 'ts-jobspy';
import { createClient } from '@libsql/client';

// Use environment variables for GitHub Actions compatibility
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// NEW search terms we haven't used yet
const searchTerms = [
  'stagiaire', 
  'alternance', 
  'apprentice', 
  'intern', 
  'graduate scheme',
  'prácticas',
  'tirocinio',
  'praktikum',
  'no experience',
  'willing to train'
];

// NEW countries to avoid IP blocks
const countries = ['belgium', 'netherlands', 'switzerland', 'portugal', 'ireland'];

function cleanString(str) {
  if (!str) return "Unknown";
  return str.replace(/Ã¼/g, 'ü').replace(/Ã©/g, 'é').replace(/Ã /g, 'à');
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
          resultsWanted: 30,
          offset: 0,
          siteConcurrency: 1,
        });

        if (result.jobs && result.jobs.length > 0) {
          for (const job of result.jobs) {
            const title = cleanString(job.title);
            const company = cleanString(job.company);
            const jobCountry = cleanString(job.location) || country;
            const field = "Full-Time";
            
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
      
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  console.log(`\nDONE! Total job offers added: ${totalInserted}`);
}

run();