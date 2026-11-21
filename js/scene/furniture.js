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
    // Escada de madeira no vão entre a estante da direita e a parede lateral.
    // Fica reta (sem inclinação lateral) e se apoia para trás, com o topo
    // encostado no pilar do canto do fundo, como uma escada de biblioteca real.
    const FLOOR_Y = -0.045, // topo do piso (caixa em y=-0.16, altura 0.23)
      LADDER_H = 4.7,
      LADDER_HALF_W = 0.37,
      RAIL = 0.1,
      LEAN = 0.18, // inclinação para trás (rad)
      LADDER_X = 7.27, // centro do vão: estante termina em 6.74, parede em 7.785
      PILLAR_FRONT_Z = -5.905; // face frontal do pilar (z=-6.07 ± 0.165)
    const ladder = new THREE.Group();
    // O canto traseiro-superior do trilho deve tocar o pilar sem entrar nele:
    // z = z0 + y·sin(a) + z_local·cos(a), com a = -LEAN, y = LADDER_H, z_local = -RAIL/2.
    const baseZ =
      PILLAR_FRONT_Z +
      LADDER_H * Math.sin(LEAN) +
      (RAIL / 2) * Math.cos(LEAN) +
      0.005;
    // Transformação feita com matrizes (req. 03): M = T · R. Primeiro o vértice
    // é rotacionado em X (inclinação) e depois transladado até o vão da estante.
    const rotation = new THREE.Matrix4().makeRotationX(-LEAN);
    const translation = new THREE.Matrix4().makeTranslation(
      LADDER_X,
      FLOOR_Y + (RAIL / 2) * Math.sin(LEAN),
      baseZ,
    );
    ladder.applyMatrix4(translation.multiply(rotation));
    scene.add(ladder);
    for (const x of [-LADDER_HALF_W, LADDER_HALF_W])
      box(RAIL, LADDER_H, RAIL, woodEdge, x, LADDER_H / 2, 0, ladder);
    for (let y = 0.48; y < 4.5; y += 0.44)
      box(0.79, 0.07, 0.12, woodEdge, 0, y, 0.02, ladder);
    // Luminária de piso em arco, no canto à esquerda: base redonda, haste fina,
    // braço curvo (CatmullRomCurve3 + TubeGeometry) e cúpula por revolução
    // (LatheGeometry) com anel de madeira clara, como a de referência.
    const cornerLamp = new THREE.Group();
    cornerLamp.position.set(-7.2, FLOOR_Y, -4.5);
    scene.add(cornerLamp);
    const lampMetal = mat("#26211f", 0.45, 0.35),
      lampPole = mat("#3a2c26", 0.5, 0.3),
      lampWood = mat("#c99a62", 0.6);
    cylinder(0.4, 0.4, 0.07, lampMetal, 0, 0.035, 0, cornerLamp, 40);
    cylinder(0.032, 0.032, 3.5, lampPole, 0, 0.07 + 1.75, 0, cornerLamp, 16);
    const arm = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 3.45, 0),
          new THREE.Vector3(0, 3.95, 0.04),
          new THREE.Vector3(0, 4.2, 0.38),
          new THREE.Vector3(0, 4.12, 0.85),
          new THREE.Vector3(0, 3.95, 1.15),
        ]),
        40,
        0.03,
        10,
        false,
      ),
      lampPole,
    );
    cornerLamp.add(arm);
    const shadeGroup = new THREE.Group();
    shadeGroup.position.set(0, 3.95, 1.15);
    cornerLamp.add(shadeGroup);
    cylinder(0.075, 0.075, 0.14, lampWood, 0, -0.05, 0, shadeGroup, 20);
    const shadeProfile = new THREE.SplineCurve([
      new THREE.Vector2(0.08, -0.1),
      new THREE.Vector2(0.19, -0.17),
      new THREE.Vector2(0.3, -0.32),
      new THREE.Vector2(0.37, -0.5),
      new THREE.Vector2(0.4, -0.62),
    ]).getPoints(24);
    const shadeGeometry = new THREE.LatheGeometry(shadeProfile, 40);
    const shadeOuter = new THREE.Mesh(shadeGeometry, mat("#1d1b1a", 0.5, 0.2));
    shadeOuter.castShadow = true;
    shadeGroup.add(shadeOuter);
    // Forro interno claro e levemente emissivo: a luz "acende" a cúpula por dentro.
    const shadeInner = new THREE.Mesh(
      shadeGeometry,
      new THREE.MeshStandardMaterial({
        color: "#f2d9a8",
        emissive: "#ffcf8a",
        emissiveIntensity: 0.7,
        side: THREE.BackSide,
      }),
    );
    shadeInner.scale.setScalar(0.985);
    shadeGroup.add(shadeInner);
    const cornerBulb = ball(
      0.09,
      new THREE.MeshStandardMaterial({
        color: "#fff0ba",
        emissive: "#f8b65c",
        emissiveIntensity: 2.6,
      }),
      0,
      -0.46,
      0,
      shadeGroup,
      16,
    );
    const cornerLight = new THREE.PointLight("#ffba6d", 26, 6.5, 2);
    cornerLight.position.set(0, -0.55, 0);
    shadeGroup.add(cornerLight);
    animatedObjects.cornerBulb = cornerBulb;
    animatedObjects.cornerShade = shadeInner;
    animatedObjects.cornerLight = cornerLight;
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
      // Matriz de modelo montada à mão: M = T · R · S (compose) e aplicada à
      // folha com applyMatrix4, em vez de position/rotation/scale separados.
      leaf.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(ex, top, ez),
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(Math.sin(angle) * 0.55, 0, -Math.cos(angle) * 0.65),
          ),
          new THREE.Vector3(0.12, 0.31, 0.085),
        ),
      );
      leaf.castShadow = true;
      scene.add(leaf);
    }
    // Vaso de vidro por revolução (LatheGeometry — geometria customizada).
    // O perfil 2D (raio × altura) é suavizado com uma SplineCurve e girado 360°
    // em torno do eixo Y. A parede tem espessura: sobe pelo lado de fora e
    // desce pelo de dentro, formando um vaso oco.
    const profile = new THREE.SplineCurve([
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(0.1, 0.004),
      new THREE.Vector2(0.15, 0.09),
      new THREE.Vector2(0.155, 0.19),
      new THREE.Vector2(0.115, 0.3),
      new THREE.Vector2(0.065, 0.385),
      new THREE.Vector2(0.06, 0.45),
      new THREE.Vector2(0.085, 0.52),
    ]).getPoints(36);
    const wall = 0.012;
    const inner = profile
      .map((p) => new THREE.Vector2(Math.max(p.x - wall, 0.001), p.y + wall))
      .reverse();
    const vase = new THREE.Mesh(
      new THREE.LatheGeometry([...profile, ...inner], 40),
      new THREE.MeshPhysicalMaterial({
        color: "#a5d4dc",
        transparent: true,
        opacity: 0.34,
        roughness: 0.04,
        metalness: 0,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    vase.position.set(-1.62, 1.4175, -0.62);
    vase.renderOrder = 2;
    desk.add(vase);
    // Hastes e flores visíveis através do vidro.
    const stemMaterial = mat("#3f6b4a", 0.85),
      petalMaterial = mat("#d9737b", 0.7);
    for (const [i, bend] of [-0.07, 0.01, 0.08].entries()) {
      const top = 0.62 + i * 0.07;
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(bend * 0.3, 0.03, 0),
        new THREE.Vector3(bend * 0.6, 0.3, 0.02 * (i - 1)),
        new THREE.Vector3(bend * 1.4, top, 0.03 * (i - 1)),
      ]);
      const stem = new THREE.Mesh(
        new THREE.TubeGeometry(path, 16, 0.009, 6, false),
        stemMaterial,
      );
      stem.position.copy(vase.position);
      desk.add(stem);
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 8),
        petalMaterial,
      );
      flower.position
        .copy(vase.position)
        .add(new THREE.Vector3(bend * 1.4, top + 0.02, 0.03 * (i - 1)));
      flower.scale.set(1, 0.8, 1);
      desk.add(flower);
    }
    // Pilha de livros sobre a mesa de leitura (grupo `desk`), entre o livro aberto e a xícara.
    const DESK_TOP = 1.4175; // topo da borda do tampo (1.39 + 0.0275)
    for (let i = 0; i < 3; i++) {
      const bk = box(
        0.56,
        0.085,
        0.45,
        mat(["#72423b", "#40616a", "#837045"][i]),
        0.05,
        DESK_TOP + 0.0425 + i * 0.085,
        -0.5,
        desk,
      );
      bk.rotation.y = (i - 1) * 0.12;
    }
  }
  createFurniture();
}