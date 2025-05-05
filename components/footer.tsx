"use client"
import { ArrowUp } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { name: "Home", href: "#home" },
        { name: "About", href: "#about" },
        { name: "Skills", href: "#skills" },
        { name: "Projects", href: "#projects" },
        { name: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#blog" },
        { name: "Research", href: "#research" },
        { name: "Resume", href: "#" },
        { name: "Achievements", href: "#achievements" },
      ],
    },
    {
      title: "Connect",
      links: [
        { name: "GitHub", href: "https://github.com/arav7781" },
        { name: "LinkedIn", href: "https://linkedin.com" },
        { name: "Twitter", href: "https://twitter.com" },
        { name: "Email", href: "mailto:aravsaxena884@gmail.com" },
      ],
    },
  ]

  return (
    <footer className="relative pt-16 pb-8 border-t border-violet-500/20 bg-black/80">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-4 inline-block"
            >
              Arav.dev
            </Link>
            <p className="text-gray-400 mb-4">
              AI & ML student passionate about building innovative solutions with cutting-edge technology.
            </p>
            <button
              onClick={scrollToTop}
              className="p-3 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp size={20} />
            </button>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index} className="md:col-span-1">
              <h3 className="text-lg font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-400 hover:text-violet-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-violet-500/20 pt-8 text-center">
          <p className="text-gray-400">© {currentYear} Arav Saxena. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Built with Next.js, Three.js, Framer Motion, and Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
