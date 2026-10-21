"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GraphNode } from "@/content/types";
import { isBridge, primaryDomain } from "@/lib/graph";
import { BridgeChip, DomainChip, Tag, TypeBadge } from "@/components/chips";
import { domainVar } from "@/lib/ui";
import { IconArrowRight, IconLink, IconX } from "@/components/icons";

export function DetailPanel({
  node,
  neighbors,
  onSelect,
  onClose,
}: {
  node: GraphNode | null;
  neighbors: GraphNode[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 32 };

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={reduce ? { opacity: 0 } : { x: 24, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: 24, opacity: 0 }}
          transition={spring}
          className="pointer-events-auto absolute right-0 top-0 z-20 flex h-full w-full max-w-[380px] flex-col overflow-y-auto border-l bg-surface sm:w-[380px]"
          style={{ boxShadow: "-18px 0 44px -30px rgba(0,0,0,0.5)" }}
          aria-label={`${node.label} details`}
        >
          <div
            className="sticky top-0 flex items-start justify-between gap-3 border-b bg-surface px-5 py-4"
            style={{ borderColor: "var(--hair)" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={node.type} domain={primaryDomain(node)} />
              {node.meta?.period && (
                <span className="text-[0.68rem] text-[var(--muted-foreground)]">{node.meta.period}</span>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="close panel"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius)] border text-[var(--muted-foreground)] transition-colors hover:text-[var(--ink)]"
            >
              <IconX size={14} />
            </button>
          </div>

          <div className="px-5 py-4">
            <h2 className="text-[1.2rem] font-medium leading-tight text-[var(--ink)]">{node.label}</h2>

            {(node.meta?.role || node.meta?.org || node.meta?.location) && (
              <p className="mt-1.5 text-[0.78rem] leading-snug text-[var(--muted-foreground)]">
                {[node.meta?.role, node.meta?.org, node.meta?.location].filter(Boolean).join(" · ")}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {node.domains?.map((d) => <DomainChip key={d} domain={d} />)}
              {isBridge(node) && <BridgeChip />}
            </div>

            {(node.desc ?? node.summary) !== node.label && (
              <p className="font-reading mt-4 text-[0.9rem] leading-relaxed text-[var(--ink)]">
                {node.desc ?? node.summary}
              </p>
            )}

            {node.meta?.impact && (
              <div
                className="mt-4 rounded-[var(--radius)] border-l-2 bg-[var(--accent-soft)] px-3 py-2 text-[0.82rem] text-[var(--ink)]"
                style={{ borderColor: "var(--accent)" }}
              >
                {node.meta.impact}
              </div>
            )}

            {node.meta?.stack && node.meta.stack.length > 0 && (
              <div className="mt-4">
                <h3 className="mono-label mb-2 text-xs text-[var(--muted-foreground)]">// stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {node.meta.stack.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            )}

            {neighbors.length > 0 && (
              <div className="mt-5">
                <h3 className="mono-label mb-2 text-xs text-[var(--muted-foreground)]">// connections: click to traverse</h3>
                <div className="flex flex-col">
                  {neighbors.map((n) => {
                    const np = primaryDomain(n);
                    return (
                      <button
                        key={n.id}
                        onClick={() => onSelect(n.id)}
                        className="group flex items-center justify-between gap-2 rounded-[var(--radius)] px-2 py-2 text-left transition-colors hover:bg-[var(--accent-soft)]"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: np ? domainVar(np) : "hsl(var(--muted-foreground))" }}
                            aria-hidden
                          />
                          <span className="truncate text-[0.85rem] text-[var(--ink)]">{n.label}</span>
                        </span>
                        <IconArrowRight
                          size={14}
                          className="shrink-0 text-transparent group-hover:text-[var(--accent)]"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--hair)" }}>
              {node.hasPage && (
                <Link
                  href={`/work/${node.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border bg-surface px-3 py-1.5 text-[0.78rem] text-[var(--ink)] transition-colors hover:border-[var(--accent-line)]"
                >
                  open case file <IconArrowRight size={13} />
                </Link>
              )}
              {node.links?.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border bg-surface px-3 py-1.5 text-[0.78rem] text-[var(--ink)] transition-colors hover:border-[var(--accent-line)]"
                >
                  <IconLink size={13} /> {l.label}
                </a>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
