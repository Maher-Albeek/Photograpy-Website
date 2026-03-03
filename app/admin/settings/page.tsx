export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";

import SettingsTextRow from "@/components/admin/SettingsTextRow";
import SettingsImageRow from "@/components/admin/SettingsImageRow";
import SettingsHeroImagesRow from "@/components/admin/SettingsHeroImagesRow";

type SettingRow = {
  id: number;
  key_name: string;
  value_content: string | null;
  imgcat: number | null;
};

type HeroImageRow = {
  id: number;
  file_path: string;
  imgcat: number;
};

const isImageValue = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith("http")) return true;
  return value.replace(/^\/+/, "").startsWith("uploads/");
};

export default async function AdminSettingsPage() {
  const settings = (await sql`
    SELECT id, key_name, value_content, imgcat
    FROM settings
    ORDER BY id ASC
  `) as SettingRow[];

  const heroImages: HeroImageRow[] = settings
    .filter(
      (s) =>
        s.key_name.startsWith("hero_image") &&
        s.value_content
    )
    .map((s) => ({
      id: s.id,
      file_path: s.value_content as string,
      imgcat: s.imgcat ?? 1,
    }));

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">Site Settings</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {settings
          .filter(
            (s) =>
              !isImageValue(s.value_content)
          )
          .map((item) => (
            <SettingsTextRow key={item.id} item={item} />
          ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {settings
          .filter(
            (s) =>
              isImageValue(s.value_content) &&
              !s.key_name.startsWith("hero_image")
          )
          .map((item) => (
            <SettingsImageRow key={item.id} item={item} />
          ))}
      </div>

      <SettingsHeroImagesRow
        settingKey="hero"
        images={heroImages}
      />
    </main>
  );
}
