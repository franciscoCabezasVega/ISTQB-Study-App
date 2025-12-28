#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║   📚 ISTQB Study App - Setup Script                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Instalando dependencias...${NC}"
npm install
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Dependencias instaladas${NC}\n"
else
  echo -e "${YELLOW}✗ Error al instalar dependencias${NC}\n"
  exit 1
fi

echo -e "${BLUE}2. Creando archivos .env...${NC}"

# Backend .env
if [ ! -f packages/api/.env ]; then
  cp packages/api/.env.example packages/api/.env
  echo -e "${GREEN}✓ packages/api/.env creado${NC}"
  echo -e "${YELLOW}  ⚠ Recuerda actualizar tus credenciales de Supabase${NC}\n"
else
  echo -e "${YELLOW}  ℹ packages/api/.env ya existe${NC}\n"
fi

# Frontend .env.local
if [ ! -f packages/web/.env.local ]; then
  cat > packages/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF
  echo -e "${GREEN}✓ packages/web/.env.local creado${NC}\n"
else
  echo -e "${YELLOW}  ℹ packages/web/.env.local ya existe${NC}\n"
fi

echo -e "${BLUE}3. Compilando tipos compartidos...${NC}"
npm run build --workspace=packages/shared
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Tipos compilados${NC}\n"
fi

echo -e "${BLUE}4. Verificando tipos TypeScript...${NC}"
npm run type-check --workspace=packages/api --workspace=packages/web
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Type checking completado${NC}\n"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║          🎉 Setup completado exitosamente!             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "1. ${YELLOW}Configura Supabase:${NC}"
echo "   - Ve a https://supabase.com"
echo "   - Crea un nuevo proyecto"
echo "   - Obtén tu URL y API keys"
echo "   - Actualiza packages/api/.env"
echo ""
echo "2. ${YELLOW}Crea las tablas en Supabase:${NC}"
echo "   - Abre docs/SUPABASE_SETUP.md"
echo "   - Copia los scripts SQL"
echo "   - Ejecuta en Supabase SQL Editor"
echo ""
echo "3. ${YELLOW}Inicia en desarrollo:${NC}"
echo "   Terminal 1: npm run dev --workspace=packages/api"
echo "   Terminal 2: npm run dev --workspace=packages/web"
echo ""
echo "4. ${YELLOW}Abre en tu navegador:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/health"
echo ""
echo -e "${GREEN}¡Buena suerte! 🚀${NC}"
