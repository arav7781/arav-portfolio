"use client";

import { useState } from "react";
import { IconX } from "@/components/icons";

function Swatch({ children }: { children: React.ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      {children}
    </svg>
  );
}

const ROWS: { swatch: React.ReactNode; label: string; desc: string }[] = [
  {
    swatch: <circle cx="8" cy="8" r="7" fill="var(--ink)" />,
    label: "me",
    desc: "the center — click for my intro",
  },
  {
    swatch: <circle cx="8" cy="8" r="6.5" fill="var(--c-ai)" />,
    label: "domain",
    desc: "a field I work in (6 total)",
  },
  {
    swatch: <circle cx="8" cy="8" r="5" fill="var(--c-web)" />,
    label: "project",
    desc: "something I built → its domain(s)",
  },
  {
    swatch: <circle cx="8" cy="8" r="5.5" fill="var(--surface)" stroke="var(--c-cv)" strokeWidth="2" />,
    label: "experience",
    desc: "a role / where I built it",
  },
  {
    swatch: <circle cx="8" cy="8" r="6" fill="var(--c-ach)" />,
    label: "achievement",
    desc: "a win or recognition",
  },
  {
    swatch: <circle cx="8" cy="8" r="5.5" fill="var(--surface)" stroke="var(--c-web)" strokeWidth="1.6" strokeDasharray="2.4 2.2" />,
    label: "cross-domain",
    desc: "work bridging two domains",
  },
  {
    swatch: <circle cx="8" cy="8" r="3.5" fill="var(--surface)" stroke="var(--muted)" strokeWidth="1.5" />,
    label: "skill",
    desc: "appears when you focus a domain",
  },
];

/** Explains the node types + how the graph is wired. Collapsible. */
export function GraphLegend() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute bottom-3 left-3 z-10 hidden rounded-[var(--radius)] border bg-surface/85 px-3 py-1.5 text-[0.68rem] text-[var(--muted-foreground)] backdrop-blur transition-colors hover:text-[var(--ink)] sm:block"
      >
        // legend
      </button>
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 z-10 hidden w-[248px] flex-col rounded-[var(--radius)] border bg-surface/90 backdrop-blur sm:flex">
      <div
        className="flex items-center justify-between border-b px-3 py-2 text-[0.64rem] text-[var(--muted-foreground)]"
        style={{ borderColor: "var(--hair)" }}
      >
        <span>// legend</span>
        <button onClick={() => setOpen(false)} aria-label="collapse legend" className="hover:text-[var(--ink)]">
          <IconX size={12} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        {ROWS.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5">
            <Swatch>{r.swatch}</Swatch>
            <span className="w-[86px] shrink-0 text-[0.7rem] text-[var(--ink)]">{r.label}</span>
            <span className="text-[0.64rem] leading-tight text-[var(--muted-foreground)]">{r.desc}</span>
          </div>
        ))}
      </div>
      <div
        className="border-t px-3 py-2 text-[0.62rem] leading-snug text-[var(--muted-foreground)]"
        style={{ borderColor: "var(--hair)" }}
      >
        at rest: <span className="text-[var(--ink)]">me → domains → the work</span> on them.
        hover or click a node to reveal its other connections · drag anything.
      </div>
    </div>
  );
}
