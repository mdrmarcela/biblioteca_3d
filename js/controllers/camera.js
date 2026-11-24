// Importa a biblioteca Three.js, utilizada na manipulação
// de elementos e coordenadas do ambiente tridimensional.
import * as THREE from "three";

// Define as visualizações predefinidas da biblioteca.
// pos: posição da câmera nos eixos X, Y e Z.
// target: ponto para o qual a câmera está direcionada.
// label: nome da visualização apresentado na interface.
export const views = {
  overview: {
    pos: [7, 4.8, 12],
    target: [0, 2.35, -2.2],
    label: "Visão geral",
  },
  shelves: {
    pos: [0, 3.45, 5.9],
    target: [0, 2.5, -5.1],
    label: "Estantes",
  },
  table: {
    pos: [3.85, 3.05, 5.55],
    target: [0, 1.35, 1.4],
    label: "Mesa de leitura",
  },
  window: {
    pos: [-2.65, 4.1, 3.75],
    target: [-7.5, 3.5, -0.6],
    label: "Janela",
  },
};

// Cria o controlador responsável pelo gerenciamento da câmera,
// das transições entre visualizações e da visita guiada.
export function createCameraController(
  { camera, controls },
  { reducedMotion, onView, onTour },
) {
  let tween = null,  // Armazena os dados da transição atual
    touring = false, // Indica se a visita guiada está ativa
    index = 0,       // Índice da próxima visualização
    next = 0;        // Momento da próxima troca de visualização

  // Movimenta a câmera até uma nova posição e direção.
  // A duração padrão da transição é de 1100 milissegundos.
  function move(position, target, duration = 1100) {

    // Desativa temporariamente a inércia dos controles
    // para evitar interferências durante a transição.
    controls.enableDamping = false;
    controls.update();

    // Verifica se o usuário prefere movimentos reduzidos,
    // respeitando suas configurações de acessibilidade.
    if (reducedMotion.matches) {

      // Posiciona a câmera diretamente, sem animação.
      camera.position.copy(position);
      controls.target.copy(target);
      controls.update();

      controls.enableDamping = true;
      tween = null;
      return;
    }

    // Armazena as informações necessárias para realizar
    // uma transição suave entre duas posições.
    tween = {
      start: performance.now(), // Instante inicial da animação
      duration,                 // Duração da animação

      // Posição inicial e final da câmera.
      from: camera.position.clone(),
      to: position.clone(),

      // Direção inicial e final da câmera.
      fromTarget: controls.target.clone(),
      toTarget: target.clone(),
    };
  }

  // Desativa a visita guiada e comunica a mudança à interface.
  function stopTour() {
    touring = false;
    onTour(false);
  }

  // Seleciona uma das visualizações predefinidas.
  // automated indica se a seleção foi realizada pela visita guiada.
  function showView(name, automated = false) {

    // Uma seleção manual interrompe a visita guiada.
    if (!automated) stopTour();

    // Busca a visualização pelo nome.
    const view = views[name];

    // Interrompe a função caso a visualização não exista.
    if (!view) return;

    // Converte os arrays de coordenadas em vetores tridimensionais.
    // As transições da visita guiada possuem duração maior.
    move(
      new THREE.Vector3(...view.pos),
      new THREE.Vector3(...view.target),
      automated ? 1700 : 1100,
    );

    // Comunica à interface qual visualização foi selecionada.
    onView(name, view.label);
  }

  // Alterna entre iniciar e interromper a visita guiada.
  function toggleTour() {

    // Caso a visita esteja ativa, interrompe sua execução.
    if (touring) return stopTour();

    // Inicia a visita guiada a partir da primeira visualização.
    touring = true;
    index = 0;
    next = 0;

    // Comunica à interface que a visita foi iniciada.
    onTour(true);
  }

  // Detecta quando o usuário começa a interagir
  // manualmente com os controles da câmera.
  controls.addEventListener("start", () => {

    // Cancela a transição automática em andamento.
    tween = null;

    // Reativa a suavização dos movimentos manuais.
    controls.enableDamping = true;

    // Interrompe a visita guiada.
    stopTour();

    // Informa que o usuário está explorando livremente o ambiente.
    onView("", "Exploração livre");
  });

  // Disponibiliza os métodos do controlador para
  // serem utilizados por outras partes da aplicação.
  return {
    move,
    showView,
    stopTour,
    toggleTour,

    // Atualiza o estado da câmera a cada quadro da animação.
    update(now) {

      // Verifica se está na hora de trocar a visualização
      // durante a visita guiada.
      if (touring && now >= next) {

        // Percorre as quatro visualizações de forma cíclica.
        // O operador % permite retornar à primeira visualização.
        showView(Object.keys(views)[index++ % 4], true);

        // Define um intervalo de 6,5 segundos entre visualizações.
        next = now + 6500;
      }

      // Não realiza cálculos caso não exista uma transição ativa.
      if (!tween) return;

      // Calcula o progresso da animação, entre 0 e 1.
      const k = Math.min(1, (now - tween.start) / tween.duration),

        // Aplica uma função de suavização (Smoothstep),
        // evitando movimentos bruscos no início e no fim.
        ease = k * k * (3 - 2 * k);

      // Realiza a interpolação entre a posição inicial
      // e a posição final da câmera.
      camera.position.lerpVectors(tween.from, tween.to, ease);

      // Realiza a interpolação do ponto observado pela câmera,
      // suavizando também a mudança de direção.
      controls.target.lerpVectors(
        tween.fromTarget,
        tween.toTarget,
        ease
      );

      // Finaliza a transição quando o progresso chega a 100%.
      if (k === 1) {
        tween = null;

        // Reativa a suavização dos controles manuais.
        controls.enableDamping = true;
      }
    },
  };
}