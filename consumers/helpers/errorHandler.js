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
    await producer.send({
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
    console.log(`🚨 Error sent to orderError topic: ${error}`);
  } catch (sendError) {
    console.error('💥 Failed to send error to Kafka:', sendError);
  }
}