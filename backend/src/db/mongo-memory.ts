import { MongoClient, Db, Collection } from 'mongodb';
import type { Room, Reservation } from '../types';
import { env } from '../utils/env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(env.MONGO_URL);
    await client.connect();
    db = client.db('reservas');

    console.log('✅ Connected to MongoDB');

    // Initialize database with sample data if empty
    await initializeDatabase();

    return db;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('💡 Para trabajar en local, tienes 3 opciones:');
    console.log('');
    console.log('Opción 1: Instalar MongoDB localmente');
    console.log('  - Windows: https://www.mongodb.com/try/download/community');
    console.log('  - Luego actualiza MONGO_URL en .env a: mongodb://localhost:27017');
    console.log('');
    console.log('Opción 2: Usar Docker Desktop para Windows');
    console.log('  - Instala Docker Desktop');
    console.log('  - Activa WSL 2 integration en settings');
    console.log('  - Ejecuta: docker compose up -d mongo');
    console.log('');
    console.log('Opción 3: Usar MongoDB Atlas (cloud gratis)');
    console.log('  - Crea cuenta en https://www.mongodb.com/cloud/atlas');
    console.log('  - Crea cluster gratuito');
    console.log('  - Actualiza MONGO_URL en .env con connection string');
    console.log('');
    process.exit(1);
  }
}

async function initializeDatabase() {
  if (!db) return;

  try {
    // Check if rooms collection exists and has data
    const roomsCount = await db.collection('rooms').countDocuments();

    if (roomsCount === 0) {
      console.log('🔧 Inicializando base de datos con datos de ejemplo...');

      // Create rooms collection with sample data
      await db.collection('rooms').insertMany([
        {
          name: 'Atlántico',
          location: 'Planta Baja',
          capacity: 10,
          isActive: true
        },
        {
          name: 'Pacífico',
          location: 'Planta 1',
          capacity: 20,
          isActive: true
        },
        {
          name: 'Mediterráneo',
          location: 'Planta 2',
          capacity: 15,
          isActive: true
        }
      ]);

      // Create indexes
      await db.collection('rooms').createIndex({ name: 1 }, { unique: true });
      await db.collection('reservations').createIndex({ roomId: 1, start: 1 });

      console.log('✅ Base de datos inicializada correctamente');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized');
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
