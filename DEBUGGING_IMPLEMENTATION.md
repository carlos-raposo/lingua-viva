# 🔍 DEBUGGING IMPLEMENTADO - MATRIZ NEOLÓGICA V2.6

## 📌 O PROBLEMA
Utilizador está vendo apenas palavras do fallback (mockData) e não os dados reais do Google Trends (ORIGEM: "Google_Pulse_PT").

## ✅ O QUE FOI FEITO

### 1. **Múltiplos Proxies CORS** (stream.js)
Adicionei 3 proxies como fallback:
- `api.allorigins.win` (Proxy 1 - Primário)
- `cors-anywhere.herokuapp.com` (Proxy 2)
- `thingproxy.freeboard.io` (Proxy 3)

Se um falhar, tenta o próximo automaticamente.

### 2. **Logging Ultra Detalhado** (stream.js)
Console agora mostra:
```
📡 Tentando proxy 1/3: api.allorigins.win...
   Status: 200  ← HTTP response
✅ Proxy 1 funcionou!
📄 RSS content length: 4523
🔍 XML parsing resultado:
   - Parse errors: 0
   - Items found: 25
✅ Google Trends: 25 termos carregados com sucesso!
📝 Amostra: { termo: "Eleição 2026", tendencia: "Explosiva", ... }
```

### 3. **Funções de Teste Manual** (stream.js)
Execute no console (F12):

```javascript
// Forçar test de fetch (mostra qual proxy funciona)
window.testFetch()

// Recarregar dados em tempo real
window.reloadTrends()
```

### 4. **Badge Visual de Status** (matriz.html + CSS)
Adicionei um badge no canto superior esquerdo que muda:
- 🟢 **LIVE_DATA_ACTIVE** (Verde) = Dados reais do Google Trends
- 🟡 **FALLBACK_MODE** (Amarelo) = Usando mockData local

### 5. **Melhor Rastreamento** (matriz-engine.js)
loadLiveTrends() agora:
- Mostra qual badge está ativo
- Registra todas as fontes de dados
- Avisa se stream.js não foi carregado

---

## 🧪 COMO DEBUGAR

### Passo 1: Recarregue a página (Ctrl+F5)

### Passo 2: Clique em "SINTONIZAR_MATRIZ"

### Passo 3: Abra DevTools (F12)
Procure no Console por uma destas mensagens:

**SUCESSO:**
```
✅ Google Trends: 25 termos carregados com sucesso!
🟢 LIVE_DATA_ACTIVE
```

**FALLBACK (Esperado se proxies estão bloqueados):**
```
❌ Todos os proxies falharam
⚠️ Todos os provedores falharam. Usando fallback (mockData)...
🟡 FALLBACK_MODE
```

### Passo 4: Force um teste manual
Console:
```javascript
window.testFetch()
```

Isto irá:
- Tentar buscar dados do Google Trends
- Mostrar qual proxy funcionou (ou qual falhou)
- Listar os 5 primeiros termos recebidos

---

## 🎯 DIAGNÓSTICO RÁPIDO

| Situação | Significado | Ação |
|----------|------------|------|
| Badge 🟢 LIVE_DATA + ORIGEM=Google_Pulse_PT | ✅ Funcionando perfeitamente! | Nenhuma (sistema funcionando) |
| Badge 🟡 FALLBACK + ORIGEM=Global/Brasil | ⚠️ Proxies CORS bloqueados/indisponíveis | Tentar novamente em 1-2 min |
| Console mostra HTTP 403/429 | 🔒 Proxy bloqueado por limite de requisições | Aguardar ou usar VPN |
| Console mostra XML Parse Error | 📄 Google Trends retornou conteúdo inválido | Temporário, tentar novamente |

---

## 🔧 SOLUÇÕES COMUNS

### Problema: Ainda vejo FALLBACK_MODE
**Causa:** Nenhum proxy CORS está disponível/acessível

**Soluções:**
1. Aguarde 1-2 minutos (podem estar com rate limit)
2. Execute `window.reloadTrends()` no console
3. Se usar firewall empresarial, pode bloquear proxies CORS
4. Tente com VPN (alguns proxies bloqueiam sem VPN)

### Problema: Console mostra "Proxy X falhou"
**Causa:** Esse proxy específico está indisponível

**Esperado:** Sistema irá tentar o próximo proxy na lista

### Problema: "Todos os proxies falharam"
**Causa:** Google Trends ou todos os proxies estão indisponíveis

**Comportamento correto:** Usa mockData (fallback), página fica normal

---

## 📊 TESTES DISPONÍVEIS

No Console (F12), execute:

```javascript
// Verificar estado atual
console.log("wordsDB:", window.wordsDB.length, "itens")
console.log("isDataLoaded:", window.isDataLoaded)
console.log("mockData:", window.mockData.length, "itens")

// Testar fetch do zero
window.testFetch()

// Recarregar dados
window.reloadTrends()

// Ver badge status
document.getElementById('data-status-badge').textContent
```

---

## 🎮 FLOW DE TESTE COMPLETO

```
1. Recarregue página (Ctrl+F5)
   └─ Console deve mostrar:
      ✅ stream.js carregado
      ✅ mockData disponível globalmente
      ✅ stream.js pronto

2. Clique SINTONIZAR_MATRIZ
   └─ Console mostra:
      📡 ===== INICIANDO CARREGAMENTO =====
      ✅ fetchLiveTrends está disponível
      🚀 Iniciando captura de tendências...
      📡 Tentando: Google Trends (PT)...
      🔄 Fetching Google Trends...
      📡 Tentando proxy 1/3...

3. Aguarde 2-3 segundos

4. Verifique resultado:
      ✅ Google Trends: 25 termos carregados   ← SUCESSO!
      OR
      ⚠️ Todos os provedores falharam         ← FALLBACK

5. Verifique badge:
   - 🟢 LIVE_DATA_ACTIVE = Tudo ok
   - 🟡 FALLBACK_MODE = Usar mockData (ok também)

6. Clique numa palavra
   - Se ORIGEM = "Google_Pulse_PT" → Real ✓
   - Se ORIGEM = Outra → Fallback (esperado)
```

---

## 📚 FICHEIROS MODIFICADOS

| Ficheiro | Mudança |
|----------|---------|
| **stream.js** | ✨ Adicionado múltiplos proxies + logging detalhado + funções de teste |
| **matriz-engine.js** | 🔧 Adicionado badge visual + melhor logging |
| **matriz.html** | 🔧 Adicionado elemento badge de status |
| **matriz-style.css** | 🔧 Adicionado CSS para badge (verde/amarelo) |
| **DEBUGGING_GUIDE.sh** | 📚 Novo guia de debugging |

---

## 💡 PRÓXIMAS TENTATIVAS

1. **Recarregue a página e execute `window.testFetch()` no console**
2. **Compartilhe o output dos logs completos**
3. Se nenhum proxy funcionar, podemos usar uma alternativa:
   - RSS XMLParser biblioteca nativa
   - Backend próprio para fazer proxy
   - JSON API alternativa para tendências

---

**Data de implementação:** 15 de Fevereiro de 2026 - 23:XX  
**Status:** ✅ Debugging tools instaladas - pronto para diagnostic
