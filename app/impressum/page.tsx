export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import Footer from "@/components/include/Footer"

export default function ImpressumPage() {
  return (
    <>
      <Header />
      
    <main className="container mx-auto px-6 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-10">Impressum</h1>

      <section className="space-y-6 opacity-80 leading-relaxed">

        <h2 className="text-2xl font-semibold">Angaben gemäß § 5 TMG</h2>

        <p><strong>Maher Albeek</strong></p>
        <p>Freiberuflicher Fotograf und Webentwickler</p>
        <p>Ruhrstraße 51</p>
        <p>45881 Gelsenkirchen</p>
        <p>Deutschland</p>

        <h3 className="text-xl font-semibold">Kontakt</h3>
        <p>
          Telefon:{" "}
          <a href="tel:+491634439442" className="link link-primary">
            +49 163 4439442
          </a>
        </p>
        <p>
          E-Mail:{" "}
          <a
            href="mailto:maherfotograf@gmail.com"
            className="link link-primary"
          >
            maherfotograf@gmail.com
          </a>
        </p>

        <h3 className="text-xl font-semibold">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h3>
        <p>Maher Albeek</p>
        <p>Adresse wie oben</p>

      </section>
    </main>
      <Footer />
    
    
    </>
  )
}
