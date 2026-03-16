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
      className="transition hover:text-[var(--color-caramel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {COOKIE_CONSENT_TEXT.footerButton.label}
    </button>
  );
}
