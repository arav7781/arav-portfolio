"use client";

import { useEffect, useState } from "react";
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
  // Packets are SMIL animations; mount them after hydration and skip them for reduced motion.
  const [packets, setPackets] = useState(false);
  useEffect(() => {
    setPackets(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const hubs = DOMAINS.map((d) => {
    const a = hubAngle(d.order);
    return {
      id: d.id,
      key: d.key,
      a,
      x: round(CX + R * Math.cos(a)),
      y: round(CY + R * Math.sin(a)),
      lx: round(CX + (R + 68) * Math.cos(a)),
      ly: round(CY + (R + 68) * Math.sin(a)),
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
            {/* slowly counter-rotating orbit rings */}
            <circle className="hg-orbit" cx={CX} cy={CY} r={R} fill="none" stroke="var(--line)" strokeWidth={0.8} strokeDasharray="1.5 7" opacity={0.7} />
            <circle
              className="hg-orbit"
              style={{ animationDirection: "reverse", animationDuration: "90s" }}
              cx={CX}
              cy={CY}
              r={R + 40}
              fill="none"
              stroke="var(--line)"
              strokeWidth={0.8}
              strokeDasharray="1 9"
              opacity={0.55}
            />

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

            {/* data packets: me → domains → the work on them */}
            {packets &&
              hubs.map((h, i) => (
                <circle key={`p-${h.id}`} r={2.6} fill={h.color}>
                  <animateMotion dur="2.4s" begin={`${1.2 + i * 0.4}s`} repeatCount="indefinite" path={curve(CX, CY, h.x, h.y)} />
                </circle>
              ))}
            {packets &&
              sats.map((s, i) => (
                <circle key={`ps-${i}`} r={1.8} fill={s.color} opacity={0.85}>
                  <animateMotion dur="1.6s" begin={`${2 + i * 0.27}s`} repeatCount="indefinite" path={curve(s.hub.x, s.hub.y, s.x, s.y, 0.1)} />
                </circle>
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

            {/* hubs, each with a breathing halo */}
            {hubs.map((h, i) => (
              <circle
                key={`hb-${h.id}`}
                className="hg-breathe"
                style={{ animationDelay: `${1 + i * 0.45}s` }}
                cx={h.x}
                cy={h.y}
                r={7.5}
                fill={h.color}
                opacity={0}
              />
            ))}
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

            {/* domain labels */}
            {hubs.map((h, i) => (
              <text
                key={`l-${h.id}`}
                className="hg-label font-mono"
                style={{ animationDelay: `${0.9 + i * 0.08}s` }}
                x={h.lx}
                y={h.ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                fill={h.color}
              >
                {h.key}
              </text>
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
