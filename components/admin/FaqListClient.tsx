"use client";

import { useState } from "react";
import FaqRow from "@/components/admin/FaqRow";

type Faq = {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
};

export default function FaqListClient({ initialRows }: { initialRows: Faq[] }) {
  const [rows, setRows] = useState(initialRows);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;

    const updated = [...rows];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);

    const reordered = updated.map((item, i) => ({
      ...item,
      sort_order: i + 1,
    }));

    setRows(reordered);
    setDragIndex(null);

    fetch("/api/faq/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        reordered.map(({ id, sort_order }) => ({ id, sort_order }))
      ),
    });
  }

  return (
    <>
      {rows.map((item, index) => (
        <FaqRow
          key={item.id}
          item={item}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDrop={() => handleDrop(index)}
        />
      ))}
    </>
  );
}
