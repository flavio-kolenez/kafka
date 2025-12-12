import express from 'express';
import { checkKafka } from '../kafka.js';

const router = express.Router();

router.get('/', (req, res) => res.send('Producer API on!'));

router.get('/topics', async (req, res) => {
  const state = await checkKafka();
  
  if (state.status == 'success') return res.json( state );

  return res.status(500).json( state );
});

router.get('/routes', (req, res) => {
  const routes = [
    { path: '/', methods: ['GET'], description: 'Endpoint base, retorna uma mensagem de status da API' },
    { path: '/status/topics', methods: ['GET'], description: 'Verifica a conectividade com o broker Kafka e lista tópicos' },
    { path: '/status/routes', methods: ['GET'], description: 'Lista as rotas disponíveis nesta API' },
    { path: '/status/send', methods: ['POST'], description: 'Envia um pedido para o tópico  `newOrder`'},
  ];

  res.json({ status: 'success', routes });
});

export default router;