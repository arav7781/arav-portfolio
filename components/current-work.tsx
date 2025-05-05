"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Cpu, Lightbulb, Zap } from "lucide-react"

export default function CurrentWork() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const projects = [
    {
      title: "Multimodal Learning for Medical Diagnosis",
      description:
        "Developing a system that combines image, text, and structured data for more accurate medical diagnoses.",
      progress: 65,
      icon: <Brain className="h-6 w-6" />,
      color: "from-violet-500 to-fuchsia-500",
      tags: ["Deep Learning", "Computer Vision", "NLP", "Healthcare", "Medical Assistant", "Voice to Voice" , "Multimodal Learning", "Medical Image Analysis", "Reinforcement Learning"],
    },
    {
      title: "Energy-Efficient Reinforcement Learning",
      description:
        "Researching methods to reduce the computational requirements of reinforcement learning algorithms for IoT applications.",
      progress: 40,
      icon: <Zap className="h-6 w-6" />,
      color: "from-emerald-500 to-green-500",
      tags: ["Reinforcement Learning", "IoT", "Optimization", "Energy Efficiency"],
    },
    {
      title: "Explainable AI Framework",
      description: "Building a framework to make complex AI models more interpretable and transparent for end-users.",
      progress: 75,
      icon: <Lightbulb className="h-6 w-6" />,
      color: "from-amber-500 to-yellow-500",
      tags: ["XAI", "Model Interpretability", "Human-AI Interaction"],
    },
    {
      title: "Quantum Machine Learning Experiments",
      description: "Exploring the potential of quantum computing for accelerating specific machine learning tasks.",
      progress: 25,
      icon: <Cpu className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      tags: ["Quantum Computing", "Machine Learning", "Hybrid Algorithms"],
    },
  ]

  return (
    <section id="current-work" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Current{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Research
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ongoing projects and research initiatives I'm currently working on.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Card className="border-violet-500/20 bg-black/60 backdrop-blur-sm h-full transition-all duration-300 hover:border-violet-500/50 hover:translate-y-[-5px]">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${project.color} mr-3`}>{project.icon}</div>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                  </div>

                  <p className="text-gray-300 mb-6">{project.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-gray-400">{project.progress}%</span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="h-2 bg-gray-700/30"
                      indicatorClassName={`bg-gradient-to-r ${project.color}`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-violet-900/30 border border-violet-500/30 rounded-full text-xs font-medium text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
