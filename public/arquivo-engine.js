// Lógica para navegação suave e pular manifesto ao voltar para index.html
const backLink = document.querySelector('.back-link');
if (backLink) {
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.setItem('skipManifesto', 'true');
        const target = this.getAttribute('href');
        const sector = document.getElementById('sector-zero');
        if (sector && !sector.classList.contains('hidden')) {
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = target;
            }, 800);
        } else {
            window.location.href = target;
        }
    });
}

let currentRegion = 'TODOS';
const regions = ['TODOS', 'PT', 'BR', 'GLOBAL'];
let regionIndex = 0;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Som de HDD Clicking (Frequências baixas e percussivas)
function playHDDSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// Lógica da Lanterna com movimento automático
let idleTimeout;
let isAutoMoving = false;
let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;

// Inicializar variáveis CSS da lanterna
document.documentElement.style.setProperty('--mouse-x', lastMouseX + 'px');
document.documentElement.style.setProperty('--mouse-y', lastMouseY + 'px');

function resetIdleTimer() {
    clearTimeout(idleTimeout);
    isAutoMoving = false;
    if (bounceAnimationId) {
        cancelAnimationFrame(bounceAnimationId);
        bounceAnimationId = null;
    }
    idleTimeout = setTimeout(startAutoMovement, 10000); // 10 segundos
}

function startAutoMovement() {
    isAutoMoving = true;
    laternaSweep();
}

let sweepPhase = 0;

// Movimento contínuo com bounce nas margens - tipo jogo antigo
let bounceX = window.innerWidth / 2;
let bounceY = window.innerHeight / 2;
let velocityX = 200; // pixels por segundo
let velocityY = 150; // pixels por segundo
let lastAnimationTime = Date.now();
let bounceAnimationId = null;

function laternaBounce() {
    if (!isAutoMoving) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 100; // Distância da margem antes de quicar
    
    const moveBouncingBall = () => {
        if (!isAutoMoving) {
            cancelAnimationFrame(bounceAnimationId);
            return;
        }
        
        const now = Date.now();
        const deltaTime = (now - lastAnimationTime) / 1000; // Em segundos
        lastAnimationTime = now;
        
        // Atualizar posição baseado em velocidade
        bounceX += velocityX * deltaTime;
        bounceY += velocityY * deltaTime;
        
        // Detectar colisão com margens e quicar
        if (bounceX <= margin) {
            bounceX = margin;
            velocityX = Math.abs(velocityX); // Garantir que vai para direita
        } else if (bounceX >= width - margin) {
            bounceX = width - margin;
            velocityX = -Math.abs(velocityX); // Garantir que vai para esquerda
        }
        
        if (bounceY <= margin) {
            bounceY = margin;
            velocityY = Math.abs(velocityY); // Garantir que vai para baixo
        } else if (bounceY >= height - margin) {
            bounceY = height - margin;
            velocityY = -Math.abs(velocityY); // Garantir que vai para cima
        }
        
        // Atualizar CSS
        document.documentElement.style.setProperty('--mouse-x', bounceX + 'px');
        document.documentElement.style.setProperty('--mouse-y', bounceY + 'px');
        lastMouseX = bounceX;
        lastMouseY = bounceY;
        
        // Próximo frame
        bounceAnimationId = requestAnimationFrame(moveBouncingBall);
    };
    
    lastAnimationTime = Date.now();
    bounceAnimationId = requestAnimationFrame(moveBouncingBall);
}

function laternaSweep() {
    if (!isAutoMoving) return;
    
    let startX, startY, targetX, targetY;
    const width = window.innerWidth;
    const height = window.innerHeight;
    let duration;
    
    // Rodar através de diferentes padrões de varredura
    const pattern = sweepPhase % 4;
    sweepPhase++;
    
    if (pattern === 0) {
        // Varredura horizontal (esquerda para direita)
        startY = Math.random() * height;
        startX = Math.random() > 0.5 ? 0 : width;
        targetX = startX === 0 ? width : 0;
        targetY = startY;
        duration = 6000; // 6 segundos para varrer toda a tela
    } else if (pattern === 1) {
        // Varredura vertical (cima para baixo)
        startX = Math.random() * width;
        startY = Math.random() > 0.5 ? 0 : height;
        targetX = startX;
        targetY = startY === 0 ? height : 0;
        duration = 6000;
    } else if (pattern === 2) {
        // Varredura diagonal
        startX = Math.random() > 0.5 ? 0 : width;
        startY = Math.random() > 0.5 ? 0 : height;
        targetX = width - startX;
        targetY = height - startY;
        duration = 7000;
    } else {
        // Padrão bounce - bola quicando nas margens
        laternaBounce();
        return;
    }
    
    // IMPORTANTE: Atualizar imediatamente a posição inicial
    document.documentElement.style.setProperty('--mouse-x', startX + 'px');
    document.documentElement.style.setProperty('--mouse-y', startY + 'px');
    lastMouseX = startX;
    lastMouseY = startY;
    
    let startTime = Date.now();
    
    const moveStep = () => {
        if (!isAutoMoving) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Linear movement para varredura mais consistente
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        
        // Atualizar CONTINUAMENTE a cada frame
        document.documentElement.style.setProperty('--mouse-x', currentX + 'px');
        document.documentElement.style.setProperty('--mouse-y', currentY + 'px');
        lastMouseX = currentX;
        lastMouseY = currentY;
        
        if (progress < 1) {
            requestAnimationFrame(moveStep);
        } else {
            // Guarantir posição final exata
            document.documentElement.style.setProperty('--mouse-x', targetX + 'px');
            document.documentElement.style.setProperty('--mouse-y', targetY + 'px');
            lastMouseX = targetX;
            lastMouseY = targetY;
            
            // Próximo padrão - SEM DELAY
            if (isAutoMoving) {
                laternaSweep();
            }
        }
    };
    
    moveStep();
}
        
    
  

document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
    resetIdleTimer();
});

// Iniciar o timer quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    resetIdleTimer();
});

// Manifesto Teletipo (abertura)
const texts = [
    "A MEMÓRIA É UM ARQUIVO VIVO",
    "SILÊNCIO. ESTÁ A ENTRAR NO SETOR ZERO.",
    "Nem tudo o que é dito sobrevive à próxima atualização.", "O Arquivo Morto guarda os ecos de uma língua que já não se fala, mas que construiu as fundações do nosso presente digital.", "O que foi esquecido ainda nos define.",
    "Use a sua lanterna para ver palavras e expressões do passado.", "Use a filtragem para ver por regiões"
];

// Manifesto da página (quando clica no botão)
const manifestoContent = `
SETOR ZERO // MANIFESTO_ARQUEOLÓGICO

O ARQUIVO MORTO é um necrotério digital de expressões, gírias e formas de comunicação que desapareceram da língua portuguesa contemporânea.

CADA FÓSSIL representa um momento em que a língua viva se cristalizou em forma, e quando essa forma deixou de funcionar, tornou-se obsoleta.

NÃO HERDAMOS apenas palavras. Herdamos os modos de estar, de relacionar, de viver que essas palavras carregavam.

QUANDO DESAPARECEM, levam consigo fragmentos de um sistema de valores que definiu uma era.

ESTA COLEÇÃO documenta: 
→ O ABANDONO geracional de expressões regionais
→ A MORTE digital de protocolos de cortesia
→ A EROSÃO de gírias de rua
→ A EXTINÇÃO de referências a tecnologias obsoletas

A LANTERNA ilumina. A FILTRAGEM organiza. O ARQUIVO persiste.

PORQUE A MEMÓRIA É UM ARQUIVO VIVO.
`;

// Help da página (quando clica no botão HELP)
const helpContent = `
SETOR ZERO // GUIA_DE_UTILIZAÇÃO

[ FILTRAR POR REGIÃO ]
Clique o botão para alternar entre regiões:
→ TODOS: mostra todos os fósseis
→ PT: expressa portuguesas
→ BR: expressões brasileiras
→ GLOBAL: expressões globais de internet

[ MANIFESTO ]
Exibe a filosofia e objetivo do Arquivo Morto.
Um documento sobre a recuperação de linguagens esquecidas.

[ HELP ]
Este guia que está a ler agora.

[ LANTERNA DIGITAL ]
Mova o mouse pela página.
A lanterna ilumina as palavras e fósseis dentro do seu raio.
Explore o arquivo com a luz da memória.

[ FÓSSEIS ]
Clique em qualquer fóssil para recuperar informações completas.
Cada um é um fragmento de uma língua que desapareceu.

EXPLORAÇÃO RECOMENDADA:
1. Use a lanterna para explorar o arquivo visualmente
2. Filtre por região para entender variações linguísticas
3. Clique nos fósseis para ler histórias completas
4. Leia o manifesto para compreender o contexto
`;

let line = 0;
let char = 0;
const terminal = document.getElementById('terminal-text');

function type() {
    if (line < texts.length) {
        if (char < texts[line].length) {
            terminal.innerHTML += texts[line].charAt(char);
            char++;
            setTimeout(type, 30);
        } else {
            terminal.innerHTML += "<br><br>";
            line++;
            char = 0;
            setTimeout(type, 1000); // Pausa de 1s entre parágrafos
        }
    } else {
        document.getElementById('repair-btn').style.display = "block";
    }
}

document.getElementById('repair-btn').onclick = () => {
    document.getElementById('intro-overlay').style.display = "none";
    document.getElementById('sector-zero').classList.remove('hidden');
    document.getElementById('sector-header').classList.add('visible');
    document.querySelector('.arquivo-footer').classList.add('visible');
};

// Interação com os Fósseis
document.querySelectorAll('.fossil').forEach(f => {
    f.onclick = () => {
        playHDDSound();
        f.classList.add('shaking');
        setTimeout(() => {
            f.classList.remove('shaking');
            showPopup(f.querySelector('h3').innerText, f.getAttribute('data-info'));
        }, 500);
    };
});

function showPopup(title, info) {
    const popup = document.getElementById('popup-corrupted');
    document.getElementById('popup-text').innerText = `[RECUPERADO]: ${info}`;
    popup.style.display = "block";
}

function closePopup() {
    document.getElementById('popup-corrupted').style.display = "none";
}

// Filtração por Região - Single Button Toggle Pattern
const filterBtn = document.getElementById('filter-btn');
if (filterBtn) {
    filterBtn.addEventListener('click', function() {
        playHDDSound();
        regionIndex = (regionIndex + 1) % regions.length;
        currentRegion = regions[regionIndex];
        filterBtn.innerText = `[ FILTRAR POR REGIÃO: ${currentRegion} ]`;
        
        // Filter fossils
        document.querySelectorAll('.fossil').forEach(fossil => {
            const region = fossil.getAttribute('data-region');
            if (currentRegion === 'TODOS' || region === currentRegion) {
                fossil.classList.remove('hidden-region');
            } else {
                fossil.classList.add('hidden-region');
            }
        });
    });
}

// Preencher Manifesto Text
function populateManifesto() {
    const manifestoText = document.getElementById('manifesto-text');
    if (manifestoText) {
        manifestoText.innerHTML = manifestoContent;
    }
}

// Preencher Help Text
function populateHelp() {
    const helpText = document.getElementById('help-text');
    if (helpText) {
        helpText.innerHTML = helpContent;
    }
}

// Botão Manifesto
const manifestoBtn = document.getElementById('manifesto-btn');
if (manifestoBtn) {
    manifestoBtn.addEventListener('click', function() {
        playHDDSound();
        const manifesto = document.querySelector('.manifesto-intro');
        if (manifesto) {
            manifesto.classList.toggle('visible');
        }
    });
}

// Botão Help
const helpBtn = document.getElementById('help-btn');
if (helpBtn) {
    helpBtn.addEventListener('click', function() {
        playHDDSound();
        const help = document.querySelector('.help-intro');
        if (help) {
            help.classList.toggle('visible');
        }
    });
}

// Funções de Fecho
function closeManifesto() {
    const manifesto = document.querySelector('.manifesto-intro');
    if (manifesto) {
        manifesto.classList.remove('visible');
    }
}

function closeHelp() {
    const help = document.querySelector('.help-intro');
    if (help) {
        help.classList.remove('visible');
    }
}

window.onload = () => {
    type();
    populateManifesto();
    populateHelp();
};