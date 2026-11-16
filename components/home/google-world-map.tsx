"use client";

import { useEffect, useRef } from "react";
import { useLocalization } from "../localization-provider";
import styles from "./test-globe.module.css";

type GoogleMap = {
  setOptions: (options: Record<string, unknown>) => void;
};

type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    blueMindGoogleMapsPromise?: Promise<GoogleMapsApi>;
  }
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

const mapStyles = [
  { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.province", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#718aa2" }, { weight: 0.7 }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#17365d" }] },
  { featureType: "administrative.country", elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }, { weight: 2 }] },
  { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#aee5f5" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#17365d" }] },
];

function languageCode(locale: string) {
  return locale === "ar" ? "ar" : locale === "sv" ? "sv" : "en";
}

function loadGoogleMaps(language: string) {
  if (!apiKey) return Promise.reject(new Error("Google Maps API key is not configured."));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (window.blueMindGoogleMapsPromise) return window.blueMindGoogleMapsPromise;

  window.blueMindGoogleMapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const callbackName = `blueMindGoogleMapsReady_${Date.now()}`;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&language=${language}&loading=async&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window.blueMindGoogleMapsPromise;
      reject(new Error("Google Maps failed to load."));
    };
    const globalWindow = window as unknown as Window & Record<string, unknown>;
    globalWindow[callbackName] = (() => {
      delete globalWindow[callbackName];
      if (window.google?.maps) resolve(window.google);
      else reject(new Error("Google Maps loaded without the Maps library."));
    });
    document.head.appendChild(script);
  });

  return window.blueMindGoogleMapsPromise;
}

type GoogleWorldMapProps = {
  onUnavailable: () => void;
};

export default function GoogleWorldMap({ onUnavailable }: GoogleWorldMapProps) {
  const { locale } = useLocalization();
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    const language = languageCode(locale);

    loadGoogleMaps(language)
      .then(google => {
        if (cancelled || !mapElement.current) return;
        const options: Record<string, unknown> = {
          center: { lat: 18, lng: 0 },
          zoom: 2,
          minZoom: 1.5,
          maxZoom: 4,
          mapTypeId: "roadmap",
          gestureHandling: "greedy",
          scrollwheel: false,
          disableDoubleClickZoom: true,
          keyboardShortcuts: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          styles: mapStyles,
        };
        if (mapId) options.mapId = mapId;
        mapRef.current = new google.maps.Map(mapElement.current, options);
      })
      .catch(() => {
        if (!cancelled) onUnavailable();
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      if (mapElement.current) mapElement.current.replaceChildren();
    };
  }, [locale, onUnavailable]);

  return (
    <section className={styles.section} aria-label="Google interactive world map" data-test-globe data-google-world-map>
      <div className={styles.mapCard}>
        <div className={styles.mapFrame}>
          <div ref={mapElement} className={styles.googleMap} aria-label="Interactive Google world map" />
        </div>
      </div>
    </section>
  );
}
