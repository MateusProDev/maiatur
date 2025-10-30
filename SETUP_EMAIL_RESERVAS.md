# 📧 CONFIGURAÇÃO DE EMAIL - SISTEMA DE RESERVAS

## ✅ Sistema 100% Gratuito na Vercel

Você criou uma reserva e o sistema **automaticamente**:
1. Salva no Firestore
2. Gera PDF do voucher
3. Envia email para o cliente

---

## 🔧 CONFIGURAÇÃO RÁPIDA

### 1️⃣ Criar Senha de Aplicativo no Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Clique em "Criar senha de app"
3. Escolha "Outro (nome personalizado)"
4. Digite: **Maiatur Reservas**
5. Copie a senha gerada (16 caracteres)

### 2️⃣ Configurar Variáveis no Vercel

No dashboard da Vercel:
- Vá em **Settings** → **Environment Variables**
- Adicione:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 465
SMTP_USER = seu-email@gmail.com
SMTP_PASS = xxxx xxxx xxxx xxxx (senha de app)

AGENCY_BRAND = Maiatur
AGENCY_EMAIL = contato@maiatur.com.br
AGENCY_PHONE = +55 (85) 98765-4321
AGENCY_CNPJ = 00.000.000/0001-00
```

### 3️⃣ Testar Localmente (Opcional)

Crie `.env.local` na raiz do projeto com as mesmas variáveis acima.

Execute:
```bash
npm run dev
```

---

## 📤 COMO FUNCIONA

Quando um cliente faz uma reserva:

```
Cliente preenche formulário
        ↓
Salva no Firestore
        ↓
Chama /api/enviar-email-reserva
        ↓
Gera PDF do voucher
        ↓
Envia email com anexo
        ↓
Cliente recebe email com voucher
```

---

## 📧 EMAIL ENVIADO

**Assunto:** ✅ Reserva Confirmada - Passeio - #ABC12345

**Conteúdo:**
- 🎉 Confirmação da reserva
- 📋 Detalhes completos
- 📎 Voucher PDF anexado
- 📞 Contatos da agência

---

## 🚀 DEPLOY

```bash
vercel --prod
```

Após o deploy, configure as variáveis no dashboard da Vercel.

---

## ⚠️ IMPORTANTE

- ✅ **Grátis**: Sem cartão, sem cobrança
- ✅ **Serverless**: Escala automaticamente
- ✅ **Rápido**: Email enviado em ~2 segundos
- ⚠️ **Gmail**: Limite de 500 emails/dia (suficiente!)

Para volumes maiores, considere:
- SendGrid (100 emails/dia grátis)
- Mailgun (5000 emails/mês grátis)
- AWS SES (após verificação)

---

## 🧪 TESTAR

1. Acesse: `http://localhost:3000/reservas`
2. Escolha um tipo de reserva
3. Preencha o formulário
4. Aguarde confirmação
5. Verifique o email (inbox ou spam)

---

## 🐛 PROBLEMAS?

### Email não chegou?
- ✅ Verificar spam/lixeira
- ✅ Conferir SMTP_USER e SMTP_PASS
- ✅ Ver logs no Vercel Dashboard
- ✅ Testar com outro email

### Erro 500?
- ✅ Variáveis configuradas?
- ✅ Senha de app correta?
- ✅ Gmail permite "apps menos seguros"?

---

**Tudo pronto!** 🎉
