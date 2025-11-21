# 📋 LISTA COMPLETA DE VARIÁVEIS DE AMBIENTE - VERCEL

## ✅ COPIAR E COLAR NA VERCEL

Acesse: https://vercel.com/dashboard → Projeto **maiatur** → Settings → Environment Variables

---

## 🔥 FIREBASE (6 variáveis) - ✅ JÁ CONFIGURADAS

```
REACT_APP_FIREBASE_API_KEY
AIzaSyAwRep60Z1nu9nCDsBTkamU2JjdU0XQnOk
```

```
REACT_APP_FIREBASE_AUTH_DOMAIN
maiatur.firebaseapp.com
```

```
REACT_APP_FIREBASE_PROJECT_ID
maiatur
```

```
REACT_APP_FIREBASE_STORAGE_BUCKET
maiatur.firebasestorage.app
```

```
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
1037976703161
```

```
REACT_APP_FIREBASE_APP_ID
1:1037976703161:web:124bbc5c66546180d04b68
```

---

## 💳 MERCADO PAGO (4 variáveis) - ✅ JÁ CONFIGURADAS

```
REACT_APP_MERCADO_PAGO_PUBLIC_KEY
APP_USR-e5962edc-6ca8-48e3-bacc-452999730020
```

```
REACT_APP_MERCADO_PAGO_ACCESS_TOKEN
APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
```

```
MERCADO_PAGO_ACCESS_TOKEN
APP_USR-4447518579890126-080413-39cfac562a66348ab49a7ae14c9a389a-529105206
```

```
MERCADO_PAGO_CLIENT_SECRET
jvhLiA3XbYne5T4OrPSlVu7xEioXsbMB
```

## 🖊️ TINYMCE EDITOR (1 variável) - ✅ CONFIGURAR AGORA

```
REACT_APP_TINYMCE_API_KEY
13z6w5yrbpj28wwgt6u1y9rhpyawybbsb732sa7ce93ndx49
```

---

## 📧 SMTP / E-MAIL (4 variáveis) - ❌ FALTAM CONFIGURAR

### Opção recomendada: Brevo (gratuito, 300 emails/dia)

```
SMTP_HOST
smtp-relay.brevo.com
```

```
SMTP_PORT
587
```

```
SMTP_USER
[PEGAR NA BREVO - Menu SMTP & API - Ex: 9a6f32001@smtp-brevo.com]
```

```
SMTP_PASS
[GERAR CHAVE SMTP NA BREVO - Menu SMTP & API - Botão "Criar chave SMTP"]
```

---

## 🏢 INFORMAÇÕES DA AGÊNCIA (5 variáveis) - ❌ FALTAM CONFIGURAR

Essas variáveis aparecem nos e-mails e vouchers:

```
AGENCY_FROM
reservas@transferfortalezatur.com.br
```

```
AGENCY_REPLY_TO
atendimento@transferfortalezatur.com.br
```

```
AGENCY_EMAIL
contato@transferfortalezatur.com.br
```

```
AGENCY_PHONE
+55 (85) 98877-6655
```

```
AGENCY_CNPJ
00.000.000/0001-00
```

---

## ☁️ BACKBLAZE B2 (4 variáveis) - ⚠️ OPCIONAL (Upload de Imagens)

Se você não usa upload de imagens pelo admin, pode pular estas:

```
B2_BUCKET_NAME
favelachiqueimagens
```

```
B2_BUCKET_ID
8b94617bb32fbdff9759031a
```

```
B2_APPLICATION_KEY
K0051Uwe4BSj4WoSfelx7WvwsZzDRtY
```

```
B2_KEY_ID
005b41b3fdf793a0000000005
```

---

## 🌐 URL BASE (1 variável) - ⚠️ OPCIONAL

Usada para redirecionamentos do Mercado Pago:

```
REACT_APP_BASE_URL
https://transferfortalezatur.com.br
```

---

## 🔑 WHATSAPP (1 variável) - ⚠️ OPCIONAL

Para botões de WhatsApp:

```
REACT_APP_AGENCY_PHONE_WHATS
5585988776655
```
*(Formato: código do país + DDD + número, sem espaços ou caracteres)*

---

## 📊 RESUMO GERAL

### ✅ Variáveis JÁ CONFIGURADAS (10 de 25):
- Firebase: 6 variáveis ✅
- Mercado Pago: 4 variáveis ✅

### ❌ Variáveis FALTANDO (9 obrigatórias):
- SMTP: 4 variáveis ❌ **← POR ISSO E-MAIL NÃO FUNCIONA!**
- Agência: 5 variáveis ❌

### ⚠️ Variáveis OPCIONAIS (6):
- Backblaze B2: 4 variáveis (upload de imagens)
- URL Base: 1 variável (redirecionamentos MP)
- WhatsApp: 1 variável (botões WhatsApp)

---

## 🚀 PRÓXIMOS PASSOS PARA ATIVAR E-MAILS

### 1. Criar conta Brevo (5 min)
- Acesse: https://www.brevo.com/
- Clique em "Start Free"
- Confirme e-mail

### 2. Pegar credenciais SMTP (3 min)
- Menu: **SMTP & API**
- Copie: **Servidor**, **Porta**, **Login**
- Clique: **"Criar chave SMTP"** → Copie a chave

### 3. Verificar remetente (5 min)
- Menu: **Remetentes**
- Adicione: `reservas@transferfortalezatur.com.br`
- Confirme por e-mail OU adicione DNS

### 4. Adicionar na Vercel (5 min)
- Settings → Environment Variables
- Adicione as 9 variáveis acima (SMTP + Agência)
- Selecione: Production, Preview, Development

### 5. Redeploy (2 min)
- Deployments → (...) → Redeploy

**TEMPO TOTAL: ~20 minutos**

---

## 🧪 TESTAR SE FUNCIONOU

### Método 1: Fazer reserva real
1. Acesse: https://transferfortalezatur.com.br/reservas
2. Preencha formulário
3. Finalize pagamento
4. Verifique e-mail na caixa de entrada

### Método 2: Endpoint de teste
1. Adicione temporariamente na Vercel:
   ```
   TEST_EMAIL_KEY
   teste123
   ```

2. Acesse:
   ```
   https://transferfortalezatur.com.br/api/test-email?to=SEU_EMAIL@GMAIL.COM&key=teste123
   ```

3. Verifique se chegou e-mail "Teste SMTP Maiatur"

4. **REMOVA** a variável `TEST_EMAIL_KEY` depois

---

## 📞 VERIFICAR VARIÁVEIS SMTP

Se quiser verificar se as variáveis foram configuradas corretamente:

```
https://transferfortalezatur.com.br/api/debug-smtp
```

Este endpoint mostra quais variáveis SMTP estão definidas (sem expor senhas).

---

## ⚠️ IMPORTANTE

- **Para cada variável**, selecione TODOS os ambientes: Production, Preview, Development
- Após adicionar/modificar variáveis, SEMPRE faça **Redeploy**
- Senhas/Tokens devem ser mantidos em segredo
- O arquivo `.env` local NÃO é enviado para Vercel (é ignorado pelo Git)

---

## 🆘 AJUDA RÁPIDA

### E-mails não chegam?
→ Verifique se as 4 variáveis SMTP estão configuradas
→ Verifique se remetente foi verificado na Brevo
→ Veja logs em: Vercel → Deployments → Functions

### Erro "Invalid login credentials"?
→ SMTP_USER e SMTP_PASS devem ser exatamente como aparece na Brevo
→ Gere nova chave SMTP se necessário

### E-mails vão para SPAM?
→ Configure SPF/DKIM no DNS (Brevo fornece instruções)
→ Use e-mail do seu domínio em AGENCY_FROM

---

**🎯 Com essas 19 variáveis configuradas (10 já tem + 9 que faltam), o sistema ficará 100% funcional!**
