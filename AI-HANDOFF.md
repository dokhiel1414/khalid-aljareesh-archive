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

- الموقع الحيّ: **https://khalid-aljareesh-archive.vercel.app**
- لوحة تحكم المسؤول: `/admin/login`
- عدد العناصر الحالي: ~200 (≈125 صوتي، 38 مرئي، 37 مقالة/كتاب).

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

> **مهم — ترحيل قاعدة البيانات يتم في البناء**: سكربت البناء أصبح
> `prisma generate && prisma db push --skip-generate && next build`. السبب: متغيّرات
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
الموقع الإنتاجي الثابت: `https://khalid-aljareesh-archive.vercel.app`.

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

1. **رفع المشروع على GitHub** (مستودع خاص) و**ربطه بالنشر التلقائي** على Vercel.
2. تعديلات واجهة في `components/Navbar.tsx` و`components/Hero.tsx` و`app/layout.tsx`:
   - إزالة روابط التنقل من الشريط العلوي، وإضافة **أيقونة الرئيسية** بجانب البحث وزر الثيم.
   - إزالة وسم «الأرشيف الرقمي»، واختصار وصف الواجهة، وإزالة أزرار الأقسام أسفل مربع البحث.
   - جعل عنوان الواجهة «مكتبة الشيخ … الرقمية» **سطراً واحداً ومتمركزاً** على كل الأحجام (أُزيل قيد `max-w-3xl` عن العنوان واستُخدم حجم خط مرن `clamp`).
   - على **الجوال**: عنوان الاسم في الشريط العلوي صار سطراً واحداً (`whitespace-nowrap` + خط 13px) مع إخفاء العنوان الفرعي على الشاشات الصغيرة. الكمبيوتر دون تغيير.

3. **نظام المواضيع والبرامج** (ميزة كبيرة): تصنيف المحتوى عبر أنواع الوسائط.
   - النماذج `Topic`/`ItemTopic` + `TopicType` (انظر القسم 7).
   - API: `app/api/topics/route.ts` و`app/api/topics/[id]/route.ts`؛ وربط المواضيع في POST/PUT للعناصر (الحمولة `topics: {topicId, episodeOrder?}[]`، تُحلَّل عبر `lib/topics.ts`).
   - صفحات عامة: `app/topics/page.tsx` (قائمة) و`app/topic/[slug]/page.tsx` (فلتر فرعي بنوع الوسيط + ترتيب حلقات البرامج). مكوّنات `TopicCard`, `TopicsShowcase`.
   - صفحة العنصر `app/item/[id]/page.tsx`: شارات المواضيع + تنقّل الحلقة السابقة/التالية للبرامج.
   - لوحة التحكم `DashboardClient.tsx`: قسم إدارة المواضيع (`TopicsManager`/`TopicRow`) + مُحدِّد المواضيع (`TopicSelector`) في نموذج الإضافة ونافذة التعديل.
   - الإسناد **يدوي** من لوحة التحكم (لا سكربت اقتراح تلقائي).
4. **استيراد جماعي لبرنامج** عبر Google Drive: `scripts/import-program.mjs` + manifest في `scripts/manifests/` (مثل `tawjihat.json` بصيغة `[{id,title,category,ep}]`). متكرّر الأمان: يتجاهل المكرّر (بمعرّف Drive أو بالعنوان المُطبَّع) والمحذوف، ينشئ الناقص ويربط الموجود بالبرنامج مع رقم الحلقة، وينشئ البرنامج إن لم يوجد. **طريقة التشغيل (لأن متغيّرات بيئة Vercel تُحقن فارغة هنا):** مرّر مفتاح المنفست كوسيط في سكربت البناء مؤقتاً `node scripts/import-program.mjs <key> && next build`، ادفع لينفّذ أثناء البناء، تحقّق من سجل البناء (`vercel inspect --logs`)، ثم أعِد سكربت البناء لحالته بإزالة الوسيط. تم بهذه الطريقة استيراد برنامج «توجيهات أسرية» (105 صوتي جديد + ربط 104 مقالة موجودة).
   - **تنبيه**: لتشغيل/معاينة الوسائط على الموقع يجب أن تكون ملفات Drive مشارَكة «لأي شخص لديه الرابط».
   - معرّفات Drive للملفات «المتاحة عبر الإنترنت فقط» لا تُقرأ محلياً؛ استُخرجت عبر سكربت Google Apps Script يسرد المجلد ({name,id}).

سجل الـcommits الأخير (الأحدث أولاً): `a44e383`, `db01c55`, `1656909`, `2593ef2`, `91eb353`, `9ee840b`, `1042a78 (الأولي)`.

---

## 12) تنبيه أمني معلّق (يُنصح بمعالجته)

ملف `deploy.ps1` (السطر ~18) يحتوي قيمة `AUTH_SECRET` مكتوبة صراحةً. المستودع خاص فالخطر محدود، لكن يُفضّل: **توليد مفتاح جديد**، تحديثه على Vercel (`AUTH_SECRET` لكل البيئات)، وإزالة القيمة الصريحة من الملف. ملاحظة: تغيير `AUTH_SECRET` يُبطل جلسات تسجيل دخول المسؤول الحالية (يحتاج إعادة تسجيل دخول).

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
