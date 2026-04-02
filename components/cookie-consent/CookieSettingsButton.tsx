"use client";

import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import { COOKIE_CONSENT_TEXT } from "@/lib/cookie-consent/config";

export default function CookieSettingsButton() {
  const { openSettings } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      aria-label={COOKIE_CONSENT_TEXT.footerButton.ariaLabel}
      className="inline-flex max-w-full text-left text-sm leading-snug underline-offset-4 transition hover:text-(--color-caramel) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
    >
      {COOKIE_CONSENT_TEXT.footerButton.label}
    </button>
  );
}
