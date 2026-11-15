"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import worldAtlas from "world-atlas/countries-110m.json";
import styles from "./test-globe.module.css";

type Topology = {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: {
    countries: {
      geometries: Array<{
        type: "Polygon" | "MultiPolygon";
        arcs: number[][] | number[][][];
      }>;
    };
  };
};

const topology = worldAtlas as unknown as Topology;
const globeRadius = 1.42;
type GeoPoint = [number, number];

function toSpherePoint(longitude: number, latitude: number, radius = globeRadius) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function decodeGeoArc(index: number): GeoPoint[] {
  const reversed = index < 0;
  const arc = topology.arcs[reversed ? ~index : index];
  let x = 0;
  let y = 0;
  const points = arc.map(([deltaX, deltaY]) => {
    x += deltaX;
    y += deltaY;
    const longitude = x * topology.transform.scale[0] + topology.transform.translate[0];
    const latitude = y * topology.transform.scale[1] + topology.transform.translate[1];
    return [longitude, latitude] as GeoPoint;
  });

  return reversed ? points.reverse() : points;
}

function decodeRing(indexes: number[]): GeoPoint[] {
  const points = indexes.flatMap((index, position) => {
    const arc = decodeGeoArc(index);
    return position === 0 ? arc : arc.slice(1);
  });

  if (points.length > 1) {
    const [firstLongitude, firstLatitude] = points[0];
    const [lastLongitude, lastLatitude] = points[points.length - 1];
    if (firstLongitude !== lastLongitude || firstLatitude !== lastLatitude) {
      points.push(points[0]);
    }
  }

  return points;
}

function unwrapRing(points: GeoPoint[], referenceLongitude = points[0]?.[0] ?? 0) {
  if (!points.length) return points;
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

function addCountryLand(group: THREE.Group) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xeaf2f3,
    emissiveIntensity: 0.52,
    shininess: 8,
    specular: 0x8db9cf,
    side: THREE.DoubleSide,
  });

  for (const geometry of topology.objects.countries.geometries) {
    const polygons: number[][][] = geometry.type === "Polygon"
      ? [geometry.arcs as number[][]]
      : geometry.arcs as number[][][];

    for (const polygon of polygons) {
      const rings = polygon
        .map(ring => withoutClosingPoint(unwrapRing(decodeRing(ring))))
        .filter(ring => ring.length >= 4);
      const outer = rings[0];
      if (!outer) continue;

      const shapePoints = outer.map(([longitude, latitude]) => new THREE.Vector2(longitude, latitude));
      const triangles = THREE.ShapeUtils.triangulateShape(shapePoints, []);
      if (!triangles.length) continue;

      const positions = outer.flatMap(([longitude, latitude]) => (
        toSpherePoint(longitude, latitude, globeRadius + 0.012).toArray()
      ));
      const indices = triangles.flatMap(([a, b, c]) => [a, b, c]);
      const landGeometry = new THREE.BufferGeometry();
      landGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      landGeometry.setIndex(indices);
      landGeometry.computeVertexNormals();
      group.add(new THREE.Mesh(landGeometry, material));
    }
  }

  return material;
}

function addCountryBoundaries(group: THREE.Group) {
  const material = new THREE.LineBasicMaterial({
    color: 0x718aa2,
    transparent: true,
    opacity: 0.7,
  });
  const usedArcs = new Set<number>();

  for (const geometry of topology.objects.countries.geometries) {
    const indexes: number[] = geometry.type === "Polygon"
      ? (geometry.arcs as number[][]).flat()
      : (geometry.arcs as number[][][]).flat(2);

    for (const rawIndex of indexes) {
      const arcIndex = rawIndex < 0 ? ~rawIndex : rawIndex;
      if (usedArcs.has(arcIndex)) continue;
      usedArcs.add(arcIndex);

      const points = decodeGeoArc(rawIndex).map(([longitude, latitude]) => (
        toSpherePoint(longitude, latitude, globeRadius + 0.02)
      ));
      if (points.length < 2) continue;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
      group.add(line);
    }
  }

  return material;
}

export default function TestGlobe() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.05, 6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = styles.canvas;
    renderer.domElement.setAttribute("aria-hidden", "true");
    viewport.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x174a87, 0.9);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(-3, 4, 5);
    const rimLight = new THREE.DirectionalLight(0x79c5ff, 1.1);
    rimLight.position.set(4, -1, -4);
    scene.add(ambientLight, hemisphereLight, keyLight, rimLight);

    const globe = new THREE.Group();
    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 64, 40),
      new THREE.MeshPhongMaterial({
        color: 0x8fd3ee,
        shininess: 18,
        specular: 0x5ba8d0,
      }),
    );
    globe.add(ocean);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius + 0.04, 64, 40),
      new THREE.MeshBasicMaterial({
        color: 0x79c5ff,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      }),
    );
    globe.add(atmosphere);

    const landMaterial = addCountryLand(globe);
    const boundaryMaterial = addCountryBoundaries(globe);
    scene.add(globe);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.65;
    controls.maxDistance = 6.2;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.7;
    controls.target.set(0, 0, 0);
    controls.update();

    const resize = () => {
      const width = Math.max(viewport.clientWidth, 1);
      const height = Math.max(viewport.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      ocean.geometry.dispose();
      (ocean.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      globe.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          return;
        }
        if (child instanceof THREE.Mesh && child !== ocean && child !== atmosphere) {
          child.geometry.dispose();
        }
      });
      landMaterial.dispose();
      boundaryMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className={styles.section} aria-label="Interactive globe" data-test-globe>
      <div ref={viewportRef} className={styles.viewport} />
    </section>
  );
}
