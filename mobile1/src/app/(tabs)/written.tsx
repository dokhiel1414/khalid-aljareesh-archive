/**
 * تبويب المقالات — المواد المكتوبة (مقالات وملفات).
 */

import { CategoryCatalog } from "@/features/catalog/CategoryCatalog";

export default function WrittenTab() {
  return <CategoryCatalog category="WRITTEN" />;
}
