const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando vulnerabilidades e gastos de recursos desnecessários...\n');

// 1. Verificar vulnerabilidades npm
console.log('1. Verificando vulnerabilidades npm:');
try {
  execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
} catch (error) {
  console.log('   ❌ Execute "npm audit" manualmente para verificar vulnerabilidades.');
}

// 2. Verificar dependências não usadas
console.log('\n2. Verificando dependências não usadas:');
try {
  execSync('npx depcheck', { stdio: 'inherit' });
} catch (error) {
  console.log('   ❌ Execute "npx depcheck" manualmente para verificar dependências não usadas.');
}

// 3. Analisar tamanho do bundle (se build existir)
console.log('\n3. Analisando tamanho do bundle:');
const buildDir = path.join(__dirname, 'build');
if (fs.existsSync(buildDir)) {
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const jsDir = path.join(staticDir, 'js');
    const cssDir = path.join(staticDir, 'css');
    let totalJsSize = 0;
    let totalCssSize = 0;

    if (fs.existsSync(jsDir)) {
      const jsFiles = fs.readdirSync(jsDir);
      jsFiles.forEach(file => {
        const filePath = path.join(jsDir, file);
        const stats = fs.statSync(filePath);
        totalJsSize += stats.size;
      });
    }

    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      cssFiles.forEach(file => {
        const filePath = path.join(cssDir, file);
        const stats = fs.statSync(filePath);
        totalCssSize += stats.size;
      });
    }

    console.log(`   - Tamanho total JS: ${(totalJsSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Tamanho total CSS: ${(totalCssSize / 1024 / 1024).toFixed(2)} MB`);
    const totalSize = totalJsSize + totalCssSize;
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      console.log('   ⚠️  Bundle grande. Considere otimizar imports ou usar code splitting.');
    } else {
      console.log('   ✅ Bundle size razoável.');
    }
  } else {
    console.log('   ℹ️  Build não encontrado. Execute "npm run build" primeiro.');
  }
} else {
  console.log('   ℹ️  Build não encontrado. Execute "npm run build" primeiro.');
}

// 4. Verificar recursos desnecessários (simulação)
console.log('\n4. Verificando recursos desnecessários (simulação):');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});

  const heavyDeps = ['lodash', 'moment', 'jquery', 'bootstrap']; // Exemplos de libs pesadas
  const foundHeavy = deps.filter(dep => heavyDeps.includes(dep));
  if (foundHeavy.length > 0) {
    console.log(`   ⚠️  Dependências potencialmente pesadas encontradas: ${foundHeavy.join(', ')}`);
    console.log('     Considere substituir por alternativas menores (ex.: date-fns em vez de moment).');
  } else {
    console.log('   ✅ Nenhuma dependência pesada conhecida encontrada.');
  }
} else {
  console.log('   ❌ package.json não encontrado.');
}

// 5. Sugestões gerais
console.log('\n5. Sugestões para otimização:');
console.log('   - Use "npm run build -- --analyze" para visualizar bundle (instale webpack-bundle-analyzer).');
console.log('   - Monitore Vercel Analytics para requests excessivas.');
console.log('   - Considere lazy loading para componentes grandes.');
console.log('   - Use CDN para libs externas se possível.');

console.log('\n✅ Verificação concluída.');