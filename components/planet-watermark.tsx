export function PlanetWatermark({ className, sizes }: { className: string; sizes: string }) {
  return (
    <picture className={className} aria-hidden="true">
      <img
        src="/images/hero/bluemind-hero-1024.webp"
        srcSet={[384, 512, 640, 768, 1024].map(width => `/images/hero/bluemind-hero-${width}.webp ${width}w`).join(", ")}
        sizes={sizes}
        width={1024}
        height={768}
        alt=""
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}
