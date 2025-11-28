import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "consumer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "grupo-teste" });

async function start() {
  await consumer.connect();
  console.log("Consumer conectado no Kafka");

  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`\n📩 Mensagem recebida:`);
      console.log({
        topic,
        partition,
        value: message.value.toString(),
      });
    },
  });
}

start().catch(console.error);
