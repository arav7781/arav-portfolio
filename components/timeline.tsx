"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useTransform, useScroll, useSpring, useInView } from "framer-motion";
import { School, Briefcase, Award, Code, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    stiffness: 500,
    damping: 90,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), {
    stiffness: 500,
    damping: 90,
  });

  return (
    <motion.div
      ref={ref}
      className={cn("relative mx-auto h-full w-full max-w-4xl", className)}
    >
      <div className="absolute top-3 left-0 md:left-1/2 transform md:-translate-x-1/2">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          className="border-neutral-200 flex h-4 w-4 items-center justify-center rounded-full border shadow-sm"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor: scrollYProgress.get() > 0 ? "white" : "#10b981",
              borderColor: scrollYProgress.get() > 0 ? "white" : "#059669",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};

export default function Timeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const timelineEvents = [
    {
      year: "2023",
      title: "Started B.Tech in AI & ML",
      description:
        "Enrolled at Symbiosis Institute of Technology, Pune to pursue B.Tech in Artificial Intelligence and Machine Learning.",
      icon: <School className="h-5 w-5" />,
      category: "Education",
    },
    {
      year: "2024",
      title: "First Hackathon Final",
      description: "Finalist at the SASTRA University hackathon with an Generative-AI solution for Interview Preparations.",
      icon: <Award className="h-5 w-5" />,
      category: "Experience",
    },
    {
      year: "2024",
      title: "Published First Research Paper",
      description:
        "Published a research paper on 'AgenticCV: An AI-Powered Computer Vision Application for text to Computer Vision Conversion with no code capability for the user.' with the arXiv.",
      icon: <Briefcase className="h-5 w-5" />,
      category: "Research",
    },
    {
      year: "2024",
      title: "First Patent Filed",
      description:
        "Filed a patent for 'ArogyaNext - AI-Powered Health guidance System' with the USPTO.",
      icon: <Lightbulb className="h-5 w-5" />,
      category: "Research",
    },
    {
      year: "2024",
      title: "Open Source Contribution",
      description:
        "Became an active contributor to several open-source AI and ML libraries.",
      icon: <Code className="h-5 w-5" />,
      category: "Development",
    },
    {
      year: "2024",
      title: "Multiple Hackathons Finalist",
      description:
        "Secured finalist positions in multiple hackathons with innovative AI and ML solutions.",
      icon: <Briefcase className="h-5 w-5" />,
      category: "Experience",
    },
  ];

  const categoryColors = {
    Education: "from-blue-500 to-cyan-500",
    Achievement: "from-amber-500 to-yellow-500",
    Experience: "from-violet-500 to-fuchsia-500",
    Research: "from-emerald-500 to-green-500",
    Development: "from-rose-500 to-pink-500",
  };

  return (
    <section id="timeline" className="py-20 relative">
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
            My{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
              Journey
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A timeline of my academic and professional milestones in the world of AI and technology.
          </p>
        </motion.div>

        <TracingBeam>
          <div ref={ref} className="max-w-4xl mx-auto relative">
            {/* Timeline events */}
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 w-7 h-7 rounded-full bg-black border-2 border-violet-500 transform -translate-x-3 md:-translate-x-3.5 flex items-center justify-center z-10">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]}`}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pl-0 md:pr-12" : "md:pl-12 md:pr-0"} pl-10`}>
                    <div className="bg-black/60 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-all duration-300 hover:transform hover:-translate-y-1">
                      <div className="flex items-center mb-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} mr-3`}
                        >
                          {event.icon}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-400">{event.year}</span>
                          <h3 className="text-xl font-bold">{event.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-300">{event.description}</p>
                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-300 border border-violet-500/30">
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TracingBeam>
      </div>
    </section>
  );
}