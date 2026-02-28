"use client"

import { useEffect, useState } from "react"

export function PageLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Short delay for the loader animation
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    // Delay content reveal for smooth fade-in
    const visibleTimer = setTimeout(() => {
      setIsVisible(true)
    }, 900)

    return () => {
      clearTimeout(loadTimer)
      clearTimeout(visibleTimer)
    }
  }, [])

  return (
    <>
      {/* Loading Screen */}
      <div
        className={`fixed inset-0 z-[200] flex items-center justify-center bg-background transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isLoading ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-primary/50" />
            <div className="absolute inset-4 rounded-full bg-primary" />
          </div>
          <span className="font-mono text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  )
}
