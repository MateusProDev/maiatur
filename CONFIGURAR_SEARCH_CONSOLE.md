# 🔍 CONFIGURANDO GOOGLE SEARCH CONSOLE

## ❌ Problema: "Acesso Negado"

O erro 403 significa que você não tem acesso ao **Google Search Console** do domínio `transferfortalezatur.com.br`.

## ✅ Solução: Verificar e Configurar Search Console

### **Passo 1: Acesse Search Console**
1. Vá para: https://search.google.com/search-console
2. **Importante:** Use a conta `maiatur000@gmail.com`

### **Passo 2: Verificar se o Domínio Está Adicionado**
1. Na página inicial, procure por: `transferfortalezatur.com.br`
2. **Se NÃO estiver na lista:** Continue para o Passo 3
3. **Se ESTIVER na lista:** Vá para o Passo 4

### **Passo 3: Adicionar Propriedade**
1. Clique em **"Adicionar Propriedade"**
2. Selecione **"URL prefix"**
3. Digite: `https://transferfortalezatur.com.br`
4. Clique em **"Continuar"**

### **Passo 4: Verificar Propriedade**
1. **Método recomendado:** "HTML tag" (mais fácil)
2. Copie o código meta tag
3. Cole no `<head>` do seu site (arquivo `public/index.html`)
4. Clique em **"Verificar"**

### **Passo 5: Confirmar Acesso**
Após verificação:
- ✅ Você deve ver a propriedade na lista
- ✅ Deve ter acesso total como "Proprietário"
- ✅ Agora pode voltar ao admin dashboard

## 🔄 Teste Novamente

Após configurar o Search Console:
1. Volte para: https://transferfortalezatur.com.br/admin
2. Clique em **"Conectar Google"**
3. Deve funcionar sem erro 403!

## 📋 Verificação de Permissões

No Search Console:
- Vá em **Configurações** → **Usuários e permissões**
- Você (`maiatur000@gmail.com`) deve estar como **Proprietário**

## 🚨 Possíveis Problemas

### **Erro: "Você não tem permissão"**
- ❌ Conta errada: Use `maiatur000@gmail.com`
- ❌ Domínio errado: Deve ser exatamente `transferfortalezatur.com.br`
- ❌ Não verificado: Complete a verificação primeiro

### **Erro: "Propriedade não encontrada"**
- ❌ Domínio não adicionado: Adicione primeiro
- ❌ Conta diferente: Use a mesma conta do OAuth

## 🎯 Status Atual

- ✅ **OAuth configurado** e funcionando
- ✅ **Usuário testador** adicionado
- ❌ **Search Console** precisa ser configurado

**Configure o Search Console primeiro, depois teste novamente!** 🚀</content>
<parameter name="filePath">c:\Users\mateo\Documents\maiatur\CONFIGURAR_SEARCH_CONSOLE.md