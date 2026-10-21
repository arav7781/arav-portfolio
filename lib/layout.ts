import { GraphNode, DomainId } from "../content/types";
import { NODES, DOMAINS } from "../content/corpus";
import { hubAngle, isDetail } from "./graph";

export interface LaidOutNode extends GraphNode {
  x: number;
  y: number;
  r: number;
  /** the one domain sector this node sits in, and is coloured by */
  home?: DomainId;
}

/** Ring radii: domains, then roles & recognitions, then projects, then skills & certifications. */
export const RINGS = { domain: 165, inner: 265, project: 375, detail: 480 } as const;

type Ring = "inner" | "project" | "detail";

const SECTOR = (2 * Math.PI) / DOMAINS.length;
const MAX_STEP: Record<Ring, number> = { inner: 0.3, project: 0.3, detail: 0.17 };

function ringOf(n: GraphNode): Ring {
  if (isDetail(n)) return "detail";
  return n.type === "project" ? "project" : "inner";
}

/**
 * Every node sits in exactly one domain sector. Single-domain work goes to its domain;
 * cross-domain work goes to whichever of its domains is least crowded on its ring (ties
 * keep the corpus order), which spreads work evenly around the circle instead of piling
 * every multi-domain node into the gap between two hubs. Skills and certifications keep
 * their first-listed domain, since they only appear when that domain is focused.
 */
function assignHomes(): Map<string, DomainId> {
  const counts: Record<Ring, Partial<Record<DomainId, number>>> = { inner: {}, project: {}, detail: {} };
  const home = new Map<string, DomainId>();
  const work = NODES.filter((n) => n.type !== "person" && n.type !== "domain");
  // most-constrained first (Array.prototype.sort is stable, so corpus order breaks ties)
  const ordered = [...work].sort((a, b) => (a.domains?.length ?? 0) - (b.domains?.length ?? 0));

  for (const n of ordered) {
    const ring = ringOf(n);
    const options: DomainId[] = n.domains?.length ? n.domains : ["ai"];
    let pick = options[0];
    if (ring !== "detail") {
      for (const d of options) {
        if ((counts[ring][d] ?? 0) < (counts[ring][pick] ?? 0)) pick = d;
      }
    }
    counts[ring][pick] = (counts[ring][pick] ?? 0) + 1;
    home.set(n.id, pick);
  }
  return home;
}

function radiusOf(n: GraphNode): number {
  if (isDetail(n)) return 7;
  if (n.type === "project") return 12.5;
  if (n.type === "experience") return 12;
  return 9.5;
}

export function computeLayout(): { nodes: LaidOutNode[]; byId: Map<string, LaidOutNode> } {
  const laidOut: LaidOutNode[] = [];
  const byId = new Map<string, LaidOutNode>();
  const place = (n: LaidOutNode) => {
    laidOut.push(n);
    byId.set(n.id, n);
  };

  place({ ...NODES.find((n) => n.id === "arav")!, x: 0, y: 0, r: 28 });

  DOMAINS.forEach((d) => {
    const a = hubAngle(d.order);
    place({
      ...NODES.find((n) => n.id === `domain-${d.id}`)!,
      x: RINGS.domain * Math.cos(a),
      y: RINGS.domain * Math.sin(a),
      r: 18,
      home: d.id,
    });
  });

  const home = assignHomes();

  DOMAINS.forEach((d) => {
    const base = hubAngle(d.order);
    (["inner", "project", "detail"] as Ring[]).forEach((ring) => {
      const group = NODES.filter((n) => home.get(n.id) === d.id && ringOf(n) === ring);
      if (ring === "inner") group.sort((a, b) => (a.type === b.type ? 0 : a.type === "experience" ? -1 : 1));
      const k = group.length;
      const step = k > 1 ? Math.min((SECTOR * 0.8) / (k - 1), MAX_STEP[ring]) : 0;
      // crowded rings alternate in and out a little so neighbours never touch
      const stagger = step < 0.16 ? 22 : 0;

      group.forEach((n, i) => {
        const a = base + (i - (k - 1) / 2) * step;
        const R = RINGS[ring] + (stagger ? (i % 2 ? stagger : -stagger) : 0);
        place({ ...n, x: R * Math.cos(a), y: R * Math.sin(a), r: radiusOf(n), home: d.id });
      });
    });
  });

  return { nodes: laidOut, byId };
}
