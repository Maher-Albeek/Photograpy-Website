export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { sql } from "@/lib/db2";
import { notFound } from "next/navigation";

import ProjectEditForm from "@/components/admin/ProjectEditForm";
import ProjectGalleryClient from "@/components/admin/ProjectGalleryClient";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import ProjectVideoForm from "@/components/admin/ProjectVideoForm";

type ProjectRow = {
  id: number;
  title: string;
  description: string | null;
  category_id: number | null;
};

type ProjectMediaRow = {
  id: number;
  media_type: "image" | "video";
  file_path: string | null;
  bunny_library_id: string | null;
  bunny_video_id: string | null;
  video_source: string | null;
  video_id: string | null;
  video_url: string | null;
  is_thumbnail: number;
};

type CategoryRow = {
  id: number;
  name: string;
};

async function getProject(id: string): Promise<ProjectRow | null> {
  const rows = (await sql`
    SELECT id, title, description, category_id
    FROM projects
    WHERE id = ${id}
    LIMIT 1
  `) as ProjectRow[];
  return rows[0] || null;
}

async function getProjectMedia(id: string): Promise<ProjectMediaRow[]> {
  const rows = (await sql`
    SELECT
      id,
      media_type,
      file_path,
      bunny_library_id,
      bunny_video_id,
      video_source,
      video_id,
      video_url,
      is_thumbnail
    FROM project_media
    WHERE project_id = ${id}
    ORDER BY sort_order ASC, id ASC
    `) as ProjectMediaRow[];
  return rows;
}

async function getCategories(): Promise<CategoryRow[]> {
  const rows = (await sql`
    SELECT id, name FROM categories ORDER BY name ASC
  `) as CategoryRow[];
  return rows;
}

export default async function AdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await getProject(id);
  if (!project) notFound();

  const media = await getProjectMedia(id);
  const categories = await getCategories();

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <ProjectEditForm project={project} categories={categories} />
        <div className="mt-4">
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        <ProjectVideoForm projectId={project.id} />
        <ProjectGalleryClient projectId={project.id} media={media} />
      </div>

      <Link href="/admin/projects" className="btn btn-ghost">
        Back to projects
      </Link>
    </main>
  );
}
