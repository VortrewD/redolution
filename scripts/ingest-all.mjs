import { scrapeJobs } from 'ts-jobspy';
import { createClient } from '@libsql/client';
import { Resend } from 'resend';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

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
  
  console.log(`\nDONE SCRAPING! Total new internships added to Turso: ${totalInserted}`);

  // --- SEND EMAIL ALERTS ---
  if (totalInserted > 0) {
    console.log("Fetching subscribers...");
    const subsResult = await turso.execute("SELECT email FROM subscribers");
    const subscribers = subsResult.rows;

    if (subscribers.length > 0) {
      console.log(`Sending email to ${subscribers.length} subscribers...`);
      
      // Fetch the 5 newest jobs to show in the email
      const newJobsResult = await turso.execute("SELECT title, company, country, url FROM internships ORDER BY id DESC LIMIT 5");
      const newJobs = newJobsResult.rows;

      let jobsHtml = newJobs.map(job => `
        <div style="padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">
            <a href="${job.url}" style="color: #dc2626; text-decoration: none;">${job.title}</a>
          </h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${job.company} · ${job.country}</p>
        </div>
      `).join("");

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626; margin-bottom: 20px;">REDOLUTION</h1>
          <p style="font-size: 16px; color: #334155;">We just found <strong>${totalInserted} new internships</strong> today!</p>
          <p style="font-size: 16px; color: #334155;">Here are the latest ones:</p>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 0 20px; margin: 20px 0;">
            ${jobsHtml}
          </div>
          
          <a href="https://redolution.vercel.app/internships" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View all internships</a>
        </div>
      `;

      try {
        // Send a single email with BCC to protect privacy
        await resend.emails.send({
          from: 'REDOLUTION <onboarding@resend.dev>',
          to: 'alerts@redolution.vercel.app', // Fake recipient since we use BCC
          bcc: subscribers.map(s => s.email),
          subject: `🚀 ${totalInserted} new internships just dropped!`,
          html: emailHtml,
        });
        console.log("Emails sent successfully!");
      } catch (e) {
        console.error("Failed to send emails:", e);
      }
    }
  }
}

run();