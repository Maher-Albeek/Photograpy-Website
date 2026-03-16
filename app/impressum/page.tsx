export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LegalSection, LegalSubsection } from "@/components/legal/LegalSection";
import { getPublicContactDetails, legalConfig } from "@/lib/legal/config";

const contact = getPublicContactDetails();

export const metadata: Metadata = {
  title: "Impressum | Maher Albeek Photography",
  description: "Anbieterkennzeichnung und Kontaktinformationen.",
};

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      intro="Die folgenden Angaben dienen der transparenten Anbieterkennzeichnung. Bitte prüfen Sie vor dem Livegang alle markierten Platzhalter und ergänzen Sie fehlende Pflichtangaben."
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

      <LegalSection title="Weitere Pflichtangaben">
        <LegalSubsection title="Umsatzsteuer-ID">
          <p>{contact.vatId}</p>
        </LegalSubsection>
        <LegalSubsection title="Berufsrechtliche Angaben">
          <p>
            [BITTE NUR ERGÄNZEN, WENN EINE REGLEMENTIERTE TÄTIGKEIT,
            KAMMERZUGEHÖRIGKEIT ODER BESONDERE BERUFSORDNUNG TATSÄCHLICH BESTEHT]
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Hinweise zur Prüfung vor Veröffentlichung">
        <ul className="list-disc space-y-2 pl-5">
          {legalConfig.manualChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
