/**
 * STREAM.JS - OFFLINE ONLY
 * Dados simulados Portuguese neologisms
 */

console.log("✅ stream.js carregado - Modo OFFLINE");

// ==============================================================================
// DADOS MOCK APENAS - COM FONTES VARIADAS
// ==============================================================================
const mockData = [
    // Google Trends
    { termo: "Eleições 2026", origem: "Google Trends", regiao: "GLOBAL", status: "Viral", tendencia: "Explosiva", def: "(Termo em trend) Evento político em tendência. Volume: +500K/dia." },
    { termo: "Mudanças Climáticas", origem: "Google Trends", regiao: "GLOBAL", status: "Persistente", tendencia: "Alta", def: "(Tema global) Questões ambientais em debate. Volume: +300K/dia." },
    
    // X (Twitter)
    { termo: "Prompt Jailbreak", origem: "X", regiao: "PORTUGAL", status: "Emergente", tendencia: "Crescente", def: "(Tech Slang) Técnica para contornar limitações de IA." },
    { termo: "#EstouAqui", origem: "X", regiao: "BRASIL", status: "Trending", tendencia: "Alta", def: "(Hashtag) Expressão de presença e apoio nas redes." },
    { termo: "Ratio'd", origem: "X", regiao: "GLOBAL", status: "Viral", tendencia: "Média", def: "(Gíria) Quando reply recebe mais engajamento que post original." },
    
    // Reddit
    { termo: "AMA Session", origem: "Reddit", regiao: "PORTUGAL", status: "Comum", tendencia: "Estável", def: "(Formato) Ask Me Anything - sessão de perguntas e respostas." },
    { termo: "Nerdflix", origem: "Reddit", regiao: "BRASIL", status: "Emergente", tendencia: "Crescente", def: "(Comunidade) Plataforma alternativa para entretenimento nerd." },
    { termo: "IAMA Scientist", origem: "Reddit", regiao: "GLOBAL", status: "Trend", tendencia: "Média", def: "(Comunidade) Profissionais partilham experiências." },
    
    // Instagram
    { termo: "Reels Trends", origem: "Instagram", regiao: "PORTUGAL", status: "Viral", tendencia: "Alta", def: "(Formato) Vídeos curtos virais na plataforma." },
    { termo: "Aesthetic Vibe", origem: "Instagram", regiao: "BRASIL", status: "Social", tendencia: "Média", def: "(Estilo) Compartilhamento de estilos visuais harmoniosos." },
    { termo: "Story Time", origem: "Instagram", regiao: "GLOBAL", status: "Comum", tendencia: "Estável", def: "(Narrativa) Compartilhamento de histórias pessoais." },
    
    // Bluesky
    { termo: "Skeet Thread", origem: "Bluesky", regiao: "PORTUGAL", status: "Nativo", tendencia: "Média", def: "(Formato) Conversa encadeada de posts curtos no Bluesky." },
    { termo: "Fediverso Aberto", origem: "Bluesky", regiao: "BRASIL", status: "Conceito", tendencia: "Crescente", def: "(Arquitetura) Rede descentralizada de servidores interconectados." },
    { termo: "Labeler Personalizado", origem: "Bluesky", regiao: "ANGOLA", status: "Feature", tendencia: "Emergente", def: "(Moderação) Sistema de tags personalizadas para filtrar conteúdo." },
    { termo: "AT Protocol", origem: "Bluesky", regiao: "GLOBAL", status: "Técnico", tendencia: "Alta", def: "(Protocolo) Sistema descentralizado de autenticação e dados." },
    
    // TikTok
    { termo: "Corpo Perfeito Challenge", origem: "TikTok", regiao: "PORTUGAL", status: "Viral", tendencia: "Explosiva", def: "(Trend) Desafio de dança que envolve movimento específico." },
    { termo: "Lip Sync Battle", origem: "TikTok", regiao: "BRASIL", status: "Trend", tendencia: "Alta", def: "(Formato) Sincronização de lábios com músicas." },
    { termo: "Sound Clone", origem: "TikTok", regiao: "ANGOLA", status: "Emergente", tendencia: "Crescente", def: "(Inovação) Criação de vozes clonadas em áudio." },
    { termo: "Duet Reaction", origem: "TikTok", regiao: "GLOBAL", status: "Social", tendencia: "Média", def: "(Interação) Reação lado a lado com outro criador." }
];

// ==============================================================================
// TERMOS DE FALLBACK (RESERVADOS PARA TRATAMENTO DE ERROS FUTURO)
// ==============================================================================
const fallbackData = [
    { termo: "Desdigitalizar", origem: "Fallback", status: "Tendência 2026", tendencia: "Crescente", def: "(Oposição) Desconectar deliberadamente da tecnologia." },
    { termo: "Bué", origem: "Fallback", status: "Estabilizado", tendencia: "Estável", def: "(Gíria PT) Expressão que significa muito." },
    { termo: "Cringe", origem: "Fallback", status: "Geracional", tendencia: "Alta", def: "(Sentimento) Vergonha alheia perante algo constrangedor." },
    { termo: "Ghosting Digital", origem: "Fallback", status: "Social", tendencia: "Alta", def: "(Comportamento) Desaparecimento repentino nas redes." },
    { termo: "Noção de Privacidade", origem: "Fallback", status: "Conceitual", tendencia: "Crescente", def: "(Direito) Proteção de dados pessoais online." }
];

// ==============================================================================
// FUNÇÕES GLOBAIS
// ==============================================================================
async function fetchAllSources() {
    console.log("📊 Carregando dados simulados offline...");
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`✅ ${mockData.length} termos carregados`);
            resolve(mockData);
        }, 100);
    });
}

function calculateStreamSize(dataArray) {
    if (!dataArray || dataArray.length === 0) return "0.0";
    try {
        const jsonString = JSON.stringify(dataArray);
        const sizeInBytes = jsonString.length;
        const sizePerWord = (sizeInBytes / dataArray.length) / 1024;
        return sizePerWord.toFixed(1);
    } catch (e) {
        return "0.0";
    }
}

// ==============================================================================
// GLOBAL EXPOSURE
// ==============================================================================
if (typeof window !== 'undefined') {
    window.mockData = mockData;
    window.fallbackData = fallbackData;
    window.fetchAllSources = fetchAllSources;
    window.calculateStreamSize = calculateStreamSize;
    console.log(`✅ ${mockData.length} termos de dados reais simulados`);
    console.log(`⚠️  ${fallbackData.length} termos de fallback reservados`);
}

console.log("✅ stream.js pronto - OFFLINE SEM BACKEND");

