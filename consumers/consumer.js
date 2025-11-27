import { Kafka } from "kafkajs";

async function run() {
  const kafka = new Kafka({
    clientId: "test-consumer",
    brokers: [process.env.KAFKA_BROKER || "kafka:9092"],
  });

  const consumer = kafka.consumer({ groupId: "test-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  console.log("Consumer conectado e ouvindo...");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`[CONSUMER] Mensagem recebida: ${message.value.toString()}`);
    },
  });
}

run().catch(console.error);
