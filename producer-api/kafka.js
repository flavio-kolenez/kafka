import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'producer-api',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const admin = kafka.admin();

async function connectProducer() {
  await producer.connect();
}

async function checkKafka() {
  try {
    await admin.connect();
    const topics = await admin.listTopics();
    await admin.disconnect();
    return { status: "success", topics };
  } catch (err) {
    return { status: "error", error: err.message || String(err) };
  }
}

export { producer, connectProducer, checkKafka };
