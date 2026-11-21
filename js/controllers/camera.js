import * as THREE from "three";

export const views = {
  overview: {
    pos: [7, 4.8, 12],
    target: [0, 2.35, -2.2],
    label: "Visão geral",
  },
  shelves: { pos: [0, 3.45, 5.9], target: [0, 2.5, -5.1], label: "Estantes" },
  table: {
    pos: [3.85, 3.05, 5.55],
    target: [0, 1.35, 1.4],
    label: "Mesa de leitura",
  },
  window: {
    pos: [-2.65, 4.1, 3.75],
    target: [-7.5, 3.5, -0.6],
    label: "Janela",
  },
};

export function createCameraController(
  { camera, controls },
  { reducedMotion, onView, onTour },
) {
  let tween = null,
    touring = false,
    index = 0,
    next = 0;
  function move(position, target, duration = 1100) {
    // Elimina a inércia anterior antes de iniciar uma transição programada.
    controls.enableDamping = false;
    controls.update();
    if (reducedMotion.matches) {
      camera.position.copy(position);
      controls.target.copy(target);
      controls.update();
      controls.enableDamping = true;
      tween = null;
      return;
    }
    tween = {
      start: performance.now(),
      duration,
      from: camera.position.clone(),
      to: position.clone(),
      fromTarget: controls.target.clone(),
      toTarget: target.clone(),
    };
  }
  function stopTour() {
    touring = false;
    onTour(false);
  }
  function showView(name, automated = false) {
    if (!automated) stopTour();
    const view = views[name];
    if (!view) return;
    move(
      new THREE.Vector3(...view.pos),
      new THREE.Vector3(...view.target),
      automated ? 1700 : 1100,
    );
    onView(name, view.label);
  }
  function toggleTour() {
    if (touring) return stopTour();
    touring = true;
    index = 0;
    next = 0;
    onTour(true);
  }
  controls.addEventListener("start", () => {
    tween = null;
    controls.enableDamping = true;
    stopTour();
    onView("", "Exploração livre");
  });
  return {
    move,
    showView,
    stopTour,
    toggleTour,
    update(now) {
      if (touring && now >= next) {
        showView(Object.keys(views)[index++ % 4], true);
        next = now + 6500;
      }
      if (!tween) return;
      const k = Math.min(1, (now - tween.start) / tween.duration),
        ease = k * k * (3 - 2 * k);
      camera.position.lerpVectors(tween.from, tween.to, ease);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, ease);
      if (k === 1) {
        tween = null;
        controls.enableDamping = true;
      }
    },
  };
}