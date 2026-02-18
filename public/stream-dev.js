/**
 * STREAM-DEV.JS - VERSÃO DE DESENVOLVIMENTO
 * Tenta dados reais de APIs, com logging detalhado
 * Fallback para mock apenas se TUDO falhar
 */

console.log("🔧 stream-dev.js carregado - MODO DESENVOLVIMENTO");
console.warn("⚠️  Você está em MODO DESENVOLVIMENTO - Tentando carregar dados reais de APIs");

// ==============================================================================
// CONFIGURAÇÃO DE BACKEND (Detectada automaticamente por config.js)
// ==============================================================================
// Use: window.BACKEND_URL (definido em config.js)
// Detecta automaticamente: localhost → http://localhost:5000
//                         produção → https://lingua-viva.onrender.com
if (!window.BACKEND_URL) {
    console.error("❌ config.js não foi carregado! Por favor, carregue config.js ANTES de stream-dev.js");
}
const BACKEND_URL = window.BACKEND_URL;
console.log(`🔧 [DEV] Backend URL: ${BACKEND_URL}`);

// ==============================================================================
// DADOS MOCKADOS (FALLBACK FINAL)
// ==============================================================================
const mockData = [
    { termo: "Promptar", origem: "Global", status: "Emergente", tendencia: "Explosiva", def: "(Verbo) A arte de saber conversar com máquinas. Representa a simbiose entre a linguagem natural e o código IA." },
    { termo: "Alucinar", origem: "Técnica", status: "Recontextualizado", tendencia: "Alta", def: "(Novo sentido) Quando uma informação parece real mas é puramente inventada por um sistema sintético." },
    { termo: "Desdigitalizar", origem: "PT/BR", status: "Tendência 2026", tendencia: "Crescente", def: "(Oposição) O ato deliberado de desconectar para recuperar processos analógicos e o foco humano." },
    { termo: "Glow up", origem: "Anglicismo", status: "Estabilizado", tendencia: "Estável", def: "(Estabilizado) Transformação positiva de aparência ou estilo de vida, popularizado por algoritmos de imagem." },
    { termo: "Tankar", origem: "Gamer", status: "Viral", tendencia: "Alta", def: "(Verbo) Conseguir aguentar ou suportar uma situação difícil. Transposição da mecânica de jogos para a vida real." },
    { termo: "Mudar o chip", origem: "Portugal", status: "Estabilizado", tendencia: "Média", def: "(Idiomatismo) Expressão que utiliza a metáfora do hardware para indicar uma mudança radical de atitude." },
    { termo: "Lacrar", origem: "Brasil", status: "Evolução", tendencia: "Estabilizada", def: "(Evolução) Antes era apenas fechar; agora é dar uma resposta definitiva ou vencer um debate com autoridade." },
    { termo: "Biscoitar", origem: "Brasil", status: "Social", tendencia: "Alta", def: "(Verbo) Procurar validação ou elogios nas redes sociais de forma óbvia. Alusão ao prémio por comportamento esperado." },
    { termo: "Bué", origem: "Angola/Portugal", status: "Universal", tendencia: "Estável", def: "(Expansão) Termo angolano que se tornou universal no português europeu para significar 'muito'." },
    { termo: "Cringe", origem: "Global", status: "Geracional", tendencia: "Baixa", def: "(Sentimento) Vergonha alheia. Termo que define o conflito estético entre gerações nativas digitais." }
];

// ==============================================================================
// MAPEAR TRAFFIC PARA TENDÊNCIA (IDÊNTICO AO PRODUCTION)
// ==============================================================================
function mapTrafficToTendencia(traffic) {
    if (!traffic) return "Normal";
    
    const match = traffic.match(/(\d+(?:\.\d+)?)\s*([KMB]?)/i);
    if (!match) return "Normal";
    
    let num = parseFloat(match[1]);
    const unit = match[2]?.toUpperCase();
    
    if (unit === 'K') num *= 1000;
    if (unit === 'M') num *= 1000000;
    if (unit === 'B') num *= 1000000000;
    
    if (num >= 500000) return "Explosiva";
    if (num >= 100000) return "Alta";
    if (num >= 50000) return "Crescente";
    if (num >= 10000) return "Média";
    return "Baixa";
}

// ==============================================================================
// CÁLCULO DE TEMPO DECORRIDO
// ==============================================================================
function getTimeSincePublication(pubDate) {
    try {
        const now = new Date();
        const published = new Date(pubDate);
        const diffMs = now - published;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMinutes < 1) return "Agora mesmo";
        if (diffMinutes < 60) return `${diffMinutes} min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        return `${diffDays}d atrás`;
    } catch (e) {
        return "Detectado";
    }
}

// ==============================================================================
// PROVEDOR 1: GOOGLE TRENDS (MÚLTIPLAS REGIÕES)
// ==============================================================================
async function fetchGoogleTrendsByRegion(geoCode = 'PT', regionName = 'Portugal') {
    try {
        console.log(`⏳ [DEV] Tentando Google Trends (${regionName}/${geoCode})...`);
        
        const response = await fetch(`${BACKEND_URL}/trends?geo=${geoCode}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                console.log(`✅ [DEV] Google Trends ${geoCode}: ${data.data.length} termos!`);
                return parseLocalTrendsData(data.data, geoCode, regionName);
            }
        }
        
        console.log(`❌ [DEV] Google Trends ${geoCode}: Sem dados`);
        return null;
        
    } catch (error) {
        console.error(`❌ [DEV] Erro Google Trends (${geoCode}):`, error.message);
        return null;
    }
}

async function fetchGoogleTrendsPT() {
    return await fetchGoogleTrendsByRegion('PT', 'Portugal');
}

async function fetchGoogleTrendsBR() {
    return await fetchGoogleTrendsByRegion('BR', 'Brasil');
}

async function fetchGoogleTrendsAO() {
    return await fetchGoogleTrendsByRegion('AO', 'Angola');
}

// ==============================================================================
// PARSER PARA BACKEND LOCAL
// ==============================================================================
function parseLocalTrendsData(items, geoCode = 'PT', regionName = 'Portugal') {
    const trendsArray = [];
    const regionMap = {
        'PT': 'PORTUGAL',
        'BR': 'BRASIL',
        'AO': 'ANGOLA'
    };
    const origem = regionMap[geoCode] || regionName;
    
    for (let i = 0; i < Math.min(items.length, 20); i++) {
        const item = items[i];
        
        trendsArray.push({
            termo: item.termo,
            origem: origem,
            status: getTimeSincePublication(item.pubDate),
            tendencia: mapTrafficToTendencia(item.traffic),
            def: `(Google Trends) Termo em tendência ${regionName}. Volume de buscas: ${item.traffic} búscas/dia.`,
            traffic: item.traffic,
            pubDate: item.pubDate,
            source: "google_trends",
            strategy: "Backend Python Local [DEV]",
            region: geoCode
        });
    }
    
    console.log(`✅ Google Trends (${origem}): ${trendsArray.length} termos carregados!`);
    return trendsArray;
}

// ==============================================================================
// PROVEDOR 2: BLUESKY TRENDING (VIA BACKEND)
// ==============================================================================
async function fetchBlueskyTrending() {
    try {
        console.log("⏳ [DEV] Tentando Bluesky Trending...");
        
        const response = await fetch(
            `${BACKEND_URL}/bluesky`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );
        
        console.log(`   Status: ${response.status}`);
        
        if (!response.ok) {
            console.log(`❌ [DEV] Bluesky retornou ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data || data.data.length === 0) {
            console.log("❌ [DEV] Bluesky sem dados");
            return null;
        }
        
        const trendsArray = data.data.map(item => ({
            termo: item.termo,
            origem: item.origem || "BLUESKY",
            status: getTimeSincePublication(item.pubDate),
            tendencia: mapTrafficToTendencia(item.traffic),
            def: `(Bluesky) ${item.description}`,
            traffic: item.traffic,
            pubDate: item.pubDate,
            source: "bluesky",
            strategy: "Backend Python Local [DEV]"
        }));
        
        console.log(`✅ [DEV] Bluesky: ${trendsArray.length} termos carregados!`);
        return trendsArray;
        
    } catch (error) {
        console.error(`❌ [DEV] Erro Bluesky:`, error.message);
        return null;
    }
}

// ==============================================================================
// PROVEDOR 3: NEOLOGISMOS EM PORTUGUÊS
// ==============================================================================
async function fetchBlueskyNeologismos() {
    try {
        console.log("⏳ [DEV] Buscando Neologismos em Português...");
        
        const response = await fetch(
            `${BACKEND_URL}/bluesky/neologismos`,
            {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }
        );
        
        console.log(`   Status: ${response.status}`);
        
        if (!response.ok) {
            console.log(`❌ [DEV] Neologismos retornou ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data || data.data.length === 0) {
            console.log("❌ [DEV] Nenhum neologismo encontrado");
            return null;
        }
        
        const neologismosArray = data.data.map(item => ({
            termo: item.termo,
            origem: "PORTUGUÊS MODERNO",
            status: "Neologismo",
            tendencia: "Emergente",
            def: `(Neologismo) ${item.context || item.def || 'Termo novo em português'}`,
            traffic: "+Unknown",
            pubDate: item.pubDate || new Date().toISOString(),
            source: "bluesky_neologismos",
            idioma: item.idioma || "PT",
            strategy: "Bluesky Linguistic Search [DEV]"
        }));
        
        console.log(`✅ [DEV] Neologismos: ${neologismosArray.length} termos encontrados!`);
        return neologismosArray;
    
    } catch (error) {
        console.error("❌ [DEV] Erro ao buscar neologismos:", error);
        return null;
    }
}

// ==============================================================================
// CARREGAMENTO MULTI-REGIÃO
// ==============================================================================
async function fetchTrendsMultiRegion() {
    console.log("🌍 [DEV] Carregando Google Trends de múltiplas regiões...");
    
    const allResults = [];
    
    // Carregar em paralelo
    const promises = [
        fetchGoogleTrendsPT(),
        fetchGoogleTrendsBR(),
        fetchGoogleTrendsAO()
    ];
    const results = await Promise.all(promises);
    
    // Combinar resultados
    results.forEach(result => {
        if (result && result.length > 0) {
            allResults.push(...result.slice(0, 8));
        }
    });
    
    if (allResults.length > 0) {
        console.log(`✨ [DEV] Multi-região: ${allResults.length} itens carregados!`);
        return allResults;
    }
    
    return null;
}

// ==============================================================================
// CÁLCULO DE TAMANHO DE STREAM
// ==============================================================================
function calculateStreamSize(dataArray) {
    if (!dataArray || dataArray.length === 0) return "0.0";
    
    try {
        const jsonString = JSON.stringify(dataArray);
        const sizeInBytes = jsonString.length;
        const sizePerWord = (sizeInBytes / dataArray.length) / 1024;
        return sizePerWord.toFixed(1);
    } catch (e) {
        console.error("Erro ao calcular stream size:", e);
        return "0.0";
    }
}

// ==============================================================================
// CARREGAR TODAS AS FONTES EM PARALELO (DEV MODE SEM FALLBACK)
// ==============================================================================
async function fetchAllSources() {
    console.log("\n🌐 [DEV] ===== CARREGANDO TODAS AS FONTES EM PARALELO (MODO DEV) =====");
    
    const allData = [];
    
    try {
        // Carregar Google Trends (PT, BR, AO)
        console.log("\n📡 [DEV] Google Trends (3 regiões em paralelo)...");
        const googleResults = await Promise.all([
            fetchGoogleTrendsPT(),
            fetchGoogleTrendsBR(),
            fetchGoogleTrendsAO()
        ]);
        
        googleResults.forEach((result, idx) => {
            if (result && result.length > 0) {
                const region = ['Portugal', 'Brasil', 'Angola'][idx];
                console.log(`   ✅ ${region}: ${result.length} termos`);
                allData.push(...result);
            } else {
                const region = ['Portugal', 'Brasil', 'Angola'][idx];
                console.log(`   ❌ ${region}: Sem dados`);
            }
        });
        
        // Carregar Bluesky
        console.log("\n📡 [DEV] Bluesky Trending...");
        const blueskyResult = await fetchBlueskyTrending();
        if (blueskyResult && blueskyResult.length > 0) {
            console.log(`   ✅ Bluesky: ${blueskyResult.length} termos`);
            allData.push(...blueskyResult);
        } else {
            console.log(`   ❌ Bluesky: Sem dados`);
        }
        
        // Carregar Neologismos
        console.log("\n📚 [DEV] Neologismos em Português...");
        const neologismosResult = await fetchBlueskyNeologismos();
        if (neologismosResult && neologismosResult.length > 0) {
            console.log(`   ✅ Neologismos: ${neologismosResult.length} termos`);
            allData.push(...neologismosResult);
        } else {
            console.log(`   ❌ Neologismos: Sem dados`);
        }
        
        console.log(`\n✨ [DEV] TOTAL: ${allData.length} termos de todas as fontes!`);
        
        if (allData.length > 0) {
            // Agrupar por origem
            const originCounts = {};
            allData.forEach(item => {
                const origin = item.origem || 'Unknown';
                originCounts[origin] = (originCounts[origin] || 0) + 1;
            });
            
            console.log("📊 [DEV] Distribuição por origem:");
            Object.entries(originCounts).forEach(([origin, count]) => {
                console.log(`   • ${origin}: ${count} termos`);
            });
            
            return allData;
        }
        
    } catch (error) {
        console.error("❌ [DEV] Erro ao carregar todas as fontes:", error);
    }
    
    console.warn("⚠️  [DEV] Fallback para mockData");
    return mockData;
}

// ==============================================================================
// INICIALIZAR GLOBALMENTE
// ==============================================================================
if (typeof window !== 'undefined') {
    window.mockData = mockData;
    window.calculateStreamSize = calculateStreamSize;
    console.log("✅ [DEV] mockData disponível globalmente");
    
    // Função para testar Google Trends
    window.testGoogleTrendsDev = async function(region = 'PT') {
        console.log(`\n🧪 [DEV] TESTE - Google Trends (${region})`);
        console.log("========================================");
        const func = region === 'BR' ? fetchGoogleTrendsBR : region === 'AO' ? fetchGoogleTrendsAO : fetchGoogleTrendsPT;
        const result = await func();
        if (result && result.length > 0) {
            console.log(`✅ SUCESSO! ${result.length} termos:`);
            console.table(result.slice(0, 5));
        } else {
            console.log(`❌ FALHOU - Nenhum resultado`);
        }
        return result;
    };
    
    // Função para testar Bluesky
    window.testBlueskyDev = async function() {
        console.log(`\n🧪 [DEV] TESTE - Bluesky Trending`);
        console.log("================================");
        const result = await fetchBlueskyTrending();
        if (result && result.length > 0) {
            console.log(`✅ SUCESSO! ${result.length} termos:`);
            console.table(result);
        } else {
            console.log(`❌ FALHOU - Nenhum resultado`);
        }
        return result;
    };
    
    // Função para testar Neologismos
    window.testNeologismosDev = async function() {
        console.log(`\n🧪 [DEV] TESTE - Neologismos`);
        console.log("=============================");
        const result = await fetchBlueskyNeologismos();
        if (result && result.length > 0) {
            console.log(`✅ SUCESSO! ${result.length} termos:`);
            console.table(result);
        } else {
            console.log(`❌ FALHOU - Nenhum resultado`);
        }
        return result;
    };
    
    // Função para carregar TUDO
    window.loadAllSourcesDev = async function() {
        console.log(`\n🧪 [DEV] TESTE - TODAS AS FONTES`);
        console.log("================================");
        const result = await fetchAllSources();
        if (result && result.length > 0) {
            console.log(`✅ SUCESSO! ${result.length} termos carregados para a matriz`);
            if (typeof window.updateMatrixData === 'function') {
                window.updateMatrixData(result);
                console.log(`✅ Matriz atualizada com dados DEV!`);
            }
        } else {
            console.log(`❌ FALHOU`);
        }
        return result;
    };
    
    console.log("✅ [DEV] stream-dev.js pronto");
    console.log("🧪 Testes disponíveis:");
    console.log("   • window.testGoogleTrendsDev('PT|BR|AO')");
    console.log("   • window.testBlueskyDev()");
    console.log("   • window.testNeologismosDev()");
    console.log("   • window.loadAllSourcesDev()");
}

console.log("✅ stream-dev.js carregado com sucesso");
