import { Icon } from "@/components/ui/Icon";
import type { FaqItem } from "@/lib/content";

interface FaqListProps {
  id: string;
  items: FaqItem[];
}

/** Perguntas frequentes como painéis expansíveis (Material 3), sem JavaScript. */
export function FaqList({ id, items }: FaqListProps) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-display text-[1.75rem] font-normal leading-tight sm:text-[2rem]">
        Perguntas frequentes
      </h2>
      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-m-lg bg-md-surface-low transition-colors open:bg-md-surface-container [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="state-layer flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-m-lg px-5 py-4 font-medium">
              {item.question}
              <Icon name="chevronDown" className="size-5 shrink-0 text-md-on-surface-variant transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-md-on-surface-variant">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
