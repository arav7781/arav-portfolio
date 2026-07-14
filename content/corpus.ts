import { GraphNode, DomainId } from "./types";

export const DOMAINS = [
  { id: "ai", key: "AI/ML", label: "AI & Machine Learning", order: 0, desc: "Deep Learning, PyTorch, quantization" },
  { id: "web", key: "Web Dev", label: "Full-Stack Web Dev", order: 1, desc: "Next.js, SpringBoot, NestJS, APIs" },
  { id: "nlp", key: "NLP/LLMs", label: "NLP & Agentic AI", order: 2, desc: "LangChain, LangGraph, RAG, agents" },
  { id: "cloud", key: "Cloud/DevOps", label: "Cloud & DevOps", order: 3, desc: "AWS, Azure, Docker, Kubernetes, CI/CD" },
  { id: "data", key: "Data/BI", label: "Data & Analytics", order: 4, desc: "SQL, PostgreSQL, PySpark, BI Dashboards" },
] as const;

export const NODES: GraphNode[] = [
  // Center
  {
    id: "arav",
    type: "person",
    label: "Arav Saxena",
    desc: "Software engineer and full-stack developer focused on scalable systems, intelligent applications, cloud-native engineering, and agentic AI. 2+ years building data pipelines and dashboards.",
    summary: "AI Researcher & Software Engineer.",
    domains: ["ai", "web", "nlp", "cloud", "data"],
    meta: {
      location: "Pune, India",
      role: "AI Researcher & Full-Stack Developer",
      org: "SIT Pune",
    },
    links: [
      { label: "GitHub", href: "https://github.com/arav7781" },
      { label: "LinkedIn", href: "https://linkedin.com/in/arav-saxena-a081a428a" },
      { label: "LeetCode", href: "https://leetcode.com/u/arav_7782" }
    ]
  },

  // Domains
  { id: "domain-ai", type: "domain", label: "AI & Machine Learning", domainId: "ai", desc: "Core Deep Learning, Quantization, and Reinforcement Learning." },
  { id: "domain-web", type: "domain", label: "Full-Stack Web Dev", domainId: "web", desc: "Responsive client interfaces, microservices, and distributed backends." },
  { id: "domain-nlp", type: "domain", label: "NLP & Agentic AI", domainId: "nlp", desc: "Conversational voice agents, hybrid RAG, and multi-agent workflows." },
  { id: "domain-cloud", type: "domain", label: "Cloud & DevOps", domainId: "cloud", desc: "Containerized deployments, event streaming, and cloud resource schedulers." },
  { id: "domain-data", type: "domain", label: "Data & Analytics", domainId: "data", desc: "Relational/NoSQL databases, visual business dashboards, and ETL pipelines." },

  // Projects
  {
    id: "marketplace",
    type: "project",
    label: "Asset Marketplace",
    desc: "Built a highly scalable NFT marketplace utilizing Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Event Sourcing architecture. Integrated Stripe, Coinbase, and BitPay for transactions alongside custom ERC721 smart contracts.",
    summary: "Decentralized NFT marketplace & payment workflow.",
    domains: ["web", "data", "cloud"],
    meta: {
      period: "2021 - Present",
      impact: "Secure payment workflows & digital asset trading inside an NX Monorepo.",
      stack: ["TypeScript", "NodeJS", "NestJS", "MongoDB", "EventStoreDB", "GraphQL", "Solidity", "AWS"],
    },
    links: [{ label: "Case File", href: "https://github.com/arav7781" }]
  },
  {
    id: "freight",
    type: "project",
    label: "Freight Platform",
    desc: "Engineered an event-driven logistics bidding platform using microservices, Kafka messaging, and MongoDB projections. Built tracking services with Redis caching layers and GraphQL APIs, solving auditability challenges.",
    summary: "Event-driven logistics bidding microservices.",
    domains: ["web", "cloud", "data"],
    meta: {
      period: "2024 - 2025",
      impact: "Asynchronous distributed logistics bidding with solid auditability.",
      stack: ["Java", "SpringBoot", "Kafka", "MongoDB", "Redis", "GraphQL", "Docker", "AWS"],
    },
    links: [{ label: "Case File", href: "https://github.com/arav7781" }]
  },
  {
    id: "sql-assistant",
    type: "project",
    label: "SQL Analytics Assistant",
    desc: "Developed an Agentic AI-powered business intelligence platform that translates natural language queries into optimized SQL. Incorporates intelligent schema routing, semantic validation, and vector database indices.",
    summary: "Natural Language SQL query generation agent.",
    domains: ["ai", "nlp", "data", "cloud"],
    meta: {
      period: "2026",
      impact: "Improves query execution efficiency by 35% on join-heavy tables.",
      stack: ["Python", "FastAPI", "PostgreSQL", "Vector Databases", "Docker", "AWS", "LangChain", "LangGraph", "unsloth"],
    },
    links: [{ label: "Case File", href: "https://github.com/arav7781" }]
  },
  {
    id: "healthquery",
    type: "project",
    label: "HealthQueryAI",
    desc: "Deployed visual and text-based medical language models on Hugging Face (Qwen0.5B-finetuned and Llama3.2-11B-VisionMed). Utilized GRPO reinforcement learning to optimize image analysis and health query assessments.",
    summary: "Fine-tuned medical vision & query LLMs.",
    domains: ["ai", "nlp"],
    meta: {
      period: "2025",
      impact: "Achieved 90% accuracy in medical query responses for 500+ users.",
      stack: ["bitsandbytes", "unsloth", "wandb", "Hugging Face"],
    },
    links: [{ label: "Hugging Face Models", href: "https://huggingface.co/devank2000" }]
  },
  {
    id: "legalrag",
    type: "project",
    label: "LegalRAG",
    desc: "Architected a GraphRAG system using Neo4j and vector hybrid search. Enables natural language queries over 10k+ court PDF documents and judgements for the Indian judiciary, reducing research time by 30%. Patent filed for this architecture.",
    summary: "GraphRAG legal research platform for Indian judiciary.",
    domains: ["nlp", "data", "ai", "web"],
    meta: {
      period: "2025",
      impact: "Used by 200+ legal professionals to search complex multi-hop cases.",
      stack: ["Python", "Neo4j", "LangChain", "LangGraph", "Docker", "PostgreSQL", "MLflow", "LangSmith"],
    },
    links: [{ label: "Live Site", href: "https://legal-search-case-files.vercel.app/" }]
  },
  {
    id: "gurukulx",
    type: "project",
    label: "GurukulX",
    desc: "Developed an AI educational platform integrated with Llama-based voice agents. Features automated lesson planning, interactive query answering, and productivity workflows, improving teacher efficiency by 25%.",
    summary: "Voice-enabled lesson planning for educators.",
    domains: ["nlp", "web", "ai"],
    meta: {
      period: "2024",
      impact: "Adopted across 50+ schools to assist over 100+ educators.",
      stack: ["ReactJS", "NextJS", "Llama 3.3", "MongoDB", "LangChain", "LangGraph", "LangSmith", "Vercel"],
    },
    links: [{ label: "Live Demo", href: "https://gurukul-x.vercel.app/" }]
  },
  {
    id: "arogyamitra",
    type: "project",
    label: "ArogyaMitra",
    desc: "Built a healthcare voice agent platform for rural providers. Integrated Whisper Speech-to-Text and Google Text-to-Speech to deliver multilingual audio-based diagnostic routing.",
    summary: "Multilingual voice agent for patient triage.",
    domains: ["nlp", "ai", "web"],
    meta: {
      period: "2024 - 2025",
      impact: "Enhanced patient triage efficiency by 40% for rural health clinics.",
      stack: ["ReactJS", "TailwindCSS", "FastAPI", "NodeJS", "Convex DB", "PyTorch", "Whisper STT", "Google TTS", "Docker"],
    },
    links: [{ label: "Source Code", href: "https://github.com/AGTechathon/DataWizard" }]
  },
  {
    id: "dashboard",
    type: "project",
    label: "E-Commerce Dashboard",
    desc: "Engineered a 5-page executive BI dashboard. Set up a PySpark-to-S3 ETL pipeline processing 50k+ transactions. Applied Random Forest models to forecast delivery delays, using SMOTE to handle imbalanced delivery metrics.",
    summary: "PySpark-to-S3 ETL and logistics BI dashboard.",
    domains: ["data", "cloud"],
    meta: {
      period: "2024",
      impact: "Improved recall for imbalanced Late Delivery classes by 22%.",
      stack: ["Power BI", "SQL", "PySpark", "AWS S3", "Python", "Tableau"],
    },
    links: [{ label: "Source Code", href: "https://github.com/arav7781" }]
  },
  {
    id: "bluebox",
    type: "project",
    label: "BlueBoxAI",
    desc: "Developed an AI analytics agent that translates natural business language queries into SQL. Employs few-shot prompting to compile join-heavy SQL blocks and validates database parameters dynamically.",
    summary: "Natural language query translations to SQL database.",
    domains: ["data", "ai"],
    meta: {
      period: "2025",
      impact: "Achieved 89% translation accuracy on complex query joins.",
      stack: ["SQL", "Python", "LLMs", "BI Analytics"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781" }]
  },

  // Experience
  {
    id: "scaai-intern",
    type: "experience",
    label: "Research Intern @ SCAAI",
    desc: "Drove AI research to enhance data analytics and ML solutions. Built SQL anomaly detection dashboards tracking daily transaction discrepancies, automated legal document retrieval pipelines, and optimized model inference using LLaMA.cpp quantization.",
    summary: "AI Researcher at Symbiosis Centre for Applied AI.",
    domains: ["cloud", "ai", "data", "nlp"],
    meta: {
      period: "Jul 2025 - Present",
      role: "Research Intern",
      org: "SCAAI Pune",
      impact: "Reduced false-positives by 18%, lowered search times by 35%, and cut latency by 20%.",
      stack: ["Python", "Pandas", "PySpark", "SQL", "Tableau", "LangChain", "CrewAI", "TensorFlow", "PostgreSQL", "Docker", "Kubernetes", "llama.cpp", "CodeCarbon"],
    }
  },

  // Achievements
  {
    id: "paper-agcv",
    type: "achievement",
    label: " Elsevier Publication",
    desc: "Co-authored and published research paper titled 'Agentic Computer Vision (AgCV)...' in the prestigious MethodX Journal (Elsevier).",
    summary: "Published paper in MethodX Journal.",
    domains: ["ai"],
    meta: {
      period: "2025",
      org: "Elsevier MethodX",
    }
  },
  {
    id: "patent-agcv",
    type: "achievement",
    label: "Patent Granted: AgCV",
    desc: "Granted Indian Patent for 'AgCV: An Agentic Framework for Automating Computer Vision Applications'.",
    summary: "AgCV agentic computer vision patent.",
    domains: ["ai"],
    meta: {
      period: "2025",
      org: "Indian Patent Office",
    }
  },
  {
    id: "patent-legal",
    type: "achievement",
    label: "Patent Filed: Legal Reasoning System",
    desc: "Filed patent for 'Multimodal Agentic AI-Based Context-Aware Legal Reasoning System' optimized for courtroom document search.",
    summary: "Legal reasoning RAG patent filed.",
    domains: ["nlp"],
    meta: {
      period: "2025",
      org: "Patent Office",
    }
  },
  {
    id: "award-patil",
    type: "achievement",
    label: "3rd Place - AG Patil Hackathon",
    desc: "Won 3rd place and 10k cash prize for solution designing a data-driven healthcare analytics system.",
    summary: "3rd place finish out of 150+ teams.",
    domains: ["ai"],
    meta: {
      period: "2025",
      org: "AG Patil Hackathon",
    }
  },
  {
    id: "award-path",
    type: "achievement",
    label: "3rd Place - Hack Your Path 6.0",
    desc: "Won 3rd place and 12k cash prize for creating a multilingual voice agent system.",
    summary: "3rd place finish in national hackathon.",
    domains: ["nlp"],
    meta: {
      period: "2025",
      org: "Hack Your Path 6.0",
    }
  },
  {
    id: "leetcode-solutions",
    type: "achievement",
    label: "250+ LeetCode Solutions",
    desc: "Solved 250+ data structures and algorithms problems on LeetCode, optimizing runtime and space efficiency.",
    summary: "Algorithm problem solver.",
    domains: ["ai"],
    meta: {
      period: "Ongoing",
      org: "LeetCode",
    }
  },

  // Education
  {
    id: "edu-sit",
    type: "achievement",
    label: "B.Tech in AI & ML",
    desc: "Pursuing Bachelor of Technology in Artificial Intelligence and Machine Learning at Symbiosis Institute of Technology, Pune.",
    summary: "B.Tech Candidate (Expected 2027).",
    domains: ["ai"],
    meta: {
      period: "2023 - 2027",
      org: "SIT Pune",
    }
  },

  // Skills
  { id: "skill-python", type: "skill", label: "Python", domains: ["ai", "nlp", "data"] },
  { id: "skill-java", type: "skill", label: "Java", domains: ["web"] },
  { id: "skill-sql", type: "skill", label: "SQL", domains: ["data"] },
  { id: "skill-javascript", type: "skill", label: "JavaScript", domains: ["web"] },
  { id: "skill-typescript", type: "skill", label: "TypeScript", domains: ["web"] },
  { id: "skill-springboot", type: "skill", label: "SpringBoot", domains: ["web"] },
  { id: "skill-fastapi", type: "skill", label: "FastAPI", domains: ["web"] },
  { id: "skill-nestjs", type: "skill", label: "NestJS", domains: ["web"] },
  { id: "skill-mongodb", type: "skill", label: "MongoDB", domains: ["data"] },
  { id: "skill-postgres", type: "skill", label: "PostgreSQL", domains: ["data"] },
  { id: "skill-redis", type: "skill", label: "Redis", domains: ["data"] },
  { id: "skill-eventstore", type: "skill", label: "EventStoreDB", domains: ["data"] },
  { id: "skill-kafka", type: "skill", label: "Kafka", domains: ["cloud", "data"] },
  { id: "skill-docker", type: "skill", label: "Docker", domains: ["cloud"] },
  { id: "skill-k8s", type: "skill", label: "Kubernetes", domains: ["cloud"] },
  { id: "skill-aws", type: "skill", label: "AWS", domains: ["cloud"] },
  { id: "skill-azure", type: "skill", label: "Azure", domains: ["cloud"] },
  { id: "skill-git", type: "skill", label: "Git", domains: ["cloud"] },
  { id: "skill-langchain", type: "skill", label: "LangChain", domains: ["nlp", "ai"] },
  { id: "skill-langgraph", type: "skill", label: "LangGraph", domains: ["nlp", "ai"] },
];

export const NODE_BY_ID: Record<string, GraphNode> = NODES.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {} as Record<string, GraphNode>);
