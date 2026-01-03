#!/usr/bin/env node

/**
 * Genera CHANGELOGs en inglés y español
 * Se ejecuta durante el proceso de semantic-release
 */

const fs = require('fs');
const path = require('path');

// Traducciones de secciones
const translations = {
  en: {
    title: '# 📝 Changelog',
    subtitle: 'All notable changes to this project will be documented in this file.',
    format: 'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),',
    semver: 'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
    sections: {
      '✨ Features': '✨ Features',
      '🐛 Bug Fixes': '🐛 Bug Fixes',
      '⚡ Performance': '⚡ Performance',
      '♻️ Refactors': '♻️ Refactors',
      '📝 Documentation': '📝 Documentation',
      '🔧 Chores': '🔧 Chores',
      '💄 Styles': '💄 Styles',
      '✅ Tests': '✅ Tests'
    }
  },
  es: {
    title: '# 📝 Registro de Cambios',
    subtitle: 'Todos los cambios notables de este proyecto serán documentados en este archivo.',
    format: 'El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),',
    semver: 'y este proyecto se adhiere a [Versionado Semántico](https://semver.org/lang/es/).',
    sections: {
      '✨ Features': '✨ Nuevas Características',
      '🐛 Bug Fixes': '🐛 Corrección de Errores',
      '⚡ Performance': '⚡ Mejoras de Rendimiento',
      '♻️ Refactors': '♻️ Refactorizaciones',
      '📝 Documentation': '📝 Documentación',
      '🔧 Chores': '🔧 Tareas de Mantenimiento',
      '💄 Styles': '💄 Estilos',
      '✅ Tests': '✅ Pruebas'
    }
  }
};

function translateChangelog(content, lang) {
  const t = translations[lang];
  let translated = content;

  // Normalizar line endings
  translated = translated.replace(/\r\n/g, '\n');

  // Reemplazar encabezado completo (más flexible)
  const lines = translated.split('\n');
  if (lines[0] === '# 📝 Changelog' && lines[2]?.startsWith('All notable changes')) {
    lines[0] = t.title;
    lines[2] = t.subtitle;
    lines[4] = t.format;
    lines[5] = t.semver;
    translated = lines.join('\n');
  }

  // Reemplazar secciones
  Object.keys(t.sections).forEach(key => {
    const regex = new RegExp(`### ${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    translated = translated.replace(regex, `### ${t.sections[key]}`);
  });

  return translated;
}

function main() {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const changelogEsPath = path.join(process.cwd(), 'CHANGELOG.es.md');

  // Verificar que existe el CHANGELOG en inglés
  if (!fs.existsSync(changelogPath)) {
    console.log('⚠️  CHANGELOG.md no existe aún, saltando generación de CHANGELOG.es.md');
    return;
  }

  // Leer CHANGELOG en inglés
  const changelogContent = fs.readFileSync(changelogPath, 'utf-8');

  // Generar CHANGELOG en español
  const changelogEs = translateChangelog(changelogContent, 'es');

  // Escribir CHANGELOG en español
  fs.writeFileSync(changelogEsPath, changelogEs, 'utf-8');

  console.log('✅ CHANGELOG.md (English) - Generated');
  console.log('✅ CHANGELOG.es.md (Español) - Generated');
}

main();
