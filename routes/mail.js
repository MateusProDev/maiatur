const express = require('express');
const router = express.Router();
const { sendEmail } = require('../lib/brevoMail');

// POST /api/mail/send-test
router.post('/send-test', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to) return res.status(400).json({ error: 'Missing `to`' });

    const payload = {
      to,
      subject: subject || 'Teste de envio',
      html: html || `<p>Teste de envio em ${new Date().toISOString()}</p>`,
      text: text || `Teste de envio em ${new Date().toISOString()}`
    };

    const result = await sendEmail(payload);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('Error /api/mail/send-test', err);
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

module.exports = router;
