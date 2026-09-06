import { LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import { OrnamentDivider } from "./ui/ornaments";

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
        <div className="absolute inset-0 pattern-geo opacity-[0.10]" aria-hidden />
        <Reveal className="relative">
          <div className="flex items-center gap-4">
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
          <OrnamentDivider className="mt-6 max-w-md opacity-90" />
        </Reveal>
      </div>
    </div>
  );
}
