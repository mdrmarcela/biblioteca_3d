// Cria o controlador responsável pelas janelas modais.
export function createDialog() {

  // Recupera o elemento HTML que representa a janela modal.
  const dialog = document.getElementById("modal");

  // Armazena o elemento que possuía o foco
  // antes da abertura da janela modal.
  let returnFocus = null;

  // Função responsável pelo fechamento da janela.
  const close = () => dialog.close();

  // Associa o evento de clique do botão de fechamento
  // à função responsável por fechar a janela.
  document.getElementById("modalClose").addEventListener("click", close);

  // Detecta cliques na janela modal ou em sua área externa.
  dialog.addEventListener("click", (event) => {

    // Obtém as dimensões e os limites da janela
    // em relação à área de visualização do navegador.
    const rect = dialog.getBoundingClientRect();

    // Verifica se o clique ocorreu fora dos limites da janela.
    if (
      event.target === dialog &&
      (
        event.clientX < rect.left ||   // Esquerda
        event.clientX > rect.right ||  // Direita
        event.clientY < rect.top ||    // Acima
        event.clientY > rect.bottom    // Abaixo
      )
    )

      // Fecha a janela quando o usuário clica fora dela.
      close();
  });

  // Detecta o fechamento da janela modal.
  dialog.addEventListener(
    "close",
    () =>

      // Verifica se o elemento que possuía o foco
      // anteriormente ainda existe no DOM.
      returnFocus?.isConnected &&

      // Restaura o foco sem alterar a posição
      // de rolagem da página.
      returnFocus.focus({ preventScroll: true }),
  );

  // Disponibiliza os métodos para os demais módulos.
  return {

    // Getter que informa se a janela está aberta.
    get isOpen() {
      return dialog.open;
    },

    // Disponibiliza a função de fechamento.
    close,

    // Abre a janela modal com um conteúdo HTML específico.
    open(html) {

      // Armazena o elemento que está atualmente em foco.
      returnFocus = document.activeElement;

      // Insere dinamicamente o conteúdo HTML da janela.
      document.getElementById("modalContent").innerHTML = html;

      // Abre a janela em modo modal,
      // impedindo interações com o restante da página.
      dialog.showModal();

      // Direciona o foco para o botão de fechamento,
      // facilitando a navegação pelo teclado.
      document.getElementById("modalClose").focus();
    },
  };
}