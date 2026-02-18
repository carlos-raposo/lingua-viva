/**
 * STREAM.JS - DADOS SIMULADOS (SEM BACKEND)
 * Carrega apenas dados mock para visualização
 */

console.log("✅ stream.js carregado - Modo OFFLINE (sem backend)");

// ==============================================================================
// DADOS MOCKADOS
// ==============================================================================
const mockData = [
    { termo: "Promptar", origem: "PORTUGAL", status: "Emergente", tendencia: "Explosiva", def: "(Verbo) A arte de saber conversar com máquinas. Representa a simbiose entre a linguagem natural e o código IA." },
    { termo: "Alucinar", origem: "Técnica", status: "Recontextualizado", tendencia: "Alta", def: "(Novo sentido) Quando uma informação parece real mas é puramente inventada por um sistema sintético." },
    { termo: "Desdigitalizar", origem: "PT/BR", status: "Tendência 2026", tendencia: "Crescente", def: "(Oposição) O ato deliberado de desconectar para recuperar processos analógicos e o foco humano." },
    { termo: "Glow up", origem: "Anglicismo", status: "Estabilizado", tendencia: "Estável", def: "(Estabilizado) Transformação positiva de aparência ou estilo de vida, popularizado por algoritmos de imagem." },
    { termo: "Tankar", origem: "Gamer", status: "Viral", tendencia: "Alta", def: "(Verbo) Conseguir aguentar ou suportar uma situação difícil. Transposição da mecânica de jogos para a vida real." },
    { termo: "Mudar o chip", origem: "PORTUGAL", status: "Estabilizado", tendencia: "Média", def: "(Idiomatismo) Expressão que utiliza a metáfora do hardware para indicar uma mudança radical de atitude." },
    { termo: "Lacrar", origem: "BRASIL", status: "Evolução", tendencia: "Estabilizada", def: "(Evolução) Antes era apenas fechar; agora é dar uma resposta definitiva ou vencer um debate com autoridade." },
    { termo: "Biscoitar", origem: "BRASIL", status: "Social", tendencia: "Alta", def: "(Verbo) Procurar validação ou elogios nas redes sociais de forma óbvia. Alusão ao prémio por comportamento esperado." },
    { termo: "Bué", origem: "ANGOLA", status: "Universal", tendencia: "Estável", def: "(Expansão) Termo angolano que se tornou universal no português europeu para significar 'muito'." },
    { termo: "Cringe", origem: "Global", status: "Geracional", tendencia: "Baixa", def: "(Sentimento) Vergonha alheia. Termo que define o conflito estético entre gerações nativas digitais." },
    { termo: "Meme", origem: "Bluesky", status: "Viral", tendencia: "Alta", def: "(Neologismo) Ideia viral que se espalha na internet de forma autónoma." },
    { termo: "Trollar", origem: "Bluesky", status: "Social", tendencia: "Média", def: "(Verbo) Provocar ou ofender nas redes sociais de forma deliberada." },
    { termo: "Vibe", origem: "Bluesky", status: "Social", tendencia: "Alta", def: "(Substantivo) Sensação, clima, energia que se transmite." },
    { termo: "Flexar", origem: "Bluesky", status: "Social", tendencia: "Média", def: "(Verbo) Ostentar ou mostrar-se de forma exagerada." },
    { termo: "Ghostar", origem: "Bluesky", status: "Emergente", tendencia: "Crescente", def: "(Verbo) Desaparecer de repente de um relacionamento ou amizade." },
    { termo: "Fake", origem: "Bluesky", status: "Social", tendencia: "Alta", def: "(Adjetivo) Falso, mentiroso, enganoso." },
    { termo: "Cancelar", origem: "Bluesky", status: "Emergente", tendencia: "Alta", def: "(Verbo) Rejeitar publicamente ou boicotar algo ou alguém." },
    { termo: "Shippar", origem: "Bluesky", status: "Social", tendencia: "Média", def: "(Verbo) Apoiar romanticamente um casal (real ou fictício)." },
    { termo: "Avatar", origem: "Bluesky", status: "Emergente", tendencia: "Crescente", def: "(Substantivo) Representação virtual de si mesmo no mundo digital." },
    { termo: "Plot Twist", origem: "Bluesky", status: "Social", tendencia: "Média", def: "(Expressão) Reviravolta inesperada numa história." }
];


// ==============================================================================
// FUNÇÃO DE CARREGAMENTO (RETORNA APENAS DADOS MOCK)
// ==============================================================================
async function fetchAllSources() {
    console.log("📊 Carregando dados simulados...");
    return mockData;
}

// ==============================================================================
// INICIALIZAR GLOBALMENTE
// ==============================================================================
// Verificação de segurança: garantir que mockData está disponível globalmente
if (typeof window !== 'undefined') {
    window.mockData = mockData;
    window.calculateStreamSize = calculateStreamSize;
    console.log("✅ mockData disponível globalmente");
    console.log(`✅ ${mockData.length} termos de dados simulados carregados`);
}

console.log("✅ stream.js pronto - Modo OFFLINE sem backend");

