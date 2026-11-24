// Script clássico: consegue exibir mensagens de orientação
// mesmo quando os módulos JavaScript não carregam.

// Recupera os elementos responsáveis pelas telas
// de carregamento e de erro.
const loading = document.getElementById("loading");
const error = document.getElementById("error");

// Função responsável por apresentar mensagens de erro.
function showFailure(message) {

  // Oculta a tela de carregamento.
  loading.hidden = true;

  // Exibe a tela de erro.
  error.hidden = false;

  // Insere a mensagem de orientação na interface.
  document.getElementById("errorMessage").textContent = message;
}

// Verifica se o projeto foi aberto diretamente
// pelo sistema de arquivos, sem utilizar um servidor.
if (location.protocol === "file:") {

  // Orienta o usuário a executar o projeto
  // utilizando um servidor local.
  showFailure(
    "Abra a pasta no VS Code e use Open with Live Server no index.html. Outra opção é executar python servir.py na pasta do projeto. Os módulos precisam de um servidor local.",
  );

} else {

  // Realiza a importação dinâmica do módulo principal.
  // A operação é assíncrona e retorna uma Promise.
  import("./main.js")

    // Após o carregamento bem-sucedido do módulo,
    // recupera e executa a função start().
    .then(({ start }) => start())

    // Captura possíveis falhas durante a importação
    // ou a execução inicial da aplicação.
    .catch((reason) => {

      // Registra os detalhes técnicos do erro no console.
      console.error(reason);

      // Apresenta uma mensagem amigável ao usuário,
      // indicando possíveis causas do problema.
      showFailure(
        "Não foi possível iniciar a biblioteca. Confira se a pasta vendor está junto do projeto e se a aceleração de hardware/WebGL está disponível no navegador.",
      );
    });
}

// Associa o botão de recarregamento a um evento de clique.
document
  .getElementById("reloadButton")

  // Recarrega a página para tentar inicializar novamente.
  .addEventListener("click", () => location.reload());