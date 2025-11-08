# Como Autorizar Usuários no Painel Admin

## Sistema Simplificado - Apenas Email e Senha

O sistema de login foi simplificado para usar **apenas email e senha**, sem Google OAuth. O administrador controla quem pode acessar diretamente no Firestore.

## ✅ Como Funciona

1. **Admin cadastra o email no Firestore**
2. **Usuário usa "Esqueci minha senha" para criar sua senha**
3. **Usuário faz login normalmente**

---

## 📋 Passo a Passo para Autorizar um Novo Usuário

### 1. Acessar o Firestore Console

Vá para: https://console.firebase.google.com/
- Selecione seu projeto
- Clique em **Firestore Database**
- Acesse a coleção **`authorizedUsers`**

### 2. Adicionar Novo Usuário Autorizado

Clique em **"Adicionar documento"** e preencha:

```
ID do documento: email@exemplo.com (use o email completo como ID)

Campos:
- authorized: true (boolean)
- email: "email@exemplo.com" (string)
- name: "Nome do Usuário" (string)
- addedAt: timestamp (opcional)
```

**Exemplo prático:**
```
ID: mateoferreira0812@gmail.com

Campos:
authorized: true
email: "mateoferreira0812@gmail.com"
name: "Mateo Admin"
```

### 3. Usuário Cria Sua Senha

O usuário autorizado deve:

1. Ir para `/admin/login`
2. Clicar em **"Esqueci minha senha / Criar senha"**
3. Digitar o email autorizado
4. Clicar em **"Enviar link de redefinição"**
5. Verificar o email e clicar no link recebido
6. Criar uma senha forte (mínimo 6 caracteres)

### 4. Login Normal

Depois de criar a senha, o usuário pode fazer login normalmente:
- Email: seu email autorizado
- Senha: a senha que criou

---

## 🔐 Estrutura do Firestore

### Coleção: `authorizedUsers`

Cada documento representa um usuário autorizado:

```javascript
{
  authorized: true,      // Boolean - se pode acessar
  email: "user@mail.com", // String - email do usuário
  name: "Nome Completo"   // String - nome para exibição
}
```

**IMPORTANTE:** O **ID do documento** deve ser o **email completo** do usuário.

---

## 🛠️ Gerenciar Usuários Existentes

### Revogar Acesso
1. Vá para o documento do usuário no Firestore
2. Mude `authorized` de `true` para `false`
3. Usuário não conseguirá mais fazer login

### Restaurar Acesso
1. Vá para o documento do usuário no Firestore
2. Mude `authorized` de `false` para `true`
3. Usuário volta a ter acesso

### Remover Completamente
1. Delete o documento do usuário no Firestore
2. (Opcional) Delete também da Authentication do Firebase

---

## 📧 Recuperação de Senha

Qualquer usuário autorizado pode recuperar sua senha:

1. Clicar em **"Esqueci minha senha"**
2. Digitar o email
3. Sistema verifica se o email está autorizado no Firestore
4. Se sim, envia link de recuperação por email

---

## ⚠️ Segurança

- ✅ Apenas emails cadastrados no Firestore podem acessar
- ✅ Verificação acontece **antes** de permitir login
- ✅ Senhas gerenciadas pelo Firebase Authentication (seguras)
- ✅ Links de recuperação válidos por tempo limitado
- ✅ Sem necessidade de aprovação manual (admin controla diretamente)

---

## 🚀 Exemplo Completo

### Cenário: Autorizar "joao@empresa.com"

1. **No Firestore Console:**
   - Coleção: `authorizedUsers`
   - Novo documento ID: `joao@empresa.com`
   - Campo `authorized`: `true`
   - Campo `email`: `"joao@empresa.com"`
   - Campo `name`: `"João Silva"`

2. **Avisar o João:**
   - "Acesse maiatur.com/admin/login"
   - "Clique em 'Esqueci minha senha / Criar senha'"
   - "Digite joao@empresa.com"
   - "Verifique seu email e crie sua senha"

3. **João faz login:**
   - Email: joao@empresa.com
   - Senha: [a senha que ele criou]
   - ✅ Acesso liberado!

---

## 🔍 Troubleshooting

### "Acesso negado. Este email não está autorizado"
- ✅ Verifique se o email está no Firestore
- ✅ Verifique se `authorized: true`
- ✅ Verifique se o ID do documento é exatamente o email

### "Credenciais inválidas"
- ✅ Usuário precisa criar senha usando "Esqueci minha senha"
- ✅ Senha pode estar incorreta

### "Link de redefinição não chega"
- ✅ Verifique spam/lixo eletrônico
- ✅ Verifique se o email está configurado no Firebase
- ✅ Verifique se o domínio de email aceita emails do Firebase

---

## 📝 Notas Importantes

1. **Primeiro Admin:** Configure manualmente no Firestore antes de usar o sistema
2. **Backup:** Mantenha backup da lista de emails autorizados
3. **Firestore Rules:** Configure regras de segurança apropriadas
4. **Email Config:** Configure SMTP no Firebase para envio de emails

---

## 🎯 Vantagens deste Sistema

✅ **Simples** - Apenas email/senha, sem complexidade
✅ **Seguro** - Admin controla diretamente quem tem acesso
✅ **Flexível** - Fácil adicionar/remover usuários
✅ **Sem aprovação manual** - Usuário cria senha sozinho
✅ **Recuperação fácil** - Link por email a qualquer momento
✅ **Sem Google OAuth** - Não depende de conta Google
