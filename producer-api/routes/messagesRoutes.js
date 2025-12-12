import express from 'express';
import { producer } from '../kafka.js';

const router = express.Router();

router.post('/send', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ status: 'error', error: 'Message is required!' });
  }

  try {
    console.log('Sending message to Kafka:', message);
    
    await producer.send({ 
      topic: 'newOrder', 
      messages: [{ value: JSON.stringify({ message, timestamp: new Date().toISOString() }) }] 
    });

    return res.json({ status: 'success', message: message });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ status:'error', error: err.message || String(err) });
  }
});

export default router;
