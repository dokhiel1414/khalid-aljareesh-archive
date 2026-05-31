// Community groups/channels (WhatsApp / Telegram) shown on /groups.
// Edit this list to add, remove, or update a group — no database needed.

export type Platform = "whatsapp" | "telegram";

export type GroupLink = { platform: Platform; url: string };

export type CommunityGroup = {
  name: string;
  description?: string;
  links: GroupLink[];
};

export const GROUPS: CommunityGroup[] = [
  {
    name: "الذاكرون الله كثيراً والذاكرات",
    description: "سلسلة الأعمال والأذكار الحصن المتين.",
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/EoU9CrfiR1jDeCHO5TDbxZ?mode=wwt" },
      { platform: "telegram", url: "https://t.me/+wLRbhKjQFuNmYzBk" },
    ],
  },
  {
    name: "إيمانيات",
    description: "قناة تهتم بالأعمال الإيمانية والسلوكية.",
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
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/HAMJhtBEybBDT2NXn3OyZA" },
      { platform: "telegram", url: "https://t.me/+jEZAPOu2dsllOWM0" },
    ],
  },
  {
    name: "من كنوز الجنة",
    description:
      "برنامج يعرض أسباب دخول الجنة كما وردت في الكتاب والسنة مع شواهد مشجّعة عليها.",
    links: [
      { platform: "whatsapp", url: "https://chat.whatsapp.com/KDGJx5D0BXg4jsF3vtpypv" },
      { platform: "telegram", url: "https://t.me/+I8jZJTC_Dn5mOWY8" },
    ],
  },
];
