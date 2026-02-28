"use client"

import { useEffect, useRef, useState } from "react"

const skillCategories = [
  {
    title: "Programming",
    color: "from-primary to-cyan-400",
    skills: [
      { name: "Java", icon: "☕" },
      { name: "JavaScript", icon: "JS" },
      { name: "C", icon: "C" },
    ],
  },
  {
    title: "Web Development",
    color: "from-accent to-purple-400",
    skills: [
      { name: "React", icon: "⚛" },
      { name: "Node.js", icon: "N" },
    ],
  },
  {
    title: "Tools & Platforms",
    color: "from-emerald-400 to-teal-400",
    skills: [
      { name: "GitHub", icon: "GH" },
      { name: "VS Code", icon: "VS" },
      { name: "Git", icon: "G" },
    ],
  },
  {
    title: "Databases",
    color: "from-amber-400 to-orange-400",
    skills: [
      { name: "MongoDB", icon: "M" },
      { name: "Supabase", icon: "S" },
      { name: "Firebase", icon: "🔥" },
    ],
  },
]

export function SkillsSection() {
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
    <section id="skills" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-6xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            My <span className="text-gradient">Skills</span>
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-primary to-accent" />
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Technologies and tools I work with to bring ideas to life.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category, catIndex) => (
            <div
              key={category.title}
              className={`glass group rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:border-primary/30 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
              style={{ transitionDelay: `${catIndex * 150}ms` }}
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                <span className={`bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                  {category.title}
                </span>
              </h3>
              <div className="flex flex-col gap-3">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-3 rounded-lg bg-secondary/40 px-4 py-3 transition-all duration-300 hover:bg-secondary/70"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                      {skill.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
