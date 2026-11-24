// Importa a biblioteca Three.js e o módulo responsável
// pelos controles de movimentação orbital da câmera.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Inicializa o motor gráfico dentro de um container HTML.
export function createEngine(container) {

  // Cria a cena que armazenará os objetos tridimensionais,
  // as fontes de iluminação e os demais elementos.
  const scene = new THREE.Scene();

  // Define a cor de fundo da cena.
  scene.background = new THREE.Color("#18151d");

  // Adiciona uma neblina exponencial, que aumenta
  // conforme a distância dos objetos em relação à câmera.
  // O segundo parâmetro representa a densidade da neblina.
  scene.fog = new THREE.FogExp2("#252027", 0.013);

  // Cria uma câmera com projeção em perspectiva.
  // Parâmetros:
  // 48: campo de visão vertical em graus.
  // 1: proporção inicial entre largura e altura.
  // 0.1: distância mínima do plano de visualização.
  // 90: distância máxima do plano de visualização.
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);

  // Define a posição inicial da câmera nos eixos X, Y e Z.
  camera.position.set(7, 4.8, 12);

  // Cria o renderizador responsável por gerar
  // a representação visual da cena utilizando WebGL.
  const renderer = new THREE.WebGLRenderer({

    // Suaviza as bordas dos objetos tridimensionais.
    antialias: true,

    // Solicita ao navegador uma GPU de maior desempenho,
    // quando disponível.
    powerPreference: "high-performance",
  });

  // Define o espaço de cores utilizado na imagem final.
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Utiliza uma técnica de Tone Mapping com aparência
  // cinematográfica para representar a luminosidade da cena.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Define a exposição inicial da renderização.
  renderer.toneMappingExposure = 1.55;

  // Habilita a geração de sombras.
  renderer.shadowMap.enabled = true;

  // Define uma técnica de filtragem que suaviza
  // as bordas das sombras projetadas.
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Adiciona uma descrição acessível ao canvas.
  renderer.domElement.setAttribute(
    "aria-label",
    "Biblioteca 3D. Use o catálogo ou os botões de vista para explorar pelo teclado.",
  );

  // Insere o canvas gerado pelo renderizador na página HTML.
  container.append(renderer.domElement);

  // Cria os controles de navegação orbital,
  // permitindo rotacionar e aproximar a câmera.
  const controls = new OrbitControls(camera, renderer.domElement);

  // Define o ponto central observado pela câmera.
  controls.target.set(0, 2.35, -2.2);

  // Habilita a suavização dos movimentos da câmera.
  controls.enableDamping = true;

  // Define o fator de amortecimento dos movimentos.
  controls.dampingFactor = 0.065;

  // Desabilita o deslocamento lateral do alvo da câmera.
  controls.enablePan = false;

  // Define os limites de aproximação e afastamento
  // da câmera em relação ao alvo.
  controls.minDistance = 3;
  controls.maxDistance = 22;

  // Limita a movimentação vertical da câmera,
  // utilizando ângulos expressos em radianos.
  controls.minPolarAngle = 0.3;
  controls.maxPolarAngle = Math.PI / 2.05;

  // Limita a movimentação horizontal da câmera,
  // evitando que ela orbite completamente a biblioteca.
  controls.minAzimuthAngle = -Math.PI * 0.43;
  controls.maxAzimuthAngle = Math.PI * 0.43;

  // Define uma região tridimensional que limita
  // a movimentação da câmera.
  // Os vetores representam os limites mínimos e máximos
  // permitidos para cada um dos três eixos.
  const bounds = {
    min: new THREE.Vector3(-7.3, 0.7, -5.6),
    max: new THREE.Vector3(7.3, 6.0, 16),
  };

  // Detecta alterações nos controles da câmera.
  controls.addEventListener("change", () => {

    // Armazena uma cópia da posição antes da verificação.
    const before = camera.position.clone();

    // Restringe cada coordenada da câmera aos limites definidos.
    // Evita que ela ultrapasse determinados limites da sala.
    camera.position.clamp(bounds.min, bounds.max);

    // Caso a posição tenha sido corrigida,
    // redireciona a câmera para o ponto observado.
    if (!camera.position.equals(before))
      camera.lookAt(controls.target);
  });

  // Define a qualidade gráfica inicial como equilibrada.
  let quality = "balanced";

  // Atualiza as dimensões da renderização quando
  // o tamanho do container é alterado.
  function resize() {

    // Obtém a largura e a altura atuais do container.
    const { width, height } = container.getBoundingClientRect();

    // Calcula a proporção da câmera para evitar
    // distorções na representação dos objetos.
    camera.aspect = width / height;

    // Recalcula a matriz de projeção da câmera
    // após a alteração da proporção.
    camera.updateProjectionMatrix();

    // Ajusta a densidade de pixels da renderização.
    // Limita a proporção a 1 no modo baixo
    // e a 1.6 no modo equilibrado.
    renderer.setPixelRatio(
      Math.min(devicePixelRatio || 1, quality === "low" ? 1 : 1.6),
    );

    // Atualiza as dimensões do canvas.
    renderer.setSize(width, height);
  }

  // Altera as configurações de qualidade gráfica.
  function setQuality(value) {

    // Armazena o novo nível de qualidade.
    quality = value;

    // Desabilita as sombras no modo de baixa qualidade,
    // reduzindo o custo computacional da renderização.
    renderer.shadowMap.enabled = value !== "low";

    // Percorre todos os objetos da cena.
    scene.traverse((object) => {

      // Verifica se o objeto possui um único material
      // ou um conjunto de materiais.
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      // Remove valores inexistentes e sinaliza que
      // os materiais precisam ser atualizados.
      materials
        .filter(Boolean)
        .forEach((material) => (material.needsUpdate = true));
    });

    // Atualiza a resolução conforme a qualidade selecionada.
    resize();
  }

  // Cria um observador que detecta alterações
  // nas dimensões do container.
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  // Realiza o dimensionamento inicial da renderização.
  resize();

  // Atualiza os controles com as configurações iniciais.
  controls.update();

  // Disponibiliza os componentes do motor gráfico
  // para utilização pelos demais módulos da aplicação.
  return { scene, camera, renderer, controls, resize, setQuality };
}