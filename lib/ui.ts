import { DomainId } from "../content/types";

export function domainVar(domain: DomainId): string {
  switch (domain) {
    case "ai":
      return "var(--c-ai)";
    case "backend":
      return "var(--c-backend)";
    case "frontend":
      return "var(--c-frontend)";
    case "nlp":
      return "var(--c-nlp)";
    case "cloud":
      return "var(--c-cv)";
    case "data":
      return "var(--c-data)";
    default:
      return "hsl(var(--muted-foreground))";
  }
}
