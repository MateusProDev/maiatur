# 🚀 Setup Google Indexing API - Guia Completo

## ✅ Benefícios:

- **GRATUITO** (até 200 URLs/dia)
- **Automático** - um comando e pronto
- **Rápido** - Google rastreia em 24-48h
- **Monitorável** - log completo de todas solicitações

---

## 📋 Pré-requisitos:

- Conta Google (a mesma do Search Console)
- Node.js instalado (já tem!)
- 10 minutos para configurar

---

## 🔧 Passo a Passo (Execute UMA VEZ):

### 1️⃣ Criar Projeto Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Selecionar projeto"** (topo)
3. Clique em **"Novo projeto"**
4. Nome: `Transfer Fortaleza SEO`
5. Clique **"Criar"**
6. Aguarde criação (30 segundos)

### 2️⃣ Ativar a Indexing API

1. No projeto criado, vá para:
   https://console.cloud.google.com/apis/library/indexing.googleapis.com
2. Clique **"Ativar"**
3. Aguarde ativação (10 segundos)

### 3️⃣ Criar Service Account

1. Vá para: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Clique **"Criar conta de serviço"**
3. Preencha:
   - **Nome:** `Indexing Bot`
   - **ID:** (deixe automático)
   - **Descrição:** `Bot para solicitar indexação automática`
4. Clique **"Criar e continuar"**
5. Em "Conceder à conta de serviço acesso ao projeto":
   - Função: **"Proprietário"** (Owner)
6. Clique **"Continuar"** → **"Concluído"**

### 4️⃣ Baixar Credenciais JSON

1. Na lista de Service Accounts, clique na que você criou
2. Vá na aba **"Chaves"** (Keys)
3. Clique **"Adicionar chave"** → **"Criar nova chave"**
4. Tipo: **JSON**
5. Clique **"Criar"**
6. O arquivo `credentials.json` será baixado automaticamente
7. **MOVA** esse arquivo para a pasta do projeto:
   ```
   C:\Users\mateo\Documents\maiatur\credentials.json
   ```

### 5️⃣ Adicionar Service Account no Search Console

⚠️ **IMPORTANTE:** Sem isso, o script não funciona!

1. Abra o arquivo `credentials.json` que baixou
2. Procure por `"client_email"`: algo como `indexing-bot@....iam.gserviceaccount.com`
3. **COPIE** esse email
4. Vá para: https://search.google.com/search-console
5. Selecione a propriedade `transferfortalezatur.com.br`
6. Clique em **"Configurações"** (⚙️ no menu lateral)
7. Clique em **"Usuários e permissões"**
8. Clique **"Adicionar usuário"**
9. Cole o email copiado (`...@...iam.gserviceaccount.com`)
10. Permissão: **"Proprietário"**
11. Clique **"Adicionar"**

### 6️⃣ Instalar Dependências

No terminal (PowerShell), execute:

```powershell
cd C:\Users\mateo\Documents\maiatur
npm install googleapis
```

---

## 🚀 Como Usar:

Depois do setup acima (faz uma vez só), é SÓ executar:

```powershell
node request-indexing.js
```

O script vai:
1. ✅ Autenticar com Google
2. ✅ Solicitar indexação de 10 URLs
3. ✅ Mostrar progresso em tempo real
4. ✅ Salvar log em `indexing-log.json`

### Exemplo de saída:

```
🚀 Iniciando solicitação de indexação...

🔐 Autenticando com Google...
📧 Service Account: indexing-bot@....iam.gserviceaccount.com

✅ Autenticação bem-sucedida!

📤 Solicitando indexação para 10 URLs...

[1/10] Processando: https://transferfortalezatur.com.br/
   ✅ Sucesso! Status: 200
   📅 Notificação enviada em: 2025-11-15T12:30:00Z

[2/10] Processando: https://transferfortalezatur.com.br/contato
   ✅ Sucesso! Status: 200
   📅 Notificação enviada em: 2025-11-15T12:30:01Z

...

============================================================
📊 RESUMO DA OPERAÇÃO
============================================================
✅ Sucesso: 10/10
❌ Falhas: 0/10

⏱️  PRÓXIMOS PASSOS:
1. Google vai rastrear as URLs em 24-48 horas
2. Verifique no Search Console: https://search.google.com/search-console
3. Em "URL Inspection", veja quando foi o último rastreamento
4. As mudanças aparecerão nos resultados em 2-7 dias

📄 Log salvo em: C:\Users\mateo\Documents\maiatur\indexing-log.json
```

---

## 🔍 Verificar se Funcionou:

### No Google Search Console:

1. Acesse: https://search.google.com/search-console
2. Cole uma URL no topo (ex: `https://transferfortalezatur.com.br/`)
3. Clique **"Testar URL publicado"**
4. Veja **"Última rastreamento"**
   - Se mostrar data recente (próximas 24-48h), funcionou! ✅

### No arquivo de log:

Abra `indexing-log.json` e veja o status de cada URL.

---

## ❓ Problemas Comuns:

### Erro: "credentials.json não encontrado"
- Certifique-se que o arquivo está em `C:\Users\mateo\Documents\maiatur\credentials.json`

### Erro: "403 Forbidden" ou "Permission denied"
- Verifique se adicionou o email da Service Account no Search Console
- Verifique se deu permissão de "Proprietário"

### Erro: "MODULE_NOT_FOUND"
- Execute: `npm install googleapis`

### Erro: "Invalid grant"
- Verifique se o relógio do computador está correto
- Recrie a chave JSON (Service Account → Chaves → Nova chave)

---

## 🎯 Quando Usar:

Execute o script SEMPRE que fizer mudanças importantes:

- ✅ Mudanças em meta tags
- ✅ Novos conteúdos (páginas, blog posts)
- ✅ Correções SEO (como fizemos hoje)
- ✅ Atualização de títulos/descriptions
- ❌ NÃO precisa para mudanças de design/CSS

---

## 💡 Dicas:

1. **Não abuse:** Google tem limite de 200 URLs/dia
2. **Use com moderação:** Só quando realmente necessário
3. **Monitore:** Sempre verifique o Search Console depois
4. **Seja paciente:** Rastreamento leva 24-48h

---

## 🔒 Segurança:

⚠️ **IMPORTANTE:** 

- O arquivo `credentials.json` contém chave privada
- **NÃO COMPARTILHE** esse arquivo
- **NÃO COMMITE** no Git (já adicionado ao .gitignore)
- Guarde em local seguro

---

## 📊 Monitoramento:

Após executar, acompanhe em:

- **Search Console:** https://search.google.com/search-console
- **Coverage Report:** Indexação → Páginas
- **URL Inspection:** Para cada URL específica

---

✅ **Pronto!** Agora você tem controle total sobre a indexação do Google!

Qualquer dúvida, consulte: https://developers.google.com/search/apis/indexing-api/v3/quickstart
