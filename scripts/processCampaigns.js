require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const { sendEmail } = require('../lib/brevoMail');

// In local dev you can set GOOGLE_APPLICATION_CREDENTIALS env var
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!admin.apps.length) {
  if (serviceAccountPath) {
    const sa = require(path.resolve(serviceAccountPath));
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();
const BATCH_SIZE = parseInt(process.env.CAMPAIGN_BATCH_SIZE || '10', 10);
const MAX_ATTEMPTS = parseInt(process.env.CAMPAIGN_MAX_ATTEMPTS || '3', 10);

async function lockAndFetchCampaigns(limit = BATCH_SIZE) {
  const now = admin.firestore.Timestamp.now();
  const q = db.collection('campaigns')
    .where('status', '==', 'queued')
    .where('scheduledAt', '<=', now)
    .orderBy('scheduledAt', 'asc')
    .limit(limit);

  const snap = await q.get();
  return snap.docs;
}

async function processCampaignDoc(docRef, data) {
  const docId = docRef.id;
  const updated = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const d = snap.data();
    if (!d || d.status !== 'queued') return false;
    tx.update(docRef, { status: 'processing', updatedAt: admin.firestore.Timestamp.now() });
    return true;
  });

  if (!updated) {
    console.log(`[${docId}] not queued, skipping`);
    return;
  }

  try {
    console.log(`[${docId}] sending...`);
    const recipients = (data.to || []).map(r => (typeof r === 'string' ? { email: r } : r));
    if (!recipients.length) throw new Error('No recipients');

    const resp = await sendEmail({
      to: recipients,
      subject: data.subject || '(sem assunto)',
      html: data.htmlContent || '',
      text: data.textContent || undefined,
      retries: 1
    });

    await docRef.update({
      status: 'sent',
      sentAt: admin.firestore.Timestamp.now(),
      providerResponse: resp.data || resp,
      attempts: (data.attempts || 0) + 1,
      updatedAt: admin.firestore.Timestamp.now()
    });
    console.log(`[${docId}] sent successfully`);
  } catch (err) {
    console.error(`[${docId}] send failed`, err && err.message ? err.message : err);
    const attempts = (data.attempts || 0) + 1;
    const updates = {
      attempts,
      lastError: err?.message || JSON.stringify(err),
      updatedAt: admin.firestore.Timestamp.now()
    };
    if (attempts >= MAX_ATTEMPTS) {
      updates.status = 'failed';
      updates.failedAt = admin.firestore.Timestamp.now();
    } else {
      updates.status = 'queued';
      const backoffMs = Math.pow(2, attempts) * 60 * 1000;
      updates.scheduledAt = admin.firestore.Timestamp.fromMillis(Date.now() + backoffMs);
    }
    await docRef.update(updates);
  }
}

async function runOnce() {
  const docs = await lockAndFetchCampaigns();
  if (!docs.length) {
    console.log('No campaigns to process.');
    return;
  }
  for (const doc of docs) {
    await processCampaignDoc(doc.ref, doc.data());
  }
}

if (require.main === module) {
  (async () => {
    try {
      await runOnce();
      process.exit(0);
    } catch (e) {
      console.error('Fatal', e);
      process.exit(1);
    }
  })();
}

module.exports = { runOnce };
