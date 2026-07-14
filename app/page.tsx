import Hero from "@/components/hero"
import About from "@/components/about"
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import Contact from "@/components/contact"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Timeline from "@/components/timeline"
import Achievements from "@/components/achievements"
import Testimonials from "@/components/testimonials"
import Research from "@/components/research"
import Statistics from "@/components/statistics"
import CurrentWork from "@/components/current-work"
import BlogPreview from "@/components/blog-preview"
import CTA from "@/components/cta"
import HeroWebGL from "@/components/hero"
import GraphMount from "@/components/graph/graph-mount"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background gradients and effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-100/30 via-background to-background dark:from-violet-900/10 dark:via-black dark:to-black -z-10"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-5 dark:opacity-10 -z-10"></div>

      <Navbar />
      <HeroWebGL />

      {/* Interactive Knowledge Graph Section */}
      <section id="knowledge-graph" className="py-20 relative bg-background/50 border-y border-slate-200 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white">
              Interactive{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 animate-gradient">
                Knowledge Graph
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Traverse the connection map between my research areas, professional milestones, projects, and specialized skills. Drag nodes to customize, click to dive deep.
            </p>
          </div>
          <div className="h-[600px] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-card shadow-lg relative">
            <GraphMount />
          </div>
        </div>
      </section>

      <Projects />
      <Skills />
      <Timeline />
      <Research />
      <Statistics />
      <Achievements />
      <BlogPreview />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}
