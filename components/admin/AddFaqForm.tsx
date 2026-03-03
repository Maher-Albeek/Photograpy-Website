"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddFaqForm() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        answer,
        sort_order: sortOrder,
      }),
    });

    setLoading(false);
    setQuestion("");
    setAnswer("");
    setSortOrder(0);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Add new FAQ</h2>
        <p className="text-base-content/60 text-sm mt-1">
          Create a new question & answer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="input input-bordered w-full"
        />

        <textarea
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          rows={4}
          className="textarea textarea-bordered w-full"
        />

        <input
          type="number"
          placeholder="Sort order"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="input input-bordered w-full"
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? <span className="loading loading-spinner"></span> : "Add"}
      </button>
    </form>
  );
}
