import { MongoClient, Db, Collection } from 'mongodb';
import type { Room, Reservation } from '../types';
import { env } from '../utils/env';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  try {
    console.log('🔌 Intentando conectar a MongoDB...');
    client = new MongoClient(env.MONGO_URL);
    await client.connect();
    db = client.db('reservas');

    console.log('✅ Conectado a MongoDB correctamente');

    // Initialize database with sample data if empty
    await initializeDatabase();

    return db;
  } catch (error: any) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.log('');
    console.log('💡 SOLUCIONES para trabajar en local:');
    console.log('');
    console.log('📌 Opción 1: MongoDB Local (Recomendado)');
    console.log('   1. Descarga: https://www.mongodb.com/try/download/community');
    console.log('   2. Instala MongoDB Community Edition');
    console.log('   3. Actualiza backend/.env:');
    console.log('      MONGO_URL=mongodb://localhost:27017');
    console.log('');
    console.log('📌 Opción 2: MongoDB Atlas (Cloud Gratis)');
    console.log('   1. Crea cuenta en: https://www.mongodb.com/cloud/atlas');
    console.log('   2. Crea cluster gratuito (M0)');
    console.log('   3. Copia connection string');
    console.log('   4. Actualiza backend/.env con el connection string');
    console.log('');
    console.log('📌 Opción 3: Docker Desktop');
    console.log('   1. Instala Docker Desktop para Windows');
    console.log('   2. Activa WSL 2 integration');
    console.log('   3. Ejecuta: docker compose up -d mongo');
    console.log('');
    console.log('📖 Guía completa en: SETUP_LOCAL.md');
    console.log('');
    throw error;
  }
}

async function initializeDatabase() {
  if (!db) return;

  try {
    // Check if rooms collection exists and has data
    const roomsCount = await db.collection('rooms').countDocuments();

    if (roomsCount === 0) {
      console.log('🔧 Inicializando base de datos con datos de ejemplo...');

      // Create rooms collection with the 5 official rooms
      await db.collection('rooms').insertMany([
        {
          id: 'andromeda',
          name: 'Sala Andrómeda',
          capacity: 40,
          description: 'Auditorio con capacidad para 40 personas, ideal para charlas y presentaciones.',
          image: '/images/backgrounds/AuditorioFoto.webp',
          isActive: true
        },
        {
          id: 'boreal',
          name: 'Sala Boreal',
          capacity: 3,
          description: 'Sala pequeña para reuniones personales (máximo 3 personas).',
          image: '/images/backgrounds/SalaSmall.webp',
          isActive: true
        },
        {
          id: 'cenit',
          name: 'Sala Cénit',
          capacity: 10,
          description: 'Sala equipada para formaciones y presentaciones (hasta 10 personas).',
          image: '/images/backgrounds/SalaFormaciones.webp',
          isActive: true
        },
        {
          id: 'delta',
          name: 'Sala Delta',
          capacity: 6,
          description: 'Espacio optimizado para creación de contenido (foto y video). Aforo flexible; recomendado hasta 6 personas.',
          image: '/images/backgrounds/SalaMedia.webp',
          isActive: true
        },
        {
          id: 'eclipse',
          name: 'Sala Eclipse',
          capacity: 10,
          description: 'Máximo 10 personas, con pizarra interactiva; perfecta para demos y reuniones.',
          image: '/images/backgrounds/SalaIntercativa.webp',
          isActive: true
        }
      ]);

      // Create indexes
      await db.collection('rooms').createIndex({ id: 1 }, { unique: true });
      await db.collection('rooms').createIndex({ name: 1 }, { unique: true });
      await db.collection('reservations').createIndex({ roomId: 1, start: 1 });

      console.log('✅ Base de datos inicializada con 5 salas (Andrómeda, Boreal, Cénit, Delta, Eclipse)');
    } else {
      console.log(`✅ Base de datos ya contiene ${roomsCount} salas`);
    }
  } catch (error) {
    console.error('⚠️  Error al inicializar base de datos:', error);
  }
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
