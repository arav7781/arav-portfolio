"use client";

import dynamic from "next/dynamic";

const GraphView = dynamic(() => import("./graph-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="mono-label animate-pulse text-xs text-[var(--muted-foreground)]">// laying out the graph…</span>
    </div>
  ),
});

export function GraphMount() {
  return <GraphView />;
}
export default GraphMount;
