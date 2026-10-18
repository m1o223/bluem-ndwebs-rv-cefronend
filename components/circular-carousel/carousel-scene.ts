import { Group, PerspectiveCamera, Scene } from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

const DURATION = 780;

export function createCarouselScene(container: HTMLElement, className: string, count: number, contentSized = false) {
  const STEP_ANGLE = Math.PI * 2 / count;
  const compact = count === 3;
  const visibleAngle = compact ? Math.PI * 2 / 7 : STEP_ANGLE;
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
  let position = 0;
  let radius = 0;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  function place(turn: number) {
    position = turn;
    container.dataset.rotation = String(-turn * STEP_ANGLE);
    if (!compact) { ring.rotation.y = -turn * STEP_ANGLE; return; }
    // Three unique faces share the master's front arc. The spare face takes the rear
    // arc between side positions, with continuous position and tangent at both joins.
    objects.forEach((object, index) => {
      const offset = ((index - turn + 1) % count + count) % count - 1;
      const rear = Math.max(0, offset - 1);
      const angle = offset <= 1 ? offset * visibleAngle : visibleAngle * (1 + rear) + (Math.PI * 2 - 3 * visibleAngle) * rear * rear * (3 - 2 * rear);
      object.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      // Keep the returning face front-readable instead of flashing its hidden backface.
      object.rotation.y = offset <= 1 ? angle : visibleAngle * (1 + rear - 9 * rear ** 2 + 6 * rear ** 3);
    });
  }
  function layout() {
    if (disposed) return;
    const width = container.getBoundingClientRect().width;
    const cardWidth = Math.min(330, Math.max(270, width * 0.29));
    radius = (cardWidth + 36) / (2 * Math.tan(visibleAngle / 2));
    objects.forEach(object => { object.element.style.width = `${cardWidth}px`; });
    let cardHeight = 410;
    if (contentSized) {
      container.style.setProperty("--card-min-height", "410px");
      cardHeight = Math.max(410, ...objects.map(object => object.element.querySelector<HTMLElement>("article")?.offsetHeight || 0));
      container.style.setProperty("--card-min-height", `${cardHeight}px`);
      container.style.height = `${cardHeight + 120}px`;
    }
    const height = container.getBoundingClientRect().height;
    objects.forEach((object, index) => {
      object.element.style.height = `${cardHeight}px`;
      object.position.set(Math.sin(index * STEP_ANGLE) * radius, 0, Math.cos(index * STEP_ANGLE) * radius);
    });
    camera.aspect = width / height;
    const focal = (compact ? 530 : height) / (2 * Math.tan(19 * Math.PI / 180));
    camera.fov = 2 * Math.atan(height / (2 * focal)) * 180 / Math.PI;
    // Keep the front surface at native CSS pixel size as the ring radius changes.
    camera.position.set(0, 0, radius + focal);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    place(position);
    render();
  }
  const observer = new ResizeObserver(layout);
  observer.observe(container);
  return {
    hosts: objects.map(object => object.element),
    layout,
    preview(turn: number) {
      cancelAnimationFrame(frame);
      place(turn);
      render();
    },
    select(turn: number, immediate: boolean, complete: () => void) {
      cancelAnimationFrame(frame);
      const from = position;
      const start = performance.now();
      function tick(now: number) {
        if (disposed) return;
        const progress = immediate ? 1 : Math.min((now - start) / DURATION, 1);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        place(from + (turn - from) * eased);
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
      container.style.removeProperty("height");
      container.style.removeProperty("--card-min-height");
      scene.clear();
    },
  };
}

export type CarouselScene = ReturnType<typeof createCarouselScene>;
