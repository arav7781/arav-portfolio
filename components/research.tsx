"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Users, Download } from "lucide-react"

export default function Research() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const researchPapers = [
    {
      title: "ArogyaMitra: A Voice to Voice Indian Multilingual Medical Assistant",
      authors: "Arav Saxena, Dr. Ketan Kotecha, Dr.shruti Patil, Dr. Archana Chaudhari, Anil Kumar Gupta",
      journal: "Coming Soon!",
      year: "2025",
      abstract:
        "This paper presents a novel approach to build a nurse agent that can assist in medical diagnosis and treatment. We introduce a framework that allows users to get medical assistance in their native language.",
      link: "#",
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "AgenticCV: A text to Computer Vision tasks Framework",
      authors: "Arav Saxena, Dr. Archana Chaudhari, Anil Kumar Gupta",
      journal: "ArticleX Journal 2025",
      year: "2025",
      abstract:
        "This paper presents a novel approach to build a no code platform for computer vision tasks. We introduce a framework that allows users to build computer vision models without any prior knowledge of machine learning.",
      link: "#",
      image: "/placeholder.svg?height=300&width=500",
    },
    // {
    //   title: "Reinforcement Learning for Energy Optimization in Smart Buildings",
    //   authors: "Arav Saxena, Dr. Neha Gupta",
    //   journal: "Energy and Buildings",
    //   year: "2024",
    //   abstract:
    //     "This research investigates the use of reinforcement learning algorithms to optimize energy consumption in smart buildings. Our proposed approach demonstrates a 25% reduction in energy usage while maintaining occupant comfort levels.",
    //   link: "#",
    //   image: "/placeholder.svg?height=300&width=500",
    // },
  ]

  return (
    <section id="research" className="py-20 relative">
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
            Research{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Publications
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Exploring the frontiers of AI and machine learning through academic research and publications.
          </p>
        </motion.div>

        <div ref={ref} className="space-y-8 max-w-5xl mx-auto">
          {researchPapers.map((paper, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden border-violet-500/20 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 h-full">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${paper.image})` }}>
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-violet-900/80 to-fuchsia-900/80 p-6">
                          <div>
                            <BookOpen className="h-12 w-12 text-white mb-4 mx-auto" />
                            <div className="text-center">
                              <p className="text-white font-medium">{paper.journal}</p>
                              <p className="text-gray-300">{paper.year}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-6">
                      <h3 className="text-xl font-bold mb-2">{paper.title}</h3>

                      <div className="flex items-center mb-4">
                        <Users className="h-4 w-4 text-violet-400 mr-2" />
                        <p className="text-gray-400 text-sm">{paper.authors}</p>
                      </div>

                      <p className="text-gray-300 mb-4">{paper.abstract}</p>

                      <a
                        href="/AgCV MethodsX-Method-Article.docx" 
                        download
                        className="flex items-center"
                      >
                        <Button variant="outline" size="lg" className="border-violet-500 text-violet-300 hover:bg-violet-500/10">
                          <Download className="mr-2 h-4 w-4" />
                          Download Paper
                        </Button>
                      </a>
                    </div>
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
