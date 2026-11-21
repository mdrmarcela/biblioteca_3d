import * as THREE from "three";

export function buildRoom(ctx) {
  const { scene, primitives, textures } = ctx;
  const { box, mat, darkWood, woodEdge, wood, brass, oldGold } = primitives;
  const { textureFromCanvas, rand, floorMaterial, wallMaterial, rugTexture } =
    textures;
  function createRoom() {
    box(16, 0.23, 13, floorMaterial, 0, -0.16, 0, scene, true);
    box(16, 6.7, 0.23, wallMaterial, 0, 3.2, -6.35, scene, false);
    box(0.23, 6.7, 13, wallMaterial, -7.9, 3.2, 0, scene, false);
    box(0.23, 6.7, 13, wallMaterial, 7.9, 3.2, 0, scene, false);
    box(16, 0.18, 13, mat("#342326"), 0, 6.52, 0, scene, false);
    // Rodapé e rodateto.
    for (const y of [0.17, 6.22]) {
      box(16, 0.18, 0.13, woodEdge, 0, y, -6.17, scene, false);
      for (const x of [-7.73, 7.73])
        box(0.13, 0.18, 13, woodEdge, x, y, 0, scene, false);
    }
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 4.45),
      new THREE.MeshStandardMaterial({ map: rugTexture, roughness: 1 }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.016, 1.45);
    rug.receiveShadow = true;
    scene.add(rug);
    // Pilar decorativo nos cantos da parede do fundo.
    for (const x of [-7.1, 7.1]) {
      box(0.34, 6.1, 0.33, darkWood, x, 3, -6.07);
      box(0.55, 0.16, 0.43, oldGold, x, 5.96, -6.04);
    }
    // Janela lateral: moldura, vidraça e céu com estrelas (imagem CanvasTexture).
    const starTex = textureFromCanvas(512, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#18243c");
      g.addColorStop(1, "#60798a");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      for (let i = 0; i < 95; i++) {
        const x = rand() * w,
          y = rand() * h;
        c.fillStyle = `rgba(245,243,228,${0.28 + rand() * 0.6})`;
        c.beginPath();
        c.arc(x, y, 0.4 + rand() * 1.1, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "rgba(255,229,168,.95)";
      c.beginPath();
      c.arc(370, 95, 42, 0, Math.PI * 2);
      c.fill();
    });
    const window = new THREE.Group();
    window.position.set(-7.63, 3.66, -0.6);
    window.rotation.y = Math.PI / 2;
    scene.add(window);
    box(3.15, 3.4, 0.09, darkWood, 0, 0, 0, window);
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),
      new THREE.MeshBasicMaterial({ map: starTex, side: THREE.DoubleSide }),
    );
    sky.position.z = 0.07;
    window.add(sky);
    // Vidraça translúcida (req. 05 — opacidade): MeshPhysicalMaterial com
    // transparent + opacity, tom azulado e clearcoat para um brilho de vidro.
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),
      new THREE.MeshPhysicalMaterial({
        color: "#7fb8d4",
        transparent: true,
        opacity: 0.34,
        roughness: 0.05,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false, // translúcidos não devem escrever no z-buffer
      }),
    );
    glass.position.z = 0.115;
    glass.renderOrder = 1;
    window.add(glass);
    // Reflexos diagonais: textura com canal alfa (fundo transparente) sobre o
    // vidro. O que está atrás continua visível, mas "através" de uma superfície.
    const reflection = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),
      new THREE.MeshBasicMaterial({
        map: textureFromCanvas(256, 256, (c, w, h) => {
          c.clearRect(0, 0, w, h);
          c.translate(w / 2, h / 2);
          c.rotate(-0.62);
          for (const [x, width, alpha] of [
            [-70, 46, 0.5],
            [10, 18, 0.34],
            [62, 70, 0.22],
          ]) {
            const g = c.createLinearGradient(x, 0, x + width, 0);
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
            g.addColorStop(1, "rgba(255,255,255,0)");
            c.fillStyle = g;
            c.fillRect(x, -h, width, h * 2);
          }
        }),
        transparent: true,
        depthWrite: false,
      }),
    );
    reflection.position.z = 0.118;
    reflection.renderOrder = 2;
    window.add(reflection);
    ctx.animatedObjects.sky = sky;
    ctx.animatedObjects.nightSky = starTex;
    ctx.animatedObjects.daySky = textureFromCanvas(512, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#709fae");
      g.addColorStop(1, "#efd7a6");
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#fff2c9";
      c.beginPath();
      c.arc(370, 95, 42, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 4; i++) {
        c.fillStyle = "rgba(255,255,255,.22)";
        c.beginPath();
        c.ellipse(
          90 + i * 110,
          165 + (i % 2) * 100,
          100,
          20,
          0,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    });
    box(0.12, 3.28, 0.16, brass, 0, 0, 0.14, window);
    box(2.93, 0.12, 0.16, brass, 0, 0, 0.14, window);
    for (const x of [-1.47, 1.47])
      box(0.16, 3.54, 0.2, wood, x, 0, 0.17, window);
    for (const y of [-1.65, 1.65])
      box(3.12, 0.17, 0.2, wood, 0, y, 0.17, window);
    // Quadros laterais, iluminados por material e geometria emoldurada.
    const art = new THREE.Group();
    art.position.set(7.65, 3, -1.05);
    art.rotation.y = -Math.PI / 2;
    scene.add(art);
    box(2.35, 1.8, 0.09, brass, 0, 0, 0, art);
    const artTex = textureFromCanvas(400, 310, (c, w, h) => {
      c.fillStyle = "#354a46";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#c8ad76";
      c.beginPath();
      c.arc(290, 78, 43, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#253f36";
      c.beginPath();
      c.moveTo(0, 300);
      c.lineTo(0, 172);
      c.lineTo(120, 71);
      c.lineTo(250, 211);
      c.lineTo(360, 112);
      c.lineTo(400, 176);
      c.lineTo(400, 300);
      c.fill();
      c.fillStyle = "#182a28";
      c.beginPath();
      c.moveTo(0, 310);
      c.lineTo(0, 258);
      c.lineTo(180, 132);
      c.lineTo(365, 310);
      c.fill();
    });
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(2.12, 1.6),
      new THREE.MeshBasicMaterial({ map: artTex }),
    );
    picture.position.z = 0.055;
    art.add(picture);
    // Frases no topo da parede, em placa criada a partir de uma imagem.
    label(
      "UM MUNDO ENTRE PÁGINAS",
      3.7,
      0.44,
      0,
      5.77,
      -6.1,
      "#251a1c",
      "#eac793",
    );
  }
  function label(text, w, h, x, y, z, bg = "#332421", color = "#eaca93") {
    const tex = textureFromCanvas(900, 125, (c, cw, ch) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, cw, ch);
      c.strokeStyle = "#b08a50";
      c.lineWidth = 7;
      c.strokeRect(8, 8, cw - 16, ch - 16);
      c.fillStyle = color;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = "bold 53px Georgia,serif";
      c.fillText(text, cw / 2, ch / 2 + 1, cw - 55);
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }
  createRoom();
}