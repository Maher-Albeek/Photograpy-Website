"use client";

import SettingsTextRow from "@/components/admin/SettingsTextRow";
import SettingsImageRow from "@/components/admin/SettingsImageRow";

type Setting = {
  id: number;
  key_name: string;
  value_content: string | null;
  imgcat: number | null;
};

const isImageValue = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith("http")) return true;
  return value.replace(/^\/+/, "").startsWith("uploads/");
};

export default function SettingsListClient({
  initialRows,
}: {
  initialRows: Setting[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialRows.map((item) =>
        isImageValue(item.value_content) ? (
          <SettingsImageRow key={item.id} item={item} />
        ) : (
          <SettingsTextRow key={item.id} item={item} />
        )
      )}
    </div>
  );
}
  
