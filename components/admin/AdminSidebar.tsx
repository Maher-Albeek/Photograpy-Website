"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  FileText,
  FolderKanban,
  HelpCircle,
  Home,
  Image,
  ImageMinus,
  Images,
  LayoutDashboard,
  ListVideo,
  LogOut,
  Mail,
  MessageSquareQuote,
  Settings,
  ShieldUser,
  Tags,
  User,
} from "lucide-react";

type Props = {
  collapsed?: boolean;
};

export default function AdminSidebar({ collapsed = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const textClass = collapsed ? "sr-only" : "";
  const itemPadding = collapsed ? "px-2" : "px-3";
  const itemInnerClass = collapsed ? "justify-center" : "gap-2";

  const menu = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Database", href: "/admin/database", icon: Database },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Messages", href: "/admin/messages", icon: Mail },
    { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="drawer-side">
      {/* Overlay (mobile) */}
      <label htmlFor="admin-drawer" className="drawer-overlay lg:hidden" />

      <aside
        className={`min-h-full bg-base-100 border-r border-base-300 flex flex-col transition-[width] duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className={`border-b border-base-300 ${collapsed ? "px-3 py-4" : "p-6"}`}>
          <div
            className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}
            title="Admin Panel"
          >
            <ShieldUser className="h-5 w-5 text-base-content/70" aria-hidden="true" />
            <h2 className={`text-lg font-bold text-base-content ${textClass}`}>
              Admin Panel
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <section className="rounded-md bg-base-100">
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2 text-sm font-semibold text-base-content/80`}
              title="Home Page"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>Home Page</span>
            </div>
            <div className="space-y-1 px-2 pb-2">
              {menu.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md ${itemPadding} py-2 text-sm transition
                      ${
                        active
                          ? "bg-primary text-primary-content font-semibold"
                          : "text-base-content/70 hover:bg-base-200"
                      }`}
                    title={item.name}
                    aria-label={item.name}
                  >
                    <span className={`flex items-center ${itemInnerClass}`}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span className={textClass}>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-md bg-base-100">
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2 text-sm font-semibold text-base-content/80`}
              title="About Me Page"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>About Me Page</span>
            </div>
            <div className="space-y-1 px-2 pb-2">
              <Link
                href="/admin/aboutMe/hero"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/aboutMe/hero"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Hero Title & Image"
                aria-label="Hero Title & Image"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <Image className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Hero Title & Image</span>
                </span>
              </Link>
              <Link
                href="/admin/aboutMe/content"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/aboutMe/content"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Page Content"
                aria-label="Page Content"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Page Content</span>
                </span>
              </Link>
            </div>
          </section>

          <section className="rounded-md bg-base-100">
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2 text-sm font-semibold text-base-content/80`}
              title="Photo Gallery Page"
            >
              <Images className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>Photo Gallery Page</span>
            </div>
            <div className="space-y-1 px-2 pb-2">
              <Link
                href="/admin/photoGallery/hero"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/photoGallery/hero"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Hero Title & Image"
                aria-label="Hero Title & Image"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <Image className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Hero Title & Image</span>
                </span>
              </Link>
              <Link
                href="/admin/photoGallery/content"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/photoGallery/content"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Page Content"
                aria-label="Page Content"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Page Content</span>
                </span>
              </Link>
              <Link
                href="/admin/photoGallery/before-after"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/photoGallery/before-after"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Before / After"
                aria-label="Before / After"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <ImageMinus className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Before / After</span>
                </span>
              </Link>
            </div>
          </section>

          <section className="rounded-md bg-base-100">
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} px-3 py-2 text-sm font-semibold text-base-content/80`}
              title="Video Gallery Page"
            >
              <ListVideo className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>Video Gallery Page</span>
            </div>
            <div className="space-y-1 px-2 pb-2">
              <Link
                href="/admin/videoGallery/content"
                className={`block rounded-md ${itemPadding} py-2 text-sm transition ${
                  pathname === "/admin/videoGallery/content"
                    ? "bg-primary text-primary-content font-semibold"
                    : "text-base-content/70 hover:bg-base-200"
                }`}
                title="Page Content"
                aria-label="Page Content"
              >
                <span className={`flex items-center ${itemInnerClass}`}>
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className={textClass}>Page Content</span>
                </span>
              </Link>
            </div>
          </section>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={() => router.push("/")}
            className="btn btn-outline btn-sm w-full mb-2"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <span
              className={`flex items-center justify-center ${
                collapsed ? "" : "gap-2"
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>Back to Home</span>
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-error btn-sm w-full"
            title="Logout"
            aria-label="Logout"
          >
            <span
              className={`flex items-center justify-center ${
                collapsed ? "" : "gap-2"
              }`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className={textClass}>Logout</span>
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
}
