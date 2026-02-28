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
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -10, y: x * 10 })
  }

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:border-primary/30 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      style={{
        transitionDelay: `${index * 200}ms`,
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-accent/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10">
        {project.featured && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Layers size={12} />
            Featured Project
          </div>
        )}

        <h3 className="mb-3 text-2xl font-bold text-foreground">{project.title}</h3>
        <p className="mb-6 leading-relaxed text-muted-foreground">{project.description}</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-secondary/60 px-3 py-1.5 font-mono text-xs text-primary"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-4">
          <a
            href={project.github}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} />
            Source Code
          </a>
          <a
            href={project.demo}
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary/20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Live Demo
          </a>
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
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="projects" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            My <span className="text-gradient">Projects</span>
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-primary to-accent" />
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
