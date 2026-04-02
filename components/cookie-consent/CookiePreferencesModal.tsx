"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import {
  CONSENT_CATEGORIES,
  COOKIE_CONSENT_TEXT,
  DEFAULT_CONSENT_SELECTIONS,
} from "@/lib/cookie-consent/config";
import type { ConsentSelections } from "@/types/cookie-consent";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CookiePreferencesModal() {
  const { isModalOpen, selections } = useCookieConsent();

  if (!isModalOpen) {
    return null;
  }

  return <CookiePreferencesDialog initialSelections={selections} />;
}

function CookiePreferencesDialog({
  initialSelections,
}: {
  initialSelections: ConsentSelections;
}) {
  const {
    acceptAll,
    closeSettings,
    rejectAll,
    saveSelections,
    withdrawConsent,
    hasStoredConsent,
  } = useCookieConsent();
  const [draft, setDraft] = useState<ConsentSelections>(initialSelections ?? DEFAULT_CONSENT_SELECTIONS);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTarget = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusTarget?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettings();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [closeSettings]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeSettings();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] text-[var(--color-ink)] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <h2 id={titleId} className="text-2xl font-semibold text-white">
              {COOKIE_CONSENT_TEXT.modal.title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(255,231,208,0.82)]"
            >
              {COOKIE_CONSENT_TEXT.modal.description}
            </p>
          </div>
          <button
            type="button"
            onClick={closeSettings}
            aria-label={COOKIE_CONSENT_TEXT.modal.closeLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6 sm:px-8">
          {CONSENT_CATEGORIES.map((category) => {
            const checked = draft[category.key];

            return (
              <section
                key={category.key}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                      {category.required ? (
                        <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                          Immer aktiv
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[rgba(255,231,208,0.8)]">
                      {category.description}
                    </p>
                  </div>

                  <label className="flex w-full items-center justify-between gap-3 self-start text-sm font-medium text-white sm:inline-flex sm:w-auto sm:justify-start">
                    <span className="sr-only">{category.title} aktivieren</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      aria-label={`${category.title} ${checked ? "deaktivieren" : "aktivieren"}`}
                      disabled={category.required}
                      onClick={() => {
                        if (category.required) {
                          return;
                        }

                        setDraft((current) => ({
                          ...current,
                          [category.key]: !current[category.key],
                        }));
                      }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
                        checked
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-white/20 bg-white/10"
                      } ${category.required ? "cursor-not-allowed opacity-70" : "cursor-pointer"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                          checked ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="min-w-18 text-right text-xs sm:text-sm">
                      {checked ? "Aktiv" : "Inaktiv"}
                    </span>
                  </label>
                </div>
              </section>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => saveSelections(draft)}
              className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {COOKIE_CONSENT_TEXT.modal.saveLabel}
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {COOKIE_CONSENT_TEXT.modal.rejectAllLabel}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full border border-[var(--accent)]/40 px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {COOKIE_CONSENT_TEXT.modal.acceptAllLabel}
            </button>
            {hasStoredConsent ? (
              <button
                type="button"
                onClick={withdrawConsent}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-[rgba(255,231,208,0.85)] transition hover:border-white/35 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:ml-auto"
              >
                Einwilligung widerrufen
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
