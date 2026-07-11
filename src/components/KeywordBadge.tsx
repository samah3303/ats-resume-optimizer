interface KeywordBadgeProps {
  keyword: string;
  matched: boolean;
}

export default function KeywordBadge({ keyword, matched }: KeywordBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        matched
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-800 border border-red-300"
      }`}
    >
      {matched ? "✓" : "✗"} {keyword}
    </span>
  );
}
