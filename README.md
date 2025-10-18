# 🚐 FavelaChique - Sistema de Reservas e Pagamentos

Bem-vindo ao **FavelaChique**, um sistema completo de reservas de viagens com integração Mercado Pago, autenticação Firebase e três painéis distintos: **Usuário**, **Motorista** e **Dono da Agência**. Este projeto foi desenvolvido para facilitar a gestão de reservas, pagamentos e administração de viagens em agências de turismo, com foco em segurança, usabilidade e automação.

---

## ✨ Funcionalidades Principais

- **Reserva Online de Viagens**: Usuários podem reservar viagens, escolher pacotes e efetuar pagamentos online via PIX ou cartão de crédito.
- **Painel do Usuário**: Visualização de reservas, status de pagamento, comprovantes e histórico.
- **Painel do Motorista**: Acesso às viagens designadas, lista de passageiros, detalhes de embarque e status de cada viagem.
- **Painel do Dono da Agência**: Administração completa de reservas, motoristas, pacotes, relatórios financeiros e controle de pagamentos.
- **Autenticação Firebase**: Login seguro por e-mail/senha ou Google, com persistência de sessão.
- **Pagamentos Mercado Pago**: Integração transparente para PIX e cartão, com webhook automatizado para confirmação e criação de reservas.
- **Notificações e Modais**: Feedback visual para cada etapa do processo, incluindo confirmação de reserva, erros e redirecionamentos automáticos.
- **Regras de Segurança**: Firestore configurado para máxima segurança, permitindo escrita do webhook apenas na coleção de reservas.

---

## 🏗️ Estrutura do Projeto

```
├── src/
│   ├── components/
│   │   ├── CheckoutTransparente/         # Pagamento e reserva
│   │   ├── ModalConfirmacaoReserva/      # Modal de confirmação
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.js                # Contexto de autenticação
│   ├── firebase/
│   │   └── firebaseConfig.js             # Configuração Firebase
│   └── pages/                            # Páginas dos painéis
├── api/
│   ├── mercadopago.js                    # Endpoint de pagamento
│   ├── webhook/mercadopago.js            # Webhook Mercado Pago
│   └── payment/[id].js                   # Consulta status pagamento
├── firestore.rules                       # Regras de segurança
├── public/                               # Assets e index.html
└── ...
```

---

## 🔐 Segurança e Permissões

- **Firestore**: Apenas o webhook pode escrever em `/reservas` sem autenticação. Usuários autenticados podem ler suas reservas.
- **Variáveis de Ambiente**: Tokens do Mercado Pago e credenciais do Firebase nunca ficam expostos no frontend.
- **Validação Backend**: Todos os pagamentos são validados no backend antes de criar reservas.

---

## 💳 Fluxo de Pagamento

1. Usuário escolhe o pacote e preenche os dados.
2. Seleciona método de pagamento (PIX ou cartão).
3. Backend cria pagamento no Mercado Pago e retorna QR Code ou status do cartão.
4. Webhook recebe confirmação do Mercado Pago e grava a reserva no Firestore.
5. Usuário recebe confirmação visual e pode acompanhar tudo pelo painel.

---

## 👤 Painel do Usuário
- Visualiza reservas, status de pagamento, detalhes da viagem e comprovantes.
- Pode cancelar reservas (se permitido pela agência).
- Recebe notificações automáticas por e-mail e no painel.

## 🚗 Painel do Motorista
- Lista de viagens atribuídas.
- Detalhes de passageiros, horários e pontos de embarque.
- Atualização de status da viagem (em andamento, concluída, etc).

## 🏢 Painel do Dono da Agência
- Gerenciamento de todos os pacotes, reservas e motoristas.
- Relatórios financeiros e exportação de dados.
- Controle de permissões e cadastro de novos motoristas.

---

## ⚙️ Tecnologias Utilizadas
- **React 19** + **Material-UI 7**
- **Firebase 11** (Auth, Firestore)
- **Mercado Pago SDK**
- **Vercel Serverless Functions**
- **CSS Modules**

---

## 🚀 Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SeuUsuario/favelachique.git
   cd favelachique
   ```
2. **Configure as variáveis de ambiente:**
   - Crie um arquivo `.env.local` na raiz com:
     ```env
     REACT_APP_MERCADO_PAGO_PUBLIC_KEY=...
     MERCADO_PAGO_ACCESS_TOKEN=...
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     ...
     ```
3. **Instale as dependências:**
   ```bash
   npm install
   ```
4. **Rode o projeto localmente:**
   ```bash
   npm start
   ```
5. **Deploy:**
   - Configure as variáveis de ambiente na Vercel.
   - Faça deploy pelo painel da Vercel ou via CLI.

---

## 📝 Observações Importantes
- Preencha corretamente o `firebaseConfig` no webhook para produção.
- Mantenha as regras do Firestore sempre atualizadas para máxima segurança.
- Teste todos os fluxos em ambiente de homologação antes de liberar para clientes.

---

## 💡 Dicas de Uso
- Use o painel do dono para cadastrar motoristas e criar novos pacotes.
- Motoristas devem acessar apenas suas viagens designadas.
- Usuários podem acompanhar o status em tempo real pelo painel.

---

## 👨‍💻 Contribuição
Pull requests são bem-vindos! Siga o padrão de código e sempre descreva bem suas alterações.

---

## 📄 Licença
MIT

---

> Feito com ❤️ para transformar a experiência de viagens e reservas em agências de turismo!