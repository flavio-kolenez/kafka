import { Kafka } from "kafkajs";
import { Logger } from "./helpers/logger.js";

const kafka = new Kafka({
  clientId: "stock-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: 1,
});

const stockConsumer = kafka.consumer({ groupId: "stock-group" });

export async function startStockConsumer() {
  try {
    await stockConsumer.connect();
  } catch (error) {
    Logger.error("STOCK-CONSUMER", "Failed to connect to Kafka", error);
    throw error;
  }

  await stockConsumer.subscribe({ topic: "validOrder", fromBeginning: false });

  await stockConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const orderData = JSON.parse(message.value.toString());
        
        Logger.kafka("RECEIVED", topic, `Processing order ${orderData.order_id}`, orderData);

      } catch (error) {
        Logger.error("STOCK-CONSUMER", "Error processing message", error);

        await errorHandler({
          error: "Failed to process order message",
          errorMessage: error.message,
          originalMessage: message.value.toString(),
          errorSource: "Stock consumer",
          errorType: "stock error"
        });
      }
    },
  });
}
