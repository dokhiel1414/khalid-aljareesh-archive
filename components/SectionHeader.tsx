import { LucideIcon } from "lucide-react";

export default function SectionHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="gradient-hero text-sand">
      <div className="container py-12 md:py-16 relative">
        <div className="absolute inset-0 arabesque opacity-[0.06]" aria-hidden />
        <div className="relative flex items-center gap-4">
          {Icon && (
            <div className="h-14 w-14 rounded-2xl bg-sand grid place-items-center border border-gold shadow-card">
              <Icon className="h-7 w-7 text-ink" strokeWidth={2.25} />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
            {description && (
              <p className="mt-1 text-sand/75 text-sm md:text-base">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
