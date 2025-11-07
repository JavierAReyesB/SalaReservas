# SalaQR - Sistema de Reservas con QR

Sistema completo de reservas de salas con frontend Next.js y backend Express separados.

## Estructura del Proyecto

```
salaQR/
├── frontend/          # Next.js 16 (puerto 3000)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── backend/           # Express + TypeScript (puerto 4000)
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── db/
│   │   └── utils/
│   └── package.json
│
├── docker-compose.yml # Orquestación de servicios
└── mongo-init.js      # Inicialización de MongoDB
```

## Tecnologías

### Frontend
- Next.js 16.0.1
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui

### Backend
- Node.js 20
- Express.js
- TypeScript
- MongoDB 7
- Zod (validación)

## Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Levantar todos los servicios
docker compose up -d

# Servicios disponibles:
# - Frontend: http://localhost:3000
# - Backend:  http://localhost:4000
# - MongoDB:  localhost:27017
```

### Opción 2: Desarrollo Local

```bash
# 1. Levantar MongoDB
docker compose up -d mongo

# 2. Terminal 1 - Backend
cd backend
npm install
npm run dev

# 3. Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

### Health Check
```bash
GET http://localhost:4000/health
```

### Salas
```bash
# Listar salas activas
GET http://localhost:4000/rooms
```

### Reservas
```bash
# Crear reserva
POST http://localhost:4000/reservations
Content-Type: application/json

{
  "roomId": "ID_SALA",
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "date": "2025-01-20",
  "startTime": "10:00",
  "endTime": "11:00"
}

# Listar reservas
GET http://localhost:4000/reservations?roomId=ID_SALA&from=2025-01-20T00:00:00Z

# Eliminar reserva
DELETE http://localhost:4000/reservations/:id
```

## Características

- Sistema de reservas con detección de conflictos
- Manejo de zonas horarias (UTC)
- Validación de datos con Zod
- Generación de códigos QR
- API REST documentada
- Docker ready

## Variables de Entorno

### Backend (`backend/.env`)
```env
MONGO_URL=mongodb://admin:password@localhost:27017/?authSource=admin
PORT=4000
NODE_ENV=development
TZ=Europe/Madrid
FRONTEND_URL=http://localhost:3000
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Reiniciar servicios
docker compose restart

# Detener todo
docker compose down

# Detener y eliminar volúmenes
docker compose down -v

# Rebuild de imágenes
docker compose up --build
```

## Desarrollo

### Backend
```bash
cd backend
npm run dev    # Servidor con hot-reload
npm run build  # Compilar TypeScript
npm start      # Servidor de producción
```

### Frontend
```bash
cd frontend
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción
npm start      # Servidor de producción
```

## Pruebas de API

```bash
# Health check
curl http://localhost:4000/health

# Listar salas
curl http://localhost:4000/rooms

# Crear reserva
curl -X POST http://localhost:4000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "ID_SALA",
    "fullName": "Test User",
    "email": "test@example.com",
    "date": "2025-01-20",
    "startTime": "10:00",
    "endTime": "11:00"
  }'
```

## Licencia

MIT
