# Session Notes - 2026-02-16

## Objetivo Principal
Integrar dados reais (Google Trends PT/BR/AO + Bluesky) na visualização 3D do Matriz Neológica, substituindo mockData.

## Status Técnico - ✅ COMPLETO
- Google Trends integration: **Working** (3 regiões, ~16-24 termos)
- Bluesky API integration: **Working** (getTrends endpoint, dados reais)
- 3D visualization: **Working** (stream.js + matriz-engine.js)
- Fallback chain: **Working** (Google → Bluesky → mockData)
- Data pipeline: **stream.js:fetchAllSources()** combina todas as fontes

## Propostas Recusadas (denna sessão)
1. ❌ **Protocol-based activation** (matriz://start)
   - Motivo: Desnecessário, confuso
   
2. ❌ **Health check modals** (backend-health-check.js)
   - Motivo: Popups desnecessárias, UX péssima
   
3. ❌ **Loading pages** (loading.html, setup.html)
   - Motivo: Adiciona friction ao usar um site
   
4. ❌ **User reboot requirement**
   - Motivo: Completamente inaceptável
   
5. ❌ **Complex setup scripts** com GUIs, registos, etc.
   - Motivo: Viola princípio de "zero complications"

## Propostas Ainda em Análise

### Opção A: Backend Remoto ⭐ RECOMENDADA
```
Backend (trends_proxy_v2.py) → Servidor Online
Frontend (index.html/matriz.html) → GitHub Pages / Vercel / Netlify

Vantagens:
✅ Zero setup para users
✅ Acessível online, qualquer lugar
✅ Zero scripts, zero instalação
✅ Requer apenas deployment uma vez

Costos: Grátis (Render, Railway, Heroku free tier) ou ~$5-10/mês
```

### Opção B: Backend Local (Descartada)
```
User executa backend localmente na sua máquina

Desvantagens:
❌ Requer processo rodando always-on
❌ Requer setup/reboot/scripts
❌ Não acessível remotamente
```

## Dados Técnicos Importantes
- Flask backend: `trends_proxy_v2.py` (port 5000)
- HTTP server: `python -m http.server 8000`
- Bluesky endpoint: `https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends`
- Google Trends via RSS (sem API key necessária)

## Próximos Passos
**DECISÃO NECESSÁRIA:** Backend remoto ou aceitar complexidade local?

Se remoto:
1. Escolher plataforma (Render/Railway/Heroku)
2. Deploy trends_proxy_v2.py
3. Update frontend URLs para backend remoto
4. Deploy frontend (GitHub Pages/Vercel)
5. Done - website funcional, zero setup

Se local:
1. Aceitar requirement de processo always-on
2. Implementar solução simples (Windows Service ou similar)
3. User deve aceitar alguma forma de setup

## Ficheiros Criados (passíveis de remoção)
- loading.html
- setup.html
- backend-health-check.js
- setup-auto-start.bat
- setup-protocol.bat
- setup-startup.ps1
- start-servers.bat
- start-servers.ps1
- matriz-launcher.py
- init-backend.bat

**Core files (manter):**
- index.html, matriz.html
- stream.js, matriz-engine.js
- style.css, matriz-style.css
- trends_proxy_v2.py
- (outros assets: arquivo, fluxo, glitch)
