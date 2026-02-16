# MATRIZ NEOLÓGICA V2.6 - REFACTORING PARA DADOS DINÂMICOS

## 📋 Resumo da Refatoração

A página Matriz Neológica foi refatorada para utilizar dados dinâmicos do **Google Trends** como fonte primária, mantendo um robusto sistema de fallback para mockData quando a rede falhar.

---

## 🏗️ Arquitetura

### Componentes Novos

#### 1. **stream.js** - Provedor de Dados Dinâmicos
Ficheiro centralizado responsável por:
- Buscar dados de múltiplas fontes (Google Trends, futuras APIs)
- Transformar dados brutos em formato compatível com a interface
- Gerenciar fallback automático
- Prover logging para debugging

**Características principais:**
- ✅ Plugin-and-play: Adicione novos provedores apenas adicionando à array `dataProviders`
- ✅ CORS handling: Usa proxy `allorigins.win` para contornar restrições
- ✅ XML Parsing: Converte RSS do Google Trends para objetos JavaScript
- ✅ Mapeamento inteligente: Traffic → Tendência, pubDate → Status

### Componentes Modificados

#### 2. **matriz-engine.js** - Motor Principal Atualizado
Mudanças:
- ❌ Removeu: Array estático `wordsDB` hardcoded
- ✅ Adicionou: `let wordsDB = []` (dinâmico)
- ✅ Adicionou: `let isDataLoaded` (flag de sincronização)
- ✅ Adicionou: `async function loadLiveTrends()` (inicializador de dados)
- ✅ Modificou: `WordParticle.reset()` para usar fallback intelligente

#### 3. **matriz.html** - Ordem de Scripts
```html
<!-- Deve vir ANTES de matriz-engine.js -->
<script src="stream.js"></script>
<script src="matriz-engine.js"></script>
```

---

## 🔄 Fluxo de Execution

### 1️⃣ Carregamento da Página
```
1. stream.js carrega
   ├─ Define mockData (10 termos em português)
   ├─ Define fetchLiveTrends() 
   └─ Expõe globalmente via window.mockData

2. matriz-engine.js carrega
   ├─ Inicializa wordsDB = []
   ├─ Cria WordParticle class
   └─ Registra event listeners

3. window.onload
   ├─ initParticles() com fallback para mockData
   ├─ Mostra intro overlay com manifesto tipado
   └─ Aguarda interação do utilizador
```

### 2️⃣ Clique em "SINTONIZAR_MATRIZ"
```
1. tuneBtn.onclick acionado
   ├─ Retoma áudio (WebAudio)
   ├─ Toca beep
   ├─ Esconde intro overlay
   └─ Inicia animate() + loadLiveTrends()

2. loadLiveTrends() async
   ├─ Chama fetchLiveTrends() de stream.js
   └─ Aguarda resultado

3. fetchLiveTrends() (em stream.js)
   ├─ Tenta Google Trends (Portugal)
   │  ├─ Usa proxy allorigins.win
   │  ├─ Parse XML RSS
   │  └─ Mapeia para objeto
   └─ Se falhar → Usa mockData

4. Sucesso
   ├─ wordsDB atualizado com dados reais
   ├─ isDataLoaded = true
   ├─ initParticles() re-executado
   └─ Chuva de palavras com termos em tempo real
```

---

## 📊 Mapeamento de Dados (Google Trends RSS → Objeto Local)

### Google Trends RSS
```xml
<item>
  <title>1. Palavra Trending</title>
  <pubDate>Fri, 15 Feb 2026 22:00:00 +0000</pubDate>
  <ht:approx_traffic>+250K</ht:approx_traffic>
</item>
```

### Transformação em time.js
```javascript
{
  termo: "Palavra Trending",           // title sem número
  origem: "Google_Pulse_PT",           // Identificas origem
  status: "22 min atrás",              // Calculado de pubDate
  tendencia: "Alta",                   // Mapeado de traffic (+250K → Alta)
  def: "(Google Trends) Termo em...",  // Descrição automática
  traffic: "+250K",                    // Original
  source: "google_trends"              // Para auditoria
}
```

### Mapeo de Traffic → Tendência
- **+500K+** → "Explosiva"
- **+100K-500K** → "Alta"  
- **+50K-100K** → "Crescente"
- **+10K-50K** → "Média"
- **-10K** → "Baixa"

### Cálculo de Status (pubDate)
- Menos de 1 min → "Agora mesmo"
- Menos de 1 hora → "X min atrás"
- Menos de 24h → "Xh atrás"
- Mais de 24h → "Xd atrás"

---

## 🔌 Arquitetura Plug-and-Play

### Adicionar Novo Provedor

1. **Criar função fetch em stream.js:**
```javascript
async function fetchBlueskyTrending() {
    try {
        const response = await fetch('https://api.bluesky.com/...');
        const data = await response.json();
        
        // Transformar em formato compatível
        return data.map(item => ({
            termo: item.text,
            origem: "Bluesky",
            status: getTimeSincePublication(item.createdAt),
            tendencia: calculateTendencia(item.engagement),
            def: item.description,
            source: "bluesky"
        }));
    } catch (e) {
        console.error("Bluesky fetch failed:", e);
        return null;
    }
}
```

2. **Registar em dataProviders:**
```javascript
const dataProviders = [
    { name: "Google Trends (PT)", fetch: fetchGoogleTrendsPT, weight: 1.0 },
    { name: "Bluesky", fetch: fetchBlueskyTrending, weight: 0.8 },
    // Novo provedor é automaticamente incluído no fallback!
];
```

3. **fetchLiveTrends() tenta em ordem:**
   - Google Trends → Sucesso? Retorna
   - Bluesky → Sucesso? Retorna
   - Todos falharam? → mockData

---

## ⚡ Características de Resiliência

### Fallback em Camadas
1. **Google Trends carrega?** ✅ Use dados reais PT
2. **Google Trends falha?** → Tenta próximo provedor
3. **Todos os provedores falham?** → Use mockData
4. **mockData indisponível?** → Use array vazio (graceful degradation)

### Logging Completo
Console mostra:
```
✅ stream.js carregado
✅ mockData disponível globalmente
✅ stream.js pronto - fetchLiveTrends disponível
✅ matriz-engine.js carregado
🚀 Iniciando Matriz Neológica...
📊 mockData disponível? true
✅ Matriz pronta para sintonização
🔄 Fetching Google Trends (Portugal)...
✅ Google Trends: 25 termos carregados
```

---

## 🔍 Troubleshooting

### Problema: "Palavras não aparecem"
**Verificar:**
1. Console: `✅ mockData disponível`?
2. Após clique: `✅ Google Trends: X termos carregados`?
3. Se não, verificar aba Network para falhas de CORS

### Problema: "Dados estão estáticos"
**Causa:** Google Trends está falhando
**Solução:**
1. Verificar link proxy: `https://api.allorigins.win/get?url=...`
2. Verificar se geo=PT está presente
3. Fallback para mockData é automático

### Problema: "origem: Google_Pulse_PT não aparece"
**Verificar:** O termo é do Google Trends (origem deve ser `Google_Pulse_PT`)
- Se origem é antiga, é do mockData
- Próximas palavras que caírem serão do Google Trends

---

## 📝 Modificações Visuais

### Modal de Detalhe (ao clicar numa palavra)
**Antes:**
```
TERMO: Promptar
ORIGEM: Global
STATUS: Emergente
TENDÊNCIA: Explosiva
```

**Depois (com Google Trends):**
```
TERMO: Eleição 2026
ORIGEM: Google_Pulse_PT  ← Novo badge
STATUS: 5 min atrás       ← Dinâmico (baseado em pubDate)
TENDÊNCIA: Explosiva      ← Baseado em traffic real
```

---

## 🎯 Requisitos Completados

✅ **Refatoração do Data-Source:** `fetchLiveTrends()` async com fetch  
✅ **CORS Proxy:** Usa `allorigins.win` para contornar bloqueios  
✅ **Mapeamento de Dados:** RSS XML → Objeto compatível  
✅ **Arquitetura Plug-and-Play:** `dataProviders` array extensível  
✅ **Fallback Automático:** mockData quando serviços falham  
✅ **Visual de Origem:** Modal mostra `ORIGEM: Google_Pulse_PT`  
✅ **Animação Mantida:** Chuva de palavras funciona igual

---

## 🚀 Próximos Passos (Futuro)

### Melhorias Planejadas
1. **Múltiplas Regiões:** Adicione `?geo=BR`, `?geo=AO` para outras regiões
2. **Real-time Updates:** Refresh automático a cada 5 min
3. **Cache Local:** Evitar múltiplas requisições
4. **Bluesky Integration:** Adicione `fetchBlueskyTrending()`
5. **Analytics:** Track termos mais populares
6. **Histórico:** Guarde dados antigos para análise temporal

---

## 📚 Ficheiros Envolvidos

| Ficheiro | Mudança | Descrição |
|----------|---------|-----------|
| `stream.js` | ✅ Novo | Motor de captura de dados dinâmicos |
| `matriz-engine.js` | 🔧 Modificado | Integração de loadLiveTrends() |
| `matriz.html` | 🔧 Modificado | Ordem de scripts (stream.js primeiro) |
| `matriz-style.css` | ✗ Sem mudanças | Estilos mantidos |

---

**Refatoração completada em 15/02/2026 - Matriz Neológica V2.6 (Dynamic Edition)**
