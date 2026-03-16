export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { LegalSection, LegalSubsection } from "@/components/legal/LegalSection";
import { getLegalConfig, getPublicContactDetails } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: "Datenschutz | Maher Albeek Photography",
  description: "Datenschutzhinweise zur Nutzung dieser Website.",
};

export default function DatenschutzPage() {
  const legalConfig = getLegalConfig();
  const contact = getPublicContactDetails();
  const hasAnalytics = legalConfig.services.googleAnalytics;
  const hostingProvider = legalConfig.compliance.hostingProvider;
  const hostingLocation = legalConfig.compliance.hostingLocation;
  const contactRetention = legalConfig.compliance.contactRetention;
  const newsletterRetention = legalConfig.compliance.newsletterRetention;

  return (
    <LegalPage
      title="Datenschutzerklärung"
      intro="Diese Erklärung beschreibt die aktuell im Projekt nachvollziehbare Verarbeitung personenbezogener Daten. Sie ersetzt keine individuelle Rechtsberatung. Bitte prüfen Sie alle markierten Platzhalter und die tatsächliche Live-Konfiguration vor Veröffentlichung."
    >
      <LegalSection title="1. Verantwortlicher">
        <p className="font-semibold text-white">{contact.legalName}</p>
        <address className="not-italic">
          {contact.addressLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </address>
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

      <LegalSection title="2. Hosting und Server-Log-Dateien">
        <p>
          Beim Aufruf dieser Website verarbeitet der Hosting-Anbieter technisch
          erforderliche Verbindungsdaten, insbesondere IP-Adresse, Datum und Uhrzeit,
          aufgerufene URL, Referrer, Browsertyp und Betriebssystem.
        </p>
        <p>
          Hosting-Anbieter: {hostingProvider}
          <br />
          Datenregion / Auftragsverarbeitung: {hostingLocation}
        </p>
        <p>
          Die Verarbeitung erfolgt zur sicheren Bereitstellung der Website, zur
          Fehleranalyse und zur Abwehr missbräuchlicher Zugriffe. Die konkrete
          Speicherdauer ist mit dem Hosting-Anbieter zu prüfen.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies und Einwilligungsverwaltung">
        <p>
          Diese Website verwendet ein Consent-Tool, um Ihre Auswahl zu optionalen
          Diensten zu speichern. Dabei wird ein notwendiges Cookie gesetzt. Zusätzlich
          wird die Auswahl lokal im Browser gespeichert, damit das Banner nicht bei
          jedem Aufruf erneut erscheint.
        </p>
        <p>
          Optional werden aktuell nur die Kategorien <strong>Analyse</strong> und{" "}
          <strong>Externe Medien</strong> angeboten. Ohne Ihre Einwilligung bleiben
          diese Funktionen deaktiviert.
        </p>
        <p>
          Ihre Auswahl können Sie jederzeit über den Link{" "}
          <strong>Cookie-Einstellungen</strong> im Footer ändern oder widerrufen.
        </p>
      </LegalSection>

      <LegalSection title="4. Kontaktformular und Kontaktaufnahme">
        <p>
          Wenn Sie das Kontaktformular nutzen, werden Name, E-Mail-Adresse, optional die
          Projektkategorie und Ihre Nachricht verarbeitet. Die Daten werden über eine
          serverseitige API entgegengenommen und in der Projektdatenbank gespeichert.
        </p>
        <p>
          Zweck der Verarbeitung ist die Bearbeitung Ihrer Anfrage und die spätere
          Kommunikation im Zusammenhang mit Ihrem Anliegen.
        </p>
        <p>Löschfrist: {contactRetention}</p>
      </LegalSection>

      <LegalSection title="5. Newsletter über Brevo">
        <p>
          Auf der Website ist eine Newsletter-Anmeldung eingebunden. Dabei wird Ihre
          E-Mail-Adresse an Brevo übermittelt, sofern Sie die entsprechende
          Datenschutzeinwilligung im Formular bestätigen.
        </p>
        <p>Eingesetzter Dienst: Brevo (Versand- und Listenverwaltung)</p>
        <p>
          Vor dem Livegang müssen insbesondere Double-Opt-In, Inhalte der
          Bestätigungs-E-Mail, Empfängerlisten und Löschfristen geprüft werden.
        </p>
        <p>Prüffeld: {newsletterRetention}</p>
      </LegalSection>

      {hasAnalytics ? (
        <LegalSection title="6. Google Analytics">
          <p>
            Sofern eine gültige Google-Analytics-Mess-ID gesetzt ist und Sie der
            Kategorie <strong>Analyse</strong> zustimmen, wird Google Analytics erst
            nach Ihrer Einwilligung geladen.
          </p>
          <p>
            Die Implementierung verwendet Google Consent Mode mit standardmäßig
            deaktivierten Analyse-Signalen. Zusätzlich ist die IP-Anonymisierung in der
            Konfiguration vorgesehen.
          </p>
          <p>
            Bitte prüfen Sie vor Veröffentlichung insbesondere die konkrete Property,
            die Vertragsgrundlage mit Google, die Datenübermittlung in Drittländer und
            die Einstellungen zur Aufbewahrung in Ihrem Google-Konto.
          </p>
        </LegalSection>
      ) : (
        <LegalSection title="6. Analyse-Tools">
          <p>
            Im aktuellen Projekt ist die technische Einbindung für Google Analytics
            vorbereitet, jedoch nur aktiv, wenn produktiv eine gültige Mess-ID gesetzt
            wird. Ohne diese Konfiguration findet keine Analyse über Google Analytics
            statt.
          </p>
        </LegalSection>
      )}

      <LegalSection title="7. Externe Medien und eingebettete Videos">
        <p>
          Auf Galerie-Seiten können externe Videos von{" "}
          {legalConfig.services.videoProviders.join(", ")} eingebunden werden. Diese
          Inhalte werden nicht automatisch geladen.
        </p>
        <p>
          Erst nach Ihrer Einwilligung in die Kategorie <strong>Externe Medien</strong>{" "}
          wird das jeweilige iframe geladen. Dabei können insbesondere IP-Adresse,
          Browserinformationen und weitere technische Metadaten an den jeweiligen
          Anbieter übermittelt werden.
        </p>
      </LegalSection>

      <LegalSection title="8. Schriftarten und statische Inhalte">
        <p>
          Die im Frontend verwendeten Schriftarten werden lokal im Projekt ausgeliefert.
          Es findet nach aktuellem Stand keine direkte Einbindung von Google Fonts über
          Server von Google für Website-Besucher statt.
        </p>
      </LegalSection>

      <LegalSection title="9. Ihre Rechte">
        <LegalSubsection title="Betroffenenrechte">
          <p>
            Sie haben im Rahmen der gesetzlichen Voraussetzungen insbesondere das Recht
            auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit sowie Widerspruch gegen bestimmte Verarbeitungen.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Widerruf erteilter Einwilligungen">
          <p>
            Eine bereits erteilte Einwilligung können Sie jederzeit mit Wirkung für die
            Zukunft widerrufen, insbesondere über die Cookie-Einstellungen im Footer.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Beschwerderecht">
          <p>
            Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
            beschweren.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="10. Manuell vor Veröffentlichung prüfen">
        <ul className="list-disc space-y-2 pl-5">
          {legalConfig.manualChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="pt-2 text-sm text-[rgba(255,231,208,0.64)]">
          Stand dieser Projektfassung: {legalConfig.compliance.lastReviewed}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
