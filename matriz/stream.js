/**
 * STREAM.JS - PROVEDORES DE DADOS DINÂMICOS
 * Arquitetura plug-and-play para múltiplas fontes de tendências
 */

console.log("✅ stream.js carregado - iniciando carregamento de dados...");

// ==============================================================================
// DADOS MOCKADOS (FALLBACK)
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
// MAPEO DE TENDÊNCIA
// ==============================================================================
function mapTrafficToTendencia(traffic) {
    // traffic vem como "+123K", "+5M", etc.
    if (!traffic) return "Normal";
    
    const match = traffic.match(/(\d+(?:\.\d+)?)\s*([KMB]?)/i);
    if (!match) return "Normal";
    
    let num = parseFloat(match[1]);
    const unit = match[2]?.toUpperCase();
    
    // Multiplicar pela unidade
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
// PROVEDOR 1: GOOGLE TRENDS (MÚLTIPLAS REGIÕES - GENÉRICO)
// ==============================================================================
async function fetchGoogleTrendsByRegion(geoCode = 'PT', regionName = 'Portugal') {
    try {
        console.log(`🔄 Fetching Google Trends (${regionName}/${geoCode})...`);
        
        // Estratégia 1: Backend Python local (MELHOR - sem CORS issues)
        console.log(`📡 Tentando 1/3: Backend Python local (http://localhost:5000) - ${geoCode}...`);
        try {
            const response = await fetch(`http://localhost:5000/trends?geo=${geoCode}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            console.log(`   Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data && data.data.length > 0) {
                    console.log(`✅ Backend Python funcionou para ${geoCode}!`);
                    return parseLocalTrendsData(data.data, geoCode, regionName);
                }
            }
        } catch (e) {
            console.log(`   ❌ Backend falhou:`, e.message);
        }
        
        // Se falhar backend, retornar null e deixar fetchLiveTrends() tentar próximo
        return null;
        
    } catch (error) {
        console.error(`❌ Erro ao fetch Google Trends (${geoCode}):`, error.message);
        return null;
    }
}

// Wrappers específicas para cada região
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
// PARSER PARA BACKEND LOCAL (COM SUPORTE A MÚLTIPLAS REGIÕES)
// ==============================================================================
function parseLocalTrendsData(items, geoCode = 'PT', regionName = 'Portugal') {
    const trendsArray = [];
    
    // Mapear geoCode para nome amigável
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
            origem: origem,  // Mudado de Google_Pulse_PT para PORTUGAL, BRASIL, ANGOLA
            status: getTimeSincePublication(item.pubDate),
            tendencia: mapTrafficToTendencia(item.traffic),
            def: `(Google Trends) Termo em tendência ${regionName}. Volume de buscas: ${item.traffic} búscas/dia.`,
            traffic: item.traffic,
            pubDate: item.pubDate,
            source: "google_trends",
            strategy: "Backend Python Local",
            region: geoCode
        });
    }
    
    console.log(`✅ Google Trends (${origem}): ${trendsArray.length} termos carregados!`);
    if (trendsArray.length > 0) {
        console.log("📝 Amostra:", trendsArray[0]);
    }
    
    return trendsArray;
}

// ==============================================================================
// PARSER PARA RSS2JSON API
// ==============================================================================
function parseRSS2JSONItems(items) {
    const trendsArray = [];
    
    for (let i = 0; i < Math.min(items.length, 25); i++) {
        const item = items[i];
        
        const title = item.title || "Sem título";
        const pubDate = item.pubDate || new Date().toISOString();
        const description = item.description || "";
        
        // Extrair traffic da descrição (vem como "+123K")
        let traffic = "+0";
        const trafficMatch = description.match(/\+[\d.]+[KMB]?/);
        if (trafficMatch) {
            traffic = trafficMatch[0];
        }
        
        // Limpar o título
        const cleanTitle = title.replace(/^\d+\.\s*/, "").trim();
        
        trendsArray.push({
            termo: cleanTitle,
            origem: "Google_Pulse_PT",
            status: getTimeSincePublication(pubDate),
            tendencia: mapTrafficToTendencia(traffic),
            def: `(Google Trends) Termo em tendência em Portugal. Volume de buscas: ${traffic} búscas/dia.`,
            traffic: traffic,
            pubDate: pubDate,
            source: "google_trends",
            strategy: "RSS2JSON API"
        });
    }
    
    console.log(`✅ Google Trends (via RSS2JSON): ${trendsArray.length} termos carregados!`);
    if (trendsArray.length > 0) {
        console.log("📝 Amostra:", trendsArray[0]);
    }
    
    return trendsArray;
}

// ==============================================================================
// PARSER PARA CONTEÚDO XML (PROXIES ANTIGOS)
// ==============================================================================
function parseXMLContent(rssContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssContent, "text/xml");
    
    const parseErrors = xmlDoc.getElementsByTagName("parsererror");
    if (parseErrors.length > 0) {
        throw new Error("XML Parse Error: " + parseErrors[0].textContent);
    }
    
    const items = xmlDoc.getElementsByTagName("item");
    const trendsArray = [];
    
    for (let i = 0; i < Math.min(items.length, 25); i++) {
        const item = items[i];
        
        const title = item.querySelector("title")?.textContent || "Sem título";
        const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();
        
        let traffic = "+0";
        const children = item.children;
        for (let j = 0; j < children.length; j++) {
            const tag = children[j].tagName;
            if (tag && (tag.includes('approx_traffic') || tag === 'ht:approx_traffic')) {
                traffic = children[j].textContent || "+0";
                break;
            }
        }
        
        const cleanTitle = title.replace(/^\d+\.\s*/, "").trim();
        
        trendsArray.push({
            termo: cleanTitle,
            origem: "Google_Pulse_PT",
            status: getTimeSincePublication(pubDate),
            tendencia: mapTrafficToTendencia(traffic),
            def: `(Google Trends) Termo em tendência em Portugal. Volume de buscas: ${traffic} búscas/dia.`,
            traffic: traffic,
            pubDate: pubDate,
            source: "google_trends",
            strategy: "XML Proxy"
        });
    }
    
    console.log(`✅ Google Trends (via XML Proxy): ${trendsArray.length} termos carregados!`);
    if (trendsArray.length > 0) {
        console.log("📝 Amostra:", trendsArray[0]);
    }
    
    return trendsArray;
}

// ==============================================================================
// PROVEDOR 2: ARQUIVO (FUTURO - ex: Bluesky API, X API, etc)
// ==============================================================================
async function fetchBlueskyTrending() {
    // Placeholder para future expansion
    return null;
}

async function fetchXTrending() {
    // Placeholder para future expansion
    return null;
}

// ==============================================================================
// ARQUITETURA PLUG-AND-PLAY (MÚLTIPLAS REGIÕES)
// ==============================================================================
const dataProviders = [
    {
        name: "Google Trends (Múltiplas Regiões)",
        fetch: fetchTrendsMultiRegion,
        weight: 1.0
    }
    // Future providers:
    // { name: "Bluesky", fetch: fetchBlueskyTrending, weight: 0.8 },
    // { name: "X/Twitter", fetch: fetchXTrending, weight: 0.7 }
];

// ==============================================================================
// CÁLCULO DE TAMANHO DE STREAM
// ==============================================================================
function calculateStreamSize(dataArray) {
    if (!dataArray || dataArray.length === 0) return "0.0";
    
    try {
        // Serializar dados para JSON
        const jsonString = JSON.stringify(dataArray);
        
        // Tamanho em bytes
        const sizeInBytes = jsonString.length;
        
        // Converter para kilobytes por palavra
        const sizePerWord = (sizeInBytes / dataArray.length) / 1024;
        
        // Retornar com 1 casa decimal
        return sizePerWord.toFixed(1);
    } catch (e) {
        console.error("Erro ao calcular stream size:", e);
        return "0.0";
    }
}

// ==============================================================================
// CARREGAMENTO MULTI-REGIÃO
// ==============================================================================
async function fetchTrendsMultiRegion() {
    console.log("🌍 Carregando tendências de múltiplas regiões...");
    
    const allResults = [];
    const regions = [
        { code: 'PT', func: fetchGoogleTrendsPT },
        { code: 'BR', func: fetchGoogleTrendsBR },
        { code: 'AO', func: fetchGoogleTrendsAO }
    ];
    
    // Carregar em paralelo
    const promises = regions.map(r => r.func());
    const results = await Promise.all(promises);
    
    // Combinar resultados (máx 8 por região para não sobrecarregar)
    results.forEach(result => {
        if (result && result.length > 0) {
            allResults.push(...result.slice(0, 8));
        }
    });
    
    if (allResults.length > 0) {
        console.log(`✨ Sucesso multi-região! ${allResults.length} itens carregados (máx 24 total)`);
        return allResults;
    }
    
    return null;
}

// ==============================================================================
// ESTRATÉGIA DE FALLBACK
// ==============================================================================
async function fetchLiveTrends() {
    console.log("🚀 Iniciando captura de tendências...");
    
    // Tentar cada provedor em ordem
    for (const provider of dataProviders) {
        console.log(`📡 Tentando: ${provider.name}...`);
        const result = await provider.fetch();
        
        if (result && result.length > 0) {
            console.log(`✨ Sucesso com ${provider.name}! ${result.length} itens carregados`);
            return result;
        }
    }
    
    // Se tudo falhar, usar mockData
    console.warn("⚠️  Todos os provedores falharam. Usando fallback (mockData)...");
    return mockData;
}

// ==============================================================================
// INICIALIZAR NO CARREGAMENTO
// ==============================================================================
// Será chamado por matriz-engine.js quando pronto

// Verificação de segurança: garantir que mockData está disponível globalmente
if (typeof window !== 'undefined') {
    window.mockData = mockData;
    window.calculateStreamSize = calculateStreamSize;
    console.log("✅ mockData disponível globalmente para fallback");
    
    // Função de teste manual para debugging
    window.testFetch = async function() {
        console.log("\n🧪 TESTE DE FETCH - Google Trends");
        console.log("==================================");
        const result = await fetchGoogleTrendsPT();
        if (result && result.length > 0) {
            console.log("✅ SUCESSO! Termos recebidos:");
            result.slice(0, 5).forEach((term, idx) => {
                console.log(`   ${idx + 1}. ${term.termo} (${term.tendencia})`);
            });
        } else {
            console.log("❌ FALHOU - Nenhum resultado");
        }
        return result;
    };
    
    // Função para recarregar dados dinamicamente
    window.reloadTrends = async function() {
        console.log("\n🔄 RECARREGANDO TENDÊNCIAS...");
        if (typeof loadLiveTrends === 'function') {
            await loadLiveTrends();
            console.log("✅ Recarregamento completo");
        } else {
            console.log("❌ loadLiveTrends() não encontrada");
        }
    };
}

console.log("✅ stream.js pronto - fetchLiveTrends disponível");
console.log("🧪 Para testar: window.testFetch()");
console.log("🔄 Para recarregar: window.reloadTrends()");

