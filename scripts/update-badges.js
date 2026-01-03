const fs = require('fs');
const path = require('path');

// Obtener argumentos desde la línea de comandos
const newVersion = process.argv[2];
const testsCount = process.argv[3];
const coveragePercent = process.argv[4];

if (!newVersion) {
  console.error('❌ Error: No se proporcionó una versión');
  console.error('Uso: node update-badges.js <version> [testsCount] [coveragePercent]');
  process.exit(1);
}

console.log(`📝 Actualizando badges a versión: ${newVersion}`);
if (testsCount) console.log(`📊 Tests: ${testsCount} passing`);
if (coveragePercent) console.log(`📈 Coverage: ${coveragePercent}%`);

// Archivos a actualizar
const files = [
  path.join(__dirname, '..', 'README.md'),
  path.join(__dirname, '..', 'README.es.md')
];

// Función para actualizar badges en un archivo
function updateBadgesInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Determinar el color del badge según el tipo de versión
  let versionColor = 'blue';
  if (newVersion.includes('alpha')) {
    versionColor = 'orange';
  } else if (newVersion.includes('beta')) {
    versionColor = 'yellow';
  } else if (newVersion.includes('rc')) {
    versionColor = 'lightblue';
  } else {
    versionColor = 'brightgreen';
  }

  // Actualizar badge de versión (formato: version-X.X.X-color)
  const versionBadgeRegex = /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^)]+\)/g;
  const newVersionBadge = `![Version](https://img.shields.io/badge/version-${newVersion}-${versionColor})`;
  
  content = content.replace(versionBadgeRegex, newVersionBadge);

  // Actualizar badge de tests si se proporciona
  if (testsCount) {
    const testsBadgeRegex = /!\[Tests\]\(https:\/\/img\.shields\.io\/badge\/tests-[^)]+\)/g;
    const newTestsBadge = `![Tests](https://img.shields.io/badge/tests-${testsCount}%20passing-success)`;
    content = content.replace(testsBadgeRegex, newTestsBadge);
  }

  // Actualizar badge de coverage si se proporciona
  if (coveragePercent) {
    const coverageBadgeRegex = /!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-[^)]+\)/g;
    
    // Determinar color según el porcentaje de cobertura
    let coverageColor = 'red';
    const coverage = parseFloat(coveragePercent);
    if (coverage >= 80) coverageColor = 'brightgreen';
    else if (coverage >= 60) coverageColor = 'green';
    else if (coverage >= 40) coverageColor = 'yellow';
    else if (coverage >= 20) coverageColor = 'orange';
    
    const newCoverageBadge = `![Coverage](https://img.shields.io/badge/coverage-${coveragePercent}%25-${coverageColor})`;
    content = content.replace(coverageBadgeRegex, newCoverageBadge);
  }

  // Verificar si hubo cambios
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Badge actualizado en: ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No se encontraron badges para actualizar en: ${path.basename(filePath)}`);
  }
}

// Actualizar todos los archivos
files.forEach(updateBadgesInFile);

console.log('🎉 Actualización de badges completada');
