import { Group, PerspectiveCamera, Scene, Vector3 } from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

const WIDTH = 520;
const HEIGHT = 560;
const FOLD = Math.PI / 3;

export function createStructureScene(container: HTMLElement, className: string) {
  const renderer = new CSS3DRenderer();
  const scene = new Scene();
  const assembly = new Group();
  const camera = new PerspectiveCamera(38, 1, 1, 5000);
  camera.position.set(0, 0, 1150);
  camera.lookAt(0, 0, 0);
  scene.add(assembly);
  container.append(renderer.domElement);
  const offset = WIDTH / 2 + Math.cos(FOLD) * WIDTH / 2;
  const depth = -Math.sin(FOLD) * WIDTH / 2;
  const faces = [
    { x: 0, z: 0, angle: 0 },
    { x: offset, z: depth, angle: FOLD },
    { x: -offset, z: depth, angle: -FOLD },
  ];
  const hosts = faces.map((face, index) => {
    const element = document.createElement("div");
    element.className = className;
    element.style.width = `${WIDTH}px`;
    element.style.height = `${HEIGHT}px`;
    element.dataset.face = String(index);
    const object = new CSS3DObject(element);
    object.position.set(face.x, 0, face.z);
    object.rotation.y = face.angle;
    assembly.add(object);
    return element;
  });
  let frame = 0;
  let disposed = false;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const observer = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    camera.aspect = width / height;
    camera.position.z = Math.max(1080, 1150 * 1100 / Math.max(width, 1));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  });
  observer.observe(container);

  return {
    hosts,
    select(index: number, immediate: boolean) {
      cancelAnimationFrame(frame);
      const face = faces[index];
      const targetAngle = -face.angle;
      const targetPosition = new Vector3(face.x, 0, face.z).applyAxisAngle(new Vector3(0, 1, 0), targetAngle).negate();
      const fromAngle = assembly.rotation.y;
      const fromPosition = assembly.position.clone();
      const start = performance.now();
      // Animate the connected assembly only; no permanent render loop or separate face motion.
      function tick(now: number) {
        if (disposed) return;
        const progress = immediate ? 1 : Math.min((now - start) / 850, 1);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        assembly.rotation.y = fromAngle + (targetAngle - fromAngle) * eased;
        assembly.position.lerpVectors(fromPosition, targetPosition, eased);
        render();
        if (progress < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.remove();
      scene.clear();
    },
  };
}

export type StructureScene = ReturnType<typeof createStructureScene>;
