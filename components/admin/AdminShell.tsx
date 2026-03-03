"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

const HIDE_CHROME_PATHS = [
  "/admin/login",
  "/admin/forgot",
  "/admin/reset",
];

type Props = {
  logo: string | null;
  children: React.ReactNode;
};

export default function AdminShell({ logo, children }: Props) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isLoginRoute = pathname.startsWith("/admin/login");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      const matches = media.matches;
      setIsDesktop(matches);
      setDrawerOpen(matches);
      if (!matches) {
        setSidebarCollapsed(false);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (hideChrome) {
    if (isLoginRoute) {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen bg-base-200 p-6 flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className={`drawer min-h-screen bg-base-200 ${drawerOpen ? "drawer-open" : ""}`}>
      <input
        id="admin-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(event) => setDrawerOpen(event.target.checked)}
      />

      <div className="drawer-content flex flex-col">
        <AdminNavbar
          logo={logo}
          isDesktop={isDesktop}
          isCollapsed={sidebarCollapsed}
          onMenuClick={() => {
            if (isDesktop) {
              setSidebarCollapsed((prev) => !prev);
            } else {
              setDrawerOpen((prev) => !prev);
            }
          }}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>

      <AdminSidebar collapsed={sidebarCollapsed} />
    </div>
  );
}
