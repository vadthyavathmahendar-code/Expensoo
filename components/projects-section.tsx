"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Github, Layers } from "lucide-react"

const projects = [
  {
    title: "Civic Connect",
    description:
      "A community engagement platform that empowers citizens to report local issues, participate in community decisions, and connect with local governance. Features real-time updates, interactive maps, and a robust discussion forum.",
    techStack: ["React", "Node.js", "Express", "Supabase"],
    github: "https://github.com/vadthyavathmahendar-code/ccgovt",
    demo: "https://ccgovt-2026.vercel.app/",
    featured: true,
  },
  {
    title: "Expenso",
    description:
      "A privacy-focused personal finance manager that enables users to track daily expenses, set budget limits, and visualize spending patterns. Features secure data synchronization, encrypted local storage, and automated monthly financial summaries.",
    techStack: ["React Native", "Firebase", "Node.js", "Context API"],
    github: "https://github.com/vadthyavathmahendar-code/Expensoo",
    demo: "#",
    featured: true,
  },
]

function ProjectCard({
  project,
  isVisible,
  index,
}: {
  project: (typeof projects)[0]
  isVisible: boolean
  index: number
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -15, y: x * 15 })
    setGlowPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      }`}
      style={{
        transitionDelay: `${index * 150}ms`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Animated border glow */}
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(56, 189, 248, 0.15), transparent 40%)`,
        }}
      />

      {/* Card content */}
      <div className="glass relative rounded-2xl p-8 transition-all duration-300 group-hover:border-primary/20">
        {/* Inner glow effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(56, 189, 248, 0.06), transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          {project.featured && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all duration-300 group-hover:bg-primary/15">
              <Layers size={12} />
              Featured Project
            </div>
          )}

          <h3 className="mb-3 text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
            {project.title}
          </h3>
          <p className="mb-6 leading-relaxed text-muted-foreground">{project.description}</p>

          <div className="mb-6 flex flex-wrap gap-2">
            {project.techStack.map((tech, i) => (
              <span
                key={tech}
                className="rounded-md bg-secondary/60 px-3 py-1.5 font-mono text-xs text-primary transition-all duration-300 hover:bg-secondary hover:scale-105"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <a
              href={project.github}
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} className="transition-transform duration-300 group-hover/btn:rotate-12" />
              Source Code
            </a>
            <a
              href={project.demo}
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              Live Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <section id="projects" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            My <span className="text-gradient">Projects</span>
          </h2>
          <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out ${
                isVisible ? "w-full" : "w-0"
              }`}
            />
          </div>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Showcasing real-world applications I have built from the ground up.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              isVisible={isVisible}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
