# 🚀 COMO EXECUTAR O BACKEND PYTHON

## 📋 RESUMO
Criei um **backend Python** que busca dados do Google Trends sem bloqueios CORS.

---

## 🔧 PASSO 1: Instalar bibliotecas necessárias

Abra um **Terminal/PowerShell EM C:\DEV_local\MVL** e execute:

```powershell
pip install flask flask-cors requests
```

Deve aparecer:
```
Successfully installed flask-1.1.2 flask-cors-3.0.10 requests-2.25.1
```

---

## ▶️ PASSO 2: Executar o backend

No mesmo terminal, execute:

```powershell
python trends_proxy.py
```

Deve aparecer algo assim:
```
============================================================
🚀 TRENDS PROXY - Iniciando...
============================================================
📡 URL: http://localhost:5000
   - GET /trends?geo=PT (Portugal)
   - GET /trends?geo=BR (Brasil)
   - GET /health (Health check)
============================================================

💡 Frontend irá buscar de: http://localhost:5000/trends?geo=PT
```

**Se não aparecer nada, há um erro. Mostro-te como resolver abaixo.**

---

## 🧪 PASSO 3: Testar (nova janela/tab terminal)

Deixa este terminal a correr o backend Python.

**Numa NOVA janela de terminal**, execute:

```powershell
curl http://localhost:5000/trends?geo=PT
```

Deve retornar JSON:
```json
{
  "success": true,
  "count": 25,
  "geo": "PT",
  "data": [...]
}
```

---

## 🌐 PASSO 4: Recarregar a página matriz.html

1. Vai a http://localhost:8000/matriz.html
2. Clica "SINTONIZAR_MATRIZ"
3. Aguarda 2-3 segundos
4. Abre F12 (Console)
5. Procura por:
   ```
   ✅ Backend Python funcionou!
   ✅ Google Trends (Backend Local): 25 termos carregados!
   🟢 LIVE_DATA_ACTIVE
   ```

---

## ⚠️ ERROS COMUNS

### Erro: "No module named 'flask'"
**Solução:**
```powershell
pip install flask flask-cors requests
```

### Erro: "Address already in use"
**Significa:** Código Python já está rodando na porta 5000

**Solução:** 
```powershell
# Procura pelo processo
Get-Process python

# Mata o processo (substitui PID)
Stop-Process -Id 1234
```

### Erro: "ModuleNotFoundError: No module named 'requests'"
**Solução:**
```powershell
pip install requests
```

---

## 📊 FICHEIROS

- **trends_proxy.py** ← Backend Python (novo)
- **stream.js** ← Atualizado (tenta Backend primeiro)
- **matriz-engine.js** ← Sem mudanças
- **matriz.html** ← Sem mudanças

---

## ✅ FLUXO COMPLETO

1. Terminal 1: `python trends_proxy.py` (mantém rodando)
2. Terminal 2: `cd c:\DEV_local\MVL && python -m http.server 8000` (se não está a rodar)
3. Browser: http://localhost:8000/matriz.html
4. Clica "SINTONIZAR_MATRIZ"
5. F12 Console → Vê "🟢 LIVE_DATA_ACTIVE"
6. Sucesso! ✨

---

## 🎯 RESULTADO ESPERADO

**No Console (F12), após clicar SINTONIZAR:**
```
📡 Tentando 1/4: Backend Python local...
   Status: 200
✅ Backend Python funcionou!
✅ Google Trends (Backend Local): 25 termos carregados!
📝 Amostra: {termo: "Eleição 2026", origem: "Google_Pulse_PT", ...}
🟢 LIVE_DATA_ACTIVE
```

**Na página:**
- Palavras a cair em tempo real
- Clica numa → ORIGEM mostra "Google_Pulse_PT"
- Badge mostra 🟢 verde

---

## 💡 DICAS

- Se o backend.log aparecer erros, conta-me
- Terminal backend fica ligado enquanto testar
- Se mudares localhost, atualiza URL em stream.js

**Consegues executar `python trends_proxy.py`?**
