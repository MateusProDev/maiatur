# 🚨 DIAGNÓSTICO: E-mails de Reserva NÃO Enviando

## ❌ PROBLEMA IDENTIFICADO

Os e-mails de reserva **NÃO estão sendo enviados** porque faltam as **variáveis SMTP** na Vercel.

### 🔍 O que está faltando:

A Vercel precisa das seguintes variáveis para enviar e-mails:

```
SMTP_HOST = smtp-relay.brevo.com
SMTP_PORT = 587
SMTP_USER = seu_usuario_smtp@smtp-brevo.com
SMTP_PASS = sua_chave_smtp_gerada

AGENCY_FROM = reservas@transferfortalezatur.com.br
AGENCY_REPLY_TO = atendimento@transferfortalezatur.com.br
AGENCY_EMAIL = contato@transferfortalezatur.com.br
AGENCY_PHONE = +55 (85) 98877-6655
AGENCY_CNPJ = 00.000.000/0001-00
```

---

## ✅ SOLUÇÃO: Configurar Brevo (SMTP Gratuito)

### Por que o domínio não tem relação direta?

O domínio `transferfortalezatur.com.br` é só a **URL do site**. Para enviar e-mails, você precisa de um **servidor SMTP** (que é separado).

**Opções:**
1. ✅ **Brevo** (recomendado) - 300 emails/dia GRÁTIS
2. Gmail SMTP - Limitado, não recomendado para produção
3. SendGrid - Requer cartão de crédito

---

## 🚀 PASSO A PASSO COMPLETO

### 1️⃣ Criar Conta na Brevo (5 minutos)

1. Acesse: https://www.brevo.com/
2. Clique em **"Start Free"** (Começar Grátis)
3. Preencha:
   - Nome: Transfer Fortaleza Tur
   - E-mail: Seu e-mail pessoal
   - Senha
4. Confirme o e-mail

---

### 2️⃣ Configurar SMTP na Brevo (3 minutos)

**A) Pegar credenciais SMTP:**

1. No painel da Brevo, clique em **"SMTP & API"** (menu superior direito)
2. Role até **"SMTP"**
3. Anote:
   ```
   Servidor SMTP: smtp-relay.brevo.com
   Porta: 587
   Login (usuário): 9a6fxxxxx@smtp-brevo.com
   ```
4. Clique em **"Criar uma nova chave SMTP"**
   - Nome: "Maiatur Reservas"
   - Copie a chave gerada (você verá só 1 vez!)

**B) Adicionar Remetente Verificado:**

1. Ainda na Brevo, vá em **"Remetentes"** (Senders)
2. Clique em **"Adicionar um remetente"**
3. Preencha:
   ```
   Nome: Transfer Fortaleza Tur
   E-mail: reservas@transferfortalezatur.com.br
   ```
4. A Brevo vai pedir para verificar o e-mail (há 2 opções):

   **OPÇÃO A - Verificação por E-mail (mais fácil):**
   - A Brevo enviará um e-mail para `reservas@transferfortalezatur.com.br`
   - Se você tem acesso a esse e-mail, só clicar no link

   **OPÇÃO B - Verificação por DNS (se não tem acesso ao e-mail):**
   - A Brevo vai fornecer registros DNS (TXT)
   - Você precisa adicionar esses registros no painel onde comprou o domínio
   - Exemplo de registros:
     ```
     Tipo: TXT
     Nome: @
     Valor: v=spf1 include:spf.brevo.com ~all
     
     Tipo: TXT
     Nome: mail._domainkey
     Valor: (string longa fornecida pela Brevo)
     ```

---

### 3️⃣ Adicionar Variáveis na Vercel (2 minutos)

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **maiatur**
3. Vá em **Settings** → **Environment Variables**
4. Adicione uma por uma:

```
Nome: SMTP_HOST
Valor: smtp-relay.brevo.com
Ambientes: Production, Preview, Development
```

```
Nome: SMTP_PORT
Valor: 587
Ambientes: Production, Preview, Development
```

```
Nome: SMTP_USER
Valor: [COLE O LOGIN QUE COPIOU DA BREVO, ex: 9a6f32001@smtp-brevo.com]
Ambientes: Production, Preview, Development
```

```
Nome: SMTP_PASS
Valor: [COLE A CHAVE SMTP GERADA]
Ambientes: Production, Preview, Development
```

```
Nome: AGENCY_FROM
Valor: reservas@transferfortalezatur.com.br
Ambientes: Production, Preview, Development
```

```
Nome: AGENCY_REPLY_TO
Valor: atendimento@transferfortalezatur.com.br
Ambientes: Production, Preview, Development
```

```
Nome: AGENCY_EMAIL
Valor: contato@transferfortalezatur.com.br
Ambientes: Production, Preview, Development
```

```
Nome: AGENCY_PHONE
Valor: +55 (85) 98877-6655
Ambientes: Production, Preview, Development
```

```
Nome: AGENCY_CNPJ
Valor: 00.000.000/0001-00
Ambientes: Production, Preview, Development
```

---

### 4️⃣ Fazer Redeploy (1 minuto)

1. Vá em **Deployments**
2. Clique nos 3 pontos (...) do último deploy
3. Clique em **Redeploy**
4. Aguarde 2-3 minutos

---

## 🧪 TESTAR SE FUNCIONOU

### Opção 1: Fazer uma reserva de teste

1. Acesse seu site: https://transferfortalezatur.com.br/reservas
2. Preencha o formulário
3. Finalize o pagamento (PIX ou cartão)
4. Verifique se chegou e-mail no endereço cadastrado

### Opção 2: Endpoint de teste rápido

1. Na Vercel, adicione temporariamente:
   ```
   Nome: TEST_EMAIL_KEY
   Valor: teste123
   ```

2. Acesse no navegador:
   ```
   https://transferfortalezatur.com.br/api/test-email?to=SEU_EMAIL@GMAIL.COM&key=teste123
   ```

3. Verifique se chegou e-mail com assunto "Teste SMTP Maiatur"

4. **Remova** a variável `TEST_EMAIL_KEY` depois do teste

---

## 🆘 SE NÃO FUNCIONAR

### Erro: "Invalid login credentials"
- ✅ Verifique se `SMTP_USER` e `SMTP_PASS` estão corretos
- ✅ A chave SMTP só aparece 1 vez na Brevo, gere uma nova se perdeu

### Erro: "Sender not verified"
- ✅ Verifique o e-mail `reservas@transferfortalezatur.com.br`
- ✅ Ou adicione os registros DNS no painel do domínio

### E-mail vai para SPAM
- ✅ Adicione registros SPF/DKIM no DNS (Brevo fornece)
- ✅ Use um e-mail do seu domínio no `AGENCY_FROM`

### Nada acontece
- ✅ Verifique no Vercel → Deployments → Logs
- ✅ Procure por erros relacionados a "email" ou "smtp"

---

## 📊 LIMITES BREVO (Plano Gratuito)

- ✅ **300 e-mails/dia** (suficiente para começar)
- ✅ **Remetentes ilimitados** (pode usar vários e-mails do domínio)
- ✅ **Anexos PDF** (voucher funciona normal)
- ❌ Remove logo Brevo no rodapé (só em planos pagos)

Se passar de 300 e-mails/dia:
- Upgrade para **Starter**: $25/mês = 20.000 e-mails/mês
- Ou trocar para SendGrid/AWS SES

---

## ⚡ RESUMO RÁPIDO

1. ✅ Criar conta Brevo
2. ✅ Gerar chave SMTP
3. ✅ Verificar remetente (reservas@transferfortalezatur.com.br)
4. ✅ Adicionar 9 variáveis na Vercel
5. ✅ Fazer Redeploy
6. ✅ Testar enviando uma reserva

**Tempo total: ~15 minutos**

---

## 📞 SUPORTE

Se precisar de ajuda:
- Brevo Support: https://help.brevo.com/
- Vercel Support: https://vercel.com/support

---

## ✅ CHECKLIST

- [ ] Conta Brevo criada
- [ ] Chave SMTP gerada e copiada
- [ ] Remetente `reservas@transferfortalezatur.com.br` verificado
- [ ] `SMTP_HOST` adicionado na Vercel
- [ ] `SMTP_PORT` adicionado na Vercel
- [ ] `SMTP_USER` adicionado na Vercel
- [ ] `SMTP_PASS` adicionado na Vercel
- [ ] `AGENCY_FROM` adicionado na Vercel
- [ ] `AGENCY_REPLY_TO` adicionado na Vercel
- [ ] `AGENCY_EMAIL` adicionado na Vercel
- [ ] `AGENCY_PHONE` adicionado na Vercel
- [ ] `AGENCY_CNPJ` adicionado na Vercel
- [ ] Redeploy feito na Vercel
- [ ] Teste de envio realizado com sucesso

---

**🎯 Depois que configurar, os e-mails de reserva vão funcionar perfeitamente!**
