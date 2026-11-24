import * as THREE from "three";

// Importa os títulos, as descrições e as paletas
// de cores de cada categoria de livros.
import { catalog, descriptions, palettes } from "../data/catalog.js";

// Responsável pela construção das estantes e dos livros.
export function buildShelves(ctx) {

  // Recupera os componentes necessários do contexto da aplicação.
  const { scene, books, bookHitTargets, textures, primitives } = ctx;

  // Recupera a função de criação de texturas procedurais.
  const { textureFromCanvas } = textures;

  // Recupera as primitivas geométricas e os materiais.
  const { box, ball, mat, darkWood, wood, woodEdge, oldGold, brass, paper } =
    primitives;

  // =====================================================
  // CRIAÇÃO DAS TEXTURAS DAS LOMBADAS
  // =====================================================

  // Cria uma textura para a lombada de um livro.
  // category: categoria do livro.
  // number: número utilizado na identificação visual.
  // color: cor principal da lombada.
  function makeSpineTexture(category, number, color) {

    // Cria uma textura de 128 x 480 pixels.
    return textureFromCanvas(128, 480, (c, w, h) => {

      // Preenche o fundo com a cor do livro.
      c.fillStyle = color;
      c.fillRect(0, 0, w, h);

      // Cria uma faixa escura na lateral,
      // simulando um detalhe de profundidade.
      c.fillStyle = "rgba(0,0,0,.18)";
      c.fillRect(0, 0, 13, h);

      // Desenha uma borda decorativa dourada.
      c.strokeStyle = "#e7be79";
      c.lineWidth = 4;
      c.strokeRect(15, 16, w - 30, h - 32);

      // Desenha duas faixas horizontais decorativas.
      c.fillStyle = "#e7c48d";
      c.fillRect(23, 65, w - 46, 5);
      c.fillRect(23, h - 70, w - 46, 5);

      // Configura a aparência e o alinhamento do texto.
      c.textAlign = "center";
      c.fillStyle = "#f6ddb2";
      c.font = "bold 19px Georgia,serif";

      // Insere uma abreviação conforme a categoria do livro.
      c.fillText(
        category === "Literatura"
          ? "LIT"
          : category === "Ciência"
            ? "SCI"
            : "FAN",
        w / 2,
        44,
      );

      // Salva o estado atual do contexto Canvas 2D.
      c.save();

      // Desloca a origem para o centro da textura.
      c.translate(w / 2, h / 2);

      // Rotaciona o sistema de coordenadas em -90 graus
      // para escrever o nome verticalmente na lombada.
      c.rotate(-Math.PI / 2);

      c.font = "bold 28px Georgia,serif";
      c.fillText("A U R O R A", 0, 10, 235);

      // Restaura o sistema de coordenadas original.
      c.restore();

      // Insere a identificação numérica da lombada.
      // padStart garante que o número possua pelo menos três dígitos.
      c.font = "20px Georgia,serif";
      c.fillText(String(number).padStart(3, "0"), w / 2, h - 35);
    });
  }

  // =====================================================
  // CONSTRUÇÃO DA ESTANTE
  // =====================================================

  // Cria uma estante em determinada posição horizontal
  // e associa seus livros a uma categoria.
  function createBookshelf(cx, category) {

    // Cria um grupo para reunir todos os componentes da estante.
    const shelf = new THREE.Group();

    // Posiciona a estante próxima à parede do fundo.
    shelf.position.set(cx, 0, -5.63);

    scene.add(shelf);

    // Define a largura e a altura da estante.
    const sw = 4.18,
      sh = 5.13;

    // Cria a estrutura traseira da estante.
    box(sw, sh, 0.2, darkWood, 0, sh / 2, -0.32, shelf);

    // Cria as duas laterais de maneira simétrica.
    for (const sx of [-sw / 2 + 0.08, sw / 2 - 0.08]) {

      // Estrutura lateral de madeira.
      box(0.18, sh, 0.88, wood, sx, sh / 2, 0.04, shelf);

      // Acabamento decorativo das laterais.
      box(0.055, sh, 0.93, woodEdge, sx, sh / 2, 0.08, shelf, false);
    }

    // Define as alturas das quatro prateleiras.
    const bases = [0.39, 1.52, 2.65, 3.78];

    // Cria as prateleiras e seus respectivos acabamentos.
    for (const y of bases) {

      // Estrutura principal da prateleira.
      box(sw - 0.13, 0.135, 0.92, wood, 0, y, 0.06, shelf);

      // Acabamento frontal da prateleira.
      box(sw - 0.15, 0.034, 0.96, woodEdge, 0, y + 0.067, 0.09, shelf, false);
    }

    // Cria a estrutura superior da estante.
    box(sw, 0.2, 0.98, wood, 0, 5.03, 0.06, shelf);

    // Adiciona um acabamento dourado no topo.
    box(sw, 0.07, 1.05, oldGold, 0, 5.14, 0.07, shelf, false);

    // =====================================================
    // PLACA DE IDENTIFICAÇÃO DA ESTANTE
    // =====================================================

    // Gera uma textura contendo o nome da categoria.
    const signTex = textureFromCanvas(650, 150, (c, w, h) => {

      // Define o fundo da placa.
      c.fillStyle = "#281e1e";
      c.fillRect(0, 0, w, h);

      // Desenha a borda decorativa.
      c.strokeStyle = "#bd935b";
      c.lineWidth = 6;
      c.strokeRect(8, 8, w - 16, h - 16);

      // Configura o texto centralizado.
      c.fillStyle = "#f0d4a0";
      c.font = "bold 53px Georgia,serif";
      c.textAlign = "center";
      c.textBaseline = "middle";

      // Escreve o nome da categoria em letras maiúsculas.
      c.fillText(category.toUpperCase(), w / 2, h / 2 + 3);
    });

    // Aplica a textura da placa em uma geometria plana.
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.45),
      new THREE.MeshBasicMaterial({ map: signTex }),
    );

    // Posiciona a placa na parte superior frontal da estante.
    sign.position.set(0, 4.79, 0.54);

    shelf.add(sign);

    // =====================================================
    // MATERIAIS DAS LOMBADAS
    // =====================================================

    // Percorre a paleta de cores da categoria e cria
    // um material com textura para cada cor.
    // Esses materiais serão reutilizados por diferentes livros.
    const spineMaterials = palettes[category].map(
      (color, j) =>
        new THREE.MeshStandardMaterial({
          map: makeSpineTexture(category, j + 1, color),
          roughness: 0.83,
        }),
    );

    // =====================================================
    // GERAÇÃO PROCEDURAL DOS LIVROS
    // =====================================================

    // Percorre as quatro prateleiras da estante.
    for (let row = 0; row < 4; row++)

      // Cria doze livros em cada prateleira.
      for (let i = 0; i < 12; i++) {

        // Calcula um índice individual dentro da estante.
        const n = row * 12 + i;

        // Seleciona uma cor da paleta utilizando
        // o operador módulo para repetir o padrão.
        const color =
          palettes[category][(i * 3 + row) % palettes[category].length];

        // Varia a altura dos livros matematicamente,
        // evitando que todos possuam exatamente o mesmo tamanho.
        const h = 0.67 + ((n * 7) % 8) * 0.028;

        // Cria um grupo para reunir todos os componentes do livro.
        const group = new THREE.Group();

        // Posiciona o livro na prateleira correspondente.
        // X: espaçamento horizontal entre os livros.
        // Y: altura da prateleira mais um deslocamento.
        // Z: posição em profundidade relativa à estante.
        group.position.set(-1.62 + i * 0.294, bases[row] + 0.085, 0.135);

        // Adiciona o grupo do livro ao grupo da estante.
        shelf.add(group);

        // Cria o corpo principal do livro utilizando uma caixa.
        const bound = box(
          0.235,           // Largura
          h,               // Altura variável
          0.54,            // Profundidade
          mat(color, 0.88),
          0,
          h / 2,           // Posiciona a base do corpo em Y = 0
          0,
          group,
          false,           // Desabilita sombras nessa malha
        );

        // Cria uma caixa fina para representar
        // as páginas visíveis na lateral do livro.
        box(0.018, h * 0.94, 0.505, paper, 0.122, h / 2, -0.01, group, false);

        // Cria um plano para representar a lombada decorativa.
        const spine = new THREE.Mesh(

          // Define as dimensões da lombada conforme a altura do livro.
          new THREE.PlaneGeometry(0.224, h * 0.977),

          // Reutiliza um dos seis materiais criados anteriormente.
          spineMaterials[(i * 3 + row) % 6],
        );

        // Posiciona a lombada ligeiramente à frente
        // da superfície do corpo principal do livro.
        spine.position.set(0, h / 2, 0.274);

        group.add(spine);

        // =====================================================
        // ASSOCIAÇÃO DOS DADOS DO CATÁLOGO
        // =====================================================

        // Define o volume conforme a prateleira.
        const volume = row + 1;

        // Cria um objeto contendo os dados do livro
        // e as referências aos seus componentes tridimensionais.
        const data = {

          // Identificador único do livro.
          id: `${category}-${i + 1}-${volume}`,

          // Título completo, incluindo o volume.
          title: catalog[category][i] + " · Vol. " + volume,

          // Título original sem o número do volume.
          baseTitle: catalog[category][i],

          // Identificação do acervo fictício.
          author: "Coleção Aurora — acervo fictício",

          category,
          volume,
          color,

          // Descrição associada à categoria.
          description: descriptions[category],

          // Referência ao grupo tridimensional do livro.
          group,

          // Referência à malha principal.
          mesh: bound,

          // Armazena a posição original no eixo Z,
          // permitindo restaurá-la após uma seleção.
          baseZ: group.position.z,

          // Índice do livro no array geral.
          index: books.length,
        };

        // Associa os dados do catálogo aos objetos 3D
        // por meio da propriedade personalizada userData.
        group.userData.book = data;
        bound.userData.book = data;
        spine.userData.book = data;

        // Adiciona o livro ao catálogo geral da aplicação.
        books.push(data);

        // Registra a malha principal como alvo de interação.
        bookHitTargets.push(bound);
      }

    // =====================================================
    // ACABAMENTOS DECORATIVOS
    // =====================================================

    // Cria pequenas esferas metálicas nas duas laterais.
    for (const xx of [-2.08, 2.08])

      // Distribui quatro esferas verticalmente em cada lateral.
      for (let j = 0; j < 4; j++) {

        // Cria uma esfera dourada de raio 0.045.
        ball(0.045, brass, xx, 0.62 + j * 1.14, 0.52, shelf, 10);
      }
  }

  // =====================================================
  // CONSTRUÇÃO DAS TRÊS ESTANTES
  // =====================================================

  // Estante esquerda.
  createBookshelf(-4.65, "Literatura");

  // Estante central.
  createBookshelf(0, "Ciência");

  // Estante direita.
  createBookshelf(4.65, "Fantasia");
}