import { useId } from "react";

export default function ProductArt({
  type = "serum",
  tone = "sage",
  name = "Daily serum",
}: {
  type?: "serum" | "cleanser" | "cream";
  tone?: "sage" | "clay" | "cream";
  name?: string;
}) {
  const id = useId().replaceAll(":", "");
  const colors =
    tone === "sage"
      ? ["#b5c1a4", "#7e927b", "#536b57"]
      : tone === "clay"
        ? ["#e5c1ac", "#caa38d", "#a97f68"]
        : ["#f2ead9", "#ded2b7", "#b8a98d"];
  return (
    <svg
      viewBox="0 0 360 400"
      role="img"
      aria-label={`MORROW ${name} product packaging`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop stopColor={colors[2]} />
          <stop offset=".18" stopColor={colors[0]} />
          <stop offset=".5" stopColor={colors[1]} />
          <stop offset=".85" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[2]} />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#34372d" stopOpacity=".2" />
          <stop offset="1" stopColor="#34372d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="342" rx="112" ry="22" fill={`url(#${id}-shadow)`} />
      {type === "cream" ? (
        <>
          <rect
            x="102"
            y="192"
            width="156"
            height="139"
            rx="19"
            fill={`url(#${id}-body)`}
          />
          <rect x="100" y="165" width="160" height="39" rx="9" fill="#ece9df" />
          <path d="M108 180h144" stroke="#d4d0c3" />
        </>
      ) : (
        <>
          <rect
            x="124"
            y="131"
            width="112"
            height="201"
            rx="20"
            fill={`url(#${id}-body)`}
          />
          {type === "serum" ? (
            <>
              <rect
                x="148"
                y="90"
                width="64"
                height="56"
                rx="8"
                fill="#ece9df"
              />
              <rect
                x="158"
                y="60"
                width="44"
                height="47"
                rx="20"
                fill="#edeae3"
              />
              <path
                d="M154 108v23m9-23v23m9-23v23m9-23v23m9-23v23m9-23v23"
                stroke="#cfcbbf"
              />
            </>
          ) : (
            <>
              <rect
                x="151"
                y="111"
                width="58"
                height="33"
                rx="4"
                fill="#ece9df"
              />
              <path
                d="M180 114V90h53"
                stroke="#ece9df"
                strokeWidth="19"
                strokeLinejoin="round"
              />
              <path d="M228 90v10" stroke="#ece9df" strokeWidth="13" />
            </>
          )}
        </>
      )}
      <text
        x="180"
        y={type === "cream" ? 243 : 223}
        textAnchor="middle"
        fontFamily="Georgia,serif"
        fontSize="21"
        letterSpacing="2"
        fill="#233b2b"
      >
        MORROW
      </text>
      <text
        x="180"
        y={type === "cream" ? 268 : 250}
        textAnchor="middle"
        fontFamily="Arial,sans-serif"
        fontSize="9"
        letterSpacing="1"
        fill="#233b2b"
      >
        {name.toUpperCase()}
      </text>
      <text
        x="180"
        y="293"
        textAnchor="middle"
        fontFamily="Arial,sans-serif"
        fontSize="7"
        letterSpacing="2"
        fill="#233b2b"
      >
        SKIN, SIMPLY.
      </text>
    </svg>
  );
}
