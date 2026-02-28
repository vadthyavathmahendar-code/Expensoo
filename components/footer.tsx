"use client"

import { Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className="text-sm text-muted-foreground">
            {"Designed & Built by "}
            <span className="font-semibold text-foreground transition-colors duration-300 hover:text-primary">
              Mahi
            </span>
          </p>
          <p className="text-xs text-muted-foreground/60">
            {currentYear} All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {[
            { icon: Github, href: "https://github.com/vadthyavathmahendar-code", label: "GitHub" },
            { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
            { icon: Mail, href: "mailto:vadthyavathmahendar@gmail.com", label: "Email" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/40 text-muted-foreground transition-all duration-300 hover:bg-primary/20 hover:text-primary hover:scale-110 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              aria-label={item.label}
            >
              <item.icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
            </a>
          ))}
        </div>
      </div>

      {/* Subtle gradient line at top */}
      <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
    </footer>
  )
}
