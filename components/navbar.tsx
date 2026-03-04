"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Determine active section
      const sections = navLinks.map((link) => link.href.replace("#", ""))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? "bg-background/70 py-3 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/5" 
            : "bg-transparent py-5"
        }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a
          href="#"
          className="group text-gradient text-xl font-bold tracking-tight transition-transform duration-300 hover:scale-105"
          aria-label="Go to top"
        >
          <span className="inline-block transition-transform duration-300 group-hover:-rotate-3">
            {"<Mahi />"}
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className={`relative px-4 py-2 text-sm transition-colors duration-300 ${activeSection === link.href.replace("#", "")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
                  }`}
              >
                {link.name}
                {/* Active indicator */}
                <span
                  className={`absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ease-in-out ${activeSection === link.href.replace("#", "") ? "w-4" : "w-0"
                    }`}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className="relative z-50 text-foreground transition-transform duration-300 hover:scale-110 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative h-6 w-6">
            <X
              size={24}
              className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
                }`}
            />
            <Menu
              size={24}
              className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
                }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-lg transition-all duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="glass p-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link, index) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`block rounded-lg px-4 py-3 text-sm transition-all duration-300 ${activeSection === link.href.replace("#", "")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ transitionDelay: isMobileMenuOpen ? `${index * 40}ms` : "0ms" }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
