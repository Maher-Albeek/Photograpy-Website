export const legalConfig = {
  site: {
    name: "Maher Albeek Photography",
    basePath: "/",
  },
  owner: {
    legalName: "Maher Albeek",
    businessDescription: "Fotografie und visuelle Medienproduktion",
    street: "Ruhrstraße 51",
    postalCode: "45881",
    city: "Gelsenkirchen",
    country: "Deutschland",
    email: "maherfotograf@gmail.com",
    phone: "+49 163 4439442",
    responsiblePerson: "Maher Albeek",
    vatId: "[BITTE UMSATZSTEUER-ID ERGÄNZEN, FALLS VORHANDEN]",
  },
  compliance: {
    hostingProvider: "Vercel Inc.",
    hostingLocation:
      "EU/USA - Hosting über Vercel Inc. mit globaler Infrastruktur (CDN). Auftragsverarbeitung gemäß DPA des Hosting-Anbieters.",
    contactRetention:
      "Kontaktanfragen werden nach abgeschlossener Bearbeitung gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.",
    newsletterRetention:
      "Newsletter-Anmeldungen erfolgen über Double-Opt-In. Daten werden gespeichert, solange das Newsletter-Abonnement aktiv ist, und können jederzeit gelöscht werden.",
    lastReviewed: "16.03.2026",
  },
  services: {
    contactForm: true,
    newsletter: true,
    brevo: true,
    cookieConsent: true,
    googleAnalytics: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()),
    externalMedia: true,
    videoProviders: ["Bunny Stream", "YouTube", "Vimeo"],
    localFonts: true,
    googleFontsServedToVisitors: false,
  },
  manualChecks: [
    "Vollständigen Namen bzw. Unternehmensbezeichnung prüfen",
    "Ladungsfähige Anschrift und Kontaktangaben prüfen",
    "Umsatzsteuer-ID nur eintragen, wenn tatsächlich vorhanden",
    "Hosting-Anbieter, Auftragsverarbeitung und Serverstandort manuell verifizieren",
    "Double-Opt-In und Listen-/Löschlogik in Brevo aktiv prüfen",
    "Nur tatsächlich eingesetzte Tracking-IDs produktiv setzen",
  ],
} as const;

export function getLegalConfig() {
  return legalConfig;
}

export function formatPostalAddress() {
  const { street, postalCode, city, country } = getLegalConfig().owner;
  return [street, `${postalCode} ${city}`, country];
}

export function getPublicContactDetails() {
  const { legalName, businessDescription, email, phone, responsiblePerson, vatId } =
    getLegalConfig().owner;

  return {
    legalName,
    businessDescription,
    email,
    phone,
    responsiblePerson,
    vatId,
    addressLines: formatPostalAddress(),
  };
}
