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
