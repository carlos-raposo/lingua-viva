/**
 * LAB_GLITCH_V1.0 ENGINE
 * Sistema de Corrupção de Texto e Arqueologia Digital
 */

// --- 0. MANIFESTO DE ENTRADA (SPLASH SCREEN) ---
const introGlitch = document.getElementById('intro-glitch');
const manifestoBox = document.getElementById('manifesto-glitch');
const acceptBtn = document.getElementById('accept-btn');
const mainContent = document.getElementById('main-content');

const glitchManifesto = [
    "O ERRO É UM DIALETO.",
    "Bem-vindo ao LAB_GLITCH. Aqui, cada falha de tradução, cada caractere corrompido, cada glitch é um documento vivo da nossa língua em transformação.",
    "Os erros não são acidentes. São assinaturas digitais de um tempo em que a tecnologia ainda balbucava português."
];

let lineIdx = 0, charIdx = 0;
function typeGlitchManifesto() {
    if (lineIdx < glitchManifesto.length) {
        if (charIdx === 0) manifestoBox.innerHTML += "<p></p>";
        const lines = manifestoBox.querySelectorAll('p');
        const pElement = lines[lineIdx];
        
        // Efeito de glitch: caracteres alternam entre magenta e branco aleatoriamente
        const char = glitchManifesto[lineIdx].charAt(charIdx);
        const glitchColor = Math.random() > 0.7 ? 'color: #ffffff;' : '';
        pElement.innerHTML += `<span style="${glitchColor}">${char}</span>`;
        
        charIdx++;
        if (charIdx < glitchManifesto[lineIdx].length) setTimeout(typeGlitchManifesto, 30);
        else { lineIdx++; charIdx = 0; setTimeout(typeGlitchManifesto, 800); }
    } else { 
        // Manifesto acabou, mostra o botão
        acceptBtn.style.display = "block";
    }
}

acceptBtn.onclick = () => {
    // Transição com estática para revelar o conteúdo
    introGlitch.style.opacity = '0';
    setTimeout(() => {
        introGlitch.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }, 800);
};


const input = document.getElementById('glitch-input');
const output = document.getElementById('output-display');
const btn = document.getElementById('deconstruct-btn');
const symbols = "!@#$%^&*()_+-=[]{}|;':,.<>/?0123456789§øØΣX#";

// --- 1. FUNÇÃO SCRAMBLE (Efeito Hacker Typer ao digitar) ---
input.addEventListener('input', (e) => {
    const originalValue = e.target.value;
    if (originalValue.length === 0) {
        output.innerText = "_AGUARDANDO_DADOS_";
        output.style.color = ""; // Reseta para a cor padrão (verde)
        return;
    }

    let scrambled = originalValue.split('').map(char => {
        // 20% de hipótese de transformar o char num símbolo aleatório enquanto digita
        return Math.random() > 0.8 
            ? symbols[Math.floor(Math.random() * symbols.length)] 
            : char;
    }).join('');

    output.innerText = scrambled;
});

// --- 2. ALGORITMO GLITCH (A Desconstrução) ---
btn.onclick = () => {
    let text = input.value;
    if (!text) return;

    btn.disabled = true;
    output.style.color = "var(--cyan)";
    
    let iterations = 0;
    // Animação de processamento visual (Embaralhamento de 1 segundo)
    const shuffleInterval = setInterval(() => {
        output.innerText = text.split('').map(() => symbols[Math.floor(Math.random() * symbols.length)]).join('');
        iterations++;

        if (iterations > 10) {
            clearInterval(shuffleInterval);
            applyDeepGlitch(text);
            btn.disabled = false;
        }
    }, 100);
};

function applyDeepGlitch(text) {
    let result = text;
    const diagnosisElement = document.getElementById('system-diagnosis');

    // A. Algoritmo Leet
    result = result.toLowerCase()
        .replace(/a/gi, "4")
        .replace(/e/gi, "3")
        .replace(/i/gi, "1")
        .replace(/o/gi, "0");

    // B. Corrupção de Símbolos
    const parts = result.split('');
    result = parts.map(char => {
        if (char === " ") return "_";
        return Math.random() > 0.7 ? char + symbols[Math.floor(Math.random() * 5)] : char;
    }).join('');

    // C. Inversão Aleatória
    let words = result.split('_');
    let wasInverted = false;
    if (words.length >= 2 && Math.random() > 0.5) {
        let i = Math.floor(Math.random() * words.length);
        let j = Math.floor(Math.random() * words.length);
        [words[i], words[j]] = [words[j], words[i]];
        result = words.join('_');
        wasInverted = true;
    }

    const extensions = [".exe", ".bin", ".dat", ".sys", "_GLITCH"];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    const finalResult = (result + ext).toUpperCase();
    
    output.innerText = finalResult;
    output.style.color = "var(--magenta)";

    // --- LÓGICA DE DIAGNÓSTICO (Peça de Museu) ---
    let statusText = "";

    if (ext === ".BIN") {
        statusText = "[ STATUS: Corrupção de binário detetada - Dialeto de baixo nível ]";
    } else if ((finalResult.match(/[@#§]/g) || []).length > 3) {
        statusText = "[ STATUS: Ruído de rede excessivo - Protocolo de segurança falhou ]";
    } else if (wasInverted) {
        statusText = "[ STATUS: Colapso sintático - Erro de processamento semântico ]";
    } else {
        statusText = "[ STATUS: Encriptação Social Nível 1 - Dialeto de Lan House ]";
    }

    // Aparece com um ligeiro atraso para parecer que o sistema está a "pensar"
    diagnosisElement.innerText = "ANALISANDO...";
    setTimeout(() => {
        diagnosisElement.innerText = statusText;
    }, 500);
}

// --- 3. INTERATIVIDADE DA GALERIA (Decifrar Fósseis) ---
document.querySelectorAll('.fossil-card').forEach(card => {
    const pElement = card.querySelector('p');
    const originalErrorText = pElement.innerText;
    const realMeaning = card.getAttribute('data-desc'); // Certifica-te que tens este atributo no HTML

    card.addEventListener('mouseenter', () => {
        // Efeito visual de "tentar corrigir" o ficheiro
        pElement.innerText = `[DECIFRANDO: ${realMeaning.toUpperCase()}]`;
        pElement.style.color = "#ffffff";
    });

    card.addEventListener('mouseleave', () => {
        // Volta ao estado corrompido
        pElement.innerText = originalErrorText;
        pElement.style.color = "";
    });
});

// --- MANIFESTO E HELP DA PÁGINA ---
const manifestoPageContent = `
LAB_GLITCH // MANIFESTO_DA_CORRUPÇÃO

O ERRO NÃO É ACIDENTAL. É GENEALÓGICO.

Cada glitch é um fóssil da era digital. Cada caractere corrompido é uma marca do tempo em que as máquinas ainda não aprenderam a falar português com precisão.

AQUI DOCUMENTAMOS:
→ O SOTAQUE das máquinas erradas
→ A POESIA dos protocolos quebrados
→ O ARQUIVO dos erros que nos definiram
→ A MEMÓRIA de quando tínhamos que sentar-nos para escrever

ANTES DE SEREM LIMPOS pela automação perfeita, os erros NOS ENSINARAM.

O GLITCH É A EVIDÊNCIA DE QUE FOMOS AQUI.
`;

const helpPageContent = `
LAB_GLITCH // INSTRUÇÕES_DE_OPERAÇÃO

[ MANIFESTO ]
Exibe a filosofia do Lab Glitch.
Uma reflexão sobre o valor dos erros e da impérfeição na história digital.

[ HELP ]
Este guia que está a ler agora.

[ DESCONSTRUIR ]
Digite uma mensagem e clique para corromper o texto.
O algoritmo glitch cria variações de corrupção em tempo real.

[ FÓSSEIS DIGITAIS ]
Explore o arquivo de erros históricos.
Passe o mouse sobre cada fóssil para ver sua interpretação.
Clique para explorar mais detalhes.

[ NAVEGAÇÃO ]
Use o menu de footer para navegar entre modos.
Cada clique produz um glitch sonoro que confirma sua ação.

EXPLORAÇÃO RECOMENDADA:
1. Leia o manifesto para compreender a filosofia
2. Digite mensagens no terminal para criar glitches em tempo real
3. Explore os fósseis para entender a evolução dos erros
4. Retorne ao índice quando quiser explorar outros tópicos
`;

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

// --- 4. NAVEGAÇÃO SUAVE (Fade-out para voltar) ---
const backLink = document.querySelector('.back-link');
if (backLink) {
    backLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.href;
        
        document.body.classList.add('fade-out');
        
        setTimeout(() => {
            window.location.href = target;
        }, 800); // Tempo coincide com a transição do CSS
    });
}

// --- Inicializar manifesto na entrada ---
window.onload = () => {
    typeGlitchManifesto();
    populateManifesto();
    populateHelp();
};