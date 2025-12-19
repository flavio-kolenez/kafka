import express from 'express';
import { 
  listAllProducts, 
  getProduct, 
  checkStock, 
  checkMultipleStock
} from '../../stock-service/stockManager.js';

const router = express.Router();

// Lista todos os produtos
router.get('/', (req, res) => {
  const products = listAllProducts();
  res.json({ 
    status: 'success', 
    total: products.length,
    products 
  });
});

// Consulta produto específico
router.get('/:sku', (req, res) => {
  const { sku } = req.params;
  const product = getProduct(sku);
  
  if (!product) {
    return res.status(404).json({ 
      status: 'error', 
      error: `Produto com SKU ${sku} não encontrado` 
    });
  }
  
  res.json({ status: 'success', product });
});

// Verifica estoque para um item
router.post('/check', (req, res) => {
  const { sku, qty } = req.body;
  
  if (!sku || !qty) {
    return res.status(400).json({ 
      status: 'error', 
      error: 'SKU e qty são obrigatórios' 
    });
  }

  const stockCheck = checkStock(sku, qty);
  res.json({ status: 'success', stockCheck });
});

// Verifica estoque para múltiplos itens
router.post('/check-multiple', (req, res) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ 
      status: 'error', 
      error: 'items deve ser um array com objetos { sku, qty }' 
    });
  }

  const stockCheck = checkMultipleStock(items);
  res.json({ status: 'success', stockCheck });
});



export default router;