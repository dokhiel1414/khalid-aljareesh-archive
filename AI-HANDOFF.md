# برومت التسليم — أرشيف الشيخ خالد بن علي الجريش

> انسخ هذا الملف بالكامل وأعطه لأي مساعد ذكاء اصطناعي يعمل على جهازي. هو يشرح المشروع كاملاً وحالته الحالية وكيفية المتابعة دون الحاجة لإعادة الشرح.

---

## 0) تعليمات موجّهة للمساعد (اقرأها أولاً)

أنت مطوّر تكمل العمل على موقع جاهز ومنشور بالفعل. **لا تعِد بناء المشروع من الصفر.** المشروع موجود محلياً ومربوط بحسابات حقيقية (Vercel + GitHub + Neon). مهمتك إجراء تعديلات يطلبها المالك مع **الحفاظ على كل شيء يعمل كما هو**.

قواعد العمل:
- اعمل دائماً داخل مجلد المشروع: `C:\Users\dokhi\Desktop\khalid-aljareesh-archive`
- قبل أي تعديل واسع، افحص الملفات ذات الصلة واقرأها.
- بعد أي تعديل: شغّل `npx tsc --noEmit` للتأكد من خلوّه من أخطاء الأنواع.
- لا ترفع أي أسرار (كلمات مرور / روابط قواعد بيانات) إلى GitHub. ملف `.gitignore` يستثني `.env*` و`.vercel` — أبقِه كذلك.
- لا تنفّذ عمليات حذف دائمة أو تغيير صلاحيات أو معاملات مالية دون إذن صريح من المالك.
- التواصل مع المالك بالعربية.

---

## 1) ما هو المشروع

موقع عربي (RTL) هو **أرشيف رقمي للشيخ خالد بن علي الجريش**: يعرض صوتيات ومرئيات ومقالات/كتب. كل ملفات الوسائط مستضافة على **Google Drive** ويُدمَج تشغيلها داخل الموقع (لا تُرفع الملفات للخادم — يُخزَّن فقط رابط/معرّف Drive).

- الموقع الحيّ (الدومين الرسمي): **https://k-algrysh.com** (لا يزال vercel.app يعمل؛ canonical يشير للدومين الرسمي). رابط الموقع في `lib/site.ts` (`FALLBACK`)، ويمكن تجاوزه بمتغيّر `NEXT_PUBLIC_SITE_URL`.
- لوحة تحكم المسؤول: `/admin/login`
- عدد العناصر الحالي (بعد دمج 2026-05-30): **≈310 صوتي، 40 مرئي**، و**≈68 مقروءاً مستقلاً** — لكن صفحة المقروء `/written` تعرض أيضاً الصوتيات التي تحمل نصاً مقروءاً (انظر القسم 11)، فالمقروء المرئي للزائر أكبر.

---

## 2) التقنيات

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS 3.4** (RTL، خطوط Tajawal/Cairo)
- **Prisma 5** + **PostgreSQL على Neon**
- مصادقة المسؤول عبر **jose** (JWT في كوكي HttpOnly)، يحرسها `middleware.ts` على `/admin/*`
- محرّر المقالات: **tiptap**
- أيقونات: **lucide-react**
- لوحة الألوان: `#072C49` (ink) · `#DEA470` (gold) · `#C17E5A` (brown) · `#ECE6DD` (sand)

---

## 3) الحسابات والبنية التحتية (كلها للمالك وجاهزة)

| الخدمة | التفاصيل |
|---|---|
| **GitHub** | مستودع **خاص**: `dokhiel1414/khalid-aljareesh-archive` (الفرع `main`). حساب gh: `dokhiel1414`. |
| **Vercel** | الحساب/الفريق `dokhiels-projects`، اسم المشروع `khalid-aljareesh-archive`. الـCLI مسجّل دخول كـ `dokhiel1414-6386`. |
| **قاعدة البيانات** | **Neon Postgres**، مهيّأة بالكامل عبر متغيّرات بيئة Vercel. |

> **gh CLI** مثبّت في: `C:\Program Files\GitHub CLI\gh.exe` (قد لا يكون في PATH تلقائياً — أضِفه: `$env:PATH = "C:\Program Files\GitHub CLI;$env:PATH"`).

---

## 4) كيف يعمل النشر (مهم)

النشر **تلقائي**: أي `git push` إلى الفرع `main` على GitHub يُطلق بناءً ونشراً تلقائياً على Vercel. لا حاجة لتشغيل أي سكربت يدوي.

سير العمل القياسي بعد أي تعديل:
```powershell
$env:PATH = "C:\Program Files\GitHub CLI;$env:PATH"
cd C:\Users\dokhi\Desktop\khalid-aljareesh-archive
npx tsc --noEmit              # تحقق من الأنواع
npx next build                # تحقق أعمق (يكشف أخطاء لا يراها tsc — انظر القسم 10)
git add <الملفات المعدّلة>
git commit -m "وصف التعديل"
git push origin main          # ← يطلق النشر التلقائي
```

> **مهم — ترحيل قاعدة البيانات يتم في البناء**: سكربت البناء الحالي هو
> `prisma generate && prisma db push --skip-generate && node scripts/import-program.mjs && node scripts/link-program.mjs && node scripts/import-batch.mjs && next build`
> (سكربتات الاستيراد تبقى دائمة لكنها **بلا أثر** ما لم تُعطَ وسيط منفست/مفتاح — انظر القسم 8). السبب: متغيّرات
> Neon على Vercel «حساسة» ولا يمكن سحب قيمتها عبر `vercel env pull` (تُسحب فارغة)،
> لذا لا يمكن تشغيل `prisma db push` محلياً مقابل قاعدة الإنتاج. الحل أن البناء على
> Vercel (حيث القيم متاحة) يطبّق المخطّط تلقائياً. أي تغيير في `schema.prisma` يُطبَّق
> على Neon عند النشر. التغييرات الإضافية لا تحتاج تأكيداً؛ التغييرات الهدّامة ستفشل
> البناء بأمان (لن تُفقد بيانات بدون `--accept-data-loss`).
للتحقق من اكتمال النشر:
```powershell
vercel ls khalid-aljareesh-archive          # يعرض آخر عمليات النشر وحالتها
vercel inspect <deployment-url> --json       # readyState: BUILDING / READY / ERROR
```
الموقع الإنتاجي: الدومين الرسمي `https://k-algrysh.com` (وما زال `https://khalid-aljareesh-archive.vercel.app` يعمل أيضاً).

> يوجد أيضاً `deploy.ps1` (طريقة نشر يدوية قديمة عبر Vercel CLI). لم تعد ضرورية بعد ربط GitHub، لكنها تعمل.

---

## 5) التشغيل والمعاينة محلياً

المشروع فيه **بديل بيانات للتطوير**: في `lib/prisma.ts`، عند **غياب** `DATABASE_URL` يقرأ الموقع البيانات من `data/all-items.json` بدل قاعدة البيانات. لذا يمكن تشغيل الموقع محلياً ومعاينته بالبيانات الحقيقية **بدون** اتصال بقاعدة البيانات:
```powershell
cd C:\Users\dokhi\Desktop\khalid-aljareesh-archive
npm install      # أول مرة فقط
npm run dev      # http://localhost:3000
```
للعمل على قاعدة البيانات الحقيقية محلياً، اسحب المتغيّرات من Vercel:
```powershell
vercel env pull .env.local
```

### المعاينة البصرية والقياس الدقيق
إن توفّرت أداة معاينة (Preview MCP)، ملف التشغيل موجود في `D:\GoldenShamela-1\.claude\launch.json` (لاحظ: أداة المعاينة جذرها مجلد `D:\GoldenShamela-1` وليس مجلد المشروع، ولذلك يشغّل الأمر `cd` إلى مجلد المشروع). استخدم القياس بـ JavaScript (عرض العناصر، التمركز، الفيض) بدل الاعتماد على الصور وحدها، لأن لقطات العرض بأحجام مخصّصة قد تكون غير دقيقة. تحقّق دائماً على عرض **الجوال (375px)** و**الكمبيوتر (≥1280px)**.

---

## 6) بنية المشروع (الملفات المهمة)

```
app/
  layout.tsx              # التخطيط الجذري RTL + الخطوط + Navbar/Footer + الـmetadata (SEO/OpenGraph)
  page.tsx                # الصفحة الرئيسية (Hero + أحدث + شبكة الأقسام)
  globals.css             # Tailwind + لوحة الألوان + أصناف مكوّنات
  audio|video|written/    # صفحات الأقسام
  search/page.tsx         # البحث (q + category + نطاق تاريخ)
  item/[id]/page.tsx      # صفحة تفاصيل العنصر (مشغّل/مضمّن + عدّاد المشاهدات)
  contact/                # نموذج تواصل
  terms/                  # الشروط
  admin/login | admin/dashboard
  api/
    auth/login|logout, items, items/[id], items/[id]/view,
    search, contact, messages/[id], settings/theme, stats/visit, stream
components/
  Navbar.tsx  Hero.tsx  Footer.tsx  SearchBar(+Inner)  ItemCard  ItemGrid
  MediaEmbed.tsx  CategoryGrid  SectionHeader  ThemeToggle  HijriToday  IslamicStar ...
lib/
  prisma.ts   # عميل Prisma + بروكسي بيانات التطوير (fallback إلى data/all-items.json)
  auth.ts     # كوكي JWT + فحص المسؤول
  drive.ts    # تحليل روابط Google Drive وبناء روابط المعاينة/البث/المصغّرات
  utils.ts    # cn()، تنسيق التاريخ بالعربية، تسميات التصنيفات
prisma/schema.prisma
middleware.ts             # يحرس /admin/* (عدا /admin/login)
scripts/                  # سكربتات استيراد جماعي + إحصاءات (انظر القسم 8)
data/all-items.json       # نسخة من المحتوى (تُستخدم للتطوير المحلي)
```

---

## 7) نموذج البيانات (Prisma)

الجداول الأساسية في `prisma/schema.prisma`:
- **Item**: `id, title, description?, content?(HTML للمقالة), category(AUDIO|VIDEO|WRITTEN), driveLink?, driveFileId?, thumbnail?, publishedAt, viewCount, createdAt, updatedAt`
- **SiteStats**: عدّاد زيارات (صف واحد id=1)
- **SiteSetting**: إعدادات عامة، `theme` = `"classic" | "ocean"`
- **DeletedDriveItem**: «شواهد قبور» لمعرّفات Drive المحذوفة يدوياً — سكربتات الاستيراد لا تعيد إضافتها
- **UniqueVisit**: زيارة فريدة لكل (هاش زائر + يوم)
- **ContactMessage**: رسائل نموذج التواصل
- **Topic**: موضوع أو برنامج لتصنيف المحتوى عبر أنواع الوسائط. الحقول: `name, slug(فريد), description?, type(THEME|PROGRAM), coverImage?, order`. يُتصفّح عامّاً عبر `/topic/[slug]`.
- **ItemTopic**: جدول ربط متعدّد-لمتعدّد بين Item و Topic، مع `episodeOrder?` (يُستخدم لترتيب حلقات البرامج). الحذف متتالٍ (onDelete: Cascade).
- نوع `TopicType` = `THEME` (موضوع حر، عنصر قد يندرج تحت عدة مواضيع) أو `PROGRAM` (سلسلة مرتّبة لها صفحة وتنقّل بين الحلقات).

لتطبيق تغييرات المخطّط: `npx prisma db push` (مع وجود `DATABASE_URL` و`DIRECT_URL`).

---

## 8) المحتوى: Google Drive والاستيراد

- شارك ملف Drive كـ «Anyone with the link»، ثم استخدم رابطه. `lib/drive.ts` يستخرج `fileId` من أي صيغة رابط ويبني:
  - **صوت/فيديو/PDF** → `…/preview` (مشغّل Google داخل iframe)
  - **بث/تنزيل مباشر** و**مصغّرة** تلقائية (`thumbnail?id=…`)
- **الإضافة اليدوية**: من لوحة التحكم `/admin/dashboard` (إضافة/عرض/حذف عنصر).
- **الاستيراد الجماعي** عبر السكربتات (تقرأ ملفات JSON من `scripts/manifests/` بصيغة `[{ id, title }]`):
  ```powershell
  # مع ضبط DATABASE_URL و DIRECT_URL في البيئة
  node scripts/import-audio.mjs   scripts/manifests/audio-all.json
  node scripts/import-video.mjs   scripts/manifests/video-all.json
  node scripts/import-pdf.mjs     scripts/manifests/pdf-all.json
  node scripts/import-articles.mjs <manifest>
  ```
  السكربتات: تتجاهل المكرّر، لا تكتب فوق الموجود، وتتخطّى المحذوف (DeletedDriveItem)، وتنظّف العناوين (إزالة الامتدادات والعلامات الخفية).
- سكربتات مساعدة أخرى: `stats.mjs`، `reset-counter.mjs`، `reclean-titles.mjs`، `check-tombstones.mjs`.

### الوصول إلى Google Drive واستخراج المعرّفات (مهم)
- المجلد المتزامن محلياً `G:\ملفاتي` **يُقرأ منه الأسماء والملفات المنزّلة فقط**، لكنه **لا يوفّر روابط المشاركة ولا معرّفات Drive (fileId)** — تعيش في سحابة Google. حتى ملفات `.gdoc` هنا «online-only» وتفشل قراءتها محلياً.
- **الحل المعتمد**: `scripts/gas-export-drive.gs` = سكربت Google Apps Script يشغّله المالك في حسابه (script.google.com). يأخذ `FOLDER_IDS` (متكرّر على المجلدات الفرعية)، **يضبط مشاركة كل ملف «لأي شخص لديه الرابط - مشاهدة»**، ويكتب `khalid-drive-export.json` في «ملفاتي» → يتزامن إلى `G:\ملفاتي` فيُقرأ محلياً بـ Node (استخدم مسار **forward slashes**: `G:/ملفاتي/...` — الباك سلاش في Bash يفشل).

### المستورِد العام `scripts/import-batch.mjs`
- يعمل فقط عند تمرير منفست بـ argv أو `RUN_BATCH_IMPORT`. منفست: `[{ id, title, category:"AUDIO"|"VIDEO"|"WRITTEN", topic?, topicType?:"THEME"|"PROGRAM", ep? }]`.
- آمن/متكرّر: يتجاهل المكرّر (بمعرّف Drive أو العنوان المُطبَّع `loose`) والمحذوف (tombstone)، **ينشئ المواضيع THEME/PROGRAM عند الحاجة** ويربط العناصر بها (اتحاد للمواضيع على الموجود).
- **الكشف عن الجديد** قبل الاستيراد: قارن تصدير Drive بالموقع الحيّ عبر الـAPI العامّ (`/api/items?category=X&limit=200` + ترقيم بنوافذ `to` في `/api/search`). تنبيه: عناصر الاستيراد تتشارك تاريخ نشر واحد، فالترقيم بالتاريخ يجمع الكتلة الكثيفة عبر items API ثم يكمل الذيل بـ search.
- **التشغيل**: أضِف وسيط المنفست لسكربت البناء مؤقتاً (`node scripts/import-batch.mjs scripts/manifests/<x>.json`)، ادفع، تحقّق من `vercel inspect <url> --logs`، ثم **أعِد البناء** بإزالة الوسيط.

### دمج الصوتي+المقروء `scripts/merge-audio-written.mjs`
- وضعان عبر argv: `report` (تجريبي بلا تغيير) و`apply`. يطابق بالعنوان المُطبَّع، يدمج الأزواج النظيفة 1:1 (AUDIO بملف + WRITTEN بنص HTML): ينقل `content`+`description`+`viewCount`+المواضيع إلى الصوتي **ويحذف** المقروء. شغّله بنفس آلية البناء المؤقتة.

---

## 9) متغيّرات البيئة

مضبوطة بالفعل على Vercel (Production). الأسماء (بدون قيم):
`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`, بالإضافة إلى متغيّرات Neon/Postgres (`POSTGRES_*`, `PG*`, `NEON_*`).
القالب في `.env.example`. لا تطبع القيم الحقيقية ولا ترفعها إلى GitHub.

---

## 10) مطبّات تقنية على هذا الجهاز (Windows / PowerShell)

- **`npx prisma generate` قد يعطي `EPERM`**: ملف `query_engine-windows.dll.node` مقفول بسبب خادم تطوير شغّال. الحل: أوقف `npm run dev` ثم أعد المحاولة. العميل المولّد موجود أصلاً والبناء يعمل.
- **`git push` في PowerShell** قد يُظهر سطور stderr كأنها خطأ (NativeCommandError) رغم نجاحه — تحقّق من `exit code` ومن سطر `main -> main`.
- **PowerShell هنا 5.1**: لا تستخدم `&&`/`||`/المعاملات الثلاثية. للرسائل متعددة الأسطر استخدم here-string `@'...'@` (السطر `'@` في بداية السطر بلا مسافات).
- **gh** غير مضمون في PATH؛ أضِف `C:\Program Files\GitHub CLI` كما في الأعلى.
- **قاعدة قيود مسارات Next**: ملفات `app/**/route.ts` لا تسمح بتصدير أي شيء غير معالجات HTTP (GET/POST/PUT/PATCH/DELETE…). أي دالة مساعدة مشتركة ضعها في `lib/` لا في ملف المسار. **`tsc --noEmit` لا يكتشف هذا** — لذا شغّل `npx next build` للتحقق الكامل قبل النشر.
- **متغيّرات Neon حساسة**: لا يمكن سحب قيمتها بـ `vercel env pull` (تُسحب فارغة). لتجربة قاعدة البيانات محلياً تحتاج رابط اتصال من لوحة Neon. للتطوير العادي اعتمد على بديل JSON (شغّل بدون DATABASE_URL).

---

## 11) آخر ما تم إنجازه (سياق حديث)

### الدومين الرسمي + ظهور البحث (2026-05-31، الأحدث)
- **الدومين الرسمي `https://k-algrysh.com`** مربوط ويعمل (مسجَّل في Vercel تحت `dokhiels-projects`، nameservers Vercel). `FALLBACK` في `lib/site.ts` = الدومين الجديد، فكل canonical/sitemap/robots/SEO تستخدمه. `vercel.app` ما زال يعمل لكن canonical يشير للرسمي (يحلّ ازدواج المحتوى).
- **Google Search Console**: تمّ **التحقّق من الملكية** بطريقة **وسم HTML** (الرمز في `metadata.verification.google` داخل `layout.tsx`)، و**أُرسلت `sitemap.xml`**. (تعذّر إضافة DNS عبر `vercel dns` — صلاحية التوكن محدودة؛ أُضيف السجل يدوياً في لوحة Vercel أيضاً.)
- **Vercel Web Analytics مفعّل** من اللوحة (`<Analytics/>` في `layout.tsx`).
- **الاسم صار «خالد بن علي الجريش»** في كل الموقع (أُزيل «الشيخ»): `SITE_NAME="أرشيف خالد بن علي الجريش"`، `SHEIKH_NAME="خالد بن علي الجريش"`، وWaجهة/Navbar/SEO.
- **الشريط العلوي**: العنوان «خالد بن علي الجريش» + سطر صغير «مكتبة دعوية» (يظهر على الجوال أيضاً).
- **أزرار المشاركة أيقونات فقط** (`ShareButtons`: واتساب/تيليجرام/إكس/نسخ). **حُذفت** ميزتا **OpenGraph image** (`app/opengraph-image.tsx`) و**«مواد ذات صلة»** من صفحة العنصر.
- **حُذف عنصر** «كيف نجعل من بيوتنا سكناً» من القاعدة + شاهد قبر، عبر `scripts/delete-items.mjs` (يُمرَّر driveFileId في سكربت البناء مؤقتاً ثم يُعاد).
- **معلّق على المالك**: تدوير `AUTH_SECRET` (القسم 12). واختياري: إضافة `www.k-algrysh.com` في Vercel (الشهادة للـapex فقط)، وBing Webmaster.

### دفعة تحسينات UX/أداء/SEO (2026-05-30، منشورة) — *(ملاحظة: OG image و«مواد ذات صلة» أُزيلتا في 2026-05-31)*
- **SEO أساسي**: `sitemap.ts`، `robots.ts`، JSON-LD (`lib/seo.ts`)، canonical/OpenGraph، `lib/site.ts` (`SITE_URL` قابل للضبط)، `opengraph-image.tsx`، `icon.svg`. (تفاصيل في القسمين 8 والذاكرة.)
- **مشغّل صوتي ثابت** يبقى عبر التنقّل: `AudioPlayerProvider`+`PersistentPlayer`+`LecturePlayCard`.
- **أزرار مشاركة** (`ShareButtons`)، **ترقيم الأقسام** (`RevealGrid`: 24 + «تحميل المزيد»)، **مواد ذات صلة** + **مسار مرئي** في صفحة العنصر، **بحث في التفريغ** (`content`).
- **حُذف ثيم ocean** (الكلاسيكي فقط) → أُزيل اعتماد Google Fonts (الخطوط محلية بالكامل). **أُزيل سرّ `AUTH_SECRET` من `deploy.ps1`**.
- **خطوتان معلّقتان على المالك**: (1) تفعيل Web Analytics في لوحة Vercel. (2) توليد `AUTH_SECRET` جديد وتحديثه في Vercel. وعند شراء الدومين: ضبط `NEXT_PUBLIC_SITE_URL` + تسجيل Google Search Console وإرسال الخريطة.

### جلسة 2026-05-30 (الأحدث)
1. **تفضيل دائم: النشر تلقائياً** — المالك طلب نشر أي تعديل مباشرةً دون سؤال: بعد التحقق (`tsc` + عند اللزوم `next build`) نفّذ `git commit` + `git push origin main`. **استثناء**: عند طلبه «اعرضها محلياً قبل النشر» اعمل على فرع ولا تدفع.
2. **لوحة التحكم**: نُقل قسم «المواضيع والبرامج» إلى العمود الأيسر **تحت نموذج «إضافة عنصر جديد»** (في `DashboardClient.tsx`)، مع ترصيص `TopicsManager` عمودياً ليناسب العمود الأضيق.
3. **الوصول إلى Drive + استيراد محتوى جديد** (انظر القسم 8 للأدوات):
   - عبر `gas-export-drive.gs` + `import-batch.mjs`: استُورد **47 صوتي** في مواضيع (`نفحات رمضانية`+26، `أحب الأعمال إلى الله` THEME جديد ×9، `عشر ذي الحجة` THEME جديد ×9، `توجيهات إيمانية`+3) + **1 مرئي**.
   - ثم **26 ملف ogg صوتي**: `كلمات في السلوك` (16، THEME) و`وصايا لقمان لابنه` (10، PROGRAM مرقّم). **ملاحظة**: ogg يُضاف كـ AUDIO؛ تشغيله يعتمد على معاينة Drive (يُستحسن التأكد من تشغيل عيّنة).
   - ثم **كتاب PDF** واحد: «كيف نجعل من بيوتنا سكناً». تُجوهِلت بقية الـPDF (لغات أجنبية/مؤلفون آخرون/ملفات بلا عنوان) بقرار المالك.
4. **دمج الصوتي+المقروء في صفحة واحدة** (ميزة): `merge-audio-written.mjs` — دُمج **133 زوجاً** (نُقل نص المقروء إلى العنصر الصوتي وحُذف المقروء المكرّر). صفحة العنصر `app/item/[id]/page.tsx` تعرض المشغّل أعلى والنص أسفله أصلاً (شرط `showMediaEmbed`). **تنبيه**: روابط 133 صفحة مقروء محذوفة تُرجِع 404.
   - **الظهور في القسمين**: `app/written/page.tsx` عُدّل استعلامه إلى `OR: [{category:WRITTEN},{content غير فارغ}]` فتظهر الصوتيات ذات النص في المقروء أيضاً.
   - **شارة «صوتي + نص»**: في `components/ItemCard.tsx` للعناصر التي `category!=="WRITTEN"` ولها `content`.
5. **تحسين وضوح الأيقونات**: في `CategoryGrid.tsx` و`TopicCard.tsx` صار صندوق الأيقونة `bg-sand` بأيقونة `text-ink` (بدل ذهبي باهت على تدرّج ذهبي).
6. **جُرّبت ورُفضت** (لا أثر لها في الكود): حركات Framer Motion على البطاقات، مشغّل موجة صوتية، مولّد بطاقات اقتباسات. *(تذكير: موجة صوتية تفاعلية حقيقية مع نبرة الصوت غير ممكنة مع iframe Drive الخارجي.)*

### سابقاً
- **رفع المشروع على GitHub** (خاص) و**النشر التلقائي** على Vercel.
- تعديلات واجهة (`Navbar`/`Hero`/`layout`): تبسيط الشريط العلوي، أيقونة رئيسية، عنوان واجهة سطر واحد متمركز.
- **نظام المواضيع والبرامج** (`Topic`/`ItemTopic`/`TopicType`): API `app/api/topics/*`، صفحات `app/topics` و`app/topic/[slug]`، مكوّنات `TopicCard`/`TopicsShowcase`، إدارة من `DashboardClient`. الإسناد يدوي.
- **استيراد برنامج** `scripts/import-program.mjs` + `link-program.mjs` (مثل «توجيهات أسرية»: 105 صوتي + ربط 104 مقالة).

سجل الـcommits الأخير (الأحدث أولاً): `eb8d0b3` (وسم تحقّق Google), `b1b408e` (ربط الدومين), `f1c5c18` (تغيير الاسم + إزالة OG/ذات الصلة + حذف عنصر), `3fc1104` (دفعة UX/أداء), `b009da7` (أساس SEO), `9952f29`, `750ad83`.

---

## 12) تنبيه أمني معلّق (يُنصح بمعالجته)

أُزيلت قيمة `AUTH_SECRET` الصريحة من `deploy.ps1` (تُقرأ الآن من `$env:AUTH_SECRET`). **يبقى مستحسناً**: **توليد مفتاح جديد** (`openssl rand -base64 48`) وتحديثه على Vercel (`AUTH_SECRET` لكل البيئات) — لأن القيمة القديمة بقيت مكشوفة في تاريخ Git. ملاحظة: تغيير `AUTH_SECRET` يُبطل جلسة دخول المسؤول الحالية (يحتاج إعادة تسجيل دخول). هذه خطوة يفعلها المالك في لوحة Vercel.

---

## 13) أوامر مرجعية سريعة

```powershell
$env:PATH = "C:\Program Files\GitHub CLI;$env:PATH"
cd C:\Users\dokhi\Desktop\khalid-aljareesh-archive

npm run dev                       # تطوير محلي (بيانات data/all-items.json)
npx tsc --noEmit                  # فحص الأنواع
git add . ; git commit -m "..." ; git push origin main   # نشر تلقائي
vercel ls khalid-aljareesh-archive                        # حالة عمليات النشر
vercel env pull .env.local                                # سحب متغيّرات الإنتاج للعمل محلياً
gh repo view dokhiel1414/khalid-aljareesh-archive         # معلومات المستودع
```
