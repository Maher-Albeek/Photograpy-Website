"use client"

import dynamic from "next/dynamic"

type Category = {
  name: string
}

const ContactSectionClient = dynamic(() => import("./ContactSectionClient"), {
  ssr: false,
})

export default function ContactSectionShell({ categories }: { categories: Category[] }) {
  return <ContactSectionClient categories={categories} />
}
