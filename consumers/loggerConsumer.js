import { Kafka } from "kafkajs";
import { Logger } from "../utils/logger.js";

const kafka = new Kafka({
  clientId: "logger-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: 1, 
});

const loggerConsumer = kafka.consumer({ groupId: "logger" });

export async function startLoggerConsumer() {
  try {
    await loggerConsumer.connect();
  } catch (error) {
    Logger.error("LOGGER-CONSUMER", "Failed to connect to Kafka", error);
    throw error;
  }

  await loggerConsumer.subscribe({ topic: "orderLog", fromBeginning: true });

  await loggerConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const logData = JSON.parse(message.value.toString());
        
        // implementar enviando event no objeto que o producer emite 
        switch (logData.event) {
          case 'order_validated_successfully':
            // Logger.info("LOGGER", `Order ${logData.order_id} validated successfully by ${logData.consumer}`);
            break;
            
          case 'order_received_and_forwarded':
            // Logger.info("LOGGER", `Order ${logData.order_id} received and forwarded to validation`);
            break;
            
          case 'stock_reserved':
            // Logger.info("LOGGER", `Stock reserved for order ${logData.order_id}`);
            break;
            
          case 'email_sent':
            // Logger.info("LOGGER", `Email sent for order ${logData.order_id}`);
            break;
            
          default:
            // Logger.debug("LOGGER", `General log for order ${logData.order_id}`, logData);
        }
        
        // Salvar logs em algum lugar, exemplos:
        // saveLogToFile(logData); 
        // ou
        // saveLogToDatabase(logData);
        
      } catch (error) {
        Logger.error("LOGGER", "Error processing log message", {
          error: error.message,
          rawMessage: message.value.toString()
        });
      }
    }
  });
}


