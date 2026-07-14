"use client";

import { DOMAINS } from "@/content/corpus";
import { useApp } from "@/components/providers";
import { domainVar } from "@/lib/ui";

/**
 * The five domains as an interactive legend/nav. Clicking a domain enters its
 * focus mode and opens the graph.
 */
export function DomainNav() {
  const { focus, setFocus } = useApp();

  return (
    <div className="flex flex-wrap gap-2">
      {DOMAINS.map((d, i) => {
        const active = focus === d.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => setFocus(active ? null : d.id)}
            className="rise group inline-flex items-center gap-2 rounded-[var(--radius-pill)] border bg-card px-3 py-1.5 text-[0.75rem] transition-colors hover:border-[color:var(--hover)]"
            style={{ 
              ["--hover" as string]: domainVar(d.id), 
              animationDelay: `${0.2 + i * 0.05}s`,
              borderColor: active ? domainVar(d.id) : undefined,
              backgroundColor: active ? `${domainVar(d.id)}10` : undefined,
            }}
            aria-label={`focus: ${d.key} — ${d.desc}`}
          >
            <span
              className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
              style={{ background: domainVar(d.id) }}
              aria-hidden
            />
            <span className="text-[var(--ink)] font-medium">{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}
