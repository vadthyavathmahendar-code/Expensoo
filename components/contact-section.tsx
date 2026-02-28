"use client"

import { useEffect, useRef, useState } from "react"
import { Github, Linkedin, Mail, Send, CheckCircle } from "lucide-react"
import { MagneticButton } from "./magnetic-button"

export function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [formState, setFormState] = useState({ name: "", email: "", message: "" })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const button = e.currentTarget.querySelector('button[type="submit"]')
    if (button) {
      const rect = button.getBoundingClientRect()
      setRipple({
        x: rect.width / 2,
        y: rect.height / 2,
      })
      setTimeout(() => setRipple(null), 600)
    }
    setIsSubmitted(true)
    setFormState({ name: "", email: "", message: "" })
    setTimeout(() => setIsSubmitted(false), 4000)
  }

  const inputClasses = (field: string) =>
    `peer w-full rounded-lg border bg-secondary/40 px-4 py-3 pt-6 text-sm text-foreground placeholder-transparent outline-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${focusedField === field || formState[field as keyof typeof formState]
      ? "border-primary"
      : "border-border"
    } focus:border-primary focus:bg-secondary/60`

  const labelClasses = (field: string) =>
    `pointer-events-none absolute left-4 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${focusedField === field || formState[field as keyof typeof formState]
      ? "top-2 text-xs text-primary"
      : "top-1/2 -translate-y-1/2 text-sm"
    }`

  return (
    <section id="contact" className="relative px-6 py-24" ref={sectionRef}>
      <div className="mx-auto max-w-4xl">
        <div
          className={`mb-16 text-center transition-all duration-700 ease-in-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <div className="mx-auto h-1 w-20 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full bg-linear-to-r from-primary to-accent transition-all duration-1000 ease-out ${isVisible ? "w-full" : "w-0"
                }`}
            />
          </div>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            {"Have a project in mind or just want to say hi? I'd love to hear from you."}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div
            className={`transition-all duration-700 ease-in-out ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
            style={{ transitionDelay: "200ms" }}
          >
            <form onSubmit={handleSubmit} className="glass rounded-xl p-6">
              {/* Name Field */}
              <div className="relative mb-4">
                <input
                  id="name"
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClasses("name")}
                  placeholder="Name"
                />
                <label htmlFor="name" className={labelClasses("name")}>
                  Name
                </label>
              </div>

              {/* Email Field */}
              <div className="relative mb-4">
                <input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClasses("email")}
                  placeholder="Email"
                />
                <label htmlFor="email" className={labelClasses("email")}>
                  Email
                </label>
              </div>

              {/* Message Field */}
              <div className="relative mb-6">
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClasses("message")} resize-none pt-6`}
                  placeholder="Message"
                />
                <label
                  htmlFor="message"
                  className={`pointer-events-none absolute left-4 text-muted-foreground transition-all duration-300 ease-in-out ${focusedField === "message" || formState.message
                    ? "top-2 text-xs text-primary"
                    : "top-4 text-sm"
                    }`}
                >
                  Message
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
              >
                {/* Ripple effect */}
                {ripple && (
                  <span
                    className="absolute animate-ping rounded-full bg-white/30"
                    style={{
                      left: ripple.x - 10,
                      top: ripple.y - 10,
                      width: 20,
                      height: 20,
                    }}
                  />
                )}
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {isSubmitted ? (
                    <>
                      <CheckCircle size={16} className="animate-bounce" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      Send Message
                    </>
                  )}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div
            className={`flex flex-col justify-center gap-6 transition-all duration-700 ease-in-out ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="glass rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">{"Let's Connect"}</h3>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                {"I'm always open to discussing new projects, creative ideas, or opportunities to be part of something amazing."}
              </p>

              <div className="flex flex-col gap-4">
                {[
                  { icon: Mail, href: "mailto:vadthyavathmahendar@gmail.com", text: "vadthyavathmahendar@gmial.com" },
                  { icon: Github, href: "https://github.com/vadthyavathmahendar-code", text: "https://github.com/vadthyavathmahendar-code" },
                  { icon: Linkedin, href: "https://linkedin.com", text: "linkedin.com/in/mahi" },
                ].map((item, index) => (
                  <MagneticButton
                    key={item.text}
                    href={item.href}
                    className={`group flex items-center gap-3 text-muted-foreground transition-all duration-300 ease-in-out hover:text-primary ${isVisible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                      }`}
                    strength={0.15}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                      <item.icon size={18} />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
