const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  const logs = [];
  
  try {
    // 1. Verificar variáveis de ambiente
    logs.push("=== VERIFICANDO VARIÁVEIS ===");
    logs.push(`SMTP_HOST: ${process.env.SMTP_HOST || "❌ NÃO DEFINIDA"}`);
    logs.push(`SMTP_PORT: ${process.env.SMTP_PORT || "❌ NÃO DEFINIDA"}`);
    logs.push(`SMTP_USER: ${process.env.SMTP_USER || "❌ NÃO DEFINIDA"}`);
    logs.push(`SMTP_PASS: ${process.env.SMTP_PASS ? "✅ DEFINIDA (oculta)" : "❌ NÃO DEFINIDA"}`);
    logs.push(`AGENCY_FROM: ${process.env.AGENCY_FROM || "⚠️ NÃO DEFINIDA (usará SMTP_USER)"}`);
    logs.push(`AGENCY_EMAIL: ${process.env.AGENCY_EMAIL || "⚠️ NÃO DEFINIDA"}`);
    logs.push("");

    // 2. Verificar se todas as variáveis obrigatórias existem
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        error: "Variáveis SMTP não configuradas corretamente",
        logs
      });
    }

    // 3. Criar transporter
    logs.push("=== CRIANDO TRANSPORTER ===");
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = port === 465;
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Ativa logs detalhados
      logger: true, // Ativa logger
    });
    
    logs.push(`Host: ${process.env.SMTP_HOST}`);
    logs.push(`Port: ${port}`);
    logs.push(`Secure (SSL): ${secure}`);
    logs.push(`User: ${process.env.SMTP_USER}`);
    logs.push("");

    // 4. Verificar conexão
    logs.push("=== TESTANDO CONEXÃO ===");
    await transporter.verify();
    logs.push("✅ Conexão SMTP OK!");
    logs.push("");

    // 5. Tentar enviar email de teste
    const testEmail = req.query.to || "maiatur000@gmail.com";
    const fromAddress = process.env.AGENCY_FROM || process.env.SMTP_USER;
    
    logs.push("=== ENVIANDO EMAIL DE TESTE ===");
    logs.push(`Para: ${testEmail}`);
    logs.push(`De: ${fromAddress}`);
    logs.push("");

    const info = await transporter.sendMail({
      from: `"Maiatur Turismo [TESTE]" <${fromAddress}>`,
      to: testEmail,
      subject: "🧪 Teste de diagnóstico SMTP - Maiatur",
      text: "Se você recebeu este email, o SMTP da Brevo está funcionando corretamente!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a4d7a;">🧪 Teste de Diagnóstico SMTP</h2>
            <p><strong>✅ Funcionando!</strong></p>
            <p>Se você recebeu este email, o SMTP da Brevo está configurado corretamente.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              Servidor: ${process.env.SMTP_HOST}<br>
              Porta: ${port}<br>
              De: ${fromAddress}
            </p>
          </div>
        </div>
      `,
    });

    logs.push("✅ EMAIL ENVIADO COM SUCESSO!");
    logs.push(`Message ID: ${info.messageId}`);
    logs.push(`Response: ${info.response}`);
    logs.push("");
    logs.push("⚠️ IMPORTANTE: Verifique sua caixa de entrada E a pasta de SPAM/LIXEIRA");

    return res.status(200).json({
      success: true,
      message: "Email enviado com sucesso!",
      to: testEmail,
      from: fromAddress,
      messageId: info.messageId,
      logs
    });

  } catch (error) {
    logs.push("");
    logs.push("=== ❌ ERRO ===");
    logs.push(`Tipo: ${error.name}`);
    logs.push(`Mensagem: ${error.message}`);
    logs.push(`Code: ${error.code || "N/A"}`);
    
    if (error.response) {
      logs.push(`Response: ${error.response}`);
    }
    
    if (error.command) {
      logs.push(`Command: ${error.command}`);
    }

    console.error("Erro detalhado:", error);

    return res.status(500).json({
      error: error.message,
      code: error.code,
      logs,
      hint: error.code === "EAUTH" 
        ? "Erro de autenticação: verifique SMTP_USER e SMTP_PASS"
        : error.code === "ECONNECTION"
        ? "Erro de conexão: verifique SMTP_HOST e SMTP_PORT"
        : "Verifique os logs acima para mais detalhes"
    });
  }
};
