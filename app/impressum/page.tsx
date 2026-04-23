export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LegalSection } from "@/components/legal/LegalSection";
import { getPublicContactDetails } from "@/lib/legal/config";

const contact = getPublicContactDetails();

export const metadata: Metadata = {
  title: "Impressum | Maher Albeek Photography",
  description: "Anbieterkennzeichnung und Kontaktinformationen.",
};

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      intro="Die folgenden Angaben enthalten die gesetzlich erforderliche Anbieterkennzeichnung fuer diese Website."
    >
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p className="font-semibold text-white">{contact.legalName}</p>
        <p>{contact.businessDescription}</p>
        <address className="not-italic">
          {contact.addressLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </address>
      </LegalSection>

      <LegalSection title="Status des Angebots">
        <p>
          Diese Website wird derzeit als persoenliches Portfolio betrieben und dient der
          Darstellung kreativer Arbeiten.
        </p>
        <p>
          Aktuell wird kein gewerblicher Betrieb ueber diese Website gefuehrt und es
          werden keine Auftraege ueber die Website abgeschlossen.
        </p>
        <p>
          Sofern kuenftig eine Gewerbeanmeldung erfolgt, werden Impressum,
          Datenschutzhinweise und etwaige Preis-/Leistungsseiten entsprechend
          aktualisiert.
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{" "}
          <a href={`mailto:${contact.email}`} className="underline underline-offset-4">
            {contact.email}
          </a>
        </p>
        <p>
          Telefon:{" "}
          <a
            href={`tel:${contact.phone.replace(/\s+/g, "")}`}
            className="underline underline-offset-4"
          >
            {contact.phone}
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für journalistisch-redaktionelle Inhalte">
        <p>{contact.responsiblePerson}</p>
        <p>Anschrift wie oben.</p>
      </LegalSection>

      <LegalSection title="Umsatzsteuer">
        <p>
          Eine Umsatzsteuer-Identifikationsnummer gemaess § 27a UStG wird derzeit nicht
          gefuehrt.
        </p>
      </LegalSection>

      <LegalSection title="Verbraucherstreitbeilegung">
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
