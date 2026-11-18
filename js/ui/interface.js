import { createCameraController } from "../controllers/camera.js";
import { createSelection } from "../controllers/selection.js";
import { createEnvironment } from "../controllers/environment.js";
import { createCatalog } from "./catalog.js";
import { createDialog } from "./dialog.js";
import { aboutTemplate } from "./templates.js";
import { escapeHTML, readSetting, saveSetting } from "../utils/storage.js";

export function createInterface(ctx) {
  const $ = (id) => document.getElementById(id);
  const mobile = matchMedia("(max-width: 760px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = readSetting("paused", false) === true;
  let toastTimer,
    catalogWasOpen = false,
    selectionOrigin = null;
  const dialog = createDialog();
  function toast(message) {
    clearTimeout(toastTimer);
    $("toast").textContent = message;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2400);
  }
  function setCatalog(open) {
    $("catalogPanel").hidden = !open;
    $("catalogToggle").setAttribute("aria-expanded", String(open));
  }
  function setSettings(open) {
    $("settingsPanel").hidden = !open;
    $("settingsButton").setAttribute("aria-expanded", String(open));
  }
  const cameraControl = createCameraController(ctx, {
    reducedMotion,
    onView(name, label) {
      for (const button of document.querySelectorAll("[data-view]"))
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.view === name),
        );
      $("viewLabel").textContent = label;
    },
    onTour(active) {
      $("tourButton").textContent = active
        ? "■ Parar visita"
        : "▷ Visita guiada";
      $("tourButton").setAttribute("aria-pressed", String(active));
    },
  });
  const environment = createEnvironment(ctx);
  function updateFavorite(book) {
    const saved = catalog.has(book);
    $("favoriteButton").setAttribute("aria-pressed", String(saved));
    $("favoriteButton").textContent = saved ? "♥ Salvo" : "♡ Salvar";
  }
  const selection = createSelection(ctx, cameraControl, (book) => {
    catalog.mark(book);
    if (!book) {
      const needsFocus = $("bookPanel").contains(document.activeElement);
      $("bookPanel").hidden = true;
      if (mobile.matches && catalogWasOpen) setCatalog(true);
      if (needsFocus) {
        if (
          selectionOrigin?.isConnected &&
          !selectionOrigin.closest("[hidden]")
        )
          selectionOrigin.focus({ preventScroll: true });
        else $("catalogToggle").focus({ preventScroll: true });
      }
      return;
    }
    selectionOrigin = document.activeElement;
    catalogWasOpen = !$("catalogPanel").hidden;
    $("bookTitle").textContent = book.title;
    $("bookAuthor").textContent = book.author;
    $("bookCategory").textContent = book.category + " · Volume " + book.volume;
    $("bookDescription").textContent = book.description;
    $("bookIcon").style.background = book.color;
    $("coverVolume").textContent =
      "VOLUME " + String(book.volume).padStart(2, "0");
    $("bookPanel").hidden = false;
    $("viewLabel").textContent = "Explorando o acervo";
    for (const button of document.querySelectorAll("[data-view]"))
      button.setAttribute("aria-pressed", "false");
    if (mobile.matches) setCatalog(false);
    setSettings(false);
    updateFavorite(book);
    $("bookTitle").focus({ preventScroll: true });
  });
  const catalog = createCatalog(
    ctx.books,
    (book) => selection.select(book),
    (book, saved) => {
      updateFavorite(book);
      toast(
        saved ? "Livro salvo na sua coleção." : "Livro removido dos salvos.",
      );
    },
  );
  const closeBook = () => selection.clear();
  $("closeBook").addEventListener("click", closeBook);
  $("returnButton").addEventListener("click", closeBook);
  $("favoriteButton").addEventListener("click", () => {
    if (selection.selected) catalog.toggle(selection.selected);
  });
  $("readButton").addEventListener("click", () => {
    const book = selection.selected;
    if (!book) return;
    cameraControl.stopTour();
    dialog.open(
      `<div class="eyebrow">Acervo de demonstração · ${escapeHTML(book.category)}</div><h2 id="modalTitle">${escapeHTML(book.title)}</h2><p>${escapeHTML(book.description)}</p><h3>Sobre a coleção</h3><p>Este volume faz parte de um acervo fictício criado especialmente para explorar a biblioteca em 3D. A modelagem, a lombada e a animação de seleção foram produzidas com JavaScript e Three.js.</p><small>Experiência demonstrativa: não é uma obra publicada nem um leitor de arquivos digitais.</small>`,
    );
  });
  $("aboutButton").addEventListener("click", () => {
    cameraControl.stopTour();
    dialog.open(aboutTemplate);
  });
  function showHelp() {
    cameraControl.stopTour();
    dialog.open(
      `<div class="eyebrow">Guia de exploração</div><h2 id="modalTitle">Uma visita no seu ritmo.</h2><p>Arraste a cena para girar. Use a roda do mouse ou o gesto de pinça para aproximar. Clique ou toque nos livros para conhecer cada volume. O catálogo também permite acessar todos eles pelo teclado.</p><div class="shortcut-list"><kbd>1 · 2 · 3 · 4</kbd><span>Visão geral, estantes, mesa e janela</span><kbd>N</kbd><span>Alternar dia e noite</span><kbd>L</kbd><span>Acender ou apagar a luminária</span><kbd>T</kbd><span>Iniciar ou parar a visita guiada</span><kbd>Esc</kbd><span>Fechar a janela, os ajustes ou os detalhes</span><kbd>Tab</kbd><span>Navegar entre os controles</span></div><p>Os favoritos e ajustes ficam salvos neste navegador. Use Ajustes → Leve se precisar reduzir o trabalho gráfico.</p>`,
    );
  }
  $("helpButton").addEventListener("click", showHelp);
  $("catalogToggle").addEventListener("click", () => {
    const open = $("catalogPanel").hidden;
    if (open && mobile.matches) selection.clear();
    setSettings(false);
    setCatalog(open);
    if (open) $("searchInput").focus();
  });
  $("closeCatalog").addEventListener("click", () => {
    setCatalog(false);
    $("catalogToggle").focus();
  });
  for (const button of document.querySelectorAll("[data-view]"))
    button.addEventListener("click", () => {
      selection.clear();
      cameraControl.showView(button.dataset.view);
      if (mobile.matches) setCatalog(false);
    });
  const toggleTour = () => {
    selection.clear();
    cameraControl.toggleTour();
    if (mobile.matches) setCatalog(false);
  };
  $("tourButton").addEventListener("click", toggleTour);
  $("dayButton").addEventListener("click", environment.toggleDay);
  $("lampButton").addEventListener("click", environment.toggleLamp);
  $("qualitySelect").addEventListener("change", (event) =>
    environment.setQuality(event.target.value),
  );
  $("settingsButton").addEventListener("click", () => {
    const open = $("settingsPanel").hidden;
    if (open && mobile.matches) {
      selection.clear();
      setCatalog(false);
    }
    setSettings(open);
  });
  function updatePause() {
    $("pauseButton").setAttribute(
      "aria-pressed",
      String(paused || reducedMotion.matches),
    );
    $("pauseButton").textContent =
      paused || reducedMotion.matches ? "▷ Animação" : "Ⅱ Animação";
    $("pauseButton").title = reducedMotion.matches
      ? "Movimento reduzido ativado nas preferências do dispositivo"
      : paused
        ? "Retomar animações decorativas"
        : "Pausar animações decorativas";
  }
  $("pauseButton").addEventListener("click", () => {
    if (reducedMotion.matches) {
      toast("Movimento reduzido está ativo no dispositivo.");
      return;
    }
    paused = !paused;
    saveSetting("paused", paused);
    updatePause();
  });
  reducedMotion.addEventListener("change", updatePause);
  updatePause();
  $("fullscreenButton").disabled = !document.fullscreenEnabled;
  $("fullscreenButton").addEventListener("click", async () => {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await document.documentElement.requestFullscreen();
    } catch {
      toast("Tela cheia indisponível neste navegador.");
    }
  });
  document.addEventListener(
    "fullscreenchange",
    () =>
      ($("fullscreenButton").textContent = document.fullscreenElement
        ? "Sair da tela cheia"
        : "Tela cheia"),
  );
  addEventListener("keydown", (event) => {
    if (dialog.isOpen) return; // O dialog nativo controla Esc, foco e Tab.
    if (event.key === "Escape") {
      if (!$("settingsPanel").hidden) {
        setSettings(false);
        $("settingsButton").focus();
      } else if (selection.selected) selection.clear();
      else if (mobile.matches && !$("catalogPanel").hidden) {
        setCatalog(false);
        $("catalogToggle").focus();
      }
      cameraControl.stopTour();
      return;
    }
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.repeat ||
      event.target.closest('input, select, textarea, [contenteditable="true"]')
    )
      return;
    const view = ["overview", "shelves", "table", "window"][
      Number(event.key) - 1
    ];
    if (view) {
      selection.clear();
      cameraControl.showView(view);
    }
    if (event.key.toLowerCase() === "n") environment.toggleDay();
    if (event.key.toLowerCase() === "l") environment.toggleLamp();
    if (event.key.toLowerCase() === "t") toggleTour();
  });
  mobile.addEventListener("change", () => {
    setCatalog(!mobile.matches);
    setSettings(false);
  });
  setCatalog(!mobile.matches);
  return {
    selection,
    cameraControl,
    reducedMotion,
    get paused() {
      return paused;
    },
  };
}
