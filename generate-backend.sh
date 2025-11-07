#!/bin/bash

# Script para generar todos los archivos del backend
# Ejecutar con: bash generate-backend.sh

echo "🚀 Generando estructura del backend..."

# Crear directorios necesarios
mkdir -p src/{db,schemas,services} app/api/{health,rooms,reservations/[id]} tests

echo "📝 Creando archivos de MongoDB..."

# src/db/mongo.ts
cat > src/db/mongo.ts << 'EOF'
import { MongoClient, Db, Collection } from 'mongodb';
import type { Room, Reservation } from '../types';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL is not defined in environment variables');
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db('reservas');

  console.log('✅ Connected to MongoDB');
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

export const collections = {
  get rooms(): Collection<Room> {
    return getDb().collection<Room>('rooms');
  },
  get reservations(): Collection<Reservation> {
    return getDb().collection<Reservation>('reservations');
  },
};

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
EOF

echo "📝 Creando schemas de validación..."

# src/schemas/reservations.ts
cat > src/schemas/reservations.ts << 'EOF'
import { z } from 'zod';

export const createReservationSchema = z.object({
  roomId: z.string().min(1, 'roomId is required'),
  fullName: z.string().min(1, 'fullName is required').max(100),
  email: z.string().email('Invalid email format'),
  // Option A: local date + time
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD').optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'startTime must be HH:mm').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'endTime must be HH:mm').optional(),
  // Option B: ISO timestamps
  startISO: z.string().datetime().optional(),
  endISO: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Must provide either (date + times) or (ISO timestamps)
    const hasLocal = data.date && data.startTime && data.endTime;
    const hasISO = data.startISO && data.endISO;
    return hasLocal || hasISO;
  },
  {
    message: 'Must provide either (date, startTime, endTime) or (startISO, endISO)',
  }
);

export const reservationQuerySchema = z.object({
  roomId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
EOF

echo "📝 Creando servicios..."

# src/services/reservations.ts
cat > src/services/reservations.ts << 'EOF'
import { ObjectId } from 'mongodb';
import { collections } from '../db/mongo';
import type { Reservation, CreateReservationPayload, ReservationQuery } from '../types';
import { parseLocalDateTimeToUTC, parseISOToUTC, validateTimeRange } from '../utils/time';

export class ReservationService {
  /**
   * Check if a time slot has conflicts with existing reservations
   */
  static async hasConflict(roomId: ObjectId, start: Date, end: Date, excludeId?: ObjectId): Promise<boolean> {
    const query: any = {
      roomId,
      $or: [
        // Existing reservation starts before new ends AND ends after new starts
        {
          start: { $lt: end },
          end: { $gt: start },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const conflict = await collections.reservations.findOne(query);
    return conflict !== null;
  }

  /**
   * Create a new reservation
   */
  static async create(payload: CreateReservationPayload): Promise<Reservation> {
    // Parse dates
    let start: Date;
    let end: Date;

    if (payload.startISO && payload.endISO) {
      start = parseISOToUTC(payload.startISO);
      end = parseISOToUTC(payload.endISO);
    } else if (payload.date && payload.startTime && payload.endTime) {
      start = parseLocalDateTimeToUTC(payload.date, payload.startTime);
      end = parseLocalDateTimeToUTC(payload.date, payload.endTime);
    } else {
      throw new Error('Invalid date/time format');
    }

    // Validate time range
    if (!validateTimeRange(start, end)) {
      throw new Error('Start time must be before end time');
    }

    const roomId = new ObjectId(payload.roomId);

    // Check if room exists and is active
    const room = await collections.rooms.findOne({ _id: roomId, isActive: true });
    if (!room) {
      throw new Error('Room not found or is inactive');
    }

    // Check for conflicts
    const hasConflict = await this.hasConflict(roomId, start, end);
    if (hasConflict) {
      throw new Error('Time slot conflicts with existing reservation');
    }

    // Create reservation
    const reservation: Omit<Reservation, '_id'> = {
      roomId,
      fullName: payload.fullName,
      email: payload.email,
      start,
      end,
      createdAt: new Date(),
    };

    const result = await collections.reservations.insertOne(reservation as any);

    return {
      ...reservation,
      _id: result.insertedId,
    };
  }

  /**
   * List reservations with optional filters
   */
  static async list(query: ReservationQuery): Promise<Reservation[]> {
    const filter: any = {};

    if (query.roomId) {
      filter.roomId = new ObjectId(query.roomId);
    }

    if (query.from || query.to) {
      filter.start = {};
      if (query.from) {
        filter.start.$gte = parseISOToUTC(query.from);
      }
      if (query.to) {
        filter.start.$lte = parseISOToUTC(query.to);
      }
    }

    return await collections.reservations
      .find(filter)
      .sort({ start: 1 })
      .toArray();
  }

  /**
   * Delete a reservation by ID
   */
  static async delete(id: string): Promise<boolean> {
    const result = await collections.reservations.deleteOne({
      _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
  }
}
EOF

echo "📝 Creando API routes..."

# app/api/health/route.ts
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true });
}
EOF

# app/api/rooms/route.ts
cat > app/api/rooms/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { connectToDatabase, collections } from '@/src/db/mongo';

export async function GET() {
  try {
    await connectToDatabase();

    const rooms = await collections.rooms
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
EOF

# app/api/reservations/route.ts
cat > app/api/reservations/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/db/mongo';
import { ReservationService } from '@/src/services/reservations';
import { createReservationSchema, reservationQuerySchema } from '@/src/schemas/reservations';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    // Validate payload
    const validation = createReservationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = await ReservationService.create(validation.data);

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reservation:', error);

    if (error.message.includes('conflict')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const query = {
      roomId: searchParams.get('roomId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    // Validate query
    const validation = reservationQuerySchema.safeParse(query);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.format() },
        { status: 400 }
      );
    }

    const reservations = await ReservationService.list(validation.data);

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
EOF

# app/api/reservations/[id]/route.ts
cat > app/api/reservations/[id]/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/src/db/mongo';
import { ReservationService } from '@/src/services/reservations';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const deleted = await ReservationService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    );
  }
}
EOF

echo "✅ Archivos del backend creados exitosamente!"
echo "📦 Ahora instala las dependencias: npm install mongodb dotenv"
echo "🐳 Y crea el docker-compose.yml para MongoDB"
EOF

chmod +x generate-backend.sh

echo "✅ Script de generación creado en: generate-backend.sh"
echo "Ejecuta: bash generate-backend.sh"
