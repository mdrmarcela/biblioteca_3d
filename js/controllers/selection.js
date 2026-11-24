import * as THREE from "three";

// Cria o controlador responsável pela seleção
// e interação com os livros da biblioteca.
export function createSelection(ctx, cameraControl, onChange) {

  // Extrai os elementos necessários do contexto da aplicação.
  const { scene, camera, renderer, books } = ctx;

  let selected = null, // Livro atualmente selecionado
    down = null,       // Informações do início do clique
    hovered = null,    // Livro sobre o qual está o cursor
    lastHover = 0;     // Instante da última verificação do cursor

  const canvas = renderer.domElement, // Área de renderização
    pointer = new THREE.Vector2(),    // Coordenadas 2D do cursor
    ray = new THREE.Raycaster();      // Raio para detectar interseções

  // Armazena as malhas tridimensionais da cena.
  // Inclui também os obstáculos, impedindo a seleção
  // de livros através das mesas ou das estantes.
  const pickables = [];

  // Percorre a hierarquia de objetos da cena.
  scene.traverse((object) => {
    if (object.isMesh) pickables.push(object);
  });

  // Identifica qual livro está na posição do cursor.
  function pick(event) {

    // Obtém as dimensões e a posição do canvas na tela.
    const bounds = canvas.getBoundingClientRect();

    // Converte as coordenadas do cursor em pixels
    // para coordenadas normalizadas entre -1 e 1.
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );

    // Atualiza as matrizes de transformação dos objetos
    // para garantir que suas posições estejam atualizadas.
    scene.updateMatrixWorld(true);

    // Cria um raio a partir da câmera,
    // passando pela posição do cursor.
    ray.setFromCamera(pointer, camera);

    // Verifica as interseções do raio com as malhas.
    // O primeiro resultado corresponde à interseção mais próxima.
    const hit = ray.intersectObjects(pickables, false)[0];

    // Retorna nulo caso nenhum objeto seja atingido.
    if (!hit) return null;

    let object = hit.object;

    // Percorre a hierarquia de objetos até encontrar
    // o grupo ou objeto associado a um livro.
    while (object) {
      if (object.userData.book) return object.userData.book;

      // Acessa o objeto pai na hierarquia.
      object = object.parent;
    }

    // O objeto atingido não corresponde a um livro.
    return null;
  }

  // Realiza a seleção de um livro.
  function select(book) {

    // Caso o livro já esteja selecionado,
    // um novo clique remove a seleção.
    if (selected === book) return clear();

    // Remove o estado de seleção do livro anterior.
    if (selected) selected.group.userData.isSelected = false;

    // Define o novo livro selecionado.
    selected = book;
    selected.group.userData.isSelected = true;

    // Interrompe a visita guiada para permitir
    // a visualização individual do livro.
    cameraControl.stopTour();

    // Obtém a posição do livro no sistema
    // de coordenadas global da cena.
    const focus = book.group.getWorldPosition(new THREE.Vector3());

    // Eleva ligeiramente o ponto observado pela câmera.
    focus.y += 0.45;

    // Movimenta a câmera para próximo do livro,
    // utilizando um deslocamento nos três eixos.
    cameraControl.move(
      focus.clone().add(new THREE.Vector3(1.05, 0.5, 3.6)),
      focus,
    );

    // Comunica à interface qual livro foi selecionado.
    onChange(book);
  }

  // Remove a seleção atual.
  function clear() {

    // Não executa alterações se não houver seleção.
    if (!selected) return;

    selected.group.userData.isSelected = false;
    selected = null;

    // Comunica à interface que nenhum livro está selecionado.
    onChange(null);
  }

  // Detecta o início de uma interação com o canvas.
  canvas.addEventListener("pointerdown", (event) => {

    // Ignora interações secundárias e botões
    // diferentes do botão principal.
    if (!event.isPrimary || event.button !== 0) {
      down = null;
      return;
    }

    // Armazena a posição inicial e o identificador do ponteiro.
    down = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId
    };
  });

  // Detecta o encerramento da interação com o canvas.
  canvas.addEventListener("pointerup", (event) => {

    const start = down;
    down = null;

    // Diferencia um clique de um movimento de arrastar.
    // Ignora deslocamentos superiores a 6 pixels.
    if (
      !start ||
      start.id !== event.pointerId ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
    )
      return;

    // Verifica se existe um livro na posição do clique.
    const book = pick(event);

    // Seleciona o livro identificado pelo Raycasting.
    if (book) select(book);
  });

  // Detecta a movimentação do cursor sobre o ambiente.
  canvas.addEventListener("pointermove", (event) => {

    // Evita verificações durante movimentos de arrastar,
    // interações que não utilizam mouse e verificações
    // realizadas em intervalos inferiores a 80 ms.
    if (
      down ||
      event.pointerType !== "mouse" ||
      performance.now() - lastHover < 80
    )
      return;

    // Registra o instante da última verificação.
    lastHover = performance.now();

    // Identifica o livro sobre o qual está o cursor.
    hovered = pick(event);

    // Altera o cursor para indicar que o livro é interativo.
    canvas.style.cursor = hovered ? "pointer" : "grab";
  });

  // Reinicia os estados de interação.
  const cancel = () => {
    down = null;
    hovered = null;
    canvas.style.cursor = "grab";
  };

  // Cancela a interação quando o ponteiro é interrompido
  // ou sai da área de renderização.
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("pointerleave", cancel);

  // Disponibiliza os métodos para outras partes da aplicação.
  return {
    select,
    clear,

    // Permite consultar o livro atualmente selecionado.
    get selected() {
      return selected;
    },

    // Atualiza as transformações e os efeitos visuais
    // dos livros a cada quadro da animação.
    update(dt, reduced) {

      // Calcula um fator de suavização exponencial.
      // Caso movimentos reduzidos estejam habilitados,
      // as transformações são aplicadas imediatamente.
      const smooth = reduced ? 1 : 1 - Math.exp(-dt * 9);

      // Percorre todos os livros da biblioteca.
      for (const book of books) {

        // Verifica se o livro atual está selecionado.
        const active = book === selected;

        // TRANSLAÇÃO:
        // Desloca o livro selecionado em 0,47 unidade
        // no sentido positivo do eixo Z.
        book.group.position.z +=
          (book.baseZ + (active ? 0.47 : 0) - book.group.position.z) * smooth;

        // ROTAÇÃO:
        // Rotaciona o livro selecionado em -0,17 radiano
        // em torno do eixo Y.
        book.group.rotation.y +=
          ((active ? -0.17 : 0) - book.group.rotation.y) * smooth;

        // ESCALA:
        // Aumenta uniformemente o tamanho do livro
        // selecionado em 7,5%.
        book.group.scale.setScalar(
          book.group.scale.x +
            ((active ? 1.075 : 1) - book.group.scale.x) * smooth,
        );

        // Define a cor emissiva conforme o estado do livro:
        // selecionado, sob o cursor ou sem interação.
        book.mesh.material.emissive.set(
          active ? "#80501d" : book === hovered ? "#4b361c" : "#000000",
        );

        // Define a intensidade da emissão do material.
        book.mesh.material.emissiveIntensity = 0.3;
      }
    },
  };
}