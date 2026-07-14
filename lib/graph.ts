import { GraphNode, DomainId } from "../content/types";
import { NODES, DOMAINS } from "../content/corpus";

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
