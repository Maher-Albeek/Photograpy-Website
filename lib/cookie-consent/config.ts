import type { ConsentCategoryDefinition, ConsentSelections } from "@/types/cookie-consent";

export const CONSENT_COOKIE_NAME = "maher_cookie_consent";
export const CONSENT_STORAGE_KEY = "maher-cookie-consent";
export const CONSENT_VERSION = "2026-03-16";
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export const DEFAULT_CONSENT_SELECTIONS: ConsentSelections = {
  necessary: true,
  analytics: false,
  externalMedia: false,
};

export const CONSENT_CATEGORIES: ConsentCategoryDefinition[] = [
  {
    key: "necessary",
    required: true,
    title: "Notwendige Cookies",
    description:
      "Erforderlich für Sicherheit, Grundfunktionen der Website und das Speichern Ihrer Datenschutzeinstellungen.",
    titleKey: "cookie.categories.necessary.title",
    descriptionKey: "cookie.categories.necessary.description",
  },
  {
    key: "analytics",
    required: false,
    title: "Analyse",
    description:
      "Hilft uns zu verstehen, wie Besucher die Website nutzen, damit wir Inhalte, Leistung und Nutzerführung verbessern können.",
    titleKey: "cookie.categories.analytics.title",
    descriptionKey: "cookie.categories.analytics.description",
  },
  {
    key: "externalMedia",
    required: false,
    title: "Externe Medien",
    description:
      "Erlaubt das Nachladen von eingebetteten Videos und anderen externen Inhalten, bei denen Drittdienste Ihre IP-Adresse und technische Metadaten erhalten können.",
    titleKey: "cookie.categories.externalMedia.title",
    descriptionKey: "cookie.categories.externalMedia.description",
  },
];

export const COOKIE_CONSENT_TEXT = {
  banner: {
    badge: "Datenschutz",
    title: "Ihre Privatsphäre zuerst",
    description:
      "Wir verwenden notwendige Cookies für den sicheren Betrieb der Website. Analyse-Tools und externe Medien werden erst nach Ihrer Auswahl aktiviert.",
    customizeLabel: "Einstellungen",
    rejectLabel: "Nur notwendige",
    acceptLabel: "Alle akzeptieren",
  },
  modal: {
    title: "Cookie-Einstellungen",
    description:
      "Wählen Sie pro Kategorie, welche optionalen Dienste Sie zulassen möchten. Ihre Auswahl können Sie jederzeit im Footer ändern.",
    saveLabel: "Auswahl speichern",
    acceptAllLabel: "Alle akzeptieren",
    rejectAllLabel: "Nur notwendige",
    closeLabel: "Schließen",
  },
  links: {
    privacyLabel: "Datenschutz",
    privacyHref: "/datenschutz",
    legalLabel: "Impressum",
    legalHref: "/impressum",
  },
  footerButton: {
    label: "Cookie-Einstellungen",
    ariaLabel: "Cookie-Einstellungen öffnen",
  },
};
