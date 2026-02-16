# Checklist Rápida de Deploy

## ✅ O que já fiz para ti:

- ✅ Criei `requirements.txt` com dependências Python
- ✅ Criei `Procfile` com comando de inicialização (Render)
- ✅ Atualizar `stream.js` para usar `BACKEND_URL` configurável
- ✅ Fiz git push de tudo para GitHub

## 🚀 O que tu precisas fazer:

### 1️⃣ Backend (Render) - ~10 minutos

- [ ] Vai para https://render.com
- [ ] Sign up com GitHub
- [ ] Clica **New +** → **Web Service**
- [ ] Selecciona repositório `lingua-viva`
- [ ] **Preenche:**
  - Name: `lingua-viva-backend`
  - Environment: Python 3
  - Build: (deixa vazio)
  - Start: `gunicorn -w 4 -b 0.0.0.0:$PORT trends_proxy_v2:app`
  - Plan: Free
- [ ] Clica **Create Web Service**
- [ ] **Aguarda 5-10 minutos** para deploy terminar
- [ ] **Copia a URL gerada** (ex: `https://lingua-viva-backend.onrender.com`)

### 2️⃣ Actualizar stream.js com URL do Render - ~2 minutos

Depois do Render terminar:
- [ ] Em `stream.js` linha 13, alterar:
  ```javascript
  const BACKEND_URL = 'https://lingua-viva-backend.onrender.com';
  ```
  (Substituir com a tua URL do Render)

- [ ] Em `matriz/stream.js` linha 13, fazer o mesmo

- [ ] Fazer git push:
  ```bash
  git add stream.js matriz/stream.js
  git commit -m "Update backend URL for Render deployment"
  git push origin main
  ```

### 3️⃣ Frontend (Vercel) - ~10 minutos

- [ ] Vai para https://vercel.com
- [ ] Sign up com GitHub
- [ ] Clica **Add New** → **Project**
- [ ] Selecciona repositório `lingua-viva`
- [ ] Clica **Deploy**
- [ ] **Aguarda 1-2 minutos**
- [ ] Copia a URL gerada (ex: `https://lingua-viva.vercel.app`)

### 4️⃣ Testar

- [ ] Abre https://lingua-viva.vercel.app
- [ ] Clica em "Matriz Neológica"
- [ ] Vê se os dados carregam (3D animation)
- [ ] Se vires dados, 🎉 **SUCESSO!**

---

## 📌 Notas Importantes

**Render Free Tier:**
- Dorme se não tiver tráfego durante 15 minutos
- Na primeira utilização, pode demorar 30 segundos (acordar)
- Se precisar de sempre ativo: fazer upgrade para $7/mês

**Vercel:**
- Zero custo
- Deploy automático sempre que fizes `git push`

**Das próximas atualizações:**
```bash
git add .
git commit -m "Nova feature"
git push origin main  # Vercel re-deploya automaticamente
```

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| "Cannot reach backend" | Render pode estar dormindo. Aguardar 1-2 minutos |
| "404 Not Found" (Vercel) | Ficheiro não fez push a GitHub. Fazer `git push` |
| Backend retorna erro | Verificar Render logs (Dashboard → Service → Logs) |
| Dados não carregam | Verificar browser console (F12) para erros CORS |

---

**Duração total estimada: ~30-40 minutos (maioria é time idle para deploy)**

