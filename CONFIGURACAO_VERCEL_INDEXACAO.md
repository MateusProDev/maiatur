# Configuração do Vercel para Indexação Automática

## Variáveis de Ambiente Necessárias

Para que o script de migração rode automaticamente no deploy, você precisa configurar as seguintes variáveis de ambiente no Vercel:

### 1. Firebase Service Account Key

**Variável:** `FIREBASE_SERVICE_ACCOUNT_KEY`

**Como obter:**
1. Acesse: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Selecione o projeto `maiatur`
3. Clique na Service Account que você criou para o Firebase
4. Vá na aba "Chaves" (Keys)
5. Clique "Adicionar chave" → "Criar nova chave"
6. Tipo: JSON
7. Baixe o arquivo JSON
8. **Copie todo o conteúdo do arquivo JSON** (é um objeto JSON completo)
9. No Vercel: Settings → Environment Variables
10. Adicione a variável `FIREBASE_SERVICE_ACCOUNT_KEY`
11. Cole o conteúdo JSON completo como valor

**Importante:** O valor deve ser o JSON completo, incluindo chaves e aspas. Exemplo:
```json
{
  "type": "service_account",
  "project_id": "maiatur",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 2. Google Indexing API Credentials (Obrigatório para indexação)

**Variável:** `GOOGLE_INDEXING_CREDENTIALS`

**Como obter:**
Se você já seguiu o `SETUP_INDEXING_API.md`, você tem um arquivo `credentials.json` na raiz do projeto.

1. Abra o arquivo `credentials.json` na raiz do projeto
2. Copie todo o conteúdo JSON
3. No Vercel: Settings → Environment Variables
4. Adicione a variável `GOOGLE_INDEXING_CREDENTIALS`
5. Cole o conteúdo JSON completo como valor

**Importante:** Esta variável é necessária para que a indexação automática funcione. Sem ela, o script vai conectar ao Firebase mas não vai solicitar indexação ao Google.

### 3. Firebase Project ID

**Variável:** `FIREBASE_PROJECT_ID`

**Valor:** `maiatur`

### 4. Variáveis do Firebase (já devem existir)

Se você já tem estas variáveis configuradas, não precisa alterar:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`

---

## Configuração no Vercel

### Passo 1: Acessar Settings do Projeto

1. Acesse: https://vercel.com/SEU_USUARIO/maiatur/settings
2. Vá para "Environment Variables"

### Passo 2: Adicionar Variáveis

Adicione as seguintes variáveis:

| Nome | Valor | Ambiente |
|------|-------|-----------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | (JSON completo da service account do Firebase) | Production, Preview, Development |
| `GOOGLE_INDEXING_CREDENTIALS` | (JSON completo da service account da Google Indexing API) | Production, Preview, Development |
| `FIREBASE_PROJECT_ID` | `maiatur` | Production, Preview, Development |

### Passo 3: Salvar e Deploy

1. Clique "Save"
2. Faça um novo deploy para testar

---

## Como Funciona o Script no Deploy

### Fluxo Automático

1. **Build:** `npm run build` roda
2. **Post-build:** `npm run postbuild` roda automaticamente
3. **Script:** `node scripts/migrate-existing-packages.js` é executado
4. **Conexão:** Conecta ao Firebase usando `FIREBASE_SERVICE_ACCOUNT_KEY`
5. **Migração:** Busca pacotes, gera slugs, solicita indexação
6. **Logs:** Tudo é logado no Vercel

### Logs no Vercel

Para ver os logs do script:

1. Acesse: https://vercel.com/SEU_USUARIO/maiatur/deployments
2. Clique no deployment mais recente
3. Vá para "Build Logs"
4. Procure por:
   - `📡 Conectando ao Firebase Admin...`
   - `📦 Buscando pacotes do Firestore...`
   - `🚀 Iniciando indexação em lote...`
   - `✅ Sucessos: X`
   - `❌ Falhas: Y`

---

## Testando Localmente

Para testar o script localmente com as mesmas variáveis de ambiente:

### Opção 1: Usar .env.local

Crie um arquivo `.env.local` na raiz do projeto:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"maiatur",...}
FIREBASE_PROJECT_ID=maiatur
```

Depois rode:
```bash
node scripts/migrate-existing-packages.js
```

### Opção 2: Passar variáveis na linha de comando

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' node scripts/migrate-existing-packages.js
```

---

## Solução de Problemas

### Erro: "credentials.json não encontrado" ou "Não foi possível autenticar"

**Causa:** Variável `GOOGLE_INDEXING_CREDENTIALS` não configurada no Vercel

**Solução:**
1. Verifique se a variável `GOOGLE_INDEXING_CREDENTIALS` foi adicionada no Vercel
2. Verifique se está selecionada para "Production"
3. Verifique se o JSON está completo e válido
4. Faça um novo deploy

### Erro: "FIREBASE_SERVICE_ACCOUNT_KEY not found"

**Causa:** Variável de ambiente não configurada no Vercel

**Solução:**
1. Verifique se a variável foi adicionada no Vercel
2. Verifique se está selecionada para "Production"
3. Faça um novo deploy

### Erro: "Invalid credential"

**Causa:** JSON da service account está malformado

**Solução:**
1. Verifique se o JSON está completo e válido
2. Verifique se não há quebras de linha incorretas
3. Recrie a chave JSON no Google Cloud Console

### Erro: "Permission denied"

**Causa:** Service account não tem permissão no Firestore

**Solução:**
1. Verifique se a service account tem papel de "Editor" ou "Owner"
2. Verifique as regras do Firestore
3. No Firebase Console: Project Settings → Service Accounts → Verifique permissões

### Script não roda no deploy

**Causa:** Script não está configurado como postbuild

**Solução:**
1. Verifique `package.json` → `"scripts"` → `"postbuild"`
2. Deve estar: `"postbuild": "node scripts/migrate-existing-packages.js"`
3. Faça um novo deploy

---

## Limitações

### Rate Limit do Google Indexing API

- **Limite:** 200 URLs/dia
- **Se você tem mais de 200 pacotes:** O script vai tentar indexar todos, mas pode falhar após 200
- **Solução:** Divida a indexação em múltiplos dias ou use um sistema de fila

### Tempo de Build

- O script adiciona tempo ao build (dependendo da quantidade de pacotes)
- Se tiver muitos pacotes, pode demorar alguns minutos
- O Vercel tem limite de 45 minutos para builds

### Custo do Firebase

- Leituras do Firestore ao buscar pacotes
- Escritas ao gerar slugs (se necessário)
- Normalmente insignificante para a maioria dos casos

---

## Desativar Script se Necessário

Se precisar desativar o script temporariamente:

### Opção 1: Remover do package.json

```json
"scripts": {
  "build": "craco build",
  // Remover: "postbuild": "node scripts/migrate-existing-packages.js"
}
```

### Opção 2: Desativar via variável de ambiente

Adicione uma variável `DISABLE_SEO_MIGRATION=true` no Vercel e modifique o script para verificar essa variável antes de executar.

---

## Monitoramento

### Verificar se Funcionou

1. **Logs do Vercel:** Verifique os logs do build
2. **Search Console:** Verifique se URLs foram indexadas em 24-48h
3. **Sitemap:** Acesse `https://transferfortalezatur.com.br/sitemap.xml`

### Alertas

Configure alertas no Vercel para:
- Build failures
- Long build times
- Error logs

---

## Resumo

✅ **Configuração:**
- Adicionar `FIREBASE_SERVICE_ACCOUNT_KEY` no Vercel
- Adicionar `GOOGLE_INDEXING_CREDENTIALS` no Vercel
- Adicionar `FIREBASE_PROJECT_ID` no Vercel
- Script já configurado como `postbuild` no package.json

✅ **Funcionamento:**
- Roda automaticamente após cada build
- Usa credenciais do ambiente
- Não quebra o build se falhar

✅ **Monitoramento:**
- Logs no Vercel
- Search Console
- Sitemap dinâmico

Pronto! O script vai rodar automaticamente em todos os deploys.
