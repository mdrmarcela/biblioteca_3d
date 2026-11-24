import * as THREE from "three";

// Constrói o sistema de partículas da biblioteca.
export function buildParticles(ctx) {

  // Extrai a cena, os objetos animados e o gerador
  // de números pseudoaleatórios definido no arquivo de texturas.
  const {
    scene,
    animatedObjects,
    textures: { rand },
  } = ctx;

  // Cria as partículas que representam a poeira do ambiente.
  function createDust() {

    // Define a quantidade total de partículas.
    const count = 175,

      // Armazena as coordenadas X, Y e Z de cada partícula.
      // Cada partícula necessita de três valores.
      positions = new Float32Array(count * 3),

      // Armazena a velocidade individual de cada partícula.
      speeds = new Float32Array(count);

    // Percorre todas as partículas para definir
    // suas posições iniciais e velocidades.
    for (let i = 0; i < count; i++) {

      // Define uma posição pseudoaleatória no eixo X,
      // dentro do intervalo de -6.5 até 6.5.
      positions[3 * i] = (rand() - 0.5) * 13;

      // Define uma posição pseudoaleatória no eixo Y,
      // dentro do intervalo de 0.4 até 5.5.
      positions[3 * i + 1] = 0.4 + rand() * 5.1;

      // Define uma posição pseudoaleatória no eixo Z,
      // dentro do intervalo de -5.5 até 5.
      positions[3 * i + 2] = -5.5 + rand() * 10.5;

      // Define uma velocidade individual para cada partícula,
      // variando de 0.045 até 0.145.
      speeds[i] = 0.045 + rand() * 0.1;
    }

    // Cria uma geometria baseada em buffers,
    // adequada para armazenar dados de vértices.
    const geometry = new THREE.BufferGeometry();

    // Associa as coordenadas das partículas à geometria.
    // O valor 3 indica que cada vértice possui
    // três componentes: X, Y e Z.
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    // Define o material utilizado na renderização das partículas.
    const material = new THREE.PointsMaterial({

      // Cor dourada clara das partículas.
      color: "#f6d4a0",

      // Define o tamanho dos pontos.
      size: 0.036,

      // Habilita a transparência.
      transparent: true,

      // Define a opacidade das partículas em 52%.
      opacity: 0.52,

      // Impede que as partículas escrevam no buffer
      // de profundidade, reduzindo problemas de sobreposição.
      depthWrite: false,

      // Utiliza mistura aditiva de cores,
      // produzindo um efeito visual mais luminoso.
      blending: THREE.AdditiveBlending,

      // Faz com que partículas mais distantes da câmera
      // sejam representadas com tamanho aparente menor.
      sizeAttenuation: true,
    });

    // Combina a geometria e o material em um sistema
    // de pontos tridimensionais.
    const system = new THREE.Points(geometry, material);

    // Adiciona o sistema de partículas à cena.
    scene.add(system);

    // Armazena as referências e os dados das partículas
    // para permitir sua animação e controle em outros módulos.
    animatedObjects.dust = {
      system,
      positions,
      speeds,
      count
    };
  }

  // Executa a criação das partículas.
  createDust();
}