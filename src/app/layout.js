import "./globals.css";
import Providers from "./providers";

// Change this when you deploy: set NEXT_PUBLIC_SITE_URL in .env.local
// to your real domain, e.g., https://redolution.com
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://redolution.example.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "REDOLUTION — Find Internships in Morocco & Abroad",
    template: "%s | REDOLUTION",
  },
  description:
    "REDOLUTION aggregates internships for students. Filter by country, field and deadline, save favourites, and find software, data / AI, cybersecurity, web and mobile internships in Morocco, France, Germany, Lithuania and more.",
  keywords: [
    "internships",
    "internship Morocco",
    "stage Maroc",
    "software engineering internship",
    "data science internship",
    "AI internship",
    "cybersecurity internship",
    "web development internship",
    "REDOLUTION",
  ],
  authors: [{ name: "REDOLUTION" }],
  creator: "REDOLUTION",
  publisher: "REDOLUTION",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "REDOLUTION",
    title: "REDOLUTION — Find Internships in Morocco & Abroad",
    description:
      "Filter internships by country, field and deadline, save favourites, and find your next software, data / AI or cybersecurity internship.",
    images: [
      {
        url: "/redolution-logo.png",
        width: 1376,
        height: 768,
        alt: "REDOLUTION logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REDOLUTION — Find Internships in Morocco & Abroad",
    description:
      "Filter internships by country, field and deadline, save favourites, and find your next internship.",
    images: ["/redolution-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

// Structured data: Organisation + WebSite, using the logo you supplied.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "REDOLUTION",
      url: siteUrl,
      logo: `${siteUrl}/redolution-logo.png`,
    },
    {
      "@type": "WebSite",
      name: "REDOLUTION",
      url: siteUrl,
      description:
        "Internship aggregation dashboard: filter internships by country, field and deadline.",
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}