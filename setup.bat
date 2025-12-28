@echo off
REM Windows Batch setup script for ISTQB Study App

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   📚 ISTQB Study App - Setup Script (Windows)          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [INFO] 1. Instalando dependencias...
call npm install
if errorlevel 1 goto error_install

echo [OK] ✓ Dependencias instaladas
echo.

echo [INFO] 2. Creando archivos .env...

if not exist "packages\api\.env" (
    copy packages\api\.env.example packages\api\.env
    echo [OK] ✓ packages\api\.env creado
    echo [WARNING] ⚠ Recuerda actualizar tus credenciales de Supabase
) else (
    echo [INFO] ℹ packages\api\.env ya existe
)
echo.

if not exist "packages\web\.env.local" (
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ) > packages\web\.env.local
    echo [OK] ✓ packages\web\.env.local creado
) else (
    echo [INFO] ℹ packages\web\.env.local ya existe
)
echo.

echo [INFO] 3. Compilando tipos compartidos...
call npm run build --workspace=packages/shared
if errorlevel 1 goto error_build

echo [OK] ✓ Tipos compilados
echo.

echo [INFO] 4. Verificando tipos TypeScript...
call npm run type-check --workspace=packages/api --workspace=packages/web
if errorlevel 1 goto warning_types

echo [OK] ✓ Type checking completado
echo.

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║          🎉 Setup completado exitosamente!             ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [INFO] 📋 Próximos pasos:
echo.
echo [STEP] 1. Configura Supabase:
echo        - Ve a https://supabase.com
echo        - Crea un nuevo proyecto
echo        - Obtén tu URL y API keys
echo        - Actualiza packages\api\.env
echo.
echo [STEP] 2. Crea las tablas en Supabase:
echo        - Abre docs/SUPABASE_SETUP.md
echo        - Copia los scripts SQL
echo        - Ejecuta en Supabase SQL Editor
echo.
echo [STEP] 3. Inicia en desarrollo:
echo        Terminal 1: npm run dev --workspace=packages/api
echo        Terminal 2: npm run dev --workspace=packages/web
echo.
echo [STEP] 4. Abre en tu navegador:
echo        Frontend: http://localhost:3000
echo        Backend:  http://localhost:3001/health
echo.
echo [OK] ¡Buena suerte! 🚀
goto end

:error_install
echo [ERROR] ✗ Error al instalar dependencias
exit /b 1

:error_build
echo [ERROR] ✗ Error al compilar tipos
exit /b 1

:warning_types
echo [WARNING] ⚠ Hay errores de tipos (revisar)
echo [INFO] Pero el setup continúa...
echo.

:end
