"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Projects() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  const projects = [
    {
      title: "GurukulX: platfrom to make Educaotrs life easy.",
      description: "A web application that uses advanced AI features for providing educators their coding agent, data visualtions agent and many more.",
      image: "/logooo.png?height=400&width=600",
      tags: ["ReactJS","AgenticAI", "NextJS", "NodeJS", "Coversational AI", "NLP","Reasoning LLMs","Vision Language Model","Finetuned Language Model", "MongoDB", "LangChain", "Langgraph", "ConvexDB","StackOverflow", "Tensorflow", "WebSockets","Flask"],
      category: "ai",
      featured: true,
      demo: "https://gurukul-x.vercel.app/",
    },
    {
      title: "ArogyaMitra: AI-Powered Health Assistant",
      description: "A web application that uses AI to provide health-related information via Indian Multilingual voice interaction.",
      image: "/ss.png?height=400&width=600",
      tags: ["ReactJS","AgenticAI", "NextJS", "NodeJS", "Coversational AI", "NLP","Reasoning LLMs","Vision Language Model","Finetuned Language Model", "MongoDB", "LangChain", "Langgraph", "ConvexDB","StackOverflow", "Tensorflow", "WebSockets","Flask"],
      category: "ai",
      featured: true,
      github: "https://github.com/arav7781/ArogyaMitra",
      demo: "https://www.youtube.com/watch?v=lIDs8FYwRVc",
    },
    {
      title: "BlueBoxAI: An Automated SQL Query Generator to make a futuristic sales dashboard and Business Intelligence Tool",
      description: "A web application that helps users track expenses and visualize spending patterns.",
      image: "/aa.png?height=400&width=600",
      tags: ["Python", "AgenticAI", "NextJS","NodeJS","SQL","crewai","MCP Protocol","ReactJS","NLP","Speech to Text","dlib", "MTNN","LangChain", "Langgraph", "ConvexDB","StackOverflow", "Tensorflow", "WebSockets","Flask","Chart.js","D3.js"],
      category: "data",
      featured: false,
      github: "https://github.com/arav7781",
      demo: "https://www.youtube.com/watch?v=lhF5r3meSQ8",
    },
    {
      title: "ClarvisIntelliTutor: AI-Powered Study Assistant",
      description: "An AI-powered study assistant that helps students to prepare for interview via voice to voice interaction and generate practice questions.",
      image: "/9ca31297-939c-4f51-bccd-dc1356898fec.jpeg?height=400&width=600",
      tags: ["Python","Coversational AI","NLP", "MongoDB","LangChain","Langgraph","Streamlit","Tensorflow","WebSockets"],
      category: "web",
      featured: false,
      github: "https://github.com/aryanma11ick/DataWizard",
      demo: "https://www.youtube.com/channel/UCrhHjJ-5o4xj5lApF9SU0wg",
    },
    {
      title: "AgenticCV: AI-Powered Computer Vision Application",
      description: "A web application that uses just text to do computer vision tasks.",
      image: "/4e32ff06-b085-4ca6-8a2c-d7633214a09b.jpg?height=400&width=600",
      tags: ["Streamlit", "AgenticAI", "Tensorflow", "Python", "OpenCV", "Langgraph", "LangChain"],
      category: "ai",
      featured: false,
      github: "https://github.com/arav7781",
      demo: "https://www.youtube.com/watch?v=AyJIg8ckIOo",
    },
    {
      title: "BharatiQues: Question Paper Generator",
      description: "A web application that uses AI to generate question papers based on the given syllabus and lecture videos.",
      image: "/514d4b03-a12f-481b-82b2-b1dd8f424783.jpg?height=400&width=600",
      tags: ["Python", "AgenticAI", "Streamlit", "NLP","Speech to Text","Vision Language Model", "VectorDB","LangChain", "Langgraph", "ConvexDB","StackOverflow", "Tensorflow", "WebSockets","Flask"],
      category: "ai",
      featured: false,
      github: "https://github.com/arav7781",
      demo: "https://www.youtube.com/watch?v=NbSqIuee8jI",
    },
    {
      title: "VitalSense: Contactless Vitals Monitoring System",
      description: "A web application that uses custom TwoStreamNetwork Model for PPG signal preprocessing and final signal processing through neurokit2 functions to monitor vital signs of the user.",
      image: "/4a5cbd8f-5039-4293-8a1b-20589b0db351.jpg?height=400&width=600",
      tags: ["Python", "AgenticAI", "NextJS","NodeJS","MongoDB","ReactJS","NLP","Speech to Text","dlib", "MTNN","LangChain", "Langgraph", "ConvexDB","StackOverflow", "Tensorflow", "WebSockets","Flask"],
      category: "mobile",
      featured: false, 
      github: "https://github.com/arav7781",
      demo: "https://www.youtube.com/watch?v=r8OIVnjbDOg",
    },
  ]

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : activeFilter === "featured"
        ? projects.filter((project) => project.featured)
        : projects.filter((project) => project.category === activeFilter)

  const filters = [
    { name: "All", value: "all" },
    { name: "Featured", value: "featured" },
    { name: "AI/ML", value: "ai" },
    { name: "Web", value: "web" },
    { name: "Mobile", value: "mobile" },
    { name: "Data", value: "data" },
  ]

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
    <section id="projects" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-violet-950/10 to-black -z-10"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Projects
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            A selection of my recent work showcasing my skills in AI, machine learning, and full-stack development.
          </p>

          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className={
                  activeFilter === filter.value
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0"
                    : "border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                }
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={item}
              onMouseEnter={() => setHoveredProject(index)}
              onMouseLeave={() => setHoveredProject(null)}
              className="group"
            >
              <Card className="overflow-hidden border-violet-500/20 bg-black/60 backdrop-blur-sm h-full flex flex-col transition-all duration-300 hover:border-violet-500/50 hover:translate-y-[-5px]">
                <div className="relative overflow-hidden h-48">
                  {project.featured && (
                    <div className="absolute top-0 right-0 z-10">
                      <Badge className="m-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0">
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${project.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70" />
                </div>

                <CardContent className="flex-grow p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-400 mb-4">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
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

                <CardFooter className="p-6 pt-0 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-violet-500/50 text-violet-300 hover:bg-violet-500/10"
                    asChild
                  >
                    <a href={project.github} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      Code
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group"
                    asChild
                  >
                    <a href={project.demo} target="_blank" rel="noopener noreferrer">
                      View Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="link" className="text-violet-400 hover:text-violet-300 group" asChild>
            <a href="https://github.com/arav7781" className="flex items-center">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
