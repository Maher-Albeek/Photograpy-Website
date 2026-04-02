"use client"

import dynamic from "next/dynamic"

const FooterSubscribe = dynamic(() => import("./FooterSubscribe"), {
  ssr: false,
})

export default function FooterSubscribeShell() {
  return <FooterSubscribe />
}
