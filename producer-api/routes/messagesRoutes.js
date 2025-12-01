import express from 'express';
import { producer } from '../kafka.js';

const router = express.Router();

router.post('/send', async (req, res) => {
  const { message } = req.body;

  try {
    await producer.send({ topic: 'newOrder', messages: [{ value: message }] });
    return res.json({ status: 'success', message: message });
  } catch (err) {
    console.error('Error sending message:', err);
    return res.status(500).json({ status:'error', error: err });
  }
});

export default router;
