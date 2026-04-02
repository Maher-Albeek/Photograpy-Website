"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import { COOKIE_CONSENT_TEXT } from "@/lib/cookie-consent/config";

export default function CookieBanner() {
  const { acceptAll, rejectAll, openSettings, dismissBanner, isBannerOpen } = useCookieConsent();

  if (!isBannerOpen) {
    return null;
  }

  return (
    <section
      aria-label="Cookie-Hinweis"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-[rgba(10,10,10,0.96)] backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="flex justify-end lg:hidden">
          <button
            type="button"
            onClick={dismissBanner}
            aria-label={COOKIE_CONSENT_TEXT.banner.closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
            {COOKIE_CONSENT_TEXT.banner.badge}
          </p>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {COOKIE_CONSENT_TEXT.banner.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[rgba(255,231,208,0.82)] sm:text-base">
            {COOKIE_CONSENT_TEXT.banner.description}{" "}
            <Link
              href={COOKIE_CONSENT_TEXT.links.privacyHref}
              className="font-medium text-white underline underline-offset-4"
            >
              {COOKIE_CONSENT_TEXT.links.privacyLabel}
            </Link>{" "}
            ·{" "}
            <Link
              href={COOKIE_CONSENT_TEXT.links.legalHref}
              className="font-medium text-white underline underline-offset-4"
            >
              {COOKIE_CONSENT_TEXT.links.legalLabel}
            </Link>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-115">
          <button
            type="button"
            onClick={openSettings}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {COOKIE_CONSENT_TEXT.banner.customizeLabel}
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded-full border border-white/35 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {COOKIE_CONSENT_TEXT.banner.rejectLabel}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {COOKIE_CONSENT_TEXT.banner.acceptLabel}
          </button>

          <button
            type="button"
            onClick={dismissBanner}
            aria-label={COOKIE_CONSENT_TEXT.banner.closeLabel}
            className="hidden rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:inline-flex lg:items-center lg:justify-center"
          >
            {COOKIE_CONSENT_TEXT.banner.closeLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
