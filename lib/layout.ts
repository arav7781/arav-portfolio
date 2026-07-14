import { GraphNode, DomainId } from "../content/types";
import { NODES, DOMAINS } from "../content/corpus";
import { hubAngle, primaryDomain } from "./graph";

export interface LaidOutNode extends GraphNode {
  x: number;
  y: number;
  r: number;
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
      const angle = baseAngle + (count > 1 ? (idx - (count - 1) / 2) * spread : 0);
      const isBridge = (n.domains?.length ?? 0) >= 2;
      const R = isBridge ? 230 : 260;
      
      let finalAngle = angle;
      if (isBridge && n.domains) {
        const angles = n.domains.map(dId => hubAngle(getDomainOrder(dId)));
        let sumX = 0, sumY = 0;
        angles.forEach(a => { sumX += Math.cos(a); sumY += Math.sin(a); });
        finalAngle = Math.atan2(sumY, sumX);
      }

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
      const angle = baseAngle + (count > 1 ? (idx - (count - 1) / 2) * spread : 0);
      const isBridge = (n.domains?.length ?? 0) >= 2;
      const R = isBridge ? 300 : 340;

      let finalAngle = angle;
      if (isBridge && n.domains) {
        const angles = n.domains.map(dId => hubAngle(getDomainOrder(dId)));
        let sumX = 0, sumY = 0;
        angles.forEach(a => { sumX += Math.cos(a); sumY += Math.sin(a); });
        finalAngle = Math.atan2(sumY, sumX);
      }

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
      const angle = baseAngle + (count > 1 ? (idx - (count - 1) / 2) * spread : 0);
      const isBridge = (n.domains?.length ?? 0) >= 2;
      const R = isBridge ? 390 : 420;

      let finalAngle = angle;
      if (isBridge && n.domains) {
        const angles = n.domains.map(dId => hubAngle(getDomainOrder(dId)));
        let sumX = 0, sumY = 0;
        angles.forEach(a => { sumX += Math.cos(a); sumY += Math.sin(a); });
        finalAngle = Math.atan2(sumY, sumX);
      }

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
