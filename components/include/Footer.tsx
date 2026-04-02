import Link from "next/link"
import CookieSettingsButton from "@/components/cookie-consent/CookieSettingsButton"
import FooterSubscribeShell from "./FooterSubscribeShell"

export default function Footer() {
  return (
    <footer className="border-t-2 border-amber-700 bg-[var(--color-ivory)] text-[var(--color-ink)]">
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid items-start justify-items-center gap-12 text-center md:grid-cols-3 md:justify-items-start md:text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h3 className="text-3xl font-semibold text-[var(--color-sand)]">Studio</h3>
            </div>
            <p className="text-base leading-relaxed text-[var(--color-ink)] opacity-80">
              Professionelle Fotografie mit klarer Kommunikation, transparenten
              Prozessen und gut sichtbaren rechtlichen Informationen.
            </p>
            <p className="text-[var(--color-ink)] opacity-80">
              Jeder Moment verdient es, erzählt zu werden.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h4 className="text-3xl font-semibold text-[var(--color-sand)]">Newsletter</h4>
            </div>
            <p className="text-base leading-relaxed text-[var(--color-ink)] opacity-80">
              Abonnieren Sie den Newsletter, um über neue Projekte und Angebote
              informiert zu bleiben.
            </p>
            <FooterSubscribeShell />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="h-7 w-1.5 rounded-full bg-[var(--color-sand)]" />
              <h4 className="text-3xl font-semibold text-[var(--color-sand)]">
                Recht & Kontakt
              </h4>
            </div>
            <ul className="space-y-2 text-base text-[var(--color-ink)] opacity-80">
              <li>
                <Link href="/" className="transition hover:text-[var(--color-caramel)]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/aboutMe" className="transition hover:text-[var(--color-caramel)]">
                  Über mich
                </Link>
              </li>
              <li>
                <Link href="/impressum" className="transition hover:text-[var(--color-caramel)]">
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="transition hover:text-[var(--color-caramel)]"
                >
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
        &copy; {new Date().getFullYear()} Maher Albeek Photography. Rechtliche Hinweise
        und Datenschutzeinstellungen sind jederzeit im Footer verfügbar.
      </div>
    </footer>
  )
}
