import * as THREE from "three";

export function buildParticles(ctx) {
  const {
    scene,
    animatedObjects,
    textures: { rand },
  } = ctx;
  function createDust() {
    const count = 175,
      positions = new Float32Array(count * 3),
      speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[3 * i] = (rand() - 0.5) * 13;
      positions[3 * i + 1] = 0.4 + rand() * 5.1;
      positions[3 * i + 2] = -5.5 + rand() * 10.5;
      speeds[i] = 0.045 + rand() * 0.1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#f6d4a0",
      size: 0.036,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const system = new THREE.Points(geometry, material);
    scene.add(system);
    animatedObjects.dust = { system, positions, speeds, count };
  }
  createDust();
}