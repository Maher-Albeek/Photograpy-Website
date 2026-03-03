"use client";

import { FormEvent, useEffect, useState } from "react";

type AboutMeContent = {
  title: string;
  content: string;
};

export default function AdminAboutMeContentPage() {
  const [data, setData] = useState<AboutMeContent>({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/aboutMe/content", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load content");
        const json = await res.json();
        if (active) {
          setData({
            title: json.title ?? "",
            content: json.content ?? "",
          });
        }
      } catch {
        if (active) setError("Could not load About Me content.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/aboutMe/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Page content saved.");
    } catch {
      setError("Could not save About Me content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">About Me Page</p>
        <h1 className="text-2xl font-bold">Page Content</h1>
        <p className="text-sm text-base-content/60">
          Edit the main content shown on the About Me page.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Title</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                value={data.title}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Content</span>
              </div>
              <textarea
                className="textarea textarea-bordered w-full min-h-60"
                value={data.content}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Write your About Me content. Separate paragraphs with blank lines."
                required
              />
              <div className="label">
                <span className="label-text-alt">
                  Paragraphs are split by blank lines on the public page.
                </span>
              </div>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Content"}
              </button>
              {message && (
                <span className="text-success text-sm">{message}</span>
              )}
              {error && (
                <span className="text-error text-sm">{error}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
