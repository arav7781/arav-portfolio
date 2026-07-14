import React from "react";
import { DomainId, NodeType } from "@/content/types";
import { DOMAINS } from "@/content/corpus";
import { domainVar } from "@/lib/ui";

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--hair)] bg-muted px-2 py-0.5 text-xs font-mono text-[var(--ink)]">
      {children}
    </span>
  );
}

export function BridgeChip() {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[0.68rem] font-medium text-violet-600 dark:text-violet-400">
      cross-domain
    </span>
  );
}

export function DomainChip({ domain }: { domain: DomainId }) {
  const d = DOMAINS.find((dom) => dom.id === domain);
  const color = domainVar(domain);
  return (
    <span 
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium"
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}10`,
        color: color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {d?.key || domain}
    </span>
  );
}

export function TypeBadge({ type, domain }: { type: NodeType; domain?: DomainId }) {
  const color = domain ? domainVar(domain) : "var(--muted-foreground)";
  return (
    <span 
      className="inline-flex items-center rounded-[var(--radius)] border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {type}
    </span>
  );
}
