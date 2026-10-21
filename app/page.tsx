import Navbar from "@/components/navbar"
import HeroWebGL from "@/components/hero"
import Skills from "@/components/skills"
import KafkaFlow from "@/components/kafka-flow"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background gradients and effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-950/40 via-[#070b14] to-[#070b14] -z-10"></div>
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.06] -z-10"></div>

      <Navbar />
      <HeroWebGL />
      <KafkaFlow />
      <Skills />
    </main>
  )
}
