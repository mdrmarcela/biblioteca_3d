// Importa as funções de normalização de textos
// e armazenamento das preferências do usuário.
import { normalize, readSetting, saveSetting } from "../utils/storage.js";

// Cria o controlador do catálogo da biblioteca.
// books: array contendo os livros da biblioteca.
// onSelect: função executada ao selecionar um livro.
// onFavorite: função executada ao alterar um favorito.
export function createCatalog(books, onSelect, onFavorite) {

  // Função auxiliar para acessar elementos HTML pelo ID.
  const $ = (id) => document.getElementById(id);

  // Recupera os favoritos armazenados anteriormente.
  const saved = readSetting("favorites", []);

  // Cria um conjunto contendo todos os identificadores
  // válidos dos livros existentes no catálogo.
  const validIds = new Set(books.map((book) => book.id));

  // Cria um conjunto de favoritos, mantendo apenas
  // identificadores válidos e eliminando duplicidades.
  const favorites = new Set(
    (Array.isArray(saved) ? saved : []).filter((id) => validIds.has(id)),
  );

  // Define a quantidade inicial de resultados exibidos
  // e a quantidade adicionada ao clicar em "Ver mais".
  const pageSize = 12;

  // Armazena os estados atuais dos filtros e da seleção.
  let category = "Todos",     // Categoria selecionada
    favoritesOnly = false,    // Exibição exclusiva de favoritos
    limit = pageSize,         // Limite de resultados exibidos
    selectedId = null;        // Identificador do livro selecionado

  // =====================================================
  // FILTRAGEM E ORDENAÇÃO DOS LIVROS
  // =====================================================

  function filteredBooks() {

    // Recupera o texto digitado no campo de pesquisa,
    // remove espaços das extremidades e normaliza o conteúdo.
    const query = normalize($("searchInput").value.trim());

    return books

      // Filtra os livros de acordo com três critérios.
      .filter(
        (book) =>

          // Verifica se o livro pertence à categoria selecionada.
          (category === "Todos" || book.category === category) &&

          // Caso o filtro de favoritos esteja ativo,
          // mantém apenas os livros salvos.
          (!favoritesOnly || favorites.has(book.id)) &&

          // Verifica se o título ou a categoria contém
          // o texto pesquisado pelo usuário.
          normalize(book.title + " " + book.category).includes(query),
      )

      // Ordena os resultados alfabeticamente pelo título.
      // Caso os títulos sejam iguais, ordena pelo volume.
      .sort(
        (a, b) =>
          a.baseTitle.localeCompare(b.baseTitle, "pt-BR") ||
          a.volume - b.volume,
      );
  }

  // =====================================================
  // ATUALIZAÇÃO DA INTERFACE DO CATÁLOGO
  // =====================================================

  function render() {

    // Obtém os livros que atendem aos filtros atuais.
    const filtered = filteredBooks();

    // Atualiza a quantidade total de volumes do catálogo.
    $("bookCount").textContent = `${books.length} volumes`;

    // Atualiza a quantidade de resultados encontrados,
    // tratando corretamente singular e plural.
    $("resultCount").textContent =
      `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"}`;

    // Atualiza o contador de livros favoritos.
    $("favoritesButton").textContent = `♡ Salvos (${favorites.size})`;

    // Atualiza o estado acessível do botão de favoritos.
    $("favoritesButton").setAttribute("aria-pressed", String(favoritesOnly));

    // Exibe o botão de limpar pesquisa somente
    // quando existe algum texto digitado.
    $("clearSearch").hidden = !$("searchInput").value;

    // Obtém o elemento responsável pela lista de resultados.
    const list = $("results");

    // Remove os resultados anteriores antes de reconstruir a lista.
    list.replaceChildren();

    // Caso nenhum livro corresponda aos filtros,
    // apresenta uma mensagem informativa ao usuário.
    if (!filtered.length) {

      // Cria dinamicamente um elemento de parágrafo.
      const message = document.createElement("p");

      message.className = "empty-results";

      // Define uma mensagem conforme o filtro utilizado.
      message.textContent = favoritesOnly
        ? "Nenhum livro salvo neste filtro. Abra um volume e toque em Salvar."
        : "Nenhum livro encontrado. Experimente outro título ou limpe os filtros.";

      list.append(message);
    }

    // =====================================================
    // CONSTRUÇÃO DINÂMICA DOS RESULTADOS
    // =====================================================

    // Percorre somente a quantidade de livros
    // permitida pelo limite atual de exibição.
    for (const book of filtered.slice(0, limit)) {

      // Cria um botão para representar cada livro.
      const button = document.createElement("button");

      button.className = "result";

      // Associa o identificador do livro ao elemento HTML
      // utilizando um atributo personalizado data-book-id.
      button.dataset.bookId = book.id;

      // Indica se o livro está atualmente selecionado.
      button.setAttribute("aria-pressed", String(book.id === selectedId));

      // Adiciona uma descrição para leitores de tela.
      button.setAttribute(
        "aria-label",
        `Selecionar ${book.title}, ${book.category}`,
      );

      // Cria uma representação visual da lombada.
      const spine = document.createElement("span");
      spine.className = "result-spine";

      // Utiliza a mesma cor associada ao livro tridimensional.
      spine.style.background = book.color;

      // Oculta o elemento decorativo dos leitores de tela.
      spine.setAttribute("aria-hidden", "true");

      // Cria um elemento para agrupar as informações do livro.
      const info = document.createElement("span");
      info.className = "result-info";

      // Cria o elemento contendo o título.
      const title = document.createElement("strong");
      title.textContent = book.baseTitle;

      // Cria o elemento contendo a categoria
      // e indica se o livro está salvo.
      const category = document.createElement("small");

      category.textContent =
        `${book.category}${favorites.has(book.id) ? " · Salvo" : ""}`;

      // Cria o elemento responsável pelo número do volume.
      const volume = document.createElement("span");
      volume.className = "volume";

      // Formata o número do volume com pelo menos dois dígitos.
      volume.textContent = `V.${String(book.volume).padStart(2, "0")}`;

      // Agrupa o título e a categoria.
      info.append(title, category);

      // Monta a estrutura visual completa do resultado.
      button.append(spine, info, volume);

      // Ao clicar no resultado, executa a função de seleção
      // recebida de outro módulo da aplicação.
      button.addEventListener("click", () => onSelect(book));

      // Adiciona o resultado à lista HTML.
      list.append(button);
    }

    // =====================================================
    // CONTROLE DA PAGINAÇÃO INCREMENTAL
    // =====================================================

    // Oculta o botão "Ver mais" quando todos
    // os resultados já estão sendo exibidos.
    $("loadMore").hidden = filtered.length <= limit;

    // Calcula quantos volumes ainda podem ser adicionados
    // na próxima expansão da lista.
    $("loadMore").textContent =
      `Ver mais ${Math.min(pageSize, Math.max(0, filtered.length - limit))} volumes`;

    // Informa quantos resultados estão visíveis
    // em relação à quantidade total encontrada.
    $("visibleCount").textContent =
      `${Math.min(limit, filtered.length)} de ${filtered.length}`;
  }

  // Reinicia o limite de resultados, atualiza a interface
  // e retorna a rolagem da lista ao início.
  function refresh() {
    limit = pageSize;
    render();
    $("results").scrollTop = 0;
  }

  // =====================================================
  // EVENTOS DE PESQUISA
  // =====================================================

  // Atualiza os resultados sempre que o usuário
  // modifica o conteúdo do campo de pesquisa.
  $("searchInput").addEventListener("input", refresh);

  // Limpa o campo de pesquisa.
  $("clearSearch").addEventListener("click", () => {

    $("searchInput").value = "";

    // Atualiza os resultados.
    refresh();

    // Retorna o foco ao campo de pesquisa.
    $("searchInput").focus();
  });

  // =====================================================
  // FILTRO POR CATEGORIA
  // =====================================================

  // Utiliza delegação de eventos para controlar
  // os botões de categorias pelo elemento pai.
  $("categories").addEventListener("click", (event) => {

    // Identifica o botão de categoria mais próximo
    // do elemento que recebeu o clique.
    const button = event.target.closest("[data-category]");

    // Ignora cliques que não correspondem a uma categoria.
    if (!button) return;

    // Atualiza a categoria selecionada.
    category = button.dataset.category;

    // Atualiza o estado acessível de todos os filtros.
    for (const chip of document.querySelectorAll("[data-category]"))
      chip.setAttribute("aria-pressed", String(chip === button));

    refresh();
  });

  // =====================================================
  // FILTRO DE FAVORITOS
  // =====================================================

  // Alterna entre exibir todos os livros
  // ou somente os livros favoritos.
  $("favoritesButton").addEventListener("click", () => {

    favoritesOnly = !favoritesOnly;

    refresh();
  });

  // =====================================================
  // RESTAURAÇÃO DOS FILTROS
  // =====================================================

  $("resetFilters").addEventListener("click", () => {

    // Restaura os valores padrão dos filtros.
    category = "Todos";
    favoritesOnly = false;
    $("searchInput").value = "";

    // Atualiza o estado dos botões de categorias.
    for (const chip of document.querySelectorAll("[data-category]"))
      chip.setAttribute(
        "aria-pressed",
        String(chip.dataset.category === "Todos"),
      );

    refresh();
  });

  // =====================================================
  // EXIBIÇÃO DE MAIS RESULTADOS
  // =====================================================

  $("loadMore").addEventListener("click", () => {

    // Armazena o limite anterior de resultados.
    const previous = limit;

    // Aumenta a quantidade de resultados exibidos em 12.
    limit += pageSize;

    // Reconstrói a lista com os novos resultados.
    render();

    // Direciona o foco para o primeiro resultado adicionado,
    // caso esse elemento exista.
    $("results").children[previous]?.focus({ preventScroll: false });
  });

  // Realiza a primeira exibição do catálogo.
  render();

  // =====================================================
  // MÉTODOS DISPONIBILIZADOS PARA OUTROS MÓDULOS
  // =====================================================

  return {

    // Verifica se determinado livro está salvo nos favoritos.
    has: (book) => favorites.has(book.id),

    // Adiciona ou remove um livro dos favoritos.
    toggle(book) {

      // Caso o livro já esteja salvo, remove seu ID.
      // Caso contrário, adiciona seu ID ao conjunto.
      favorites.has(book.id)
        ? favorites.delete(book.id)
        : favorites.add(book.id);

      // Converte o Set em um array e salva os favoritos.
      saveSetting("favorites", [...favorites]);

      // Atualiza a interface do catálogo.
      render();

      // Comunica a alteração aos demais módulos.
      onFavorite(book, favorites.has(book.id));
    },

    // Atualiza visualmente o livro selecionado no catálogo.
    mark(book) {

      // Recupera o ID do livro ou utiliza null
      // caso nenhum livro esteja selecionado.
      selectedId = book?.id ?? null;

      // Percorre os resultados atualmente exibidos.
      for (const button of $("results").children)

        // Verifica se o elemento representa um livro.
        if (button.dataset.bookId)

          // Atualiza o estado de seleção de cada resultado.
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.bookId === selectedId),
          );
    },
  };
}