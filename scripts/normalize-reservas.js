#!/usr/bin/env node
/**
 * scripts/normalize-reservas.js
 *
 * Normaliza documentos na coleção `reservas` do Firestore.
 * - Suporta --dry-run (default) e --confirm para aplicar alterações.
 * - Use --limit N para limitar o número de documentos processados.
 * - Use --force para sobrescrever campos `detalhes` existentes.
 *
 * Segurança: forneça credenciais do Firebase Admin via
 *  - GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json  (ou)
 *  - export FIREBASE_SERVICE_ACCOUNT_PATH=./credentials.json
 *
 * Execução (PowerShell):
 *  $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccount.json'
 *  node .\scripts\normalize-reservas.js --dry-run --limit 100
 *  node .\scripts\normalize-reservas.js --confirm --limit 100
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const args = require('minimist')(process.argv.slice(2), {
  boolean: ['dry-run', 'confirm', 'force'],
  alias: { d: 'dry-run', c: 'confirm', f: 'force', l: 'limit' },
  default: { 'dry-run': true },
});

const DRY_RUN = args['dry-run'] === true && !args.confirm;
const CONFIRM = !!args.confirm;
const FORCE = !!args.force;
const LIMIT = args.limit ? parseInt(args.limit, 10) : null;

function initFirebase() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const svcPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!fs.existsSync(svcPath)) {
      console.error('Service account file not found at', svcPath);
      process.exit(1);
    }
    const serviceAccount = require(path.resolve(svcPath));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    try {
      admin.initializeApp(); // try ADC
    } catch (e) {
      console.error('No Firebase credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH.');
      process.exit(1);
    }
  }
}

function normalizeFromDoc(r) {
  const d = r.detalhes || {};
  const passeioNome = r.passeio?.nome || r.nomePasseio || d.nomePasseio || '';
  const dataPasseio = r.passeio?.data || r.dataPasseio || d.dataPasseio || '';
  const horaPasseio = r.passeio?.horario || r.horaPasseio || d.horaPasseio || '';
  const horaSaida = d.horaSaida || r.horaSaida || '';
  const horaRetorno = d.horaRetorno || r.horaRetorno || '';
  const localSaida = r.passeio?.localEmbarque || r.localSaida || d.localSaida || '';
  const tipoVeiculo = r.veiculo?.tipo || r.tipoVeiculo || d.tipoVeiculo || d.tipoTransferVeiculo || '';
  const passageirosLista = d.passageirosLista || r.passageirosLista || [];
  const passageirosTexto = d.passageirosTexto || (typeof r.passageiros === 'string' ? r.passageiros : '') || '';
  const observacoes = r.observacoes || d.observacoes || '';
  const pagamento = r.pagamento || d.pagamento || {};
  const quantidades = r.quantidades || d.quantidades || {};
  const voo = r.voo || r.vooChegada || d.voo || d.vooChegada || null;

  return {
    nomePasseio,
    dataPasseio,
    horaPasseio,
    horaSaida,
    horaRetorno,
    localSaida,
    tipoVeiculo,
    passageirosLista,
    passageirosTexto,
    observacoes,
    pagamento,
    quantidades,
    voo,
  };
}

async function run() {
  console.log('normalize-reservas started. DRY_RUN=', DRY_RUN, 'CONFIRM=', CONFIRM, 'FORCE=', FORCE, 'LIMIT=', LIMIT);
  initFirebase();
  const db = admin.firestore();
  const colRef = db.collection('reservas');

  let snapshot;
  if (LIMIT) snapshot = await colRef.limit(LIMIT).get();
  else snapshot = await colRef.get();

  console.log('Docs fetched:', snapshot.size);

  const updates = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const norm = normalizeFromDoc(data);

    // Decide if we should update: if detalhes missing or missing fields or force
    const hasDetalhes = !!data.detalhes;
    const needs = {};

    const keys = ['nomePasseio','dataPasseio','horaPasseio','horaSaida','horaRetorno','localSaida','tipoVeiculo','passageirosLista','passageirosTexto','observacoes'];
    let needUpdate = false;
    if (!hasDetalhes) {
      needUpdate = true;
    } else if (FORCE) {
      needUpdate = true;
    } else {
      // check for missing fields inside detalhes
      keys.forEach(k => {
        if (k === 'passageirosLista') {
          if ((!data.detalhes.passageirosLista || data.detalhes.passageirosLista.length === 0) && norm.passageirosLista && norm.passageirosLista.length > 0) needUpdate = true;
        } else if (k === 'passageirosTexto') {
          if ((!data.detalhes.passageirosTexto || data.detalhes.passageirosTexto === '') && norm.passageirosTexto) needUpdate = true;
        } else {
          if ((!data.detalhes.hasOwnProperty(k) || data.detalhes[k] === '' || data.detalhes[k] === undefined) && norm[k]) needUpdate = true;
        }
      });
    }

    if (needUpdate) {
      const detalhesUpdate = Object.assign({}, data.detalhes || {}, {
        nomePasseio: norm.nomePasseio || (data.detalhes && data.detalhes.nomePasseio) || null,
        dataPasseio: norm.dataPasseio || (data.detalhes && data.detalhes.dataPasseio) || null,
        horaPasseio: norm.horaPasseio || (data.detalhes && data.detalhes.horaPasseio) || null,
        horaSaida: norm.horaSaida || (data.detalhes && data.detalhes.horaSaida) || null,
        horaRetorno: norm.horaRetorno || (data.detalhes && data.detalhes.horaRetorno) || null,
        localSaida: norm.localSaida || (data.detalhes && data.detalhes.localSaida) || null,
        tipoVeiculo: norm.tipoVeiculo || (data.detalhes && data.detalhes.tipoVeiculo) || null,
        passageirosLista: (norm.passageirosLista && norm.passageirosLista.length > 0) ? norm.passageirosLista : (data.detalhes && data.detalhes.passageirosLista) || [],
        passageirosTexto: norm.passageirosTexto || (data.detalhes && data.detalhes.passageirosTexto) || null,
        observacoes: norm.observacoes || (data.detalhes && data.detalhes.observacoes) || null,
      });

      updates.push({ id: doc.id, before: data, after: { detalhes: detalhesUpdate, pagamento: data.pagamento || norm.pagamento || {}, quantidades: data.quantidades || norm.quantidades || {} } });
    }
  });

  console.log('Documents to update:', updates.length);

  if (updates.length === 0) {
    console.log('Nothing to do. Exiting.');
    process.exit(0);
  }

  if (DRY_RUN && !CONFIRM) {
    console.log('Dry run mode. The following updates would be applied:');
    updates.forEach(u => {
      console.log('---');
      console.log('Doc:', u.id);
      console.log('Before (detalhes):', JSON.stringify(u.before.detalhes || {}, null, 2));
      console.log('After (detalhes):', JSON.stringify(u.after.detalhes || {}, null, 2));
    });
    console.log('\nDry run complete. Use --confirm to apply changes.');
    process.exit(0);
  }

  if (!CONFIRM) {
    console.error('Unsafe operation: to apply changes you must pass --confirm. Aborting.');
    process.exit(1);
  }

  // Apply updates in batches
  const db = admin.firestore();
  let batch = db.batch();
  let batchCount = 0;
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    const ref = db.collection('reservas').doc(u.id);
    batch.set(ref, u.after, { merge: true });
    batchCount++;
    if (batchCount === 400) {
      await batch.commit();
      console.log('Committed batch of 400 updates');
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) {
    await batch.commit();
    console.log('Committed final batch of', batchCount);
  }

  console.log('All updates applied. Updated docs:', updates.length);
  process.exit(0);
}

run().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
