import { Suspense } from "react";
import { Search } from "lucide-react";
import SearchBarInner from "./SearchBarInner";

type Props = React.ComponentProps<typeof SearchBarInner>;

function Fallback({ variant }: { variant?: "hero" | "default" }) {
  const isHero = variant === "hero";
  return (
    <div
      className={
        "flex items-center gap-2 rounded-2xl bg-white border shadow-soft " +
        (isHero ? "border-white/30 p-2" : "border-ink/10 p-1.5")
      }
    >
      <div className="pl-3 pr-1 text-ink/40">
        <Search className="h-5 w-5" />
      </div>
      <div className="flex-1 py-2 text-ink/40 text-sm">جاري التحميل…</div>
    </div>
  );
}

export default function SearchBar(props: Props) {
  return (
    <Suspense fallback={<Fallback variant={props.variant} />}>
      <SearchBarInner {...props} />
    </Suspense>
  );
}
