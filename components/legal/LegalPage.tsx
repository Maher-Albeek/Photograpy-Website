import type { ReactNode } from "react";
import Header from "@/components/include/Header";
import Footer from "@/components/include/Footer";

export default function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="bg-[radial-gradient(circle_at_top,rgba(255,90,0,0.12),transparent_35%),linear-gradient(180deg,#0f0f0f_0%,#171717_100%)] px-6 py-24 text-[var(--color-ink)]">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)] sm:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
              Rechtliches
            </p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[rgba(255,231,208,0.82)]">
              {intro}
            </p>
          </header>

          <div className="space-y-6">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
