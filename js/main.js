// Importa os componentes fundamentais do motor gráfico.
import { createEngine } from "./core/engine.js";
import { createPrimitives } from "./core/primitives.js";
import { createTextures } from "./core/textures.js";

// Importa os módulos responsáveis pela construção da cena.
import { buildRoom } from "./scene/room.js";
import { buildShelves } from "./scene/shelves.js";
import { buildFurniture } from "./scene/furniture.js";
import { buildLights } from "./scene/lighting.js";
import { buildParticles } from "./scene/particles.js";

// Importa o controlador da interface e das interações.
import { createInterface } from "./ui/interface.js";

// Função principal responsável por inicializar a aplicação.
export function start() {

  // =====================================================
  // INICIALIZAÇÃO DO MOTOR GRÁFICO
  // =====================================================

  // Cria a cena, a câmera, o renderizador e os controles,
  // utilizando o elemento HTML "scene" como contêiner.
  const engine = createEngine(document.getElementById("scene"));

  // Cria um contexto compartilhado entre os módulos.
  const ctx = {

    // Utiliza o operador spread para copiar as propriedades
    // disponibilizadas pelo motor gráfico.
    ...engine,

    // Array que armazenará os dados dos livros.
    books: [],

    // Array destinado às malhas principais dos livros.
    bookHitTargets: [],

    // Objeto que armazenará referências aos elementos
    // que podem sofrer alterações durante a execução.
    animatedObjects: {},

    // Inicializa as primitivas geométricas e os materiais.
    primitives: createPrimitives(engine.scene),

    // Inicializa as texturas procedurais e externas.
    textures: createTextures(engine.renderer),
  };

  // =====================================================
  // CONSTRUÇÃO DO AMBIENTE TRIDIMENSIONAL
  // =====================================================

  // Constrói as paredes, o piso, o teto e as decorações.
  buildRoom(ctx);

  // Constrói as estantes e os 144 livros.
  buildShelves(ctx);

  // Constrói os móveis e demais objetos do ambiente.
  buildFurniture(ctx);

  // Configura as fontes de iluminação.
  buildLights(ctx);

  // Cria o sistema de partículas de poeira.
  buildParticles(ctx);

  // Inicializa a interface após a construção da cena,
  // permitindo que os controladores acessem os objetos criados.
  const ui = createInterface(ctx);

  // =====================================================
  // VARIÁVEIS DE CONTROLE TEMPORAL
  // =====================================================

  // Armazena o instante da última atualização em milissegundos.
  let previous = performance.now(),

    // Armazena o tempo acumulado das animações decorativas,
    // medido em segundos.
    elapsed = 0,

    // Armazena o identificador do próximo frame agendado.
    animationId = null;

  // =====================================================
  // LOOP DE ANIMAÇÃO E RENDERIZAÇÃO
  // =====================================================

  // Função executada a cada frame da aplicação.
  // now: instante fornecido pelo requestAnimationFrame.
  function frame(now) {

    // Calcula o Delta Time: tempo decorrido desde o último frame.
    // Divide por 1000 para converter milissegundos em segundos.
    // Limita o intervalo a 0.05 segundo para evitar
    // grandes saltos nas animações baseadas em dt.
    const dt = Math.min((now - previous) / 1000, 0.05);

    // Atualiza o instante do último frame.
    previous = now;

    // Verifica se o usuário ativou movimento reduzido
    // ou pausou manualmente as animações decorativas.
    const reduced = ui.reducedMotion.matches || ui.paused;

    // Atualiza as transições da câmera e a visita guiada.
    ui.cameraControl.update(now);

    // Atualiza as transformações dos livros selecionados,
    // utilizando o Delta Time e o estado de movimento reduzido.
    ui.selection.update(dt, reduced);

    // Executa as animações decorativas somente quando permitido.
    if (!reduced) {

      // Acumula o tempo efetivamente utilizado nas animações.
      elapsed += dt;

      // =================================================
      // ANIMAÇÃO DO GLOBO TERRESTRE
      // =================================================

      // Rotaciona o globo em torno do eixo Y.
      // A velocidade angular é de 0.12 radiano por segundo.
      // O Delta Time torna a rotação proporcional ao tempo.
      ctx.animatedObjects.globe.rotation.y += dt * 0.12;

      // =================================================
      // ANIMAÇÃO DO RELÓGIO
      // =================================================

      // Rotaciona o ponteiro do relógio no eixo Z.
      // O sinal negativo define o sentido da rotação.
      // A posição angular é calculada com base no tempo acumulado.
      ctx.animatedObjects.minuteHand.rotation.z = -elapsed * 0.035;

      // =================================================
      // ANIMAÇÃO DAS PARTÍCULAS
      // =================================================

      // Recupera o sistema de partículas criado anteriormente.
      const dust = ctx.animatedObjects.dust;

      // Atualiza as partículas somente quando estão visíveis.
      // No modo de qualidade Leve, esse sistema fica oculto.
      if (dust.system.visible) {

        // Percorre todas as partículas de poeira.
        for (let i = 0; i < dust.count; i++) {

          // Calcula o índice inicial das três coordenadas
          // correspondentes à partícula atual.
          const offset = i * 3;

          // Atualiza a coordenada Y, produzindo
          // um movimento vertical ascendente.
          // Cada partícula possui uma velocidade individual.
          dust.positions[offset + 1] += dust.speeds[i] * dt;

          // Atualiza a coordenada X utilizando uma função seno.
          // Isso gera uma oscilação horizontal suave.
          // O índice i cria uma diferença de fase entre partículas.
          dust.positions[offset] +=
            Math.sin(elapsed * 0.3 + i * 2.3) * 0.06 * dt;

          // Quando uma partícula ultrapassa o limite superior,
          // retorna sua posição vertical para a parte inferior.
          // Isso mantém um movimento contínuo da poeira.
          if (dust.positions[offset + 1] > 5.8)
            dust.positions[offset + 1] = 0.3;
        }

        // Informa ao Three.js que os dados de posição
        // foram modificados e precisam ser enviados à GPU.
        dust.system.geometry.attributes.position.needsUpdate = true;
      }
    }

    // =====================================================
    // ATUALIZAÇÃO DOS CONTROLES E RENDERIZAÇÃO
    // =====================================================

    // Atualiza os controles orbitais da câmera,
    // incluindo o efeito de amortecimento (damping).
    ctx.controls.update();

    // Renderiza a cena tridimensional a partir
    // da perspectiva da câmera atual.
    ctx.renderer.render(ctx.scene, ctx.camera);

    // Agenda a execução do próximo frame,
    // mantendo o loop de animação ativo.
    animationId = requestAnimationFrame(frame);
  }

  // =====================================================
  // RETOMADA DA ANIMAÇÃO
  // =====================================================

  function resume() {

    // Reinicia a referência temporal para evitar que
    // o tempo de interrupção afete o próximo Delta Time.
    previous = performance.now();

    // Inicia um novo loop somente se não existir
    // outro frame agendado.
    if (animationId === null)
      animationId = requestAnimationFrame(frame);
  }

  // =====================================================
  // OTIMIZAÇÃO: VISIBILIDADE DA PÁGINA
  // =====================================================

  // Detecta quando a página se torna visível ou oculta,
  // como ao alternar entre abas do navegador.
  document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

      // Cancela o próximo frame agendado.
      cancelAnimationFrame(animationId);

      // Indica que o loop está interrompido.
      animationId = null;

      // Interrompe a visita guiada.
      ui.cameraControl.stopTour();

    } else {

      // Retoma a renderização quando a página volta a ficar visível.
      resume();
    }
  });

  // =====================================================
  // TRATAMENTO DE PERDA DO CONTEXTO WEBGL
  // =====================================================

  // Detecta quando o navegador perde o contexto gráfico WebGL.
  engine.renderer.domElement.addEventListener("webglcontextlost", (event) => {

    // Cancela o comportamento padrão do evento,
    // permitindo uma eventual restauração do contexto.
    event.preventDefault();

    // Interrompe o loop de renderização.
    cancelAnimationFrame(animationId);
    animationId = null;

    // Apresenta uma orientação ao usuário.
    document.getElementById("errorMessage").textContent =
      "A renderização 3D foi interrompida pelo navegador. Recarregue a página e experimente a qualidade Leve.";

    // Exibe a tela de erro.
    document.getElementById("error").hidden = false;
  });

  // =====================================================
  // FINALIZAÇÃO DA INICIALIZAÇÃO
  // =====================================================

  // Realiza a primeira renderização da cena.
  engine.renderer.render(engine.scene, engine.camera);

  // Oculta a tela de carregamento.
  document.getElementById("loading").hidden = true;

  // Remove o atributo inert, permitindo que o usuário
  // interaja com os elementos da aplicação.
  document.getElementById("app").removeAttribute("inert");

  // Inicia o loop contínuo de animação e renderização.
  resume();
}