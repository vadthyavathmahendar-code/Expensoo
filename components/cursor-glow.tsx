"use client"

import { useEffect, useRef, useState } from "react"

export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isPointer, setIsPointer] = useState(false)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      if (!isVisible) setIsVisible(true)

      // Check if hovering over interactive element
      const target = e.target as HTMLElement
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        window.getComputedStyle(target).cursor === "pointer"
      setIsPointer(isInteractive)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Smooth animation loop
    const animate = () => {
      const lerp = 0.15
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp
      setPosition({ ...currentRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isVisible])

  return (
    <>
      {/* Main glow */}
      <div
        className="pointer-events-none fixed z-50 hidden md:block"
        style={{
          left: position.x - 200,
          top: position.y - 200,
          width: 400,
          height: 400,
          background: isPointer
            ? "radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, rgba(56, 189, 248, 0.05) 40%, transparent 70%)"
            : "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(129, 140, 248, 0.04) 40%, transparent 70%)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease, background 0.3s ease",
          transform: `scale(${isPointer ? 1.2 : 1})`,
        }}
        aria-hidden="true"
      />

      {/* Small cursor dot */}
      <div
        className="pointer-events-none fixed z-[60] hidden md:block"
        style={{
          left: position.x - 4,
          top: position.y - 4,
          width: 8,
          height: 8,
          background: "rgba(56, 189, 248, 0.8)",
          borderRadius: "50%",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease, transform 0.2s ease",
          transform: `scale(${isPointer ? 2.5 : 1})`,
          boxShadow: isPointer
            ? "0 0 15px rgba(129, 140, 248, 0.5)"
            : "0 0 10px rgba(56, 189, 248, 0.5)",
        }}
        aria-hidden="true"
      />
    </>
  )
}
