export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import Footer from "@/components/include/Footer"
export default function DatenschutzPage() {
  return (
    <>
      <Header />
        <main className="container mx-auto px-6 py-24 max-w-3xl">
            <h1 className="text-4xl font-bold mb-10">Datenschutz</h1>

            <section className="space-y-6 opacity-80 leading-relaxed">

              <h2 className="text-2xl font-semibold">
                Datenschutzerklärung
              </h2>

              <h3 className="text-xl font-semibold">
                1. Allgemeine Hinweise
              </h3>
              <p>
                Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig. Wir behandeln
                Ihre personenbezogenen Daten vertraulich und entsprechend der
                gesetzlichen Datenschutzvorschriften sowie dieser
                Datenschutzerklärung.
              </p>

              <h3 className="text-xl font-semibold">
                2. Verantwortlicher
              </h3>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website:
              </p>
              <p>
                <strong>Maher Albeek</strong><br />
                Ruhrstrasse 51<br />
                45881 Gelsenkirchen<br />
                E-Mail:{" "}
                <a
                  href="mailto:maherfotograf@gmail.com"
                  className="link link-primary"
                >
                  maherfotograf@gmail.com
                </a>
              </p>

              <h3 className="text-xl font-semibold">
                3. Erhebung und Speicherung personenbezogener Daten
              </h3>
              <p>
                Wenn Sie uns per Kontaktformular oder E-Mail kontaktieren, speichern
                wir Ihre Daten nur zur Bearbeitung der Anfrage. Wir geben diese Daten
                nicht ohne Ihre Einwilligung weiter.
              </p>

              <h3 className="text-xl font-semibold">
                4. Cookies
              </h3>
              <p>
                Diese Website verwendet keine Cookies zur Nutzerverfolgung.
                (Anpassen falls doch verwendet werden)
              </p>

              <h3 className="text-xl font-semibold">
                5. Ihre Rechte
              </h3>
              <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung oder
                Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.
                Kontaktieren Sie uns dazu per E-Mail.
              </p>

              <h3 className="text-xl font-semibold">
                6. Server-Log-Dateien
              </h3>
              <p>
                Beim Besuch der Website werden durch den Hostinganbieter automatisch
                Informationen erfasst (z.B. Browsertyp, Uhrzeit, IP-Adresse). Diese
                Daten sind nicht bestimmten Personen zuordenbar.
              </p>

              <h3 className="text-xl font-semibold">
                7. SSL-Verschlüsselung
              </h3>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen SSL-Verschlüsselung.
              </p>

              <p className="mt-10 text-sm opacity-60">
                Stand: Juni 2025
              </p>

            </section>
          </main>
      <Footer />
    </>
    
  )
}
