 "use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const STORAGE_KEY = "cookie-consent"

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    setIsVisible(stored === null)
  }, [])

  const handleChoice = (value: "accepted" | "declined") => {
    window.localStorage.setItem(STORAGE_KEY, value)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex w-96 flex-col items-center rounded-lg border border-gray-500/30 bg-gray-800 p-6 text-center text-sm text-gray-500 shadow-lg">
        <Image
          className="h-14 w-14"
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/cookies/cookieImage1.svg"
          alt="Cookie"
          width={56}
          height={56}
          sizes="56px"
        />
        <h2 className="mt-2 pb-3 text-xl font-medium text-gray-800">
          We care about your privacy
        </h2>
        <p className="w-11/12">
          This website uses cookies for functionality, analytics, and marketing.
          By accepting, you agree to our{" "}
          <a href="#" className="font-medium underline">
            Cookie Policy
          </a>
          .
        </p>
        <div className="mt-6 flex w-full items-center justify-center gap-4">
          <button
            type="button"
            className="rounded border border-gray-500/30 px-8 py-2 font-medium transition hover:bg-blue-500/10 active:scale-95"
            onClick={() => handleChoice("declined")}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded bg-orange-600 px-8 py-2 font-medium text-white transition active:scale-95"
            onClick={() => handleChoice("accepted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
