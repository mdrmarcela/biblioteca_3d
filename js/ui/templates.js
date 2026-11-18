export const aboutTemplate = `
  <div class="eyebrow">Trabalho final · Computação Gráfica</div>
  <h2 id="modalTitle">Como a biblioteca foi construída?</h2>
  <p>Projeto tridimensional interativo desenvolvido com <b>JavaScript, Three.js e WebGL</b>. Todos os objetos foram modelados por código, sem modelos externos, e as imagens usadas como texturas são geradas localmente.</p>
  <div class="requirement-grid">
  <div class="requirement"><b>01 · Cena 3D</b><span>Ambiente completo criado com THREE.Scene e renderizado via WebGLRenderer.</span></div>
  <div class="requirement"><b>02 · Geometrias</b><span>Box, Sphere, Cylinder, Plane, Torus e TubeGeometry em objetos compostos.</span></div>
  <div class="requirement"><b>03 · Transformações</b><span>Posições, rotações e escalas aplicadas em estantes, livros e mobiliário.</span></div>
  <div class="requirement"><b>04 · Câmera</b><span>PerspectiveCamera, OrbitControls, zoom e movimentos programados.</span></div>
  <div class="requirement"><b>05 · Materiais</b><span>MeshStandardMaterial, cores, rugosidade, metalicidade e transparência.</span></div>
  <div class="requirement"><b>06 · Iluminação</b><span>Luzes ambiente, direcional e pontuais, com sombras e modo noturno.</span></div>
  <div class="requirement"><b>07 · Texturas</b><span>Imagens CanvasTexture mapeadas por UV no piso, parede, tapete, lombadas e globo.</span></div>
  <div class="requirement"><b>08 · Animação</b><span>O loop de renderização movimenta poeira, globo, relógio e livros.</span></div>
  <div class="requirement"><b>09 · Interação</b><span>Raycaster para clique em livros, filtros, busca, teclas, botões e controles.</span></div>
  <div class="requirement"><b>10 · Organização</b><span>Módulos separados para cena, texturas, catálogo, controles e interface.</span></div>
  <div class="requirement"><b>Extra · Partículas</b><span>175 partículas em BufferGeometry e Points com atualização dinâmica.</span></div>
  <div class="requirement"><b>Extra · Curvas</b><span>CatmullRomCurve3 e TubeGeometry modelam hastes e cabos curvos.</span></div>
  </div>
  <h3>Atalhos para a demonstração</h3><p><b>1</b> Visão geral · <b>2</b> Estantes · <b>3</b> Mesa · <b>4</b> Janela · <b>L</b> Luminária · <b>N</b> Noite/dia · <b>T</b> Visita guiada · <b>Esc</b> Fechar/Recolocar.</p>
`;
