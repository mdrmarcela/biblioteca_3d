# 📚 Biblioteca Aurora — Experiência 3D Interativa

**Biblioteca Aurora** é uma aplicação web tridimensional desenvolvida como trabalho final de **Computação Gráfica**. O projeto permite explorar uma biblioteca virtual, interagir com livros nas estantes e conhecer recursos de modelagem, iluminação, animação e interação em tempo real utilizando **JavaScript, Three.js e WebGL**.

O ambiente e seus objetos são construídos por código, sem modelos 3D externos. A aplicação funciona diretamente no navegador, por meio de um servidor HTTP local, e não exige banco de dados.

## ✨ Funcionalidades

- **Exploração do ambiente 3D:** navegação pela biblioteca com rotação da câmera e zoom.
- **Quatro vistas predefinidas:** visão geral, estantes, mesa de leitura e janela.
- **Visita guiada:** transição automática entre diferentes pontos da biblioteca.
- **Acervo interativo:** 144 volumes distribuídos em três coleções — **Literatura, Ciência e Fantasia**.
- **Seleção de livros:** clique em um livro na estante para destacá-lo e visualizar suas informações.
- **Catálogo pesquisável:** busca por título ou coleção, filtros por categoria e paginação dos resultados.
- **Favoritos:** possibilidade de salvar livros, com persistência no `localStorage` do navegador.
- **Controle de iluminação:** alternância entre dia e noite e acionamento das luminárias.
- **Animações:** movimento do globo, relógio, partículas de poeira e livros selecionados.
- **Ajustes de desempenho:** modos de qualidade *Equilibrada* e *Leve*, além de pausa das animações decorativas.
- **Interface responsiva e acessível:** controles adaptados a diferentes tamanhos de tela, navegação por teclado e suporte à preferência por movimento reduzido.

> **Nota:** os títulos, volumes e descrições pertencem a um acervo **fictício**, criado para demonstrar as funcionalidades. O botão **Conhecer a obra** abre informações do volume; não há leitura integral de livros digitais.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
| --- | --- |
| **HTML5** | Estrutura da página, controles, catálogo e painéis de informação. |
| **CSS3** | Estilização, layout e responsividade. |
| **JavaScript (ES Modules)** | Lógica, interações e organização dos módulos. |
| **Three.js** | Criação da cena, geometrias, materiais, câmera, iluminação e animações 3D. |
| **WebGL** | Renderização tridimensional no navegador por meio do Three.js. |
| **OrbitControls** | Rotação e zoom da câmera. |
| **LocalStorage** | Armazenamento local de favoritos e preferências. |
| **Python 3 (opcional)** | Inicialização de um servidor HTTP local por meio de `servir.py`. |

A biblioteca Three.js e o módulo OrbitControls já estão incluídos em `vendor/`. **Não é necessário instalar pacotes com `npm install` nem executar uma etapa de build.**

## 🚀 Como executar

### Pré-requisitos

- Navegador moderno com suporte a **WebGL** e módulos JavaScript.
- Um servidor HTTP local, como o **Live Server** do VS Code **ou** o script Python que acompanha o projeto.

### Opção 1 — Live Server no VS Code

1. Baixe ou clone este repositório e abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão **Live Server**, caso ainda não a tenha.
3. Clique com o botão direito em `index.html` e selecione **Open with Live Server**.
4. Aguarde a biblioteca carregar no navegador.

### Opção 2 — Servidor local com Python

No terminal, dentro da pasta do projeto, execute:

```bash
python servir.py
```

O script inicia um servidor local, tenta abrir o navegador automaticamente e utiliza a primeira porta disponível no intervalo **8000 a 8010**. Por exemplo:

```text
http://127.0.0.1:8000
```

Para encerrar o servidor, utilize `Ctrl + C` no terminal.

> **Importante:** não abra `index.html` diretamente pelo Explorador de Arquivos (`file://`). O projeto utiliza módulos JavaScript e precisa ser servido por HTTP.

## 🎮 Controles

### Mouse e toque

| Ação | Resultado |
| --- | --- |
| Arrastar a cena | Girar a câmera ao redor da biblioteca. |
| Roda do mouse ou gesto de pinça | Aproximar ou afastar a visualização. |
| Clicar ou tocar em um livro | Selecionar o volume e abrir seus detalhes. |
| Utilizar o catálogo | Buscar, filtrar e selecionar livros. |

### Atalhos do teclado

| Tecla | Ação |
| --- | --- |
| `1` | Visão geral. |
| `2` | Vista das estantes. |
| `3` | Vista da mesa de leitura. |
| `4` | Vista da janela. |
| `N` | Alternar dia/noite. |
| `L` | Ligar/desligar as luminárias. |
| `T` | Iniciar/parar a visita guiada. |
| `Esc` | Fechar detalhes ou ajustes e interromper a visita guiada. |
| `Tab` | Navegar pelos controles da interface. |

## 📁 Estrutura do projeto

```text
biblioteca_3d-main/
├── assets/
│   └── piso.jpg                  # Textura do piso
├── css/
│   ├── base.css                  # Estilos gerais
│   ├── layout.css                # Organização visual da interface
│   └── responsive.css            # Adaptação a diferentes telas
├── js/
│   ├── bootstrap.js              # Inicialização e tratamento de erros
│   ├── main.js                   # Montagem da cena e loop de animação
│   ├── controllers/
│   │   ├── camera.js             # Movimentação da câmera e visita guiada
│   │   ├── environment.js        # Iluminação, dia/noite e qualidade
│   │   └── selection.js          # Seleção de livros com Raycaster
│   ├── core/
│   │   ├── engine.js              # Cena, câmera, renderer e OrbitControls
│   │   ├── primitives.js          # Funções de criação de formas e materiais
│   │   └── textures.js            # Texturas de imagem e Canvas
│   ├── data/
│   │   └── catalog.js             # Títulos, descrições e paletas de cores
│   ├── scene/
│   │   ├── room.js                # Construção da sala
│   │   ├── shelves.js             # Estantes e livros
│   │   ├── furniture.js           # Móveis e elementos decorativos
│   │   ├── lighting.js            # Fontes de iluminação
│   │   └── particles.js           # Partículas de poeira
│   ├── ui/
│   │   ├── catalog.js             # Busca, filtros e favoritos
│   │   ├── dialog.js              # Janelas de diálogo
│   │   ├── interface.js           # Botões, painéis e eventos
│   │   └── templates.js           # Conteúdo das janelas informativas
│   └── utils/
│       └── storage.js             # Funções auxiliares e LocalStorage
├── vendor/
│   └── three/                    # Three.js, OrbitControls e licença MIT
├── index.html                    # Página principal
├── package.json                  # Metadados do projeto
├── servir.py                     # Servidor HTTP local opcional
└── README.md                     # Documentação do projeto
```

## 🧩 Como funciona

1. **Inicialização:** `index.html` carrega `bootstrap.js`, que importa e executa `start()` em `main.js`.
2. **Configuração gráfica:** `core/engine.js` cria `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer` e `OrbitControls`.
3. **Construção do ambiente:** os módulos em `scene/` geram piso, paredes, estantes, livros, mobiliário, luminárias e partículas.
4. **Interatividade:** os controladores gerenciam câmera, condições de iluminação e seleção dos livros; a seleção usa `THREE.Raycaster`.
5. **Interface:** os módulos em `ui/` conectam o ambiente tridimensional aos botões, catálogo, informações e favoritos.
6. **Renderização:** o `requestAnimationFrame()` atualiza os elementos animados e redesenha a cena continuamente enquanto a aplicação está ativa.

### Organização do acervo

O acervo contém **3 estantes**, com **4 prateleiras** cada e **12 livros por prateleira**:

```text
3 estantes × 4 prateleiras × 12 livros = 144 volumes
```

Cada coleção contém 12 títulos fictícios, representados em quatro volumes. Os livros são criados programaticamente em `js/scene/shelves.js`, com dados provenientes de `js/data/catalog.js`.

## 🎨 Conceitos de Computação Gráfica aplicados

- **Cena tridimensional:** uso de `THREE.Scene` e `WebGLRenderer`.
- **Modelagem geométrica:** composição de `BoxGeometry`, `SphereGeometry`, `CylinderGeometry`, `PlaneGeometry`, `TorusGeometry` e `TubeGeometry`.
- **Transformações:** posicionamento, rotação e escala de objetos; uso de `Matrix4` na modelagem de alguns elementos.
- **Câmera em perspectiva:** `PerspectiveCamera` com controle orbital e transições programadas.
- **Materiais:** `MeshStandardMaterial` e `MeshPhysicalMaterial`, com propriedades de cor, rugosidade, metalicidade, transparência e acabamento.
- **Texturização:** imagem aplicada ao piso e texturas geradas por Canvas em outros elementos do cenário.
- **Iluminação:** combinação de `AmbientLight`, `DirectionalLight` e luzes pontuais, com sombras.
- **Animação:** atualização por quadro com `requestAnimationFrame()` e cálculo do tempo entre quadros.
- **Seleção 3D:** identificação de objetos por interseção de raios (`Raycaster`).
- **Técnicas adicionais:** sistemas de partículas, curvas e geometria de revolução com `LatheGeometry`.

## 💾 Armazenamento e limitações

- Favoritos e algumas preferências são armazenados no **navegador atual** por meio de `localStorage`.
- O sistema **não utiliza backend, autenticação ou banco de dados**.
- O acervo é demonstrativo e não contém livros publicados para leitura.
- O desempenho da cena depende do navegador, dispositivo e disponibilidade de aceleração gráfica. Se necessário, selecione a qualidade **Leve** nos ajustes.