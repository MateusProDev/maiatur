# ✅ CHECKLIST - CONFIGURAR VERCEL

## 🎯 SIGA ESTA ORDEM

### ☐ 1. Acessar Vercel
- [ ] Ir para https://vercel.com/dashboard
- [ ] Selecionar projeto **maiatur**

### ☐ 2. Ir para Environment Variables
- [ ] Clicar em **Settings** (menu superior)
- [ ] Clicar em **Environment Variables** (menu lateral)

### ☐ 3. Adicionar Variáveis do Firebase (6 variáveis)
- [ ] `REACT_APP_FIREBASE_API_KEY` = `sua_api_key_aqui`
- [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` = `maiatur.firebaseapp.com`
- [ ] `REACT_APP_FIREBASE_PROJECT_ID` = `maiatur`
- [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET` = `maiatur.firebasestorage.app`
- [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = `1037976703161`
- [ ] `REACT_APP_FIREBASE_APP_ID` = `1:1037976703161:web:124bbc5c66546180d04b68`

### ☐ 4. Adicionar Variáveis do Mercado Pago (4 variáveis)
- [ ] `REACT_APP_MERCADOPAGO_PUBLIC_KEY` = `APP_USR-e5962edc-6ca8-48e3-bacc-452999730020`
- [ ] `MERCADOPAGO_ACCESS_TOKEN` = `APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206`
- [ ] `MERCADO_PAGO_ACCESS_TOKEN` = `APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206`
- [ ] `MERCADO_PAGO_CLIENT_SECRET` = `jvhLiA3XbYne5T4OrPSlVu7xEioXsbMB`

### ☐ 5. Adicionar Variáveis do Backblaze B2 (4 variáveis)
- [ ] `B2_BUCKET_NAME` = `favelachiqueimagens`
- [ ] `B2_BUCKET_ID` = `8b94617bb32fbdff9759031a`
- [ ] `B2_APPLICATION_KEY` = `K0051Uwe4BSj4WoSfelx7WvwsZzDRtY`
- [ ] `B2_KEY_ID` = `005b41b3fdf793a0000000005`

### ☐ 6. Verificar Ambientes
Para CADA variável, marcar:
- [ ] ✅ Production
- [ ] ✅ Preview
- [ ] ✅ Development

### ☐ 7. Fazer Redeploy
- [ ] Ir em **Deployments**
- [ ] Clicar nos 3 pontos (...) do último deploy
- [ ] Clicar em **Redeploy**
- [ ] Aguardar finalizar (2-3 minutos)

### ☐ 8. Testar Site
- [ ] Acessar URL da Vercel
- [ ] Verificar se não está mais branco
- [ ] Verificar se banners aparecem
- [ ] Testar login
- [ ] Testar navegação

---

## 📊 TOTAL DE VARIÁVEIS: 14

- Firebase: **6** variáveis
- Mercado Pago: **4** variáveis  
- Backblaze B2: **4** variáveis

---

## ⚠️ ERROS COMUNS

### Tela continua branca?
✅ Verificar se TODAS as 14 variáveis foram adicionadas
✅ Verificar se o prefixo `REACT_APP_` está correto
✅ Fazer Hard Refresh: `Ctrl + Shift + R`

### Erro de autenticação?
✅ Verificar se as variáveis do Firebase estão corretas
✅ Verificar se selecionou os 3 ambientes (Production, Preview, Development)

### Banners não aparecem?
✅ Aguardar 5 segundos após o site carregar
✅ Abrir console (F12) e verificar erros
✅ Usar `window.initBanners()` no console

---

## 🎉 SUCESSO!

Quando tudo estiver OK, você verá:
- ✅ Site carrega normalmente
- ✅ Carrossel com 5 banners rodando
- ✅ Login funcionando
- ✅ Todas as funcionalidades ativas

**Marque cada item conforme for fazendo! ✓**
