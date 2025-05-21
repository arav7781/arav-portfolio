"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronDown, ChevronUp, Brain, Code, School, Sparkles, Zap, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function About() {
  const [expandedCard, setExpandedCard] = useState<string | null>("academic")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const cards = [
    {
      id: "academic",
      title: "Academic Background",
      icon: <School className="h-5 w-5 text-violet-400" />,
      content: (
        <div>
          <p className="mb-2">
            Currently pursuing B.Tech in Artificial Intelligence and Machine Learning at Symbiosis Institute of
            Technology, Pune.
          </p>
          <p className="mb-2">
            Second-year student with a strong foundation in computer science fundamentals and specialized AI coursework.
          </p>
          <p>
            Actively participating in technical workshops, hackathons, and research projects to enhance practical
            skills.
          </p>
        </div>
      ),
    },
    {
      id: "ai",
      title: "AI Passion",
      icon: <Brain className="h-5 w-5 text-fuchsia-400" />,
      content: (
        <div>
          <p className="mb-2">
            Fascinated by the potential of AI to solve complex real-world problems and transform industries.
          </p>
          <p className="mb-2">
            Particularly interested in Generative AI, Large Language Models (LLMs), and their applications in creative
            and practical domains.
          </p>
          <p>Actively exploring the intersection of AI ethics, responsible innovation, and human-centered design.</p>
        </div>
      ),
    },
    {
      id: "dev",
      title: "Development Journey",
      icon: <Code className="h-5 w-5 text-pink-400" />,
      content: (
        <div>
          <p className="mb-2">
            Self-taught full-stack developer with experience building web applications, AI-powered tools, and
            interactive experiences.
          </p>
          <p className="mb-2">
            Passionate about creating intuitive, accessible, and visually appealing user interfaces that enhance the
            user experience.
          </p>
          <p>
            Constantly learning new technologies and frameworks to stay at the forefront of the rapidly evolving tech
            landscape.
          </p>
        </div>
      ),
    },
    {
      id: "research",
      title: "Research Interests",
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      content: (
        <div>
          <p className="mb-2">
            Focused on exploring the applications of deep learning in healthcare, particularly in medical image analysis
            and disease prediction.
          </p>
          <p className="mb-2">
            Interested in developing explainable AI systems that can provide transparent reasoning for their decisions.
          </p>
          <p>
            Currently working on a research project investigating the use of reinforcement learning for optimizing
            energy consumption in smart buildings.
          </p>
        </div>
      ),
    },
    {
      id: "global",
      title: "Global Perspective",
      icon: <Globe className="h-5 w-5 text-cyan-400" />,
      content: (
        <div>
          <p className="mb-2">
            Participated in National-Level AI competitions and hackathons, collaborating with teams from diverse
            backgrounds.
          </p>
          <p className="mb-2">
            Attended virtual conferences and workshops hosted by leading global tech companies and research
            institutions.
          </p>
          <p>
            Passionate about using technology to address global challenges like climate change, healthcare
            accessibility, and educational inequality.
          </p>
        </div>
      ),
    },
    {
      id: "personal",
      title: "Beyond Tech",
      icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
      content: (
        <div>
          <p className="mb-2">
            When not coding or studying, I enjoy exploring creative outlets like digital art, music production, and
            photography.
          </p>
          <p className="mb-2">Avid reader with interests spanning science fiction, philosophy, and popular science.</p>
          <p>
            <span className="font-medium italic">"The best way to predict the future is to invent it."</span> - This
            quote by Alan Kay drives my approach to technology and innovation.
          </p>
        </div>
      ),
    },
  ]

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">Me</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get to know more about my background, interests, and what drives my passion for AI and technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Profile Image */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-75"></div>
              <div className="relative bg-black rounded-xl overflow-hidden aspect-[3/4]">
                <Image
                  src="/DSC00679.JPG?height=600&width=450"
                  alt="Arav Saxena"
                  width={450}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Quick Bio</h3>
              <p className="text-gray-300 mb-4">
                AI enthusiast and full-stack developer with a passion for creating innovative solutions that leverage
                cutting-edge technology to solve real-world problems.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-gray-200">20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-gray-200">Pune, India</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Education:</span>
                  <span className="text-gray-200">B.Tech in AI & ML</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Languages:</span>
                  <span className="text-gray-200">English, Hindi</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Accordion Cards */}
          <div className="lg:col-span-2">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-4"
              >
                <Card className="border border-violet-500/20 bg-black/50 backdrop-blur-sm hover:bg-black/60 transition-all duration-300">
                  <CardHeader
                    className="cursor-pointer flex flex-row items-center justify-between"
                    onClick={() => toggleCard(card.id)}
                  >
                    <div className="flex items-center">
                      {card.icon}
                      <CardTitle className="ml-2 text-xl">{card.title}</CardTitle>
                    </div>
                    {expandedCard === card.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </CardHeader>
                  {expandedCard === card.id && <CardContent className="text-gray-300 pt-0">{card.content}</CardContent>}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
