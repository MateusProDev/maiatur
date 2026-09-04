const { spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const checks = [
  ['lint', 'npm run lint'],
  ['type-check', 'npm run type-check'],
  ['build', 'npm run build'],
  ['prerender', 'npm run prerender']
];

const failures = [];

for (const [name, command] of checks) {
  console.log(`\n=== ${name} ===`);
  const result = spawnSync(npmCommand, ['run', name], {
    stdio: 'inherit',
    shell: false
  });

  if (result.error || result.status !== 0) {
    failures.push({
      name,
      code: result.status ?? 'spawn-error',
      error: result.error?.message
    });
    console.error(`\n[diagnose] ${command} falhou, continuando...`);
  } else {
    console.log(`\n[diagnose] ${command} passou.`);
  }
}

console.log('\n=== RESUMO DO DIAGNOSTICO ===');
if (failures.length === 0) {
  console.log('Todos os checks passaram.');
  process.exit(0);
}

console.error(`${failures.length} check(s) falharam:`);
for (const failure of failures) {
  console.error(`- ${failure.name}: codigo ${failure.code}${failure.error ? ` (${failure.error})` : ''}`);
}
process.exit(1);