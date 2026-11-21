import { normalize, readSetting, saveSetting } from "../utils/storage.js";

export function createCatalog(books, onSelect, onFavorite) {
  const $ = (id) => document.getElementById(id);
  const saved = readSetting("favorites", []);
  const validIds = new Set(books.map((book) => book.id));
  const favorites = new Set(
    (Array.isArray(saved) ? saved : []).filter((id) => validIds.has(id)),
  );
  const pageSize = 12;
  let category = "Todos",
    favoritesOnly = false,
    limit = pageSize,
    selectedId = null;
  function filteredBooks() {
    const query = normalize($("searchInput").value.trim());
    return books
      .filter(
        (book) =>
          (category === "Todos" || book.category === category) &&
          (!favoritesOnly || favorites.has(book.id)) &&
          normalize(book.title + " " + book.category).includes(query),
      )
      .sort(
        (a, b) =>
          a.baseTitle.localeCompare(b.baseTitle, "pt-BR") ||
          a.volume - b.volume,
      );
  }
  function render() {
    const filtered = filteredBooks();
    $("bookCount").textContent = `${books.length} volumes`;
    $("resultCount").textContent =
      `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"}`;
    $("favoritesButton").textContent = `♡ Salvos (${favorites.size})`;
    $("favoritesButton").setAttribute("aria-pressed", String(favoritesOnly));
    $("clearSearch").hidden = !$("searchInput").value;
    const list = $("results");
    list.replaceChildren();
    if (!filtered.length) {
      const message = document.createElement("p");
      message.className = "empty-results";
      message.textContent = favoritesOnly
        ? "Nenhum livro salvo neste filtro. Abra um volume e toque em Salvar."
        : "Nenhum livro encontrado. Experimente outro título ou limpe os filtros.";
      list.append(message);
    }
    for (const book of filtered.slice(0, limit)) {
      const button = document.createElement("button");
      button.className = "result";
      button.dataset.bookId = book.id;
      button.setAttribute("aria-pressed", String(book.id === selectedId));
      button.setAttribute(
        "aria-label",
        `Selecionar ${book.title}, ${book.category}`,
      );
      const spine = document.createElement("span");
      spine.className = "result-spine";
      spine.style.background = book.color;
      spine.setAttribute("aria-hidden", "true");
      const info = document.createElement("span");
      info.className = "result-info";
      const title = document.createElement("strong");
      title.textContent = book.baseTitle;
      const category = document.createElement("small");
      category.textContent = `${book.category}${favorites.has(book.id) ? " · Salvo" : ""}`;
      const volume = document.createElement("span");
      volume.className = "volume";
      volume.textContent = `V.${String(book.volume).padStart(2, "0")}`;
      info.append(title, category);
      button.append(spine, info, volume);
      button.addEventListener("click", () => onSelect(book));
      list.append(button);
    }
    $("loadMore").hidden = filtered.length <= limit;
    $("loadMore").textContent =
      `Ver mais ${Math.min(pageSize, Math.max(0, filtered.length - limit))} volumes`;
    $("visibleCount").textContent =
      `${Math.min(limit, filtered.length)} de ${filtered.length}`;
  }
  function refresh() {
    limit = pageSize;
    render();
    $("results").scrollTop = 0;
  }
  $("searchInput").addEventListener("input", refresh);
  $("clearSearch").addEventListener("click", () => {
    $("searchInput").value = "";
    refresh();
    $("searchInput").focus();
  });
  $("categories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    category = button.dataset.category;
    for (const chip of document.querySelectorAll("[data-category]"))
      chip.setAttribute("aria-pressed", String(chip === button));
    refresh();
  });
  $("favoritesButton").addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    refresh();
  });
  $("resetFilters").addEventListener("click", () => {
    category = "Todos";
    favoritesOnly = false;
    $("searchInput").value = "";
    for (const chip of document.querySelectorAll("[data-category]"))
      chip.setAttribute(
        "aria-pressed",
        String(chip.dataset.category === "Todos"),
      );
    refresh();
  });
  $("loadMore").addEventListener("click", () => {
    const previous = limit;
    limit += pageSize;
    render();
    $("results").children[previous]?.focus({ preventScroll: false });
  });
  render();
  return {
    has: (book) => favorites.has(book.id),
    toggle(book) {
      favorites.has(book.id)
        ? favorites.delete(book.id)
        : favorites.add(book.id);
      saveSetting("favorites", [...favorites]);
      render();
      onFavorite(book, favorites.has(book.id));
    },
    mark(book) {
      selectedId = book?.id ?? null;
      for (const button of $("results").children)
        if (button.dataset.bookId)
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.bookId === selectedId),
          );
    },
  };
}