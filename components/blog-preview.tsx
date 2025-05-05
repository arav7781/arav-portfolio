"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react"
import Image from "next/image"

export default function BlogPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const blogPosts = [
    {
      title: "Understanding Different Types of Retrieval-Augmented Generation (RAG)",
      excerpt:
        "In this article, we will explore the different types of RAG and their applications in the field of AI.",
      date: "May 15, 2024",
      readTime: "8 min read",
      category: "AI Trends",
      image: "/af5c73fb-45a7-40f6-a8c6-4e5f2649f8fd.jpg?height=300&width=600",
      link: "https://medium.com/@aravsaxena884/understanding-different-types-of-retrieval-augmented-generation-rag-53da85f538aa",
    },
    // {
    //   title: "Building Explainable AI Systems: A Practical Guide",
    //   excerpt:
    //     "A step-by-step approach to designing AI systems that provide transparent explanations for their decisions and recommendations.",
    //   date: "April 28, 2024",
    //   readTime: "12 min read",
    //   category: "Technical",
    //   image: "/placeholder.svg?height=300&width=600",
    //   link: "#",
    // },
    // {
    //   title: "Ethics in AI: Navigating the Challenges of Responsible Innovation",
    //   excerpt:
    //     "Discussing the ethical considerations and frameworks for developing AI systems that benefit society while minimizing harm.",
    //   date: "March 10, 2024",
    //   readTime: "10 min read",
    //   category: "Ethics",
    //   image: "/placeholder.svg?height=300&width=600",
    //   link: "#",
    // },
  ]

  return (
    <section id="blog" className="py-20 relative">
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
            Latest{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Articles
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Thoughts, insights, and tutorials on AI, machine learning, and technology.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Card className="border-violet-500/20 bg-black/60 backdrop-blur-sm h-full flex flex-col transition-all duration-300 hover:border-violet-500/50 hover:translate-y-[-5px]">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-500/70 text-white">
                      <Tag className="mr-1 h-3 w-3" />
                      {post.category}
                    </span>
                  </div>
                </div>

                <CardContent className="flex-grow p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>

                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.date}</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>

                  <p className="text-gray-300 line-clamp-3">{post.excerpt}</p>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button variant="link" className="text-violet-400 hover:text-violet-300 p-0 group" asChild>
                    <a href={post.link} className="flex items-center">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 group"
            asChild
          >
            <a href="https://medium.com/@aravsaxena884" className="flex items-center">
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
