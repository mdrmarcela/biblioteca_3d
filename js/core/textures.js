import * as THREE from "three";

// Centraliza a criação das texturas utilizadas na biblioteca.
export function createTextures(renderer) {

  // Cria uma textura a partir de um desenho realizado em Canvas 2D.
  // w: largura da textura em pixels.
  // h: altura da textura em pixels.
  // paint: função responsável por desenhar a textura.
  // rx e ry: quantidade de repetições da textura.
  function textureFromCanvas(w, h, paint, rx = 1, ry = 1) {

    // Cria um elemento canvas dinamicamente.
    const canvas = document.createElement("canvas");

    // Define a resolução da imagem.
    canvas.width = w;
    canvas.height = h;

    // Obtém o contexto de desenho bidimensional.
    const ctx = canvas.getContext("2d");

    // Executa a função responsável pelo desenho da textura.
    paint(ctx, w, h);

    // Converte o canvas em uma textura utilizável pelo Three.js.
    const tex = new THREE.CanvasTexture(canvas);

    // Define o espaço de cores da textura.
    tex.colorSpace = THREE.SRGBColorSpace;

    // Permite que a textura seja repetida nos dois eixos UV.
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;

    // Define quantas vezes a textura será repetida.
    tex.repeat.set(rx, ry);

    // Aplica filtragem anisotrópica para melhorar a nitidez
    // das texturas observadas em ângulos inclinados.
    // Respeita o limite suportado pelo dispositivo.
    tex.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy()
    );

    return tex;
  }

  // Gerador de números pseudoaleatórios determinístico (PRNG).
  // Utilizando a mesma semente, produz a mesma sequência de valores.
  // Isso garante a reprodução dos padrões das texturas.
  function randomGenerator(seed) {
    return function () {

      // Converte a semente em um inteiro de 32 bits.
      seed |= 0;

      // Atualiza o estado interno do gerador.
      seed = (seed + 0x6d2b79f5) | 0;

      // Utiliza multiplicações inteiras e operações
      // bit a bit para misturar os valores.
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

      // Normaliza o resultado para um intervalo entre 0 e 1,
      // sem incluir o valor 1.
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Inicializa o gerador pseudoaleatório com a semente 79.
  const rand = randomGenerator(79);

  // =====================================================
  // TEXTURA PROCEDURAL DO PISO DE MADEIRA
  // =====================================================

  // Cria uma textura com resolução de 512 x 512 pixels.
  const floorTexture = textureFromCanvas(
    512,
    512,
    (c, w, h) => {

      // Preenche o fundo com uma tonalidade de madeira.
      c.fillStyle = "#876143";
      c.fillRect(0, 0, w, h);

      // Divide a textura em oito tábuas horizontais.
      for (let row = 0; row < 8; row++) {

        // Calcula a posição vertical de cada tábua.
        const y = row * 64;

        // Alterna a tonalidade das tábuas.
        c.fillStyle = row % 2 ? "#8c6748" : "#996d4e";
        c.fillRect(0, y, w, 64);

        // Desenha as bordas e divisões entre as tábuas.
        c.strokeStyle = "rgba(49,24,13,.58)";
        c.lineWidth = 3;
        c.strokeRect(0, y, w, 64);

        // Cria 27 veios de madeira em cada tábua.
        for (let j = 0; j < 27; j++) {

          // Varia a transparência das linhas pseudoaleatoriamente.
          c.strokeStyle = `rgba(50,29,19,${0.025 + rand() * 0.13})`;

          // Inicia um novo caminho de desenho.
          c.beginPath();

          // Define uma posição vertical pseudoaleatória.
          const gy = y + rand() * 64;

          // Define o ponto inicial da curva.
          c.moveTo(0, gy);

          // Utiliza uma curva de Bézier cúbica
          // para representar os veios naturais da madeira.
          c.bezierCurveTo(200, gy - 7, 350, gy + 10, 512, gy);

          // Desenha a curva.
          c.stroke();
        }
      }
    },

    // Repetição da textura nos eixos UV.
    3.1,
    3,
  );

  // =====================================================
  // TEXTURA PROCEDURAL DO PAPEL DE PAREDE
  // =====================================================

  // Cria uma textura decorativa de 256 x 256 pixels.
  const wallpaperTexture = textureFromCanvas(
    256,
    256,
    (c, w, h) => {

      // Define a cor de fundo do papel de parede.
      c.fillStyle = "#635455";
      c.fillRect(0, 0, w, h);

      // Percorre os eixos X e Y do canvas,
      // repetindo o padrão decorativo a cada 32 pixels.
      for (let x = 12; x < w; x += 32)
        for (let y = 12; y < h; y += 32) {

          // Configura a cor e a espessura do contorno.
          c.strokeStyle = "rgba(230,192,144,.14)";
          c.lineWidth = 1;

          c.beginPath();

          // Define o ponto inicial do desenho.
          c.moveTo(x, y - 9);

          // Utiliza duas curvas de Bézier quadráticas
          // para formar um elemento decorativo fechado.
          c.quadraticCurveTo(x + 9, y, x, y + 9);
          c.quadraticCurveTo(x - 9, y, x, y - 9);

          c.stroke();

          // Adiciona um pequeno detalhe no centro do padrão.
          c.fillStyle = "rgba(247,207,146,.12)";
          c.fillRect(x - 1, y - 1, 2, 2);
        }
    },

    // Repete a textura sete vezes em U e três vezes em V.
    7,
    3,
  );

  // =====================================================
  // TEXTURA PROCEDURAL DO TAPETE
  // =====================================================

  // Cria uma textura de 768 x 512 pixels.
  const rugTexture = textureFromCanvas(768, 512, (c, w, h) => {

    // Define a cor principal do tapete.
    c.fillStyle = "#6d303b";
    c.fillRect(0, 0, w, h);

    // Desenha a primeira borda decorativa.
    c.strokeStyle = "#cc9567";
    c.lineWidth = 18;
    c.strokeRect(24, 24, w - 48, h - 48);

    // Desenha uma segunda borda interna.
    c.strokeStyle = "#c7a77e";
    c.lineWidth = 4;
    c.strokeRect(47, 47, w - 94, h - 94);

    // Desenha uma terceira borda decorativa.
    c.strokeStyle = "rgba(240,188,135,.55)";
    c.lineWidth = 3;
    c.strokeRect(68, 68, w - 136, h - 136);

    // Repete elementos decorativos na superfície do tapete.
    for (let x = 112; x < 700; x += 72)
      for (let y = 112; y < 440; y += 72) {

        // Salva o estado atual do contexto de desenho.
        c.save();

        // TRANSLAÇÃO:
        // Desloca a origem do sistema de coordenadas.
        c.translate(x, y);

        // ROTAÇÃO:
        // Rotaciona o sistema de coordenadas em 45 graus.
        c.rotate(Math.PI / 4);

        // Configura a aparência do elemento decorativo.
        c.strokeStyle = "rgba(220,166,117,.28)";
        c.lineWidth = 2;

        // Desenha um quadrado rotacionado,
        // produzindo um padrão em formato de losango.
        c.strokeRect(-17, -17, 34, 34);

        // Restaura o sistema de coordenadas e demais
        // configurações para evitar transformações acumuladas.
        c.restore();
      }

    // Cria o primeiro círculo decorativo central.
    c.fillStyle = "#b98863";
    c.beginPath();

    // Define uma elipse com raios iguais,
    // formando um círculo de raio 92 pixels.
    c.ellipse(w / 2, h / 2, 92, 92, 0, 0, Math.PI * 2);
    c.fill();

    // Desenha o contorno do círculo.
    c.strokeStyle = "#743444";
    c.lineWidth = 13;
    c.stroke();

    // Cria um segundo círculo no centro do tapete.
    c.fillStyle = "#723342";
    c.beginPath();
    c.ellipse(w / 2, h / 2, 65, 65, 0, 0, Math.PI * 2);
    c.fill();
  });

  // =====================================================
  // MATERIAL DO PISO E CARREGAMENTO DE IMAGEM EXTERNA
  // =====================================================

  // Cria o material do piso utilizando inicialmente
  // a textura procedural como mapa de cores.
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.92,
  });

  // Carrega assincronamente uma imagem externa para o piso.
  new THREE.TextureLoader().load(
    "assets/piso.jpg",

    // Executado quando a imagem é carregada com sucesso.
    (image) => {

      // Define o espaço de cores da textura.
      image.colorSpace = THREE.SRGBColorSpace;

      // Permite a repetição da imagem nos eixos UV.
      image.wrapS = image.wrapT = THREE.RepeatWrapping;

      // Calcula a repetição da textura considerando
      // as dimensões do piso e de cada ladrilho da imagem.
      // U: 16 / 1.6 = 10 repetições.
      // V: 13 / 1.6 = 8.125 repetições.
      image.repeat.set(16 / 1.6, 13 / 1.6);

      // Aplica filtragem anisotrópica à imagem.
      image.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy()
      );

      // Substitui a textura procedural pela imagem carregada.
      floorMaterial.map = image;

      // Sinaliza que o material precisa ser atualizado.
      floorMaterial.needsUpdate = true;
    },

    // Não utiliza uma função de acompanhamento do carregamento.
    undefined,

    // Caso a imagem não seja carregada, mantém a textura procedural.
    () => console.warn(
      "assets/piso.jpg não encontrado; usando piso procedural."
    ),
  );

  // =====================================================
  // MATERIAL DAS PAREDES
  // =====================================================

  // Cria o material das paredes utilizando
  // a textura procedural do papel de parede.
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperTexture,
    roughness: 0.97,
  });

  // Disponibiliza os materiais, as texturas e as funções
  // auxiliares para os demais módulos da aplicação.
  return {
    textureFromCanvas,
    rand,
    floorMaterial,
    wallMaterial,
    rugTexture
  };
}