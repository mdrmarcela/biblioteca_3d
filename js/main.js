import { createEngine } from "./core/engine.js";
import { createPrimitives } from "./core/primitives.js";
import { createTextures } from "./core/textures.js";
import { buildRoom } from "./scene/room.js";
import { buildShelves } from "./scene/shelves.js";
import { buildFurniture } from "./scene/furniture.js";
import { buildLights } from "./scene/lighting.js";
import { buildParticles } from "./scene/particles.js";
import { createInterface } from "./ui/interface.js";

export function start() {
  const engine = createEngine(document.getElementById("scene"));
  const ctx = {
    ...engine,
    books: [],
    bookHitTargets: [],
    animatedObjects: {},
    primitives: createPrimitives(engine.scene),
    textures: createTextures(engine.renderer),
  };
  buildRoom(ctx);
  buildShelves(ctx);
  buildFurniture(ctx);
  buildLights(ctx);
  buildParticles(ctx);
  const ui = createInterface(ctx);
  let previous = performance.now(),
    elapsed = 0,
    animationId = null;
  function frame(now) {
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    const reduced = ui.reducedMotion.matches || ui.paused;
    ui.cameraControl.update(now);
    ui.selection.update(dt, reduced);
    if (!reduced) {
      elapsed += dt;
      ctx.animatedObjects.globe.rotation.y += dt * 0.12;
      ctx.animatedObjects.minuteHand.rotation.z = -elapsed * 0.035;
      const dust = ctx.animatedObjects.dust;
      if (dust.system.visible) {
        for (let i = 0; i < dust.count; i++) {
          const offset = i * 3;
          dust.positions[offset + 1] += dust.speeds[i] * dt;
          dust.positions[offset] +=
            Math.sin(elapsed * 0.3 + i * 2.3) * 0.06 * dt;
          if (dust.positions[offset + 1] > 5.8)
            dust.positions[offset + 1] = 0.3;
        }
        dust.system.geometry.attributes.position.needsUpdate = true;
      }
    }
    ctx.controls.update();
    ctx.renderer.render(ctx.scene, ctx.camera);
    animationId = requestAnimationFrame(frame);
  }
  function resume() {
    previous = performance.now();
    if (animationId === null) animationId = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = null;
      ui.cameraControl.stopTour();
    } else resume();
  });
  engine.renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(animationId);
    animationId = null;
    document.getElementById("errorMessage").textContent =
      "A renderização 3D foi interrompida pelo navegador. Recarregue a página e experimente a qualidade Leve.";
    document.getElementById("error").hidden = false;
  });
  engine.renderer.render(engine.scene, engine.camera);
  document.getElementById("loading").hidden = true;
  document.getElementById("app").removeAttribute("inert");
  resume();
}