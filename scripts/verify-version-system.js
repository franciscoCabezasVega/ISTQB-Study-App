#!/usr/bin/env node

/**
 * Script de verificación del sistema de versionado
 * 
 * Verifica que todos los archivos y configuraciones estén correctos
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando sistema de versionado...\n');

let errors = 0;
let warnings = 0;
let success = 0;

function check(name, condition, errorMsg, warningMsg = null) {
  if (condition) {
    console.log(`✅ ${name}`);
    success++;
  } else {
    if (warningMsg) {
      console.log(`⚠️  ${name}: ${warningMsg}`);
      warnings++;
    } else {
      console.log(`❌ ${name}: ${errorMsg}`);
      errors++;
    }
  }
}

// Verificar archivos principales
check(
  'CHANGELOG.md existe',
  fs.existsSync(path.join(__dirname, '../CHANGELOG.md')),
  'Archivo no encontrado'
);

check(
  'README.md tiene sección de versionado',
  fs.existsSync(path.join(__dirname, '../README.md')) &&
  fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8').includes('Versionado'),
  'README no tiene sección de versionado'
);

check(
  'Script de release existe',
  fs.existsSync(path.join(__dirname, 'release.js')),
  'scripts/release.js no encontrado'
);

check(
  'Workflow de GitHub Actions existe',
  fs.existsSync(path.join(__dirname, '../.github/workflows/release.yml')),
  '.github/workflows/release.yml no encontrado'
);

check(
  'Guía de versionado existe',
  fs.existsSync(path.join(__dirname, '../docs/VERSIONING_GUIDE.md')),
  'docs/VERSIONING_GUIDE.md no encontrado'
);

// Verificar versiones en package.json
const rootPackage = require('../package.json');
const webPackage = require('../packages/web/package.json');
const apiPackage = require('../packages/api/package.json');
const sharedPackage = require('../packages/shared/package.json');

check(
  'Versión en package.json raíz',
  rootPackage.version,
  'No tiene versión definida'
);

check(
  'Versión en packages/web',
  webPackage.version,
  'No tiene versión definida'
);

check(
  'Versión en packages/api',
  apiPackage.version,
  'No tiene versión definida'
);

check(
  'Versión en packages/shared',
  sharedPackage.version,
  'No tiene versión definida'
);

// Verificar que todas las versiones coincidan
const allVersions = [
  rootPackage.version,
  webPackage.version,
  apiPackage.version,
  sharedPackage.version
];

const allSame = allVersions.every(v => v === allVersions[0]);

check(
  'Todas las versiones coinciden',
  allSame,
  `Versiones inconsistentes: ${allVersions.join(', ')}`
);

// Verificar scripts en package.json
check(
  'Script "release" definido',
  rootPackage.scripts && rootPackage.scripts.release,
  'Script "release" no encontrado en package.json'
);

check(
  'Script "version:patch" definido',
  rootPackage.scripts && rootPackage.scripts['version:patch'],
  'Script "version:patch" no encontrado en package.json'
);

check(
  'Script "version:minor" definido',
  rootPackage.scripts && rootPackage.scripts['version:minor'],
  'Script "version:minor" no encontrado en package.json'
);

check(
  'Script "version:major" definido',
  rootPackage.scripts && rootPackage.scripts['version:major'],
  'Script "version:major" no encontrado en package.json'
);

// Verificar componente Footer
check(
  'Componente Footer existe',
  fs.existsSync(path.join(__dirname, '../packages/web/components/Footer.tsx')),
  'Footer.tsx no encontrado'
);

// Verificar traducciones
const i18nFile = path.join(__dirname, '../packages/web/lib/i18n.ts');
if (fs.existsSync(i18nFile)) {
  const i18nContent = fs.readFileSync(i18nFile, 'utf8');
  
  check(
    'Traducciones del footer (ES)',
    i18nContent.includes('footer: {') && i18nContent.includes('version:'),
    'Traducciones en español del footer no encontradas'
  );
  
  check(
    'Traducciones del footer (EN)',
    i18nContent.lastIndexOf('footer: {') !== i18nContent.indexOf('footer: {'),
    'Traducciones en inglés del footer no encontradas'
  );
} else {
  console.log('❌ Archivo i18n.ts no encontrado');
  errors++;
}

// Verificar templates de GitHub
check(
  'Template de Pull Request',
  fs.existsSync(path.join(__dirname, '../.github/pull_request_template.md')),
  'pull_request_template.md no encontrado'
);

check(
  'Template de Bug Report',
  fs.existsSync(path.join(__dirname, '../.github/ISSUE_TEMPLATE/bug_report.md')),
  'bug_report.md no encontrado'
);

check(
  'Template de Feature Request',
  fs.existsSync(path.join(__dirname, '../.github/ISSUE_TEMPLATE/feature_request.md')),
  'feature_request.md no encontrado'
);

// Verificar .env.local.example
check(
  '.env.local.example existe',
  fs.existsSync(path.join(__dirname, '../packages/web/.env.local.example')),
  '.env.local.example no encontrado',
  'Recomendado para configurar variables de versión'
);

// Resumen
console.log('\n' + '─'.repeat(50));
console.log('📊 Resumen de verificación:\n');
console.log(`✅ Correctos: ${success}`);
console.log(`⚠️  Advertencias: ${warnings}`);
console.log(`❌ Errores: ${errors}`);
console.log('─'.repeat(50) + '\n');

if (errors === 0 && warnings === 0) {
  console.log('🎉 ¡Todo perfecto! El sistema de versionado está correctamente configurado.\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Commit de los cambios: git add . && git commit -m "chore: setup versioning"');
  console.log('   2. Push a GitHub: git push');
  console.log('   3. Crear tag: git tag -a v1.0.0-alpha -m "Release v1.0.0-alpha"');
  console.log('   4. Push tag: git push --tags');
  console.log('   5. Ver el release en GitHub\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('⚠️  Hay algunas advertencias, pero el sistema debería funcionar.\n');
  process.exit(0);
} else {
  console.log('❌ Hay errores que deben corregirse antes de continuar.\n');
  process.exit(1);
}
