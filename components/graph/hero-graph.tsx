"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { IconArrowRight } from "@/components/icons";

const HeroGraph3D = dynamic(() => import("./hero-graph-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] flex items-center justify-center bg-transparent">
      <span className="mono-label animate-pulse text-[11px] text-[var(--muted-foreground)]">// rendering 3D space…</span>
    </div>
  ),
});

export function HeroGraph() {
  return (
    <div
      className="group block overflow-hidden rounded-[var(--radius-lg)] border bg-card text-card-foreground shadow-md transition-colors hover:border-[var(--accent-line)]"
    >
      <div
        className="flex items-center justify-between border-b px-3.5 py-2.5 text-[0.66rem] text-[var(--muted-foreground)]"
        style={{ borderColor: "var(--hair)" }}
      >
        <span>// my work, connected</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} aria-hidden />
          interactive 3D
        </span>
      </div>

      <div className="px-2 py-2">
        <HeroGraph3D />
      </div>

      <Link
        href="/graph"
        className="flex items-center justify-between border-t px-3.5 py-3 text-[0.82rem] transition-colors hover:bg-[var(--accent-soft)]"
        style={{ borderColor: "var(--hair)" }}
      >
        <span className="font-semibold text-[var(--ink)]">explore how it all connects</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--accent)] font-semibold">
          open graph
          <IconArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
