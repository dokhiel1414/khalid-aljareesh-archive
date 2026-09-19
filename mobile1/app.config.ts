import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * تطبيق أرشيف الجريش — إعداد Expo المركزي.
 * الهوية البصرية: حبر #072C49 / ذهبي #DEA470 / رمل #ECE6DD (انظر src/theme/tokens.ts).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "أرشيف الجريش",
  slug: "k-aljareesh-archive",
  scheme: "kalgrysh",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  backgroundColor: "#06223A",
  // البنية الجديدة إلزامية في SDK 57 / RN 0.86 — لا حاجة لأي تفعيل.
  android: {
    package: "com.kalgrysh.archive",
    versionCode: 1,
    // Edge-to-edge مفعّل افتراضياً في RN 0.86 (android.edgeToEdgeEnabled=true) — بلا مكتبة.
    // زر الرجوع التنبؤي (Predictive Back) على أندرويد 14+.
    predictiveBackGestureEnabled: true,
    // روابط التطبيق (App Links): الروابط https://k-algrysh.com/item/... و /topic/...
    // تفتح داخل التطبيق (يُتحقق منها عبر assetlinks.json المنشور على الموقع).
    intentFilters: [
      {
        autoVerify: true,
        action: "VIEW",
        data: [
          { scheme: "https", host: "k-algrysh.com", pathPrefix: "/item" },
          { scheme: "https", host: "k-algrysh.com", pathPrefix: "/topic" },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/adaptive-icon-mono.png",
      backgroundColor: "#072C49",
    },
    // شريط الحالة: يُضبط وقت التشغيل في التخطيط الجذر (expo-status-bar) — دائم light.
    // شريط التنقل السفلي: عبر مكوّن expo-navigation-bar الإضافي (انظر plugins أدناه).
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#06223A",
        image: "./assets/images/splash-icon.png",
        imageWidth: 180,
        dark: {
          backgroundColor: "#06223A",
          image: "./assets/images/splash-icon.png",
        },
      },
    ],
    // تضمين الخطوط أصلياً وقت البناء (بدون تحميل وقت التشغيل).
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/thmanyahserifdisplay-Light.otf",
          "./assets/fonts/thmanyahserifdisplay-Regular.otf",
          "./assets/fonts/thmanyahserifdisplay-Medium.otf",
          "./assets/fonts/thmanyahserifdisplay-Bold.otf",
          "./assets/fonts/thmanyahserifdisplay-Black.otf",
          "./assets/fonts/traditional-arabic-morph.ttf",
        ],
      },
    ],
    // التشغيل الصوتي في الخلفية + إشعار الوسائط وشاشة القفل.
    ["expo-audio", { enableBackgroundPlayback: true }],
    "expo-video",
    // شريط تنقل سفلي داكن متناسق مع هوية التطبيق (edge-to-edge).
    [
      "expo-navigation-bar",
      { backgroundColor: "#06223A", style: "light-content" },
    ],
    // بنية جاهزة للإشعارات — لا يُطلب إذن الإشعارات عند أول تشغيل.
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#DEA470",
        defaultChannel: "default",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
