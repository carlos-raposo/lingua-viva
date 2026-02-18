/**
 * STREAM.JS - OFFLINE ONLY
 * Dados simulados Portuguese neologisms
 */

console.log("✅ stream.js carregado - Modo OFFLINE");

// ==============================================================================
// DADOS MOCK APENAS
// ==============================================================================
const mockData = [
    { termo: "Promptar", origem: "PORTUGAL", status: "Emergente", tendencia: "Explosiva", def: "(Verbo) A arte de saber conversar com máquinas." },
    { termo: "Alucinar", origem: "Técnica", status: "Recontextualizado", tendencia: "Alta", def: "(Novo sentido) Quando informação é inventada por sistema sintético." },
    { termo: "Desdigitalizar", origem: "PT/BR", status: "Tendência 2026", tendencia: "Crescente", def: "(Oposição) Desconectar para recuperar processos analógicos." },
    { termo: "Glow up", origem: "Anglicismo", status: "Estabilizado", tendencia: "Estável", def: "(Estabilizado) Transformação positiva de aparência." },
    { termo: "Tankar", origem: "Gamer", status: "Viral", tendencia: "Alta", def: "(Verbo) Conseguir aguentar situação difícil." },
    { termo: "Mudar o chip", origem: "PORTUGAL", status: "Estabilizado", tendencia: "Média", def: "(Idiomatismo) Mudança radical de atitude." },
    { termo: "Lacrar", origem: "BRASIL", status: "Evolução", tendencia: "Estabilizada", def: "(Evolução) Dar resposta definitiva com autoridade." },
    { termo: "Biscoitar", origem: "BRASIL", status: "Social", tendencia: "Alta", def: "(Verbo) Procurar validação nas redes sociais." },
    { termo: "Bué", origem: "ANGOLA", status: "Universal", tendencia: "Estável", def: "(Expansão) Significar muito em português." },
    { termo: "Cringe", origem: "Global", status: "Geracional", tendencia: "Baixa", def: "(Sentimento) Vergonha alheia." },
    { termo: "Meme", origem: "GLOBAL", status: "Viral", tendencia: "Alta", def: "(Neologismo) Ideia viral na internet." },
    { termo: "Trollar", origem: "GLOBAL", status: "Social", tendencia: "Média", def: "(Verbo) Provocar deliberadamente redes." },
    { termo: "Vibe", origem: "GLOBAL", status: "Social", tendencia: "Alta", def: "(Substantivo) Sensação, clima, energia." },
    { termo: "Flexar", origem: "GLOBAL", status: "Social", tendencia: "Média", def: "(Verbo) Ostentar de forma exagerada." },
    { termo: "Ghostar", origem: "GLOBAL", status: "Emergente", tendencia: "Crescente", def: "(Verbo) Desaparecer de repente." },
    { termo: "Fake", origem: "GLOBAL", status: "Social", tendencia: "Alta", def: "(Adjetivo) Falso, mentiroso." },
    { termo: "Cancelar", origem: "GLOBAL", status: "Emergente", tendencia: "Alta", def: "(Verbo) Rejeitar publicamente." },
    { termo: "Shippar", origem: "GLOBAL", status: "Social", tendencia: "Média", def: "(Verbo) Apoiar casal romanticamente." },
    { termo: "Avatar", origem: "GLOBAL", status: "Emergente", tendencia: "Crescente", def: "(Substantivo) Representação virtual." },
    { termo: "Plot Twist", origem: "GLOBAL", status: "Social", tendencia: "Média", def: "(Expressão) Reviravolta inesperada." }
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

