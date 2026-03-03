"use client";

import { useState } from "react";
import DeleteFaqButton from "@/components/admin/DeleteFaqButton";
import EditFaqForm from "@/components/admin/EditFaqForm";


type Props = {
  item: {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
  };
  draggable?: boolean;
  onDragStart?: () => void;
  onDrop?: () => void;
};

export default function FaqRow({
  item,
  draggable = false,
  onDragStart,
  onDrop,
}: Props) {
  const [editing, setEditing] = useState(false);

  const rowClass =
    "odd:bg-base-200/40 even:bg-transparent hover:bg-base-200/60 transition";

  if (editing) {
    return (
      <tr className={rowClass}>
        <td colSpan={3} className="py-4">
        <EditFaqForm
          id={item.id}
          initialQuestion={item.question}
          initialAnswer={item.answer}
          initialSortOrder={item.sort_order}
          onCancel={() => setEditing(false)}
        />
      </td>
    </tr>
    );
  }

  return (
    <tr
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={`${rowClass} ${draggable ? "cursor-move" : ""}`}
    >
      <td className="py-4 font-medium">{item.question}</td>

      <td className="py-4 text-center">
        <span className="badge badge-ghost">{item.sort_order}</span>
      </td>

      <td className="py-4 text-right space-x-3">
        <button
          onClick={() => setEditing(true)}
          className="btn btn-xs btn-ghost text-info"
        >
          Edit
        </button>

        <DeleteFaqButton id={item.id} />
      </td>
    </tr>
  );
}
