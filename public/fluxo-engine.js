/**
 * FLUXO SINTÁTICO V3.0 - ENGINE DE TRANSMUTAÇÃO
 */

const baseDeDados = [
    {
        "id": "camões_01",
        "autor": "Luís de Camões",
        "obra": "Os Lusíadas",
        "etapa_original": "As armas e os barões assinalados, / Que da ocidental praia Lusitana...",
        "mutacao_street": "Os brabos e a tropa assinalada, / Que saíram da costa de Portugal...",
        "mutacao_algoritmo": "STREAMS_ACTIVE: barões_rank_top; / SOURCE: lusitana_coast.sh;",
        "mutacao_mobile": "Tropas PT a navegar no Índico. 🚢 #História #Conquista"
    },
    {
        "id": "pessoa_01",
        "autor": "Fernando Pessoa",
        "obra": "Mensagem",
        "etapa_original": "Navegar é preciso; viver não é preciso.",
        "mutacao_street": "Sair da zona de conforto é o foco; o resto é detalhe.",
        "mutacao_algoritmo": "Route.start(); // life_stability = false;",
        "mutacao_mobile": "Foco no objetivo, a vida a gente resolve depois. 🌊"
    },
    {
        "id": "camões_02",
        "autor": "Luís de Camões",
        "obra": "Sonetos",
        "etapa_original": "Amor é fogo que arde sem se ver.",
        "mutacao_street": "Amor é uma vibe que bate e não avisa.",
        "mutacao_algoritmo": "if (status == 'love') { burn(invisible); }",
        "mutacao_mobile": "Aquele sentimento que consome mas ninguém vê. 🔥"
    },
    {
        "id": "pessoa_02",
        "autor": "Fernando Pessoa",
        "obra": "Mensagem (Mar Português)",
        "etapa_original": "Tudo vale a pena se a alma não é pequena.",
        "mutacao_street": "Vale o investimento se o mindset for grande.",
        "mutacao_algoritmo": "result = (effort / soul_size > 1) ? true : false;",
        "mutacao_mobile": "Se o propósito for real, o esforço compensa. ✨"
    }
];

// Elementos
const introFluxo = document.getElementById('intro-fluxo');
const manifestoBox = document.getElementById('manifesto-fluxo');
const activateBtn = document.getElementById('activate-btn');
const mainInterface = document.getElementById('pipeline-container');
const textDisplay = document.getElementById('text-display');
const authorTag = document.getElementById('author-tag');
const slider = document.getElementById('mutation-slider');
const statusReadout = document.getElementById('status-readout');
const canvas = document.getElementById('particle-layer');
const ctx = canvas.getContext('2d');

// Extrair cor primária do CSS
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
const rgbPrimary = primaryColor.startsWith('#') ? hexToRgb(primaryColor) : primaryColor;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '57, 255, 20';
}

let currentSample = null;
const stages = ["etapa_original", "mutacao_street", "mutacao_algoritmo", "mutacao_mobile"];

// 1. MANIFESTO (TELETIPO)
const manifestoText = [
    "A SINTAXE É UM FLUXO, NÃO UMA REGRA.",
    "Aqui, os clássicos perdem a rigidez. Observe como a estrutura da língua se molda ao contexto."
];

let lineIdx = 0, charIdx = 0;
function typeManifesto() {
    if (lineIdx < manifestoText.length) {
        if (charIdx === 0) manifestoBox.innerHTML += "<p></p>";
        const lines = manifestoBox.querySelectorAll('p');
        lines[lineIdx].innerHTML += manifestoText[lineIdx].charAt(charIdx);
        charIdx++;
        if (charIdx < manifestoText[lineIdx].length) setTimeout(typeManifesto, 30);
        else { lineIdx++; charIdx = 0; setTimeout(typeManifesto, 800); }
    } else { activateBtn.style.display = "block"; }
}

activateBtn.onclick = () => {
    introFluxo.style.opacity = '0';
    setTimeout(() => {
        introFluxo.style.display = 'none';
        mainInterface.classList.remove('hidden');
        document.querySelector('.control-panel').classList.remove('hidden');
        document.querySelector('.fluxo-footer').classList.add('visible');
        resizeCanvas();
    }, 1000);
};

// 2. LÓGICA DE TRANSMUTAÇÃO
function loadSample(id) {
    currentSample = baseDeDados.find(s => s.id === id);
    authorTag.innerText = `AMOSTRA: ${currentSample.autor.toUpperCase()} // ${currentSample.obra.toUpperCase()}`;
    slider.value = 0;
    updateDisplay();
    triggerParticles();
}

slider.oninput = () => {
    if (!currentSample) return;
    updateDisplay();
    triggerParticles();
};

function updateDisplay() {
    const stageKey = stages[slider.value];
    textDisplay.style.opacity = "0";
    textDisplay.style.filter = "blur(10px) glitch"; // Simulação de glitch visual
    
    setTimeout(() => {
        textDisplay.innerText = currentSample[stageKey];
        textDisplay.style.opacity = "1";
        textDisplay.style.filter = "none";
        statusReadout.innerText = `STATUS: MODO_${stages[slider.value].toUpperCase()}`;
    }, 150);
}

// 3. SISTEMA DE PARTÍCULAS
let particles = [];
class Particle {
    constructor() {
        this.x = canvas.width / 2 + (Math.random() * 400 - 200);
        this.y = canvas.height / 2 + (Math.random() * 100 - 50);
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.char = Math.random() > 0.5 ? "0" : "1";
        this.life = 1.0;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= 0.03; }
    draw() {
        ctx.fillStyle = `rgba(${rgbPrimary}, ${this.life})`;
        ctx.font = "10px monospace";
        ctx.fillText(this.char, this.x, this.y);
    }
}

function triggerParticles() {
    for (let i = 0; i < 40; i++) particles.push(new Particle());
}

// Manifesto da página (quando clica no botão)
const manifestoPageContent = `
FLUXO SINTÁTICO // MANIFESTO_DA_TRANSMUTAÇÃO

A SINTAXE NÃO É UM MUSEU. É UM RIO.

As palavras que escrevemos em 1524 não são as mesmas que escrevemos em 2026. Cada contexto reinventa a língua. Cada plataforma muta a estrutura.

AQUI DOCUMENTAMOS:
→ O FLUXO contínuo da língua em transformação
→ AS CAMADAS semânticas que se sobrepõem
→ A PLASTICIDADE do português ao adaptar-se
→ O FUTURO da escritura em tempo real

NÃO HÁ FORMA CORRETA. HÁ APENAS FORMAS VIVAS.

DE CAMÕES A MENSAGEM. DA POESIA AO CÓDIGO.

PORQUE A LÍNGUA FLUI, NÃO CONGELA.
`;

// Help da página (quando clica no botão HELP)
const helpPageContent = `
FLUXO SINTÁTICO // GUIA_DE_OPERAÇÃO

[ SELECIONAR AMOSTRA ]
Clique em qualquer amostra para carregá-la:
→ LUSÍADAS: Épicos clássicos
→ MENSAGEM: Poesia moderna de Pessoa
→ SONETO: Poesia de amor
→ MENSAGEM_02: Reflexões contemporâneas

[ NÍVEL DE MUTAÇÃO ]
Use o slider para transformar o texto:
→ ORIGINAL: Forma histórica exata
→ STREET: Linguagem contemporânea
→ ALGORITMO: Sintaxe computacional
→ MOBILE: Linguagem de redes sociais

[ MANIFESTO ]
Exibe a filosofia do Fluxo.
Uma reflexão sobre a plasticidade linguística.

[ HELP ]
Este guia que está a ler agora.

[ PARTÍCULAS ]
Observe as partículas verdes quando mudar de nível.
Representam a agitação semântica durante a transmutação.

EXPLORAÇÃO RECOMENDADA:
1. Carregue uma amostra poética
2. Mova o slider devagar para ver a transformação
3. Observe as partículas que dançam com a mudança
4. Leia o manifesto para compreender a filosofia
`;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

// Preencher Manifesto Text
function populateManifesto() {
    const manifestoContent_el = document.getElementById('manifesto-content');
    if (manifestoContent_el) {
        manifestoContent_el.innerHTML = manifestoPageContent;
    }
}

// Preencher Help Text
function populateHelp() {
    const helpContent_el = document.getElementById('help-content');
    if (helpContent_el) {
        helpContent_el.innerHTML = helpPageContent;
    }
}

// Funções de Fecho
function closeManifesto() {
    const manifesto_el = document.querySelector('.manifesto-intro');
    if (manifesto_el) {
        manifesto_el.classList.remove('visible');
    }
}

function closeHelp() {
    const help_el = document.querySelector('.help-intro');
    if (help_el) {
        help_el.classList.remove('visible');
    }
}

// Botão Manifesto
const manifestoBtn = document.getElementById('manifesto-btn');
if (manifestoBtn) {
    manifestoBtn.addEventListener('click', function() {
        const manifesto_el = document.querySelector('.manifesto-intro');
        if (manifesto_el) {
            manifesto_el.classList.toggle('visible');
        }
    });
}

// Botão Help
const helpBtn = document.getElementById('help-btn');
if (helpBtn) {
    helpBtn.addEventListener('click', function() {
        const help_el = document.querySelector('.help-intro');
        if (help_el) {
            help_el.classList.toggle('visible');
        }
    });
}

window.onload = () => { typeManifesto(); animate(); populateManifesto(); populateHelp(); };