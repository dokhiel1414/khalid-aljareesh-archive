import { ScrollText } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

export const metadata = { title: "الأحكام والشروط" };

export default function TermsPage() {
  return (
    <>
      <SectionHeader
        title="الأحكام والشروط"
        description="يرجى قراءة هذه الشروط والأحكام قبل استخدام الموقع."
        icon={ScrollText}
      />

      <section className="container py-10 md:py-14">
        <div className="max-w-3xl mx-auto bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border rounded-2xl shadow-soft p-6 md:p-10 leading-loose text-ink dark:text-sand">
          <p className="mb-8 text-lg leading-loose">
            السلام عليكم ومرحباً بكم في موقع الشيخ خالد بن علي الجريش. يرجى
            قراءة هذه الشروط والأحكام بعناية قبل استخدام الموقع. باستخدامك
            الموقع فإنك توافق على هذه الشروط والأحكام بالكامل، وإن لم توافق
            عليها فلا يُسمح لك باستخدام الموقع.
          </p>

          <Section number="١" title="المحتوى">
            <Item id="1.1">
              يحتوي موقع محتوى إسلامي على مقالات ومحاضرات ودروس ومقاطع
              فيديو ومقاطع صوتية وغيرها من المحتويات المتعلقة بالإسلام.
            </Item>
            <Item id="1.2">
              يتم توفير هذا المحتوى لأغراض معلوماتية وتعليمية فقط ولا يجوز
              استخدامه لأي أغراض تجارية.
            </Item>
            <Item id="1.3">
              نحتفظ بالحق في تعديل أو إزالة المحتوى في أي وقت دون إشعار مسبق.
            </Item>
          </Section>

          <Section number="٢" title="الاستخدام">
            <Item id="2.1">
              يجب استخدام الموقع ومحتواه وفقاً للقوانين واللوائح المعمول
              بها في بلدك.
            </Item>
            <Item id="2.2">
              يجب استخدام المحتوى على الموقع بمسؤولية تجاه النفس والآخرين.
            </Item>
          </Section>

          <Section number="٣" title="الخصوصية">
            <Item id="3.1">
              نحن نحترم خصوصية مستخدمينا ونجمع فقط المعلومات الضرورية لتقديم
              الخدمات.
            </Item>
            <Item id="3.2">
              لن يتم مشاركة المعلومات الشخصية التي يتم جمعها من المستخدمين
              مع أي جهة خارجية ما لم يكن ذلك مطلوباً بموجب القانون.
            </Item>
            <Item id="3.3">
              نحن نتخذ تدابير معقولة لحماية المعلومات الشخصية لمستخدمينا.
            </Item>
          </Section>

          <div className="mt-10 pt-6 border-t border-ink/10 dark:border-dark-border text-sm text-muted text-center">
            باستمرارك في تصفّح الموقع فإنك تقرّ بقراءتك لهذه الشروط وقبولها.
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="flex items-center gap-3 font-display text-xl md:text-2xl font-bold text-ink dark:text-sand mb-4">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-gold/20 text-brown dark:text-gold border border-gold/40 text-base">
          {number}
        </span>
        {title}
      </h2>
      <ul className="space-y-3 ps-2 border-r-2 border-gold/40 pr-4">
        {children}
      </ul>
    </section>
  );
}

function Item({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 text-xs text-brown dark:text-gold font-medium mt-1.5 tabular-nums">
        {id}
      </span>
      <span className="leading-loose">{children}</span>
    </li>
  );
}
