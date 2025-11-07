// mongo-init.js - Inicialización de MongoDB
db = db.getSiblingDB('reservas');

// Create rooms collection with validator
db.createCollection('rooms', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'isActive'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Room name - required and must be a string'
        },
        location: {
          bsonType: ['string', 'null'],
          description: 'Room location - optional'
        },
        capacity: {
          bsonType: ['int', 'null'],
          minimum: 1,
          description: 'Room capacity - optional positive integer'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Whether room is active - required'
        }
      }
    }
  }
});

// Create reservations collection with validator
db.createCollection('reservations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['roomId', 'fullName', 'email', 'start', 'end', 'createdAt'],
      properties: {
        roomId: {
          bsonType: 'objectId',
          description: 'Room ID reference - required'
        },
        fullName: {
          bsonType: 'string',
          maxLength: 100,
          description: 'Full name of person making reservation'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email address'
        },
        start: {
          bsonType: 'date',
          description: 'Reservation start time in UTC'
        },
        end: {
          bsonType: 'date',
          description: 'Reservation end time in UTC'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        }
      }
    }
  }
});

// Create indexes
db.rooms.createIndex({ name: 1 }, { unique: true });
db.reservations.createIndex({ roomId: 1, start: 1 });
db.reservations.createIndex({ roomId: 1, end: 1 });
db.reservations.createIndex({ start: 1, end: 1 });

// Insert sample rooms
db.rooms.insertMany([
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

print('✅ Database initialized successfully!');
