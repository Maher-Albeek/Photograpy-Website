"use client";

import { usePathname } from "next/navigation";
import MouseTracker from "@/components/MouseTracker";

const HIDE_PATHS = ["/admin"];

export default function MouseTrackerGate() {
  const pathname = usePathname();
  const hide = HIDE_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (hide) return null;
  return <MouseTracker />;
}
