"use client";

import type { ConsentSelections } from "@/types/cookie-consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleConsentState = {
  ad_personalization: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  functionality_storage: "granted" | "denied";
  personalization_storage: "granted" | "denied";
  security_storage: "granted" | "denied";
  wait_for_update?: number;
};

function ensureGtag(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }
}

export function getDefaultGoogleConsent(): GoogleConsentState {
  return {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  };
}

export function mapSelectionsToGoogleConsent(
  selections: ConsentSelections,
): GoogleConsentState {
  return {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: selections.analytics ? "granted" : "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
  };
}

export function applyGoogleConsentDefaults(): void {
  ensureGtag();
  window.gtag?.("consent", "default", getDefaultGoogleConsent());
  window.gtag?.("set", "ads_data_redaction", true);
}

export function applyGoogleConsentUpdate(selections: ConsentSelections): void {
  ensureGtag();
  window.gtag?.("consent", "update", mapSelectionsToGoogleConsent(selections));
}

export function setAnalyticsDisabled(measurementId: string, disabled: boolean): void {
  if (typeof window === "undefined" || !measurementId) {
    return;
  }

  window[`ga-disable-${measurementId}` as keyof Window] = disabled as never;
}

function expireCookieForDomain(name: string, domain?: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const domainPart = domain ? `; Domain=${domain}` : "";
  document.cookie =
    `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Path=/; SameSite=Lax${domainPart}${secure}`;
}

export function clearGoogleCookies(): void {
  if (typeof window === "undefined") {
    return;
  }

  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  const candidateDomains = new Set<string | undefined>([undefined, hostname, `.${hostname}`]);

  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join(".");
    candidateDomains.add(rootDomain);
    candidateDomains.add(`.${rootDomain}`);
  }

  const cookieNames = document.cookie
    .split("; ")
    .map((entry) => entry.split("=")[0])
    .filter(
      (name) =>
        name === "_ga" ||
        name.startsWith("_ga_") ||
        name === "_gid" ||
        name === "_gat" ||
        name.startsWith("_gcl_") ||
        name.startsWith("_gac_"),
    );

  for (const name of cookieNames) {
    for (const domain of candidateDomains) {
      expireCookieForDomain(name, domain);
    }
  }
}
