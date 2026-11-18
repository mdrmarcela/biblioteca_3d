import * as THREE from "three";

export function buildLights(ctx) {
  const { scene, animatedObjects, primitives } = ctx;
  const { box, cylinder, ball, mat, brass, blackMetal } = primitives;
  function createLights() {
    const ambient = new THREE.AmbientLight("#ffe4c5", 0.82);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight("#fff0d0", 2.5);
    sun.position.set(-1.5, 8.7, 6.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -11;
    sun.shadow.camera.right = 11;
    sun.shadow.camera.top = 11;
    sun.shadow.camera.bottom = -11;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.00025;
    sun.shadow.normalBias = 0.03;
    scene.add(sun);
    const fill = new THREE.PointLight("#e7ad70", 52, 16, 2);
    fill.position.set(-5.7, 4.8, 1.5);
    scene.add(fill);
    const deskLight = new THREE.PointLight("#ffba6d", 20, 4.2, 2);
    deskLight.position.set(1.24, 2.08, 1.27);
    scene.add(deskLight);
    // Lustre de teto com três luzes e cabos curvos.
    const chandGroup = new THREE.Group();
    chandGroup.position.set(0, 0, -0.9);
    scene.add(chandGroup);
    cylinder(0.2, 0.24, 0.12, brass, 0, 6.29, 0, chandGroup);
    for (const [i, x] of [-1, 0, 1].entries()) {
      const y = 4.88 - (i % 2) * 0.27;
      const wire = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 6.24, 0),
        new THREE.Vector3(x * 0.65, 5.58, 0.03),
        new THREE.Vector3(x * 1.33, y + 0.14, 0),
      ]);
      chandGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(wire, 20, 0.012, 6, false),
          blackMetal,
        ),
      );
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.43, 0.38, 20, 1, true),
        mat("#bb925f", 0.49, 0.35),
      );
      cap.position.set(x * 1.33, y, 0);
      chandGroup.add(cap);
      const warm = ball(
        0.09,
        new THREE.MeshBasicMaterial({ color: "#ffdfa0" }),
        x * 1.33,
        y - 0.2,
        0,
        chandGroup,
      );
      const smallLight = new THREE.PointLight(
        "#ffc882",
        i === 1 ? 10 : 6,
        4.5,
        2,
      );
      smallLight.position.copy(warm.position);
      chandGroup.add(smallLight);
    }
    animatedObjects.ambient = ambient;
    animatedObjects.sun = sun;
    animatedObjects.fill = fill;
    animatedObjects.deskLight = deskLight;
  }
  createLights();
}
