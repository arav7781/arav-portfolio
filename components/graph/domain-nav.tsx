"use client";

import { useRouter } from "next/navigation";
import { DOMAINS } from "@/content/corpus";
import { useApp } from "@/components/providers";
import { domainVar } from "@/lib/ui";

/**
 * The six domains as a legend/nav on the hero's dark floor. Clicking one enters that
 * domain's focus mode and opens the knowledge graph on it (the focus lives in AppProvider,
 * which survives the client-side navigation).
 */
export function DomainNav() {
  const { setFocus } = useApp();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {DOMAINS.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => {
            setFocus(d.id);
            router.push("/graph");
          }}
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[0.78rem] text-[#d8d2c8] transition-colors duration-300 hover:border-[color:var(--hover)] hover:text-[#f4f1ec]"
          style={{ ["--hover" as string]: domainVar(d.id) }}
          aria-label={`Open the knowledge graph focused on ${d.label}`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
            style={{ background: domainVar(d.id) }}
            aria-hidden
          />
          {d.label}
        </button>
      ))}
    </div>
  );
}
