import { Kafka } from "kafkajs";
import { checkMultipleStock, checkStock } from "../services/stockManager.js";
import { errorHandler } from "./helpers/errorHandler.js";

const kafka = new Kafka({
  clientId: "consumer-api",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "order" });
const producer = kafka.producer();

export async function startOrderValidator() {
  try {
    await consumer.connect();
    await producer.connect();
    console.log("✅ Order Validator connected to Kafka!");
  } catch (error) {
    console.log("❌ Error connecting Order Consumer to kafka: ");
    console.log(error);
    throw error;
  }

  await consumer.subscribe({ topic: "newOrder", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const orderData = JSON.parse(message.value.toString());
        console.log(`\n📦 Order Message received from topic: ${topic}`);
        console.log('📋 Order Data:', orderData);

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
          console.log('❌ Invalid order format - sent to orderError topic');
          return;
        }

        // Validar tipos dos campos
        if (typeof orderData.user_email !== 'string' || !orderData.user_email.includes('@')) {
          await errorHandler({
            error: "Invalid user_email format",
            errorMessage: "user_email must be a valid email string",
            originalMessage: orderData,
            order_id: orderData.order_id,
            errorType: "validation"
          });
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
          return;
        }

        let stockValidation;

        if (orderData.items.length > 1) {
          stockValidation = checkMultipleStock(orderData.items);
        } else {
          const item = orderData.items[0];
          stockValidation = checkStock(item.sku, item.qty);
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
          console.log(`❌ Stock validation failed for order: ${orderData.order_id}`);
          return;
        }


        console.log(`✅ Order ${orderData.order_id} passed format validation`);

        // Se passou por todas as validações
        // envia o order para o topico validated Order  
        await producer.send({
          topic: "validatedOrder",
          messages: [{
            value: JSON.stringify({
              ...orderData,
              stockValidation: stockValidation
            })
          }]
        });

        // Log de sucesso padrão em todo pedido
        await producer.send({
          topic: "orderLog",
          messages: [{
            value: JSON.stringify({
              order_id: orderData.order_id,

              consumer: "orderValidator"
            })
          }]
        });

        console.log(`Order ${orderData.order_id} validated and sent to validOrder topic`);

      } catch (error) {
        console.error('❌ Error processing message:', error);

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
  startOrderValidator().catch(console.error);
}