import { Group, PerspectiveCamera, Scene } from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

const DURATION = 780;

export function createCarouselScene(container: HTMLElement, className: string, count: number) {
  const STEP_ANGLE = Math.PI * 2 / count;
  const renderer = new CSS3DRenderer();
  const scene = new Scene();
  const ring = new Group();
  const camera = new PerspectiveCamera(38, 1, 1, 5000);
  scene.add(ring);
  container.append(renderer.domElement);
  const objects = Array.from({ length: count }, (_, index) => {
    const element = document.createElement("div");
    element.className = className;
    element.dataset.face = String(index);
    const object = new CSS3DObject(element);
    object.rotation.y = index * STEP_ANGLE;
    ring.add(object);
    return object;
  });
  let frame = 0;
  let disposed = false;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const observer = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    const cardWidth = Math.min(330, Math.max(270, width * 0.29));
    const radius = (cardWidth + 36) / (2 * Math.tan(STEP_ANGLE / 2));
    objects.forEach((object, index) => {
      object.element.style.width = `${cardWidth}px`;
      object.element.style.height = "410px";
      object.position.set(Math.sin(index * STEP_ANGLE) * radius, 0, Math.cos(index * STEP_ANGLE) * radius);
    });
    camera.aspect = width / height;
    // Keep the front surface at native CSS pixel size as the ring radius changes.
    camera.position.set(0, 0, radius + height / (2 * Math.tan(19 * Math.PI / 180)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  });
  observer.observe(container);
  return {
    hosts: objects.map(object => object.element),
    select(turn: number, immediate: boolean, complete: () => void) {
      cancelAnimationFrame(frame);
      const from = ring.rotation.y;
      const target = -turn * STEP_ANGLE;
      const start = performance.now();
      function tick(now: number) {
        if (disposed) return;
        const progress = immediate ? 1 : Math.min((now - start) / DURATION, 1);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        ring.rotation.y = from + (target - from) * eased;
        container.dataset.rotation = String(ring.rotation.y);
        render();
        if (progress < 1) frame = requestAnimationFrame(tick);
        else complete();
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

export type CarouselScene = ReturnType<typeof createCarouselScene>;
