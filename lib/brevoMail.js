const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

async function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function normalizeRecipients(r){
  if (!r) return undefined;
  if (Array.isArray(r)) return r.map(x => typeof x === 'string' ? { email: x } : x);
  if (typeof r === 'string') return [{ email: r }];
  return [r];
}

async function sendEmail(opts = {}){
  const {
    to,
    subject,
    html,
    text,
    from,
    cc,
    bcc,
    attachments,
    templateId,
    params,
    headers = {},
    retries = 2,
    timeout = 10000
  } = opts;

  if (!API_KEY) {
    throw new Error('BREVO_API_KEY not configured');
  }

  const payload = {};
  payload.sender = {
    email: (from && from.email) || process.env.BREVO_FROM_EMAIL,
    name: (from && from.name) || process.env.BREVO_FROM_NAME
  };

  payload.to = normalizeRecipients(to);
  if (!payload.to || payload.to.length === 0) throw new Error('No recipients provided');
  if (cc) payload.cc = normalizeRecipients(cc);
  if (bcc) payload.bcc = normalizeRecipients(bcc);

  if (templateId) {
    payload.templateId = templateId;
    if (params) payload.params = params;
  } else {
    if (html) payload.htmlContent = html;
    if (text) payload.textContent = text;
    payload.subject = subject || '';
  }

  if (attachments) payload.attachment = attachments;
  if (headers && Object.keys(headers).length) payload.headers = headers;

  const idempotencyKey = headers['Idempotency-Key'] || `brevo-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

  let attempt = 0;
  let lastError = null;
  while (attempt <= retries) {
    try {
      attempt++;
      const resp = await axios.post(BREVO_API_URL, payload, {
        headers: {
          'api-key': API_KEY,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        timeout
      });
      return { ok: true, status: resp.status, data: resp.data };
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      if (status && (status >= 500 || status === 429) && attempt <= retries) {
        const backoff = 200 * Math.pow(2, attempt);
        await sleep(backoff);
        continue;
      }
      break;
    }
  }

  const message = lastError?.response?.data || lastError?.message || 'Unknown error';
  throw new Error(`Brevo send failed after ${attempt} attempts: ${JSON.stringify(message)}`);
}

module.exports = { sendEmail };
