"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import Image from "next/image"

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      quote:
        "Arav is one of the most talented students I've had the pleasure of teaching. His grasp of complex AI concepts and ability to implement them is truly impressive.",
      name: "Dr. Priya Sharma",
      title: "Professor of AI, Symbiosis Institute of Technology",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Working with Arav on our research project was a fantastic experience. His innovative thinking and technical skills were instrumental in our success.",
      name: "Dr. Rahul Mehta",
      title: "Research Scientist, AI Research Lab",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "Arav's contribution to our hackathon team was exceptional. His problem-solving abilities and dedication to excellence helped us secure first place.",
      name: "Ananya Patel",
      title: "Fellow Student & Hackathon Partner",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      quote:
        "During his internship, Arav demonstrated remarkable skills in developing AI solutions. His work ethic and ability to learn quickly made him stand out.",
      name: "Vikram Singh",
      title: "CTO, TechInnovate Solutions",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 relative">
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
            What People{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">Say</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Testimonials from professors, colleagues, and collaborators who have worked with me.
          </p>
        </motion.div>

        <div ref={ref} className="max-w-4xl mx-auto relative">
          <div className="relative">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="border-violet-500/20 bg-black/60 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="absolute top-8 left-8 text-violet-500 opacity-20">
                    <Quote size={80} />
                  </div>

                  <div className="relative z-10">
                    <p className="text-xl md:text-2xl italic text-gray-200 mb-8">"{testimonials[activeIndex].quote}"</p>

                    <div className="flex items-center">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-violet-500">
                        <Image
                          src={testimonials[activeIndex].image || "/placeholder.svg"}
                          alt={testimonials[activeIndex].name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="text-lg font-bold">{testimonials[activeIndex].name}</h4>
                        <p className="text-gray-400">{testimonials[activeIndex].title}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation buttons */}
            <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-4">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-black/60 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-black/60 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  activeIndex === index ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
