"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ExternalLink, Mail } from "lucide-react"

const roles = ["Full Stack Developer", "Java Developer", "AI Enthusiast"]

export function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
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

      <div
        className={`relative z-10 mx-auto max-w-4xl text-center transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Available for opportunities
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
          {"Hi, I'm "}
          <span className="text-gradient">V Mahendar</span>
          <br />
          <span className="text-3xl font-medium text-muted-foreground md:text-4xl lg:text-5xl">
            Software Engineer & Problem Solver
          </span>
        </h1>

        <p className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Building scalable web applications and intelligent solutions.
        </p>

        {/* Typing effect */}
        <div className="mb-10 flex items-center justify-center font-mono text-lg text-primary md:text-xl">
          <span className="mr-2 text-muted-foreground">{">"}</span>
          <span>{displayText}</span>
          <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary" style={{ height: "1.2em" }} />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:scale-105 glow-blue"
          >
            <ExternalLink size={18} />
            View Projects
          </a>
          <a
            href="#contact"
            className="glass group inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-foreground transition-all duration-300 hover:scale-105 hover:border-primary/30"
          >
            <Mail size={18} />
            Contact Me
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#about"
            className="animate-bounce text-muted-foreground transition-colors hover:text-primary"
            aria-label="Scroll to about section"
          >
            <ArrowDown size={24} />
          </a>
        </div>
      </div>
    </section>
  )
}
