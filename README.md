# أرشيف الشيخ خالد الجريسي — Sheikh Khalid Al-Jareesh Archive

A minimal, modern, fully Arabic (RTL) Islamic media archive built with **Next.js 14 (App Router) + Tailwind CSS + Prisma + Postgres**. All media files are hosted on **Google Drive** and streamed/embedded directly.

---

## Features

- **Public site** with a clean Arabic UI:
  - Hero, latest uploads, category grid
  - Dedicated sections: صوتيات / مرئيات / مقالات وكتب
  - Advanced search (keyword + category + date range)
  - Responsive, mobile-first, Tajawal + Cairo fonts, full palette
- **Google Drive integration** — paste any share link, the app extracts the file id and produces:
  - HTML5 `<audio>` direct stream for audio
  - `drive.google.com/file/d/.../preview` iframe for video & PDF
  - Auto-thumbnails (`drive.google.com/thumbnail?...`)
- **Admin dashboard**
  - Single-admin login (env-var credentials)
  - JWT cookie session (HttpOnly), middleware-protected `/admin/*`
  - Add / list / delete content
- **One-click Vercel deploy** with Prisma + any Postgres (Vercel Postgres, Supabase, Neon).

---

## 1. Folder structure

```
khalid-aljareesh-archive/
├─ app/
│  ├─ layout.tsx                # RTL root layout, fonts, navbar, footer
│  ├─ page.tsx                  # Home (hero + latest + category grid)
│  ├─ globals.css               # Tailwind + palette + components
│  ├─ audio/page.tsx            # Audio section
│  ├─ video/page.tsx            # Video section
│  ├─ written/page.tsx          # Written section
│  ├─ search/page.tsx           # Search page (filters: q, category, date)
│  ├─ admin/
│  │  ├─ login/page.tsx         # Admin login (client form)
│  │  └─ dashboard/
│  │     ├─ page.tsx            # Server: loads items
│  │     └─ DashboardClient.tsx # Client: add/list/delete UI
│  └─ api/
│     ├─ auth/login/route.ts    # POST login → sets JWT cookie
│     ├─ auth/logout/route.ts   # POST logout
│     ├─ items/route.ts         # GET list, POST create (admin)
│     ├─ items/[id]/route.ts    # DELETE (admin)
│     └─ search/route.ts        # GET search
├─ components/
│  ├─ Navbar.tsx
│  ├─ Footer.tsx
│  ├─ Hero.tsx
│  ├─ SectionHeader.tsx
│  ├─ SearchBar.tsx             # Client component with advanced filters
│  ├─ CategoryGrid.tsx
│  ├─ ItemCard.tsx
│  ├─ ItemGrid.tsx
│  ├─ MediaEmbed.tsx            # <audio> + Drive iframe embed
│  └─ EmptyState.tsx
├─ lib/
│  ├─ prisma.ts                 # Singleton Prisma client
│  ├─ auth.ts                   # JWT cookie helpers + admin check
│  ├─ drive.ts                  # Drive link parsing & URL builders
│  └─ utils.ts                  # cn(), formatArabicDate, labels
├─ prisma/schema.prisma         # DB schema (Item + Category enum)
├─ middleware.ts                # Guards /admin/* (except /admin/login)
├─ tailwind.config.ts           # Color palette + fonts
├─ next.config.js
├─ tsconfig.json
├─ package.json
├─ .env.example
└─ README.md
```

---

## 2. Database schema

Prisma (`prisma/schema.prisma`):

```prisma
enum Category { AUDIO VIDEO WRITTEN }

model Item {
  id          String    @id @default(cuid())
  title       String
  description String?   @db.Text
  category    Category
  driveLink   String?   @map("drive_link")
  driveFileId String?   @map("drive_file_id")
  thumbnail   String?
  publishedAt DateTime  @default(now()) @map("published_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([category])
  @@index([publishedAt])
  @@index([title])
  @@map("items")
}
```

Equivalent SQL (Postgres):

```sql
CREATE TYPE "Category" AS ENUM ('AUDIO', 'VIDEO', 'WRITTEN');

CREATE TABLE "items" (
  "id"             TEXT PRIMARY KEY,
  "title"          TEXT NOT NULL,
  "description"    TEXT,
  "category"       "Category" NOT NULL,
  "drive_link"     TEXT,
  "drive_file_id"  TEXT,
  "thumbnail"      TEXT,
  "published_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON "items" ("category");
CREATE INDEX ON "items" ("published_at");
CREATE INDEX ON "items" ("title");
```

---

## 3. Local setup

Requirements: **Node 18+**, a Postgres database (local, Supabase, Neon, or Vercel Postgres).

```bash
# 1. Install
cd khalid-aljareesh-archive
npm install

# 2. Create .env from the template
cp .env.example .env
#  → fill DATABASE_URL, DIRECT_URL, ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET

# 3. Push the schema to your database
npx prisma db push

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>. The admin panel lives at <http://localhost:3000/admin/login>.

### Generating a strong `AUTH_SECRET`

```bash
# macOS / Linux
openssl rand -base64 48

# Windows PowerShell
[Convert]::ToBase64String((1..48 | %{ Get-Random -Maximum 256 }))
```

---

## 4. Deploy to Vercel (step-by-step)

1. **Push the repo to GitHub** (any new repository).
2. Go to <https://vercel.com/new> and import the repo. Vercel auto-detects Next.js.
3. **Create the database** (pick one):
   - **Vercel Postgres** — Project → Storage → *Create Database* → Postgres. Vercel will auto-inject `POSTGRES_*` env vars. Add two aliases pointing to the same URL:
     - `DATABASE_URL = ${POSTGRES_PRISMA_URL}`
     - `DIRECT_URL  = ${POSTGRES_URL_NON_POOLING}`
   - **Supabase** — create a project, copy the *Connection string* (Pooler URI for `DATABASE_URL`, direct URI for `DIRECT_URL`). Append `?sslmode=require`.
   - **Neon** — same idea: pooled URL for `DATABASE_URL`, unpooled for `DIRECT_URL`.
4. **Add the remaining env vars** in Vercel → *Project Settings → Environment Variables*:
   - `ADMIN_USERNAME` — your admin login
   - `ADMIN_PASSWORD` — a strong password
   - `AUTH_SECRET` — a long random string (≥ 32 chars)
   - `NEXT_PUBLIC_SITE_URL` — your final URL (optional)
5. **Deploy.** The build runs `prisma generate && next build` automatically.
6. **Initialise the database** (one time). From your laptop, with the same `DATABASE_URL` in `.env`:
   ```bash
   npx prisma db push
   ```
   (Or run it via Vercel's *"Run command"* in the project console.)
7. Visit your site → log in at `/admin/login` → add your first content.

---

## 5. Using Google Drive links

For each file on Drive: **Share → "Anyone with the link"** → copy.
Then paste it into the dashboard form. Any of these shapes work:

```
https://drive.google.com/file/d/1AbCdEfGh12345.../view?usp=sharing
https://drive.google.com/open?id=1AbCdEfGh12345...
https://drive.google.com/uc?id=1AbCdEfGh12345...&export=download
```

The app extracts the file id and produces:
- **Audio** → `<audio>` element pointing at `drive.google.com/uc?export=download&id=…` + an iframe fallback.
- **Video** → `drive.google.com/file/d/…/preview` iframe (Google's official player).
- **Written (PDF)** → same `/preview` iframe (in-browser PDF viewer).
- **Thumbnail** → `drive.google.com/thumbnail?id=…&sz=w640` (used automatically if you don't supply a custom cover).

---

## Tech & color palette

- Next.js 14 App Router, TypeScript, Tailwind CSS 3.4
- Prisma 5 + Postgres
- Lucide React icons
- `jose` for JWT cookie auth (Edge-safe)
- Fonts: **Tajawal** (body) + **Cairo** (display)
- Palette: `#072C49` ink · `#DEA470` gold · `#C17E5A` brown · `#ECE6DD` sand
