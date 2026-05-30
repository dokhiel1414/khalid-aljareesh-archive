import Link from "next/link";
import VisitCounter from "./VisitCounter";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-ink/10 dark:border-dark-border bg-ink dark:bg-dark-bg text-sand/90">
      <div className="container py-10 grid gap-8 md:grid-cols-2">
        <div>
          <div className="font-display font-bold text-gold text-lg">
            الشيخ خالد بن علي الجريش
          </div>
          <p className="mt-2 text-sm text-sand/70 leading-relaxed">
            أرشيف رقمي يجمع المحاضرات والدروس الصوتية والمرئية والكتابات
            للاستفادة العامة، نسعى لتقديمه بأبسط وأرقى صورة.
          </p>
          <div className="mt-4">
            <VisitCounter />
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-gold mb-3">روابط</div>
          <ul className="space-y-2 text-sm text-sand/80">
            <li><Link href="/audio" className="hover:text-gold">الصوتيات</Link></li>
            <li><Link href="/video" className="hover:text-gold">المرئيات</Link></li>
            <li><Link href="/written" className="hover:text-gold">المقالات</Link></li>
            <li><Link href="/topics" className="hover:text-gold">المواضيع والبرامج</Link></li>
            <li><Link href="/search" className="hover:text-gold">بحث</Link></li>
            <li><Link href="/contact" className="hover:text-gold">تواصل معنا</Link></li>
            <li><Link href="/terms" className="hover:text-gold">الأحكام والشروط</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/10">
        <div className="container py-4 text-center text-xs text-sand/60">
          {year} · أرشيف الشيخ خالد بن علي الجريش — المحتوى متاح للنشر والاستفادة لكل مسلم
        </div>
      </div>
    </footer>
  );
}
