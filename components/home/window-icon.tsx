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
                ? "M3 9h6V3M9 9 3 3M21 15h-6v6m0-6 6 6"
                : "M9 3H3v6M3 3l7 7M15 21h6v-6m0 6-7-7"
        }
      />
    </svg>
  );
}
