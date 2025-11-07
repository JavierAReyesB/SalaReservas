#!/bin/bash

echo "🏗️  Reorganizando proyecto con frontend y backend separados..."
echo ""

# Paso 1: Crear estructura de carpetas
echo "📁 Creando estructura de carpetas..."
mkdir -p frontend
mkdir -p backend/src/{db,routes,controllers,services,schemas,middlewares,utils}
mkdir -p backend/tests

# Paso 2: Mover frontend a /frontend
echo "📦 Moviendo frontend Next.js a /frontend..."
mv app frontend/ 2>/dev/null
mv components frontend/ 2>/dev/null
mv lib frontend/ 2>/dev/null
mv public frontend/ 2>/dev/null
mv styles frontend/ 2>/dev/null
mv hooks frontend/ 2>/dev/null
cp next.config.mjs frontend/ 2>/dev/null
cp postcss.config.mjs frontend/ 2>/dev/null
cp components.json frontend/ 2>/dev/null
cp tsconfig.json frontend/ 2>/dev/null
cp tailwind.config.ts frontend/ 2>/dev/null
cp package.json frontend/ 2>/dev/null
cp package-lock.json frontend/ 2>/dev/null
cp pnpm-lock.yaml frontend/ 2>/dev/null

# Limpiar archivos temporales de frontend en raíz
rm -rf .next node_modules

echo "✅ Frontend movido a /frontend"
echo ""

# Paso 3: Mover archivos backend creados anteriormente
echo "🔧 Moviendo archivos backend a /backend..."
if [ -d "src" ]; then
    cp -r src/* backend/src/ 2>/dev/null
    rm -rf src
fi

if [ -d "app/api" ]; then
    echo "⚠️  Nota: Los archivos de app/api fueron API Routes de Next.js"
    echo "   Ahora usaremos Express en /backend"
fi

echo "✅ Estructura base creada"
echo ""

# Mostrar resultado
echo "📊 Nueva estructura del proyecto:"
echo ""
echo "salaQR/"
echo "├── frontend/          ← Next.js (puerto 3000)"
echo "│   ├── app/"
echo "│   ├── components/"
echo "│   ├── lib/"
echo "│   ├── public/"
echo "│   └── package.json"
echo "│"
echo "├── backend/           ← Express API (puerto 4000)"
echo "│   ├── src/"
echo "│   │   ├── server.ts"
echo "│   │   ├── app.ts"
echo "│   │   ├── routes/"
echo "│   │   ├── controllers/"
echo "│   │   ├── services/"
echo "│   │   └── ..."
echo "│   └── package.json"
echo "│"
echo "├── docker-compose.yml"
echo "├── mongo-init.js"
echo "└── README.md"
echo ""

echo "📝 Próximos pasos:"
echo "1. Ejecutar: node generate-backend-files.js"
echo "2. cd frontend && npm install"
echo "3. cd ../backend && npm install"
echo "4. docker compose up -d"
echo ""
echo "✅ ¡Reorganización completada!"
