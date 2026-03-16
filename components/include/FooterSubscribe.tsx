"use client"

import Link from "next/link"
import { useState } from "react"
import styles from "@/app/css/Footer.module.css"

export default function FooterSubscribe() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<null | "success" | "error">(null)
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, privacyAccepted }),
    })

    setLoading(false)

    if (res.ok) {
      setEmail("")
      setPrivacyAccepted(false)
      setStatus("success")
    } else {
      setStatus("error")
    }

    setTimeout(() => setStatus(null), 4000)
  }

  return (
    <>
      <form onSubmit={subscribe} className="w-full max-w-xl mx-auto md:mx-0">
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
          <div className={styles.subscribeField}>
            <input
              id="footer-email"
              type="email"
              required
              className={styles.subscribeInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
            />
            <label htmlFor="footer-email" className={styles.subscribeLabel}></label>
          </div>

          <button
            type="submit"
            className={`flex items-center gap-2 rounded-full bg-[#212121] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-ivory)] shadow-[0_1px_1px_rgba(255,255,255,0.35)] transition active:scale-[0.99] ${loading ? "opacity-70 cursor-not-allowed" : "hover:translate-y-[-1px] hover:shadow-[0_1px_1px_rgba(255,255,255,0.35)]"}`}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fill="#ff5a00"
                d="M290.5 287.7L491.4 86.9 359 456.3 290.5 287.7zM457.4 53L256.6 253.8 88 185.3 457.4 53zM38.1 216.8l205.8 83.6 83.6 205.8c5.3 13.1 18.1 21.7 32.3 21.7 14.7 0 27.8-9.2 32.8-23.1L570.6 8c3.5-9.8 1-20.6-6.3-28s-18.2-9.8-28-6.3L39.4 151.7c-13.9 5-23.1 18.1-23.1 32.8 0 14.2 8.6 27 21.7 32.3z"
              />
            </svg>
            <span className="sr-only">{loading ? "Sending..." : "Subscribe"}</span>
          </button>
        </div>

        <label className="mt-4 flex items-start gap-3 text-sm text-[var(--color-ink)] opacity-80">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-1 accent-[var(--accent)]"
          />
          <span>
            Ich möchte den Newsletter erhalten und habe die{" "}
            <Link href="/datenschutz" className="underline underline-offset-3">
              Datenschutzhinweise
            </Link>{" "}
            gelesen. Bitte Double-Opt-In in Brevo vor dem Livegang prüfen.
          </span>
        </label>
      </form>

      {status === "success" && (
        <p className="text-sm text-[var(--color-ink)]">
          Anmeldung gespeichert. Bitte prüfen Sie Ihren Posteingang auf eine
          Bestätigungs-E-Mail.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-[var(--color-ink)]">
          Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.
        </p>
      )}
    </>
  )
}
