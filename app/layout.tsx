import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getActiveTheme } from "@/lib/theme";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { websiteJsonLd, organizationJsonLd, jsonLdScript } from "@/lib/seo";

// Read the admin-selected theme on every request so a theme switch in the
// dashboard takes effect site-wide.
export const dynamic = "force-dynamic";

const DESCRIPTION =
  "أرشيف رقمي يجمع الصوتيات والمرئيات والمقالات للشيخ خالد بن علي الجريش للاستماع والمشاهدة والقراءة المباشرة.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "الشيخ خالد بن علي الجريش" }],
  keywords: [
    "خالد الجريش",
    "الشيخ خالد بن علي الجريش",
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
  const theme = await getActiveTheme();
  const htmlClass = theme === "ocean" ? "theme-ocean" : "theme-classic";

  return (
    <html lang="ar" dir="rtl" className={htmlClass}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Tajawal is used by the Ocean theme; harmless to load always. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
