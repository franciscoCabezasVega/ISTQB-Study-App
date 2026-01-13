#!/usr/bin/env bash
# Script de ejecución para Windows (PowerShell) y Linux/Mac (Bash)

# Detectar el sistema operativo
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🔍 Ejecutando verificador de preguntas duplicadas en Windows..."
    cmd //c "npm run check-duplicates"
else
    echo "🔍 Ejecutando verificador de preguntas duplicadas..."
    npm run check-duplicates
fi
