"use client";

import { useState } from "react";
import TestimonialRow from "@/components/admin/TestimonialRow";

type Testimonial = {
  id: number;
  name: string;
  content: string;
  image: string | null;
  date_added: string;
};

export default function TestimonialListClient({
  initialRows,
}: {
  initialRows: Testimonial[];
}) {
  const [rows] = useState(initialRows);

  return (
    <>
      {rows.map((item) => (
        <TestimonialRow key={item.id} item={item} />
      ))}
    </>
  );
}
