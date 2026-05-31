import { Users } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import CommunityGroups from "@/components/CommunityGroups";

export const metadata = {
  title: "مجموعات التواصل",
  description: "انضمّ إلى مجموعات وقنوات خالد بن علي الجريش على واتساب وتيليجرام.",
  alternates: { canonical: "/groups" },
  openGraph: {
    title: "مجموعات التواصل · أرشيف خالد بن علي الجريش",
    description: "انضمّ إلى مجموعات وقنوات خالد بن علي الجريش على واتساب وتيليجرام.",
    url: "/groups",
  },
};

export default function GroupsPage() {
  return (
    <>
      <SectionHeader
        title="مجموعات التواصل"
        description="انضمّ إلى المجموعات والقنوات على واتساب وتيليجرام لتصلك الفوائد والبرامج أولاً بأول."
        icon={Users}
      />
      <section className="container py-10">
        <CommunityGroups />
      </section>
    </>
  );
}
