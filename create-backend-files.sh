#!/bin/bash

echo "🔧 Creando todos los archivos del backend..."
cd backend || exit 1

# 1. tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
EOF
echo "✅ tsconfig.json"

# 2. .env.example
cat > .env.example << 'EOF'
MONGO_URL=mongodb://admin:password@localhost:27017/?authSource=admin
PORT=4000
NODE_ENV=development
TZ=Europe/Madrid
FRONTEND_URL=http://localhost:3000
EOF
echo "✅ .env.example"

# 3. Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
EOF
echo "✅ Dockerfile"

# 4. src/app.ts
cat > src/app.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.routes';
import { roomsRouter } from './routes/rooms.routes';
import { reservationsRouter } from './routes/reservations.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  }));
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/rooms', roomsRouter);
  app.use('/reservations', reservationsRouter);

  return app;
}
EOF
echo "✅ src/app.ts"

# 5. src/server.ts
cat > src/server.ts << 'EOF'
import { createApp } from './app';
import { connectToDatabase } from './db/mongo';
import { env } from './utils/env';

async function main() {
  try {
    await connectToDatabase();

    const app = createApp();
    const port = parseInt(env.PORT);

    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
EOF
echo "✅ src/server.ts"

# 6. src/routes/health.routes.ts
cat > src/routes/health.routes.ts << 'EOF'
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({ ok: true });
});
EOF
echo "✅ src/routes/health.routes.ts"

# 7. src/routes/rooms.routes.ts
cat > src/routes/rooms.routes.ts << 'EOF'
import { Router } from 'express';
import { RoomsController } from '../controllers/rooms.controller';

export const roomsRouter = Router();

roomsRouter.get('/', RoomsController.list);
EOF
echo "✅ src/routes/rooms.routes.ts"

# 8. src/routes/reservations.routes.ts
cat > src/routes/reservations.routes.ts << 'EOF'
import { Router } from 'express';
import { ReservationsController } from '../controllers/reservations.controller';

export const reservationsRouter = Router();

reservationsRouter.post('/', ReservationsController.create);
reservationsRouter.get('/', ReservationsController.list);
reservationsRouter.delete('/:id', ReservationsController.delete);
EOF
echo "✅ src/routes/reservations.routes.ts"

echo ""
echo "✅ Todos los archivos del backend creados!"
echo ""
echo "📝 Próximos pasos:"
echo "1. cd backend && npm install"
echo "2. cp .env.example .env"
echo "3. cd .. && docker compose up -d"
