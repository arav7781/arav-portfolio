"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DOMAINS, NODE_BY_ID } from "@/content/corpus";
import type { DomainId, GraphNode } from "@/content/types";
import { buildGraph, buildAdjacency, primaryDomain } from "@/lib/graph";
import { computeLayout, type LaidOutNode } from "@/lib/layout";
import { useApp } from "@/components/providers";
import { domainVar } from "@/lib/ui";
import { DetailPanel } from "@/components/graph/detail-panel";
import { GraphLegend } from "@/components/graph/graph-legend";
import { IconSearch, IconX } from "@/components/icons";

interface Camera {
  tx: number;
  ty: number;
  k: number;
  smooth: boolean;
}

const REST_EDGE_KINDS = new Set(["person-domain", "domain"]);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function GraphView() {
  const { focus, setFocus } = useApp();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { edges } = useMemo(() => buildGraph(), []);
  const layout = useMemo(() => computeLayout(), []);
  const adj = useMemo(() => buildAdjacency(edges), [edges]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [cam, setCam] = useState<Camera>({ tx: 0, ty: 0, k: 1, smooth: false });
  // user-dragged node position overrides (id → world x/y)
  const [dragPos, setDragPos] = useState<Record<string, { x: number; y: number }>>({});
  const userMoved = useRef(false);

  const posOf = useCallback(
    (id: string): { x: number; y: number } => {
      const d = dragPos[id];
      if (d) return d;
      const n = layout.byId.get(id);
      return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
    },
    [dragPos, layout],
  );

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ── sizing ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({
        w: r.width || window.innerWidth,
        h: r.height || Math.max(320, window.innerHeight - 56),
      });
    };
    measure(); // immediate — don't wait for the first ResizeObserver callback
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const panelW = selectedId && size.w >= 640 ? 380 : 0;

  // ── camera helpers ────────────────────────────────────────────────────────
  const fitNodes = useCallback(
    (nodes: LaidOutNode[], smooth: boolean, offsetX = 0) => {
      if (!size.w || !size.h || nodes.length === 0) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of nodes) {
        minX = Math.min(minX, n.x - n.r);
        minY = Math.min(minY, n.y - n.r);
        maxX = Math.max(maxX, n.x + n.r);
        maxY = Math.max(maxY, n.y + n.r);
      }
      const pad = 100;
      const cw = Math.max(1, maxX - minX);
      const ch = Math.max(1, maxY - minY);
      const k = clamp(Math.min((size.w - pad * 2) / cw, (size.h - pad * 2) / ch), 0.45, 1.5);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      setCam({ tx: size.w / 2 + offsetX - cx * k, ty: size.h / 2 - cy * k, k, smooth: smooth && !reduceMotion });
    },
    [size, reduceMotion],
  );

  const fit = useCallback(() => {
    if (!size.w || !size.h) return;
    let R = 300;
    for (const n of layout.nodes) {
      if (n.type === "skill") continue;
      R = Math.max(R, Math.hypot(n.x, n.y) + n.r + 24);
    }
    const pad = 60;
    const k = clamp(
      Math.min((size.w - pad * 2) / (R * 2), (size.h - pad * 2) / (R * 2)),
      0.45,
      1.5,
    );
    setCam({ tx: size.w / 2, ty: size.h / 2, k, smooth: false });
  }, [size, layout]);

  const flyTo = useCallback(
    (id: string) => {
      if (!size.w) return;
      const p = posOf(id);
      const k = clamp(Math.max(cam.k, 1.0), 0.6, 1.8);
      const cx = (size.w - panelW) / 2;
      setCam({ tx: cx - p.x * k, ty: size.h / 2 - p.y * k, k, smooth: !reduceMotion });
    },
    [posOf, size, cam.k, panelW, reduceMotion],
  );

  useEffect(() => {
    if (!userMoved.current && !selectedId) fit();
  }, [size.w, size.h, fit, selectedId]);

  useEffect(() => {
    if (selectedId) return;
    userMoved.current = false;
    if (focus) {
      const frame = layout.nodes.filter(
        (n) => (n.type === "domain" && n.domainId === focus) || n.domains?.includes(focus),
      );
      fitNodes(frame, true);
    } else {
      fit();
    }
  }, [focus, fit, fitNodes, layout.nodes, selectedId]);

  // ── selection / traversal ─────────────────────────────────────────────────
  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      userMoved.current = false;
      flyTo(id);
    },
    [flyTo],
  );

  const deselect = useCallback(() => {
    setSelectedId(null);
    userMoved.current = false;
    if (focus) {
      fitNodes(
        layout.nodes.filter(
          (n) => (n.type === "domain" && n.domainId === focus) || n.domains?.includes(focus),
        ),
        true,
      );
    } else {
      fit();
    }
  }, [fit, fitNodes, focus, layout.nodes]);

  const resetView = useCallback(() => {
    setSelectedId(null);
    setHoveredId(null);
    setQuery("");
    setFocus(null);
    setDragPos({});
    userMoved.current = false;
    fit();
  }, [fit, setFocus]);

  // ── search submit → fly to top match ──────────────────────────────────────
  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    const ids = new Set<string>();
    for (const n of layout.nodes) {
      const hay = `${n.label} ${n.summary ?? ""} ${(n.tags ?? []).join(" ")} ${(n.domains ?? []).join(" ")}`.toLowerCase();
      if (hay.includes(q)) ids.add(n.id);
    }
    return ids;
  }, [query, layout.nodes]);

  const onSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const first = layout.nodes.find((n) => searchMatches.has(n.id) && n.type !== "domain");
      if (first) select(first.id);
    },
    [layout.nodes, searchMatches, select],
  );

  // ── visibility model ──────────────────────────────────────────────────────
  const anchor = selectedId ?? hoveredId;
  const searching = query.trim().length > 0;

  const skillDomain: DomainId | null = useMemo(() => {
    if (focus) return focus;
    if (anchor) {
      const a = NODE_BY_ID[anchor];
      if (a?.type === "domain" && a.domainId) return a.domainId;
      if (a?.type === "skill") return primaryDomain(a) ?? null;
    }
    return null;
  }, [focus, anchor]);

  const litSet: Set<string> | null = useMemo(() => {
    if (searching) return searchMatches;
    if (selectedId) return new Set([selectedId, ...(adj.get(selectedId) ?? [])]);
    if (hoveredId) return new Set([hoveredId, ...(adj.get(hoveredId) ?? [])]);
    if (focus)
      return new Set(
        layout.nodes
          .filter(
            (n) =>
              n.type === "person" ||
              (n.type === "domain" && n.domainId === focus) ||
              n.domains?.includes(focus),
          )
          .map((n) => n.id),
      );
    return null;
  }, [searching, searchMatches, selectedId, hoveredId, focus, adj, layout.nodes]);

  const skillVisible = useCallback(
    (n: GraphNode) =>
      n.type === "skill" &&
      ((skillDomain && n.domains?.includes(skillDomain)) || (searching && searchMatches.has(n.id))),
    [skillDomain, searching, searchMatches],
  );

  const nodeOpacity = useCallback(
    (n: LaidOutNode) => {
      if (n.type === "skill" && !skillVisible(n) && !litSet?.has(n.id)) return 0;
      if (litSet) return litSet.has(n.id) ? 1 : 0.1;
      return 1;
    },
    [litSet, skillVisible],
  );

  const showLabel = useCallback(
    (n: LaidOutNode, op: number) => {
      if (n.type === "person" || n.type === "domain") return true;
      if (op < 0.9) return false;
      if (!litSet && !hoveredId) return false;
      if (n.type === "skill") return n.id === anchor;
      return true;
    },
    [litSet, hoveredId, anchor],
  );

  // ── camera interaction: wheel zoom + drag pan ─────────────────────────────
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      setCam((c) => {
        const k2 = clamp(c.k * factor, 0.4, 2.6);
        userMoved.current = true;
        return {
          k: k2,
          tx: mx - (mx - c.tx) * (k2 / c.k),
          ty: my - (my - c.ty) * (k2 / c.k),
          smooth: false,
        };
      });
    },
    [],
  );

  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const nodeDrag = useRef<{ id: string; lastX: number; lastY: number; moved: number } | null>(null);

  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    nodeDrag.current = { id, lastX: e.clientX, lastY: e.clientY, moved: 0 };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-node]")) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (nodeDrag.current) {
      const nd = nodeDrag.current;
      const rawdx = e.clientX - nd.lastX;
      const rawdy = e.clientY - nd.lastY;
      nd.moved += Math.abs(rawdx) + Math.abs(rawdy);
      nd.lastX = e.clientX;
      nd.lastY = e.clientY;
      const dx = rawdx / cam.k;
      const dy = rawdy / cam.k;
      setDragPos((prev) => {
        const base = prev[nd.id] ?? posOf(nd.id);
        return { ...prev, [nd.id]: { x: base.x + dx, y: base.y + dy } };
      });
      return;
    }
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
    userMoved.current = true;
    setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy, smooth: false }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (nodeDrag.current) {
      const nd = nodeDrag.current;
      nodeDrag.current = null;
      if (nd.moved < 4) select(nd.id);
      return;
    }
    const wasClick = drag.current && drag.current.moved < 4;
    drag.current = null;
    if (wasClick && !(e.target as Element).closest("[data-node]")) deselect();
  };

  const selectedNode = selectedId ? NODE_BY_ID[selectedId] : null;
  const neighbors = useMemo(() => {
    if (!selectedId) return [];
    return [...(adj.get(selectedId) ?? [])]
      .map((id) => NODE_BY_ID[id])
      .filter(Boolean)
      .filter((n) => n.type !== "domain" && n.type !== "person")
      .sort((a, b) => a.type.localeCompare(b.type));
  }, [selectedId, adj]);

  const transform = `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.k})`;

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-2 p-3 sm:p-4">
        <form onSubmit={onSearchSubmit} className="pointer-events-auto flex items-center gap-2 rounded-[var(--radius)] border bg-surface px-3 py-2">
          <IconSearch size={15} className="text-[var(--muted-foreground)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search the graph…"
            className="w-36 bg-transparent text-[0.8rem] text-[var(--ink)] outline-none placeholder:text-[var(--muted-foreground)] sm:w-48"
            aria-label="search the graph"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="clear search" className="text-[var(--muted-foreground)] hover:text-[var(--ink)]">
              <IconX size={13} />
            </button>
          )}
        </form>

        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          {DOMAINS.map((d) => {
            const active = focus === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setFocus(active ? null : d.id)}
                aria-pressed={active}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[0.72rem] transition-colors"
                style={{
                  background: active ? domainVar(d.id) : "var(--surface)",
                  color: active ? "#fff" : "var(--ink)",
                  borderColor: active ? domainVar(d.id) : "var(--line)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#fff" : domainVar(d.id) }} aria-hidden />
                {d.key}
              </button>
            );
          })}
          {(focus || selectedId || query || Object.keys(dragPos).length > 0) && (
            <button
              onClick={resetView}
              className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border bg-surface px-2.5 py-1 text-[0.72rem] text-[var(--muted-foreground)] transition-colors hover:text-[var(--ink)]"
            >
              <IconX size={12} /> reset
            </button>
          )}
        </div>
      </div>

      {/* canvas */}
      <svg
        ref={svgRef}
        className="h-full w-full touch-none select-none bg-[var(--bg)]"
        style={{ cursor: drag.current || nodeDrag.current ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="application"
        aria-label="Interactive graph of Arav's work. Drag nodes to move them, click to open details."
      >
        <g
          style={{
            transform,
            transformOrigin: "0 0",
            transition: cam.smooth && !reduceMotion ? "transform var(--dur-slow) var(--ease-inout)" : "none",
          }}
        >
          {/* edges */}
          <g>
            {edges.map((e, i) => {
              const sNode = layout.byId.get(e.source);
              const tNode = layout.byId.get(e.target);
              if (!sNode || !tNode) return null;
              const so = nodeOpacity(sNode);
              const to = nodeOpacity(tNode);
              if (so === 0 || to === 0) return null;
              const restSkeleton = REST_EDGE_KINDS.has(e.kind ?? "domain");
              const lit = litSet ? litSet.has(e.source) && litSet.has(e.target) : false;
              if (!litSet && !restSkeleton) return null;
              if (litSet && !lit && !restSkeleton) return null;
              const s = posOf(e.source);
              const t = posOf(e.target);
              const stroke = lit && e.domain ? domainVar(e.domain) : "var(--muted-foreground)";
              const opacity = litSet ? (lit ? 0.9 : 0.05) : e.kind === "person-domain" ? 0.28 : 0.16;
              const mx = (s.x + t.x) / 2;
              const my = (s.y + t.y) / 2;
              const dx = t.x - s.x;
              const dy = t.y - s.y;
              const nx = -dy;
              const ny = dx;
              const len = Math.hypot(nx, ny) || 1;
              const bow = 0.12;
              const cxp = mx + (nx / len) * len * bow * 0.16;
              const cyp = my + (ny / len) * len * bow * 0.16;
              return (
                <path
                  key={i}
                  d={`M${s.x},${s.y} Q${cxp},${cyp} ${t.x},${t.y}`}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={lit ? 1.6 : 1.1}
                  vectorEffect="non-scaling-stroke"
                  opacity={opacity}
                  style={{ transition: reduceMotion ? "none" : "opacity var(--dur-base) var(--ease-out)" }}
                />
              );
            })}
          </g>

          {/* nodes */}
          <g>
            {layout.nodes.map((n) => {
              const op = nodeOpacity(n);
              if (op === 0) return null;
              const pd = primaryDomain(n);
              const bridge = (n.domains?.length ?? 0) >= 2;
              const isSelected = n.id === selectedId;
              const isHovered = n.id === hoveredId;
              const scale = reduceMotion ? 1 : isHovered ? 1.09 : isSelected ? 1.05 : 1;

              let fill = "var(--surface)";
              let stroke = pd ? domainVar(pd) : "var(--muted-foreground)";
              let strokeW = 0;
              if (n.type === "person") { fill = "var(--ink)"; }
              else if (n.type === "domain") { fill = domainVar(n.domainId!); }
              else if (n.type === "achievement") { fill = "var(--c-ach)"; stroke = "var(--c-ach)"; }
              else if (n.type === "project" && !bridge) { fill = pd ? domainVar(pd) : "var(--muted-foreground)"; }
              else { fill = "var(--surface)"; strokeW = 2; }

              const labelVisible = showLabel(n, op);
              const labelBelow = n.type === "person" || n.type === "domain";
              const p = posOf(n.id);

              return (
                <g
                  key={n.id}
                  data-node
                  transform={`translate(${p.x},${p.y})`}
                  style={{
                    opacity: op,
                    cursor: "grab",
                    transition: reduceMotion ? "none" : "opacity var(--dur-base) var(--ease-out)",
                  }}
                  onPointerDown={(e) => onNodePointerDown(e, n.id)}
                  onPointerEnter={() => setHoveredId(n.id)}
                  onPointerLeave={() => setHoveredId((h) => (h === n.id ? null : h))}
                  tabIndex={op >= 0.9 && n.type !== "skill" ? 0 : -1}
                  role="button"
                  aria-label={`${n.type}: ${n.label}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } }}
                >
                  <g style={{ transform: `scale(${scale})`, transition: reduceMotion ? "none" : "transform var(--dur-fast) var(--ease-out)" }}>
                    {isSelected && (
                      <circle r={n.r + 6} fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0.6} />
                    )}
                    <circle
                      r={n.r}
                      fill={fill}
                      stroke={strokeW ? stroke : "none"}
                      strokeWidth={strokeW}
                      strokeDasharray={bridge && n.type !== "domain" ? "3 3" : undefined}
                    />
                    {labelVisible && (
                      <text
                        y={labelBelow ? n.r + 13 : -(n.r + 8)}
                        textAnchor="middle"
                        className="font-mono select-none pointer-events-none"
                        style={{
                          fontSize: n.type === "domain" ? 11 : n.type === "person" ? 13 : 9,
                          fill: "var(--ink)",
                          stroke: "var(--bg)",
                          strokeWidth: 3,
                          paintOrder: "stroke",
                          fontWeight: n.type === "domain" || n.type === "person" ? 600 : 400,
                        }}
                      >
                        {n.label}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* legend */}
      <GraphLegend />

      {/* detail panel */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <DetailPanel node={selectedNode} neighbors={neighbors} onSelect={select} onClose={deselect} />
      </div>
    </div>
  );
}
