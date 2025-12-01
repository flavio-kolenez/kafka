import express from 'express';
import { connectProducer } from './kafka.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use("/", routes);

async function start() {

  await connectProducer();

  app.listen(process.env.PORT || 3000, () => {
    console.log('Producer API running at', process.env.PORT || 3000);
  });
}

start().catch(console.error);
