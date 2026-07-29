interface KeywordBadgeProps {
  keyword: string;
  matched: boolean;
}

export default function KeywordBadge({ keyword, matched }: KeywordBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        matched
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"
          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"
      }`}
    >
      {matched ? "✓" : "✗"} {keyword}
    </span>
  );
}
