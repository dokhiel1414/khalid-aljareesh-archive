# =====================================================================
#   نشر أرشيف الشيخ خالد الجريسي على Vercel
#   شغّل الملف من PowerShell:   .\deploy.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Write-Step($num, $total, $text) {
  Write-Host ""
  Write-Host "[$num/$total] $text" -ForegroundColor Cyan
  Write-Host ("-" * 60) -ForegroundColor DarkGray
}
function Write-Ok($text)   { Write-Host "  + $text" -ForegroundColor Green }
function Write-Info($text) { Write-Host "  i $text" -ForegroundColor Yellow }

# مفتاح JWT تم توليده مسبقاً (بإمكانك استخدامه كما هو)
$AuthSecret = "TtTZEHPzwVDVld8RXp1E6RHoqR+x7gA3lPIhn837c19WCD2tteE8a+Fa6Db4WZqu"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "   نشر أرشيف الشيخ خالد الجريسي على Vercel" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

# ---------------------------------------------------------------------
Write-Step 1 6 "تسجيل الدخول إلى Vercel"
$whoami = & vercel whoami 2>$null
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($whoami)) {
  Write-Ok "أنت مسجَّل دخول بالفعل كـ: $whoami"
} else {
  Write-Info "سيتم فتح متصفّحك. وافق على تسجيل الدخول ثم عُد إلى هنا."
  vercel login
  if ($LASTEXITCODE -ne 0) { throw "تعذّر تسجيل الدخول إلى Vercel." }
  Write-Ok "تم تسجيل الدخول."
}

# ---------------------------------------------------------------------
Write-Step 2 6 "ربط المجلد بمشروع جديد على Vercel"
if (Test-Path ".\.vercel\project.json") {
  $existing = Get-Content ".\.vercel\project.json" -Raw | ConvertFrom-Json
  Write-Ok "المشروع مربوط بالفعل: $($existing.projectId)"
} else {
  Write-Host ""
  Write-Host "  مهم — انتبه للإجابات التالية:" -ForegroundColor Red
  Write-Info "  - Set up and deploy?           Y  (نعم)"
  Write-Info "  - Which scope?                 اختر حسابك الشخصي"
  Write-Info "  - Link to existing project?    N  (لا — نريد مشروعاً جديداً)"
  Write-Info "  - What's your project's name?  khalid-aljareesh-archive"
  Write-Info "  - In which directory…?         ./   (اضغط Enter)"
  Write-Info "  - Want to modify settings?     N  (لا)"
  Write-Host ""
  vercel link
  if ($LASTEXITCODE -ne 0) { throw "تعذّر ربط المشروع." }
  Write-Ok "تم ربط المشروع."
}

# ---------------------------------------------------------------------
Write-Step 3 6 "رفع متغيّرات المسؤول والمفتاح السرّي"
$adminUser = Read-Host "  اسم المستخدم للمسؤول (مثال: admin)"
if ([string]::IsNullOrWhiteSpace($adminUser)) { throw "اسم المستخدم مطلوب." }

$adminPassSecure = Read-Host "  كلمة مرور المسؤول (لن تظهر أثناء الكتابة)" -AsSecureString
$adminPass = [System.Net.NetworkCredential]::new("", $adminPassSecure).Password
if ([string]::IsNullOrEmpty($adminPass)) { throw "كلمة المرور مطلوبة." }
if ($adminPass.Length -lt 6) {
  Write-Host "  ! تنبيه: كلمة المرور قصيرة جداً (يُفضَّل 8 أحرف فأكثر)." -ForegroundColor Yellow
  $confirm = Read-Host "  هل تريد المتابعة بها؟ (y/N)"
  if ($confirm -ne "y") { throw "أُلغي النشر — أعد التشغيل بكلمة مرور أطول." }
}

function Push-EnvVar($name, $value) {
  # حذف القيمة القديمة إن وجدت (تجاهل الفشل)
  try { "y" | vercel env rm $name production --yes 2>$null | Out-Null } catch {}
  # إضافة القيمة الجديدة لجميع البيئات
  foreach ($envName in @("production","preview","development")) {
    $value | vercel env add $name $envName | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "فشل رفع المتغيّر $name ($envName)" }
  }
  Write-Ok "رُفع $name"
}

Push-EnvVar "ADMIN_USERNAME" $adminUser
Push-EnvVar "ADMIN_PASSWORD" $adminPass
Push-EnvVar "AUTH_SECRET"    $AuthSecret

# ---------------------------------------------------------------------
Write-Step 4 6 "إنشاء قاعدة بيانات Postgres"
Write-Host ""
Write-Host "  افعل الآن في المتصفح:" -ForegroundColor White
Write-Host "  1) افتح لوحة المشروع على Vercel."
Write-Host "  2) Storage  ←  Create Database  ←  Postgres  (اختر الخطة المجانية)."
Write-Host "  3) بعد الإنشاء افتح تبويب  .env.local  وانسخ قيمتي:"
Write-Host "       POSTGRES_PRISMA_URL          ← هذا DATABASE_URL"
Write-Host "       POSTGRES_URL_NON_POOLING     ← هذا DIRECT_URL"
Write-Host ""
Read-Host "  اضغط Enter بعد الانتهاء من إنشاء القاعدة ونسخ القيمتين"

$dbUrl     = Read-Host "  ألصق DATABASE_URL"
$directUrl = Read-Host "  ألصق DIRECT_URL"
if ([string]::IsNullOrWhiteSpace($dbUrl) -or [string]::IsNullOrWhiteSpace($directUrl)) {
  throw "كلا الرابطين مطلوبان."
}

Push-EnvVar "DATABASE_URL" $dbUrl
Push-EnvVar "DIRECT_URL"   $directUrl

# ---------------------------------------------------------------------
Write-Step 5 6 "إنشاء جداول القاعدة (Prisma db push)"
$env:DATABASE_URL = $dbUrl
$env:DIRECT_URL   = $directUrl
npx prisma db push
if ($LASTEXITCODE -ne 0) { throw "فشل تنفيذ prisma db push." }
Write-Ok "تم إنشاء الجداول."

# ---------------------------------------------------------------------
Write-Step 6 6 "النشر إلى الإنتاج"
vercel --prod
if ($LASTEXITCODE -ne 0) { throw "فشل أمر النشر." }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   تم النشر بنجاح" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "افتح الموقع المنشور أعلاه، ثم:" -ForegroundColor White
Write-Host "  - سجّل الدخول من:  <site>/admin/login"
Write-Host "  - وأضف أول محتوى من لوحة التحكم."
Write-Host ""
