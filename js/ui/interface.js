// Importa os controladores do ambiente tridimensional.
import { createCameraController } from "../controllers/camera.js";
import { createSelection } from "../controllers/selection.js";
import { createEnvironment } from "../controllers/environment.js";

// Importa os controladores da interface.
import { createCatalog } from "./catalog.js";
import { createDialog } from "./dialog.js";

// Importa o conteúdo da janela de informações sobre o projeto.
import { aboutTemplate } from "./templates.js";

// Importa funções de segurança e armazenamento de preferências.
import { escapeHTML, readSetting, saveSetting } from "../utils/storage.js";

// Inicializa a interface e conecta seus diferentes módulos.
export function createInterface(ctx) {

  // Função auxiliar para acessar elementos HTML pelo ID.
  const $ = (id) => document.getElementById(id);

  // Detecta se a largura da área de visualização
  // é igual ou inferior a 760 pixels.
  const mobile = matchMedia("(max-width: 760px)");

  // Detecta a preferência do usuário por movimentos reduzidos.
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Recupera a preferência de pausa das animações.
  let paused = readSetting("paused", false) === true;

  let toastTimer,          // Temporizador das notificações
    catalogWasOpen = false, // Estado anterior do catálogo
    selectionOrigin = null; // Elemento em foco antes da seleção

  // Inicializa o controlador das janelas modais.
  const dialog = createDialog();

  // =====================================================
  // NOTIFICAÇÕES TEMPORÁRIAS
  // =====================================================

  // Exibe uma mensagem temporária na interface.
  function toast(message) {

    // Cancela o temporizador anterior, evitando
    // que uma nova mensagem desapareça antecipadamente.
    clearTimeout(toastTimer);

    // Define o conteúdo da notificação.
    $("toast").textContent = message;

    // Adiciona a classe CSS responsável pela exibição.
    $("toast").classList.add("show");

    // Remove a classe após 2400 milissegundos (2,4 segundos).
    toastTimer = setTimeout(
      () => $("toast").classList.remove("show"),
      2400
    );
  }

  // =====================================================
  // CONTROLE DOS PAINÉIS DA INTERFACE
  // =====================================================

  // Abre ou fecha o painel do catálogo.
  function setCatalog(open) {

    $("catalogPanel").hidden = !open;

    // Atualiza o estado de expansão para tecnologias assistivas.
    $("catalogToggle").setAttribute("aria-expanded", String(open));
  }

  // Abre ou fecha o painel de configurações.
  function setSettings(open) {

    $("settingsPanel").hidden = !open;

    $("settingsButton").setAttribute("aria-expanded", String(open));
  }

  // =====================================================
  // CONTROLADOR DA CÂMERA
  // =====================================================

  // Inicializa o controlador de movimentação da câmera.
  const cameraControl = createCameraController(ctx, {

    // Envia a preferência de movimento reduzido.
    reducedMotion,

    // Callback executado quando uma vista é selecionada.
    onView(name, label) {

      // Atualiza o estado dos botões de visualização.
      for (const button of document.querySelectorAll("[data-view]"))
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.view === name),
        );

      // Atualiza o texto que identifica a vista atual.
      $("viewLabel").textContent = label;
    },

    // Callback executado quando a visita guiada
    // é iniciada ou interrompida.
    onTour(active) {

      // Altera o texto do botão conforme o estado da visita.
      $("tourButton").textContent = active
        ? "■ Parar visita"
        : "▷ Visita guiada";

      // Atualiza o estado acessível do botão.
      $("tourButton").setAttribute("aria-pressed", String(active));
    },
  });

  // =====================================================
  // CONTROLADOR DO AMBIENTE
  // =====================================================

  // Inicializa o controlador responsável pela iluminação,
  // alternância entre dia e noite e qualidade gráfica.
  const environment = createEnvironment(ctx);

  // =====================================================
  // ATUALIZAÇÃO DO BOTÃO DE FAVORITOS
  // =====================================================

  function updateFavorite(book) {

    // Verifica se o livro está salvo no catálogo.
    const saved = catalog.has(book);

    // Atualiza o estado acessível do botão.
    $("favoriteButton").setAttribute("aria-pressed", String(saved));

    // Altera o texto conforme o estado do favorito.
    $("favoriteButton").textContent = saved ? "♥ Salvo" : "♡ Salvar";
  }

  // =====================================================
  // CONTROLADOR DE SELEÇÃO DOS LIVROS
  // =====================================================

  // Inicializa o controlador responsável pelo Raycasting
  // e pelas transformações dos livros selecionados.
  const selection = createSelection(ctx, cameraControl, (book) => {

    // Sincroniza a seleção do ambiente 3D com o catálogo.
    catalog.mark(book);

    // Caso nenhum livro esteja selecionado,
    // fecha o painel de informações.
    if (!book) {

      // Verifica se o foco atual está dentro do painel.
      const needsFocus = $("bookPanel").contains(document.activeElement);

      $("bookPanel").hidden = true;

      // Em telas pequenas, restaura o catálogo
      // caso estivesse aberto antes da seleção.
      if (mobile.matches && catalogWasOpen) setCatalog(true);

      // Restaura o foco quando necessário.
      if (needsFocus) {

        // Verifica se o elemento anterior ainda existe
        // e se não está dentro de um elemento oculto.
        if (
          selectionOrigin?.isConnected &&
          !selectionOrigin.closest("[hidden]")
        )

          selectionOrigin.focus({ preventScroll: true });

        // Caso contrário, direciona o foco ao botão do catálogo.
        else $("catalogToggle").focus({ preventScroll: true });
      }

      return;
    }

    // Armazena o elemento que estava em foco antes da seleção.
    selectionOrigin = document.activeElement;

    // Armazena o estado anterior do painel do catálogo.
    catalogWasOpen = !$("catalogPanel").hidden;

    // Preenche o painel com as informações do livro selecionado.
    $("bookTitle").textContent = book.title;
    $("bookAuthor").textContent = book.author;

    $("bookCategory").textContent =
      book.category + " · Volume " + book.volume;

    $("bookDescription").textContent = book.description;

    // Utiliza a cor associada ao objeto tridimensional.
    $("bookIcon").style.background = book.color;

    // Formata o número do volume com pelo menos dois dígitos.
    $("coverVolume").textContent =
      "VOLUME " + String(book.volume).padStart(2, "0");

    // Exibe o painel de informações do livro.
    $("bookPanel").hidden = false;

    // Atualiza o estado da exploração.
    $("viewLabel").textContent = "Explorando o acervo";

    // Remove a indicação de seleção das vistas predefinidas.
    for (const button of document.querySelectorAll("[data-view]"))
      button.setAttribute("aria-pressed", "false");

    // Em telas pequenas, fecha o catálogo para liberar espaço.
    if (mobile.matches) setCatalog(false);

    // Fecha o painel de configurações.
    setSettings(false);

    // Atualiza o botão de favoritos.
    updateFavorite(book);

    // Direciona o foco para o título do livro.
    $("bookTitle").focus({ preventScroll: true });
  });

  // =====================================================
  // INICIALIZAÇÃO DO CATÁLOGO
  // =====================================================

  const catalog = createCatalog(

    // Envia os dados dos livros construídos na cena.
    ctx.books,

    // Ao selecionar um livro no catálogo,
    // encaminha a seleção ao controlador tridimensional.
    (book) => selection.select(book),

    // Callback executado ao adicionar ou remover favoritos.
    (book, saved) => {

      // Atualiza a aparência do botão.
      updateFavorite(book);

      // Exibe uma notificação confirmando a operação.
      toast(
        saved
          ? "Livro salvo na sua coleção."
          : "Livro removido dos salvos.",
      );
    },
  );

  // =====================================================
  // EVENTOS DO PAINEL DOS LIVROS
  // =====================================================

  // Remove a seleção atual do livro.
  const closeBook = () => selection.clear();

  // Associa os botões de fechamento à mesma função.
  $("closeBook").addEventListener("click", closeBook);
  $("returnButton").addEventListener("click", closeBook);

  // Adiciona ou remove o livro selecionado dos favoritos.
  $("favoriteButton").addEventListener("click", () => {

    if (selection.selected)
      catalog.toggle(selection.selected);
  });

  // Abre uma janela com informações adicionais do livro.
  $("readButton").addEventListener("click", () => {

    // Recupera o livro atualmente selecionado.
    const book = selection.selected;

    // Interrompe a função caso não exista seleção.
    if (!book) return;

    // Interrompe a visita guiada.
    cameraControl.stopTour();

    // Abre a janela modal com conteúdo dinâmico.
    // escapeHTML trata os dados antes de inseri-los no HTML.
    dialog.open(
      `<div class="eyebrow">Acervo de demonstração · ${escapeHTML(book.category)}</div><h2 id="modalTitle">${escapeHTML(book.title)}</h2><p>${escapeHTML(book.description)}</p><h3>Sobre a coleção</h3><p>Este volume faz parte de um acervo fictício criado especialmente para explorar a biblioteca em 3D. A modelagem, a lombada e a animação de seleção foram produzidas com JavaScript e Three.js.</p><small>Experiência demonstrativa: não é uma obra publicada nem um leitor de arquivos digitais.</small>`,
    );
  });

  // =====================================================
  // JANELAS DE INFORMAÇÃO E AJUDA
  // =====================================================

  // Abre a janela contendo informações sobre o projeto.
  $("aboutButton").addEventListener("click", () => {

    cameraControl.stopTour();

    dialog.open(aboutTemplate);
  });

  // Exibe instruções de utilização da biblioteca.
  function showHelp() {

    cameraControl.stopTour();

    // Apresenta instruções de navegação e atalhos de teclado.
    dialog.open(
      `<div class="eyebrow">Guia de exploração</div><h2 id="modalTitle">Uma visita no seu ritmo.</h2><p>Arraste a cena para girar. Use a roda do mouse ou o gesto de pinça para aproximar. Clique ou toque nos livros para conhecer cada volume. O catálogo também permite acessar todos eles pelo teclado.</p><div class="shortcut-list"><kbd>1 · 2 · 3 · 4</kbd><span>Visão geral, estantes, mesa e janela</span><kbd>N</kbd><span>Alternar dia e noite</span><kbd>L</kbd><span>Acender ou apagar a luminária</span><kbd>T</kbd><span>Iniciar ou parar a visita guiada</span><kbd>Esc</kbd><span>Fechar a janela, os ajustes ou os detalhes</span><kbd>Tab</kbd><span>Navegar entre os controles</span></div><p>Os favoritos e ajustes ficam salvos neste navegador. Use Ajustes → Leve se precisar reduzir o trabalho gráfico.</p>`,
    );
  }

  // Associa o botão de ajuda à função correspondente.
  $("helpButton").addEventListener("click", showHelp);

  // =====================================================
  // EVENTOS DO CATÁLOGO
  // =====================================================

  // Alterna entre abrir e fechar o catálogo.
  $("catalogToggle").addEventListener("click", () => {

    // Verifica se o catálogo está atualmente oculto.
    const open = $("catalogPanel").hidden;

    // Em telas pequenas, remove a seleção ao abrir o catálogo.
    if (open && mobile.matches) selection.clear();

    // Fecha as configurações para evitar sobreposição.
    setSettings(false);

    setCatalog(open);

    // Direciona o foco para o campo de pesquisa.
    if (open) $("searchInput").focus();
  });

  // Fecha o catálogo e restaura o foco.
  $("closeCatalog").addEventListener("click", () => {

    setCatalog(false);

    $("catalogToggle").focus();
  });

  // =====================================================
  // CONTROLE DAS VISTAS DA CÂMERA
  // =====================================================

  // Percorre todos os botões que representam vistas predefinidas.
  for (const button of document.querySelectorAll("[data-view]"))

    button.addEventListener("click", () => {

      // Remove a seleção atual.
      selection.clear();

      // Move a câmera para a vista associada ao botão.
      cameraControl.showView(button.dataset.view);

      // Fecha o catálogo em telas pequenas.
      if (mobile.matches) setCatalog(false);
    });

  // =====================================================
  // VISITA GUIADA
  // =====================================================

  // Alterna entre iniciar e interromper a visita guiada.
  const toggleTour = () => {

    selection.clear();

    cameraControl.toggleTour();

    if (mobile.matches) setCatalog(false);
  };

  $("tourButton").addEventListener("click", toggleTour);

  // =====================================================
  // CONTROLES DO AMBIENTE E QUALIDADE GRÁFICA
  // =====================================================

  // Alterna entre dia e noite.
  $("dayButton").addEventListener("click", environment.toggleDay);

  // Acende ou apaga as luminárias controláveis.
  $("lampButton").addEventListener("click", environment.toggleLamp);

  // Altera a qualidade gráfica conforme a opção selecionada.
  $("qualitySelect").addEventListener("change", (event) =>
    environment.setQuality(event.target.value),
  );

  // Controla a abertura do painel de configurações.
  $("settingsButton").addEventListener("click", () => {

    const open = $("settingsPanel").hidden;

    // Em telas pequenas, fecha os demais painéis
    // antes de abrir as configurações.
    if (open && mobile.matches) {

      selection.clear();

      setCatalog(false);
    }

    setSettings(open);
  });

  // =====================================================
  // CONTROLE DAS ANIMAÇÕES DECORATIVAS
  // =====================================================

  // Atualiza o estado visual do botão de animação.
  function updatePause() {

    // Considera tanto a pausa manual quanto
    // a preferência de movimento reduzido do dispositivo.
    $("pauseButton").setAttribute(
      "aria-pressed",
      String(paused || reducedMotion.matches),
    );

    // Altera o texto conforme o estado das animações.
    $("pauseButton").textContent =
      paused || reducedMotion.matches
        ? "▷ Animação"
        : "Ⅱ Animação";

    // Define uma descrição complementar para o botão.
    $("pauseButton").title = reducedMotion.matches
      ? "Movimento reduzido ativado nas preferências do dispositivo"
      : paused
        ? "Retomar animações decorativas"
        : "Pausar animações decorativas";
  }

  // Alterna o estado de pausa das animações.
  $("pauseButton").addEventListener("click", () => {

    // Respeita a preferência de movimento reduzido do usuário.
    if (reducedMotion.matches) {

      toast("Movimento reduzido está ativo no dispositivo.");

      return;
    }

    // Inverte o estado atual.
    paused = !paused;

    // Armazena a preferência.
    saveSetting("paused", paused);

    // Atualiza o botão.
    updatePause();
  });

  // Detecta mudanças na preferência de movimento reduzido.
  reducedMotion.addEventListener("change", updatePause);

  // Inicializa o estado visual do botão.
  updatePause();

  // =====================================================
  // MODO TELA CHEIA
  // =====================================================

  // Desabilita o botão quando o modo tela cheia
  // não está disponível para o documento.
  $("fullscreenButton").disabled = !document.fullscreenEnabled;

  // Alterna entre o modo normal e o modo tela cheia.
  $("fullscreenButton").addEventListener("click", async () => {

    try {

      // Verifica se a aplicação já está em tela cheia.
      document.fullscreenElement

        // Caso esteja, encerra o modo tela cheia.
        ? await document.exitFullscreen()

        // Caso contrário, solicita tela cheia.
        : await document.documentElement.requestFullscreen();

    } catch {

      // Exibe uma mensagem caso a operação falhe.
      toast("Tela cheia indisponível neste navegador.");
    }
  });

  // Detecta mudanças no estado de tela cheia.
  document.addEventListener(
    "fullscreenchange",
    () =>

      // Atualiza o texto do botão conforme o estado atual.
      ($("fullscreenButton").textContent = document.fullscreenElement
        ? "Sair da tela cheia"
        : "Tela cheia"),
  );

  // =====================================================
  // ATALHOS DE TECLADO
  // =====================================================

  // Detecta eventos de teclado na aplicação.
  addEventListener("keydown", (event) => {

    // Quando uma janela modal está aberta,
    // deixa o navegador controlar Esc, foco e Tab.
    if (dialog.isOpen) return;

    // Trata o pressionamento da tecla Escape.
    if (event.key === "Escape") {

      // Prioriza o fechamento do painel de configurações.
      if (!$("settingsPanel").hidden) {

        setSettings(false);

        $("settingsButton").focus();

      // Caso exista um livro selecionado, remove a seleção.
      } else if (selection.selected) selection.clear();

      // Em telas pequenas, fecha o catálogo se estiver aberto.
      else if (mobile.matches && !$("catalogPanel").hidden) {

        setCatalog(false);

        $("catalogToggle").focus();
      }

      // Também interrompe a visita guiada.
      cameraControl.stopTour();

      return;
    }

    // Evita executar atalhos quando:
    // - existem teclas modificadoras pressionadas;
    // - a tecla está sendo mantida pressionada;
    // - o usuário está interagindo com campos editáveis.
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.repeat ||
      event.target.closest('input, select, textarea, [contenteditable="true"]')
    )
      return;

    // Associa as teclas numéricas de 1 a 4
    // às vistas predefinidas da biblioteca.
    const view = ["overview", "shelves", "table", "window"][
      Number(event.key) - 1
    ];

    // Caso exista uma vista correspondente,
    // remove a seleção e movimenta a câmera.
    if (view) {

      selection.clear();

      cameraControl.showView(view);
    }

    // Tecla N: alterna entre dia e noite.
    if (event.key.toLowerCase() === "n") environment.toggleDay();

    // Tecla L: alterna o estado das luminárias.
    if (event.key.toLowerCase() === "l") environment.toggleLamp();

    // Tecla T: inicia ou interrompe a visita guiada.
    if (event.key.toLowerCase() === "t") toggleTour();
  });

  // =====================================================
  // RESPONSIVIDADE
  // =====================================================

  // Detecta quando a área de visualização atravessa
  // o limite de largura definido pela media query.
  mobile.addEventListener("change", () => {

    // Exibe o catálogo automaticamente em telas maiores
    // e o oculta em telas menores.
    setCatalog(!mobile.matches);

    // Fecha o painel de configurações.
    setSettings(false);
  });

  // Define o estado inicial do catálogo conforme a largura da tela.
  setCatalog(!mobile.matches);

  // =====================================================
  // COMPONENTES DISPONIBILIZADOS
  // =====================================================

  return {

    // Controlador de seleção dos livros.
    selection,

    // Controlador de movimentação da câmera.
    cameraControl,

    // Preferência de movimentos reduzidos.
    reducedMotion,

    // Getter que permite consultar o estado atual da pausa.
    get paused() {
      return paused;
    },
  };
}