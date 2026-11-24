import * as THREE from "three";

// Responsável pela construção da estrutura física
// e dos elementos decorativos da biblioteca.
export function buildRoom(ctx) {

  // Recupera os componentes necessários para construir a sala.
  const { scene, primitives, textures } = ctx;

  // Recupera as funções de modelagem e os materiais predefinidos.
  const { box, mat, darkWood, woodEdge, wood, brass, oldGold } =
    primitives;

  // Recupera as texturas e as funções auxiliares de desenho.
  const { textureFromCanvas, rand, floorMaterial, wallMaterial, rugTexture } =
    textures;

  function createRoom() {

    // =====================================================
    // ESTRUTURA FÍSICA DA BIBLIOTECA
    // =====================================================

    // Cria o piso com 16 unidades de largura,
    // 0.23 de altura e 13 de profundidade.
    box(16, 0.23, 13, floorMaterial, 0, -0.16, 0, scene, true);

    // Cria a parede do fundo.
    box(16, 6.7, 0.23, wallMaterial, 0, 3.2, -6.35, scene, false);

    // Cria a parede lateral esquerda.
    box(0.23, 6.7, 13, wallMaterial, -7.9, 3.2, 0, scene, false);

    // Cria a parede lateral direita.
    box(0.23, 6.7, 13, wallMaterial, 7.9, 3.2, 0, scene, false);

    // Cria o teto da biblioteca.
    box(16, 0.18, 13, mat("#342326"), 0, 6.52, 0, scene, false);

    // =====================================================
    // RODAPÉS E RODATETOS
    // =====================================================

    // Repete a construção dos acabamentos em duas alturas:
    // próximo ao piso e próximo ao teto.
    for (const y of [0.17, 6.22]) {

      // Acabamento da parede do fundo.
      box(16, 0.18, 0.13, woodEdge, 0, y, -6.17, scene, false);

      // Acabamentos das duas paredes laterais.
      for (const x of [-7.73, 7.73])
        box(0.13, 0.18, 13, woodEdge, x, y, 0, scene, false);
    }

    // =====================================================
    // TAPETE
    // =====================================================

    // Cria uma superfície plana com a textura procedural
    // do tapete desenvolvida no arquivo de texturas.
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(5.8, 4.45),
      new THREE.MeshStandardMaterial({
        map: rugTexture,
        roughness: 1
      }),
    );

    // Rotaciona o plano em -90 graus no eixo X,
    // fazendo com que fique paralelo ao piso.
    rug.rotation.x = -Math.PI / 2;

    // Posiciona o tapete ligeiramente acima do nível Y = 0.
    rug.position.set(0, 0.016, 1.45);

    // Permite que o tapete receba sombras de outros objetos.
    rug.receiveShadow = true;

    scene.add(rug);

    // =====================================================
    // PILARES DECORATIVOS
    // =====================================================

    // Cria dois pilares simétricos nos cantos da parede do fundo.
    for (const x of [-7.1, 7.1]) {

      // Estrutura vertical de madeira.
      box(0.34, 6.1, 0.33, darkWood, x, 3, -6.07);

      // Acabamento dourado na parte superior do pilar.
      box(0.55, 0.16, 0.43, oldGold, x, 5.96, -6.04);
    }

    // =====================================================
    // TEXTURA PROCEDURAL DO CÉU NOTURNO
    // =====================================================

    // Cria uma textura de 512 x 512 pixels
    // para representar a paisagem noturna da janela.
    const starTex = textureFromCanvas(512, 512, (c, w, h) => {

      // Cria um gradiente vertical de cores,
      // simulando a variação de tonalidade do céu.
      const g = c.createLinearGradient(0, 0, 0, h);

      g.addColorStop(0, "#18243c");
      g.addColorStop(1, "#60798a");

      // Preenche toda a textura com o gradiente.
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);

      // Cria 95 estrelas distribuídas pseudoaleatoriamente.
      for (let i = 0; i < 95; i++) {

        // Define as coordenadas de cada estrela na textura.
        const x = rand() * w,
          y = rand() * h;

        // Varia pseudoaleatoriamente a opacidade das estrelas.
        c.fillStyle = `rgba(245,243,228,${0.28 + rand() * 0.6})`;

        c.beginPath();

        // Desenha uma estrela em formato circular,
        // com raio pseudoaleatório.
        c.arc(x, y, 0.4 + rand() * 1.1, 0, Math.PI * 2);

        c.fill();
      }

      // Desenha a Lua utilizando uma circunferência preenchida.
      c.fillStyle = "rgba(255,229,168,.95)";
      c.beginPath();
      c.arc(370, 95, 42, 0, Math.PI * 2);
      c.fill();
    });

    // =====================================================
    // MODELAGEM HIERÁRQUICA DA JANELA
    // =====================================================

    // Cria um grupo que reúne todos os componentes da janela.
    const window = new THREE.Group();

    // Posiciona a janela junto à parede lateral esquerda.
    window.position.set(-7.63, 3.66, -0.6);

    // Rotaciona o grupo em 90 graus no eixo Y,
    // orientando a janela para o interior da biblioteca.
    window.rotation.y = Math.PI / 2;

    scene.add(window);

    // Cria a estrutura de madeira que serve de base para a janela.
    box(3.15, 3.4, 0.09, darkWood, 0, 0, 0, window);

    // Cria um plano para apresentar a textura do céu.
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),

      // Utiliza um material independente da iluminação da cena.
      // DoubleSide permite visualizar os dois lados do plano.
      new THREE.MeshBasicMaterial({
        map: starTex,
        side: THREE.DoubleSide
      }),
    );

    // Posiciona o céu à frente da base de madeira.
    sky.position.z = 0.07;

    window.add(sky);

    // =====================================================
    // VIDRAÇA TRANSLÚCIDA
    // =====================================================

    // Cria a camada de vidro posicionada à frente do céu.
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),

      // Utiliza um material físico com propriedades
      // adicionais para simular uma superfície de vidro.
      new THREE.MeshPhysicalMaterial({

        // Coloração azulada da vidraça.
        color: "#7fb8d4",

        // Habilita a transparência do material.
        transparent: true,

        // Define a opacidade do vidro em 34%.
        opacity: 0.34,

        // Baixa rugosidade para representar uma superfície lisa.
        roughness: 0.05,

        // Define o vidro como um material não metálico.
        metalness: 0,

        // Adiciona uma camada superficial de brilho.
        clearcoat: 1,

        // Define a rugosidade da camada de revestimento.
        clearcoatRoughness: 0.08,

        // Permite a visualização dos dois lados do plano.
        side: THREE.DoubleSide,

        // Impede que o vidro escreva no buffer de profundidade,
        // favorecendo a composição das camadas transparentes.
        depthWrite: false,
      }),
    );

    // Posiciona o vidro à frente do plano que representa o céu.
    glass.position.z = 0.115;

    // Define a ordem relativa de renderização da camada.
    glass.renderOrder = 1;

    window.add(glass);

    // =====================================================
    // SIMULAÇÃO DOS REFLEXOS DO VIDRO
    // =====================================================

    // Cria outro plano para representar reflexos diagonais.
    const reflection = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 3.08),

      new THREE.MeshBasicMaterial({

        // Gera uma textura procedural com transparência.
        map: textureFromCanvas(256, 256, (c, w, h) => {

          // Limpa o canvas, deixando o fundo transparente.
          c.clearRect(0, 0, w, h);

          // Desloca a origem para o centro da textura.
          c.translate(w / 2, h / 2);

          // Rotaciona o sistema de coordenadas em -0.62 radiano
          // para produzir reflexos diagonais.
          c.rotate(-0.62);

          // Define três faixas de reflexo com diferentes
          // posições, larguras e níveis de opacidade.
          for (const [x, width, alpha] of [
            [-70, 46, 0.5],
            [10, 18, 0.34],
            [62, 70, 0.22],
          ]) {

            // Cria um gradiente horizontal para cada reflexo.
            const g = c.createLinearGradient(x, 0, x + width, 0);

            // As extremidades são totalmente transparentes.
            // O centro possui maior opacidade.
            g.addColorStop(0, "rgba(255,255,255,0)");
            g.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
            g.addColorStop(1, "rgba(255,255,255,0)");

            c.fillStyle = g;

            // Desenha a faixa luminosa.
            c.fillRect(x, -h, width, h * 2);
          }
        }),

        // Permite utilizar o canal alfa da textura.
        transparent: true,

        // Não registra a profundidade dessa camada transparente.
        depthWrite: false,
      }),
    );

    // Posiciona os reflexos ligeiramente à frente do vidro.
    reflection.position.z = 0.118;

    // Faz com que os reflexos sejam renderizados
    // depois da camada de vidro.
    reflection.renderOrder = 2;

    window.add(reflection);

    // =====================================================
    // TEXTURA PROCEDURAL DO CÉU DIURNO
    // =====================================================

    // Armazena as referências utilizadas pelo controlador
    // responsável pela alternância entre dia e noite.
    ctx.animatedObjects.sky = sky;
    ctx.animatedObjects.nightSky = starTex;

    ctx.animatedObjects.daySky = textureFromCanvas(512, 512, (c, w, h) => {

      // Cria um gradiente vertical para representar o céu diurno.
      const g = c.createLinearGradient(0, 0, 0, h);

      g.addColorStop(0, "#709fae");
      g.addColorStop(1, "#efd7a6");

      c.fillStyle = g;
      c.fillRect(0, 0, w, h);

      // Desenha o Sol utilizando um círculo preenchido.
      c.fillStyle = "#fff2c9";
      c.beginPath();
      c.arc(370, 95, 42, 0, Math.PI * 2);
      c.fill();

      // Cria quatro nuvens utilizando elipses semitransparentes.
      for (let i = 0; i < 4; i++) {

        c.fillStyle = "rgba(255,255,255,.22)";
        c.beginPath();

        // Varia as posições horizontais e verticais das nuvens.
        // Os raios diferentes criam uma forma alongada.
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

    // =====================================================
    // MOLDURAS E DIVISÕES DA JANELA
    // =====================================================

    // Cria a divisão vertical metálica da janela.
    box(0.12, 3.28, 0.16, brass, 0, 0, 0.14, window);

    // Cria a divisão horizontal metálica da janela.
    box(2.93, 0.12, 0.16, brass, 0, 0, 0.14, window);

    // Cria as duas laterais da moldura de madeira.
    for (const x of [-1.47, 1.47])
      box(0.16, 3.54, 0.2, wood, x, 0, 0.17, window);

    // Cria as extremidades superior e inferior da moldura.
    for (const y of [-1.65, 1.65])
      box(3.12, 0.17, 0.2, wood, 0, y, 0.17, window);

    // =====================================================
    // QUADRO DECORATIVO
    // =====================================================

    // Cria um grupo para reunir a moldura e a pintura.
    const art = new THREE.Group();

    // Posiciona o quadro na parede lateral direita.
    art.position.set(7.65, 3, -1.05);

    // Rotaciona o quadro em -90 graus no eixo Y.
    art.rotation.y = -Math.PI / 2;

    scene.add(art);

    // Cria a base metálica que representa a moldura.
    box(2.35, 1.8, 0.09, brass, 0, 0, 0, art);

    // Cria uma pintura procedural utilizando Canvas 2D.
    const artTex = textureFromCanvas(400, 310, (c, w, h) => {

      // Define a cor de fundo da paisagem.
      c.fillStyle = "#354a46";
      c.fillRect(0, 0, w, h);

      // Desenha o astro presente na paisagem.
      c.fillStyle = "#c8ad76";
      c.beginPath();
      c.arc(290, 78, 43, 0, Math.PI * 2);
      c.fill();

      // Desenha a primeira camada de montanhas
      // utilizando um polígono preenchido.
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

      // Desenha uma segunda camada de montanhas,
      // utilizando uma tonalidade mais escura.
      c.fillStyle = "#182a28";
      c.beginPath();
      c.moveTo(0, 310);
      c.lineTo(0, 258);
      c.lineTo(180, 132);
      c.lineTo(365, 310);
      c.fill();
    });

    // Aplica a textura da pintura sobre uma superfície plana.
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(2.12, 1.6),
      new THREE.MeshBasicMaterial({ map: artTex }),
    );

    // Posiciona a pintura à frente da moldura.
    picture.position.z = 0.055;

    art.add(picture);

    // =====================================================
    // PLACA DECORATIVA
    // =====================================================

    // Cria uma placa contendo uma frase no topo da parede.
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

  // =====================================================
  // FUNÇÃO AUXILIAR PARA CRIAÇÃO DE PLACAS COM TEXTO
  // =====================================================

  // text: conteúdo da placa.
  // w e h: dimensões do plano tridimensional.
  // x, y e z: posição na cena.
  // bg: cor de fundo.
  // color: cor do texto.
  function label(text, w, h, x, y, z, bg = "#332421", color = "#eaca93") {

    // Cria uma textura bidimensional contendo o texto da placa.
    const tex = textureFromCanvas(900, 125, (c, cw, ch) => {

      // Preenche o fundo da placa.
      c.fillStyle = bg;
      c.fillRect(0, 0, cw, ch);

      // Desenha uma borda decorativa dourada.
      c.strokeStyle = "#b08a50";
      c.lineWidth = 7;
      c.strokeRect(8, 8, cw - 16, ch - 16);

      // Configura a cor, o alinhamento e a fonte do texto.
      c.fillStyle = color;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.font = "bold 53px Georgia,serif";

      // Desenha o texto centralizado na textura,
      // respeitando uma largura máxima.
      c.fillText(text, cw / 2, ch / 2 + 1, cw - 55);
    });

    // Aplica a textura da placa em uma geometria plana.
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide
      }),
    );

    // Define a posição da placa no ambiente tridimensional.
    mesh.position.set(x, y, z);

    scene.add(mesh);

    // Retorna a placa criada para possíveis manipulações.
    return mesh;
  }

  // Executa a construção da sala.
  createRoom();
}