"use client"

import { useEffect, useRef, useState } from "react"
import styles from "@/app/css/MouseTracker.module.css"

const TRACKER_SIZE = 40
const TRAIL_COUNT = 8
const TRAIL_EASE = 0.18
const MOBILE_MAX_WIDTH = 767
const MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px), (pointer: coarse), (prefers-reduced-motion: reduce)`

export default function MouseTracker() {
  const ringRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const posRef = useRef({ x: -TRACKER_SIZE, y: -TRACKER_SIZE })
  const trailRef = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({
      x: -TRACKER_SIZE,
      y: -TRACKER_SIZE,
    }))
  )
  const trailElsRef = useRef<(HTMLSpanElement | null)[]>([])
  const [enabled, setEnabled] = useState(true)
  const visibleRef = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY)
    const syncEnabled = () => {
      setEnabled(!mediaQuery.matches)
    }
    syncEnabled()
    mediaQuery.addEventListener("change", syncEnabled)

    return () => {
      mediaQuery.removeEventListener("change", syncEnabled)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const update = () => {
      rafRef.current = null
      const ring = ringRef.current
      if (!ring) return
      const { x, y } = posRef.current
      ring.style.transform = `translate3d(${x - TRACKER_SIZE / 2}px, ${y - TRACKER_SIZE / 2}px, 0)`

      const trail = trailRef.current
      if (trail.length === 0) return

      trail[0].x += (x - trail[0].x) * TRAIL_EASE
      trail[0].y += (y - trail[0].y) * TRAIL_EASE

      for (let i = 1; i < trail.length; i += 1) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * TRAIL_EASE
        trail[i].y += (trail[i - 1].y - trail[i].y) * TRAIL_EASE
      }

      trailElsRef.current.forEach((el, index) => {
        if (!el) return
        const point = trail[index]
        if (!point) return
        el.style.left = `${point.x}px`
        el.style.top = `${point.y}px`
        el.style.opacity = `${Math.max(0.08, 0.35 - index * 0.035)}`
        el.style.transform = `translate(-50%, -50%) scale(${1 + index * 0.15})`
      })

      if (visibleRef.current) {
        rafRef.current = window.requestAnimationFrame(update)
      }
    }

    const onMove = (event: PointerEvent) => {
      posRef.current = { x: event.clientX, y: event.clientY }
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(update)
      }
    }

    const onLeave = () => {
      if (visibleRef.current) {
        visibleRef.current = false
        setVisible(false)
        if (rafRef.current !== null) {
          window.cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("mouseleave", onLeave)
    window.addEventListener("blur", onLeave)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("blur", onLeave)
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled])

  if (!enabled) {
    return null
  }

  return (
    <div className={`${styles.trackerLayer} ${visible ? styles.visible : ""}`} aria-hidden="true">
      <div ref={ringRef} className={styles.tracker} />
      {trailRef.current.map((_, index) => (
        <span
          key={index}
          className={styles.trail}
          ref={(el) => {
            trailElsRef.current[index] = el
          }}
        />
      ))}
    </div>
  )
}
