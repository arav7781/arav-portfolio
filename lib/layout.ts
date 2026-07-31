import { GraphNode, DomainId } from "../content/types";
import { NODES, DOMAINS } from "../content/corpus";
import { hubAngle, primaryDomain } from "./graph";

export interface LaidOutNode extends GraphNode {
  x: number;
  y: number;
  r: number;
}

/**
 * Resolves the polar placement (angle + radius) for a node within its domain group.
 * Multi-domain ("bridge") nodes are pulled toward the average direction of all their
 * domains — but several nodes can share the *exact same* domain set (and therefore
 * the exact same average angle), which used to stack them on top of each other. To
 * prevent that, every node is also nudged by its own index within the group, both in
 * angle and in radius, so siblings always end up visibly separated.
 */
function resolvePlacement(
  n: GraphNode,
  baseAngle: number,
  idx: number,
  count: number,
  spread: number,
  baseR: number,
  bridgeR: number,
  getDomainOrder: (dId: DomainId) => number,
): { angle: number; R: number } {
  const idxOffset = count > 1 ? idx - (count - 1) / 2 : 0;
  const isBridge = (n.domains?.length ?? 0) >= 2;

  if (!isBridge || !n.domains) {
    return { angle: baseAngle + idxOffset * spread, R: baseR };
  }

  const angles = n.domains.map((dId) => hubAngle(getDomainOrder(dId)));
  let sumX = 0, sumY = 0;
  angles.forEach((a) => { sumX += Math.cos(a); sumY += Math.sin(a); });
  const avgAngle = Math.atan2(sumY, sumX);
  const radiusStep = (baseR - bridgeR) * 0.6 || 20;

  return {
    angle: avgAngle + idxOffset * spread * 0.6,
    R: bridgeR + ((idx % 3) - 1) * radiusStep,
  };
}

export function computeLayout(): { nodes: LaidOutNode[]; byId: Map<string, LaidOutNode> } {
  const laidOut: LaidOutNode[] = [];
  const byId = new Map<string, LaidOutNode>();

  const getDomainOrder = (dId: DomainId): number => {
    const d = DOMAINS.find((dom) => dom.id === dId);
    return d ? d.order : 0;
  };

  // 1. Center node (Arav)
  const centerNode: LaidOutNode = {
    ...NODES.find((n) => n.id === "arav")!,
    x: 0,
    y: 0,
    r: 28,
  };
  laidOut.push(centerNode);
  byId.set(centerNode.id, centerNode);

  // 2. Domain nodes (placed on a ring at R = 190)
  DOMAINS.forEach((d) => {
    const angle = hubAngle(d.order);
    const domainNode: LaidOutNode = {
      ...NODES.find((n) => n.id === `domain-${d.id}`)!,
      x: 190 * Math.cos(angle),
      y: 190 * Math.sin(angle),
      r: 18,
    };
    laidOut.push(domainNode);
    byId.set(domainNode.id, domainNode);
  });

  const groups: Record<string, GraphNode[]> = {};
  NODES.forEach((n) => {
    if (n.id === "arav" || n.type === "domain") return;
    const pd = primaryDomain(n) || "ai";
    const key = `${n.type}-${pd}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  // Radii: inner (R = 260), projects (R = 340), skills (R = 420)
  DOMAINS.forEach((d) => {
    const baseAngle = hubAngle(d.order);

    // Achievements/Experiences group around domain
    const achs = groups[`achievement-${d.id}`] || [];
    const exps = groups[`experience-${d.id}`] || [];
    const innerNodes = [...achs, ...exps];
    innerNodes.forEach((n, idx) => {
      const count = innerNodes.length;
      const spread = 0.28;
      const { angle: finalAngle, R } = resolvePlacement(n, baseAngle, idx, count, spread, 260, 230, getDomainOrder);

      const laid: LaidOutNode = {
        ...n,
        x: R * Math.cos(finalAngle),
        y: R * Math.sin(finalAngle),
        r: n.type === "achievement" ? 11 : 12.5,
      };
      laidOut.push(laid);
      byId.set(n.id, laid);
    });

    // Projects group around domain
    const projs = groups[`project-${d.id}`] || [];
    projs.forEach((n, idx) => {
      const count = projs.length;
      const spread = 0.35;
      const { angle: finalAngle, R } = resolvePlacement(n, baseAngle, idx, count, spread, 340, 300, getDomainOrder);

      const laid: LaidOutNode = {
        ...n,
        x: R * Math.cos(finalAngle),
        y: R * Math.sin(finalAngle),
        r: 13,
      };
      laidOut.push(laid);
      byId.set(n.id, laid);
    });

    // Skills group around domain
    const sks = groups[`skill-${d.id}`] || [];
    sks.forEach((n, idx) => {
      const count = sks.length;
      const spread = 0.38;
      const { angle: finalAngle, R } = resolvePlacement(n, baseAngle, idx, count, spread, 420, 390, getDomainOrder);

      const laid: LaidOutNode = {
        ...n,
        x: R * Math.cos(finalAngle),
        y: R * Math.sin(finalAngle),
        r: 8.5,
      };
      laidOut.push(laid);
      byId.set(n.id, laid);
    });
  });

  return { nodes: laidOut, byId };
}
