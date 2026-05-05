"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Instagram, Linkedin, Music2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import styles from "../../app/css/staggered-menu.module.css"
import { a } from "motion/react-client"

type Settings = {
  logo?: string
  site_name?: string
}

type NavItem = {
  label: string
  href: string
  aria: string
}

type SocialItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", aria: "Go to home" },
  { label: "About Me", href: "/aboutMe", aria: "Learn more about me" },
  { label: "Photo Gallery", href: "/photoGallery", aria: "View my photo gallery" },
  { label: "Video Gallery", href: "/videoGallery", aria: "View my video gallery" },
  { label: "Impressum", href: "/impressum", aria: "Impressum" },
  { label: "Datenschutz", href: "/datenschutz", aria: "Datenschutz" },
  { label: "Developer Portfolio", href: "https://portofolio.maher-albeek.com/", aria: "Visit my developer portfolio" },
]

const socialItems: SocialItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/maher-albeek", icon: Linkedin, accent: "#0a66c2" },
  { label: "GitHub", href: "https://github.com/Maher-Albeek", icon: Github, accent: "#ffffff" },
  { label: "Instagram", href: "https://www.instagram.com/maher_albeek?igsh=Z2EyNmIwbjBsa21y", icon: Instagram, accent: "#e4405f" },
  { label: "Tiktok", href: "https://www.tiktok.com/@maher_albeek?is_from_webapp=1&sender_device=pc", icon: Music2, accent: "#25f4ee" },
]

export default function HeaderClient({ settings }: { settings: Settings | null }) {
  const logoSrc = settings?.logo
    ? settings.logo.startsWith("http")
      ? settings.logo
      : `/${settings.logo.replace(/^\/+/, "")}`
    : null
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let raf = 0
    const hero = document.querySelector(".hero-slider") as HTMLElement | null

    const update = () => {
      raf = 0
      const threshold = hero ? hero.offsetHeight - 80 : 80
      setScrolled(window.scrollY > threshold)
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow")
      return
    }

    document.body.style.overflow = "hidden"

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    const handleClickAway = (event: MouseEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setIsOpen(false)
    }

    window.addEventListener("keydown", handleKey)
    document.addEventListener("mousedown", handleClickAway)

    return () => {
      window.removeEventListener("keydown", handleKey)
      document.removeEventListener("mousedown", handleClickAway)
      document.body.style.removeProperty("overflow")
    }
  }, [isOpen])

  return (
    <header
      className={[
        styles.wrapper,
        scrolled ? styles.scrolled : "",
        isOpen ? styles.open : "",
      ].join(" ")}
      data-open={isOpen ? "true" : undefined}
    >
      <div
        className={styles.scrim}
        aria-hidden={!isOpen}
        onClick={() => setIsOpen(false)}
      />
      <div className={styles.preLayers} aria-hidden="true">
        {["#b19eef", "#7b5bff", "#5227ff", "#0f0d2e"].map((color, idx) => (
          <span
            key={color + idx}
            className={styles.preLayer}
            style={{ background: color, transitionDelay: `${idx * 60}ms` }}
          />
        ))}
      </div>

      <div className={styles.bar}>
        <div className={styles.logo}>
          {logoSrc ? (
            <a href="/" aria-label="Home">

            <Image
              src={logoSrc}
              alt={settings?.site_name || "Logo"}
              width={120}
              height={32}
              sizes="120px"
              className={styles.logoImg}
              draggable={false}
            />
            </a>
          ) : (
            <span className={styles.logoText}>{settings?.site_name || "Portfolio"}</span>
          )}
        </div>

        <button
          ref={toggleRef}
          className={styles.toggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="staggered-menu-panel"
          onClick={() => setIsOpen(prev => !prev)}
          type="button"
        >
          <span className={styles.toggleTextWrap} aria-hidden="true">
            <span
              className={styles.toggleTextInner}
              style={{ transform: isOpen ? "translateY(-100%)" : "translateY(0)" }}
            >
              <span className={styles.toggleLine}>Menu</span>
              <span className={styles.toggleLine}>Close</span>
            </span>
          </span>
          <span className={styles.icon} aria-hidden="true">
            <span className={styles.iconLine} />
            <span className={`${styles.iconLine} ${styles.iconLineV}`} />
          </span>
        </button>
      </div>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className={styles.panel}
        aria-hidden={!isOpen}
      >
        <div className={styles.panelInner}>
          <ul className={styles.panelList} role="list">
            {navItems.map((item, idx) => (
              <li
                key={item.label}
                className={styles.panelItem}
                style={{ transitionDelay: isOpen ? `${120 + idx * 80}ms` : "0ms" }}
              >
                <Link href={item.href} aria-label={item.aria} onClick={() => setIsOpen(false)}>
                  <span className={styles.itemNumber}>{String(idx + 1).padStart(2, "0")}</span>
                  <span className={styles.itemLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.socials} aria-label="Social links">
            <h3 className={styles.socialTitle}>Socials</h3>
            <ul className={styles.socialList} role="list">
              {socialItems.map(social => {
                const Icon = social.icon
                return (
                  <li key={social.label} className={styles.socialItem}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.label}
                      style={{ ["--social-accent" as string]: social.accent }}
                    >
                      <Icon className={styles.socialIcon} aria-hidden="true" />
                      <span className={styles.socialTooltip} aria-hidden="true">{social.label}</span>
                      <span className={styles.srOnly}>{social.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </aside>
    </header>
  )
}
