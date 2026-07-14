import Navbar from "@/components/navbar"
import HeroWebGL from "@/components/hero"
import Skills from "@/components/skills"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background gradients and effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-100/30 via-background to-background dark:from-violet-900/10 dark:via-black dark:to-black -z-10"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-5 dark:opacity-10 -z-10"></div>

      <Navbar />
      <HeroWebGL />
      <Skills />
    </main>
  )
}
