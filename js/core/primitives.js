import * as THREE from "three";

export function createPrimitives(scene) {
  const mat = (color, roughness = 0.82, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const wood = mat("#603d2b", 0.69),
    darkWood = mat("#281a18", 0.74),
    woodEdge = mat("#8e5d3b", 0.64);
  const brass = mat("#d0a25f", 0.27, 0.72),
    oldGold = mat("#a77a43", 0.43, 0.5);
  const paper = mat("#f0dcbc", 0.91),
    deepGreen = mat("#1e473a", 0.82),
    fabric = mat("#602b38", 0.96);
  const blackMetal = mat("#28292d", 0.37, 0.7),
    glass = mat("#6a91a6", 0.12, 0.15);
  function box(w, h, d, material, x, y, z, parent = scene, shadows = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadows;
    mesh.receiveShadow = shadows;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(
    rt,
    rb,
    height,
    material,
    x,
    y,
    z,
    parent = scene,
    segments = 20,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, height, segments),
      material,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function ball(radius, material, x, y, z, parent = scene, segments = 16) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, 12),
      material,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  return {
    mat,
    box,
    cylinder,
    ball,
    wood,
    darkWood,
    woodEdge,
    brass,
    oldGold,
    paper,
    deepGreen,
    fabric,
    blackMetal,
    glass,
  };
}
