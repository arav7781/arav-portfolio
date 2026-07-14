import { GraphNode, DomainId } from "./types";

export const DOMAINS = [
  { id: "ai", key: "AI/ML", label: "AI & Machine Learning", order: 0, desc: "Deep Learning, PyTorch, computer vision, optimization" },
  { id: "backend", key: "Backend", label: "Backend Engineering", order: 1, desc: "Distributed systems, microservices, Saga orchestration, Kafka, Spring Boot" },
  { id: "frontend", key: "Frontend", label: "Frontend Engineering", order: 2, desc: "React, Next.js, WebGL canvas, specular layouts, interactive state graphs" },
  { id: "nlp", key: "NLP/LLMs", label: "NLP & Agentic AI", order: 3, desc: "LangChain, LangGraph, custom fine-tuned VLMs, multi-agent frameworks" },
  { id: "cloud", key: "Cloud/DevOps", label: "Cloud & DevOps", order: 4, desc: "AWS (EKS, EC2, S3), Azure, Docker, Terraform, ArgoCD, GitOps" },
  { id: "data", key: "Data/BI", label: "Data & Analytics", order: 5, desc: "SQL, PostgreSQL, Neo4j, PySpark, EventStoreDB, BI Dashboards" },
] as const;

export const NODES: GraphNode[] = [
  // Center
  {
    id: "arav",
    type: "person",
    label: "Arav Saxena",
    desc: "Backend and AI/ML engineer focused on high-throughput distributed systems, event-driven architectures, cloud-native deployments, and agentic AI models.",
    summary: "Distributed Systems & AI/ML Engineer.",
    domains: ["ai", "backend", "frontend", "nlp", "cloud", "data"],
    meta: {
      location: "Pune, India",
      role: "Backend & AI/ML Engineer",
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
  { id: "domain-backend", type: "domain", label: "Backend Engineering", domainId: "backend", desc: "High-throughput microservices, event-driven architectures, and distributed systems." },
  { id: "domain-frontend", type: "domain", label: "Frontend Engineering", domainId: "frontend", desc: "Interactive web experiences, theme-adaptive styling, and smooth component loops." },
  { id: "domain-nlp", type: "domain", label: "NLP & Agentic AI", domainId: "nlp", desc: "Conversational audio agents, hybrid GraphRAG, and multi-agent systems." },
  { id: "domain-cloud", type: "domain", label: "Cloud & DevOps", domainId: "cloud", desc: "Container orchestration, declarative IaC, and continuous GitOps reconciliation." },
  { id: "domain-data", type: "domain", label: "Data & Analytics", domainId: "data", desc: "Structured SQL, graph stores, stream logs, and business analytics." },

  // Projects
  {
    id: "marketplace",
    type: "project",
    label: "Asset Marketplace",
    desc: "Built a highly scalable NFT marketplace utilizing Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Event Sourcing architecture. Integrated payment integrations inside an NX Monorepo.",
    summary: "Decentralized NFT marketplace & payment workflow.",
    domains: ["backend", "data", "cloud"],
    meta: {
      period: "2021 - Present",
      impact: "Secure payment workflows & digital asset trading inside an NX Monorepo.",
      stack: ["TypeScript", "NodeJS", "NestJS", "MongoDB", "EventStoreDB", "GraphQL", "Solidity", "AWS"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/backend" }]
  },
  {
    id: "freight",
    type: "project",
    label: "Freight Bidding Platform",
    desc: "Engineered an event-driven logistics bidding platform using microservices, Kafka, Axon Framework, and Redis ZSET delayed event queues. Implemented CQRS and Event Sourcing to store workflow state, automatically recovering from failures with Saga compensations.",
    summary: "Event-driven logistics bidding microservices & delayed queue.",
    domains: ["backend", "cloud", "data"],
    meta: {
      period: "2024 - 2025",
      impact: "Asynchronous distributed logistics bidding with solid auditability.",
      stack: ["Java", "SpringBoot", "Kafka", "Axon Framework", "Redis ZSET", "MongoDB", "Kubernetes", "AWS"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/bharatHireSecure" }]
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
    links: [{ label: "GitHub", href: "https://github.com/arav7781/DataAnalystAgent" }]
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
    links: [{ label: "GitHub", href: "https://github.com/arav7781/SLM-MentalAssistance" }]
  },
  {
    id: "legalrag",
    type: "project",
    label: "LegalRAG",
    desc: "Architected a GraphRAG system using Neo4j and vector hybrid search. Enables natural language queries over 10k+ court PDF documents and judgements for the Indian judiciary, reducing research time by 30%. Patent filed for this architecture.",
    summary: "GraphRAG legal research platform for Indian judiciary.",
    domains: ["nlp", "data", "ai", "frontend"],
    meta: {
      period: "2025",
      impact: "Used by 200+ legal professionals to search complex multi-hop cases.",
      stack: ["Python", "Neo4j", "LangChain", "LangGraph", "Docker", "PostgreSQL", "MLflow", "LangSmith"],
    },
    links: [{ label: "Live Site", href: "https://legal-search-case-files.vercel.app/" }, { label: "GitHub", href: "https://github.com/arav7781/legalRAG" }]
  },
  {
    id: "gurukulx",
    type: "project",
    label: "GurukulX",
    desc: "Developed an AI educational platform integrated with Llama-based voice agents. Features automated lesson planning, interactive query answering, and productivity workflows, improving teacher efficiency by 25%.",
    summary: "Voice-enabled lesson planning for educators.",
    domains: ["nlp", "frontend", "ai"],
    meta: {
      period: "2024",
      impact: "Adopted across 50+ schools to assist over 100+ educators.",
      stack: ["ReactJS", "NextJS", "Llama 3.3", "MongoDB", "LangChain", "LangGraph", "LangSmith", "Vercel"],
    },
    links: [{ label: "Live Demo", href: "https://gurukul-x.vercel.app/" }, { label: "GitHub", href: "https://github.com/arav7781/GurukulX" }]
  },
  {
    id: "arogyamitra",
    type: "project",
    label: "ArogyaMitra",
    desc: "Built a healthcare voice agent platform for rural providers. Integrated Whisper Speech-to-Text and Google Text-to-Speech to deliver multilingual audio-based diagnostic routing.",
    summary: "Multilingual voice agent for patient triage.",
    domains: ["nlp", "ai", "frontend"],
    meta: {
      period: "2024 - 2025",
      impact: "Enhanced patient triage efficiency by 40% for rural health clinics.",
      stack: ["ReactJS", "TailwindCSS", "FastAPI", "NodeJS", "Convex DB", "PyTorch", "Whisper STT", "Google TTS", "Docker"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/DataWizard" }]
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
    links: [{ label: "GitHub", href: "https://github.com/arav7781/AG" }]
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
  {
    id: "dashing-vision",
    type: "project",
    label: "Dashing Vision",
    desc: "Developed an OS-level anti-cheat proctoring system that detects and terminates Electron overlays and mirrors, paired with a LiveKit-powered voice agent running VAD audio analysis.",
    summary: "OS-level interview anti-cheat & Voice AI proctoring tool.",
    domains: ["ai", "backend", "frontend"],
    meta: {
      period: "2025",
      impact: "Prevents screen overlays, background cheats, and AI voice assistance feeds.",
      stack: ["Python", "LiveKit", "NodeJS", "Process Killing", "Electron Detection", "Voice AI"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781" }]
  },
  {
    id: "posturesync",
    type: "project",
    label: "PostureSync",
    desc: "Co-developed an exercise posture correction system using MediaPipe pose keypoints, OpenCV processing, and Gemini VLMs to deliver speech-synthesized real-time trainer feedback.",
    summary: "Real-time AI posture feedback coach.",
    domains: ["ai", "frontend", "backend"],
    meta: {
      period: "2025",
      impact: "Allows high-precision posture evaluation via simple webcam feeds.",
      stack: ["Python", "MediaPipe", "OpenCV", "Gemini API", "NextJS", "AWS Lambda", "TTS"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781" }]
  },
  {
    id: "warehouse-twin",
    type: "project",
    label: "Warehouse Digital Twin",
    desc: "Developed an LLM-orchestrated WGAN-GP + Diffusion framework for synthesizing cost-efficient warehouse digital twins, bypassing resource-heavy 3D scene generators.",
    summary: "Generates semantic warehouse twins using WGAN-GP and Diffusion.",
    domains: ["ai", "nlp"],
    meta: {
      period: "2025",
      impact: "Cuts high computational rendering costs for industrial robot simulation pipelines.",
      stack: ["Python", "WGAN-GP", "Diffusion Models", "LLM Orchestration", "Reinforcement Learning"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781" }]
  },
  {
    id: "clinical-ai",
    type: "project",
    label: "Clinical AI Agent",
    desc: "Built an offline-first clinical AI assistant at AI BOOMI Startup Weekend, serving local patient report analysis through edge clinical agents.",
    summary: "Explainable local medical documentation assistant.",
    domains: ["ai", "nlp"],
    meta: {
      period: "2025",
      impact: "Provides offline medical file analysis without cloud overhead.",
      stack: ["Python", "LoRA", "Edge Inference", "NextJS", "Explainable AI"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781" }]
  },
  {
    id: "cron-scheduler",
    type: "project",
    label: "Cloud Cost Optimizer",
    desc: "Engineered a Kubernetes CronJob infrastructure orchestrator on AWS/Azure, shutting down idle EC2/EKS configurations, compressing logs, and warning Redis caches.",
    summary: "EKS worker nodes auto-scheduler.",
    domains: ["cloud", "backend"],
    meta: {
      period: "2025",
      impact: "Reduced monthly non-prod cloud resources bills by 45%.",
      stack: ["Kubernetes", "AWS EKS", "Azure", "Terraform", "ArgoCD", "GitOps", "Shell Scripting"],
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
    desc: "Co-authored and published research paper titled 'AgCV: An Agentic Framework for Automating Computer Vision Applications' in the prestigious MethodX Journal (Elsevier).",
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
    id: "patent-query",
    type: "achievement",
    label: "Patent Published: Multimodal AI",
    desc: "Published patent in Intellectual Property India Journal for 'System and Method for Multimodal AI-Driven Data Processing with Automated Query Execution'.",
    summary: "Published query automation patent.",
    domains: ["ai", "data"],
    meta: {
      period: "2025",
      org: "Intellectual Property India",
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
    label: "332 LeetCode Solutions",
    desc: "Solved 332 problems on LeetCode with 78.22% Acceptance (147 Easy, 170 Medium, 15 Hard). Beats up to 94.86% of submissions. Proficient in Java (277), MySQL (43), and C (29). Advanced skills include Dynamic Programming (x28), Divide & Conquer (x15), and Union-Find (x7).",
    summary: "Algorithm problem solver (332 Solved).",
    domains: ["ai", "data"],
    meta: {
      period: "Ongoing",
      org: "LeetCode",
      impact: "Solved 332 problems (Java, MySQL, C). Earned 3 badges (100 Days 2025).",
    }
  },
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
  { id: "skill-java", type: "skill", label: "Java", domains: ["backend"] },
  { id: "skill-sql", type: "skill", label: "SQL", domains: ["data"] },
  { id: "skill-javascript", type: "skill", label: "JavaScript", domains: ["frontend", "backend"] },
  { id: "skill-typescript", type: "skill", label: "TypeScript", domains: ["frontend", "backend"] },
  { id: "skill-springboot", type: "skill", label: "SpringBoot", domains: ["backend"] },
  { id: "skill-fastapi", type: "skill", label: "FastAPI", domains: ["backend"] },
  { id: "skill-nestjs", type: "skill", label: "NestJS", domains: ["backend"] },
  { id: "skill-mongodb", type: "skill", label: "MongoDB", domains: ["data"] },
  { id: "skill-postgres", type: "skill", label: "PostgreSQL", domains: ["data"] },
  { id: "skill-redis", type: "skill", label: "Redis", domains: ["data"] },
  { id: "skill-eventstore", type: "skill", label: "EventStoreDB", domains: ["data"] },
  { id: "skill-kafka", type: "skill", label: "Kafka", domains: ["cloud", "data", "backend"] },
  { id: "skill-docker", type: "skill", label: "Docker", domains: ["cloud"] },
  { id: "skill-k8s", type: "skill", label: "Kubernetes", domains: ["cloud"] },
  { id: "skill-aws", type: "skill", label: "AWS", domains: ["cloud"] },
  { id: "skill-azure", type: "skill", label: "Azure", domains: ["cloud"] },
  { id: "skill-git", type: "skill", label: "Git", domains: ["cloud"] },
  { id: "skill-langchain", type: "skill", label: "LangChain", domains: ["nlp", "ai"] },
  { id: "skill-langgraph", type: "skill", label: "LangGraph", domains: ["nlp", "ai"] },
  { id: "skill-saga", type: "skill", label: "Saga Orchestration", domains: ["backend"] },
  { id: "skill-cqrs-sync", type: "skill", label: "CQRS Projection Sync", domains: ["backend", "data"] },
  { id: "skill-terraform", type: "skill", label: "Terraform", domains: ["cloud"] },
  { id: "skill-argocd", type: "skill", label: "ArgoCD", domains: ["cloud"] },
];

export const NODE_BY_ID: Record<string, GraphNode> = NODES.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {} as Record<string, GraphNode>);
