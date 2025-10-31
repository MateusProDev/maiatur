const nodemailer = require("nodemailer");

function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = port === 465; // 465 = SSL/TLS, 587 = STARTTLS
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = async (req, res) => {
  try {
    // Basic protection: require a key and a recipient
    const { to, key } = req.query;
    if (!process.env.TEST_EMAIL_KEY) {
      return res.status(501).json({ error: "TEST_EMAIL_KEY não configurada no ambiente" });
    }
    if (!key || key !== process.env.TEST_EMAIL_KEY) {
      return res.status(403).json({ error: "Chave de teste inválida" });
    }
    if (!to) {
      return res.status(400).json({ error: "Parâmetro 'to' é obrigatório" });
    }

    const transporter = createTransporter();
    const fromAddress = process.env.AGENCY_FROM || process.env.SMTP_USER;
    const replyTo = process.env.AGENCY_REPLY_TO || process.env.AGENCY_EMAIL || fromAddress;

    await transporter.sendMail({
      from: `Maiatur Turismo <${fromAddress}>`,
      replyTo,
      to,
      subject: "Teste SMTP Maiatur",
      text: "Funciona! Este é um teste de SMTP.",
      html: "<p><strong>Funciona!</strong> Este é um teste de SMTP.</p>",
    });

    return res.status(200).json({ success: true, to });
  } catch (err) {
    console.error("Erro no test-email:", err);
    return res.status(500).json({ error: err.message });
  }
};
