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
      intro="Mit diesen Datenschutzhinweisen informieren wir Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten bei der Nutzung dieser Website sowie über Ihre Rechte nach der Datenschutz-Grundverordnung (DSGVO)."
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

      <LegalSection title="2. Rechtsgrundlagen der Verarbeitung">
        <p>
          Wir verarbeiten personenbezogene Daten auf Grundlage der jeweils einschlaegigen
          gesetzlichen Erlaubnistatbestaende, insbesondere:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung),</li>
          <li>
            Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Durchfuehrung vorvertraglicher
            Massnahmen oder zur Vertragserfuellung),
          </li>
          <li>
            Art. 6 Abs. 1 lit. c DSGVO (Erfuellung rechtlicher Verpflichtungen),
          </li>
          <li>
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem,
            wirtschaftlichem und nutzerfreundlichem Betrieb dieser Website).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Hosting und Server-Log-Dateien">
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

      <LegalSection title="4. Cookies und Einwilligungsverwaltung">
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

      <LegalSection title="5. Kontaktformular und Kontaktaufnahme">
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

      <LegalSection title="6. Newsletter ueber Brevo">
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
        <LegalSection title="7. Google Analytics">
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
        <LegalSection title="7. Analyse-Tools">
          <p>
            Im aktuellen Projekt ist die technische Einbindung für Google Analytics
            vorbereitet, jedoch nur aktiv, wenn produktiv eine gültige Mess-ID gesetzt
            wird. Ohne diese Konfiguration findet keine Analyse über Google Analytics
            statt.
          </p>
        </LegalSection>
      )}

      <LegalSection title="8. Externe Medien und eingebettete Videos">
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

      <LegalSection title="9. Schriftarten und statische Inhalte">
        <p>
          Die im Frontend verwendeten Schriftarten werden lokal im Projekt ausgeliefert.
          Es findet nach aktuellem Stand keine direkte Einbindung von Google Fonts über
          Server von Google für Website-Besucher statt.
        </p>
      </LegalSection>

      <LegalSection title="10. Empfaenger personenbezogener Daten">
        <p>
          Eine Weitergabe personenbezogener Daten erfolgt nur, soweit dies fuer die
          Bereitstellung der Website und die Erbringung unserer Leistungen erforderlich
          ist, eine gesetzliche Verpflichtung besteht oder Sie eingewilligt haben.
        </p>
        <p>
          Empfaenger koennen insbesondere sein: Hosting- und IT-Dienstleister,
          E-Mail-/Newsletter-Dienstleister (z. B. Brevo) sowie Anbieter externer Medien
          und Analysedienste (bei entsprechender Einwilligung).
        </p>
      </LegalSection>

      <LegalSection title="11. Drittlanduebermittlung">
        <p>
          Bei einzelnen Diensten kann eine Verarbeitung personenbezogener Daten in
          Staaten ausserhalb der Europaeischen Union (EU) bzw. des Europaeischen
          Wirtschaftsraums (EWR) nicht ausgeschlossen werden (insbesondere bei globalen
          Cloud- und Medienanbietern).
        </p>
        <p>
          Sofern eine solche Uebermittlung erfolgt, achten wir auf geeignete Garantien,
          insbesondere EU-Standardvertragsklauseln oder eine Angemessenheitsentscheidung
          der EU-Kommission.
        </p>
      </LegalSection>

      <LegalSection title="12. Speicherdauer">
        <p>
          Personenbezogene Daten werden nur so lange gespeichert, wie es fuer die
          jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten
          bestehen.
        </p>
        <p>Kontaktanfragen: {contactRetention}</p>
        <p>Newsletter: {newsletterRetention}</p>
      </LegalSection>

      <LegalSection title="13. Datensicherheit">
        <p>
          Wir setzen angemessene technische und organisatorische Massnahmen ein, um
          personenbezogene Daten gegen Verlust, Manipulation, unberechtigten Zugriff und
          unbefugte Offenlegung zu schuetzen. Unsere Sicherheitsmassnahmen werden
          entsprechend der technologischen Entwicklung fortlaufend verbessert.
        </p>
      </LegalSection>

      <LegalSection title="14. Ihre Rechte">
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

      <LegalSection title="15. Beschwerderecht bei einer Aufsichtsbehoerde">
        <p>
          Unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher
          Rechtsbehelfe steht Ihnen das Recht auf Beschwerde bei einer
          Datenschutz-Aufsichtsbehoerde zu, insbesondere in dem Mitgliedstaat Ihres
          Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmasslichen
          Verstosses.
        </p>
      </LegalSection>

      <LegalSection title="16. Aktualitaet dieser Datenschutzhinweise">
        <p>
          Wir behalten uns vor, diese Datenschutzhinweise anzupassen, damit sie stets
          den aktuellen rechtlichen Anforderungen entsprechen oder um Aenderungen unserer
          Leistungen in den Datenschutzhinweisen umzusetzen.
        </p>
        <p className="pt-2 text-sm text-[rgba(255,231,208,0.64)]">
          Stand dieser Datenschutzhinweise: {legalConfig.compliance.lastReviewed}
        </p>
      </LegalSection>

      <LegalSection title="17. Interne Pruefpunkte vor Veroeffentlichung">
        <ul className="list-disc space-y-2 pl-5">
          {legalConfig.manualChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
