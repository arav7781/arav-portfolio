"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Code2, Database, Brain, Server, Layers, Cpu, Microscope } from "lucide-react"
import Image from "next/image"

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const skillCategories = [
    {
      title: "Languages",
      icon: <Code2 className="h-6 w-6" />,
      skills: [
        { name: "Python", level: 95, logo: "/python.png?height=60&width=60" },
        { name: "Java", level: 85, logo: "/java1.png?height=60&width=60" },
        { name: "C++", level: 80, logo: "/cpp.png?height=60&width=60" },
        { name: "JavaScript", level: 90, logo: "/js.png?height=60&width=60" },
        { name: "TypeScript", level: 85, logo: "/ts.png?height=60&width=60" },
        { name: "C", level: 90, logo: "/c.png?height=60&width=60" },
        { name: "SQL", level: 85, logo: "/sql1.png?height=60&width=60" },
      ],
      color: "from-violet-500 to-fuchsia-500",
      direction: 1, // 1 for left-to-right, -1 for right-to-left
    },
    {
      title: "Frameworks",
      icon: <Layers className="h-6 w-6" />,
      skills: [
        { name: "React.js", level: 90, logo: "/react.png?height=60&width=60" },
        { name: "Next.js", level: 85, logo: "/next.png?height=60&width=60" },
        { name: "TensorFlow", level: 90, logo: "/tf.png?height=60&width=60" },
        { name: "Langgraph", level: 85, logo: "/l.png?height=60&width=60" },
        { name: "PyTorch", level: 85, logo: "/pytorch.png?height=60&width=60" },
        { name: "Flask", level: 80, logo: "/flask.png?height=60&width=60" },
        { name: "LangChain", level: 75, logo: "/l.png?height=60&width=60" },
        { name: "FastAPI", level: 85, logo: "/python.png?height=60&width=60" },
      ],
      color: "from-fuchsia-500 to-pink-500",
      direction: -1, // Scroll in opposite direction
    },
    {
      title: "AI & ML",
      icon: <Brain className="h-6 w-6" />,
      skills: [
        { name: "Deep Learning", level: 90, logo: "/dl.png?height=60&width=60" },
        { name: "NLP", level: 85, logo: "/nlp.png?height=60&width=60" },
        { name: "Google's A2A Protocol", level: 95, logo: "/a2a.png?height=60&width=60" },
        { name: "MCP Protocol", level: 95, logo: "/mcp.png?height=60&width=60" },
        { name: "Computer Vision", level: 80, logo: "/cv.png?height=60&width=60" },
        { name: "LLMs", level: 85, logo: "/llm.png?height=60&width=60" },
        { name: "Generative AI", level: 80, logo: "/genai.png?height=60&width=60" },
        { name: "Reinforcement Learning", level: 85, logo: "/rl.png?height=60&width=60" },
        { name: "Data Analysis", level: 90, logo: "/da.png?height=60&width=60" },
      ],
      color: "from-pink-500 to-rose-500",
      direction: 1,
    },
    {
      title: "Databases",
      icon: <Database className="h-6 w-6" />,
      skills: [
        { name: "MongoDB", level: 85, logo: "/mdb.png?height=60&width=60" },
        { name: "PostgreSQL", level: 80, logo: "/sql2.png?height=60&width=60" },
        { name: "MySQL", level: 85, logo: "/sql1.png?height=60&width=60" },
        { name: "Convex", level: 90, logo: "/convex.png?height=60&width=60" },
        { name: "Redis", level: 75, logo: "/redis.png?height=60&width=60" },
      ],
      color: "from-rose-500 to-orange-500",
      direction: -1,
    },
    {
      title: "DevOps",
      icon: <Server className="h-6 w-6" />,
      skills: [
        { name: "Git", level: 90, logo: "/git.png?height=60&width=60" },
        { name: "Docker", level: 80, logo: "/docker.png?height=60&width=60" },
        
        { name: "Vercel", level: 85, logo: "/vercel.png?height=60&width=60" },
        { name: "GitHub Actions", level: 80, logo: "/git.png?height=60&width=60" },
      ],
      color: "from-orange-500 to-amber-500",
      direction: 1,
    },
    {
      title: "Tools",
      icon: <Cpu className="h-6 w-6" />,
      skills: [
        { name: "VS Code", level: 95, logo: "/vs.png?height=60&width=60" },
        { name: "Jupyter", level: 90, logo: "/jupyter.png?height=60&width=60" },
        { name: "Postman", level: 85, logo: "/postman.png?height=60&width=60" },
        { name: "Git", level: 90, logo: "/git.png?height=60&width=60" },
      ],
      color: "from-amber-500 to-yellow-500",
      direction: -1,
    },
  ]

  // Map level to proficiency label
  const getProficiency = (level: number) => {
    if (level >= 90) return "Expert"
    if (level >= 80) return "Advanced"
    if (level >= 70) return "Intermediate"
    return "Beginner"
  }

  // Map proficiency to color
  const proficiencyColors = {
    Expert: "bg-gradient-to-r from-emerald-500 to-green-500",
    Advanced: "bg-gradient-to-r from-blue-500 to-cyan-500",
    Intermediate: "bg-gradient-to-r from-amber-500 to-yellow-500",
    Beginner: "bg-gradient-to-r from-gray-500 to-slate-500",
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="skills" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>

      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="skills-particles"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Technical{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-gradient">
              Skills
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A showcase of my technical expertise and tools I work with to bring ideas to life.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-12"
        >
          {skillCategories.map((category, index) => (
            <motion.div key={index} variants={item} className="relative">
              <div className="mb-6 flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} mr-3`}>{category.icon}</div>
                <h3 className="text-2xl font-bold">{category.title}</h3>
              </div>

              {/* Infinite scrolling logos - Fixed to be truly seamless */}
              <div className="relative overflow-hidden py-4 before:absolute before:left-0 before:top-0 before:z-20 before:h-full before:w-32 before:bg-gradient-to-r before:from-black before:to-transparent after:absolute after:right-0 after:top-0 after:z-20 after:h-full after:w-32 after:bg-gradient-to-l after:from-black after:to-transparent">
                <div className="infinite-scroll-container">
                  <div
                    className={`infinite-scroll-content ${category.direction > 0 ? "scroll-left" : "scroll-right"}`}
                    style={{
                      animationDuration: `${category.skills.length * 10}s`,
                    }}
                  >
                    {/* First set of skills */}
                    {category.skills.map((skill, skillIndex) => (
                      <div key={`first-${skillIndex}`} className="flex-none mx-4">
                        <div className="skill-card">
                          <div className="relative w-16 h-16 mb-3">
                            <Image
                              src={skill.logo || "/placeholder.svg"}
                              alt={skill.name}
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-200 text-center mb-2">{skill.name}</h4>
                          <span
                            className={`mt-auto text-xs px-2 py-0.5 rounded-full ${
                              proficiencyColors[getProficiency(skill.level) as keyof typeof proficiencyColors]
                            } text-white`}
                          >
                            {getProficiency(skill.level)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Second set of skills (duplicate for seamless loop) */}
                    {category.skills.map((skill, skillIndex) => (
                      <div key={`second-${skillIndex}`} className="flex-none mx-4">
                        <div className="skill-card">
                          <div className="relative w-16 h-16 mb-3">
                            <Image
                              src={skill.logo || "/placeholder.svg"}
                              alt={skill.name}
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-200 text-center mb-2">{skill.name}</h4>
                          <span
                            className={`mt-auto text-xs px-2 py-0.5 rounded-full ${
                              proficiencyColors[getProficiency(skill.level) as keyof typeof proficiencyColors]
                            } text-white`}
                          >
                            {getProficiency(skill.level)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Medical LLM Models Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-24 mb-12"
        >
          <div className="text-center mb-12">
            <div className="inline-block p-2 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-4">
              <Microscope className="h-8 w-8 text-violet-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Deployed{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-gradient">
                Medical LLMs
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Advanced language models deployed for medical analysis and healthcare applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <MedicalLLMCard
              title="Llama-3-Vision-QLoRA"
              description="A fine-tuned vision-language model specialized for medical image analysis and diagnosis assistance."
              features={[
                "Medical image recognition & analysis",
                "Diagnostic assistance for clinicians",
                "Multi-modal understanding of medical data",
                "Fine-tuned on specialized medical datasets",
              ]}
              link="https://huggingface.co/devank2000/llamavision3.211b-wound"
              image="/placeholder.svg?height=300&width=500"
              color="from-violet-500 to-fuchsia-500"
              icon="🔬"
            />

            <MedicalLLMCard
              title="Qwen0.5B Fine-Tuned"
              description="A lightweight but powerful language model optimized for medical text analysis and healthcare applications."
              features={[
                "Medical terminology understanding",
                "Clinical notes summarization",
                "Healthcare data interpretation",
                "Efficient deployment in resource-constrained environments",
              ]}
              link="https://huggingface.co/devank2000/qwen0.5B-fine-tunned"
              image="/placeholder.svg?height=300&width=500"
              color="from-violet-500 to-fuchsia-500"
              icon="🧬"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

interface MedicalLLMCardProps {
  title: string
  description: string
  features: string[]
  link: string
  image: string
  color: string
  icon: string
}

function MedicalLLMCard({ title, description, features, link, image, color, icon }: MedicalLLMCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative group h-full"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`}
      ></div>

      <div className="relative bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 h-full overflow-hidden group-hover:border-violet-500/50 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 medical-pattern"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <div className="text-4xl mr-3">{icon}</div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              {title}
            </h3>
          </div>

          <p className="text-gray-300 mb-6">{description}</p>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-violet-300">Key Capabilities</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${color} mr-2`}></div>
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r ${color} text-white font-medium hover:shadow-lg transition-all duration-300`}
            >
              View on Hugging Face
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <motion.div
              className="text-3xl"
              animate={{
                rotate: isHovered ? [0, -10, 10, -10, 10, 0] : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          </div>
        </div>

        {/* Interactive elements */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-3xl"
          animate={{
            scale: isHovered ? [1, 1.2, 1] : 1,
            opacity: isHovered ? [0.3, 0.6, 0.3] : 0.3,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
    </motion.div>
  )
}
