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
    { termo: "Eleições 2026", origem: "Google Trends", status: "Viral", tendencia: "Explosiva", def: "(Termo em trend) Evento político em tendência. Volume: +500K/dia." },
    { termo: "Mudanças Climáticas", origem: "Google Trends", status: "Persistente", tendencia: "Alta", def: "(Tema global) Questões ambientais em debate. Volume: +300K/dia." },
    
    // X (Twitter)
    { termo: "Prompt Jailbreak", origem: "X", status: "Emergente", tendencia: "Crescente", def: "(Tech Slang) Técnica para contornar limitações de IA." },
    { termo: "#EstouAqui", origem: "X", status: "Trending", tendencia: "Alta", def: "(Hashtag) Expressão de presença e apoio nas redes." },
    { termo: "Ratio'd", origem: "X", status: "Viral", tendencia: "Média", def: "(Gíria) Quando reply recebe mais engajamento que post original." },
    
    // Reddit
    { termo: "AMA Session", origem: "Reddit", status: "Comum", tendencia: "Estável", def: "(Formato) Ask Me Anything - sessão de perguntas e respostas." },
    { termo: "Nerdflix", origem: "Reddit", status: "Emergente", tendencia: "Crescente", def: "(Comunidade) Plataforma alternativa para entretenimento nerd." },
    { termo: "IAMA Scientist", origem: "Reddit", status: "Trend", tendencia: "Média", def: "(Comunidade) Profissionais partilham experiências." },
    
    // Instagram
    { termo: "Reels Trends", origem: "Instagram", status: "Viral", tendencia: "Alta", def: "(Formato) Vídeos curtos virais na plataforma." },
    { termo: "Aesthetic Vibe", origem: "Instagram", status: "Social", tendencia: "Média", def: "(Estilo) Compartilhamento de estilos visuais harmoniosos." },
    { termo: "Story Time", origem: "Instagram", status: "Comum", tendencia: "Estável", def: "(Narrativa) Compartilhamento de histórias pessoais." },
    
    // TikTok
    { termo: "Corpo Perfeito Challenge", origem: "TikTok", status: "Viral", tendencia: "Explosiva", def: "(Trend) Desafio de dança que envolve movimento específico." },
    { termo: "Lip Sync Battle", origem: "TikTok", status: "Trend", tendencia: "Alta", def: "(Formato) Sincronização de lábios com músicas." },
    { termo: "Sound Clone", origem: "TikTok", status: "Emergente", tendencia: "Crescente", def: "(Inovação) Criação de vozes clonadas em áudio." },
    { termo: "Duet Reaction", origem: "TikTok", status: "Social", tendencia: "Média", def: "(Interação) Reação lado a lado com outro criador." },
    
    // Fallback/Geral
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
    window.fetchAllSources = fetchAllSources;
    window.calculateStreamSize = calculateStreamSize;
    console.log(`✅ ${mockData.length} termos de dados simulados disponíveis`);
}

console.log("✅ stream.js pronto - OFFLINE SEM BACKEND");

