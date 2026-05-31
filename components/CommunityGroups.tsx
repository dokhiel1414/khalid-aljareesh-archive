import { GROUPS, type Platform } from "@/lib/groups";

const PLATFORM: Record<
  Platform,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  whatsapp: {
    label: "واتساب",
    cls: "bg-[#25D366] text-white hover:brightness-95",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.197zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
      </svg>
    ),
  },
  telegram: {
    label: "تيليجرام",
    cls: "bg-[#229ED9] text-white hover:brightness-95",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
};

/** Grid of community group/channel cards (WhatsApp / Telegram join buttons). */
export default function CommunityGroups() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {GROUPS.map((g) => (
        <article key={g.name} className="card flex flex-col p-5 md:p-6">
          <h3 className="font-display font-bold text-ink dark:text-sand text-lg leading-snug">
            {g.name}
          </h3>
          {g.description && (
            <p className="mt-2 text-sm text-muted leading-relaxed">{g.description}</p>
          )}
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {g.links.map((l) => {
              const p = PLATFORM[l.platform];
              return (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-soft transition ${p.cls}`}
                >
                  {p.icon}
                  انضمام عبر {p.label}
                </a>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
