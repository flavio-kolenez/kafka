import { startOrderConsumer } from './orderConsumer.js';

async function startAllConsumers() {
  try {
    // Lista de consumers para iniciar
    const consumers = [
      { name: 'Order Consumer', start: startOrderConsumer }
      // { name: 'User Consumer', start: startUserConsumer },
      // { name: 'Payment Consumer', start: startPaymentConsumer }
    ];

    // Inicia todos os consumers em paralelo
    const consumerPromises = consumers.map(async (consumer) => {
      try {
        await consumer.start();
        console.log(`✅ ${consumer.name} sucessfully connected!`);
      } catch (error) {
        console.error(`❌ Erro ao iniciar ${consumer.name}:`, error);
        throw error;
      }
    });

    await Promise.all(consumerPromises);
    console.log('All consumers started!');

  } catch (error) {
    console.error('Erro consumers:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStoping consumers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nnStoping consumers...');
  process.exit(0);
});

startAllConsumers();