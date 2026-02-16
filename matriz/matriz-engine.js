/**
 * MATRIZ NEOLÓGICA V2.6 - FINAL ENGINE (RESTORED AUDIO)
 */

console.log("✅ matriz-engine.js carregado");

const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('word-info');
const filterBtn = document.getElementById('filter-btn');
const introOverlay = document.getElementById('intro-overlay');
const manifestoBox = document.getElementById('manifesto-text');
const tuneBtn = document.getElementById('tune-btn');

// --- SISTEMA DE ÁUDIO (CONTEXTO ÚNICO) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(freq = 880, duration = 0.1) {
    if (audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(freq/2, audioCtx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(); 
    osc.stop(audioCtx.currentTime + duration);
}

// FUNÇÃO DE RUÍDO BRANCO (REVISADA)
function startStaticNoise() {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Preenchimento do buffer com ruído aleatório
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.005; // Mesmo volume que os bips para teste

    whiteNoise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    whiteNoise.start();
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- 1. BANCO DE DADOS ---
// Agora carregado dinamicamente via stream.js
let wordsDB = [];
let isDataLoaded = false;

// --- 2. VARIÁVEIS DE ESTADO ---
let particles = [];
let frozen = false;
let currentFilter = 'TODAS';
const regions = ['TODAS', 'BRASIL', 'PORTUGAL', 'ANGOLA', 'GLOBAL'];
let regionIndex = 0;
let isDragging = false;
let draggedParticle = null;

// --- 3. CLASSE DE PARTÍCULAS ---
class WordParticle {
    constructor() { this.reset(); }
    reset() {
        // Aceder ao mockData via window (definido em stream.js)
        const fallbackDB = window.mockData || mockData || [];
        const dbToUse = isDataLoaded && wordsDB.length > 0 ? wordsDB : fallbackDB;
        const filteredDB = dbToUse.filter(item => currentFilter === 'TODAS' || item.origem.toUpperCase().includes(currentFilter));
        const source = filteredDB.length > 0 ? filteredDB : dbToUse;
        
        if (source.length === 0) {
            console.warn("⚠️  Nenhuma fonte de dados disponível!");
            return;
        }
        
        this.data = source[Math.floor(Math.random() * source.length)];
        this.x = Math.random() * canvas.width;
        this.y = -100 - (Math.random() * 500);
        this.speed = 0.5 + Math.random() * 2;
        this.fontSize = 10 + Math.random() * 25;
        this.opacity = 0.1 + Math.random() * 0.8;
    }
    draw() {
        ctx.fillStyle = `rgba(0, 243, 255, ${this.opacity})`;
        ctx.font = `${this.fontSize}px 'Space Mono', monospace`;
        ctx.fillText(this.data.termo.toUpperCase(), this.x, this.y);
    }
    update() {
        if (!frozen) {
            this.y += this.speed;
            if (this.y > canvas.height) this.reset();
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 50; i++) particles.push(new WordParticle());
}

// --- 4. MANIFESTO E ATIVAÇÃO ---
const manifesto = "O SINAL É A SEMENTE\n\n> INICIANDO_PROTOCOLO_MATRIZ...\n> DETETANDO_NEOLOGISMOS_ATIVOS...\n> A LÍNGUA NÃO É UM ARQUIVO MORTO, MAS UM ORGANISMO EM EXPANSÃO.";
let charIndex = 0;

// Manifesto da página (quando clica no botão)
const manifestoContent = `
MATRIZ NEOLÓGICA // MANIFESTO_GERMINATIVO

A LÍNGUA É UM ORGANISMO VIVO. Não um museu, não um arquivo congelado.

NEOLOGISMO é o sintoma de uma civilização em mutação. Cada palavra nova marca uma transformação
na forma como pensamos, sentimos e nos relacionamos.

A MATRIZ SURGE quando:
→ A TECNOLOGIA força novas formas de interação
→ AS GERAÇÕES criam códigos de comunicação próprios
→ O PORTUGUÊS devolve-se a si mesmo, reinventando-se

AQUI documentamos:
→ A GERMINAÇÃO de termos que ainda estão em evolução
→ O CRUZAMENTO entre português e tecnologia global
→ A EMERGÊNCIA de sentidos completamente novos
→ O FUTURO da língua enquanto ela se forma

NÃO HÁ PUREZA. HÁ APENAS FLUXO.

PORQUE A LÍNGUA VIVA NÃO CESSA DE CRESCER.
`;

// Help da página (quando clica no botão HELP)
const helpContent = `
MATRIZ NEOLÓGICA // GUIA_DE_OPERAÇÃO

[ FILTRAR POR REGIÃO ]
Clique o botão para alternar entre regiões:
→ TODAS: mostra todos os neologismos ativos
→ BRASIL: inovações do português brasileiro
→ PORTUGAL: evolução do português europeu
→ ANGOLA: contribuições do português angolano
→ GLOBAL: expressões nascidas na internet

[ MANIFESTO ]
Exibe a filosofia e objetivo da Matriz.
Uma visão sobre a renovação contínua da língua portuguesa.

[ HELP ]
Este guia que está a ler agora.

[ CLICAR NOS TERMOS ]
Clique em qualquer palavra flutuante para travar a animação.
Uma caixa mostrará:
→ O termo em contexto global
→ Sua origem regional
→ Seu estado evolutivo (Emergente, Estabilizado, etc)
→ Sua tendência de crescimento

[ RADAR DECENAL ]
A cada 10 segundos, uma onda sincroniza todas as frequências.
Representa o pulso constante da inovação linguística.

EXPLORAÇÃO RECOMENDADA:
1. Observe o fluxo contínuo de neologismos
2. Use a filtragem para entender variações regionais
3. Clique nos termos para explorar etimologias
4. Leia o manifesto para compreender a filosofia
`;

let line = 0;

function typeManifesto() {
    if (charIndex < manifesto.length) {
        manifestoBox.innerHTML += manifesto.charAt(charIndex) === "\n" ? "<br>" : manifesto.charAt(charIndex);
        charIndex++;
        setTimeout(typeManifesto, 40);
    } else {
        tuneBtn.style.display = "block";
    }
}

tuneBtn.onclick = () => {
    // ESSENCIAL: Retomar o contexto de áudio
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            startStaticNoise();
            playBeep(440, 0.2);
        });
    } else {
        startStaticNoise();
        playBeep(440, 0.2);
    }
    
    introOverlay.style.opacity = '0';
    setTimeout(() => {
        introOverlay.style.display = 'none';
        animate();
        // Carregar dados ao iniciar a animação
        loadLiveTrends();
    }, 1000);
};

// --- 5. MOTOR DE ANIMAÇÃO ---
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

// Radar decenal
setInterval(() => {
    if (introOverlay.style.display === 'none') {
        const sweep = document.createElement('div');
        sweep.className = 'radar-sweep';
        sweep.style.left = "50%"; sweep.style.top = "50%";
        document.body.appendChild(sweep);
        particles.forEach(p => {
            const oldOp = p.opacity; p.opacity = 1;
            setTimeout(() => p.opacity = oldOp, 150);
        });
        setTimeout(() => sweep.remove(), 4000);
    }
}, 10000);

// --- 6. INTERATIVIDADE ---
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    particles.forEach(p => {
        const hitWidth = p.data.termo.length * (p.fontSize * 0.6);
        if (mouseX > p.x && mouseX < p.x + hitWidth && 
            mouseY > p.y - p.fontSize && mouseY < p.y) {
            
            playBeep(880, 0.05); // Bip de captura

            frozen = true; 
            isDragging = true; 
            draggedParticle = p;
            showPopup(p.data, mouseX, mouseY);
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedParticle) {
        draggedParticle.x = e.clientX - 20;
        draggedParticle.y = e.clientY + 10;
        ctx.fillStyle = "rgba(0, 243, 255, 0.5)";
        ctx.fillRect(e.clientX + (Math.random()*10 - 5), e.clientY + (Math.random()*10 - 5), 2, 2);
    }
});

window.addEventListener('mouseup', () => { isDragging = false; draggedParticle = null; });

function showPopup(data, x, y) {
    popup.style.display = 'block';
    const posX = x + 280 > window.innerWidth ? x - 280 : x + 20;
    const posY = y + 250 > window.innerHeight ? y - 250 : y - 20;
    popup.style.left = `${posX}px`; popup.style.top = `${posY}px`;
    document.getElementById('popup-term').innerText = data.termo.toUpperCase();
    document.getElementById('popup-def').innerText = data.def;
    document.getElementById('popup-origin').innerText = data.origem;
    document.getElementById('popup-status').innerText = data.status;
    document.getElementById('popup-trend').innerText = data.tendencia;
}

window.closePopup = () => { frozen = false; popup.style.display = 'none'; };

filterBtn.onclick = () => {
    playBeep(660, 0.1);
    regionIndex = (regionIndex + 1) % regions.length;
    currentFilter = regions[regionIndex];
    filterBtn.innerText = `[ FILTRAR POR REGIÃO: ${currentFilter} ]`;
    ctx.fillStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    initParticles();
};

// Preencher Manifesto Text
function populateManifesto() {
    const manifestoContent_el = document.getElementById('manifesto-content');
    if (manifestoContent_el) {
        manifestoContent_el.innerHTML = manifestoContent;
    }
}

// Preencher Help Text
function populateHelp() {
    const helpContent_el = document.getElementById('help-content');
    if (helpContent_el) {
        helpContent_el.innerHTML = helpContent;
    }
}

// ==============================================================================
// CARREGADOR DE DADOS DINÂMICOS
// ==============================================================================
async function loadLiveTrends() {
    console.log("\n📡 ===== INICIANDO CARREGAMENTO DE TENDÊNCIAS =====");
    
    const badge = document.getElementById('data-status-badge');
    
    // Chamar a função fetchLiveTrends do stream.js
    if (typeof fetchLiveTrends === 'function') {
        console.log("✅ fetchLiveTrends está disponível");
        
        const trendData = await fetchLiveTrends();
        
        console.log(`📊 Resultado: ${trendData ? trendData.length : 0} itens`);
        
        if (trendData && trendData.length > 0) {
            // Verificar se tem dados reais (não mockData)
            const hasLiveData = trendData.some(t => t.source === 'google_trends' || t.origem === 'Google_Pulse_PT');
            
            wordsDB = trendData;
            isDataLoaded = true;
            console.log(`✨ wordsDB ATUALIZADO com ${wordsDB.length} tendências!`);
            console.log("   Fontes:", [...new Set(trendData.map(t => t.origem))].join(", "));
            
            // Atualizar badge visual
            if (badge) {
                if (hasLiveData) {
                    badge.textContent = "🔴 LIVE_DATA_ACTIVE";
                    badge.className = 'status-badge live';
                    console.log("✅ Dados REAIS carregados - Badge LIVE");
                } else {
                    badge.textContent = "⚠️  FALLBACK_MODE";
                    badge.className = 'status-badge fallback';
                    console.log("⚠️  Usando fallback - Badge FALLBACK");
                }
            }
            
            // Re-inicializar partículas com novos dados
            initParticles();
            console.log("✅ Partículas re-inicializadas com novos dados");
        } else {
            console.warn("⚠️  Resultado vazio, usando fallback");
            isDataLoaded = false;
            
            if (badge) {
                badge.textContent = "⚠️  FALLBACK_MODE";
                badge.className = 'status-badge fallback';
            }
        }
        
        // Atualizar STREAM_ACTIVE com tamanho real dos dados
        if (typeof window.calculateStreamSize === 'function') {
            const streamSize = window.calculateStreamSize(wordsDB);
            const statElement = document.getElementById('stream-active-stat');
            if (statElement) {
                statElement.textContent = `STREAM_ACTIVE: ${streamSize} kb/word`;
                console.log(`📊 Stream ativo atualizado: ${streamSize} kb/word`);
            }
        }
        
        console.log("===== FIM DO CARREGAMENTO =====\n");
    } else {
        console.error("❌ fetchLiveTrends NÃO ESTÁ DISPONÍVEL!");
        console.error("   Verifique se stream.js foi carregado ANTES de matriz-engine.js");
        
        if (badge) {
            badge.textContent = "❌ ERROR";
            badge.className = 'status-badge fallback';
        }
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
        playBeep(800, 0.1);
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
        playBeep(800, 0.1);
        const help_el = document.querySelector('.help-intro');
        if (help_el) {
            help_el.classList.toggle('visible');
        }
    });
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    initParticles();
});

window.onload = () => { 
    console.log("🚀 Iniciando Matriz Neológica...");
    console.log("📊 mockData disponível?", typeof mockData !== 'undefined' || typeof window.mockData !== 'undefined');
    initParticles(); 
    typeManifesto(); 
    populateManifesto(); 
    populateHelp();
    console.log("✅ Matriz pronta para sintonização");
};