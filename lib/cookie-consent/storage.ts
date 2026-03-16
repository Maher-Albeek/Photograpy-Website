"use client";

import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_SECONDS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  DEFAULT_CONSENT_SELECTIONS,
} from "@/lib/cookie-consent/config";
import type { ConsentCategory, ConsentSelections, StoredConsent } from "@/types/cookie-consent";

function buildSelections(input?: Partial<ConsentSelections>): ConsentSelections {
  return {
    necessary: true,
    preferences: input?.preferences ?? DEFAULT_CONSENT_SELECTIONS.preferences,
    analytics: input?.analytics ?? DEFAULT_CONSENT_SELECTIONS.analytics,
    marketing: input?.marketing ?? DEFAULT_CONSENT_SELECTIONS.marketing,
  };
}

export function createStoredConsent(input?: Partial<ConsentSelections>): StoredConsent {
  return {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: buildSelections(input),
  };
}

export function parseStoredConsent(raw: string | null | undefined): StoredConsent | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.version !== "string" || typeof parsed.timestamp !== "string") {
      return null;
    }

    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      categories: buildSelections(parsed.categories),
    };
  } catch {
    return null;
  }
}

export function hasValidConsent(consent: StoredConsent | null): consent is StoredConsent {
  return Boolean(consent && consent.version === CONSENT_VERSION);
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cookieConsent = parseStoredConsent(getCookieValue(CONSENT_COOKIE_NAME));
  if (cookieConsent) {
    return cookieConsent;
  }

  return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
}

export function persistConsent(consent: StoredConsent): void {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(consent);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; ` +
    `Path=/; SameSite=Lax${secure}`;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
}

function expireCookie(name: string, path: string, domain?: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; Domain=${domain}` : "";
  document.cookie =
    `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=${path}; SameSite=Lax${domainPart}${secure}`;
}

export function clearStoredConsent(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONSENT_STORAGE_KEY);

  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const candidateDomains = new Set<string | undefined>([undefined, hostname, `.${hostname}`]);

  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    candidateDomains.add(rootDomain);
    candidateDomains.add(`.${rootDomain}`);
  }

  for (const domain of candidateDomains) {
    expireCookie(CONSENT_COOKIE_NAME, "/", domain);
  }
}

export function isCategoryAllowed(
  consent: StoredConsent | null,
  category: ConsentCategory,
): boolean {
  if (category === "necessary") {
    return true;
  }

  if (!hasValidConsent(consent)) {
    return false;
  }

  return Boolean(consent.categories[category]);
}

export function createRejectAllConsent(): StoredConsent {
  return createStoredConsent({
    preferences: false,
    analytics: false,
    marketing: false,
  });
}
