// Importa as funções responsáveis pela leitura e
// pelo armazenamento das preferências do usuário.
import { readSetting, saveSetting } from "../utils/storage.js";

// Cria o controlador do ambiente tridimensional.
export function createEnvironment({
  scene,                      // Cena tridimensional
  renderer,                   // Renderizador do Three.js
  animatedObjects: objects,   // Objetos do ambiente
  setQuality,                 // Função que altera a qualidade gráfica
}) {

  // Recupera as configurações salvas pelo usuário.
  // Caso não existam, utiliza os valores padrão.
  let night = readSetting("night", false) === true;
  let lamp = readSetting("lamp", true) !== false;
  let quality = readSetting("quality", "balanced");

  // Garante que a qualidade gráfica seja uma opção válida.
  if (!["balanced", "low"].includes(quality)) quality = "balanced";

  // Altera as características do ambiente entre dia e noite.
  function applyDay() {

    // Define a intensidade da iluminação ambiente.
    objects.ambient.intensity = night ? 0.28 : 0.82;

    // Define a intensidade da luz que representa o sol.
    objects.sun.intensity = night ? 0.18 : 2.5;

    // Controla a intensidade da iluminação complementar.
    objects.fill.intensity = night ? 29 : 52;

    // Ajusta a exposição da renderização,
    // modificando a luminosidade da imagem final.
    renderer.toneMappingExposure = night ? 1.25 : 1.55;

    // Altera a cor de fundo da cena.
    scene.background.set(night ? "#11121b" : "#18151d");

    // Altera a cor da neblina conforme o período do dia.
    scene.fog.color.set(night ? "#171824" : "#252027");

    // Alterna a textura do céu entre dia e noite.
    objects.sky.material.map = night
      ? objects.nightSky
      : objects.daySky;

    // Sinaliza ao Three.js que o material foi modificado
    // e precisa ser atualizado.
    objects.sky.material.needsUpdate = true;

    // Obtém o botão responsável pela alternância de dia e noite.
    const button = document.getElementById("dayButton");

    // Atualiza o estado acessível do botão.
    button.setAttribute("aria-pressed", String(night));

    // Atualiza o texto apresentado no botão.
    button.textContent = night ? "☾ Noite" : "☀ Dia";

    // Atualiza a descrição da iluminação atual na interface.
    document.getElementById("ambienceLabel").textContent = night
      ? "Luzes da noite"
      : "Luz da manhã";
  }

  // Controla o estado das luminárias do ambiente.
  function applyLamp() {

    // Ativa ou desativa a fonte de luz da mesa.
    objects.deskLight.visible = lamp;

    // Controla a emissão luminosa do material da lâmpada.
    objects.lampBulb.material.emissiveIntensity = lamp ? 2.6 : 0;

    // A luminária de canto acompanha o mesmo estado.
    objects.cornerLight.visible = lamp;

    // Controla a emissão luminosa da lâmpada de canto.
    objects.cornerBulb.material.emissiveIntensity = lamp ? 2.6 : 0;

    // Controla a aparência iluminada da cúpula da luminária.
    objects.cornerShade.material.emissiveIntensity = lamp ? 0.7 : 0;

    // Obtém o botão responsável pelo controle das luminárias.
    const button = document.getElementById("lampButton");

    // Atualiza o estado acessível e o texto do botão.
    button.setAttribute("aria-pressed", String(lamp));
    button.textContent = lamp ? "◉ Luz acesa" : "○ Luz apagada";
  }

  // Aplica as configurações de qualidade gráfica.
  function applyQuality(value) {

    // Atualiza a variável que armazena a qualidade atual.
    quality = value;

    // Executa a função responsável por configurar
    // a qualidade gráfica da renderização.
    setQuality(value);

    // Salva a preferência do usuário.
    saveSetting("quality", value);

    // Atualiza a opção selecionada na interface.
    document.getElementById("qualitySelect").value = value;

    // Desativa a exibição das partículas de poeira
    // quando a qualidade gráfica está no modo baixo.
    objects.dust.system.visible = value !== "low";
  }

  // Aplica as configurações iniciais ao carregar o ambiente.
  applyDay();
  applyLamp();
  applyQuality(quality);

  // Disponibiliza os métodos para outras partes da aplicação.
  return {

    // Alterna entre o ambiente diurno e noturno.
    toggleDay() {

      // Inverte o valor booleano atual.
      night = !night;

      // Aplica as novas características de iluminação.
      applyDay();

      // Salva a preferência do usuário.
      saveSetting("night", night);
    },

    // Alterna entre luminárias ligadas e desligadas.
    toggleLamp() {

      // Inverte o estado atual das luminárias.
      lamp = !lamp;

      // Atualiza as fontes de luz e seus materiais.
      applyLamp();

      // Salva a preferência do usuário.
      saveSetting("lamp", lamp);
    },

    // Disponibiliza a função de alteração da qualidade gráfica.
    setQuality: applyQuality,
  };
}