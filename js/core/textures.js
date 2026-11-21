import * as THREE from "three";

export function createTextures(renderer) {
  function textureFromCanvas(w, h, paint, rx = 1, ry = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    paint(ctx, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }
  // PRNG determinístico: texturas reproduzíveis em cada execução.
  function randomGenerator(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = randomGenerator(79);
  const floorTexture = textureFromCanvas(
    512,
    512,
    (c, w, h) => {
      c.fillStyle = "#876143";
      c.fillRect(0, 0, w, h);
      for (let row = 0; row < 8; row++) {
        const y = row * 64;
        c.fillStyle = row % 2 ? "#8c6748" : "#996d4e";
        c.fillRect(0, y, w, 64);
        c.strokeStyle = "rgba(49,24,13,.58)";
        c.lineWidth = 3;
        c.strokeRect(0, y, w, 64);
        for (let j = 0; j < 27; j++) {
          c.strokeStyle = `rgba(50,29,19,${0.025 + rand() * 0.13})`;
          c.beginPath();
          const gy = y + rand() * 64;
          c.moveTo(0, gy);
          c.bezierCurveTo(200, gy - 7, 350, gy + 10, 512, gy);
          c.stroke();
        }
      }
    },
    3.1,
    3,
  );
  const wallpaperTexture = textureFromCanvas(
    256,
    256,
    (c, w, h) => {
      c.fillStyle = "#635455";
      c.fillRect(0, 0, w, h);
      for (let x = 12; x < w; x += 32)
        for (let y = 12; y < h; y += 32) {
          c.strokeStyle = "rgba(230,192,144,.14)";
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(x, y - 9);
          c.quadraticCurveTo(x + 9, y, x, y + 9);
          c.quadraticCurveTo(x - 9, y, x, y - 9);
          c.stroke();
          c.fillStyle = "rgba(247,207,146,.12)";
          c.fillRect(x - 1, y - 1, 2, 2);
        }
    },
    7,
    3,
  );
  const rugTexture = textureFromCanvas(768, 512, (c, w, h) => {
    c.fillStyle = "#6d303b";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#cc9567";
    c.lineWidth = 18;
    c.strokeRect(24, 24, w - 48, h - 48);
    c.strokeStyle = "#c7a77e";
    c.lineWidth = 4;
    c.strokeRect(47, 47, w - 94, h - 94);
    c.strokeStyle = "rgba(240,188,135,.55)";
    c.lineWidth = 3;
    c.strokeRect(68, 68, w - 136, h - 136);
    for (let x = 112; x < 700; x += 72)
      for (let y = 112; y < 440; y += 72) {
        c.save();
        c.translate(x, y);
        c.rotate(Math.PI / 4);
        c.strokeStyle = "rgba(220,166,117,.28)";
        c.lineWidth = 2;
        c.strokeRect(-17, -17, 34, 34);
        c.restore();
      }
    c.fillStyle = "#b98863";
    c.beginPath();
    c.ellipse(w / 2, h / 2, 92, 92, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#743444";
    c.lineWidth = 13;
    c.stroke();
    c.fillStyle = "#723342";
    c.beginPath();
    c.ellipse(w / 2, h / 2, 65, 65, 0, 0, Math.PI * 2);
    c.fill();
  });
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture, // textura procedural: serve de reserva se a imagem falhar
    roughness: 0.92,
  });
  // Textura de imagem real (piso de tábuas de madeira, 450 × 450 px, já tratada
  // para repetir sem emendas). O piso mede 16 × 13 m e cada ladrilho cobre
  // 1,6 × 1,6 m, então o mapa se repete 16/1,6 vezes em U e 13/1,6 em V.
  new THREE.TextureLoader().load(
    "assets/piso.jpg",
    (image) => {
      image.colorSpace = THREE.SRGBColorSpace;
      image.wrapS = image.wrapT = THREE.RepeatWrapping;
      image.repeat.set(16 / 1.6, 13 / 1.6);
      image.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      floorMaterial.map = image;
      floorMaterial.needsUpdate = true;
    },
    undefined,
    () => console.warn("assets/piso.jpg não encontrado; usando piso procedural."),
  );
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperTexture,
    roughness: 0.97,
  });
  return { textureFromCanvas, rand, floorMaterial, wallMaterial, rugTexture };
}