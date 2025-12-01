import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "consumer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "order" });

async function start() {

  try {
    await consumer.connect();
    console.log("Consumer conectado no Kafka");
  } catch (error) {
    console.log("Erro ao conectar ao kafka! \n");
    console.log(error);
  }

  await consumer.subscribe({ topic: "newOrder", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`\n Message received:`);
      console.log({
        topic,
        partition,
        value: message.value.toString(),
      });
    },
  });
}

start().catch(console.error);
