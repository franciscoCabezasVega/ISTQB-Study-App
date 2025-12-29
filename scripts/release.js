#!/usr/bin/env node

/**
 * Script de Release
 * 
 * Este script ayuda a crear nuevas versiones del proyecto:
 * - Actualiza la versión en todos los package.json
 * - Solicita notas de la versión
 * - Actualiza el CHANGELOG.md
 * - Crea un commit y tag de git
 * - Push automático (opcional)
 * 
 * Uso:
 *   npm run release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getCurrentVersion() {
  const packageJson = require('../package.json');
  return packageJson.version;
}

function updateVersion(newVersion) {
  // Actualizar package.json raíz
  const rootPackagePath = path.join(__dirname, '../package.json');
  const rootPackage = require(rootPackagePath);
  rootPackage.version = newVersion;
  fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');

  // Actualizar workspaces
  const workspaces = ['packages/web', 'packages/api', 'packages/shared'];
  workspaces.forEach(workspace => {
    const packagePath = path.join(__dirname, '..', workspace, 'package.json');
    if (fs.existsSync(packagePath)) {
      const pkg = require(packagePath);
      pkg.version = newVersion;
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    }
  });

  console.log(`✅ Versión actualizada a ${newVersion}`);
}

function updateChangelog(version, notes, type) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const changelog = fs.readFileSync(changelogPath, 'utf8');

  const date = new Date().toISOString().split('T')[0];
  const emoji = {
    added: '✨',
    changed: '🔧',
    fixed: '🐛',
    security: '🔒',
    performance: '⚡',
    removed: '🔥'
  };

  const newEntry = `\n## [${version}] - ${date}\n\n### ${emoji[type] || '📝'} ${type.charAt(0).toUpperCase() + type.slice(1)}\n${notes}\n\n---\n`;

  // Insertar después de [Unreleased]
  const updated = changelog.replace(
    /(## \[Unreleased\][\s\S]*?---\n)/,
    `$1${newEntry}`
  );

  fs.writeFileSync(changelogPath, updated);
  console.log('✅ CHANGELOG.md actualizado');
}

function gitCommitAndTag(version, notes) {
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore: release v${version}\n\n${notes}"`, { stdio: 'inherit' });
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    console.log(`✅ Commit y tag v${version} creados`);
    return true;
  } catch (error) {
    console.error('❌ Error al crear commit/tag:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Script de Release - ISTQB Study App\n');

  const currentVersion = getCurrentVersion();
  console.log(`Versión actual: ${currentVersion}\n`);

  // Tipo de versión
  console.log('Tipo de versión:');
  console.log('1. patch (1.0.0 -> 1.0.1) - Bug fixes');
  console.log('2. minor (1.0.0 -> 1.1.0) - New features');
  console.log('3. major (1.0.0 -> 2.0.0) - Breaking changes');
  console.log('4. custom - Especificar versión manualmente\n');

  const versionType = await question('Selecciona el tipo (1-4): ');

  let newVersion;
  const versionParts = currentVersion.replace('-alpha', '').replace('-beta', '').split('.');
  let major = parseInt(versionParts[0]);
  let minor = parseInt(versionParts[1]);
  let patch = parseInt(versionParts[2]);

  switch (versionType.trim()) {
    case '1':
      patch++;
      newVersion = `${major}.${minor}.${patch}`;
      break;
    case '2':
      minor++;
      patch = 0;
      newVersion = `${major}.${minor}.${patch}`;
      break;
    case '3':
      major++;
      minor = 0;
      patch = 0;
      newVersion = `${major}.${minor}.${patch}`;
      break;
    case '4':
      newVersion = await question('Introduce la nueva versión (ej: 1.0.0-beta): ');
      newVersion = newVersion.trim();
      break;
    default:
      console.log('❌ Opción no válida');
      rl.close();
      return;
  }

  console.log(`\nNueva versión será: ${newVersion}\n`);

  // Tipo de cambio
  console.log('Tipo de cambio:');
  console.log('1. added - Nuevas funcionalidades');
  console.log('2. changed - Cambios en funcionalidades existentes');
  console.log('3. fixed - Corrección de bugs');
  console.log('4. security - Cambios de seguridad');
  console.log('5. performance - Mejoras de rendimiento');
  console.log('6. removed - Funcionalidades removidas\n');

  const changeTypeInput = await question('Selecciona el tipo de cambio (1-6): ');
  const changeTypes = ['added', 'changed', 'fixed', 'security', 'performance', 'removed'];
  const changeType = changeTypes[parseInt(changeTypeInput.trim()) - 1] || 'changed';

  // Notas de la versión
  console.log('\nIntroduce las notas de la versión (termina con una línea vacía):');
  const notes = [];
  let line;
  while ((line = await question('> ')) !== '') {
    notes.push('- ' + line);
  }

  const releaseNotes = notes.join('\n');

  // Confirmar
  console.log('\n📋 Resumen del Release:');
  console.log('─────────────────────────────────');
  console.log(`Versión: ${currentVersion} -> ${newVersion}`);
  console.log(`Tipo: ${changeType}`);
  console.log(`Notas:\n${releaseNotes}`);
  console.log('─────────────────────────────────\n');

  const confirm = await question('¿Continuar con el release? (s/n): ');

  if (confirm.toLowerCase() !== 's') {
    console.log('❌ Release cancelado');
    rl.close();
    return;
  }

  // Ejecutar release
  console.log('\n🔨 Ejecutando release...\n');

  updateVersion(newVersion);
  updateChangelog(newVersion, releaseNotes, changeType);

  if (gitCommitAndTag(newVersion, releaseNotes)) {
    const push = await question('\n¿Hacer push a GitHub? (s/n): ');
    if (push.toLowerCase() === 's') {
      try {
        execSync('git push && git push --tags', { stdio: 'inherit' });
        console.log('✅ Push completado');
      } catch (error) {
        console.error('❌ Error al hacer push:', error.message);
      }
    }
  }

  console.log('\n✅ Release completado exitosamente!\n');
  console.log(`📦 Versión ${newVersion} lista`);
  console.log(`🏷️  Tag: v${newVersion}`);
  console.log('\nPróximos pasos:');
  console.log('1. Revisa el CHANGELOG.md');
  console.log('2. Verifica el tag en GitHub');
  console.log('3. Crea un GitHub Release desde el tag\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
