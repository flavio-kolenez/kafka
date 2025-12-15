import app from './app.js';
import { connectProducer } from './kafka.js';
import { Logger } from './helpers/logger.js';

async function start() {
  try {
    await connectProducer();
    
    app.listen(process.env.PORT || 3000, () => {
      Logger.success('PRODUCER-API', `Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    Logger.error('PRODUCER-API', 'Failed to start server', error);
    process.exit(1);
  }
}

start();
