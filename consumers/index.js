import { startOrderValidator } from './OrderValidatorConsumer.js';
import { startLoggerConsumer } from './loggerConsumer.js';
import { startStockConsumer } from './stockConsumer.js';
import { Logger } from './helpers/logger.js';

async function startAllConsumers() {
  try {
    // Lista de consumers para iniciar
    const consumers = [
      { name: 'Order Consumer', start: startOrderValidator },
      { name: 'Logger Consumer', start: startLoggerConsumer },
      { name: 'Stock Consumer', start: startStockConsumer }
      // { name: 'Payment Consumer', start: startPaymentConsumer }
    ];

    Logger.separator('CONSUMERS STARTUP');

    // Inicia todos os consumers em paralelo
    const consumerPromises = consumers.map(async (consumer) => {
      try {
        await consumer.start();
        Logger.simpleSuccess(`${consumer.name} started`);
      } catch (error) {
        Logger.error('STARTUP', `Failed to start ${consumer.name}`, error);
        throw error;
      }
    });

    await Promise.all(consumerPromises);

    const spacing = ''.padStart(60, '─');
    console.log(`${Logger.colors.cyan}${spacing}${Logger.colors.reset}`);
    console.log(`${Logger.colors.green}✅ All consumers started successfully!${Logger.colors.reset}`);
    console.log(`${Logger.colors.cyan}${spacing}${Logger.colors.reset}`);

  } catch (error) {
    Logger.error('STARTUP', 'Failed to start consumers', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  Logger.warn('SHUTDOWN', 'Stopping consumers...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.warn('SHUTDOWN', 'Stopping consumers...');
  process.exit(0);
});

startAllConsumers();