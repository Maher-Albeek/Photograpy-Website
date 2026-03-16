"use client";

import type { ReactNode } from "react";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";

export default function ExternalMediaEmbed({
  title,
  provider,
  children,
}: {
  title: string;
  provider: string;
  children: ReactNode;
}) {
  const { canUseCategory, openSettings } = useCookieConsent();

  if (canUseCategory("externalMedia")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-[#111111] p-6 text-center text-[var(--color-ink)] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
        Externe Medien blockiert
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-[rgba(255,231,208,0.82)]">
        Dieses Video wird erst geladen, wenn Sie externen Medien zustimmen. Beim
        Laden werden Daten an {provider} übertragen.
      </p>
      <button
        type="button"
        onClick={openSettings}
        className="mt-5 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Cookie-Einstellungen öffnen
      </button>
    </div>
  );
}
