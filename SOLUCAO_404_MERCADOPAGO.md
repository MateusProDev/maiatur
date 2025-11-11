# 🚨 SOLUÇÃO ERRO 500 MERCADO PAGO - Configuração Vercel

## ❌ **PROBLEMA ATUAL:**
```
POST https://20buscarvacationbeach.com.br/api/mercadopago 500 (Internal Server Error)
```

**Deploy Atual:** https://favelachique-i2ev2o91y-mateus-ferreiras-projects.vercel.app

---
 
## ✅ **SOLUÇÃO PASSO A PASSO:**

### **1. Configurar Variáveis no Dashboard Vercel**

Acesse: https://vercel.com/mateus-ferreiras-projects/favelachique/settings/environment-variables

**Adicione EXATAMENTE estas variáveis:**

```bash
# MERCADO PAGO (OBRIGATÓRIAS)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-8159675933863688-080412-2cb05b0a066b2a8c30c01849a2c0c83e-1984491230
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=APP_USR-f9709095-64b6-4b7c-a1f1-bf7a19f86a69

# FIREBASE (OBRIGATÓRIAS) 
REACT_APP_FIREBASE_API_KEY=sua_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=favelachique-2b35b.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=favelachique-2b35b
REACT_APP_FIREBASE_STORAGE_BUCKET=favelachique-2b35b.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=906644993900
REACT_APP_FIREBASE_APP_ID=1:906644993900:web:b4e50fe22ad8b1bd66bca7
REACT_APP_FIREBASE_MEASUREMENT_ID=G-PZE3X0W6WT
```
```bash
npm install mercadopago
```

### 2. **Serviço Atualizado para Desenvolvimento Local** ✅
- Agora detecta se está em `development` mode
- Usa integração direta do SDK localmente
- Mantém API da Vercel para produção

### 3. **Variáveis de Ambiente Configuradas** ✅
```bash
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=APP_USR-e5962edc-6ca8-48e3-bacc-452999730020
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
```

## 🔄 **PRÓXIMOS PASSOS:**

### 1. **Reiniciar o Servidor** (OBRIGATÓRIO)
```bash
# Pare o servidor (Ctrl+C)
# Depois execute:
npm start
```

### 2. **Verificar no Console do Navegador:**
Você deve ver:
```
✅ Configuração do Mercado Pago validada com sucesso
🔑 Public Key: APP_USR-e5962edc-6...
🔒 Access Token: APP_USR-4447518579...
```

### 3. **Testar o Pagamento:**
- Faça uma reserva
- Escolha método de pagamento
- Agora deve funcionar sem erro 404

## 🌐 **Para Produção (Vercel):**

### Configure estas variáveis no painel da Vercel:
1. `REACT_APP_MERCADO_PAGO_PUBLIC_KEY`
2. `REACT_APP_MERCADO_PAGO_ACCESS_TOKEN` 
3. `REACT_APP_MERCADO_PAGO_CLIENT_ID`
4. `MERCADO_PAGO_CLIENT_SECRET`

## 🔍 **Como Verificar se Funcionou:**

### Console sem erros:
❌ Antes: `POST http://localhost:3000/api/mercadopago 404`
✅ Depois: Nenhum erro 404

### Fluxo de pagamento:
1. Escolher pacote → ✅ 
2. Preencher dados → ✅
3. Escolher pagamento → ✅
4. **Redirecionar para Mercado Pago** → ✅ (Novo!)

---

## ⚡ **AÇÃO IMEDIATA:**
1. **Pare o servidor** (`Ctrl+C`)
2. **Reinicie** (`npm start`) 
3. **Teste novamente**

Se ainda der erro, me avise qual mensagem aparece! 
