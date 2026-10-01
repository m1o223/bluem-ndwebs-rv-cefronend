export default function Planet({ small = false }: { small?: boolean }) {
  const id = small ? "brand-planet" : "hero-planet";
  return (
    <svg viewBox="0 0 480 480" fill="none" aria-hidden="true" className={small ? "brand-planet" : "hero-planet"}>
      <defs>
        <radialGradient id={id} cx="0.3" cy="0.25" r="0.85">
          <stop stopColor="#88baff" /><stop offset="0.5" stopColor="#3775f0" /><stop offset="1" stopColor="#1244bc" />
        </radialGradient>
        <clipPath id={`${id}-clip`}><circle cx="240" cy="240" r="101" /></clipPath>
      </defs>
      {!small && <g stroke="#e4eaf4" strokeWidth="1">
        <circle cx="240" cy="240" r="176" /><circle cx="240" cy="240" r="220" strokeDasharray="2 7" />
        <path d="M240 8v32M240 440v32M8 240h32M440 240h32" />
      </g>}
      <ellipse cx="240" cy="240" rx="207" ry="76" transform="rotate(-32 240 240)" stroke={small ? "#2360e6" : "#c7d5ee"} strokeWidth={small ? "17" : "1.2"} />
      <circle cx="240" cy="240" r="101" fill={`url(#${id})`} />
      <g clipPath={`url(#${id}-clip)`} stroke="#fff" strokeOpacity=".16" strokeWidth="1">
        <ellipse cx="240" cy="240" rx="49" ry="101" /><ellipse cx="240" cy="240" rx="81" ry="101" />
        <ellipse cx="240" cy="209" rx="101" ry="31" /><ellipse cx="240" cy="265" rx="101" ry="32" />
        <path d="M139 240h202M240 139v202" />
      </g>
      <path d="M69 350C114 369 216 344 317 281C420 217 453 159 409 133" stroke={small ? "#2360e6" : "#8babe4"} strokeWidth={small ? "17" : "1.8"} />
      {!small && <g><circle cx="397" cy="147" r="6" fill="#2360e6" /><circle cx="109" cy="341" r="3.5" fill="#9db5df" /><path d="M384 386h30M399 371v30" stroke="#b4c5e4" /></g>}
    </svg>
  );
}
