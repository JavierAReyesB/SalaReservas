import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.routes';
import { roomsRouter } from './routes/rooms.routes';
import { reservationsRouter } from './routes/reservations.routes';

export function createApp() {
  const app = express();

  app.use(helmet());

  // ✅ Allowlist de orígenes
  const allowlist = new Set<string>([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,                                // p.ej. túnel o dominio
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])       // soporte multi-origen por env
  ].filter(Boolean) as string[]);

  // 🔍 DIAGNOSTIC: Log CORS configuration
  console.log('🔒 [CORS] Allowlist configured:', Array.from(allowlist));
  console.log('🔍 [CORS] FRONTEND_URL from env:', process.env.FRONTEND_URL);
  console.log('🔍 [CORS] ALLOWED_ORIGINS from env:', process.env.ALLOWED_ORIGINS);

  const corsOptions: cors.CorsOptions = {
    origin(origin, cb) {
      // Permite herramientas sin 'origin' (curl/Postman)
      if (!origin) return cb(null, true);
      // Acepta si el origin está en allowlist
      return cb(null, allowlist.has(origin));
    },
    credentials: true, // solo si usas cookies/autenticación entre dominios
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  };

  app.use(cors(corsOptions));
  // ✅ Preflight explícito (algunos proxies lo necesitan)
  app.options('*', cors(corsOptions));

  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/rooms', roomsRouter);
  app.use('/reservations', reservationsRouter);

  return app;
}
