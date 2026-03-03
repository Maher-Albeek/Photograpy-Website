import { sql } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

type SettingRow = {
  key_name: string;
  value_content: string | null;
};

export type FaqImagePaths = {
  desktop: string | null;
  mobile: string | null;
};

const SETTINGS_KEYS = {
  desktop: "faq_image_desktop",
  mobile: "faq_image_mobile",
} as const;

async function getFaqImagePathsFromSettings(): Promise<FaqImagePaths> {
  const keys = [SETTINGS_KEYS.desktop, SETTINGS_KEYS.mobile];
  const rows = (await sql`
    SELECT key_name, value_content
    FROM settings
    WHERE key_name IN (${keys})
  `) as SettingRow[];

  const result: FaqImagePaths = { desktop: null, mobile: null };
  if (!rows.length) return result;

  rows.forEach((row) => {
    if (row.key_name === SETTINGS_KEYS.desktop) {
      result.desktop = row.value_content ?? null;
    } else if (row.key_name === SETTINGS_KEYS.mobile) {
      result.mobile = row.value_content ?? null;
    }
  });

  const hasAny = rows.some((row) => Boolean(row.value_content));
  return hasAny ? result : { desktop: null, mobile: null };
}

async function getFaqImagePathsFromFilesystem(): Promise<FaqImagePaths> {
  const dir = path.join(process.cwd(), "public", "uploads", "faq");
  try {
    const files = await fs.readdir(dir);
    const desktopImage = files.find((name) =>
      /^section-image-desktop\.(png|jpe?g|webp|gif|avif)$/i.test(name)
    );
    const mobileImage = files.find((name) =>
      /^section-image-mobile\.(png|jpe?g|webp|gif|avif)$/i.test(name)
    );
    const legacyImage = files.find((name) =>
      /^section-image\.(png|jpe?g|webp|gif|avif)$/i.test(name)
    );
    return {
      desktop: desktopImage
        ? `/uploads/faq/${desktopImage}`
        : legacyImage
          ? `/uploads/faq/${legacyImage}`
          : null,
      mobile: mobileImage ? `/uploads/faq/${mobileImage}` : null,
    };
  } catch {
    return { desktop: null, mobile: null };
  }
}

export async function getFaqImagePaths(): Promise<FaqImagePaths> {
  const fromSettings = await getFaqImagePathsFromSettings();
  if (fromSettings.desktop || fromSettings.mobile) {
    return fromSettings;
  }

  return getFaqImagePathsFromFilesystem();
}
