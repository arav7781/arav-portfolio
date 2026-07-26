"use client";

import Link from "next/link";
import { DOMAINS } from "@/content/corpus";
import { hubAngle } from "@/lib/graph";
import { domainVar } from "@/lib/ui";
import { IconArrowRight } from "@/components/icons";

const W = 380;
const H = 340;
const CX = W / 2;
const CY = H / 2;
const R = 95;

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function curve(ax: number, ay: number, bx: number, by: number, bow = 0.16) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  return `M${round(ax)},${round(ay)} Q${round(mx - dy * bow)},${round(my + dx * bow)} ${round(bx)},${round(by)}`;
}

interface Sat {
  x: number;
  y: number;
  color: string;
  bridge: boolean;
  hub: { x: number; y: number };
  delay: number;
}

export function HeroGraph() {
  const hubs = DOMAINS.map((d) => {
    const a = hubAngle(d.order);
    return { 
      id: d.id, 
      a, 
      x: round(CX + R * Math.cos(a)), 
      y: round(CY + R * Math.sin(a)), 
      color: domainVar(d.id) 
    };
  });

  const sats: Sat[] = hubs.flatMap((h, i) => [
    {
      x: round(CX + (R + 42) * Math.cos(h.a - 0.28)),
      y: round(CY + (R + 42) * Math.sin(h.a - 0.28)),
      color: h.color,
      bridge: false,
      hub: h,
      delay: round(0.52 + i * 0.05),
    },
    {
      x: round(CX + (R + 32) * Math.cos(h.a + 0.32)),
      y: round(CY + (R + 32) * Math.sin(h.a + 0.32)),
      color: h.color,
      bridge: true,
      hub: h,
      delay: round(0.58 + i * 0.05),
    },
  ]);

  return (
    <Link
      href="/graph"
      className="group block h-[520px] w-full max-w-[420px] flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-800/80 bg-card text-card-foreground shadow-md transition-all duration-300 hover:border-[var(--accent-line)] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      <div
        className="flex items-center justify-between border-b px-3.5 py-2.5 text-[0.66rem] text-[var(--muted-foreground)]"
        style={{ borderColor: "var(--hair)" }}
      >
        <span>// my work, connected</span>
        <span className="flex items-center gap-1.5 font-mono">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-violet-500" aria-hidden />
          live preview
        </span>
      </div>

      <div className="dot-grid flex-1 px-4 py-4 flex items-center justify-center bg-slate-50/50 dark:bg-zinc-950/20">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px] h-auto select-none pointer-events-none" role="img" aria-label="interactive knowledge graph preview">
          <g
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            style={{ transformBox: "view-box", transformOrigin: "center" }}
          >
            {/* edges: center → hubs */}
            {hubs.map((h, i) => (
              <path
                key={`e-${h.id}`}
                className="hg-edge"
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                d={curve(CX, CY, h.x, h.y)}
                pathLength={1}
                fill="none"
                stroke="var(--line)"
                strokeWidth={1.1}
              />
            ))}
            {/* edges: hub → satellites */}
            {sats.map((s, i) => (
              <path
                key={`es-${i}`}
                className="hg-edge"
                style={{ animationDelay: `${0.5 + i * 0.04}s` }}
                d={curve(s.hub.x, s.hub.y, s.x, s.y, 0.1)}
                pathLength={1}
                fill="none"
                stroke="var(--hair)"
                strokeWidth={1}
              />
            ))}

            {/* one-time pulse ring behind person */}
            <circle className="hg-pulse" cx={CX} cy={CY} r={12} fill="none" stroke="var(--ink)" strokeWidth={1.4} />

            {/* satellites */}
            {sats.map((s, i) => (
              <circle
                key={`s-${i}`}
                className="hg-node"
                style={{ animationDelay: `${s.delay}s` }}
                cx={s.x}
                cy={s.y}
                r={4.6}
                fill={s.bridge ? "var(--surface)" : s.color}
                stroke={s.color}
                strokeWidth={s.bridge ? 1.4 : 0}
                strokeDasharray={s.bridge ? "2.4 2.4" : undefined}
              />
            ))}

            {/* hubs */}
            {hubs.map((h, i) => (
              <circle
                key={`h-${h.id}`}
                className="hg-node"
                style={{ animationDelay: `${0.24 + i * 0.06}s` }}
                cx={h.x}
                cy={h.y}
                r={7.5}
                fill={h.color}
              />
            ))}

            {/* person */}
            <g className="hg-node" style={{ animationDelay: "0.1s" }}>
              <circle cx={CX} cy={CY} r={15} fill="none" stroke="var(--line)" strokeWidth={1} />
              <circle cx={CX} cy={CY} r={10.5} fill="var(--ink)" />
            </g>
          </g>
        </svg>
      </div>

      <div
        className="flex items-center justify-between border-t px-3.5 py-3 text-[0.82rem] transition-colors group-hover:bg-[var(--accent-soft)]"
        style={{ borderColor: "var(--hair)" }}
      >
        <span className="font-semibold text-[var(--ink)]">explore how it all connects</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--accent)] font-semibold">
          open graph
          <IconArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
