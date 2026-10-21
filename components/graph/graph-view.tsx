"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DOMAINS, NODE_BY_ID } from "@/content/corpus";
import type { DomainId, GraphNode } from "@/content/types";
import { buildGraph, buildAdjacency, isDetail, primaryDomain } from "@/lib/graph";
import { computeLayout, RINGS, type LaidOutNode } from "@/lib/layout";
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

/** At rest, labels longer than this are clipped; the full label shows once a node is in focus. */
const REST_LABEL_MAX = 24;
const clip = (s: string) => (s.length > REST_LABEL_MAX ? `${s.slice(0, REST_LABEL_MAX - 1).trimEnd()}…` : s);

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
  // staggered entrance only on first paint; later mounts (skills, revealed edges) pop in immediately
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 2200);
    return () => clearTimeout(t);
  }, []);

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
      const pad = 80;
      const cw = Math.max(1, maxX - minX);
      const ch = Math.max(1, maxY - minY);
      const k = clamp(Math.min((size.w - pad * 2) / cw, (size.h - pad * 2) / ch), 0.35, 2.0);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      setCam({ tx: size.w / 2 + offsetX - cx * k, ty: size.h / 2 - cy * k, k, smooth: smooth && !reduceMotion });
    },
    [size, reduceMotion],
  );

  const fit = useCallback(() => {
    if (!size.w || !size.h) return;
    let R = 440;
    for (const n of layout.nodes) {
      if (isDetail(n)) continue;
      R = Math.max(R, Math.hypot(n.x, n.y) + n.r + 24);
    }
    const pad = 40;
    const k = clamp(
      Math.min((size.w - pad * 2) / (R * 2), (size.h - pad * 2) / (R * 2)),
      0.35,
      2.0,
    );
    setCam({ tx: size.w / 2, ty: size.h / 2, k, smooth: false });
  }, [size, layout]);

  const flyTo = useCallback(
    (id: string) => {
      if (!size.w) return;
      const p = posOf(id);
      const k = clamp(Math.max(cam.k, 1.0), 0.5, 2.2);
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
      const hay = `${n.label} ${n.summary ?? ""} ${(n.meta?.stack ?? []).join(" ")} ${(n.domains ?? []).join(" ")}`.toLowerCase();
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
      if (a && isDetail(a)) return primaryDomain(a) ?? null;
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

  const detailVisible = useCallback(
    (n: GraphNode) =>
      isDetail(n) &&
      ((skillDomain && n.domains?.includes(skillDomain)) || (searching && searchMatches.has(n.id))),
    [skillDomain, searching, searchMatches],
  );

  const nodeOpacity = useCallback(
    (n: LaidOutNode) => {
      if (isDetail(n) && !detailVisible(n) && !litSet?.has(n.id)) return 0;
      if (litSet) return litSet.has(n.id) ? 1 : 0.08;
      return 1;
    },
    [litSet, detailVisible],
  );

  // At rest only the structure is labelled (me, domains, projects, roles); recognitions,
  // skills and certifications get labels once something brings them into focus.
  const showLabel = useCallback(
    (n: LaidOutNode, op: number) => {
      if (n.type === "person" || n.type === "domain") return true;
      if (op < 0.9) return false;
      if (isDetail(n)) return n.id === anchor || (searching && searchMatches.has(n.id));
      if (n.type === "project" || n.type === "experience") return true;
      return !!litSet;
    },
    [litSet, anchor, searching, searchMatches],
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
        const k2 = clamp(c.k * factor, 0.25, 3.0);
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
          {/* orbit rings at the layout radii: domains, roles & recognitions, projects */}
          <g aria-hidden pointerEvents="none">
            {[RINGS.domain, RINGS.inner, RINGS.project].map((r, i) => (
              <circle
                key={r}
                r={r}
                fill="none"
                stroke="var(--line)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray={i === 0 ? "2 8" : "1 10"}
                opacity={litSet ? 0.15 : 0.45}
                className={reduceMotion ? undefined : "gv-orbit"}
                style={{
                  animationDuration: `${140 + i * 50}s`,
                  animationDirection: i % 2 ? "reverse" : "normal",
                  transition: "opacity var(--dur-base) var(--ease-out)",
                }}
              />
            ))}
          </g>

          {/* edges */}
          <g>
            {edges.map((e, i) => {
              const sNode = layout.byId.get(e.source);
              const tNode = layout.byId.get(e.target);
              if (!sNode || !tNode) return null;
              const so = nodeOpacity(sNode);
              const to = nodeOpacity(tNode);
              if (so === 0 || to === 0) return null;
              // At rest the graph is a clean tree: me → domains → the work placed in each sector.
              // Cross-domain edges only appear when a node is hovered, selected or searched.
              const restSkeleton = e.kind === "person-domain" || (e.kind === "domain" && tNode.home === e.domain);
              const lit = litSet ? litSet.has(e.source) && litSet.has(e.target) : false;
              if (!litSet && !restSkeleton) return null;
              if (litSet && !lit && !restSkeleton) return null;
              const s = posOf(e.source);
              const t = posOf(e.target);
              const stroke = lit ? (e.domain ? domainVar(e.domain) : "var(--accent)") : "hsl(var(--muted-foreground))";
              const opacity = litSet ? (lit ? 0.9 : 0.04) : e.kind === "person-domain" ? 0.32 : 0.2;
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
              const d = `M${s.x},${s.y} Q${cxp},${cyp} ${t.x},${t.y}`;

              // Packets: outward from the hovered/selected node when something is lit,
              // otherwise a quiet ambient flow from me → domains → projects & roles.
              let packet: { color: string; dur: number; begin: number; rev: boolean; r: number } | null = null;
              if (!reduceMotion) {
                if (litSet && lit) {
                  packet = {
                    color: e.domain ? domainVar(e.domain) : "var(--accent)",
                    dur: 1.5,
                    begin: (i % 5) * 0.3,
                    rev: !!anchor && e.target === anchor,
                    r: 3,
                  };
                } else if (!litSet && e.kind === "person-domain") {
                  packet = { color: domainVar(e.domain!), dur: 2.6, begin: (i % 6) * 0.43, rev: false, r: 3 };
                } else if (!litSet && restSkeleton && e.kind === "domain" && (tNode.type === "project" || tNode.type === "experience")) {
                  packet = { color: domainVar(e.domain!), dur: 4.5 + (i % 4) * 0.6, begin: (i * 0.77) % 5, rev: false, r: 2.2 };
                }
              }
              const introDelay = intro ? 0.15 + (Math.hypot(t.x, t.y) / 440) * 0.85 : 0;

              return (
                <g key={i}>
                  <path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={lit ? 1.6 : 1.1}
                    vectorEffect="non-scaling-stroke"
                    opacity={opacity}
                    className={reduceMotion ? undefined : "gv-fade"}
                    style={{
                      animationDelay: `${introDelay}s`,
                      transition: reduceMotion ? "none" : "opacity var(--dur-base) var(--ease-out)",
                    }}
                  />
                  {packet && (
                    <circle r={packet.r / cam.k} fill={packet.color} opacity={lit ? 0.95 : 0.7} pointerEvents="none">
                      <animateMotion
                        dur={`${packet.dur}s`}
                        begin={`${1.4 + packet.begin}s`}
                        repeatCount="indefinite"
                        path={d}
                        keyPoints={packet.rev ? "1;0" : "0;1"}
                        keyTimes="0;1"
                        calcMode="linear"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* nodes */}
          <g>
            {layout.nodes.map((n) => {
              const op = nodeOpacity(n);
              if (op === 0) return null;
              const pd = n.type === "domain" ? n.domainId : n.home ?? primaryDomain(n);
              const bridge = (n.domains?.length ?? 0) >= 2;
              const isSelected = n.id === selectedId;
              const isHovered = n.id === hoveredId;
              const scale = reduceMotion ? 1 : isHovered ? 1.09 : isSelected ? 1.05 : 1;

              let fill = "var(--surface)";
              let stroke = pd ? domainVar(pd) : "hsl(var(--muted-foreground))";
              let strokeW = 0;
              if (n.type === "person") { fill = "var(--ink)"; }
              else if (n.type === "domain") { fill = domainVar(n.domainId!); }
              else if (n.type === "achievement") { fill = "var(--c-ach)"; stroke = "var(--c-ach)"; }
              else if (n.type === "project" && !bridge) { fill = pd ? domainVar(pd) : "hsl(var(--muted-foreground))"; }
              else { fill = "var(--surface)"; strokeW = 2; }

              const labelVisible = showLabel(n, op);
              const p = posOf(n.id);
              // Labels sit radially outward: right of nodes on the right half, left of nodes on
              // the left, above/below near the top and bottom. Centre and hubs label underneath.
              const ang = Math.atan2(p.y, p.x);
              const cosA = Math.cos(ang);
              const hub = n.type === "person" || n.type === "domain";
              // the two lower-side domain hubs label sideways so they clear the roles beneath them
              const side = hub
                ? n.type === "domain" && Math.sin(ang) > 0.2 && Math.abs(cosA) > 0.5 ? Math.sign(cosA) : 0
                : cosA > 0.34 ? 1 : cosA < -0.34 ? -1 : 0;
              const labelX = side * (n.r + 6);
              const labelY = side ? 3.5 : hub || Math.sin(ang) >= 0 ? n.r + 13 : -(n.r + 7);
              const labelText = litSet || hub ? n.label : n.short ?? clip(n.label);

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
                  tabIndex={op >= 0.9 && !isDetail(n) ? 0 : -1}
                  role="button"
                  aria-label={`${n.type}: ${n.label}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); } }}
                >
                  <g
                    className={reduceMotion ? undefined : "gv-pop"}
                    style={{ animationDelay: `${intro ? 0.05 + (Math.hypot(p.x, p.y) / 440) * 0.85 : 0}s` }}
                  >
                  <g style={{ transform: `scale(${scale})`, transition: reduceMotion ? "none" : "transform var(--dur-fast) var(--ease-out)" }}>
                    {!reduceMotion && (n.type === "person" || n.type === "domain") && (
                      <circle
                        r={n.r}
                        fill={n.type === "person" ? "var(--accent)" : domainVar(n.domainId!)}
                        className="gv-ping"
                        style={{ animationDelay: `${n.type === "person" ? 0 : 0.4 + (DOMAINS.find((d) => d.id === n.domainId)?.order ?? 0) * 0.37}s` }}
                        pointerEvents="none"
                      />
                    )}
                    {isSelected && (
                      <>
                        <circle
                          r={n.r + 7}
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth={1.6}
                          strokeDasharray="5 4"
                          vectorEffect="non-scaling-stroke"
                          className={reduceMotion ? undefined : "gv-spin"}
                        />
                        {!reduceMotion && (
                          <circle r={n.r + 3} fill="none" stroke="var(--accent)" strokeWidth={1.4} className="gv-ping" pointerEvents="none" />
                        )}
                      </>
                    )}
                    <circle
                      r={n.r}
                      fill={fill}
                      stroke={strokeW ? stroke : "none"}
                      strokeWidth={strokeW}
                      strokeDasharray={bridge && n.type !== "domain" ? "3 3" : undefined}
                    />
                    {n.type === "person" && (
                      // the centre of the graph is me: the avatar's face, cropped to the node
                      <>
                        <clipPath id="gv-me">
                          <circle r={n.r - 1.5} />
                        </clipPath>
                        <image
                          href="/avatar.png"
                          x={-90}
                          y={-50}
                          width={133}
                          height={154}
                          clipPath="url(#gv-me)"
                          preserveAspectRatio="xMidYMid slice"
                          pointerEvents="none"
                        />
                        <circle r={n.r} fill="none" stroke="#5ef0f0" strokeOpacity={0.6} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                      </>
                    )}
                    {labelVisible && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor={side === 1 ? "start" : side === -1 ? "end" : "middle"}
                        className="font-mono select-none pointer-events-none"
                        style={{
                          fontSize: n.type === "person" ? 14 : n.type === "domain" ? 12 : n.type === "project" ? 10.5 : 9.5,
                          fill: "var(--ink)",
                          stroke: "var(--bg)",
                          strokeWidth: 3.5,
                          paintOrder: "stroke",
                          fontWeight: n.type === "domain" || n.type === "person" ? 600 : n.type === "project" ? 500 : 400,
                        }}
                      >
                        {labelText}
                      </text>
                    )}
                  </g>
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
