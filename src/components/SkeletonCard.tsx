"use client";

export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:px-6 sm:py-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
      <div className="space-y-2 mb-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-200 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid ${columns} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
