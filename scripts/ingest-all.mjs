import { scrapeJobs } from 'ts-jobspy';
import { createClient } from '@libsql/client';

// Connects using GitHub Secrets (or your local .env if running locally)
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const searchTerms = [
  'internship', 'stage', 'software engineer', 'data analyst', 
  'marketing', 'finance', 'design', 'HR', 'business', 
  'cybersecurity', 'product manager'
];

const countries = ['morocco', 'france', 'usa', 'uk', 'germany', 'canada', 'spain'];

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
          jobType: 'internship',
          resultsWanted: 50,
          offset: 0,
          siteConcurrency: 1,
        });

        if (result.jobs && result.jobs.length > 0) {
          for (const job of result.jobs) {
            const title = job.title || 'Unknown';
            const company = job.company || 'Unknown';
            const jobCountry = job.location || country;
            const field = term;
            const deadline = '2099-12-31';
            const docs = JSON.stringify(['CV', 'Cover Letter']);
            const url = job.jobUrl || '';

            if (url) {
              await turso.execute({
                sql: `INSERT OR IGNORE INTO internships (title, company, country, field, deadline, docs, url) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [title, company, jobCountry, field, deadline, docs, url]
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
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\nDONE! Total new internships added to Turso: ${totalInserted}`);
}

run();