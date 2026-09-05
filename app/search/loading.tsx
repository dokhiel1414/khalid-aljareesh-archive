import { Search as SearchIcon } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { SearchLoading } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <SectionHeader
        title="البحث في الأرشيف"
        description="ابحث بالكلمة المفتاحية، أو فلتر بالقسم والتاريخ."
        icon={SearchIcon}
      />
      <SearchLoading />
    </>
  );
}
