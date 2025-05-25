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

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradients and effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black -z-10"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-10 -z-10"></div>

      <Navbar />
      <HeroWebGL />
      <Projects />
    
   
      <Skills />
      <Timeline />
     
      <Research />
      {/* <CurrentWork /> */}
      <Statistics />
      <Achievements />

      {/* <Testimonials /> */}
      <BlogPreview />
      <CTA />
      <Contact />
      <Footer />
    </main>
  )
}
