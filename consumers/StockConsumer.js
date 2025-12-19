import { Kafka } from "kafkajs";
import { Logger } from "../utils/logger.js";
import { updateStock } from "../stock-service/stockManager.js";

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
        
        Logger.info("STOCK-CONSUMER", `Processing order ${orderData.order_id || 'unknown'}`);

        if (orderData.items && orderData.items.length > 0) {
          orderData.items.forEach((orderItem) => {
            updateStock(orderItem);
            Logger.info("STOCK-CONSUMER", `Stock updated for SKU: ${orderItem.sku}, qty: ${orderItem.quantity}`);
          });
        } else {
          Logger.warn("STOCK-CONSUMER", "No items found in order");
        }

      } catch (error) {
        Logger.error("STOCK-CONSUMER", "Error processing message:", error.message);
      }
    },
  });
}
