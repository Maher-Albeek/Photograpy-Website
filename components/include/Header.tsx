import { sql } from "@/lib/db2"
import HeaderClient from "./HeaderClient"

type Settings = {
  logo?: string
  site_name?: string
}

type LogoRow = {
  value_content: string | null
}

export default async function Header() {
  let rows: LogoRow[] = []
  if (process.env.SKIP_DB !== "1") {
    rows = (await sql`
      SELECT value_content
      FROM settings
      WHERE key_name = 'site_logo'
      LIMIT 1
    `) as LogoRow[]
  }

  const logo = rows.length ? rows[0].value_content ?? undefined : undefined
  const settings: Settings | null = logo ? { logo } : null

  return <HeaderClient settings={settings} />
}
