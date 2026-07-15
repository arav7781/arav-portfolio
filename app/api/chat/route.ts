import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { DOMAINS, NODES } from "@/content/corpus"

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Generate structured context from Arav's knowledge graph (content/corpus.ts)
function getKnowledgeGraphContext(): string {
  let ctx = "KNOWLEDGE GRAPH CONTEXT (Arav's Portfolio):\n\n";

  ctx += "DOMAINS:\n";
  DOMAINS.forEach((d) => {
    ctx += `- ${d.label} (ID: ${d.id}): ${d.desc}\n`;
  });

  ctx += "\nPROJECTS:\n";
  const projects = NODES.filter((n) => n.type === "project");
  projects.forEach((p) => {
    ctx += `- ${p.label} (ID: ${p.id}): ${p.desc || ""} [Summary: ${p.summary || ""}] [Domains: ${p.domains?.join(", ") || ""}]`;
    if (p.meta) {
      ctx += ` [Period: ${p.meta.period || ""}] [Stack: ${p.meta.stack?.join(", ") || ""}] [Impact: ${p.meta.impact || ""}]`;
    }
    ctx += "\n";
  });

  ctx += "\nEXPERIENCE:\n";
  const experience = NODES.filter((n) => n.type === "experience");
  experience.forEach((e) => {
    ctx += `- ${e.label} (ID: ${e.id}): ${e.desc || ""} [Summary: ${e.summary || ""}] [Domains: ${e.domains?.join(", ") || ""}]`;
    if (e.meta) {
      ctx += ` [Period: ${e.meta.period || ""}] [Role: ${e.meta.role || ""}] [Organization: ${e.meta.org || ""}] [Impact: ${e.meta.impact || ""}]`;
    }
    ctx += "\n";
  });

  ctx += "\nACHIEVEMENTS:\n";
  const achievements = NODES.filter((n) => n.type === "achievement");
  achievements.forEach((a) => {
    ctx += `- ${a.label} (ID: ${a.id}): ${a.desc || ""} [Summary: ${a.summary || ""}] [Domains: ${a.domains?.join(", ") || ""}]`;
    if (a.meta) {
      ctx += ` [Period: ${a.meta.period || ""}] [Organization: ${a.meta.org || ""}]`;
    }
    ctx += "\n";
  });

  ctx += "\nSKILLS:\n";
  const skills = NODES.filter((n) => n.type === "skill");
  skills.forEach((s) => {
    ctx += `- ${s.label} [Domains: ${s.domains?.join(", ") || ""}]\n`;
  });

  return ctx;
}

// Build system prompt dynamically
const buildSystemPrompt = () => {
  return `You are SAITAMA, the personal AI assistant and Agent for Arav Saxena, an AI Researcher & Backend/Full-Stack Developer.

Provide short, helpful, and highly accurate responses (1–3 lines max) about Arav and his work.
Always answer questions as SAITAMA, representing Arav's professional work, skills, education, and achievements. Ensure the tone is technical, intelligent, and direct.

Here is the structured KNOWLEDGE GRAPH context containing accurate details about Arav's projects, experience, achievements, and skills:

${getKnowledgeGraphContext()}

Always prioritize using the facts, stack details, and achievements described in the knowledge graph context above to give precise and truthful answers. If a user asks a question about information not present in the context, politely state that you only have access to Arav's verified portfolio data.`;
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Add the system prompt dynamically
    const fullMessages = [
      {
        role: "system",
        content: buildSystemPrompt(),
      },
      ...messages,
    ]

    // Call Groq API with Llama model
    const completion = await groq.chat.completions.create({
      messages: fullMessages,
      model: "llama-3.3-70b-versatile", // Groq's Llama model
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    })

    // Return the response
    return NextResponse.json({
      response: completion.choices[0].message.content,
    })
  } catch (error) {
    console.error("Error calling Groq API:", error)
    return NextResponse.json({ error: "Failed to get response from Groq" }, { status: 500 })
  }
}
