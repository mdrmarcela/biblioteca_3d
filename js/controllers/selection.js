import * as THREE from "three";

export function createSelection(ctx, cameraControl, onChange) {
  const { scene, camera, renderer, books } = ctx;
  let selected = null,
    down = null,
    hovered = null,
    lastHover = 0;
  const canvas = renderer.domElement,
    pointer = new THREE.Vector2(),
    ray = new THREE.Raycaster();
  // Inclui os obstáculos: não seleciona livros através da mesa ou das estantes.
  const pickables = [];
  scene.traverse((object) => {
    if (object.isMesh) pickables.push(object);
  });
  function pick(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    scene.updateMatrixWorld(true);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(pickables, false)[0];
    if (!hit) return null;
    let object = hit.object;
    while (object) {
      if (object.userData.book) return object.userData.book;
      object = object.parent;
    }
    return null;
  }
  function select(book) {
    if (selected === book) return clear();
    if (selected) selected.group.userData.isSelected = false;
    selected = book;
    selected.group.userData.isSelected = true;
    cameraControl.stopTour();
    const focus = book.group.getWorldPosition(new THREE.Vector3());
    focus.y += 0.45;
    cameraControl.move(
      focus.clone().add(new THREE.Vector3(1.05, 0.5, 3.6)),
      focus,
    );
    onChange(book);
  }
  function clear() {
    if (!selected) return;
    selected.group.userData.isSelected = false;
    selected = null;
    onChange(null);
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) {
      down = null;
      return;
    }
    down = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  canvas.addEventListener("pointerup", (event) => {
    const start = down;
    down = null;
    if (
      !start ||
      start.id !== event.pointerId ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
    )
      return;
    const book = pick(event);
    if (book) select(book);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (
      down ||
      event.pointerType !== "mouse" ||
      performance.now() - lastHover < 80
    )
      return;
    lastHover = performance.now();
    hovered = pick(event);
    canvas.style.cursor = hovered ? "pointer" : "grab";
  });
  const cancel = () => {
    down = null;
    hovered = null;
    canvas.style.cursor = "grab";
  };
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("pointerleave", cancel);
  return {
    select,
    clear,
    get selected() {
      return selected;
    },
    update(dt, reduced) {
      const smooth = reduced ? 1 : 1 - Math.exp(-dt * 9);
      for (const book of books) {
        const active = book === selected;
        book.group.position.z +=
          (book.baseZ + (active ? 0.47 : 0) - book.group.position.z) * smooth;
        book.group.rotation.y +=
          ((active ? -0.17 : 0) - book.group.rotation.y) * smooth;
        book.group.scale.setScalar(
          book.group.scale.x +
            ((active ? 1.075 : 1) - book.group.scale.x) * smooth,
        );
        book.mesh.material.emissive.set(
          active ? "#80501d" : book === hovered ? "#4b361c" : "#000000",
        );
        book.mesh.material.emissiveIntensity = 0.3;
      }
    },
  };
}