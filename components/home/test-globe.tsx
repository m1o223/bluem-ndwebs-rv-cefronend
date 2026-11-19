"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import * as countries from "i18n-iso-countries";
import englishCountries from "i18n-iso-countries/langs/en.json";
import swedishCountries from "i18n-iso-countries/langs/sv.json";
import arabicCountries from "i18n-iso-countries/langs/ar.json";
import worldAtlas from "world-atlas/countries-110m.json";
import { useLocalization, type Locale } from "../localization-provider";
import GoogleWorldMap from "./google-world-map";
import styles from "./test-globe.module.css";

countries.registerLocale(englishCountries);
countries.registerLocale(swedishCountries);
countries.registerLocale(arabicCountries);

type Topology = {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: {
    countries: {
      geometries: Array<{
        type: "Polygon" | "MultiPolygon";
        arcs: number[][] | number[][][];
        id?: string;
        properties?: { name?: string };
      }>;
    };
  };
};

type GeoPoint = [number, number];
type CountryGeometry = Topology["objects"]["countries"]["geometries"][number];

const topology = worldAtlas as unknown as Topology;
const viewBox = { x: -210, y: -110, width: 420, height: 220 };
const maxPan = { x: 24, y: 18 };

function decodeGeoArc(index: number): GeoPoint[] {
  const reversed = index < 0;
  const arc = topology.arcs[reversed ? ~index : index];
  let x = 0;
  let y = 0;
  const points = arc.map(([deltaX, deltaY]) => {
    x += deltaX;
    y += deltaY;
    return [
      x * topology.transform.scale[0] + topology.transform.translate[0],
      y * topology.transform.scale[1] + topology.transform.translate[1],
    ] as GeoPoint;
  });

  return reversed ? points.reverse() : points;
}

function decodeRing(indexes: number[]): GeoPoint[] {
  const points = indexes.flatMap((index, position) => {
    const arc = decodeGeoArc(index);
    return position === 0 ? arc : arc.slice(1);
  });

  if (points.length > 1) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) points.push(first);
  }

  return points;
}

function unwrapRing(points: GeoPoint[], referenceLongitude = points[0]?.[0] ?? 0) {
  let previousLongitude = referenceLongitude;
  return points.map(([longitude, latitude], index) => {
    let unwrappedLongitude = longitude;
    if (index === 0) {
      while (unwrappedLongitude - referenceLongitude > 180) unwrappedLongitude -= 360;
      while (unwrappedLongitude - referenceLongitude < -180) unwrappedLongitude += 360;
    } else {
      while (unwrappedLongitude - previousLongitude > 180) unwrappedLongitude -= 360;
      while (unwrappedLongitude - previousLongitude < -180) unwrappedLongitude += 360;
    }
    previousLongitude = unwrappedLongitude;
    return [unwrappedLongitude, latitude] as GeoPoint;
  });
}

function withoutClosingPoint(points: GeoPoint[]) {
  if (points.length < 2) return points;
  const first = points[0];
  const last = points[points.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? points.slice(0, -1) : points;
}

function polygonArea(points: GeoPoint[]) {
  return points.reduce((sum, [longitude, latitude], index) => {
    const [nextLongitude, nextLatitude] = points[(index + 1) % points.length];
    return sum + longitude * nextLatitude - nextLongitude * latitude;
  }, 0) / 2;
}

function polygonCentroid(points: GeoPoint[]): GeoPoint {
  const area = polygonArea(points);
  if (Math.abs(area) < 0.0001) {
    const totals = points.reduce(([longitude, latitude], point) => [longitude + point[0], latitude + point[1]], [0, 0]);
    return [totals[0] / points.length, totals[1] / points.length];
  }

  let longitude = 0;
  let latitude = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const cross = point[0] * next[1] - next[0] * point[1];
    longitude += (point[0] + next[0]) * cross;
    latitude += (point[1] + next[1]) * cross;
  });

  return [longitude / (6 * area), latitude / (6 * area)];
}

function getCountryPolygons(geometry: CountryGeometry) {
  return geometry.type === "Polygon"
    ? [geometry.arcs as number[][]]
    : geometry.arcs as number[][][];
}

function getCountryAnchor(geometry: CountryGeometry): GeoPoint | null {
  let bestRing: GeoPoint[] | null = null;
  let bestArea = 0;

  for (const polygon of getCountryPolygons(geometry)) {
    const ring = withoutClosingPoint(unwrapRing(decodeRing(polygon[0] ?? [])));
    if (ring.length < 4) continue;
    const area = Math.abs(polygonArea(ring));
    if (area > bestArea) {
      bestArea = area;
      bestRing = ring;
    }
  }

  if (!bestRing) return null;
  const [longitude, latitude] = polygonCentroid(bestRing);
  return [((longitude + 540) % 360) - 180, latitude];
}

function getCountryName(geometry: CountryGeometry, locale: Locale) {
  const code = geometry.id ? countries.numericToAlpha2(geometry.id) : undefined;
  return (code ? countries.getName(code, locale) : undefined) || geometry.properties?.name || geometry.id || "";
}

function ringPath(ringIndexes: number[], offset: number) {
  const points = withoutClosingPoint(unwrapRing(decodeRing(ringIndexes)));
  if (points.length < 3) return "";
  return `${points.map(([longitude, latitude], index) => `${index === 0 ? "M" : "L"}${longitude + offset},${-latitude}`).join(" ")} Z`;
}

function getCountryPaths(geometry: CountryGeometry) {
  return [0].map(offset => getCountryPolygons(geometry)
    .map(polygon => polygon.map(ring => ringPath(ring, offset)).filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" "))
    .filter(Boolean);
}

type CountryFeature = {
  key: string;
  name: string;
  paths: string[];
  anchor: GeoPoint;
  area: number;
  fontSize?: number;
};

function getCountryLabels(features: CountryFeature[]) {
  const placed: Array<{ left: number; right: number; top: number; bottom: number }> = [];
  return features
    .map(feature => {
      const fontSize = feature.area > 900 ? 3.2 : feature.area > 250 ? 2.7 : feature.area > 60 ? 2.25 : 1.75;
      const width = Math.max(5, feature.name.length * fontSize * 0.45);
      return { feature, fontSize, width };
    })
    .sort((a, b) => b.feature.area - a.feature.area)
    .filter(({ feature, width, fontSize }) => {
      const [x, y] = feature.anchor;
      const box = { left: x - width / 2, right: x + width / 2, top: y - fontSize / 2, bottom: y + fontSize / 2 };
      if (placed.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) return false;
      placed.push(box);
      return true;
    })
    .map(({ feature, fontSize }) => ({ ...feature, fontSize }));
}

function buildCountryFeatures(locale: Locale) {
  const features = topology.objects.countries.geometries.flatMap((geometry, index) => {
    const anchor = getCountryAnchor(geometry);
    const name = getCountryName(geometry, locale);
    const paths = getCountryPaths(geometry);
    if (!anchor || !name || !paths.length) return [];
    const area = Math.max(...getCountryPolygons(geometry).map(polygon => {
      const ring = withoutClosingPoint(unwrapRing(decodeRing(polygon[0] ?? [])));
      return Math.abs(polygonArea(ring));
    }));
    return [{ key: geometry.id || `${name}-${index}`, name, paths, anchor, area }];
  });

  return getCountryLabels(features);
}

function StaticWorldMap() {
  const { locale } = useLocalization();
  const features = useMemo(() => buildCountryFeatures(locale), [locale]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; pan: { x: number; y: number } } | null>(null);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (dragRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, pan: panRef.current };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.x) / Math.max(bounds.width, 1)) * viewBox.width;
    const deltaY = ((event.clientY - drag.y) / Math.max(bounds.height, 1)) * viewBox.height;
    const next = {
      x: Math.max(-maxPan.x, Math.min(maxPan.x, drag.pan.x + deltaX)),
      y: Math.max(-maxPan.y, Math.min(maxPan.y, drag.pan.y + deltaY)),
    };
    panRef.current = next;
    setPan(next);
  };

  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  return (
    <section className={styles.section} aria-label="Interactive world map" data-test-globe>
      <div className={styles.mapCard}>
        <div
          className={styles.mapFrame}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <svg className={styles.map} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} role="img" aria-label="Interactive world map">
            <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height} fill="#aee5f5" />
            <g transform={`translate(${pan.x} ${pan.y})`}>
              {features.flatMap(feature => feature.paths.map((path, index) => (
                <path key={`${feature.key}-land-${index}`} d={path} className={styles.country} fillRule="evenodd">
                  <title>{feature.name}</title>
                </path>
              )))}
              {features.map(feature => feature.fontSize ? (
                <text
                  key={`${feature.key}-label`}
                  x={feature.anchor[0]}
                  y={feature.anchor[1]}
                  className={styles.countryLabel}
                  fontSize={feature.fontSize}
                  direction={locale === "ar" ? "rtl" : "ltr"}
                >
                  {feature.name}
                </text>
              ) : null)}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function TestGlobe() {
  const [googleMapUnavailable, setGoogleMapUnavailable] = useState(false);

  if (googleMapsApiKey && !googleMapUnavailable) {
    return <GoogleWorldMap onUnavailable={() => setGoogleMapUnavailable(true)} />;
  }

  return <StaticWorldMap />;
}
