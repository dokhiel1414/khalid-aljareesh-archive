# أرشيف الجريش — تطبيق أندرويد أصلي

تطبيق موبايل أصلي (Expo + React Native) لمكتبة الشيخ **خالد بن علي الجريش** الرقمية — وليس غلاف WebView. مبني من منظور الموبايل أولاً، ويتصل ببيانات الموقع الحي [k-algrysh.com](https://k-algrysh.com) مع ذاكرة تخزين مؤقت تعمل دون إنترنت.

- **Expo SDK 57** · React Native 0.86 (New Architecture فقط) · React 19
- **الواجهة**: RTL عربية كاملة (I18nManager)، خط ThmanyahSerif، تصميم داكن/فاتح
- **الصوت**: `expo-audio` — مشغّل واحد عام يبقى عبر الشاشات، تشغيل خلفي، إشعار وسائط أندرويد، تحكم من شاشة القفل، سرعات (0.75–2×)، ±15 ثانية، حفظ موضع الاستماع
- **الفيديو**: `expo-video` مع تحكم أصلي وPiP؛ روابط YouTube تفتح في تطبيق يوتيوب/المتصفح
- **المقالات**: عارض HTML أصلي في RN بخط TradArabicMorph وضبط حجم الخط
- **الحزمة**: `com.kalgrysh.archive` · المخطط: `kalgrysh://` · روابط التطبيق: `https://k-algrysh.com/item/…` و`/topic/…`

---

## التشغيل

المتطلبات: Node ≥ 22، Android Studio (JDK 21 داخل JBR)، Android SDK (platform 36، NDK 27.1.12297006).

```bash
cd mobile1
npm install
npx expo start            # تشغيل Metro
npx expo run:android      # بناء + تثبيت على جهاز/محاكي متصل
```

> على Windows تأكد من المتغيرات قبل أي بناء:
> `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr` و
> `ANDROID_HOME=C:\Users\<user>\AppData\Local\Android\Sdk`

### متغيرات البيئة

| المتغير | الوصف |
|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | عنوان الموقع/الواجهة الخلفية. افتراضي `https://k-algrysh.com`. **عام مقصود — لا يوضع فيه أي سر.** |

لا يحتاج التطبيق أي أسرار خادم: لا قاعدة بيانات مباشرة ولا Prisma — كل البيانات عبر واجهات الموقع العامة.

## البناء (APK / AAB)

**البناء المحلي (APK موقّع للاختبار):**

```bash
npx expo prebuild --platform android    # توليد المجلد الأصلي (خارج git — يُعاد توليده)
```

- انسخ مفتاح التوقيع إلى `mobile1/keystore/release.keystore` وأنشئ `android/keystore.properties` بالصيغة:
  ```properties
  storeFile=../../keystore/release.keystore
  storePassword=...
  keyAlias=kjarchive
  keyPassword=...
  ```
  (الملفان **خارج git** — راجع `.gitignore`).
- `android/gradle.properties` مهيأ مسبقاً لقيم مثبتة على Windows (CMake 3.31.6، Kotlin in-process، `parallel=false` لتعارض worklets، ذاكرة 4G).

```bash
cd android && ./gradlew assembleRelease
# الناتج: android/app/build/outputs/apk/release/app-release.apk
```

**البناء عبر EAS (AAB لمتجر Play):**

```bash
npx eas-cli build --profile production   # يتطلب حساب Expo وتسجيل دخول
```

`eas.json` جاهز بثلاثة ملفات: `development` (dev client)، `preview` (APK داخلي)، `production` (AAB بترقيم تلقائي).

## الاختبارات وضوابط الجودة

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest (وحدة)
npx expo-doctor     # فحص سلامة التبعيات
```

- اختبارات وحدة لمصفّفي الأرقام/المدد العربية، روابط Drive/YouTube، عميل API (مهلة/إعادة/إلغاء)، مخزن المكتبة (مفضلة/سجل/بحث أخير)، عارض HTML.
- **Maestro** للتدفقات الحرجة: `maestro test .maestro/` على جهاز/محاكي يعمل بالتطبيق المثبّت (7 تدفقات: الرئيسية، التبويبات، التشغيل، البحث، التفاصيل، المواضيع، الوضع الداكن).
- CI في `.github/workflows/mobile1-ci.yml` (typecheck + lint + jest + expo-doctor عند أي تغيير في `mobile1/**`).

## البنية المعمارية

```
mobile1/
├── app.config.ts            # تكوين Expo: الهوية، الأيقونات، الروابط، المكوّنات الإضافية
├── eas.json                 # ملفات EAS (development/preview/production)
├── index.ts                 # نقطة الدخول — يفرض RTL قبل تشغيل Expo Router
├── src/
│   ├── app/                 # المسارات فقط (Expo Router): (tabs)، item/[id]، topic/[slug]، player…
│   ├── components/          # مكونات واجهة عامة (بطاقات، قوائم، حالات، زخارف، article/)
│   ├── features/            # audio (مشغّل + شريط مصغّر)، video، catalog
│   ├── services/            # downloads، artwork، linking، notifications…
│   ├── api/                 # عميل مركزي (مهلة/إعادة/إلغاء) + seed + client
│   ├── hooks/               # queryHooks (TanStack Query + persist)
│   ├── store/               # zustand: المشغّل، المكتبة، الإعدادات، البحث
│   ├── theme/               # tokens.ts — مصدر الألوان/المسافات/الخطوط الوحيد
│   ├── constants/           # site.ts (API_BASE_URL + أسماء الموقع)
│   ├── data/                # seed.json — بيانات مدمجة للعمل دون إنترنت
│   ├── types/               # نماذج مشتركة من عقود API للموقع
│   └── utils/               # format (أرقام/هجري)، haptics، rtl…
├── assets/                  # الخطوط والأيقونات والصورة الافتتاحية
└── __tests__/               # اختبارات Jest
```

- **البيانات**: TanStack Query v5 مع تخزين دائم (AsyncStorage) — آخر بيانات معروفة تعمل دون إنترنت؛ القوائم والمواضيع والصفحات تُخزَّن مؤقتاً؛ الوسائط لا تُدَّعى متاحة دون إنترنت إلا إذا حُمِّلت فعلاً (تنزيل عبر expo-file-system مع تحقق من الملف قبل التشغيل).
- **واجهات API المستخدمة** (كلها موجودة مسبقاً في الموقع — لم يتطلب أي تعديل): `/api/items`، `/api/items/[id]`، `/api/items/[id]/view`، `/api/search`، `/api/topics`، `/api/topics/[id]`، `/api/stream?id=` (Range/206)، `/api/contact`.
- **الصوت**: مشغّل واحد عام (zustand) يعمل فوق كل الشاشات؛ الشريط المصغّر فوق شريط التبويبات مباشرة وشاشة مشغّل كاملة.
- **التنزيل**: تحميل صوتيات مع تقدم/إيقاف/حذف وعرض الحجم المستهلك وشارة «غير متصل»، مع تجريد مصدر بعيد/محلي.
- **التخزين المحلي**: المفضلة، السجل (آخر استماع/استكمال)، موضع كل صوتية، عمليات البحث الأخيرة — دون حسابات مستخدمين في v1.
- **الإشعارات**: البنية جاهزة، **لا يُطلب إذن إشعارات عند أول تشغيل**.
- **إمكانية الوصول**: TalkBack عبر `accessibilityRole/Label/State`، أهداف لمس ≥48dp، دعم تكبير الخط (بدون ارتفاعات ثابتة)، احترام تقليل الحركة، تباين ألوان، والزخارف خارج شجرة إمكانية الوصول.

## قرارات وقيود موثقة

0. **البناء على مسار عربي في Windows**: إذا كان مسار المشروع يحتوي حروفاً عربية (مثل `مجلدات سطح المكتب`)، يرفضه AGP ويُفسد خيط Kotlin ترميز المسارات. الحل المعتمد على هذه الآلة:
   1. إعداد عام لمرة واحدة في `C:\Users\<user>\.gradle\gradle.properties`: `kotlin.compiler.execution.strategy=in-process`.
   2. نسخ `mobile1` إلى مسار لاتيني مؤقت (`tar` مع استثناء node_modules/.expo/android)، ثم `npm ci` و`npx expo prebuild` وإعادة تطبيق إعدادات التوقيع، ثم `./gradlew assembleRelease` منه، ونسخ الـ APK الناتج إلى جذر المستودع. البناء في هذا المستودع نفسه يعمل بنفس الطريقة إذا كان المسار لاتينياً.
1. **تبويبات JS بدل NativeTabs**: `NativeTabs` ما زال غير مستقر في SDK 57، وتبويبات JS المستقرة هي التي تسمح بوضع الشريط المصغّر الدائم فوق شريط التبويبات.
2. **PDF عبر عارض النظام**: لا يوجد عارض PDF أصلي موثوق متوافق مع New Architecture؛ يُنزَّل الملف إلى الكاش ويُفتح في عارض النظام عبر `expo-intent-launcher` (WebView خيار أخير موثق فقط).
3. **روابط YouTube**: فتح عميق لتطبيق يوتيوب/المتصفح بدل WebView ملء الشاشة (أفضل تجربة وأخف حجماً).
4. **Seed مدمج**: `src/data/seed.json` نسخة من بيانات الموقع وقت التصدير — يعمل التطبيق أول تشغيل دون إنترنت ثم يتحدث من الواجهة الحية.
5. **أيقونة وشعار مؤقتان**: الأيقونة والواجهة الافتتاحية زخرفة هندسية مؤقتة (نجمة ثمانية ذهبية على خلفية ink) — ليست شعاراً نهائياً ويجب استبدالها عند اعتماد شعار رسمي.
6. **المجلد الأصلي خارج git**: `android/` يُولَّد عبر `expo prebuild` (نهج CNG) — أي تعديل يدوي عليه يُعاد تطبيقه بعد كل prebuild.
7. **التوقيع**: مفتاح الإصدار **غير مرفوع للمستودع** (نسخة محلية في `mobile1/keystore/`). للنشر على متجر Play يتطلب: حساب مطوّر Google، تسجيل دخول Expo، ثم `eas build --profile production` وتحميل الـ AAB. بدون ذلك لا يمكن إكمال النشر من هذه البيئة.
8. **روابط التطبيق**: `public/.well-known/assetlinks.json` في الموقع يحمل بصمة مفتاح الإصدار المحلي — تعمل الروابط العميقة بعد نشر الموقع.
9. **التحقق على محاكي/جهاز**: بيئة هذا الجهاز لم تشمل محاكي أندرويد، فاختبارات Maestro مكتوبة وجاهزة لكنها لم تُنفَّذ — شغّلها على أول جهاز/محاكي متاح.

## الأمان

- لا يوجد في التطبيق: `DATABASE_URL`، `DIRECT_URL`، `AUTH_SECRET`، `ADMIN_PASSWORD`، `ADMIN_USERNAME` — ولا أي اتصال بـ Prisma أو نسخ لبيانات لوحة الإدارة (اللوحة تبقى Web-only).
- `EXPO_PUBLIC_*` عامة بطبيعتها ولا تحمل أسراراً.
