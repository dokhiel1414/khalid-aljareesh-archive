import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

// Default social-share image for the whole site (1200×630).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "أرشيف الشيخ خالد بن علي الجريش";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // public/ assets aren't bundled into serverless functions — fetch over HTTP.
  const [bold, regular] = await Promise.all([
    fetch(`${SITE_URL}/fonts/thmanyahserifdisplay-Bold.otf`).then((r) => r.arrayBuffer()),
    fetch(`${SITE_URL}/fonts/thmanyahserifdisplay-Medium.otf`).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #072C49 0%, #0A3A5E 100%)",
          color: "#ECE6DD",
          direction: "rtl",
          position: "relative",
        }}
      >
        {/* gold ring accent */}
        <div
          style={{
            position: "absolute",
            top: 70,
            width: 96,
            height: 96,
            borderRadius: 24,
            border: "5px solid #DEA470",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            fontFamily: "Thmanyah",
            fontWeight: 700,
            fontSize: 76,
            marginTop: 120,
            textAlign: "center",
            lineHeight: 1.25,
            padding: "0 80px",
          }}
        >
          أرشيف الشيخ خالد بن علي الجريش
        </div>
        <div
          style={{
            fontFamily: "ThmanyahM",
            fontSize: 36,
            marginTop: 28,
            color: "#DEA470",
          }}
        >
          صوتيات · مرئيات · مقالات
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            fontFamily: "ThmanyahM",
            fontSize: 26,
            color: "rgba(236,230,221,0.65)",
          }}
        >
          khalid-aljareesh-archive
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Thmanyah", data: bold, weight: 700, style: "normal" },
        { name: "ThmanyahM", data: regular, weight: 500, style: "normal" },
      ],
    },
  );
}
