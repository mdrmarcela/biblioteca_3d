import * as THREE from "three";
import { catalog, descriptions, palettes } from "../data/catalog.js";
export function buildShelves(ctx) {
  const { scene, books, bookHitTargets, textures, primitives } = ctx;
  const { textureFromCanvas } = textures;
  const { box, ball, mat, darkWood, wood, woodEdge, oldGold, brass, paper } =
    primitives;
  function makeSpineTexture(category, number, color) {
    return textureFromCanvas(128, 480, (c, w, h) => {
      c.fillStyle = color;
      c.fillRect(0, 0, w, h);
      c.fillStyle = "rgba(0,0,0,.18)";
      c.fillRect(0, 0, 13, h);
      c.strokeStyle = "#e7be79";
      c.lineWidth = 4;
      c.strokeRect(15, 16, w - 30, h - 32);
      c.fillStyle = "#e7c48d";
      c.fillRect(23, 65, w - 46, 5);
      c.fillRect(23, h - 70, w - 46, 5);
      c.textAlign = "center";
      c.fillStyle = "#f6ddb2";
      c.font = "bold 19px Georgia,serif";
      c.fillText(
        category === "Literatura"
          ? "LIT"
          : category === "Ciência"
            ? "SCI"
            : "FAN",
        w / 2,
        44,
      );
      c.save();
      c.translate(w / 2, h / 2);
      c.rotate(-Math.PI / 2);
      c.font = "bold 28px Georgia,serif";
      c.fillText("A U R O R A", 0, 10, 235);
      c.restore();
      c.font = "20px Georgia,serif";
      c.fillText(String(number).padStart(3, "0"), w / 2, h - 35);
    });
  }
  function createBookshelf(cx, category) {
    const shelf = new THREE.Group();
    shelf.position.set(cx, 0, -5.63);
    scene.add(shelf);
    const sw = 4.18,
      sh = 5.13;
    box(sw, sh, 0.2, darkWood, 0, sh / 2, -0.32, shelf);
    for (const sx of [-sw / 2 + 0.08, sw / 2 - 0.08]) {
      box(0.18, sh, 0.88, wood, sx, sh / 2, 0.04, shelf);
      box(0.055, sh, 0.93, woodEdge, sx, sh / 2, 0.08, shelf, false);
    }
    const bases = [0.39, 1.52, 2.65, 3.78];
    for (const y of bases) {
      box(sw - 0.13, 0.135, 0.92, wood, 0, y, 0.06, shelf);
      box(sw - 0.15, 0.034, 0.96, woodEdge, 0, y + 0.067, 0.09, shelf, false);
    }
    box(sw, 0.2, 0.98, wood, 0, 5.03, 0.06, shelf);
    box(sw, 0.07, 1.05, oldGold, 0, 5.14, 0.07, shelf, false);
    // Medalhão frontal da estante.
    const signTex = textureFromCanvas(650, 150, (c, w, h) => {
      c.fillStyle = "#281e1e";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#bd935b";
      c.lineWidth = 6;
      c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = "#f0d4a0";
      c.font = "bold 53px Georgia,serif";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(category.toUpperCase(), w / 2, h / 2 + 3);
    });
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.45),
      new THREE.MeshBasicMaterial({ map: signTex }),
    );
    sign.position.set(0, 4.79, 0.54);
    shelf.add(sign);
    const spineMaterials = palettes[category].map(
      (color, j) =>
        new THREE.MeshStandardMaterial({
          map: makeSpineTexture(category, j + 1, color),
          roughness: 0.83,
        }),
    );
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 12; i++) {
        const n = row * 12 + i;
        const color =
          palettes[category][(i * 3 + row) % palettes[category].length];
        const h = 0.67 + ((n * 7) % 8) * 0.028;
        const group = new THREE.Group();
        group.position.set(-1.62 + i * 0.294, bases[row] + 0.085, 0.135);
        shelf.add(group);
        const bound = box(
          0.235,
          h,
          0.54,
          mat(color, 0.88),
          0,
          h / 2,
          0,
          group,
          false,
        );
        box(0.018, h * 0.94, 0.505, paper, 0.122, h / 2, -0.01, group, false);
        const spine = new THREE.Mesh(
          new THREE.PlaneGeometry(0.224, h * 0.977),
          spineMaterials[(i * 3 + row) % 6],
        );
        spine.position.set(0, h / 2, 0.274);
        group.add(spine);
        const volume = row + 1;
        const data = {
          id: `${category}-${i + 1}-${volume}`,
          title: catalog[category][i] + " · Vol. " + volume,
          baseTitle: catalog[category][i],
          author: "Coleção Aurora — acervo fictício",
          category,
          volume,
          color,
          description: descriptions[category],
          group,
          mesh: bound,
          baseZ: group.position.z,
          index: books.length,
        };
        group.userData.book = data;
        bound.userData.book = data;
        spine.userData.book = data;
        books.push(data);
        bookHitTargets.push(bound);
      }
    // Elemento de destaque das laterais da estante.
    for (const xx of [-2.08, 2.08])
      for (let j = 0; j < 4; j++) {
        ball(0.045, brass, xx, 0.62 + j * 1.14, 0.52, shelf, 10);
      }
  }
  createBookshelf(-4.65, "Literatura");
  createBookshelf(0, "Ciência");
  createBookshelf(4.65, "Fantasia");
}
