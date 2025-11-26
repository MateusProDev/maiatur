# Guia de Integração com Brevo (Sendinblue) — Envio de E-mails

Este documento descreve como usar o módulo de envio de e-mails com a API Brevo (antigo Sendinblue) como padrão reutilizável para outros projetos.

Conteúdo
- Introdução rápida
- Variáveis de ambiente
- Módulo Node.js (JS) — exemplo reutilizável
- Endpoint Express — exemplo de uso
- Exemplo com `templateId` (templates Brevo)
- Versão TypeScript (minimal)
- Boas práticas: segurança, idempotência, retries, logging
- Testes locais e dicas
- SDK oficial (opcional)

**Arquivo criado:** `docs/BREVO_EMAIL_GUIDE.md`

---

## 1. Introdução rápida
Brevo oferece uma API REST para envio transacional de e-mails. Este guia cobre uma função reutilizável `sendEmail` (Node.js) com tratamento de retries, idempotência simples e suporte a templates.

Use este módulo no backend apenas — nunca exponha a chave API no browser.

## 2. Variáveis de ambiente
Crie um arquivo `.env` (ou configure secrets no seu host):

```
BREVO_API_KEY=seu_api_key_aqui
BREVO_FROM_EMAIL=contato@transferfortalezatur.com.br
BREVO_FROM_NAME="Transfer Fortaleza Tur"
```

## 3. Módulo Node.js (reutilizável)
Salve como `lib/brevoMail.js` (exemplo resumido abaixo). Importante: o módulo faz retry em 5xx/429 com backoff exponencial e lança erro em outras falhas.

```js
// lib/brevoMail.js
const axios = require('axios');
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function normalizeRecipients(r){
  if (!r) return undefined;
  if (Array.isArray(r)) return r.map(x => typeof x === 'string' ? { email: x } : x);
  if (typeof r === 'string') return [{ email: r }];
  return [r];
}

async function sendEmail(opts = {}){
  const { to, subject, html, text, from, cc, bcc, attachments, templateId, params, headers = {}, retries = 2, timeout = 10000 } = opts;
  if (!API_KEY) throw new Error('BREVO_API_KEY not configured');

  const payload = {};
  payload.sender = { email: (from && from.email) || process.env.BREVO_FROM_EMAIL, name: (from && from.name) || process.env.BREVO_FROM_NAME };
  payload.to = normalizeRecipients(to);
  if (cc) payload.cc = normalizeRecipients(cc);
  if (bcc) payload.bcc = normalizeRecipients(bcc);

  if (templateId){ payload.templateId = templateId; if (params) payload.params = params; }
  else { if (html) payload.htmlContent = html; if (text) payload.textContent = text; payload.subject = subject || ''; }

  if (attachments) payload.attachment = attachments;
  if (headers && Object.keys(headers).length) payload.headers = headers;

  const idempotencyKey = headers['Idempotency-Key'] || `brevo-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  let attempt = 0; let lastError = null;
  while(attempt <= retries){
    try{
      attempt++;
      const resp = await axios.post(BREVO_API_URL, payload, { headers: { 'api-key': API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, timeout });
      return { ok: true, status: resp.status, data: resp.data };
    }catch(err){
      lastError = err;
      const status = err?.response?.status;
      if (status && (status >= 500 || status === 429) && attempt <= retries){
        const backoff = 200 * Math.pow(2, attempt);
        await sleep(backoff);
        continue;
      }
      break;
    }
  }

  const message = lastError?.response?.data || lastError?.message || 'Unknown error';
  throw new Error(`Brevo send failed after ${attempt} attempts: ${JSON.stringify(message)}`);
}

module.exports = { sendEmail };
```

### Observações do payload
- Para envio simples: inclua `sender`, `to`, `subject` e `htmlContent`/`textContent`.
- Para templates: envie `templateId` e `params` em vez de `htmlContent`.
- Anexos devem vir como `{ name, content }` com `content` em base64 (Brevo espera `attachment` array).

## 4. Endpoint Express (exemplo)
Crie `routes/mail.js` e adicione ao seu servidor Express.

```js
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../lib/brevoMail');

router.post('/send-contact', async (req,res)=>{
  try{
    const { name, email, message } = req.body;
    if(!email || !message) return res.status(400).json({ error: 'Missing fields' });

    const html = `<p>Contato: ${name}</p><p>${message}</p>`;
    const result = await sendEmail({ to: process.env.BREVO_FROM_EMAIL, subject: `Contato: ${name}`, html, text: message });
    res.json({ ok: true, result });
  }catch(err){
    console.error('Error sending contact mail', err);
    res.status(500).json({ ok: false, error: String(err.message) });
  }
});

module.exports = router;
```

E no `server.js`:
```js
const mailRoutes = require('./routes/mail');
app.use('/api/mail', mailRoutes);
```

## 5. Usando `templateId` (Brevo template)
No painel Brevo, crie um template com variáveis (ex: `{{name}}`, `{{orderId}}`). No envio:

```js
await sendEmail({
  to: [{ email: 'user@example.com', name: 'Usuário' }],
  templateId: 123456,
  params: { name: 'João', orderId: 'ABC123' }
});
```

## 6. Versão TypeScript (exemplo mínimo)
Salve como `lib/brevoMail.ts` (ou adapte ao seu monorepo):

```ts
import axios from 'axios';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY || '';

type Recipient = { email: string; name?: string };

export interface SendEmailOptions { to: Recipient|Recipient[]|string; subject?: string; html?: string; text?: string; from?: {email:string;name?:string}; templateId?: number; params?: Record<string,any>; retries?: number }

export async function sendEmail(opts: SendEmailOptions){
  if (!API_KEY) throw new Error('BREVO_API_KEY missing');
  // normalize and send (método similar ao JS)
}
```

(omiti repetição do código para brevidade — use a mesma lógica JS com tipos).

## 7. Boas práticas e segurança
- Nunca coloque `BREVO_API_KEY` no cliente (browser). Mantenha só no servidor.
- Use `templateId` + `params` para consistência e tradução.
- Idempotência: gere e persista um `Idempotency-Key` para evitar duplicados em reenvios (por ex. `order-1234-contact`).
- Retries: aplique apenas para 5xx e 429 com backoff exponencial.
- Log: registre `resp.data` (messageId) e erros para auditoria e reprocesamento.
- Persistência: para envios críticos, salve um registro no banco (status: pending / sent / failed) e reprocessador.
- Rate-limit: controle envios em massa para evitar 429.

## 8. Testes locais
- Teste com seu e-mail e ambiente `.env` local.
- Para evitar SPAM em desenvolvimento, use ferramentas como Mailtrap ou criar destinatários de teste no Brevo.
- Exemplo de teste rápido com Node REPL:

```js
require('dotenv').config();
const { sendEmail } = require('./lib/brevoMail');
(async ()=>{
  try{
    const r = await sendEmail({ to: 'seu.email@exemplo.com', subject: 'Teste', text: 'Hello', html: '<b>Olá</b>' });
    console.log('OK', r);
  }catch(e){ console.error('ERR', e); }
})();
```

## 9. SDK oficial (opcional)
Brevo mantém `sib-api-v3-sdk`. Para projetos que preferem SDK:

```bash
npm i sib-api-v3-sdk
```

Exemplo:
```js
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = { sender:{email: process.env.BREVO_FROM_EMAIL, name: process.env.BREVO_FROM_NAME}, to:[{ email: 'to@example.com'}], subject:'Hello', htmlContent:'<h1>Hi</h1>' };
apiInstance.sendTransacEmail(sendSmtpEmail).then(res=>console.log(res)).catch(err=>console.error(err));
```

## 10. Perguntas frequentes
- 401: chave errada. Verifique `BREVO_API_KEY`.
- 400: payload inválido (falta sender/to/subject/html ou templateId)
- 429: rate-limited — implemente backoff

---

Se quiser, eu posso:
- Adicionar esses arquivos (`lib/brevoMail.js` e `routes/mail.js`) direto ao repositório e abrir um PR.
- Gerar testes automatizados (Jest) com mocks para axios/SDK.
- Integrar o fluxo de persistência no Firestore/DB do seu projeto.

Diga qual opção prefere e aplico o patch.
