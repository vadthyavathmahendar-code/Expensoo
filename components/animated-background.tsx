"use client"

import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Animated gradient orbs */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full opacity-30 blur-[120px] transition-all duration-[2000ms] ease-out"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)",
          left: `${mousePosition.x - 20}%`,
          top: `${mousePosition.y - 20}%`,
        }}
      />
      <div
        className="absolute h-[500px] w-[500px] rounded-full opacity-20 blur-[100px] transition-all duration-[3000ms] ease-out"
        style={{
          background: "radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 70%)",
          right: `${100 - mousePosition.x - 10}%`,
          bottom: `${100 - mousePosition.y - 10}%`,
        }}
      />
      
      {/* Static ambient glow */}
      <div className="absolute left-1/4 top-1/4 h-[800px] w-[800px] animate-pulse rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute right-1/4 bottom-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-accent/5 blur-[120px]" style={{ animationDelay: "1s" }} />
    </div>
  )
}
