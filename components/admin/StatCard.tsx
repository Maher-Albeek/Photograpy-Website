import Link from "next/link";

type StatCardProps = {
  title: string;
  value: number | string;
  description?: string;
  href?: string;
};

export default function StatCard({
  title,
  value,
  description,
  href,
}: StatCardProps) {
  const className = `
    card
    bg-base-100
    border
    border-base-300
    transition
    ${href ? "cursor-pointer hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" : "hover:bg-base-200"}
  `;

  const content = (
      <div className="card-body">
        <h3 className="text-sm font-medium text-base-content/60">
          {title}
        </h3>

        <div className="text-3xl font-bold">
          {value}
        </div>

        {description && (
          <p className="text-xs text-base-content/50">
            {description}
          </p>
        )}
      </div>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`Open ${title}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
