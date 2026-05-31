import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayerProvider from "@/components/AudioPlayerProvider";
import PersistentPlayer from "@/components/PersistentPlayer";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { websiteJsonLd, organizationJsonLd, jsonLdScript } from "@/lib/seo";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "أرشيف رقمي يجمع الصوتيات والمرئيات والمقالات لخالد بن علي الجريش للاستماع والمشاهدة والقراءة المباشرة.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "خالد بن علي الجريش" }],
  keywords: [
    "خالد الجريش",
    "خالد بن علي الجريش",
    "محاضرات",
    "دروس",
    "خطب",
    "مقالات",
    "صوتيات",
    "مرئيات",
    "أرشيف إسلامي",
    "توجيهات أسرية",
  ],
  alternates: { canonical: "/" },
  // When verifying ownership in Google Search Console via the HTML-tag method,
  // set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION on Vercel (no code change needed).
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#072C49",
};

// Inline script to set dark/light BEFORE the page paints — avoids a flash.
const themeInit = `
(function(){try{
  var t = localStorage.getItem('theme');
  if (!t) { t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  if (t === 'dark') { document.documentElement.classList.add('dark'); }
}catch(e){}})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="theme-classic">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {/* Structured data: WebSite (search box) + Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <AudioPlayerProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <PersistentPlayer />
        </AudioPlayerProvider>
        <Analytics />
      </body>
    </html>
  );
}
