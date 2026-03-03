"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  initialQuestion: string;
  initialAnswer: string;
  initialSortOrder: number;
  onCancel: () => void;
};

export default function EditFaqForm({
  id,
  initialQuestion,
  initialAnswer,
  initialSortOrder,
  onCancel,
}: Props) {
  const router = useRouter();

  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/faq/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answer,
        sort_order: sortOrder,
      }),
    });

    setLoading(false);
    router.refresh();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="input input-bordered w-full"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />

      <textarea
        className="textarea textarea-bordered w-full"
        rows={4}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />

      <input
        type="number"
        className="input input-bordered w-full"
        value={sortOrder}
        onChange={(e) => setSortOrder(Number(e.target.value))}
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? <span className="loading loading-spinner"></span> : "Save changes"}
        </button>

        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
