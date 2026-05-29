import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="gradient-hero text-sand relative overflow-hidden">
      <div className="absolute inset-0 arabesque opacity-[0.07]" aria-hidden />
      <div className="container relative py-16 md:py-24">
        <div className="text-center animate-fade-up">
          <h1 className="font-display text-[clamp(1rem,4.7vw,3rem)] font-bold tracking-tight whitespace-nowrap">
            مكتبة الشيخ <span className="text-gold">خالد بن علي الجريش</span> الرقمية
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-sand/80 md:text-lg leading-relaxed">
            محاضرات ودروس ومقالات في مكان واحد —
            استمع، شاهد، واقرأ بكل سهولة وفي أي وقت.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
