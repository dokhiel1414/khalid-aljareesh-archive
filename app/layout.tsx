import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getActiveTheme } from "@/lib/theme";

// Read the admin-selected theme on every request so a theme switch in the
// dashboard takes effect site-wide.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "أرشيف الشيخ خالد بن علي الجريش",
    template: "%s · أرشيف الشيخ خالد بن علي الجريش",
  },
  description:
    "أرشيف رقمي يجمع الصوتيات والمرئيات والمقالات للشيخ خالد بن علي الجريش للاستماع والمشاهدة والقراءة المباشرة.",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "أرشيف الشيخ خالد بن علي الجريش",
    description:
      "مجموعة منظّمة من المحاضرات والدروس والمقالات في مكان واحد.",
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
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
