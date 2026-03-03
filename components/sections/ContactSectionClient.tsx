"use client"

import { useState } from "react"
import styles from "@/app/css/sections/ContactSection.module.css"

type Category = {
  name: string
}

export default function ContactSectionClient({ categories }: { categories: Category[] }) {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<null | {
    type: "success" | "error"
    message: string
  }>(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setToast({ type: "success", message: "Nachricht wurde erfolgreich gesendet" })
      setForm({ name: "", email: "", category: "", message: "" })
    } else {
      setToast({
        type: "error",
        message: data.error || "Etwas ist schiefgelaufen",
      })
    }

    setTimeout(() => setToast(null), 4000)
  }

  return (
    <section id="contact" className="py-14 text-[var(--color-ink)]">
      <div className="container mx-auto px-6 max-w-6xl">
        <p className="text-center text-[var(--color-ink)] opacity-80 max-w-2xl mx-auto mb-10">
          Erzähle mir kurz von deinem Projekt, ich melde mich so schnell wie möglich.
        </p>

        <div className={`${styles.formColumn} ${styles.container}`}>
          <div className={styles.formShell}>
            <div className={styles.formFront}>
              <div className={styles.formHeader}>
                <div>
                  <p className={styles.kicker}>Lass uns sprechen</p>
                  <p className={styles.subtitle}>
                    Ein paar Zeilen helfen mir, dir schnell und gezielt zu antworten.
                  </p>
                </div>
                <span className={styles.badge}>Antwort innerhalb von 24h</span>
              </div>

              <form onSubmit={submit} className={styles.form}>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.label}>Vollständiger Name</span>
                    <input
                      type="text"
                      placeholder="Ihr Name"
                      className={styles.control}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>E-Mail</span>
                    <input
                      type="email"
                      placeholder="sie@example.com"
                      className={styles.control}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>Projektart</span>
                  <select
                    className={`${styles.control} ${styles.select}`}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Kategorie wählen</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Nachricht</span>
                  <textarea
                    className={`${styles.control} ${styles.textarea}`}
                    rows={5}
                    placeholder="Teile mir kurz die wichtigsten Details mit: Zeitpunkt, Ort und was dir sonst wichtig ist."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className={`${styles.submitButton} ${loading ? styles.isLoading : ""}`}
                  disabled={loading}
                >
                  {loading ? "Sende..." : "Nachricht senden"}
                </button>
              </form>

              {toast && (
                <div
                  className={styles.toast}
                  data-type={toast.type}
                  role="status"
                  aria-live="polite"
                >
                  {toast.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
