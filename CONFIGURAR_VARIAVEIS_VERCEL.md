# 🚀 GUIA: Configurar Variáveis na Vercel

## 📋 Passo a Passo:

### 1. Acesse a Vercel:
- Vá para: https://vercel.com/dashboard
- Entre no seu projeto "favelachique"
- Clique em **Settings**
- Clique em **Environment Variables**

### 2. Adicione estas variáveis (uma por vez):

#### 🔑 **Mercado Pago (obrigatórias):**
```
Nome: MERCADO_PAGO_ACCESS_TOKEN
Valor: TEST-sua-chave-aqui (pegar no Mercado Pago)

Nome: REACT_APP_MERCADO_PAGO_PUBLIC_KEY  
Valor: TEST-sua-chave-publica-aqui (pegar no Mercado Pago)
```

#### 🔥 **Firebase (se ainda não tiver):**
```
Nome: REACT_APP_FIREBASE_API_KEY
Valor: sua-chave-firebase

Nome: REACT_APP_FIREBASE_AUTH_DOMAIN
Valor: seu-projeto.firebaseapp.com

Nome: REACT_APP_FIREBASE_PROJECT_ID
Valor: seu-projeto-id

Nome: REACT_APP_FIREBASE_STORAGE_BUCKET
Valor: seu-projeto.appspot.com

Nome: REACT_APP_FIREBASE_MESSAGING_SENDER_ID
Valor: 123456789

Nome: REACT_APP_FIREBASE_APP_ID
Valor: 1:123456789:web:abcdef
```

### 3. Após adicionar todas:
- Clique em **Deploy** novamente
- Ou espere o redeploy automático

## ✅ **Checklist:**
- [ ] Criar conta/app no Mercado Pago
- [ ] Obter chaves TEST- (sandbox)
- [ ] Adicionar variáveis na Vercel
- [ ] Fazer redeploy
- [ ] Testar pagamento

## 🎯 **Prioridade AGORA:**
1. **Mercado Pago** (2 variáveis obrigatórias)
2. **Redeploy**
3. **Testar**
