import { Navbar } from "@/components/navbar"
import { ParticleField } from "@/components/particle-field"
import { AnimatedBackground } from "@/components/animated-background"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { SkillsSection } from "@/components/skills-section"
import { ProjectsSection } from "@/components/projects-section"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { CursorGlow } from "@/components/cursor-glow"
import { ScrollProgress } from "@/components/scroll-progress"
import { PageLoader } from "@/components/page-loader"

export default function Home() {
  return (
    <PageLoader>
      <CursorGlow />
      <ScrollProgress />
      <AnimatedBackground />
      <ParticleField />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <Footer />
    </PageLoader>
  )
}
