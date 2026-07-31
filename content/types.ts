export type NodeType = "person" | "domain" | "project" | "experience" | "achievement" | "skill";
export type DomainId = "ai" | "backend" | "frontend" | "nlp" | "cloud" | "data";

export interface LinkItem {
  label: string;
  href: string;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  desc?: string;
  summary?: string;
  domains?: DomainId[];
  domainId?: DomainId; // only for type === "domain"
  hasPage?: boolean;
  /** ids of other nodes this one directly relates to (e.g. an experience/achievement → the project it produced) */
  relatedTo?: string[];
  meta?: {
    period?: string;
    role?: string;
    org?: string;
    location?: string;
    impact?: string;
    stack?: string[];
  };
  links?: LinkItem[];
}
