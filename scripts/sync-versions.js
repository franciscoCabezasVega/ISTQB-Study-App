#!/usr/bin/env node
/**
 * Script para sincronizar versiones entre todos los workspaces
 * Usa la versión del package.json raíz como fuente de verdad
 */

const fs = require('fs');
const path = require('path');

// Leer versión del package.json raíz
const rootPackageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);
const version = rootPackageJson.version;

console.log(`📦 Sincronizando versión: ${version}`);

// Workspaces a actualizar
const workspaces = ['packages/api', 'packages/shared', 'packages/web'];

let updated = 0;

workspaces.forEach((workspace) => {
  const packageJsonPath = path.join(__dirname, '..', workspace, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.version !== version) {
      const oldVersion = packageJson.version;
      packageJson.version = version;
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      console.log(`✅ ${workspace}: ${oldVersion} → ${version}`);
      updated++;
    } else {
      console.log(`⏭️  ${workspace}: ya está en ${version}`);
    }
  } else {
    console.log(`⚠️  ${workspace}: no encontrado`);
  }
});

console.log(`\n🎉 Sincronización completa: ${updated} workspace(s) actualizado(s)`);
