import { sql } from "@/lib/db2"
import ContactSectionShell from "./ContactSectionShell"

type Category = {
  name: string
}

export default async function ContactSection() {
  let rows: Category[] = []
  if (process.env.SKIP_DB !== "1") {
    rows = await sql`
      SELECT name FROM categories ORDER BY name
    `
  }

  const categories = rows as Category[]

  return <ContactSectionShell categories={categories} />
}
