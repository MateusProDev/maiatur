# 🔐 VARIÁVEIS DE AMBIENTE COMPLETAS - VERCEL

## 📋 Cole estas variáveis exatamente como estão na Vercel

### 🔥 FIREBASE (Projeto: maiatur)
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBwxcShz_SMx7PG8gzTOvjjkG7SbJ7PBcw
REACT_APP_FIREBASE_AUTH_DOMAIN=maiatur.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=maiatur
REACT_APP_FIREBASE_STORAGE_BUCKET=maiatur.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1037976703161
REACT_APP_FIREBASE_APP_ID=1:1037976703161:web:124bbc5c66546180d04b68
```

### 💳 MERCADO PAGO
```
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-e5962edc-6ca8-48e3-bacc-452999730020
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
MERCADO_PAGO_CLIENT_SECRET=jvhLiA3XbYne5T4OrPSlVu7xEioXsbMB
```

### ☁️ BACKBLAZE B2 (Storage de Imagens)
```
B2_BUCKET_NAME=favelachiqueimagens
B2_BUCKET_ID=8b94617bb32fbdff9759031a
B2_APPLICATION_KEY=K0051Uwe4BSj4WoSfelx7WvwsZzDRtY
B2_KEY_ID=005b41b3fdf793a0000000005
```

---

## 🎯 PASSO A PASSO NA VERCEL

### 1. Acesse a Vercel
- Vá para: https://vercel.com/dashboard
- Selecione o projeto **maiatur**

### 2. Vá para Settings
- Clique em **Settings** (topo da página)
- No menu lateral, clique em **Environment Variables**

### 3. Adicione TODAS as variáveis acima

**Para cada variável:**
1. Cole o **nome** (ex: `REACT_APP_FIREBASE_API_KEY`)
2. Cole o **valor** (ex: `AIzaSyBwxcShz_SMx7PG8gzTOvjjkG7SbJ7PBcw`)
3. Selecione os ambientes: **Production**, **Preview**, **Development**
4. Clique em **Save**

### 4. Faça Redeploy
Após adicionar todas as variáveis:
1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deploy
3. Clique em **Redeploy**
4. Aguarde o deploy finalizar (2-3 minutos)

---

## ✅ VERIFICAÇÃO

Após o redeploy, seu site deve:
- ✅ Carregar normalmente (não mais tela branca)
- ✅ Fazer login sem erros
- ✅ Mostrar os banners no carrossel
- ✅ Processar pagamentos do Mercado Pago

---

## 🔄 INICIALIZAÇÃO AUTOMÁTICA

Com estas variáveis configuradas, quando alguém acessar o site pela primeira vez:

1. ✅ **Coleção `banners`** será criada automaticamente
2. ✅ **5 banners de exemplo** serão adicionados
3. ✅ **Coleção `viagens`** será criada
4. ✅ **Coleção `pacotes`** será criada
5. ✅ **Settings de viagem** serão configurados

**Tudo isso acontece automaticamente em 2 segundos após o site carregar!**

---

## 🚨 IMPORTANTE

### Não esqueça de:
1. ✅ Adicionar **TODAS** as variáveis (não pule nenhuma)
2. ✅ Usar o prefixo `REACT_APP_` nas variáveis do Firebase
3. ✅ Selecionar **todos os ambientes** (Production, Preview, Development)
4. ✅ Fazer **Redeploy** após adicionar as variáveis

### Se a tela continuar branca:
1. Abra o console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se todas as variáveis foram salvas corretamente
4. Tente fazer Hard Refresh: `Ctrl + Shift + R`

---

## 📱 VARIÁVEIS LOCAIS (.env)

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyBwxcShz_SMx7PG8gzTOvjjkG7SbJ7PBcw
REACT_APP_FIREBASE_AUTH_DOMAIN=maiatur.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=maiatur
REACT_APP_FIREBASE_STORAGE_BUCKET=maiatur.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1037976703161
REACT_APP_FIREBASE_APP_ID=1:1037976703161:web:124bbc5c66546180d04b68

# Mercado Pago
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-e5962edc-6ca8-48e3-bacc-452999730020
MERCADOPAGO_ACCESS_TOKEN=APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
MERCADO_PAGO_CLIENT_SECRET=jvhLiA3XbYne5T4OrPSlVu7xEioXsbMB

# Backblaze B2
B2_BUCKET_NAME=favelachiqueimagens
B2_BUCKET_ID=8b94617bb32fbdff9759031a
B2_APPLICATION_KEY=K0051Uwe4BSj4WoSfelx7WvwsZzDRtY
B2_KEY_ID=005b41b3fdf793a0000000005
```

**⚠️ NUNCA faça commit do arquivo `.env` no Git!**

Ele já está no `.gitignore` para sua segurança.

---

## 🎉 PRONTO!

Após seguir estes passos:
1. ✅ Tela branca será resolvida
2. ✅ Firebase funcionará perfeitamente
3. ✅ Banners carregarão automaticamente
4. ✅ Site 100% funcional na Vercel

**Qualquer dúvida, me avise!** 🚀
