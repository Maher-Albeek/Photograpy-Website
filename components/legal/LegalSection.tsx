import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:p-8">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[rgba(255,231,208,0.82)]">
        {children}
      </div>
    </section>
  );
}

export function LegalSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
