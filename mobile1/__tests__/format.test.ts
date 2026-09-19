/**
 * اختبارات أدوات التنسيق — الأرقام العربية، المدد، الأحجام، الأسماء المعرّبة.
 */

import {
  formatBytes,
  formatDuration,
  formatEpisodeLabel,
  formatViews,
  itemNoun,
  toArabicDigits,
} from "@/utils/format";

describe("toArabicDigits", () => {
  it("يحوّل الأرقام الغربية إلى عربية", () => {
    expect(toArabicDigits("1234567890")).toBe("١٢٣٤٥٦٧٨٩٠");
    expect(toArabicDigits(42)).toBe("٤٢");
  });

  it("يترك النصوص غير الرقمية كما هي", () => {
    expect(toArabicDigits("الحلقة 5")).toBe("الحلقة ٥");
  });
});

describe("formatDuration", () => {
  it("يهيئ المدد بصفر بادئ", () => {
    expect(formatDuration(0)).toBe("٠٠:٠٠");
    expect(formatDuration(65)).toBe("٠١:٠٥");
    expect(formatDuration(605)).toBe("١٠:٠٥");
  });

  it("يضيف الساعات عند الحاجة", () => {
    expect(formatDuration(3661)).toBe("١:٠١:٠١");
    expect(formatDuration(5400)).toBe("١:٣٠:٠٠");
  });

  it("يعالج القيم غير الصالحة بأمان", () => {
    expect(formatDuration(-5)).toBe("٠٠:٠٠");
    expect(formatDuration(NaN)).toBe("٠٠:٠٠");
  });
});

describe("formatViews / formatBytes", () => {
  it("يهيئ عدد المشاهدات", () => {
    expect(formatViews(1234)).toBe("١٢٣٤ مشاهدة");
  });

  it("يهيئ أحجام الملفات بالوحدات", () => {
    expect(formatBytes(0)).toBe("٠ بايت");
    expect(formatBytes(512)).toBe("٥١٢ بايت");
    expect(formatBytes(1024)).toBe("١ ك.ب");
    // القيم ≥ 10 تُقرَّب إلى عدد صحيح (تصميم مقصود لصفاء العرض).
    expect(formatBytes(13_000_000)).toBe("١٢ م.ب");
    expect(formatBytes(5.5 * 1024 * 1024)).toBe("٥٫٥ م.ب");
  });
});

describe("itemNoun", () => {
  it("يراعي العدد ١/٢/جمع", () => {
    expect(itemNoun("AUDIO", 1)).toBe("صوتية");
    expect(itemNoun("AUDIO", 2)).toBe("صوتيتان");
    expect(itemNoun("AUDIO", 5)).toBe("٥ صوتيات");
    expect(itemNoun("WRITTEN", 20)).toBe("٢٠ مقالات");
  });
});

describe("formatEpisodeLabel", () => {
  it("يهيئ رقم الحلقة مع العدد الإجمالي", () => {
    expect(formatEpisodeLabel(3)).toBe("الحلقة ٣");
    expect(formatEpisodeLabel(3, 12)).toBe("الحلقة ٣ من ١٢");
  });
});
