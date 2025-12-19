import express from 'express';
import { producer } from '../kafka.js';
import { Logger } from '../../utils/logger.js';

const router = express.Router();

router.post('/order', async (req, res) => {
  const { order_id, user_email, items } = req.body;

  // Validações básicas
  if (!order_id || !user_email || !items) {
    return res.status(400).json({ 
      status: 'error', 
      error: 'order_id, user_email, and items are required.!' 
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      error: '`items` must be an array with at least 1 item!' 
    });
  }

  try {
    const orderData = {
      order_id,
      user_email,
      items,
      timestamp: new Date().toISOString(),
      status: 'CREATED'
    };

    Logger.kafka('SENDING', 'newOrder', `Sending order ${order_id}`, orderData);

    await producer.send({ 
      topic: 'newOrder', 
      messages: [{ value: JSON.stringify(orderData) }] 
    });

    Logger.success('PRODUCER-API', `Order ${order_id} sent to Kafka successfully`);

    return res.json({ 
      status: 'success', 
      order: orderData,
      message: `Order ${order_id} created successfully!`
    });
  } catch (err) {
    Logger.error('PRODUCER-API', 'Error sending message to Kafka', err);
    return res.status(500).json({ status:'error', error: err.message || String(err) });
  }
});

export default router;
