import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "consumer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "order" });

export async function startOrderConsumer() {
  try {
    await consumer.connect();
    console.log("Order Consumer connected to Kafka!");
  } catch (error) {
    console.log("Error connecting Order Consumer to kafka!");
    console.log(error);
    throw error;
  }

  await consumer.subscribe({ topic: "newOrder", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`\n📦 Order Message received:`);
      console.log({
        topic,
        partition,
        value: message.value.toString(),
        timestamp: new Date().toISOString()
      });
    },
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startOrderConsumer().catch(console.error);
}
