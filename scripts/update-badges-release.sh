#!/bin/bash

# Script para actualizar badges durante el release
# Ejecuta tests con coverage y extrae estadísticas

echo "🧪 Ejecutando tests con coverage..."

# Ejecutar tests
npm run test:coverage

# Extraer estadísticas
echo ""
echo "📊 Extrayendo estadísticas..."

TESTS=$(node -e "const stats = require('./scripts/extract-test-stats'); console.log(stats.countTotalTests() || 0)")
COVERAGE=$(node -e "const stats = require('./scripts/extract-test-stats'); console.log(stats.calculateTotalCoverage() || 0)")

echo "✅ Tests passing: $TESTS"
echo "📈 Coverage: $COVERAGE%"

# Actualizar badges
VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Error: No se proporcionó la versión"
  echo "Uso: ./update-badges-release.sh <version>"
  exit 1
fi

echo ""
echo "🎨 Actualizando badges..."
node scripts/update-badges.js "$VERSION" "$TESTS" "$COVERAGE"

echo "✅ Proceso completado"
