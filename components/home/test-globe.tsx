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

function toSpherePoint(longitude: number, latitude: number, radius = globeRadius) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function decodeArc(index: number) {
  const reversed = index < 0;
  const arc = topology.arcs[reversed ? ~index : index];
  let x = 0;
  let y = 0;
  const points = arc.map(([deltaX, deltaY]) => {
    x += deltaX;
    y += deltaY;
    const longitude = x * topology.transform.scale[0] + topology.transform.translate[0];
    const latitude = y * topology.transform.scale[1] + topology.transform.translate[1];
    return toSpherePoint(longitude, latitude, globeRadius + 0.008);
  });

  return reversed ? points.reverse() : points;
}

function addCountryBoundaries(group: THREE.Group) {
  const material = new THREE.LineBasicMaterial({
    color: 0x4d8fc7,
    transparent: true,
    opacity: 0.62,
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

      const points = decodeArc(rawIndex);
      if (points.length < 2) continue;
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
      group.add(line);
    }
  }
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(-3, 4, 5);
    const rimLight = new THREE.DirectionalLight(0x79c5ff, 1.25);
    rimLight.position.set(4, -1, -4);
    scene.add(ambientLight, keyLight, rimLight);

    const globe = new THREE.Group();
    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 64, 40),
      new THREE.MeshPhongMaterial({
        color: 0x9cdaff,
        shininess: 28,
        specular: 0x174a87,
      }),
    );
    globe.add(ocean);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius + 0.04, 64, 40),
      new THREE.MeshBasicMaterial({
        color: 0x79c5ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
      }),
    );
    globe.add(atmosphere);

    addCountryBoundaries(globe);
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
        if (!(child instanceof THREE.Line)) return;
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      });
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
