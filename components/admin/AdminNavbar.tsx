"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type Props = {
  logo: string | null;
  isDesktop: boolean;
  isCollapsed: boolean;
  onMenuClick: () => void;
};

export default function AdminNavbar({ logo, isDesktop, isCollapsed, onMenuClick }: Props) {
  const logoSrc = logo
    ? logo.startsWith("http")
      ? logo
      : `/${logo.replace(/^\/+/, "")}`
    : null;

  const menuLabel = isDesktop
    ? isCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : "Menu";

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="navbar-start">
        <button
          type="button"
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm"
          aria-label={menuLabel}
          title={menuLabel}
        >
          {isDesktop ? (
            isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="navbar-center">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="Site logo"
            className="h-8 object-contain"
          />
        ) : (
          <span className="font-semibold text-base-content/60">
            Admin
          </span>
        )}
      </div>

      <div className="navbar-end" />
    </header>
  );
}
