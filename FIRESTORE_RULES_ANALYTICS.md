# Regras do Firestore para Analytics

Adicione estas regras ao seu arquivo `firestore.rules` para permitir o tracking de analytics:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Analytics - Permite escrita anônima e leitura apenas para admins
    match /analytics/{document} {
      // Qualquer um pode registrar page views
      allow create: if true;
      // Apenas admins autenticados podem ler os dados
      allow read: if request.auth != null;
      // Impedir updates e deletes
      allow update, delete: if false;
    }
    
    // Banners - Permite leitura pública, escrita apenas para admins
    match /banners/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Pacotes - Permite leitura pública, escrita apenas para admins
    match /pacotes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Content - Permite leitura pública, escrita apenas para admins
    match /content/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Outras coleções podem manter as regras existentes
  }
}
```

## Importante

⚠️ **Atenção**: A regra `allow create: if true` para analytics permite que qualquer visitante registre page views, o que é necessário para o tracking funcionar. No entanto, isso significa que:

1. ✅ **Seguro**: Apenas criação é permitida, não leitura, update ou delete
2. ✅ **Privado**: Apenas admins autenticados podem visualizar os dados
3. ⚠️ **Spam**: Teoricamente alguém poderia enviar dados falsos

### Proteção Adicional (Opcional)

Se quiser mais segurança, você pode:

1. **Limitar a taxa de escritas** usando Firebase App Check
2. **Validar dados** com schema validation:

```javascript
match /analytics/{document} {
  allow create: if request.resource.data.keys().hasAll(['type', 'page', 'timestamp']) 
                && request.resource.data.type == 'pageview'
                && request.resource.data.page is string
                && request.resource.data.timestamp is timestamp;
  allow read: if request.auth != null;
}
```

3. **Implementar reCAPTCHA** nas páginas públicas (mais complexo)

## Deploy das Regras

Para aplicar as regras:

```bash
# Via Firebase CLI
firebase deploy --only firestore:rules

# Ou manualmente no Firebase Console
# 1. Acesse Firebase Console
# 2. Vá em Firestore Database
# 3. Clique em "Regras"
# 4. Cole as regras acima
# 5. Clique em "Publicar"
```

## Verificação

Após aplicar as regras, teste:

1. ✅ Navegue pelo site (deve registrar page views)
2. ✅ Acesse o dashboard como admin (deve ver analytics)
3. ✅ Tente acessar `/admin` sem login (deve redirecionar)
