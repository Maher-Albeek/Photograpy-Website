"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCookieConsent } from "@/components/cookie-consent/CookieConsentProvider";
import { applyGoogleConsentUpdate, setAnalyticsDisabled } from "@/lib/cookie-consent/google";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export default function GoogleAnalyticsLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canUseCategory, selections } = useCookieConsent();
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof document === "undefined" || !GA_MEASUREMENT_ID) {
      return false;
    }

    return Boolean(document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`));
  });
  const analyticsEnabled = canUseCategory("analytics") && Boolean(GA_MEASUREMENT_ID);

  useEffect(() => {
    setAnalyticsDisabled(GA_MEASUREMENT_ID, !analyticsEnabled);
  }, [analyticsEnabled]);

  useEffect(() => {
    if (!analyticsEnabled || !isLoaded || !window.gtag) {
      return;
    }

    applyGoogleConsentUpdate(selections);
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false,
    });
  }, [analyticsEnabled, isLoaded, selections]);

  useEffect(() => {
    if (!analyticsEnabled || !isLoaded || !window.gtag) {
      return;
    }

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
    });
  }, [analyticsEnabled, isLoaded, pathname, searchParams]);

  if (!analyticsEnabled) {
    return null;
  }

  return (
    <>
      <Script
        id="google-tag-manager-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsLoaded(true);
        }}
      />
      <Script
        id="google-tag-manager-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `,
        }}
      />
    </>
  );
}
