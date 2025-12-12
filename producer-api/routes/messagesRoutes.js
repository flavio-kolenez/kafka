import express from 'express';
import { producer } from '../kafka.js';

const router = express.Router();

router.post('/order', async (req, res) => {
  const { order_id, user_email, items } = req.body;

  // Validações básicas
  if (!order_id || !user_email || !items) {
    return res.status(400).json({ 
      status: 'error', 
      error: 'order_id, user_email e items são obrigatórios!' 
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      error: 'items deve ser um array com pelo menos 1 item!' 
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

    console.log('📦 Sending order to Kafka:', order_id);

    await producer.send({ 
      topic: 'newOrder', 
      messages: [{ value: JSON.stringify(orderData) }] 
    });

    return res.json({ 
      status: 'success', 
      order: orderData,
      message: `Pedido ${order_id} criado com sucesso!`
    });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ status:'error', error: err.message || String(err) });
  }
});

export default router;
