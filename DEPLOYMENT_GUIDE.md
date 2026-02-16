# Deploy para Render + Vercel

## 1. DEPLOY DO BACKEND NO RENDER

### Passo 1: Criar conta no Render
1. Ir para https://render.com
2. Sign up com GitHub (login automático)

### Passo 2: Deploy do Backend
1. No Render, clica **New +** → **Web Service**
2. Conecta ao repositório `lingua-viva` do GitHub
3. Preenche:
   - **Name:** lingua-viva-backend
   - **Environment:** Python 3
   - **Build Command:** (deixa vazio, Render detecta requirements.txt)
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT trends_proxy_v2:app`
   - **Plan:** Free
4. Clica **Create Web Service**
5. Espera 5-10 minutos para o deploy terminar
6. Copia a URL que Render gera: `https://lingua-viva-backend.onrender.com`

### Passo 3: Actualizar stream.js com o URL remoto
Vai ser necessário actualizar a linha em `stream.js` e `matriz/stream.js`:

```javascript
const BACKEND_URL = 'https://lingua-viva-backend.onrender.com';  // RENDER URL
```

Depois fazer git push e Vercel fará re-deploy automático.

---

## 2. DEPLOY DO FRONTEND NO VERCEL

### Passo 1: Criar conta no Vercel
1. Ir para https://vercel.com
2. Sign up com GitHub (login automático)

### Passo 2: Deploy do Frontend
1. No Vercel, clica **Add New** → **Project**
2. Selecciona repositório `lingua-viva`
3. Vercel detecta que é um projeto estático (HTML/CSS/JS)
4. Clica **Deploy**
5. Espera 1-2 minutos
6. Obtem URL: `https://lingua-viva.vercel.app`

### Passo 3: Configurar Deploy Automático
- Vercel já configura para fazer re-deploy automático a cada git push
- Cada mudança em GitHub = novo deploy automático

---

## 3. FLUXO FINAL APÓS DEPLOY

```
User abre browser
         ↓
https://lingua-viva.vercel.app (Frontend hospedado)
         ↓
Browser carrega index.html → clica Matriz Neológica
         ↓
Carrega matriz.html que faz requests para:
https://lingua-viva-backend.onrender.com/trends
https://lingua-viva-backend.onrender.com/bluesky
         ↓
Backend retorna dados reais
         ↓
3D Visualization anima
```

---

## 4. ATUALIZAÇÕES FUTURAS

Sempre que quiseres fazer mudanças:

```bash
# Local
git add .
git commit -m "Descrição da mudança"
git push origin main

# GitHub detecta push
# Vercel faz re-deploy automático (frontend)
# Render faz re-deploy automático (backend)
```

**Nenhuma ação manual necessária após o primeiro setup!**

---

## 5. TROUBLESHOOTING

**"Render Backend está dormindo"**
- Free tier do Render dorme após 15 minutos sem tráfego
- Solução: Fazer um request ao endpoint antes de usar (aguarda 30 segundos para "acordar")
- Se for problema crítico: fazer upgrade para $7/mês (sempre activo)

**"CORS errors no browser"**
- Significa que o backend não está acessível ou está offline
- Verificar em Render se o deploy foi bem-sucedido
- Verificar Render logs: Dashboard → Service → Logs

**"Frontend não carrega imagens/CSS"**
- Vercel serve tudo. Se vires 404, significa arquivo falta no git
- Fazer: `git add .` e `git push`

---

## 6. DOMÍNIO CUSTOMIZADO (OPCIONAL)

Ambos permitem domínios customizados:
- **Render:** Configurar em Project Settings → Custom Domain
- **Vercel:** Configurar em Project Settings → Domains

Exemplo: `https://lingua-viva.pt` em vez de vercel.app

---

## PRÓXIMO PASSO

Depois de fazer deploy:

1. Ir para Render.com → criar que o deploy do backend está feito
2. Obter URL final (ex: https://lingua-viva-backend.onrender.com)
3. Atualizar `stream.js` com esse URL
4. Fazer `git push`
5. Vercel fará re-deploy automático
6. Abrir https://lingua-viva.vercel.app e testar!

