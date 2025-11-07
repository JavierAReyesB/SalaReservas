#!/bin/bash

echo "🚀 Iniciando proyecto SalaQR en modo desarrollo"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar que estamos en la raíz del proyecto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto salaQR"
    exit 1
fi

# Cargar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Usar Node 20
nvm use 20 > /dev/null 2>&1

# Verificar dependencias
echo "📦 Verificando dependencias..."

if [ ! -d "backend/node_modules" ]; then
    echo "${YELLOW}⚠️  Instalando dependencias del backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "${YELLOW}⚠️  Instalando dependencias del frontend...${NC}"
    cd frontend && npm install && cd ..
fi

echo "${GREEN}✓${NC} Dependencias OK"
echo ""

# Iniciar backend
echo "🔧 Iniciando backend en http://localhost:4000..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar un poco
sleep 2

# Iniciar frontend
echo "⚡ Iniciando frontend en http://localhost:3000..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "${GREEN}✅ Servidores iniciados!${NC}"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "⏹️  Presiona Ctrl+C para detener ambos servidores"
echo ""

# Mostrar logs en tiempo real
tail -f backend.log frontend.log
