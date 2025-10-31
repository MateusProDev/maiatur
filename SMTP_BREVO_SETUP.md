# 📧 Configurar Brevo (Sendinblue) como SMTP para reservas

Este guia mostra exatamente o que pegar no painel da Brevo e como configurar neste projeto para enviar os e‑mails de reserva com o servidor SMTP da Brevo.

---

## 1) O que pegar na Brevo

No painel da Brevo:
- Menu: SMTP & API
  - Servidor SMTP: `smtp-relay.brevo.com`
  - Porta: `587` (recomendado, TLS/STARTTLS) — alternativa: `465` (SSL)
  - Fazer login (usuário SMTP): algo como `xxxxxxxxx@smtp-brevo.com`
  - Gere uma nova chave SMTP: este é o “password” que usaremos na app
- Menu: Remetentes, domínio, IPs
  - Adicione/verifique um Remetente (ex.: `reservas@seudominio.com.br`) ou verifique o domínio para melhor entregabilidade

Anote:
- SMTP_HOST = smtp-relay.brevo.com
- SMTP_PORT = 587
- SMTP_USER = seu usuário SMTP exibido (ex.: 9a6f...@smtp-brevo.com)
- SMTP_PASS = a chave SMTP que você gerou
- AGENCY_FROM = um e‑mail remetente verificado na Brevo (ex.: reservas@seudominio.com.br)
- AGENCY_REPLY_TO (opcional) = e‑mail de resposta (ex.: atendimento@seudominio.com.br)

---

## 2) Onde configurar no projeto (Vercel)

No Vercel: Project → Settings → Environment Variables

Adicione as variáveis abaixo (Production e Preview, se aplicável):

```
SMTP_HOST = smtp-relay.brevo.com
SMTP_PORT = 587
SMTP_USER = 9a6f32001@smtp-brevo.com        # seu usuário SMTP (o que aparece em “Fazer login”)
SMTP_PASS = <COLE_A_CHAVE_SMTP_GERADA>

AGENCY_FROM = reservas@seudominio.com.br    # remetente verificado em Remetentes da Brevo
AGENCY_REPLY_TO = atendimento@seudominio.com.br
AGENCY_EMAIL = contato@seudominio.com.br    # usado no corpo do e‑mail
AGENCY_PHONE = +55 (85) 99999-9999          # usado no corpo do e‑mail
AGENCY_CNPJ = 00.000.000/0001-00            # usado no PDF do voucher
```

Observações importantes:
- O código já está preparado para ler `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
- O campo “from” do e‑mail usa `AGENCY_FROM` quando definido (recomendado). Caso não defina, ele tentará usar `SMTP_USER`, que na Brevo é um identificador (não é um e‑mail real). Portanto, defina sempre `AGENCY_FROM` com um remetente verificado.
- Na porta 587, a conexão usa STARTTLS automaticamente (seguro e recomendado). Na 465, usa SSL.

---

## 3) Como validar rapidamente

Você pode validar enviando uma reserva real no fluxo da aplicação, ou usar o endpoint de teste (se configurado) `GET /api/test-email` com uma chave de teste.

Passos sugeridos:
1. No Vercel, crie também a variável `TEST_EMAIL_KEY` com um valor secreto (ex.: `minha-chave-de-teste`) — somente temporariamente durante a validação.
2. Acesse:
   ```
   https://SEU-DEPLOY.vercel.app/api/test-email?to=seu-email@exemplo.com&key=minha-chave-de-teste
   ```
3. Verifique se chegou um e‑mail com assunto “Teste SMTP Maiatur”.
4. Remova a variável `TEST_EMAIL_KEY` quando terminar os testes.

Se preferir testar pelo fluxo completo, apenas faça uma reserva no site e cheque sua caixa de entrada. O endpoint principal é `POST /api/enviar-email-reserva` (ele gera e anexa o voucher em PDF).

---

## 4) Dúvidas comuns

- Devo usar `SMTP_USER` como remetente? Não. Na Brevo, `SMTP_USER` é um identificador (ex.: `...@smtp-brevo.com`). Use `AGENCY_FROM` com um endereço verificado em “Remetentes”.
- Preciso mudar código para Brevo? Não. O arquivo `api/enviar-email-reserva.js` já usa as variáveis `SMTP_*` de forma genérica. Basta configurar as variáveis no Vercel como acima.
- Erro de autenticação? Verifique se colou a “Chave SMTP” (não a API Key REST) em `SMTP_PASS` e se o usuário em `SMTP_USER` é exatamente o mostrado em “Fazer login”.
- Entregabilidade: verifique/remova bloqueios de SPF/DKIM; ideal é verificar o domínio na Brevo.

---

Pronto! Ao salvar as variáveis no Vercel e fazer um deploy, os e‑mails de reserva passarão a sair pela Brevo. ✅
