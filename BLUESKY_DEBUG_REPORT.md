# RELATÓRIO DE DEBUG - BLUESKY API INTEGRATION

## 📋 RESUMO EXECUTIVO

Estamos a tentar integrar dados REAIS do Bluesky numa aplicação web (Matriz Neológica) que mostra palavras em tendência. O Google Trends funciona perfeitamente, mas o Bluesky retorna **sempre fallback**, indicando que a API está bloqueada ou inacessível.

---

## 🎯 OBJETIVO

Extrair **termos em tendência do Bluesky** em tempo real e exibi-los numa visualização 3D.

---

## ✅ O QUE JÁ FUNCIONA

1. **Google Trends** (Multi-região PT/BR/AO)
   - ✅ Status 200 OK
   - ✅ Dados completos recebidos
   - ✅ Parsing correto de RSS
   - ✅ Exibição na matriz 3D

2. **Backend Flask local** (Python 3.12)
   - ✅ Endpoints `/trends?geo=PT` funcionam
   - ✅ CORS habilitado
   - ✅ Logging detalhado
   - ✅ Fallback automático

3. **Frontend JavaScript**
   - ✅ Comunicação com backend via fetch
   - ✅ Parser de dados correto
   - ✅ Renderização de 50+ partículas 3D

---

## ❌ O QUE NÃO FUNCIONA

**Bluesky API não retorna dados reais:**

```
Status HTTP: 200 OK ✓
Response JSON: válido ✓
Dados retornados: FALLBACK mockado ✗
Descrição: "Bluesky trending (fallback)"
```

---

## 🔍 TENTATIVAS JÁ FEITAS

### 1️⃣ **Estratégia 1: getPopular (Endpoint oficial)**
```
GET https://bsky.social/xrpc/app.bsky.feed.getPopular?limit=50
```
- ❌ Status: Retorna erro ou resposta vazia
- ❌ Feed vazio ou estrutura inesperada
- ❌ Fallback ativado

### 2️⃣ **Estratégia 2: searchPosts (Search por hashtags)**
```
GET https://bsky.social/xrpc/app.bsky.feed.searchPosts?q=%23python&limit=10
```
- ❌ Falha silenciosa
- ❌ Nenhum post retornado
- ❌ Fallback ativado

### 3️⃣ **Variações de Headers**
- User-Agent: Mozilla/5.0 ✗
- Accept: application/json ✗
- Diferentes combinações ✗

### 4️⃣ **Timeout e Retry**
- Timeout: 10 segundos ✗
- Sem retry automático ✗

---

## 📊 DADOS TÉCNICOS

**Ambiente:**
- OS: Windows 10
- Python: 3.12
- Flask: 3.1.2
- Node.js: Browser (Chrome/Edge)
- Location: Portugal 🇵🇹

**Request Logs (Backend):**
```
📡 Request: /bluesky
🔍 Estratégia 1: Tentando getPopular...
📊 Resposta: 200
❌ getPopular falhou (status 200)
🔍 Estratégia 2: Buscando hashtags populares...
📊 Resposta: timeouts/erros
⚠️  NENHUMA ESTRATÉGIA FUNCIONOU - RETORNANDO FALLBACK
```

---

## 🤔 HIPÓTESES

1. **Bluesky bloqueou ou exigiu autenticação**
   - ❓ Endpoint precisa de token OAuth2?
   - ❓ IP bloqueado por rate limiting?
   - ❓ Endpoint foi descontinuado?

2. **Estrutura da resposta mudou**
   - ❓ Endpoint retorna schema diferente?
   - ❓ JSON está aninhado diferentemente?
   - ❓ Feed está vazio por design?

3. **CORS bloqueado**
   - ❓ Mesmo pelo backend, está bloqueado?
   - ❓ Precisa de preflight request?

4. **Problema de timing/cache**
   - ❓ Endpoint só funciona em horários específicos?
   - ❓ Rate limiting após X requests?

---

## ❓ PERGUNTA PARA PESQUISA (MAIS ADEQUADA)

### **VERSÃO TÉCNICA (StackOverflow/Reddit):**
```
"Como aceder à Bluesky.social xrpc app.bsky.feed.getPopular sem autenticação OAuth2? 
Endpoint retorna status 200 mas feed vazio ou invalido. 
Outras opções para extrair trending posts do Bluesky via API pública?"
```

### **VERSÃO DETALHADA:**
```
"Bluesky API Integration: getPopular endpoint returns empty feed even with correct headers.
Testing from Python requests library (Flask backend) - status 200 but no posts in feed.
SearchPosts endpoint also fails silently. 
Does Bluesky require OAuth2 authentication for trending data?
Alternative public endpoints for trending posts?"
```

### **EM PORTUGUÊS:**
```
"Integração Bluesky API: Como aceder ao endpoint getPopular para obter posts em tendência?
Status 200 mas feed vazio - precisa OAuth2 ou altern

ativa gratuita?
Endpoints públicos do Bluesky para trending?"
```

---

## 🔗 RECURSOS A PESQUISAR

- [ ] Documentação oficial Bluesky API
- [ ] GitHub issues do Bluesky (autenticação)
- [ ] Blog posts sobre Bluesky API 2024-2026
- [ ] StackOverflow: tag `bluesky-api`
- [ ] Reddit: r/bluesky, r/web_development
- [ ] Repositórios de exemplo em Python/JavaScript

---

## 📌 PRÓXIMOS PASSOS

Antes de mudar de provedor:

1. **Pesquisar online** com as perguntas acima
2. **Verificar documentação oficial** do Bluesky
3. **Testar endpoint manualmente** com curl/Postman
4. **Verificar se precisa autenticação** (API keys, OAuth2)
5. **Procurar alternativas publicadas** (wrapper libraries, unofficial APIs)

Após clarificar, decidir:
- **Continuar com Bluesky** (se solução encontrada)
- **Mudar para alternativa** (Wikipedia, HackerNews, GitHub, etc.)

---

## 💾 FICHEIROS RELEVANTES

- `trends_proxy_v2.py` - Backend Flask com endpoint `/bluesky`
- `stream.js` - Frontend com `fetchBlueskyTrending()`
- `matriz-engine.js` - Visualização 3D
- Console logs - Mostram fallback sendo retornado

---

**Data:** 16 de Fevereiro de 2026  
**Status:** BLOQUEADO - Aguardando investigação
