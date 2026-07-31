import { GraphNode, DomainId } from "../content/types";
import { NODES, DOMAINS, NODE_BY_ID } from "../content/corpus";

export interface GraphEdge {
  source: string;
  target: string;
  kind?: string;
  domain?: DomainId;
}

export function primaryDomain(node: GraphNode): DomainId | undefined {
  if (node.type === "domain") return node.domainId;
  return node.domains?.[0];
}

export function isBridge(node: GraphNode): boolean {
  return (node.domains?.length ?? 0) >= 2;
}

export function hubAngle(order: number): number {
  return (order * 2 * Math.PI) / DOMAINS.length - Math.PI / 2;
}

export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (source: string, target: string, kind: string) => {
    const key = `${source}|${target}|${kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, kind });
  };

  // Connect Arav to all 5 domain nodes
  DOMAINS.forEach((d) => {
    edges.push({
      source: "arav",
      target: `domain-${d.id}`,
      kind: "person-domain",
      domain: d.id,
    });
  });

  // Connect other nodes to their domains
  NODES.forEach((node) => {
    if (node.id === "arav" || node.type === "domain") return;

    if (node.domains && node.domains.length > 0) {
      node.domains.forEach((dId) => {
        edges.push({
          source: `domain-${dId}`,
          target: node.id,
          kind: node.type === "skill" ? "domain-skill" : "domain",
          domain: dId,
        });
      });
    }
  });

  // Direct experience/achievement → project relations only (kept off "arav" so
  // hovering the center node still just lights up the 6 domains, like before).
  NODES.forEach((node) => {
    if (!node.relatedTo || node.relatedTo.length === 0) return;
    node.relatedTo.forEach((targetId) => {
      if (!NODE_BY_ID[targetId]) return;
      const kind = node.type === "achievement" ? "awarded-for" : "built";
      addEdge(node.id, targetId, kind);
    });
  });

  return { nodes: NODES, edges };
}

export function buildAdjacency(edges: GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();

  edges.forEach((e) => {
    const s = adj.get(e.source) || [];
    if (!s.includes(e.target)) {
      s.push(e.target);
      adj.set(e.source, s);
    }

    const t = adj.get(e.target) || [];
    if (!t.includes(e.source)) {
      t.push(e.source);
      adj.set(e.target, t);
    }
  });

  return adj;
}
