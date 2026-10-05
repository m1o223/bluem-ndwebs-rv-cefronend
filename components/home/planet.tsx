import { BlueMindPlanetLogo } from "../blue-mind-planet-logo";

export default function Planet({ small = false }: { small?: boolean }) {
  return <BlueMindPlanetLogo className={small ? "brand-planet" : "hero-planet"} />;
}
