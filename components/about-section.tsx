"use client"

import { useEffect, useRef, useState } from "react"
import { Code2, Lightbulb, Rocket } from "lucide-react"

const highlights = [
  {
    icon: Code2,
    title: "Clean Code",
    description: "Writing maintainable, scalable code with modern best practices.",
  },
  {
    icon: Lightbulb,
    title: "Problem Solver",
    description: "Breaking down complex challenges into elegant solutions.",
  },
  {
    icon: Rocket,
    title: "Fast Learner",
    description: "Constantly exploring new technologies and pushing boundaries.",
  },
]

const skillBars = [
  { name: "JavaScript", level: 90 },
  { name: "Java", level: 85 },
  { name: "C", level: 75 },
  { name: "React", level: 85 },
  { name: "Node.js", level: 80 },
]

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            About <span className="text-gradient">Me</span>
          </h2>
          <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full bg-linear-to-r from-primary to-accent transition-all duration-1000 ease-out ${isVisible ? "w-full" : "w-0"
                }`}
            />
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left - About Text */}
          <div
            className={`transition-all duration-700 ease-in-out ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
            style={{ transitionDelay: "200ms" }}
          >
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {"I'm a passionate Computer Science Engineering student who thrives on turning ideas into reality through code. With a strong foundation in "}
              <span className="font-semibold text-primary transition-colors duration-300 hover:text-accent">JavaScript</span>
              {", "}
              <span className="font-semibold text-primary transition-colors duration-300 hover:text-accent">Java</span>
              {", and "}
              <span className="font-semibold text-primary transition-colors duration-300 hover:text-accent">C</span>
              {", I enjoy building full-stack applications that solve real-world problems."}
            </p>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {"My flagship project, "}
              <span className="font-semibold text-accent transition-colors duration-300 hover:text-primary">Civic Connect</span>
              {", is a community-focused platform that showcases my ability to architect and deliver impactful solutions from concept to deployment."}
            </p>

            {/* Skill Bars */}
            <div className="space-y-4">
              {skillBars.map((skill, i) => (
                <div
                  key={skill.name}
                  className={`transition-all duration-500 ease-in-out ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                    }`}
                  style={{ transitionDelay: `${i * 100 + 400}ms` }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <span className="font-mono text-sm text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="relative h-full rounded-full bg-linear-to-r from-primary to-accent transition-all duration-1000 ease-in-out"
                      style={{
                        width: isVisible ? `${skill.level}%` : "0%",
                        transitionDelay: `${i * 150 + 600}ms`,
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Highlight Cards */}
          <div
            className={`flex flex-col gap-4 transition-all duration-700 ease-in-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            style={{ transitionDelay: "400ms" }}
          >
            {highlights.map((item, i) => (
              <div
                key={item.title}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`glass group relative overflow-hidden rounded-xl p-6 transition-all duration-500 ease-in-out hover:border-primary/30 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                style={{
                  transitionDelay: `${i * 100 + 500}ms`,
                  boxShadow: hoveredCard === i ? "0 0 30px rgba(56, 189, 248, 0.2)" : "none",
                }}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3">
                      <item.icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                      {item.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </section>
  )
}
