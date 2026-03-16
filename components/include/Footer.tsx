import Link from "next/link"
import CookieSettingsButton from "@/components/cookie-consent/CookieSettingsButton"
import FooterSubscribe from "./FooterSubscribe"

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ivory)] text-[var(--color-ink)] border-t-2 border-amber-700 ">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-3 items-start text-center md:text-left justify-items-center md:justify-items-start">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h3 className="text-3xl font-semibold text-[var(--color-sand)]">About Me</h3>
            </div>
            <p className="text-base leading-relaxed text-[var(--color-ink)] opacity-80">
              Passionate photographer and developer.
            </p>
            <p className="text-[var(--color-ink)] opacity-80">
              Jeder Moment verdient es, erzaehlt zu werden.
            </p>
          </div>

          {/* Subscribe */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h4 className="text-3xl font-semibold text-[var(--color-sand)]">Join Newsletter</h4>
            </div>
            <p className="text-base leading-relaxed text-[var(--color-ink)] opacity-80">
              Abonnieren Sie den Newsletter, um über die neuesten Projekte und Angebote informiert zu bleiben.
            </p>
            <FooterSubscribe />
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h4 className="text-3xl font-semibold text-[var(--color-sand)]">Quick Links</h4>
            </div>
            <ul className="space-y-2 text-base text-[var(--color-ink)] opacity-80">
              <li>
                <Link href="/" className="transition hover:text-[var(--color-caramel)]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="transition hover:text-[var(--color-caramel)]">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="transition hover:text-[var(--color-caramel)]">
                  Datenschutz
                </Link>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(115,64,34,0.35)] py-6 text-center text-sm text-[var(--color-ink)] opacity-70">
        &copy; {new Date().getFullYear()} Maher Albeek - All rights reserved.
      </div>
    </footer>
  )
}
