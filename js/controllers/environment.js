import { readSetting, saveSetting } from "../utils/storage.js";

export function createEnvironment({
  scene,
  renderer,
  animatedObjects: objects,
  setQuality,
}) {
  let night = readSetting("night", false) === true;
  let lamp = readSetting("lamp", true) !== false;
  let quality = readSetting("quality", "balanced");
  if (!["balanced", "low"].includes(quality)) quality = "balanced";
  function applyDay() {
    objects.ambient.intensity = night ? 0.28 : 0.82;
    objects.sun.intensity = night ? 0.18 : 2.5;
    objects.fill.intensity = night ? 29 : 52;
    renderer.toneMappingExposure = night ? 1.25 : 1.55;
    scene.background.set(night ? "#11121b" : "#18151d");
    scene.fog.color.set(night ? "#171824" : "#252027");
    objects.sky.material.map = night ? objects.nightSky : objects.daySky;
    objects.sky.material.needsUpdate = true;
    const button = document.getElementById("dayButton");
    button.setAttribute("aria-pressed", String(night));
    button.textContent = night ? "☾ Noite" : "☀ Dia";
    document.getElementById("ambienceLabel").textContent = night
      ? "Luzes da noite"
      : "Luz da manhã";
  }
  function applyLamp() {
    objects.deskLight.visible = lamp;
    objects.lampBulb.material.emissiveIntensity = lamp ? 2.6 : 0;
    const button = document.getElementById("lampButton");
    button.setAttribute("aria-pressed", String(lamp));
    button.textContent = lamp ? "◉ Luz acesa" : "○ Luz apagada";
  }
  function applyQuality(value) {
    quality = value;
    setQuality(value);
    saveSetting("quality", value);
    document.getElementById("qualitySelect").value = value;
    objects.dust.system.visible = value !== "low";
  }
  applyDay();
  applyLamp();
  applyQuality(quality);
  return {
    toggleDay() {
      night = !night;
      applyDay();
      saveSetting("night", night);
    },
    toggleLamp() {
      lamp = !lamp;
      applyLamp();
      saveSetting("lamp", lamp);
    },
    setQuality: applyQuality,
  };
}
