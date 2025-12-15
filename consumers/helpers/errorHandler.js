import { Kafka } from "kafkajs";
import { Logger } from "./logger.js";

const kafka = new Kafka({
  clientId: "error-handler",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: 1,
});

const errorHandlerProducer = kafka.producer();

export async function errorHandler({
  error,
  errorMessage = '',
  originalMessage = null,
  order_id = 'unknown',
  errorSource = 'orderValidator',
  errorType = 'unknown',
  stockDetails = null
}) {
  try {
    await errorHandlerProducer.connect();
    
    await errorHandlerProducer.send({
      topic: "orderError",
      messages: [{
        value: JSON.stringify({
          error,
          errorMessage,
          originalMessage,
          order_id,
          errorSource,
          errorType,
          stockDetails,
        })
      }]
    });
    
    Logger.kafka("SENT", "orderError", `Error sent: ${error}`);
    
    await errorHandlerProducer.disconnect();
    
  } catch (sendError) {
    Logger.error("ERROR-HANDLER", "Failed to send error to Kafka", sendError);
  }
}