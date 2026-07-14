import { GraphNode, DomainId } from "./types";

export const DOMAINS = [
  { id: "ai", key: "AI/ML", label: "AI & Machine Learning", order: 0, desc: "Deep Learning, PyTorch, GenAI" },
  { id: "web", key: "Web Dev", label: "Full-Stack Web Dev", order: 1, desc: "Next.js, React, Node.js, WebSockets" },
  { id: "nlp", key: "NLP/LLMs", label: "NLP & Agentic AI", order: 2, desc: "Conversational AI, Langgraph, RAG" },
  { id: "cv", key: "Vision", label: "Computer Vision", order: 3, desc: "OpenCV, Deep Vision, vital sensing" },
  { id: "data", key: "Data/DB", label: "Data & Databases", order: 4, desc: "SQL, Convex, MongoDB, Analytics" },
] as const;

export const NODES: GraphNode[] = [
  // Center
  {
    id: "arav",
    type: "person",
    label: "Arav Saxena",
    desc: "AI Researcher and Full-Stack Developer focusing on scalable agentic systems, computer vision, and modern web architectures.",
    summary: "AI Researcher & Software Engineer.",
    domains: ["ai", "web", "nlp", "cv", "data"],
    meta: {
      location: "Pune, India",
      role: "AI Researcher & Full-Stack Developer",
      org: "SIT Pune",
    },
    links: [
      { label: "GitHub", href: "https://github.com/arav7781" },
      { label: "LinkedIn", href: "https://linkedin.com/in/arav-saxena-a081a428a" }
    ]
  },

  // Domains
  { id: "domain-ai", type: "domain", label: "AI & Machine Learning", domainId: "ai", desc: "Core Deep Learning models, Neural Networks, and AI algorithms." },
  { id: "domain-web", type: "domain", label: "Full-Stack Web Dev", domainId: "web", desc: "Interactive modern web applications and backend systems." },
  { id: "domain-nlp", type: "domain", label: "NLP & Agentic AI", domainId: "nlp", desc: "Conversational agents, Reasoning LLMs, Langgraph, and NLP systems." },
  { id: "domain-cv", type: "domain", label: "Computer Vision", domainId: "cv", desc: "Feature detection, vital tracking models, and image processing." },
  { id: "domain-data", type: "domain", label: "Data & Databases", domainId: "data", desc: "Relational/NoSQL systems, vector indexing, and visual analytics." },

  // Projects
  {
    id: "gurukulx",
    type: "project",
    label: "GurukulX",
    desc: "A comprehensive AI-driven platform for educators featuring custom coding assistants, data visualization agents, and intelligent workflow automation.",
    summary: "Educator enablement platform powered by Agentic AI.",
    domains: ["nlp", "web", "ai"],
    meta: {
      period: "2024 - 2025",
      impact: "Simplifies school administration and content generation for educators.",
      stack: ["ReactJS", "NextJS", "NodeJS", "Langgraph", "LangChain", "ConvexDB", "Tensorflow", "WebSockets"],
    },
    links: [{ label: "Live Demo", href: "https://gurukul-x.vercel.app/" }]
  },
  {
    id: "blueboxai",
    type: "project",
    label: "BlueBoxAI",
    desc: "Automated SQL Query generator and business intelligence dashboard. Allows natural language database querying and builds real-time sales reports.",
    summary: "AI Business Intelligence & SQL Agent.",
    domains: ["data", "ai", "web"],
    meta: {
      period: "2025",
      impact: "Enables non-technical users to run complex SQL queries securely.",
      stack: ["Python", "SQL", "crewai", "MCP Protocol", "NextJS", "D3.js", "LangChain"],
    },
    links: [{ label: "YouTube Demo", href: "https://www.youtube.com/watch?v=lhF5r3meSQ8" }]
  },
  {
    id: "clarvis",
    type: "project",
    label: "ClarvisIntelliTutor",
    desc: "Voice-to-voice interview tutor and student evaluator. Uses conversational LLMs to conduct mock interviews and deliver practice questions dynamically.",
    summary: "AI-Powered voice study assistant.",
    domains: ["nlp", "web"],
    meta: {
      period: "2024",
      impact: "Highly-responsive oral mock interviews.",
      stack: ["Python", "MongoDB", "LangChain", "Langgraph", "Streamlit", "WebSockets"],
    },
    links: [{ label: "Demo Channel", href: "https://www.youtube.com/channel/UCrhHjJ-5o4xj5lApF9SU0wg" }]
  },
  {
    id: "agenticcv",
    type: "project",
    label: "AgenticCV",
    desc: "Natural language-driven computer vision application enabling users to perform object tracking, segmenting, and counting via text queries without writing code.",
    summary: "Text-to-Computer-Vision tool.",
    domains: ["cv", "ai"],
    meta: {
      period: "2025",
      impact: "Featured in published research paper.",
      stack: ["Python", "OpenCV", "Tensorflow", "Langgraph", "Streamlit"],
    },
    links: [{ label: "Source Code", href: "https://github.com/arav7781" }]
  },
  {
    id: "bharatiques",
    type: "project",
    label: "BharatiQues",
    desc: "Automated test generator that transcribes and analyzes video lectures or syllabus PDFs to formulate balanced examinations.",
    summary: "AI Question Paper Generator.",
    domains: ["nlp", "ai"],
    meta: {
      period: "2024",
      impact: "Reduces teacher prep time by over 70%.",
      stack: ["Python", "Flask", "Langgraph", "VectorDB", "Speech to Text"],
    },
    links: [{ label: "Video Demo", href: "https://www.youtube.com/watch?v=NbSqIuee8jI" }]
  },
  {
    id: "vitalsense",
    type: "project",
    label: "VitalSense",
    desc: "Contactless vital signs monitor. Uses camera feed to measure heart rate and HRV via deep learning PPG signal analysis.",
    summary: "Deep Learning contactless PPG monitor.",
    domains: ["cv", "data", "web"],
    meta: {
      period: "2025",
      impact: "High accuracy contactless vitals monitoring.",
      stack: ["Python", "dlib", "MTNN", "Tensorflow", "Flask", "NextJS", "MongoDB"],
    },
    links: [{ label: "Video Demo", href: "https://www.youtube.com/watch?v=r8OIVnjbDOg" }]
  },

  // Achievements / Experiences
  {
    id: "patent-arogya",
    type: "achievement",
    label: "Patent: ArogyaNext",
    desc: "Filed USPTO patent for a predictive AI-powered health guidance system providing localized medical intelligence.",
    summary: "USPTO health AI patent.",
    domains: ["ai", "cv"],
    meta: {
      period: "2025",
      org: "USPTO",
      impact: "Contactless vitals tracking + LLM-based guidance integration.",
    }
  },
  {
    id: "paper-agenticcv",
    type: "achievement",
    label: "Research Paper: AgenticCV",
    desc: "Authored and published first-author research paper outlining text-driven computer vision systems with zero-code capability.",
    summary: "Research publication on Agentic CV.",
    domains: ["cv", "ai"],
    meta: {
      period: "2025",
      org: "articleX",
      impact: "Academic publication highlighting Langgraph + OpenCV patterns.",
    }
  },
  {
    id: "hackathon-sastra",
    type: "achievement",
    label: "Hackathon Finalist",
    desc: "Finalist at the SASTRA University hackathon with a generative voice agent solution for mock interview training.",
    summary: "Sastra Hackathon Finalist.",
    domains: ["nlp", "web"],
    meta: {
      period: "2024",
      org: "SASTRA University",
    }
  },
  {
    id: "hack-your-path",
    type: "achievement",
    label: "3rd Place - Hack your Path",
    desc: "Secured 3rd place nationally in Hack your Path 6.0 for creating an innovative multi-agent healthcare solution.",
    summary: "3rd in National Hackathon.",
    domains: ["ai", "nlp"],
    meta: {
      period: "2025",
      org: "Hack your Path 6.0",
    }
  },

  // Skills as supporting nodes
  { id: "skill-python", type: "skill", label: "Python", domains: ["ai", "nlp", "cv"] },
  { id: "skill-langgraph", type: "skill", label: "Langgraph", domains: ["nlp", "ai"] },
  { id: "skill-tensorflow", type: "skill", label: "Tensorflow", domains: ["ai", "cv"] },
  { id: "skill-nextjs", type: "skill", label: "Next.js", domains: ["web"] },
  { id: "skill-react", type: "skill", label: "React.js", domains: ["web"] },
  { id: "skill-sql", type: "skill", label: "SQL", domains: ["data"] },
  { id: "skill-convex", type: "skill", label: "Convex", domains: ["data", "web"] },
  { id: "skill-mcp", type: "skill", label: "MCP Protocol", domains: ["data", "nlp"] },
];

export const NODE_BY_ID: Record<string, GraphNode> = NODES.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {} as Record<string, GraphNode>);
