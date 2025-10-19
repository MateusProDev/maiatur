# 🔐 Configuração das Regras do Firestore

## 📋 Resumo das Permissões

As regras do Firestore foram configuradas para permitir **inicialização automática** de coleções e documentos, ideal para reutilizar o projeto em diferentes contas Firebase.

### ✅ Permissões Principais

| Coleção | Leitura | Criação | Atualização/Exclusão |
|---------|---------|---------|----------------------|
| `content` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `pacotes` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `avaliacoes` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `reservas` | 🔒 Autenticado | ✅ Permitida | 🔒 Autenticado |
| `users` | 🔒 Próprio usuário | ✅ Permitida | 🔒 Próprio usuário |
| `motoristas` | 🔒 Autenticado | ✅ Permitida | 🔒 Autenticado |
| `settings` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `produtos` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `banners*` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `images` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `viagens` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |
| `whatsappConfig` | 🌐 Pública | ✅ Permitida | 🔒 Autenticado |

### 🔑 Regra Geral

**Qualquer coleção nova:**
- ✅ Leitura pública
- ✅ Criação permitida (para inicialização)
- 🔒 Atualização/exclusão apenas para usuários autenticados

---

## 🚀 Como Aplicar as Regras

### **Opção 1: Via Firebase Console (Recomendado)**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, vá em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Cole o conteúdo do arquivo `firestore.rules`
6. Clique em **Publicar** (Publish)

### **Opção 2: Via Firebase CLI**

```bash
# Certifique-se de estar logado
firebase login

# Implante as regras
firebase deploy --only firestore:rules

# Ou implante tudo de uma vez
firebase deploy
```

---

## 🎯 Benefícios da Configuração Atual

### ✅ Para Inicialização Automática
- O sistema pode criar automaticamente todas as coleções necessárias
- Não precisa criar manualmente no Firebase Console
- Ideal para migrar entre projetos Firebase

### ✅ Para Desenvolvimento
- Leitura pública facilita o desenvolvimento
- Criação permitida para dados iniciais
- Atualização/exclusão protegida

### ✅ Para Segurança
- Dados sensíveis (users, reservas) protegidos
- Apenas criação liberada, não atualização/exclusão não autorizada
- Atualização e exclusão exigem autenticação

---

## 🔒 Regras do Firebase Storage

### Pastas Públicas (Leitura)
- `/logos/**` - Logos da empresa
- `/pacotes/**` - Imagens de pacotes turísticos
- `/produtos/**` - Imagens de produtos
- `/banners/**` - Banners do site
- `/avatars/**` - Avatares de usuários
- Todas as outras pastas também têm leitura pública

### Escrita Protegida
- **Todas as escritas** no Storage exigem autenticação
- Apenas usuários logados podem fazer upload de arquivos

---

## 🛠️ Manutenção e Segurança

### ⚠️ Importante para Produção

Se você for colocar o site em produção e quiser **mais segurança**, considere:

1. **Remover criação pública** após a primeira inicialização:
   ```javascript
   allow create: if request.auth != null; // ao invés de: if true
   ```

2. **Adicionar rate limiting** (via Firebase AppCheck)

3. **Validar dados na escrita**:
   ```javascript
   allow create: if request.resource.data.titulo is string
                 && request.resource.data.preco is number;
   ```

4. **Usar Firebase AppCheck** para proteger contra bots

---

## 📝 Arquivo Original

O arquivo original das regras está em: `firestore.rules`

### Para restaurar uma versão anterior:
1. Vá no Firebase Console → Firestore → Regras
2. Clique em "Histórico de versões"
3. Selecione a versão desejada e restaure

---

## 🔄 Workflow Recomendado

### Ao Criar Novo Projeto Firebase:

1. **Copie o projeto** para nova pasta
2. **Atualize `firebaseConfig.js`** com as novas credenciais
3. **Deploy das regras**: `firebase deploy --only firestore:rules`
4. **Execute o projeto**: `npm start`
5. **Inicializador rodará automaticamente** e criará as coleções
6. **Customize** o estilo, cores, logos conforme necessário

### Para Trocar de Projeto:

```bash
# 1. Atualize firebase.json com novo projectId
# 2. Faça login na nova conta
firebase login

# 3. Selecione o projeto
firebase use seu-novo-projeto

# 4. Deploy das regras
firebase deploy --only firestore:rules

# 5. Rode o app
npm start
```

---

## 📞 Suporte

Se encontrar erros de permissão:
1. Verifique se as regras foram aplicadas corretamente
2. Confira no console do navegador (F12) qual operação está falhando
3. Ajuste as regras conforme necessário

**Logs comuns:**
- ✅ `Missing or insufficient permissions` → Verifique as regras
- ✅ `PERMISSION_DENIED` → Documento/coleção precisa de autenticação

---

## 📚 Documentação Oficial

- [Regras de Segurança do Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Regras do Firebase Storage](https://firebase.google.com/docs/storage/security)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

**Última atualização:** 19/10/2025
**Versão:** 2.0 - Otimizado para inicialização automática
