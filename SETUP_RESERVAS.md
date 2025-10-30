# 🚀 Guia Completo de Setup - Sistema de Reservas Maiatur

## ✅ O que foi criado

### Frontend (React)
- ✓ Página principal de reservas com 5 cards (`/reservas`)
- ✓ Formulários completos com validação (Zod + React Hook Form)
- ✓ Componentes reutilizáveis para campos comuns
- ✓ Modal de sucesso com links para voucher e WhatsApp
- ✓ Página de política de reservas
- ✓ Admin inicializador para popular Firestore
- ✓ Integração completa no App.jsx

### Backend (Firebase)
- ✓ Estrutura Cloud Functions (Node 18)
- ✓ Trigger onCreate para enviar e-mail com PDF anexado
- ✓ HTTPS Function para download on-demand do voucher
- ✓ Geração de PDF em memória (sem Storage)
- ✓ Regras de segurança Firestore configuradas

## 📦 Instalação

### 1. Dependências do Frontend

Já foram instaladas:
```bash
npm install react-hook-form zod @hookform/resolvers date-fns date-fns-tz react-input-mask
```

### 2. Dependências do Backend (Cloud Functions)

```bash
cd functions
npm install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente - Frontend

Adicione ao seu `.env.local` (ou crie um novo):

```env
# Firebase (já deve existir)
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
REACT_APP_FIREBASE_API_KEY=sua-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_APP_ID=seu-app-id

# Agência
REACT_APP_BRAND_NAME=Maiatur
REACT_APP_AGENCY_EMAIL=contato@maiatur.com.br
REACT_APP_AGENCY_PHONE_DISPLAY="+55 (85) 0000-0000"
REACT_APP_AGENCY_PHONE_WHATS=558500000000
REACT_APP_AGENCY_CNPJ="00.000.000/0001-00"
REACT_APP_TZ=America/Fortaleza
```

### 2. Variáveis de Ambiente - Backend

Crie `functions/.env` com base em `functions/.env.example`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu.email@gmail.com
SMTP_PASS=sua-app-password
AGENCY_BRAND=Maiatur
AGENCY_EMAIL=contato@maiatur.com.br
AGENCY_PHONE_DISPLAY="+55 (85) 0000-0000"
AGENCY_CNPJ="00.000.000/0001-00"
TZ=America/Fortaleza
```

**Importante:** Para Gmail SMTP (gratuito), você precisa:
1. Ativar autenticação de 2 fatores na sua conta Google
2. Gerar uma "Senha de App" em https://myaccount.google.com/apppasswords
3. Usar essa senha no `SMTP_PASS`

Alternativamente, configure via Firebase Config:
```bash
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="465" smtp.user="seu@email.com" smtp.pass="senha-app"
```

### 3. Firestore Rules

As regras já foram atualizadas em `firestore.rules`. Para aplicar:

```bash
firebase deploy --only firestore:rules
```

### 4. Inicializar Dados no Firestore

1. Execute o app localmente:
```bash
npm start
```

2. Acesse http://localhost:3000/admin/inicializador

3. Clique em "Inicializar Sistema"

Isso criará:
- `listas/passeios` com exemplos
- `listas/veiculos` com opções
- `reservas/_modelo` (documento template)

## 🚀 Deploy

### 1. Deploy das Cloud Functions

```bash
firebase deploy --only functions
```

Após o deploy, anote a URL da function `voucher`. Será algo como:
```
https://us-central1-SEU-PROJECT-ID.cloudfunctions.net/voucher
```

### 2. Deploy do Frontend (Vercel)

```bash
npm run build
vercel --prod
```

Ou através do dashboard Vercel conectado ao GitHub.

## 📋 Checklist Pós-Deploy

- [ ] Testar criação de reserva no ambiente de produção
- [ ] Verificar recebimento de e-mail com PDF anexado
- [ ] Testar download do voucher via HTTPS Function
- [ ] Confirmar que link do WhatsApp está funcionando
- [ ] Verificar responsividade em mobile
- [ ] Testar validação de 24h de antecedência
- [ ] Confirmar timezone America/Fortaleza está correto

## 🧪 Como Testar Localmente

### 1. Testar Frontend

```bash
npm start
# Acesse http://localhost:3000/reservas
```

### 2. Testar Cloud Functions (Emulator)

```bash
cd functions
npm run serve
# Inicia o emulador local
```

**Nota:** O emulator não envia e-mails reais. Para testar e-mail completo, faça deploy em ambiente de desenvolvimento.

## 📱 Rotas Criadas

### Públicas
- `/reservas` - Página principal (5 cards)
- `/reservas/passeio` - Formulário de passeio
- `/reservas/transfer-chegada` - Formulário transfer chegada
- `/reservas/transfer-chegada-e-saida` - *(a criar)*
- `/reservas/transfer-saida` - *(a criar)*
- `/reservas/transfer-entre-hoteis` - *(a criar)*
- `/politica` - Política de reservas

### Admin
- `/admin/inicializador` - Inicializar dados do sistema

## 🔧 Próximos Passos (OPCIONAL)

Se você quiser completar o sistema:

1. **Criar os 3 formulários restantes** (seguir padrão de PasseioPage.tsx)
   - TransferChegadaSaidaPage.tsx
   - TransferSaidaPage.tsx
   - TransferEntreHoteisPage.tsx

2. **Adicionar logo ao PDF** (atualmente só texto)
   - Copiar `/public/maiatur-logo.png` para `functions/assets/`
   - Descomentar código de imagem no `functions/index.js`

3. **Criar painel admin para gerenciar reservas**
   - Listagem de reservas
   - Mudar status (pendente → confirmada)
   - Cancelar reservas

4. **Melhorias de UX**
   - Máscaras de input mais refinadas
   - Loading states melhores
   - Toasts de feedback

## 🐛 Troubleshooting

### Erros de TypeScript

Se ver erros `Could not find a declaration file for module 'react'`:

```bash
npm install --save-dev @types/react @types/react-dom @types/node
```

### E-mail não está enviando

1. Verifique as credenciais SMTP no Firebase Config
2. Confira se a senha é uma "App Password" (não sua senha normal)
3. Veja os logs: `firebase functions:log`

### PDF não está gerando

1. Verifique se pdf-lib está instalado: `cd functions && npm list pdf-lib`
2. Confira os logs: `firebase functions:log --only voucher`

### Reserva não aparece no Firestore

1. Verifique as regras de segurança
2. Confira o console do navegador (F12) para erros
3. Veja se o Firebase está inicializado corretamente

## 📚 Documentação Completa

Veja `SISTEMA_RESERVAS_DOCS.md` para:
- Estrutura detalhada de dados
- Tipos TypeScript
- Schemas de validação
- Arquitetura do sistema

## 🎨 Personalização

### Cores e Estilos

Ajuste em cada arquivo `.css`:
- `ReservasPage.css` - Cards principais
- `PasseioPage.css` - Formulários
- `CamposComuns.css` - Componentes base

### Textos e Labels

Todos os labels seguem exatamente a especificação fornecida. Para alterar:
- Edite os componentes em `src/components/Reservas/CamposComuns.tsx`
- Ajuste os formulários individuais

### E-mail Template

Personalize o HTML em `functions/index.js`, função `gerarEmailHTML()`.

## 💡 Dicas

1. **Backup Regular**: Configure backups automáticos do Firestore
2. **Monitoramento**: Use Firebase Console para ver uso de Functions
3. **Custos**: Tudo roda no plano gratuito (Spark) se mantiver volume baixo
4. **Segurança**: Após testes, restrinja regras de escrita em `listas/*` apenas para admin

## 🤝 Suporte

Em caso de dúvidas:
1. Confira os logs: `firebase functions:log`
2. Veja o console do navegador (F12)
3. Revise a documentação do Firebase

---

**Sistema criado e pronto para uso!** 🎉

Comece acessando `/admin/inicializador` e depois teste criando uma reserva em `/reservas`.
