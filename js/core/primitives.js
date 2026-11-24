import * as THREE from "three";

// Centraliza a criação de primitivas geométricas
// e materiais utilizados no ambiente tridimensional.
export function createPrimitives(scene) {

  // Função auxiliar para criar materiais com propriedades
  // físicas de iluminação e reflexão.
  // color: cor do material.
  // roughness: rugosidade da superfície.
  // metalness: característica metálica da superfície.
  const mat = (color, roughness = 0.82, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  // Materiais utilizados nas estruturas de madeira.
  const wood = mat("#603d2b", 0.69),
    darkWood = mat("#281a18", 0.74),
    woodEdge = mat("#8e5d3b", 0.64);

  // Materiais metálicos utilizados em elementos decorativos.
  const brass = mat("#d0a25f", 0.27, 0.72),
    oldGold = mat("#a77a43", 0.43, 0.5);

  // Materiais utilizados em livros, tecidos e decorações.
  const paper = mat("#f0dcbc", 0.91),
    deepGreen = mat("#1e473a", 0.82),
    fabric = mat("#602b38", 0.96);

  // Materiais com características metálicas
  // e superfícies de baixa rugosidade.
  const blackMetal = mat("#28292d", 0.37, 0.7),
    glass = mat("#6a91a6", 0.12, 0.15);

  // Cria uma primitiva geométrica em formato de caixa.
  // w: largura.
  // h: altura.
  // d: profundidade.
  // material: aparência da superfície.
  // x, y, z: coordenadas de posicionamento.
  // parent: objeto pai, sendo a cena o valor padrão.
  // shadows: habilita ou desabilita as sombras.
  function box(w, h, d, material, x, y, z, parent = scene, shadows = true) {

    // Combina a geometria da caixa com seu material,
    // criando uma malha tridimensional (Mesh).
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    // Define a posição da malha nos três eixos.
    mesh.position.set(x, y, z);

    // Permite que o objeto projete sombras.
    mesh.castShadow = shadows;

    // Permite que o objeto receba sombras de outros objetos.
    mesh.receiveShadow = shadows;

    // Adiciona a malha à cena ou ao grupo informado.
    parent.add(mesh);

    // Retorna o objeto criado para permitir futuras manipulações.
    return mesh;
  }

  // Cria uma primitiva geométrica cilíndrica.
  function cylinder(
    rt,             // Raio superior
    rb,             // Raio inferior
    height,         // Altura
    material,       // Material da superfície
    x,
    y,
    z,
    parent = scene, // Objeto pai
    segments = 20,  // Número de segmentos radiais
  ) {

    // Cria a geometria cilíndrica e associa seu material.
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, height, segments),
      material,
    );

    // Posiciona o cilindro no espaço tridimensional.
    mesh.position.set(x, y, z);

    // Habilita a projeção e o recebimento de sombras.
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Adiciona o objeto à hierarquia da cena.
    parent.add(mesh);

    return mesh;
  }

  // Cria uma primitiva geométrica esférica.
  function ball(radius, material, x, y, z, parent = scene, segments = 16) {

    // Cria uma esfera utilizando:
    // radius: raio da esfera.
    // segments: número de segmentos horizontais.
    // 12: número de segmentos verticais.
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, 12),
      material,
    );

    // Define a posição da esfera.
    mesh.position.set(x, y, z);

    // Permite que a esfera projete sombras.
    mesh.castShadow = true;

    // Adiciona a esfera à cena ou ao grupo informado.
    parent.add(mesh);

    return mesh;
  }

  // Disponibiliza as funções de criação de objetos
  // e os materiais para os demais módulos da aplicação.
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