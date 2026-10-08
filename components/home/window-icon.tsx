export default function WindowIcon({
  action,
  expanded = false,
}: {
  action: "close" | "minimize" | "expand";
  expanded?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={
          action === "close"
            ? "m7 7 10 10M17 7 7 17"
            : action === "minimize"
              ? "M6 12h12"
              : expanded
                ? "M8 8h10v10H8zM6 16H4V4h12v2"
                : "M6 6h12v12H6z"
        }
      />
    </svg>
  );
}
