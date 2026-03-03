"use client";

import { useEffect } from "react";

export default function TrustedTypesPolicy() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tt = window.trustedTypes;
    if (!tt || tt.defaultPolicy) return;

    try {
      tt.createPolicy("default", {
        createHTML: (input) => input,
        createScript: (input) => input,
        createScriptURL: (input) => input,
      });
    } catch {
      // Ignore if a policy with the same name already exists or is blocked.
    }
  }, []);

  return null;
}
