
"use client";

import { useRouter } from "next/navigation";

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      "Are you sure you want to delete this project?\nAll images will be removed."
    );

    if (!ok) return;

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

 return (
    <button onClick={handleDelete} className="btn btn-error">
      Delete Project
    </button>
  );
}
