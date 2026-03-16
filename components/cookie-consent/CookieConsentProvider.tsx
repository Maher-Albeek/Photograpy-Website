"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_CONSENT_SELECTIONS } from "@/lib/cookie-consent/config";
import {
  applyGoogleConsentDefaults,
  applyGoogleConsentUpdate,
  clearGoogleCookies,
  setAnalyticsDisabled,
} from "@/lib/cookie-consent/google";
import {
  createRejectAllConsent,
  createStoredConsent,
  hasValidConsent,
  isCategoryAllowed,
  parseStoredConsent,
  persistConsent,
  readStoredConsent,
} from "@/lib/cookie-consent/storage";
import type { ConsentCategory, ConsentSelections, StoredConsent } from "@/types/cookie-consent";

type CookieConsentContextValue = {
  consent: StoredConsent | null;
  hasStoredConsent: boolean;
  isBannerOpen: boolean;
  isModalOpen: boolean;
  selections: ConsentSelections;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  saveSelections: (selection: Partial<ConsentSelections>) => void;
  withdrawConsent: () => void;
  canUseCategory: (category: ConsentCategory) => boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export function CookieConsentProvider({
  children,
  initialConsentValue,
}: {
  children: ReactNode;
  initialConsentValue?: string | null;
}) {
  const [consent, setConsent] = useState<StoredConsent | null>(() => {
    const initialConsent = parseStoredConsent(initialConsentValue);

    if (typeof window === "undefined") {
      return initialConsent;
    }

    return readStoredConsent() ?? initialConsent;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isBannerOpen = !hasValidConsent(consent);

  useEffect(() => {
    applyGoogleConsentDefaults();
  }, []);

  useEffect(() => {
    if (hasValidConsent(consent)) {
      applyGoogleConsentUpdate(consent.categories);
      setAnalyticsDisabled(GA_MEASUREMENT_ID, !consent.categories.analytics);

      if (!consent.categories.analytics && !consent.categories.marketing) {
        clearGoogleCookies();
      }

      return;
    }

    setAnalyticsDisabled(GA_MEASUREMENT_ID, true);
    clearGoogleCookies();
  }, [consent]);

  function commitConsent(nextConsent: StoredConsent): void {
    persistConsent(nextConsent);
    setConsent(nextConsent);
    setIsModalOpen(false);
    applyGoogleConsentUpdate(nextConsent.categories);
    setAnalyticsDisabled(GA_MEASUREMENT_ID, !nextConsent.categories.analytics);

    if (!nextConsent.categories.analytics && !nextConsent.categories.marketing) {
      clearGoogleCookies();
    }
  }

  function acceptAll(): void {
    commitConsent(
      createStoredConsent({
        preferences: true,
        analytics: true,
        marketing: true,
      }),
    );
  }

  function rejectAll(): void {
    commitConsent(createRejectAllConsent());
  }

  function saveSelections(selection: Partial<ConsentSelections>): void {
    commitConsent(createStoredConsent(selection));
  }

  function withdrawConsent(): void {
    const necessaryOnly = createRejectAllConsent();
    persistConsent(necessaryOnly);
    setConsent(necessaryOnly);
    setIsModalOpen(false);
    applyGoogleConsentUpdate(necessaryOnly.categories);
    setAnalyticsDisabled(GA_MEASUREMENT_ID, true);
    clearGoogleCookies();
  }

  const value: CookieConsentContextValue = {
    consent,
    hasStoredConsent: hasValidConsent(consent),
    isBannerOpen,
    isModalOpen,
    selections: consent?.categories ?? DEFAULT_CONSENT_SELECTIONS,
    openSettings: () => setIsModalOpen(true),
    closeSettings: () => setIsModalOpen(false),
    acceptAll,
    rejectAll,
    saveSelections,
    withdrawConsent,
    canUseCategory: (category) => isCategoryAllowed(consent, category),
  };

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used inside CookieConsentProvider");
  }

  return context;
}
