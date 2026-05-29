import ItemCard from "./ItemCard";
import EmptyState from "./EmptyState";

type Item = React.ComponentProps<typeof ItemCard>["item"];

export default function ItemGrid({ items }: { items: Item[] }) {
  if (!items || items.length === 0) return <EmptyState />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
