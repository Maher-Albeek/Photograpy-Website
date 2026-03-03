type StatCardProps = {
  title: string;
  value: number | string;
  description?: string;
};

export default function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        card 
        bg-base-100 
        border 
        border-base-300
        hover:bg-base-200
      "
    >
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
    </div>
  );
}
