import * as THREE from "three";

// Constrói o sistema de iluminação da biblioteca.
export function buildLights(ctx) {

  // Extrai a cena, os objetos controláveis e as primitivas geométricas.
  const { scene, animatedObjects, primitives } = ctx;
  const { box, cylinder, ball, mat, brass, blackMetal } = primitives;

  function createLights() {

    // =====================================================
    // ILUMINAÇÃO AMBIENTE
    // =====================================================

    // Cria uma iluminação uniforme em toda a cena.
    // Parâmetros: cor e intensidade.
    const ambient = new THREE.AmbientLight("#ffe4c5", 0.82);

    scene.add(ambient);

    // =====================================================
    // ILUMINAÇÃO DIRECIONAL (SOL)
    // =====================================================

    // Simula uma fonte de luz distante, como o Sol,
    // cujos raios luminosos são paralelos.
    const sun = new THREE.DirectionalLight("#fff0d0", 2.5);

    // Define a posição da fonte de luz.
    sun.position.set(-1.5, 8.7, 6.2);

    // Habilita a projeção de sombras pela luz direcional.
    sun.castShadow = true;

    // Define a resolução do mapa de sombras.
    // Uma resolução maior permite sombras mais detalhadas,
    // mas aumenta o custo de processamento.
    sun.shadow.mapSize.set(2048, 2048);

    // Define os limites da câmera ortográfica
    // utilizada para calcular o mapa de sombras.
    sun.shadow.camera.left = -11;
    sun.shadow.camera.right = 11;
    sun.shadow.camera.top = 11;
    sun.shadow.camera.bottom = -11;

    // Define os planos de recorte próximo e distante
    // da câmera responsável pelas sombras.
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 30;

    // Ajusta a comparação de profundidade das sombras,
    // reduzindo possíveis artefatos visuais.
    sun.shadow.bias = -0.00025;

    // Aplica um deslocamento na direção das normais
    // das superfícies durante o cálculo das sombras.
    sun.shadow.normalBias = 0.03;

    scene.add(sun);

    // =====================================================
    // ILUMINAÇÃO PONTUAL
    // =====================================================

    // Cria uma fonte de luz complementar que emite
    // iluminação em todas as direções.
    // Parâmetros: cor, intensidade, distância e decaimento.
    const fill = new THREE.PointLight("#e7ad70", 52, 16, 2);

    // Posiciona a iluminação complementar.
    fill.position.set(-5.7, 4.8, 1.5);
    scene.add(fill);

    // Cria a fonte de luz da luminária da mesa.
    const deskLight = new THREE.PointLight("#ffba6d", 20, 4.2, 2);

    // Posiciona a luz próxima à luminária.
    deskLight.position.set(1.24, 2.08, 1.27);
    scene.add(deskLight);

    // =====================================================
    // MODELAGEM DO LUSTRE DE TETO
    // =====================================================

    // Cria um grupo para reunir todos os componentes do lustre.
    const chandGroup = new THREE.Group();

    // Define a posição do grupo no ambiente.
    chandGroup.position.set(0, 0, -0.9);

    scene.add(chandGroup);

    // Cria a base metálica que conecta o lustre ao teto.
    cylinder(0.2, 0.24, 0.12, brass, 0, 6.29, 0, chandGroup);

    // Percorre três posições para construir
    // as três luminárias que compõem o lustre.
    for (const [i, x] of [-1, 0, 1].entries()) {

      // Alterna a altura das luminárias.
      // A luminária central fica ligeiramente mais baixa.
      const y = 4.88 - (i % 2) * 0.27;

      // Cria uma curva tridimensional Catmull-Rom
      // para representar o caminho do cabo do lustre.
      const wire = new THREE.CatmullRomCurve3([

        // Ponto inicial: próximo ao teto.
        new THREE.Vector3(0, 6.24, 0),

        // Ponto intermediário: define a curvatura do cabo.
        new THREE.Vector3(x * 0.65, 5.58, 0.03),

        // Ponto final: próximo à cúpula da luminária.
        new THREE.Vector3(x * 1.33, y + 0.14, 0),
      ]);

      // Cria uma geometria tubular ao longo da curva.
      // Parâmetros:
      // wire: trajetória do tubo.
      // 20: segmentos ao longo da trajetória.
      // 0.012: raio do tubo.
      // 6: segmentos radiais.
      // false: trajetória aberta.
      chandGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(wire, 20, 0.012, 6, false),
          blackMetal,
        ),
      );

      // Cria a cúpula da luminária utilizando
      // uma geometria cilíndrica com raios diferentes.
      const cap = new THREE.Mesh(

        // Raio superior: 0.16.
        // Raio inferior: 0.43.
        // Altura: 0.38.
        // Segmentos radiais: 20.
        // Segmentos verticais: 1.
        // true: geometria sem tampas nas extremidades.
        new THREE.CylinderGeometry(0.16, 0.43, 0.38, 20, 1, true),

        // Material metálico da cúpula.
        mat("#bb925f", 0.49, 0.35),
      );

      // Posiciona a cúpula abaixo do cabo.
      cap.position.set(x * 1.33, y, 0);
      chandGroup.add(cap);

      // Cria uma esfera para representar a lâmpada.
      // MeshBasicMaterial mantém sua aparência de cor
      // independentemente das luzes que incidem sobre ela.
      const warm = ball(
        0.09,
        new THREE.MeshBasicMaterial({ color: "#ffdfa0" }),
        x * 1.33,
        y - 0.2,
        0,
        chandGroup,
      );

      // Cria uma fonte de iluminação pontual para cada lâmpada.
      // A lâmpada central possui intensidade maior.
      const smallLight = new THREE.PointLight(
        "#ffc882",
        i === 1 ? 10 : 6,
        4.5,
        2,
      );

      // Posiciona a fonte de luz nas mesmas coordenadas
      // locais da esfera que representa a lâmpada.
      smallLight.position.copy(warm.position);

      // Adiciona a fonte de luz ao grupo do lustre.
      chandGroup.add(smallLight);
    }

    // Armazena referências das principais fontes de iluminação
    // para permitir alterações dinâmicas em outros módulos.
    animatedObjects.ambient = ambient;
    animatedObjects.sun = sun;
    animatedObjects.fill = fill;
    animatedObjects.deskLight = deskLight;
  }

  // Executa a construção do sistema de iluminação.
  createLights();
}