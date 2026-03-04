"use client"

import { useEffect, useRef, useState } from "react"

const skillCategories = [
  {
    title: "Programming",
    color: "from-primary to-cyan-400",
    glowColor: "rgba(56, 189, 248, 0.3)",
    skills: [
      { name: "Java", icon: "☕" },
      { name: "JavaScript", icon: "JS" },
      { name: "C", icon: "C" },
    ],
  },
  {
    title: "Web Development",
    color: "from-accent to-purple-400",
    glowColor: "rgba(129, 140, 248, 0.3)",
    skills: [
      { name: "React", icon: "⚛" },
      { name: "Node.js", icon: "N" },
    ],
  },
  {
    title: "Tools & Platforms",
    color: "from-emerald-400 to-teal-400",
    glowColor: "rgba(52, 211, 153, 0.3)",
    skills: [
      { name: "GitHub", icon: "GH" },
      { name: "VS Code", icon: "VS" },
      { name: "Git", icon: "G" },
    ],
  },
  {
    title: "Databases",
    color: "from-amber-400 to-orange-400",
    glowColor: "rgba(251, 191, 36, 0.3)",
    skills: [
      { name: "MongoDB", icon: "M" },
      { name: "Supabase", icon: "S" },
      { name: "Firebase", icon: "🔥" },
    ],
  },
]

function SkillCard({
  category,
  index,
  isVisible,
}: {
  category: (typeof skillCategories)[0]
  index: number
  isVisible: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 8 })
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
      className={`glass group rounded-xl p-6 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        boxShadow: isHovered ? `0 0 30px ${category.glowColor}` : "none",
      }}
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
          {category.title}
        </span>
      </h3>
      <div className="flex flex-col gap-3">
        {category.skills.map((skill, skillIndex) => (
          <div
            key={skill.name}
            className={`flex items-center gap-3 rounded-lg bg-secondary/40 px-4 py-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-secondary/70 hover:translate-x-1 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 100 + skillIndex * 75 + 200}ms` }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary transition-transform duration-300 group-hover:scale-110">
              {skill.icon}
            </span>
            <span className="text-sm font-medium text-foreground">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkillsSection() {
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
    <section id="skills" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            My <span className="text-gradient">Skills</span>
          </h2>
          <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out ${
                isVisible ? "w-full" : "w-0"
              }`}
            />
          </div>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Technologies and tools I work with to bring ideas to life.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category, index) => (
            <SkillCard
              key={category.title}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
