/**
 * اختبار دخاني لعارض HTML الأصلي — تحويل بنية المقال إلى مكونات أصلية.
 * (render في RNTL 14 غير متزامن — كل الاستدعاءات تُنتظر.)
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-image", () => {
  const { View } = require("react-native");
  return { Image: View };
});

import { render } from "@testing-library/react-native";

import { HtmlView } from "@/components/article/HtmlView";
import { ThemeProvider } from "@/theme/ThemeProvider";

function renderArticle(html: string) {
  return render(
    <ThemeProvider>
      <HtmlView html={html} />
    </ThemeProvider>,
  );
}

describe("HtmlView", () => {
  it("يعرض الفقرات والعناوين كنص أصلي", async () => {
    const { getByText } = await renderArticle("<h2>عنوان المقال</h2><p>نص الفقرة الأولى</p>");
    expect(getByText("عنوان المقال")).toBeTruthy();
    expect(getByText("نص الفقرة الأولى")).toBeTruthy();
  });

  it("يعرض القوائم المنقطة والمرقمة", async () => {
    const { getByText } = await renderArticle(
      "<ul><li>الأول</li><li>الثاني</li></ul><ol><li>مرقم</li></ol>",
    );
    expect(getByText("الأول")).toBeTruthy();
    expect(getByText("الثاني")).toBeTruthy();
    expect(getByText("مرقم")).toBeTruthy();
  });

  it("يعرض التنسيقات السطرية بلا كسر", async () => {
    const { getByText } = await renderArticle("<p>قبل <strong>غامق</strong> بعد</p>");
    expect(getByText("غامق")).toBeTruthy();
  });

  it("يتجاهل HTML فارغاً أو تالفاً بهدوء", async () => {
    await expect(renderArticle("")).resolves.toBeTruthy();
    await expect(renderArticle("<<<غير صالح")).resolves.toBeTruthy();
  });
});
