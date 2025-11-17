Normalize reservas script
=========================

This script normalizes legacy reservation fields in the `reservas` collection and writes a unified `detalhes` object used by the admin modal and email/voucher generator.

Usage
-----

1) Provide Firebase Admin credentials. Either set `GOOGLE_APPLICATION_CREDENTIALS` to the service account JSON path or `FIREBASE_SERVICE_ACCOUNT_PATH`.

PowerShell example:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccount.json'
node .\scripts\normalize-reservas.js --dry-run --limit 50
# Review output. When ready to apply:
node .\scripts\normalize-reservas.js --confirm --limit 50
```

Flags
-----
- `--dry-run` (default): print planned changes without modifying Firestore.
- `--confirm`: actually apply updates to Firestore. Required to mutate data.
- `--force`: overwrite `detalhes` even if already present.
- `--limit N`: process only first N documents (useful for staged rollout).

Notes
-----
- The script attempts to preserve existing `detalhes` fields and only adds missing information unless `--force` is used.
- Always run `--dry-run` first and review logs before applying in production.
- For large collections consider running in batches or from a Cloud Run job with appropriate service account permissions.

If you want, I can create a GitHub Action or Cloud Run deployment example to run this on demand in production.
