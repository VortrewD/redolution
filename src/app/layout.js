import "./globals.css";
import Providers from "./providers";

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
  keywords: ["internships", "internship Morocco", "stage Maroc", "REDOLUTION"],
  authors: [{ name: "REDOLUTION" }],
  creator: "REDOLUTION",
  publisher: "REDOLUTION",
  robots: {
    index: true,
    follow: true,
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
    description: "Filter internships by country, field and deadline.",
    images: [{ url: "/redolution-logo.png", width: 1376, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "REDOLUTION — Find Internships",
    images: ["/redolution-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

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
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 min-h-screen">
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