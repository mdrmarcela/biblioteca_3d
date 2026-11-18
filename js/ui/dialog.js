export function createDialog() {
  const dialog = document.getElementById("modal");
  let returnFocus = null;
  const close = () => dialog.close();
  document.getElementById("modalClose").addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      close();
  });
  dialog.addEventListener(
    "close",
    () =>
      returnFocus?.isConnected && returnFocus.focus({ preventScroll: true }),
  );
  return {
    get isOpen() {
      return dialog.open;
    },
    close,
    open(html) {
      returnFocus = document.activeElement;
      document.getElementById("modalContent").innerHTML = html;
      dialog.showModal();
      document.getElementById("modalClose").focus();
    },
  };
}
