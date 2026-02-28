"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpen, Cpu, Globe } from "lucide-react"

const experiences = [
  {
    icon: Globe,
    title: "Full-Stack Development",
    description:
      "Self-learning and building full-stack applications using React, Node.js, Express, and MongoDB. Focused on mastering both frontend and backend architecture.",
    tags: ["React", "Node.js", "Express", "MongoDB"],
  },
  {
    icon: BookOpen,
    title: "Real-World Applications",
    description:
      "Building production-grade applications like Civic Connect to solve genuine community problems. Practicing agile workflows and version control with Git.",
    tags: ["Project Management", "Git", "Agile", "Deployment"],
  },
  {
    icon: Cpu,
    title: "AI Integration",
    description:
      "Exploring artificial intelligence and machine learning, integrating smart features into web applications to create more intuitive user experiences.",
    tags: ["AI/ML", "APIs", "Automation", "Data"],
  },
]

export function ExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = rect.height

      // Calculate progress based on how much of the section is scrolled
      const scrolled = windowHeight - rect.top
      const progress = Math.min(Math.max(scrolled / (sectionHeight + windowHeight * 0.3), 0), 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="experience" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Experience & <span className="text-gradient">Learning</span>
          </h2>
          <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out ${isVisible ? "w-full" : "w-0"
                }`}
            />
          </div>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            My journey of continuous growth and hands-on building.
          </p>
        </div>

        <div className="relative">
          {/* Animated vertical line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-secondary/50 md:left-1/2 md:block">
            <div
              className="w-full bg-gradient-to-b from-primary via-accent to-primary transition-all duration-100 ease-out"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>

          <div className="flex flex-col gap-12">
            {experiences.map((exp, i) => (
              <div
                key={exp.title}
                className={`flex flex-col items-start gap-6 md:flex-row md:items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""
                  } transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                  }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Card */}
                <div
                  className={`glass group w-full rounded-xl p-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-primary/30 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] md:w-[calc(50%-2rem)] ${isVisible
                      ? "translate-x-0 opacity-100"
                      : i % 2 === 0
                        ? "-translate-x-8 opacity-0"
                        : "translate-x-8 opacity-0"
                    }`}
                  style={{ transitionDelay: `${i * 150 + 100}ms` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                      <exp.icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                      {exp.title}
                    </h3>
                  </div>
                  <p className="mb-4 leading-relaxed text-muted-foreground">{exp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag, tagIndex) => (
                      <span
                        key={tag}
                        className={`rounded-md bg-secondary/60 px-2.5 py-1 font-mono text-xs text-primary transition-all duration-300 hover:bg-secondary hover:scale-105 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                          }`}
                        style={{ transitionDelay: `${i * 150 + tagIndex * 50 + 200}ms` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline dot */}
                <div
                  className={`hidden h-4 w-4 flex-shrink-0 rounded-full border-2 border-primary bg-background transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:block ${scrollProgress > (i + 0.5) / experiences.length
                      ? "scale-125 bg-primary shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                      : ""
                    }`}
                />

                {/* Spacer */}
                <div className="hidden md:block md:w-[calc(50%-2rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
