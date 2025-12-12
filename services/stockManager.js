// Banco de dados em memória para simular estoque
const stockDatabase = new Map([
  ['TOALHA001', { name: 'Toalha de Banho Felpuda Azul', sku: 'TOALHA001', quantity: 25 }],
  ['TOALHA002', { name: 'Toalha de Rosto Branca', sku: 'TOALHA002', quantity: 40 }],
  ['TOALHA003', { name: 'Toalha de Praia Listrada', sku: 'TOALHA003', quantity: 15 }],
  ['TOALHA004', { name: 'Toalha de Banho Algodão Rosa', sku: 'TOALHA004', quantity: 18 }],
  ['TOALHA005', { name: 'Toalha de Mesa Quadriculada', sku: 'TOALHA005', quantity: 8 }],
  ['TOALHA006', { name: 'Toalha de Cozinha Microfibra', sku: 'TOALHA006', quantity: 35 }],
  ['TOALHA007', { name: 'Toalha de Banho Extra Grande Cinza', sku: 'TOALHA007', quantity: 12 }],
  ['TOALHA008', { name: 'Toalha de Rosto Bordada Verde', sku: 'TOALHA008', quantity: 22 }],
  ['TOALHA009', { name: 'Toalha de Praia Temática Tropical', sku: 'TOALHA009', quantity: 9 }],
  ['TOALHA010', { name: 'Toalha de Banho Bambú Ecológica', sku: 'TOALHA010', quantity: 14 }]
]);

/**
 * Verifica se um produto existe no estoque
 * @param {string} sku - SKU do produto
 * @returns {boolean}
 */
export function productExists(sku) {
  return stockDatabase.has(sku);
}

/**
 * Obtém informações de um produto
 * @param {string} sku - SKU do produto
 * @returns {object|null} - Dados do produto ou null se não existir
 */
export function getProduct(sku) {
  return stockDatabase.get(sku) || null;
}

/**
 * Verifica disponibilidade de estoque para um item
 * @param {string} sku - SKU do produto
 * @param {number} requestedQty - Quantidade solicitada
 * @returns {object} - { available: boolean, currentStock: number, product: object }
 */
export function checkStock(sku, requestedQty) {
  const product = stockDatabase.get(sku);
  
  if (!product) {
    return {
      available: false,
      currentStock: 0,
      product: null,
      reason: `Product with SKU ${sku} not found`
    };
  }

  const available = product.quantity >= requestedQty;
  
  return {
    available,
    currentStock: product.quantity,
    product: { ...product },
    reason: available ? null : `Insufficient stock. Available: ${product.quantity}, Requested: ${requestedQty}`
  };
}

/**
 * Verifica estoque para múltiplos itens
 * @param {Array} items - Array de objetos { sku, qty }
 * @returns {object} - { allAvailable: boolean, details: Array, totalItems: number }
 */
export function checkMultipleStock(items) {
  const details = items.map(item => {
    const stockCheck = checkStock(item.sku, item.qty);
    return {
      sku: item.sku,
      requestedQty: item.qty,
      ...stockCheck
    };
  });

  const allAvailable = details.every(detail => detail.available);
  
  return {
    allAvailable,
    details,
    totalItems: items.length,
    unavailableItems: details.filter(d => !d.available).length
  };
}

/*
 * Lista todos os produtos do estoque
 * @returns {Array} - Array com todos os produtos
 */
export function listAllProducts() {
  return Array.from(stockDatabase.values());
}

// Log inicial do estoque
console.log(`📦 [STOCK MANAGER] Banco de estoque iniciado com ${stockDatabase.size} produtos`);