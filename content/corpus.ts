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
    id: "dao",
    type: "project",
    label: "DAO Platform",
    desc: "Architected DAO, an AI-powered Startup Evaluation & FinScope Advisory Platform. Integrates a multi-agent LangGraph workflow for investor pitch deck due-diligence, MCA compliance validation, Docling-based Qdrant vector RAG, and automated PDF reporting with dynamic Matplotlib scorecards.",
    summary: "AI Startup due-diligence & FinScope multi-subagent router.",
    domains: ["nlp", "ai", "backend", "data", "cloud"],
    meta: {
      period: "2026",
      impact: "Automated investor Due-Diligence analysis and structured multi-subagent financial advisory.",
      stack: ["Python", "FastAPI", "LangGraph", "Qdrant", "Docling", "Matplotlib", "Socket.IO", "Docker"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/DAO" }]
  },
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
    label: "Global Freight Platform",
    desc: "Full-stack shipment tracking, bidding and logistics platform built as distributed Java/Spring Boot microservices with a React frontend. 50,000+ shipment events flow between services through Kafka, with Avro schema contracts defined across the service topology. CQRS and Event Sourcing (Axon Framework) keep workflow state auditable, Redis ZSET delayed-event queues handle scheduled events, and SAGA orchestration with compensating transactions keeps data consistent when a step fails part-way. Endpoints are JWT-secured, with JUnit-tested services built under Maven.",
    summary: "Kafka-driven shipment tracking & bidding microservices (50k+ events).",
    domains: ["backend", "cloud", "data"],
    meta: {
      period: "2024 - 2025",
      impact: "Processed 50,000+ shipment events through Kafka; caching and event-driven workflows cut API response latency by 40%.",
      stack: ["Java", "Spring Boot", "Spring MVC", "Kafka", "Avro", "Axon Framework", "Redis ZSET", "MongoDB", "React", "JWT", "JUnit", "Maven", "Docker", "Kubernetes", "AWS"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/bharatHireSecure" }]
  },
  {
    id: "delaylens",
    type: "project",
    label: "DelayLens",
    desc: "End-to-end big-data ETL pipeline and agentic analytics app for supply-chain delivery delays on the DataCo dataset (180,519 order lines consolidated into 65,752 orders). Raw CSVs are profiled and cleaned in Python, landed in an HDFS raw zone, and transformed by 33 Hadoop MapReduce jobs on YARN into order-level delivery KPIs. Outputs are reconciled across engines (Hadoop vs MongoDB, Java vs Python Streaming) to an exact match and benchmarked against pandas from 0.25x to 16x data volume. A LangGraph agent with 9 tools answers questions over the results (8/8 on its evaluation set) and streams answers into an 8-page Next.js dashboard over Server-Sent Events.",
    summary: "Supply-chain delay analytics: Hadoop ETL + LangGraph copilot.",
    domains: ["data", "ai", "backend", "frontend"],
    meta: {
      period: "2026",
      impact: "Found the root cause of a 54.8% late-delivery rate (First Class shipments 95.3% late) and showed revised delivery promises cut lateness to 18.9%.",
      stack: ["Python", "SQL", "Hadoop (HDFS, YARN, MapReduce)", "Java", "MongoDB", "FastAPI", "LangGraph", "Next.js", "TypeScript"],
    },
    links: [{ label: "GitHub", href: "https://github.com/arav7781/delaylens" }]
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
    id: "bajaj-ai-cortex",
    type: "experience",
    label: "SDE Intern @ Bajaj · AI Cortex",
    short: "Bajaj · AI Cortex",
    desc: "Building AI Cortex, an enterprise Graph RAG platform that turns everything connected to a software project (code repositories, work items, wikis, and uploaded documents) into a single, queryable, journey-isolated knowledge graph (Neo4j + pgvector). Its differentiator is cross-repo retrieval by graph traversal: a client call in one repo is linked to the endpoint it hits in another at ingestion time via a Contract Bridge, so questions reach the calling service, endpoint, wiki page, and related work item by walking typed edges instead of hoping vector search surfaces them. The graph and hybrid retrieval pipeline (pgvector ANN + lexical + bounded Neo4j traversal, orchestrated by Temporal) form a shared substrate on which decoupled AI agents are built as thin services: DocQ AI (Q&A/chat/wiki generation), Refine AI (requirements refinement), Idea AI (project ideation), and Agentic RCA (autonomous root-cause analysis).",
    summary: "Enterprise Graph RAG platform (AI Cortex) for the SDLC.",
    domains: ["ai", "nlp", "backend", "data", "cloud", "frontend"],
    meta: {
      period: "Jul 2026 - Present",
      role: "SDE Intern",
      org: "Bajaj Finserv Health",
      impact: "Architected a journey-isolated Graph RAG knowledge base (Neo4j + pgvector + Temporal, polyglot tree-sitter parsing across Java/Python/Go/TS/C#) powering 4 decoupled AI agents with typed-edge, cross-repository retrieval and a WebGL subgraph visualizer.",
      stack: ["Python", "FastAPI", "Neo4j", "PostgreSQL", "pgvector", "Temporal", "tree-sitter", "Next.js", "TypeScript", "Sigma.js", "Ollama", "SCIP"],
    }
  },
  {
    id: "bajaj-payments-kafka",
    type: "experience",
    label: "SDE Intern @ Bajaj · Payments & Kafka",
    short: "Bajaj · Payments & Kafka",
    desc: "Engineer on the payments and order-management platform (OMS + PayRx Core, NestJS/TypeScript microservices on Azure Kubernetes Service behind an APIM gateway) handling payins, transfers, refunds, recurring payments and QR settlement. Built Kafka payment-event pipelines with Avro schema contracts registered through a schema registry, using idempotent consumers that commit offsets only after successful processing (so a retried event never double-processes a payment), and DLQ topics that isolate poison messages across the shared order and transfer lifecycle topics. Contributed to a unified PostgreSQL entity-lifecycle table (replacing per-entity tables) with a source-system discriminator, giving a cross-system audit trail over every order, payment, refund and transfer state transition. Separately designed the Kafka topic topology and Avro contracts for claims-processing pipelines in Java that parse and validate inbound XML partner feeds into typed, versioned events for downstream microservices, and monitored pipeline health and production data-integrity issues with AKHQ, Grafana and Splunk. Also works on Azure DevOps CI/CD and Unix shell scripts for VM deployments.",
    summary: "Kafka/Avro event pipelines for payments, orders and insurance claims.",
    domains: ["backend", "data", "cloud"],
    meta: {
      period: "Jul 2026 - Present",
      role: "SDE Intern",
      org: "Bajaj Finserv Health",
      impact: "Payment and claims event pipelines with schema-registered Avro contracts, commit-after-processing idempotent consumers (no double-processed payments) and DLQ isolation for poison messages.",
      stack: ["Kafka", "Avro", "Schema Registry", "Java", "NestJS", "TypeScript", "PostgreSQL", "Azure Kubernetes Service", "AKHQ", "Grafana", "Splunk", "Azure DevOps"],
    }
  },
  {
    id: "scaai-intern",
    type: "experience",
    label: "Research Intern @ SCAAI",
    desc: "Drove AI research to enhance data analytics and ML solutions. Built SQL anomaly detection dashboards tracking daily transaction discrepancies, automated legal document retrieval pipelines, and optimized model inference using LLaMA.cpp quantization.",
    summary: "AI Researcher at Symbiosis Centre for Applied AI.",
    domains: ["cloud", "ai", "data", "nlp"],
    meta: {
      period: "Jul 2025 - Jul 2026",
      role: "Research Intern",
      org: "SCAAI Pune",
      impact: "Reduced false-positives by 18%, lowered search times by 35%, and cut latency by 20%.",
      stack: ["Python", "Pandas", "PySpark", "SQL", "Tableau", "LangChain", "CrewAI", "TensorFlow", "PostgreSQL", "Docker", "Kubernetes", "llama.cpp", "CodeCarbon"],
    },
    relatedTo: ["legalrag"]
  },
  {
    id: "cdac-intern",
    type: "experience",
    label: "AI Intern @ CDAC",
    desc: "Built BlueBoxAI, an enterprise data analytics assistant, at the Centre for Development of Advanced Computing (CDAC), a premier R&D organization focused on AI and HPC solutions. Translated natural business language into optimized, executable SQL for enterprise reporting.",
    summary: "AI internship at CDAC building enterprise analytics tooling.",
    domains: ["ai", "data"],
    meta: {
      period: "2025",
      role: "AI Intern",
      org: "CDAC",
      impact: "Delivered BlueBoxAI, achieving 89% translation accuracy on complex, join-heavy SQL queries.",
      stack: ["Python", "SQL", "LLMs", "BI Analytics"],
    },
    relatedTo: ["bluebox"]
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
    label: "Patent Published: AgCV",
    desc: "Published Indian Patent for 'AgCV: An Agentic Framework for Automating Computer Vision Applications'.",
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
    label: "Patent Published: Legal Reasoning & Judicial Decision Support",
    desc: "Indian Patent officially published for 'A System and Method for Multimodal Agentic AI-Based Context-Aware Legal Reasoning and Judicial Decision Support': an AI framework enabling cascading cross-case file analysis by integrating multimodal deep learning, hybrid retrieval, agentic AI, hierarchical temporal knowledge graphs, cascading validation agents, and explainable AI. Analyzes interconnected legal case files to identify statement inconsistencies and legal-entity drift across related cases, and produces transparent, citation-backed reasoning for judicial decision-making. Co-invented with Adesh Jain, Khushi Kashyap, and Kartik Mehta, under the mentorship of Dr. Shivali Wagle.",
    summary: "Published patent: agentic, temporal-graph legal reasoning for judicial support.",
    domains: ["nlp", "ai", "data"],
    meta: {
      period: "2025 - 2026",
      org: "Indian Patent Office",
      impact: "Officially published patent introducing cascading cross-case legal analysis via hierarchical temporal knowledge graphs and cascading validation agents.",
    },
    relatedTo: ["legalrag"]
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
    },
    relatedTo: ["dashboard", "healthquery"]
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
    },
    relatedTo: ["arogyamitra"]
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
  {
    id: "cert-mcp",
    type: "achievement",
    label: "Advanced MCP Topics Cert",
    desc: "Certification for Model Context Protocol (MCP) Advanced Topics issued by Anthropic, covering custom server patterns, protocol integrations, and semantic APIs.",
    summary: "Anthropic Advanced MCP Certification.",
    domains: ["nlp", "ai"],
    meta: {
      period: "2026",
      org: "Anthropic",
    }
  },
  {
    id: "cert-nutanix",
    type: "achievement",
    label: "Nutanix Certified Associate 6",
    desc: "Nutanix Certified Associate (NCA 6) covering Hyper-Converged Infrastructure, Nutanix Acropolis (AOS), AHV virtualized storage, and Prism UI console.",
    summary: "Nutanix Certified Associate (NCA 6).",
    domains: ["cloud"],
    meta: {
      period: "2026",
      org: "Nutanix",
    }
  },
  {
    id: "cert-stanford-algo1",
    type: "achievement",
    label: "Divide & Conquer Algorithms",
    desc: "Stanford Online certification for Divide and Conquer, Searching and Sorting Algorithms, covering computational complexity, Master Theorem, and sorting proofs.",
    summary: "Stanford Online Algorithms Cert.",
    domains: ["ai"],
    meta: {
      period: "2026",
      org: "Stanford Online",
    }
  },
  {
    id: "cert-stanford-algo2",
    type: "achievement",
    label: "Graph Search & Data Structures",
    desc: "Stanford Online certification for Graph Search, Shortest Paths, and Data Structures, covering BFS/DFS, Dijkstra, heap trees, and hash maps.",
    summary: "Stanford Online Graphs Cert.",
    domains: ["ai", "data"],
    meta: {
      period: "2026",
      org: "Stanford Online",
    }
  },
  {
    id: "cert-genai-microsoft",
    type: "achievement",
    label: "Career Essentials in GenAI",
    desc: "Career essentials in generative AI certified by Microsoft and LinkedIn, covering Copilot integrations, LLM safety prompts, and enterprise AI usage.",
    summary: "Microsoft & LinkedIn GenAI Cert.",
    domains: ["nlp", "ai"],
    meta: {
      period: "2025",
      org: "Microsoft & LinkedIn",
    }
  },
  {
    id: "cert-rag-activeloop",
    type: "achievement",
    label: "RAG Production Certification",
    desc: "Production-grade Retrieval-Augmented Generation (RAG) certification by Activeloop, covering LangChain, LlamaIndex, RAG evaluation metrics, and vector database indexing.",
    summary: "Activeloop Production RAG Cert.",
    domains: ["nlp", "ai", "data"],
    meta: {
      period: "2025",
      org: "Activeloop",
    }
  },
  {
    id: "cert-tensorflow",
    type: "achievement",
    label: "Tensorflow for Deep Learning",
    desc: "Udemy certification for TensorFlow for Deep Learning, covering natural language processing, neural network building, transfer learning, and embeddings.",
    summary: "Udemy TensorFlow Deep Learning Cert.",
    domains: ["ai"],
    meta: {
      period: "2025",
      org: "Udemy",
    }
  },
  {
    id: "cert-opencv",
    type: "achievement",
    label: "Computer Vision & OpenCV",
    desc: "Udemy certification for Python for Computer Vision with OpenCV, covering CNNs, image preprocessing pipelines, MTCNN, and dlib face landmarks.",
    summary: "Udemy Computer Vision Cert.",
    domains: ["ai"],
    meta: {
      period: "2025",
      org: "Udemy",
    }
  },
  {
    id: "cert-data-analysis",
    type: "achievement",
    label: "Data Analysis Essentials",
    desc: "Career Essentials in Data Analysis certified by Microsoft and LinkedIn, covering business data cleaning, SQL query modeling, and dashboard visualization.",
    summary: "Microsoft & LinkedIn Data Analysis Cert.",
    domains: ["data"],
    meta: {
      period: "2024",
      org: "Microsoft & LinkedIn",
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
  {
    id: "skill-kafka",
    type: "skill",
    label: "Apache Kafka",
    desc: "Production Kafka at Bajaj Finserv Health (payment, order and claims event pipelines) and in the Global Freight platform (50,000+ shipment events): topic topology, keyed partitioning, Avro contracts with a schema registry, idempotent commit-after-processing consumers, dead-letter queues, CQRS and SAGA compensation, monitored with AKHQ, Grafana and Splunk.",
    domains: ["backend", "data", "cloud"],
    relatedTo: ["freight", "bajaj-payments-kafka"],
  },
  {
    id: "skill-avro",
    type: "skill",
    label: "Avro & Schema Registry",
    desc: "Typed, versioned event contracts registered in a schema registry, so producers can't publish a breaking change to downstream consumers.",
    domains: ["backend", "data"],
    relatedTo: ["freight", "bajaj-payments-kafka"],
  },
  {
    id: "skill-kafka-reliability",
    type: "skill",
    label: "Idempotent Consumers & DLQs",
    desc: "Consumers commit offsets only after successful processing and de-duplicate redelivered events; poison messages are isolated on dead-letter topics.",
    domains: ["backend", "data"],
    relatedTo: ["bajaj-payments-kafka"],
  },
  {
    id: "skill-observability",
    type: "skill",
    label: "AKHQ · Grafana · Splunk",
    desc: "Topic, consumer-lag and message inspection in AKHQ, pipeline dashboards in Grafana and log investigation in Splunk.",
    domains: ["cloud", "data"],
    relatedTo: ["bajaj-payments-kafka"],
  },
  { id: "skill-hadoop", type: "skill", label: "Hadoop (HDFS · YARN · MapReduce)", domains: ["data"], relatedTo: ["delaylens"] },
  { id: "skill-docker", type: "skill", label: "Docker", domains: ["cloud"] },
  { id: "skill-k8s", type: "skill", label: "Kubernetes", domains: ["cloud"] },
  { id: "skill-aws", type: "skill", label: "AWS", domains: ["cloud"] },
  { id: "skill-azure", type: "skill", label: "Azure", domains: ["cloud"] },
  { id: "skill-git", type: "skill", label: "Git", domains: ["cloud"] },
  { id: "skill-langchain", type: "skill", label: "LangChain", domains: ["nlp", "ai"] },
  { id: "skill-langgraph", type: "skill", label: "LangGraph", domains: ["nlp", "ai"] },
  { id: "skill-saga", type: "skill", label: "Saga Orchestration", domains: ["backend"], relatedTo: ["freight"] },
  { id: "skill-cqrs-sync", type: "skill", label: "CQRS Projection Sync", domains: ["backend", "data"], relatedTo: ["freight"] },
  { id: "skill-terraform", type: "skill", label: "Terraform", domains: ["cloud"] },
  { id: "skill-argocd", type: "skill", label: "ArgoCD", domains: ["cloud"] },
  { id: "skill-mcp", type: "skill", label: "Model Context Protocol (MCP)", domains: ["nlp", "ai"] },
  { id: "skill-hci", type: "skill", label: "Hyper-Converged Infrastructure", domains: ["cloud"] },
  { id: "skill-nutanix", type: "skill", label: "Nutanix Acropolis (AOS/AHV)", domains: ["cloud"] },
  { id: "skill-algorithms", type: "skill", label: "Algorithms & Data Structures", domains: ["ai"] },
  { id: "skill-rag-agents", type: "skill", label: "Production RAG Agents", domains: ["nlp", "ai", "data"] },
  { id: "skill-tensorflow", type: "skill", label: "TensorFlow", domains: ["ai"] },
  { id: "skill-opencv", type: "skill", label: "OpenCV & Computer Vision", domains: ["ai"] },
  { id: "skill-data-analysis", type: "skill", label: "Data Analysis & Visualization", domains: ["data"] },
  { id: "skill-c", type: "skill", label: "C (Programming Language)", domains: ["backend"] },
];

export const NODE_BY_ID: Record<string, GraphNode> = NODES.reduce((acc, n) => {
  acc[n.id] = n;
  return acc;
}, {} as Record<string, GraphNode>);

export type KafkaPatternId = "avro" | "keying" | "groups" | "commit" | "idempotent" | "dlq" | "saga";

/**
 * Arav's Kafka / event-streaming experience in one place. The home-page Kafka section
 * and the SAITAMA chat context both read from this, so they can't drift apart.
 */
export const KAFKA_PROFILE = {
  summary:
    "Arav designs and runs Kafka event pipelines in production: payment, order and insurance-claims pipelines at Bajaj Finserv Health, and 50,000+ shipment events in the Global Freight platform. His focus is on pipelines that don't lose or double-process data: keyed partitions, Avro contracts in a schema registry, idempotent commit-after-processing consumers, dead-letter queues, and CQRS/SAGA for consistency across services.",
  patterns: [
    {
      id: "avro" as KafkaPatternId,
      title: "Avro contracts + schema registry",
      detail: "Every event is a typed, versioned Avro record checked against a schema registry, so a breaking change never reaches consumers.",
    },
    {
      id: "keying" as KafkaPatternId,
      title: "Keyed partitioning",
      detail: "Events are keyed by entity id (orderId, paymentId), so one entity's whole lifecycle lands on one partition, in order.",
    },
    {
      id: "groups" as KafkaPatternId,
      title: "Consumer groups",
      detail: "Each partition is owned by one instance in a group; add instances to scale out, while other groups read the same log at their own offsets.",
    },
    {
      id: "commit" as KafkaPatternId,
      title: "Commit after processing",
      detail: "Offsets are committed only after the side effect succeeds, so a crash means redelivery rather than a silently skipped event.",
    },
    {
      id: "idempotent" as KafkaPatternId,
      title: "Idempotent consumers",
      detail: "Redelivered events are de-duplicated by event id, so a retry never double-processes a payment or a shipment.",
    },
    {
      id: "dlq" as KafkaPatternId,
      title: "Dead-letter queues",
      detail: "Poison messages that fail validation are parked on a DLQ topic so the partition keeps flowing; they can be inspected and replayed.",
    },
    {
      id: "saga" as KafkaPatternId,
      title: "SAGA compensation",
      detail: "Multi-step workflows roll back with compensating events (e.g. release reserved stock) instead of distributed transactions.",
    },
  ],
  /** Personal projects shown on the home page. Global Freight is the Kafka build; the others share its event-driven and supply-chain story. */
  projects: [
    {
      id: "freight",
      name: "Global Freight & Shipment Platform",
      period: "2024 - 2025",
      role: "The Kafka build this demo is modelled on",
      metrics: [
        { value: "50k+", label: "shipment events through Kafka" },
        { value: "40%", label: "lower API response latency" },
      ],
      points: [
        "Spring Boot microservices for shipment tracking, bidding and logistics, talking to each other through Kafka.",
        "Avro schema contracts across the service topology, with CQRS and Event Sourcing for auditable workflow state.",
        "SAGA orchestration with compensating transactions keeps data consistent when a step fails part-way.",
      ],
      stack: ["Java", "Spring Boot", "Kafka", "Avro", "Axon", "MongoDB", "Redis", "Docker"],
    },
    {
      id: "delaylens",
      name: "DelayLens",
      period: "2026",
      role: "The supply-chain data behind the demo",
      metrics: [
        { value: "54.8%", label: "late-delivery rate, root-caused" },
        { value: "18.9%", label: "late after revised delivery promises" },
      ],
      points: [
        "Hadoop ETL over 180,519 DataCo order lines, transformed by 33 MapReduce jobs into order-level delivery KPIs.",
        "First Class shipments ran 95.3% late, which is why the simulation's First Class orders run late most often.",
      ],
      stack: ["Python", "Hadoop", "MongoDB", "LangGraph", "Next.js"],
    },
    {
      id: "marketplace",
      name: "Asset Marketplace",
      period: "2021 - Present",
      role: "Event sourcing and CQRS",
      metrics: [],
      points: [
        "Domain-driven design with CQRS and Event Sourcing on EventStoreDB, inside an NX monorepo.",
        "GraphQL APIs and subscriptions with payment workflows (Stripe, Coinbase, BitPay).",
      ],
      stack: ["TypeScript", "NestJS", "EventStoreDB", "GraphQL", "MongoDB"],
    },
  ],
  tooling: ["Apache Kafka", "Avro", "Schema Registry", "Spring Boot", "NestJS", "Axon Framework", "AKHQ", "Grafana", "Splunk", "Azure Kubernetes Service"],
  example:
    "The home page has an interactive supply-chain simulation of these patterns, modelled on the Global Freight platform: order, warehouse, carrier-bidding and partner GPS-feed producers publish shipment lifecycle events keyed by orderId into a 3-partition topic, a fulfillment consumer group commits after processing, malformed partner-feed events go to a DLQ, a consumer crash shows idempotent redelivery, and a carrier cancellation triggers SAGA compensation.",
};
