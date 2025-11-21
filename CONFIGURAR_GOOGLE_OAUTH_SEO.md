# Configuração Google OAuth para Dashboard SEO

## Problema
O botão "Conectar Google" não está funcionando porque falta configurar um **OAuth 2.0 Client ID** válido para web application.

## Solução: Criar OAuth Client ID no Google Cloud Console

### Passo 1: Acesse o Google Cloud Console
1. Vá para: https://console.cloud.google.com/
2. Selecione seu projeto (provavelmente "crested-return-478220-d6" ou "maiatur")

### Passo 2: Criar OAuth Client ID
1. No menu lateral esquerdo, clique em **"APIs e Serviços"** > **"Credenciais"**
2. Clique em **"+ CRIAR CREDENCIAIS"** > **"ID do cliente OAuth"**
3. Selecione **"Aplicativo da Web"** como tipo
4. Configure:
   - **Nome**: "Maiatur Dashboard SEO"
   - **URIs de redirecionamento autorizadas**:
     - Para desenvolvimento: `http://localhost:3000`
     - Para produção: `https://transferfortalezatur.com.br`
     - Para Vercel preview: `https://maiatur-[seu-nome].vercel.app`

### Passo 3: Obter o Client ID
1. Após criar, copie o **"ID do cliente"** (algo como: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)
2. **IMPORTANTE**: Este é diferente do service account que já temos!

### Passo 4: Configurar no projeto
1. Adicione ao arquivo `.env`:
```
REACT_APP_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
```

### Passo 5: Configurar Search Console
1. Vá para: https://search.google.com/search-console
2. Adicione a propriedade: `https://transferfortalezatur.com.br`
3. Verifique a propriedade (você pode usar o método HTML file ou DNS)

### Passo 6: Testar
1. Reinicie o servidor de desenvolvimento
2. Acesse o admin dashboard
3. O botão "Conectar Google" deve funcionar agora

## Status Atual
- ✅ GAPI loading melhorado com logs de debug
- ✅ UI mostra status de carregamento
- ✅ Botão sempre visível com status apropriado
- ❌ Falta configurar OAuth Client ID válido

## Verificação
Abra o console do navegador (F12) e procure por:
- `🔄 Tentando carregar GAPI...`
- `✅ GAPI inicializado com sucesso!`

Se aparecer erro, é porque falta o Client ID válido.</content>
<parameter name="filePath">c:\Users\mateo\Documents\maiatur\CONFIGURAR_GOOGLE_OAUTH_SEO.md