// Script clássico: consegue mostrar uma orientação mesmo quando módulos não carregam.
const loading = document.getElementById("loading");
const error = document.getElementById("error");
function showFailure(message) {
  loading.hidden = true;
  error.hidden = false;
  document.getElementById("errorMessage").textContent = message;
}
if (location.protocol === "file:") {
  showFailure(
    "Abra a pasta no VS Code e use Open with Live Server no index.html. Outra opção é executar python servir.py na pasta do projeto. Os módulos precisam de um servidor local.",
  );
} else {
  import("./main.js")
    .then(({ start }) => start())
    .catch((reason) => {
      console.error(reason);
      showFailure(
        "Não foi possível iniciar a biblioteca. Confira se a pasta vendor está junto do projeto e se a aceleração de hardware/WebGL está disponível no navegador.",
      );
    });
}
document
  .getElementById("reloadButton")
  .addEventListener("click", () => location.reload());
