"use client";

import { useState } from "react";

type Setting = {
  id: number;
  key_name: string;
  value_content: string | null;
};

type Props = {
  item: Setting;
};

export default function SettingsTextRow({ item }: Props) {
  const [value, setValue] = useState(item.value_content || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const res = await fetch(`/api/settings/${item.key_name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });

    setSaving(false);

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } else {
      alert("Failed to save");
    }
  }

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
      <div className="text-sm font-mono text-base-content/60">
        {item.key_name}
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input input-bordered w-full"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-sm btn-primary"
        >
          {saving ? (
            <span className="loading loading-spinner" />
          ) : (
            "Save"
          )}
        </button>

        {saved && (
          <span className="text-success text-sm">Saved</span>
        )}
      </div>
    </div>
  );
}
