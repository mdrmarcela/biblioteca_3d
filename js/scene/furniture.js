import * as THREE from "three";

export function buildFurniture(ctx) {
  const { scene, animatedObjects, textures, primitives } = ctx;
  const { textureFromCanvas, rand } = textures;
  const {
    box,
    cylinder,
    ball,
    mat,
    wood,
    woodEdge,
    darkWood,
    brass,
    oldGold,
    paper,
    fabric,
  } = primitives;
  function createFurniture() {
    const desk = new THREE.Group();
    desk.position.set(0, 0, 1.55);
    scene.add(desk);
    box(3.95, 0.2, 2.02, wood, 0, 1.27, 0, desk);
    box(3.85, 0.055, 2.08, woodEdge, 0, 1.39, 0, desk);
    box(3.7, 0.2, 0.09, wood, 0, 1.09, 0.82, desk);
    for (const x of [-1.68, 1.68])
      for (const z of [-0.73, 0.73]) {
        box(0.2, 1.17, 0.2, darkWood, x, 0.6, z, desk);
        box(0.27, 0.095, 0.27, brass, x, 0.16, z, desk);
      }
    box(1.27, 0.14, 0.11, oldGold, 0, 1.02, 0.84, desk, false);
    // Livro aberto sobre a mesa: páginas como malhas inclinadas.
    const opened = new THREE.Group();
    opened.position.set(-0.84, 1.43, 0.02);
    opened.rotation.y = 0.18;
    desk.add(opened);
    box(0.98, 0.07, 0.74, darkWood, 0, 0, 0, opened);
    for (const side of [-1, 1]) {
      const leaf = box(
        0.46,
        0.025,
        0.68,
        paper,
        side * 0.24,
        0.065,
        0,
        opened,
        false,
      );
      leaf.rotation.z = -side * 0.1;
      box(0.018, 0.035, 0.67, oldGold, side * 0.47, 0.065, 0, opened, false);
    }
    box(0.02, 0.075, 0.71, oldGold, 0, 0.055, 0, opened, false);
    // Xícara com aros curvos.
    cylinder(0.135, 0.12, 0.18, mat("#e0c6a0"), 0.4, 1.51, 0.22, desk, 22);
    cylinder(0.098, 0.098, 0.01, mat("#42302a"), 0.4, 1.608, 0.22, desk, 22);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.019, 8, 18, Math.PI * 1.35),
      mat("#e0c6a0"),
    );
    handle.position.set(0.55, 1.53, 0.22);
    desk.add(handle);
    // Luminária articulada com luz localizada.
    cylinder(0.22, 0.22, 0.065, brass, 1.2, 1.49, -0.27, desk, 32);
    const stem = cylinder(0.04, 0.045, 0.64, brass, 1.18, 1.81, -0.28, desk);
    stem.rotation.z = -0.13;
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.37, 0.37, 24, 1, true),
      mat("#a9845d", 0.38, 0.2),
    );
    shade.position.set(1.24, 2.19, -0.28);
    shade.castShadow = true;
    desk.add(shade);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: "#fff0ba",
      emissive: "#f8b65c",
      emissiveIntensity: 2.6,
    });
    const bulb = ball(0.1, bulbMat, 1.24, 2.015, -0.28, desk, 18);
    animatedObjects.lampBulb = bulb;
    // Cadeira com estrutura, encosto e almofada.
    const chair = new THREE.Group();
    chair.position.set(0, 0, 3.37);
    scene.add(chair);
    box(1.18, 0.17, 1.02, wood, 0, 0.72, 0, chair);
    box(1.0, 0.09, 0.91, fabric, 0, 0.84, 0.03, chair);
    for (const x of [-0.47, 0.47])
      for (const z of [-0.4, 0.4])
        box(0.095, 0.7, 0.095, darkWood, x, 0.37, z, chair);
    for (const x of [-0.48, 0.48])
      box(0.1, 1.02, 0.12, wood, x, 1.28, 0.43, chair);
    box(1.02, 0.7, 0.11, fabric, 0, 1.47, 0.44, chair);
    // Mesa lateral com globo em rotação contínua.
    box(1.1, 0.13, 1.1, wood, 5.7, 1.0, 2.55);
    for (const x of [5.25, 6.15])
      for (const z of [2.1, 3.0]) box(0.1, 0.99, 0.1, darkWood, x, 0.51, z);
    cylinder(0.07, 0.12, 0.46, brass, 5.7, 1.26, 2.55);
    const globe = new THREE.Group();
    globe.position.set(5.7, 1.8, 2.55);
    globe.rotation.z = -0.16;
    scene.add(globe);
    const globeTex = textureFromCanvas(512, 256, (c, w, h) => {
      c.fillStyle = "#3e6374";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#b8aa7a";
      for (let i = 0; i < 14; i++) {
        const x = rand() * w,
          y = rand() * h,
          sz = 12 + rand() * 33;
        c.beginPath();
        c.ellipse(x, y, sz, sz * 0.44, rand() * 2.8, 0, Math.PI * 2);
        c.fill();
      }
      c.strokeStyle = "rgba(255,255,255,.16)";
      for (let x = 0; x < w; x += 64) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, h);
        c.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(w, y);
        c.stroke();
      }
    });
    const earth = ball(
      0.43,
      new THREE.MeshStandardMaterial({ map: globeTex, roughness: 0.75 }),
      0,
      0,
      0,
      globe,
      32,
    );
    animatedObjects.globe = earth;
    const meridian = new THREE.Mesh(
      new THREE.TorusGeometry(0.47, 0.018, 6, 64),
      brass,
    );
    meridian.rotation.y = 0.45;
    globe.add(meridian);
    // Relógio em parede lateral.
    const watch = new THREE.Group();
    watch.position.set(7.57, 4.8, 2.7);
    watch.rotation.y = -Math.PI / 2;
    scene.add(watch);
    const watchFace = textureFromCanvas(512, 512, (c, w, h) => {
      c.fillStyle = "#d8c8a9";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#81623e";
      c.lineWidth = 14;
      c.beginPath();
      c.arc(256, 256, 238, 0, Math.PI * 2);
      c.stroke();
      c.save();
      c.translate(256, 256);
      c.fillStyle = "#382922";
      c.textAlign = "center";
      c.textBaseline = "middle";
      for (let j = 1; j <= 12; j++) {
        const a = (j * Math.PI) / 6 - Math.PI / 2;
        c.font = "bold 34px Georgia,serif";
        c.fillText(String(j), Math.cos(a) * 189, Math.sin(a) * 189);
      }
      c.restore();
    });
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 40),
      new THREE.MeshBasicMaterial({ map: watchFace }),
    );
    watch.add(face);
    const handMaterial = mat("#402820");
    const hourHand = box(
      0.07,
      0.39,
      0.035,
      handMaterial,
      0,
      0.12,
      0.038,
      watch,
      false,
    );
    hourHand.rotation.z = -0.3;
    const minuteHand = box(
      0.045,
      0.53,
      0.035,
      handMaterial,
      0,
      0.16,
      0.05,
      watch,
      false,
    );
    animatedObjects.minuteHand = minuteHand;
    // Escada de madeira junto à estante à direita.
    const ladder = new THREE.Group();
    ladder.position.set(6.87, 0, -3.66);
    ladder.rotation.z = -0.13;
    scene.add(ladder);
    for (const x of [-0.37, 0.37])
      box(0.1, 4.7, 0.1, woodEdge, x, 2.35, 0, ladder);
    for (let y = 0.48; y < 4.5; y += 0.44)
      box(0.79, 0.07, 0.12, woodEdge, 0, y, 0.02, ladder);
    // Vaso de planta, com hastes em TubeGeometry (recurso avançado).
    cylinder(0.45, 0.32, 0.72, mat("#74503d"), -6.0, 0.4, 2.85);
    cylinder(0.37, 0.37, 0.035, mat("#342a26"), -6.0, 0.78, 2.85);
    const leafMat = mat("#345947", 0.88),
      leafLight = mat("#65815b", 0.87);
    for (let i = 0; i < 11; i++) {
      const angle = (i * Math.PI * 2) / 11,
        spread = 0.5 + rand() * 0.46,
        top = 1.4 + rand() * 0.77;
      const ex = -6 + Math.cos(angle) * spread,
        ez = 2.85 + Math.sin(angle) * spread;
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6, 0.77, 2.85),
        new THREE.Vector3(
          -6 + Math.cos(angle) * 0.26,
          1.1,
          2.85 + Math.sin(angle) * 0.26,
        ),
        new THREE.Vector3(ex, top, ez),
      ]);
      const stalk = new THREE.Mesh(
        new THREE.TubeGeometry(path, 12, 0.022, 6, false),
        leafMat,
      );
      scene.add(stalk);
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(1, 10, 7),
        i % 2 ? leafMat : leafLight,
      );
      leaf.scale.set(0.12, 0.31, 0.085);
      leaf.position.set(ex, top, ez);
      leaf.rotation.z = -Math.cos(angle) * 0.65;
      leaf.rotation.x = Math.sin(angle) * 0.55;
      leaf.castShadow = true;
      scene.add(leaf);
    }
    // Pilhas de livros na mesa lateral e caixa decorativa.
    for (let i = 0; i < 3; i++) {
      const bk = box(
        0.56,
        0.085,
        0.45,
        mat(["#72423b", "#40616a", "#837045"][i]),
        -5.4,
        0.91 + i * 0.09,
        3.9,
      );
      bk.rotation.y = (i - 1) * 0.12;
    }
  }
  createFurniture();
}
