import { Mail } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ContactForm from "./ContactForm";

export const metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  return (
    <>
      <SectionHeader
        title="تواصل معنا"
        description="نسعد بسماع ملاحظاتك واقتراحاتك."
        icon={Mail}
      />
      <section className="container py-10">
        <div className="max-w-3xl mx-auto">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
