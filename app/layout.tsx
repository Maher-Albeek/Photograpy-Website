export const dynamic = "force-dynamic";
export const revalidate = 0;


import "./globals.css"
import localFont from "next/font/local"
import { Allan, Bodoni_Moda, Ephesis } from "next/font/google"
import { cookies } from "next/headers"
import MouseTrackerGate from "@/components/MouseTrackerGate"
import CookieBanner from "@/components/cookie-consent/CookieBanner"
import CookiePreferencesModal from "@/components/cookie-consent/CookiePreferencesModal"
import { CookieConsentProvider } from "@/components/cookie-consent/CookieConsentProvider"
import GoogleAnalyticsLoader from "@/components/cookie-consent/GoogleAnalyticsLoader"
import GoogleConsentModeScript from "@/components/cookie-consent/GoogleConsentModeScript"
import { CONSENT_COOKIE_NAME } from "@/lib/cookie-consent/config"

const bilona = localFont({
  src: "../public/fonts/BilonaMedium-2v6W3.otf",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-bilona",
})
const cabinest = localFont({
  src: "../public/fonts/CabinestRegular-DYA83.otf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-cabinest",
})
const aurelia = localFont({
  src: "../public/fonts/AureliaSymphonyItalic-0v5Jd.otf",
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-aurelia",
})
const csBeauty = localFont({
  src: "../public/fonts/CsBeautyRegularDemo-8O5nM.otf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-csbeauty",
})
const ephesis = Ephesis({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ephesis",
})
const allan = Allan({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-allan",
})
const bodoniModa = Bodoni_Moda({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni-moda",
})

export const metadata = {
  title: "Maher Albeek Photography",
  description: "Video and Photo Gallery of Maher Albeek",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const initialConsentValue = cookieStore.get(CONSENT_COOKIE_NAME)?.value ?? null

  return (
    <html lang="en">
      <body
        className={`${bilona.variable} ${cabinest.variable} ${aurelia.variable} ${csBeauty.variable} ${ephesis.variable} ${allan.variable} ${bodoniModa.variable}`}
      >
        <GoogleConsentModeScript />
        <CookieConsentProvider initialConsentValue={initialConsentValue}>
          <MouseTrackerGate />
          <GoogleAnalyticsLoader />
          {children}
          <CookieBanner />
          <CookiePreferencesModal />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
