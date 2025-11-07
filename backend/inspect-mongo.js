const { MongoClient } = require('mongodb');

async function inspect() {
  const client = new MongoClient('mongodb://osomoza:PJALEUfGAC3@154.58.194.94/?authSource=admin');

  try {
    await client.connect();
    const db = client.db('reservaSalas');

    console.log('\n=== RESERVATIONS IN DATABASE ===');
    const reservations = await db.collection('reservations')
      .find({})
      .sort({ start: 1 })
      .limit(10)
      .toArray();

    reservations.forEach((r, i) => {
      console.log(`\n${i + 1}. ID: ${r._id}`);
      console.log(`   Name: ${r.fullName}`);
      console.log(`   Email: ${r.email}`);
      console.log(`   Start: ${r.start}`);
      console.log(`   End: ${r.end}`);
    });

    console.log(`\n\nTotal reservations: ${reservations.length}`);

  } finally {
    await client.close();
  }
}

inspect().catch(console.error);
