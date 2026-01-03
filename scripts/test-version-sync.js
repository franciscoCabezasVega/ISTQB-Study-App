#!/usr/bin/env node

/**
 * Script de prueba para verificar la actualización automática de versión
 * 
 * Uso: node scripts/test-version-sync.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sincronización de versión...\n');

// 1. Leer versión del package.json raíz
const rootPackagePath = path.join(__dirname, '..', 'package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const rootVersion = rootPackage.version;

console.log(`📦 Versión en package.json raíz: ${rootVersion}`);

// 2. Verificar next.config.js
try {
  const nextConfig = require('../packages/web/next.config.js');
  const configVersion = nextConfig.env?.NEXT_PUBLIC_APP_VERSION;
  const configBuildDate = nextConfig.env?.NEXT_PUBLIC_BUILD_DATE;
  
  console.log(`⚙️  Versión en next.config.js: ${configVersion}`);
  console.log(`📅 Build date en next.config.js: ${configBuildDate}`);
  
  if (configVersion === rootVersion) {
    console.log('✅ next.config.js está sincronizado correctamente\n');
  } else {
    console.log('❌ next.config.js NO está sincronizado\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error al leer next.config.js:', error.message);
  process.exit(1);
}

// 3. Verificar packages
const packages = ['api', 'web', 'shared'];
let allSynced = true;

console.log('📦 Verificando workspaces:\n');

packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, '..', 'packages', pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const pkgVersion = pkgJson.version;
    
    if (pkgVersion === rootVersion) {
      console.log(`   ✅ packages/${pkg}: ${pkgVersion}`);
    } else {
      console.log(`   ❌ packages/${pkg}: ${pkgVersion} (esperado: ${rootVersion})`);
      allSynced = false;
    }
  }
});

console.log('\n' + '='.repeat(50));

if (allSynced) {
  console.log('🎉 Todas las versiones están sincronizadas!');
  console.log('\n💡 Cuando hagas un release:');
  console.log('   1. semantic-release actualizará el package.json');
  console.log('   2. next.config.js leerá la nueva versión automáticamente');
  console.log('   3. El Footer mostrará la versión actualizada');
  process.exit(0);
} else {
  console.log('⚠️  Algunas versiones no están sincronizadas');
  console.log('\n💡 Ejecuta:');
  console.log('   npm run version:patch  # Para actualizar manualmente');
  process.exit(1);
}
