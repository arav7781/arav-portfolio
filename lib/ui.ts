import { DomainId } from "../content/types";

export function domainVar(domain: DomainId): string {
  switch (domain) {
    case "ai":
      return "var(--c-ai)";
    case "web":
      return "var(--c-web)";
    case "nlp":
      return "var(--c-nlp)";
    case "cv":
      return "var(--c-cv)";
    case "data":
      return "var(--c-data)";
    default:
      return "var(--muted)";
  }
}
