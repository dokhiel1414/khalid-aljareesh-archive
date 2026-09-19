/**
 * هوية الأرشيف وثوابت الموقع — نقطة واحدة لأي عنوان/اسم.
 * EXPO_PUBLIC_API_BASE_URL متغير عام مقصود (لا يوضع فيه أي سر).
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://k-algrysh.com";

export const SITE_URL = "https://k-algrysh.com";
export const SITE_NAME = "أرشيف خالد بن علي الجريش";
export const SHEIKH_NAME = "خالد بن علي الجريش";

/** المجموعات المجتمعية — نسخة ثابتة من lib/groups.ts في الموقع. */
export type Platform = "whatsapp" | "telegram";
export type GroupLink = { platform: Platform; url: string };
export type CommunityGroup = {
  name: string;
  description?: string;
  /** true = انتهى محتوى المجموعة (شارة «منتهي» وأزرار «للاطلاع»). */
  finished?: boolean;
  links: GroupLink[];
};

export const GROUPS: CommunityGroup[] = [
  {
    name: "الذاكرون الله كثيراً والذاكرات",
    description: "سلسلة الأعمال والأذكار الحصن المتين.",
    finished: true,
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/EoU9CrfiR1jDeCHO5TDbxZ?mode=wwt" },
      { platform: "telegram", url: "https://t.me/+wLRbhKjQFuNmYzBk" },
    ],
  },
  {
    name: "إيمانيات",
    description: "قناة تهتم بالأعمال الإيمانية والسلوكية.",
    finished: true,
    links: [{ platform: "telegram", url: "https://t.me/httpI20" }],
  },
  {
    name: "المتجر الرابح",
    description: "ثلاث رسائل أسبوعياً تحت شعار «علم وعمل».",
    links: [{ platform: "telegram", url: "https://t.me/+ugZOh6cfrB9hZThk" }],
  },
  {
    name: "برامج تربوية إيمانية",
    links: [{ platform: "telegram", url: "https://t.me/tarbawyprograms" }],
  },
  {
    name: "أسرتي أولاً",
    description: "قناة تهتم بشؤون الأسرة: بناءً ووقايةً وعلاجاً.",
    links: [
      { platform: "whatsapp", url: "https://www.whatsapp.com/channel/0029Vaaktl16xCSM6UCXmr1B" },
      { platform: "telegram", url: "https://t.me/t_slok" },
    ],
  },
  {
    name: "نماذج من خوف السلف",
    finished: true,
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/HAMJhtBEybBDT2NXn3OyZA" },
      { platform: "telegram", url: "https://t.me/+jEZAPOu2dsllOWM0" },
    ],
  },
  {
    name: "من كنوز الجنة",
    description:
      "برنامج يعرض أسباب دخول الجنة كما وردت في الكتاب والسنة مع شواهد مشجّعة عليها.",
    finished: true,
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/KDGJx5D0BXg4jsF3vtpypv" },
      { platform: "telegram", url: "https://t.me/+I8jZJTC_Dn5mOWY8" },
    ],
  },
];
