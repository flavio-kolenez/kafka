import { Kafka } from "kafkajs";
import { checkMultipleStock, checkStock } from "../stock-service/stockManager.js";
import { errorHandler } from "./helpers/errorHandler.js";
import { Logger } from "../utils/logger.js";

const kafka = new Kafka({
  clientId: "consumer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: 1,
});

const orderValidatorConsumer = kafka.consumer({ groupId: "order-validator" });
const orderValidatorProducer = kafka.producer();

export async function startOrderValidator() {
  try {
    await orderValidatorConsumer.connect();
    await orderValidatorProducer.connect();
  } catch (error) {
    Logger.error("ORDER-VALIDATOR", "Failed to connect to Kafka", error);
    throw error;
  }

  await orderValidatorConsumer.subscribe({ topic: "newOrder", fromBeginning: false });

  await orderValidatorConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        Logger.separator("ORDER VALIDATION STARTED");
        
        const orderData = JSON.parse(message.value.toString());

        const validations = [];
        let stockValidation;

        // Validação de formato usando errorHandler
        // Verificar campos obrigatórios
        if (!orderData.order_id || !orderData.user_email || !orderData.items) {
          await errorHandler({
            error: "Missing required fields",
            errorMessage: "order_id, user_email, and items are required",
            originalMessage: orderData,
            order_id: orderData.order_id || 'unknown',
            errorType: "validation"
          });
          
          validations.push({ result: false, message: "Invalid order format - sent to orderError topic" });
          Logger.groupValidation("ORDER-VALIDATOR", validations);
          return;
        }
        
        validations.push({ result: true, message: "Required fields check passed" });

        if (typeof orderData.user_email !== 'string' || !orderData.user_email.includes('@')) {
          await errorHandler({
            error: "Invalid user_email format",
            errorMessage: "user_email must be a valid email string",
            originalMessage: orderData,
            order_id: orderData.order_id,
            errorType: "validation"
          });

          validations.push({ result: false, message: "Invalid user email format - sent to orderError topic" });
          Logger.groupValidation("ORDER-VALIDATOR", validations);
          return;
        }

        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
          await errorHandler({
            error: "Invalid items format",
            errorMessage: "items must be a non-empty array",
            originalMessage: orderData,
            order_id: orderData.order_id,
            errorType: "validation"
          });

          validations.push({ result: false, message: "Invalid items array - sent to orderError topic" });
          Logger.groupValidation("ORDER-VALIDATOR", validations);
          return;
        }

        validations.push({ result: true, message: "Items array is valid" });
        validations.push({ result: true, message: "Starting stock validation..." });
        
        if (orderData.items.length > 1) {
          stockValidation = checkMultipleStock(orderData.items);
        } else {
          const item = orderData.items[0];
          stockValidation = checkStock(item.sku, item.quantity);
          stockValidation = {
            allAvailable: stockValidation.available,
            details: [stockValidation]
          };
        }

        if (!stockValidation.allAvailable) {
          await errorHandler({
            error: "Stock validation failed",
            errorMessage: "Insufficient stock for one or more items",
            originalMessage: orderData,
            order_id: orderData.order_id,
            errorType: "stock",
            stockDetails: stockValidation.details
          });
          validations.push({ result: false, message: `Stock validation failed for order: ${orderData.order_id}`, data: stockValidation.details });
          Logger.groupValidation("ORDER-VALIDATOR", validations);
          return;
        }

        validations.push({ result: true, message: "Stock validation passed successfully!" });
        
        // Mostrar todas as validações agrupadas
        Logger.groupValidation("ORDER-VALIDATOR", validations);

        // Se passou por todas as validações
        // envia o order para o topico validated Order  
        await orderValidatorProducer.send({
          topic: "validOrder",
          messages: [{
            value: JSON.stringify({
              ...orderData,
              stockValidation: stockValidation
            })
          }]
        });


        // Log de sucesso padrão em todo pedido
        await orderValidatorProducer.send({
          topic: "orderLog",
          messages: [{
            value: JSON.stringify({
              order_id: orderData.order_id,
              consumer: "orderValidator",
              event: "order_validated_successfully",
              timestamp: new Date().toISOString(),
              user_email: orderData.user_email
            })
          }]
        });

      } catch (error) {
        Logger.error("ORDER-VALIDATOR", "Error processing message", error);

        await errorHandler({
          error: "Failed to process order message",
          errorMessage: error.message,
          originalMessage: message.value.toString(),
          errorSource: "orderValidator",
          errorType: "processing"
        });
      }
    },
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startOrderValidator().catch((error) => {
    Logger.error("ORDER-VALIDATOR", "Failed to start consumer", error);
  });
}