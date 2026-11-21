import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createEngine(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#18151d");
  scene.fog = new THREE.FogExp2("#252027", 0.013);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);
  camera.position.set(7, 4.8, 12);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute(
    "aria-label",
    "Biblioteca 3D. Use o catálogo ou os botões de vista para explorar pelo teclado.",
  );
  container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 2.35, -2.2);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 22;
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minAzimuthAngle = -Math.PI * 0.43;
  controls.maxAzimuthAngle = Math.PI * 0.43;
  // A câmera não pode atravessar as paredes: a cada mudança de órbita a
  // posição é limitada ao interior da sala (paredes em x=±7.78, teto em y=6.4,
  // parede do fundo em z=-6.2) e o olhar é reapontado para o alvo.
  const bounds = {
    min: new THREE.Vector3(-7.3, 0.7, -5.6),
    max: new THREE.Vector3(7.3, 6.0, 16),
  };
  controls.addEventListener("change", () => {
    const before = camera.position.clone();
    camera.position.clamp(bounds.min, bounds.max);
    if (!camera.position.equals(before)) camera.lookAt(controls.target);
  });
  let quality = "balanced";
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, quality === "low" ? 1 : 1.6),
    );
    renderer.setSize(width, height);
  }
  function setQuality(value) {
    quality = value;
    renderer.shadowMap.enabled = value !== "low";
    scene.traverse((object) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials
        .filter(Boolean)
        .forEach((material) => (material.needsUpdate = true));
    });
    resize();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  controls.update();
  return { scene, camera, renderer, controls, resize, setQuality };
}