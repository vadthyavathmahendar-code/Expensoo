"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ExternalLink, Mail, Download } from "lucide-react"
import { MagneticButton } from "./magnetic-button"

const roles = ["Full Stack Developer", "Java Developer", "AI Enthusiast"]

export function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const role = roles[currentRole]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < role.length) {
            setDisplayText(role.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentRole((prev) => (prev + 1) % roles.length)
          }
        }
      },
      isDeleting ? 40 : 80
    )
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center px-6"
    >
      {/* Radial glow behind hero */}
      <div className="absolute inset-0 bg-gradient-radial" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Status Badge */}
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground transition-all duration-1000 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Available for opportunities
        </div>

        {/* Main Heading */}
        <h1
          className={`mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground transition-all delay-100 duration-1000 ease-in-out md:text-6xl lg:text-7xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          {"Hi, I'm "}
          <span className="text-gradient">V Mahendar</span>
          <br />
          <span className="text-3xl font-medium text-muted-foreground md:text-4xl lg:text-5xl">
            Software Engineer & Problem Solver
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-muted-foreground transition-all delay-200 duration-1000 ease-in-out md:text-xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          Building scalable web applications and intelligent solutions.
        </p>

        {/* Typing effect */}
        <div
          className={`mb-10 flex items-center justify-center font-mono text-lg text-primary transition-all delay-300 duration-1000 ease-in-out md:text-xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <span className="mr-2 text-muted-foreground">{">"}</span>
          <span>{displayText}</span>
          <span
            className="ml-0.5 inline-block w-[2px] bg-primary"
            style={{
              height: "1.2em",
              animation: "blink 1s step-end infinite",
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col items-center justify-center gap-4 transition-all delay-400 duration-1000 ease-in-out sm:flex-row ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <MagneticButton
            href="#projects"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
            strength={0.2}
          >
            <ExternalLink size={18} className="transition-transform duration-300 group-hover:rotate-12" />
            View Projects
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="glass group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3 font-medium text-foreground transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            strength={0.2}
          >
            <Mail size={18} className="transition-transform duration-300 group-hover:scale-110" />
            Contact Me
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </MagneticButton>
          <MagneticButton
            href="/resume.pdf"
            download
            className="glass group relative inline-flex items-center gap-2 overflow-hidden rounded-lg border border-accent/30 px-6 py-3 font-medium text-foreground transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(129,140,248,0.2)]"
            strength={0.2}
          >
            <Download size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            Resume
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </MagneticButton>
        </div>

        {/* Scroll indicator */}
        <div
          className={`mt-16 flex justify-center transition-all delay-500 duration-1000 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <a
            href="#about"
            className="group flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
            aria-label="Scroll to about section"
          >
            <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
            <ArrowDown size={20} className="animate-bounce" />
          </a>
        </div>
      </div>

      {/* Blink animation for cursor */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}
