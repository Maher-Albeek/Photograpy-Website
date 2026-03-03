"use client";

import { useState } from "react";
import CategoryRow from "@/components/admin/CategoryRow";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoryListClient({
  initialRows,
}: {
  initialRows: Category[];
}) {
  const [rows] = useState(initialRows);

  return (
    <>
      {rows.map((item) => (
        <CategoryRow key={item.id} item={item} />
      ))}
    </>
  );
}
