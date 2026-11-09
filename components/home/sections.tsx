import SiteFooter from "../site-footer";

export function Footer({ textEffects = false }: { textEffects?: boolean }) {
  return <SiteFooter textEffects={textEffects} />;
}
