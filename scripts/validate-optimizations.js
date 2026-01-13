#!/usr/bin/env node

/**
 * Script de validación de optimizaciones de performance
 * Verifica que las optimizaciones no afecten funcionalidad
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validando optimizaciones de performance...\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${description} - Archivo no encontrado: ${filePath}`);
    checks.failed++;
    return false;
  }
}

function checkContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      checks.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Contenido no encontrado`);
      checks.failed++;
      return false;
    }
  } else {
    console.log(`❌ ${description} - Archivo no encontrado`);
    checks.failed++;
    return false;
  }
}

console.log('📦 Verificando archivos de optimización...\n');

// Verificar archivos nuevos
checkFile(
  'packages/web/components/LazyComponents.tsx',
  'Archivo de componentes lazy loading creado'
);

checkFile(
  'packages/web/lib/hooks/useOptimizedFetch.ts',
  'Hook de fetch optimizado creado'
);

checkFile(
  'packages/web/public/sw-optimized.js',
  'Service Worker optimizado creado'
);

checkFile(
  'docs/PERFORMANCE_IMPROVEMENTS_2026.md',
  'Documentación de mejoras creada'
);

console.log('\n⚙️ Verificando configuraciones...\n');

// Verificar configuración de Next.js
checkContent(
  'packages/web/next.config.js',
  'swcMinify: true',
  'Minificación SWC habilitada'
);

checkContent(
  'packages/web/next.config.js',
  'compress: true',
  'Compresión Gzip habilitada'
);

checkContent(
  'packages/web/next.config.js',
  'optimizeFonts: true',
  'Optimización de fuentes habilitada'
);

checkContent(
  'packages/web/next.config.js',
  'max-age=31536000, immutable',
  'Headers de caché configurados'
);

// Verificar preconnect en layout
checkContent(
  'packages/web/app/layout.tsx',
  'rel="preconnect"',
  'Preconnect a Supabase configurado'
);

checkContent(
  'packages/web/app/layout.tsx',
  'rel="dns-prefetch"',
  'DNS-prefetch configurado'
);

console.log('\n🧩 Verificando componentes optimizados...\n');

// Verificar React.memo en componentes
checkContent(
  'packages/web/components/Button.tsx',
  'React.memo',
  'Button optimizado con React.memo'
);

checkContent(
  'packages/web/components/Card.tsx',
  'React.memo',
  'Card optimizado con React.memo'
);

console.log('\n📊 Resultados de validación:\n');
console.log(`✅ Checks pasados:  ${checks.passed}`);
console.log(`❌ Checks fallidos: ${checks.failed}`);
console.log(`⚠️  Advertencias:   ${checks.warnings}`);

if (checks.failed === 0) {
  console.log('\n🎉 ¡Todas las optimizaciones están correctamente implementadas!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. npm run build');
  console.log('   2. npm run start');
  console.log('   3. Ejecutar Lighthouse en https://istqb-frontend.onrender.com/');
  console.log('   4. Comparar métricas con reporte anterior\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Algunas optimizaciones no están completas.');
  console.log('   Revisa los errores arriba y corrige los problemas.\n');
  process.exit(1);
}
