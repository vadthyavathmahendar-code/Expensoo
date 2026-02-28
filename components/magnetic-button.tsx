"use client"

import { useRef, useState } from "react"

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  strength?: number
  style?: React.CSSProperties
}

export function MagneticButton({
  children,
  className = "",
  href,
  onClick,
  type = "button",
  strength = 0.3,
  style: externalStyle,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const element = href ? linkRef.current : buttonRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = (e.clientX - centerX) * strength
    const y = (e.clientY - centerY) * strength
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  const magneticStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: position.x === 0 && position.y === 0 
      ? "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)" 
      : "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    ...externalStyle,
  }

  if (href) {
    return (
      <a
        ref={linkRef}
        href={href}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={magneticStyle}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      ref={buttonRef}
      type={type}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={magneticStyle}
    >
      {children}
    </button>
  )
}
