import app from './app.js';
import { connectProducer } from './kafka.js';

async function start() {
  try {
    await connectProducer();
    
    app.listen(process.env.PORT || 3000, () => {
      console.log('Producer API running at', process.env.PORT || 3000);
    });
  } catch (error) {
    console.error('Failed to start producer API:', error);
    process.exit(1);
  }
}

start();
