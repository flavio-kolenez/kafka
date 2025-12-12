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
      reason: `Produto com SKU ${sku} não encontrado`
    };
  }

  const available = product.quantity >= requestedQty;
  
  return {
    available,
    currentStock: product.quantity,
    product: { ...product },
    reason: available ? null : `Estoque insuficiente. Disponível: ${product.quantity}, Solicitado: ${requestedQty}`
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

/**
 * Reserva estoque para múltiplos itens (atualiza quantities)
 * @param {Array} items - Array de objetos { sku, qty }
 * @returns {object} - { success: boolean, reservedItems: Array, errors: Array }
 */
export function reserveStock(items) {
  // Primeiro verifica se todos os itens estão disponíveis
  const stockCheck = checkMultipleStock(items);
  
  if (!stockCheck.allAvailable) {
    return {
      success: false,
      reservedItems: [],
      errors: stockCheck.details.filter(d => !d.available).map(d => d.reason)
    };
  }

  // Se todos estão disponíveis, reserva o estoque
  const reservedItems = [];
  const errors = [];

  items.forEach(item => {
    try {
      const product = stockDatabase.get(item.sku);
      const newQuantity = product.quantity - item.qty;
      
      // Atualiza no "banco"
      stockDatabase.set(item.sku, {
        ...product,
        quantity: newQuantity
      });

      reservedItems.push({
        sku: item.sku,
        name: product.name,
        reservedQty: item.qty,
        remainingStock: newQuantity
      });

      console.log(`📦 [STOCK] Reservado ${item.qty}x ${product.name} (SKU: ${item.sku}). Restante: ${newQuantity}`);
      
    } catch (error) {
      errors.push(`Erro ao reservar ${item.sku}: ${error.message}`);
    }
  });

  return {
    success: errors.length === 0,
    reservedItems,
    errors
  };
}

/**
 * Lista todos os produtos do estoque
 * @returns {Array} - Array com todos os produtos
 */
export function listAllProducts() {
  return Array.from(stockDatabase.values());
}

/**
 * Adiciona um novo produto ao estoque
 * @param {string} sku 
 * @param {string} name 
 * @param {number} quantity 
 * @returns {object}
 */
export function addProduct(sku, name, quantity) {
  if (stockDatabase.has(sku)) {
    return { success: false, error: `Produto com SKU ${sku} já existe` };
  }

  const product = { name, sku, quantity };
  stockDatabase.set(sku, product);
  
  return { success: true, product };
}



// Log inicial do estoque
console.log(`📦 [STOCK MANAGER] Banco de estoque iniciado com ${stockDatabase.size} produtos`);