import { Group, PerspectiveCamera, Scene, Vector3 } from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

const FOLD = Math.PI / 3;
const TAU = Math.PI * 2;
const Y_AXIS = new Vector3(0, 1, 0);
const wrap = (value: number) => (value % 3 + 3) % 3;

export function createStructureScene(container: HTMLElement, className: string) {
  const renderer = new CSS3DRenderer();
  const scene = new Scene();
  const assembly = new Group();
  const camera = new PerspectiveCamera(38, 1, 1, 5000);
  scene.add(assembly);
  container.append(renderer.domElement);
  const faces = [
    { x: 0, z: 0, angle: 0 },
    { x: 0, z: 0, angle: FOLD },
    { x: 0, z: 0, angle: -FOLD },
  ];
  const objects = faces.map((face, index) => {
    const element = document.createElement("div");
    element.className = className;
    element.dataset.face = String(index);
    const object = new CSS3DObject(element);
    object.rotation.y = face.angle;
    assembly.add(object);
    return object;
  });
  let frame = 0;
  let disposed = false;
  let position = 0;
  let panelWidth = 520;
  const normal = new Vector3();
  const towardCamera = new Vector3();
  const render = () => {
    if (disposed) return;
    assembly.updateMatrixWorld(true);
    objects.forEach(object => {
      normal.set(0, 0, 1).transformDirection(object.matrixWorld);
      towardCamera.setFromMatrixPosition(object.matrixWorld).sub(camera.position).negate();
      // Outline the reverse on the same surface; overlapping opaque DOM planes obscure text.
      object.element.dataset.back = String(normal.dot(towardCamera) <= 0);
    });
    renderer.render(scene, camera);
  };
  function pose(turn: number) {
    const index = wrap(turn);
    const angle = [0, -FOLD, -(TAU - FOLD)][index] - Math.floor(turn / 3) * TAU;
    const face = faces[index];
    return { angle, offset: new Vector3(face.x, 0, face.z).applyAxisAngle(Y_AXIS, angle).negate() };
  }
  function show(value: number) {
    position = value;
    const lower = Math.floor(value);
    const fraction = value - lower;
    const from = pose(lower);
    const to = pose(lower + 1);
    assembly.rotation.y = from.angle + (to.angle - from.angle) * fraction;
    assembly.position.lerpVectors(from.offset, to.offset, fraction);
    container.dataset.rotation = String(assembly.rotation.y);
    container.dataset.position = String(value);
    render();
  }
  const observer = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    const focalLength = height / (2 * Math.tan(19 * Math.PI / 180));
    const presentationWidth = width * 0.7;
    // Solve the projected folded-wall width, keeping the front HTML at 1:1 pixel scale.
    panelWidth = presentationWidth * focalLength / (2 * focalLength - Math.sin(FOLD) * presentationWidth);
    const offset = panelWidth * (1 + Math.cos(FOLD)) / 2;
    const depth = -Math.sin(FOLD) * panelWidth / 2;
    faces[1].x = offset;
    faces[2].x = -offset;
    faces[1].z = faces[2].z = depth;
    objects.forEach((object, index) => {
      object.element.style.width = `${panelWidth}px`;
      object.element.style.height = `${height - 100}px`;
      object.position.set(faces[index].x, 0, faces[index].z);
    });
    camera.aspect = width / height;
    camera.position.set(0, 0, focalLength);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    show(position);
  });
  observer.observe(container);

  return {
    hosts: objects.map(object => object.element),
    dragDistance: () => panelWidth * 0.55,
    preview(value: number) { cancelAnimationFrame(frame); show(value); },
    select(turn: number, immediate: boolean, complete: () => void = () => {}) {
      cancelAnimationFrame(frame);
      const from = position;
      const start = performance.now();
      // Animate the connected assembly only; no permanent render loop or separate face motion.
      function tick(now: number) {
        if (disposed) return;
        const progress = immediate ? 1 : Math.min((now - start) / 850, 1);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        show(from + (turn - from) * eased);
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

export type StructureScene = ReturnType<typeof createStructureScene>;
